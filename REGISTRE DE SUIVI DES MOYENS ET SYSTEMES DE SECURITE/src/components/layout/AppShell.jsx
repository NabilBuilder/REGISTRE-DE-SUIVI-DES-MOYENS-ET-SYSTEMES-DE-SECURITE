import React from 'react';

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="no-print bg-gardnet-800 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-bold text-xs md:text-sm leading-tight">
                REGISTRE DE SUIVI DES MOYENS ET SYSTEMES DE SECURITE
              </h1>
            </div>
          </div>
          <div className="text-xs text-blue-200 hidden sm:block">
            v2.0.0
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-4" style={{ overflowX: 'clip' }}>
        {children}
      </main>
    </div>
  );
}
