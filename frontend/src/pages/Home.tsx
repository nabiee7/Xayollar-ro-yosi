import React, { useState, useEffect, useRef } from 'react';

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Star { x: number; y: number; size: number; opacity: number; speed: number; }
interface Particle { x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string; }

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

// ─── STAR CANVAS ─────────────────────────────────────────────────────────────
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
        <button style={{
          padding: '8px 20px',
          background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
          border: 'none', borderRadius: 99, cursor: 'pointer',
          fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '0.85rem',
          color: '#fff', letterSpacing: '0.04em',
          boxShadow: '0 0 20px rgba(168,85,247,0.4)',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(168,85,247,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(168,85,247,0.4)'; }}
        > Kirish</button>
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

// ─── FEATURES CARD ───────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? 'linear-gradient(135deg, rgba(107,33,168,0.3) 0%, rgba(168,85,247,0.15) 100%)'
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? 'rgba(168,85,247,0.5)' : 'rgba(168,85,247,0.15)'}`,
        borderRadius: 20, padding: 'clamp(24px,3vw,36px)',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        transform: inView
          ? hovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)'
          : 'translateY(30px) scale(0.95)',
        opacity: inView ? 1 : 0,
        transitionDelay: `${delay}ms`,
        boxShadow: hovered ? '0 20px 60px rgba(107,33,168,0.3), 0 0 0 1px rgba(168,85,247,0.2)' : 'none',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {hovered && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 20,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}
      <div style={{
        fontSize: 'clamp(2rem,4vw,2.5rem)',
        marginBottom: 16,
        display: 'inline-block',
        transition: 'transform 0.4s',
        transform: hovered ? 'scale(1.2) rotate(-5deg)' : 'scale(1)',
      }}>{icon}</div>
      <h3 style={{
        fontFamily: "'Cinzel', serif",
        fontSize: 'clamp(1rem,2.2vw,1.25rem)',
        fontWeight: 600, color: '#E9D5FF',
        marginBottom: 10, letterSpacing: '0.04em',
      }}>{title}</h3>
      <p style={{
        fontFamily: "'Nunito', sans-serif",
        fontSize: 'clamp(0.85rem,1.8vw,0.95rem)',
        color: '#9B8EC4', lineHeight: 1.7,
      }}>{desc}</p>
      {hovered && (
        <div style={{
          position: 'absolute', bottom: 16, right: 20,
          fontSize: '0.75rem', color: '#A855F7',
          fontFamily: "'Nunito', sans-serif", letterSpacing: '0.08em',
          animation: 'fadeIn 0.3s ease',
        }}>Boshlash →</div>
      )}
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateX(5px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </div>
  );
}

function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const cards = [
    { icon: '📖', title: 'Hikoya yaratish', desc: 'Xayolingdagi voqeani yoz va dunyoga taqdim et.' },
    { icon: '🎨', title: 'Komiks yaratish', desc: 'Rasmlar va ranglar bilan hikoyangni jonlantir.' },
    { icon: '🎙', title: 'Ovoz berish', desc: 'Qahramonlarga o\'z ovozingni hadya qil.' },
    { icon: '🎬', title: 'Animatsiya', desc: 'Xayol olamingni animatsiyali videoga aylantir.' },
  ];

  return (
    <section id="hikoyalar" style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: '30%', right: 0,
        width: 400, height: 400,
        background: 'radial-gradient(ellipse, rgba(107,33,168,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div ref={ref} style={{ textAlign: 'center', marginBottom: 'clamp(40px,6vw,64px)' }}>
          <p style={{
            fontFamily: "'Cinzel', serif", fontSize: '0.75rem',
            letterSpacing: '0.2em', color: '#7C3AED', marginBottom: 12,
            transition: 'all 0.8s ease', opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(10px)',
          }}>IMKONIYATLAR</p>
          <h2 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(1.8rem,4.5vw,3rem)',
            fontWeight: 700, color: '#F1E8FF', lineHeight: 1.3,
            transition: 'all 0.8s ease 0.1s', opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(20px)',
          }}>Bu yerda nimalar<br /><span style={{
            background: 'linear-gradient(135deg,#F3D89C,#A855F7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>qila olasiz?</span></h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,240px), 1fr))',
          gap: 'clamp(16px,2.5vw,24px)',
        }}>
          {cards.map((c, i) => <FeatureCard key={i} {...c} delay={i * 100} />)}
        </div>
      </div>
    </section>
  );
}

// ─── POPULAR CREATIONS ───────────────────────────────────────────────────────
function CreationCard({ idx }: { idx: number }) {
  const [liked, setLiked] = useState(false);
  const covers = ['🌙', '🏰', '🐉', '🌸', '⚔️', '🦋'];
  const titles = ['Oy qizi', 'Sehrli qal\'a', 'Ajdaho yo\'li', 'Bahor sirli', 'Botirlar', 'Ko\'k kapalak'];
  const authors = ['Nilufar', 'Jasur', 'Malika', 'Timur', 'Sarvinoz', 'Bobur'];
  const views = [1240, 890, 2100, 567, 1876, 743];
  const likes = [324, 201, 587, 98, 432, 176];

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(168,85,247,0.15)',
      borderRadius: 16, overflow: 'hidden',
      transition: 'all 0.3s ease',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(107,33,168,0.25)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(168,85,247,0.15)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Cover */}
      <div style={{
        height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, rgba(107,33,168,0.4) 0%, rgba(13,10,26,0.8) 100%)`,
        fontSize: '4rem', position: 'relative',
      }}>
        {covers[idx % 6]}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 40%, rgba(13,10,26,0.6) 100%)',
        }} />
      </div>
      {/* Info */}
      <div style={{ padding: '16px 20px' }}>
        <h4 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '1rem', fontWeight: 600,
          color: '#E9D5FF', marginBottom: 6,
        }}>{titles[idx % 6]}</h4>
        <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.8rem', color: '#7C6A9E', marginBottom: 12 }}>
          ✍️ {authors[idx % 6]}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <button onClick={() => setLiked(!liked)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'Nunito',sans-serif", fontSize: '0.8rem',
              color: liked ? '#F472B6' : '#7C6A9E',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 4,
              transform: liked ? 'scale(1.2)' : 'scale(1)',
            }}>❤️ {likes[idx % 6] + (liked ? 1 : 0)}</button>
            <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.8rem', color: '#7C6A9E', display: 'flex', alignItems: 'center', gap: 4 }}>
              👁 {views[idx % 6]}
            </span>
          </div>
          <span style={{
            padding: '3px 10px', borderRadius: 99,
            background: 'rgba(168,85,247,0.15)',
            fontFamily: "'Nunito',sans-serif", fontSize: '0.7rem', color: '#A855F7',
          }}>Hikoya</span>
        </div>
      </div>
    </div>
  );
}

function PopularSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <section id="ijodlar" style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 500, height: 300,
        background: 'radial-gradient(ellipse, rgba(107,33,168,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div ref={ref} style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          marginBottom: 'clamp(32px,5vw,48px)', flexWrap: 'wrap', gap: 16,
          transition: 'all 0.8s ease', opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)',
        }}>
          <div>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: '0.75rem', letterSpacing: '0.2em', color: '#7C3AED', marginBottom: 10 }}>
              🔥 MASHHUR IJODLAR
            </p>
            <h2 style={{
              fontFamily: "'Cinzel',serif", fontSize: 'clamp(1.8rem,4vw,2.8rem)',
              fontWeight: 700, color: '#F1E8FF',
            }}>Ijodkorlar<br /><span style={{ background: 'linear-gradient(135deg,#F3D89C,#A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>dunyosi</span></h2>
          </div>
          <button style={{
            padding: '10px 24px', background: 'transparent',
            border: '1px solid rgba(168,85,247,0.4)', borderRadius: 99, cursor: 'pointer',
            fontFamily: "'Nunito',sans-serif", fontWeight: 600, fontSize: '0.85rem', color: '#C4B5FD',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.7)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)'; }}
          >Barchasini ko'rish →</button>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,200px),1fr))',
          gap: 'clamp(14px,2vw,20px)',
        }}>
          {[0, 1, 2, 3, 4, 5].map(i => <CreationCard key={i} idx={i} />)}
        </div>
      </div>
    </section>
  );
}

// ─── PARENTS SECTION ─────────────────────────────────────────────────────────
function ParentsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const examples = [
    { icon: '🔭', title: 'Ilmiy hikoya', desc: 'Farzandingiz uchun qiziqarli ilmiy sarguzasht' },
    { icon: '🌿', title: 'Tarbiyaviy ertak', desc: 'Yaxshi qadriyatlar o\'rgatuvchi ertaklar' },
    { icon: '🦸', title: 'Qahramonli sarguzasht', desc: 'Farzandingiz bosh qahramon bo\'ladi' },
  ];

  return (
    <section id="ota-onalar" style={{
      padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative moon */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, rgba(243,216,156,0.08) 0%, transparent 70%)',
        border: '1px solid rgba(243,216,156,0.06)',
        pointerEvents: 'none',
      }} />
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(107,33,168,0.2) 0%, rgba(13,10,26,0.6) 50%, rgba(76,29,149,0.2) 100%)',
          border: '1px solid rgba(168,85,247,0.2)',
          borderRadius: 28, padding: 'clamp(32px,5vw,64px)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, #A855F7, #F3D89C, #A855F7, transparent)',
          }} />
          <div ref={ref} style={{ textAlign: 'center', marginBottom: 'clamp(32px,5vw,48px)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>👨‍👩‍👧</div>
            <p style={{
              fontFamily: "'Cinzel',serif", fontSize: '0.75rem',
              letterSpacing: '0.2em', color: '#7C3AED', marginBottom: 12,
              transition: 'all 0.8s ease', opacity: inView ? 1 : 0,
            }}> OTA-ONALAR UCHUN</p>
            <h2 style={{
              fontFamily: "'Cinzel',serif", fontSize: 'clamp(1.6rem,4vw,2.8rem)',
              fontWeight: 700, color: '#F1E8FF', marginBottom: 16, lineHeight: 1.3,
              transition: 'all 0.8s ease 0.1s', opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(20px)',
            }}>Farzandingiz uchun o'z<br /><span style={{ background: 'linear-gradient(135deg,#F3D89C,#A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>hikoyangizni yarating</span></h2>
            <p style={{
              fontFamily: "'Nunito',sans-serif", fontSize: 'clamp(0.9rem,2vw,1.05rem)',
              color: '#9B8EC4', lineHeight: 1.8, maxWidth: 560, margin: '0 auto',
              transition: 'all 0.8s ease 0.2s', opacity: inView ? 1 : 0,
            }}>
              Bolangizning sevimli qahramoni, rangi, va orzulari asosida maxsus ertak yarating. Farzandingiz har kuni yangi sarguzasht kashf etsin.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,220px),1fr))',
            gap: 'clamp(16px,2.5vw,24px)',
          }}>
            {examples.map((ex, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(168,85,247,0.2)',
                borderRadius: 16, padding: 'clamp(20px,3vw,28px)',
                textAlign: 'center',
                transition: 'all 0.8s ease', transitionDelay: `${0.1 + i * 0.1}s`,
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(20px)',
              }}>
                <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>{ex.icon}</div>
                <h4 style={{
                  fontFamily: "'Cinzel',serif", fontSize: 'clamp(0.9rem,1.8vw,1rem)',
                  fontWeight: 600, color: '#E9D5FF', marginBottom: 8,
                }}>{ex.title}</h4>
                <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.85rem', color: '#7C6A9E', lineHeight: 1.6 }}>{ex.desc}</p>
              </div>
            ))}
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
        }}>✨ BUGUN BOSHLANG</p>
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
        >✨ Yaratishni boshlash</button>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(168,85,247,0.15)',
      padding: 'clamp(32px,5vw,48px) clamp(20px,5vw,80px)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/logo.png" alt="logo" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(168,85,247,0.5)' }} />
        <span style={{
          fontFamily: "'Cinzel Decorative',serif", fontSize: '0.95rem', fontWeight: 700,
          background: 'linear-gradient(135deg, #F3D89C, #A855F7)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>Xayollar Ro'yosi</span>
      </div>
      <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.8rem', color: '#4A3B6B', textAlign: 'center' }}>
        © 2024 Xayollar Ro'yosi · Barcha huquqlar himoyalangan
      </p>
      <div style={{ display: 'flex', gap: 20 }}>
        {['Instagram', 'TikTok', 'Telegram'].map(s => (
          <a key={s} href="#" style={{
            fontFamily: "'Nunito',sans-serif", fontSize: '0.8rem', color: '#6B5A8E',
            textDecoration: 'none', transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#A855F7')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6B5A8E')}
          >{s}</a>
        ))}
      </div>
    </footer>
  );
}

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