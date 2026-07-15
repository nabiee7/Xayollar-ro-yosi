import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, BookOpen, PenLine, LayoutGrid, User, Images, Mic, Music2,
  Sparkles, Video, Heart, MessageSquare, Bell, Search, Crown, Settings,
  Plus, Eye, Compass, TrendingUp, Clock3, Baby, Film, GraduationCap,
  MessagesSquare, Ghost, Menu, X, ChevronRight, Shield,
} from 'lucide-react';

const FONT_IMPORT_URL =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700&family=Cormorant+Garamond:wght@700&family=Lora:wght@400&family=Nunito:wght@400;600;700&display=swap";

/* ────────────────────────────────────────────────────────────────────────
   RASMLAR — bu yerga o'zingizning rasm manzillaringizni (URL yoki import
   qilingan fayl) qo'ying. Bo'sh qoldirsangiz eski ko'rinish (icon/gradient)
   avtomatik ishlatiladi, hech narsa buzilmaydi.
   ──────────────────────────────────────────────────────────────────── */
const IMAGES = {
  
  logo: '/logo.png',            // masalan: '/assets/logo.png' — sidebar'dagi doira logo
  heroCharacter: '/dashboard.png',    // masalan: '/assets/hero-moon-girl.png' — katta oy card'idagi rasm
  parentsBanner: '/oila.png',    // masalan: '/assets/parents-banner.png' — "Aqlli va axloqli farzand..." card'i
};

/* ────────────────────────────────────────────────────────────────────────
   DATA
   ──────────────────────────────────────────────────────────────────── */
interface NavItem { label: string; icon: React.ReactNode; }

const MAIN_NAV: NavItem[] = [
  { label: 'Bosh sahifa', icon: <Home size={18} /> },
  { label: 'Mening hikoyalarim', icon: <BookOpen size={18} /> },
  { label: 'Yangi hikoya yaratish', icon: <PenLine size={18} /> },
  { label: 'Komiks yaratish', icon: <LayoutGrid size={18} /> },
  { label: 'Personajlar', icon: <User size={18} /> },
  { label: 'Rasmlar galereyasi', icon: <Images size={18} /> },
  { label: 'Ovozlar', icon: <Mic size={18} /> },
  { label: 'Musiqa', icon: <Music2 size={18} /> },
  { label: 'Jonlantirish', icon: <Sparkles size={18} /> },
  { label: 'Videolar', icon: <Video size={18} /> },
  { label: 'Sevimlilar', icon: <Heart size={18} /> },
  { label: 'Fikrlar va sharhlar', icon: <MessageSquare size={18} /> },
  { label: 'Bildirishnomalar', icon: <Bell size={18} /> },
];

const CATEGORY_NAV: NavItem[] = [
  { label: 'Janrlar', icon: <Compass size={18} /> },
  { label: 'Trenddagi hikoyalar', icon: <TrendingUp size={18} /> },
  { label: "Yangi qo'shilganlar", icon: <Clock3 size={18} /> },
];

const PARENTS_NAV: NavItem[] = [
  { label: 'Farzandim uchun yaratish', icon: <Baby size={18} /> },
  { label: 'Tarbiyaviy animelar', icon: <Film size={18} /> },
  { label: 'Ota-onalar uchun maslahatlar', icon: <MessagesSquare size={18} /> },
  { label: 'Ilmiy va tarbiyaviy kontent', icon: <GraduationCap size={18} /> },
];

interface QuickAction { title: string; sub: string; icon: React.ReactNode; }
const QUICK_ACTIONS: QuickAction[] = [
  { title: 'Yangi hikoya', sub: 'Yaratish', icon: <BookOpen size={20} /> },
  { title: 'Komiks', sub: 'Yaratish', icon: <LayoutGrid size={20} /> },
  { title: 'Personajlar', sub: 'Yaratish', icon: <User size={20} /> },
  { title: 'Rasm chizish', sub: 'Canvas', icon: <PenLine size={20} /> },
  { title: 'Ovoz yozish', sub: 'Studio', icon: <Mic size={20} /> },
  { title: "Musiqa qo'shish", sub: 'Kutubxona', icon: <Music2 size={20} /> },
  { title: 'Jonlantirish', sub: 'Animate', icon: <Sparkles size={20} /> },
  { title: 'Video yaratish', sub: 'Render', icon: <Video size={20} /> },
  { title: 'Galereya', sub: 'Mening rasmlarim', icon: <Images size={20} /> },
  { title: 'Sevimlilar', sub: 'Saqlanganlar', icon: <Heart size={20} /> },
];

interface StoryCard { title: string; genre: string; img: string; comments: number; views: number; likes: number; draft?: boolean; }
const STORIES: StoryCard[] = [
  { title: 'Yulduzlar ortidagi sir', genre: 'Fantastika', img: '', comments: 12, views: 245, likes: 89, draft: true },
  { title: "Sehrli o'rmon", genre: 'Sarguzasht', img: '', comments: 8, views: 176, likes: 64 },
  { title: "Yo'qolgan xotiralar", genre: 'Drama', img: '', comments: 15, views: 312, likes: 120 },
  { title: 'Kelajak sari qadam', genre: 'Sci-Fi', img: '', comments: 10, views: 201, likes: 77 },
];

interface Genre { name: string; count: number; icon: React.ReactNode; }
const GENRES: Genre[] = [
  { name: 'Fantastika', count: 128, icon: <Sparkles size={15} /> },
  { name: 'Sarguzasht', count: 96, icon: <Compass size={15} /> },
  { name: 'Drama', count: 84, icon: <Film size={15} /> },
  { name: 'Ilmiy', count: 73, icon: <GraduationCap size={15} /> },
  { name: 'Komediya', count: 62, icon: <Sparkles size={15} /> },
  { name: 'Tarixiy', count: 51, icon: <BookOpen size={15} /> },
  { name: 'Romantika', count: 49, icon: <Heart size={15} /> },
  { name: 'Tarbiyaviy', count: 68, icon: <Baby size={15} /> },
  { name: 'Misteriya', count: 40, icon: <Ghost size={15} /> },
];

/* ────────────────────────────────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────────────────────────────── */
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = () => setMatches(mql.matches);
    handler();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

/* ────────────────────────────────────────────────────────────────────────
   AMBIENT STARS — butun sahifa fonida sekin qimirlab/miltillab turadigan
   yulduzchalar. position:fixed bo'lgani uchun barcha bo'limlar ortida
   ko'rinadi va scroll bilan birga qoladi.
   ──────────────────────────────────────────────────────────────────── */
function AmbientStars() {
  const stars = React.useMemo(() => {
    return Array.from({ length: 55 }).map((_, i) => {
      const size = Math.random() * 2 + 1;
      return {
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size,
        drift: Math.random() * 18 + 10,
        duration: Math.random() * 8 + 7,
        delay: Math.random() * 8,
        bright: i % 5 === 0,
      };
    });
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {stars.map(s => (
        <span
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.bright ? s.size + 1.5 : s.size,
            height: s.bright ? s.size + 1.5 : s.size,
            borderRadius: '50%',
            background: s.bright ? '#F3D89C' : '#C9B8F0',
            boxShadow: s.bright
              ? '0 0 8px rgba(243,216,156,0.9)'
              : '0 0 5px rgba(201,184,240,0.7)',
            opacity: 0.55,
            '--drift': `${s.drift}px`,
            animation:
              `star-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite, ` +
              `star-float ${s.duration * 1.6}s ease-in-out ${s.delay}s infinite`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   SIDEBAR
   ──────────────────────────────────────────────────────────────────── */
function Sidebar({ open, onClose, active, setActive }: {
  open: boolean; onClose: () => void; active: string; setActive: (s: string) => void;
}) {
  const navigate = useNavigate();

  const renderItem = (item: NavItem) => {
    const isActive = active === item.label;
    return (
      <button
        key={item.label}
        onClick={() => { setActive(item.label); onClose(); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
          padding: '9px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: isActive ? 'rgba(168,85,247,0.18)' : 'transparent',
          color: isActive ? '#F3D89C' : '#B3A6D6',
          fontFamily: "'Nunito', sans-serif", fontSize: '0.87rem', fontWeight: isActive ? 700 : 600,
          textAlign: 'left', transition: 'all 0.18s ease',
        }}
        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(168,85,247,0.08)'; e.currentTarget.style.color = '#E9DEFF'; } }}
        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#B3A6D6'; } }}
      >
        <span style={{ display: 'flex', color: isActive ? '#F3D89C' : '#8A79B8' }}>{item.icon}</span>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
      </button>
    );
  };

  return (
    <>
      {open && (
        <div onClick={onClose} className="sidebar-scrim" />
      )}
      <aside className={`app-sidebar ${open ? 'sidebar-open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 4px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{
              width: 54, height: 54, borderRadius: '50%',
              background: 'linear-gradient(135deg,#7C3AED,#A855F7,#F3D89C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 3,
              overflow: 'hidden',
            }}>
              {IMAGES.logo ? (
                // O'z logo rasmingiz shu yerga tushadi (doira ichida to'liq qoplaydi)
                <img
                  src={IMAGES.logo}
                  alt="Xayollar ro'yosi logotipi"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%',
                  background: 'radial-gradient(ellipse at 50% 35%,#3b1e63 0%,#150c28 75%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={20} color="#F3D89C" />
                </div>
              )}
            </div>
            <div>
              <div style={{
                fontFamily: "'Cinzel Decorative', serif", fontWeight: 700, fontSize: '0.95rem',
                background: 'linear-gradient(135deg,#F3D89C,#A855F7)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                lineHeight: 1.2,
              }}>Xayollar ro'yosi</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.62rem', color: '#7C6A9E', letterSpacing: '0.04em' }}>
                Tasavvuringdagi olamni yarat
              </div>
            </div>
          </div>
          <button onClick={onClose} className="sidebar-close-btn" aria-label="Yopish">
            <X size={20} color="#B3A6D6" />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto', flex: 1 }}>
          {MAIN_NAV.map(renderItem)}

          <div style={{
            fontFamily: "'Nunito',sans-serif", fontSize: '0.68rem', fontWeight: 700,
            color: '#5F4F87', letterSpacing: '0.12em', margin: '18px 14px 6px',
          }}>KATEGORIYALAR</div>
          {CATEGORY_NAV.map(renderItem)}

          <div style={{
            fontFamily: "'Nunito',sans-serif", fontSize: '0.68rem', fontWeight: 700,
            color: '#5F4F87', letterSpacing: '0.12em', margin: '18px 14px 6px',
          }}>OTA-ONALAR BO'LIMI</div>
          {PARENTS_NAV.map(renderItem)}
        </nav>

        <div style={{ paddingTop: 12, borderTop: '1px solid rgba(168,85,247,0.12)' }}>
          {renderItem({ label: 'Sozlamalar', icon: <Settings size={18} /> })}
        </div>
      </aside>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   TOPBAR
   ──────────────────────────────────────────────────────────────────── */
function Topbar({ onMenuClick, userName }: { onMenuClick: () => void; userName: string }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: 'clamp(14px,2vw,20px) 0', marginBottom: 'clamp(16px,2.5vw,28px)',
      flexWrap: 'wrap',
    }}>
      <button onClick={onMenuClick} className="menu-toggle-btn" aria-label="Menyu">
        <Menu size={22} color="#E9DEFF" />
      </button>

      <div style={{ flex: '1 1 220px', minWidth: 0 }}>
        <div style={{
          fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 'clamp(1rem,2vw,1.25rem)',
          color: '#F1E8FF', display: 'flex', alignItems: 'center', gap: 8,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          Xush kelibsiz, {userName}! <Sparkles size={16} color="#F3D89C" />
        </div>
        <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.82rem', color: '#9B8EC4' }}>
          Bugun ham yangi olam yarating
        </div>
      </div>

      <div className="topbar-search" style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,85,247,0.2)',
        borderRadius: 99, padding: '10px 18px', flex: '1 1 260px', maxWidth: 420,
      }}>
        <Search size={16} color="#8A79B8" />
        <input
          placeholder="Qidirish..."
          style={{
            background: 'transparent', border: 'none', outline: 'none', width: '100%',
            fontFamily: "'Nunito',sans-serif", fontSize: '0.88rem', color: '#E9DEFF',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
        <button className="premium-btn" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 99, cursor: 'pointer',
          background: 'rgba(243,216,156,0.12)', border: '1px solid rgba(243,216,156,0.4)',
          fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '0.8rem', color: '#F3D89C',
        }}>
          <Crown size={14} /> Premium
        </button>
        <button aria-label="Bildirishnomalar" style={{
          width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(168,85,247,0.2)', cursor: 'pointer',
        }}><Bell size={17} color="#C4B5FD" /></button>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: 'linear-gradient(135deg,#A855F7,#7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Cinzel',serif", fontWeight: 700, color: '#fff', fontSize: '1rem',
          border: '2px solid rgba(243,216,156,0.5)', flexShrink: 0,
        }}>{userName.charAt(0).toUpperCase()}</div>
      </div>
    </header>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   HERO BANNER
   ──────────────────────────────────────────────────────────────────── */
function HeroBanner() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 22,
        padding: "clamp(28px,5vw,56px) clamp(24px,5vw,52px)",
        minHeight: "clamp(220px,32vw,300px)",
        display: "flex",
        alignItems: "center",
        background:
          "radial-gradient(ellipse at 75% 30%, rgba(124,58,237,0.5) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(243,216,156,0.12) 0%, transparent 60%), linear-gradient(135deg,#1c1033 0%,#100a20 100%)",
        marginBottom: "clamp(20px,3vw,32px)",
      }}
    >
      {/* Background Image */}
      {IMAGES.heroCharacter && (
        <>
          <img
            src={IMAGES.heroCharacter}
            alt="Hero"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              borderRadius: 22,
              zIndex: 0,
            }}
          />

          {/* Dark Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 22,
              background:
                "linear-gradient(120deg, rgba(13,10,26,.72), rgba(13,10,26,.58))",
              zIndex: 1,
            }}
          />
        </>
      )}


      {/* Stars */}
      {[...Array(14)].map((_, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${(i * 37) % 90 + 3}%`,
            top: `${(i * 53) % 80 + 5}%`,
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            borderRadius: "50%",
            background: "#F3D89C",
            opacity: 0.7,
            boxShadow: "0 0 6px rgba(243,216,156,0.8)",
            animation: `star-twinkle ${4 + (i % 5)}s ease-in-out ${
              i * 0.3
            }s infinite, star-float ${6 + (i % 4)}s ease-in-out ${
              i * 0.2
            }s infinite`,
            zIndex: 2,
          }}
        />
      ))}

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          maxWidth: 480,
        }}
      >
        <h1
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontWeight: 700,
            fontSize: "clamp(1.8rem,4.6vw,2.8rem)",
            color: "#F1E8FF",
            marginBottom: 10,
            lineHeight: 1.2,
          }}
        >
          Xayollar ro'yosi
        </h1>

        <p
          style={{
            fontFamily: "'Lora',serif",
            fontSize: "clamp(0.9rem,1.8vw,1.05rem)",
            color: "#C4B5FD",
            marginBottom: 28,
          }}
        >
          Tasavvuringdagi olamni yarat
        </p>

        <div
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 99,
              cursor: "pointer",
              border: "none",
              background: "linear-gradient(135deg,#7C3AED,#A855F7)",
              fontFamily: "'Nunito',sans-serif",
              fontWeight: 700,
              fontSize: "0.88rem",
              color: "#fff",
              boxShadow: "0 0 30px rgba(168,85,247,0.45)",
            }}
          >
            <PenLine size={15} />
            Yangi hikoya yaratish
          </button>

          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 99,
              cursor: "pointer",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.2)",
              fontFamily: "'Nunito',sans-serif",
              fontWeight: 700,
              fontSize: "0.88rem",
              color: "#E9DEFF",
            }}
          >
            <LayoutGrid size={15} />
            Komiks yaratish
          </button>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   QUICK ACTIONS
   ──────────────────────────────────────────────────────────────────── */
function QuickActions() {
  return (
    <section style={{ marginBottom: 'clamp(20px,3vw,32px)' }}>
      <h3 style={{
        fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 'clamp(1rem,1.8vw,1.15rem)',
        color: '#F1E8FF', marginBottom: 14,
      }}>Tezkor kirish</h3>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: 12,
      }}>
        {QUICK_ACTIONS.map(a => (
          <button key={a.title} style={{
            display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
            padding: '14px 14px', borderRadius: 14, cursor: 'pointer',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168,85,247,0.16)',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.16)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <span style={{
              width: 40, height: 40, minWidth: 40, borderRadius: 12, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(168,85,247,0.16)', color: '#D8B4FE',
            }}>{a.icon}</span>
            <span style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '0.85rem', color: '#F1E8FF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.72rem', color: '#8A79B8' }}>{a.sub}</div>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   MY STORIES
   ──────────────────────────────────────────────────────────────────── */
function StoryThumb({ genre }: { genre: string }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'radial-gradient(ellipse at 30% 20%, rgba(168,85,247,0.4) 0%, rgba(20,12,38,0.9) 70%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <BookOpen size={30} color="rgba(243,216,156,0.5)" />
      <span style={{ position: 'absolute', bottom: 10, left: 12, fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: "'Nunito',sans-serif" }}>{genre}</span>
    </div>
  );
}

function MyStories() {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 'clamp(1rem,1.8vw,1.15rem)', color: '#F1E8FF' }}>
          Mening hikoyalarim
        </h3>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Nunito',sans-serif", fontSize: '0.82rem', color: '#A855F7', textDecoration: 'none' }}>
          Barchasi <ChevronRight size={14} />
        </a>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 16,
      }}>
        {STORIES.map(s => (
          <div key={s.title} style={{
            borderRadius: 16, overflow: 'hidden',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168,85,247,0.16)',
            transition: 'all 0.25s ease', cursor: 'pointer',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.16)'; }}
          >
            <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3' }}>
              <StoryThumb genre={s.genre} />
              {s.draft && (
                <span style={{
                  position: 'absolute', top: 10, left: 10,
                  padding: '3px 10px', borderRadius: 99, fontSize: '0.62rem', fontWeight: 700,
                  background: 'rgba(0,0,0,0.55)', color: '#F3D89C', fontFamily: "'Nunito',sans-serif",
                  letterSpacing: '0.05em',
                }}>Draft</span>
              )}
            </div>
            <div style={{ padding: '12px 14px 14px' }}>
              <h4 style={{
                fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: '0.92rem', color: '#F1E8FF',
                marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{s.title}</h4>
              <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.75rem', color: '#8A79B8', marginBottom: 10 }}>{s.genre}</p>
              <div style={{ display: 'flex', gap: 12, fontFamily: "'Nunito',sans-serif", fontSize: '0.72rem', color: '#7C6A9E' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageSquare size={12} />{s.comments}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={12} />{s.views}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Heart size={12} />{s.likes}</span>
              </div>
            </div>
          </div>
        ))}
        {/* Add card */}
        <button style={{
          borderRadius: 16, border: '1.5px dashed rgba(168,85,247,0.35)', background: 'rgba(168,85,247,0.04)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
          minHeight: 200, cursor: 'pointer', color: '#B79FE0',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.04)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.35)'; }}
        >
          <span style={{
            width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(168,85,247,0.16)',
          }}><Plus size={20} /></span>
          <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}>Yangi hikoya<br />yaratish</span>
        </button>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   RIGHT RAIL
   ──────────────────────────────────────────────────────────────────── */
function GenresCard() {
  return (
    <div style={{
      borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168,85,247,0.16)',
      padding: '20px 18px', marginBottom: 18,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h4 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: '0.98rem', color: '#F1E8FF' }}>Janrlar</h4>
        <a href="#" style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.75rem', color: '#A855F7', textDecoration: 'none' }}>Barchasi</a>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {GENRES.map(g => (
          <div key={g.name} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 8px', borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(168,85,247,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'Nunito',sans-serif", fontSize: '0.85rem', color: '#D8CDEE' }}>
              <span style={{ color: '#A855F7', display: 'flex' }}>{g.icon}</span>{g.name}
            </span>
            <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.78rem', color: '#7C6A9E', fontWeight: 700 }}>{g.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ParentsCard() {
  return (
    <div style={{
      borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168,85,247,0.16)',
      padding: '20px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Heart size={15} color="#F3D89C" />
        <h4 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: '0.98rem', color: '#F1E8FF' }}>Ota onalar bo'limi</h4>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {PARENTS_NAV.map(p => (
          <div key={p.label} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '10px 8px', borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(168,85,247,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{
              width: 32, height: 32, minWidth: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(168,85,247,0.14)', color: '#D8B4FE',
            }}>{p.icon}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '0.82rem', color: '#F1E8FF' }}>{p.label}</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.7rem', color: '#8A79B8' }}>Batafsil ma'lumot</div>
            </div>
          </div>
        ))}
      </div>
      <button style={{
        width: '100%', marginTop: 14, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
        background: 'rgba(168,85,247,0.14)', color: '#D8B4FE',
        fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '0.8rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>Batafsil bo'limga o'tish <ChevronRight size={14} /></button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   BOTTOM BANNER ---------*/
   
    function BottomBanner() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 18,
        marginTop: "clamp(20px,3vw,32px)",
        border: "1px solid rgba(168,85,247,0.2)",
        display: "flex",
        alignItems: "center",
        gap: 20,
        flexWrap: "wrap",
        padding: "clamp(20px,3vw,28px)",
        minHeight: 180,
      }}
    >
      {/* Background Image */}
      {IMAGES.parentsBanner && (
        <img
          src={IMAGES.parentsBanner}
          alt="Parents Banner"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            zIndex: 0,
          }}
        />
      )}

      {/* Dark Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(120deg, rgba(13,10,26,.72), rgba(13,10,26,.58))",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Icon */}
      <span
        style={{
          position: "relative",
          zIndex: 2,
          width: 52,
          height: 52,
          minWidth: 52,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(168,85,247,0.2)",
          color: "#F3D89C",
        }}
      >
        <Shield size={24} />
      </span>

      {/* Text */}
      <div
        style={{
          flex: "1 1 260px",
          minWidth: 0,
          position: "relative",
          zIndex: 2,
        }}
      >
        <h4
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            fontSize: "clamp(0.95rem,1.8vw,1.1rem)",
            color: "#F1E8FF",
            marginBottom: 4,
          }}
        >
          Aqlli va axloqli farzand tarbiyalash uchun
        </h4>

        <p
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: "0.90rem",
            color: "#7C6A9E",
          }}
        >
          Ilmiy asoslangan tarbiyaviy animelar va hikoyalar bilan
          farzandingizni rivojlantiring.
        </p>
      </div>

      {/* Button */}
      <button
        style={{
          position: "relative",
          zIndex: 2,
          padding: "10px 22px",
          borderRadius: 99,
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(135deg,#7C3AED,#A855F7)",
          color: "#fff",
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: "0.85rem",
          whiteSpace: "nowrap",
        }}
      >
        Ko'proq bilish
      </button>
    </section>
  );
}
/* ────────────────────────────────────────────────────────────────────────
   DASHBOARD (default export)
   ──────────────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1180px)');
  const [active, setActive] = useState('Bosh sahifa');

  useEffect(() => {
    document.body.style.overflow = sidebarOpen && !isDesktop ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen, isDesktop]);

  return (
    <div style={{ minHeight: '100vh', background: '#0D0A1A', color: '#F1E8FF', position: 'relative' }}>
      <style>{`
        @import url('${FONT_IMPORT_URL}');

        * { box-sizing: border-box; }

        @keyframes star-twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 1; }
        }
        @keyframes star-float {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(calc(-1 * var(--drift, 12px))) translateX(4px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="star-twinkle"], [style*="star-float"] { animation: none !important; }
        }

        .app-shell { display: flex; min-height: 100vh; position: relative; z-index: 1; }

        .app-sidebar {
          width: 264px; flex-shrink: 0;
          padding: 18px 14px 18px;
          display: flex; flex-direction: column;
          border-right: 1px solid rgba(168,85,247,0.14);
          background: #0F0A1F;
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 60;
          overflow-y: auto;
        }
        .sidebar-close-btn { display: none; background: none; border: none; cursor: pointer; padding: 6px; }
        .sidebar-scrim { display: none; }
        .menu-toggle-btn { display: none; background: rgba(255,255,255,0.05); border: 1px solid rgba(168,85,247,0.2); border-radius: 10px; cursor: pointer; padding: 8px; }

        .content-area { flex: 1; min-width: 0; margin-left: 264px; padding: 0 clamp(16px,3vw,40px) 60px; }

        .dashboard-grid { display: grid; grid-template-columns: 1fr 300px; gap: clamp(16px,2.5vw,28px); align-items: start; }

        @media (max-width: 1179px) {
          .app-sidebar { transform: translateX(-100%); transition: transform 0.3s ease; box-shadow: 0 0 60px rgba(0,0,0,0.6); }
          .app-sidebar.sidebar-open { transform: translateX(0); }
          .sidebar-close-btn { display: block; }
          .menu-toggle-btn { display: flex; }
          .content-area { margin-left: 0; }
          .dashboard-grid { grid-template-columns: 1fr; }
          .sidebar-scrim {
            display: block; position: fixed; inset: 0; z-index: 55;
            background: rgba(5,3,12,0.6); backdrop-filter: blur(2px);
          }
        }

        @media (max-width: 640px) {
          .topbar-search { order: 3; flex-basis: 100% !important; max-width: 100% !important; }
          .premium-btn span { display: none; }
        }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.3); border-radius: 99px; }
      `}</style>

      <AmbientStars />

      <div className="app-shell">
        <Sidebar
          open={isDesktop || sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          active={active}
          setActive={setActive}
        />
        <div className="content-area">
          <Topbar onMenuClick={() => setSidebarOpen(true)} userName="Nozam" />
          <main className="dashboard-grid">
            <div style={{ minWidth: 0 }}>
              <HeroBanner />
              <QuickActions />
              <MyStories />
            </div>
            <aside style={{ minWidth: 0 }}>
              <GenresCard />
              <ParentsCard />
            </aside>
          </main>
          <BottomBanner />
        </div>
      </div>
    </div>
  );
}