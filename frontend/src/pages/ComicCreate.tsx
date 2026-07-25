import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowLeft, Undo2, Redo2, Moon, Save, Send,
  MousePointer2, Hand, Search, Grid3x3, Trash2, Minus, Plus,
  MessageSquare, MessageCircle, MessagesSquare, Cloud,
  Star, Flame, Feather, Heart, Zap, User, Wand2, BookOpen, ImagePlus,
} from 'lucide-react';

const FONT_IMPORT_URL =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700&family=Cormorant+Garamond:wght@700&family=Lora:wght@400&family=Nunito:wght@400;600;700&display=swap";

interface Bubble { text: string; }
interface Panel { id: string; gradient: string; imageUrl?: string; bubble?: Bubble; full?: boolean; }

const INITIAL_PANELS: Panel[] = [
  {
    id: 'p1',
    gradient: 'radial-gradient(ellipse at 60% 20%, rgba(201,184,240,0.35) 0%, transparent 55%), linear-gradient(160deg,#241a42 0%,#0f0a1f 100%)',
    bubble: { text: "Uzoq-uzoqlarda, sehrli bir mamlakat bor edi..." },
  },
  {
    id: 'p2',
    gradient: 'radial-gradient(ellipse at 30% 30%, rgba(168,85,247,0.4) 0%, transparent 55%), linear-gradient(160deg,#2a1a4a 0%,#120b22 100%)',
    bubble: { text: 'Men bu olamni kashf etishim kerak!' },
  },
  {
    id: 'p3',
    full: true,
    gradient: 'radial-gradient(ellipse at 50% 15%, rgba(120,90,200,0.35) 0%, transparent 60%), linear-gradient(160deg,#1c1436 0%,#0d0919 100%)',
    bubble: { text: "Qani endi yangi do'stlarim meni kutmoqda..." },
  },
  {
    id: 'p4',
    gradient: 'radial-gradient(ellipse at 70% 70%, rgba(168,85,247,0.35) 0%, transparent 55%), linear-gradient(160deg,#221a3e 0%,#100a1e 100%)',
    bubble: { text: 'Salom, sayohatchi!' },
  },
  {
    id: 'p5',
    gradient: 'radial-gradient(ellipse at 30% 20%, rgba(201,184,240,0.35) 0%, transparent 55%), linear-gradient(160deg,#241a42 0%,#0f0a1f 100%)',
    bubble: { text: 'Salom! Sen kimsan?' },
  },
];

interface ToolItem { key: string; icon: React.ReactNode; label: string; }
const TOOLS: ToolItem[] = [
  { key: 'select', icon: <MousePointer2 size={17} />, label: 'Tanlash' },
  { key: 'hand', icon: <Hand size={17} />, label: "Qo'l" },
  { key: 'zoom', icon: <Search size={17} />, label: 'Kattalashtirish' },
  { key: 'grid', icon: <Grid3x3 size={17} />, label: 'Panellar' },
  { key: 'delete', icon: <Trash2 size={17} />, label: "O'chirish" },
];

interface Character { id: string; gradient: string; icon: React.ReactNode; }
const CHARACTERS: Character[] = [
  { id: 'c1', gradient: 'linear-gradient(135deg,#F3C6D8,#C9A0E0)', icon: <User size={20} color="#3b1e63" /> },
  { id: 'c2', gradient: 'linear-gradient(135deg,#9BC7F0,#6E8FE0)', icon: <User size={20} color="#1c2b52" /> },
  { id: 'c3', gradient: 'linear-gradient(135deg,#CFC7B8,#8F8672)', icon: <Wand2 size={20} color="#382f22" /> },
  { id: 'c4', gradient: 'linear-gradient(135deg,#8FD6C4,#4E9C86)', icon: <Flame size={20} color="#123028" /> },
  { id: 'c5', gradient: 'linear-gradient(135deg,#F0B7D6,#D67FC0)', icon: <Sparkles size={20} color="#4a1e3c" /> },
];

interface BubbleShape { key: string; icon: React.ReactNode; }
const BUBBLE_SHAPES: BubbleShape[] = [
  { key: 'square', icon: <MessageSquare size={20} /> },
  { key: 'round', icon: <MessageCircle size={20} /> },
  { key: 'jagged', icon: <MessagesSquare size={20} /> },
  { key: 'thought', icon: <Cloud size={20} /> },
];

interface BgThumb { id: string; gradient: string; }
const BACKGROUNDS: BgThumb[] = [
  { id: 'b1', gradient: 'linear-gradient(160deg,#241a42,#0f0a1f)' },
  { id: 'b2', gradient: 'linear-gradient(160deg,#123028,#0a1a16)' },
  { id: 'b3', gradient: 'linear-gradient(160deg,#3a2a52,#160f28)' },
  { id: 'b4', gradient: 'linear-gradient(160deg,#7FB3E8,#4C7DBF)' },
  { id: 'b5', gradient: 'linear-gradient(160deg,#3f6b4a,#1c3322)' },
];

interface EffectItem { key: string; icon: React.ReactNode; }
const EFFECTS: EffectItem[] = [
  { key: 'swirl', icon: <Zap size={20} /> },
  { key: 'sparkle', icon: <Sparkles size={20} /> },
  { key: 'burst', icon: <Star size={20} /> },
  { key: 'hearts', icon: <Heart size={20} /> },
];

interface StickerItem { key: string; icon: React.ReactNode; }
const STICKERS: StickerItem[] = [
  { key: 'star', icon: <Star size={20} /> },
  { key: 'moon', icon: <Moon size={20} /> },
  { key: 'lantern', icon: <Flame size={20} /> },
  { key: 'book', icon: <BookOpen size={20} /> },
  { key: 'feather', icon: <Feather size={20} /> },
];

const TABS = ['Elementlar', 'Matn', 'Sozlamalar'] as const;

/* ────────────────────────────────────────────────────────────────────────
   SPEECH BUBBLE
   ──────────────────────────────────────────────────────────────────── */
function SpeechBubble({ text }: { text: string }) {
  return (
    <div className="speech-bubble">
      <span>{text}</span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   COMIC PANEL
   ──────────────────────────────────────────────────────────────────── */
function ComicPanel({ panel, onImageChange }: { panel: Panel; onImageChange: (file: File) => void }) {
  const inputId = `panel-upload-${panel.id}`;
  return (
    <div
      style={{
        gridColumn: panel.full ? '1 / -1' : undefined,
        position: 'relative',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.12)',
        overflow: 'hidden',
        background: panel.gradient,
        aspectRatio: panel.full ? '16 / 7' : '4 / 3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      {panel.bubble && <SpeechBubble text={panel.bubble.text} />}

      {panel.imageUrl ? (
        <img
          src={panel.imageUrl}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        />
      ) : (
        <label htmlFor={inputId} className="panel-image-upload">
          <ImagePlus size={26} />
          <span>Rasm qo'shish</span>
        </label>
      )}

      <input
        id={inputId}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onImageChange(file);
        }}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   RIGHT PANEL SECTION WRAPPER
   ──────────────────────────────────────────────────────────────────── */
function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h4 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '0.85rem', color: '#D8CDEE' }}>
          {title}
        </h4>
        <a href="#" style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.74rem', color: '#A855F7', textDecoration: 'none' }}>
          Barchasi
        </a>
      </div>
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────────────────── */
export default function ComicCreate() {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState('select');
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Elementlar');
  const [activePage, setActivePage] = useState(1);
  const [panels, setPanels] = useState<Panel[]>(INITIAL_PANELS);
  const pages = [1, 2, 3, 4];

  const handleImageChange = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setPanels(prev => prev.map(p => (p.id === id ? { ...p, imageUrl: reader.result as string } : p)));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0D0A1A', color: '#F1E8FF' }}>
      <style>{`
        @import url('${FONT_IMPORT_URL}');
        * { box-sizing: border-box; }

        .comic-shell { display: flex; flex-direction: column; min-height: 100vh; }

        .comic-header {
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          flex-wrap: wrap;
          padding: clamp(14px,2vw,22px) clamp(16px,3vw,32px);
          border-bottom: 1px solid rgba(168,85,247,0.14);
        }

        .comic-body { display: grid; grid-template-columns: 1fr 300px; gap: 0; flex: 1; min-height: 0; }

        .comic-main { min-width: 0; padding: clamp(14px,2vw,24px); display: flex; flex-direction: column; gap: 16px; }

        .comic-sidebar {
          border-left: 1px solid rgba(168,85,247,0.14);
          padding: clamp(14px,2vw,22px);
          overflow-y: auto;
        }

        .comic-toolbar {
          display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;
        }

        .comic-tools { display: flex; align-items: center; gap: 6px; }

        .tool-btn {
          width: 38px; height: 38px; border-radius: 10px; border: 1px solid rgba(168,85,247,0.18);
          background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #B3A6D6; transition: all 0.15s ease;
        }
        .tool-btn.active { background: rgba(168,85,247,0.22); border-color: rgba(168,85,247,0.6); color: #F3D89C; }

        .zoom-controls { display: flex; align-items: center; gap: 10px; }
        .zoom-btn {
          width: 32px; height: 32px; border-radius: 8px; border: 1px solid rgba(168,85,247,0.18);
          background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #B3A6D6;
        }

        .comic-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(168,85,247,0.14);
          border-radius: 16px; padding: clamp(12px,2vw,20px);
        }

        .pages-row { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 4px; }
        .page-thumb { flex-shrink: 0; width: 84px; cursor: pointer; }
        .page-thumb-frame {
          width: 84px; height: 100px; border-radius: 8px; border: 2px solid rgba(168,85,247,0.2);
          background: linear-gradient(160deg,#241a42,#0f0a1f); transition: border-color 0.15s ease;
        }
        .page-thumb.active .page-thumb-frame { border-color: #A855F7; }
        .page-thumb-label { text-align: center; font-family: 'Nunito',sans-serif; font-size: 0.72rem; color: #8A79B8; margin-top: 6px; }
        .page-thumb.active .page-thumb-label { color: #F3D89C; font-weight: 700; }
        .page-add {
          flex-shrink: 0; width: 84px; height: 100px; border-radius: 8px;
          border: 1.5px dashed rgba(168,85,247,0.35); background: rgba(168,85,247,0.05);
          display: flex; align-items: center; justify-content: center; cursor: pointer; color: #B79FE0;
        }

        .sidebar-tabs { display: flex; gap: 4px; margin-bottom: 20px; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(168,85,247,0.14); border-radius: 12px; padding: 4px; }
        .sidebar-tab {
          flex: 1; text-align: center; padding: 8px 6px; border-radius: 9px; border: none; cursor: pointer;
          background: transparent; color: #8A79B8; font-family: 'Nunito',sans-serif; font-weight: 700; font-size: 0.78rem;
          transition: all 0.15s ease;
        }
        .sidebar-tab.active { background: rgba(168,85,247,0.22); color: #F3D89C; }

        .avatar-grid, .shape-grid, .effect-grid, .sticker-grid {
          display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;
        }
        .avatar-circle {
          width: 100%; aspect-ratio: 1; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: 2px solid rgba(255,255,255,0.1); transition: transform 0.15s ease;
        }
        .avatar-circle:hover { transform: translateY(-2px); }

        .icon-tile {
          aspect-ratio: 1; border-radius: 12px; display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(168,85,247,0.16); color: #D8B4FE;
          cursor: pointer; transition: all 0.15s ease;
        }
        .icon-tile:hover { background: rgba(168,85,247,0.14); border-color: rgba(168,85,247,0.5); }

        .bg-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
        .bg-thumb {
          flex-shrink: 0; width: 66px; height: 66px; border-radius: 10px;
          border: 1px solid rgba(168,85,247,0.18); cursor: pointer;
        }

        .speech-bubble {
          position: relative;
          max-width: 78%;
          align-self: flex-start;
          background: rgba(255,255,255,0.92);
          color: #1c1030;
          border-radius: 14px;
          padding: 10px 14px;
          font-family: 'Nunito',sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          line-height: 1.3;
          box-shadow: 0 4px 14px rgba(0,0,0,0.3);
          z-index: 2;
        }
        .speech-bubble::after {
          content: '';
          position: absolute;
          bottom: -7px; left: 22px;
          width: 14px; height: 14px;
          background: rgba(255,255,255,0.92);
          clip-path: polygon(0 0, 100% 0, 0 100%);
        }

        .panel-image-upload {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          cursor: pointer; color: rgba(243,216,156,0.55);
          font-family: 'Nunito',sans-serif; font-size: 0.72rem; font-weight: 600;
          padding: 14px 18px; border-radius: 12px;
          border: 1.5px dashed rgba(243,216,156,0.35);
          background: rgba(255,255,255,0.02);
          transition: all 0.15s ease;
        }
        .panel-image-upload:hover {
          border-color: rgba(243,216,156,0.6);
          background: rgba(255,255,255,0.05);
          color: #F3D89C;
        }

        .top-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .btn-outline {
          display: flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 99px; cursor: pointer;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(168,85,247,0.25); color: #E9DEFF;
          font-family: 'Nunito',sans-serif; font-weight: 700; font-size: 0.82rem;
        }
        .btn-primary {
          display: flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 99px; cursor: pointer;
          background: linear-gradient(135deg,#7C3AED,#A855F7); border: none; color: #fff;
          font-family: 'Nunito',sans-serif; font-weight: 700; font-size: 0.82rem;
          box-shadow: 0 0 24px rgba(168,85,247,0.4);
        }
        .icon-btn {
          width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(168,85,247,0.2); color: #C4B5FD; cursor: pointer;
        }

        @media (max-width: 1024px) {
          .comic-body { grid-template-columns: 1fr; }
          .comic-sidebar { border-left: none; border-top: 1px solid rgba(168,85,247,0.14); }
        }

        @media (max-width: 640px) {
          .btn-outline span, .btn-primary span { display: none; }
          .comic-toolbar { justify-content: flex-start; }
        }

        @media (max-width: 480px) {
          .comic-grid { grid-template-columns: 1fr; }
        }

        ::-webkit-scrollbar { height: 8px; width: 8px; }
        ::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.3); border-radius: 99px; }
      `}</style>

      <div className="comic-shell">
        {/* HEADER */}
        <header className="comic-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <button onClick={() => navigate('/dashboard')} className="icon-btn" aria-label="Ortga">
              <ArrowLeft size={17} />
            </button>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 'clamp(1.05rem,2vw,1.35rem)',
                color: '#F1E8FF', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                Komiks yaratish <Sparkles size={16} color="#F3D89C" />
              </div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.8rem', color: '#9B8EC4' }}>
                O'zingizning betakror komiksingizni yarating
              </div>
            </div>
          </div>

          <div className="top-actions">
            <button className="icon-btn" aria-label="Bekor qilish"><Undo2 size={16} /></button>
            <button className="icon-btn" aria-label="Qaytarish"><Redo2 size={16} /></button>
            <button className="icon-btn" aria-label="Tungi rejim"><Moon size={16} /></button>
            <button className="btn-outline">
              <Save size={15} /> <span>Saqlash</span>
            </button>
            <button className="btn-primary">
              <Send size={15} /> <span>Nashr qilish</span>
            </button>
          </div>
        </header>

        <div className="comic-body">
          {/* MAIN EDITOR */}
          <div className="comic-main">
            <div className="comic-toolbar">
              <div className="comic-tools">
                {TOOLS.map(t => (
                  <button
                    key={t.key}
                    className={`tool-btn ${activeTool === t.key ? 'active' : ''}`}
                    onClick={() => setActiveTool(t.key)}
                    aria-label={t.label}
                    title={t.label}
                  >
                    {t.icon}
                  </button>
                ))}
              </div>
              <div className="zoom-controls">
                <button className="zoom-btn" onClick={() => setZoom(z => Math.max(25, z - 10))} aria-label="Kichraytirish">
                  <Minus size={15} />
                </button>
                <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.85rem', color: '#B3A6D6', minWidth: 40, textAlign: 'center' }}>
                  {zoom}%
                </span>
                <button className="zoom-btn" onClick={() => setZoom(z => Math.min(200, z + 10))} aria-label="Kattalashtirish">
                  <Plus size={15} />
                </button>
              </div>
            </div>

            <div className="comic-grid">
              {panels.map(p => (
                <ComicPanel key={p.id} panel={p} onImageChange={file => handleImageChange(p.id, file)} />
              ))}
            </div>

            <div>
              <h4 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '0.85rem', color: '#D8CDEE', marginBottom: 10 }}>
                Sahifalar
              </h4>
              <div className="pages-row">
                {pages.map(n => (
                  <div key={n} className={`page-thumb ${activePage === n ? 'active' : ''}`} onClick={() => setActivePage(n)}>
                    <div className="page-thumb-frame" />
                    <div className="page-thumb-label">{n}</div>
                  </div>
                ))}
                <button className="page-add" aria-label="Yangi sahifa">
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="comic-sidebar">
            <div className="sidebar-tabs">
              {TABS.map(tab => (
                <button
                  key={tab}
                  className={`sidebar-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'Elementlar' && (
              <>
                <PanelSection title="Qahramonlar">
                  <div className="avatar-grid">
                    {CHARACTERS.map(c => (
                      <div key={c.id} className="avatar-circle" style={{ background: c.gradient }}>
                        {c.icon}
                      </div>
                    ))}
                  </div>
                </PanelSection>

                <PanelSection title="Dialog oynalari">
                  <div className="shape-grid">
                    {BUBBLE_SHAPES.map(b => (
                      <div key={b.key} className="icon-tile">{b.icon}</div>
                    ))}
                  </div>
                </PanelSection>

                <PanelSection title="Fonlar">
                  <div className="bg-row">
                    {BACKGROUNDS.map(bg => (
                      <div key={bg.id} className="bg-thumb" style={{ background: bg.gradient }} />
                    ))}
                  </div>
                </PanelSection>

                <PanelSection title="Effektlar">
                  <div className="effect-grid">
                    {EFFECTS.map(e => (
                      <div key={e.key} className="icon-tile">{e.icon}</div>
                    ))}
                  </div>
                </PanelSection>

                <PanelSection title="Stikerlar">
                  <div className="sticker-grid">
                    {STICKERS.map(s => (
                      <div key={s.key} className="icon-tile">{s.icon}</div>
                    ))}
                  </div>
                </PanelSection>
              </>
            )}

            {activeTab === 'Matn' && (
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.85rem', color: '#8A79B8', textAlign: 'center', marginTop: 40 }}>
                Matn bo'limi (keyinroq qo'shiladi)
              </div>
            )}

            {activeTab === 'Sozlamalar' && (
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.85rem', color: '#8A79B8', textAlign: 'center', marginTop: 40 }}>
                Sozlamalar bo'limi (keyinroq qo'shiladi)
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}