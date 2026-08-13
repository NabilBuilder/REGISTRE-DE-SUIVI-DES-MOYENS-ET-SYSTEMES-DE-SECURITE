import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { LOGO_BASE64, STAMP_BASE64 } from './config';

const FONT = "'Times New Roman', Georgia, serif";

const ROWS = [
  {
    id: 1,
    label: `<strong style="font-size:10px;">Vidéosurveillance :</strong><br/>
<span style="font-size:9px;">• Visualisation des caméras en direct<br/>
• Enregistrement des caméras sur surveillance<br/>
• Vérification des champs de vision des caméras<br/>
• Vérification de la date et l'heure du poste avec celle du logiciel</span>`
  },
  {
    id: 2,
    label: `<span style="font-size:9px;">• Vérification de la remontée des alarmes de détection intrusion</span>`
  },
  {
    id: 3,
    label: `<strong style="font-size:10px;">Système de sécurité incendie :</strong><br/>
<span style="font-size:9px;">• Vérification visuelle de l'état de la Centrale de Détection :<br/>
&nbsp;&nbsp;☐ Le voyant vert "Sous tension" est allumé<br/>
&nbsp;&nbsp;☐ Aucune affichage ou message n'est visualisé (défaut, dérangement, alarme, ...)<br/>
&nbsp;&nbsp;☐ Le clavier est verrouillé</span>`
  },
  {
    id: 4,
    label: `<strong style="font-size:10px;">Extinction automatique des cuisines et chaudière :</strong><br/>
<span style="font-size:9px;">• Vérification de la pression des réservoirs :<br/>
Vérification de la pression des réservoirs de gaz affichée sur le manomètre (aiguille placée au niveau de la zone verte)<br/>
• Vérification visuelle de l'état de l'installation (diffuseurs, tuyauterie, câble de détection, déclencheurs manuels ...)</span>`
  },
  {
    id: 5,
    label: `<strong style="font-size:10px;">Ronde :</strong> <span style="font-size:9px;">• Vérification du bon fonctionnement du système</span>`
  },
  {
    id: 6,
    label: `<strong style="font-size:10px;">Moyens de communication radiophonique :</strong><br/>
<span style="font-size:9px;">• Qualité de la transmission<br/>
• Alimentation des chargeurs<br/>
• Batterie</span>`
  },
  {
    id: 7,
    label: `<strong style="font-size:10px;">Vérification de :</strong><br/>
<span style="font-size:9px;">• La réalisation des vérifications quotidiennes par agents de sécurité et l'inscription au niveau registre de suivi des moyens et systèmes de sécurité<br/>
• La remontée exhaustive des informations, anomalies, dysfonctionnement,</span>`
  }
];

function fmtDate(d) {
  if (!d) return '';
  const p = d.split('-');
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
}

function fmtShortDate(d) {
  if (!d) return '';
  const p = d.split('-');
  return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : d;
}

function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  return `${h}H${m || '00'}`;
}

export async function generateRegistrePDF(data) {
  const site = data?.siteName || '';
  const supervisor = data?.supervisorName || '';
  const date = fmtDate(data?.docDate);
  const docRef = data?.docRef || '';
  const weekStart = fmtDate(data?.weekStart);
  const weekEnd = fmtDate(data?.weekEnd);
  const rows = data?.rows || [];
  const controls = data?.footer?.controls || [];
  const absences = data?.footer?.absences || [];

  /* ── Verification rows ── */
  let rowsHTML = '';
  for (let i = 0; i < 7; i++) {
    const r = rows[i] || {};
    const status = r.status || 'RAS';
    const comment = r.comment || '';
    rowsHTML += `
      <tr>
        <td style="border:1.5px solid black; padding:5px 6px; width:35%; font-size:9px; vertical-align:top; line-height:1.4; font-family:${FONT};">${ROWS[i].label}</td>
        <td style="border:1.5px solid black; padding:5px 6px; width:20%; text-align:center; vertical-align:middle; font-weight:bold; font-size:10px; background:white; color:black; font-family:${FONT};">${status}</td>
        <td style="border:1.5px solid black; padding:5px 6px; width:45%; font-size:10px; vertical-align:top; font-family:${FONT};">${comment}</td>
      </tr>`;
  }

  /* ── Controls ── */
  let controlsHTML = '';
  for (const c of controls) {
    if (c.date && c.time) {
      controlsHTML += `<div style="margin-bottom:2px; font-size:10px; font-family:${FONT};">• ${fmtDate(c.date)} à ${fmtTime(c.time)}</div>`;
    }
  }

  /* ── Absences (compact: date first, all inline) ── */
  let absencesHTML = '';
  for (let idx = 0; idx < absences.length; idx++) {
    const abs = absences[idx];
    if (!abs.absentAgent) continue;
    const dShort = abs.absentDate ? fmtDate(abs.absentDate) : '';
    const reps = (abs.replacements || []).map(r => r.agent).filter(Boolean).join(', ');
    absencesHTML += `<div style="margin-bottom:2px; ${idx < absences.length - 1 ? 'padding-bottom:3px; border-bottom:1px solid #ccc;' : ''} font-size:9px; font-family:${FONT};">
      <span style="font-weight:bold;">${dShort}</span>
      <span style="font-weight:bold;">Absent:</span>
      <span style="color:#dc2626; font-weight:bold;">${abs.absentAgent}</span>
      <span>→ Rempl.:</span>
      <span style="color:#2563eb; font-weight:bold;">${reps || '—'}</span>
    </div>`;
  }

  /* ── Build off-screen container ── */
  const printDiv = document.createElement('div');
  printDiv.style.cssText = `position:absolute; left:-9999px; top:0; width:794px; background:white; font-family:${FONT};`;

  printDiv.innerHTML = `
    <div style="padding:16px; width:762px;">

      <!-- ═══════════ HEADER TABLE — 3 columns 35%|20%|45% ═══════════ -->
      <table style="width:100%; border-collapse:collapse; border:1.5px solid black; table-layout:fixed; margin-bottom:0;">
        <colgroup>
          <col style="width:35%;" />
          <col style="width:20%;" />
          <col style="width:45%;" />
        </colgroup>
        <tbody>

          <!-- Row 1: Logo | Restreint | DATE -->
          <tr>
            <td style="border:1.5px solid black; padding:6px 8px; vertical-align:middle; font-family:${FONT};">
              <img src="${LOGO_BASE64}" style="height:39px; width:auto; display:block;" />
            </td>
            <td style="border:1.5px solid black; padding:6px 8px; text-align:center; vertical-align:middle; font-family:${FONT};">
              <span style="color:#c41e3a; font-weight:bold; font-size:11px;">Restreint</span>
            </td>
            <td style="border:1.5px solid black; padding:6px 8px; text-align:right; vertical-align:middle; font-family:${FONT};">
              <span style="font-weight:bold; font-size:11px;">DATE: ${date}</span>
            </td>
          </tr>

          <!-- Row 2: Title — colspan=3 -->
          <tr>
            <td colSpan="3" style="border:1.5px solid black; padding:8px; text-align:center; font-family:${FONT};">
              <span style="font-weight:bold; font-size:13px;">REGISTRE DE SUIVI DES MOYENS ET SYSTEMES DE SECURITE</span>
            </td>
          </tr>

          <!-- Row 3: Site | Réf | SUPERVISEUR (centered) -->
          <tr>
            <td style="border:1.5px solid black; padding:6px 8px; font-family:${FONT};">
              <span style="font-weight:bold; font-size:11px;">Site : ${site}</span>
            </td>
            <td style="border:1.5px solid black; padding:6px 8px; text-align:center; font-family:${FONT};">
              <span style="font-weight:bold; font-size:11px;">Réf : ${docRef}</span>
            </td>
            <td style="border:1.5px solid black; padding:6px 8px; text-align:center; font-family:${FONT};">
              <span style="font-weight:bold; font-size:11px;">SUPERVISEUR : ${supervisor}</span>
            </td>
          </tr>

          <!-- Row 4: Periode — colspan=3 (grey background) -->
          <tr>
            <td colSpan="3" style="border:1.5px solid black; padding:4px 8px; text-align:center; background:#f3f4f6; font-family:${FONT};">
              <span style="font-weight:bold; font-size:11px; color:#374151;">═══ Periode ═══ DU ${weekStart} AU ${weekEnd} ════════════</span>
            </td>
          </tr>

        </tbody>
      </table>

      <!-- ═══════════ VERIFICATION TABLE ═══════════ -->
      <table style="width:100%; border-collapse:collapse; border:1.5px solid black; table-layout:fixed; margin-top:0;">
        <thead>
          <tr>
            <th style="border:1.5px solid black; padding:5px 6px; width:35%; font-size:10px; font-weight:bold; text-align:center; background:white; font-family:${FONT};">Vérifications</th>
            <th style="border:1.5px solid black; padding:5px 6px; width:20%; font-size:10px; font-weight:bold; text-align:center; background:white; font-family:${FONT};">Etat</th>
            <th style="border:1.5px solid black; padding:5px 6px; width:45%; font-size:10px; font-weight:bold; text-align:center; background:white; font-family:${FONT};">Commentaire</th>
          </tr>
        </thead>
        <tbody>${rowsHTML}</tbody>
      </table>

      <!-- ═══════════ FOOTER TABLE — 2 columns 35%|65% ═══════════ -->
      <table style="width:100%; border-collapse:collapse; border:1.5px solid black; border-top:none; table-layout:fixed;">
        <colgroup>
          <col style="width:35%;" />
          <col style="width:65%;" />
        </colgroup>
        <tbody>

          <!-- Row 1: Stamp | Contrôle label -->
          <tr>
            <td rowSpan="4" style="border:1.5px solid black; padding:6px 8px; text-align:center; vertical-align:middle; height:200px; font-family:${FONT};">
              <img src="${STAMP_BASE64}" style="width:140px; height:auto; mix-blend-mode:multiply;" />
            </td>
            <td style="border:1.5px solid black; padding:6px 8px; font-weight:bold; font-size:10px; font-family:${FONT};">
              Contrôle sur site effectué:
            </td>
          </tr>

          <!-- Row 2: Controls -->
          <tr>
            <td style="border:1.5px solid black; padding:6px 8px; font-family:${FONT};">
              ${controlsHTML || '<div style="font-size:10px;">—</div>'}
            </td>
          </tr>

          <!-- Row 3: Section title -->
          <tr>
            <td style="border:1.5px solid black; padding:6px 8px; font-weight:bold; text-align:center; font-size:10px; font-family:${FONT};">
              Suivi des Absences et Remplacements
            </td>
          </tr>

          <!-- Row 4: Absences -->
          <tr>
            <td style="border:1.5px solid black; padding:6px 8px; font-family:${FONT};">
              ${absencesHTML || '<div style="font-size:10px;">—</div>'}
            </td>
          </tr>

        </tbody>
      </table>

    </div>
  `;

  document.body.appendChild(printDiv);

  const canvas = await html2canvas(printDiv, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' });
  document.body.removeChild(printDiv);

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  const dateStr = fmtShortDate(data?.docDate);
  const filename = `Registre_de_Securite_${dateStr}.pdf`;
  pdf.save(filename);
  return filename;
}

export async function generateRegistrePDFBlob(data) {
  const site = data?.siteName || '';
  const supervisor = data?.supervisorName || '';
  const date = fmtDate(data?.docDate);
  const docRef = data?.docRef || '';
  const weekStart = fmtDate(data?.weekStart);
  const weekEnd = fmtDate(data?.weekEnd);
  const rows = data?.rows || [];
  const controls = data?.footer?.controls || [];
  const absences = data?.footer?.absences || [];

  let rowsHTML = '';
  for (let i = 0; i < 7; i++) {
    const r = rows[i] || {};
    const status = r.status || 'RAS';
    const comment = r.comment || '';
    rowsHTML += `
      <tr>
        <td style="border:1.5px solid black; padding:5px 6px; width:35%; font-size:9px; vertical-align:top; line-height:1.4; font-family:${FONT};">${ROWS[i].label}</td>
        <td style="border:1.5px solid black; padding:5px 6px; width:20%; text-align:center; vertical-align:middle; font-weight:bold; font-size:10px; background:white; color:black; font-family:${FONT};">${status}</td>
        <td style="border:1.5px solid black; padding:5px 6px; width:45%; font-size:10px; vertical-align:top; font-family:${FONT};">${comment}</td>
      </tr>`;
  }

  let controlsHTML = '';
  for (const c of controls) {
    if (c.date && c.time) {
      controlsHTML += `<div style="margin-bottom:2px; font-size:10px; font-family:${FONT};">• ${fmtDate(c.date)} à ${fmtTime(c.time)}</div>`;
    }
  }

  let absencesHTML = '';
  for (let idx = 0; idx < absences.length; idx++) {
    const abs = absences[idx];
    if (!abs.absentAgent) continue;
    const dShort = abs.absentDate ? fmtDate(abs.absentDate) : '';
    const reps = (abs.replacements || []).map(r => r.agent).filter(Boolean).join(', ');
    absencesHTML += `<div style="margin-bottom:2px; ${idx < absences.length - 1 ? 'padding-bottom:3px; border-bottom:1px solid #ccc;' : ''} font-size:9px; font-family:${FONT};">
      <span style="font-weight:bold;">${dShort}</span>
      <span style="font-weight:bold;">Absent:</span>
      <span style="color:#dc2626; font-weight:bold;">${abs.absentAgent}</span>
      <span>→ Rempl.:</span>
      <span style="color:#2563eb; font-weight:bold;">${reps || '—'}</span>
    </div>`;
  }

  const printDiv = document.createElement('div');
  printDiv.style.cssText = `position:absolute; left:-9999px; top:0; width:794px; background:white; font-family:${FONT};`;

  printDiv.innerHTML = `
    <div style="padding:16px; width:762px;">
      <table style="width:100%; border-collapse:collapse; border:1.5px solid black; table-layout:fixed; margin-bottom:0;">
        <colgroup><col style="width:35%;" /><col style="width:20%;" /><col style="width:45%;" /></colgroup>
        <tbody>
          <tr>
            <td style="border:1.5px solid black; padding:6px 8px; vertical-align:middle; font-family:${FONT};"><img src="${LOGO_BASE64}" style="height:39px; width:auto; display:block;" /></td>
            <td style="border:1.5px solid black; padding:6px 8px; text-align:center; vertical-align:middle; font-family:${FONT};"><span style="color:#c41e3a; font-weight:bold; font-size:11px;">Restreint</span></td>
            <td style="border:1.5px solid black; padding:6px 8px; text-align:right; vertical-align:middle; font-family:${FONT};"><span style="font-weight:bold; font-size:11px;">DATE: ${date}</span></td>
          </tr>
          <tr><td colSpan="3" style="border:1.5px solid black; padding:8px; text-align:center; font-family:${FONT};"><span style="font-weight:bold; font-size:13px;">REGISTRE DE SUIVI DES MOYENS ET SYSTEMES DE SECURITE</span></td></tr>
          <tr>
            <td style="border:1.5px solid black; padding:6px 8px; font-family:${FONT};"><span style="font-weight:bold; font-size:11px;">Site : ${site}</span></td>
            <td style="border:1.5px solid black; padding:6px 8px; text-align:center; font-family:${FONT};"><span style="font-weight:bold; font-size:11px;">Réf : ${docRef}</span></td>
            <td style="border:1.5px solid black; padding:6px 8px; text-align:center; font-family:${FONT};"><span style="font-weight:bold; font-size:11px;">SUPERVISEUR : ${supervisor}</span></td>
          </tr>
          <tr><td colSpan="3" style="border:1.5px solid black; padding:4px 8px; text-align:center; background:#f3f4f6; font-family:${FONT};"><span style="font-weight:bold; font-size:11px; color:#374151;">═══ Periode ═══ DU ${weekStart} AU ${weekEnd} ════════════</span></td></tr>
        </tbody>
      </table>
      <table style="width:100%; border-collapse:collapse; border:1.5px solid black; table-layout:fixed; margin-top:0;">
        <thead><tr>
          <th style="border:1.5px solid black; padding:5px 6px; width:35%; font-size:10px; font-weight:bold; text-align:center; background:white; font-family:${FONT};">Vérifications</th>
          <th style="border:1.5px solid black; padding:5px 6px; width:20%; font-size:10px; font-weight:bold; text-align:center; background:white; font-family:${FONT};">Etat</th>
          <th style="border:1.5px solid black; padding:5px 6px; width:45%; font-size:10px; font-weight:bold; text-align:center; background:white; font-family:${FONT};">Commentaire</th>
        </tr></thead>
        <tbody>${rowsHTML}</tbody>
      </table>
      <table style="width:100%; border-collapse:collapse; border:1.5px solid black; border-top:none; table-layout:fixed;">
        <colgroup><col style="width:35%;" /><col style="width:65%;" /></colgroup>
        <tbody>
          <tr>
            <td rowSpan="4" style="border:1.5px solid black; padding:6px 8px; text-align:center; vertical-align:middle; height:200px; font-family:${FONT};"><img src="${STAMP_BASE64}" style="width:140px; height:auto; mix-blend-mode:multiply;" /></td>
            <td style="border:1.5px solid black; padding:6px 8px; font-weight:bold; font-size:10px; font-family:${FONT};">Contrôle sur site effectué:</td>
          </tr>
          <tr><td style="border:1.5px solid black; padding:6px 8px; font-family:${FONT};">${controlsHTML || '<div style="font-size:10px;">—</div>'}</td></tr>
          <tr><td style="border:1.5px solid black; padding:6px 8px; font-weight:bold; text-align:center; font-size:10px; font-family:${FONT};">Suivi des Absences et Remplacements</td></tr>
          <tr><td style="border:1.5px solid black; padding:6px 8px; font-family:${FONT};">${absencesHTML || '<div style="font-size:10px;">—</div>'}</td></tr>
        </tbody>
      </table>
    </div>
  `;

  document.body.appendChild(printDiv);
  const canvas = await html2canvas(printDiv, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' });
  document.body.removeChild(printDiv);

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  return pdf.output('blob');
}
