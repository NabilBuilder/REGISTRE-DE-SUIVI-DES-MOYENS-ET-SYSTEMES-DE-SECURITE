import React from 'react';
import { STAMP_BASE64 } from '@utils/config';

const FONT = "'Times New Roman', 'Noto Serif', Georgia, serif";

const td = {
  border: '1.5px solid black',
  padding: '4px 5px',
  fontSize: '10px',
  fontFamily: FONT,
  verticalAlign: 'top'
};

const inputStyle = {
  border: '1px solid #999',
  background: 'white',
  fontSize: '9px',
  fontFamily: FONT,
  padding: '1px 3px',
  borderRadius: '2px',
  outline: 'none',
  boxSizing: 'border-box'
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer'
};

function fmtDate(d) {
  if (!d) return '';
  const p = d.split('-');
  return p.length === 3 ? `${p[2]}/${p[1]}` : d;
}

function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  return `${h}H${m || '00'}`;
}

const FOOTER_MOBILE_STYLE = `
  @media (max-width: 480px) {
    .footer-table { font-size: 8px !important; }
    .footer-table td { padding: 2px 3px !important; font-size: 8px !important; }
    .footer-table input, .footer-table select { font-size: 8px !important; padding: 1px 2px !important; }
    .footer-table .stamp-img { width: 100px !important; }
    .footer-table .btn-add, .footer-table .btn-remove { font-size: 7px !important; padding: 0 3px !important; }
    .footer-table label { font-size: 7px !important; }
  }
`;

export default function FooterSection({
  data,
  addControl, removeControl, updateControl,
  addAbsence, removeAbsence, updateAbsence,
  guards = []
}) {
  const footer = data.footer || {};
  const controls = Array.isArray(footer.controls) ? footer.controls : [];
  const absences = Array.isArray(footer.absences) ? footer.absences : [];

  const handleAbsenceChange = (absId, value) => {
    updateAbsence(absId, 'absentAgent', value);
    if (!value) {
      updateAbsence(absId, 'absentDate', '');
      const abs = absences.find(a => a.id === absId);
      if (abs && Array.isArray(abs.replacements)) {
        updateAbsence(absId, 'replacements', abs.replacements.map(r => ({ ...r, date: '' })));
      }
    }
  };

  const handleAbsenceDateChange = (absId, dateValue) => {
    updateAbsence(absId, 'absentDate', dateValue);
    const abs = absences.find(a => a.id === absId);
    if (abs && Array.isArray(abs.replacements)) {
      updateAbsence(absId, 'replacements', abs.replacements.map(r => ({ ...r, date: dateValue })));
    }
  };

  return (
    <>
      <style>{FOOTER_MOBILE_STYLE}</style>
      <table
        className="footer-table"
        style={{
        width: '100%',
        borderCollapse: 'collapse',
        border: '1.5px solid black',
        tableLayout: 'fixed'
      }}
    >
      <colgroup>
        <col style={{ width: '35%' }} />
        <col style={{ width: '65%' }} />
      </colgroup>
      <tbody>

        {/* ===== ROW 1: Stamp + Contrôle label ===== */}
        <tr>
          <td
            rowSpan={4}
            style={{
              ...td,
              textAlign: 'center',
              verticalAlign: 'middle',
              height: '200px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <img
                src={STAMP_BASE64}
                alt="Cachet GARDNET"
                className="stamp-img"
                style={{ width: '140px', height: 'auto', mixBlendMode: 'multiply' }}
              />
            </div>
          </td>
          <td style={{ ...td, fontWeight: 'bold', fontSize: '10px' }}>
            Contrôle sur site effectué:
          </td>
        </tr>

        {/* ===== ROW 2: Controls ===== */}
        <tr>
          <td style={td}>
            {controls.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: '3px', alignItems: 'center', marginBottom: '3px' }}>
                <span style={{ fontSize: '10px', flexShrink: 0 }}>•</span>
                <input
                  type="date"
                  value={c.date || ''}
                  onChange={e => updateControl(c.id, 'date', e.target.value)}
                  style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                />
                <input
                  type="time"
                  value={c.time || ''}
                  onChange={e => updateControl(c.id, 'time', e.target.value)}
                  style={{ ...inputStyle, width: '60px', flex: 'none' }}
                />
                {controls.length > 2 && (
                  <button
                    className="btn-remove"
                    onClick={() => removeControl(c.id)}
                    style={{ border: 'none', background: '#fee2e2', color: '#dc2626', borderRadius: '3px', padding: '0 4px', fontSize: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: FONT }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {controls.length < 4 && (
              <button
                className="btn-add"
                onClick={addControl}
                style={{ border: '1px solid #2563eb', background: '#eff6ff', color: '#2563eb', borderRadius: '3px', padding: '1px 6px', fontSize: '8px', cursor: 'pointer', fontFamily: FONT, marginTop: '2px' }}
              >
                + Ajouter
              </button>
            )}
          </td>
        </tr>

        {/* ===== ROW 3: Section title ===== */}
        <tr>
          <td style={{ ...td, fontWeight: 'bold', textAlign: 'center', fontSize: '10px' }}>
            Suivi des Absences et Remplacements
          </td>
        </tr>

        {/* ===== ROW 4: Absences ===== */}
        <tr>
          <td style={td}>
            {absences.map((abs, idx) => {
              const reps = Array.isArray(abs.replacements) ? abs.replacements : [];
              const hasAgent = !!(abs.absentAgent && abs.absentAgent.trim());
              const availableGuards = guards.filter(g => g !== abs.absentAgent);
              return (
                <div
                  key={abs.id}
                  style={{
                    marginBottom: idx < absences.length - 1 ? '4px' : 0,
                    paddingBottom: idx < absences.length - 1 ? '4px' : 0,
                    borderBottom: idx < absences.length - 1 ? '1px solid #ccc' : 'none'
                  }}
                >
                  {/* Line 1: Date + Absent + Arrow + Remplacant — all inline */}
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'nowrap' }}>
                    <input
                      type="date"
                      value={hasAgent ? (abs.absentDate || '') : ''}
                      disabled={!hasAgent}
                      onChange={e => handleAbsenceDateChange(abs.id, e.target.value)}
                      style={{
                        ...inputStyle,
                        width: '105px',
                        flexShrink: 0,
                        fontSize: '9px',
                        opacity: hasAgent ? 1 : 0.5,
                        cursor: hasAgent ? 'pointer' : 'not-allowed'
                      }}
                    />
                    <span style={{ fontSize: '9px', fontWeight: 'bold', flexShrink: 0 }}>Absent:</span>
                    <select
                      value={abs.absentAgent || ''}
                      onChange={e => handleAbsenceChange(abs.id, e.target.value)}
                      style={{ ...selectStyle, flex: 2, minWidth: 0, fontSize: '9px' }}
                    >
                      <option value="">-- Sélectionner --</option>
                      {guards.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <span style={{ fontSize: '9px', flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: '9px', fontWeight: 'bold', flexShrink: 0 }}>Rempl.:</span>
                    <select
                      value={reps[0]?.agent || ''}
                      onChange={e => {
                        if (reps.length > 0) {
                          updateAbsence(abs.id, 'replacements', reps.map((r, i) => i === 0 ? { ...r, agent: e.target.value, date: abs.absentDate || r.date } : r));
                        } else {
                          updateAbsence(abs.id, 'replacements', [{ id: Date.now(), agent: e.target.value, date: abs.absentDate || '' }]);
                        }
                      }}
                      style={{ ...selectStyle, flex: 2, minWidth: 0, fontSize: '9px' }}
                    >
                      <option value="">-- Sélectionner --</option>
                      {availableGuards.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    {absences.length > 1 && (
                      <button
                        className="btn-remove"
                        onClick={() => removeAbsence(abs.id)}
                        style={{ border: 'none', background: '#fee2e2', color: '#dc2626', borderRadius: '3px', padding: '0 4px', fontSize: '8px', cursor: 'pointer', fontFamily: FONT, flexShrink: 0 }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Additional replacements — if more than 1 */}
                  {reps.slice(1).map((rep, ri) => (
                    <div key={rep.id} style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '2px', paddingLeft: '110px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', flexShrink: 0 }}>R{ri + 2}:</span>
                      <select
                        value={rep.agent || ''}
                        onChange={e => {
                          updateAbsence(abs.id, 'replacements', reps.map((r, i) => i === ri + 1 ? { ...r, agent: e.target.value, date: abs.absentDate || r.date } : r));
                        }}
                        style={{ ...selectStyle, flex: 2, minWidth: 0, fontSize: '9px' }}
                      >
                        <option value="">-- Sélectionner --</option>
                        {availableGuards.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <button
                        className="btn-remove"
                        onClick={() => updateAbsence(abs.id, 'replacements', reps.filter((_, i) => i !== ri + 1))}
                        style={{ border: 'none', background: '#fee2e2', color: '#dc2626', borderRadius: '3px', padding: '0 3px', fontSize: '8px', cursor: 'pointer', fontFamily: FONT, flexShrink: 0 }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button
                    className="btn-add"
                    onClick={() => updateAbsence(abs.id, 'replacements', [...reps, { id: Date.now(), agent: '', date: abs.absentDate || '' }])}
                    style={{ border: '1px dashed #2563eb', background: 'transparent', color: '#2563eb', borderRadius: '3px', padding: '0 5px', fontSize: '8px', cursor: 'pointer', fontFamily: FONT, marginTop: '2px' }}
                  >
                    + Remplaçant
                  </button>
                </div>
              );
            })}
            <button
              className="btn-add"
              onClick={addAbsence}
              style={{ border: '1px solid #2563eb', background: '#eff6ff', color: '#2563eb', borderRadius: '3px', padding: '1px 6px', fontSize: '8px', cursor: 'pointer', fontFamily: FONT, marginTop: '3px' }}
            >
              + Absence
            </button>
          </td>
        </tr>

      </tbody>
      </table>
    </>
  );
}
