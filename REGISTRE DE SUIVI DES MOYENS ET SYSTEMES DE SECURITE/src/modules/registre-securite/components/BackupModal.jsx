import React, { useState, useRef, useCallback } from 'react';

const FONT = "'Times New Roman', 'Noto Serif', Georgia, serif";

const KEYS = {
  archives: 'registre_archives',
  settings: 'registre_settings',
  draft: 'registre_draft',
  data: 'registre_data',
  lastSave: 'lastSave'
};

function compileBackup() {
  const backup = {
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    appName: 'REGISTRE DE SUIVI DES MOYENS ET SYSTEMES DE SECURITE',
    data: {}
  };

  for (const [name, key] of Object.entries(KEYS)) {
    try {
      const raw = localStorage.getItem(key);
      backup.data[name] = raw ? JSON.parse(raw) : null;
    } catch {
      backup.data[name] = null;
    }
  }

  return backup;
}

function validateBackup(json) {
  const errors = [];
  if (!json || typeof json !== 'object') {
    errors.push('Le fichier n\'est pas un objet JSON valide.');
    return { valid: false, errors };
  }
  if (!json.appName || !json.appName.includes('REGISTRE')) {
    errors.push('Ce fichier n\'est pas un backup de l\'application Registre de Sécurité.');
  }
  if (!json.data || typeof json.data !== 'object') {
    errors.push('Structure de données invalide: clé "data" manquante.');
  }
  return { valid: errors.length === 0, errors };
}

function applyBackup(backupData, mode, onUpdate) {
  if (mode === 'overwrite') {
    for (const [name, key] of Object.entries(KEYS)) {
      const value = backupData[name];
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }
  } else {
    const archivesRaw = localStorage.getItem(KEYS.archives);
    const existingArchives = archivesRaw ? JSON.parse(archivesRaw) : [];
    const importedArchives = backupData.archives || [];
    const mergedArchives = [...existingArchives];
    const existingIds = new Set(existingArchives.map(a => a.id));
    for (const arch of importedArchives) {
      if (!existingIds.has(arch.id)) {
        mergedArchives.push(arch);
      }
    }
    localStorage.setItem(KEYS.archives, JSON.stringify(mergedArchives));

    if (backupData.settings) {
      const existingSettingsRaw = localStorage.getItem(KEYS.settings);
      const existingSettings = existingSettingsRaw ? JSON.parse(existingSettingsRaw) : {};
      const mergedSettings = { ...existingSettings, ...backupData.settings };

      if (existingSettings.guards && backupData.settings.guards) {
        const mergedGuards = [...new Set([...existingSettings.guards, ...backupData.settings.guards])];
        mergedSettings.guards = mergedGuards;
      }
      if (existingSettings.sites && backupData.settings.sites) {
        const mergedSites = [...new Set([...existingSettings.sites, ...backupData.settings.sites])];
        mergedSettings.sites = mergedSites;
      }
      if (existingSettings.supervisors && backupData.settings.supervisors) {
        const mergedSupervisors = [...new Set([...existingSettings.supervisors, ...backupData.settings.supervisors])];
        mergedSettings.supervisors = mergedSupervisors;
      }
      localStorage.setItem(KEYS.settings, JSON.stringify(mergedSettings));
    }

    if (backupData.draft) {
      localStorage.setItem(KEYS.draft, JSON.stringify(backupData.draft));
    }
  }

  onUpdate();
}

export default function BackupModal({ onClose, onDataChanged }) {
  const [tab, setTab] = useState('export');
  const [importMode, setImportMode] = useState('merge');
  const [importStatus, setImportStatus] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleExport = useCallback(() => {
    const backup = compileBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Backup_Registre_Securite_${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setImportStatus({ type: 'success', msg: '✅ Backup exporté avec succès!' });
    setTimeout(() => setImportStatus(null), 3000);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setImportPreview(null);
    setImportStatus(null);

    if (!file.name.endsWith('.json')) {
      setError('Veuillez sélectionner un fichier .json');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target.result);
        const { valid, errors } = validateBackup(json);
        if (!valid) {
          setError(errors.join(' '));
          return;
        }
        const archivesCount = json.data?.archives?.length || 0;
        const guardsCount = json.data?.settings?.guards?.length || 0;
        const sitesCount = json.data?.settings?.sites?.length || 0;
        const hasDraft = !!json.data?.draft;

        setImportPreview({
          json,
          archivesCount,
          guardsCount,
          sitesCount,
          hasDraft,
          exportedAt: json.exportedAt || 'Inconnu'
        });
      } catch {
        setError('Fichier JSON invalide. Vérifiez le format du fichier.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleApplyImport = useCallback(() => {
    if (!importPreview?.json) return;

    const confirmed = window.confirm(
      `Confirmer l'importation (${importMode === 'overwrite' ? 'ÉCRASER' : 'FUSIONNER'})?\n\n` +
      `Archives: ${importPreview.archivesCount}\n` +
      `Agents: ${importPreview.guardsCount}\n` +
      `Sites: ${importPreview.sitesCount}\n` +
      `Brouillon: ${importPreview.hasDraft ? 'Oui' : 'Non'}\n\n` +
      (importMode === 'overwrite' ? '⚠️ Toutes les données existantes seront supprimées!' : 'Les données existantes seront conservées et fusionnées.')
    );

    if (!confirmed) return;

    try {
      applyBackup(importPreview.json.data, importMode, () => {
        onDataChanged();
        setImportStatus({ type: 'success', msg: '✅ Données importées avec succès! Rechargement...' });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      });
    } catch (err) {
      setError('Erreur lors de l\'importation: ' + err.message);
    }
  }, [importPreview, importMode, onDataChanged]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '95%', maxWidth: '500px', maxHeight: '85vh', overflow: 'hidden', fontFamily: FONT, display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', fontFamily: FONT }}>💾 Backup & Restauration</h2>
          <button onClick={onClose} style={{ border: 'none', background: '#fee2e2', color: '#dc2626', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
          {[
            { key: 'export', label: '📤 Exporter' },
            { key: 'import', label: '📥 Importer' }
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setError(''); setImportPreview(null); setImportStatus(null); }}
              style={{
                flex: 1, padding: '8px', fontSize: '10px', fontFamily: FONT, fontWeight: 'bold', cursor: 'pointer',
                border: 'none', borderBottom: tab === t.key ? '2px solid #2563eb' : '2px solid transparent',
                background: tab === t.key ? '#eff6ff' : 'white', color: tab === t.key ? '#2563eb' : '#6b7280'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '12px 16px', overflowY: 'auto', flex: 1 }}>
          {importStatus && (
            <div style={{
              padding: '8px 10px', borderRadius: '4px', marginBottom: '10px', fontSize: '10px', fontFamily: FONT, fontWeight: 'bold',
              background: importStatus.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: importStatus.type === 'success' ? '#166534' : '#991b1b'
            }}>
              {importStatus.msg}
            </div>
          )}

          {error && (
            <div style={{ padding: '8px 10px', borderRadius: '4px', marginBottom: '10px', fontSize: '10px', fontFamily: FONT, background: '#fee2e2', color: '#991b1b', fontWeight: 'bold' }}>
              ⚠️ {error}
            </div>
          )}

          {tab === 'export' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>📤</div>
              <div style={{ fontSize: '11px', color: '#374151', marginBottom: '15px', lineHeight: '1.5' }}>
                Exportez toutes vos données en un seul fichier JSON.<br />
                Le fichier contiendra: archives, personnel, sites, et le brouillon actuel.
              </div>
              <button
                onClick={handleExport}
                style={{
                  border: 'none', background: '#2563eb', color: 'white', borderRadius: '6px',
                  padding: '10px 24px', fontSize: '11px', cursor: 'pointer', fontFamily: FONT, fontWeight: 'bold'
                }}
              >
                📤 Exporter les données (JSON)
              </button>
            </div>
          )}

          {tab === 'import' && (
            <div>
              <div style={{ fontSize: '10px', color: '#374151', marginBottom: '10px', lineHeight: '1.5' }}>
                Importez un fichier de backup précédemment exporté.
              </div>

              <input
                type="file"
                ref={fileRef}
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  width: '100%', border: '2px dashed #d1d5db', background: '#f9fafb', borderRadius: '6px',
                  padding: '15px', fontSize: '11px', cursor: 'pointer', fontFamily: FONT, color: '#6b7280',
                  marginBottom: '12px'
                }}
              >
                📁 Cliquez pour sélectionner un fichier .json
              </button>

              {importPreview && (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '10px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '6px', fontFamily: FONT }}>
                    📋 Aperçu du backup:
                  </div>
                  <div style={{ fontSize: '9px', fontFamily: FONT, color: '#6b7280', lineHeight: '1.6' }}>
                    <div>📅 Exporté le: {new Date(importPreview.exportedAt).toLocaleString('fr-FR')}</div>
                    <div>📁 Archives: {importPreview.archivesCount} semaine(s)</div>
                    <div>👤 Agents: {importPreview.guardsCount}</div>
                    <div>🏢 Sites: {importPreview.sitesCount}</div>
                    <div>📝 Brouillon: {importPreview.hasDraft ? 'Oui' : 'Non'}</div>
                  </div>

                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontFamily: FONT, cursor: 'pointer' }}>
                      <input type="radio" name="importMode" value="merge" checked={importMode === 'merge'} onChange={() => setImportMode('merge')} />
                      Fusionner (conserver existant)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontFamily: FONT, cursor: 'pointer' }}>
                      <input type="radio" name="importMode" value="overwrite" checked={importMode === 'overwrite'} onChange={() => setImportMode('overwrite')} />
                      Écraser (remplacer tout)
                    </label>
                  </div>

                  <button
                    onClick={handleApplyImport}
                    style={{
                      width: '100%', marginTop: '10px', border: 'none',
                      background: importMode === 'overwrite' ? '#dc2626' : '#16a34a',
                      color: 'white', borderRadius: '4px', padding: '8px', fontSize: '10px',
                      cursor: 'pointer', fontFamily: FONT, fontWeight: 'bold'
                    }}
                  >
                    {importMode === 'overwrite' ? '⚠️ Écraser et importer' : '✓ Fusionner et importer'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={onClose} style={{ border: '1px solid #d1d5db', background: 'white', color: '#6b7280', borderRadius: '4px', padding: '5px 14px', fontSize: '10px', cursor: 'pointer', fontFamily: FONT }}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
