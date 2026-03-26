import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logoMain from "../assets/logo1v3.png";

// ── Custom styles that can't be done with Tailwind base classes ──
const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap');

  .font-sora { font-family: 'Sora', sans-serif; }
  .font-playfair { font-family: 'Playfair Display', serif; }

  @keyframes twinkle {
    from { opacity: 0.05; }
    to   { opacity: 0.55; }
  }
  @keyframes floatOrb {
    from { transform: translate(0, 0); }
    to   { transform: translate(28px, -22px); }
  }
  @keyframes shimmer {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1; }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.15; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(26px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeUpDelay {
    0%, 17%  { opacity: 0; transform: translateY(26px); }
    100%     { opacity: 1; transform: translateY(0); }
  }
  @keyframes popIn {
    from { transform: scale(0.5); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }

  .star { animation: twinkle var(--d, 3s) var(--delay, 0s) ease-in-out infinite alternate; }
  .orb  { animation: floatOrb var(--dur, 14s) var(--delay, 0s) ease-in-out infinite alternate; }
  .shimmer-bar { animation: shimmer 4s ease-in-out infinite; }
  .dot-blink   { animation: blink 2s infinite; }
  .fade-up     { animation: fadeUp 0.85s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-delay { animation: fadeUp 0.85s 0.15s cubic-bezier(0.22,1,0.36,1) both; }
  .pop-in      { animation: popIn 0.6s 0.4s cubic-bezier(0.22,1,0.36,1) both; }

  .grad-text {
    background: linear-gradient(135deg, #60a5fa, #bae6fd);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .logo-grad-text {
    background: linear-gradient(135deg, #60a5fa, #f5c842);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .card-glow {
    box-shadow:
      0 40px 100px rgba(0,0,0,0.6),
      0 0 60px rgba(37,99,235,0.08),
      inset 0 1px 0 rgba(96,165,250,0.1),
      inset 0 -1px 0 rgba(0,0,0,0.3);
  }
  .card-shimmer::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(96,165,250,0.5), rgba(245,200,66,0.3), transparent);
  }
  .card-inner-glow::after {
    content: '';
    position: absolute;
    top: -80px; left: 50%; transform: translateX(-50%);
    width: 260px; height: 160px;
    background: radial-gradient(ellipse, rgba(37,99,235,0.12), transparent 70%);
    pointer-events: none;
  }

  .action-btn { transition: all 0.25s; }
  .action-btn:hover { transform: translateY(-3px); }
  .action-btn:active { transform: translateY(0) scale(0.98); }

  .btn-overlay {
    position: absolute; inset: 0; opacity: 0;
    transition: opacity 0.25s; pointer-events: none;
    border-radius: inherit;
  }
  .action-btn:hover .btn-overlay { opacity: 1; }

  .role-pill { transition: all 0.2s; }
  .role-pill:hover {
    background: rgba(37,99,235,0.15);
    border-color: rgba(96,165,250,0.35);
    color: #bae6fd;
    box-shadow: 0 4px 12px rgba(37,99,235,0.15);
  }
  .feat-item { transition: color 0.2s; }
  .feat-item:hover { color: rgba(255,255,255,0.7); }

  .nav-help-btn { transition: all 0.2s; }
  .nav-help-btn:hover {
    border-color: rgba(96,165,250,0.5);
    color: #60a5fa;
    background: rgba(37,99,235,0.1);
    box-shadow: 0 0 12px rgba(37,99,235,0.15);
  }

  .logo-box-glow {
    box-shadow: 0 0 24px rgba(37,99,235,0.45), 0 0 8px rgba(37,99,235,0.3);
  }
  .dot-glow {
    box-shadow: 0 0 6px rgba(96,165,250,0.8);
  }
`;

// ── Data ──
const ROLES = [
  { icon: "🎓", label: "Student-Athlete" },
  { icon: "🏋️", label: "Coach" },
  { icon: "📖", label: "Lecturer" },
  { icon: "🩺", label: "Medical Officer" },
];

const FEATURES = [
  "AI-powered schedule clash detection with instant WhatsApp alerts",
  "QR-based attendance tracking for sessions and lectures",
  "Full injury-to-recovery medical workflow with return-to-play clearance",
  "Academic deadline dashboard with automated reminders",
  "Performance analytics with skill radar charts and heatmaps",
];

const BUTTONS = [
  {
    key: "admin",
    icon: "⚙️",
    label: "Admin Registration",
    path: "/adminregister",
    desc: "Register a new university administrator",
    bg: "linear-gradient(135deg, rgba(200,146,14,0.14), rgba(224,168,26,0.07))",
    border: "1px solid rgba(224,168,26,0.28)",
    hoverBg: "linear-gradient(135deg, rgba(200,146,14,0.22), rgba(224,168,26,0.13))",
    hoverShadow: "0 14px 38px rgba(200,146,14,0.2), 0 0 0 1px rgba(245,200,66,0.15)",
    hoverBorder: "rgba(245,200,66,0.5)",
    iconBg: "rgba(224,168,26,0.14)",
    iconBorder: "1px solid rgba(224,168,26,0.2)",
    labelColor: "#f0c84a",
    descColor: "rgba(240,200,74,0.5)",
    arrowColor: "rgba(240,200,74,0.4)",
  },
  {
    key: "user",
    icon: "📝",
    label: "User Registration",
    path: "/register",
    desc: "Sign up as student, coach, lecturer or medical officer",
    bg: "linear-gradient(135deg, rgba(37,99,235,0.18), rgba(59,130,246,0.08))",
    border: "1px solid rgba(96,165,250,0.25)",
    hoverBg: "linear-gradient(135deg, rgba(37,99,235,0.28), rgba(96,165,250,0.15))",
    hoverShadow: "0 14px 38px rgba(37,99,235,0.25), 0 0 0 1px rgba(96,165,250,0.15)",
    hoverBorder: "rgba(96,165,250,0.5)",
    iconBg: "rgba(37,99,235,0.15)",
    iconBorder: "1px solid rgba(96,165,250,0.2)",
    labelColor: "#bae6fd",
    descColor: "rgba(186,230,253,0.5)",
    arrowColor: "rgba(186,230,253,0.4)",
  },
  {
    key: "login",
    icon: "🔑",
    label: "Login",
    path: "/login",
    desc: "Sign in to your existing account",
    bg: "linear-gradient(135deg, rgba(37,99,235,0.7), rgba(26,58,107,0.85))",
    border: "1px solid rgba(96,165,250,0.35)",
    hoverBg: "linear-gradient(135deg, #2563eb, #3b82f6)",
    hoverShadow: "0 14px 40px rgba(37,99,235,0.4), 0 0 20px rgba(59,130,246,0.2)",
    hoverBorder: "#3b82f6",
    iconBg: "rgba(255,255,255,0.14)",
    iconBorder: "1px solid rgba(255,255,255,0.18)",
    labelColor: "#ffffff",
    descColor: "rgba(255,255,255,0.45)",
    arrowColor: "rgba(255,255,255,0.45)",
  },
];

const STATS = [
  { value: "4,800+", label: "Active Users" },
  { value: "4", label: "Modules Active" },
  { value: "●", label: "System Online", isBlue: true },
  { value: "0", label: "Clashes This Week" },
];

// ── Overlay Component ──
function NavigationOverlay({ page, path, onClose }) {
  const [barWidth, setBarWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 50);
    const t2 = setTimeout(() => setBarWidth(100), 400);
    const t3 = setTimeout(() => { 
      onClose();
      navigate(path); 
    }, 2000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onClose, navigate, path]);

  const icon = page === "Admin Registration" ? "⚙️" : page === "User Registration" ? "📝" : "🔑";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3"
      style={{
        background: visible ? "rgba(10,28,52,0.9)" : "rgba(10,28,52,0)",
        backdropFilter: visible ? "blur(16px)" : "none",
        transition: "background 0.4s, backdrop-filter 0.4s",
      }}
    >
      <div
        className="text-5xl"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.7)",
          filter: "drop-shadow(0 0 20px rgba(37,99,235,0.6))",
          transition: "all 0.35s 0.1s",
        }}
      >
        {icon}
      </div>
      <div
        className="font-playfair text-2xl font-bold text-white"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(10px)",
          transition: "all 0.35s 0.18s",
        }}
      >
        {page}
      </div>
      <div
        className="text-sm"
        style={{
          color: "rgba(255,255,255,0.45)",
          opacity: visible ? 1 : 0,
          transition: "all 0.35s 0.24s",
        }}
      >
        Loading page...
      </div>
      <div
        className="mt-2 overflow-hidden rounded-sm"
        style={{
          width: 180, height: 3,
          background: "rgba(255,255,255,0.07)",
          boxShadow: "0 0 8px rgba(37,99,235,0.3)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.35s 0.28s",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #2563eb, #60a5fa, #f5c842)",
            borderRadius: 2,
            width: `${barWidth}%`,
            transition: "width 1.8s 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

// ── Action Button ──
function ActionButton({ btn, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      className="action-btn relative flex items-center gap-4 w-full text-left overflow-hidden font-sora"
      style={{
        padding: "18px 22px",
        borderRadius: 16,
        border: hovered ? `1px solid ${btn.hoverBorder}` : btn.border,
        background: btn.bg,
        boxShadow: hovered ? btn.hoverShadow : "none",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(btn.label)}
    >
      {/* Hover overlay */}
      <div
        className="btn-overlay"
        style={{ background: btn.hoverBg }}
      />

      {/* Icon */}
      <div
        className="flex items-center justify-center text-xl flex-shrink-0 relative z-10"
        style={{
          width: 44, height: 44,
          borderRadius: 12,
          background: btn.iconBg,
          border: btn.iconBorder,
        }}
      >
        {btn.icon}
      </div>

      {/* Text */}
      <div className="flex-1 relative z-10">
        <div className="text-sm font-bold mb-0.5" style={{ color: btn.labelColor, letterSpacing: "-0.2px" }}>
          {btn.label}
        </div>
        <div className="text-xs font-normal" style={{ color: btn.descColor }}>
          {btn.desc}
        </div>
      </div>

      {/* Arrow */}
      <span
        className="relative z-10 text-xl leading-none"
        style={{
          color: hovered ? "rgba(255,255,255,0.95)" : btn.arrowColor,
          transform: hovered ? "translateX(5px)" : "translateX(0)",
          transition: "transform 0.22s, color 0.22s",
        }}
      >
        ›
      </span>
    </button>
  );
}

// ── Main Component ──
export default function SmartSportWelcome() {
  const starsRef = useRef(null);
  const [overlay, setOverlay] = useState(null);
  const [stars] = useState(() =>
    Array.from({ length: 90 }, (_, i) => ({
      id: i,
      size: Math.random() * 1.8 + 0.5,
      left: Math.random() * 100,
      top: Math.random() * 100,
      d: (Math.random() * 4 + 2).toFixed(1),
      delay: (Math.random() * 5).toFixed(1),
    }))
  );

  return (
    <>
      {/* Inject custom keyframes + font */}
      <style>{customStyles}</style>

      <div
        className="font-sora flex flex-col min-h-screen relative overflow-x-hidden"
        style={{ background: "#0b1f3a", color: "#fff" }}
      >
        {/* ── Stars ── */}
        <div ref={starsRef} className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {stars.map((s) => (
            <div
              key={s.id}
              className="star absolute rounded-full bg-white"
              style={{
                width: s.size, height: s.size,
                left: `${s.left}%`, top: `${s.top}%`,
                "--d": `${s.d}s`,
                "--delay": `${s.delay}s`,
              }}
            />
          ))}
        </div>

        {/* ── Orbs ── */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {[
            { w:750, h:750, t:"-220px", r:"-160px", color:"rgba(37,99,235,0.28)", dur:"14s", delay:"0s" },
            { w:580, h:580, b:"-200px", l:"-130px", color:"rgba(200,146,14,0.14)", dur:"18s", delay:"3s" },
            { w:360, h:360, top:"35%",  left:"42%",  color:"rgba(59,130,246,0.12)", dur:"11s", delay:"6s" },
            { w:280, h:280, top:"15%",  left:"25%",  color:"rgba(96,165,250,0.07)", dur:"9s",  delay:"2s" },
          ].map((o, i) => (
            <div
              key={i}
              className="orb absolute rounded-full"
              style={{
                width: o.w, height: o.h,
                top: o.t || o.top, right: o.r,
                bottom: o.b, left: o.l || o.left,
                background: `radial-gradient(circle, ${o.color}, transparent 65%)`,
                filter: "blur(90px)",
                "--dur": o.dur, "--delay": o.delay,
              }}
            />
          ))}
        </div>

        {/* ── Grid Overlay ── */}
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />

        {/* ── Top Shimmer ── */}
        <div
          className="shimmer-bar fixed top-0 left-0 right-0 z-20 pointer-events-none"
          style={{
            height: 1,
            background: "linear-gradient(90deg, transparent 0%, rgba(96,165,250,0.6) 30%, rgba(245,200,66,0.5) 60%, transparent 100%)",
          }}
        />

        {/* ── NAV ── */}
        <nav
          className="relative z-10 flex items-center flex-shrink-0"
          style={{
            height: 64,
            padding: "0 52px",
            borderBottom: "1px solid rgba(59,130,246,0.12)",
            background: "rgba(12,34,62,0.72)",
            backdropFilter: "blur(28px)",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="logo-box-glow flex items-center justify-center font-bold text-white text-sm"
            >
              <img
                src={logoMain}
                alt="SmartSport logo"
                style={{ width: "40px", height: "40px", objectFit: "contain", backgroundColor: "#ffffff", borderRadius: "50%" }}
              />
            </div>
            <div className="text-base font-bold" style={{ letterSpacing: "-0.3px" }}>
              Smart<span className="logo-grad-text">Sport</span>
            </div>
          </div>

          {/* Centre badge */}
          <div className="mx-auto">
            <div
              className="flex items-center gap-2"
              style={{
                background: "rgba(37,99,235,0.08)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 20,
                padding: "5px 16px 5px 12px",
              }}
            >
              <span className="text-sm">🏛️</span>
              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.02em" }}>
                University Sports &amp; Learning Management System
              </span>
              <div
                className="flex items-center gap-1 font-bold text-xs"
                style={{
                  background: "rgba(37,99,235,0.15)",
                  border: "1px solid rgba(96,165,250,0.3)",
                  color: "#60a5fa",
                  padding: "3px 10px",
                  borderRadius: 10,
                  letterSpacing: "0.05em",
                }}
              >
                <div className="dot-blink dot-glow rounded-full bg-blue-400" style={{ width: 5, height: 5 }} />
                LIVE
              </div>
            </div>
          </div>

          {/* Help button */}
          <button
            className="nav-help-btn bg-transparent text-sm font-medium"
            style={{
              border: "1px solid rgba(59,130,246,0.2)",
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'Sora', sans-serif",
              padding: "7px 18px",
              borderRadius: 7,
              cursor: "pointer",
            }}
          >
            Help &amp; Support
          </button>
        </nav>

        {/* ── CONTENT ── */}
        <div
          className="relative z-10 grid flex-1"
          style={{
            gridTemplateColumns: "1fr 1fr",
            alignItems: "center",
            padding: "60px 52px",
          }}
        >
          {/* ── LEFT ── */}
          <div className="fade-up" style={{ paddingRight: 64 }}>
            {/* Tag */}
            <div
              className="inline-flex items-center gap-2 font-bold uppercase mb-6"
              style={{
                background: "rgba(37,99,235,0.1)",
                border: "1px solid rgba(96,165,250,0.3)",
                color: "#60a5fa",
                fontSize: 11,
                letterSpacing: "0.1em",
                padding: "6px 14px",
                borderRadius: 20,
                boxShadow: "0 0 16px rgba(37,99,235,0.12)",
              }}
            >
              🎓 Official University Platform
            </div>

            {/* Headline */}
            <h1
              className="font-playfair font-extrabold mb-1.5"
              style={{ fontSize: "clamp(2.2rem, 3.8vw, 3.3rem)", lineHeight: 1.08, letterSpacing: "-0.03em" }}
            >
              Sports. Academics.<br />
              <em className="grad-text not-italic">One Platform.</em><br />
              <span style={{ color: "rgba(255,255,255,0.28)", fontWeight: 700 }}>Zero Clashes.</span>
            </h1>

            {/* Description */}
            <p
              className="font-light leading-relaxed mt-4 mb-8"
              style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", maxWidth: 460, lineHeight: 1.72 }}
            >
              The complete management system for university student-athletes — eliminating schedule conflicts,
              automating leave approvals, tracking injuries, and monitoring academic performance in real time.
            </p>

            {/* Role pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {ROLES.map((r) => (
                <div
                  key={r.label}
                  className="role-pill flex items-center gap-2 font-medium cursor-default"
                  style={{
                    background: "rgba(37,99,235,0.07)",
                    border: "1px solid rgba(59,130,246,0.15)",
                    borderRadius: 9,
                    padding: "7px 13px",
                    fontSize: 12.5,
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  <span className="text-base">{r.icon}</span>
                  {r.label}
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="flex flex-col gap-2.5">
              {FEATURES.map((f) => (
                <div key={f} className="feat-item flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 20, height: 20,
                      borderRadius: 6,
                      background: "rgba(37,99,235,0.12)",
                      border: "1px solid rgba(96,165,250,0.25)",
                      fontSize: 9,
                      color: "#60a5fa",
                      boxShadow: "0 0 8px rgba(37,99,235,0.1)",
                    }}
                  >
                    ✓
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT — CARD ── */}
          <div className="fade-up-delay flex items-center justify-center">
            <div
              className="card-glow card-shimmer card-inner-glow relative overflow-hidden w-full"
              style={{
                background: "linear-gradient(145deg, rgba(22,54,97,0.88), rgba(13,34,66,0.93))",
                border: "1px solid rgba(59,130,246,0.18)",
                borderRadius: 28,
                padding: "48px 42px",
                backdropFilter: "blur(32px)",
                maxWidth: 410,
              }}
            >
              {/* Card header */}
              <div className="text-center mb-10 relative z-10">
                <span
                  className="pop-in block text-5xl mb-4"
                  style={{ filter: "drop-shadow(0 0 16px rgba(245,200,66,0.4))" }}
                >
                  <center>
                <img
                src={logoMain}
                alt="SmartSport logo"
                style={{ width: "100px", height: "100px", objectFit: "contain" ,backgroundColor: "#ffffff", borderRadius: "50%" }}
              />
              </center>
                </span>
                <div
                  className="font-playfair font-bold text-white mb-1.5"
                  style={{ fontSize: "1.6rem", letterSpacing: "-0.02em" }}
                >
                  Welcome to SmartSport
                </div>
                <div className="text-sm font-light leading-snug" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Get started by registering or<br />sign in to your existing account
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 relative z-10">
                {BUTTONS.map((btn) => (
                  <ActionButton key={btn.key} btn={btn} onClick={() =>setOverlay({ label: btn.label, path: btn.path })} />
                ))}
              </div>

              {/* Divider */}
              <div
                className="my-7"
                style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.15), transparent)" }}
              />

              {/* Note */}
              <div className="text-center text-xs leading-relaxed relative z-10" style={{ color: "rgba(255,255,255,0.25)" }}>
                Need help accessing your account?<br />
                Contact your university IT department or{" "}
                <a
                  className="cursor-pointer no-underline transition-colors duration-150"
                  style={{ color: "rgba(96,165,250,0.75)" }}
                  onMouseEnter={e => (e.target.style.color = "#bae6fd")}
                  onMouseLeave={e => (e.target.style.color = "rgba(96,165,250,0.75)")}
                >
                  click here for support
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div
          className="relative z-10 flex items-center flex-shrink-0 gap-7"
          style={{
            height: 44,
            padding: "0 52px",
            borderTop: "1px solid rgba(59,130,246,0.1)",
            background: "rgba(12,34,62,0.68)",
            backdropFilter: "blur(22px)",
          }}
        >
          {STATS.map((s, i) => (
            <div key={i} className="flex items-center gap-7">
              {i > 0 && (
                <div style={{ width: 1, height: 14, background: "rgba(59,130,246,0.15)", marginRight: 0 }} />
              )}
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                <strong style={{ color: s.isBlue ? "#60a5fa" : "#60a5fa", fontWeight: 700, fontSize: 12.5 }}>
                  {s.value}
                </strong>
                {s.label}
              </div>
            </div>
          ))}

          <div className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            Created By SLIIT ITPM ​​Students &nbsp;·&nbsp;{" "}
            <span
              className="inline-flex items-center gap-1 font-semibold"
              style={{
                background: "rgba(37,99,235,0.1)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 6,
                padding: "2px 8px",
                color: "#60a5fa",
                fontSize: 10.5,
              }}
            >
              SmartSport
            </span>
          </div>
        </div>

        {/* ── Navigation Overlay ── */}
        {overlay && (
          <NavigationOverlay page={overlay.label} path={overlay.path} onClose={() => setOverlay(null)} />
        )}
      </div>
    </>
  );
}
