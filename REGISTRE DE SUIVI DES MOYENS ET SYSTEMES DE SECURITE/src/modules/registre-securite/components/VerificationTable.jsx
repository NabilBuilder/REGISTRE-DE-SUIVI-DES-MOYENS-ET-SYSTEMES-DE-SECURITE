import React, { useState } from 'react';

const FONT = "'Times New Roman', 'Noto Serif', Georgia, serif";

const PRESETS = {
  1: ['Caméra HS', "Défaut d'enregistrement", 'Champ de vision obstrué', 'Autre...'],
  2: ['Alarme non remontée', 'Fausse alarme récurrente', 'Autre...'],
  3: ['Voyant Sous tension éteint', 'Centrale en défaut', 'Clavier bloqué', 'Autre...'],
  4: ['Pression hors zone verte', 'Déclencheur inaccessible', 'Autre...'],
  5: ['Patrouilleur non fonctionnel', 'Autre...'],
  6: ['Batterie radio HS', 'Problème de transmission', 'Autre...'],
  7: ['Registre non tenu à jour', 'Informations non remontées', 'Autre...']
};

const ROWS = [
  {
    id: 1,
    content: (
      <>
        <strong>Vidéosurveillance :</strong><br />
        • Visualisation des caméras en direct<br />
        • Enregistrement des caméras sur surveillance<br />
        • Vérification des champs de vision des caméras<br />
        • Vérification de la date et l'heure du poste avec celle du logiciel
      </>
    )
  },
  {
    id: 2,
    content: <>• Vérification de la remontée des alarmes de détection intrusion</>
  },
  {
    id: 3,
    content: (
      <>
        <strong>Système de sécurité incendie :</strong><br />
        • Vérification visuelle de l'état de la Centrale de Détection :<br />
        &nbsp;&nbsp;☐ Le voyant vert "Sous tension" est allumé<br />
        &nbsp;&nbsp;☐ Aucune affichage ou message n'est visualisé (défaut, dérangement, alarme, ...)<br />
        &nbsp;&nbsp;☐ Le clavier est verrouillé
      </>
    )
  },
  {
    id: 4,
    content: (
      <>
        <strong>Extinction automatique des cuisines et chaudière :</strong><br />
        • Vérification de la pression des réservoirs :<br />
        Vérification de la pression des réservoirs de gaz affichée sur le manomètre (aiguille placée au niveau de la zone verte)<br />
        • Vérification visuelle de l'état de l'installation (diffuseurs, tuyauterie, câble de détection, déclencheurs manuels ...)
      </>
    )
  },
  {
    id: 5,
    content: <><strong>Ronde :</strong> • Vérification du bon fonctionnement du système</>
  },
  {
    id: 6,
    content: (
      <>
        <strong>Moyens de communication radiophonique :</strong><br />
        • Qualité de la transmission<br />
        • Alimentation des chargeurs<br />
        • Batterie
      </>
    )
  },
  {
    id: 7,
    content: (
      <>
        <strong>Vérification de :</strong><br />
        • La réalisation des vérifications quotidiennes par agents de sécurité et l'inscription au niveau registre de suivi des moyens et systèmes de sécurité<br />
        • La remontée exhaustive des informations, anomalies, dysfonctionnement,
      </>
    )
  }
];

function CommentCell({ rowId, comment, onCommentChange, status }) {
  const [showTemplates, setShowTemplates] = useState(false);
  const presets = PRESETS[rowId] || [];
  const isEnPanne = status === 'En panne';

  const handleTemplateSelect = (value) => {
    if (value === 'Autre...') {
      onCommentChange(rowId, '');
    } else {
      onCommentChange(rowId, value);
    }
    setShowTemplates(false);
  };

  return (
    <td
      style={{
        border: '1.5px solid black',
        verticalAlign: 'middle',
        padding: '4px 5px',
        position: 'relative'
      }}
    >
      <input
        type="text"
        value={comment}
        onChange={(e) => onCommentChange(rowId, e.target.value)}
        placeholder={isEnPanne ? 'Sélectionner ou saisir...' : ''}
        style={{
          width: '100%',
          border: 'none',
          background: 'transparent',
          fontSize: '10px',
          fontFamily: FONT,
          outline: 'none'
        }}
      />

      {isEnPanne && presets.length > 0 && (
        <div style={{ marginTop: '2px' }}>
          <button
            className="tpl-btn"
            onClick={() => setShowTemplates(!showTemplates)}
            style={{
              border: '1px solid #d1d5db',
              background: '#f9fafb',
              color: '#6b7280',
              borderRadius: '3px',
              padding: '1px 5px',
              fontSize: '8px',
              cursor: 'pointer',
              fontFamily: FONT
            }}
          >
            {showTemplates ? '✕' : '▼ Templates'}
          </button>

          {showTemplates && (
            <div style={{
              position: 'absolute',
              zIndex: 50,
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: '3px',
              marginTop: '2px',
              left: '5px',
              right: '5px'
            }}>
              {presets.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleTemplateSelect(p)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    border: 'none',
                    background: 'transparent',
                    padding: '3px 5px',
                    fontSize: '9px',
                    fontFamily: FONT,
                    cursor: 'pointer',
                    borderRadius: '2px',
                    color: '#374151'
                  }}
                  onMouseEnter={e => e.target.style.background = '#eff6ff'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </td>
  );
}

const MOBILE_STYLE = `
  @media (max-width: 480px) {
    .verif-table col:nth-child(1) { width: 40% !important; }
    .verif-table col:nth-child(2) { width: 15% !important; }
    .verif-table col:nth-child(3) { width: 45% !important; }
    .verif-table td:nth-child(1) { font-size: 8px !important; padding: 2px 3px !important; line-height: 1.3 !important; }
    .verif-table th { font-size: 9px !important; padding: 3px 2px !important; }
    .verif-table td:nth-child(3) input { font-size: 8px !important; }
    .verif-table .tpl-btn { font-size: 7px !important; padding: 0 3px !important; }
  }
`;

export default function VerificationTable({ data, updateRowStatus, updateRowComment }) {
  const rows = data.rows || ROWS.map(r => ({ id: r.id, status: 'RAS', comment: '' }));
  const getRowData = (id) => rows.find(r => r.id === id) || { status: 'RAS', comment: '' };

  return (
    <>
      <style>{MOBILE_STYLE}</style>
      <table
        className="w-full verif-table"
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
      <thead>
        <tr>
          <th style={{
            border: '1.5px solid black',
            background: 'white',
            color: 'black',
            fontSize: '11px',
            padding: '5px 4px',
            fontFamily: FONT,
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            Vérifications
          </th>
          <th style={{
            border: '1.5px solid black',
            background: 'white',
            color: 'black',
            fontSize: '11px',
            padding: '5px 4px',
            fontFamily: FONT,
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            Etat
          </th>
          <th style={{
            border: '1.5px solid black',
            background: 'white',
            color: 'black',
            fontSize: '11px',
            padding: '5px 4px',
            fontFamily: FONT,
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            Commentaire
          </th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map((row) => {
          const rowData = getRowData(row.id);
          return (
            <tr key={row.id}>
              <td style={{
                border: '1.5px solid black',
                verticalAlign: 'top',
                padding: '5px 6px',
                fontSize: '10px',
                lineHeight: '1.4',
                fontFamily: FONT
              }}>
                {row.content}
              </td>
              <td style={{
                border: '1.5px solid black',
                textAlign: 'center',
                verticalAlign: 'middle',
                padding: '3px'
              }}>
                <select
                  className="print-select"
                  value={rowData.status === 'RAS' || rowData.status === 'En panne' ? rowData.status : 'RAS'}
                  onChange={(e) => {
                    updateRowStatus(row.id, e.target.value);
                    if (e.target.value === 'RAS') {
                      updateRowComment(row.id, '');
                    }
                  }}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    fontFamily: FONT,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="RAS">RAS</option>
                  <option value="En panne">En panne</option>
                </select>
              </td>
              <CommentCell
                rowId={row.id}
                comment={rowData.comment}
                onCommentChange={updateRowComment}
                status={rowData.status}
              />
            </tr>
          );
        })}
      </tbody>
    </table>
    </>
  );
}
