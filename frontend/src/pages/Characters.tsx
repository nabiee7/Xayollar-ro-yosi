import { useNavigate } from "react-router-dom";
import React, { useState, useRef } from "react";
import {
  ArrowLeft, Save, Sparkles, Wand2, Plus, MoreVertical, Trash2, X,
  Palette, Shirt, Gem, Scissors, Smile, PersonStanding, Dices, Check,
  RotateCw, ZoomIn, ZoomOut, Maximize2, User,
} from "lucide-react";

const FONT_IMPORT_URL =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700&family=Cormorant+Garamond:wght@700&family=Nunito:wght@400;600;700&display=swap";

// ─── TYPES ───────────────────────────────────────────────────────────────────
type Gender = "qiz" | "ogil";
type StyleMode = "multfilm" | "anime" | "realistik" | "fantaziya";
type TabId = "asosiy" | "yuz" | "soch" | "kiyim" | "aksessuar" | "ranglar";

interface OptionItem { id: string; title: string; emoji: string; img?: string; }
interface SavedCharacter {
  id: string; name: string; emoji: string; gender: Gender; styleMode: StyleMode;
}

// ─── STATIC DATA ─────────────────────────────────────────────────────────────
const STYLE_OPTIONS: { id: StyleMode; label: string; icon: any }[] = [
  { id: "multfilm", label: "Multfilm", icon: Smile },
  { id: "anime", label: "Anime", icon: Sparkles },
  { id: "realistik", label: "Realistik", icon: User },
  { id: "fantaziya", label: "Fantaziya", icon: Wand2 },
];

const BODY_TYPES = [0.62, 0.74, 0.86, 1, 1.14];

const AVATAR_MAP: Record<Gender, Record<StyleMode, string>> = {
  qiz: { multfilm: "🧙‍♀️", anime: "🧝‍♀️", realistik: "👧", fantaziya: "🧚‍♀️" },
  ogil: { multfilm: "🧙‍♂️", anime: "🧝‍♂️", realistik: "👦", fantaziya: "🧚‍♂️" },
};

const FACE_SHAPES: OptionItem[] = [
  { id: "dumaloq", title: "Dumaloq", emoji: "⚪" },
  { id: "oval", title: "Oval", emoji: "🥚" },
  { id: "kvadrat", title: "Kvadrat", emoji: "◻️" },
  { id: "yurak", title: "Yurak", emoji: "💠" },
];

const EXPRESSIONS: OptionItem[] = [
  { id: "baxtiyor", title: "Baxtiyor", emoji: "😊" },
  { id: "hayron", title: "Hayron", emoji: "😲" },
  { id: "uyquchi", title: "Uyquchi", emoji: "😴" },
  { id: "jiddiy", title: "Jiddiy", emoji: "🙂" },
];

const EYE_COLORS = ["#4A3728", "#1F6FEB", "#22C55E", "#A855F7", "#0B0812", "#38BDF8"];

const HAIR_STYLES: OptionItem[] = [
  { id: "tolqin", title: "To'lqinsimon", emoji: "〰️" },
  { id: "qisqa", title: "Qisqa", emoji: "✂️" },
  { id: "kokon", title: "Kokon", emoji: "🎀" },
  { id: "situlka", title: "Situlka", emoji: "🌀" },
  { id: "kalta", title: "Örim", emoji: "🧵" },
  { id: "yalt", title: "Yaltiroq", emoji: "✨" },
];

const HAIR_COLORS = ["#2B1B12", "#6B3A1F", "#F3D89C", "#A855F7", "#EF4444", "#0B0812"];
const SKIN_COLORS = ["#FDE1C9", "#F1C39B", "#D9A374", "#A9714C", "#6E4A32", "#472E1E"];

const CLOTHING: OptionItem[] = [
  { id: "sehrgar-ton", title: "Sehrgar toni", emoji: "🥋" },
  { id: "ritsar-zirh", title: "Ritsar zirhi", emoji: "🛡️" },
  { id: "kundalik", title: "Kundalik kiyim", emoji: "👕" },
  { id: "bayramona", title: "Bayramona ko'ylak", emoji: "👗" },
  { id: "yomgirpoosh", title: "Sayohatchi to'ni", emoji: "🧥" },
  { id: "shohona", title: "Shohona liboс", emoji: "👘" },
];

const OUTFIT_COLORS = ["#7C3AED", "#EF4444", "#22C55E", "#38BDF8", "#F3D89C", "#EC4899"];

const ACCESSORIES: OptionItem[] = [
  { id: "tayoq", title: "Sehrli tayoq", emoji: "🪄" },
  { id: "qalqon", title: "Qalqon", emoji: "🛡️" },
  { id: "qilich", title: "Qilich", emoji: "⚔️" },
  { id: "sumka", title: "Sumka", emoji: "🎒" },
  { id: "shlyapa", title: "Shlyapa", emoji: "🎩" },
  { id: "kozoynak", title: "Ko'zoynak", emoji: "👓" },
  { id: "toj", title: "Toj", emoji: "👑" },
  { id: "qanot", title: "Qanotlar", emoji: "🪽" },
];

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "asosiy", label: "Asosiy", icon: User },
  { id: "yuz", label: "Yuz", icon: Smile },
  { id: "soch", label: "Soch", icon: Scissors },
  { id: "kiyim", label: "Kiyim", icon: Shirt },
  { id: "aksessuar", label: "Aksessuar", icon: Gem },
  { id: "ranglar", label: "Ranglar", icon: Palette },
];

const INITIAL_CHARACTERS: SavedCharacter[] = [
  { id: "c1", name: "Lina", emoji: "🧙‍♀️", gender: "qiz", styleMode: "multfilm" },
  { id: "c2", name: "Afsona", emoji: "🧝‍♂️", gender: "ogil", styleMode: "anime" },
  { id: "c3", name: "Sehrli qiz", emoji: "🧚‍♀️", gender: "qiz", styleMode: "fantaziya" },
  { id: "c4", name: "Ajdarho", emoji: "🐉", gender: "ogil", styleMode: "fantaziya" },
  { id: "c5", name: "Tulki", emoji: "🦊", gender: "qiz", styleMode: "realistik" },
  { id: "c6", name: "Sehrgar", emoji: "🧙", gender: "ogil", styleMode: "multfilm" },
  { id: "c7", name: "Pari", emoji: "🧚", gender: "qiz", styleMode: "fantaziya" },
  { id: "c8", name: "Botir yigit", emoji: "🦸‍♂️", gender: "ogil", styleMode: "realistik" },
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── SMALL PRESENTATIONAL PIECES ─────────────────────────────────────────────
function OptionThumb({ item, selected, onPick }: { item: OptionItem; selected: boolean; onPick: (item: OptionItem) => void }) {
  const [failed, setFailed] = useState(false);
  return (
    <button className={`cc-option-card ${selected ? "selected" : ""}`} onClick={() => onPick(item)} title={item.title}>
      {item.img && !failed ? (
        <img src={item.img} alt={item.title} onError={() => setFailed(true)} />
      ) : (
        <span className="cc-option-emoji">{item.emoji}</span>
      )}
      <span className="cc-option-label">{item.title}</span>
    </button>
  );
}

function SwatchRow({ label, colors, value, onChange }: { label: string; colors: string[]; value: string; onChange: (hex: string) => void }) {
  return (
    <div className="cc-swatch-block">
      <div className="cc-swatch-label">{label}</div>
      <div className="cc-swatch-grid">
        {colors.map(hex => (
          <button
            key={hex}
            className={`cc-swatch ${value === hex ? "selected" : ""}`}
            style={{ background: hex }}
            onClick={() => onChange(hex)}
          >
            {value === hex && <Check size={14} color="#fff" />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── AMBIENT BACKGROUND — sehrli qahramon-studiyasi atmosferasi ─────────────
function CharAmbientBackground() {
  const dustColors = ["#A855F7", "#F3D89C", "#38BDF8", "#EC4899", "#22C55E"];
  const dust = Array.from({ length: 20 }, (_, i) => i);
  const motes = Array.from({ length: 22 }, (_, i) => i);

  return (
    <div className="cc-ambient" aria-hidden="true">
      <div className="cc-orb cc-orb-a" />
      <div className="cc-orb cc-orb-b" />
      <div className="cc-orb cc-orb-c" />
      <div className="cc-orb cc-orb-d" />

      <svg className="cc-magic-circle" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="180" fill="none" stroke="rgba(168,85,247,0.22)" strokeWidth="1" />
        <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(243,216,156,0.18)" strokeWidth="1" strokeDasharray="4 10" />
        <circle cx="200" cy="200" r="118" fill="none" stroke="rgba(168,85,247,0.16)" strokeWidth="1" />
        <g stroke="rgba(196,181,253,0.22)" strokeWidth="1">
          <line x1="200" y1="20" x2="200" y2="380" />
          <line x1="20" y1="200" x2="380" y2="200" />
          <line x1="60" y1="60" x2="340" y2="340" />
          <line x1="340" y1="60" x2="60" y2="340" />
        </g>
        <circle cx="200" cy="20" r="4" fill="rgba(243,216,156,0.5)" />
        <circle cx="200" cy="380" r="4" fill="rgba(243,216,156,0.5)" />
        <circle cx="20" cy="200" r="4" fill="rgba(243,216,156,0.5)" />
        <circle cx="380" cy="200" r="4" fill="rgba(243,216,156,0.5)" />
      </svg>
      <svg className="cc-magic-circle cc-magic-circle-rev" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="95" fill="none" stroke="rgba(168,85,247,0.2)" strokeWidth="1" strokeDasharray="2 8" />
      </svg>

      {motes.map((i) => (
        <span
          key={`mote-${i}`}
          className="cc-mote"
          style={{
            top: `${(i * 43) % 100}%`,
            left: `${(i * 29) % 100}%`,
            animationDelay: `${(i % 12) * 0.5}s`,
            animationDuration: `${3.5 + (i % 6)}s`,
          }}
        />
      ))}

      {dust.map((i) => (
        <span
          key={`dust-${i}`}
          className="cc-dust"
          style={{
            top: `${(i * 17) % 100}%`,
            background: dustColors[i % dustColors.length],
            boxShadow: `0 0 10px 2px ${dustColors[i % dustColors.length]}88`,
            animationDelay: `${(i % 10) * 1.6}s`,
            animationDuration: `${16 + (i % 8) * 2}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function CharacterCreationPage() {
  const navigate = useNavigate();

  // Core character state
  const [gender, setGender] = useState<Gender>("qiz");
  const [styleMode, setStyleMode] = useState<StyleMode>("multfilm");
  const [bodyTypeIdx, setBodyTypeIdx] = useState(2);
  const [age, setAge] = useState(12);

  // Detail selections
  const [faceShape, setFaceShape] = useState("dumaloq");
  const [eyeColor, setEyeColor] = useState(EYE_COLORS[0]);
  const [expression, setExpression] = useState("baxtiyor");
  const [hairStyle, setHairStyle] = useState("tolqin");
  const [hairColor, setHairColor] = useState(HAIR_COLORS[1]);
  const [skinColor, setSkinColor] = useState(SKIN_COLORS[0]);
  const [clothing, setClothing] = useState("sehrgar-ton");
  const [outfitColor, setOutfitColor] = useState(OUTFIT_COLORS[0]);
  const [accessories, setAccessories] = useState<string[]>(["tayoq"]);

  // UI state
  const [activeTab, setActiveTab] = useState<TabId>("asosiy");
  const [characters, setCharacters] = useState<SavedCharacter[]>(INITIAL_CHARACTERS);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("c1");
  const [charMenuId, setCharMenuId] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewFlipped, setPreviewFlipped] = useState(false);
  const [mobileSheet, setMobileSheet] = useState<null | "characters" | "settings">(null);
  const [toast, setToast] = useState<string | null>(null);
  const nameCounter = useRef(9);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const toggleAccessory = (id: string) => {
    setAccessories(prev => (prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]));
  };

  const handleRandomize = () => {
    setGender(pick<Gender>(["qiz", "ogil"]));
    setStyleMode(pick(STYLE_OPTIONS).id);
    setBodyTypeIdx(Math.floor(Math.random() * BODY_TYPES.length));
    setAge(4 + Math.floor(Math.random() * 13));
    setFaceShape(pick(FACE_SHAPES).id);
    setEyeColor(pick(EYE_COLORS));
    setExpression(pick(EXPRESSIONS).id);
    setHairStyle(pick(HAIR_STYLES).id);
    setHairColor(pick(HAIR_COLORS));
    setSkinColor(pick(SKIN_COLORS));
    setClothing(pick(CLOTHING).id);
    setOutfitColor(pick(OUTFIT_COLORS));
    setAccessories([pick(ACCESSORIES).id]);
    showToast("Tasodifiy qahramon yaratildi ✦");
  };

  const handleSave = () => {
    if (characters.length >= 50) { showToast("Limitga yetdingiz: 50/50"); return; }
    const id = `c-new-${nameCounter.current++}`;
    const name = `Qahramon ${characters.length + 1}`;
    setCharacters(prev => [{ id, name, emoji: AVATAR_MAP[gender][styleMode], gender, styleMode }, ...prev]);
    setSelectedCharacterId(id);
    showToast("Qahramon saqlandi");
  };

  const handleGenerate = () => {
    showToast("Qahramon yaratilmoqda ✦");
  };

  const handleNewCharacter = () => {
    setGender("qiz");
    setStyleMode("multfilm");
    setBodyTypeIdx(2);
    setAge(12);
    setFaceShape("dumaloq");
    setEyeColor(EYE_COLORS[0]);
    setExpression("baxtiyor");
    setHairStyle("tolqin");
    setHairColor(HAIR_COLORS[1]);
    setSkinColor(SKIN_COLORS[0]);
    setClothing("sehrgar-ton");
    setOutfitColor(OUTFIT_COLORS[0]);
    setAccessories([]);
    setSelectedCharacterId("");
    setActiveTab("asosiy");
    showToast("Yangi qahramon boshlandi");
  };

  const selectCharacter = (c: SavedCharacter) => {
    setSelectedCharacterId(c.id);
    setGender(c.gender);
    setStyleMode(c.styleMode);
  };

  const deleteCharacter = (id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
    setCharMenuId(null);
    if (selectedCharacterId === id) setSelectedCharacterId("");
  };

  const zoomIn = () => setPreviewScale(s => Math.min(1.6, +(s + 0.1).toFixed(2)));
  const zoomOut = () => setPreviewScale(s => Math.max(0.5, +(s - 0.1).toFixed(2)));
  const previewAvatar = AVATAR_MAP[gender][styleMode];
  const bodyScale = BODY_TYPES[bodyTypeIdx];

  // ═══════════════════════ RENDER ═══════════════════════
  return (
    <div className="cc-shell">
      <CharAmbientBackground />
      <style>{`
        @import url('${FONT_IMPORT_URL}');

        * { box-sizing: border-box; }
        .cc-shell {
          position: relative;
          min-height: 100vh;
          background: radial-gradient(ellipse at 50% -10%, #1a1030 0%, #0B0817 55%, #0B0817 100%);
          color: #F1E8FF;
          display: flex;
          flex-direction: column;
          font-family: 'Nunito', sans-serif;
          overflow-x: hidden;
        }
        .cc-shell > *:not(.cc-ambient) { position: relative; z-index: 1; }

        /* ── AMBIENT BACKGROUND ── */
        .cc-ambient { position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
        .cc-orb { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.4; animation: cc-orb-drift 28s ease-in-out infinite; }
        .cc-orb-a { width: 50vw; height: 50vw; max-width: 640px; max-height: 640px; top: -16%; left: -12%; background: radial-gradient(circle, rgba(124,58,237,0.6), transparent 70%); animation-duration: 30s; }
        .cc-orb-b { width: 44vw; height: 44vw; max-width: 560px; max-height: 560px; bottom: -14%; right: -10%; background: radial-gradient(circle, rgba(192,38,211,0.5), transparent 70%); animation-duration: 36s; animation-delay: -10s; }
        .cc-orb-c { width: 32vw; height: 32vw; max-width: 420px; max-height: 420px; top: 46%; left: 60%; background: radial-gradient(circle, rgba(243,216,156,0.32), transparent 70%); animation-duration: 40s; animation-delay: -20s; }
        .cc-orb-d { width: 26vw; height: 26vw; max-width: 340px; max-height: 340px; top: 8%; right: 22%; background: radial-gradient(circle, rgba(56,189,248,0.28), transparent 70%); animation-duration: 24s; animation-delay: -6s; }
        @keyframes cc-orb-drift { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(5%, 7%) scale(1.1); } 66% { transform: translate(-4%, -5%) scale(0.92); } }

        .cc-magic-circle { position: absolute; bottom: -12%; right: -10%; width: min(60vw, 720px); height: min(60vw, 720px); opacity: 0.55; animation: cc-circle-spin 90s linear infinite; }
        .cc-magic-circle-rev { animation: cc-circle-spin-rev 60s linear infinite; }
        @keyframes cc-circle-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes cc-circle-spin-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }

        .cc-mote { position: absolute; width: 3px; height: 3px; border-radius: 50%; background: #F3D89C; box-shadow: 0 0 7px 1.5px rgba(243,216,156,0.85); opacity: 0; animation-name: cc-mote-twinkle; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        @keyframes cc-mote-twinkle { 0%, 100% { opacity: 0; transform: scale(0.5) translateY(0); } 50% { opacity: 0.95; transform: scale(1.3) translateY(-6px); } }

        .cc-dust { position: absolute; left: -3%; width: 5px; height: 5px; border-radius: 50%; opacity: 0; animation-name: cc-dust-drift; animation-timing-function: linear; animation-iteration-count: infinite; }
        @keyframes cc-dust-drift { 0% { transform: translateX(0) translateY(0); opacity: 0; } 8% { opacity: 0.8; } 50% { transform: translateX(55vw) translateY(-6vh); opacity: 0.55; } 92% { opacity: 0.3; } 100% { transform: translateX(112vw) translateY(4vh); opacity: 0; } }

        @media (prefers-reduced-motion: reduce) {
          .cc-orb, .cc-magic-circle, .cc-mote, .cc-dust, .cc-avatar-float, .cc-avatar-ring { animation: none !important; }
        }

        /* ── Top bar ── */
        .cc-top {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; padding: 16px clamp(16px,3vw,32px);
          border-bottom: 1px solid rgba(168,85,247,0.18);
          background: rgba(13,10,26,0.75);
          backdrop-filter: blur(16px);
          flex-wrap: wrap;
        }
        .back-btn {
          display: flex; align-items: center; gap: 8px;
          background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.3);
          color: #E9DEFF; padding: 9px 16px; border-radius: 99px; cursor: pointer;
          font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 0.9rem;
          transition: all 0.2s;
        }
        .back-btn:hover { background: rgba(168,85,247,0.22); }
        .cc-title-wrap { text-align: center; }
        .cc-title {
          font-family: 'Cinzel Decorative', serif; font-weight: 700;
          font-size: clamp(1.1rem, 2.4vw, 1.6rem);
          background: linear-gradient(135deg, #F3D89C 0%, #A855F7 60%, #E9D5FF 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          display: flex; align-items: center; gap: 8px; justify-content: center;
        }
        .cc-subtitle { font-size: 0.78rem; color: #9B8EC4; letter-spacing: 0.03em; margin-top: 2px; }
        .top-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .top-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 16px; border-radius: 99px; cursor: pointer;
          font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 0.85rem;
          border: 1px solid rgba(168,85,247,0.3); background: rgba(168,85,247,0.08); color: #E9DEFF;
          transition: all 0.2s;
        }
        .top-btn:hover { background: rgba(168,85,247,0.2); }
        .top-btn.primary {
          border: none; color: #fff;
          background: linear-gradient(135deg, #7C3AED, #A855F7, #C026D3);
          box-shadow: 0 0 24px rgba(168,85,247,0.45);
        }
        .top-btn.primary:hover { box-shadow: 0 0 34px rgba(168,85,247,0.65); }

        /* ── Body layout ── */
        .cc-body {
          flex: 1; display: grid;
          grid-template-columns: 260px 1fr 320px;
          gap: 20px; padding: 20px clamp(16px,3vw,32px);
          padding-bottom: 20px;
        }
        .panel {
          background: rgba(20,14,35,0.55);
          border: 1px solid rgba(168,85,247,0.18);
          border-radius: 20px; padding: 16px;
          backdrop-filter: blur(10px);
        }
        .panel-title {
          font-family: 'Cinzel', serif; font-size: 0.78rem; letter-spacing: 0.14em;
          color: #C4B5FD; text-transform: uppercase; margin-bottom: 12px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .icon-add {
          width: 24px; height: 24px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
          background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.3); color: #C4B5FD; cursor: pointer;
        }
        .icon-add:hover { background: rgba(168,85,247,0.3); }

        /* left: characters */
        .cc-left { display: flex; flex-direction: column; gap: 16px; }
        .cc-char-count { font-weight: 700; color: #9B8EC4; font-size: 0.75rem; letter-spacing: normal; text-transform: none; }
        .cc-char-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .cc-char-card {
          position: relative; aspect-ratio: 1; border-radius: 14px; cursor: pointer;
          background: radial-gradient(ellipse at 40% 30%, rgba(124,58,237,0.28), rgba(15,10,26,0.9));
          border: 2px solid rgba(168,85,247,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.8rem; transition: all 0.15s;
        }
        .cc-char-card:hover { border-color: rgba(168,85,247,0.45); }
        .cc-char-card.selected { border-color: #F3D89C; box-shadow: 0 0 16px rgba(243,216,156,0.35); }
        .cc-char-name { grid-column: span 1; text-align: center; font-size: 0.68rem; font-weight: 700; color: #C4B5FD; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cc-char-slot { display: flex; flex-direction: column; gap: 2px; position: relative; }
        .cc-char-dots {
          position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; border-radius: 6px;
          background: rgba(10,7,20,0.6); border: none; color: #E9DEFF; display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .cc-char-menu {
          position: absolute; top: 26px; right: 2px; z-index: 20;
          background: #17112B; border: 1px solid rgba(168,85,247,0.3); border-radius: 10px;
          padding: 6px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .cc-char-menu button {
          display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 10px;
          background: none; border: none; color: #F87171; font-size: 0.75rem; font-weight: 700;
          cursor: pointer; border-radius: 8px; white-space: nowrap;
        }
        .cc-char-menu button:hover { background: rgba(248,113,113,0.12); }
        .cc-char-add {
          border: 2px dashed rgba(168,85,247,0.35); background: transparent; color: #A855F7;
        }
        .cc-tip-card {
          border-radius: 16px; padding: 14px;
          background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(219,39,119,0.12));
          border: 1px solid rgba(168,85,247,0.3);
          display: flex; gap: 10px; align-items: flex-start; font-size: 0.78rem; color: #E9DEFF; line-height: 1.4;
        }

        /* center: preview */
        .cc-center { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
        .cc-stage {
          position: relative; flex: 1;
          background: radial-gradient(ellipse at 50% 30%, rgba(124,58,237,0.18), rgba(10,7,20,0.6));
          border: 1px solid rgba(168,85,247,0.18);
          border-radius: 24px;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; min-height: 420px; padding: 24px;
        }
        .cc-avatar-ring {
          position: relative; display: flex; align-items: center; justify-content: center;
          width: min(70%, 320px); aspect-ratio: 1; border-radius: 50%;
          background: radial-gradient(circle, rgba(168,85,247,0.28), transparent 70%);
          animation: cc-ring-pulse 5s ease-in-out infinite;
        }
        @keyframes cc-ring-pulse { 0%, 100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.05); opacity: 1; } }
        .cc-avatar-platform {
          position: absolute; bottom: 6%; width: 62%; height: 14%; border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(168,85,247,0.45), transparent 75%);
          filter: blur(2px);
        }
        .cc-avatar-emoji {
          font-size: clamp(4.5rem, 14vw, 8rem);
          filter: drop-shadow(0 10px 30px rgba(124,58,237,0.55));
          animation: cc-avatar-float 4s ease-in-out infinite;
          transition: transform 0.25s ease;
        }
        @keyframes cc-avatar-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .cc-accessory-row { display: flex; gap: 6px; position: absolute; top: 8%; justify-content: center; width: 100%; font-size: 1.3rem; }
        .cc-stage-controls {
          display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap;
          background: rgba(20,14,35,0.55); border: 1px solid rgba(168,85,247,0.18);
          border-radius: 16px; padding: 10px 16px;
        }
        .cc-stage-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 10px; border: 1px solid rgba(168,85,247,0.25);
          background: rgba(168,85,247,0.08); color: #E9DEFF; cursor: pointer;
          font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 0.8rem;
        }
        .cc-stage-btn:hover { background: rgba(168,85,247,0.22); }

        /* right panel */
        .cc-right { display: flex; flex-direction: column; gap: 16px; overflow: visible; }
        .cc-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
        .cc-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 12px; border-radius: 99px; font-size: 0.76rem; font-weight: 700;
          border: 1px solid rgba(168,85,247,0.2); background: transparent; color: #9B8EC4; cursor: pointer;
        }
        .cc-tab.active { background: rgba(168,85,247,0.22); color: #F1E8FF; border-color: rgba(168,85,247,0.5); }

        .cc-section-label { font-size: 0.78rem; font-weight: 700; color: #C4B5FD; margin: 14px 0 8px; text-transform: none; letter-spacing: normal; }
        .cc-section-label:first-child { margin-top: 0; }

        .cc-choice-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .cc-choice-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 8px; border-radius: 12px; cursor: pointer;
          background: rgba(168,85,247,0.06); border: 1px solid rgba(168,85,247,0.2); color: #C4B5FD;
          font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 0.82rem;
        }
        .cc-choice-btn.active { background: rgba(168,85,247,0.28); border-color: #A855F7; color: #fff; box-shadow: 0 0 14px rgba(168,85,247,0.3); }

        .cc-style-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .cc-style-btn {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 14px 8px; border-radius: 14px; cursor: pointer;
          background: rgba(168,85,247,0.06); border: 1px solid rgba(168,85,247,0.2); color: #C4B5FD;
          font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 0.78rem;
        }
        .cc-style-btn.active { background: rgba(168,85,247,0.28); border-color: #A855F7; color: #fff; box-shadow: 0 0 14px rgba(168,85,247,0.3); }

        .cc-body-row { display: flex; align-items: flex-end; gap: 8px; justify-content: space-between; }
        .cc-body-btn {
          flex: 1; display: flex; align-items: flex-end; justify-content: center;
          height: 54px; border-radius: 10px; cursor: pointer;
          background: rgba(168,85,247,0.06); border: 1px solid rgba(168,85,247,0.2); color: #C4B5FD;
        }
        .cc-body-btn.active { background: rgba(168,85,247,0.28); border-color: #A855F7; color: #fff; }

        .cc-age-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; font-size: 0.82rem; color: #E9DEFF; font-weight: 700; }
        input[type="range"] { accent-color: #A855F7; width: 100%; }

        .cc-random-card {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          border-radius: 16px; padding: 14px 16px; margin-top: 6px;
          background: linear-gradient(135deg, rgba(124,58,237,0.22), rgba(219,39,119,0.14));
          border: 1px solid rgba(168,85,247,0.35);
        }
        .cc-random-text { font-size: 0.8rem; color: #E9DEFF; font-weight: 700; line-height: 1.3; }
        .cc-random-btn {
          flex-shrink: 0; width: 44px; height: 44px; border-radius: 12px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #7C3AED, #A855F7); color: #fff;
          display: flex; align-items: center; justify-content: center;
        }

        .cc-option-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .cc-option-card {
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          padding: 10px 4px; border-radius: 12px; cursor: pointer;
          background: rgba(168,85,247,0.06); border: 1px solid rgba(168,85,247,0.2); color: #C4B5FD;
        }
        .cc-option-card.selected { background: rgba(168,85,247,0.28); border-color: #A855F7; color: #fff; box-shadow: 0 0 14px rgba(168,85,247,0.3); }
        .cc-option-card img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px; }
        .cc-option-emoji { font-size: 1.5rem; }
        .cc-option-label { font-size: 0.65rem; font-weight: 700; text-align: center; line-height: 1.2; }

        .cc-swatch-block { margin-bottom: 4px; }
        .cc-swatch-label { font-size: 0.76rem; color: #9B8EC4; font-weight: 700; margin-bottom: 8px; }
        .cc-swatch-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
        .cc-swatch {
          width: 100%; aspect-ratio: 1; border-radius: 8px; cursor: pointer;
          border: 2px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center;
          transition: transform 0.15s;
        }
        .cc-swatch.selected { border-color: #F3D89C; transform: scale(1.1); }

        /* toast */
        .cc-toast {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          background: rgba(20,14,35,0.95); border: 1px solid rgba(168,85,247,0.4);
          color: #F1E8FF; padding: 10px 22px; border-radius: 99px; font-size: 0.85rem; font-weight: 700;
          z-index: 200; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        /* mobile bottom tabs + sheets */
        .mobile-tabbar { display: none; }
        .sheet-overlay { display: none; }

        /* ── Tablet: hide characters column, keep settings ── */
        @media (max-width: 1180px) {
          .cc-body { grid-template-columns: 1fr 320px; }
          .cc-left { display: none; }
          .mobile-tabbar { display: flex; }
          .mobile-tab-settings { display: none; }
        }

        /* ── Phone: single column, both side panels become sheets ── */
        @media (max-width: 760px) {
          .cc-body { grid-template-columns: 1fr; padding: 14px; gap: 14px; padding-bottom: 90px; }
          .cc-right { display: none; }
          .cc-top { padding: 12px 16px; }
          .top-actions .top-btn span { display: none; }
          .top-actions .top-btn { padding: 9px 12px; }
          .cc-stage { min-height: 48vh; padding: 14px; }
          .mobile-tab-settings { display: flex; }
        }

        @media (max-width: 1180px) {
          .mobile-tabbar {
            position: fixed; bottom: 0; left: 0; right: 0; z-index: 60;
            background: rgba(13,10,26,0.95); backdrop-filter: blur(16px);
            border-top: 1px solid rgba(168,85,247,0.25);
            padding: 8px 10px calc(8px + env(safe-area-inset-bottom));
            justify-content: space-around;
          }
          .mobile-tab {
            display: flex; flex-direction: column; align-items: center; gap: 3px;
            background: none; border: none; color: #9B8EC4; font-size: 0.62rem; font-weight: 700; cursor: pointer;
            padding: 6px 10px; border-radius: 10px;
          }
          .mobile-tab.active { color: #F1E8FF; background: rgba(168,85,247,0.18); }

          .sheet-overlay.open {
            display: block; position: fixed; inset: 0; z-index: 70;
            background: rgba(6,4,12,0.6); backdrop-filter: blur(2px);
          }
          .sheet {
            position: absolute; left: 0; right: 0; bottom: 0; max-height: 78vh; overflow-y: auto;
            background: #150F26; border-top: 1px solid rgba(168,85,247,0.35);
            border-radius: 22px 22px 0 0; padding: 18px; padding-bottom: calc(18px + env(safe-area-inset-bottom));
          }
          .sheet-handle { width: 40px; height: 4px; border-radius: 99px; background: rgba(255,255,255,0.2); margin: 0 auto 14px; }
          .sheet-close { position: absolute; top: 14px; right: 14px; color: #9B8EC4; background: none; border: none; cursor: pointer; }
        }

        @media (max-width: 420px) {
          .cc-option-grid { grid-template-columns: repeat(3, 1fr); }
          .cc-swatch-grid { grid-template-columns: repeat(5, 1fr); }
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className="cc-top">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Orqaga
        </button>
        <div className="cc-title-wrap">
          <div className="cc-title"><Sparkles size={20} /> Personaj yaratish <Sparkles size={20} /></div>
          <div className="cc-subtitle">O'z qahramoningizni yarating ✦</div>
        </div>
        <div className="top-actions">
          <button className="top-btn" onClick={handleSave}><Save size={16} /><span>Saqlash</span></button>
          <button className="top-btn primary" onClick={handleGenerate}><Sparkles size={16} /><span>Yaratish</span></button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="cc-body">
        {/* LEFT: saved characters */}
        <div className="cc-left">
          <div className="panel">
            <div className="panel-title">
              Mening qahramonlarim
              <span className="cc-char-count">{characters.length}/50</span>
            </div>
            <div className="cc-char-grid">
              {characters.map(c => (
                <div className="cc-char-slot" key={c.id}>
                  <div
                    className={`cc-char-card ${selectedCharacterId === c.id ? "selected" : ""}`}
                    onClick={() => selectCharacter(c)}
                  >
                    {c.emoji}
                    <button
                      className="cc-char-dots"
                      onClick={(e) => { e.stopPropagation(); setCharMenuId(charMenuId === c.id ? null : c.id); }}
                    >
                      <MoreVertical size={13} />
                    </button>
                    {charMenuId === c.id && (
                      <div className="cc-char-menu" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => deleteCharacter(c.id)}><Trash2 size={12} /> O'chirish</button>
                      </div>
                    )}
                  </div>
                  <div className="cc-char-name">{c.name}</div>
                </div>
              ))}
              <div className="cc-char-slot">
                <div className="cc-char-card cc-char-add" onClick={handleNewCharacter}>
                  <Plus size={22} />
                </div>
                <div className="cc-char-name">Yangi qo'shish</div>
              </div>
            </div>
          </div>

          <div className="cc-tip-card">
            <Sparkles size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>O'z tasavvuringizdagi qahramonni yarating va hikoyalaringizni jonlantiring!</span>
          </div>
        </div>

        {/* CENTER: preview stage */}
        <div className="cc-center">
          <div className="cc-stage">
            <div className="cc-avatar-ring" style={{ transform: `scale(${previewScale})` }}>
              <div className="cc-accessory-row">
                {accessories.map(id => ACCESSORIES.find(a => a.id === id)?.emoji).map((e, i) => <span key={i}>{e}</span>)}
              </div>
              <span
                className="cc-avatar-emoji"
                style={{ transform: `scale(${bodyScale}) scaleX(${previewFlipped ? -1 : 1})` }}
              >
                {previewAvatar}
              </span>
              <div className="cc-avatar-platform" />
            </div>
          </div>
          <div className="cc-stage-controls">
            <button className="cc-stage-btn" onClick={() => setPreviewFlipped(f => !f)}><RotateCw size={15} /> Aylantirish</button>
            <button className="cc-stage-btn" onClick={zoomOut}><ZoomOut size={15} /> Kichraytirish</button>
            <button className="cc-stage-btn" onClick={zoomIn}><ZoomIn size={15} /> Kattalashtirish</button>
            <button className="cc-stage-btn" onClick={() => setPreviewScale(1)}><Maximize2 size={15} /></button>
          </div>
        </div>

        {/* RIGHT: settings tabs */}
        <div className="cc-right">
          <div className="panel">
            <div className="cc-tabs">
              {TABS.map(t => (
                <button key={t.id} className={`cc-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>

            {activeTab === "asosiy" && (
              <>
                <div className="cc-section-label">Jins</div>
                <div className="cc-choice-row">
                  <button className={`cc-choice-btn ${gender === "qiz" ? "active" : ""}`} onClick={() => setGender("qiz")}><User size={16} /> Qiz</button>
                  <button className={`cc-choice-btn ${gender === "ogil" ? "active" : ""}`} onClick={() => setGender("ogil")}><User size={16} /> O'g'il bola</button>
                </div>

                <div className="cc-section-label">Tanlash uslubi</div>
                <div className="cc-style-grid">
                  {STYLE_OPTIONS.map(s => (
                    <button key={s.id} className={`cc-style-btn ${styleMode === s.id ? "active" : ""}`} onClick={() => setStyleMode(s.id)}>
                      <s.icon size={20} /> {s.label}
                    </button>
                  ))}
                </div>

                <div className="cc-section-label">Tana tuzilishi</div>
                <div className="cc-body-row">
                  {BODY_TYPES.map((scale, i) => (
                    <button key={i} className={`cc-body-btn ${bodyTypeIdx === i ? "active" : ""}`} onClick={() => setBodyTypeIdx(i)}>
                      <PersonStanding size={16 + i * 3} />
                    </button>
                  ))}
                </div>

                <div className="cc-section-label">Yosh</div>
                <div className="cc-age-row"><span>Yosh</span><span>{age} yosh</span></div>
                <input type="range" min={4} max={16} value={age} onChange={(e) => setAge(Number(e.target.value))} />

                <div className="cc-random-card">
                  <div className="cc-random-text">Tasodifiy qahramon yaratish<br /><span style={{ color: "#9B8EC4", fontWeight: 600 }}>Bir marta bosish bilan tasodifiy qahramon yaratish</span></div>
                  <button className="cc-random-btn" onClick={handleRandomize}><Dices size={18} /></button>
                </div>
              </>
            )}

            {activeTab === "yuz" && (
              <>
                <div className="cc-section-label">Yuz shakli</div>
                <div className="cc-option-grid">
                  {FACE_SHAPES.map(item => <OptionThumb key={item.id} item={item} selected={faceShape === item.id} onPick={(i) => setFaceShape(i.id)} />)}
                </div>
                <SwatchRow label="Ko'z rangi" colors={EYE_COLORS} value={eyeColor} onChange={setEyeColor} />
                <div className="cc-section-label">Ifoda</div>
                <div className="cc-option-grid">
                  {EXPRESSIONS.map(item => <OptionThumb key={item.id} item={item} selected={expression === item.id} onPick={(i) => setExpression(i.id)} />)}
                </div>
              </>
            )}

            {activeTab === "soch" && (
              <>
                <div className="cc-section-label">Soch turi</div>
                <div className="cc-option-grid">
                  {HAIR_STYLES.map(item => <OptionThumb key={item.id} item={item} selected={hairStyle === item.id} onPick={(i) => setHairStyle(i.id)} />)}
                </div>
                <SwatchRow label="Soch rangi" colors={HAIR_COLORS} value={hairColor} onChange={setHairColor} />
                <SwatchRow label="Teri rangi" colors={SKIN_COLORS} value={skinColor} onChange={setSkinColor} />
              </>
            )}

            {activeTab === "kiyim" && (
              <>
                <div className="cc-section-label">Kiyim turkumi</div>
                <div className="cc-option-grid">
                  {CLOTHING.map(item => <OptionThumb key={item.id} item={item} selected={clothing === item.id} onPick={(i) => setClothing(i.id)} />)}
                </div>
                <SwatchRow label="Kiyim rangi" colors={OUTFIT_COLORS} value={outfitColor} onChange={setOutfitColor} />
              </>
            )}

            {activeTab === "aksessuar" && (
              <>
                <div className="cc-section-label">Aksessuarlar (bir nechtasini tanlash mumkin)</div>
                <div className="cc-option-grid">
                  {ACCESSORIES.map(item => (
                    <OptionThumb key={item.id} item={item} selected={accessories.includes(item.id)} onPick={(i) => toggleAccessory(i.id)} />
                  ))}
                </div>
              </>
            )}

            {activeTab === "ranglar" && (
              <>
                <SwatchRow label="Teri rangi" colors={SKIN_COLORS} value={skinColor} onChange={setSkinColor} />
                <SwatchRow label="Soch rangi" colors={HAIR_COLORS} value={hairColor} onChange={setHairColor} />
                <SwatchRow label="Ko'z rangi" colors={EYE_COLORS} value={eyeColor} onChange={setEyeColor} />
                <SwatchRow label="Kiyim rangi" colors={OUTFIT_COLORS} value={outfitColor} onChange={setOutfitColor} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM TABS ── */}
      <div className="mobile-tabbar">
        <button className="mobile-tab" onClick={() => setMobileSheet("characters")}>
          <User size={18} /> Qahramonlarim
        </button>
        <button className="mobile-tab mobile-tab-settings" onClick={() => setMobileSheet("settings")}>
          <Wand2 size={18} /> Sozlash
        </button>
      </div>

      {/* ── MOBILE SHEETS ── */}
      <div className={`sheet-overlay ${mobileSheet ? "open" : ""}`} onClick={() => setMobileSheet(null)}>
        <div className="sheet" onClick={(e) => e.stopPropagation()}>
          <div className="sheet-handle" />
          <button className="sheet-close" onClick={() => setMobileSheet(null)}><X size={18} /></button>

          {mobileSheet === "characters" && (
            <>
              <div className="panel-title">
                Mening qahramonlarim
                <span className="cc-char-count">{characters.length}/50</span>
              </div>
              <div className="cc-char-grid">
                {characters.map(c => (
                  <div className="cc-char-slot" key={c.id}>
                    <div
                      className={`cc-char-card ${selectedCharacterId === c.id ? "selected" : ""}`}
                      onClick={() => { selectCharacter(c); setMobileSheet(null); }}
                    >
                      {c.emoji}
                      <button className="cc-char-dots" onClick={(e) => { e.stopPropagation(); deleteCharacter(c.id); }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="cc-char-name">{c.name}</div>
                  </div>
                ))}
                <div className="cc-char-slot">
                  <div className="cc-char-card cc-char-add" onClick={() => { handleNewCharacter(); setMobileSheet(null); }}>
                    <Plus size={22} />
                  </div>
                  <div className="cc-char-name">Yangi qo'shish</div>
                </div>
              </div>
            </>
          )}

          {mobileSheet === "settings" && (
            <>
              <div className="cc-tabs">
                {TABS.map(t => (
                  <button key={t.id} className={`cc-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
                    <t.icon size={14} /> {t.label}
                  </button>
                ))}
              </div>

              {activeTab === "asosiy" && (
                <>
                  <div className="cc-section-label">Jins</div>
                  <div className="cc-choice-row">
                    <button className={`cc-choice-btn ${gender === "qiz" ? "active" : ""}`} onClick={() => setGender("qiz")}><User size={16} /> Qiz</button>
                    <button className={`cc-choice-btn ${gender === "ogil" ? "active" : ""}`} onClick={() => setGender("ogil")}><User size={16} /> O'g'il bola</button>
                  </div>
                  <div className="cc-section-label">Tanlash uslubi</div>
                  <div className="cc-style-grid">
                    {STYLE_OPTIONS.map(s => (
                      <button key={s.id} className={`cc-style-btn ${styleMode === s.id ? "active" : ""}`} onClick={() => setStyleMode(s.id)}>
                        <s.icon size={20} /> {s.label}
                      </button>
                    ))}
                  </div>
                  <div className="cc-section-label">Tana tuzilishi</div>
                  <div className="cc-body-row">
                    {BODY_TYPES.map((scale, i) => (
                      <button key={i} className={`cc-body-btn ${bodyTypeIdx === i ? "active" : ""}`} onClick={() => setBodyTypeIdx(i)}>
                        <PersonStanding size={16 + i * 3} />
                      </button>
                    ))}
                  </div>
                  <div className="cc-section-label">Yosh</div>
                  <div className="cc-age-row"><span>Yosh</span><span>{age} yosh</span></div>
                  <input type="range" min={4} max={16} value={age} onChange={(e) => setAge(Number(e.target.value))} />
                  <div className="cc-random-card">
                    <div className="cc-random-text">Tasodifiy qahramon yaratish</div>
                    <button className="cc-random-btn" onClick={handleRandomize}><Dices size={18} /></button>
                  </div>
                </>
              )}

              {activeTab === "yuz" && (
                <>
                  <div className="cc-section-label">Yuz shakli</div>
                  <div className="cc-option-grid">
                    {FACE_SHAPES.map(item => <OptionThumb key={item.id} item={item} selected={faceShape === item.id} onPick={(i) => setFaceShape(i.id)} />)}
                  </div>
                  <SwatchRow label="Ko'z rangi" colors={EYE_COLORS} value={eyeColor} onChange={setEyeColor} />
                  <div className="cc-section-label">Ifoda</div>
                  <div className="cc-option-grid">
                    {EXPRESSIONS.map(item => <OptionThumb key={item.id} item={item} selected={expression === item.id} onPick={(i) => setExpression(i.id)} />)}
                  </div>
                </>
              )}

              {activeTab === "soch" && (
                <>
                  <div className="cc-section-label">Soch turi</div>
                  <div className="cc-option-grid">
                    {HAIR_STYLES.map(item => <OptionThumb key={item.id} item={item} selected={hairStyle === item.id} onPick={(i) => setHairStyle(i.id)} />)}
                  </div>
                  <SwatchRow label="Soch rangi" colors={HAIR_COLORS} value={hairColor} onChange={setHairColor} />
                  <SwatchRow label="Teri rangi" colors={SKIN_COLORS} value={skinColor} onChange={setSkinColor} />
                </>
              )}

              {activeTab === "kiyim" && (
                <>
                  <div className="cc-section-label">Kiyim turkumi</div>
                  <div className="cc-option-grid">
                    {CLOTHING.map(item => <OptionThumb key={item.id} item={item} selected={clothing === item.id} onPick={(i) => setClothing(i.id)} />)}
                  </div>
                  <SwatchRow label="Kiyim rangi" colors={OUTFIT_COLORS} value={outfitColor} onChange={setOutfitColor} />
                </>
              )}

              {activeTab === "aksessuar" && (
                <div className="cc-option-grid">
                  {ACCESSORIES.map(item => (
                    <OptionThumb key={item.id} item={item} selected={accessories.includes(item.id)} onPick={(i) => toggleAccessory(i.id)} />
                  ))}
                </div>
              )}

              {activeTab === "ranglar" && (
                <>
                  <SwatchRow label="Teri rangi" colors={SKIN_COLORS} value={skinColor} onChange={setSkinColor} />
                  <SwatchRow label="Soch rangi" colors={HAIR_COLORS} value={hairColor} onChange={setHairColor} />
                  <SwatchRow label="Ko'z rangi" colors={EYE_COLORS} value={eyeColor} onChange={setEyeColor} />
                  <SwatchRow label="Kiyim rangi" colors={OUTFIT_COLORS} value={outfitColor} onChange={setOutfitColor} />
                </>
              )}
            </>
          )}
        </div>
      </div>

      {toast && <div className="cc-toast">{toast}</div>}
    </div>
  );
}