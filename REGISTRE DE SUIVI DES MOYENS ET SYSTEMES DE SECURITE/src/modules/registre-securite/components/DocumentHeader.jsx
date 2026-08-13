import React from 'react';
import { LOGO_BASE64 } from '@utils/config';
import { dateToInput, inputToDate, getDayName } from '@utils/dateUtils';

const FONT = "'Times New Roman', 'Noto Serif', Georgia, serif";

const cellStyle = {
  border: '1.5px solid black',
  padding: '6px 8px',
  fontSize: '11px',
  fontFamily: FONT
};

const inputStyle = {
  width: '100%',
  border: 'none',
  background: 'transparent',
  fontSize: '11px',
  fontFamily: FONT,
  fontWeight: 'bold',
  outline: 'none'
};

const navBtnStyle = {
  background: 'transparent',
  border: 'none',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
  padding: '0 6px',
  color: '#1f2937',
  fontFamily: FONT,
  lineHeight: '1',
  display: 'inline-block',
  verticalAlign: 'middle'
};

const monthLabelStyle = {
  fontWeight: 'bold',
  fontSize: '12px',
  color: '#c41e3a',
  margin: '0 6px',
  display: 'inline-block',
  verticalAlign: 'middle'
};

function formatWeekLabel(dateStr) {
  if (!dateStr) return '';
  const p = dateStr.split('/');
  if (p.length !== 3) return dateStr;
  return `${p[0]}/${p[1]}`;
}

export default function DocumentHeader({ data, updateField, sites = [], supervisors = [], goToWeek, goToMonth, monthLabel, currentWeekIndex, totalWeeks }) {
  const startDay = getDayName(data.weekStart);
  const endDay = getDayName(data.weekEnd);
  const startLabel = formatWeekLabel(data.weekStart);
  const endLabel = formatWeekLabel(data.weekEnd);
  const canGoPrevWeek = currentWeekIndex > 0;
  const canGoNextWeek = currentWeekIndex < totalWeeks - 1;

  return (
    <table
      className="w-full mb-0 header-table"
      style={{
        borderCollapse: 'collapse',
        border: '1.5px solid black',
        tableLayout: 'fixed'
      }}
    >
      <colgroup>
        <col style={{ width: '35%' }} />
        <col style={{ width: '20%' }} />
        <col style={{ width: '45%' }} />
      </colgroup>
      <tbody>
        {/* Row 1: Logo + Restreint + DATE */}
        <tr>
          <td style={{ ...cellStyle, verticalAlign: 'middle' }}>
            <img
              src={LOGO_BASE64}
              alt="GARDNET SERVICES"
              style={{
                height: '39px',
                width: 'auto',
                display: 'block'
              }}
            />
          </td>
          <td style={{ ...cellStyle, textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
            <button
              type="button"
              onClick={() => goToMonth(-1)}
              style={navBtnStyle}
              title="Mois précédent"
            >
              ◀
            </button>
            <span style={monthLabelStyle}>
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => goToMonth(1)}
              style={navBtnStyle}
              title="Mois suivant"
            >
              ▶
            </button>
          </td>
          <td style={{ ...cellStyle, textAlign: 'right', verticalAlign: 'middle' }}>
            <span style={{ fontWeight: 'bold', fontSize: '11px' }}>DATE:</span>
            <input
              type="date"
              value={dateToInput(data.docDate)}
              onChange={(e) => updateField('docDate', inputToDate(e.target.value))}
              style={{
                ...inputStyle,
                width: '110px',
                display: 'inline-block',
                marginLeft: '5px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            />
          </td>
        </tr>

        {/* Row 2: Title — spans all 3 columns */}
        <tr>
          <td
            colSpan={3}
            style={{
              ...cellStyle,
              textAlign: 'center',
              padding: '8px'
            }}
          >
            <h1 style={{
              fontWeight: 'bold',
              fontSize: '13px',
              margin: 0,
              fontFamily: FONT
            }}>
              REGISTRE DE SUIVI DES MOYENS ET SYSTEMES DE SECURITE
            </h1>
          </td>
        </tr>

        {/* Row 3: Site + Réf + SUPERVISEUR */}
        <tr>
          <td style={cellStyle}>
            <span style={{ fontWeight: 'bold', fontSize: '11px' }}>Site :</span>
            <input
              type="text"
              list="sites-list"
              value={data.siteName || ''}
              onChange={(e) => updateField('siteName', e.target.value)}
              style={{
                ...inputStyle,
                width: '150px',
                display: 'inline-block',
                marginLeft: '8px'
              }}
            />
            <datalist id="sites-list">
              {sites.map((s, i) => <option key={i} value={s} />)}
            </datalist>
          </td>
          <td style={{ ...cellStyle, textAlign: 'center' }}>
            <span style={{ fontWeight: 'bold', fontSize: '11px' }}>Réf :</span>
            <input
              type="text"
              value={data.docRef || ''}
              readOnly
              style={{
                ...inputStyle,
                width: '130px',
                display: 'inline-block',
                marginLeft: '5px',
                textAlign: 'left',
                color: '#555'
              }}
            />
          </td>
          <td style={{ ...cellStyle, textAlign: 'center' }}>
            <span style={{ fontWeight: 'bold', fontSize: '11px' }}>SUPERVISEUR :</span>
            <input
              type="text"
              list="supervisors-list"
              value={data.supervisorName || ''}
              onChange={(e) => updateField('supervisorName', e.target.value)}
              style={{
                ...inputStyle,
                width: '120px',
                display: 'inline-block',
                marginLeft: '5px',
                textAlign: 'center'
              }}
            />
            <datalist id="supervisors-list">
              {supervisors.map((s, i) => <option key={i} value={s} />)}
            </datalist>
          </td>
        </tr>

        {/* Row 4: Periode — Week Navigator */}
        <tr>
          <td
            colSpan={3}
            style={{
              ...cellStyle,
              textAlign: 'center',
              background: '#f3f4f6',
              padding: '4px 8px',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flexWrap: 'nowrap' }}>
              <span style={{ fontWeight: 'bold', fontSize: '11px', color: '#374151', flexShrink: 0 }}>
                ═══ Periode ═══
              </span>
              <button
                type="button"
                onClick={() => goToWeek(-1)}
                disabled={!canGoPrevWeek}
                style={{
                  ...navBtnStyle,
                  opacity: canGoPrevWeek ? 1 : 0.3,
                  cursor: canGoPrevWeek ? 'pointer' : 'not-allowed',
                  flexShrink: 0
                }}
                title="Semaine précédente"
              >
                ◀
              </button>
              <span style={{ fontWeight: 'bold', fontSize: '11px', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
                {startDay} {startLabel}
              </span>
              <span style={{ fontWeight: 'bold', fontSize: '11px', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>AU</span>
              <span style={{ fontWeight: 'bold', fontSize: '11px', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
                {endDay} {endLabel}
              </span>
              <button
                type="button"
                onClick={() => goToWeek(1)}
                disabled={!canGoNextWeek}
                style={{
                  ...navBtnStyle,
                  opacity: canGoNextWeek ? 1 : 0.3,
                  cursor: canGoNextWeek ? 'pointer' : 'not-allowed',
                  flexShrink: 0
                }}
                title="Semaine suivante"
              >
                ▶
              </button>
              <span style={{ fontWeight: 'bold', fontSize: '11px', color: '#374151', flexShrink: 0 }}>
                ════════════
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
