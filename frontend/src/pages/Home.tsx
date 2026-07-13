import { useNavigate } from "react-router-dom";
const FONT_IMPORT_URL =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700&family=Cormorant+Garamond:wght@700&family=Lora:wght@400&family=Nunito:wght@400;600;700&display=swap";
import React, { useState, useEffect, useRef, useMemo} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Star { x: number; y: number; size: number; opacity: number; speed: number; }
interface Particle { x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string; }

function useScrollY() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return scrollY;
}

function useInView(ref: React.RefObject<Element | null>, threshold = 0.15) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return inView;
}

function StarCanvas({ count = 120 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;
    let stars: Star[] = [];
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.2 + 0.3,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.004 + 0.001,
      }));
      particles = Array.from({ length: 25 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.5 - 0.1,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.5 ? '#A855F7' : '#F3D89C',
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    const draw = () => {
      t += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Stars
      stars.forEach(s => {
        const pulse = Math.sin(t * s.speed * 100 + s.x) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.opacity * pulse})`;
        ctx.fill();
        // occasional glow
        if (s.size > 1.8) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 2.5, 0, Math.PI * 2);
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 2.5);
          g.addColorStop(0, `rgba(200,180,255,${0.15 * pulse})`);
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.fill();
        }
      });
      // Particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.opacity -= 0.002;
        if (p.opacity <= 0 || p.y < -10) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.opacity = Math.random() * 0.5 + 0.2;
          p.vx = (Math.random() - 0.5) * 0.3;
          p.vy = -Math.random() * 0.5 - 0.1;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  );
}

// ─── INTRO ANIMATION ─────────────────────────────────────────────────────────
function Intro({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0); // 0=stars, 1=logo, 2=tagline, 3=fade

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 3200),
      setTimeout(() => onDone(), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'radial-gradient(ellipse at 50% 60%, #1a0a2e 0%, #0D0A1A 70%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.8s ease',
      opacity: phase === 3 ? 0 : 1,
      pointerEvents: phase === 3 ? 'none' : 'all',
    }}>
      <StarCanvas count={80} />
      {/* Logo */}
      <div style={{
        transition: 'all 1s cubic-bezier(0.34,1.56,0.64,1)',
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? 'scale(1) translateY(0)' : 'scale(0.6) translateY(40px)',
        zIndex: 1,
        marginBottom: 28,
      }}>
        <div style={{
          width: 140, height: 140,
          borderRadius: '50%',
          padding: 4,
          background: 'linear-gradient(135deg, #7C3AED, #A855F7, #F3D89C)',
          boxShadow: '0 0 60px rgba(168,85,247,0.6), 0 0 120px rgba(168,85,247,0.2)',
        }}>
          <img
            src="/logo.png"
            alt="Xayollar Ro'yosi logo"
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>
      </div>
      {/* Brand name */}
      <div style={{
        transition: 'all 0.8s ease 0.3s',
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? 'translateY(0)' : 'translateY(20px)',
        zIndex: 1,
      }}>
        <h1 style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #F3D89C 0%, #A855F7 50%, #E9D5FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '0.15em',
          textAlign: 'center',
        }}>Xayollar Ro'yosi</h1>
      </div>
      {/* Tagline */}
      <div style={{
        transition: 'all 0.8s ease',
        opacity: phase >= 2 ? 1 : 0,
        transform: phase >= 2 ? 'translateY(0)' : 'translateY(16px)',
        zIndex: 1,
        textAlign: 'center',
        marginTop: 16,
      }}>
        <p style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)',
          color: '#C4B5FD',
          letterSpacing: '0.2em',
          marginBottom: 8,
        }}> </p>
        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 'clamp(0.9rem, 2vw, 1rem)',
          color: '#A78BFA',
          letterSpacing: '0.08em',
        }}>"Xayolingdagi olamni yarat"</p>
      </div>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav({ scrollY }: { scrollY: number }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const scrolled = scrollY > 50;
  const links = ['Hikoyalar', 'Komiks', 'Ijodlar', 'Ota-onalar' ,'Biz xaqimzda'];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      padding: '16px 24px',
      background: scrolled ? 'rgba(13,10,26,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(168,85,247,0.15)' : 'none',
      transition: 'all 0.4s ease',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/logo.png" alt="logo" style={{
          width: 36, height: 36, borderRadius: '50%', objectFit: 'cover',
          border: '2px solid rgba(168,85,247,0.6)',
        }} />
        <span style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: 'clamp(0.65rem, 1.3vw, 0.9rem)', fontWeight: 700,
          background: 'linear-gradient(135deg, #F3D89C, #A855F7)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>Xayollar Ro'yosi</span>
      </div>
      {/* Desktop links */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="nav-desktop">
        {links.map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} style={{
            fontFamily: "'Nunito', sans-serif", fontSize: '0.9rem',
            color: '#C4B5FD', textDecoration: 'none', letterSpacing: '0.04em',
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#F3D89C')}
            onMouseLeave={e => (e.currentTarget.style.color = '#C4B5FD')}
          >{l}</a>
        ))}
        <button
  style={{
    padding: '8px 20px',
    background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
    border: 'none',
    borderRadius: 99,
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 700,
    fontSize: '0.85rem',
    color: '#fff',
    letterSpacing: '0.04em',
    boxShadow: '0 0 20px rgba(168,85,247,0.4)',
    transition: 'all 0.2s',
  }}
  onClick={() => navigate("/login")}
  onMouseEnter={e => {
    e.currentTarget.style.transform = 'scale(1.05)';
    e.currentTarget.style.boxShadow = '0 0 30px rgba(168,85,247,0.6)';
  }}
  onMouseLeave={e => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = '0 0 20px rgba(168,85,247,0.4)';
  }}
>
  Kirish
</button>
      </div>
      {/* Mobile burger */}
      <button
        onClick={() => setOpen(!open)}
        style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
        className="nav-burger"
        aria-label="Menu"
      >
        <div style={{ width: 24, height: 2, background: '#A855F7', marginBottom: 5, transition: 'all 0.3s', transform: open ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
        <div style={{ width: 24, height: 2, background: '#A855F7', marginBottom: 5, opacity: open ? 0 : 1, transition: 'opacity 0.3s' }} />
        <div style={{ width: 24, height: 2, background: '#A855F7', transition: 'all 0.3s', transform: open ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
      </button>
      {/* Mobile menu */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'rgba(13,10,26,0.97)', backdropFilter: 'blur(20px)',
          padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16,
          borderBottom: '1px solid rgba(168,85,247,0.2)',
        }}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)} style={{
              fontFamily: "'Nunito', sans-serif", fontSize: '1rem',
              color: '#C4B5FD', textDecoration: 'none', padding: '8px 0',
              borderBottom: '1px solid rgba(168,85,247,0.1)',
            }}>{l}</a>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─── FLOATING PAGES (decorative) ────────────────────────────────────────────
function FloatingPage({ delay, x, size, opacity }: { delay: number; x: number; size: number; opacity: number }) {
  return (
    <div style={{
      position: 'absolute', left: `${x}%`,
      width: size, height: size * 1.4,
      background: `linear-gradient(135deg, rgba(243,216,156,${opacity}) 0%, rgba(168,85,247,${opacity * 0.5}) 100%)`,
      borderRadius: 4,
      animation: `float-page 6s ease-in-out ${delay}s infinite alternate`,
      boxShadow: `0 0 20px rgba(243,216,156,${opacity * 0.4})`,
    }} />
  );
}

// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero({ scrollY }: { scrollY: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const parallax = -scrollY * 0.3;

  return (
    <section ref={ref} style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      padding: 'clamp(80px,10vw,120px) clamp(20px,5vw,80px) 60px',
      position: 'relative', overflow: 'hidden',
       backgroundImage: 'url(/fon.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center right',
    }}>
      {/* Glow bg */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600,
        background: 'radial-gradient(ellipse, rgba(107,33,168,0.25) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Floating pages bg */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', transform: `translateY(${parallax * 0.5}px)` }}>
        {[
          { delay: 0, x: 5, size: 30, opacity: 0.15 },
          { delay: 1.2, x: 88, size: 22, opacity: 0.12 },
          { delay: 0.6, x: 75, size: 18, opacity: 0.1 },
          { delay: 2, x: 12, size: 26, opacity: 0.08 },
        ].map((p, i) => <FloatingPage key={i} {...p} />)}
      </div>

      <div style={{
        maxWidth: 1200, margin: '0 auto', width: '100%',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,380px),1fr))',
        gap: 'clamp(40px,6vw,80px)', alignItems: 'center',
      }}>
        {/* Left text */}
        <div style={{
          transition: 'all 0.9s cubic-bezier(0.34,1.56,0.64,1)',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateX(0)' : 'translateX(-40px)',
        }}>
          <div style={{
            display: 'inline-block', marginBottom: 16,
            padding: '6px 16px',
            background: 'rgba(168,85,247,0.15)',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: 99,
            fontFamily: "'Cinzel', serif",
            fontSize: '0.7rem', letterSpacing: '0.15em', color: '#A855F7',
          }}> Sening xayoling-sening olaming</div>
          <h2 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(2rem,5.5vw,3.8rem)',
            fontWeight: 700, lineHeight: 1.2,
            color: '#F1E8FF', marginBottom: 16,
          }}>
            Har bir xayol<br />
            <span style={{
              background: 'linear-gradient(135deg, #F3D89C 0%, #A855F7 60%, #C4B5FD 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Yangi bir olam!</span>
          </h2>
          <p style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 'clamp(0.95rem,2vw,1.15rem)',
            color: '#9B8EC4', lineHeight: 1.8, marginBottom: 36,
            fontWeight: 400,
          }}>
            O'z hikoyangni dunyoga ulash.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <button style={{
              padding: 'clamp(12px,2vw,16px) clamp(24px,3vw,36px)',
              background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #C026D3 100%)',
              border: 'none', borderRadius: 99, cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif", fontWeight: 700,
              fontSize: 'clamp(0.9rem,2vw,1rem)',
              color: '#fff', letterSpacing: '0.04em',
              boxShadow: '0 0 40px rgba(168,85,247,0.5), 0 4px 20px rgba(0,0,0,0.4)',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(168,85,247,0.7), 0 8px 30px rgba(0,0,0,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(168,85,247,0.5), 0 4px 20px rgba(0,0,0,0.4)'; }}
            > Boshlash</button>
            <button style={{
              padding: 'clamp(12px,2vw,16px) clamp(24px,3vw,36px)',
              background: 'transparent',
              border: '1px solid rgba(168,85,247,0.5)', borderRadius: 99, cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif", fontWeight: 600,
              fontSize: 'clamp(0.9rem,2vw,1rem)',
              color: '#C4B5FD', letterSpacing: '0.04em',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.9)'; e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
            > Hikoyalarni ko'rish</button>
          </div>
        </div>

        {/* Right illustration */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          transition: 'all 1s cubic-bezier(0.34,1.56,0.64,1) 0.2s',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateX(0) scale(1)' : 'translateX(40px) scale(0.9)',
        }}>
          <div style={{ position: 'relative', width: 'min(360px,90vw)', height: 'min(360px,90vw)' }}>
            {/* Glow ring */}
            <div style={{
              position: 'absolute', inset: -20,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(168,85,247,0.2) 0%, transparent 70%)',
              animation: 'pulse-glow 3s ease-in-out infinite',
            }} />
            {/* Logo image big */}
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%',
              padding: 6,
              background: 'linear-gradient(135deg, #7C3AED, #A855F7, #F3D89C, #A855F7)',
              boxShadow: '0 0 80px rgba(168,85,247,0.5), 0 0 160px rgba(168,85,247,0.15)',
              animation: 'spin-slow 20s linear infinite',
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
                <img src="/aylanmarasm.png" alt="Xayollar Ro'yosi world" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            {/* Orbiting stars */}
            {[0, 72, 144, 216, 288].map((deg, i) => (
              <div key={i} style={{
                position: 'absolute', top: '50%', left: '50%',
                width: 8, height: 8, marginTop: -4, marginLeft: -4,
                transform: `rotate(${deg}deg) translateX(calc(min(180px,45vw)))`,
                animation: `orbit 8s linear ${i * 1.6}s infinite`,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: i % 2 === 0 ? '#F3D89C' : '#A855F7',
                  boxShadow: `0 0 10px ${i % 2 === 0 ? '#F3D89C' : '#A855F7'}`,
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-page {
          from { transform: translateY(0) rotate(-5deg); }
          to   { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-glow {
          0%,100% { transform: scale(1); opacity:0.5; }
          50%      { transform: scale(1.05); opacity:1; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes orbit {
          from { transform: rotate(var(--start, 0deg)) translateX(calc(min(180px,45vw))); }
          to   { transform: rotate(calc(var(--start, 0deg) + 360deg)) translateX(calc(min(180px,45vw))); }
        }
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-burger  { display: block !important; }
        }
      `}</style>
    </section>
  );
}

interface GrowthCard { number: string; title: string; desc: string; img: string; }

const GROWTH_CARDS: GrowthCard[] = [
  { number: '01', title: "Hikoya yozish", desc: "O'z g'oyalaringizni hikoyaga aylantiring.", img: '/0.png' },
  { number: '02', title: "Komiks & Fanfic /nyaratish", desc: "Rasmlar bilan hikoyangizni jonlantiring.", img: '/2.png' },
  { number: '03', title: "Rasm chizish", desc: "Ijodingizni rasmda ifoda eting.", img: '/3.png' },
  { number: '04', title: "Tayyor /nelementlar", desc: "Tayyor qahramon va manzaralarni yig'ing.", img: '/4.png' },
  { number: '05', title: "Qahramonlar /nyaratish", desc: "Ko'rinishi va xarakterini belgilang.", img: '/5.png' },
  { number: '06', title: "Ovoz berish", desc: "Dialoglar yozing va jonlantiring.", img: '/6.png' },
  { number: '07', title: "Musiqa va /neffektlar", desc: "Mos musiqa va effektlar qo'shing.", img: '/7.png' },
  { number: '08', title: "Animatsiya /nyaratish", desc: "Hikoyangizni videoga aylantiring.", img: '/8.png' },
];

const SLIDE_INTERVAL = 2800; // har bir slayd necha millisoniya turadi

// gapning ikkiga bo'lingan rangi
const TWO_TONE = ['#C9A876', '#D8B4FE'];

// orqa fondagi miltillovchi yulduzlar — o'zgarishsiz
function OrbitStars({ count = 90 }: { count?: number }) {
  const stars = useMemo(() => Array.from({ length: count }, () => {
    const big = Math.random() > 0.85;
    return {
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: big ? Math.random() * 2.5 + 2.5 : Math.random() * 1.6 + 0.8,
      duration: Math.random() * 3 + 2.2,
      delay: Math.random() * 5,
      big,
    };
  }), [count]);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: s.big ? '#F3D89C' : '#ffffff',
            boxShadow: s.big
              ? '0 0 10px 2px rgba(243,216,156,0.7)'
              : '0 0 6px 1px rgba(255,255,255,0.6)',
            animation: `orbit-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function SlideText({ text, delayStep = 0.014, as: Tag = 'span', twoTone = false }: { text: string; delayStep?: number; as?: any; twoTone?: boolean }) {
  const lines = text.split('/n');
  const totalChars = lines.join('').length;
  const mid = Math.ceil(totalChars / 2);
  let globalIndex = 0;

  return (
    <Tag style={{ display: 'inline-block', overflow: 'hidden' }}>
      {lines.map((line, lineIdx) => (
        <React.Fragment key={`line-${lineIdx}`}>
          {lineIdx > 0 && <br />}
          {[...line].map((ch, i) => {
            const currentIndex = globalIndex;
            globalIndex++;
            return (
              <motion.span
                key={`${lineIdx}-${i}`}
                style={{
                  display: 'inline-block',
                  color: twoTone ? (currentIndex < mid ? TWO_TONE[0] : TWO_TONE[1]) : undefined,
                }}
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: '-110%', opacity: 0 }}
                transition={{ duration: 0.4, delay: currentIndex * delayStep, ease: [0.22, 1, 0.36, 1] }}
              >
                {ch === ' ' ? '\u00A0' : ch}
              </motion.span>
            );
          })}
        </React.Fragment>
      ))}
    </Tag>
  );
}

function OrbitFeatures() {
  const total = GROWTH_CARDS.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) setIndex((i) => (i + 1) % total);
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [total]);

  const card = GROWTH_CARDS[index];
  const goTo = (i: number) => setIndex(((i % total) + total) % total);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ position: 'relative', width: '100%', overflow: 'hidden' }}
    >
      <OrbitStars count={90} />

      <div className="story-grid">
        {/* CHAP TOMON — MATN */}
        <div className="story-text">
          <div className="story-index">
            <SlideText text={`${card.number} / ${String(total).padStart(2, '0')}`} twoTone />
          </div>

          <h3 className="story-title">
            <SlideText text={card.title} delayStep={0.014} twoTone />
          </h3>

          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${card.number}`}
              className="story-desc"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {card.desc}
            </motion.p>
          </AnimatePresence>

          <div className="story-dots">
            {GROWTH_CARDS.map((c, i) => (
              <button
                key={c.number}
                aria-label={`${c.number}-slaydga o'tish`}
                className={`story-dot ${i === index ? 'active' : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>

        {/* O'NG TOMON — RASM */}
        <div className="story-visual">
          <AnimatePresence mode="wait">
            <motion.div
              key={`img-${card.number}`}
              className="story-photo-wrap"
              initial={{ opacity: 0, x: 70, rotate: 5 }}
              animate={{ opacity: 1, x: 0, rotate: -2 }}
              exit={{ opacity: 0, x: -70, rotate: -6 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="story-photo-ghost"
                style={{ backgroundImage: `url(${card.img})` }}
              />
              <img
                src={card.img}
                alt={card.title.replace('/n', ' ')}
                className="story-photo-main"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @keyframes orbit-twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%      { opacity: 1;   transform: scale(1.3); }
        }
        .story-grid {
          position: relative; z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          align-items: center;
          gap: clamp(24px, 5vw, 64px);
          min-height: clamp(420px, 50vw, 560px);
          padding: clamp(20px, 3vw, 40px) 0;
        }
        @media (max-width: 760px) {
          .story-grid { grid-template-columns: 1fr; text-align: center; }
        }
        .story-index {
          font-family: 'Cinzel Decorative', serif; font-size: 1.05rem; letter-spacing: 0.25em;
          margin-bottom: 16px; text-transform: uppercase;
        }
        .story-title {
          font-family: 'Cormorant Garamond', serif; font-weight: 700;
          font-size: clamp(2.6rem, 5.4vw, 4.4rem); line-height: 1.08; margin: 0 0 20px;
        }
        .story-desc {
          font-family: 'Lora', serif; font-size: clamp(1.05rem, 1.9vw, 1.3rem);
          color: #C4B5FD; line-height: 1.75; max-width: 440px;
        }
        @media (max-width: 760px) {
          .story-desc { max-width: 100%; margin-left: auto; margin-right: auto; }
        }
        .story-dots {
          display: flex; gap: 10px; margin-top: 28px;
        }
        @media (max-width: 760px) {
          .story-dots { justify-content: center; }
        }
        .story-dot {
          width: 28px; height: 3px; border-radius: 2px; border: none; padding: 0;
          background: rgba(255,255,255,0.22); cursor: pointer;
          transition: background 0.25s ease, width 0.25s ease;
        }
        .story-dot.active { background: #A855F7; width: 44px; }

        .story-visual {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          min-height: clamp(300px, 34vw, 440px);
        }
        .story-photo-wrap {
          position: relative;
          width: clamp(240px, 30vw, 400px);
          height: clamp(300px, 36vw, 440px);
        }
        .story-photo-ghost {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          filter: blur(28px) brightness(0.55) saturate(120%);
          transform: scale(1.12) rotate(7deg) translate(20px, 16px);
          opacity: 0.55;
          border-radius: 26px;
        }
        .story-photo-main {
          position: absolute; inset: 0;
          width: 100%; height: 100%; object-fit: cover;
          border-radius: 22px;
          transform: rotate(-3deg);
          border: 1px solid rgba(255,255,255,0.16);
          box-shadow: 0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        @media (prefers-reduced-motion: reduce) {
          .story-dot { transition: none; }
        }
      `}</style>
    </div>
  );
}

function Features() {
  return (
    <section id="hikoyalar" style={{
      position: 'relative', overflow: 'hidden',
      padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)',
    }}>
      
      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        {/* SARLAVHA */}
        <div style={{ textAlign: 'center', margin: '0 auto clamp(24px,4vw,36px)', maxWidth: 640, position: 'relative', zIndex: 5 }}>
          <p style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: '0.90rem', letterSpacing: '0.2em', color: '#C4B5FD', marginBottom: 12 }}>
            IMKONIYATLAR
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, color: '#F1E8FF', lineHeight: 1.3,
            fontSize: 'clamp(2.4rem,5vw,4rem)',
          }}>
            Bu yerda nimalar{' '}
            <span style={{
              background: 'linear-gradient(135deg,#F3D89C,#A855F7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>qila olasiz?</span>
          </h2>
          <p style={{
            fontFamily: "'Lora',serif", fontSize: 'clamp(0.9rem,2vw,1.05rem)',
            color: '#C4B5FD', lineHeight: 1.8, marginTop: 16, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto',
          }}>
            Tasavvuringizdagi olamni yarating, boshqalar bilan ulashing va ijodingizni jonlantiring.
          </p>
        </div>

        <OrbitFeatures />
      </div>
    </section>
  );
}


import { Sparkles, Feather, Heart, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const POPULAR_CREATIONS = [
  { emoji: '🌙', img: '', title: 'Oy qizi', author: 'Nilufar', likes: 324, views: 1240 },
  { emoji: '🏰', img: '', title: "Sehrli qal'a", author: 'Jasur', likes: 201, views: 890 },
  { emoji: '🐉', img: '', title: "Ajdaho yo'li", author: 'Malika', likes: 587, views: 2100 },
  { emoji: '🌸', img: '', title: 'Bahor siri', author: 'Timur', likes: 98, views: 567 },
  { emoji: '⚔️', img: '', title: 'Botirlar', author: 'Sarvinoz', likes: 432, views: 1876 },
  { emoji: '🦋', img: '', title: "Ko'k kapalak", author: 'Bobur', likes: 176, views: 743 },
];

function useSectionInView(): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), {
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}

function slotStyle(offset: number) {
  const abs = Math.abs(offset);
  const base = {
    0: { scale: 1, y: -12, opacity: 1, blur: 0, z: 5, x: 0 },
    1: { scale: 0.8, y: 16, opacity: 0.55, blur: 1.5, z: 3, x: 190 },
    2: { scale: 0.62, y: 34, opacity: 0.2, blur: 3, z: 1, x: 330 },
  }[abs] || { scale: 0.5, y: 40, opacity: 0, blur: 4, z: 0, x: 420 };
  const dir = offset < 0 ? -1 : 1;
  return { ...base, x: base.x * dir };
}
interface PopularItem {
  emoji: string;
  img: string;
  title: string;
  author: string;
  likes: number;
  views: number;
}
function LanternCard({ item, offset }: { item: PopularItem; offset: number }) {
  const active = offset === 0;
  const s = slotStyle(offset);
  const [imgFailed, setImgFailed] = useState(false);
  const hasImg = Boolean(item.img) && !imgFailed;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: active ? 0 : 14,
        transform: `translateX(calc(-50% + ${s.x}px)) translateY(${s.y}px) scale(${s.scale})`,
        opacity: s.opacity,
        filter: s.blur ? `blur(${s.blur}px)` : 'none',
        zIndex: s.z,
        transition: 'transform 0.65s cubic-bezier(0.22,1,0.36,1), opacity 0.55s ease, filter 0.55s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: active ? 'auto' : 'none',
        width: 200,
      }}
    >
      {/* Main lantern pane */}
      <div
        className={active ? 'lantern-lit' : undefined}
        style={{
          position: 'relative',
          width: active ? 200 : 176,
          height: active ? 250 : 218,
          borderRadius: '96px 96px 18px 18px',
          overflow: 'hidden',
          border: active ? '1.5px solid rgba(243,216,156,0.55)' : '1px solid rgba(168,85,247,0.22)',
          background:
            'radial-gradient(ellipse at 50% 28%, rgba(124,58,237,0.4) 0%, rgba(18,11,34,0.95) 72%)',
          boxShadow: active
            ? '0 0 60px rgba(243,216,156,0.28), 0 0 40px rgba(168,85,247,0.35), 0 24px 48px rgba(0,0,0,0.55)'
            : '0 12px 28px rgba(0,0,0,0.45)',
        }}
      >
        {/* faint star texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(1.5px 1.5px at 20% 30%, rgba(255,255,255,0.5) 50%, transparent 100%),' +
              'radial-gradient(1.5px 1.5px at 70% 60%, rgba(255,255,255,0.4) 50%, transparent 100%),' +
              'radial-gradient(1px 1px at 45% 80%, rgba(255,255,255,0.35) 50%, transparent 100%)',
            opacity: 0.8,
          }}
        />
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {hasImg ? (
            <img
              src={item.img}
              alt={item.title}
              onError={() => setImgFailed(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span
              style={{
                fontSize: active ? '4rem' : '3rem',
                filter: `drop-shadow(0 0 ${active ? 22 : 10}px rgba(168,85,247,0.45))`,
              }}
            >
              {item.emoji}
            </span>
          )}
        </div>
      </div>

      {/* Brass base */}
      <div
        style={{
          width: active ? 116 : 100,
          height: 8,
          borderRadius: '0 0 8px 8px',
          background: 'linear-gradient(180deg, #8A6D3F 0%, #5B4526 100%)',
          boxShadow: '0 3px 8px rgba(0,0,0,0.5)',
        }}
      />

      {/* Text block — hidden on receded slots to avoid clutter */}
      <div style={{ opacity: active ? 1 : 0.75, transition: 'opacity 0.4s' }}>
        <h4
          style={{
            fontFamily: "'Cinzel',serif",
            fontWeight: 700,
            fontSize: active ? '1.12rem' : '0.92rem',
            color: '#F1E8FF',
            marginTop: 14,
            marginBottom: 6,
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          {item.title}
        </h4>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            marginBottom: 10,
          }}
        >
          <Feather size={12} color="#B79FE0" strokeWidth={2} />
          <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.8rem', color: '#B79FE0' }}>
            {item.author}
          </span>
        </div>

        {active && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'rgba(244,114,182,0.12)',
                border: '1px solid rgba(244,114,182,0.25)',
                borderRadius: 99,
                padding: '3px 9px',
                fontFamily: "'Nunito',sans-serif",
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#F472B6',
              }}
            >
              <Heart size={12} fill="#F472B6" strokeWidth={0} />
              {item.likes}
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'rgba(155,142,196,0.1)',
                border: '1px solid rgba(155,142,196,0.22)',
                borderRadius: 99,
                padding: '3px 9px',
                fontFamily: "'Nunito',sans-serif",
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#9B8EC4',
              }}
            >
              <Eye size={12} strokeWidth={2} />
              {item.views}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
function PopularSection() {
 const [sectionRef, inView] = useSectionInView();
  const total = POPULAR_CREATIONS.length;
  const [center, setCenter] = useState(2);

  const prev = () => setCenter((c) => (c - 1 + total) % total);
  const next = () => setCenter((c) => (c + 1) % total);

  const offsets = [-2, -1, 0, 1, 2];

  return (
    <section
      ref={sectionRef}
      style={{
        padding: 'clamp(60px,8vw,110px) clamp(20px,5vw,80px)',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 0%, #1a1030 0%, #0B0817 60%)',
        minHeight: '100vh',
      }}
    >
      <style>{`
        @import url('${FONT_IMPORT_URL}');
        @keyframes flicker {
          0%, 100% { filter: brightness(1); }
          45% { filter: brightness(1.08); }
          52% { filter: brightness(0.97); }
        }
        .lantern-lit { animation: flicker 4.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .lantern-lit { animation: none; }
        }
      `}</style>

      <div style={{ maxWidth: 1300, margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 'clamp(36px,5vw,56px)',
            transition: 'all 0.8s ease',
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <p
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: '0.78rem',
              letterSpacing: '0.25em',
              color: '#A855F7',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Sparkles size={13} /> MASHHUR IJODLAR <Sparkles size={13} />
          </p>
          <h2
            style={{
              fontFamily: "'Cinzel Decorative',serif",
              fontSize: 'clamp(2rem,4.5vw,3.2rem)',
              fontWeight: 700,
              color: '#F1E8FF',
            }}
          >
            Ijodkorlar{' '}
            <span
              style={{
                background: 'linear-gradient(135deg,#F3D89C,#A855F7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              dunyosi
            </span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '18px 0' }}>
            <span style={{ width: 60, height: 1, background: 'rgba(168,85,247,0.4)' }} />
            <Feather size={15} color="#A855F7" />
            <span style={{ width: 60, height: 1, background: 'rgba(168,85,247,0.4)' }} />
          </div>
        </div>

        {/* Carousel */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button
            onClick={prev}
            aria-label="Oldingi"
            style={arrowStyle('left')}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(168,85,247,0.28)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(20,14,35,0.7)')}
          >
            <ChevronLeft size={20} />
          </button>

          <div
            style={{
              position: 'relative',
              height: 380,
              width: '100%',
              maxWidth: 900,
            }}
          >
            {offsets.map((offset) => {
              const idx = ((center + offset) % total + total) % total;
              return <LanternCard key={idx} item={POPULAR_CREATIONS[idx]} offset={offset} />;
            })}
          </div>

          <button
            onClick={next}
            aria-label="Keyingi"
            style={arrowStyle('right')}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(168,85,247,0.28)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(20,14,35,0.7)')}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 'clamp(28px,4vw,40px)' }}>
          {POPULAR_CREATIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCenter(i)}
              aria-label={`${i + 1}-ijodga o'tish`}
              style={{
                width: i === center ? 26 : 8,
                height: 8,
                borderRadius: 99,
                border: 'none',
                background: i === center ? 'linear-gradient(90deg,#A855F7,#F3D89C)' : 'rgba(255,255,255,0.18)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function arrowStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    [side]: 'clamp(0px, 2vw, 20px)',
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'rgba(20,14,35,0.7)',
    backdropFilter: 'blur(6px)',
    border: '1px solid rgba(168,85,247,0.3)',
    color: '#E9DEFF',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  };
}
// ─── PARENTS SECTION ─────────────────────────────────────────────────────────
function ParentsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  const examples = [
    {
      circleColor: 'rgba(124,58,237,0.4)',
      title: 'Ilmiy hikoya',
      desc: 'Farzandingiz uchun qiziqarli ilmiy sarguzasht hikoyalari.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 20 15 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <rect x="13.2" y="6.2" width="6" height="2.4" rx="1.2" transform="rotate(45 13.2 6.2)" fill="currentColor"/>
          <circle cx="6" cy="18" r="2.4" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M17 4.5 19.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      circleColor: 'rgba(219,39,119,0.35)',
      title: 'Tarbiyaviy ertak',
      desc: "Yaxshi qadriyatlar o'rgatuvchi ertaklar to'plami.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 5.5c2-1 5-1 8 0v13c-3-1-6-1-8 0v-13Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
          <path d="M20 5.5c-2-1-5-1-8 0v13c3-1 6-1 8 0v-13Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      circleColor: 'rgba(124,58,237,0.4)',
      title: 'Qahramonli sarguzasht',
      desc: "Farzandingiz bosh qahramon bo'ladigan sarguzashtlar.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 3 19 6v5.5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
          <path d="M9.5 12.5 11 14l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  return (
    <section id="ota-onalar" ref={ref} style={{
      padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        <div style={{
          position: 'relative',
          borderRadius: 28,
          border: '1px solid rgba(168,85,247,0.2)',
          overflow: 'hidden', // rasm cardan chiqmasligi uchun
          padding: 'clamp(28px,5vw,56px)',
        }}>
          {/* Orqa fon rasmi */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url(/ota-ona.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }} />
          {/* Matn o'qilishi uchun qorong'ulashtiruvchi qatlam */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, rgba(10,7,20,0.92) 0%, rgba(10,7,20,0.75) 45%, rgba(10,7,20,0.5) 75%, rgba(10,7,20,0.6) 100%)',
            zIndex: 1,
          }} />
          {/* Tepadagi porlash chizig'i */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2, zIndex: 2,
            background: 'linear-gradient(90deg, transparent, #A855F7, #F3D89C, #A855F7, transparent)',
          }} />

          {/* Kontent — rasm ustida */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              maxWidth: 640,
              transition: 'all 0.8s ease',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(20px)',
              marginBottom: 'clamp(32px,5vw,48px)',
            }}>
              <p style={{
                fontFamily: "'Cinzel',serif", fontSize: '0.78rem',
                letterSpacing: '0.2em', color: '#C4B5FD', marginBottom: 16,
              }}>✦ OTA-ONALAR UCHUN</p>
              <h2 style={{
                fontFamily: "'Cinzel',serif", fontSize: 'clamp(1.8rem,3.6vw,2.8rem)',
                fontWeight: 700, color: '#F1E8FF', marginBottom: 20, lineHeight: 1.3,
              }}>
                Farzandingiz uchun o'z{' '}
                <span style={{
                  background: 'linear-gradient(135deg,#F3D89C,#A855F7)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>hikoyangizni</span>{' '}
                yarating
              </h2>
              <p style={{
                fontFamily: "'Nunito',sans-serif", fontSize: 'clamp(0.9rem,1.6vw,1.05rem)',
                color: '#D8CDEE', lineHeight: 1.8, marginBottom: 32,
              }}>
                Bolangizning sevimli qahramoni, rangi, va orzulari asosida maxsus ertak yarating. Farzandingiz har kuni yangi sarguzasht kashf etsin.
              </p>
              <button style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: 'clamp(12px,2vw,16px) clamp(24px,3vw,32px)',
                background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                border: 'none', borderRadius: 99, cursor: 'pointer',
                fontFamily: "'Nunito',sans-serif", fontWeight: 700,
                fontSize: 'clamp(0.9rem,1.6vw,1rem)',
                color: '#fff', letterSpacing: '0.02em',
                boxShadow: '0 0 30px rgba(168,85,247,0.5)',
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 45px rgba(168,85,247,0.7)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(168,85,247,0.5)'; }}
              >✦ Hikoya yaratishni boshlang</button>
            </div>

            {/* Pastki qator — 3 karta, rasm ustida */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,260px),1fr))',
              gap: 'clamp(14px,2vw,20px)',
            }}>
              {examples.map((ex, i) => (
                <div key={i} style={{
                  background: 'rgba(20,14,35,0.65)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(168,85,247,0.25)',
                  borderRadius: 16,
                  padding: 'clamp(18px,2.5vw,24px)',
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  position: 'relative',
                  transition: 'all 0.5s ease', transitionDelay: `${0.1 + i * 0.1}s`,
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(20px)',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)';
                    e.currentTarget.style.background = 'rgba(30,20,50,0.75)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(168,85,247,0.25)';
                    e.currentTarget.style.background = 'rgba(20,14,35,0.65)';
                  }}
                >
                  <div style={{
                    width: 48, height: 48, minWidth: 48, borderRadius: '50%',
                    background: ex.circleColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#F1E8FF',
                  }}>
                    {ex.icon}
                  </div>
                  <div style={{ flex: 1, paddingRight: 20 }}>
                    <h4 style={{
                      fontFamily: "'Cinzel',serif", fontSize: 'clamp(0.95rem,1.6vw,1.05rem)',
                      fontWeight: 600, color: '#F1E8FF', marginBottom: 6,
                    }}>{ex.title}</h4>
                    <p style={{
                      fontFamily: "'Nunito',sans-serif", fontSize: '0.82rem',
                      color: '#C4B5FD', lineHeight: 1.6,
                    }}>{ex.desc}</p>
                  </div>
                  <span style={{
                    position: 'absolute', right: 18, bottom: 18,
                    color: '#A855F7', fontSize: '1.1rem',
                  }}>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
// ─── FOOTER CTA ──────────────────────────────────────────────────────────────
function FooterCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <section style={{
      padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,80px)',
      textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(107,33,168,0.25) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.4), transparent)',
      }} />
      <div ref={ref} style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
        <p style={{
          fontFamily: "'Cinzel',serif", fontSize: '0.75rem',
          letterSpacing: '0.2em', color: '#7C3AED', marginBottom: 20,
          transition: 'all 0.8s ease', opacity: inView ? 1 : 0,
        }}> BUGUN BOSHLANG</p>
        <h2 style={{
          fontFamily: "'Cinzel Decorative',serif",
          fontSize: 'clamp(1.6rem,5vw,3.5rem)',
          fontWeight: 700, lineHeight: 1.25, marginBottom: 24,
          transition: 'all 0.9s ease 0.1s', opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(30px)',
        }}>
          <span style={{ color: '#F1E8FF' }}>Sening xayolingdagi<br /></span>
          <span style={{
            background: 'linear-gradient(135deg, #F3D89C 0%, #A855F7 50%, #C4B5FD 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>olam hali yaratilmagan.</span>
        </h2>
        <p style={{
          fontFamily: "'Nunito',sans-serif", fontSize: 'clamp(0.95rem,2vw,1.1rem)',
          color: '#9B8EC4', lineHeight: 1.8, marginBottom: 40,
          transition: 'all 0.9s ease 0.2s', opacity: inView ? 1 : 0,
        }}>
          Birinchi qadamni qo'y. Hikoyangni yoz. Olamingni dunyoga ko'rsat.
        </p>
        <button style={{
          padding: 'clamp(14px,2.5vw,18px) clamp(36px,5vw,56px)',
          background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #C026D3 100%)',
          border: 'none', borderRadius: 99, cursor: 'pointer',
          fontFamily: "'Cinzel',serif", fontWeight: 600,
          fontSize: 'clamp(0.95rem,2vw,1.1rem)',
          color: '#fff', letterSpacing: '0.08em',
          boxShadow: '0 0 60px rgba(168,85,247,0.5), 0 0 120px rgba(168,85,247,0.2)',
          transition: 'all 0.3s ease',
          transitionDelay: '0.3s',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(20px)',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 80px rgba(168,85,247,0.7), 0 0 160px rgba(168,85,247,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(168,85,247,0.5), 0 0 120px rgba(168,85,247,0.2)'; }}
        > Yaratishni boshlash</button>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socials = [
    {
      name: 'Telefon',
      href: 'tel:+998771560522', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      name: 'Telegram',
      href: 'https://t.me/nabiee_27', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M22 4.5 2.4 12.1c-.6.24-.6.85 0 1.06l5 1.66 1.9 6.1c.16.5.8.6 1.1.16l2.6-3.4 5.1 3.8c.6.44 1.5.1 1.6-.6L23 5.4c.14-.7-.4-1.2-1-.9Z" fill="currentColor"/>
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/02_shovkatov', // ← o'z havolangizni qo'ying
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6"/>
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6"/>
          <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor"/>
        </svg>
      ),
    },
  ];

  const quickLinks = [
    { label: 'Bosh sahifa', onClick: scrollToTop },
    { label: 'Biz haqimizda', href: '#biz-haqimizda' },
    { label: 'Bog\'lanish', href: '#boglanish' },
  ];

  return (
    <footer style={{
      position: 'relative',
      overflow: 'hidden',
      borderTop: '1px solid rgba(168,85,247,0.15)',
      padding: 'clamp(48px,6vw,72px) clamp(20px,5vw,80px) clamp(24px,3vw,32px)',
    }}>
      {/* Xira fon rasmi */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/fonn.png)', // ← haqiqiy fayl nomingiz
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(6px) saturate(110%)',
        opacity: 0.55,
        transform: 'scale(1.05)',
        pointerEvents: 'none',
      }} />
      {/* Glass (shisha) effekti — rasm ko'rinadi, lekin yengil xiralashadi */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(13,10,26,0.35)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1200, margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,220px),1fr))',
        gap: 'clamp(32px,5vw,48px)',
        marginBottom: 'clamp(32px,5vw,48px)',
      }}>
        {/* Logo + tavsif */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <img src="/logo.png" alt="logo" style={{
              width: 36, height: 36, borderRadius: '50%', objectFit: 'cover',
              border: '2px solid rgba(168,85,247,0.5)',
            }} />
            <span style={{
              fontFamily: "'Cinzel Decorative',serif", fontSize: '1rem', fontWeight: 700,
              background: 'linear-gradient(135deg, #F3D89C, #A855F7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Xayollar Ro'yosi</span>
          </div>
          <p style={{
            fontFamily: "'Nunito',sans-serif", fontSize: '0.85rem',letterSpacing: '0.1em',
            color: '#9B8EC4', lineHeight: 1.7, maxWidth: 260,
          }}>
            Yangi olam eshigi! 
          </p>
        </div>

        {/* Tezkor havolalar */}
        <div>
          <h5 style={{
            fontFamily: "'Cinzel',serif", fontSize: '0.85rem', letterSpacing: '0.1em',
            color: '#C4B5FD', marginBottom: 16, textTransform: 'uppercase',
          }}>Tezkor havolalar</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {quickLinks.map(l => (
              <a
                key={l.label}
                href={l.href || '#'}
                onClick={l.onClick ? (e => { e.preventDefault(); l.onClick(); }) : undefined}
                style={{
                  fontFamily: "'Nunito',sans-serif", fontSize: '0.85rem',
                  color: '#7C6A9E', textDecoration: 'none', transition: 'color 0.2s', width: 'fit-content',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#A855F7')}
                onMouseLeave={e => (e.currentTarget.style.color = '#7C6A9E')}
              >{l.label}</a>
            ))}
          </div>
        </div>

        {/* Bog'lanish */}
        <div>
          <h5 style={{
            fontFamily: "'Cinzel',serif", fontSize: '0.85rem', letterSpacing: '0.1em',
            color: '#C4B5FD', marginBottom: 16, textTransform: 'uppercase',
          }}>Aloqa</h5>
          <div style={{ display: 'flex', gap: 14 }}>
            {socials.map(s => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(168,85,247,0.12)',
                  border: '1px solid rgba(168,85,247,0.25)',
                  color: '#C4B5FD',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #7C3AED, #A855F7)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(168,85,247,0.12)';
                  e.currentTarget.style.color = '#C4B5FD';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >{s.icon}</a>
            ))}
          </div>
        </div>
      </div>

      {/* Pastki qator */}
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1200, margin: '0 auto',
        paddingTop: 'clamp(20px,3vw,28px)',
        borderTop: '1px solid rgba(215, 203, 226, 0.1)',
        textAlign: 'center',
      }}>
        <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.78rem', color: '#7b6a9e' }}>
          © 2026 Xayollar Ro'yosi · Barcha huquqlar himoyalangan
        </p>
      </div>
    </footer>
  );
}
// ─── HOME (asosiy sahifa) ────────────────────────────────────────────────────
export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [mounted, setMounted] = useState(false);
  const scrollY = useScrollY();

  useEffect(() => {
    setMounted(true);
    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShowIntro(false);
    }
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#0D0A1A', color: '#F1E8FF' }}>
      <StarCanvas count={150} />
      {showIntro && <Intro onDone={() => setShowIntro(false)} />}
      {!showIntro && (
        <>
          <Nav scrollY={scrollY} />
          <main>
            <Hero scrollY={scrollY} />
            <Features />
            <PopularSection />
            <ParentsSection />
            <FooterCTA />
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}