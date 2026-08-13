import React, { useState, useCallback } from 'react';

const FONT = "'Times New Roman', 'Noto Serif', Georgia, serif";

const MONTHS_FR = {
  'janvier': '01', 'janv': '01', 'février': '02', 'fevrier': '02', 'fév': '02', 'fev': '02',
  'mars': '03', 'avr': '04', 'avril': '04', 'mai': '05', 'juin': '06',
  'juil': '07', 'juillet': '07', 'août': '08', 'aout': '08', 'aoû': '08',
  'sept': '09', 'septembre': '09', 'oct': '10', 'octobre': '10',
  'nov': '11', 'novembre': '11', 'déc': '12', 'dec': '12', 'décembre': '12', 'decembre': '12'
};

const ABSENT_KEYWORDS = [
  'absence', 'absent', 'absente', 'congé', 'conge', 'congéé', 'repos',
  'maladie', 'injustifié', 'injustifie', 'ne se présente', 'abs',
  'indisponible', 'absenté', 'absenta', 'mission', 'formation',
  'retard', 'absence injustifiée', 'congé annuel', 'congé maladie',
  'absent pour', 'est absent', 'sera absent', 'sera absente',
  'je suis absent', 'je suis absente', 'il est absent', 'elle est absente'
];

const REPLACEMENT_KEYWORDS = [
  'remplacé par', 'remplace par', 'remplacée par', 'remplaçant',
  'remplacant', 'remplacement par', 'remplacé:', 'remplacée:',
  'remplacant:', 'remplaçant:', 'substitué par', 'remplace:',
  'remplaça', 'remplac', 'en remplacement de', 'pour le compte de',
  'assuré par', 'assuree par', 'couvert par', 'suppléé par', 'supplee par'
];

function stripEmailNoise(text) {
  let cleaned = text;
  cleaned = cleaned.replace(/(?:^|\n)(?:-{2,}|_{2,}|={2,}).*$/gm, '');
  cleaned = cleaned.replace(/(?:^|\n)(?:De\s*:|From\s*:|Envoyé\s*(?:par|le)|Sent\s*(?:by|on)|Objet\s*:|Subject\s*:|Date\s*:).*/gi, '');
  cleaned = cleaned.replace(/(?:^|\n)(?:Pour\s*(?:me\s*)?transmettre|Forwarded message|Message transféré|---\s*Message transféré).*/gi, '');
  cleaned = cleaned.replace(/(?:^|\n)(?:Cordialement|Bien cordialement|Cordialement,|Best regards|Regards,|Merci|Bon courage|Bonne journée|Bonne soirée).*/gi, '');
  cleaned = cleaned.replace(/(?:^|\n)(?:Tél\s*:|Tel\s*:|Fax\s*:|Email\s*:|Web\s*:|www\.).*/gi, '');
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  return cleaned.trim();
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function normalizeStr(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').trim();
}

function fuzzyScore(input, target) {
  const a = normalizeStr(input);
  const b = normalizeStr(target);
  if (a === b) return 1;
  if (b.includes(a) || a.includes(b)) return 0.95;
  const words = a.split(/\s+/);
  if (words.length >= 2) {
    const firstName = words[0];
    const lastName = words[words.length - 1];
    if (b.includes(firstName) && b.includes(lastName)) return 0.92;
    if (b.includes(firstName) || b.includes(lastName)) return 0.85;
  }
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 0;
  const dist = levenshtein(a, b);
  return 1 - dist / maxLen;
}

function findBestMatch(input, agents, threshold = 0.55) {
  if (!input || !agents.length) return null;
  const trimmed = input.trim();
  if (trimmed.length < 2) return null;
  let best = null, bestScore = 0;
  for (const a of agents) {
    const score = fuzzyScore(trimmed, a);
    if (score > bestScore) { bestScore = score; best = a; }
  }
  return bestScore >= threshold ? best : null;
}

function parseFrenchDate(str) {
  if (!str) return '';
  str = str.trim().replace(/\./g, '/').replace(/-/g, '/');

  let m = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    let day = m[1].padStart(2, '0'), month = m[2].padStart(2, '0'), year = m[3];
    if (year.length === 2) year = '20' + year;
    if (parseInt(month) > 12 && parseInt(day) <= 12) [day, month] = [month, day];
    if (parseInt(month) >= 1 && parseInt(month) <= 12 && parseInt(day) >= 1 && parseInt(day) <= 31) {
      return `${year}-${month}-${day}`;
    }
  }

  const monthPattern = Object.keys(MONTHS_FR).join('|');
  m = str.match(new RegExp(`(\\d{1,2})\\s+(${monthPattern})\\s+(\\d{2,4})`, 'i'));
  if (m) {
    const monthNum = MONTHS_FR[m[2].toLowerCase()];
    if (monthNum) {
      let year = m[3]; if (year.length === 2) year = '20' + year;
      return `${year}-${monthNum}-${m[1].padStart(2, '0')}`;
    }
  }

  const DAY_NAMES = { 'lundi': 0, 'mardi': 1, 'mercredi': 2, 'jeudi': 3, 'vendredi': 4, 'samedi': 5, 'dimanche': 6 };
  for (const [dayName] of Object.entries(DAY_NAMES)) {
    m = str.match(new RegExp(`${dayName}\\s+(\\d{1,2})\\s+(${monthPattern})\\s+(\\d{2,4})`, 'i'));
    if (m) {
      const monthNum = MONTHS_FR[m[2].toLowerCase()];
      if (monthNum) {
        let year = m[3]; if (year.length === 2) year = '20' + year;
        return `${year}-${monthNum}-${m[1].padStart(2, '0')}`;
      }
    }
  }

  return '';
}

function findDateRange(text) {
  const monthPattern = Object.keys(MONTHS_FR).join('|');

  let m = text.match(new RegExp(`(\\d{1,2})[\/\-](\\d{1,2})[\/\-](\\d{2,4})\\s*(?:au|à|a|-)\\s*(\\d{1,2})[\/\-](\\d{1,2})[\/\-](\\d{2,4})`, 'i'));
  if (m) {
    const start = parseFrenchDate(`${m[1]}/${m[2]}/${m[3]}`);
    const end = parseFrenchDate(`${m[4]}/${m[5]}/${m[6]}`);
    if (start && end) return { start, end };
  }

  m = text.match(new RegExp(`(\\d{1,2})\\s+(${monthPattern})\\s+(\\d{2,4})\\s*(?:au|à|a)\\s*(\\d{1,2})\\s*(${monthPattern})?\\s*(\\d{2,4})?`, 'i'));
  if (m) {
    const start = parseFrenchDate(`${m[1]} ${m[2]} ${m[3]}`);
    let endStr = `${m[4]} ${m[5] || m[2]} ${m[6] || m[3]}`;
    const end = parseFrenchDate(endStr);
    if (start && end) return { start, end };
  }

  return null;
}

function expandDateRange(start, end) {
  const dates = [];
  let current = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');
  while (current <= endDate) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function extractAgentAfterKeywords(text, keywords) {
  const kwPattern = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const re = new RegExp('(?:' + kwPattern + ')\\s*[:;]?\\s*(.+)', 'i');
  const m = text.match(re);
  if (m) {
    let raw = m[1].trim()
      .replace(/[,;].*$/, '')
      .replace(/\s*(?:le|du|pour|cause|remplac|absent|congé|repos|maladie|injustifié|service|et|ou|pour|ainsi|puis|également|aussi|le jour|la semaine).*$/i, '')
      .trim();
    if (raw.length > 1 && raw.length < 60) return raw;
  }
  return '';
}

function findAllAgentsAfterKeywords(text, keywords) {
  const kwPattern = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const re = new RegExp('(?:' + kwPattern + ')\\s*[:;]?\\s*([A-ZÀ-Ü][a-zà-ü]+(?:\\s+[A-ZÀ-Ü][a-zà-ü]+)*(?:\\s*,\\s*[A-ZÀ-Ü][a-zà-ü]+(?:\\s+[A-ZÀ-Ü][a-zà-ü]+)*)*)', 'gi');
  const agents = [];
  let match;
  while ((match = re.exec(text)) !== null) {
    const raw = match[1].trim()
      .replace(/\s*(?:le|du|pour|cause|remplac|absent|congé|repos|maladie|injustifié|service|et|ou|pour|ainsi|puis|également|aussi).*$/i, '')
      .trim();
    if (raw.length > 1 && raw.length < 60) {
      const parts = raw.split(/\s*,\s*/);
      for (const p of parts) {
        if (p.trim().length > 1) agents.push(p.trim());
      }
    }
  }
  return agents;
}

function parseEmailEntries(text, agents) {
  const entries = [];
  const cleaned = stripEmailNoise(text);
  const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);
  const fullText = lines.join(' ');

  const monthPattern = Object.keys(MONTHS_FR).join('|');
  const datePatterns = [
    new RegExp(`(?:le|du|date|jour|service|date de début|date de fin)\\s*:?\\s*(\\d{1,2}[\/\-\.]\\d{1,2}[\/\-\.]\\d{2,4})`, 'i'),
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
    new RegExp(`(?:le|du)\\s+(\\d{1,2})\\s+(${monthPattern})\\s+(\\d{2,4})`, 'i'),
    new RegExp(`(\\d{1,2})\\s+(${monthPattern})\\s+(\\d{2,4})`, 'i'),
  ];

  function findDate(textBlock) {
    for (const pat of datePatterns) {
      const dm = textBlock.match(pat);
      if (dm) {
        const d = parseFrenchDate(dm[0]);
        if (d) return d;
      }
    }
    return '';
  }

  function extractContext(line) {
    const lower = line.toLowerCase();
    const hasAbsence = ABSENT_KEYWORDS.some(kw => lower.includes(kw));
    const hasReplacement = REPLACEMENT_KEYWORDS.some(kw => lower.includes(kw));

    let absent = '', replacement = '';
    let replacements = [];

    if (hasAbsence) {
      const raw = extractAgentAfterKeywords(line, [
        'absence de', 'absent de', 'absent:', 'absence:', 'absence d\'',
        'congé de', 'congé:', 'congé d\'', 'repos de', 'repos:',
        'maladie de', 'maladie:', 'injustifié de', 'abs de', 'abs:',
        'indisponible:', 'indisponible de', 'mission de', 'formation de',
        'retard de', 'est absent', 'sera absent', 'sera absente',
        'absent(e)? de', 'congé sans solde de', 'absence pour',
        'je suis absent', 'je suis absente', 'il est absent', 'elle est absente'
      ]);
      if (raw) absent = findBestMatch(raw, agents) || raw;
    }

    if (!absent && !hasAbsence) {
      for (const kw of ABSENT_KEYWORDS) {
        const re = new RegExp(kw + '\\s*(?:de|du|:|d\')?\\s*([A-ZÀ-Ü][a-zà-ü]+(?:\\s+[A-ZÀ-Ü][a-zà-ü]+){0,3})', 'i');
        const m = line.match(re);
        if (m && m[1]) { absent = findBestMatch(m[1], agents) || m[1]; break; }
      }
    }

    if (hasReplacement) {
      replacements = findAllAgentsAfterKeywords(line, [
        'remplacé par', 'remplace par', 'remplacée par', 'remplaçant:',
        'remplacant:', 'remplacement par', 'remplacé:', 'remplacée:',
        'substitué par', 'remplace:', 'en remplacement de',
        'pour le compte de', 'assuré par', 'assuree par',
        'couvert par', 'suppléé par', 'supplee par'
      ]);
      if (replacements.length > 0) {
        replacement = findBestMatch(replacements[0], agents) || replacements[0];
      }
    }

    if (!replacement && !hasReplacement) {
      for (const kw of REPLACEMENT_KEYWORDS) {
        const re = new RegExp(kw + '\\s*[:;]?\\s*([A-ZÀ-Ü][a-zà-ü]+(?:\\s+[A-ZÀ-Ü][a-zà-ü]+){0,3})', 'gi');
        let m;
        while ((m = re.exec(line)) !== null) {
          if (m[1]) {
            const matched = findBestMatch(m[1], agents) || m[1];
            if (!replacements.includes(matched)) replacements.push(matched);
          }
        }
        if (replacements.length > 0) break;
      }
      if (replacements.length > 0 && !replacement) {
        replacement = replacements[0];
      }
    }

    return { absent, replacement, replacements };
  }

  let currentDate = '';

  for (const line of lines) {
    const date = findDate(line);
    if (date) currentDate = date;

    const range = findDateRange(line);
    if (range && range.start && range.end) {
      const dates = expandDateRange(range.start, range.end);
      const ctx = extractContext(line);
      if (ctx.absent) {
        for (const d of dates) {
          const existing = entries.find(e => e.date === d && e.absentAgent === ctx.absent);
          if (!existing) {
            entries.push({
              date: d,
              absentAgent: ctx.absent,
              replacementAgent: ctx.replacement || '',
              replacements: ctx.replacements.length > 0 ? ctx.replacements : (ctx.replacement ? [ctx.replacement] : []),
              id: Date.now() + Math.random()
            });
          } else if (ctx.replacement && !existing.replacementAgent) {
            existing.replacementAgent = ctx.replacement;
            if (!existing.replacements.includes(ctx.replacement)) existing.replacements.push(ctx.replacement);
          }
        }
        currentDate = range.end;
        continue;
      }
    }

    const ctx = extractContext(line);
    if (ctx.absent) {
      const d = currentDate || '';
      const existing = entries.find(e => e.date === d && e.absentAgent === ctx.absent);
      if (!existing) {
        entries.push({
          date: d,
          absentAgent: ctx.absent,
          replacementAgent: ctx.replacement || '',
          replacements: ctx.replacements.length > 0 ? ctx.replacements : (ctx.replacement ? [ctx.replacement] : []),
          id: Date.now() + Math.random()
        });
      } else {
        if (ctx.replacement && !existing.replacementAgent) existing.replacementAgent = ctx.replacement;
        if (ctx.replacements.length > 0) {
          for (const r of ctx.replacements) {
            if (!existing.replacements.includes(r)) existing.replacements.push(r);
          }
          if (!existing.replacementAgent && existing.replacements.length > 0) {
            existing.replacementAgent = existing.replacements[0];
          }
        } else if (ctx.replacement) {
          if (!existing.replacements.includes(ctx.replacement)) existing.replacements.push(ctx.replacement);
          if (!existing.replacementAgent) existing.replacementAgent = ctx.replacement;
        }
      }
    }
  }

  if (entries.length === 0) {
    const blocks = fullText.split(/(?=(?:absence|remplacement|remplaçant|remplac|cong[eé]|absent|service le|remplacé par|indisponible|retard|mission|formation))/i);
    for (const block of blocks) {
      const blockLines = block.split(/\n/).map(l => l.trim()).filter(Boolean);
      const blockText = blockLines.join(' ');

      let date = findDate(blockText);
      if (!date) {
        for (const bl of blockLines) { date = findDate(bl); if (date) break; }
      }

      const range = findDateRange(blockText);
      const ctx = extractContext(blockText);
      if (ctx.absent) {
        if (range && range.start && range.end) {
          const dates = expandDateRange(range.start, range.end);
          for (const d of dates) {
            if (!entries.find(e => e.date === d && e.absentAgent === ctx.absent)) {
              entries.push({
                date: d,
                absentAgent: ctx.absent,
                replacementAgent: ctx.replacement || '',
                replacements: ctx.replacements.length > 0 ? ctx.replacements : (ctx.replacement ? [ctx.replacement] : []),
                id: Date.now() + Math.random()
              });
            }
          }
          if (date) currentDate = date;
        } else if ((date || currentDate) && ctx.absent) {
          entries.push({
            date: date || currentDate || '',
            absentAgent: ctx.absent,
            replacementAgent: ctx.replacement || '',
            replacements: ctx.replacements.length > 0 ? ctx.replacements : (ctx.replacement ? [ctx.replacement] : []),
            id: Date.now() + Math.random()
          });
          if (date) currentDate = date;
        }
      }
    }
  }

  const deduped = [];
  const seen = new Map();
  for (const e of entries) {
    const key = `${e.date}|${normalizeStr(e.absentAgent)}`;
    if (!seen.has(key)) {
      seen.set(key, e);
      deduped.push(e);
    } else {
      const existing = seen.get(key);
      if (e.replacementAgent && !existing.replacementAgent) {
        existing.replacementAgent = e.replacementAgent;
      }
      if (e.replacements && e.replacements.length > 0) {
        if (!existing.replacements) existing.replacements = [];
        for (const r of e.replacements) {
          if (!existing.replacements.includes(r)) existing.replacements.push(r);
        }
        if (!existing.replacementAgent && existing.replacements.length > 0) {
          existing.replacementAgent = existing.replacements[0];
        }
      }
    }
  }

  return deduped.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
}

export default function EmailImportModal({ guards, onClose, onApply }) {
  const [rawText, setRawText] = useState('');
  const [entries, setEntries] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [parsed, setParsed] = useState(false);

  const handleParse = useCallback(() => {
    if (!rawText.trim()) return;
    const results = parseEmailEntries(rawText, guards);
    setEntries(results);
    setSelected(new Set(results.map((_, i) => i)));
    setParsed(true);
  }, [rawText, guards]);

  const toggleSelect = (idx) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === entries.length) setSelected(new Set());
    else setSelected(new Set(entries.map((_, i) => i)));
  };

  const updateEntry = (idx, field, value) => {
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const handleApply = () => {
    const toImport = entries.filter((_, i) => selected.has(i)).map(e => ({
      ...e,
      replacementAgent: e.replacementAgent || (e.replacements && e.replacements[0]) || '',
      replacements: e.replacements || (e.replacementAgent ? [e.replacementAgent] : [])
    }));
    onApply(toImport);
    onClose();
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const p = d.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '95%', maxWidth: '750px', maxHeight: '90vh', overflow: 'hidden', fontFamily: FONT, display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', fontFamily: FONT }}>📥 Importer Emails / Texte</h2>
          <button onClick={onClose} style={{ border: 'none', background: '#fee2e2', color: '#dc2626', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>

        <div style={{ padding: '12px 16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {!parsed ? (
            <>
              <div style={{ fontSize: '10px', color: '#6b7280', lineHeight: '1.5' }}>
                <strong>Formes supportées:</strong> Dates numériques (04/08/2026), dates françaises (4 août 2026), 
                jours (Lundi 4 août 2026), plages (du 06/08 au 08/08).<br/>
                <strong>Mots-clés:</strong> absence, absent, congé, repos, maladie, remplacé par, remplaçant, etc.<br/>
                Les emails inutiles (signatures, en-têtes) sont automatiquement supprimés.
              </div>
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder={
                  "Objet: Absence MOHAMED RAMZI-ELALAOUI\n\nBonjour,\n\nJe vous informe de l'absence de MOHAMED RAMZI le 04/08/2026, remplacé par MZIOUAD ABDELLAH.\n\nLe 05/08 au 07/08, absence de MIFDAL MOUHCINE, remplaçant: ERRaoUDI SOUFIANE.\n\nCordialement"
                }
                style={{ width: '100%', minHeight: '180px', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px', fontSize: '10px', fontFamily: 'monospace', resize: 'vertical', outline: 'none', lineHeight: '1.5', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                <button onClick={onClose} style={{ border: '1px solid #d1d5db', background: 'white', color: '#6b7280', borderRadius: '4px', padding: '6px 14px', fontSize: '10px', cursor: 'pointer', fontFamily: FONT }}>Annuler</button>
                <button onClick={handleParse} disabled={!rawText.trim()} style={{ border: 'none', background: rawText.trim() ? '#2563eb' : '#93c5fd', color: 'white', borderRadius: '4px', padding: '6px 14px', fontSize: '10px', cursor: rawText.trim() ? 'pointer' : 'not-allowed', fontFamily: FONT, fontWeight: 'bold' }}>🔍 Analyser</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '10px', color: entries.length ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                {entries.length > 0 ? `${entries.length} entrée(s) détectée(s) — ${selected.size} sélectionnée(s)` : 'Aucune entrée détectée. Vérifiez le format du texte.'}
              </div>

              {entries.length > 0 && (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '28px 85px 1fr 1fr 30px', background: '#f3f4f6', padding: '4px 6px', fontSize: '9px', fontWeight: 'bold', fontFamily: FONT, borderBottom: '1px solid #e5e7eb' }}>
                    <div><input type="checkbox" checked={selected.size === entries.length} onChange={toggleAll} style={{ cursor: 'pointer' }} /></div>
                    <div>Date</div>
                    <div>Agent Absent</div>
                    <div>Agent Remplaçant</div>
                    <div></div>
                  </div>
                  <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {entries.map((e, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 85px 1fr 1fr 30px', padding: '3px 6px', fontSize: '9px', fontFamily: FONT, borderBottom: '1px solid #f3f4f6', background: selected.has(i) ? '#eff6ff' : 'white', alignItems: 'center' }}>
                        <div><input type="checkbox" checked={selected.has(i)} onChange={() => toggleSelect(i)} style={{ cursor: 'pointer' }} /></div>
                        <div>
                          <input
                            type="date"
                            value={e.date || ''}
                            onChange={ev => updateEntry(i, 'date', ev.target.value)}
                            onClick={ev => ev.stopPropagation()}
                            style={{ border: '1px solid #d1d5db', borderRadius: '3px', padding: '1px 3px', fontSize: '9px', fontFamily: FONT, width: '82px', cursor: 'pointer' }}
                          />
                        </div>
                        <div>
                          <select
                            value={e.absentAgent || ''}
                            onChange={ev => {
                              const val = ev.target.value;
                              updateEntry(i, 'absentAgent', val);
                              ev.stopPropagation();
                            }}
                            onClick={ev => ev.stopPropagation()}
                            style={{ border: '1px solid #d1d5db', borderRadius: '3px', padding: '1px 3px', fontSize: '9px', fontFamily: FONT, width: '100%', background: 'white', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            <option value={e.absentAgent}>{e.absentAgent}</option>
                            {guards.map(g => g !== e.absentAgent ? <option key={g} value={g}>{g}</option> : null)}
                          </select>
                        </div>
                        <div>
                          <select
                            value={e.replacementAgent || ''}
                            onChange={ev => {
                              const val = ev.target.value;
                              updateEntry(i, 'replacementAgent', val);
                              updateEntry(i, 'replacements', val ? [val] : []);
                              ev.stopPropagation();
                            }}
                            onClick={ev => ev.stopPropagation()}
                            style={{ border: '1px solid #d1d5db', borderRadius: '3px', padding: '1px 3px', fontSize: '9px', fontFamily: FONT, width: '100%', background: 'white', color: '#2563eb', cursor: 'pointer' }}
                          >
                            <option value="">—</option>
                            {guards.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <button onClick={(ev) => { ev.stopPropagation(); setEntries(prev => prev.filter((_, j) => j !== i)); setSelected(prev => { const n = new Set(prev); n.delete(i); return n; }); }} style={{ border: 'none', background: '#fee2e2', color: '#dc2626', borderRadius: '3px', padding: '0 4px', fontSize: '9px', cursor: 'pointer' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                <button onClick={() => { setParsed(false); setEntries([]); setSelected(new Set()); }} style={{ border: '1px solid #d1d5db', background: 'white', color: '#6b7280', borderRadius: '4px', padding: '6px 14px', fontSize: '10px', cursor: 'pointer', fontFamily: FONT }}>← Retour</button>
                <button onClick={onClose} style={{ border: '1px solid #d1d5db', background: 'white', color: '#6b7280', borderRadius: '4px', padding: '6px 14px', fontSize: '10px', cursor: 'pointer', fontFamily: FONT }}>Annuler</button>
                <button onClick={handleApply} disabled={selected.size === 0} style={{ border: 'none', background: selected.size > 0 ? '#16a34a' : '#86efac', color: 'white', borderRadius: '4px', padding: '6px 14px', fontSize: '10px', cursor: selected.size > 0 ? 'pointer' : 'not-allowed', fontFamily: FONT, fontWeight: 'bold' }}>
                  ✓ Appliquer au Registre ({selected.size})
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
