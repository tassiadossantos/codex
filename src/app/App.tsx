import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Cloud,
  Brain,
  Server,
  Shield,
  Zap,
  Code2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Github,
  Linkedin,
  ChevronRight,
  Activity,
  Cpu,
  Lock,
} from "lucide-react";
import { supabase, isConfigured } from "../lib/supabase";
import type { LeadPayload, ProblemDetail, FormStatus } from "../lib/types";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:       "#06080F",
  panel:    "#0A0E1A",
  blue:     "#FF6B00",
  blueGlow: "rgba(255,107,0,0.15)",
  gold:     "#E8A020",
  goldGlow: "rgba(232,160,32,0.15)",
  red:      "#C41230",
  text:     "#C8DCF0",
  dim:      "rgba(200,220,240,0.45)",
  faint:    "rgba(200,220,240,0.12)",
  border:   "rgba(255,107,0,0.2)",
  borderG:  "rgba(232,160,32,0.25)",
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const TECH_ROW_A = ["TypeScript","React","Next.js","Tailwind CSS","React Router","React Hook Form","Framer Motion","Lucide React"];

const TECH_ROW_B = ["Recharts","Radix UI","shadcn/ui","Axios","React Query","Zustand","Zod","Vitest","GitHub Actions"];
const SERVICES = [
  { Icon: Server,  id:"01", color: C.blue, title:"Sistemas Enterprise",  sub:"CORE SYSTEMS",   desc:"Arquiteturas distribuídas tolerantes a falha. APIs que escalam horizontalmente. Clean Architecture, DDD e CQRS como padrão, não exceção.", tags:["Microserviços","Event-Driven","CQRS","DDD"] },
  { Icon: Cloud,   id:"02", color: C.gold, title:"Arquitetura Cloud",     sub:"CLOUD OPS",      desc:"Infraestrutura como código, do zero ao multi-region. Container orchestration, CI/CD pipelines, observabilidade e zero-downtime deployments.", tags:["AWS / GCP","Kubernetes","Terraform","GitOps"] },
  { Icon: Brain,   id:"03", color: C.blue, title:"Engenharia de IA",      sub:"AI DIVISION",    desc:"LLMs em produção com RAG, fine-tuning e guardrails. Pipelines de dados escaláveis. IA que resolve problemas reais, não demos de laboratório.", tags:["LLMs / RAG","MLOps","Vector DBs","Guardrails"] },
];

const METHODOLOGY = [
  { step:"01", icon: Cpu,      title:"DISCOVERY",    body:"Mapeamos domínio técnico e de negócio. Identificamos gargalos e oportunidades. Saída: ADR fundamentado." },
  { step:"02", icon: Code2,    title:"ARCHITECTURE", body:"Diagramas C4, contratos de API, modelo de dados, fluxos críticos. Zero ambiguidade antes da primeira linha." },
  { step:"03", icon: Activity, title:"ENGINEERING",  body:"Sprints quinzenais, code review obrigatório, cobertura >80%, CI/CD desde o dia zero. Sem dívida acumulada." },
  { step:"04", icon: Shield,   title:"DEPLOYMENT",   body:"Rollback automatizado, SLOs definidos, alertas ativos e runbooks documentados. Sistema vivo, não artefato." },
];

// ─── HUD Primitives ───────────────────────────────────────────────────────────

/** Bracket corners drawn in SVG — Tony Stark corner-piece */
function Brackets({ size = 16, color = C.blue, className = "" }: { size?: number; color?: string; className?: string }) {
  const s = `${size}px`;
  const t = 2;
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* TL */}
      <svg style={{ position:"absolute", top:0, left:0, width:s, height:s }} viewBox={`0 0 ${size} ${size}`}>
        <path d={`M0 ${size} L0 0 L${size} 0`} fill="none" stroke={color} strokeWidth={t} />
      </svg>
      {/* TR */}
      <svg style={{ position:"absolute", top:0, right:0, width:s, height:s }} viewBox={`0 0 ${size} ${size}`}>
        <path d={`M0 0 L${size} 0 L${size} ${size}`} fill="none" stroke={color} strokeWidth={t} />
      </svg>
      {/* BL */}
      <svg style={{ position:"absolute", bottom:0, left:0, width:s, height:s }} viewBox={`0 0 ${size} ${size}`}>
        <path d={`M${size} ${size} L0 ${size} L0 0`} fill="none" stroke={color} strokeWidth={t} />
      </svg>
      {/* BR */}
      <svg style={{ position:"absolute", bottom:0, right:0, width:s, height:s }} viewBox={`0 0 ${size} ${size}`}>
        <path d={`M0 ${size} L${size} ${size} L${size} 0`} fill="none" stroke={color} strokeWidth={t} />
      </svg>
    </div>
  );
}

function HudLabel({ children, color = C.blue }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 text-xs tracking-widest uppercase"
      style={{ fontFamily:"'Share Tech Mono', monospace", color }}
    >
      <span style={{ display:"inline-block", width:6, height:6, backgroundColor:color, boxShadow:`0 0 6px ${color}` }} />
      {children}
    </span>
  );
}

function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin:"-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity:0, y:24 }} animate={inView ? { opacity:1, y:0 } : {}}
      transition={{ duration:0.7, delay, ease:[0.16,1,0.3,1] }} className={className}>
      {children}
    </motion.div>
  );
}

// Thin scanline that sweeps top→bottom on mount
function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 pointer-events-none z-10"
      style={{ height:1, background:`linear-gradient(90deg, transparent, ${C.blue}, transparent)`, opacity:0.6 }}
      initial={{ top:0, opacity:0.6 }}
      animate={{ top:"100%", opacity:0 }}
      transition={{ duration:2.2, ease:"linear", delay:0.3 }}
    />
  );
}

// Arc-reactor ring
function ArcReactor({ size = 160, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width:size, height:size }}>
      {/* Outer ring */}
      <motion.div
        className="absolute rounded-full"
        style={{ inset:0, border:`1px solid ${C.blue}`, boxShadow:`0 0 20px ${C.blue}40, inset 0 0 20px ${C.blue}20` }}
        animate={{ rotate:360 }}
        transition={{ duration:12, repeat:Infinity, ease:"linear" }}
      />
      {/* Mid ring */}
      <motion.div
        className="absolute rounded-full"
        style={{ inset:size*0.12, border:`1px solid ${C.gold}`, boxShadow:`0 0 10px ${C.gold}50` }}
        animate={{ rotate:-360 }}
        transition={{ duration:7, repeat:Infinity, ease:"linear" }}
      />
      {/* Inner ring */}
      <motion.div
        className="absolute rounded-full"
        style={{ inset:size*0.26, border:`2px solid ${C.blue}`, boxShadow:`0 0 16px ${C.blue}` }}
        animate={{ rotate:360 }}
        transition={{ duration:4, repeat:Infinity, ease:"linear" }}
      />
      {/* Core */}
      <div
        className="rounded-full"
        style={{
          width:size*0.28, height:size*0.28,
          background:`radial-gradient(circle, #fff 0%, ${C.blue} 40%, ${C.blue}80 70%, transparent 100%)`,
          boxShadow:`0 0 30px ${C.blue}, 0 0 60px ${C.blue}60`,
        }}
      />
      {/* Tri-blades */}
      {[0,120,240].map((deg) => (
        <div
          key={deg}
          className="absolute"
          style={{
            width:size*0.04, height:size*0.34,
            top:"50%", left:"50%",
            transform:`translate(-50%,-50%) rotate(${deg}deg)`,
            background:`linear-gradient(to bottom, transparent, ${C.blue}, transparent)`,
            opacity:0.7,
          }}
        />
      ))}
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h, { passive:true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { label:"Sistemas", href:"#servicos" },
    { label:"Stack",    href:"#stack" },
    { label:"Missão",   href:"#metodologia" },
    { label:"Contato",  href:"#contato" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "rgba(6,8,15,0.92)" : "transparent",
        backdropFilter:  scrolled ? "blur(12px)" : "none",
        borderBottom:    scrolled ? `1px solid ${C.border}` : "none",
      }}>
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex items-center justify-center"
            style={{ border:`1px solid ${C.blue}`, boxShadow:`0 0 8px ${C.blue}40` }}>
            <span style={{ fontFamily:"'Orbitron', sans-serif", fontSize:"0.6rem", fontWeight:900, color:C.blue }}>CX</span>
            <Brackets size={6} color={C.gold} />
          </div>
          <span style={{ fontFamily:"'Orbitron', sans-serif", fontSize:"0.75rem", fontWeight:700, color:C.text, letterSpacing:"0.2em" }}>
            CODEX
          </span>
        </a>

        {/* Links */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="text-xs tracking-widest transition-colors"
                style={{ fontFamily:"'Share Tech Mono', monospace", color:C.dim }}
                onMouseEnter={e => (e.currentTarget.style.color = C.blue)}
                onMouseLeave={e => (e.currentTarget.style.color = C.dim)}>
                {l.label.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a href="#contato"
          className="hidden md:flex items-center gap-2 text-xs tracking-widest px-5 py-2.5 transition-all duration-200"
          style={{
            fontFamily:"'Share Tech Mono', monospace",
            color: C.bg,
            backgroundColor: C.blue,
            boxShadow: `0 0 16px ${C.blue}60`,
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#FF8533"; e.currentTarget.style.boxShadow = `0 0 24px ${C.blue}`; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.blue;    e.currentTarget.style.boxShadow = `0 0 16px ${C.blue}60`; }}>
          INICIALIZAR <ArrowRight size={12} />
        </a>

        <button className="md:hidden" onClick={() => setOpen(!open)}
          style={{ color: C.blue }}>
          {open ? "✕" : "≡"}
        </button>
      </nav>

      {open && (
        <div className="md:hidden px-6 py-6 flex flex-col gap-5"
          style={{ backgroundColor: C.panel, borderTop:`1px solid ${C.border}` }}>
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              style={{ fontFamily:"'Share Tech Mono', monospace", color:C.dim, fontSize:"0.75rem", letterSpacing:"0.12em" }}>
              {l.label.toUpperCase()}
            </a>
          ))}
          <a href="#contato" onClick={() => setOpen(false)}
            className="text-center py-3 text-xs tracking-widest"
            style={{ fontFamily:"'Share Tech Mono', monospace", backgroundColor: C.blue, color: C.bg }}>
            INICIALIZAR
          </a>
        </div>
      )}
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [booted, setBooted] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);

  const bootLines = [
    "[ CODEX OS v2.4.1 ] INITIALIZING...",
    "[ CORE ] Clean Architecture loaded",
    "[ NET  ] Secure channels established",
    "[ AI   ] Inference engine online",
    "[ SYS  ] ALL SYSTEMS OPERATIONAL",
  ];

  useEffect(() => {
    if (lineIdx < bootLines.length) {
      const t = setTimeout(() => setLineIdx(i => i + 1), 340);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setBooted(true), 200);
      return () => clearTimeout(t);
    }
  }, [lineIdx]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ backgroundColor: C.bg }}>
      <ScanLine />

      {/* Hex grid bg */}
      <div className="absolute inset-0 opacity-[0.035]" style={{
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V18L28 2l28 16v32L28 66zm0 34L0 84V52l28 16 28-16v32L28 100z' fill='none' stroke='%2300A8FF' stroke-width='0.5'/%3E%3C/svg%3E")`,
        backgroundSize:"56px 100px",
      }} />

      {/* Radial glow — arc reactor position */}
      <div className="absolute pointer-events-none" style={{
        right:"8%", top:"50%", transform:"translateY(-50%)",
        width:500, height:500,
        background:`radial-gradient(circle, ${C.blue}18 0%, ${C.gold}08 40%, transparent 70%)`,
      }} />

      <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 w-full grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16 items-center">
        {/* Left col */}
        <div>
          {/* Boot terminal */}
          <div className="mb-10 relative p-4 max-w-sm"
            style={{ backgroundColor:"rgba(255,107,0,0.04)", border:`1px solid ${C.border}` }}>
            <Brackets size={10} color={C.blue} />
            <div className="flex items-center gap-2 mb-3">
              <span style={{ fontFamily:"'Share Tech Mono', monospace", fontSize:"0.65rem", color:C.gold, letterSpacing:"0.1em" }}>
                OMNI TERMINAL v7 ──────
              </span>
            </div>
            {bootLines.slice(0, lineIdx).map((line, i) => (
              <div key={i} style={{ fontFamily:"'Share Tech Mono', monospace", fontSize:"0.65rem", color: i === lineIdx-1 ? C.blue : C.dim, lineHeight:1.8 }}>
                {line}
              </div>
            ))}
            {lineIdx < bootLines.length && (
              <span className="inline-block w-1.5 h-3 ml-1 animate-pulse" style={{ backgroundColor: C.blue, verticalAlign:"middle" }} />
            )}
          </div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity:0, x:-30 }}
            animate={{ opacity:1, x:0 }}
            transition={{ duration:0.9, delay:1.8, ease:[0.16,1,0.3,1] }}
            style={{ fontFamily:"'Orbitron', sans-serif", fontWeight:900, color:C.text, lineHeight:1.0, letterSpacing:"-0.02em" }}
            className="text-5xl md:text-6xl lg:text-7xl mb-6"
          >
            SISTEMAS QUE<br />
            <span style={{ color:C.blue, textShadow:`0 0 30px ${C.blue}` }}>NÃO FALHAM.</span><br />
            <span style={{ color:C.gold, textShadow:`0 0 20px ${C.gold}` }}>NÃO ENVELHECEM.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            transition={{ duration:0.6, delay:2.3 }}
            className="text-sm leading-relaxed mb-10 max-w-lg"
            style={{ fontFamily:"'Inter', sans-serif", color:C.dim }}>
            Construímos sistemas de missão crítica com Clean Architecture, cloud-native e AI-ready desde a fundação.
            Para empresas que não podem se dar ao luxo de falhar.
          </motion.p>

          <motion.div
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.5, delay:2.5 }}
            className="flex flex-col sm:flex-row gap-4">
            <a href="#contato"
              className="group inline-flex items-center justify-center gap-3 text-sm px-8 py-4 transition-all duration-200"
              style={{ fontFamily:"'Share Tech Mono', monospace", backgroundColor: C.blue, color: C.bg, boxShadow:`0 0 24px ${C.blue}50`, letterSpacing:"0.1em" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 40px ${C.blue}`; e.currentTarget.style.backgroundColor="#FF8533"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 24px ${C.blue}50`; e.currentTarget.style.backgroundColor=C.blue; }}>
              INICIAR MISSÃO <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#servicos"
              className="inline-flex items-center justify-center gap-2 text-sm px-8 py-4 transition-all duration-200"
              style={{ fontFamily:"'Share Tech Mono', monospace", border:`1px solid ${C.border}`, color:C.dim, letterSpacing:"0.1em" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.color=C.blue; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.dim; }}>
              <ChevronRight size={13} /> VER SISTEMAS
            </a>
          </motion.div>

          {/* HUD metrics */}
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            transition={{ duration:0.6, delay:2.8 }}
            className="mt-16 grid grid-cols-3 gap-6 max-w-sm pt-8"
            style={{ borderTop:`1px solid ${C.faint}` }}>
            {[
              { val:"127+", label:"PROJETOS",   color:C.blue },
              { val:"99.9%", label:"SLA UPTIME", color:C.gold },
              { val:"0",    label:"BREACHES",    color:C.blue },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontFamily:"'Orbitron', sans-serif", fontSize:"1.6rem", fontWeight:900, color:s.color, textShadow:`0 0 12px ${s.color}60` }}>
                  {s.val}
                </p>
                <p style={{ fontFamily:"'Share Tech Mono', monospace", fontSize:"0.6rem", color:C.dim, letterSpacing:"0.15em", marginTop:4 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right col — Arc Reactor */}
        <motion.div
          initial={{ opacity:0, scale:0.7 }}
          animate={{ opacity:1, scale:1 }}
          transition={{ duration:1.0, delay:2.0, ease:[0.16,1,0.3,1] }}
          className="hidden lg:flex flex-col items-center gap-6">
          <ArcReactor size={240} />

          {/* Status strip */}
          <div className="w-full space-y-2" style={{ minWidth:220 }}>
            {[
              { label:"POWER CORE",    val:98, color:C.blue },
              { label:"NEURAL NET",    val:87, color:C.gold },
              { label:"SECURITY",      val:100, color:C.blue },
            ].map(b => (
              <div key={b.label}>
                <div className="flex justify-between mb-1">
                  <span style={{ fontFamily:"'Share Tech Mono', monospace", fontSize:"0.6rem", color:C.dim, letterSpacing:"0.12em" }}>{b.label}</span>
                  <span style={{ fontFamily:"'Share Tech Mono', monospace", fontSize:"0.6rem", color:b.color }}>{b.val}%</span>
                </div>
                <div className="h-px w-full" style={{ backgroundColor:C.faint }}>
                  <motion.div className="h-full" style={{ backgroundColor:b.color, boxShadow:`0 0 6px ${b.color}`, width:`${b.val}%` }}
                    initial={{ width:0 }} animate={{ width:`${b.val}%` }}
                    transition={{ duration:1.2, delay:2.4, ease:[0.16,1,0.3,1] }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────
function Services() {
  return (
    <section id="servicos" className="py-28" style={{ backgroundColor: C.bg, borderTop:`1px solid ${C.border}20` }}>
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <HudLabel color={C.gold}>Módulos de Sistema</HudLabel>
          <h2 className="mt-4 mb-16" style={{ fontFamily:"'Orbitron', sans-serif", fontWeight:900, color:C.text, fontSize:"clamp(1.6rem,3.5vw,2.5rem)", letterSpacing:"-0.02em" }}>
            CAPACIDADES OPERACIONAIS
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SERVICES.map((s, i) => (
            <FadeIn key={s.id} delay={i * 0.12}>
              <div className="relative p-8 group transition-all duration-300 h-full flex flex-col"
                style={{ backgroundColor: C.panel, border:`1px solid ${s.color}25` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = s.color + "60"; e.currentTarget.style.boxShadow = `0 0 30px ${s.color}12`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = s.color + "25"; e.currentTarget.style.boxShadow = "none"; }}>
                <Brackets size={14} color={s.color} />

                <div className="flex items-start justify-between mb-6">
                  <span style={{ fontFamily:"'Share Tech Mono', monospace", fontSize:"0.65rem", color:s.color, letterSpacing:"0.15em" }}>
                    MODULE_{s.id}
                  </span>
                  <s.Icon size={18} style={{ color: s.color, filter:`drop-shadow(0 0 4px ${s.color})` }} />
                </div>

                <p style={{ fontFamily:"'Share Tech Mono', monospace", fontSize:"0.6rem", color:C.dim, letterSpacing:"0.15em", marginBottom:8 }}>
                  {s.sub}
                </p>
                <h3 className="mb-4" style={{ fontFamily:"'Orbitron', sans-serif", fontWeight:700, color:C.text, fontSize:"1rem", letterSpacing:"-0.01em" }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed flex-1 mb-6" style={{ fontFamily:"'Inter', sans-serif", color:C.dim }}>
                  {s.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {s.tags.map(t => (
                    <span key={t} className="text-xs px-2.5 py-1"
                      style={{ fontFamily:"'Share Tech Mono', monospace", color:s.color, border:`1px solid ${s.color}35` }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Tech Stack ───────────────────────────────────────────────────────────────
function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const q = [...items, ...items, ...items, ...items];
  return (
    <div className="overflow-hidden">
      <motion.div className="flex whitespace-nowrap" style={{ width:"200%" }}
        animate={{ x: reverse ? ["0%","50%"] : ["0%","-50%"] }}
        transition={{ duration:30, repeat:Infinity, ease:"linear" }}>
        {q.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-6 py-2.5 whitespace-nowrap text-xs transition-colors cursor-default"
            style={{ fontFamily:"'Share Tech Mono', monospace", color:C.dim, borderRight:`1px solid ${C.faint}` }}
            onMouseEnter={e => (e.currentTarget.style.color = C.blue)}
            onMouseLeave={e => (e.currentTarget.style.color = C.dim)}>
            <span style={{ color: C.gold, opacity:0.6 }}>◈</span>
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function TechStack() {
  return (
    <section id="stack" className="py-20 overflow-hidden" style={{ backgroundColor: C.panel, borderTop:`1px solid ${C.border}30`, borderBottom:`1px solid ${C.border}30` }}>
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <FadeIn>
          <HudLabel color={C.blue}>Arsenal Tecnológico</HudLabel>
          <h2 className="mt-4" style={{ fontFamily:"'Orbitron', sans-serif", fontWeight:900, color:C.text, fontSize:"clamp(1.6rem,3.5vw,2.5rem)" }}>
            FERRAMENTAS DE COMBATE
          </h2>
        </FadeIn>
      </div>
      <div className="flex flex-col gap-3 mt-8">
        <Marquee items={TECH_ROW_A} />
        <Marquee items={TECH_ROW_B} reverse />
      </div>
    </section>
  );
}

// ─── Methodology ─────────────────────────────────────────────────────────────
function Methodology() {
  return (
    <section id="metodologia" className="py-28" style={{ backgroundColor: C.bg, borderTop:`1px solid ${C.border}20` }}>
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <HudLabel color={C.gold}>Protocolo Operacional</HudLabel>
          <h2 className="mt-4 mb-16" style={{ fontFamily:"'Orbitron', sans-serif", fontWeight:900, color:C.text, fontSize:"clamp(1.6rem,3.5vw,2.5rem)" }}>
            SEQUÊNCIA DE MISSÃO
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {METHODOLOGY.map((m, i) => (
            <FadeIn key={m.step} delay={i * 0.1}>
              <div className="relative p-8 group transition-all duration-300"
                style={{ backgroundColor: C.panel, border:`1px solid ${C.border}30` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue + "50"; e.currentTarget.style.boxShadow = `0 0 24px ${C.blue}10`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border + "30"; e.currentTarget.style.boxShadow = "none"; }}>
                <Brackets size={12} color={C.gold} />

                <div className="flex items-center gap-4 mb-5">
                  <span style={{ fontFamily:"'Orbitron', sans-serif", fontSize:"2.5rem", fontWeight:900, color:`${C.blue}18`, lineHeight:1 }}>
                    {m.step}
                  </span>
                  <m.icon size={18} style={{ color:C.blue, filter:`drop-shadow(0 0 4px ${C.blue})` }} />
                </div>
                <h3 className="mb-3" style={{ fontFamily:"'Orbitron', sans-serif", fontWeight:700, color:C.text, fontSize:"0.9rem", letterSpacing:"0.05em" }}>
                  {m.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ fontFamily:"'Inter', sans-serif", color:C.dim }}>
                  {m.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Architecture ─────────────────────────────────────────────────────────────
function Architecture() {
  const layers = [
    { label:"PRESENTATION",  color:C.blue, items:["Next.js 14 · App Router","React 18 + TypeScript","Tailwind CSS","Framer Motion"] },
    { label:"APPLICATION",   color:C.gold, items:["NestJS Controllers","Use Cases (CQRS)","DTOs + class-validator","Guards + Interceptors"] },
    { label:"DOMAIN",        color:C.blue, items:["Entities — Lead, User","Value Objects","Domain Events","Repository Interfaces"] },
    { label:"INFRASTRUCTURE",color:C.gold, items:["PostgreSQL (TypeORM)","Redis — Rate Limiting","SMTP — Nodemailer","Docker + Compose"] },
  ];

  return (
    <section className="py-24" style={{ backgroundColor: C.panel, borderTop:`1px solid ${C.border}30` }}>
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <HudLabel color={C.blue}>Blueprints</HudLabel>
          <h2 className="mt-4 mb-3" style={{ fontFamily:"'Orbitron', sans-serif", fontWeight:900, color:C.text, fontSize:"clamp(1.6rem,3.5vw,2.5rem)" }}>
            CLEAN ARCHITECTURE
          </h2>
          <p className="text-xs mb-14" style={{ fontFamily:"'Share Tech Mono', monospace", color:C.dim, letterSpacing:"0.1em" }}>
            // Dependência unidirecional · Domínio nunca toca infraestrutura
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {layers.map((l, i) => (
            <FadeIn key={l.label} delay={i * 0.1}>
              <div className="relative p-6 h-full" style={{ backgroundColor: C.bg, border:`1px solid ${l.color}25` }}>
                <Brackets size={10} color={l.color} />
                <div className="h-0.5 mb-5" style={{ backgroundColor:l.color, boxShadow:`0 0 8px ${l.color}` }} />
                <span className="block text-xs tracking-widest mb-4" style={{ fontFamily:"'Share Tech Mono', monospace", color:l.color }}>
                  {l.label}
                </span>
                <ul className="flex flex-col gap-2.5">
                  {l.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-xs"
                      style={{ fontFamily:"'Inter', sans-serif", color:C.dim }}>
                      <span className="w-1 h-1 flex-shrink-0" style={{ backgroundColor:l.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Monorepo tree */}
        <FadeIn delay={0.2}>
          <div className="relative p-6 text-xs leading-7 overflow-x-auto"
            style={{ backgroundColor: C.bg, border:`1px solid ${C.border}`, fontFamily:"'Share Tech Mono', monospace", color:C.dim }}>
            <Brackets size={10} color={C.blue} />
            <p className="mb-3 text-xs tracking-widest" style={{ color:C.blue }}>// MONOREPO — TURBOREPO</p>
            {`codex/
├── apps/
│   ├── web/              # Next.js 14 App Router
│   │   └── app/api/leads/route.ts
│   └── api/              # NestJS
│       └── src/
│           ├── domain/lead/
│           ├── application/leads/
│           │   ├── create-lead.use-case.ts
│           │   └── create-lead.dto.ts
│           └── infrastructure/http/
│               └── leads.controller.ts
├── packages/shared-types/
├── docker-compose.yml
└── turbo.json`.split("\n").map((line, i) => (
              <div key={i}>
                {line.includes("#")
                  ? <><span>{line.split("#")[0]}</span><span style={{ color:`${C.blue}80` }}>#{line.split("#").slice(1).join("#")}</span></>
                  : line}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError]   = useState<ProblemDetail | null>(null);
  const [form, setForm]     = useState<LeadPayload>({ name:"", email:"", company:"", budget:"", message:"" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) {
      setError({ type:"", title:"Serviço Indisponível", status:503, detail:"Formulário temporariamente indisponível. Tente novamente mais tarde." });
      setStatus("error");
      return;
    }
    setStatus("loading"); setError(null);
    try {
      const { error: supabaseError } = await supabase
        .from("leads")
        .insert([form]);
      
      if (supabaseError) {
        setError({ type:"", title:"Erro ao enviar", status:500, detail:supabaseError.message });
        setStatus("error");
        return;
      }
      setStatus("success");
      setForm({ name:"", email:"", company:"", budget:"", message:"" });
    } catch {
      setError({ type:"", title:"Serviço Indisponível", status:503, detail:"Falha de conexão. Verifique sua rede e tente novamente." });
      setStatus("error");
    }
  };

  const [budgetOpen, setBudgetOpen] = useState(false);
  const budgetOptions = [
    { value: "5k-30k", label: "R$ 5k – R$ 30k" },
    { value: "30k-100k", label: "R$ 30k – R$ 100k" },
    { value: "100k-300k", label: "R$ 100k – R$ 300k" },
    { value: "300k-1m", label: "R$ 300k – R$ 1M" },
    { value: "1m+", label: "R$ 1M+" },
  ];
  const budgetLabels: Record<string, string> = Object.fromEntries(budgetOptions.map(o => [o.value, o.label]));

  const fieldStyle: React.CSSProperties = {
    width:"100%", backgroundColor:C.bg, border:`1px solid ${C.border}`,
    color:C.text, fontFamily:"'Share Tech Mono', monospace", fontSize:"0.8rem",
    padding:"0.75rem 1rem", outline:"none", transition:"border-color 0.2s, box-shadow 0.2s",
    colorScheme:"dark",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily:"'Share Tech Mono', monospace", fontSize:"0.6rem", color:C.dim,
    letterSpacing:"0.15em", textTransform:"uppercase", display:"block", marginBottom:"0.5rem",
  };

  if (status === "success") return (
    <section id="contato" className="py-28" style={{ backgroundColor: C.bg, borderTop:`1px solid ${C.border}30` }}>
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <div className="relative p-10 max-w-lg" style={{ backgroundColor:C.panel, border:`1px solid ${C.blue}` }}>
            <Brackets size={14} color={C.gold} />
            <div className="flex items-center gap-3 mb-5">
              <CheckCircle size={20} style={{ color:C.blue, filter:`drop-shadow(0 0 6px ${C.blue})` }} />
              <span style={{ fontFamily:"'Share Tech Mono', monospace", fontSize:"0.7rem", color:C.blue, letterSpacing:"0.15em" }}>
                TRANSMISSÃO RECEBIDA
              </span>
            </div>
            <h2 className="mb-4" style={{ fontFamily:"'Orbitron', sans-serif", fontWeight:900, color:C.text, fontSize:"1.4rem" }}>
              Retornaremos em 24h úteis.
            </h2>
            <p className="text-sm" style={{ fontFamily:"'Inter', sans-serif", color:C.dim }}>
              Seu briefing foi registrado. Nossa equipe entrará em contato para agendar uma reunião online sem custo.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );

  return (
    <section id="contato" className="py-28" style={{ backgroundColor: C.bg, borderTop:`1px solid ${C.border}20` }}>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">
        <FadeIn>
          <HudLabel color={C.gold}>Iniciar Contato</HudLabel>
          <h2 className="mt-4 mb-6" style={{ fontFamily:"'Orbitron', sans-serif", fontWeight:900, color:C.text, fontSize:"clamp(1.6rem,3.5vw,2.5rem)" }}>
            TRANSMITIR BRIEFING
          </h2>
          <p className="text-sm leading-relaxed mb-12" style={{ fontFamily:"'Inter', sans-serif", color:C.dim }}>
            Trabalhamos com empresas que têm problemas reais, complexos e urgentes.
            Não aceitamos projetos genéricos. Se este é seu caso, inicie a transmissão.
          </p>
          <div className="flex flex-col gap-5">
            {[
              { Icon:Zap,      text:"Reunião online gratuita · 60 minutos" },
              { Icon:Shield,   text:"Resposta em até 24 horas úteis" },
              { Icon:Lock,     text:"NDA disponível antes do briefing" },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-4">
                <Icon size={14} style={{ color:C.blue, filter:`drop-shadow(0 0 4px ${C.blue})`, flexShrink:0 }} />
                <span style={{ fontFamily:"'Share Tech Mono', monospace", fontSize:"0.7rem", color:C.dim, letterSpacing:"0.08em" }}>{text}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="relative p-8" style={{ backgroundColor:C.panel, border:`1px solid ${C.border}` }}>
            <Brackets size={14} color={C.gold} />
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Nome *</label>
                  <input type="text" name="name" required value={form.name} onChange={handleChange}
                    placeholder="Ada Lovelace" style={fieldStyle}
                    onFocus={e => { e.target.style.borderColor=C.blue; e.target.style.boxShadow=`0 0 12px ${C.blue}20`; }}
                    onBlur={e  => { e.target.style.borderColor=C.border; e.target.style.boxShadow="none"; }} />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input type="email" name="email" required value={form.email} onChange={handleChange}
                    placeholder="ada@empresa.com" style={fieldStyle}
                    onFocus={e => { e.target.style.borderColor=C.blue; e.target.style.boxShadow=`0 0 12px ${C.blue}20`; }}
                    onBlur={e  => { e.target.style.borderColor=C.border; e.target.style.boxShadow="none"; }} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Empresa</label>
                <input type="text" name="company" value={form.company} onChange={handleChange}
                  placeholder="Stark Industries" style={fieldStyle}
                  onFocus={e => { e.target.style.borderColor=C.blue; e.target.style.boxShadow=`0 0 12px ${C.blue}20`; }}
                  onBlur={e  => { e.target.style.borderColor=C.border; e.target.style.boxShadow="none"; }} />
              </div>

              <div style={{ position:"relative" }}>
                <label style={labelStyle}>Orçamento *</label>
                <div
                  tabIndex={0}
                  onClick={() => setBudgetOpen(!budgetOpen)}
                  onBlur={() => setTimeout(() => setBudgetOpen(false), 150)}
                  onKeyDown={e => { if(e.key === "Escape") setBudgetOpen(false); }}
                  style={{ ...fieldStyle, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ color: form.budget ? C.text : C.dim }}>
                    {form.budget ? budgetLabels[form.budget] : "// Selecione uma faixa"}
                  </span>
                  <span style={{ color:C.dim, fontSize:"0.6rem" }}>{budgetOpen ? "▲" : "▼"}</span>
                </div>
                {budgetOpen && (
                  <div style={{
                    position:"absolute", top:"100%", left:0, right:0, zIndex:50,
                    backgroundColor:C.panel, border:`1px solid ${C.border}`,
                    boxShadow:`0 8px 32px rgba(0,0,0,0.6)`,
                  }}>
                    {budgetOptions.map(opt => (
                      <div
                        key={opt.value}
                        onClick={() => { setForm(p => ({ ...p, budget:opt.value })); setBudgetOpen(false); }}
                        style={{
                          padding:"0.75rem 1rem", cursor:"pointer",
                          fontFamily:"'Share Tech Mono', monospace", fontSize:"0.8rem",
                          color: form.budget === opt.value ? C.blue : C.text,
                          backgroundColor: form.budget === opt.value ? `${C.blue}10` : "transparent",
                          transition:"background-color 0.15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${C.blue}15`; e.currentTarget.style.color = C.blue; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = form.budget === opt.value ? `${C.blue}10` : "transparent"; e.currentTarget.style.color = form.budget === opt.value ? C.blue : C.text; }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Descreva o Problema *</label>
                <textarea name="message" required rows={4} value={form.message} onChange={handleChange}
                  placeholder="// Contexto, escala e urgência..."
                  style={{ ...fieldStyle, resize:"none" }}
                  onFocus={e => { e.target.style.borderColor=C.blue; e.target.style.boxShadow=`0 0 12px ${C.blue}20`; }}
                  onBlur={e  => { e.target.style.borderColor=C.border; e.target.style.boxShadow="none"; }} />
              </div>

              {status === "error" && error && (
                <div className="flex items-start gap-3 p-4"
                  style={{ border:`1px solid ${C.red}40`, backgroundColor:`${C.red}08` }}>
                  <AlertCircle size={14} style={{ color:C.red, flexShrink:0, marginTop:2 }} />
                  <div>
                    <p style={{ fontFamily:"'Share Tech Mono', monospace", fontSize:"0.65rem", color:C.red, marginBottom:4 }}>
                      {error.title} · HTTP {error.status}
                    </p>
                    <p style={{ fontFamily:"'Inter', sans-serif", fontSize:"0.75rem", color:C.dim }}>{error.detail}</p>
                  </div>
                </div>
              )}

              <button type="submit" disabled={status === "loading"}
                className="flex items-center justify-center gap-3 py-4 text-sm transition-all duration-200"
                style={{
                  fontFamily:"'Share Tech Mono', monospace",
                  letterSpacing:"0.1em",
                  backgroundColor: status === "loading" ? `${C.blue}50` : C.blue,
                  color: C.bg,
                  boxShadow: status !== "loading" ? `0 0 20px ${C.blue}50` : "none",
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                }}
                onMouseEnter={e => { if(status!=="loading"){ e.currentTarget.style.boxShadow=`0 0 32px ${C.blue}`; e.currentTarget.style.backgroundColor="#FF8533"; } }}
                onMouseLeave={e => { if(status!=="loading"){ e.currentTarget.style.boxShadow=`0 0 20px ${C.blue}50`; e.currentTarget.style.backgroundColor=C.blue; } }}>
                {status === "loading"
                  ? <><Loader2 size={14} className="animate-spin" /> TRANSMITINDO...</>
                  : <> ENVIAR BRIEFING <ArrowRight size={14} /></>}
              </button>
            </form>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-10" style={{ backgroundColor: C.panel, borderTop:`1px solid ${C.border}30` }}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="relative w-7 h-7 flex items-center justify-center"
            style={{ border:`1px solid ${C.blue}`, boxShadow:`0 0 8px ${C.blue}40` }}>
            <span style={{ fontFamily:"'Orbitron', sans-serif", fontSize:"0.55rem", fontWeight:900, color:C.blue }}>CX</span>
          </div>
          <div>
            <span style={{ fontFamily:"'Orbitron', sans-serif", fontSize:"0.7rem", fontWeight:700, color:C.text, letterSpacing:"0.2em" }}>
              CODEX
            </span>
            <p style={{ fontFamily:"'Share Tech Mono', monospace", fontSize:"0.6rem", color:C.dim, letterSpacing:"0.08em", marginTop:2 }}>
              © {new Date().getFullYear()} · ALL RIGHTS RESERVED
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          {[Github, Linkedin].map((Icon, i) => (
            <button key={i} aria-label={i===0?"GitHub":"LinkedIn"}
              style={{ color:C.dim, transition:"color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = C.blue)}
              onMouseLeave={e => (e.currentTarget.style.color = C.dim)}>
              <Icon size={17} />
            </button>
          ))}
          <span style={{ fontFamily:"'Share Tech Mono', monospace", fontSize:"0.6rem", color:`${C.dim}50`, letterSpacing:"0.1em" }}>
            v2.4.1 · Node 20 LTS · Next.js 14
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ backgroundColor: C.bg, minHeight:"100vh" }}>
      <Nav />
      <Hero />
      <Services />
      <TechStack />
      <Methodology />
      <Architecture />
      <ContactForm />
      <Footer />
    </div>
  );
}
