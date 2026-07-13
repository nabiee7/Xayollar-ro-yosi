import { useState } from "react";
import { useNavigate } from "react-router-dom";

/* ===================== Panda maskot ===================== */
function Panda({ coverEyes }: { coverEyes: boolean }) {
  return (
    <div className="panda-wrap" aria-hidden="true">
      <svg viewBox="0 0 220 180" className="panda-svg">
        {/* quloqlar */}
        <circle cx="55" cy="42" r="26" className="panda-ear" />
        <circle cx="165" cy="42" r="26" className="panda-ear" />
        <circle cx="55" cy="42" r="14" className="panda-ear-inner" />
        <circle cx="165" cy="42" r="14" className="panda-ear-inner" />

        {/* bosh */}
        <ellipse cx="110" cy="95" rx="80" ry="72" className="panda-head" />

        <ellipse cx="76" cy="92" rx="22" ry="28" className="panda-patch" />
        <ellipse cx="144" cy="92" rx="22" ry="28" className="panda-patch" />

        {/* Oq ko'z */}
        <circle cx="76" cy="96" r="8" fill="#ffffff" />
        <circle cx="144" cy="96" r="8" fill="#ffffff" />

        {/* Qorachiq */}
        <circle
          cx="76"
          cy="96"
          r="3.5"
          className={`panda-eye ${coverEyes ? "closed" : ""}`}
        />
        <circle
          cx="144"
          cy="96"
          r="3.5"
          className={`panda-eye ${coverEyes ? "closed" : ""}`}
        />

        {/* Yaltirash */}
        <circle cx="77.5" cy="94.5" r="1" fill="#fff" />
        <circle cx="145.5" cy="94.5" r="1" fill="#fff" />

        {/* burun va og'iz */}
        <ellipse cx="110" cy="118" rx="10" ry="7" className="panda-nose" />
        <path d="M110,125 Q110,134 100,136" className="panda-mouth" />
        <path d="M110,125 Q110,134 120,136" className="panda-mouth" />

        {/* yonoqlar */}
        <ellipse cx="70" cy="118" rx="9" ry="6" className="panda-cheek" />
        <ellipse cx="150" cy="118" rx="9" ry="6" className="panda-cheek" />

        {/* chap panja */}
        <g className={`panda-paw paw-left ${coverEyes ? "cover" : ""}`}>
          <ellipse cx="0" cy="0" rx="20" ry="24" />
          <ellipse cx="-9" cy="-16" rx="5" ry="6" />
          <ellipse cx="1" cy="-20" rx="5" ry="6" />
          <ellipse cx="10" cy="-16" rx="5" ry="6" />
        </g>

        {/* o'ng panja */}
        <g className={`panda-paw paw-right ${coverEyes ? "cover" : ""}`}>
          <ellipse cx="0" cy="0" rx="20" ry="24" />
          <ellipse cx="-10" cy="-16" rx="5" ry="6" />
          <ellipse cx="-1" cy="-20" rx="5" ry="6" />
          <ellipse cx="9" cy="-16" rx="5" ry="6" />
        </g>
      </svg>
    </div>
  );
}

/* ===================== SVG ikonalar ===================== */
const IconUser = () => (
  <svg viewBox="0 0 24 24" className="field-icon"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-9 2.69-9 6v2h18v-2c0-3.31-3.67-6-9-6Z" /></svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" className="field-icon"><path d="M12 2a4 4 0 0 0-4 4v3H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a4 4 0 0 0-4-4Zm-2 7V6a2 2 0 1 1 4 0v3H10Z" /></svg>
);
const IconEye = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 24 24" className="field-icon eye-toggle">
    {open ? (
      <path d="M12 5c-5.5 0-9.5 4.5-10.5 7 1 2.5 5 7 10.5 7s9.5-4.5 10.5-7C21.5 9.5 17.5 5 12 5Zm0 11.5A4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 0 1 0 9Zm0-2.2a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z" />
    ) : (
      <path d="M3.3 2.3 21.7 20.7l-1.4 1.4-3-3A11.6 11.6 0 0 1 12 20C6.5 20 2.5 15.5 1.5 13c.5-1.2 1.9-3.5 4.2-5.3L1.9 3.7l1.4-1.4ZM12 7.5c.5 0 1 .07 1.4.2L8.2 12.9A4.5 4.5 0 0 1 12 7.5Zm0 9a4.5 4.5 0 0 0 4.4-5.5l1.7 1.7A11.7 11.7 0 0 1 20.5 13c-.7 1.5-3 4.7-6.7 5.9l-1.9-1.9c.06 0 .1.02.1.5Z" />
    )}
  </svg>
);

/* ===================== Fon: yulduzlar, oy, bulutlar ===================== */
const STARS = [
  [8, 12, 2], [18, 30, 1.4], [30, 8, 1.8], [46, 18, 1.2], [60, 6, 2.2],
  [72, 22, 1.4], [88, 10, 1.8], [95, 28, 1.2], [15, 46, 1.6], [40, 38, 1],
  [65, 42, 1.6], [82, 44, 1.2], [5, 60, 1.4], [25, 62, 1], [50, 58, 1.8],
  [92, 58, 1.4], [12, 24, 1], [56, 30, 1], [78, 34, 1], [35, 20, 1.2],
];

function NightSky() {
  return (
    <svg className="sky-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe8b0" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffe8b0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="shootGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <circle cx="82" cy="16" r="14" fill="url(#moonGlow)" />
      <path d="M84 8a10 10 0 1 0 0 18 8 8 0 0 1 0-18Z" className="moon" />

      {STARS.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r * 0.35} className="star" style={{ animationDelay: `${(i % 7) * 0.6}s` }} />
      ))}

      <line x1="6" y1="14" x2="16" y2="20" className="shoot-line" stroke="url(#shootGrad)" />
    </svg>
  );
}

function Clouds() {
  return (
    <svg className="clouds-svg" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,80 Q40,50 90,70 T190,65 T300,75 T400,60 L400,120 L0,120 Z" className="cloud cloud-back" />
      <path d="M0,95 Q60,70 130,90 T260,85 T400,95 L400,120 L0,120 Z" className="cloud cloud-front" />
    </svg>
  );
}

/* ===================== Asosiy sahifa ===================== */
export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleForgotPassword = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate("/forgotpassword");
  };

  return (
    <div className="xr-page">
      <NightSky />
      <Clouds />

      <button className="back-btn" aria-label="Orqaga" onClick={() => navigate(-1)}>
        <svg viewBox="0 0 24 24"><path d="M15 4 6 12l9 8" /></svg>
      </button>

      <div className="card-area">
        <Panda coverEyes={showPass} />

        <form className="glass-card" onSubmit={(e) => e.preventDefault()}>
          <h1 className="card-title"><span className="spark">✦</span> Kirish <span className="spark">✦</span></h1>

          <label className="field">
            <IconUser />
            <input type="text" placeholder="Foydalanuvchi nomi" required />
          </label>

          <label className="field">
            <IconLock />
            <input type={showPass ? "text" : "password"} placeholder="Parol" required />
            <button type="button" className="eye-btn" onClick={() => setShowPass((v) => !v)} aria-label="Parolni ko'rsatish">
              <IconEye open={showPass} />
            </button>
          </label>

          <button type="submit" className="submit-btn">Kirish</button>

          <a href="/forgot-password" className="forgot-link" onClick={handleForgotPassword}>
            Parolni unutdingizmi?
          </a>

          <button type="button" className="signup-btn" onClick={handleSignup}>
            Ro'yxatdan o'tish
          </button>
        </form>
      </div>

      <Styles />
    </div>
  );
}


/* ===================== Uslublar ===================== */
function Styles() {
  return (
    <style>{`
.xr-page{
  position:relative;
  min-height:100vh;
  width:100%;
  overflow:hidden;
  background:radial-gradient(ellipse at 70% 0%, #2d1155 0%, #150a30 45%, #0a0518 100%);
  display:flex;
  align-items:center;
  justify-content:center;
  padding:24px 16px;
  font-family:'Segoe UI', system-ui, sans-serif;
  box-sizing:border-box;
}
.xr-page *{ box-sizing:border-box; }

.sky-svg{ position:absolute; inset:0; width:100%; height:100%; z-index:0; }
.moon{ fill:#ffe9b8; filter:drop-shadow(0 0 6px rgba(255,230,170,.8)); }
.star{ fill:#fff; animation:twinkle 3s ease-in-out infinite; }
@keyframes twinkle{ 0%,100%{ opacity:.25; } 50%{ opacity:1; } }
.shoot-line{ stroke-width:.6; stroke-linecap:round; animation:shoot 5s linear infinite; opacity:0; }
@keyframes shoot{
  0%{ transform:translate(0,0); opacity:0; }
  4%{ opacity:1; }
  16%{ transform:translate(60px,45px); opacity:0; }
  100%{ opacity:0; }
}

.clouds-svg{ position:absolute; bottom:0; left:0; width:100%; height:22%; z-index:1; }
.cloud{ fill:#4b1f7a; opacity:.55; }
.cloud-back{ animation:driftSlow 18s ease-in-out infinite; }
.cloud-front{ fill:#5c2794; opacity:.7; animation:driftSlow 12s ease-in-out infinite reverse; }
@keyframes driftSlow{ 0%,100%{ transform:translateX(0); } 50%{ transform:translateX(-14px); } }

.back-btn{
  position:absolute; top:20px; left:20px; z-index:5;
  width:40px; height:40px; border-radius:50%;
  background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12);
  display:flex; align-items:center; justify-content:center; cursor:pointer;
}
.back-btn svg{ width:18px; height:18px; fill:none; stroke:#e6d8ff; stroke-width:2.4; stroke-linecap:round; stroke-linejoin:round; }

.card-area{ position:relative; z-index:2; width:100%; max-width:420px; display:flex; flex-direction:column; align-items:center; }

.panda-wrap{ position:relative; z-index:3; margin-bottom:-38px; width:120px; }
.panda-svg{ width:100%; overflow:visible; }
.panda-ear{ fill:#181022; }
.panda-ear-inner{ fill:#2c1d40; }
.panda-head{ fill:#faf3ff; }
.panda-patch{ fill:#181022; }
.panda-eye{ fill:#1c1128; transition:transform .35s ease; transform-origin:center; }
.panda-eye.closed{ transform:scaleY(.1); }
.panda-nose{ fill:#181022; }
.panda-mouth{ fill:none; stroke:#181022; stroke-width:2.4; stroke-linecap:round; }
.panda-cheek{ fill:#f0aecf; opacity:.7; }

.panda-paw{ fill:#faf3ff; stroke:#181022; stroke-width:1; transition:transform .5s cubic-bezier(.34,1.56,.64,1); }
.paw-left{ transform:translate(48px,150px) rotate(-8deg); }
.paw-right{ transform:translate(172px,150px) rotate(8deg) scale(-1,1); }
.paw-left.cover{ transform:translate(72px,92px) rotate(6deg); }
.paw-right.cover{ transform:translate(148px,92px) rotate(-6deg) scale(-1,1); }

.glass-card{
  position:relative; width:100%;
  background:rgba(35,18,60,.55);
  backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
  border:1px solid rgba(255,255,255,.09);
  border-radius:32px;
  padding:56px 28px 28px;
  display:flex; flex-direction:column; gap:14px;
  box-shadow:0 20px 60px rgba(0,0,0,.4);
}

.card-title{
  text-align:center; color:#fff; font-size:clamp(20px,4vw,26px);
  margin:0 0 10px; font-weight:700; letter-spacing:.2px;
}
.spark{ color:#c9a6ff; font-size:.7em; }

.field{
  position:relative; display:flex; align-items:center; gap:10px;
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.08);
  border-radius:16px; padding:14px 16px;
}
.field-icon{ width:18px; height:18px; fill:#b9a3dd; flex-shrink:0; }
.field input{
  flex:1; background:transparent; border:none; outline:none;
  color:#f3ecff; font-size:15px;
}
.field input::placeholder{ color:#8f7fb0; }

.eye-btn{ background:none; border:none; padding:0; cursor:pointer; display:flex; }
.eye-toggle{ fill:#b9a3dd; width:19px; height:19px; }

.submit-btn{
  margin-top:6px; border:none; border-radius:16px; padding:16px;
  color:#fff; font-size:16px; font-weight:700; cursor:pointer;
  background:linear-gradient(135deg,#7c3aed,#ec4899);
  box-shadow:0 10px 24px rgba(124,58,237,.35);
  transition:transform .2s ease, box-shadow .2s ease;
}
.submit-btn:hover{ transform:translateY(-2px); box-shadow:0 14px 30px rgba(124,58,237,.45); }
.submit-btn:active{ transform:translateY(0); }

.forgot-link{
  text-align:center; color:#c9bce0; font-size:14px;
  text-decoration:none; margin-top:2px;
}
.forgot-link:hover{ text-decoration:underline; color:#e685c9; }

.signup-btn{
  margin-top:8px; border:1px solid rgba(255,255,255,.18); border-radius:16px; padding:14px;
  color:#f3ecff; font-size:15px; font-weight:600; cursor:pointer;
  background:rgba(255,255,255,.05);
  transition:transform .2s ease, background .2s ease;
}
.signup-btn:hover{ transform:translateY(-2px); background:rgba(255,255,255,.1); }
.signup-btn:active{ transform:translateY(0); }

/* ===== Responsive ===== */
@media (min-width:900px){
  .card-area{ max-width:460px; }
  .glass-card{ padding:64px 36px 34px; }
  .panda-wrap{ width:140px; }
}
@media (max-width:480px){
  .glass-card{ padding:48px 20px 22px; border-radius:26px; }
  .panda-wrap{ width:100px; margin-bottom:-30px; }
  .card-title{ font-size:19px; }
  .field{ padding:12px 14px; }
  .submit-btn{ padding:14px; font-size:15px; }
}

@media (prefers-reduced-motion: reduce){
  .star, .shoot-line, .cloud-back, .cloud-front{ animation:none !important; }
}
    `}</style>
  );
}