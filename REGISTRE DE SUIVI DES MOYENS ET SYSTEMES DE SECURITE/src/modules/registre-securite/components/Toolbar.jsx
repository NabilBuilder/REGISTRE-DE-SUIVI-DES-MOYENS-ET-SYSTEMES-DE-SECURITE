import React from 'react';
import Button from '@components/ui/Button';
import useInstallPrompt from '@hooks/useInstallPrompt';

export default function Toolbar({
  onSendEmail,
  onSendWhatsApp,
  onShowPreview,
  onOpenImport,
  onOpenArchives,
  onOpenSettings,
  onOpenBackup,
  onClearAll,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) {
  const { isInstallable, promptInstall } = useInstallPrompt();

  return (
    <div className="no-print bg-gradient-to-r from-gardnet-800 to-gardnet-600 text-white p-2 rounded-lg mb-3 sticky top-12 z-40 shadow-lg">
      <div className="max-w-6xl mx-auto">
        {/* Desktop */}
        <div className="hidden md:flex flex-wrap items-center gap-1.5">
          <Button variant="primary" onClick={onSendEmail}>📧 Email</Button>
          <Button variant="success" onClick={onSendWhatsApp}>💬 WhatsApp</Button>
          <Button variant="info" onClick={onShowPreview}>🖨️ Aperçu</Button>
          <Button variant="secondary" onClick={onOpenImport}>📥 Importer</Button>
          <div className="w-px h-5 bg-white/30 mx-0.5" />
          <Button variant="secondary" onClick={onUndo} disabled={!canUndo} style={{ opacity: canUndo ? 1 : 0.4, padding: '6px 10px' }}>↩️</Button>
          <Button variant="secondary" onClick={onRedo} disabled={!canRedo} style={{ opacity: canRedo ? 1 : 0.4, padding: '6px 10px' }}>↪️</Button>
          <Button variant="danger" onClick={onClearAll} style={{ padding: '6px 10px' }}>🗑️</Button>
          <div className="w-px h-5 bg-white/30 mx-0.5" />
          <Button variant="secondary" onClick={onOpenArchives}>📁</Button>
          <Button variant="secondary" onClick={onOpenSettings}>⚙️</Button>
          <Button variant="secondary" onClick={onOpenBackup}>💾</Button>
          {isInstallable && <Button variant="primary" onClick={promptInstall} style={{ padding: '6px 10px' }}>📲</Button>}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex gap-1 overflow-x-auto pb-0.5">
          <Button variant="primary" size="sm" onClick={onSendEmail}>📧</Button>
          <Button variant="success" size="sm" onClick={onSendWhatsApp}>💬</Button>
          <Button variant="info" size="sm" onClick={onShowPreview}>🖨️</Button>
          <Button variant="secondary" size="sm" onClick={onOpenImport}>📥</Button>
          <div className="w-px h-5 bg-white/30 mx-0.5" />
          <Button variant="secondary" size="sm" onClick={onUndo} disabled={!canUndo} style={{ opacity: canUndo ? 1 : 0.4 }}>↩️</Button>
          <Button variant="secondary" size="sm" onClick={onRedo} disabled={!canRedo} style={{ opacity: canRedo ? 1 : 0.4 }}>↪️</Button>
          <Button variant="danger" size="sm" onClick={onClearAll}>🗑️</Button>
          <div className="w-px h-5 bg-white/30 mx-0.5" />
          <Button variant="secondary" size="sm" onClick={onOpenArchives}>📁</Button>
          <Button variant="secondary" size="sm" onClick={onOpenSettings}>⚙️</Button>
          <Button variant="secondary" size="sm" onClick={onOpenBackup}>💾</Button>
          {isInstallable && <Button variant="primary" size="sm" onClick={promptInstall}>📲</Button>}
        </div>
      </div>
    </div>
  );
}
