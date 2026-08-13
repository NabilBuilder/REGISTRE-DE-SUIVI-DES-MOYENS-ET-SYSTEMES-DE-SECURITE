import { useState, useEffect, useCallback, useRef } from 'react';
import useLocalStorage from '@hooks/useLocalStorage';
import { getCurrentWeekRange, calculateDocDate, generateRefFromDate, getMonthWeeks, getAdjacentMonth, getMonthLabel } from '@utils/dateUtils';
import { CONFIG } from '@utils/config';

const SETTINGS_KEY = 'registre_settings';
const DRAFT_KEY = 'registre_draft';

function getDefaultSettings() {
  return {
    guards: [...(CONFIG.defaultGuards || [])],
    sites: [CONFIG.defaultSite || 'CSS Casablanca'],
    supervisors: [CONFIG.defaultSupervisor || 'NABIL']
  };
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return getDefaultSettings();
    const parsed = JSON.parse(raw);
    if (!parsed.guards || !Array.isArray(parsed.guards) || parsed.guards.length === 0) {
      parsed.guards = [...(CONFIG.defaultGuards || [])];
    }
    return { ...getDefaultSettings(), ...parsed };
  } catch { return getDefaultSettings(); }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function getDefaultData() {
  const week = getCurrentWeekRange();
  return {
    siteName: CONFIG.defaultSite,
    supervisorName: CONFIG.defaultSupervisor,
    docDate: calculateDocDate(week.end),
    docRef: generateRefFromDate(week.start),
    weekStart: week.start,
    weekEnd: week.end,
    rows: [
      { id: 1, status: 'RAS', comment: '' },
      { id: 2, status: 'RAS', comment: '' },
      { id: 3, status: 'RAS', comment: '' },
      { id: 4, status: 'RAS', comment: '' },
      { id: 5, status: 'RAS', comment: '' },
      { id: 6, status: 'RAS', comment: '' },
      { id: 7, status: 'RAS', comment: '' }
    ],
    footer: {
      controls: [
        { id: 1, date: '', time: '' },
        { id: 2, date: '', time: '' }
      ],
      planning: '',
      detail: '',
      absences: [
        { id: 1, absentAgent: '', absentDate: '', replacements: [] }
      ]
    }
  };
}

function migrateData(raw) {
  if (!raw || typeof raw !== 'object') return getDefaultData();
  const d = { ...raw };
  if (!d.footer) d.footer = getDefaultData().footer;

  const isOldFormat = Array.isArray(d.footer.absences) &&
    d.footer.absences.some(a => a && ('replacementAgent' in a || !Array.isArray(a.replacements)));

  if (isOldFormat) {
    d.footer.controls = getDefaultData().footer.controls;
    d.footer.absences = getDefaultData().footer.absences;
  } else {
    if (!Array.isArray(d.footer.controls)) d.footer.controls = getDefaultData().footer.controls;
    if (!Array.isArray(d.footer.absences)) d.footer.absences = getDefaultData().footer.absences;
  }

  d.footer.controls = d.footer.controls
    .filter(c => c && c.date && c.time)
    .map(c => ({ id: c.id || Date.now(), date: c.date, time: c.time }));

  if (d.footer.controls.length < 2) {
    d.footer.controls = getDefaultData().footer.controls;
  }

  d.footer.absences = d.footer.absences.map(a => {
    const abs = { ...a };
    if (!Array.isArray(abs.replacements)) abs.replacements = [];
    abs.replacements = abs.replacements.map(r => ({
      id: r.id || Date.now(),
      agent: r.agent || '',
      date: r.date || ''
    }));
    return abs;
  });

  if (!Array.isArray(d.rows)) d.rows = getDefaultData().rows;
  if (!d.docRef) d.docRef = generateRefFromDate(d.weekStart);
  return d;
}

export default function useRegistreData() {
  const [settings, setSettings] = useState(loadSettings);

  const loadInitialData = () => {
    return getDefaultData();
  };

  const [data, setData] = useState(loadInitialData);
  const [hasChanges, setHasChanges] = useState(false);
  const saveTimerRef = useRef(null);
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const isUndoRedoRef = useRef(false);

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  const monthWeeks = getMonthWeeks(currentYear, currentMonth);
  const monthLabel = getMonthLabel(currentYear, currentMonth);

  const currentWeekIndex = monthWeeks.findIndex(
    w => w.start === data.weekStart && w.end === data.weekEnd
  );
  const safeWeekIndex = currentWeekIndex >= 0 ? currentWeekIndex : 0;

  const pushHistory = useCallback((newData) => {
    if (isUndoRedoRef.current) return;
    const snapshot = JSON.parse(JSON.stringify(newData));
    const idx = historyIndexRef.current;
    historyRef.current = historyRef.current.slice(0, idx + 1);
    historyRef.current.push(snapshot);
    if (historyRef.current.length > 50) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return false;
    historyIndexRef.current--;
    isUndoRedoRef.current = true;
    setData(JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current])));
    isUndoRedoRef.current = false;
    return true;
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return false;
    historyIndexRef.current++;
    isUndoRedoRef.current = true;
    setData(JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current])));
    isUndoRedoRef.current = false;
    return true;
  }, []);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  useEffect(() => {
    if (!isUndoRedoRef.current) pushHistory(data);
  }, [data, pushHistory]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    historyRef.current = [JSON.parse(JSON.stringify(data))];
    historyIndexRef.current = 0;
  }, []);

  // Auto-save with 500ms debounce
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    }, 500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [data]);

  const persist = useCallback((newData) => {
    setData(newData);
  }, []);

  const saveNow = useCallback(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    setHasChanges(false);
  }, [data]);

  const clearAll = useCallback(() => {
    if (window.confirm('Voulez-vous vraiment tout effacer ? Cette action est irreversible.')) {
      const newData = getDefaultData();
      setData(newData);
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  const goToWeek = useCallback((offset) => {
    setData(prev => {
      let currentIdx = monthWeeks.findIndex(
        w => w.start === prev.weekStart && w.end === prev.weekEnd
      );
      if (currentIdx < 0) currentIdx = 0;
      const targetIdx = currentIdx + offset;
      if (targetIdx < 0 || targetIdx >= monthWeeks.length) return prev;
      const week = monthWeeks[targetIdx];
      return {
        ...prev,
        weekStart: week.start,
        weekEnd: week.end,
        docDate: calculateDocDate(week.end),
        docRef: generateRefFromDate(week.start)
      };
    });
  }, [monthWeeks]);

  const goToMonth = useCallback((offset) => {
    const { year, month } = getAdjacentMonth(currentYear, currentMonth, offset);
    setCurrentYear(year);
    setCurrentMonth(month);
    const newWeeks = getMonthWeeks(year, month);
    if (newWeeks.length > 0) {
      const week = newWeeks[0];
      setData(prev => ({
        ...prev,
        weekStart: week.start,
        weekEnd: week.end,
        docDate: calculateDocDate(week.end),
        docRef: generateRefFromDate(week.start)
      }));
    }
  }, [currentYear, currentMonth]);

  const updateField = useCallback((field, value) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'weekEnd') {
        newData.docDate = calculateDocDate(value);
      }
      return newData;
    });
  }, []);

  const updateRowStatus = useCallback((rowId, status) => {
    setData(prev => ({ ...prev, rows: prev.rows.map(r => r.id === rowId ? { ...r, status } : r) }));
  }, []);

  const updateRowComment = useCallback((rowId, comment) => {
    setData(prev => ({ ...prev, rows: prev.rows.map(r => r.id === rowId ? { ...r, comment } : r) }));
  }, []);

  const updateFooter = useCallback((field, value) => {
    setData(prev => ({ ...prev, footer: { ...prev.footer, [field]: value } }));
  }, []);

  const addControl = useCallback(() => {
    setData(prev => ({ ...prev, footer: { ...prev.footer, controls: [...prev.footer.controls, { id: Date.now(), date: '', time: '' }] } }));
  }, []);

  const removeControl = useCallback((id) => {
    setData(prev => ({ ...prev, footer: { ...prev.footer, controls: prev.footer.controls.filter(c => c.id !== id) } }));
  }, []);

  const updateControl = useCallback((id, field, value) => {
    setData(prev => ({ ...prev, footer: { ...prev.footer, controls: prev.footer.controls.map(c => c.id === id ? { ...c, [field]: value } : c) } }));
  }, []);

  const addAbsence = useCallback(() => {
    setData(prev => ({ ...prev, footer: { ...prev.footer, absences: [...prev.footer.absences, { id: Date.now(), absentAgent: '', absentDate: '', replacements: [] }] } }));
  }, []);

  const removeAbsence = useCallback((id) => {
    setData(prev => ({ ...prev, footer: { ...prev.footer, absences: prev.footer.absences.filter(a => a.id !== id) } }));
  }, []);

  const updateAbsence = useCallback((id, field, value) => {
    setData(prev => ({ ...prev, footer: { ...prev.footer, absences: prev.footer.absences.map(a => a.id === id ? { ...a, [field]: value } : a) } }));
  }, []);

  const importEntries = useCallback((parsedEntries) => {
    setData(prev => {
      const existing = prev.footer.absences.filter(a => a.absentAgent || a.replacements.some(r => r.agent));
      const imported = parsedEntries.map((e, i) => {
        const reps = (e.replacements && e.replacements.length > 0)
          ? e.replacements.map((r, ri) => ({ id: Date.now() + i * 100 + ri, agent: r, date: e.date || '' }))
          : (e.replacementAgent ? [{ id: Date.now() + i + 0.5, agent: e.replacementAgent, date: e.date || '' }] : []);
        return {
          id: Date.now() + i,
          absentAgent: e.absentAgent || '',
          absentDate: e.date || '',
          replacements: reps
        };
      });
      const all = [...existing, ...imported];
      const deduped = [];
      const seen = new Map();
      for (const a of all) {
        const key = `${a.absentAgent}|${a.absentDate}`;
        if (!seen.has(key)) {
          seen.set(key, a);
          deduped.push(a);
        } else {
          const existing = seen.get(key);
          if (a.replacements.length > 0) {
            for (const r of a.replacements) {
              if (!existing.replacements.find(er => er.agent === r.agent)) {
                existing.replacements.push(r);
              }
            }
          }
        }
      }
      return { ...prev, footer: { ...prev.footer, absences: deduped.length > 0 ? deduped : prev.footer.absences } };
    });
  }, []);

  const resetWeek = useCallback(() => {
    const newData = getDefaultData();
    setData(newData);
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  const loadFromArchive = useCallback((archiveData) => {
    const migrated = migrateData(archiveData);
    setData(migrated);
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  return {
    data,
    hasChanges,
    settings,
    monthLabel,
    monthWeeks,
    currentWeekIndex: safeWeekIndex,
    updateField,
    updateRowStatus,
    updateRowComment,
    updateFooter,
    addControl,
    removeControl,
    updateControl,
    addAbsence,
    removeAbsence,
    updateAbsence,
    importEntries,
    resetWeek,
    loadFromArchive,
    updateSettings,
    undo,
    redo,
    canUndo,
    canRedo,
    saveNow,
    clearAll,
    goToWeek,
    goToMonth
  };
}
