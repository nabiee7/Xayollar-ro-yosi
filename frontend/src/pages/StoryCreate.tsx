import React, { useRef, useState, useMemo, useCallback } from "react";
import {
  ArrowLeft,
  Sparkles,
  Bookmark,
  PenLine,
  BookOpen,
  ImagePlus,
  Compass,
  Rocket,
  Heart,
  Search,
  Smile,
  MoreHorizontal,
  Drama,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  RotateCcw,
  ArrowRight,
  Moon,
  Star,
  type LucideIcon,
} from "lucide-react";

const FONT_IMPORT_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Manrope:wght@400;500;600;700&display=swap";

const HERO_VIDEO_SRC = "/video.mp4";

// ─── TYPES ───────────────────────────────────────────────────────────────────
type Genre = { id: string; label: string; icon: LucideIcon };
type Speck = { left: number; top: number; size: number; dur: number; delay: number };

const GENRES: Genre[] = [
  { id: "sarguzasht", label: "Sarguzasht", icon: Compass },
  { id: "sehrli", label: "Romantika", icon: Heart },
  { id: "fantastika", label: "Fantastika", icon: Rocket },
  { id: "dostlik", label: "Do'stlik", icon: Sparkles },
  { id: "misteriya", label: "Qo'rqinchli", icon: Search },
  { id: "komediya", label: "Komediya", icon: Smile },
  { id: "drama", label: "Drama", icon: Drama },
  { id: "boshqa", label: "Boshqa", icon: MoreHorizontal },
];

const PRESET_COVERS = [
  {
    id: "castle",
    label: "Sehrli qal'a",
    gradient: "linear-gradient(160deg,#241a45 0%,#3c2a68 45%,#c9924f 100%)",
  },
  {
    id: "river",
    label: "Oy nuri daryosi",
    gradient: "linear-gradient(160deg,#160f2e 0%,#1f2a52 55%,#5b7aa8 100%)",
  },
  {
    id: "tree",
    label: "Yorug' daraxt",
    gradient: "linear-gradient(160deg,#1c1030 0%,#3a1f4d 50%,#a85fc9 100%)",
  },
];

// ─── AMBIENT BACKGROUND ──────────────────────────────────────────────────────
// sits behind the hero AND every card: a slow starfield drift plus
// breathing aurora glows, quiet enough not to fight the content on top.
function AmbientBackground() {
  const specks = useMemo<Speck[]>(() => {
    const seeded: Speck[] = [];
    for (let i = 0; i < 34; i++) {
      const r = (n: number) => (Math.sin(n * 999) + 1) / 2; // deterministic pseudo-random
      seeded.push({
        left: r(i * 1.7) * 100,
        top: r(i * 2.3) * 100,
        size: 1 + r(i * 3.1) * 2.2,
        dur: 6 + r(i * 4.4) * 10,
        delay: r(i * 5.2) * 8,
      });
    }
    return seeded;
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
        background: "linear-gradient(180deg,#0b0620 0%,#150c2e 45%,#0b0620 100%)",
      }}
    >
      <div className="sc-aurora sc-aurora-a" />
      <div className="sc-aurora sc-aurora-b" />
      <div className="sc-aurora sc-aurora-c" />

      {specks.map((s, i) => (
        <span
          key={i}
          className="sc-speck"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── SECTION CARD ────────────────────────────────────────────────────────────
function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        position: "relative",
        zIndex: 1,
        borderRadius: 20,
        padding: "clamp(16px,3vw,24px)",
        marginBottom: 20,
        background: "rgba(30,20,60,0.46)",
        border: "1px solid rgba(167,139,250,0.16)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <h2
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(1.05rem,2.4vw,1.25rem)",
          fontWeight: 600,
          color: "#ece7fb",
          marginBottom: 16,
        }}
      >
        <Icon size={18} color="#c4a6f5" style={{ flexShrink: 0 }} />
        {title}
      </h2>
      {children}
    </section>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function StoryCreate() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [uploadedCover, setUploadedCover] = useState<string | null>(null);
  const [bodyText, setBodyText] = useState("");
  const [replayKey, setReplayKey] = useState(0);
  const [heroHovered, setHeroHovered] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const onCoverChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedCover(URL.createObjectURL(file));
      setCover("uploaded");
    }
  };

  // plays through once, then rewinds to the first frame and freezes —
  // once the intro is over it just reads like the original artwork
  const handleVideoEnded = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    v.pause();
    v.currentTime = 0;
  }, []);

  const replayIntro = () => {
    setReplayKey((k) => k + 1);
    requestAnimationFrame(() => videoRef.current?.play());
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", width: "100%", fontFamily: "'Manrope', sans-serif" }}>
      <style>{`
        @import url('${FONT_IMPORT_URL}');

        @keyframes sc-twinkle {
          0%, 100% { opacity: .2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes sc-drift-down {
          0% { transform: translateY(-6px); }
          50% { transform: translateY(10px); }
          100% { transform: translateY(-6px); }
        }
        .sc-speck {
          position: absolute;
          border-radius: 9999px;
          background: #efe6ff;
          box-shadow: 0 0 6px 1px rgba(239,230,255,0.7);
          animation-name: sc-twinkle, sc-drift-down;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        @keyframes sc-aurora-drift {
          0%   { transform: translate(0, 0) scale(1); opacity: .35; }
          50%  { transform: translate(4%, -3%) scale(1.12); opacity: .55; }
          100% { transform: translate(0, 0) scale(1); opacity: .35; }
        }
        .sc-aurora {
          position: absolute;
          border-radius: 9999px;
          filter: blur(70px);
          animation: sc-aurora-drift ease-in-out infinite;
        }
        .sc-aurora-a { width: 46vw; height: 46vw; left: -10vw; top: -12vw; background: radial-gradient(circle, rgba(124,58,237,0.55), transparent 70%); animation-duration: 22s; }
        .sc-aurora-b { width: 38vw; height: 38vw; right: -8vw; top: 20vh; background: radial-gradient(circle, rgba(240,201,135,0.28), transparent 70%); animation-duration: 26s; animation-delay: 2s; }
        .sc-aurora-c { width: 42vw; height: 42vw; left: 10vw; bottom: -16vw; background: radial-gradient(circle, rgba(91,122,168,0.35), transparent 70%); animation-duration: 30s; animation-delay: 4s; }

        .sc-field::placeholder { color: #6f6693; }

        .sc-saved-label { display: none; }
        .sc-genre-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .sc-cover-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .sc-footer-actions { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }

        @media (min-width: 600px) {
          .sc-saved-label { display: inline; }
          .sc-genre-grid { grid-template-columns: repeat(3, 1fr); }
          .sc-cover-grid { grid-template-columns: repeat(4, 1fr); }
          .sc-footer-actions { flex-direction: row; justify-content: flex-end; }
        }
        @media (min-width: 860px) {
          .sc-genre-grid { grid-template-columns: repeat(4, 1fr); }
        }

        @media (prefers-reduced-motion: reduce) {
          .sc-speck, .sc-aurora { animation: none; }
        }
      `}</style>

      <AmbientBackground />

      <div
        className="sc-container"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1200,
          margin: "0 auto",
          padding: "clamp(24px,4vw,40px) clamp(16px,4vw,32px)",
        }}
      >
        {/* ---------------- Header ---------------- */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <button
              aria-label="Orqaga"
              style={{
                marginTop: 4,
                flexShrink: 0,
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#c9bdec",
                background: "rgba(167,139,250,0.08)",
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(1.5rem,4vw,1.9rem)",
                  fontWeight: 600,
                  color: "#f3eefe",
                  margin: 0,
                }}
              >
                Yangi hikoya yaratish
                <Sparkles size={20} color="#f0c987" />
              </h1>
              <p style={{ fontSize: "clamp(0.75rem,1.8vw,0.875rem)", color: "#a99fcb", marginTop: 4 }}>
                Xayolingdagi olamni yozing va uni jonlantiring{" "}
                <Sparkles size={12} color="#f0c987" style={{ display: "inline", verticalAlign: "-1px" }} />
              </p>
            </div>
          </div>

          <button
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px clamp(12px,2vw,16px)",
              borderRadius: 12,
              border: "1px solid rgba(167,139,250,0.28)",
              cursor: "pointer",
              fontSize: "clamp(0.75rem,1.8vw,0.875rem)",
              fontWeight: 500,
              color: "#dccffb",
              background: "rgba(124,58,237,0.16)",
            }}
          >
            <Bookmark size={15} />
            <span className="sc-saved-label">Saqlanganlar</span>
          </button>
        </div>

        {/* ---------------- Hero — fixed site video, plays once, then freezes on frame 1 ---------------- */}
        <div
          key={replayKey}
          onMouseEnter={() => setHeroHovered(true)}
          onMouseLeave={() => setHeroHovered(false)}
          style={{
            position: "relative",
            width: "100%",
            overflow: "hidden",
            marginBottom: 32,
            aspectRatio: "16 / 9",
            borderRadius: 28,
            border: "1px solid rgba(167,139,250,0.25)",
            background: "radial-gradient(120% 90% at 50% 0%, #2a2054 0%, #150c2e 60%, #0b0620 100%)",
          }}
        >
          {/* decorative moon + stars sit over the clip, echoing the app's world */}
          <Moon size={46} color="#efe6ff" fill="#efe6ff" style={{ position: "absolute", top: 20, left: 32, opacity: 0.9 }} />
          <Star size={10} fill="#f0c987" color="#f0c987" style={{ position: "absolute", top: "14%", left: "22%" }} />
          <Star size={8} fill="#f0c987" color="#f0c987" style={{ position: "absolute", top: "10%", right: "18%" }} />
          <Star size={9} fill="#f0c987" color="#f0c987" style={{ position: "absolute", top: "28%", right: "8%" }} />

          {HERO_VIDEO_SRC ? (
            <video
              ref={videoRef}
              key={HERO_VIDEO_SRC + replayKey}
              src={HERO_VIDEO_SRC}
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnded}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            // placeholder while the real clip isn't wired up yet
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontSize: "clamp(0.75rem,1.8vw,0.875rem)", padding: "0 24px", textAlign: "center", color: "#7d74a1" }}>
                Sayt videosi shu yerga bog'lanadi — sahifa ochilganda bir marta ijro etiladi,
                so'ng birinchi kadrida (rasmdagidek) muzlab qoladi.
              </p>
            </div>
          )}

          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 80,
              pointerEvents: "none",
              background: "linear-gradient(180deg, transparent, rgba(11,6,32,0.7))",
            }}
          />

          {HERO_VIDEO_SRC && (
            <button
              onClick={replayIntro}
              aria-label="Videoni qayta ko'rish"
              title="Qayta ko'rish"
              style={{
                position: "absolute",
                bottom: 16,
                right: 16,
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.18)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(11,6,32,0.6)",
                opacity: heroHovered ? 1 : 0,
                transition: "opacity 0.2s ease",
              }}
            >
              <RotateCcw size={14} color="#e7defc" />
            </button>
          )}
        </div>

        {/* ---------------- Hikoya ma'lumotlari ---------------- */}
        <SectionCard title="Hikoya ma'lumotlari" icon={PenLine}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: "clamp(0.75rem,1.8vw,0.875rem)", color: "#b5aad6", marginBottom: 8 }}>
              Hikoya nomi
            </label>
            <div style={{ position: "relative" }}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                placeholder="Hikoyangiz uchun nom kiriting..."
                className="sc-field"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#a78bfa";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(167,139,250,0.18)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(167,139,250,0.22)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                style={{
                  width: "100%",
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontSize: "0.875rem",
                  outline: "none",
                  background: "rgba(14,9,34,0.55)",
                  border: "1px solid rgba(167,139,250,0.22)",
                  color: "#f0ebfc",
                }}
              />
              <span style={{ position: "absolute", right: 12, bottom: 12, fontSize: "0.688rem", color: "#6f6693" }}>
                {title.length}/100
              </span>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "clamp(0.75rem,1.8vw,0.875rem)", color: "#b5aad6", marginBottom: 8 }}>
              Qisqacha tavsif
            </label>
            <div style={{ position: "relative" }}>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value.slice(0, 300))}
                placeholder="Hikoyangiz haqida qisqacha yozing..."
                rows={3}
                className="sc-field"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#a78bfa";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(167,139,250,0.18)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(167,139,250,0.22)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                style={{
                  width: "100%",
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontSize: "0.875rem",
                  outline: "none",
                  resize: "none",
                  fontFamily: "inherit",
                  background: "rgba(14,9,34,0.55)",
                  border: "1px solid rgba(167,139,250,0.22)",
                  color: "#f0ebfc",
                }}
              />
              <span style={{ position: "absolute", right: 12, bottom: 12, fontSize: "0.688rem", color: "#6f6693" }}>
                {desc.length}/300
              </span>
            </div>
          </div>
        </SectionCard>

        {/* ---------------- Janr tanlang ---------------- */}
        <SectionCard title="Janr tanlang" icon={BookOpen}>
          <div className="sc-genre-grid">
            {GENRES.map(({ id, label, icon: Icon }) => {
              const active = genre === id;
              return (
                <button
                  key={id}
                  onClick={() => setGenre(id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.borderColor = "rgba(196,166,245,0.55)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = active ? "#a78bfa" : "rgba(167,139,250,0.18)";
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px",
                    borderRadius: 12,
                    justifyContent: "flex-start",
                    cursor: "pointer",
                    fontSize: "clamp(0.75rem,1.8vw,0.875rem)",
                    fontWeight: 500,
                    transition: "all 0.18s ease",
                    background: active ? "rgba(124,58,237,0.28)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${active ? "#a78bfa" : "rgba(167,139,250,0.18)"}`,
                    color: active ? "#f3eefe" : "#cabfe8",
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      background: active ? "rgba(240,201,135,0.22)" : "rgba(167,139,250,0.12)",
                    }}
                  >
                    <Icon size={14} color={active ? "#f0c987" : "#c4a6f5"} />
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* ---------------- Hikoya muqovasi ---------------- */}
        <SectionCard title="Hikoya muqovasi" icon={ImagePlus}>
          <div className="sc-cover-grid">
            <button
              onClick={() => coverInputRef.current?.click()}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              style={{
                aspectRatio: "1 / 1",
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                textAlign: "center",
                padding: "0 8px",
                cursor: "pointer",
                transition: "all 0.18s ease",
                border: "1.5px dashed rgba(167,139,250,0.35)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <ImagePlus size={20} color="#c4a6f5" />
              <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#cabfe8" }}>Muqova rasm yuklang</span>
              <span style={{ fontSize: "0.625rem", color: "#6f6693" }}>PNG, JPG format. Maksimal 5MB</span>
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onCoverChosen} />

            {uploadedCover && (
              <button
                onClick={() => setCover("uploaded")}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                style={{
                  position: "relative",
                  aspectRatio: "1 / 1",
                  borderRadius: 12,
                  overflow: "hidden",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.18s ease",
                  border: `2px solid ${cover === "uploaded" ? "#a78bfa" : "transparent"}`,
                }}
              >
                <img src={uploadedCover} alt="Yuklangan muqova" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            )}

            {PRESET_COVERS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCover(c.id)}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                aria-label={c.label}
                style={{
                  position: "relative",
                  aspectRatio: "1 / 1",
                  borderRadius: 12,
                  overflow: "hidden",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.18s ease",
                  background: c.gradient,
                  border: `2px solid ${cover === c.id ? "#a78bfa" : "transparent"}`,
                }}
              />
            ))}
          </div>
        </SectionCard>

        {/* ---------------- Boshlang'ich matn ---------------- */}
        <SectionCard title="Boshlang'ich matn" icon={PenLine}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 4,
              padding: "8px",
              borderRadius: "12px 12px 0 0",
              background: "rgba(14,9,34,0.55)",
              border: "1px solid rgba(167,139,250,0.22)",
              borderBottom: "none",
            }}
          >
            {[Bold, Italic, Underline, Strikethrough].map((Icon, i) => (
              <button key={i} style={toolbarBtnStyle}>
                <Icon size={14} />
              </button>
            ))}
            <span style={dividerStyle} />
            {[Heading1, Heading2].map((Icon, i) => (
              <button key={i} style={toolbarBtnStyle}>
                <Icon size={14} />
              </button>
            ))}
            <span style={dividerStyle} />
            {[List, ListOrdered].map((Icon, i) => (
              <button key={i} style={toolbarBtnStyle}>
                <Icon size={14} />
              </button>
            ))}
            <span style={dividerStyle} />
            <button style={toolbarBtnStyle}>
              <RotateCcw size={14} />
            </button>
          </div>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder="Hikoyangizni shu yerda boshlang..."
            rows={6}
            className="sc-field"
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#a78bfa";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(167,139,250,0.18)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(167,139,250,0.22)";
              e.currentTarget.style.boxShadow = "none";
            }}
            style={{
              width: "100%",
              borderRadius: "0 0 12px 12px",
              padding: "12px 16px",
              fontSize: "0.875rem",
              outline: "none",
              resize: "none",
              fontFamily: "inherit",
              background: "rgba(10,6,26,0.55)",
              border: "1px solid rgba(167,139,250,0.22)",
              borderTop: "none",
              color: "#f0ebfc",
            }}
          />
        </SectionCard>

        {/* ---------------- Footer actions ---------------- */}
        <div className="sc-footer-actions">
          <button
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 20px",
              borderRadius: 12,
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#cabfe8",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(167,139,250,0.22)",
            }}
          >
            <Bookmark size={15} />
            Qoralama sifatida saqlash
          </button>
          <button
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#fff",
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
              transition: "filter 0.15s ease",
            }}
          >
            Davom etish
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

const toolbarBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#cabfe8",
};

const dividerStyle: React.CSSProperties = {
  width: 1,
  height: 20,
  margin: "0 4px",
  background: "rgba(167,139,250,0.22)",
};