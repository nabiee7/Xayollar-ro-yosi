import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, Headphones, Lightbulb, Play, Square, Mic,
  ChevronDown, MoreVertical, ArrowRight, BookOpen, LayoutGrid,
} from 'lucide-react';

const FONT_IMPORT_URL =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700&family=Nunito:wght@400;600;700;800&display=swap";

const IMAGES = {
  micIllustration: '/images/mic-illustration.png',
  flagUz: '/images/flags/uz.png',
  avatars: {
    girl: '/images/avatars/qiz-bolalar.png',
    boy: '/images/avatars/ogil-bolalar.png',
    woman: '/images/avatars/ayol.png',
    man: '/images/avatars/erkak.png',
    wizard: '/images/avatars/sehrgar.png',
    robot: '/images/avatars/robot.png',
  },
  covers: {
    forest: '/images/covers/sehrli-ormon.png',
    dragon: '/images/covers/ajdarho-dosti.png',
    castle: '/images/covers/sehrgar-maktabi.png',
    fairy: '/images/covers/sehrli-pari.png',
  },
};

interface VoiceType { key: string; label: string; img: string; }
const VOICE_TYPES: VoiceType[] = [
  { key: 'girl', label: 'Qiz bolalar', img: IMAGES.avatars.girl },
  { key: 'boy', label: "O'g'il bolalar", img: IMAGES.avatars.boy },
  { key: 'woman', label: 'Ayol', img: IMAGES.avatars.woman },
  { key: 'man', label: 'Erkak', img: IMAGES.avatars.man },
  { key: 'wizard', label: 'Sehrgar', img: IMAGES.avatars.wizard },
  { key: 'robot', label: 'Robot', img: IMAGES.avatars.robot },
];

interface SavedVoice { id: string; title: string; tags: string; duration: string; date: string; }
const SAVED_VOICES: SavedVoice[] = [
  { id: 'v1', title: "Sehrli o'rmon hikoyasi", tags: 'Qiz bolalar • Quvonchli', duration: '00:45', date: '14.05.2025' },
  { id: 'v2', title: 'Ajdarho bilan uchrashuv', tags: "O'g'il bolalar • Jiddiy", duration: '01:12', date: '14.05.2025' },
  { id: 'v3', title: 'Sehrgar maslahati', tags: 'Erkak • Sehrli', duration: '00:38', date: '13.05.2025' },
  { id: 'v4', title: "Pari qo'shig'i", tags: 'Qiz bolalar • Quvonchli', duration: '00:27', date: '13.05.2025' },
  { id: 'v5', title: 'Sarguzasht boshlanadi', tags: "O'g'il bolalar • Oddiy", duration: '01:05', date: '12.05.2025' },
];

interface ApplyCard { id: string; title: string; subtitle: string; pages: string; img: string; }
const APPLY_CARDS: ApplyCard[] = [
  { id: 'a1', title: "Sehrli o'rmon", subtitle: 'Bolalar uchun ertak', pages: '12 sahifa', img: IMAGES.covers.forest },
  { id: 'a2', title: "Ajdarho do'sti", subtitle: 'Sarguzasht hikoyasi', pages: '8 sahifa', img: IMAGES.covers.dragon },
  { id: 'a3', title: 'Sehrgar maktabi', subtitle: 'Fantastik hikoya', pages: '15 sahifa', img: IMAGES.covers.castle },
  { id: 'a4', title: 'Sehrli pari', subtitle: 'Qisqa ertak', pages: '5 sahifa', img: IMAGES.covers.fairy },
];

/* ────────────────────────────────────────────────────────────────────────
   AMBIENT STARS (Dashboard bilan bir xil)
   ──────────────────────────────────────────────────────────────────── */
function AmbientStars() {
  const stars = React.useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => {
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
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {stars.map(s => (
        <span
          key={s.id}
          style={{
            position: 'absolute', left: `${s.left}%`, top: `${s.top}%`,
            width: s.bright ? s.size + 1.5 : s.size, height: s.bright ? s.size + 1.5 : s.size,
            borderRadius: '50%', background: s.bright ? '#F3D89C' : '#C9B8F0',
            boxShadow: s.bright ? '0 0 8px rgba(243,216,156,0.9)' : '0 0 5px rgba(201,184,240,0.7)',
            opacity: 0.5,
            '--drift': `${s.drift}px`,
            animation: `star-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite, star-float ${s.duration * 1.6}s ease-in-out ${s.delay}s infinite`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   SMALL PIECES
   ──────────────────────────────────────────────────────────────────── */
function AvatarOption({ voice, active, onClick }: { voice: VoiceType; active: boolean; onClick: () => void }) {
  return (
    <button className={`avatar-option ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="avatar-option-img">
        <img src={voice.img} alt={voice.label} />
      </span>
      <span className="avatar-option-label">{voice.label}</span>
    </button>
  );
}

function SavedVoiceRow({ voice }: { voice: SavedVoice }) {
  return (
    <div className="saved-voice-row">
      <button className="saved-voice-play" aria-label="Ijro etish"><Play size={13} /></button>
      <div className="saved-voice-info">
        <div className="saved-voice-title">{voice.title}</div>
        <div className="saved-voice-tags">{voice.tags}</div>
      </div>
      <div className="saved-voice-meta">
        <button className="saved-voice-more" aria-label="Ko'proq"><MoreVertical size={14} /></button>
        <span className="saved-voice-duration">{voice.duration}</span>
        <span className="saved-voice-date">{voice.date}</span>
      </div>
    </div>
  );
}

function ApplyCardItem({ card }: { card: ApplyCard }) {
  return (
    <div className="apply-card">
      <div className="apply-card-img">
        <img src={card.img} alt={card.title} />
      </div>
      <div className="apply-card-body">
        <div className="apply-card-title">{card.title}</div>
        <div className="apply-card-subtitle">{card.subtitle}</div>
        <div className="apply-card-footer">
          <span className="apply-card-pages"><BookOpen size={11} /> {card.pages}</span>
          <button className="apply-card-btn">Qo'llash</button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────────────────── */
export default function VoiceGenerate() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [voiceType, setVoiceType] = useState('girl');
  const [isRecording, setIsRecording] = useState(false);
  const [applyTab, setApplyTab] = useState<'hikoya' | 'komiks'>('hikoya');

  return (
    <div style={{ minHeight: '100vh', background: '#0D0A1A', color: '#F1E8FF', position: 'relative' }}>
      <style>{`
        @import url('${FONT_IMPORT_URL}');
        * { box-sizing: border-box; }

        @keyframes star-twinkle { 0%, 100% { opacity: 0.15; } 50% { opacity: 1; } }
        @keyframes star-float {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(calc(-1 * var(--drift, 12px))) translateX(4px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="star-twinkle"], [style*="star-float"] { animation: none !important; }
        }

        .voice-shell { position: relative; z-index: 1; padding: clamp(16px,2.5vw,32px); }

        .voice-header {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap; margin-bottom: clamp(20px,3vw,32px);
        }

        .back-btn {
          display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 99px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(168,85,247,0.2); cursor: pointer;
          font-family: 'Nunito',sans-serif; font-weight: 700; font-size: 0.85rem; color: #E9DEFF;
        }

        .voice-title-block { text-align: center; flex: 1; min-width: 240px; }
        .voice-title {
          font-family: "'Cinzel Decorative', serif"; font-weight: 700;
          font-size: clamp(1.4rem,3vw,2rem); color: #F1E8FF;
          display: flex; align-items: center; justify-content: center; gap: 12px;
        }
        .voice-subtitle { font-family: 'Nunito',sans-serif; font-size: 0.9rem; color: #9B8EC4; margin-top: 6px; }

        .header-actions { display: flex; align-items: center; gap: 10px; }
        .btn-light {
          display: flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: 99px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(168,85,247,0.2); cursor: pointer;
          font-family: 'Nunito',sans-serif; font-weight: 700; font-size: 0.85rem; color: #E9DEFF;
        }
        .btn-solid {
          display: flex; align-items: center; gap: 7px; padding: 10px 20px; border-radius: 99px;
          background: linear-gradient(135deg,#7C3AED,#A855F7); border: none; cursor: pointer;
          font-family: 'Nunito',sans-serif; font-weight: 700; font-size: 0.85rem; color: #fff;
          box-shadow: 0 0 24px rgba(168,85,247,0.4);
        }

        .voice-body {
          display: grid;
          grid-template-columns: 300px 1fr 300px;
          gap: clamp(14px,2vw,22px);
          align-items: stretch;
        }

        .card {
          background: rgba(255,255,255,0.03); border-radius: 20px; border: 1px solid rgba(168,85,247,0.16);
          padding: clamp(16px,2vw,22px);
        }

        .panel-heading {
          display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
          font-family: "'Cinzel',serif"; font-weight: 700; font-size: 0.98rem; color: #F1E8FF;
        }

        .text-input {
          width: 100%; min-height: 110px; resize: vertical; border-radius: 12px;
          border: 1px solid rgba(168,85,247,0.18); background: rgba(255,255,255,0.02);
          padding: 12px 14px; font-family: 'Nunito',sans-serif; font-size: 0.85rem; color: #E9DEFF;
          outline: none;
        }
        .text-input::placeholder { color: #6F5F94; }
        .text-input:focus { border-color: rgba(168,85,247,0.5); }
        .char-count { text-align: right; font-family: 'Nunito',sans-serif; font-size: 0.72rem; color: #7C6A9E; margin-top: 6px; }

        .field-label {
          display: flex; align-items: center; gap: 7px; margin: 20px 0 10px;
          font-family: 'Nunito',sans-serif; font-weight: 800; font-size: 0.85rem; color: #D8CDEE;
        }

        .lang-select {
          width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 12px;
          border: 1px solid rgba(168,85,247,0.18); background: rgba(255,255,255,0.02); cursor: pointer;
          font-family: 'Nunito',sans-serif; font-weight: 700; font-size: 0.85rem; color: #E9DEFF;
        }
        .lang-select img { width: 20px; height: 14px; border-radius: 2px; object-fit: cover; }
        .lang-select .spacer { flex: 1; }

        .avatar-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .avatar-option {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 10px 6px; border-radius: 14px; border: 2px solid transparent;
          background: rgba(255,255,255,0.02); cursor: pointer; transition: all 0.15s ease;
        }
        .avatar-option:hover { background: rgba(168,85,247,0.08); }
        .avatar-option.active { border-color: #A855F7; background: rgba(168,85,247,0.16); }
        .avatar-option-img {
          width: 48px; height: 48px; border-radius: 50%; overflow: hidden;
          background: rgba(168,85,247,0.14); display: flex; align-items: center; justify-content: center;
        }
        .avatar-option-img img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-option-label {
          font-family: 'Nunito',sans-serif; font-weight: 700; font-size: 0.68rem; color: #B3A6D6; text-align: center;
        }

        /* CENTER RECORDING PANEL — rasm endi butun kartaga orqa fon bo'lib to'liq yoyiladi */
        .record-card {
          position: relative;
          height: 100%;
          overflow: hidden;
          padding: 0;
        }

        /* Rasm — kartaning orqasida, to'liq kenglik/balandlikni qoplaydi */
        .mic-illustration {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          max-width: none;
          z-index: 0;
        }
        .mic-illustration img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Rasm ustida o'qilishi uchun qorong'ilashtiruvchi qatlam */
        .record-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(13,10,26,0.35) 0%, rgba(13,10,26,0.55) 55%, rgba(13,10,26,0.85) 100%);
          z-index: 1;
        }

        /* Haqiqiy kontent — rasm va overlay ustida joylashadi */
        .record-card-content {
          position: relative;
          z-index: 2;
          height: 100%;
          padding: clamp(16px,2vw,22px);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: 16px;
          text-align: center;
        }

        .tips-btn {
          position: absolute; top: clamp(16px,2vw,22px); right: clamp(16px,2vw,22px);
          display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 99px;
          background: rgba(0,0,0,0.35); border: 1px solid rgba(168,85,247,0.35); cursor: pointer;
          font-family: 'Nunito',sans-serif; font-weight: 700; font-size: 0.78rem; color: #E9DEFF;
          z-index: 3; backdrop-filter: blur(4px);
        }

        .waveform { display: flex; align-items: center; justify-content: center; gap: 3px; height: 40px; }
        .waveform span { width: 3px; border-radius: 2px; background: linear-gradient(180deg,#C4B5FD,#A855F7); opacity: 0.6; }

        .time-display { font-family: 'Nunito',sans-serif; font-weight: 700; font-size: 0.85rem; color: #9B8EC4; }

        .record-controls { display: flex; align-items: center; justify-content: center; gap: 22px; }
        .record-side-btn {
          width: 46px; height: 46px; border-radius: 50%; border: 1px solid rgba(168,85,247,0.2);
          background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; cursor: pointer; color: #C4B5FD;
        }
        .record-main-btn {
          width: 68px; height: 68px; border-radius: 50%; border: none; cursor: pointer;
          background: linear-gradient(135deg,#7C3AED,#A855F7); color: #fff;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 30px rgba(168,85,247,0.45);
        }
        .record-main-btn.recording { background: linear-gradient(135deg,#E24A6E,#F76B8A); }

        .record-hint { font-family: 'Nunito',sans-serif; font-size: 0.8rem; color: #8A79B8; }

        .record-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
        .btn-outline-purple {
          display: flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 99px;
          background: rgba(255,255,255,0.03); border: 1.5px solid #A855F7; cursor: pointer;
          font-family: 'Nunito',sans-serif; font-weight: 700; font-size: 0.85rem; color: #D8B4FE;
        }
        .btn-fill-purple {
          display: flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 99px;
          background: linear-gradient(135deg,#7C3AED,#A855F7); border: none; cursor: pointer;
          font-family: 'Nunito',sans-serif; font-weight: 700; font-size: 0.85rem; color: #fff;
          box-shadow: 0 0 24px rgba(168,85,247,0.35);
        }

        /* RIGHT SAVED VOICES */
        .saved-voice-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid rgba(168,85,247,0.1); }
        .saved-voice-row:last-of-type { border-bottom: none; }
        .saved-voice-play {
          width: 30px; height: 30px; border-radius: 50%; border: none; cursor: pointer;
          background: rgba(168,85,247,0.18); color: #D8B4FE; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .saved-voice-info { flex: 1; min-width: 0; }
        .saved-voice-title {
          font-family: 'Nunito',sans-serif; font-weight: 700; font-size: 0.82rem; color: #F1E8FF;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .saved-voice-tags { font-family: 'Nunito',sans-serif; font-size: 0.7rem; color: #8A79B8; }
        .saved-voice-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
        .saved-voice-more { background: none; border: none; cursor: pointer; color: #7C6A9E; padding: 0; }
        .saved-voice-duration { font-family: 'Nunito',sans-serif; font-weight: 700; font-size: 0.76rem; color: #B3A6D6; }
        .saved-voice-date { font-family: 'Nunito',sans-serif; font-size: 0.66rem; color: #7C6A9E; }

        .see-all-btn {
          width: 100%; margin-top: 14px; padding: 11px; border-radius: 12px; border: none; cursor: pointer;
          background: rgba(168,85,247,0.16); color: #D8B4FE; font-family: 'Nunito',sans-serif; font-weight: 800; font-size: 0.82rem;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }

        /* BOTTOM APPLY SECTION — butun kenglikda, kichik kartalar */
        .apply-section { margin-top: clamp(16px,2vw,24px); }
        .apply-header {
          display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 16px;
        }
        .apply-heading {
          font-family: "'Cinzel',serif"; font-weight: 700; font-size: 0.98rem; color: #F1E8FF;
          display: flex; align-items: center; gap: 8px;
        }
        .apply-heading-sub { font-family: 'Nunito',sans-serif; font-size: 0.8rem; color: #8A79B8; margin-top: 2px; }
        .apply-tabs { display: flex; gap: 8px; }
        .apply-tab {
          display: flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 99px; cursor: pointer;
          font-family: 'Nunito',sans-serif; font-weight: 700; font-size: 0.8rem;
          border: 1px solid rgba(168,85,247,0.2); background: rgba(255,255,255,0.03); color: #B3A6D6;
        }
        .apply-tab.active { background: rgba(168,85,247,0.2); border-color: #A855F7; color: #F3D89C; }

        .apply-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .apply-card {
          background: rgba(255,255,255,0.02); border-radius: 16px; overflow: hidden; border: 1px solid rgba(168,85,247,0.16);
        }
        .apply-card-img { width: 100%; aspect-ratio: 4/3; background: rgba(168,85,247,0.1); }
        .apply-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .apply-card-body { padding: 12px 14px 14px; }
        .apply-card-title { font-family: "'Cinzel',serif"; font-weight: 600; font-size: 0.85rem; color: #F1E8FF; }
        .apply-card-subtitle { font-family: 'Nunito',sans-serif; font-size: 0.72rem; color: #8A79B8; margin: 2px 0 10px; }
        .apply-card-footer { display: flex; align-items: center; justify-content: space-between; }
        .apply-card-pages { display: flex; align-items: center; gap: 4px; font-family: 'Nunito',sans-serif; font-size: 0.7rem; color: #7C6A9E; }
        .apply-card-btn {
          padding: 6px 14px; border-radius: 99px; border: none; cursor: pointer;
          background: linear-gradient(135deg,#7C3AED,#A855F7); color: #fff;
          font-family: 'Nunito',sans-serif; font-weight: 700; font-size: 0.72rem;
        }

        .footer-note {
          text-align: center; margin-top: 24px; font-family: 'Nunito',sans-serif; font-size: 0.78rem; color: #7C6A9E;
        }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.3); border-radius: 99px; }

        /* RESPONSIVE */
        @media (max-width: 1180px) {
          .voice-body { grid-template-columns: 1fr; }
          .record-card { height: auto; min-height: 480px; }
          .apply-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .voice-header { justify-content: center; text-align: center; }
          .header-actions { width: 100%; justify-content: center; }
          .avatar-grid { grid-template-columns: repeat(3, 1fr); }
          .record-controls { gap: 14px; }
          .apply-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <AmbientStars />

      <div className="voice-shell">
        {/* HEADER */}
        <div className="voice-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Orqaga
          </button>

          <div className="voice-title-block">
            <div className="voice-title">
              <Sparkles size={20} color="#F3D89C" /> Ovoz berish <Sparkles size={20} color="#F3D89C" />
            </div>
            <div className="voice-subtitle">Ovoz yozing, saqlang va hikoya yoki komikslarga jon bering</div>
          </div>

          <div className="header-actions">
            <button className="btn-light"><Headphones size={16} /> Mening ovozlarim</button>
            <button className="btn-solid"><Sparkles size={15} /> Yangi yozuv</button>
          </div>
        </div>

        {/* BODY — 3 ustun: chap panel / markaziy record / o'ng saqlangan ovozlar */}
        <div className="voice-body">
          {/* LEFT PANEL */}
          <div className="card">
            <div className="panel-heading"><BookOpen size={16} /> Matn kiriting</div>
            <textarea
              className="text-input"
              placeholder="Bu yerga hikoyangiz yoki komiks uchun matn yozing... Ovoz shu matn asosida o'qiladi."
              maxLength={2000}
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <div className="char-count">{text.length} / 2000 belgi</div>

            <div className="field-label">Ovoz tili</div>
            <button className="lang-select">
              <img src={IMAGES.flagUz} alt="O'zbekcha" />
              O'zbekcha
              <span className="spacer" />
              <ChevronDown size={15} />
            </button>

            <div className="field-label">Ovoz turi</div>
            <div className="avatar-grid">
              {VOICE_TYPES.map(v => (
                <AvatarOption key={v.key} voice={v} active={voiceType === v.key} onClick={() => setVoiceType(v.key)} />
              ))}
            </div>
          </div>

          {/* CENTER — record panel: rasm to'liq orqa fon, kontent uning ustida */}
          <div className="card record-card">
            <div className="mic-illustration">
              <img src="/voice.png" alt="Mikrofon illyustratsiyasi" />
            </div>

            <button className="tips-btn"><Lightbulb size={14} /> Maslahatlar</button>

            <div className="record-card-content">
              <div className="waveform">
                {Array.from({ length: 40 }).map((_, i) => (
                  <span key={i} style={{ height: `${8 + Math.abs(Math.sin(i / 3)) * 24}px` }} />
                ))}
              </div>

              <div className="time-display">00:00 / 00:00</div>

              <div className="record-controls">
                <button className="record-side-btn" aria-label="Ijro etish"><Play size={18} /></button>
                <button
                  className={`record-main-btn ${isRecording ? 'recording' : ''}`}
                  onClick={() => setIsRecording(r => !r)}
                  aria-label={isRecording ? "To'xtatish" : 'Yozishni boshlash'}
                >
                  <Mic size={26} />
                </button>
                <button className="record-side-btn" aria-label="To'xtatish"><Square size={16} /></button>
              </div>

              <div className="record-hint">
                Avval yozib oling yoki matnni avtomatik o'qitish uchun "O'qitish" tugmasini bosing.
              </div>

              <div className="record-actions">
                <button className="btn-outline-purple"><Sparkles size={15} /> Matnni o'qitish</button>
                <button className="btn-fill-purple"><Mic size={15} /> Ovoz yozish</button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="card">
            <div className="panel-heading">Saqlangan ovozlar</div>
            <div>
              {SAVED_VOICES.map(v => <SavedVoiceRow key={v.id} voice={v} />)}
            </div>
            <button className="see-all-btn">Barchasini ko'rish <ArrowRight size={15} /></button>
          </div>
        </div>

        {/* APPLY SECTION — butun kenglikda, kichik kartalar, 4 tadan qatorda */}
        <div className="apply-section card">
          <div className="apply-header">
            <div>
              <div className="apply-heading"><Sparkles size={15} color="#F3D89C" /> Ovozni qo'llash</div>
              <div className="apply-heading-sub">Yaratgan ovozingizni hikoya yoki komikslarga qo'shing</div>
            </div>
            <div className="apply-tabs">
              <button className={`apply-tab ${applyTab === 'hikoya' ? 'active' : ''}`} onClick={() => setApplyTab('hikoya')}>
                <BookOpen size={14} /> Hikoyalarga qo'llash
              </button>
              <button className={`apply-tab ${applyTab === 'komiks' ? 'active' : ''}`} onClick={() => setApplyTab('komiks')}>
                <LayoutGrid size={14} /> Komikslarga qo'llash
              </button>
            </div>
          </div>

          <div className="apply-grid">
            {APPLY_CARDS.map(c => <ApplyCardItem key={c.id} card={c} />)}
          </div>
        </div>

        <div className="footer-note">
          ✨ Yaratgan ovozlaringiz avtomatik saqlanadi va istalgan vaqtda ishlatishingiz mumkin.
        </div>
      </div>
    </div>
  );
}