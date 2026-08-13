import React, { useState } from 'react';

const FONT = "'Times New Roman', 'Noto Serif', Georgia, serif";

export default function SettingsModal({ guards, sites, supervisors, onSave, onClose }) {
  const [localGuards, setLocalGuards] = useState([...guards]);
  const [localSites, setLocalSites] = useState([...sites]);
  const [localSupervisors, setLocalSupervisors] = useState([...supervisors]);
  const [newGuard, setNewGuard] = useState('');
  const [newSite, setNewSite] = useState('');
  const [newSupervisor, setNewSupervisor] = useState('');
  const [tab, setTab] = useState('guards');

  const addItem = (list, setList, newItem, setNewItem) => {
    const val = newItem.trim();
    if (val && !list.includes(val)) {
      setList([...list, val]);
      setNewItem('');
    }
  };

  const removeItem = (list, setList, item) => {
    setList(list.filter(i => i !== item));
  };

  const handleSave = () => {
    onSave({ guards: localGuards, sites: localSites, supervisors: localSupervisors });
    onClose();
  };

  const renderList = (items, setItems, newItem, setNewItem, placeholder) => (
    <div>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        <input
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addItem(items, setItems, newItem, setNewItem); }}
          placeholder={placeholder}
          style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: '4px', padding: '4px 6px', fontSize: '10px', fontFamily: FONT, outline: 'none' }}
        />
        <button
          onClick={() => addItem(items, setItems, newItem, setNewItem)}
          style={{ border: '1px solid #2563eb', background: '#eff6ff', color: '#2563eb', borderRadius: '4px', padding: '4px 10px', fontSize: '9px', cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap' }}
        >
          + Ajouter
        </button>
      </div>
      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 4px', borderBottom: '1px solid #f3f4f6', fontSize: '10px', fontFamily: FONT }}>
            <span>{item}</span>
            <button
              onClick={() => removeItem(items, setItems, item)}
              style={{ border: 'none', background: '#fee2e2', color: '#dc2626', borderRadius: '3px', padding: '1px 5px', fontSize: '8px', cursor: 'pointer', fontFamily: FONT }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '90%', maxWidth: '450px', maxHeight: '80vh', overflow: 'hidden', fontFamily: FONT }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', fontFamily: FONT }}>⚙️ Gérer le personnel et sites</h2>
          <button onClick={onClose} style={{ border: 'none', background: '#fee2e2', color: '#dc2626', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>

        <div style={{ padding: '10px 16px', overflowY: 'auto', maxHeight: 'calc(80vh - 100px)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
            {[
              { key: 'guards', label: '👤 Agents' },
              { key: 'sites', label: '🏢 Sites' },
              { key: 'supervisors', label: '👨‍💼 Superviseurs' }
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1, padding: '6px', fontSize: '10px', fontFamily: FONT, fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', border: tab === t.key ? '2px solid #2563eb' : '1px solid #d1d5db',
                  background: tab === t.key ? '#eff6ff' : 'white', color: tab === t.key ? '#2563eb' : '#6b7280'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'guards' && renderList(localGuards, setLocalGuards, newGuard, setNewGuard, "Nom de l'agent...")}
          {tab === 'sites' && renderList(localSites, setLocalSites, newSite, setNewSite, "Nom du site...")}
          {tab === 'supervisors' && renderList(localSupervisors, setLocalSupervisors, newSupervisor, setNewSupervisor, "Nom du superviseur...")}
        </div>

        <div style={{ padding: '10px 16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          <button onClick={onClose} style={{ border: '1px solid #d1d5db', background: 'white', color: '#6b7280', borderRadius: '4px', padding: '5px 12px', fontSize: '10px', cursor: 'pointer', fontFamily: FONT }}>Annuler</button>
          <button onClick={handleSave} style={{ border: 'none', background: '#2563eb', color: 'white', borderRadius: '4px', padding: '5px 12px', fontSize: '10px', cursor: 'pointer', fontFamily: FONT, fontWeight: 'bold' }}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
