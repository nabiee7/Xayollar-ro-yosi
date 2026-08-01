import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles, Bell, Sun, Moon, Camera, Pencil, Users, UserPlus, BookOpen, Heart,
  Bookmark, MoreVertical, ChevronRight, User, Lock, Globe, HelpCircle, ShieldCheck,
  LogOut, Trash2, Share2, X,
} from "lucide-react";

const FONT_IMPORT_URL =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700&family=Cormorant+Garamond:wght@700&family=Nunito:wght@400;600;700;800&display=swap";

// ─── TYPES ───────────────────────────────────────────────────────────────────
type TabId = "created" | "saved" | "liked";
type Badge = "Hikoya" | "Komiks" | "Ovoz" | "Animatsiya";

interface StoryCard {
  id: string;
  title: string;
  date: string;
  badge: Badge;
  img: string;
  section: TabId;
}

interface SettingsItem {
  id: string;
  icon: any;
  label: string;
  kind: "link" | "toggle" | "value";
  value?: string;
}

// ─── STATIC DATA ─────────────────────────────────────────────────────────────
const PROFILE = {
  name: "Nozanin",
  handle: "@nozanin_22",
  bio: "Xayollarim orqali o'zimning olamimni yarataman",
  avatar: "/images/profile/avatar.jpg",
  banner: "/profile.png",
};

const STATS: { icon: any; label: string; value: number }[] = [
  { icon: Users, label: "Obunachilar", value: 128 },
  { icon: UserPlus, label: "Obuna bo'lingan", value: 85 },
  { icon: BookOpen, label: "Yaratgan hikoyalarim", value: 12 },
  { icon: Heart, label: "Sevimlilarim", value: 23 },
];

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "created", label: "Yaratganlarim", icon: BookOpen },
  { id: "saved", label: "Saqlanganlarim", icon: Bookmark },
  { id: "liked", label: "Yoqtirganlarim", icon: Heart },
];

const BADGE_STYLE: Record<Badge, { bg: string; fg: string; emoji: string }> = {
  Hikoya: { bg: "rgba(168,85,247,0.85)", fg: "#fff", emoji: "📖" },
  Komiks: { bg: "rgba(56,189,248,0.85)", fg: "#04202b", emoji: "💬" },
  Ovoz: { bg: "rgba(34,197,94,0.85)", fg: "#04240f", emoji: "🎙️" },
  Animatsiya: { bg: "rgba(236,72,153,0.85)", fg: "#fff", emoji: "✨" },
};

const STORIES: StoryCard[] = [
  { id: "s1", title: "Sehrli o'rmon sarguzashtlari", date: "24.07.2025", badge: "Hikoya", img: "/images/profile/story-1.jpg", section: "created" },
  { id: "s2", title: "Do'stlikning kuchi", date: "20.07.2025", badge: "Komiks", img: "/images/profile/story-2.jpg", section: "created" },
  { id: "s3", title: "Mening ovozli hikoyam", date: "18.07.2025", badge: "Ovoz", img: "/images/profile/story-3.jpg", section: "created" },
  { id: "s4", title: "Yulduzlar ortidagi sayohat", date: "15.07.2025", badge: "Animatsiya", img: "/images/profile/story-4.jpg", section: "created" },
  { id: "s5", title: "Oy malikasining siri", date: "10.07.2025", badge: "Hikoya", img: "/images/profile/story-5.jpg", section: "saved" },
  { id: "s6", title: "Bulutlar shahri", date: "05.07.2025", badge: "Komiks", img: "/images/profile/story-6.jpg", section: "saved" },
  { id: "s7", title: "Kichkina ajdahoning orzusi", date: "02.07.2025", badge: "Animatsiya", img: "/images/profile/story-7.jpg", section: "liked" },
];

const SETTINGS_ITEMS: SettingsItem[] = [
  { id: "personal", icon: User, label: "Shaxsiy ma'lumotlar", kind: "link" },
  { id: "password", icon: Lock, label: "Parolni o'zgartirish", kind: "link" },
  { id: "notifications", icon: Bell, label: "Bildirishnomalar", kind: "toggle" },
  { id: "language", icon: Globe, label: "Til", kind: "value", value: "O'zbekcha" },
  { id: "help", icon: HelpCircle, label: "Yordam va qo'llab-quvvatlash", kind: "link" },
  { id: "privacy", icon: ShieldCheck, label: "Maxfiylik va xavfsizlik", kind: "link" },
];

// ─── SMALL PRESENTATIONAL PIECES ─────────────────────────────────────────────
function AvatarImg({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase();
  return failed ? (
    <div className="avatar-fallback">{initial}</div>
  ) : (
    // Replace src with the real photo asset when available
    <img src={src} alt={name} className="avatar-img" onError={() => setFailed(true)} />
  );
}

function HeroIllustration({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    // Decorative fallback drawn in CSS/SVG so the layout still reads as intended,
    // sized to fully cover the hero card like a real photo would.
    return (
      <svg
        className="hero-art hero-fallback-art"
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="heroSky" cx="70%" cy="20%" r="80%">
            <stop offset="0%" stopColor="#3b2a68" />
            <stop offset="55%" stopColor="#241a44" />
            <stop offset="100%" stopColor="#140e28" />
          </radialGradient>
        </defs>
        <rect width="600" height="400" fill="url(#heroSky)" />
        <circle cx="480" cy="80" r="46" fill="rgba(243,216,156,0.9)" />
        <circle cx="466" cy="66" r="46" fill="#241a44" opacity="0.9" />
        <g fill="rgba(200,180,255,0.55)">
          <rect x="220" y="200" width="26" height="120" />
          <rect x="290" y="150" width="30" height="170" />
          <rect x="360" y="210" width="26" height="110" />
          <polygon points="233,200 233,160 265,186" />
          <polygon points="305,150 305,105 341,132" />
          <polygon points="373,210 373,178 403,199" />
        </g>
        <ellipse cx="300" cy="330" rx="260" ry="50" fill="rgba(20,14,35,0.6)" />
      </svg>
    );
  }
  return (
    // Replace src with the real hero illustration asset when available
    <img src={src} alt="" className="hero-art" onError={() => setFailed(true)} />
  );
}

function StoryThumb({ story }: { story: StoryCard }) {
  const [failed, setFailed] = useState(false);
  const style = BADGE_STYLE[story.badge];
  return (
    <div className="story-card">
      <div className="story-thumb">
        {!failed ? (
          // Replace src with the real cover image asset when available
          <img src={story.img} alt={story.title} onError={() => setFailed(true)} />
        ) : (
          <span className="story-thumb-emoji">{style.emoji}</span>
        )}
        <span className="story-badge" style={{ background: style.bg, color: style.fg }}>
          {story.badge}
        </span>
      </div>
      <div className="story-meta">
        <div className="story-info">
          <p className="story-title">{story.title}</p>
          <p className="story-date">{story.date}</p>
        </div>
        <StoryMenu storyId={story.id} />
      </div>
    </div>
  );
}

function StoryMenu({ storyId }: { storyId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="story-menu-wrap" ref={ref}>
      <button className="icon-btn" onClick={() => setOpen(o => !o)}>
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="story-menu">
          <button><Share2 size={13} /> Ulashish</button>
          <button className="danger"><Trash2 size={13} /> O'chirish</button>
        </div>
      )}
    </div>
  );
}

// ─── AMBIENT BACKGROUND ──────────────────────────────────────────────────────
// Big, clearly-moving magic "orbs" drifting across the page + shooting stars
// streaking through the sky + a fine layer of twinkling stardust.
function ProfileAmbientBackground() {
  const orbs = [
    { top: "-8%", left: "62%", size: 420, color: "rgba(124,58,237,0.55)", duration: 26, delay: 0 },
    { top: "38%", left: "-10%", size: 380, color: "rgba(236,72,153,0.4)", duration: 32, delay: -6 },
    { top: "62%", left: "70%", size: 460, color: "rgba(56,189,248,0.3)", duration: 38, delay: -14 },
    { top: "10%", left: "20%", size: 260, color: "rgba(243,216,156,0.35)", duration: 22, delay: -3 },
  ];

  const shootingStars = [
    { top: "8%", duration: 7, delay: 1 },
    { top: "22%", duration: 9, delay: 5 },
    { top: "40%", duration: 6.5, delay: 9 },
    { top: "58%", duration: 8, delay: 3 },
    { top: "75%", duration: 10, delay: 7 },
  ];

  const stars = Array.from({ length: 46 }, (_, i) => i);
  const sparkles = Array.from({ length: 18 }, (_, i) => i);

  return (
    <div className="profile-ambient" aria-hidden="true">
      {orbs.map((o, i) => (
        <div
          key={`orb-${i}`}
          className="profile-orb"
          style={{
            top: o.top,
            left: o.left,
            width: o.size,
            height: o.size,
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            animationDuration: `${o.duration}s`,
            animationDelay: `${o.delay}s`,
          }}
        />
      ))}

      {shootingStars.map((s, i) => (
        <div
          key={`shoot-${i}`}
          className="profile-shooting-star"
          style={{
            top: s.top,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {stars.map((i) => (
        <span
          key={`star-${i}`}
          className="profile-star"
          style={{
            top: `${(i * 37) % 100}%`,
            left: `${(i * 53) % 100}%`,
            animationDelay: `${(i % 10) * 0.7}s`,
            animationDuration: `${2.6 + (i % 5)}s`,
          }}
        />
      ))}

      {sparkles.map((i) => (
        <span
          key={`sparkle-${i}`}
          className="profile-sparkle"
          style={{
            left: `${(i * 61) % 100}%`,
            animationDelay: `${(i % 8) * 2.1}s`,
            animationDuration: `${9 + (i % 6) * 1.5}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("created");
  const [notifOn, setNotifOn] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const visibleStories = STORIES.filter(s => s.section === activeTab);

  const handleLogout = () => {
    if (!window.confirm("Rostdan ham chiqmoqchimisiz?")) return;
    navigate("/login");
  };

  return (
    <div className="profile-shell">
      <ProfileAmbientBackground />
      <style>{`
        @import url('${FONT_IMPORT_URL}');

        * { box-sizing: border-box; }
        .profile-shell {
          position: relative;
          min-height: 100vh;
          background: radial-gradient(ellipse at 85% -10%, #241a44 0%, #140e28 55%, #0c0817 100%);
          color: #F1E8FF;
          display: flex;
          flex-direction: column;
          font-family: 'Nunito', sans-serif;
          overflow-x: hidden;
        }
        .profile-shell > *:not(.profile-ambient) { position: relative; z-index: 1; }

        /* ── AMBIENT BACKGROUND ── */
        .profile-ambient { position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }

        .profile-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(10px);
          animation-name: profile-orb-drift;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform;
        }
        @keyframes profile-orb-drift {
          0%   { transform: translate(0, 0) scale(1); }
          25%  { transform: translate(-6vw, 5vh) scale(1.12); }
          50%  { transform: translate(3vw, -7vh) scale(0.92); }
          75%  { transform: translate(6vw, 4vh) scale(1.06); }
          100% { transform: translate(0, 0) scale(1); }
        }

        .profile-shooting-star {
          position: absolute;
          left: -12%;
          width: 160px;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(90deg, rgba(243,216,156,0) 0%, rgba(255,250,235,0.95) 60%, rgba(255,250,235,0) 100%);
          transform: rotate(18deg);
          opacity: 0;
          animation-name: profile-shoot;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes profile-shoot {
          0%   { transform: translate(0, 0) rotate(18deg); opacity: 0; }
          4%   { opacity: 1; }
          16%  { opacity: 0; }
          100% { transform: translate(140vw, 55vh) rotate(18deg); opacity: 0; }
        }

        .profile-star {
          position: absolute; width: 2.5px; height: 2.5px; border-radius: 50%;
          background: #F1E8FF;
          box-shadow: 0 0 6px 1.5px rgba(241,232,255,0.85);
          opacity: 0;
          animation-name: profile-star-twinkle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @keyframes profile-star-twinkle {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        .profile-sparkle {
          position: absolute; bottom: -4%;
          width: 5px; height: 5px; border-radius: 50%;
          background: #F3D89C;
          box-shadow: 0 0 10px 3px rgba(243,216,156,0.75);
          opacity: 0;
          animation-name: profile-sparkle-rise;
          animation-timing-function: ease-out;
          animation-iteration-count: infinite;
        }
        @keyframes profile-sparkle-rise {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.95; }
          100% { transform: translateY(-100vh) translateX(30px); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .profile-orb, .profile-shooting-star, .profile-star, .profile-sparkle {
            animation: none !important;
          }
        }

        /* ── Top bar ── */
        .profile-top {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; padding: 18px clamp(16px,4vw,40px);
        }
        .profile-page-title {
          font-family: 'Cinzel Decorative', serif; font-weight: 700;
          font-size: clamp(1.2rem, 2.6vw, 1.7rem);
          display: flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #F1E8FF 0%, #E9D5FF 60%, #F3D89C 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .top-icon-btn {
          width: 42px; height: 42px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(168,85,247,0.12); border: 1px solid rgba(168,85,247,0.3);
          color: #E9DEFF; cursor: pointer; position: relative; transition: background 0.2s;
        }
        .top-icon-btn:hover { background: rgba(168,85,247,0.24); }
        .top-icon-dot {
          position: absolute; top: 8px; right: 9px; width: 8px; height: 8px; border-radius: 50%;
          background: #F3D89C; box-shadow: 0 0 6px 1px rgba(243,216,156,0.8);
        }
        .top-icon-group { display: flex; gap: 10px; }

        /* ── Body ── */
        .profile-body {
          flex: 1; width: 100%; max-width: 980px; margin: 0 auto;
          padding: 0 clamp(16px,4vw,40px) 60px;
          display: flex; flex-direction: column; gap: 22px;
        }

        /* hero card — the illustration is now the full background of the card,
           with the profile content laid on top of a readability gradient */
        .hero-card {
          position: relative; overflow: hidden;
          border-radius: 26px; border: 1px solid rgba(168,85,247,0.22);
          min-height: 280px;
          display: flex; align-items: flex-end;
          padding: clamp(20px,3vw,32px);
        }
        .hero-art-wrap {
          position: absolute; inset: 0; z-index: 0;
        }
        .hero-art, .hero-fallback-art {
          width: 100%; height: 100%;
          object-fit: cover; object-position: center;
          display: block;
        }
        .hero-card::after {
          content: ""; position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(180deg, rgba(10,7,20,0.1) 0%, rgba(12,8,22,0.45) 55%, rgba(9,6,17,0.92) 100%);
        }
        .hero-content { position: relative; z-index: 2; width: 100%; }

        .avatar-row { display: flex; align-items: center; gap: 16px; margin-bottom: 14px; }
        .avatar-wrap { position: relative; width: 78px; height: 78px; flex-shrink: 0; }
        .avatar-img, .avatar-fallback {
          width: 78px; height: 78px; border-radius: 50%; object-fit: cover;
          border: 2px solid rgba(243,216,156,0.6);
          box-shadow: 0 0 0 4px rgba(168,85,247,0.15);
        }
        .avatar-fallback {
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #7C3AED, #C026D3);
          font-family: 'Cinzel', serif; font-size: 1.6rem; font-weight: 700; color: #fff;
        }
        .avatar-edit-btn {
          position: absolute; bottom: -2px; right: -2px; width: 26px; height: 26px; border-radius: 50%;
          background: #A855F7; border: 2px solid #150F26; color: #fff;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .profile-name {
          font-family: 'Cinzel Decorative', serif; font-size: clamp(1.3rem,2.6vw,1.7rem); font-weight: 700;
          display: flex; align-items: center; gap: 8px; color: #F9F5FF;
          text-shadow: 0 2px 12px rgba(0,0,0,0.5);
        }
        .profile-handle { color: #C4B5FD; font-size: 0.9rem; font-weight: 600; margin-top: 2px; }
        .profile-bio { color: #E9DEFF; font-size: 0.92rem; margin-top: 10px; max-width: 460px; line-height: 1.5; text-shadow: 0 1px 8px rgba(0,0,0,0.45); }
        .edit-profile-btn {
          margin-top: 16px; display: inline-flex; align-items: center; gap: 8px;
          padding: 9px 18px; border-radius: 99px; cursor: pointer;
          border: 1px solid rgba(233,222,255,0.4); background: rgba(255,255,255,0.1); color: #F1E8FF;
          backdrop-filter: blur(4px);
          font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 0.85rem; transition: background 0.2s;
        }
        .edit-profile-btn:hover { background: rgba(255,255,255,0.2); }

        /* stats */
        .stats-bar {
          display: grid; grid-template-columns: repeat(4, 1fr);
          border-radius: 20px; border: 1px solid rgba(168,85,247,0.18);
          background: rgba(20,14,35,0.5); backdrop-filter: blur(8px);
          overflow: hidden;
        }
        .stat-item {
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
          padding: 18px 8px; text-align: center; border-right: 1px solid rgba(168,85,247,0.14);
        }
        .stat-item:last-child { border-right: none; }
        .stat-value-row { display: flex; align-items: center; gap: 6px; color: #F3D89C; }
        .stat-value { font-family: 'Cinzel', serif; font-weight: 700; font-size: 1.3rem; color: #F9F5FF; }
        .stat-label { font-size: 0.72rem; color: #B7A9DE; font-weight: 600; }

        /* tabs */
        .profile-tabs {
          display: flex; gap: 6px; padding: 6px;
          border-radius: 99px; border: 1px solid rgba(168,85,247,0.2);
          background: rgba(20,14,35,0.5); overflow-x: auto;
        }
        .profile-tab {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; white-space: nowrap;
          padding: 10px 14px; border-radius: 99px; cursor: pointer; border: none;
          background: transparent; color: #B7A9DE; font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 0.85rem;
          transition: all 0.2s;
        }
        .profile-tab.active {
          background: linear-gradient(135deg, #7C3AED, #A855F7);
          color: #fff; box-shadow: 0 0 18px rgba(168,85,247,0.4);
        }

        /* content section */
        .section-panel {
          border-radius: 22px; border: 1px solid rgba(168,85,247,0.18);
          background: rgba(20,14,35,0.45); backdrop-filter: blur(8px);
          padding: clamp(16px,2.4vw,24px);
        }
        .section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .section-title {
          font-family: 'Cinzel', serif; font-size: 0.95rem; letter-spacing: 0.04em;
          display: flex; align-items: center; gap: 8px; color: #E9DEFF;
        }
        .section-link { color: #C4B5FD; font-size: 0.82rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 2px; }
        .section-link:hover { color: #F1E8FF; }

        .story-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .story-card {
          border-radius: 16px; overflow: hidden; border: 1px solid rgba(168,85,247,0.18);
          background: rgba(12,9,22,0.5); transition: transform 0.2s, border-color 0.2s;
        }
        .story-card:hover { transform: translateY(-3px); border-color: rgba(168,85,247,0.45); }
        .story-thumb {
          position: relative; aspect-ratio: 4/3; width: 100%;
          background: radial-gradient(ellipse at 40% 30%, rgba(124,58,237,0.3), rgba(15,10,26,0.9));
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .story-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .story-thumb-emoji { font-size: 2.2rem; }
        .story-badge {
          position: absolute; top: 8px; left: 8px; padding: 3px 10px; border-radius: 99px;
          font-size: 0.68rem; font-weight: 800; letter-spacing: 0.02em;
        }
        .story-meta { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; padding: 10px 12px 12px; }
        .story-title { font-size: 0.85rem; font-weight: 700; color: #F1E8FF; line-height: 1.3; }
        .story-date { font-size: 0.72rem; color: #9B8EC4; margin-top: 3px; }
        .story-menu-wrap { position: relative; flex-shrink: 0; }
        .story-menu {
          position: absolute; right: 0; top: 30px; z-index: 20; min-width: 140px;
          background: #17112B; border: 1px solid rgba(168,85,247,0.3); border-radius: 10px;
          padding: 6px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .story-menu button {
          display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 10px;
          background: none; border: none; color: #E9DEFF; font-size: 0.8rem; font-weight: 700;
          cursor: pointer; border-radius: 8px; white-space: nowrap; text-align: left;
        }
        .story-menu button:hover { background: rgba(168,85,247,0.14); }
        .story-menu button.danger { color: #F87171; }
        .story-menu button.danger:hover { background: rgba(248,113,113,0.12); }

        .empty-state { text-align: center; padding: 40px 12px; color: #9B8EC4; }
        .empty-state-emoji { font-size: 2.2rem; margin-bottom: 10px; }
        .empty-state-title { font-weight: 700; color: #E9DEFF; margin-bottom: 4px; }
        .empty-state-sub { font-size: 0.85rem; }

        .icon-btn {
          width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
          background: transparent; border: none; color: #9B8EC4; cursor: pointer; border-radius: 8px;
        }
        .icon-btn:hover { color: #F1E8FF; background: rgba(168,85,247,0.15); }

        /* settings list */
        .settings-panel { border-radius: 22px; border: 1px solid rgba(168,85,247,0.18); background: rgba(20,14,35,0.45); backdrop-filter: blur(8px); overflow: hidden; }
        .settings-row {
          display: flex; align-items: center; gap: 12px; padding: 15px clamp(16px,2.4vw,22px);
          border-bottom: 1px solid rgba(168,85,247,0.1); cursor: pointer; transition: background 0.15s;
        }
        .settings-row:last-child { border-bottom: none; }
        .settings-row:hover { background: rgba(168,85,247,0.08); }
        .settings-icon {
          width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
          background: rgba(168,85,247,0.14); color: #C4B5FD; flex-shrink: 0;
        }
        .settings-label { flex: 1; font-size: 0.9rem; font-weight: 700; color: #E9DEFF; }
        .settings-value { color: #9B8EC4; font-size: 0.85rem; font-weight: 600; margin-right: 2px; }
        .toggle-switch { width: 42px; height: 24px; border-radius: 99px; background: rgba(255,255,255,0.15); position: relative; cursor: pointer; transition: background 0.2s; border: none; flex-shrink: 0; }
        .toggle-switch.on { background: linear-gradient(135deg, #7C3AED, #A855F7); }
        .toggle-knob { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: transform 0.2s; }
        .toggle-switch.on .toggle-knob { transform: translateX(18px); }

        .logout-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
          padding: 15px; border-radius: 18px; cursor: pointer;
          border: 1px solid rgba(248,113,113,0.4); background: rgba(248,113,113,0.08); color: #F87171;
          font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 0.92rem; transition: background 0.2s;
        }
        .logout-btn:hover { background: rgba(248,113,113,0.18); }

        /* toast */
        .profile-toast {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          background: rgba(20,14,35,0.95); border: 1px solid rgba(168,85,247,0.4);
          color: #F1E8FF; padding: 10px 22px; border-radius: 99px; font-size: 0.85rem; font-weight: 700;
          z-index: 200; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .story-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 760px) {
          .hero-card { min-height: 300px; align-items: flex-end; }
          .stats-bar { grid-template-columns: repeat(2, 1fr); }
          .stat-item:nth-child(2) { border-right: none; }
          .stat-item:nth-child(1), .stat-item:nth-child(2) { border-bottom: 1px solid rgba(168,85,247,0.14); }
          .profile-tab span { display: none; }
        }
        @media (max-width: 520px) {
          .story-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .top-icon-btn { width: 38px; height: 38px; }
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className="profile-top">
        <div className="profile-page-title">Profilim <Sparkles size={18} /></div>
        <div className="top-icon-group">
          <button className="top-icon-btn" onClick={() => showToast("Bildirishnomalar hozircha yo'q")}>
            <Bell size={18} />
            <span className="top-icon-dot" />
          </button>
          <button className="top-icon-btn" onClick={() => setDarkMode(d => !d)}>
            {darkMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>

      <div className="profile-body">
        {/* ── HERO CARD ── */}
        <div className="hero-card">
          <div className="hero-art-wrap">
            <HeroIllustration src={PROFILE.banner} />
          </div>
          <div className="hero-content">
            <div className="avatar-row">
              <div className="avatar-wrap">
                <AvatarImg src={PROFILE.avatar} name={PROFILE.name} />
                <button className="avatar-edit-btn" onClick={() => showToast("Rasm tanlang")}>
                  <Camera size={13} />
                </button>
              </div>
              <div>
                <div className="profile-name">{PROFILE.name} <Sparkles size={16} color="#F3D89C" /></div>
                <div className="profile-handle">{PROFILE.handle}</div>
              </div>
            </div>
            <p className="profile-bio">{PROFILE.bio} ✨</p>
            <button className="edit-profile-btn" onClick={() => showToast("Profilni tahrirlash")}>
              <Pencil size={14} /> Profilni tahrirlash
            </button>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="stats-bar">
          {STATS.map((s) => (
            <div className="stat-item" key={s.label}>
              <div className="stat-value-row">
                <s.icon size={15} />
                <span className="stat-value">{s.value}</span>
              </div>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div className="profile-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`profile-tab ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              <t.icon size={15} /> <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── STORY GRID ── */}
        <div className="section-panel">
          <div className="section-head">
            <div className="section-title">
              <BookOpen size={15} /> {TABS.find(t => t.id === activeTab)?.label}
            </div>
            {visibleStories.length > 0 && (
              <span className="section-link">Barchasi <ChevronRight size={14} /></span>
            )}
          </div>

          {visibleStories.length > 0 ? (
            <div className="story-grid">
              {visibleStories.map((story) => (
                <StoryThumb key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-emoji">🌙</div>
              <div className="empty-state-title">Bu yerda hali hech narsa yo'q</div>
              <div className="empty-state-sub">Yangi hikoya yaratib, uni shu yerda ko'ring</div>
            </div>
          )}
        </div>

        {/* ── SETTINGS ── */}
        <div className="settings-panel">
          {SETTINGS_ITEMS.map((item) => (
            <div
              className="settings-row"
              key={item.id}
              onClick={() => {
                if (item.kind === "toggle") setNotifOn(n => !n);
                else showToast(item.label);
              }}
            >
              <div className="settings-icon"><item.icon size={16} /></div>
              <span className="settings-label">{item.label}</span>
              {item.kind === "toggle" && (
                <button
                  className={`toggle-switch ${notifOn ? "on" : ""}`}
                  onClick={(e) => { e.stopPropagation(); setNotifOn(n => !n); }}
                >
                  <span className="toggle-knob" />
                </button>
              )}
              {item.kind === "value" && <span className="settings-value">{item.value}</span>}
              {item.kind === "link" && <ChevronRight size={16} color="#9B8EC4" />}
            </div>
          ))}
        </div>

        {/* ── LOGOUT ── */}
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={17} /> Chiqish
        </button>
      </div>

      {toast && <div className="profile-toast">{toast}</div>}
    </div>
  );
}