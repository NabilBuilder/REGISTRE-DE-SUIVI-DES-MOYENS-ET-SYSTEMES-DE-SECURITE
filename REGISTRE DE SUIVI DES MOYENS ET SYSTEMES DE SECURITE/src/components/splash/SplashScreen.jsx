import React, { useState, useEffect } from 'react';
const BAM_LOGO = '/BAM.png';

const FONT = "'Times New Roman', 'Noto Serif', Georgia, serif";

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1000);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(() => setPhase(3), 3400);
    const t4 = setTimeout(() => onComplete(), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #0f172a 100%)',
      fontFamily: FONT, overflow: 'hidden'
    }}>

      {/* Animated background particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }} />
        ))}
      </div>

      {/* Glow ring behind logo */}
      <div style={{
        position: 'absolute',
        width: '260px', height: '260px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
        opacity: phase >= 1 ? 1 : 0,
        transition: 'opacity 0.8s ease'
      }} />

      {/* BAM Logo */}
      <div style={{
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? 'scale(1) translateY(0)' : 'scale(0.5) translateY(20px)',
        transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        marginBottom: '28px'
      }}>
        <img
          src={BAM_LOGO}
          alt="BAM"
          style={{
            height: '130px',
            width: 'auto',
            filter: 'drop-shadow(0 8px 32px rgba(59,130,246,0.3))',
          }}
        />
      </div>

      {/* Decorative line */}
      <div style={{
        width: phase >= 2 ? '120px' : '0px',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
        marginBottom: '24px',
        transition: 'width 0.8s ease'
      }} />

      {/* Welcome text */}
      <div style={{
        opacity: phase >= 2 ? 1 : 0,
        transform: phase >= 2 ? 'translateY(0)' : 'translateY(15px)',
        transition: 'all 0.7s ease 0.1s',
        textAlign: 'center'
      }}>
        <h2 style={{
          color: '#e2e8f0',
          fontSize: '22px',
          fontWeight: 'bold',
          marginBottom: '8px',
          letterSpacing: '2px'
        }}>
          Bienvenue
        </h2>
        <p style={{
          color: '#94a3b8',
          fontSize: '13px',
          lineHeight: '1.6',
          maxWidth: '340px',
          margin: '0 auto'
        }}>
          REGISTRE DE SUIVI DES MOYENS<br />ET SYSTEMES DE SECURITE
        </p>
      </div>

      {/* Developer credit */}
      <div style={{
        opacity: phase >= 3 ? 1 : 0,
        transform: phase >= 3 ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.6s ease',
        position: 'absolute',
        bottom: '40px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          marginBottom: '6px'
        }}>
          <div style={{ width: '20px', height: '1px', background: '#475569' }} />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <div style={{ width: '20px', height: '1px', background: '#475569' }} />
        </div>
        <p style={{
          color: '#64748b',
          fontSize: '11px',
          letterSpacing: '1px',
          fontFamily: FONT
        }}>
          Creation & Developpement
        </p>
        <p style={{
          color: '#94a3b8',
          fontSize: '13px',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          marginTop: '2px',
          fontFamily: FONT
        }}>
          Boukhoulkhal Nabil
        </p>
        <p style={{
          color: '#475569',
          fontSize: '10px',
          marginTop: '4px',
          fontFamily: FONT
        }}>
          GARDNET SERVICES
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
