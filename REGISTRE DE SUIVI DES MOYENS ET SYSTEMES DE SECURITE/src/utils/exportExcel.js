import * as XLSX from 'xlsx';

const ROW_CONTENT = [
  "Vidéosurveillance : Visualisation des caméras en direct, Enregistrement des caméras sur surveillance, Vérification des champs de vision des caméras, Vérification de la date et l'heure du poste avec celle du logiciel",
  "Vérification de la remontée des alarmes de détection intrusion",
  "Système de sécurité incendie : Vérification visuelle de l'état de la Centrale de Détection (voyant vert, messages, clavier verrouillé)",
  "Extinction automatique des cuisines et chaudière : Vérification de la pression des réservoirs, Vérification visuelle de l'état de l'installation",
  "Ronde : Vérification du bon fonctionnement du système",
  "Moyens de communication radiophonique : Qualité de la transmission, Alimentation des chargeurs, Batterie",
  "Vérification de : réalisation des vérifications quotidiennes par agents, remontée exhaustive des informations"
];

function fmtCtrl(date, time) {
  if (!date && !time) return '';
  let r = '';
  if (date) {
    const p = date.split('-');
    r = p.length === 3 ? `${p[2]}/${p[1]}` : date;
  }
  if (time) {
    const [h, m] = time.split(':');
    r += ` à ${h}H${m || '00'}`;
  }
  return r;
}

function fmtDate(d) {
  if (!d) return '';
  const p = d.split('-');
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0].slice(-2)}` : d;
}

function setBorder(ws, range) {
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'];
}

export function exportToExcel(data, filename) {
  if (!data) return;

  const wb = XLSX.utils.book_new();
  const footer = data.footer || {};
  const controls = Array.isArray(footer.controls) ? footer.controls : [];
  const absences = Array.isArray(footer.absences) ? footer.absences : [];

  const rows = data.rows || [];
  const rowsData = ROW_CONTENT.map((content, i) => {
    const row = rows[i] || { status: 'RAS', comment: '' };
    return [content, row.status || 'RAS', row.comment || ''];
  });

  const wsData = [
    ['REGISTRE DE SUIVI DES MOYENS ET SYSTEMES DE SECURITE'],
    [],
    ['Site:', data.siteName || '', 'Superviseur:', data.supervisorName || ''],
    ['Période:', `DU ${data.weekStart || ''} AU ${data.weekEnd || ''}`, '', ''],
    ['Date:', data.docDate || '', 'Restreint', ''],
    [],
    ['Vérifications', 'Etat de fonctionnement', 'Commentaire'],
    ...rowsData,
    [],
    ['CONTRÔLE SUR SITE EFFECTUÉ', '', ''],
    ...controls.map((c, i) => {
      const txt = fmtCtrl(c.date, c.time);
      return [`  ${i + 1}. ${txt || '—'}`, '', ''];
    }),
    [],
    ['PLANNING', 'Respect sans changement / avec changement', ''],
    [],
    ['NOM ET PRÉNOM DE L\'AGENT (ABSENCES)', '', ''],
  ];

  absences.forEach(abs => {
    const reps = Array.isArray(abs.replacements) ? abs.replacements : [];
    const repNames = reps.filter(r => r.agent).map(r => r.agent);
    wsData.push([
      `  Absent: ${abs.absentAgent || '—'} (${fmtDate(abs.absentDate) || '—'})`,
      repNames.length > 0 ? `Remplaçants: ${repNames.join(', ')}` : 'Remplaçant: —',
      ''
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 55 },
    { wch: 45 },
    { wch: 30 }
  ];

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    { s: { r: 6, c: 0 }, e: { r: 6, c: 2 } },
    { s: { r: 9 + controls.length + 1, c: 0 }, e: { r: 9 + controls.length + 1, c: 2 } },
    { s: { r: 9 + controls.length + 3, c: 0 }, e: { r: 9 + controls.length + 3, c: 2 } },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Registre Sécurité');
  XLSX.writeFile(wb, filename || 'Registre_Securite.xlsx');
}
