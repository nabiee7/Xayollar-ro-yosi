import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, Save, Play, Pause, ChevronLeft, ChevronRight,
  Volume2, Settings2, Maximize2, Camera, CloudRain, Move3d,
  Music2, Wand2, Plus, Lightbulb, Image as ImageIcon, Check,
  CircleDot, Clock, Loader2,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────── */
interface Scene {
  id: number;
  title: string;
  duration: string;
  img: string; // masalan: "/scenes/scene-1.jpg"
}

interface StyleOption {
  id: string;
  label: string;
  img: string; // masalan: "/styles/multfilm.jpg"
}

interface EffectOption {
  id: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
  hasDropdown?: boolean;
}

/* ─────────────────────────────────────────────────────────────────────────
   MOCK DATA — bu yerdagi img yo'llarini o'z fayllaringiz bilan almashtiring
───────────────────────────────────────────────────────────────────────── */
const SCENES: Scene[] = [
  { id: 1, title: "Sehrli o'rmon", duration: '00:05', img: '/scenes/scene-1.jpg' },
  { id: 2, title: "Ajdaho paydo bo'ldi", duration: '00:06', img: '/scenes/scene-2.jpg' },
  { id: 3, title: "Do'st bo'lishdi", duration: '00:04', img: '/scenes/scene-3.jpg' },
  { id: 4, title: 'Sehirli nur', duration: '00:05', img: '/scenes/scene-4.jpg' },
  { id: 5, title: 'Sarguzasht davom etadi', duration: '00:06', img: '/scenes/scene-5.jpg' },
];

const STYLES: StyleOption[] = [
  { id: 'multfilm', label: 'Multfilm', img: '/styles/multfilm.jpg' },
  { id: 'anime', label: 'Anime', img: '/styles/anime.jpg' },
  { id: 'realistik', label: 'Realistik', img: '/styles/realistik.jpg' },
  { id: 'fantaziya', label: 'Fantaziya', img: '/styles/fantaziya.jpg' },
];

const EFFECTS: EffectOption[] = [
  { id: 'camera', label: 'Kamera harakati', sub: 'Yengil zoom kirish', icon: <Camera size={20} /> },
  { id: 'weather', label: 'Ob-havo effekti', sub: "Sehrli nur yog'ishi", icon: <CloudRain size={20} /> },
  { id: 'object', label: 'Obyekt harakati', sub: 'Kapalaklar uchishi', icon: <Move3d size={20} /> },
  { id: 'transition', label: "O'tish effekti", sub: "Yumshoq o'tish", icon: <Wand2 size={20} />, hasDropdown: true },
  { id: 'music', label: 'Fon musiqasi', sub: 'Sehrli ohang', icon: <Music2 size={20} />, hasDropdown: true },
  { id: 'sfx', label: 'Ovoz effekti', sub: 'Yengil sehr tovushi', icon: <Volume2 size={20} /> },
];

const STEPS = [
  { id: 1, label: 'Manbani tanlash' },
  { id: 2, label: "Sahnalarni ko'rib chiqish" },
  { id: 3, label: 'Jonlantirishni sozlash' },
  { id: 4, label: 'Video yaratish' },
];

/* ─────────────────────────────────────────────────────────────────────────
   SMALL REUSABLE: image with graceful fallback (rasm bo'lmasa gradient+icon)
───────────────────────────────────────────────────────────────────────── */
function SmartImage({
  src, alt, style, iconSize = 22,
}: { src: string; alt: string; style?: React.CSSProperties; iconSize?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div style={{
        ...style,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(168,85,247,0.15))',
      }}>
        <ImageIcon size={iconSize} color="#C4B5FD" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      style={{ objectFit: 'cover', ...style }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   AMBIENT BACKGROUND — sehrli zarrachalar, yulduzlar, ruh-olovlar
   (faqat vizual dekor, hech qanday state/logikaga ta'sir qilmaydi)
───────────────────────────────────────────────────────────────────────── */
function AmbientBackground() {
  const embers = Array.from({ length: 16 }, (_, i) => i);
  const stars = Array.from({ length: 26 }, (_, i) => i);
  const runes = ['✦', '✧', '⟡', '❖', '✵'];

  return (
    <div className="vc-ambient" aria-hidden="true">
      <div className="vc-ambient-glow vc-ambient-glow-a" />
      <div className="vc-ambient-glow vc-ambient-glow-b" />
      <div className="vc-ambient-glow vc-ambient-glow-c" />

      <div className="vc-ambient-mist" />

      {stars.map((i) => (
        <span
          key={`star-${i}`}
          className="vc-star"
          style={{
            top: `${(i * 37) % 100}%`,
            left: `${(i * 53) % 100}%`,
            animationDelay: `${(i % 10) * 0.6}s`,
            animationDuration: `${3 + (i % 5)}s`,
            width: i % 4 === 0 ? 3 : 2,
            height: i % 4 === 0 ? 3 : 2,
          }}
        />
      ))}

      {embers.map((i) => (
        <span
          key={`ember-${i}`}
          className="vc-ember"
          style={{
            left: `${(i * 61) % 100}%`,
            animationDelay: `${(i % 8) * 1.4}s`,
            animationDuration: `${14 + (i % 7) * 2}s`,
          }}
        />
      ))}

      {runes.map((r, i) => (
        <span
          key={`rune-${i}`}
          className="vc-rune"
          style={{
            top: `${12 + i * 19}%`,
            left: i % 2 === 0 ? `${4 + i * 2}%` : `${88 - i * 2}%`,
            animationDelay: `${i * 1.1}s`,
          }}
        >
          {r}
        </span>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   HEADER
───────────────────────────────────────────────────────────────────────── */
function Header() {
  const navigate = useNavigate();
  return (
    <header className="vc-header">
      <button className="vc-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        <span>Orqaga</span>
      </button>

      <div className="vc-header-title">
        <h1>
          <Sparkles size={20} className="vc-title-spark" />
          Jonlantirish
          <Sparkles size={20} className="vc-title-spark" />
        </h1>
        <p>Hikoyangiz yoki komiksingizni jonli videoga aylantiring</p>
      </div>

      <div className="vc-header-actions">
        <button className="vc-btn vc-btn-ghost">
          <Save size={16} />
          <span>Loyihalarni saqlash</span>
        </button>
        <button className="vc-btn vc-btn-primary">
          <Play size={16} fill="currentColor" />
          <span>Video yaratish</span>
        </button>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STEP TABS
───────────────────────────────────────────────────────────────────────── */
function StepTabs({ active, onChange }: { active: number; onChange: (n: number) => void }) {
  return (
    <div className="vc-steps">
      {STEPS.map((s) => {
        const state = s.id < active ? 'done' : s.id === active ? 'active' : 'idle';
        return (
          <button
            key={s.id}
            className={`vc-step vc-step-${state}`}
            onClick={() => onChange(s.id)}
          >
            <span className="vc-step-badge">
              {state === 'done' ? <Check size={13} /> : s.id}
            </span>
            <span className="vc-step-label">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   LEFT SIDEBAR — Sahna ro'yxati
───────────────────────────────────────────────────────────────────────── */
function SceneList({
  scenes, activeId, onSelect, projectName, onProjectNameChange,
}: {
  scenes: Scene[]; activeId: number; onSelect: (id: number) => void;
  projectName: string; onProjectNameChange: (v: string) => void;
}) {
  return (
    <aside className="vc-left">
      <div className="vc-panel">
        <div className="vc-panel-head">
          <h3>Sahna ro'yxati</h3>
          <button className="vc-icon-btn" aria-label="Sahna qo'shish">
            <Plus size={16} />
          </button>
        </div>

        <div className="scene-list">
          {scenes.map((scene, i) => (
            <button
              key={scene.id}
              className={`scene-item ${scene.id === activeId ? 'active' : ''}`}
              onClick={() => onSelect(scene.id)}
            >
              <SmartImage
                src={scene.img}
                alt={scene.title}
                style={{ width: 52, height: 52, borderRadius: 10, flexShrink: 0 }}
              />
              <div className="scene-item-text">
                <span className="scene-item-num">{i + 1}</span>
                <span className="scene-item-title">{scene.title}</span>
                <span className="scene-item-duration">
                  <Clock size={11} /> {scene.duration}
                </span>
              </div>
            </button>
          ))}
        </div>

        <button className="vc-btn vc-btn-outline vc-add-scene">
          <Plus size={16} />
          <span>Sahna qo'shish</span>
        </button>
      </div>

      <div className="vc-panel">
        <label className="vc-field-label">Loyiha nomi</label>
        <div className="vc-input-wrap">
          <input
            className="vc-input"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
          />
        </div>
      </div>

      <div className="vc-tip">
        <Lightbulb size={18} className="vc-tip-icon" />
        <p>
          Eng yaxshi natija uchun har bir sahna uchun harakat va effektlarni moslang.
        </p>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   CENTER — Preview + Timeline + Effects
───────────────────────────────────────────────────────────────────────── */
function PreviewPanel({ activeScene }: { activeScene: Scene }) {
  const [tab, setTab] = useState<'preview' | 'original'>('preview');
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(40);

  return (
    <div className="vc-panel vc-preview-panel">
      <div className="vc-preview-tabs">
        <button
          className={`vc-pill-tab ${tab === 'preview' ? 'active' : ''}`}
          onClick={() => setTab('preview')}
        >
          Ko'rish oynasi
        </button>
        <button
          className={`vc-pill-tab ${tab === 'original' ? 'active' : ''}`}
          onClick={() => setTab('original')}
        >
          Asl content
        </button>
        <div className="vc-preview-tabs-spacer" />
        <div className="vc-ratio-select">
          16:9 <ChevronRight size={14} className="vc-chevron-down" />
        </div>
        <button className="vc-icon-btn" aria-label="Kattalashtirish">
          <Maximize2 size={16} />
        </button>
      </div>

      <div className="vc-video-frame">
        <SmartImage
          src={activeScene.img}
          alt={activeScene.title}
          style={{ width: '100%', height: '100%' }}
          iconSize={44}
        />
        <div className="vc-video-overlay" />
        <button
          className="vc-video-play-btn"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pauza' : "Ijro etish"}
        >
          {playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
        </button>
      </div>

      <div className="vc-scrubber">
        <button className="vc-icon-btn" onClick={() => setPlaying((p) => !p)}>
          {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
        <span className="vc-time">00:0{Math.round(progress / 20)} / 00:05</span>
        <input
          type="range"
          className="vc-range vc-range-main"
          min={0} max={100}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
        />
        <Volume2 size={16} color="#C4B5FD" />
        <button className="vc-icon-btn">
          <Settings2 size={16} />
        </button>
      </div>
    </div>
  );
}

function Timeline({
  scenes, activeId, onSelect,
}: { scenes: Scene[]; activeId: number; onSelect: (id: number) => void }) {
  const totalSeconds = scenes.reduce((acc, s) => {
    const [m, sec] = s.duration.split(':').map(Number);
    return acc + m * 60 + sec;
  }, 0);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');

  return (
    <div className="vc-panel vc-timeline-panel">
      <div className="vc-timeline-ruler">
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i}>{String(i * 5).padStart(2, '0')}:{i === 0 ? '00' : '00'}</span>
        ))}
      </div>
      <div className="timeline-track">
        {scenes.map((scene, i) => (
          <button
            key={scene.id}
            className={`timeline-thumb ${scene.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(scene.id)}
          >
            <SmartImage src={scene.img} alt={scene.title} style={{ width: '100%', height: '100%' }} iconSize={16} />
            <span className="timeline-thumb-num">{i + 1}</span>
          </button>
        ))}
        <button className="timeline-add">
          <Plus size={18} />
        </button>
      </div>
      <p className="vc-total-time">Jami vaqt: {mm}:{ss}</p>
    </div>
  );
}

function EffectsPanel() {
  return (
    <div className="vc-panel">
      <h3 className="vc-panel-title">Sahnaga animatsiya va effektlar</h3>
      <div className="effects-grid">
        {EFFECTS.map((fx) => (
          <button key={fx.id} className="effect-card">
            <span className="effect-icon">{fx.icon}</span>
            <span className="effect-label">{fx.label}</span>
            <span className="effect-sub">
              {fx.sub}
              {fx.hasDropdown && <ChevronRight size={12} className="vc-chevron-down" />}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   RIGHT SIDEBAR — sozlamalar
───────────────────────────────────────────────────────────────────────── */
function StyleSelector({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div className="vc-panel">
      <h3 className="vc-panel-title">Jonlantirish uslubi</h3>
      <div className="style-grid">
        {STYLES.map((s) => (
          <button
            key={s.id}
            className={`style-item ${s.id === active ? 'active' : ''}`}
            onClick={() => onSelect(s.id)}
          >
            <SmartImage
              src={s.img}
              alt={s.label}
              style={{ width: '100%', aspectRatio: '1', borderRadius: 12 }}
              iconSize={20}
            />
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChoiceRow({
  title, options, active, onSelect, hint,
}: { title: string; options: { id: string; label: string; sub?: string }[]; active: string; onSelect: (id: string) => void; hint?: boolean }) {
  return (
    <div className="vc-panel">
      <div className="vc-panel-head">
        <h3 className="vc-panel-title" style={{ marginBottom: 0 }}>{title}</h3>
        {hint && <span className="vc-hint-dot">i</span>}
      </div>
      <div className="choice-row">
        {options.map((o) => (
          <button
            key={o.id}
            className={`choice-btn ${o.id === active ? 'active' : ''}`}
            onClick={() => onSelect(o.id)}
          >
            <span>{o.label}</span>
            {o.sub && <span className="choice-sub">{o.sub}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function AudioControls() {
  const [musicVol, setMusicVol] = useState(70);
  const [sfxVol, setSfxVol] = useState(55);
  return (
    <div className="vc-panel">
      <div className="vc-panel-head">
        <h3 className="vc-panel-title" style={{ marginBottom: 0 }}>Ovoz va musiqa</h3>
        <span className="vc-hint-dot">i</span>
      </div>

      <div className="audio-row">
        <div className="audio-row-head">
          <Music2 size={14} />
          <span>Fon musiqasi</span>
        </div>
        <div className="audio-track">
          <span className="audio-track-name">Sehrli o'rmon ohangi</span>
          <button className="vc-icon-btn vc-icon-btn-sm">
            <CircleDot size={12} />
          </button>
        </div>
        <div className="audio-slider-row">
          <Volume2 size={14} color="#9B8EC4" />
          <input
            type="range" className="vc-range" min={0} max={100}
            value={musicVol} onChange={(e) => setMusicVol(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="audio-row">
        <div className="audio-row-head">
          <Volume2 size={14} />
          <span>Ovoz effekti</span>
        </div>
        <div className="audio-track">
          <span className="audio-track-name">Sehrli effektlar to'plami</span>
          <button className="vc-icon-btn vc-icon-btn-sm">
            <CircleDot size={12} />
          </button>
        </div>
        <div className="audio-slider-row">
          <Volume2 size={14} color="#9B8EC4" />
          <input
            type="range" className="vc-range" min={0} max={100}
            value={sfxVol} onChange={(e) => setSfxVol(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}

function ExportActions({ generating, onGenerate }: { generating: boolean; onGenerate: () => void }) {
  return (
    <div className="vc-panel">
      <h3 className="vc-panel-title">Saqlash va eksport qilish</h3>
      <button className="vc-btn vc-btn-primary vc-btn-block" onClick={onGenerate} disabled={generating}>
        {generating ? <Loader2 size={16} className="vc-spin" /> : <Play size={16} fill="currentColor" />}
        <span>{generating ? 'Yaratilmoqda...' : 'Video yaratish'}</span>
      </button>
      <p className="vc-eta">Vaqt: taxminan 1-2 daqiqa</p>
      <button className="vc-btn vc-btn-outline vc-btn-block">
        <Save size={16} />
        <span>Loyihani saqlash</span>
      </button>
      <div className="vc-tip vc-tip-compact">
        <Lightbulb size={16} className="vc-tip-icon" />
        <p>
          <b>Maslahat:</b> Video yaratish jarayoni bir necha daqiqa davom etishi mumkin. Iltimos, kuting.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────────── */
export default function VideoCreatePage() {
  const [step, setStep] = useState(3);
  const [activeScene, setActiveScene] = useState(1);
  const [projectName, setProjectName] = useState('Sehrli o\'rmon sarguzashti');
  const [style, setStyle] = useState('multfilm');
  const [quality, setQuality] = useState('720p');
  const [fps, setFps] = useState('30');
  const [generating, setGenerating] = useState(false);

  const currentScene = SCENES.find((s) => s.id === activeScene) ?? SCENES[0];

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2200);
  };

  return (
    <div className="vc-root">
      <AmbientBackground />
      <div className="vc-shell">
        <Header />
        <StepTabs active={step} onChange={setStep} />

        <div className="vc-layout">
          <SceneList
            scenes={SCENES}
            activeId={activeScene}
            onSelect={setActiveScene}
            projectName={projectName}
            onProjectNameChange={setProjectName}
          />

          <main className="vc-center">
            <PreviewPanel activeScene={currentScene} />
            <Timeline scenes={SCENES} activeId={activeScene} onSelect={setActiveScene} />
            <EffectsPanel />
          </main>

          <aside className="vc-right">
            <StyleSelector active={style} onSelect={setStyle} />
            <ChoiceRow
              title="Sifat"
              hint
              active={quality}
              onSelect={setQuality}
              options={[
                { id: '480p', label: '480p', sub: 'SD' },
                { id: '720p', label: '720p', sub: 'HD' },
                { id: '1080p', label: '1080p', sub: 'Full HD' },
                { id: '4k', label: '4K', sub: 'Ultra HD' },
              ]}
            />
            <ChoiceRow
              title="Kadr tezligi"
              hint
              active={fps}
              onSelect={setFps}
              options={[
                { id: '24', label: '24 FPS' },
                { id: '30', label: '30 FPS' },
                { id: '60', label: '60 FPS' },
              ]}
            />
            <AudioControls />
            <ExportActions generating={generating} onGenerate={handleGenerate} />
          </aside>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700&family=Nunito:wght@400;600;700;800&display=swap');

        * { box-sizing: border-box; }

        .vc-root {
          position: relative;
          min-height: 100vh;
          background: radial-gradient(ellipse at 50% -10%, #1a1030 0%, #0B0817 55%, #08060f 100%);
          color: #F1E8FF;
          font-family: 'Nunito', sans-serif;
          padding: clamp(14px, 3vw, 28px);
          overflow-x: hidden;
        }
        .vc-shell { position: relative; z-index: 1; max-width: 1600px; margin: 0 auto; }

        /* ── AMBIENT BACKGROUND ── */
        .vc-ambient {
          position: fixed;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .vc-ambient-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.35;
          animation: vc-glow-drift 22s ease-in-out infinite;
        }
        .vc-ambient-glow-a {
          width: 42vw; height: 42vw; max-width: 560px; max-height: 560px;
          top: -12%; left: -8%;
          background: radial-gradient(circle, rgba(124,58,237,0.55), transparent 70%);
          animation-duration: 26s;
        }
        .vc-ambient-glow-b {
          width: 36vw; height: 36vw; max-width: 480px; max-height: 480px;
          bottom: -10%; right: -6%;
          background: radial-gradient(circle, rgba(192,38,211,0.45), transparent 70%);
          animation-duration: 30s;
          animation-delay: -8s;
        }
        .vc-ambient-glow-c {
          width: 28vw; height: 28vw; max-width: 380px; max-height: 380px;
          top: 40%; left: 55%;
          background: radial-gradient(circle, rgba(243,216,156,0.28), transparent 70%);
          animation-duration: 34s;
          animation-delay: -16s;
        }
        @keyframes vc-glow-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(4%, 6%) scale(1.08); }
          66% { transform: translate(-3%, -4%) scale(0.95); }
        }

        .vc-ambient-mist {
          position: absolute;
          inset: -10% -10%;
          background:
            radial-gradient(ellipse 60% 30% at 20% 85%, rgba(124,58,237,0.10), transparent 60%),
            radial-gradient(ellipse 50% 25% at 80% 15%, rgba(168,85,247,0.10), transparent 60%);
          animation: vc-mist-sway 40s ease-in-out infinite;
        }
        @keyframes vc-mist-sway {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-2%) translateY(2%); }
        }

        .vc-star {
          position: absolute;
          border-radius: 50%;
          background: #F3D89C;
          box-shadow: 0 0 6px 1px rgba(243,216,156,0.8);
          opacity: 0;
          animation-name: vc-twinkle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @keyframes vc-twinkle {
          0%, 100% { opacity: 0; transform: scale(0.6); }
          50% { opacity: 0.9; transform: scale(1.15); }
        }

        .vc-ember {
          position: absolute;
          bottom: -6%;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: radial-gradient(circle, #E9D5FF 0%, #A855F7 60%, transparent 100%);
          box-shadow: 0 0 8px 2px rgba(168,85,247,0.55);
          opacity: 0;
          animation-name: vc-ember-rise;
          animation-timing-function: ease-in;
          animation-iteration-count: infinite;
        }
        @keyframes vc-ember-rise {
          0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
          10% { opacity: 0.85; }
          50% { transform: translate(2vw, -50vh) scale(1); opacity: 0.6; }
          90% { opacity: 0.25; }
          100% { transform: translate(-3vw, -102vh) scale(0.4); opacity: 0; }
        }

        .vc-rune {
          position: absolute;
          font-family: 'Cinzel', serif;
          font-size: 1.4rem;
          color: rgba(196, 181, 253, 0.28);
          text-shadow: 0 0 12px rgba(168,85,247,0.35);
          animation-name: vc-rune-float;
          animation-timing-function: ease-in-out;
          animation-duration: 9s;
          animation-iteration-count: infinite;
        }
        @keyframes vc-rune-float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.18; }
          50% { transform: translateY(-18px) rotate(8deg); opacity: 0.4; }
        }

        @media (prefers-reduced-motion: reduce) {
          .vc-ambient-glow, .vc-ambient-mist, .vc-star, .vc-ember, .vc-rune {
            animation: none !important;
          }
        }

        /* ── HEADER ── */
        .vc-header {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
        }
        .vc-header-title { text-align: center; flex: 1; min-width: 220px; }
        .vc-header-title h1 {
          font-family: 'Cinzel Decorative', serif;
          font-size: clamp(1.3rem, 3vw, 1.7rem);
          font-weight: 700; margin: 0 0 4px;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          background: linear-gradient(135deg, #F3D89C 0%, #A855F7 55%, #E9D5FF 100%);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .vc-title-spark { color: #F3D89C; -webkit-text-fill-color: #F3D89C; }
        .vc-header-title p {
          margin: 0; font-size: clamp(0.75rem, 1.6vw, 0.9rem); color: #9B8EC4;
        }
        .vc-header-actions { display: flex; gap: 10px; flex-wrap: wrap; }

        .vc-back-btn {
          display: flex; align-items: center; gap: 8px;
          background: rgba(20,14,35,0.6); border: 1px solid rgba(168,85,247,0.25);
          color: #E9DEFF; padding: 10px 16px; border-radius: 12px; cursor: pointer;
          font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 0.85rem;
          transition: all 0.2s;
        }
        .vc-back-btn:hover { background: rgba(168,85,247,0.15); border-color: rgba(168,85,247,0.5); }

        .vc-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px 18px; border-radius: 12px; cursor: pointer; border: none;
          font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 0.85rem;
          transition: all 0.2s; white-space: nowrap;
        }
        .vc-btn-primary {
          background: linear-gradient(135deg, #7C3AED 0%, #A855F7 60%, #C026D3 100%);
          color: #fff; box-shadow: 0 0 24px rgba(168,85,247,0.4);
        }
        .vc-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 34px rgba(168,85,247,0.6); }
        .vc-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .vc-btn-ghost {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(168,85,247,0.25); color: #C4B5FD;
        }
        .vc-btn-ghost:hover { background: rgba(168,85,247,0.12); }
        .vc-btn-outline {
          background: transparent; border: 1px solid rgba(168,85,247,0.35); color: #C4B5FD;
        }
        .vc-btn-outline:hover { background: rgba(168,85,247,0.1); border-color: rgba(168,85,247,0.6); }
        .vc-btn-block { width: 100%; margin-bottom: 8px; }

        .vc-icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 9px; cursor: pointer;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(168,85,247,0.2); color: #C4B5FD;
          transition: all 0.2s; flex-shrink: 0;
        }
        .vc-icon-btn:hover { background: rgba(168,85,247,0.2); color: #fff; }
        .vc-icon-btn-sm { width: 26px; height: 26px; border-radius: 7px; }

        /* ── STEP TABS ── */
        .vc-steps {
          display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 20px;
          scrollbar-width: none;
        }
        .vc-steps::-webkit-scrollbar { display: none; }
        .vc-step {
          display: flex; align-items: center; gap: 8px; flex-shrink: 0;
          padding: 10px 16px; border-radius: 12px; cursor: pointer;
          background: rgba(20,14,35,0.5); border: 1px solid rgba(168,85,247,0.15);
          font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 0.82rem; color: #7C6A9E;
          transition: all 0.2s;
        }
        .vc-step-badge {
          width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; background: rgba(255,255,255,0.08); flex-shrink: 0;
        }
        .vc-step-done { color: #C4B5FD; border-color: rgba(168,85,247,0.3); }
        .vc-step-done .vc-step-badge { background: linear-gradient(135deg,#7C3AED,#A855F7); color: #fff; }
        .vc-step-active {
          color: #F1E8FF; border-color: rgba(168,85,247,0.6);
          background: rgba(168,85,247,0.15); box-shadow: 0 0 20px rgba(168,85,247,0.25);
        }
        .vc-step-active .vc-step-badge { background: linear-gradient(135deg,#F3D89C,#A855F7); color: #1a0a2e; }
        .vc-step-idle { opacity: 0.55; }

        /* ── LAYOUT GRID ── */
        .vc-layout {
          display: grid;
          grid-template-columns: 260px 1fr 300px;
          gap: 18px;
          align-items: start;
        }
        .vc-left, .vc-right, .vc-center { display: flex; flex-direction: column; gap: 16px; }

        @media (max-width: 1180px) {
          .vc-layout { grid-template-columns: 220px 1fr; }
          .vc-right { grid-column: 1 / -1; flex-direction: row; flex-wrap: wrap; align-items: flex-start; }
          .vc-right > * { flex: 1 1 260px; }
        }
        @media (max-width: 800px) {
          .vc-layout { grid-template-columns: 1fr; }
          .vc-left { grid-column: 1; order: 2; }
          .vc-center { grid-column: 1; order: 1; }
          .vc-right { grid-column: 1; order: 3; flex-direction: column; }
          .vc-right > * { flex: 1 1 auto; }
        }

        /* ── PANEL ── */
        .vc-panel {
          background: rgba(20,14,35,0.55);
          border: 1px solid rgba(168,85,247,0.18);
          border-radius: 18px;
          padding: clamp(14px, 2vw, 18px);
          backdrop-filter: blur(10px);
        }
        .vc-panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .vc-panel-head h3, .vc-panel-title {
          font-family: 'Cinzel', serif; font-size: 0.92rem; font-weight: 700; color: #E9DEFF; margin: 0 0 12px;
        }
        .vc-panel-head h3 { margin-bottom: 0; }
        .vc-hint-dot {
          width: 16px; height: 16px; border-radius: 50%; font-size: 0.65rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          background: rgba(168,85,247,0.18); color: #C4B5FD;
        }

        /* ── SCENE LIST ── */
        .scene-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
        .scene-item {
          display: flex; align-items: center; gap: 10px; text-align: left;
          background: rgba(255,255,255,0.03); border: 1px solid transparent; border-radius: 12px;
          padding: 8px; cursor: pointer; transition: all 0.2s; color: inherit;
        }
        .scene-item:hover { background: rgba(168,85,247,0.1); }
        .scene-item.active { border-color: rgba(168,85,247,0.6); background: rgba(168,85,247,0.14); box-shadow: 0 0 16px rgba(168,85,247,0.2); }
        .scene-item img, .scene-item > div:first-child { border: 1px solid rgba(255,255,255,0.08); }
        .scene-item-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .scene-item-num {
          font-family: 'Cinzel', serif; font-size: 0.68rem; color: #A855F7; font-weight: 700;
        }
        .scene-item-title {
          font-size: 0.82rem; font-weight: 700; color: #F1E8FF;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .scene-item-duration {
          font-size: 0.7rem; color: #9B8EC4; display: flex; align-items: center; gap: 3px;
        }
        .vc-add-scene { margin-top: 4px; }

        .vc-field-label { font-family: 'Cinzel', serif; font-size: 0.8rem; color: #C4B5FD; display: block; margin-bottom: 8px; }
        .vc-input-wrap { position: relative; }
        .vc-input {
          width: 100%; padding: 10px 12px; border-radius: 10px;
          background: rgba(0,0,0,0.25); border: 1px solid rgba(168,85,247,0.25);
          color: #F1E8FF; font-family: 'Nunito', sans-serif; font-size: 0.85rem;
        }
        .vc-input:focus { outline: none; border-color: rgba(168,85,247,0.7); }

        .vc-tip {
          display: flex; gap: 10px; padding: 14px; border-radius: 14px;
          background: rgba(243,216,156,0.08); border: 1px solid rgba(243,216,156,0.25);
        }
        .vc-tip-icon { color: #F3D89C; flex-shrink: 0; margin-top: 1px; }
        .vc-tip p { margin: 0; font-size: 0.78rem; color: #D8CDEE; line-height: 1.5; }
        .vc-tip-compact { margin-top: 10px; padding: 10px 12px; }

        /* ── PREVIEW ── */
        .vc-preview-panel { padding-bottom: 14px; }
        .vc-preview-tabs { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
        .vc-pill-tab {
          padding: 7px 16px; border-radius: 99px; cursor: pointer; border: 1px solid rgba(168,85,247,0.25);
          background: transparent; color: #9B8EC4; font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 0.8rem;
          transition: all 0.2s;
        }
        .vc-pill-tab.active {
          background: linear-gradient(135deg, #7C3AED, #A855F7); color: #fff; border-color: transparent;
          box-shadow: 0 0 16px rgba(168,85,247,0.4);
        }
        .vc-preview-tabs-spacer { flex: 1; }
        .vc-ratio-select {
          display: flex; align-items: center; gap: 4px; font-size: 0.78rem; color: #C4B5FD;
          padding: 6px 12px; border-radius: 9px; background: rgba(255,255,255,0.05); border: 1px solid rgba(168,85,247,0.2);
          cursor: pointer;
        }
        .vc-chevron-down { transform: rotate(90deg); }

        .vc-video-frame {
          position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: 16px; overflow: hidden;
          background: #0B0817; border: 1px solid rgba(168,85,247,0.2); margin-bottom: 14px;
        }
        .vc-video-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(10,7,20,0) 55%, rgba(10,7,20,0.55) 100%);
        }
        .vc-video-play-btn {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
          width: 56px; height: 56px; border-radius: 50%; cursor: pointer; border: none;
          background: rgba(20,14,35,0.55); backdrop-filter: blur(6px);
          border: 1.5px solid rgba(255,255,255,0.3); color: #fff;
          display: flex; align-items: center; justify-content: center; transition: all 0.2s;
        }
        .vc-video-play-btn:hover { background: rgba(168,85,247,0.5); transform: translate(-50%,-50%) scale(1.08); }

        .vc-scrubber { display: flex; align-items: center; gap: 10px; }
        .vc-time { font-size: 0.75rem; color: #9B8EC4; white-space: nowrap; font-variant-numeric: tabular-nums; }
        .vc-range { -webkit-appearance: none; appearance: none; flex: 1; height: 4px; border-radius: 99px;
          background: linear-gradient(90deg, #A855F7 var(--val,40%), rgba(255,255,255,0.12) var(--val,40%)); cursor: pointer; }
        .vc-range::-webkit-slider-thumb {
          -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%;
          background: #F3D89C; box-shadow: 0 0 8px rgba(243,216,156,0.7); cursor: pointer;
        }
        .vc-range-main { min-width: 80px; }

        /* ── TIMELINE ── */
        .vc-timeline-ruler {
          display: flex; justify-content: space-between; font-size: 0.68rem; color: #6D5E93;
          margin-bottom: 8px; padding: 0 2px;
        }
        .timeline-track {
          display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;
        }
        .timeline-thumb {
          position: relative; width: 76px; height: 54px; border-radius: 8px; overflow: hidden;
          border: 2px solid rgba(168,85,247,0.15); cursor: pointer; flex-shrink: 0; padding: 0; background: none;
        }
        .timeline-thumb.active { border-color: #A855F7; box-shadow: 0 0 12px rgba(168,85,247,0.5); }
        .timeline-thumb-num {
          position: absolute; top: 3px; left: 4px; font-size: 0.62rem; font-weight: 800; color: #fff;
          background: rgba(0,0,0,0.5); padding: 1px 5px; border-radius: 5px;
        }
        .timeline-add {
          width: 76px; height: 54px; border-radius: 8px; flex-shrink: 0; cursor: pointer;
          background: rgba(255,255,255,0.03); border: 1.5px dashed rgba(168,85,247,0.35); color: #A855F7;
          display: flex; align-items: center; justify-content: center;
        }
        .vc-total-time { margin: 10px 0 0; font-size: 0.75rem; color: #9B8EC4; }

        /* ── EFFECTS ── */
        .effects-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px;
        }
        .effect-card {
          display: flex; flex-direction: column; align-items: flex-start; gap: 6px;
          padding: 14px; border-radius: 14px; cursor: pointer; text-align: left;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(168,85,247,0.18); color: inherit;
          transition: all 0.2s;
        }
        .effect-card:hover { background: rgba(168,85,247,0.12); border-color: rgba(168,85,247,0.4); transform: translateY(-2px); }
        .effect-icon {
          width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
          background: rgba(168,85,247,0.15); color: #C4B5FD;
        }
        .effect-label { font-size: 0.82rem; font-weight: 700; color: #F1E8FF; }
        .effect-sub { font-size: 0.7rem; color: #8C7BAE; display: flex; align-items: center; gap: 3px; }

        /* ── STYLE SELECTOR ── */
        .style-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .style-item {
          display: flex; flex-direction: column; gap: 6px; align-items: center; cursor: pointer;
          background: none; border: none; color: #C4B5FD; padding: 6px; border-radius: 14px; transition: all 0.2s;
        }
        .style-item span { font-size: 0.78rem; font-weight: 700; }
        .style-item > div, .style-item img { border: 2px solid rgba(168,85,247,0.2); transition: all 0.2s; }
        .style-item.active > div, .style-item.active img { border-color: #F3D89C; box-shadow: 0 0 14px rgba(243,216,156,0.4); }
        .style-item.active { color: #F3D89C; }
        .style-item:hover > div, .style-item:hover img { border-color: rgba(168,85,247,0.6); }

        /* ── CHOICE ROW (Sifat / FPS) ── */
        .choice-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
        .choice-btn {
          flex: 1 1 auto; min-width: 64px; display: flex; flex-direction: column; align-items: center; gap: 2px;
          padding: 10px 8px; border-radius: 11px; cursor: pointer;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(168,85,247,0.2); color: #C4B5FD;
          font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 0.8rem; transition: all 0.2s;
        }
        .choice-sub { font-size: 0.65rem; color: #8C7BAE; font-weight: 600; }
        .choice-btn.active {
          background: rgba(168,85,247,0.18); border-color: #A855F7; color: #F1E8FF;
          box-shadow: 0 0 14px rgba(168,85,247,0.3);
        }

        /* ── AUDIO ── */
        .audio-row { margin-bottom: 16px; }
        .audio-row:last-child { margin-bottom: 0; }
        .audio-row-head { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #C4B5FD; margin-bottom: 8px; font-weight: 700; }
        .audio-track {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(168,85,247,0.15);
          border-radius: 10px; padding: 8px 10px; margin-bottom: 8px;
        }
        .audio-track-name { font-size: 0.76rem; color: #D8CDEE; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .audio-slider-row { display: flex; align-items: center; gap: 8px; }

        /* ── EXPORT ── */
        .vc-eta { text-align: center; font-size: 0.72rem; color: #8C7BAE; margin: -2px 0 14px; }
        .vc-spin { animation: vc-spin 1s linear infinite; }
        @keyframes vc-spin { to { transform: rotate(360deg); } }

        /* ── MOBILE FINE-TUNING ── */
        @media (max-width: 640px) {
          .vc-header { flex-direction: column; align-items: stretch; }
          .vc-header-actions { justify-content: stretch; }
          .vc-header-actions .vc-btn { flex: 1; }
          .vc-back-btn { align-self: flex-start; }
          .scene-item-title { max-width: 140px; }
          .style-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}