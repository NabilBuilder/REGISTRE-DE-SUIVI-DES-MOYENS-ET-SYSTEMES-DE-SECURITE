import React, { useCallback, useState, useEffect } from 'react';
import useRegistreData from './hooks/useRegistreData';
import Toolbar from './components/Toolbar';
import DocumentHeader from './components/DocumentHeader';
import VerificationTable from './components/VerificationTable';
import FooterSection from './components/FooterSection';
import ArchivesModal from './components/ArchivesModal';
import SettingsModal from './components/SettingsModal';
import EmailImportModal from './components/EmailImportModal';
import BackupModal from './components/BackupModal';
import PrintPreviewModal from './components/PrintPreviewModal';
import Toast from './components/Toast';
import { sendByEmail, sendByWhatsApp } from '@utils/shareUtils';
import { CONFIG } from '@utils/config';

function loadArchives() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.archiveKey) || '[]');
  } catch { return []; }
}

function saveArchives(archives) {
  localStorage.setItem(CONFIG.archiveKey, JSON.stringify(archives));
}

function archiveCurrent(data) {
  const archives = loadArchives();
  archives.push({
    id: Date.now().toString(),
    label: `${data.siteName || 'Site'} — DU ${data.weekStart || ''} AU ${data.weekEnd || ''}`,
    data: JSON.parse(JSON.stringify(data)),
    archivedAt: new Date().toISOString()
  });
  saveArchives(archives);
}

export default function RegistreSecurite() {
  const {
    data,
    hasChanges,
    settings,
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
    goToMonth,
    monthLabel,
    monthWeeks,
    currentWeekIndex
  } = useRegistreData();



  const [archives, setArchives] = useState([]);
  const [showArchives, setShowArchives] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState(null);
  const [showToolbar, setShowToolbar] = useState(true);

  useEffect(() => {
    setArchives(loadArchives());
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const handleSendEmail = useCallback(async () => {
    archiveCurrent(data);
    setArchives(loadArchives());
    const result = await sendByEmail(data);
    if (result?.message) showToast(result.message);
  }, [data, showToast]);

  const handleSendWhatsApp = useCallback(async () => {
    archiveCurrent(data);
    setArchives(loadArchives());
    const result = await sendByWhatsApp(data);
    if (result?.message) showToast(result.message);
  }, [data, showToast]);

  const handleLoadArchive = useCallback((archiveData) => {
    if (window.confirm('Charger cette archive? Les donnees actuelles seront ecrasees.')) {
      loadFromArchive(archiveData);
      setArchives(loadArchives());
      setShowArchives(false);
    }
  }, [loadFromArchive]);

  const handleDeleteArchive = useCallback((id) => {
    const updated = archives.filter(a => a.id !== id);
    saveArchives(updated);
    setArchives(updated);
  }, [archives]);

  const handleImportEntries = useCallback((entries) => {
    importEntries(entries);
  }, [importEntries]);

  const handleBackupDataChanged = useCallback(() => {
    setArchives(loadArchives());
  }, []);

  const handleShowPreview = useCallback(() => {
    setShowPreview(true);
  }, []);

  const handlePrint = useCallback(() => {
    const page = document.querySelector('.a4-page');
    if (!page) {
      window.print();
      return;
    }

    page.querySelectorAll('.print-highlight-problem, .print-highlight-absence, .print-highlight-comment').forEach(el => {
      el.classList.remove('print-highlight-problem', 'print-highlight-absence', 'print-highlight-comment');
    });

    const statusCells = page.querySelectorAll('td select, td select.cell-edit');
    statusCells.forEach(sel => {
      const val = (sel.value || sel.getAttribute('data-value') || '').trim().toUpperCase();
      if (val && val !== 'RAS' && val !== '') {
        const td = sel.closest('td');
        if (td) {
          td.classList.add('print-highlight-problem');
          const row = td.closest('tr');
          if (row) {
            const commentTd = row.querySelector('td:last-child');
            if (commentTd && commentTd !== td) {
              commentTd.classList.add('print-highlight-comment');
            }
          }
        }
      }
    });

    const allRows = page.querySelectorAll('tr');
    let inAbsenceSection = false;
    allRows.forEach(row => {
      const text = row.textContent || '';
      if (text.includes('Suivi des Absences')) {
        inAbsenceSection = true;
        row.classList.add('print-highlight-absence');
        return;
      }
      if (inAbsenceSection) {
        if (text.includes('Absent') || text.includes('Remplacant') || text.includes('remplacant') || text.includes('Absence')) {
          row.classList.add('print-highlight-absence');
        } else {
          inAbsenceSection = false;
        }
      }
    });

    requestAnimationFrame(() => {
      const a4HeightPx = 297 * (96 / 25.4);
      const contentHeight = page.scrollHeight;
      const scale = contentHeight > a4HeightPx ? a4HeightPx / contentHeight : 1;

      if (scale < 1) {
        page.style.transform = `scale(${scale})`;
        page.style.transformOrigin = 'top center';
        page.style.marginBottom = `-${(1 - scale) * contentHeight}px`;
      }

      setTimeout(() => {
        window.print();
        setTimeout(() => {
          page.style.transform = '';
          page.style.marginBottom = '';
          page.querySelectorAll('.print-highlight-problem, .print-highlight-absence, .print-highlight-comment').forEach(el => {
            el.classList.remove('print-highlight-problem', 'print-highlight-absence', 'print-highlight-comment');
          });
        }, 500);
      }, 100);
    });
  }, []);

  return (
    <>
      <button
        type="button"
        className="toolbar-toggle no-print"
        onClick={() => setShowToolbar(prev => !prev)}
        title={showToolbar ? 'Masquer la barre' : 'Afficher la barre'}
      >
        {showToolbar ? '▼' : '▲'}
      </button>

      <div className={`toolbar-wrapper no-print ${showToolbar ? 'visible' : 'hidden'}`}>
        <Toolbar
          onSendEmail={handleSendEmail}
          onSendWhatsApp={handleSendWhatsApp}
          onShowPreview={handleShowPreview}
          onOpenImport={() => setShowImport(true)}
          onOpenArchives={() => setShowArchives(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenBackup={() => setShowBackup(true)}
          onClearAll={clearAll}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </div>

      <div className="a4-page p-3 md:p-4 shadow-xl mx-auto">
        <DocumentHeader
          data={data}
          updateField={updateField}
          sites={settings.sites}
          supervisors={settings.supervisors}
          goToWeek={goToWeek}
          goToMonth={goToMonth}
          monthLabel={monthLabel}
          currentWeekIndex={currentWeekIndex}
          totalWeeks={monthWeeks.length}
        />

        <VerificationTable
          data={data}
          updateRowStatus={updateRowStatus}
          updateRowComment={updateRowComment}
        />

        <FooterSection
          data={data}
          updateFooter={updateFooter}
          addControl={addControl}
          removeControl={removeControl}
          updateControl={updateControl}
          addAbsence={addAbsence}
          removeAbsence={removeAbsence}
          updateAbsence={updateAbsence}
          guards={settings.guards}
        />
      </div>

      {showArchives && (
        <ArchivesModal
          archives={archives}
          onClose={() => setShowArchives(false)}
          onLoad={handleLoadArchive}
          onDelete={handleDeleteArchive}
        />
      )}

      {showSettings && (
        <SettingsModal
          guards={settings.guards}
          sites={settings.sites}
          supervisors={settings.supervisors}
          onSave={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showImport && (
        <EmailImportModal
          guards={settings.guards}
          onClose={() => setShowImport(false)}
          onApply={handleImportEntries}
        />
      )}

      {showBackup && (
        <BackupModal
          onClose={() => setShowBackup(false)}
          onDataChanged={handleBackupDataChanged}
        />
      )}

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {showPreview && (
        <PrintPreviewModal
          onClose={() => setShowPreview(false)}
          onPrint={handlePrint}
        />
      )}
    </>
  );
}
