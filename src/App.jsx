import { useState, useEffect, useCallback, createContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase, getSupabaseClient, getSupabaseConfigError } from "./supabaseClient";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const C = {
  primary: "#0F172A", accent: "#2563EB", accentHover: "#1D4ED8", gold: "#F59E0B",
  green: "#10B981", red: "#EF4444", muted: "#64748B",
  light: "#F8FAFC", section: "#F1F5F9", border: "rgba(0,0,0,0.05)", card: "#FFFFFF",
  shadow: "0 10px 30px rgba(0,0,0,0.05)", shadowHover: "0 15px 40px rgba(0,0,0,0.08)",
  softBlue: "#DBEAFE", softBlueText: "#1E40AF",
};
const ADMIN_EMAIL = "shahriyorsobirovpm2026@gmail.com";
const AuthContext = createContext(null);


// MOCK_INTERNSHIPS can be kept for fallback/demo, but main data comes from API
const MOCK_INTERNSHIPS = [
  { id:1, company_name:"Tasweer Academy", company_logo:"📸", role:"Marketing Intern", skills:["SMM","Content","Canva"], duration:"3 oy", type:"Gibrid", description:"Ijtimoiy tarmoqlar uchun kontent tayyorlash.", is_active:true },
  { id:2, company_name:"Shiraq Business School", company_logo:"🏫", role:"HR Assistant Intern", skills:["HR","Recruitment","Excel"], duration:"2 oy", type:"Ofis", description:"Kadrlar bo'limida recruitment va onboarding.", is_active:true },
  { id:3, company_name:"TechUz Startup", company_logo:"💻", role:"Business Analyst Intern", skills:["Excel","Analytics","Reporting"], duration:"2 oy", type:"Remote", description:"Biznes jarayonlarni tahlil qilish.", is_active:true },
];

// ...existing code...

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
function Badge({ text, color=C.accent }) {
  return <span style={{ background:color === C.accent ? C.softBlue : color+"18", color:color === C.accent ? C.softBlueText : color, padding:"4px 10px", borderRadius:999, fontSize:11, fontWeight:700, border:`1px solid ${color === C.accent ? "rgba(37,99,235,0.10)" : `${color}20`}` }}>{text}</span>;
}

function Btn({ children, onClick, color=C.primary, textColor="#fff", full, small, disabled, outline, style={} }) {
  const [hovered, setHovered] = useState(false);
  const solidBackground = color === C.accent ? `linear-gradient(135deg, ${C.accent}, ${C.accentHover})` : color;
  return (
    <button onClick={onClick} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} disabled={disabled} style={{
      background: outline ? (hovered ? "rgba(37,99,235,0.06)" : "rgba(255,255,255,0.78)") : disabled ? "#CBD5E1" : solidBackground,
      color: outline?color: disabled?"#94A3B8": textColor,
      border: outline?`1px solid ${color}`:"none",
      borderRadius:14, padding: small?"8px 14px":"12px 20px",
      fontSize: small?12:13, fontWeight:600,
      cursor: disabled?"not-allowed":"pointer",
      width: full?"100%":"auto", transition:"all 0.25s ease",
      fontFamily:"inherit", ...style,
      boxShadow: disabled ? "none" : hovered ? C.shadowHover : C.shadow,
      transform: disabled ? "none" : hovered ? "translateY(-1px) scale(1.03)" : "translateY(0) scale(1)",
    }}>{children}</button>
  );
}

function Input({ label, value, onChange, placeholder, type="text", rows }) {
  const base = { width:"100%", border:`1px solid ${C.border}`, borderRadius:14, padding:"12px 14px", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:"rgba(255,255,255,0.92)", boxShadow:"inset 0 1px 0 rgba(255,255,255,0.65)", transition:"border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease" };
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4, color:C.primary }}>{label}</label>}
      {rows
        ? <textarea rows={rows} value={value} onChange={onChange} placeholder={placeholder} style={{ ...base, resize:"vertical" }} onFocus={e=>{ e.target.style.borderColor = "rgba(37,99,235,0.28)"; e.target.style.boxShadow = "0 0 0 4px rgba(37,99,235,0.10)"; e.target.style.transform = "translateY(-1px)"; }} onBlur={e=>{ e.target.style.borderColor = C.border; e.target.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.65)"; e.target.style.transform = "translateY(0)"; }} />
        : <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={base} onFocus={e=>{ e.target.style.borderColor = "rgba(37,99,235,0.28)"; e.target.style.boxShadow = "0 0 0 4px rgba(37,99,235,0.10)"; e.target.style.transform = "translateY(-1px)"; }} onBlur={e=>{ e.target.style.borderColor = C.border; e.target.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.65)"; e.target.style.transform = "translateY(0)"; }} />}
    </div>
  );
}

function Card({ children, style={}, onClick, onMouseEnter, onMouseLeave }) {
  const [hovered, setHovered] = useState(false);
  return <div onClick={onClick} onMouseEnter={e=>{ setHovered(true); onMouseEnter?.(e); }} onMouseLeave={e=>{ setHovered(false); onMouseLeave?.(e); }} style={{ background:C.card, borderRadius:18, padding:18, border:`1px solid ${C.border}`, boxShadow:hovered ? C.shadowHover : C.shadow, transform:hovered ? "translateY(-4px)" : "translateY(0)", transition:"transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease", ...style }}>{children}</div>;
}

function Spinner() {
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:40 }}>
      <div style={{ width:28, height:28, borderRadius:"50%", border:`3px solid ${C.border}`, borderTopColor:C.accent, animation:"spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function StatusBadge({ status }) {
  const m = { pending:{l:"Kutilmoqda",c:C.gold}, accepted:{l:"Qabul qilindi",c:C.green}, rejected:{l:"Rad etildi",c:C.red} };
  const s = m[status] || m.pending;
  return <span style={{ background:s.c+"18", color:s.c, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>{s.l}</span>;
}

function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom:16 }}>
      <h3 style={{ margin:"0 0 3px", fontSize:17, fontWeight:700, color:C.primary }}>{title}</h3>
      {sub && <p style={{ margin:0, fontSize:12, color:C.muted }}>{sub}</p>}
    </div>
  );
}

function Empty({ icon, title, sub }) {
  return (
    <div style={{ textAlign:"center", padding:"36px 18px", color:C.muted, border:`1px dashed rgba(37,99,235,0.16)`, borderRadius:18, background:"linear-gradient(180deg, rgba(255,255,255,0.9), rgba(241,245,249,0.9))", boxShadow:C.shadow }}>
      {icon && <div style={{ fontSize:32, marginBottom:8 }}>{icon}</div>}
      <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{title}</div>
      {sub && <div style={{ fontSize:12 }}>{sub}</div>}
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const staggerWrap = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

function getDashboardTheme(theme) {
  if (theme === "dark") {
    return {
      bg: "#081121",
      section: "rgba(15, 23, 42, 0.72)",
      panel: "linear-gradient(180deg, rgba(12,19,36,0.95), rgba(15,23,42,0.9))",
      panelAlt: "rgba(15, 23, 42, 0.82)",
      card: "rgba(12, 19, 36, 0.9)",
      text: "#edf2ff",
      muted: "#9fb0d4",
      soft: "#1e293b",
      line: "rgba(148, 163, 184, 0.16)",
      shadow: "0 18px 40px rgba(2,8,23,0.34)",
      hero: "radial-gradient(circle at top left, rgba(37,99,235,0.24), transparent 36%), linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.92))",
      blueSoft: "rgba(37,99,235,0.14)",
      input: "rgba(15, 23, 42, 0.88)",
      badgeBg: "rgba(255,255,255,0.06)",
    };
  }

  return {
    bg: "#f8fafc",
    section: "rgba(255, 255, 255, 0.7)",
    panel: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(241,245,249,0.94))",
    panelAlt: "rgba(255,255,255,0.92)",
    card: "rgba(255,255,255,0.96)",
    text: "#0f172a",
    muted: "#64748b",
    soft: "#e2e8f0",
    line: "rgba(15, 23, 42, 0.06)",
    shadow: "0 18px 40px rgba(15,23,42,0.08)",
    hero: "radial-gradient(circle at top left, rgba(191,219,254,0.9), transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.96), rgba(241,245,249,0.92))",
    blueSoft: "rgba(37,99,235,0.08)",
    input: "rgba(255,255,255,0.94)",
    badgeBg: "rgba(37,99,235,0.08)",
  };
}

function Toast({ toast }) {
  if (!toast) return null;
  const bg = toast.type === "error" ? "linear-gradient(135deg, #ef4444, #dc2626)" : "linear-gradient(135deg, #2563eb, #1d4ed8)";
  return (
    <AnimatePresence>
      <motion.div
        key={toast.id}
        initial={{ opacity: 0, y: -16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        style={{
          position: "fixed",
          top: 88,
          right: 16,
          zIndex: 500,
          minWidth: 240,
          maxWidth: 320,
          padding: "14px 16px",
          borderRadius: 18,
          color: "#fff",
          background: bg,
          boxShadow: "0 18px 40px rgba(15,23,42,0.24)",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {toast.message}
      </motion.div>
    </AnimatePresence>
  );
}

function SkeletonBlock({ height=18, width="100%", radius=12 }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "linear-gradient(90deg, rgba(148,163,184,0.12), rgba(148,163,184,0.24), rgba(148,163,184,0.12))",
        backgroundSize: "200% 100%",
        animation: "dashSkeleton 1.25s ease-in-out infinite",
      }}
    />
  );
}

function LoadingCard() {
  return (
    <Card style={{ padding: 20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <SkeletonBlock height={52} width={52} radius={16} />
          <div style={{ display:"grid", gap:8 }}>
            <SkeletonBlock width={140} />
            <SkeletonBlock width={96} height={14} />
          </div>
        </div>
        <SkeletonBlock width={74} height={28} radius={999} />
      </div>
      <div style={{ display:"grid", gap:10 }}>
        <SkeletonBlock height={14} />
        <SkeletonBlock height={14} width="92%" />
        <div style={{ display:"flex", gap:8, marginTop:4 }}>
          <SkeletonBlock width={62} height={26} radius={999} />
          <SkeletonBlock width={78} height={26} radius={999} />
          <SkeletonBlock width={70} height={26} radius={999} />
        </div>
      </div>
    </Card>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({ onLogin, onRegister }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("landing-theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const features = [
    { title:"Smart Internship Match", desc:"Talabalarga ko'nikma, yo'nalish va darajasiga mos amaliyotlarni tavsiya qiladi." },
    { title:"Auto CV Evolution", desc:"Har bir amaliyotdan keyin tajriba va natijalar CV ga avtomatik qo'shiladi." },
    { title:"Official Recommendation", desc:"Tadbirkor baholashi asosida raqamli tavsiya xati bilan ishonch oshadi." },
    { title:"Verified Certificate", desc:"Amaliyot yakunlanganda QR kodli sertifikat bilan portfolio kuchayadi." },
    { title:"Employer Precision Filter", desc:"Kompaniyalar mos nomzodlarni bir necha sekundda saralab oladi." },
    { title:"Startup Marketplace", desc:"Bizneslar mahsulotini talaba auditoriyasiga premium uslubda taqdim etadi." },
  ];

  const steps = [
    { id:"01", title:"Create Your Profile", desc:"Sohangiz, ko'nikmalaringiz va maqsadingizni kiriting." },
    { id:"02", title:"Get Matched Fast", desc:"Platforma sizga mos internshiplarni aqlli tartibda tavsiya etadi." },
    { id:"03", title:"Work In Real Teams", desc:"1-3 oy davomida real loyihalarda tajriba to'playsiz." },
    { id:"04", title:"Earn Proof Of Growth", desc:"Tavsiya xati, sertifikat va natijalar bir joyda jamlanadi." },
  ];

  useEffect(() => {
    document.documentElement.setAttribute("data-landing-theme", theme);
    localStorage.setItem("landing-theme", theme);
  }, [theme]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -30px 0px" }
    );

    const nodes = Array.from(document.querySelectorAll(".reveal"));
    nodes.forEach(n => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  const scrollTo = id => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior:"smooth", block:"start" });
  };

  return (
    <div className="landing-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap');

        :root[data-landing-theme='dark'] {
          --bg: #050816;
          --bg-soft: #0a1026;
          --text: #edf2ff;
          --muted: #c2d0f4;
          --line: rgba(171, 192, 236, 0.26);
          --card: rgba(8, 16, 36, 0.82);
          --glass: rgba(10, 20, 46, 0.78);
          --brand: #7ca3ff;
          --brand-strong: #4f79ff;
          --shadow: 0 20px 60px rgba(5, 8, 22, 0.45);
          --shadow-strong: 0 24px 64px rgba(5, 8, 22, 0.55);
          --metric-surface: linear-gradient(180deg, rgba(18, 31, 68, 0.92), rgba(10, 21, 48, 0.96));
          --metric-text: #f3f7ff;
          --metric-muted: #c6d4f7;
          --hero-overlay: linear-gradient(135deg, rgba(15,23,42,0.85), rgba(37,99,235,0.5));
        }

        :root[data-landing-theme='light'] {
          --bg: #f8fafc;
          --bg-soft: #f1f5f9;
          --text: #0f172a;
          --muted: #64748b;
          --line: rgba(0, 0, 0, 0.05);
          --card: rgba(255, 255, 255, 0.96);
          --glass: rgba(255, 255, 255, 0.7);
          --brand: #2563eb;
          --brand-strong: #1d4ed8;
          --shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          --shadow-strong: 0 15px 40px rgba(0, 0, 0, 0.08);
          --hero-overlay: radial-gradient(circle at top left, rgba(191,219,254,0.72), transparent 34%), linear-gradient(180deg, rgba(248,250,252,0.94), rgba(241,245,249,0.92));
        }

        .landing-shell {
          font-family: 'Manrope', 'Segoe UI', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
          scroll-behavior: smooth;
          transition: background 0.35s ease, color 0.35s ease;
        }

        .landing-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: linear-gradient(120deg, #0b1638, #202b62, #353586, #1e7bcf);
          background-size: 280% 280%;
          animation: shiftGradient 20s ease infinite;
        }

        :root[data-landing-theme='light'] .landing-bg {
          background:
            radial-gradient(circle at top left, rgba(147, 197, 253, 0.38), transparent 32%),
            radial-gradient(circle at 85% 16%, rgba(191, 219, 254, 0.8), transparent 28%),
            linear-gradient(180deg, #f8fafc 0%, #f1f5f9 48%, #eaf1fb 100%);
          animation: none;
        }

        .landing-overlay {
          position: fixed;
          inset: 0;
          z-index: 1;
          background: var(--hero-overlay);
        }

        .blob {
          position: fixed;
          border-radius: 999px;
          filter: blur(36px);
          opacity: 0.38;
          z-index: 1;
          pointer-events: none;
        }

        .blob.one {
          width: 420px;
          height: 420px;
          top: -120px;
          left: -120px;
          background: #52a6ff;
          animation: floatBlob 18s ease-in-out infinite;
        }

        .blob.two {
          width: 380px;
          height: 380px;
          right: -110px;
          top: 25%;
          background: #7e77ff;
          animation: floatBlob 22s ease-in-out infinite reverse;
        }

        .blob.three {
          width: 340px;
          height: 340px;
          bottom: -120px;
          left: 30%;
          background: #28b8d7;
          animation: floatBlob 20s ease-in-out infinite;
        }

        .content {
          position: relative;
          z-index: 2;
        }

        .topnav {
          position: sticky;
          top: 0;
          z-index: 40;
          backdrop-filter: blur(12px);
          background: var(--glass);
          border-bottom: 1px solid var(--line);
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        .wrap {
          width: min(1200px, 92%);
          margin: 0 auto;
        }

        .nav-inner {
          min-height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 0;
        }

        .logo {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: var(--text);
        }

        .logo span { color: var(--brand); }

        .nav-links {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .anchor-link {
          background: transparent;
          border: 1px solid transparent;
          color: var(--muted);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 10px 14px;
          position: relative;
          border-radius: 999px;
          transition: color 0.25s ease, background 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
        }

        .anchor-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 2px;
          transform: scaleX(0);
          transform-origin: left;
          background: var(--brand);
          transition: transform 0.25s ease;
        }

        .anchor-link:hover {
          color: var(--text);
          background: rgba(255,255,255,0.72);
          border-color: var(--line);
          transform: translateY(-1px);
        }

        .anchor-link:hover::after {
          transform: scaleX(1);
        }

        .anchor-link.active {
          color: var(--brand);
          background: rgba(219, 234, 254, 0.9);
          border-color: rgba(37, 99, 235, 0.14);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.65);
        }

        :root[data-landing-theme='dark'] .anchor-link:hover {
          background: rgba(124, 163, 255, 0.14);
          border-color: rgba(124, 163, 255, 0.24);
        }

        :root[data-landing-theme='dark'] .anchor-link.active {
          color: #f3f7ff;
          background: linear-gradient(135deg, rgba(124, 163, 255, 0.26), rgba(79, 121, 255, 0.18));
          border-color: rgba(124, 163, 255, 0.28);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px rgba(4, 10, 28, 0.28);
        }

        .theme-toggle {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          border: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.5);
          color: var(--text);
          cursor: pointer;
          font-size: 17px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
          transition: transform 0.25s ease, background 0.3s ease, box-shadow 0.3s ease;
        }

        .theme-toggle:hover {
          transform: translateY(-2px) scale(1.05);
          background: rgba(255, 255, 255, 0.84);
          box-shadow: 0 14px 32px rgba(0,0,0,0.08);
        }

        :root[data-landing-theme='dark'] .theme-toggle {
          background: rgba(255, 255, 255, 0.12);
          color: #f8fbff;
          box-shadow: 0 10px 28px rgba(0,0,0,0.22);
        }

        :root[data-landing-theme='dark'] .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.18);
          box-shadow: 0 16px 34px rgba(0,0,0,0.3);
        }

        .hero {
          padding: 104px 0 86px;
          min-height: calc(100vh - 72px);
          display: grid;
          align-items: center;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 40px;
        }

        .hero-title {
          margin: 0;
          font-size: clamp(40px, 6vw, 74px);
          line-height: 1.05;
          letter-spacing: -0.045em;
          animation: riseIn 0.9s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .hero-title strong {
          color: var(--brand);
          font-weight: 800;
        }

        .hero-sub {
          margin-top: 24px;
          margin-bottom: 34px;
          max-width: 700px;
          color: var(--muted);
          font-size: clamp(16px, 2vw, 20px);
          line-height: 1.65;
          animation: riseIn 1.1s cubic-bezier(0.22, 1, 0.36, 1);
        }

        :root[data-landing-theme='dark'] .hero-sub {
          color: #cbd7f5;
        }

        .cta-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          animation: riseIn 1.3s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .btn {
          border-radius: 16px;
          border: 1px solid transparent;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;
        }

        .btn-primary {
          color: #f6f9ff;
          background: linear-gradient(135deg, var(--brand), var(--brand-strong));
          box-shadow: 0 12px 26px rgba(72, 110, 221, 0.35);
        }

        .btn-primary:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 18px 34px rgba(72, 110, 221, 0.45);
        }

        .btn-ghost {
          color: var(--text);
          background: rgba(255, 255, 255, 0.68);
          border-color: var(--line);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
        }

        .btn-ghost:hover {
          transform: translateY(-2px) scale(1.05);
          background: rgba(255, 255, 255, 0.92);
          box-shadow: var(--shadow-strong);
        }

        :root[data-landing-theme='dark'] .btn-ghost {
          color: #eef4ff;
          background: rgba(255, 255, 255, 0.14);
          border-color: rgba(171, 192, 236, 0.24);
          box-shadow: 0 10px 24px rgba(5, 8, 22, 0.24);
        }

        :root[data-landing-theme='dark'] .btn-ghost:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .hero-card {
          border: 1px solid var(--line);
          border-radius: 28px;
          background: var(--card);
          box-shadow: var(--shadow);
          backdrop-filter: blur(10px);
          padding: 32px;
          animation: riseIn 1.15s cubic-bezier(0.22, 1, 0.36, 1);
        }

        :root[data-landing-theme='dark'] .hero-card {
          box-shadow: 0 24px 64px rgba(3, 7, 20, 0.4);
        }

        .metric-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 18px;
        }

        .metric {
          border-radius: 16px;
          border: 1px solid var(--line);
          background: var(--metric-surface, linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(241, 245, 249, 0.88)));
          padding: 14px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
        }

        .metric strong {
          display: block;
          font-size: 24px;
          letter-spacing: -0.03em;
          color: var(--metric-text, var(--text));
        }

        .metric span {
          color: var(--metric-muted, var(--muted)) !important;
          font-weight: 600;
          line-height: 1.45;
        }

        :root[data-landing-theme='dark'] .metric {
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 28px rgba(0,0,0,0.18);
        }

        section {
          padding: 96px 0;
        }

        .section-head {
          max-width: 760px;
          margin-bottom: 28px;
        }

        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 11px;
          font-weight: 800;
          color: var(--brand);
        }

        .section-title {
          margin-top: 10px;
          margin-bottom: 10px;
          font-size: clamp(30px, 4vw, 52px);
          line-height: 1.14;
          letter-spacing: -0.03em;
        }

        .section-sub {
          color: var(--muted);
          line-height: 1.7;
          font-size: 16px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .grid.two {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .card {
          border-radius: 22px;
          border: 1px solid var(--line);
          background: var(--card);
          backdrop-filter: blur(8px);
          box-shadow: var(--shadow);
          padding: 24px;
          transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-strong);
          border-color: rgba(37, 99, 235, 0.18);
        }

        .step {
          display: grid;
          grid-template-columns: 64px 1fr;
          gap: 14px;
          align-items: start;
        }

        .step-id {
          border-radius: 14px;
          text-align: center;
          padding: 8px 0;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--brand);
          border: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.06);
        }

        .cta-panel {
          border-radius: 28px;
          padding: clamp(28px, 5vw, 54px);
          border: 1px solid var(--line);
          background: linear-gradient(135deg, rgba(36, 71, 173, 0.65), rgba(8, 18, 52, 0.75));
          box-shadow: var(--shadow);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        :root[data-landing-theme='light'] .cta-panel {
          background: linear-gradient(135deg, #eff6ff, #dbeafe 55%, #e2e8f0 100%);
          color: #0f172a;
        }

        .footer {
          border-top: 1px solid var(--line);
          padding: 24px 0 34px;
          color: var(--muted);
          font-size: 13px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: transform 0.72s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.72s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .reveal.in-view {
          opacity: 1;
          transform: translateY(0);
        }

        .delay-1 { transition-delay: 0.08s; }
        .delay-2 { transition-delay: 0.16s; }
        .delay-3 { transition-delay: 0.24s; }

        @keyframes shiftGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes floatBlob {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(20px, -18px, 0) scale(1.08); }
        }

        @keyframes riseIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 980px) {
          .hero-grid, .grid, .grid.two {
            grid-template-columns: 1fr;
          }

          .nav-links {
            display: none;
          }

          .metric-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .hero {
            padding: 72px 0 46px;
            min-height: auto;
          }

          section {
            padding: 58px 0;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="landing-bg" />
      <div className="landing-overlay" />
      <div className="blob one" />
      <div className="blob two" />
      <div className="blob three" />

      <div className="content">
        <nav className="topnav">
          <div className="wrap nav-inner">
            <div className="logo">Natija<span>Hub</span></div>
            <div className="nav-links">
              <button className="anchor-link active" onClick={() => scrollTo("why")}>Nima Uchun</button>
              <button className="anchor-link" onClick={() => scrollTo("features")}>Imkoniyatlar</button>
              <button className="anchor-link" onClick={() => scrollTo("flow")}>Jarayon</button>
            </div>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <button className="theme-toggle" onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")} aria-label="theme toggle">
                {theme === "dark" ? "☀" : "☾"}
              </button>
              <button className="btn btn-ghost" onClick={onLogin}>Kirish</button>
              <button className="btn btn-primary" onClick={onRegister}>Boshlash</button>
            </div>
          </div>
        </nav>

        <header className="hero wrap" id="top">
          <div className="hero-grid">
            <div>
              <h1 className="hero-title">Start Your Career with <strong>Real Experience</strong></h1>
              <p className="hero-sub">
                NatijaHub talabalarni amaliyot, sertifikat va tavsiya bilan bozorga tayyorlaydi.
                Har bir bosqich aniq, tez va premium tajriba bilan yaratilgan.
              </p>
              <div className="cta-row">
                <button className="btn btn-primary" onClick={onRegister}>Get Started</button>
                <button className="btn btn-ghost" onClick={() => scrollTo("features")}>Browse Internships</button>
              </div>
            </div>
            <aside className="hero-card">
              <div style={{ fontSize:13, color:"var(--muted)", marginBottom:8 }}>Live Growth Snapshot</div>
              <div style={{ fontSize:28, fontWeight:800, letterSpacing:"-0.03em" }}>Career Engine for Students</div>
              <div style={{ marginTop:10, color:"var(--muted)", lineHeight:1.7 }}>
                Portfolio, recommendation, certificate va internship pipeline bitta elegant platformada.
              </div>
              <div className="metric-grid">
                <div className="metric"><strong>100%</strong><span style={{ fontSize:12, color:"var(--muted)" }}>Student Focus</span></div>
                <div className="metric"><strong>2+</strong><span style={{ fontSize:12, color:"var(--muted)" }}>Official Partners</span></div>
                <div className="metric"><strong>24/7</strong><span style={{ fontSize:12, color:"var(--muted)" }}>Digital Access</span></div>
              </div>
            </aside>
          </div>
        </header>

        <section id="why" className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">Problem</div>
            <h2 className="section-title">Nazariyadan ishgacha bo'lgan bo'shliqni yopamiz</h2>
            <p className="section-sub">Talabalar tajriba ololmagani uchun ish topolmaydi. NatijaHub bu paradoksni amaliy natijaga aylantiradi.</p>
          </div>
          <div className="grid two">
            <article className="card reveal delay-1"><h3 style={{ marginTop:0 }}>No Experience Barrier</h3><p style={{ color:"var(--muted)", lineHeight:1.7 }}>Talabalar ishga kirishda birinchi to'siq sifatida tajriba talabiga duch keladi.</p></article>
            <article className="card reveal delay-2"><h3 style={{ marginTop:0 }}>Ish beruvchi uchun ham qiyin</h3><p style={{ color:"var(--muted)", lineHeight:1.7 }}>Kompaniyalar mos yosh kadrni topishga ortiqcha vaqt va resurs sarflaydi.</p></article>
          </div>
        </section>

        <section id="features" className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">Platform Features</div>
            <h2 className="section-title">NatijaHub sizga premium career stack beradi</h2>
          </div>
          <div className="grid">
            {features.map((f, i) => (
              <article key={f.title} className={`card reveal delay-${(i % 3) + 1}`}>
                <h3 style={{ marginTop:0, marginBottom:10 }}>{f.title}</h3>
                <p style={{ margin:0, color:"var(--muted)", lineHeight:1.72 }}>{f.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="flow" className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">Flow</div>
            <h2 className="section-title">How NatijaHub Works</h2>
          </div>
          <div className="grid two">
            {steps.map((s, i) => (
              <article key={s.id} className={`card step reveal delay-${(i % 3) + 1}`}>
                <div className="step-id">{s.id}</div>
                <div>
                  <h3 style={{ marginTop:0, marginBottom:8 }}>{s.title}</h3>
                  <p style={{ margin:0, color:"var(--muted)", lineHeight:1.72 }}>{s.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="wrap reveal" style={{ paddingTop:12 }}>
          <div className="cta-panel">
            <div>
              <div style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, letterSpacing:"-0.035em" }}>Build Your First Real Career Win</div>
              <p style={{ marginTop:10, marginBottom:0, color:"var(--muted)", maxWidth:640, lineHeight:1.7 }}>
                NatijaHub bilan internshipdan boshlab, tavsiya va sertifikatgacha bo'lgan yo'lni bitta kuchli profilga aylantiring.
              </p>
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <button className="btn btn-primary" onClick={onRegister}>Get Started</button>
              <button className="btn btn-ghost" onClick={onLogin}>I have an account</button>
            </div>
          </div>
        </section>

        <footer className="wrap footer">
          <div>NatijaHub</div>
          <div>2026 · O'zbekiston · @natijahubuz</div>
        </footer>
      </div>
    </div>
  );
}

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
function ResetPasswordScreen({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const isDark = localStorage.getItem("landing-theme") !== "light";
  const T = isDark
    ? { bg:"#060b1b", panel:"rgba(13,22,46,0.76)", border:"rgba(125,153,216,0.30)", text:"#eaf1ff", muted:"#9eaccb", accent:"#4f79ff", accent2:"#7ca3ff", error:"#fda4af", errorBg:"rgba(239,68,68,0.16)" }
    : { bg:"#f4f8ff", panel:"rgba(255,255,255,0.80)", border:"rgba(99,130,191,0.26)", text:"#15213f", muted:"#5b6a8a", accent:"#1f4bda", accent2:"#1a40bc", error:"#b42318", errorBg:"rgba(229,72,77,0.14)" };

  useEffect(() => {
    const hash = window.location.hash;
    const accessMatch = hash.match(/access_token=([^&]+)/);
    const refreshMatch = hash.match(/refresh_token=([^&]+)/);
    if (accessMatch && refreshMatch) {
      supabase.auth.setSession({
        access_token: decodeURIComponent(accessMatch[1]),
        refresh_token: decodeURIComponent(refreshMatch[1]),
      }).then(({ error }) => {
        if (error) setError("Havola muddati o'tgan. Qayta urinib ko'ring.");
        else setSessionReady(true);
      });
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setSessionReady(true);
        else setError("Havola noto'g'ri. Parolni tiklashni qayta boshlang.");
      });
    }
  }, []);

  const handleReset = async () => {
    if (password !== confirm) { setError("Parollar mos kelmadi!"); return; }
    if (password.length < 6) { setError("Parol kamida 6 belgi bo'lishi kerak!"); return; }
    setLoading(true); setError("");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => onDone(), 2500);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh",display:"flex",padding:0,background:T.bg,position:"relative",overflow:"hidden" }}>
      <style>{`
        .reset-root{position:relative;z-index:2;display:grid;grid-template-columns:1.1fr .9fr;min-height:100vh;width:100%;background:linear-gradient(112deg, #203f8f 0%, #2c63cc 52%, #5f82dd 100%);} 
        .reset-left{position:relative;overflow:hidden;padding:56px clamp(24px,6vw,72px);display:flex;align-items:center;justify-content:center;text-align:center;}
        .reset-left::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 20% 22%, rgba(255,255,255,.18), transparent 48%),radial-gradient(circle at 82% 78%, rgba(196,220,255,.13), transparent 52%);pointer-events:none;}
        .reset-arrow{width:0;height:0;border-left:24px solid transparent;border-right:24px solid transparent;border-top:36px solid #ecf2ff;margin:0 auto 24px;filter:drop-shadow(0 4px 8px rgba(0,0,0,.2));}
        .reset-about{margin-top:18px;background:#e9ecf3;color:#3a3d46;border:1px solid #d5d8e0;border-radius:999px;padding:10px 28px;font-size:14px;font-weight:600;cursor:pointer;transition:transform .2s ease, box-shadow .2s ease;}
        .reset-about:hover{transform:translateY(-2px);box-shadow:0 8px 16px rgba(23,34,67,.2);} 
        .reset-right{display:flex;align-items:center;justify-content:center;padding:26px;background:linear-gradient(180deg, rgba(236,243,255,0.88), rgba(225,236,255,0.82));border-left:1px solid rgba(255,255,255,0.5);} 
        .reset-panel{width:100%;max-width:560px;background:linear-gradient(180deg, rgba(255,255,255,0.95), rgba(241,245,249,0.96));border:1px solid rgba(0,0,0,0.05);border-radius:96px 0 0 96px;padding:34px 44px 34px 38px;box-shadow:0 18px 40px rgba(23,34,67,.12);animation:resetFormIn .6s cubic-bezier(.22,1,.36,1);} 
        .reset-title{font-family:Manrope,'Segoe UI',sans-serif;font-size:30px;font-weight:800;color:#47484d;letter-spacing:-0.03em;margin:0 0 6px;}
        .reset-sub{color:#6e6f76;font-size:13px;margin:0 0 16px;}
        .reset-label{display:block;font-size:12px;font-weight:700;color:#666b75;margin-bottom:6px;}
        .reset-input{width:100%;padding:12px 14px;border-radius:14px;border:1px solid rgba(0,0,0,0.05);background:rgba(255,255,255,0.92);color:#334155;outline:none;font-size:14px;font-family:inherit;transition:border-color .25s ease, box-shadow .25s ease, transform .2s ease;box-sizing:border-box;margin-bottom:12px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.72);}
        .reset-input:focus{border-color:#5d79d8;box-shadow:0 0 0 4px rgba(93,121,216,0.22);transform:translateY(-1px);} 
        .reset-primary{width:140px;margin-left:auto;display:block;border:none;border-radius:999px;padding:12px 14px;font-weight:700;font-size:14px;cursor:pointer;color:#f5f8ff;background:linear-gradient(135deg,#355fda,#597ef0);transition:transform .25s ease,box-shadow .25s ease;box-shadow:0 10px 20px rgba(53,95,218,.35);} 
        .reset-primary:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 18px 34px rgba(60,95,188,.44);} 
        .reset-primary:disabled{opacity:.6;cursor:not-allowed;transform:none;box-shadow:none;} 
        .reset-error{background:${T.errorBg};color:${T.error};padding:9px 12px;border-radius:10px;font-size:12px;margin-bottom:12px;}
        @keyframes resetFormIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
        @media (max-width: 980px){.reset-root{grid-template-columns:1fr}.reset-left{display:none}.reset-right{padding:20px}.reset-panel{border-radius:24px;padding:28px;max-width:460px}}
      `}</style>

      <div className="reset-root">
        <section className="reset-left">
          <div style={{ position:"relative", zIndex:2 }}>
            <div className="reset-arrow" />
            <h2 style={{ margin:"0 0 10px", color:"#f1f6ff", fontSize:44, letterSpacing:"-0.02em" }}>Secure Reset</h2>
            <p style={{ margin:0, color:"rgba(230,239,255,.86)", lineHeight:1.6, maxWidth:360 }}>Update your password safely and continue your NatijaHub journey in seconds.</p>
            <button className="reset-about">Help Center</button>
          </div>
        </section>

        <section className="reset-right">
          <div className="reset-panel">
            <h2 className="reset-title">Reset Password</h2>
            <p className="reset-sub">Yangi parol o'rnatish</p>

            {done ? (
              <div style={{ textAlign:"center",padding:"16px 0" }}>
                <div style={{ fontSize:40,marginBottom:12 }}>✅</div>
                <div style={{ fontWeight:700,fontSize:16,color:C.green,marginBottom:8 }}>Parol yangilandi!</div>
                <div style={{ fontSize:13,color:"#6e6f76" }}>Tizimga kirishga yo'naltirilmoqda...</div>
              </div>
            ) : (
              <>
                {!sessionReady && !error && <div style={{ textAlign:"center",padding:16,color:"#6e6f76",fontSize:13 }}>Yuklanmoqda...</div>}
                {error && <div className="reset-error">{error}</div>}
                {sessionReady && (
                  <>
                    <label className="reset-label">Yangi parol</label>
                    <input className="reset-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Kamida 6 belgi" />
                    <label className="reset-label">Parolni tasdiqlang</label>
                    <input className="reset-input" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Parolni qaytaring" />
                    <button className="reset-primary" onClick={handleReset} disabled={loading}>
                      {loading?"Saqlanmoqda...":"Saqlash"}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth, initialMode="login", onBack }) {
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ email:"", password:"", full_name:"", university:"", company_name:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const isDark = localStorage.getItem("landing-theme") !== "light";
  const T = isDark
    ? { bg:"#040916", panel:"rgba(12,20,44,0.82)", panel2:"rgba(10,18,38,0.75)", border:"rgba(125,153,216,0.30)", text:"#eaf1ff", muted:"#9eaccb", accent:"#4f79ff", accent2:"#7ca3ff", error:"#fda4af", errorBg:"rgba(239,68,68,0.16)", chip:"rgba(255,255,255,0.07)", inputBg:"rgba(7,16,36,0.7)", inputBorder:"rgba(114,140,201,0.35)" }
    : { bg:"#eef5ff", panel:"rgba(255,255,255,0.88)", panel2:"rgba(245,250,255,0.92)", border:"rgba(99,130,191,0.24)", text:"#15213f", muted:"#5b6a8a", accent:"#1f4bda", accent2:"#1a40bc", error:"#b42318", errorBg:"rgba(229,72,77,0.14)", chip:"rgba(58,82,136,0.08)", inputBg:"#ffffff", inputBorder:"rgba(99,130,191,0.28)" };
  const isRegisterLayout = mode === "register";
  const useLightPanelLayout = mode === "register" || mode === "login";
  const leftTitle = mode === "login" ? "Welcome Back" : "Join Us";
  const leftDesc = mode === "login"
    ? "Sign in to continue your NatijaHub journey and manage your opportunities."
    : "Build your professional journey with NatijaHub and unlock internship opportunities that shape your future.";
  const leftAction = mode === "login" ? "Why NatijaHub" : "About Us";

  const submit = async () => {
    setLoading(true); setError("");
    try {
      if (mode === "login") {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email:form.email, password:form.password });
        if (error) throw error;
        onAuth(data.user);
      } else {
        if (!form.full_name.trim()) throw new Error("Ism Familiyani kiriting");
        if (role === "company" && !form.company_name.trim()) throw new Error("Kompaniya nomini kiriting");
        if (role === "student" && !form.university.trim()) throw new Error("Universitetni kiriting");

        // Use backend API for registration
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            role,
            full_name: form.full_name,
            university: role === "student" ? form.university : undefined,
            company_name: role === "company" ? form.company_name : undefined,
          })
        });
        let data;
        try {
          data = await res.json();
        } catch (e) {
          data = {};
        }
        if (!res.ok) {
          // Log error for debugging
          console.error("Registration error:", data, res.status);
          let msg = data.message || data.error || "Registration failed";
          // Show validation errors if present
          if (data.errors && Array.isArray(data.errors)) {
            msg += "\n" + data.errors.map(e => e.msg || e).join("\n");
          }
          throw new Error(msg);
        }
        // Optionally, auto-login after registration
        setMode("login");
        setError("Ro'yxatdan muvaffaqiyatli o'tdingiz. Endi tizimga kiring.");
      }
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const sendReset = async () => {
    if (!resetEmail.trim()) { setError("Emailni kiriting"); return; }
    setLoading(true); setError("");
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/#type=recovery`,
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const renderInput = (label, key, type="text", placeholder="") => (
    <div style={{ marginBottom:12 }}>
      <label style={{ display:"block", fontSize:12, fontWeight:700, color:T.muted, marginBottom:6 }}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e=>setForm({...form, [key]: e.target.value})}
        placeholder={placeholder}
        style={{
          width:"100%",
          padding:"12px 14px",
          borderRadius:useLightPanelLayout ? 8 : 14,
          border:useLightPanelLayout ? "1px solid rgba(171,176,189,0.9)" : `1px solid ${T.inputBorder}`,
          background:useLightPanelLayout ? "rgba(255,255,255,0.92)" : T.inputBg,
          color:useLightPanelLayout ? "#334155" : T.text,
          outline:"none",
          fontSize:14,
          fontFamily:"inherit",
          transition:"border-color .25s ease, box-shadow .25s ease, transform .2s ease",
          boxSizing:"border-box",
        }}
        onFocus={e=>{
          e.target.style.borderColor = useLightPanelLayout ? "#5d79d8" : T.accent;
          e.target.style.boxShadow = useLightPanelLayout ? "0 0 0 4px rgba(93,121,216,0.22)" : `0 0 0 4px ${T.accent}2A`;
          e.target.style.transform = "translateY(-1px)";
        }}
        onBlur={e=>{
          e.target.style.borderColor = useLightPanelLayout ? "rgba(171,176,189,0.9)" : T.inputBorder;
          e.target.style.boxShadow = "none";
          e.target.style.transform = "none";
        }}
      />
    </div>
  );

  // Parol tiklash ekrani
  if (showReset) {
    return (
      <div style={{ minHeight:"100vh",display:"flex",padding:0,background:T.bg,position:"relative",overflow:"hidden" }}>
        <style>{`
          .auth2-root{position:relative;z-index:2;display:grid;grid-template-columns:1.1fr .9fr;min-height:100vh;width:100%;background:linear-gradient(112deg, #203f8f 0%, #2c63cc 52%, #5f82dd 100%);} 
          .auth2-left{position:relative;overflow:hidden;padding:56px clamp(24px,6vw,72px);display:flex;align-items:center;justify-content:center;text-align:center;background:transparent;}
          .auth2-left::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 20% 22%, rgba(255,255,255,.18), transparent 48%),radial-gradient(circle at 82% 78%, rgba(196,220,255,.13), transparent 52%);pointer-events:none;}
          .join-arrow{width:0;height:0;border-left:24px solid transparent;border-right:24px solid transparent;border-top:36px solid #ecf2ff;margin:0 auto 24px;filter:drop-shadow(0 4px 8px rgba(0,0,0,.2));}
          .join-about{margin-top:18px;background:#e9ecf3;color:#3a3d46;border:1px solid #d5d8e0;border-radius:999px;padding:10px 28px;font-size:14px;font-weight:600;cursor:pointer;transition:transform .2s ease, box-shadow .2s ease;}
          .join-about:hover{transform:translateY(-2px);box-shadow:0 8px 16px rgba(23,34,67,.2);} 
          .auth2-right{display:flex;align-items:center;justify-content:center;padding:26px;background:linear-gradient(180deg, rgba(236,243,255,0.88), rgba(225,236,255,0.82));border-left:1px solid rgba(255,255,255,0.5);position:relative;}
          .auth2-panel{width:100%;max-width:560px;background:linear-gradient(180deg, rgba(255,255,255,0.95), rgba(241,245,249,0.96));border:1px solid rgba(0,0,0,0.05);border-radius:96px 0 0 96px;padding:34px 44px 34px 38px;box-shadow:0 18px 40px rgba(23,34,67,.12);animation:formIn .6s cubic-bezier(.22,1,.36,1);} 
          .auth-primary{width:140px;margin-left:auto;display:block;border:none;border-radius:999px;padding:12px 14px;font-weight:700;font-size:14px;cursor:pointer;color:#f5f8ff;background:linear-gradient(135deg,#355fda,#597ef0);transition:transform .25s ease,box-shadow .25s ease;box-shadow:0 10px 20px rgba(53,95,218,.35);} 
          .auth-primary:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 18px 34px rgba(60,95,188,.44);} 
          .auth-primary:disabled{opacity:.6;cursor:not-allowed;transform:none;box-shadow:none;}
          .auth-ghost{display:block;width:auto;min-width:108px;border:none;background:linear-gradient(135deg,#355fda,#5f86f2);color:#f6f9ff;font-size:11px;margin:12px auto 0;cursor:pointer;font-family:inherit;font-weight:700;letter-spacing:.01em;text-align:center;border-radius:999px;padding:8px 14px;transition:transform .22s ease, box-shadow .22s ease, filter .2s ease;}
          .auth-ghost:hover{box-shadow:0 10px 18px rgba(53,95,218,.34);transform:translateY(-1px);filter:brightness(1.04);}
          .reset-input{width:100%;padding:12px 14px;border-radius:14px;border:1px solid rgba(0,0,0,0.05);background:rgba(255,255,255,0.92);color:#334155;outline:none;font-size:14px;font-family:inherit;box-sizing:border-box;box-shadow:inset 0 1px 0 rgba(255,255,255,0.72);}
          .reset-input:focus{border-color:#5d79d8;box-shadow:0 0 0 4px rgba(93,121,216,0.22);} 
          @keyframes formIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
          @media (max-width: 980px){.auth2-root{grid-template-columns:1fr}.auth2-left{display:none}.auth2-right{padding:20px}.auth2-panel{border-radius:24px;padding:28px;max-width:460px}}
        `}</style>
        <div className="auth2-root">
          <section className="auth2-left">
            <div style={{ position:"relative", zIndex:2 }}>
              <div className="join-arrow" />
              <h2 style={{ margin:"0 0 10px", color:"#f1f6ff", fontSize:44, letterSpacing:"-0.02em" }}>Reset Access</h2>
              <p style={{ margin:0, color:"rgba(230,239,255,.86)", lineHeight:1.6, maxWidth:360 }}>We will send a secure password reset link to your email address.</p>
              <button className="join-about">Need Help?</button>
            </div>
          </section>

          <section className="auth2-right">
            <div className="auth2-panel">
              <div style={{ marginBottom:18 }}>
                <div style={{ fontFamily:"Manrope,'Segoe UI',sans-serif",fontSize:30,fontWeight:800,color:"#47484d",letterSpacing:"-0.03em" }}>Reset Here</div>
                <div style={{ color:"#6e6f76",fontSize:13,marginTop:6 }}>Parolni tiklash</div>
              </div>
          {resetSent ? (
            <div style={{ textAlign:"center",padding:"16px 0" }}>
              <div style={{ fontSize:40,marginBottom:12 }}>📧</div>
              <div style={{ fontWeight:700,fontSize:16,color:T.text,marginBottom:8 }}>Email yuborildi!</div>
              <div style={{ fontSize:13,color:T.muted,lineHeight:1.6,marginBottom:20 }}>
                <strong>{resetEmail}</strong> manziliga parol tiklash havolasi yuborildi. Emailingizni tekshiring.
              </div>
              <button className="auth-primary" onClick={()=>{ setShowReset(false); setResetSent(false); setResetEmail(""); }}>
                Kirishga qaytish
              </button>
            </div>
          ) : (
            <>
              <div style={{ fontWeight:700,fontSize:16,color:T.text,marginBottom:6 }}>Parolni tiklash</div>
              <div style={{ fontSize:13,color:"#6e6f76",marginBottom:16,lineHeight:1.5 }}>
                Emailingizni kiriting — parol tiklash havolasini yuboramiz.
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#666b75", marginBottom:6 }}>Email</label>
                <input
                  className="reset-input"
                  type="email"
                  value={resetEmail}
                  onChange={e=>setResetEmail(e.target.value)}
                  placeholder="email@gmail.com"
                />
              </div>
              {error && <div style={{ background:T.errorBg,color:T.error,padding:"9px 12px",borderRadius:9,fontSize:12,marginBottom:12 }}>{error}</div>}
              <button className="auth-primary" onClick={sendReset} disabled={loading}>
                {loading?"Yuborilmoqda...":"Havola yuborish"}
              </button>
              <button onClick={()=>{ setShowReset(false); setError(""); }} className="auth-ghost">
                ← Orqaga
              </button>
            </>
          )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh",display:"flex",padding:0,background:T.bg,position:"relative",overflow:"hidden" }}>
      <style>{`
        .auth2-root{position:relative;z-index:2;display:grid;grid-template-columns:1.1fr .9fr;min-height:100vh;width:100%;background:linear-gradient(112deg, #203f8f 0%, #2c63cc 52%, #5f82dd 100%);}
        .auth2-left{position:relative;overflow:hidden;padding:56px clamp(24px,6vw,72px);display:flex;flex-direction:column;justify-content:space-between;background:transparent;animation:authShift 16s ease infinite;background-size:200% 200%;}
        .auth2-left::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 20% 22%, rgba(255,255,255,.18), transparent 48%),radial-gradient(circle at 82% 78%, rgba(196,220,255,.13), transparent 52%);pointer-events:none;}
        .auth2-floating{position:absolute;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);backdrop-filter:blur(10px);border-radius:16px;padding:12px 14px;color:#f0f6ff;font-size:13px;animation:authFloat 8s ease-in-out infinite;}
        .auth2-floating.two{animation-delay:1.8s;animation-duration:9.5s;}
        .auth2-floating.three{animation-delay:3s;animation-duration:10.4s;}
        .auth2-right{display:flex;align-items:center;justify-content:center;padding:26px;background:linear-gradient(180deg, rgba(236,243,255,0.88), rgba(225,236,255,0.82));border-left:1px solid rgba(255,255,255,0.5);position:relative;}
        .auth2-panel{width:100%;max-width:500px;background:${T.panel};border:1px solid ${T.border};border-radius:26px;padding:28px;backdrop-filter:blur(12px);box-shadow:0 20px 52px rgba(4,12,31,.3);animation:formIn .6s cubic-bezier(.22,1,.36,1);} 
        .auth2-panel.register-shape{background:linear-gradient(160deg,#f8fbff 0%,#eef4ff 48%,#e8f0ff 100%);border:1px solid #c8d9ff;border-radius:34px;padding:32px 34px;max-width:560px;box-shadow:0 24px 48px rgba(34,64,131,.20), inset 0 1px 0 rgba(255,255,255,.75);} 
        .auth-primary{width:100%;border:none;border-radius:999px;padding:13px 14px;font-weight:700;font-size:14px;cursor:pointer;color:#f5f8ff;background:linear-gradient(135deg,${T.accent},${T.accent2});transition:transform .25s ease,box-shadow .25s ease;box-shadow:0 12px 26px rgba(60,95,188,.33);} 
        .auth-primary:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 18px 34px rgba(60,95,188,.44);} 
        .auth-primary.login-mode{display:block;width:132px;margin:0 auto;} 
        .auth-primary.register-mode{width:154px;margin-left:auto;border-radius:999px;background:linear-gradient(135deg,#2f5fdd,#6b8eff);box-shadow:0 12px 22px rgba(53,95,218,.38);} 
        .auth-primary:disabled{opacity:.6;cursor:not-allowed;transform:none;box-shadow:none;}
        .auth-ghost{display:block;width:auto;min-width:108px;border:none;background:linear-gradient(135deg,#355fda,#5f86f2);color:#f6f9ff;font-size:11px;margin:12px auto 0;cursor:pointer;font-family:inherit;font-weight:700;letter-spacing:.01em;text-align:center;border-radius:999px;padding:8px 14px;transition:transform .22s ease, box-shadow .22s ease, filter .2s ease;}
        .auth-ghost:hover{box-shadow:0 10px 18px rgba(53,95,218,.34);transform:translateY(-1px);filter:brightness(1.04);}
        .auth-link{display:block;text-align:center;margin-top:14px;font-size:13px;background:none;border:none;color:${T.accent2};cursor:pointer;text-decoration:underline;text-underline-offset:3px;transition:color .2s ease;}
        .auth-link:hover{color:${T.text};}
        .auth-tab{flex:1;border:none;border-radius:12px;padding:10px 0;cursor:pointer;font-size:13px;font-weight:700;font-family:inherit;transition:all .25s ease;}
        .auth2-chip{font-size:11px;text-transform:uppercase;letter-spacing:.12em;font-weight:700;color:#eaf2ff;opacity:.9;}
        .join-center{height:100%;display:flex;align-items:center;justify-content:center;text-align:center;position:relative;z-index:2;}
        .join-arrow{width:0;height:0;border-left:24px solid transparent;border-right:24px solid transparent;border-top:36px solid #ecf2ff;margin:0 auto 24px;filter:drop-shadow(0 4px 8px rgba(0,0,0,.2));}
        .join-about{margin-top:18px;background:#e9ecf3;color:#3a3d46;border:1px solid #d5d8e0;border-radius:999px;padding:10px 28px;font-size:14px;font-weight:600;cursor:pointer;transition:transform .2s ease, box-shadow .2s ease;}
        .join-about:hover{transform:translateY(-2px);box-shadow:0 8px 16px rgba(23,34,67,.2);}
        @keyframes authShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes authFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes formIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
        @media (max-width: 980px){.auth2-root{grid-template-columns:1fr}.auth2-left{display:none}.auth2-right{padding:20px}.auth2-panel.register-shape{border-radius:24px;padding:26px;max-width:460px}}
      `}</style>
      <div className="auth2-root">
        <section className="auth2-left">
          <div className="join-center">
            <div>
              <div className="join-arrow" />
              <h2 style={{ margin:"0 0 10px", color:"#f1f6ff", fontSize:44, letterSpacing:"-0.02em" }}>{leftTitle}</h2>
              <p style={{ margin:0, color:"rgba(230,239,255,.86)", lineHeight:1.6, maxWidth:360 }}>{leftDesc}</p>
              <button className="join-about">{leftAction}</button>
            </div>
          </div>
        </section>

        <section className="auth2-right">
          <div className={`auth2-panel ${useLightPanelLayout ? "register-shape" : ""}`}>
            <div style={{ marginBottom:18 }}>
              <div style={{ fontFamily:"Manrope,'Segoe UI',sans-serif",fontSize:30,fontWeight:800,color:useLightPanelLayout?"#47484d":T.text,letterSpacing:"-0.03em" }}>{mode==="login" ? "Login Here" : "Register Here"}</div>
              <div style={{ color:useLightPanelLayout?"#6e6f76":T.muted,fontSize:13,marginTop:6 }}>{mode==="login" ? "Access your NatijaHub account" : "Create your NatijaHub account"}</div>
            </div>
            <div style={{ display:"flex",background:useLightPanelLayout?"rgba(142,170,235,0.22)":T.chip,borderRadius:14,padding:4,marginBottom:20,border:useLightPanelLayout?"1px solid rgba(123,153,224,0.45)":`1px solid ${T.border}` }}>
              {[ ["login","Kirish"],["register","Ro'yxat"] ].map(([m,l])=>(
                <button key={m} className="auth-tab" onClick={()=>{ setMode(m); setError(""); }} style={{ background:mode===m?`linear-gradient(135deg,#4069dd,#7d9eff)`:"transparent",color:mode===m?"#fff":(useLightPanelLayout?"#4c5f8e":T.muted) }}>{l}</button>
              ))}
            </div>

            {mode==="register" && (
              <>
                <div style={{ display:"flex",gap:8,marginBottom:14 }}>
                  {[ ["student","Talaba"],["company","Tadbirkor"] ].map(([r,l])=>(
                    <button key={r} className="auth-tab" onClick={()=>setRole(r)} style={{ background:role===r?`linear-gradient(135deg,#4069dd,#7d9eff)`:"rgba(255,255,255,0.55)",color:role===r?"#fff":"#5a6f9f",border:`1px solid ${role===r?"#4069dd":"rgba(125,153,224,0.52)"}` }}>{l}</button>
                  ))}
                </div>
                {renderInput("Ism Familiya *", "full_name", "text", "Ism Familiya")}
                {role==="student" && renderInput("Universitet *", "university", "text", "TDIU, WIUT, Millat Umidi...")}
                {role==="company" && renderInput("Kompaniya nomi *", "company_name", "text", "Kompaniya nomi")}
              </>
            )}

            {renderInput("Email *", "email", "email", "email@gmail.com")}
            {renderInput("Parol *", "password", "password", "Kamida 6 belgi")}

            {error && <div style={{ background:T.errorBg,color:T.error,padding:"9px 12px",borderRadius:10,fontSize:12,marginBottom:12 }}>{error}</div>}
            <button className={`auth-primary ${isRegisterLayout ? "register-mode" : ""} ${mode === "login" ? "login-mode" : ""}`} onClick={submit} disabled={loading}>
              {loading?"Kuting...":mode==="login"?"Kirish":"Ro'yxatdan o'tish"}
            </button>

            {mode==="login" && (
              <button onClick={()=>{ setShowReset(true); setResetEmail(form.email); setError(""); }} className="auth-link">
                Parolni unutdim?
              </button>
            )}

            <button onClick={()=>{ setMode(mode==="login"?"register":"login"); setError(""); }} className="auth-link" style={{ marginTop:8 }}>
              {mode==="login" ? "Account yo'qmi? Ro'yxatdan o'tish" : "Account bormi? Kirish"}
            </button>
            {onBack && <button onClick={onBack} className="auth-ghost">← Orqaga</button>}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ profile, onLogout, theme, onToggleTheme }) {
  const isAdmin = profile?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const darkMode = theme === "dark";
  const navStyle = darkMode
    ? { background:"rgba(10,19,40,0.88)", border:"1px solid rgba(118,148,210,0.24)", shadow:"0 12px 32px rgba(2,8,23,0.35)", text:"#fff", muted:"rgba(226,236,255,0.95)", surface:"rgba(255,255,255,0.10)", surfaceBorder:"rgba(255,255,255,0.2)" }
    : { background:"rgba(255,255,255,0.7)", border:"1px solid rgba(0,0,0,0.05)", shadow:"0 4px 20px rgba(0,0,0,0.05)", text:C.primary, muted:C.muted, surface:"rgba(248,250,252,0.92)", surfaceBorder:"rgba(0,0,0,0.05)" };

  return (
    <nav style={{ background:navStyle.background,backdropFilter:"blur(12px)",borderBottom:navStyle.border,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",minHeight:72,position:"sticky",top:0,zIndex:200,transition:"all 0.25s ease",boxShadow:navStyle.shadow }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:42, height:42, borderRadius:14, background:darkMode ? "linear-gradient(135deg, rgba(37,99,235,0.28), rgba(124,163,255,0.22))" : "linear-gradient(135deg, #eff6ff, #dbeafe)", border:navStyle.border, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:darkMode ? "none" : "0 10px 24px rgba(37,99,235,0.10)" }}>
          <span style={{ fontSize:16, fontWeight:800, color:C.accent }}>N</span>
        </div>
        <div style={{ fontFamily:"Manrope,'Segoe UI',sans-serif",fontWeight:800,fontSize:18,color:navStyle.text,letterSpacing:"-0.02em",transition:"all 0.2s ease" }}>
        Natija<span style={{ color:C.accent }}>Hub</span>
        {isAdmin && <span style={{ fontSize:9,background:C.gold+"30",color:C.gold,padding:"2px 6px",borderRadius:6,marginLeft:6,fontWeight:700 }}>ADMIN</span>}
        </div>
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
        <button
          onClick={onToggleTheme}
          aria-label="Toggle dark mode"
          style={{
            background: navStyle.surface,
            color: darkMode ? "#FACC15" : C.accent,
            border: `1px solid ${navStyle.surfaceBorder}`,
            borderRadius: 14,
            width: 42,
            height: 42,
            cursor: "pointer",
            fontSize: 15,
            fontFamily: "inherit",
            transition: "all 0.25s ease",
            boxShadow: darkMode ? "none" : "0 8px 22px rgba(15,23,42,0.06)",
          }}
        >
          {darkMode ? "☀" : "☾"}
        </button>
        <div style={{ textAlign:"right", padding:"8px 12px", borderRadius:14, background:navStyle.surface, border:`1px solid ${navStyle.surfaceBorder}`, boxShadow:darkMode ? "none" : "0 8px 22px rgba(15,23,42,0.05)" }}>
          <div style={{ color:navStyle.text,fontSize:12,fontWeight:700 }}>{profile?.full_name?.split(" ")[0]||"User"}</div>
          <div style={{ color:navStyle.muted,fontSize:10 }}>{isAdmin?"Admin":profile?.role==="company"?"Tadbirkor":"Talaba"}</div>
        </div>
        <button onClick={onLogout} style={{ background:darkMode ? "#ffffff15" : "linear-gradient(135deg, #ffffff, #f8fafc)",color:darkMode ? "#ffffffD8" : C.primary,border:`1px solid ${navStyle.surfaceBorder}`,borderRadius:14,padding:"10px 14px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",transition:"all 0.25s ease",boxShadow:darkMode ? "none" : "0 8px 22px rgba(15,23,42,0.06)" }}>Chiqish</button>
      </div>
    </nav>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function BottomNav({ page, setPage, role, isAdmin, theme }) {
  const tabs = isAdmin
    ? [{id:"admin_users",l:"Foydalanuvchilar"},{id:"admin_internships",l:"Amaliyotlar"},{id:"admin_applications",l:"Arizalar"}]
    : role==="company"
      ? [{id:"company_home",l:"Panel"},{id:"company_internships",l:"E'lonlar"},{id:"company_applications",l:"Arizalar"}]
      : [{id:"home",l:"Amaliyotlar"},{id:"my_applications",l:"Arizalarim"},{id:"profile",l:"Profil"},{id:"resume",l:"CV"}];
  const isDark = theme === "dark";
  return (
    <div style={{ position:"fixed",bottom:0,left:0,right:0,background:isDark?"rgba(8,14,30,0.93)":"rgba(255,255,255,0.72)",backdropFilter:"blur(12px)",borderTop:isDark?"1px solid rgba(118,148,210,0.28)":`1px solid ${C.border}`,display:"flex",zIndex:200,padding:"8px 10px calc(10px + env(safe-area-inset-bottom))",transition:"all 0.25s ease",boxShadow:isDark ? "0 -10px 30px rgba(2,8,23,0.3)" : "0 -8px 24px rgba(15,23,42,0.06)",gap:8 }}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>setPage(t.id)} style={{ flex:1,background:page===t.id ? (isDark ? "rgba(37,99,235,0.16)" : "linear-gradient(180deg, #ffffff, #eff6ff)") : "transparent",border:page===t.id ? `1px solid ${isDark ? "rgba(96,165,250,0.25)" : "rgba(37,99,235,0.10)"}` : "1px solid transparent",cursor:"pointer",padding:"10px 6px",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:5,borderRadius:16,transition:"all 0.25s ease",boxShadow:page===t.id && !isDark ? "0 10px 24px rgba(37,99,235,0.10)" : "none" }}>
          <span style={{ fontSize:9,fontWeight:700,color:page===t.id?C.accent:(isDark?"#9EB2DE":C.muted),textTransform:"uppercase",letterSpacing:"0.5px",textAlign:"center",lineHeight:1.3 }}>{t.l}</span>
          {page===t.id && <div style={{ width:18,height:3,borderRadius:999,background:C.accent }} />}
        </button>
      ))}
    </div>
  );
}

// ─── INTERNSHIP CARD ──────────────────────────────────────────────────────────
function InternshipCard({ item, userId }) {
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data tekshiruvi — faqat real Supabase amaliyotlarga ariza berish mumkin
  const isMock = typeof item.id === "number" && item.id <= 100;

  const apply = async () => {
    if (!userId) { alert("Ariza berish uchun avval tizimga kiring!"); return; }
    if (isMock) { alert("Bu namuna e'lon. Haqiqiy amaliyotlar tez kunda qo'shiladi!"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("applications").insert({
        internship_id: item.id,
        student_id: userId,
        status: "pending",
      });
      if (error) {
        if (error.code === "23505") {
          setApplied(true); // allaqachon berilgan
        } else {
          alert("Ariza berishda xato: " + error.message);
        }
      } else {
        setApplied(true);
      }
    } catch (err) {
      alert("Ulanishda xato: " + err.message);
    }
    setLoading(false);
  };

  return (
    <Card style={{ marginBottom:10, opacity: isMock ? 0.7 : 1 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
        <div style={{ display:"flex",gap:10,alignItems:"center" }}>
          <div style={{ width:40,height:40,background:C.light,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{item.company_logo||"🏢"}</div>
          <div>
            <div style={{ fontWeight:700,fontSize:14,color:C.primary }}>{item.role}</div>
            <div style={{ color:C.muted,fontSize:12 }}>{item.company_name}</div>
          </div>
        </div>
        <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4 }}>
          {item.type && <Badge text={item.type} color={C.primary} />}
          {isMock && <Badge text="Namuna" color={C.muted} />}
        </div>
      </div>
      {item.description && <p style={{ fontSize:13,color:C.muted,lineHeight:1.5,margin:"0 0 10px" }}>{item.description}</p>}
      <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:12 }}>
        {(item.skills||[]).map(s=><Badge key={s} text={s} color="#6366F1" />)}
      </div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid ${C.border}`,paddingTop:10 }}>
        <span style={{ fontSize:12,color:C.muted }}>⏱ {item.duration||"—"}</span>
        <Btn small onClick={apply} disabled={applied||loading||isMock} color={applied?C.green:isMock?C.muted:C.primary}>
          {loading?"...":applied?"Yuborildi":isMock?"Namuna":"Ariza berish"}
        </Btn>
      </div>
    </Card>
  );
}

// ─── STUDENT: AMALIYOTLAR ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
function StudentHome({ userId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Barchasi");
  const [search, setSearch] = useState("");

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try {
        const { data } = await supabase.from("internships").select("*").eq("is_active",true).order("created_at",{ascending:false});
        setItems(data?.length ? data : MOCK_INTERNSHIPS);
      } catch { setItems(MOCK_INTERNSHIPS); }
      setLoading(false);
    })();
  },[]);

  const filtered = items
    .filter(i=>filter==="Barchasi"||i.type===filter)
    .filter(i=>!search||i.role?.toLowerCase().includes(search.toLowerCase())||i.company_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding:"16px 0" }}>
      <SectionHeader title="Amaliyotlar" sub={`${items.length} ta e'lon mavjud`} />
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Qidirish..." style={{ width:"100%",border:`1px solid ${C.border}`,borderRadius:16,padding:"12px 14px",fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:14,background:"rgba(255,255,255,0.92)",boxShadow:C.shadow }} />
      <div style={{ display:"flex",gap:6,marginBottom:14,flexWrap:"wrap" }}>
        {["Barchasi","Ofis","Remote","Gibrid"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ background:filter===f?`linear-gradient(135deg, ${C.accent}, ${C.accentHover})`:"rgba(255,255,255,0.88)",color:filter===f?"#fff":C.muted,border:`1px solid ${filter===f?C.accent:C.border}`,padding:"8px 14px",borderRadius:999,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",boxShadow:filter===f ? "0 12px 26px rgba(37,99,235,0.22)" : C.shadow,transition:"all 0.25s ease" }}>{f}</button>
        ))}
      </div>
      {loading ? <Spinner /> : filtered.length===0
        ? <Empty title="Hech narsa topilmadi" sub="Boshqa filtr tanlang" />
        : filtered.map(item=><InternshipCard key={item.id} item={item} userId={userId} />)
      }
    </div>
  );
}

// ─── STUDENT: ARIZALARIM ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
function StudentApplications({ userId }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    if(!userId){setLoading(false);return;}
    (async()=>{
      setLoading(true);
      try {
        const { data } = await supabase.from("applications").select("*, internships(role,company_name,company_logo,duration,type)").eq("student_id",userId).order("created_at",{ascending:false});
        setApps(data||[]);
      } catch {}
      setLoading(false);
    })();
  },[userId]);

  return (
    <div style={{ padding:"16px 0" }}>
      <SectionHeader title="Arizalarim" sub={`${apps.length} ta ariza`} />
      {loading ? <Spinner /> : apps.length===0
        ? <Empty title="Hali ariza yo'q" sub="Amaliyotlar bo'limidan ariza bering" />
        : apps.map(app=>(
          <Card key={app.id} style={{ marginBottom:10 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
              <div style={{ width:40,height:40,background:C.light,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{app.internships?.company_logo||"🏢"}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700,fontSize:14,color:C.primary }}>{app.internships?.role}</div>
                <div style={{ color:C.muted,fontSize:12 }}>{app.internships?.company_name}</div>
              </div>
              <StatusBadge status={app.status||"pending"} />
            </div>
            <div style={{ display:"flex",gap:8,borderTop:`1px solid ${C.border}`,paddingTop:10 }}>
              {app.internships?.duration && <Badge text={`⏱ ${app.internships.duration}`} color={C.muted} />}
              {app.internships?.type && <Badge text={app.internships.type} color={C.primary} />}
            </div>
          </Card>
        ))
      }
    </div>
  );
}

// ─── STUDENT: PROFIL ──────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
function StudentProfile({ profile, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name:profile?.full_name||"", phone:profile?.phone||"", about:profile?.about||"", university:profile?.university||"", faculty:profile?.faculty||"", year:profile?.year||"" });
  const [skills, setSkills] = useState(profile?.skills||[]);
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({ ...form, skills }).eq("id", profile.id);
      if (!error) {
        if (onUpdate) onUpdate({ ...profile, ...form, skills });
        setEditing(false);
        setSaved(true);
        setTimeout(()=>setSaved(false), 2000);
      } else {
        alert("Saqlashda xato: " + error.message);
      }
    } catch {}
    setSaving(false);
  };

  return (
    <div style={{ padding:"16px 0" }}>
      <Card style={{ marginBottom:12,textAlign:"center",padding:24 }}>
        <div style={{ width:64,height:64,background:C.accent+"20",borderRadius:"50%",margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,color:C.accent,fontWeight:700 }}>
          {(profile?.full_name||"U")[0]}
        </div>
        <div style={{ fontWeight:700,fontSize:17,color:C.primary,marginBottom:4 }}>{profile?.full_name||"Ism kiritilmagan"}</div>
        {profile?.university && <div style={{ color:C.muted,fontSize:13,marginBottom:3 }}>{profile.university}</div>}
        {profile?.faculty && <div style={{ color:C.muted,fontSize:12 }}>{profile.faculty}{profile?.year&&` · ${profile.year}-kurs`}</div>}
        {profile?.phone && <div style={{ color:C.muted,fontSize:12,marginTop:3 }}>{profile.phone}</div>}
        {profile?.about && <div style={{ color:C.muted,fontSize:13,lineHeight:1.5,marginTop:8,padding:"0 8px" }}>{profile.about}</div>}
      </Card>

      <Card style={{ marginBottom:12 }}>
        <h4 style={{ margin:"0 0 12px",fontWeight:700,fontSize:14,color:C.primary }}>Ko'nikmalar</h4>
        <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:10 }}>
          {skills.length===0
            ? <span style={{ fontSize:12,color:C.muted }}>Ko'nikma qo'shing</span>
            : skills.map(s=>(
              <span key={s} onClick={()=>setSkills(skills.filter(sk=>sk!==s))} style={{ background:C.accent+"15",color:C.accent,padding:"4px 11px",borderRadius:18,fontSize:12,fontWeight:600,cursor:"pointer" }}>{s} ×</span>
            ))
          }
        </div>
        <div style={{ display:"flex",gap:7 }}>
          <input value={newSkill} onChange={e=>setNewSkill(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newSkill.trim()){setSkills([...skills,newSkill.trim()]);setNewSkill("");}}} placeholder="Ko'nikma qo'shing..." style={{ flex:1,border:`1px solid ${C.border}`,borderRadius:9,padding:"8px 11px",fontSize:12,outline:"none",fontFamily:"inherit" }} />
          <Btn small onClick={()=>{if(newSkill.trim()){setSkills([...skills,newSkill.trim()]);setNewSkill("");}}}>+</Btn>
        </div>
      </Card>

      <Btn full onClick={()=>setEditing(!editing)} color={editing?C.muted:C.primary} style={{ marginBottom:10 }}>
        {editing?"Bekor":"Profilni tahrirlash"}
      </Btn>
      {saved && <div style={{ background:C.green+"15",color:C.green,padding:"10px 14px",borderRadius:10,fontSize:13,marginBottom:10,textAlign:"center",fontWeight:600 }}>Saqlandi!</div>}
      {editing && (
        <Card style={{ border:`1.5px solid ${C.accent}` }}>
          <Input label="Ism Familiya" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} />
          <Input label="Universitet" value={form.university} onChange={e=>setForm({...form,university:e.target.value})} />
          <Input label="Fakultet" value={form.faculty} onChange={e=>setForm({...form,faculty:e.target.value})} placeholder="Business Administration" />
          <Input label="Kurs" value={form.year} onChange={e=>setForm({...form,year:e.target.value})} placeholder="2" />
          <Input label="Telefon" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+998 90 000 00 00" />
          <Input label="O'zim haqimda" value={form.about} onChange={e=>setForm({...form,about:e.target.value})} rows={3} placeholder="Qisqacha ma'lumot..." />
          <Btn full onClick={save} color={C.green} disabled={saving}>{saving?"Saqlanmoqda...":"Saqlash"}</Btn>
        </Card>
      )}
    </div>
  );
}

// ─── STUDENT: CV ──────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
function StudentCV({ profile }) {
  const [exps, setExps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("preview");

  useEffect(()=>{
    if(!profile?.id){setLoading(false);return;}
    (async()=>{
      setLoading(true);
      try { const { data } = await supabase.from("experiences").select("*").eq("student_id",profile.id); setExps(data||[]); }
      catch {}
      setLoading(false);
    })();
  },[profile]);

  const allSkills = [...new Set([...(profile?.skills||[]), ...exps.flatMap(e=>e.skills||[])])];
  const score = Math.min(100,
    (profile?.full_name?15:0)+(profile?.about?15:0)+(profile?.phone?10:0)+
    (profile?.university?10:0)+(allSkills.length>0?10:0)+exps.length*20
  );

  return (
    <div style={{ padding:"16px 0" }}>
      <Card style={{ marginBottom:14 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
          <div>
            <div style={{ fontWeight:700,fontSize:15,color:C.primary }}>CV Kuchi</div>
            <div style={{ fontSize:12,color:C.muted }}>{score<70?"Profilni to'ldiring":"Zo'r CV!"}</div>
          </div>
          <div style={{ fontFamily:"Georgia,serif",fontSize:24,fontWeight:700,color:score>=70?C.green:C.gold }}>{score}%</div>
        </div>
        <div style={{ background:C.border,borderRadius:6,height:6,overflow:"hidden" }}>
          <div style={{ width:`${score}%`,height:"100%",background:score>=70?C.green:C.gold,borderRadius:6,transition:"width 0.5s" }} />
        </div>
      </Card>

      <div style={{ display:"flex",background:"linear-gradient(180deg, rgba(255,255,255,0.94), rgba(241,245,249,0.9))",borderRadius:16,padding:4,marginBottom:16,border:`1px solid ${C.border}`,boxShadow:C.shadow }}>
        {[["preview","Ko'rinish"],["experience","Tajriba"],["recs","Tavsiyalar"]].map(([id,l])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ flex:1,background:tab===id?`linear-gradient(135deg, ${C.accent}, ${C.accentHover})`:"transparent",color:tab===id?"#fff":C.muted,border:"none",borderRadius:12,padding:"10px 6px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",boxShadow:tab===id ? "0 10px 22px rgba(37,99,235,0.18)" : "none",transition:"all 0.25s ease" }}>{l}</button>
        ))}
      </div>

      {loading && <Spinner />}

      {!loading && tab==="preview" && (
        <Card>
          <div style={{ background:C.primary,margin:"-16px -16px 14px",padding:16,borderRadius:"14px 14px 0 0",display:"flex",gap:12,alignItems:"center" }}>
            <div style={{ width:44,height:44,background:C.accent,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"#fff",fontWeight:700 }}>{(profile?.full_name||"U")[0]}</div>
            <div>
              <div style={{ color:"#fff",fontWeight:700,fontSize:15 }}>{profile?.full_name||"Ismingiz"}</div>
              <div style={{ color:C.accent,fontSize:11 }}>{profile?.university||"Universitetingiz"}</div>
            </div>
          </div>
          {profile?.about && <p style={{ fontSize:13,color:C.muted,lineHeight:1.6,margin:"0 0 12px" }}>{profile.about}</p>}
          {allSkills.length>0 && (
            <div style={{ marginBottom:12 }}>
              <div style={{ fontWeight:700,fontSize:11,color:C.primary,marginBottom:8,letterSpacing:"0.5px" }}>KO'NIKMALAR</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>{allSkills.map(s=><Badge key={s} text={s} color={C.accent} />)}</div>
            </div>
          )}
          {exps.length>0 && (
            <div>
              <div style={{ fontWeight:700,fontSize:11,color:C.primary,marginBottom:8,letterSpacing:"0.5px" }}>AMALIYOT TAJRIBASI</div>
              {exps.map(exp=>(
                <div key={exp.id} style={{ marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ fontWeight:700,fontSize:13,marginBottom:3 }}>{exp.role}</div>
                  <div style={{ color:C.muted,fontSize:12,marginBottom:6 }}>{exp.company_name} · {exp.period}</div>
                  {exp.tasks?.map((t,i)=><div key={i} style={{ fontSize:12,color:C.muted,marginBottom:2 }}>· {t}</div>)}
                </div>
              ))}
            </div>
          )}
          {exps.length===0 && allSkills.length===0 && <div style={{ textAlign:"center",padding:20,color:C.muted,fontSize:13 }}>Profilni to'ldiring va amaliyot o'ting</div>}
        </Card>
      )}

      {!loading && tab==="experience" && (
        <div>
          <div style={{ background:C.accent+"12",border:`1px solid ${C.accent}30`,borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:13 }}>
            <strong>Avtomatik</strong> — har amaliyot tugagach qo'shiladi
          </div>
          {exps.length===0
            ? <Empty title="Hali tajriba yo'q" sub="Amaliyot tugagach bu yerda ko'rinadi" />
            : exps.map(exp=>(
              <Card key={exp.id} style={{ marginBottom:10 }}>
                <div style={{ fontWeight:700,fontSize:14,marginBottom:4,color:C.primary }}>{exp.role}</div>
                <div style={{ color:C.muted,fontSize:12,marginBottom:8 }}>{exp.company_name} · {exp.period}</div>
                {exp.tasks?.map((t,i)=><div key={i} style={{ fontSize:12,color:C.muted,marginBottom:2 }}>→ {t}</div>)}
              </Card>
            ))}
          )
        </div>
      )}

      {!loading && tab==="recs" && (
        <div>
          {exps.filter(e=>e.recommendation).length===0
            ? <Empty title="Tavsiyalar bu yerda ko'rinadi" sub="Amaliyot tugagach tadbirkor tavsiya beradi" />
            : exps.filter(e=>e.recommendation).map(exp=>(
              <Card key={exp.id} style={{ marginBottom:10 }}>
                <div style={{ fontWeight:700,fontSize:14,marginBottom:4 }}>{exp.company_name}</div>
                <div style={{ background:C.light,borderRadius:9,padding:"10px 12px",marginBottom:8,borderLeft:`3px solid ${C.gold}` }}>
                  <p style={{ margin:0,fontSize:12,lineHeight:1.6,fontStyle:"italic",color:C.primary }}>"{exp.recommendation}"</p>
                </div>
                <div style={{ fontSize:11,color:C.muted,fontWeight:600 }}>— {exp.reviewer_name}</div>
              </Card>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ─── COMPANY: PANEL ───────────────────────────────────────────────────────────
function InternshipSpotlightCard({ item, userId, theme, applied, onApplied, saved, onToggleSave, onToast, highlight }) {
  const [loading, setLoading] = useState(false);
  const ui = getDashboardTheme(theme);
  const isMock = typeof item.id === "number" && item.id <= 100;
  const badgeLabel = highlight || (item.created_at ? "New" : "Top");
  const salary = item.salary || "Competitive";

  const apply = async () => {
    if (!userId) {
      onToast?.("Ariza berish uchun avval tizimga kiring", "error");
      return;
    }
    if (isMock) {
      onToast?.("Bu demo internship. Tez orada ko'proq real e'lonlar qo'shiladi.", "error");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("applications").insert({
        internship_id: item.id,
        student_id: userId,
        status: "pending",
      });
      if (error) {
        if (error.code === "23505") {
          onApplied?.(item.id, "pending");
          onToast?.("Siz bu internshipga allaqachon ariza bergansiz");
        } else {
          onToast?.(`Ariza berishda xato: ${error.message}`, "error");
        }
      } else {
        onApplied?.(item.id, "pending");
        onToast?.("Ariza muvaffaqiyatli yuborildi");
      }
    } catch (err) {
      onToast?.(`Ulanishda xato: ${err.message}`, "error");
    }
    setLoading(false);
  };

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -6 }} transition={{ duration: 0.22, ease: "easeOut" }}>
      <Card style={{ background:ui.panel, border:`1px solid ${ui.line}`, boxShadow:theme === "dark" ? ui.shadow : "0 10px 30px rgba(0,0,0,0.1)", padding:22 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:16 }}>
          <div style={{ display:"flex", gap:14, alignItems:"center", minWidth:0 }}>
            <div style={{ width:54, height:54, borderRadius:18, background:theme === "dark" ? "rgba(37,99,235,0.16)" : "linear-gradient(135deg, #eff6ff, #dbeafe)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, boxShadow:"inset 0 1px 0 rgba(255,255,255,0.4)" }}>
              {item.company_logo || "🏢"}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:6 }}>
                <div style={{ fontWeight:800, fontSize:18, color:ui.text, lineHeight:1.2 }}>{item.role}</div>
                <span style={{ background: badgeLabel === "Top" ? "rgba(245,158,11,0.14)" : ui.blueSoft, color: badgeLabel === "Top" ? C.gold : C.accent, padding:"4px 10px", borderRadius:999, fontSize:11, fontWeight:800 }}>{badgeLabel}</span>
              </div>
              <div style={{ color:ui.muted, fontSize:13, fontWeight:600 }}>{item.company_name}</div>
            </div>
          </div>
          <button onClick={onToggleSave} aria-label="Save internship" style={{ width:40, height:40, borderRadius:14, border:`1px solid ${ui.line}`, background:saved ? "rgba(37,99,235,0.14)" : ui.panelAlt, color:saved ? C.accent : ui.muted, cursor:"pointer", fontSize:16, transition:"all 0.25s ease", flexShrink:0 }}>
            {saved ? "★" : "☆"}
          </button>
        </div>

        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
          <Badge text={item.type || "Remote"} color={C.accent} />
          <Badge text={`⏱ ${item.duration || "Flexible"}`} color={C.muted} />
          <Badge text={`$ ${salary}`} color={C.green} />
        </div>

        {item.description && <p style={{ margin:"0 0 16px", color:ui.muted, fontSize:14, lineHeight:1.7 }}>{item.description}</p>}

        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:18 }}>
          {(item.skills || []).slice(0, 5).map(skill => <Badge key={skill} text={skill} color="#4F46E5" />)}
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", gap:12, alignItems:"center", borderTop:`1px solid ${ui.line}`, paddingTop:16, flexWrap:"wrap" }}>
          <div style={{ display:"grid", gap:4 }}>
            <span style={{ fontSize:12, color:ui.muted }}>Location</span>
            <span style={{ fontSize:13, fontWeight:700, color:ui.text }}>{item.type || "Remote"}</span>
          </div>
          <Btn small onClick={apply} disabled={applied || loading || isMock} color={applied ? C.green : C.accent}>
            {loading ? "Yuborilmoqda..." : applied ? "Ariza yuborildi" : isMock ? "Demo" : "Apply now"}
          </Btn>
        </div>
      </Card>
    </motion.div>
  );
}

function StudentHomePremium({ userId, theme, onToast }) {
  const ui = getDashboardTheme(theme);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Barchasi");
  const [search, setSearch] = useState("");
  const [appStatuses, setAppStatuses] = useState({});
  const [savedIds, setSavedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("student-saved-internships") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("student-saved-internships", JSON.stringify(savedIds));
  }, [savedIds]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const internshipPromise = supabase.from("internships").select("*").eq("is_active", true).order("created_at", { ascending: false });
        const applicationPromise = userId ? supabase.from("applications").select("internship_id,status").eq("student_id", userId) : Promise.resolve({ data: [] });
        const [{ data: internships }, { data: applications }] = await Promise.all([internshipPromise, applicationPromise]);
        setItems(internships?.length ? internships : MOCK_INTERNSHIPS);
        setAppStatuses(Object.fromEntries((applications || []).map(app => [app.internship_id, app.status || "pending"])));
      } catch {
        setItems(MOCK_INTERNSHIPS);
      }
      setLoading(false);
    })();
  }, [userId]);

  const filtered = items
    .filter(item => filter === "Barchasi" || item.type === filter)
    .filter(item => !search || item.role?.toLowerCase().includes(search.toLowerCase()) || item.company_name?.toLowerCase().includes(search.toLowerCase()));

  const stats = [
    { label:"Total internships", value:items.length, icon:"◫", tone:C.accent },
    { label:"Applications sent", value:Object.keys(appStatuses).length, icon:"↗", tone:C.gold },
    { label:"Accepted offers", value:Object.values(appStatuses).filter(status => status === "accepted").length, icon:"✓", tone:C.green },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerWrap} style={{ display:"grid", gap:20 }}>
      <motion.section variants={fadeUp}>
        <div style={{ background:ui.hero, border:`1px solid ${ui.line}`, borderRadius:28, padding:"28px clamp(20px, 4vw, 34px)", boxShadow:ui.shadow }}>
          <div style={{ display:"flex", justifyContent:"space-between", gap:20, alignItems:"flex-start", flexWrap:"wrap" }}>
            <div style={{ maxWidth:640 }}>
              <div style={{ color:C.accent, fontSize:12, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:10 }}>Talaba Dashboard</div>
              <h2 style={{ margin:"0 0 10px", fontSize:"clamp(30px, 5vw, 44px)", lineHeight:1.04, letterSpacing:"-0.04em", color:ui.text }}>Premium internship workspace for focused daily progress</h2>
              <p style={{ margin:0, color:ui.muted, fontSize:15, lineHeight:1.75, maxWidth:560 }}>Explore real internships, track every application, and build a stronger student profile in one clean workflow.</p>
            </div>
            <div style={{ minWidth:220, padding:18, borderRadius:22, background:ui.panelAlt, border:`1px solid ${ui.line}` }}>
              <div style={{ color:ui.muted, fontSize:12, fontWeight:700, marginBottom:8 }}>Saved roles</div>
              <div style={{ color:ui.text, fontSize:28, fontWeight:800, letterSpacing:"-0.04em" }}>{savedIds.length}</div>
              <div style={{ color:ui.muted, fontSize:13, lineHeight:1.6 }}>Bookmark internships to compare them later and keep your short list organized.</div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.div variants={staggerWrap} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:14 }}>
        {stats.map(stat => (
          <motion.div key={stat.label} variants={fadeUp}>
            <Card style={{ background:ui.panel, border:`1px solid ${ui.line}`, padding:18 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div style={{ width:42, height:42, borderRadius:14, background:`${stat.tone}14`, color:stat.tone, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800 }}>{stat.icon}</div>
                <div style={{ fontSize:28, fontWeight:800, letterSpacing:"-0.04em", color:ui.text }}>{stat.value}</div>
              </div>
              <div style={{ fontSize:13, color:ui.muted, fontWeight:700 }}>{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.section variants={fadeUp}>
        <Card style={{ background:ui.panel, border:`1px solid ${ui.line}`, padding:18 }}>
          <div style={{ display:"grid", gap:14 }}>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:16, top:14, color:ui.muted, fontSize:15 }}>⌕</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Internship, company, role bo'yicha qidiring..." style={{ width:"100%", border:`1px solid ${ui.line}`, borderRadius:999, padding:"14px 16px 14px 42px", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:ui.input, color:ui.text, boxShadow:ui.shadow }} />
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {["Barchasi","Remote","Ofis","Gibrid"].map(option=>(
                <motion.button key={option} whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={()=>setFilter(option)} style={{ background:filter===option ? `linear-gradient(135deg, ${C.accent}, ${C.accentHover})` : ui.panelAlt, color:filter===option ? "#fff" : ui.muted, border:`1px solid ${filter===option ? C.accent : ui.line}`, padding:"10px 16px", borderRadius:999, cursor:"pointer", fontSize:12, fontWeight:800, fontFamily:"inherit", boxShadow:filter===option ? "0 14px 28px rgba(37,99,235,0.22)" : "none" }}>
                  {option === "Barchasi" ? "All" : option}
                </motion.button>
              ))}
            </div>
          </div>
        </Card>
      </motion.section>

      <motion.section variants={staggerWrap} style={{ display:"grid", gap:16 }}>
        <motion.div variants={fadeUp} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:24, fontWeight:800, color:ui.text, letterSpacing:"-0.03em" }}>Internships for you</div>
            <div style={{ color:ui.muted, fontSize:13 }}>{filtered.length} ta mos e'lon topildi</div>
          </div>
          <div style={{ color:ui.muted, fontSize:13, fontWeight:700 }}>Updated in real time</div>
        </motion.div>

        {loading
          ? Array.from({ length: 3 }).map((_, index) => <motion.div key={index} variants={fadeUp}><LoadingCard /></motion.div>)
          : filtered.length===0
            ? <Empty title="Hech narsa topilmadi" sub="Qidiruv yoki filtrlarni o'zgartirib ko'ring" />
            : filtered.map((item, index) => (
                <InternshipSpotlightCard
                  key={item.id}
                  item={item}
                  userId={userId}
                  theme={theme}
                  applied={Boolean(appStatuses[item.id])}
                  onApplied={(internshipId, status) => setAppStatuses(prev => ({ ...prev, [internshipId]: status }))}
                  saved={savedIds.includes(item.id)}
                  onToggleSave={() => {
                    const isSaved = savedIds.includes(item.id);
                    setSavedIds(prev => isSaved ? prev.filter(id => id !== item.id) : [...prev, item.id]);
                    onToast?.(isSaved ? "Saqlanganlar ro'yxatidan olib tashlandi" : "Internship saqlandi");
                  }}
                  onToast={onToast}
                  highlight={index < 2 ? "Top" : "New"}
                />
              ))
        }
      </motion.section>
    </motion.div>
  );
}

function StudentApplicationsPremium({ userId, theme }) {
  const ui = getDashboardTheme(theme);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from("applications").select("*, internships(role,company_name,company_logo,duration,type)").eq("student_id", userId).order("created_at", { ascending:false });
        setApps(data || []);
      } catch {}
      setLoading(false);
    })();
  }, [userId]);

  const summary = [
    { label:"Pending", value:apps.filter(app => !app.status || app.status === "pending").length, tone:C.gold },
    { label:"Accepted", value:apps.filter(app => app.status === "accepted").length, tone:C.green },
    { label:"Rejected", value:apps.filter(app => app.status === "rejected").length, tone:C.red },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerWrap} style={{ display:"grid", gap:18 }}>
      <motion.div variants={fadeUp} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:14 }}>
        {summary.map(stat => (
          <Card key={stat.label} style={{ background:ui.panel, border:`1px solid ${ui.line}`, padding:18 }}>
            <div style={{ color:stat.tone, fontSize:28, fontWeight:800, marginBottom:6 }}>{stat.value}</div>
            <div style={{ color:ui.muted, fontSize:13, fontWeight:700 }}>{stat.label}</div>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card style={{ background:ui.panel, border:`1px solid ${ui.line}`, padding:18 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, marginBottom:16, flexWrap:"wrap" }}>
            <div>
              <div style={{ fontSize:24, fontWeight:800, color:ui.text, letterSpacing:"-0.03em" }}>Applications tracker</div>
              <div style={{ fontSize:13, color:ui.muted }}>{apps.length} ta ariza kuzatilmoqda</div>
            </div>
            <div style={{ fontSize:12, color:ui.muted, fontWeight:700 }}>Status updates live</div>
          </div>

          {loading
            ? Array.from({ length: 3 }).map((_, index) => <LoadingCard key={index} />)
            : apps.length===0
              ? <Empty title="Hali ariza yo'q" sub="Mos internship topilgach shu yerda statuslarni kuzatasiz" />
              : (
                <motion.div variants={staggerWrap} initial="hidden" animate="visible" style={{ display:"grid", gap:14 }}>
                  {apps.map(app => (
                    <motion.div key={app.id} variants={fadeUp}>
                      <Card style={{ background:ui.panelAlt, border:`1px solid ${ui.line}`, padding:18 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
                          <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                            <div style={{ width:52, height:52, borderRadius:16, background:theme === "dark" ? "rgba(37,99,235,0.16)" : "linear-gradient(135deg, #eff6ff, #dbeafe)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>
                              {app.internships?.company_logo || "🏢"}
                            </div>
                            <div>
                              <div style={{ color:ui.text, fontWeight:800, fontSize:17 }}>{app.internships?.role || "Internship"}</div>
                              <div style={{ color:ui.muted, fontSize:13 }}>{app.internships?.company_name || "Company"} · {app.internships?.type || "Remote"}</div>
                            </div>
                          </div>
                          <StatusBadge status={app.status || "pending"} />
                        </div>
                        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:14 }}>
                          {app.internships?.duration && <Badge text={`⏱ ${app.internships.duration}`} color={C.muted} />}
                          {app.internships?.type && <Badge text={app.internships.type} color={C.accent} />}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
        </Card>
      </motion.div>
    </motion.div>
  );
}

function StudentProfilePremium({ profile, onUpdate, theme, onToast }) {
  const ui = getDashboardTheme(theme);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name:profile?.full_name||"", phone:profile?.phone||"", about:profile?.about||"", university:profile?.university||"", faculty:profile?.faculty||"", year:profile?.year||"" });
  const [skills, setSkills] = useState(profile?.skills||[]);
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ full_name:profile?.full_name||"", phone:profile?.phone||"", about:profile?.about||"", university:profile?.university||"", faculty:profile?.faculty||"", year:profile?.year||"" });
    setSkills(profile?.skills || []);
  }, [profile]);

  const save = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({ ...form, skills }).eq("id", profile.id);
      if (!error) {
        onUpdate?.({ ...profile, ...form, skills });
        setEditing(false);
        onToast?.("Profil muvaffaqiyatli saqlandi");
      } else {
        onToast?.(`Saqlashda xato: ${error.message}`, "error");
      }
    } catch {
      onToast?.("Profilni saqlashda kutilmagan xato yuz berdi", "error");
    }
    setSaving(false);
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (skills.includes(newSkill.trim())) {
      onToast?.("Bu ko'nikma allaqachon qo'shilgan", "error");
      return;
    }
    setSkills([...skills, newSkill.trim()]);
    setNewSkill("");
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerWrap} style={{ display:"grid", gap:18 }}>
      <motion.div variants={fadeUp} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:18 }}>
        <Card style={{ background:ui.hero, border:`1px solid ${ui.line}`, padding:24 }}>
          <div style={{ width:78, height:78, borderRadius:"50%", background:"linear-gradient(135deg, #2563eb, #60a5fa)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, fontWeight:800, marginBottom:16 }}>{(profile?.full_name || "U")[0]}</div>
          <div style={{ fontSize:22, fontWeight:800, color:ui.text, marginBottom:4 }}>{profile?.full_name || "Student Name"}</div>
          <div style={{ color:ui.muted, fontSize:14, marginBottom:16 }}>{profile?.university || "Universitetingizni qo'shing"}</div>
          <div style={{ display:"grid", gap:10, marginBottom:18 }}>
            <div style={{ color:ui.muted, fontSize:13 }}>Faculty: <strong style={{ color:ui.text }}>{profile?.faculty || "—"}</strong></div>
            <div style={{ color:ui.muted, fontSize:13 }}>Year: <strong style={{ color:ui.text }}>{profile?.year || "—"}</strong></div>
            <div style={{ color:ui.muted, fontSize:13 }}>Phone: <strong style={{ color:ui.text }}>{profile?.phone || "—"}</strong></div>
          </div>
          <button onClick={() => onToast?.("Avatar upload UI tayyor. Storage ulansa real upload qo'shamiz.")} style={{ width:"100%", border:`1px solid ${ui.line}`, borderRadius:16, padding:"12px 14px", background:ui.panelAlt, color:ui.text, cursor:"pointer", fontWeight:700, fontFamily:"inherit" }}>
            Avatar upload
          </button>
        </Card>

        <Card style={{ background:ui.panel, border:`1px solid ${ui.line}`, padding:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", gap:12, alignItems:"center", flexWrap:"wrap", marginBottom:18 }}>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:ui.text }}>Profile workspace</div>
              <div style={{ color:ui.muted, fontSize:13 }}>Education, skills, summary va kontakt ma'lumotlarini boshqaring</div>
            </div>
            <Btn onClick={() => setEditing(prev => !prev)} color={editing ? C.muted : C.accent}>{editing ? "Cancel" : "Edit profile"}</Btn>
          </div>

          <div style={{ display:"grid", gap:16 }}>
            <div>
              <div style={{ color:ui.muted, fontSize:12, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>About</div>
              <div style={{ color:ui.text, fontSize:14, lineHeight:1.8 }}>{profile?.about || "O'zingiz haqingizda qisqacha professional summary qo'shing."}</div>
            </div>

            <div>
              <div style={{ color:ui.muted, fontSize:12, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Skills</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
                {skills.length ? skills.map(skill => (
                  <button key={skill} onClick={() => setSkills(skills.filter(item => item !== skill))} style={{ background:ui.badgeBg, color:C.accent, border:`1px solid ${ui.line}`, borderRadius:999, padding:"8px 12px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                    {skill} ×
                  </button>
                )) : <span style={{ color:ui.muted, fontSize:13 }}>Ko'nikmalar hali kiritilmagan</span>}
              </div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <input value={newSkill} onChange={e=>setNewSkill(e.target.value)} onKeyDown={e=>{ if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} placeholder="React, Excel, Copywriting..." style={{ flex:1, minWidth:220, border:`1px solid ${ui.line}`, borderRadius:16, padding:"12px 14px", background:ui.input, color:ui.text, outline:"none", fontFamily:"inherit" }} />
                <Btn onClick={addSkill} color={C.accent}>Add skill</Btn>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <AnimatePresence mode="wait">
        {editing && (
          <motion.div key="profile-editor" variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
            <Card style={{ background:ui.panel, border:`1px solid ${ui.line}`, padding:24 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:14, marginBottom:14 }}>
                <Input label="Ism Familiya" value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} />
                <Input label="Universitet" value={form.university} onChange={e=>setForm({...form, university:e.target.value})} />
                <Input label="Fakultet" value={form.faculty} onChange={e=>setForm({...form, faculty:e.target.value})} placeholder="Business Administration" />
                <Input label="Kurs" value={form.year} onChange={e=>setForm({...form, year:e.target.value})} placeholder="2" />
                <Input label="Telefon" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="+998 90 000 00 00" />
              </div>
              <Input label="Experience summary" value={form.about} onChange={e=>setForm({...form, about:e.target.value})} rows={4} placeholder="Qaysi yo'nalishda o'smoqchisiz, qaysi skills sizda kuchli..." />
              <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:10, flexWrap:"wrap" }}>
                <Btn outline onClick={() => setEditing(false)} color={C.muted}>Cancel</Btn>
                <Btn onClick={save} color={C.green} disabled={saving}>{saving ? "Saqlanmoqda..." : "Save changes"}</Btn>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StudentCVPremium({ profile, theme, onToast }) {
  const ui = getDashboardTheme(theme);
  const [exps, setExps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("preview");

  useEffect(() => {
    if (!profile?.id) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from("experiences").select("*").eq("student_id", profile.id);
        setExps(data || []);
      } catch {}
      setLoading(false);
    })();
  }, [profile]);

  const allSkills = [...new Set([...(profile?.skills || []), ...exps.flatMap(exp => exp.skills || [])])];
  const score = Math.min(100, (profile?.full_name ? 15 : 0) + (profile?.about ? 15 : 0) + (profile?.phone ? 10 : 0) + (profile?.university ? 10 : 0) + (allSkills.length > 0 ? 10 : 0) + exps.length * 20);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerWrap} style={{ display:"grid", gap:18 }}>
      <motion.div variants={fadeUp} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:18 }}>
        <Card style={{ background:ui.hero, border:`1px solid ${ui.line}`, padding:24 }}>
          <div style={{ color:C.accent, fontSize:12, fontWeight:800, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:10 }}>CV Builder</div>
          <div style={{ color:ui.text, fontSize:38, fontWeight:800, letterSpacing:"-0.05em", marginBottom:8 }}>{score}%</div>
          <div style={{ color:ui.muted, fontSize:14, marginBottom:16 }}>{score < 70 ? "Profilni to'ldiring va ko'proq tajriba qo'shing" : "CV juda kuchli ko'rinyapti"}</div>
          <div style={{ background:ui.soft, borderRadius:999, height:10, overflow:"hidden" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.6, ease: "easeOut" }} style={{ height:"100%", borderRadius:999, background:score >= 70 ? "linear-gradient(135deg, #10B981, #34D399)" : "linear-gradient(135deg, #F59E0B, #FBBF24)" }} />
          </div>
          <div style={{ display:"grid", gap:10, marginTop:18 }}>
            <Btn onClick={() => { window.print(); onToast?.("Print dialog ochildi. PDF qilib saqlashingiz mumkin."); }} color={C.accent}>Download PDF</Btn>
            <Btn outline color={C.muted} onClick={() => setTab("preview")}>Live preview</Btn>
          </div>
        </Card>

        <Card style={{ background:ui.panel, border:`1px solid ${ui.line}`, padding:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", gap:12, alignItems:"center", flexWrap:"wrap", marginBottom:16 }}>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:ui.text }}>CV sections</div>
              <div style={{ color:ui.muted, fontSize:13 }}>Preview, experience va recommendation bloklari bitta joyda</div>
            </div>
            <div style={{ display:"flex", background:ui.panelAlt, borderRadius:18, padding:4, border:`1px solid ${ui.line}`, gap:4, flexWrap:"wrap" }}>
              {[["preview","Preview"],["experience","Experience"],["recs","Recommendations"]].map(([id, label]) => (
                <motion.button key={id} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} onClick={()=>setTab(id)} style={{ background:tab===id ? `linear-gradient(135deg, ${C.accent}, ${C.accentHover})` : "transparent", color:tab===id ? "#fff" : ui.muted, border:"none", borderRadius:14, padding:"10px 14px", cursor:"pointer", fontSize:12, fontWeight:800, fontFamily:"inherit" }}>
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          {loading && <Spinner />}

          {!loading && tab==="preview" && (
            <motion.div variants={fadeUp} style={{ display:"grid", gap:18 }}>
              <div style={{ borderRadius:24, overflow:"hidden", border:`1px solid ${ui.line}`, background:theme === "dark" ? "linear-gradient(180deg, rgba(37,99,235,0.22), rgba(15,23,42,0.96))" : "linear-gradient(180deg, #eff6ff, #ffffff)" }}>
                <div style={{ padding:24 }}>
                  <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:16 }}>
                    <div style={{ width:54, height:54, borderRadius:"50%", background:"linear-gradient(135deg, #2563eb, #60a5fa)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800 }}>{(profile?.full_name || "U")[0]}</div>
                    <div>
                      <div style={{ color:ui.text, fontWeight:800, fontSize:18 }}>{profile?.full_name || "Student Name"}</div>
                      <div style={{ color:ui.muted, fontSize:13 }}>{profile?.university || "Universitetingiz"}</div>
                    </div>
                  </div>
                  {profile?.about && <p style={{ margin:"0 0 18px", color:ui.muted, fontSize:14, lineHeight:1.8 }}>{profile.about}</p>}
                  <div style={{ display:"grid", gap:16 }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:800, color:ui.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 }}>Skills</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{allSkills.length ? allSkills.map(skill => <Badge key={skill} text={skill} color={C.accent} />) : <span style={{ color:ui.muted, fontSize:13 }}>Skills hali qo'shilmagan</span>}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:11, fontWeight:800, color:ui.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 }}>Experience</div>
                      {exps.length ? exps.map(exp => (
                        <div key={exp.id} style={{ padding:"0 0 12px", marginBottom:12, borderBottom:`1px solid ${ui.line}` }}>
                          <div style={{ fontWeight:800, color:ui.text, marginBottom:4 }}>{exp.role}</div>
                          <div style={{ color:ui.muted, fontSize:13, marginBottom:8 }}>{exp.company_name} · {exp.period}</div>
                          {exp.tasks?.map((task, index) => <div key={index} style={{ color:ui.muted, fontSize:13, marginBottom:4 }}>• {task}</div>)}
                        </div>
                      )) : <span style={{ color:ui.muted, fontSize:13 }}>Experience bo'limi internship tugagach to'ldiriladi.</span>}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {!loading && tab==="experience" && (
            <motion.div variants={staggerWrap} initial="hidden" animate="visible" style={{ display:"grid", gap:14 }}>
              <div style={{ background:ui.blueSoft, border:`1px solid ${ui.line}`, borderRadius:18, padding:"12px 14px", color:ui.muted, fontSize:13, lineHeight:1.7 }}>Tajriba bo'limi internship yakunlangach avtomatik boyib boradi. Hozirgi UI live preview uchun tayyor.</div>
              {exps.length===0
                ? <Empty title="Hali tajriba yo'q" sub="Birinchi internship yakunlangach shu yerda project va resultlar ko'rinadi" />
                : exps.map(exp => (
                    <motion.div key={exp.id} variants={fadeUp}>
                      <Card style={{ background:ui.panelAlt, border:`1px solid ${ui.line}`, padding:18 }}>
                        <div style={{ fontWeight:800, fontSize:16, color:ui.text, marginBottom:4 }}>{exp.role}</div>
                        <div style={{ color:ui.muted, fontSize:13, marginBottom:10 }}>{exp.company_name} · {exp.period}</div>
                        {exp.tasks?.map((task, index) => <div key={index} style={{ color:ui.muted, fontSize:13, marginBottom:4 }}>→ {task}</div>)}
                      </Card>
                    </motion.div>
                  ))}
            </motion.div>
          )}

          {!loading && tab==="recs" && (
            <motion.div variants={staggerWrap} initial="hidden" animate="visible" style={{ display:"grid", gap:14 }}>
              {exps.filter(exp => exp.recommendation).length===0
                ? <Empty title="Tavsiyalar hali yo'q" sub="Accepted internships tugagach kompaniya feedback va recommendation qoldiradi" />
                : exps.filter(exp => exp.recommendation).map(exp => (
                    <motion.div key={exp.id} variants={fadeUp}>
                      <Card style={{ background:ui.panelAlt, border:`1px solid ${ui.line}`, padding:18 }}>
                        <div style={{ fontWeight:800, fontSize:16, color:ui.text, marginBottom:6 }}>{exp.company_name}</div>
                        <div style={{ background:theme === "dark" ? "rgba(245,158,11,0.08)" : "rgba(255,251,235,0.9)", borderLeft:`3px solid ${C.gold}`, borderRadius:14, padding:"14px 16px", marginBottom:10 }}>
                          <p style={{ margin:0, color:ui.text, lineHeight:1.8, fontSize:14, fontStyle:"italic" }}>"{exp.recommendation}"</p>
                        </div>
                        <div style={{ color:ui.muted, fontSize:12, fontWeight:700 }}>— {exp.reviewer_name || "Reviewer"}</div>
                      </Card>
                    </motion.div>
                  ))}
            </motion.div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}

function StudentWorkspace({ page, setPage, profile, theme, children }) {
  const ui = getDashboardTheme(theme);
  const navItems = [
    { id:"home", label:"Internships", icon:"◫", desc:"Explore roles" },
    { id:"my_applications", label:"Applications", icon:"↗", desc:"Track status" },
    { id:"profile", label:"Profile", icon:"◌", desc:"Update details" },
    { id:"resume", label:"CV Builder", icon:"▣", desc:"Preview CV" },
  ];
  const active = navItems.find(item => item.id === page) || navItems[0];

  return (
    <div style={{ width:"100%" }}>
      <style>{`
        @keyframes dashSkeleton {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .student-workspace {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 22px;
          align-items: start;
        }
        .student-sidebar {
          position: sticky;
          top: 96px;
        }
        .student-mobile-tabs {
          display: none;
        }
        @media (max-width: 980px) {
          .student-workspace {
            grid-template-columns: 1fr;
          }
          .student-sidebar {
            display: none;
          }
          .student-mobile-tabs {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding-bottom: 4px;
            margin-bottom: 16px;
          }
        }
      `}</style>

      <div className="student-mobile-tabs">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setPage(item.id)} style={{ background:page===item.id ? `linear-gradient(135deg, ${C.accent}, ${C.accentHover})` : ui.panelAlt, color:page===item.id ? "#fff" : ui.muted, border:`1px solid ${page===item.id ? C.accent : ui.line}`, borderRadius:999, padding:"10px 14px", whiteSpace:"nowrap", fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="student-workspace">
        <aside className="student-sidebar">
          <Card style={{ background:ui.panel, border:`1px solid ${ui.line}`, padding:20 }}>
            <div style={{ marginBottom:18 }}>
              <div style={{ color:C.accent, fontSize:12, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:8 }}>Workspace</div>
              <div style={{ color:ui.text, fontSize:24, fontWeight:800, letterSpacing:"-0.04em" }}>Talaba Dashboard</div>
              <div style={{ color:ui.muted, fontSize:13, lineHeight:1.7, marginTop:8 }}>{profile?.full_name?.split(" ")[0] || "Student"}, daily workflow for internships, applications, profile, and CV.</div>
            </div>
            <div style={{ display:"grid", gap:8 }}>
              {navItems.map(item => (
                <motion.button key={item.id} whileHover={{ x: 4 }} whileTap={{ scale: 0.99 }} onClick={() => setPage(item.id)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, width:"100%", border:`1px solid ${page===item.id ? C.accent : ui.line}`, background:page===item.id ? `linear-gradient(135deg, ${C.accent}, ${C.accentHover})` : ui.panelAlt, color:page===item.id ? "#fff" : ui.text, padding:"14px 16px", borderRadius:18, cursor:"pointer", textAlign:"left", fontFamily:"inherit", boxShadow:page===item.id ? "0 14px 28px rgba(37,99,235,0.22)" : "none" }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:800 }}>{item.label}</div>
                    <div style={{ fontSize:11, color:page===item.id ? "rgba(255,255,255,0.78)" : ui.muted }}>{item.desc}</div>
                  </div>
                  <div style={{ fontSize:18, fontWeight:800 }}>{item.icon}</div>
                </motion.button>
              ))}
            </div>
          </Card>
        </aside>

        <main style={{ minWidth:0 }}>
          <motion.div key={page} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.26, ease:"easeOut" }} style={{ display:"grid", gap:18 }}>
            <Card style={{ background:ui.panel, border:`1px solid ${ui.line}`, padding:"18px 20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", gap:12, alignItems:"center", flexWrap:"wrap" }}>
                <div>
                  <div style={{ color:ui.muted, fontSize:12, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:6 }}>Current section</div>
                  <div style={{ color:ui.text, fontSize:28, fontWeight:800, letterSpacing:"-0.04em" }}>{active.label}</div>
                </div>
                <div style={{ padding:"10px 14px", borderRadius:16, background:ui.panelAlt, border:`1px solid ${ui.line}`, color:ui.muted, fontSize:12, fontWeight:700 }}>{active.desc}</div>
              </div>
            </Card>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function CompanyHome({ profile }) {
  const [stats, setStats] = useState({ internships:0, applications:0, accepted:0 });
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    if(!profile?.id){setLoading(false);return;}
    (async()=>{
      setLoading(true);
      try {
        const { data:int } = await supabase.from("internships").select("id").eq("company_id",profile.id);
        const ids = (int||[]).map(i=>i.id);
        let apps=[], acc=0;
        if(ids.length){
          const { data } = await supabase.from("applications").select("id,status").in("internship_id",ids);
          apps = data||[];
          acc = apps.filter(a=>a.status==="accepted").length;
        }
        setStats({ internships:int?.length||0, applications:apps.length, accepted:acc });
      } catch {}
      setLoading(false);
    })();
  },[profile]);

  return (
    <div style={{ padding:"16px 0" }}>
      <Card style={{ background:"linear-gradient(135deg,#C45C2E,#F59E0B)",border:"none",marginBottom:16,padding:22 }}>
        <div style={{ color:"#fff",fontWeight:700,fontSize:17,marginBottom:4 }}>Tadbirkor Panel</div>
        <div style={{ color:"rgba(255,255,255,0.75)",fontSize:13 }}>{profile?.company_name||profile?.full_name}</div>
      </Card>
      {loading ? <Spinner /> : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16 }}>
          {[{l:"E'lonlar",v:stats.internships,c:C.accent},{l:"Arizalar",v:stats.applications,c:C.gold},{l:"Qabul",v:stats.accepted,c:C.green}].map(s=>(
            <Card key={s.l} style={{ textAlign:"center",padding:14 }}>
              <div style={{ fontWeight:800,fontSize:22,color:s.c,marginBottom:3 }}>{s.v}</div>
              <div style={{ fontSize:11,color:C.muted }}>{s.l}</div>
            </Card>
          ))}
        </div>
      )}
      <Card>
        <div style={{ fontWeight:600,fontSize:14,marginBottom:8,color:C.primary }}>Qo'llanma</div>
        {["E'lonlar — yangi amaliyot joylang","Arizalar — talabalarni ko'ring va qabul qiling"].map((t,i)=>(
          <div key={i} style={{ display:"flex",gap:8,alignItems:"center",padding:"8px 0",borderBottom:i===0?`1px solid ${C.border}`:"none" }}>
            <div style={{ width:6,height:6,borderRadius:"50%",background:C.accent,flexShrink:0 }} />
            <span style={{ fontSize:13,color:C.muted }}>{t}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── COMPANY: E'LONLAR ────────────────────────────────────────────────────────
function CompanyInternships({ profile }) {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ role:"", description:"", skills:"", duration:"", type:"Ofis" });
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    if(!profile?.id){setLoading(false);return;}
    setLoading(true);
    try {
      const { data } = await supabase.from("internships").select("*").eq("company_id",profile.id).order("created_at",{ascending:false});
      setItems(data||[]);
    } catch {}
    setLoading(false);
  }, [profile?.id]);

  useEffect(()=>{ load(); },[load]);

  const post = async () => {
    if(!form.role.trim()||!profile?.id) return;
    setPosting(true);
    try {
      const { error } = await supabase.from("internships").insert({
        company_id: profile.id,
        company_name: profile.company_name||profile.full_name,
        company_logo: "🏢",
        role: form.role,
        description: form.description,
        skills: form.skills.split(",").map(s=>s.trim()).filter(Boolean),
        duration: form.duration,
        type: form.type,
        is_active: true,
      });
      if (error) { alert("E'lon joylashda xato: " + error.message); }
      else {
        setForm({ role:"", description:"", skills:"", duration:"", type:"Ofis" });
        setShowForm(false);
        await load();
      }
    } catch (err) { alert("Xato: " + err.message); }
    setPosting(false);
  };

  const toggle = async (id, cur) => {
    const { error } = await supabase.from("internships").update({ is_active:!cur }).eq("id",id);
    if (!error) await load();
  };

  const f = k => ({ value:form[k], onChange:e=>setForm({...form,[k]:e.target.value}) });

  return (
    <div style={{ padding:"16px 0" }}>
      <SectionHeader title="E'lonlarim" sub={`${items.length} ta amaliyot`} />
      <Btn full onClick={()=>setShowForm(!showForm)} color={showForm?C.muted:C.accent} style={{ marginBottom:12 }}>
        {showForm?"Bekor":"+ Yangi amaliyot"}
      </Btn>
      {showForm && (
        <Card style={{ marginBottom:12,border:`1.5px solid ${C.accent}` }}>
          <h4 style={{ margin:"0 0 14px",fontWeight:700,fontSize:14 }}>Yangi amaliyot</h4>
          <Input label="Lavozim *" {...f("role")} placeholder="Marketing Intern" />
          <Input label="Tavsif" {...f("description")} placeholder="Qisqacha tavsif..." rows={3} />
          <Input label="Ko'nikmalar (vergul bilan)" {...f("skills")} placeholder="SMM, Canva, Content" />
          <Input label="Davomiyligi" {...f("duration")} placeholder="2 oy" />
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12,fontWeight:600,display:"block",marginBottom:4,color:C.primary }}>Ish turi</label>
            <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{ width:"100%",border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 12px",fontSize:13,outline:"none",fontFamily:"inherit",background:"rgba(255,255,255,0.92)",boxShadow:C.shadow }}>
              {["Ofis","Remote","Gibrid"].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <Btn full onClick={post} color={C.green} disabled={posting||!form.role}>
            {posting?"Joylashtirilmoqda...":"Joylashtirish"}
          </Btn>
        </Card>
      )}
      {loading ? <Spinner /> : items.length===0&&!showForm
        ? <Empty title="Hali e'lon yo'q" sub="Birinchi amaliyotingizni joylashtiring" />
        : items.map(item=>(
          <Card key={item.id} style={{ marginBottom:10 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
              <div>
                <div style={{ fontWeight:700,fontSize:14,color:C.primary }}>{item.role}</div>
                <div style={{ fontSize:12,color:C.muted }}>{item.type} · {item.duration}</div>
              </div>
              <span style={{ fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:20,background:item.is_active?C.green+"18":C.red+"18",color:item.is_active?C.green:C.red }}>
                {item.is_active?"Faol":"To'xtatildi"}
              </span>
            </div>
            {item.description && <div style={{ fontSize:12,color:C.muted,marginBottom:8,lineHeight:1.5 }}>{item.description}</div>}
            <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:10 }}>
              {(item.skills||[]).map(s=><Badge key={s} text={s} color="#6366F1" />)}
            </div>
            <Btn small onClick={()=>toggle(item.id,item.is_active)} color={item.is_active?C.muted:C.green} outline>
              {item.is_active?"To'xtatish":"Faollashtirish"}
            </Btn>
          </Card>
        ))
      }
    </div>
  );
}

// ─── COMPANY: ARIZALAR ────────────────────────────────────────────────────────
function CompanyApplications({ profile }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const load = useCallback(async () => {
    if (!profile?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      // 1. Bu tadbirkorning barcha internship ID lari
      const { data:int, error:intErr } = await supabase
        .from("internships")
        .select("id,role")
        .eq("company_id", profile.id);

      if (intErr) {
        console.error("Internships xato:", intErr.message);
        setLoading(false);
        return;
      }

      if (!int?.length) {
        // E'lon yo'q — ariza ham bo'lmaydi
        setApplications([]);
        setLoading(false);
        return;
      }

      const ids = int.map(i => i.id);

      // 2. Shu internship larga kelgan arizalar
      const { data, error:appErr } = await supabase
        .from("applications")
        .select(`
          id, status, created_at,
          internship_id, student_id,
          internships ( role, duration, type ),
          profiles ( full_name, university, phone, skills, about, faculty, year )
        `)
        .in("internship_id", ids)
        .order("created_at", { ascending: false });

      if (appErr) {
        console.error("Applications xato:", appErr.message, "Kod:", appErr.code);
        // RLS xatosi bo'lishi mumkin
        alert("Arizalarni yuklashda xato: " + appErr.message + "\n\nSupabase RLS policy kerak bo'lishi mumkin.");
      } else {
        setApplications(data || []);
      }
    } catch (err) {
      console.error("Umumiy xato:", err);
    }
    setLoading(false);
  }, [profile?.id]);

  useEffect(()=>{ load(); },[load]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      const { error } = await supabase.from("applications").update({ status }).eq("id",id);
      if (!error) {
        setApplications(prev=>prev.map(a=>a.id===id?{...a,status}:a));
        if(selected?.id===id) setSelected(prev=>({...prev,status}));
      }
    } catch {}
    setUpdating(null);
  };

  const filtered = applications.filter(a=>filterStatus==="all"||(a.status||"pending")===filterStatus);

  if (selected) {
    const p = selected.profiles;
    return (
      <div style={{ padding:"16px 0" }}>
        <button onClick={()=>setSelected(null)} style={{ background:"none",border:"none",color:C.accent,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginBottom:14,padding:0 }}>← Orqaga</button>
        <Card style={{ marginBottom:12 }}>
          <div style={{ display:"flex",gap:12,alignItems:"center",marginBottom:14 }}>
            <div style={{ width:52,height:52,background:C.accent+"20",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:C.accent,fontWeight:700 }}>
              {(p?.full_name||"T")[0]}
            </div>
            <div>
              <div style={{ fontWeight:700,fontSize:16,color:C.primary }}>{p?.full_name||"Ism yo'q"}</div>
              <div style={{ color:C.muted,fontSize:13 }}>{p?.university||"—"}</div>
              {p?.faculty && <div style={{ color:C.muted,fontSize:12 }}>{p.faculty}{p?.year&&` · ${p.year}-kurs`}</div>}
            </div>
          </div>
          <div style={{ borderTop:`1px solid ${C.border}`,paddingTop:12,marginBottom:12 }}>
            <div style={{ fontSize:13,color:C.muted,marginBottom:4 }}>Lavozim: <strong style={{ color:C.primary }}>{selected.internships?.role}</strong></div>
            <div style={{ fontSize:13,color:C.muted,marginBottom:4 }}>{selected.internships?.type} · {selected.internships?.duration}</div>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:8 }}>
              <span style={{ fontSize:12,color:C.muted }}>Holat:</span>
              <StatusBadge status={selected.status||"pending"} />
            </div>
          </div>
          {p?.about && <div style={{ borderTop:`1px solid ${C.border}`,paddingTop:12,marginBottom:12 }}><div style={{ fontWeight:600,fontSize:13,marginBottom:6,color:C.primary }}>O'zi haqida:</div><div style={{ fontSize:13,color:C.muted,lineHeight:1.6 }}>{p.about}</div></div>}
          {p?.skills?.length>0 && <div style={{ borderTop:`1px solid ${C.border}`,paddingTop:12,marginBottom:12 }}><div style={{ fontWeight:600,fontSize:13,marginBottom:8,color:C.primary }}>Ko'nikmalar:</div><div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>{p.skills.map(s=><Badge key={s} text={s} color={C.accent} />)}</div></div>}
          {p?.phone && <div style={{ borderTop:`1px solid ${C.border}`,paddingTop:12,marginBottom:12 }}><div style={{ fontSize:13,color:C.muted }}>Telefon: <strong style={{ color:C.primary }}>{p.phone}</strong></div></div>}
        </Card>
        {(!selected.status||selected.status==="pending") && (
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
            <Btn onClick={()=>updateStatus(selected.id,"accepted")} color={C.green} disabled={updating===selected.id}>{updating===selected.id?"...":"Qabul qilish"}</Btn>
            <Btn onClick={()=>updateStatus(selected.id,"rejected")} color={C.red} disabled={updating===selected.id}>{updating===selected.id?"...":"Rad etish"}</Btn>
          </div>
        )}
        {selected.status==="accepted" && <div style={{ background:C.green+"15",border:`1px solid ${C.green}30`,borderRadius:10,padding:"12px 16px",textAlign:"center",color:C.green,fontWeight:600,fontSize:14 }}>Qabul qilingan</div>}
        {selected.status==="rejected" && <Btn full onClick={()=>updateStatus(selected.id,"pending")} color={C.muted} outline>Qayta ko'rib chiqish</Btn>}
      </div>
    );
  }

  return (
    <div style={{ padding:"16px 0" }}>
      <SectionHeader title="Arizalar" sub={`${applications.length} ta ariza`} />
      <div style={{ display:"flex",gap:6,marginBottom:14,flexWrap:"wrap" }}>
        {[["all","Barchasi"],["pending","Kutilmoqda"],["accepted","Qabul"],["rejected","Rad"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilterStatus(v)} style={{ background:filterStatus===v?`linear-gradient(135deg, ${C.accent}, ${C.accentHover})`:"rgba(255,255,255,0.88)",color:filterStatus===v?"#fff":C.muted,border:`1px solid ${filterStatus===v?C.accent:C.border}`,padding:"8px 14px",borderRadius:999,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",boxShadow:filterStatus===v ? "0 12px 26px rgba(37,99,235,0.22)" : C.shadow,transition:"all 0.25s ease" }}>{l}</button>
        ))}
      </div>
      {loading ? <Spinner /> : filtered.length===0
        ? <Empty title="Ariza yo'q" sub="Talabalar ariza berganda bu yerda ko'rinadi" />
        : filtered.map(app=>(
          <Card key={app.id} style={{ marginBottom:10 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
              <div style={{ display:"flex",gap:10,alignItems:"center" }}>
                <div style={{ width:40,height:40,background:C.accent+"20",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:C.accent,fontWeight:700 }}>
                  {(app.profiles?.full_name||"U")[0]}
                </div>
                <div>
                  <div style={{ fontWeight:700,fontSize:14,color:C.primary }}>{app.profiles?.full_name||"—"}</div>
                  <div style={{ fontSize:12,color:C.muted }}>{app.internships?.role} — {app.profiles?.university||"—"}</div>
                  <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>{app.profiles?.email||app.profiles?.university||"—"}</div>
                </div>
              </div>
              <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4 }}>
                <StatusBadge status={app.status||"pending"} />
                <span style={{ fontSize:10,color:C.muted }}>Batafsil →</span>
              </div>
            </div>
          </Card>
        ))
      }
    </div>
  );
}

// ─── ADMIN: FOYDALANUVCHILAR ──────────────────────────────────────────────────
function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase.from("profiles").select("*").order("created_at",{ascending:false});
        setUsers(data||[]);
      } catch {}
      setLoading(false);
    })();
  },[]);

  const filtered = users.filter(u=>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.university?.toLowerCase().includes(search.toLowerCase()) ||
    u.company_name?.toLowerCase().includes(search.toLowerCase())
  );
  const students = users.filter(u=>u.role!=="company");
  const companies = users.filter(u=>u.role==="company");

  return (
    <div style={{ padding:"16px 0" }}>
      <SectionHeader title="Foydalanuvchilar" sub={`${students.length} talaba · ${companies.length} tadbirkor`} />
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16 }}>
        {[{l:"Jami",v:users.length,c:C.accent},{l:"Talaba",v:students.length,c:C.green},{l:"Tadbirkor",v:companies.length,c:C.gold}].map(s=>(
          <Card key={s.l} style={{ textAlign:"center",padding:12 }}>
            <div style={{ fontWeight:800,fontSize:20,color:s.c }}>{s.v}</div>
            <div style={{ fontSize:11,color:C.muted }}>{s.l}</div>
          </Card>
        ))}
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ism, email yoki kompaniya..." style={{ width:"100%",border:`1px solid ${C.border}`,borderRadius:16,padding:"12px 14px",fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:14,background:"rgba(255,255,255,0.92)",boxShadow:C.shadow }} />
      {loading ? <Spinner /> : filtered.length===0
        ? <Empty title="Hech narsa topilmadi" />
        : filtered.map(u=>(
          <Card key={u.id} style={{ marginBottom:8 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div style={{ display:"flex",gap:10,alignItems:"center" }}>
                <div style={{ width:38,height:38,background:u.role==="company"?C.gold+"20":C.accent+"20",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:u.role==="company"?C.gold:C.accent,fontWeight:700 }}>
                  {(u.full_name||u.email||"U")[0]}
                </div>
                <div>
                  <div style={{ fontWeight:600,fontSize:13,color:C.primary }}>{u.full_name||"—"}</div>
                  <div style={{ fontSize:11,color:C.muted }}>{u.university||u.company_name||"—"}</div>
                  {u.email && <div style={{ fontSize:10,color:C.muted,marginTop:1 }}>{u.email}</div>}
                </div>
              </div>
              <Badge text={u.role==="company"?"Tadbirkor":"Talaba"} color={u.role==="company"?C.gold:C.accent} />
            </div>
          </Card>
        ))
      }
    </div>
  );
}

// ─── ADMIN: AMALIYOTLAR ───────────────────────────────────────────────────────
function AdminInternships() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data } = await supabase.from("internships").select("*").order("created_at",{ascending:false});
      setItems(data?.length ? data : MOCK_INTERNSHIPS);
    } catch { setItems(MOCK_INTERNSHIPS); }
    setLoading(false);
  };

  useEffect(()=>{ load(); },[]);

  const toggle = async (id, cur) => {
    const supabase = getSupabaseClient();
    await supabase.from("internships").update({ is_active:!cur }).eq("id",id);
    setItems(prev=>prev.map(i=>i.id===id?{...i,is_active:!cur}:i));
  };

  const remove = async (id) => {
    if(!window.confirm("O'chirishni tasdiqlaysizmi?")) return;
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("internships").delete().eq("id",id);
    if (!error) setItems(prev=>prev.filter(i=>i.id!==id));
    else alert("O'chirishda xato: " + error.message);
  };

  return (
    <div style={{ padding:"16px 0" }}>
      <SectionHeader title="Barcha amaliyotlar" sub={`${items.length} ta e'lon`} />
      {loading ? <Spinner /> : items.map(item=>(
        <Card key={item.id} style={{ marginBottom:10 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
            <div>
              <div style={{ fontWeight:700,fontSize:14,color:C.primary }}>{item.role}</div>
              <div style={{ fontSize:12,color:C.muted }}>{item.company_name} · {item.type}</div>
            </div>
            <span style={{ fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:20,background:item.is_active?C.green+"18":C.red+"18",color:item.is_active?C.green:C.red }}>
              {item.is_active?"Faol":"To'xtatildi"}
            </span>
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <Btn small onClick={()=>toggle(item.id,item.is_active)} color={item.is_active?C.muted:C.green} outline>
              {item.is_active?"To'xtatish":"Faollashtirish"}
            </Btn>
            <Btn small onClick={()=>remove(item.id)} color={C.red} outline>O'chirish</Btn>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── ADMIN: ARIZALAR ──────────────────────────────────────────────────────────
function AdminApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase.from("applications")
          .select("*, profiles(full_name,university,email), internships(role,company_name)")
          .order("created_at",{ascending:false});
        setApps(data||[]);
      } catch {}
      setLoading(false);
    })();
  },[]);

  const updateStatus = async (id, status) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("applications").update({ status }).eq("id",id);
    if (!error) setApps(prev=>prev.map(a=>a.id===id?{...a,status}:a));
  };

  const filtered = apps.filter(a=>filterStatus==="all"||(a.status||"pending")===filterStatus);
  const pending = apps.filter(a=>!a.status||a.status==="pending").length;
  const accepted = apps.filter(a=>a.status==="accepted").length;

  return (
    <div style={{ padding:"16px 0" }}>
      <SectionHeader title="Barcha arizalar" sub={`${apps.length} ta ariza`} />
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16 }}>
        {[{l:"Jami",v:apps.length,c:C.accent},{l:"Kutilmoqda",v:pending,c:C.gold},{l:"Qabul",v:accepted,c:C.green}].map(s=>(
          <Card key={s.l} style={{ textAlign:"center",padding:12 }}>
            <div style={{ fontWeight:800,fontSize:20,color:s.c }}>{s.v}</div>
            <div style={{ fontSize:11,color:C.muted }}>{s.l}</div>
          </Card>
        ))}
      </div>
      <div style={{ display:"flex",gap:6,marginBottom:14,flexWrap:"wrap" }}>
        {[["all","Barchasi"],["pending","Kutilmoqda"],["accepted","Qabul"],["rejected","Rad"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilterStatus(v)} style={{ background:filterStatus===v?`linear-gradient(135deg, ${C.accent}, ${C.accentHover})`:"rgba(255,255,255,0.88)",color:filterStatus===v?"#fff":C.muted,border:`1px solid ${filterStatus===v?C.accent:C.border}`,padding:"8px 14px",borderRadius:999,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",boxShadow:filterStatus===v ? "0 12px 26px rgba(37,99,235,0.22)" : C.shadow,transition:"all 0.25s ease" }}>{l}</button>
        ))}
      </div>
      {loading ? <Spinner /> : filtered.length===0
        ? <Empty title="Ariza yo'q" />
        : filtered.map(app=>(
          <Card key={app.id} style={{ marginBottom:10 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
              <div>
                <div style={{ fontWeight:700,fontSize:14,color:C.primary }}>{app.profiles?.full_name||"—"}</div>
                <div style={{ fontSize:12,color:C.muted }}>{app.internships?.role} — {app.profiles?.university||"—"}</div>
                <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>{app.profiles?.email||app.profiles?.university||"—"}</div>
              </div>
              <StatusBadge status={app.status||"pending"} />
            </div>
            {(!app.status||app.status==="pending") && (
              <div style={{ display:"flex",gap:8 }}>
                <Btn small onClick={()=>updateStatus(app.id,"accepted")} color={C.green}>Qabul</Btn>
                <Btn small onClick={()=>updateStatus(app.id,"rejected")} color={C.red}>Rad</Btn>
              </div>
            )}
          </Card>
        ))
      }
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const configError = getSupabaseConfigError();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState("home");
  const [authLoading, setAuthLoading] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [toast, setToast] = useState(null);
  const [appTheme, setAppTheme] = useState(() => {
    const saved = localStorage.getItem("landing-theme") || localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    localStorage.setItem("landing-theme", appTheme);
    localStorage.setItem("theme", appTheme);
    document.documentElement.setAttribute("data-landing-theme", appTheme);
    document.documentElement.classList.toggle("dark", appTheme === "dark");
  }, [appTheme]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const appIsDark = appTheme === "dark";
  const shell = appIsDark
    ? { bg:"#070c1b", text:"#e8efff", panel:"#0f1730", canvas:"radial-gradient(circle at top, rgba(37,99,235,0.18), transparent 34%), #070c1b" }
    : { bg:"#f8fafc", text:"#0f172a", panel:"#ffffff", canvas:"radial-gradient(circle at top left, rgba(191,219,254,0.72), transparent 26%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)" };

  // loadProfile — email ni auth.user dan olish (profiles da bo'lmasligi mumkin)
  const loadProfile = async (uid, userEmail) => {
    try {
      const supabase = getSupabaseClient();
      const { data } = await supabase.from("profiles").select("*").eq("id",uid).single();
      const email = userEmail || data?.email || "";
      const merged = data ? { ...data, email } : { id:uid, email, role:"student" };
      setProfile(merged);
      const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      if (isAdmin) setPage("admin_users");
      else if (merged.role==="company") setPage("company_home");
      else setPage("home");
    } catch {}
  };

  useEffect(()=>{
    if (configError) {
      setAuthLoading(false);
      return undefined;
    }

    // Parol tiklash havolasini tekshirish
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      setIsResetPassword(true);
      setAuthLoading(false);
      return;
    }

    // Joriy sessiya
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data:{ session } })=>{
      if (session?.user) { setUser(session.user); loadProfile(session.user.id, session.user.email); }
      setAuthLoading(false);
    });

    // Auth o'zgarishlarini kuzatish
    const { data:{ subscription } } = supabase.auth.onAuthStateChange((event, session)=>{
      if (event==="PASSWORD_RECOVERY") { setIsResetPassword(true); return; }
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id, session.user.email);
        setShowAuth(false);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const logout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setUser(null); setProfile(null); setPage("home"); setShowAuth(false);
    window.location.hash = "";
  };

  const showToast = (message, type="success") => {
    setToast({ id: Date.now(), message, type });
  };

  if (configError) return (
    <div style={{
      minHeight:"100vh",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      padding:"24px",
      background:"linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%)",
      fontFamily:"'DM Sans','Segoe UI',sans-serif",
      color:"#0f172a"
    }}>
      <div style={{
        width:"100%",
        maxWidth:620,
        background:"#fff",
        border:"1px solid rgba(37,99,235,0.14)",
        borderRadius:24,
        padding:"28px 24px",
        boxShadow:"0 24px 60px rgba(15,23,42,0.10)"
      }}>
        <div style={{ fontSize:28, fontWeight:800, marginBottom:8 }}>NatijaHub setup required</div>
        <div style={{ fontSize:14, lineHeight:1.6, color:"#475569", marginBottom:16 }}>
          This deployment is missing valid Supabase environment variables, so the app cannot start yet.
        </div>
        <div style={{
          background:"#eff6ff",
          border:"1px solid rgba(37,99,235,0.18)",
          color:"#1d4ed8",
          borderRadius:16,
          padding:"14px 16px",
          fontSize:14,
          fontWeight:700,
          marginBottom:16
        }}>
          {configError}
        </div>
        <div style={{ fontSize:13, color:"#64748b", lineHeight:1.7 }}>
          Add <code>REACT_APP_SUPABASE_URL</code> and <code>REACT_APP_SUPABASE_ANON_KEY</code> in Vercel Project Settings, then redeploy.
        </div>
      </div>
    </div>
  );

  // Loading
  if (authLoading) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:shell.bg }}>
      <Spinner />
    </div>
  );

  // Parol tiklash
  if (isResetPassword) return (
    <ResetPasswordScreen onDone={()=>{
      setIsResetPassword(false);
      window.location.hash = "";
      setAuthMode("login");
      setShowAuth(true);
    }} />
  );

  // Landing
  if (!user && !showAuth) return (
    <LandingPage
      onLogin={()=>{ setAuthMode("login"); setShowAuth(true); }}
      onRegister={()=>{ setAuthMode("register"); setShowAuth(true); }}
    />
  );

  // Auth
  if (showAuth) return (
    <AuthScreen
      initialMode={authMode}
      onAuth={u=>{ setUser(u); loadProfile(u.id, u.email); }}
      onBack={()=>setShowAuth(false)}
    />
  );

  const isAdmin = profile?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const role = profile?.role || "student";

  const renderPage = () => {
    if (isAdmin) {
      if (page==="admin_users") return <AdminUsers />;
      if (page==="admin_internships") return <AdminInternships />;
      if (page==="admin_applications") return <AdminApplications />;
      return <AdminUsers />;
    }
    if (role==="company") {
      if (page==="company_home") return <CompanyHome profile={profile} />;
      if (page==="company_internships") return <CompanyInternships profile={profile} />;
      if (page==="company_applications") return <CompanyApplications profile={profile} />;
      return <CompanyHome profile={profile} />;
    }
    if (page==="home") return <StudentHomePremium userId={user?.id} theme={appTheme} onToast={showToast} />;
    if (page==="my_applications") return <StudentApplicationsPremium userId={user?.id} theme={appTheme} />;
    if (page==="profile") return <StudentProfilePremium profile={profile} onUpdate={setProfile} theme={appTheme} onToast={showToast} />;
    if (page==="resume") return <StudentCVPremium profile={profile} theme={appTheme} onToast={showToast} />;
    return <StudentHomePremium userId={user?.id} theme={appTheme} onToast={showToast} />;
  };

  return (
    <AuthContext.Provider value={{ user, profile }}>
      <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:shell.canvas, minHeight:"100vh", color:shell.text, transition:"background 0.3s ease, color 0.3s ease" }}>
        <Navbar profile={profile} onLogout={logout} theme={appTheme} onToggleTheme={()=>setAppTheme(prev=>prev==="dark"?"light":"dark")} />
        <Toast toast={toast} />
        {role === "student" && !isAdmin ? (
          <div style={{ maxWidth:1320, margin:"0 auto", padding:"18px 16px 110px", transition:"background 0.3s ease" }}>
            <StudentWorkspace page={page} setPage={setPage} profile={profile} theme={appTheme}>
              {renderPage()}
            </StudentWorkspace>
          </div>
        ) : (
          <div style={{ maxWidth:560, margin:"0 auto", padding:"18px 16px 110px", transition:"background 0.3s ease" }}>
            {renderPage()}
          </div>
        )}
        <BottomNav page={page} setPage={setPage} role={role} isAdmin={isAdmin} theme={appTheme} />
      </div>
    </AuthContext.Provider>
  );
}
