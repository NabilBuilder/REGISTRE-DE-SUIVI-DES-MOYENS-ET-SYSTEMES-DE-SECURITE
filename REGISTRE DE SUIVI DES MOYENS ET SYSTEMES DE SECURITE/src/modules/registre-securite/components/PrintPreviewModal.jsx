import React, { useRef, useEffect, useState } from 'react';

const FONT = "'Times New Roman', 'Noto Serif', Georgia, serif";

export default function PrintPreviewModal({ onClose, onPrint }) {
  const previewRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const page = document.querySelector('.a4-page');
    if (!page || !previewRef.current) return;

    const selectValues = [];
    page.querySelectorAll('select').forEach((sel, i) => {
      selectValues[i] = sel.value || sel.getAttribute('data-value') || '';
    });

    const inputValues = [];
    page.querySelectorAll('input[type="date"], input[type="time"]').forEach((inp, i) => {
      inputValues[i] = inp.value || '';
    });

    const clone = page.cloneNode(true);

    clone.style.transform = 'none';
    clone.style.margin = '0';
    clone.style.boxShadow = 'none';
    clone.style.width = '210mm';
    clone.style.height = 'auto';
    clone.style.maxHeight = 'none';
    clone.style.overflow = 'visible';

    clone.querySelectorAll('.btn-add, .btn-remove, button[class*="dashed"]').forEach(el => {
      el.style.display = 'none';
    });

    let selIdx = 0;
    clone.querySelectorAll('select').forEach(sel => {
      const val = selectValues[selIdx] || '';
      selIdx++;
      const parent = sel.parentNode;
      const textNode = document.createElement('span');
      textNode.textContent = val;
      textNode.style.cssText = 'font-size:inherit;font-family:inherit;font-weight:bold;';
      sel.style.display = 'none';
      parent.insertBefore(textNode, sel.nextSibling);
    });

    let inpIdx = 0;
    clone.querySelectorAll('input[type="date"], input[type="time"]').forEach(inp => {
      const val = inputValues[inpIdx] || '';
      inpIdx++;
      if (val) {
        const parent = inp.parentNode;
        const textNode = document.createElement('span');
        const parts = val.split('-');
        textNode.textContent = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : val;
        textNode.style.cssText = 'font-size:inherit;font-family:inherit;font-weight:bold;';
        inp.style.display = 'none';
        parent.insertBefore(textNode, inp.nextSibling);
      }
    });

    let selIdx2 = 0;
    clone.querySelectorAll('td select').forEach(sel => {
      const val = (selectValues[selIdx2] || '').trim().toUpperCase();
      selIdx2++;
      if (val && val !== 'RAS' && val !== '') {
        const td = sel.closest('td');
        if (td) {
          td.style.backgroundColor = '#fee2e2';
          td.style.color = '#991b1b';
          td.style.fontWeight = 'bold';
          const row = td.closest('tr');
          if (row) {
            const commentTd = row.querySelector('td:last-child');
            if (commentTd && commentTd !== td) {
              commentTd.style.backgroundColor = '#fef3c7';
              commentTd.style.fontWeight = 'bold';
            }
          }
        }
      }
    });

    const allRows = clone.querySelectorAll('tr');
    let inAbsenceSection = false;
    allRows.forEach(row => {
      const text = row.textContent || '';
      if (text.includes('Suivi des Absences')) {
        inAbsenceSection = true;
        row.style.backgroundColor = '#dbeafe';
        return;
      }
      if (inAbsenceSection) {
        if (text.includes('Absent') || text.includes('Remplacant') || text.includes('Rempl.') || text.includes('Absence')) {
          row.style.backgroundColor = '#dbeafe';
        } else {
          inAbsenceSection = false;
        }
      }
    });

    clone.style.transform = `scale(${scale})`;
    clone.style.transformOrigin = 'top center';

    previewRef.current.innerHTML = '';
    previewRef.current.appendChild(clone);

    return () => {
      if (previewRef.current) previewRef.current.innerHTML = '';
    };
  }, [scale]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '95%', maxWidth: '900px', maxHeight: '95vh', overflow: 'hidden', fontFamily: FONT, display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', fontFamily: FONT }}>🖨️ Aperçu avant impression</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontSize: '10px', color: '#6b7280' }}>Zoom:</label>
            <input
              type="range"
              min="0.3"
              max="1.2"
              step="0.05"
              value={scale}
              onChange={e => setScale(parseFloat(e.target.value))}
              style={{ width: '100px' }}
            />
            <span style={{ fontSize: '10px', color: '#6b7280', minWidth: '35px' }}>{Math.round(scale * 100)}%</span>
            <button onClick={onClose} style={{ border: 'none', background: '#fee2e2', color: '#dc2626', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '16px', background: '#e5e7eb', display: 'flex', justifyContent: 'center' }}>
          <div
            ref={previewRef}
            style={{
              background: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              width: '210mm',
              minHeight: '297mm',
              transformOrigin: 'top center'
            }}
          />
        </div>

        <div style={{ padding: '10px 16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '6px', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={onClose} style={{ border: '1px solid #d1d5db', background: 'white', color: '#6b7280', borderRadius: '4px', padding: '8px 16px', fontSize: '11px', cursor: 'pointer', fontFamily: FONT }}>Annuler</button>
          <button onClick={() => { onPrint(); onClose(); }} style={{ border: 'none', background: '#2563eb', color: 'white', borderRadius: '4px', padding: '8px 16px', fontSize: '11px', cursor: 'pointer', fontFamily: FONT, fontWeight: 'bold' }}>🖨️ Imprimer</button>
        </div>
      </div>
    </div>
  );
}
