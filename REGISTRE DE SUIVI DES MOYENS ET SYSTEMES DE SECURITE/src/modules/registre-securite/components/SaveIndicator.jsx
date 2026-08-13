import React from 'react';

export default function SaveIndicator({ hasChanges, lastSave }) {
  return (
    <div className="no-print fixed bottom-4 right-4 z-50">
      <div className={`px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 ${
        hasChanges
          ? 'bg-amber-500 text-white animate-pulse'
          : 'bg-green-500 text-white'
      }`}>
        {hasChanges ? (
          <span>⏳ Modifications non sauvegardées</span>
        ) : (
          <span>✓ Sauvegardé {lastSave ? `à ${new Date(lastSave).toLocaleTimeString('fr-FR')}` : ''}</span>
        )}
      </div>
    </div>
  );
}
