import React from 'react';

const FONT = "'Times New Roman', 'Noto Serif', Georgia, serif";

export default function ArchivesModal({ archives, onClose, onView, onResend, onDelete }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'white', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '92%', maxWidth: '700px', maxHeight: '80vh', overflow: 'hidden', fontFamily: FONT }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', fontFamily: FONT }}>📁 Archives des Semaines</h2>
          <button onClick={onClose} style={{ border: 'none', background: '#fee2e2', color: '#dc2626', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>

        <div style={{ padding: '10px 16px', overflowY: 'auto', maxHeight: 'calc(80vh - 50px)' }}>
          {!archives || archives.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '11px', padding: '30px 0' }}>Aucune archive disponible.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', fontFamily: FONT }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '6px 4px', fontSize: '10px', fontWeight: 'bold' }}>Période</th>
                  <th style={{ textAlign: 'left', padding: '6px 4px', fontSize: '10px', fontWeight: 'bold' }}>Site</th>
                  <th style={{ textAlign: 'left', padding: '6px 4px', fontSize: '10px', fontWeight: 'bold' }}>Archivé le</th>
                  <th style={{ textAlign: 'center', padding: '6px 4px', fontSize: '10px', fontWeight: 'bold' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {archives.slice().reverse().map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px 4px', fontSize: '10px' }}>DU {a.data?.weekStart || ''} AU {a.data?.weekEnd || ''}</td>
                    <td style={{ padding: '6px 4px', fontSize: '10px' }}>{a.data?.siteName || ''}</td>
                    <td style={{ padding: '6px 4px', fontSize: '9px', color: '#6b7280' }}>
                      {new Date(a.archivedAt).toLocaleDateString('fr-FR')} {new Date(a.archivedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
                        <button onClick={() => onView(a.data)} style={{ border: '1px solid #2563eb', background: '#eff6ff', color: '#2563eb', borderRadius: '3px', padding: '2px 6px', fontSize: '8px', cursor: 'pointer', fontFamily: FONT }}>Voir</button>
                        <button onClick={() => onResend(a.data)} style={{ border: '1px solid #059669', background: '#ecfdf5', color: '#059669', borderRadius: '3px', padding: '2px 6px', fontSize: '8px', cursor: 'pointer', fontFamily: FONT }}>Renvoyer</button>
                        <button onClick={() => { if (window.confirm('Supprimer cette archive?')) onDelete(a.id); }} style={{ border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', borderRadius: '3px', padding: '2px 6px', fontSize: '8px', cursor: 'pointer', fontFamily: FONT }}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
