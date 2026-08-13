import React, { useEffect } from 'react';

export default function Drawer({ isOpen, onClose, title, children, width = 'w-80' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <div
        className={`branding-overlay fixed inset-0 bg-black/50 z-40 ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <div className={`branding-drawer fixed top-0 right-0 h-full ${width} bg-white shadow-2xl z-50 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300`}>
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="font-bold text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
          {children}
        </div>
      </div>
    </>
  );
}
