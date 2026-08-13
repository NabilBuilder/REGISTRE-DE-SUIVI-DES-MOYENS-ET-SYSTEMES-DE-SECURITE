import React, { useEffect, useState } from 'react';

const FONT = "'Times New Roman', 'Noto Serif', Georgia, serif";

export default function Toast({ message, type = 'success', duration = 4000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bg = type === 'success' ? '#dcfce7' : type === 'error' ? '#fee2e2' : '#eff6ff';
  const color = type === 'success' ? '#166534' : type === 'error' ? '#991b1b' : '#1e40af';
  const border = type === 'success' ? '#86efac' : type === 'error' ? '#fca5a5' : '#93c5fd';

  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
      background: bg, color: color, border: `1px solid ${border}`,
      borderRadius: '8px', padding: '10px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontFamily: FONT, fontSize: '11px', fontWeight: 'bold', maxWidth: '350px',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity 0.3s, transform 0.3s'
    }}>
      {message}
    </div>
  );
}
