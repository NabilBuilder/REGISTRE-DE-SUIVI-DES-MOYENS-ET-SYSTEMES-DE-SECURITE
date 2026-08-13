import { generateRegistrePDF, generateRegistrePDFBlob } from './generatePDF';
import { CONFIG } from './config';

function fmtDate(d) {
  if (!d) return '';
  const p = d.split('-');
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0].slice(-2)}` : d;
}

function formatDateShort(d) {
  if (!d) return '';
  const p = d.split('-');
  return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : d;
}

function buildSubject(data) {
  const siteName = data.siteName || 'N/A';
  const period = `du ${fmtDate(data.weekStart)} au ${fmtDate(data.weekEnd)}`;
  const absences = (data.footer?.absences || []).filter(a => a.absentAgent && a.absentAgent.trim());
  const absInfo = absences.length > 0 ? ` — ${absences.length} absence(s)` : '';
  return `Registre de Sécurité - ${siteName} - Période ${period}${absInfo}`;
}

function buildEmailBody(data) {
  const siteName = data.siteName || 'N/A';
  const period = `du ${fmtDate(data.weekStart)} au ${fmtDate(data.weekEnd)}`;
  let body =
    `Bonjour,\n\n` +
    `Veuillez trouver ci-joint le registre de suivi des moyens et systèmes de sécurité.\n\n` +
    `Site: ${siteName}\n` +
    `Période: ${period}\n` +
    `Date: ${data.docDate || 'N/A'}\n`;

  const absences = (data.footer?.absences || []).filter(a => a.absentAgent && a.absentAgent.trim());
  if (absences.length > 0) {
    body += `\n📋 Absences (${absences.length}):\n`;
    for (const a of absences) {
      const date = fmtDate(a.absentDate);
      const reps = (a.replacements || []).map(r => r.agent).filter(Boolean).join(', ');
      body += `• ${date}: ${a.absentAgent}${reps ? ` → ${reps}` : ''}\n`;
    }
  }

  body += `\nLe fichier PDF du registre est joint à cet email.\n\nCordialement,`;
  return body;
}

function buildWhatsAppMessage(data) {
  const siteName = data.siteName || 'N/A';
  const period = `du ${fmtDate(data.weekStart)} au ${fmtDate(data.weekEnd)}`;
  let msg = `Bonjour, veuillez trouver ci-joint le registre de suivi des moyens et systèmes de sécurité.\n\nSite: ${siteName}\nPériode: ${period}`;

  const absences = (data.footer?.absences || []).filter(a => a.absentAgent && a.absentAgent.trim());
  if (absences.length > 0) {
    msg += `\n\n📋 Absences (${absences.length}):`;
    for (const a of absences) {
      const date = fmtDate(a.absentDate);
      const reps = (a.replacements || []).map(r => r.agent).filter(Boolean).join(', ');
      msg += `\n• ${date}: ${a.absentAgent}${reps ? ` → ${reps}` : ''}`;
    }
  }

  return msg;
}

export async function sendByWhatsApp(data) {
  const dateStr = formatDateShort(data.docDate);
  const filename = `Registre_de_Securite_${dateStr}.pdf`;

  try {
    const blob = await generateRegistrePDFBlob(data);
    const file = new File([blob], filename, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: filename,
        text: buildWhatsAppMessage(data)
      });
      return { success: true, filename, message: `Document partagé via WhatsApp.` };
    }

    await generateRegistrePDF(data);
    const msg = buildWhatsAppMessage(data);
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    return { success: true, filename, message: `PDF téléchargé (${filename}). Joignez-le à votre message WhatsApp.` };
  } catch (err) {
    if (err.name === 'AbortError') return { success: false, message: 'Partage annulé.' };
    console.error('WhatsApp share error:', err);
    try {
      await generateRegistrePDF(data);
      const msg = buildWhatsAppMessage(data);
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
      return { success: true, filename, message: `PDF téléchargé. Joignez-le à WhatsApp.` };
    } catch (e) {
      return { success: false, message: 'Erreur lors de la génération du PDF.' };
    }
  }
}

export async function sendByEmail(data) {
  const dateStr = formatDateShort(data.docDate);
  const filename = `Registre_de_Securite_${dateStr}.pdf`;

  try {
    await generateRegistrePDF(data);
  } catch (err) {
    console.error('PDF generation error:', err);
  }

  const subject = encodeURIComponent(buildSubject(data));
  const body = encodeURIComponent(buildEmailBody(data));
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONFIG.defaultEmail}&su=${subject}&body=${body}`;
  window.open(gmailUrl, '_blank');

  return { success: true, filename, message: `Document PDF téléchargé (${filename}). Veuillez l'joindre à votre message Gmail.` };
}
