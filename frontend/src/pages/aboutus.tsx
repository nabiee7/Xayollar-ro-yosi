import React, { useState, useEffect, useRef } from 'react';

// ─── GOOGLE FONTS ────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Nunito:wght@300;400;500;600;700&display=swap');
  `}</style>
);

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useScrollY() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return scrollY;
}

function useInView(ref: React.RefObject<HTMLElement>, threshold = 0.12) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return inView;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
  }, []);
  return reduced;
}

// ─── STAR CANVAS ─────────────────────────────────────────────────────────────
function StarCanvas({ count = 130 }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;                                     
    let stars = [];
    let pages = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.3,
        opacity: Math.random() * 0.75 + 0.2,
        speed: Math.random() * 0.005 + 0.001,
      }));
      pages = Array.from({ length: 10 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        w: Math.random() * 14 + 6,
        opacity: Math.random() * 0.06 + 0.02,
        vy: -(Math.random() * 0.35 + 0.08),
        vx: (Math.random() - 0.5) * 0.2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.012,
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    const draw = () => {
      t += 0.008;
     ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach(s => {
        const pulse = Math.sin(t * s.speed * 80 + s.x) * 0.28 + 0.72;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.opacity * pulse})`;
        ctx.fill();
        if (s.size > 1.6) {
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3);
          g.addColorStop(0, `rgba(190,160,255,${0.12 * pulse})`);
          g.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
      });

      pages.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        if (p.y < -30) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = `rgba(243,216,156,${p.opacity})`;
        ctx.fillRect(-p.w / 2, -p.w * 0.7, p.w, p.w * 1.4);
        ctx.restore();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [count, reduced]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  );
}

// ─── SVG ICONS ───────────────────────────────────────────────────────────────
const icons = {
  story: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ),
  art: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  mic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  music: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  ),
  film: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  ),
  idea: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="7.05" y2="7.05" /><line x1="16.95" y1="16.95" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="7.05" y2="16.95" /><line x1="16.95" y1="7.05" x2="19.78" y2="4.22" />
    </svg>
  ),
  pen: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  hero: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  world: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  painter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" /><line x1="2" y1="20" x2="2.01" y2="20" />
    </svg>
  ),
  writer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  family: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
    </svg>
  ),
  sparkle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M12 6v8" /><path d="M8 10h8" />
    </svg>
  ),
};

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav({ scrollY }) {
  const [open, setOpen] = useState(false);
  const scrolled = scrollY > 40;
  const links = ['Hikoyalar', 'Komiks', 'Ijodlar', 'Ota-onalar', 'Biz haqimizda'];

  return (
    <>
      <style>{`
        .nav-desktop { display: flex; }
        .nav-burger  { display: none; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-burger  { display: block !important; }
        }
        .nav-link {
          font-family: 'Nunito', sans-serif;
          font-size: 0.875rem;
          color: #C4B5FD;
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.2s;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -3px; left: 0; right: 0;
          height: 1px;
          background: #F3D89C;
          transform: scaleX(0);
          transition: transform 0.2s;
        }
        .nav-link:hover { color: #F3D89C; }
        .nav-link:hover::after { transform: scaleX(1); }
      `}</style>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '14px 32px',
        background: scrolled ? 'rgba(8,0,20,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(168,85,247,0.12)' : 'none',
        transition: 'all 0.4s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="logo" style={{
            width: 34, height: 34, borderRadius: '50%', objectFit: 'cover',
            border: '1.5px solid rgba(168,85,247,0.55)',
          }} />
          <span style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: 'clamp(0.6rem,1.2vw,0.82rem)', fontWeight: 700,
            background: 'linear-gradient(135deg, #F3D89C, #A855F7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Xayollar Ro'yosi</span>
        </div>
        <div className="nav-desktop" style={{ gap: 28, alignItems: 'center' }}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s/g, '-')}`} className="nav-link">{l}</a>
          ))}
          <button style={{
            padding: '8px 22px',
            background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
            border: 'none', borderRadius: 99, cursor: 'pointer',
            fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '0.82rem',
            color: '#fff', letterSpacing: '0.04em',
            boxShadow: '0 0 18px rgba(168,85,247,0.35)',
            transition: 'all 0.25s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(168,85,247,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 18px rgba(168,85,247,0.35)'; }}
          >Kirish</button>
        </div>
        <button
          className="nav-burger"
          onClick={() => setOpen(!open)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
          aria-label="Menu"
        >
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 22, height: 1.5, background: '#A855F7', marginBottom: i < 2 ? 5 : 0,
              transition: 'all 0.3s',
              transform: open && i === 0 ? 'rotate(45deg) translate(4.5px,4.5px)' : open && i === 2 ? 'rotate(-45deg) translate(4.5px,-4.5px)' : 'none',
              opacity: open && i === 1 ? 0 : 1,
            }} />
          ))}
        </button>
        {open && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: 'rgba(8,0,20,0.97)', backdropFilter: 'blur(20px)',
            padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 14,
            borderBottom: '1px solid rgba(168,85,247,0.18)',
          }}>
            {links.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)} style={{
                fontFamily: "'Nunito', sans-serif", fontSize: '1rem',
                color: '#C4B5FD', textDecoration: 'none', padding: '8px 0',
                borderBottom: '1px solid rgba(168,85,247,0.09)',
              }}>{l}</a>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}

// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(100px,12vw,140px) clamp(20px,6vw,80px) clamp(60px,8vw,100px)',
      position: 'relative', overflow: 'hidden',
      textAlign: 'center',
    }}>
      {/* ambient glow layers */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 'min(700px,90vw)', height: 'min(700px,90vw)',
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 68%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '5%', left: '15%',
        width: 300, height: 300,
        background: 'radial-gradient(ellipse, rgba(243,216,156,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* top eyebrow */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: '7px 20px',
        background: 'rgba(124,58,237,0.12)',
        border: '1px solid rgba(168,85,247,0.25)',
        borderRadius: 99, marginBottom: 28,
        transition: 'all 1s ease',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(16px)',
      }}>
        <div style={{ width: 18, height: 18, color: '#A855F7', flexShrink: 0 }}>{icons.sparkle}</div>
        <span style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(0.62rem,1.2vw,0.7rem)',
          letterSpacing: '0.22em', color: '#9B72CF',
        }}>XAYOLLAR RO'YOSI</span>
      </div>

      {/* Main headline */}
      <h1 style={{
        fontFamily: "'Cinzel Decorative', serif",
        fontSize: 'clamp(2.2rem,7vw,5.5rem)',
        fontWeight: 900,
        lineHeight: 1.15,
        letterSpacing: '0.04em',
        marginBottom: 28,
        transition: 'all 1.1s cubic-bezier(0.34,1.4,0.64,1) 0.15s',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(24px)',
      }}>
        <span style={{ color: '#F1E8FF' }}>Xayollar</span>
        <br />
        <span style={{
          background: 'linear-gradient(135deg, #F3D89C 0%, #C084FC 45%, #E9D5FF 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>Ro'yosi</span>
      </h1>

      {/* Sub */}
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: 'italic',
        fontSize: 'clamp(1.1rem,2.8vw,1.75rem)',
        color: '#9B8EC4',
        letterSpacing: '0.03em',
        marginBottom: 16,
        maxWidth: 680,
        transition: 'all 1s ease 0.3s',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(16px)',
      }}>
        Har bir tasavvurda yangi bir olam bor
      </p>

      <p style={{
        fontFamily: "'Nunito', sans-serif",
        fontSize: 'clamp(0.88rem,1.8vw,1rem)',
        color: '#7C6A9E',
        lineHeight: 1.9,
        maxWidth: 560,
        transition: 'all 1s ease 0.45s',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(12px)',
      }}>
        Hikoya yozing. Qahramon yarating.<br />
        Uni ovoz va tasvir bilan jonlantiring.
      </p>

      {/* scroll hint */}
      <div style={{
        position: 'absolute', bottom: 36, left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        opacity: mounted ? 0.45 : 0,
        transition: 'opacity 1s ease 1s',
      }}>
        <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, transparent, #7C3AED)' }} />
        <div style={{ width: 14, color: '#7C3AED', animation: 'bob 2s ease-in-out infinite' }}>{icons.arrow}</div>
      </div>

      <style>{`
        @keyframes bob {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
      `}</style>
    </section>
  );
}

// ─── ABOUT BOOK SECTION ──────────────────────────────────────────────────────
function BookSection() {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [bookAnim, setBookAnim] = useState(false);
  useEffect(() => {
    if (inView) setTimeout(() => setBookAnim(true), 200);
  }, [inView]);

  return (
    <section style={{
      padding: 'clamp(60px,8vw,110px) clamp(20px,5vw,80px)',
      position: 'relative',
    }}>
      <div style={{
        maxWidth: 1160, margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
        gap: 'clamp(48px,6vw,96px)',
        alignItems: 'center',
      }}>
        {/* Book illustration */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          transition: 'all 1s cubic-bezier(0.34,1.3,0.64,1)',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateX(0) scale(1)' : 'translateX(-30px) scale(0.94)',
        }}>
          <div style={{ position: 'relative', width: 'min(340px,88vw)', height: 'min(340px,88vw)' }}>
            {/* glow */}
            <div style={{
              position: 'absolute', inset: -30,
              borderRadius: 24,
              background: 'radial-gradient(ellipse, rgba(124,58,237,0.22) 0%, transparent 70%)',
            }} />
            {/* Book body */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(107,33,168,0.35) 0%, rgba(13,10,26,0.85) 60%, rgba(76,29,149,0.25) 100%)',
              border: '1px solid rgba(168,85,247,0.25)',
              borderRadius: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {/* Spine */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 40,
                background: 'linear-gradient(180deg, rgba(124,58,237,0.6) 0%, rgba(168,85,247,0.3) 100%)',
                borderRight: '1px solid rgba(168,85,247,0.3)',
              }} />
              {/* Pages suggestion */}
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  position: 'absolute',
                  left: 44 + i * 3, right: 16 + i * 3,
                  top: 20 - i * 2, bottom: 20 - i * 2,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(243,216,156,0.08)',
                  borderRadius: 4,
                }} />
              ))}
              {/* Main page */}
              <div style={{
                position: 'absolute', left: 56, right: 20, top: 24, bottom: 24,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(243,216,156,0.15)',
                borderRadius: 6,
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', padding: '24px 20px',
                gap: 10,
              }}>
                {/* SVG book icon large */}
                <div style={{
                  width: 52, height: 52, color: 'rgba(168,85,247,0.7)',
                  margin: '0 auto 8px',
                  filter: 'drop-shadow(0 0 12px rgba(168,85,247,0.4))',
                  transition: 'all 0.7s ease',
                  transform: bookAnim ? 'scale(1) translateY(0)' : 'scale(0.7) translateY(10px)',
                  opacity: bookAnim ? 1 : 0,
                }}>{icons.book}</div>
                {/* Line decorations */}
                {[85, 72, 90, 60, 78].map((w, i) => (
                  <div key={i} style={{
                    height: 1.5,
                    width: `${w}%`,
                    background: `rgba(${i % 2 === 0 ? '168,85,247' : '243,216,156'},0.18)`,
                    borderRadius: 2,
                    transition: `all 0.5s ease ${0.3 + i * 0.08}s`,
                    transform: bookAnim ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left',
                  }} />
                ))}
              </div>
              {/* top rainbow shimmer */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: 'linear-gradient(90deg, transparent, #A855F7, #F3D89C, #A855F7, transparent)',
              }} />
            </div>
          </div>
        </div>

        {/* Text */}
        <div ref={ref} style={{
          transition: 'all 0.9s ease 0.2s',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateX(0)' : 'translateX(24px)',
        }}>
          <p style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '0.68rem', letterSpacing: '0.22em',
            color: '#7C3AED', marginBottom: 14,
          }}>BIZ HAQIMIZDA</p>
          <h2 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(1.7rem,4vw,2.9rem)',
            fontWeight: 700, color: '#F1E8FF',
            lineHeight: 1.28, marginBottom: 20,
          }}>
            Bu platforma<br />
            <span style={{
              background: 'linear-gradient(135deg, #F3D89C 0%, #A855F7 55%, #E9D5FF 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>nima?</span>
          </h2>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1rem,2vw,1.2rem)',
            color: '#9B8EC4', lineHeight: 1.9,
            marginBottom: 20, fontStyle: 'italic',
          }}>
            Xayollar ro'yosi — insonlarning tasavvuridagi dunyoni yaratish va boshqalar bilan ulashish uchun yaratilgan ijodiy platforma.
          </p>
          <p style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 'clamp(0.88rem,1.7vw,0.97rem)',
            color: '#7C6A9E', lineHeight: 1.85,
          }}>
            Bu yerda har bir fikr o'z sayohatini boshlaydi:
          </p>
          {/* pill chain */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18,
          }}>
            {['G\'oya', 'Hikoya', 'Rasm', 'Ovoz', 'Jonlangan olam'].map((item, i) => (
              <React.Fragment key={item}>
                <span style={{
                  padding: '5px 14px',
                  background: 'rgba(124,58,237,0.14)',
                  border: '1px solid rgba(168,85,247,0.28)',
                  borderRadius: 99,
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '0.8rem', color: '#C4B5FD',
                  transition: `all 0.5s ease ${0.1 + i * 0.07}s`,
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(10px)',
                }}>{item}</span>
                {i < 4 && (
                  <span style={{ color: 'rgba(168,85,247,0.4)', fontFamily: 'sans-serif', lineHeight: '28px', fontSize: '0.85rem' }}>→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES ────────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? 'linear-gradient(135deg, rgba(107,33,168,0.28) 0%, rgba(168,85,247,0.12) 100%)'
          : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hovered ? 'rgba(168,85,247,0.45)' : 'rgba(168,85,247,0.12)'}`,
        borderRadius: 18, padding: 'clamp(22px,3vw,32px)',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.34,1.4,0.64,1)',
        transform: inView
          ? hovered ? 'translateY(-10px) scale(1.02)' : 'translateY(0) scale(1)'
          : 'translateY(28px) scale(0.96)',
        opacity: inView ? 1 : 0,
        transitionDelay: inView ? `${delay}ms` : '0ms',
        boxShadow: hovered ? '0 18px 52px rgba(107,33,168,0.28)' : 'none',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {hovered && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 18,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}
      <div style={{
        width: 44, height: 44,
        color: hovered ? '#C4B5FD' : '#7C3AED',
        marginBottom: 18,
        transition: 'all 0.35s',
        transform: hovered ? 'scale(1.15) rotate(-4deg)' : 'scale(1)',
        filter: hovered ? 'drop-shadow(0 0 10px rgba(168,85,247,0.6))' : 'none',
      }}>{icon}</div>
      <h3 style={{
        fontFamily: "'Cinzel', serif",
        fontSize: 'clamp(0.92rem,2vw,1.1rem)',
        fontWeight: 600, color: '#E9D5FF',
        marginBottom: 10, letterSpacing: '0.04em',
      }}>{title}</h3>
      <p style={{
        fontFamily: "'Nunito', sans-serif",
        fontSize: 'clamp(0.82rem,1.6vw,0.9rem)',
        color: '#7C6A9E', lineHeight: 1.75,
      }}>{desc}</p>
    </div>
  );
}

function Features() {
  const ref = useRef(null);
  const inView = useInView(ref);
  const cards = [
    { icon: icons.story, title: 'Hikoya yaratish', desc: 'O\'z dunyongizni yozing, qahramonlaringiz bilan sarguzasht yarating.' },
    { icon: icons.art, title: 'Rasm va komiks', desc: 'Rassom bo\'lsangiz rasmlaringizni qo\'shing. Chiza olmasangiz tayyor qahramonlar orqali sahnangizni yarating.' },
    { icon: icons.mic, title: 'Ovoz berish', desc: 'Qahramonlarga o\'z ovozingizni bering. Hikoyani jonlantiring.' },
    { icon: icons.music, title: 'Musiqa va effekt', desc: 'Kayfiyatga mos musiqa va ovozli effektlar qo\'shing.' },
    { icon: icons.film, title: 'Mini animatsiya', desc: 'Yaratgan olamingizni kichik video hikoyaga aylantiring.' },
  ];

  return (
    <section id="hikoyalar" style={{ padding: 'clamp(60px,8vw,110px) clamp(20px,5vw,80px)', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: '20%', right: 0,
        width: 420, height: 420,
        background: 'radial-gradient(ellipse, rgba(107,33,168,0.13) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div ref={ref} style={{ textAlign: 'center', marginBottom: 'clamp(40px,6vw,64px)' }}>
          <p style={{
            fontFamily: "'Cinzel', serif", fontSize: '0.68rem',
            letterSpacing: '0.22em', color: '#7C3AED', marginBottom: 14,
            transition: 'all 0.8s ease', opacity: inView ? 1 : 0,
          }}>IMKONIYATLAR</p>
          <h2 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(1.7rem,4.5vw,3rem)',
            fontWeight: 700, color: '#F1E8FF', lineHeight: 1.25,
            transition: 'all 0.9s ease 0.1s', opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(18px)',
          }}>
            Siz nimalar<br />
            <span style={{
              background: 'linear-gradient(135deg, #F3D89C, #A855F7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>qila olasiz?</span>
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: 'clamp(14px,2.2vw,22px)',
        }}>
          {cards.map((c, i) => <FeatureCard key={i} {...c} delay={i * 90} />)}
        </div>
      </div>
    </section>
  );
}

// ─── TIMELINE ────────────────────────────────────────────────────────────────
function Timeline() {
  const ref = useRef(null);
  const inView = useInView(ref, 0.08);
  const steps = [
    { icon: icons.idea, label: 'G\'oya', desc: 'Xayoldan tug\'iladi' },
    { icon: icons.pen, label: 'Hikoya', desc: 'So\'z bilan shakllanadi' },
    { icon: icons.hero, label: 'Qahramon', desc: 'Hayot topadi' },
    { icon: icons.image, label: 'Tasvir', desc: 'Ko\'z oldida jonlanadi' },
    { icon: icons.mic, label: 'Ovoz', desc: 'Quloqqa yetadi' },
    { icon: icons.world, label: 'Jonlangan olam', desc: 'Hamma bilan ulashiladi' },
  ];

  return (
    <section style={{
      padding: 'clamp(60px,8vw,110px) clamp(20px,5vw,80px)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.1) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div ref={ref} style={{ textAlign: 'center', marginBottom: 'clamp(48px,7vw,72px)' }}>
          <p style={{
            fontFamily: "'Cinzel', serif", fontSize: '0.68rem',
            letterSpacing: '0.22em', color: '#7C3AED', marginBottom: 14,
            opacity: inView ? 1 : 0, transition: 'all 0.8s ease',
          }}>YARATISH JARAYONI</p>
          <h2 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(1.7rem,4.5vw,3rem)',
            fontWeight: 700, color: '#F1E8FF',
            opacity: inView ? 1 : 0, transition: 'all 0.9s ease 0.1s',
            transform: inView ? 'translateY(0)' : 'translateY(18px)',
          }}>
            G'oyadan<br />
            <span style={{
              background: 'linear-gradient(135deg, #F3D89C, #A855F7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>jonlangan olamga</span>
          </h2>
        </div>

        {/* Desktop: horizontal timeline */}
        <div style={{ position: 'relative' }}>
          {/* connecting line */}
          <div style={{
            position: 'absolute', top: 36, left: '8%', right: '8%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.4), rgba(243,216,156,0.4), rgba(168,85,247,0.4), transparent)',
            display: 'none',
          }} className="tl-line" />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
            gap: 'clamp(20px,3vw,12px)',
            position: 'relative',
          }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', gap: 14,
                transition: `all 0.7s cubic-bezier(0.34,1.3,0.64,1) ${0.08 + i * 0.1}s`,
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(24px)',
              }}>
                {/* node */}
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(107,33,168,0.5) 0%, rgba(168,85,247,0.2) 100%)',
                  border: '1px solid rgba(168,85,247,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#C4B5FD',
                  boxShadow: '0 0 24px rgba(124,58,237,0.18)',
                  position: 'relative',
                  flexShrink: 0,
                }}>
                  <div style={{ width: 28, height: 28 }}>{step.icon}</div>
                  {/* step number */}
                  <div style={{
                    position: 'absolute', top: -6, right: -6,
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#7C3AED',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: '0.62rem', fontWeight: 700, color: '#fff',
                  }}>{i + 1}</div>
                </div>
                <div>
                  <p style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 'clamp(0.78rem,1.5vw,0.9rem)',
                    fontWeight: 600, color: '#E9D5FF',
                    marginBottom: 4, letterSpacing: '0.04em',
                  }}>{step.label}</p>
                  <p style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: '0.75rem', color: '#5C4F7A', lineHeight: 1.5,
                  }}>{step.desc}</p>
                </div>
                {/* connector arrow on mobile */}
                {i < steps.length - 1 && (
                  <div style={{
                    width: 16, color: 'rgba(168,85,247,0.3)',
                    display: 'none',
                  }} className="tl-arrow">{icons.arrow}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── AUDIENCE ────────────────────────────────────────────────────────────────
function AudienceSection() {
  const ref = useRef(null);
  const inView = useInView(ref);
  const cards = [
    {
      icon: icons.painter,
      title: 'Rassomlar',
      desc: 'Rasmlaringizni hikoyaga aylantiring. Qahramonlarga hayot bering. Ijodingizni butun dunyoga ko\'rsating.',
      accent: '#C084FC',
    },
    {
      icon: icons.writer,
      title: 'Yozuvchilar',
      desc: 'So\'z bilan yaratgan olamingizni ovoz, rasm va animatsiya orqali yanada chuqurroq jonlantiring.',
      accent: '#F3D89C',
    },
    {
      icon: icons.family,
      title: 'Ota-onalar',
      desc: 'Farzandingiz uchun foydali, tarbiyaviy va ilmiy hikoyalar yarating. Sevimli qahramonlar bilan sarguzasht kashf eting.',
      accent: '#6EE7B7',
    },
  ];

  return (
    <section id="ota-onalar" style={{ padding: 'clamp(60px,8vw,110px) clamp(20px,5vw,80px)', position: 'relative' }}>
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        width: 380, height: 380,
        background: 'radial-gradient(ellipse, rgba(107,33,168,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div ref={ref} style={{ textAlign: 'center', marginBottom: 'clamp(40px,6vw,64px)' }}>
          <p style={{
            fontFamily: "'Cinzel', serif", fontSize: '0.68rem',
            letterSpacing: '0.22em', color: '#7C3AED', marginBottom: 14,
            opacity: inView ? 1 : 0, transition: 'all 0.8s ease',
          }}>KIMLAR UCHUN?</p>
          <h2 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(1.7rem,4.5vw,3rem)',
            fontWeight: 700, color: '#F1E8FF',
            opacity: inView ? 1 : 0, transition: 'all 0.9s ease 0.1s',
            transform: inView ? 'translateY(0)' : 'translateY(18px)',
          }}>
            Har bir ijodkor<br />
            <span style={{
              background: 'linear-gradient(135deg, #F3D89C, #A855F7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>o'z o'rnini topadi</span>
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(18px,2.5vw,28px)',
        }}>
          {cards.map((c, i) => (
            <AudienceCard key={i} {...c} delay={i * 110} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AudienceCard({ icon, title, desc, accent, delay, inView }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hovered ? `${accent}40` : 'rgba(168,85,247,0.12)'}`,
        borderRadius: 20,
        padding: 'clamp(28px,3.5vw,40px)',
        transition: 'all 0.4s cubic-bezier(0.34,1.4,0.64,1)',
        transform: inView
          ? hovered ? 'translateY(-10px)' : 'translateY(0)'
          : 'translateY(26px)',
        opacity: inView ? 1 : 0,
        transitionDelay: inView ? `${delay}ms` : '0ms',
        boxShadow: hovered ? `0 16px 48px ${accent}1a` : 'none',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`,
        transform: hovered ? 'scaleX(1)' : 'scaleX(0.3)',
        transition: 'transform 0.4s ease',
      }} />
      <div style={{
        width: 52, height: 52,
        color: accent,
        marginBottom: 20,
        filter: hovered ? `drop-shadow(0 0 10px ${accent}80)` : 'none',
        transition: 'all 0.35s',
        transform: hovered ? 'scale(1.1)' : 'scale(1)',
      }}>{icon}</div>
      <h3 style={{
        fontFamily: "'Cinzel', serif",
        fontSize: 'clamp(1rem,2.2vw,1.2rem)',
        fontWeight: 600, color: '#E9D5FF',
        marginBottom: 12, letterSpacing: '0.04em',
      }}>{title}</h3>
      <p style={{
        fontFamily: "'Nunito', sans-serif",
        fontSize: 'clamp(0.85rem,1.7vw,0.93rem)',
        color: '#7C6A9E', lineHeight: 1.8,
      }}>{desc}</p>
    </div>
  );
}

// ─── PLATFORM FEATURES ───────────────────────────────────────────────────────
function PlatformFeatures() {
  const ref = useRef(null);
  const inView = useInView(ref);
  const items = [
    { title: 'Profil yaratish', desc: 'O\'z ijodiy olamingizni shakllantiring.' },
    { title: 'Ijodlarni saqlash', desc: 'Barcha asarlaringiz bitta joyda.' },
    { title: 'Ko\'rish va kashf etish', desc: 'Boshqalarning hikoyalarini o\'qing.' },
    { title: 'Like va sharh', desc: 'Ijodkorlarni qo\'llab-quvvatlang.' },
    { title: 'Obuna', desc: 'Sevimli mualliflarni kuzating.' },
    { title: 'Mashhur ijodkorlar', desc: 'Top ijodkorlar bilan bog\'laning.' },
  ];

  return (
    <section style={{
      padding: 'clamp(60px,8vw,110px) clamp(20px,5vw,80px)',
      position: 'relative',
    }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(107,33,168,0.18) 0%, rgba(13,10,26,0.55) 50%, rgba(76,29,149,0.16) 100%)',
          border: '1px solid rgba(168,85,247,0.18)',
          borderRadius: 26, padding: 'clamp(36px,5vw,64px)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, #A855F7, #F3D89C, #A855F7, transparent)',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.25), transparent)',
          }} />

          <div ref={ref} style={{ textAlign: 'center', marginBottom: 'clamp(36px,5vw,56px)' }}>
            <p style={{
              fontFamily: "'Cinzel', serif", fontSize: '0.68rem',
              letterSpacing: '0.22em', color: '#7C3AED', marginBottom: 14,
              opacity: inView ? 1 : 0, transition: 'all 0.8s ease',
            }}>PLATFORMA IMKONIYATLARI</p>
            <h2 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(1.7rem,4vw,2.8rem)',
              fontWeight: 700, color: '#F1E8FF',
              opacity: inView ? 1 : 0, transition: 'all 0.9s ease 0.1s',
              transform: inView ? 'translateY(0)' : 'translateY(18px)',
            }}>
              Ulashing.<br />
              <span style={{
                background: 'linear-gradient(135deg, #F3D89C, #A855F7)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Kashf eting. Bog'laning.</span>
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap: 'clamp(16px,2.2vw,22px)',
          }}>
            {items.map((item, i) => (
              <PlatformItem key={i} {...item} delay={i * 80} inView={inView} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PlatformItem({ title, desc, delay, inView }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hovered ? 'rgba(168,85,247,0.32)' : 'rgba(168,85,247,0.1)'}`,
        borderRadius: 14, padding: 'clamp(18px,2.5vw,24px)',
        transition: 'all 0.35s ease',
        transform: inView
          ? hovered ? 'translateY(-5px)' : 'translateY(0)'
          : 'translateY(20px)',
        opacity: inView ? 1 : 0,
        transitionDelay: inView ? `${delay}ms` : '0ms',
      }}
    >
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: hovered ? '#A855F7' : '#4C1D95',
        marginBottom: 12,
        transition: 'all 0.3s',
        boxShadow: hovered ? '0 0 10px rgba(168,85,247,0.7)' : 'none',
      }} />
      <h4 style={{
        fontFamily: "'Cinzel', serif",
        fontSize: 'clamp(0.82rem,1.6vw,0.95rem)',
        fontWeight: 600, color: '#E9D5FF', marginBottom: 6,
      }}>{title}</h4>
      <p style={{
        fontFamily: "'Nunito', sans-serif",
        fontSize: '0.82rem', color: '#5C4F7A', lineHeight: 1.65,
      }}>{desc}</p>
    </div>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [hovered, setHovered] = useState(false);

  return (
    <section style={{
      padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,80px)',
      textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(107,33,168,0.22) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.35), transparent)',
      }} />
      <div ref={ref} style={{ maxWidth: 780, margin: '0 auto', position: 'relative' }}>
        <p style={{
          fontFamily: "'Cinzel', serif", fontSize: '0.68rem',
          letterSpacing: '0.22em', color: '#7C3AED', marginBottom: 22,
          opacity: inView ? 1 : 0, transition: 'all 0.8s ease',
        }}>BUGUN BOSHLANG</p>
        <h2 style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: 'clamp(1.55rem,5vw,3.4rem)',
          fontWeight: 700, lineHeight: 1.22, marginBottom: 20,
          opacity: inView ? 1 : 0, transition: 'all 0.9s ease 0.1s',
          transform: inView ? 'translateY(0)' : 'translateY(28px)',
        }}>
          <span style={{ color: '#F1E8FF' }}>Sening xayolingdagi<br /></span>
          <span style={{
            background: 'linear-gradient(135deg, #F3D89C 0%, #A855F7 50%, #C4B5FD 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>olam seni kutmoqda.</span>
        </h2>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
          fontSize: 'clamp(1rem,2vw,1.2rem)',
          color: '#7C6A9E', lineHeight: 1.8, marginBottom: 44,
          opacity: inView ? 1 : 0, transition: 'all 0.9s ease 0.2s',
        }}>
          Birinchi qadamni qo'y. Hikoyangni yoz. Olamingni dunyoga ko'rsat.
        </p>
        <button
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            padding: 'clamp(14px,2.5vw,18px) clamp(38px,5vw,60px)',
            background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #C026D3 100%)',
            border: 'none', borderRadius: 99, cursor: 'pointer',
            fontFamily: "'Cinzel', serif", fontWeight: 600,
            fontSize: 'clamp(0.9rem,2vw,1.05rem)',
            color: '#fff', letterSpacing: '0.08em',
            boxShadow: hovered
              ? '0 0 80px rgba(168,85,247,0.65), 0 0 160px rgba(168,85,247,0.25)'
              : '0 0 50px rgba(168,85,247,0.4), 0 0 100px rgba(168,85,247,0.15)',
            transition: 'all 0.35s ease',
            transform: hovered ? 'translateY(-5px) scale(1.04)' : 'translateY(0) scale(1)',
            opacity: inView ? 1 : 0,
          }}
        >
          Yaratishni boshlash
        </button>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(168,85,247,0.12)',
      padding: 'clamp(28px,4vw,44px) clamp(20px,5vw,80px)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: 18,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <img src="/logo.png" alt="logo" style={{
          width: 30, height: 30, borderRadius: '50%', objectFit: 'cover',
          border: '1.5px solid rgba(168,85,247,0.45)',
        }} />
        <span style={{
          fontFamily: "'Cinzel Decorative', serif", fontSize: '0.82rem', fontWeight: 700,
          background: 'linear-gradient(135deg, #F3D89C, #A855F7)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>Xayollar Ro'yosi</span>
      </div>
      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.75rem', color: '#3D2F5E', textAlign: 'center' }}>
        © 2024 Xayollar Ro'yosi · Barcha huquqlar himoyalangan
      </p>
      <div style={{ display: 'flex', gap: 20 }}>
        {['Instagram', 'TikTok', 'Telegram'].map(s => (
          <a key={s} href="#" style={{
            fontFamily: "'Nunito', sans-serif", fontSize: '0.78rem', color: '#4A3B6B',
            textDecoration: 'none', transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#A855F7')}
            onMouseLeave={e => (e.currentTarget.style.color = '#4A3B6B')}
          >{s}</a>
        ))}
      </div>
    </footer>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const scrollY = useScrollY();

  return (
    <>
      <FontLoader />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #080014; }
        ::selection { background: rgba(168,85,247,0.3); color: #F1E8FF; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080014; }
        ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.45); border-radius: 2px; }
      `}</style>
      <div style={{ minHeight: '100vh', background: '#080014', color: '#F1E8FF', position: 'relative' }}>
        <StarCanvas count={140} />
        <Nav scrollY={scrollY} />
        <main style={{ position: 'relative', zIndex: 1 }}>
          <Hero />
          <BookSection />
          <Features />
          <Timeline />
          <AudienceSection />
          <PlatformFeatures />
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  );
}