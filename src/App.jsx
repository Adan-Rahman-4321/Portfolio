import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, AtSign,
  Bot, Braces, Code2, ContactRound, Database, Download,
  GitBranch, Globe2, Layers3, Loader2, Menu, MessageCircle,
  Send, Server, ShieldCheck, Sparkles, TerminalSquare, X,
} from 'lucide-react';
import profileImage from '../Assests/profile.jpeg';
import aboutImage from '../Assests/about_image.jpeg';
import bookStoreImage from '../Assests/Bookefy.png';
import recipeImage from '../Assests/foodiefiles.webp';
import resumeFile from "../Assests/Adan Rehman's Resume.docx?url";

/* ─── Toast helper ─────────────────────────────────────────────────────────── */
const toast = Swal.mixin({
  toast: true, position: 'top-end', showConfirmButton: false,
  timer: 2600, timerProgressBar: true,
  customClass: { popup: 'custom-toast' },
});

async function readApiResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const responseText = await response.text();

  if (!contentType.includes('application/json')) {
    throw new Error(`API returned a non-JSON response (HTTP ${response.status}). Check that the backend is running.`);
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error(`API returned invalid JSON (HTTP ${response.status}).`);
  }
}

/* ─── Static data ───────────────────────────────────────────────────────────── */
const navItems = [
  ['Home', '#home'], ['About', '#about'],
  ['Skills', '#skills'], ['Projects', '#projects'], ['Contact', '#contact'],
];

const skillGroups = [
  { name: 'Backend',      icon: Server,        items: ['C#','ASP.NET Core 8','ASP.NET Core Web API','ASP.NET Core MVC','Razor Pages','Entity Framework Core','LINQ','RESTful APIs','Node.js','Express.js','Python'], wide: false },
  { name: 'Frontend',     icon: Layers3,       items: ['HTML5','CSS3','JavaScript','TypeScript','React','Next.js','Vite','React Router','Bootstrap 5','Tailwind CSS','jQuery','Font Awesome','SweetAlert2','Canvas API'], wide: false },
  { name: 'Database',     icon: Database,      items: ['SQL Server','T-SQL','PostgreSQL','SQLite / SQL.js','MongoDB','Mongoose','Supabase','Turso (libSQL)','EF Core Migrations','Relational DB Design','Row Level Security (RLS)'], wide: false },
  { name: 'Security',     icon: ShieldCheck,   items: ['JWT Authentication','ASP.NET Identity','Firebase Auth','Session-Based Auth','OAuth2','Role-Based Access Control (RBAC)','OTP / Email Verification','Secure Coding'], wide: false },
  { name: 'AI / LLM',     icon: Sparkles,      items: ['LLM Integration','Prompt Engineering','Gemini API','OpenRouter','Gmail API','Microsoft Graph API','RAG','exifr','heic2any'], wide: false },
  { name: 'DevOps & Tools', icon: TerminalSquare, items: ['Docker','GitHub Actions','CI/CD','Git & GitHub','Vercel','Render','Postman','Visual Studio','VS Code','jszip','QR Code Generation'], wide: false },
  { name: 'System Architecture & Practices', icon: Braces, items: ['3-Tier Architecture','Clean Architecture','REST API Design','Agile / Scrum','Repository Pattern','Dependency Injection'], wide: true, description: 'Organized modular structure emphasizing separation of concerns, testability, and high-throughput reliability.' },
];

const projects = [
  { title:'EduAI',                subtitle:'AI-powered education platform',       category:'Full Stack', accent:'eduai',     monogram:'E',   tagline:'LEARN / GROW / ACHIEVE',  description:'A bilingual learning platform for Pakistani secondary students, aligned with FBISE and PTB curricula. Includes AI study tools, four user roles, Urdu/RTL support, and parent progress reports.', tags:['Next.js 16','React 19','TypeScript','Supabase','PostgreSQL','Firebase','Gemini 2.0 Flash','OpenRouter','Vercel'],                     github:'https://github.com/Adan-Rahman-4321/EduAI', live:'https://edu-ai-smart.vercel.app/' },
  { title:'Chaki Munshi',         subtitle:'Flour mill management system',        category:'Full Stack', accent:'chaki',     monogram:'CM',  tagline:'MANAGE · TRACK · REPORT', description:'An all-in-one management system for atta chakki and flour mill operations. Track customers, wheat intake, flour issues, payments, and expenses from a single dashboard with daily, monthly, and yearly reports.', tags:['React 19','Vite','Tailwind CSS 4','Node.js','Express 5','Turso','libSQL','React Router 7'], github:'https://github.com/Adan-Rahman-4321/Chaki-Munshi', live:'https://chaki-munshi.onrender.com/' },
  { title:'MetaStrip Pro',        subtitle:'Privacy-first image metadata tool',   category:'Frontend',   accent:'meta',      monogram:'MS',  tagline:'INSPECT · STRIP · EXPORT', description:'A privacy-first image preparation tool that inspects EXIF, GPS, IPTC, and XMP metadata and re-encodes a clean export entirely in the browser — no uploads, no server, no data leaving your device.', tags:['React','TypeScript','Vite','exifr','heic2any','jszip','lucide-react'],                                                              github:'https://github.com/Adan-Rahman-4321/Meta-Remover',         live:'https://meta-remover-kappa.vercel.app/' },
  { title:'Esport Stat System',   subtitle:'Tournament management platform',      category:'Full Stack', accent:'esport',    monogram:'ES',  tagline:'PLAY · COMPETE · RANK',   description:'Tournament management for teams, players, match results, and automated scoring, with leaderboard rankings and a responsive live-standings interface.',                                               tags:['ASP.NET Core 8','C#','MVC','Entity Framework Core','SQL Server','Docker','GitHub Actions'],                                    github:'https://github.com/Adan-Rahman-4321/EsportStatSystem/tree/main/EsportStatSystem' },
  { title:'Student Management API', subtitle:'RESTful student management web API', category:'Backend',  accent:'api',       monogram:'API', tagline:'SECURE · REST · SCALE',   description:'A secure student-management API with complete CRUD endpoints, a 3-tier architecture, and stateless JWT authentication.',                                                                           tags:['C#','ASP.NET Core 8','Web API','JWT','Entity Framework Core','SQL Server','Docker','GitHub Actions'],                          github:'https://github.com/Adan-Rahman-4321/StudentManagement_API' },
  { title:'Online Book Store',    subtitle:'Book store management system',        category:'Full Stack', accent:'bookstore', image:bookStoreImage,                              description:'A scalable 3-tier application with role-based Admin and Customer access, an Entity Framework data layer, and a responsive Bootstrap interface.',                                                tags:['ASP.NET Core MVC','C#','3-Tier Architecture','SQL Server','Entity Framework Core','Bootstrap'],                               github:'https://github.com/Adan-Rahman-4321/Book_Store' },
  { title:'Foodie Files',         subtitle:'Recipe management system',            category:'Full Stack', accent:'foodie',    image:recipeImage,                                 description:'Full CRUD recipe management with ASP.NET Identity authentication, role-based access control, and automated SMTP email notifications.',                                                           tags:['ASP.NET Core 8','MVC','ASP.NET Identity','SMTP','Entity Framework Core','SQL Server'],                                        github:'https://github.com/Adan-Rahman-4321/Foodie_Files-Recipe_Book-' },
  { title:'Smart Diagnostic Lab',  subtitle:'Lab & slot management system',        category:'Full Stack', accent:'lab',       monogram:'SDL', tagline:'DIAGNOSE · MANAGE · REPORT', description:'A web-based diagnostic lab and slot management system with role-based access for Admin, Receptionist, Technician, Doctor, and Patient. Covers appointments, queue, samples, test results, billing, inventory, and reports.', tags:['Node.js','Express','SQL.js','HTML5','CSS3','JavaScript','Session Auth'],                                                       github:'https://github.com/Adan-Rahman-4321/Lab-Diagnostic-System', live:'https://lab-diagnostic-system.vercel.app/' },
  { title:'TimeCrafters',          subtitle:'Luxury watch storefront',              category:'Frontend',   accent:'watch',     monogram:'TC',  tagline:'BROWSE · CART · CHECKOUT',  description:'A responsive luxury watch storefront with a hero carousel, featured collection, interactive in-page cart with order review, demo checkout dialogs, and contact and newsletter sections.',           tags:['HTML5','CSS3','Bootstrap 5','JavaScript','Font Awesome','SweetAlert2'],                                                        github:'https://github.com/Adan-Rahman-4321/Watch-Store',          live:'https://timecrafter.vercel.app/' },
  { title:'Lumina',                subtitle:'React ecommerce storefront',           category:'Frontend',   accent:'lumina',    monogram:'L',   tagline:'BROWSE · CART · CHECKOUT',  description:'A curated ecommerce storefront with a product catalog, category filtering, shopping cart with quantity controls and item removal, checkout form validation, and client-side routing.',                 tags:['React 19','React Router','Vite','lucide-react'],                                                                               github:'https://github.com/Adan-Rahman-4321/Lumina',               live:'https://lumina-gamma-beige.vercel.app/' },
  { title:'Aim Buddy',             subtitle:'Gaming aim-training website',          category:'Frontend',   accent:'aim',       monogram:'AB',  tagline:'TRAIN · AIM · DOMINATE',    description:'A responsive gaming-focused front-end website to help players improve aim, reflexes, and FPS performance. Features a landing page, about, blog cards, and login/signup screens with a clean dark interface.', tags:['HTML5','CSS3','Responsive Design','JavaScript'],                                                                              github:'https://github.com/Adan-Rahman-4321/Aim-Buddy',            live:'https://aim-buddy.vercel.app/' },
  { title:'QR Generator',          subtitle:'Console QR code tool with auth',       category:'Backend',    accent:'qr',        monogram:'QR',  tagline:'GENERATE · SECURE · SAVE',  description:'A console-based QR code generator with a full login, signup, and forgot-password flow. Stores credentials in a text file, generates QR PNGs per user, and sends OTP emails for password recovery.',    tags:['C#','.NET 8','Console App','OTP Email','File-Based Storage','QR Code Generation'],                                            github:'https://github.com/Adan-Rahman-4321/QR-Code-Generate-with-Login-Module' },
  { title:'AI Email Manager',      subtitle:'AI-powered email classification system', category:'Full Stack', accent:'aiemail',  monogram:'AEM', tagline:'FETCH · CLASSIFY · MANAGE', description:'An email management system built on .NET 8 and EF Core that fetches emails and classifies them via a native C# AI engine into 4 categories — Most Important, Important, Casual, and Promotional — on an interactive dashboard.', tags:['C#','.NET 8','ASP.NET Core','Razor Pages','Entity Framework Core','SQL Server','Gmail API','Microsoft Graph','Gemini AI','Bootstrap 5'], github:'https://github.com/Adan-Rahman-4321/Personal-Email-Assistant-' },
];

/* ─── Reusable components ───────────────────────────────────────────────────── */
function SectionEyebrow({ num, label }) {
  return (
    <div className="flex items-center gap-3 mb-10 sm:mb-12">
      <span className="font-mono text-xs text-brand-mint font-semibold">{num}</span>
      <span className="w-8 h-px bg-brand-mint/60" />
      <span className="font-mono text-xs uppercase tracking-widest text-slate-400 font-bold">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HEADER
═══════════════════════════════════════════════════════════════════════════════ */
function Header() {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [activeSection, setActive]  = useState('home');
  const [scrolled, setScrolled]     = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.2, 0.5] }
    );
    sections.forEach(s => io.observe(s));
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#08120e]/90 border-b border-white/[0.07] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 h-[70px] sm:h-20 flex items-center justify-between gap-4">

        {/* Logo */}
        <a className="group shrink-0 flex items-center gap-2.5" href="#home" onClick={close}>
          <div className="border border-brand-cream/40 px-2.5 py-1.5 flex items-center gap-2 rounded transition-all duration-300 group-hover:border-brand-mint group-hover:shadow-[0_0_20px_-4px_rgba(52,211,153,0.4)]">
            <span className="font-serif text-xl sm:text-2xl font-bold text-brand-cream group-hover:text-brand-mint transition-colors">A.</span>
            <span className="hidden sm:block text-xs uppercase tracking-widest text-brand-cream font-medium">Adan Rahman</span>
          </div>
        </a>

        {/* Availability badge — desktop */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] whitespace-nowrap">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inset-0 rounded-full bg-brand-mint opacity-75" />
            <span className="relative rounded-full h-2 w-2 bg-brand-mint" />
          </span>
          Available for select projects
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7 font-sans text-sm tracking-wide">
          {navItems.map(([label, href]) => (
            <a key={href} href={href}
              className={`relative py-1 transition-colors duration-200 ${activeSection === href.slice(1)
                ? 'text-brand-cream after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-brand-mint after:content-[\'\']'
                : 'text-slate-400 hover:text-brand-cream'}`}>
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* CTA */}
          <a href="#contact"
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-brand-cream/30 text-brand-cream text-[11px] font-mono uppercase tracking-wider hover:border-brand-mint hover:bg-emerald-950/40 hover:text-brand-mint transition-all duration-300 whitespace-nowrap">
            Let's talk <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
          {/* Hamburger */}
          <button
            className="lg:hidden grid place-items-center w-9 h-9 rounded-lg border border-brand-cream/20 text-brand-cream"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu" aria-expanded={menuOpen}>
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-white/[0.07] bg-[#08120e]/98 px-5 pt-4 pb-6 flex flex-col gap-1">
          {navItems.map(([label, href]) => (
            <a key={href} href={href} onClick={close}
              className={`py-3 px-3 text-sm rounded-lg transition-colors ${activeSection === href.slice(1)
                ? 'text-brand-cream bg-emerald-950/40'
                : 'text-slate-400 hover:text-brand-cream hover:bg-white/[0.03]'}`}>
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════════════════════════ */
function Home() {
  return (
    <section id="home"
      className="min-h-[calc(100svh-70px)] sm:min-h-[calc(100svh-80px)] flex flex-col justify-center py-12 sm:py-16 lg:py-24 border-b border-brand-cream/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* Text col */}
          <div className="lg:col-span-7 flex flex-col gap-6 sm:gap-7">
            <div className="flex items-center gap-3">
              <span className="w-5 h-px bg-brand-mint shrink-0" />
              <p className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 font-semibold leading-relaxed">
                Backend Developer <span className="text-brand-mint">/</span> MERN Stack <span className="text-brand-mint">/</span> .NET Specialist <span className="text-brand-mint">/</span> Rawalpindi
              </p>
            </div>

            <h1 className="text-[clamp(2.4rem,7vw,4.5rem)] font-sans font-bold tracking-tight text-white leading-[1.06]">
              Secure systems.<br />
              <span className="font-serif italic font-normal text-brand-cream underline decoration-brand-mint/40 decoration-wavy decoration-1 underline-offset-8">Useful</span> software.
            </h1>

            <p className="text-base sm:text-lg text-slate-300/90 font-light leading-relaxed max-w-lg">
              I'm Adan Rahman, a Software Engineering student building secure, scalable web applications with <span className="text-brand-cream font-medium">.NET</span>, the <span className="text-brand-cream font-medium">MERN stack</span>, and AI integrations — from REST APIs to full-stack products.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
              <a href="#projects"
                className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-brand-cream text-brand-obsidian font-semibold text-sm hover:bg-white hover:shadow-[0_0_30px_-4px_rgba(244,238,221,0.4)] transition-all duration-300 hover:-translate-y-0.5">
                Explore my work <ArrowDownRight className="w-4 h-4" />
              </a>
              <a href={resumeFile} download="Adan Rehman's Resume.docx"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl border border-brand-cream/20 text-brand-cream text-sm font-medium hover:border-brand-mint hover:text-brand-mint transition-all duration-300">
                Download CV <Download className="w-4 h-4" />
              </a>
              <a href="#contact"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl border border-brand-cream/10 text-slate-400 text-sm font-medium hover:border-brand-mint/40 hover:text-brand-mint transition-all duration-300">
                Let's talk <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 pt-1 text-slate-400">
              {[
                { href: 'https://github.com/Adan-Rahman-4321', icon: Code2, label: 'GitHub' },
                { href: 'https://www.linkedin.com/in/adanrahman', icon: ContactRound, label: 'LinkedIn' },
                { href: 'mailto:adanrahman916@gmail.com', icon: AtSign, label: 'Email' },
              ].map(({ href, icon: Icon, label }) => (
                <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer" aria-label={label}
                  className="p-2.5 rounded-lg border border-brand-cream/10 hover:border-brand-mint/40 hover:text-brand-mint hover:bg-emerald-950/40 transition-all">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              ))}
              <span className="text-[11px] font-mono text-slate-500 tracking-wider ml-1">/ 01 — 04</span>
            </div>
          </div>

          {/* Portrait col */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end mt-2 lg:mt-0">
            <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-none">
              {/* Offset border */}
              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-full h-full border border-brand-mint/30 rounded-2xl pointer-events-none" />
              {/* Card */}
              <div className="relative overflow-hidden rounded-2xl p-2 glass-card">
                <img src={profileImage} alt="Adan Rahman"
                  className="w-full h-[340px] sm:h-[420px] lg:h-[490px] object-cover object-top rounded-xl transition-transform duration-700 hover:scale-[1.02]" />
                <div className="absolute bottom-5 right-5 flex items-center gap-2 px-3.5 py-2 bg-brand-cream/95 backdrop-blur text-brand-obsidian rounded-lg shadow-xl text-xs font-mono font-bold tracking-tight">
                  Building with intent <span>✨</span>
                </div>
              </div>
              {/* Scroll cue */}
              <a href="#about" aria-label="Scroll to About"
                className="absolute -bottom-5 -left-4 w-11 h-11 rounded-full bg-[#0c1a14] border border-brand-mint/30 hidden sm:flex items-center justify-center text-brand-mint hover:bg-emerald-950 transition-colors shadow-lg">
                <ArrowDownRight className="w-4 h-4 animate-bounce" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 sm:mt-16 pt-5 border-t border-brand-cream/10 flex items-center justify-between text-[10px] sm:text-xs font-mono text-slate-500">
          <span className="uppercase tracking-widest">Selected work & capabilities</span>
          <span className="flex items-center gap-2 text-brand-cream/60">
            Scroll to explore <ArrowDownRight className="w-3 h-3 animate-pulse" />
          </span>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ABOUT
═══════════════════════════════════════════════════════════════════════════════ */
function About() {
  return (
    <section id="about" className="py-16 sm:py-24 border-b border-brand-cream/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <SectionEyebrow num="01" label="A little about me" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Image column */}
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute -bottom-3 -right-3 w-full h-full border border-brand-mint/30 rounded-2xl pointer-events-none hidden sm:block" />
              <div className="glass-card rounded-2xl p-2.5 overflow-hidden relative">
                <img src={aboutImage} alt="Adan Rahman"
                  className="w-full h-[300px] sm:h-[400px] object-cover object-center rounded-xl" />
                <div className="absolute bottom-4 right-4 bg-brand-cream text-brand-obsidian px-3.5 py-2 rounded-lg font-mono text-xs font-semibold flex items-center gap-2 shadow-lg">
                  Curious by nature <span>↘</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-between items-center gap-3 px-4 py-3 rounded-xl border border-brand-cream/10 bg-[rgba(16,33,26,0.65)]">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 min-w-0">
                <Download className="w-4 h-4 text-brand-mint shrink-0" />
                <span className="truncate">Adan Rehman's Resume.docx</span>
              </div>
              <a href={resumeFile} download="Adan Rehman's Resume.docx"
                className="shrink-0 text-xs font-mono font-semibold text-brand-mint hover:underline inline-flex items-center gap-1">
                Download CV ↓
              </a>
            </div>
          </div>

          {/* Copy column */}
          <div className="lg:col-span-7 flex flex-col gap-7">
            <h3 className="text-[clamp(1.9rem,4vw,3.4rem)] font-sans font-bold text-white tracking-tight leading-tight">
              Good work starts<br />with <span className="font-serif italic font-normal text-brand-cream underline decoration-brand-mint/30 decoration-1 underline-offset-4">good questions.</span>
            </h3>

            <div className="space-y-4 text-slate-300 leading-relaxed font-light text-sm sm:text-base">
              <p>I'm a Software Engineering student and backend developer specializing in secure, scalable web applications with <span className="text-brand-cream font-medium">ASP.NET Core</span>, C#, Entity Framework Core, SQL Server, and RESTful APIs.</p>
              <p>I've built end-to-end products using role-based security, 3-tier architecture, Docker, CI/CD, and AI/LLM integrations, with a focus on dependable systems and accessible experiences.</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-brand-cream/10">
              {[['13','End-to-end projects'],['08','Weeks at Arch Tech'],['BSSE','Software Engineering']].map(([n,l]) => (
                <div key={l} className="glass-card p-4 sm:p-5 rounded-xl">
                  <span className="font-sans text-3xl sm:text-4xl font-extrabold text-brand-cream block mb-1">{n}</span>
                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400">{l}</span>
                </div>
              ))}
            </div>

            {/* Cards */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label:'Industry Experience', title:'Web Development Intern', sub:'Arch Technologies · 8 Weeks Intensive' },
                  { label:'Degree Program', title:'BS Software Engineering', sub:'ARID Agriculture University Rawalpindi' },
                ].map(({ label, title, sub }) => (
                  <div key={label} className="p-4 rounded-xl border border-brand-cream/10 bg-[rgba(16,33,26,0.4)]">
                    <div className="text-[11px] font-mono text-brand-mint uppercase tracking-wider mb-1">{label}</div>
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <div className="text-xs text-slate-400">{sub}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl border border-brand-cream/10 bg-[rgba(16,33,26,0.4)] flex flex-wrap justify-between gap-2 text-xs font-mono">
                <span className="text-slate-400">Specialization: <strong className="text-brand-cream">.NET & REST APIs</strong></span>
                <span className="text-slate-400">Languages: <strong className="text-brand-cream">EN · UR · PB</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SKILLS
═══════════════════════════════════════════════════════════════════════════════ */
function Skills() {
  return (
    <section id="skills" className="py-16 sm:py-24 border-b border-brand-cream/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12 sm:mb-16">
          <div>
            <SectionEyebrow num="02" label="What I bring" />
            <h3 className="text-[clamp(1.9rem,4.5vw,3.2rem)] font-sans font-bold text-white tracking-tight -mt-4">
              A practical <span className="font-serif italic font-normal text-brand-cream">toolkit.</span>
            </h3>
          </div>
          <p className="text-slate-400 max-w-sm text-sm font-light sm:text-right">
            From data layer to the details on screen — I enjoy making the whole system work well together.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skillGroups.map(({ name, icon: Icon, items, wide, description }, i) => (
            <div key={name}
              className={`glass-card p-5 sm:p-7 rounded-2xl flex flex-col gap-4 ${wide ? 'sm:col-span-2 lg:col-span-3' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 grid place-items-center text-brand-mint shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.8} />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white">{name}</h4>
                </div>
                <span className="font-mono text-xs text-slate-500">0{i + 1}</span>
              </div>
              {description && <p className="text-slate-400 text-xs sm:text-sm">{description}</p>}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {items.map(item => <span key={item} className="tech-pill">{item}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PROJECTS
═══════════════════════════════════════════════════════════════════════════════ */

/* Single uniform project card — same format every time */
function ProjectCard({ project, index }) {
  const gradients = {
    eduai:     'bg-gradient-to-br from-emerald-950 via-teal-950/60 to-slate-950',
    esport:    'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950',
    api:       'bg-gradient-to-br from-slate-900 via-emerald-950/60 to-slate-950',
    bookstore: 'bg-gradient-to-br from-emerald-950/70 to-slate-900',
    foodie:    'bg-gradient-to-br from-teal-950/70 to-slate-900',
    chaki:     'bg-gradient-to-br from-amber-950/60 via-stone-900 to-slate-950',
    meta:      'bg-gradient-to-br from-violet-950/60 via-slate-900 to-emerald-950/40',
    lab:       'bg-gradient-to-br from-cyan-950/70 via-slate-900 to-slate-950',
    watch:     'bg-gradient-to-br from-yellow-950/50 via-stone-900 to-slate-950',
    lumina:    'bg-gradient-to-br from-pink-950/50 via-slate-900 to-purple-950/40',
    aim:       'bg-gradient-to-br from-orange-950/60 via-slate-900 to-slate-950',
    qr:        'bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950',
    aiemail:   'bg-gradient-to-br from-emerald-950/80 via-teal-950/40 to-slate-950',
  };

  return (
    <article className="glass-card rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1">

      {/* ── Visual thumbnail — fixed aspect ratio ── */}
      <div className={`relative w-full aspect-[16/9] overflow-hidden flex items-center justify-center ${gradients[project.accent] ?? 'bg-gradient-to-br from-emerald-950/70 to-slate-900'}`}>
        {/* Index badge */}
        <span className="absolute top-3 left-3 z-10 font-mono text-[11px] px-2 py-0.5 rounded bg-black/60 border border-white/10 text-brand-mint">
          0{index + 1}
        </span>

        {/* Category badge */}
        <span className="absolute top-3 right-12 z-10 font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-brand-mint uppercase tracking-wider">
          {project.category}
        </span>

        {/* Arrow link */}
        <a href={project.github} target="_blank" rel="noreferrer"
          aria-label={`Open ${project.title} on GitHub`}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg bg-brand-cream text-brand-obsidian grid place-items-center shadow-lg transform group-hover:rotate-45 transition-transform duration-300">
          <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
        </a>

        {/* Image or monogram */}
        {project.image
          ? <img
              src={project.image}
              alt={`${project.title} preview`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          : <div className="flex flex-col items-center gap-2 select-none">
              <span className="font-serif text-brand-cream/90 font-bold tracking-tight text-[clamp(2.5rem,8vw,5rem)] leading-none group-hover:scale-105 transition-transform duration-500">
                {project.monogram}
              </span>
              <span className="font-mono text-[9px] tracking-[0.28em] uppercase text-brand-cream/50">
                {project.tagline}
              </span>
            </div>
        }

        {/* Bottom gradient fade */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 gap-3 p-5">
        {/* Meta row */}
        <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
          <span className="uppercase tracking-wider">{project.subtitle}</span>
        </div>

        {/* Title + description */}
        <div>
          <h4 className="text-lg sm:text-xl font-bold font-serif text-white mb-1.5 leading-tight">
            {project.title}
          </h4>
          <p className="text-slate-400 text-xs sm:text-[13px] leading-relaxed font-light line-clamp-3">
            {project.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          {project.tags.slice(0, 4).map(t => (
            <span key={t} className="tech-pill text-[10px]">{t}</span>
          ))}
          {project.tags.length > 4 && (
            <span className="tech-pill text-[10px] opacity-60">+{project.tags.length - 4} more</span>
          )}
        </div>

        {/* Footer links */}
        <div className="flex items-center gap-4 pt-3 border-t border-brand-cream/10 font-mono text-[11px]">
          <a href={project.github} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-brand-cream hover:text-brand-mint transition-colors">
            <GitBranch className="w-3 h-3" /> Source code ↗
          </a>
          {project.live && (
            <a href={project.live} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-brand-mint hover:underline">
              <Globe2 className="w-3 h-3" /> Live demo ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function Projects() {
  const [filter, setFilter] = useState('All work');
  const visible = filter === 'All work' ? projects : projects.filter(p => p.category === filter);

  const changeFilter = (v) => {
    setFilter(v);
    toast.fire({ icon: 'info', title: v === 'All work' ? 'Showing all projects' : `Showing ${v.toLowerCase()} projects` });
  };

  return (
    <section id="projects" className="py-16 sm:py-24 border-b border-brand-cream/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12 sm:mb-16">
          <div>
            <SectionEyebrow num="03" label="Portfolio case studies" />
            <h3 className="text-[clamp(2.2rem,5vw,3.8rem)] font-sans font-bold text-white tracking-tight -mt-4">
              Made to <span className="font-serif italic font-normal text-brand-cream underline decoration-brand-mint/30 decoration-1 underline-offset-4">matter.</span>
            </h3>
          </div>

          {/* Filter tabs */}
          <div className="inline-flex self-start sm:self-auto p-1 rounded-xl bg-[rgba(16,33,26,0.65)] border border-brand-cream/10 backdrop-blur font-mono text-xs">
            {['All work', 'Full Stack', 'Backend', 'Frontend'].map(f => (
              <button key={f} type="button"
                className={`px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap ${filter === f ? 'bg-brand-cream text-brand-obsidian font-semibold' : 'text-slate-400 hover:text-white'}`}
                onClick={() => changeFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Uniform grid — 1 col mobile → 2 col tablet → 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {visible.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>

        {visible.length === 0 && (
          <div className="text-center py-20 text-slate-500 font-mono text-sm">
            No projects found for this filter.
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CONTACT  (SMTP-wired)
═══════════════════════════════════════════════════════════════════════════════ */
function Contact() {
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    const fd   = new FormData(e.currentTarget);
    const body = { name: fd.get('name'), email: fd.get('email'), message: fd.get('message') };

    try {
      const res  = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await readApiResponse(res);

      if (res.ok && data.success) {
        Swal.fire({
          icon: 'success', title: 'Message queued!',
          text: `Thanks ${body.name}! Your message is queued for delivery. I'll reply to ${body.email} within 24–48 hours.`,
          confirmButtonText: 'Awesome!',
          background: '#0c1a14', color: '#F4EEDD',
          confirmButtonColor: '#34D399',
        });
        e.target.reset();
      } else {
        throw new Error(data.error || `Request failed (HTTP ${res.status}).`);
      }
    } catch (err) {
      Swal.fire({
        icon: 'error', title: 'Oops!',
        text: err instanceof TypeError
          ? 'Cannot reach the portfolio API. Start the backend with npm run server and try again.'
          : err.message || 'Failed to queue your message. Please email me directly.',
        background: '#0c1a14', color: '#F4EEDD',
        confirmButtonColor: '#34D399',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1a2d24] via-[#0f2119] to-[#0a1611] border border-brand-cream/20 shadow-2xl p-6 sm:p-10 lg:p-16 overflow-hidden">
          {/* Ambient blob */}
          <div className="absolute -top-28 -right-28 w-80 h-80 bg-brand-cream/[0.06] rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

            {/* Left info */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <SectionEyebrow num="04" label="Have a project in mind?" />
              <h2 className="text-[clamp(2rem,4.5vw,3.2rem)] font-sans font-bold text-white tracking-tight leading-tight -mt-4">
                Let's make<br />something <span className="font-serif italic font-normal text-brand-cream">useful.</span>
              </h2>
              <p className="text-slate-300 font-light text-sm sm:text-base leading-relaxed">
                Have an idea, a tricky problem, or just want to say hello? My inbox is open.
              </p>
              <div className="space-y-4 font-mono text-sm">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-widest mb-1">Direct Mail</div>
                  <a href="mailto:adanrahman916@gmail.com"
                    className="text-brand-cream hover:text-brand-mint transition-colors inline-flex items-center gap-2 border-b border-brand-cream/30 pb-1">
                    adanrahman916@gmail.com ↗
                  </a>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-brand-mint/90 pt-2">
                  <span className="w-2 h-2 rounded-full bg-brand-mint animate-pulse shrink-0" />
                  Based in Rawalpindi, Pakistan · Working worldwide
                </div>
              </div>
            </div>

            {/* Right form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-brand-cream/80" htmlFor="name">Your Name</label>
                  <input id="name" name="name" type="text" placeholder="How should I call you?" required
                    className="w-full bg-black/30 border-0 border-b border-brand-cream/30 focus:border-brand-mint focus:outline-none text-white placeholder-slate-500 font-sans text-sm sm:text-base py-3 px-1 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-brand-cream/80" htmlFor="email">Email Address</label>
                  <input id="email" name="email" type="email" placeholder="you@example.com" required
                    className="w-full bg-black/30 border-0 border-b border-brand-cream/30 focus:border-brand-mint focus:outline-none text-white placeholder-slate-500 font-sans text-sm sm:text-base py-3 px-1 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-brand-cream/80" htmlFor="message">About the Project</label>
                  <textarea id="message" name="message" rows="4" placeholder="What are you thinking about?" required
                    className="w-full bg-black/30 border-0 border-b border-brand-cream/30 focus:border-brand-mint focus:outline-none text-white placeholder-slate-500 font-sans text-sm sm:text-base py-3 px-1 transition-colors resize-y" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                  <button type="submit" disabled={sending}
                    className="inline-flex items-center justify-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-brand-cream text-brand-obsidian font-bold text-sm hover:bg-white hover:shadow-[0_0_30px_-4px_rgba(244,238,221,0.3)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group">
                    {sending
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                      : <><span>Send message</span><Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /></>}
                  </button>
                  <span className="font-mono text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="text-brand-mint">✓</span> You'll get an auto-reply instantly
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   RAG CHATBOT
═══════════════════════════════════════════════════════════════════════════════ */

/* ── Markdown renderer ──────────────────────────────────────────────────────── */
/* Converts LLM markdown to clean React elements.
   Handles: ### headings, **bold**, *italic*, `code`, bullet lists, numbered lists,
            horizontal rules, and plain paragraphs / line breaks.               */
function MarkdownMessage({ text }) {
  const renderInline = (str, keyPrefix) => {
    // Split on **bold**, *italic*, and `code` spans
    const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      const key = `${keyPrefix}-${i}`;
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={key} className="font-semibold text-brand-cream">{part.slice(2, -2)}</strong>;
      if (part.startsWith('*') && part.endsWith('*'))
        return <em key={key} className="italic text-slate-300">{part.slice(1, -1)}</em>;
      if (part.startsWith('`') && part.endsWith('`'))
        return <code key={key} className="px-1 py-0.5 rounded bg-emerald-950/60 border border-brand-mint/20 font-mono text-brand-mint text-[11px]">{part.slice(1, -1)}</code>;
      return <span key={key}>{part}</span>;
    });
  };

  const lines  = text.split('\n');
  const output = [];
  let listBuf  = [];   // pending bullet items
  let olBuf    = [];   // pending ordered items

  const flushBullets = (k) => {
    if (!listBuf.length) return;
    output.push(
      <ul key={`ul-${k}`} className="mt-1 mb-2 flex flex-col gap-1 pl-1">
        {listBuf.map((item, i) => (
          <li key={i} className="flex gap-2 items-start">
            <span className="mt-[3px] shrink-0 w-1.5 h-1.5 rounded-full bg-brand-mint/70" />
            <span className="flex-1">{renderInline(item, `bl-${k}-${i}`)}</span>
          </li>
        ))}
      </ul>
    );
    listBuf = [];
  };

  const flushOrdered = (k) => {
    if (!olBuf.length) return;
    output.push(
      <ol key={`ol-${k}`} className="mt-1 mb-2 flex flex-col gap-1 pl-1 list-none">
        {olBuf.map((item, i) => (
          <li key={i} className="flex gap-2 items-start">
            <span className="shrink-0 font-mono text-[10px] text-brand-mint/80 min-w-[14px] mt-[1px]">{i + 1}.</span>
            <span className="flex-1">{renderInline(item, `ol-${k}-${i}`)}</span>
          </li>
        ))}
      </ol>
    );
    olBuf = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();

    // ### / ## / # heading
    const hMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (hMatch) {
      flushBullets(idx); flushOrdered(idx);
      const level = hMatch[1].length;
      const cls   = level === 1
        ? 'text-sm font-bold text-brand-cream mt-3 mb-1'
        : level === 2
          ? 'text-xs font-bold text-brand-cream mt-2.5 mb-1 uppercase tracking-wide'
          : 'text-xs font-semibold text-brand-cream/90 mt-2 mb-0.5';
      output.push(<p key={idx} className={cls}>{renderInline(hMatch[2], `h-${idx}`)}</p>);
      return;
    }

    // Horizontal rule ---
    if (/^-{3,}$/.test(line.trim())) {
      flushBullets(idx); flushOrdered(idx);
      output.push(<hr key={idx} className="my-2 border-brand-cream/10" />);
      return;
    }

    // Unordered bullet  - item  or  * item
    const ulMatch = line.match(/^[-*•]\s+(.+)/);
    if (ulMatch) {
      flushOrdered(idx);
      listBuf.push(ulMatch[1]);
      return;
    }

    // Ordered list  1. item
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      flushBullets(idx);
      olBuf.push(olMatch[1]);
      return;
    }

    // Empty line — flush buffers, add spacer
    if (line.trim() === '') {
      flushBullets(idx); flushOrdered(idx);
      if (output.length) output.push(<div key={`sp-${idx}`} className="h-1" />);
      return;
    }

    // Normal paragraph line
    flushBullets(idx); flushOrdered(idx);
    output.push(
      <p key={idx} className="leading-relaxed">
        {renderInline(line, `p-${idx}`)}
      </p>
    );
  });

  // Flush anything remaining
  flushBullets('end'); flushOrdered('end');
  return <div className="flex flex-col gap-0.5">{output}</div>;
}

const SUGGESTED = [
  'What projects has Adan built?',
  'What are his main skills?',
  'Is he available for work?',
  'How to contact Adan?',
];

function Chatbot() {
  const [open, setOpen]       = useState(false);
  const [messages, setMsgs]   = useState([
    { role: 'assistant', content: "Hi! I'm Adan's portfolio assistant 👋\nAsk me anything about his skills, projects, or availability." },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput('');
    const updated = [...messages, { role: 'user', content: q }];
    setMsgs(updated);
    setLoading(true);
    try {
      const res  = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated.filter(m => m.role !== 'system') }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Chat request failed (HTTP ${res.status}).`);
      }
      setMsgs(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const errorMessage = err instanceof TypeError
        ? 'Cannot reach the portfolio API. Start the backend with npm run server, then retry.'
        : err.message || 'The chat service is unavailable. Please try again.';
      setMsgs(prev => [...prev, { role: 'assistant', content: `⚠️ ${errorMessage}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close chat' : 'Open portfolio chat'}
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-brand-cream text-brand-obsidian shadow-[0_4px_24px_-4px_rgba(244,238,221,0.35)] hover:bg-white hover:shadow-[0_4px_28px_-4px_rgba(244,238,221,0.5)] transition-all duration-300 grid place-items-center">
        {open
          ? <X className="w-5 h-5 sm:w-6 sm:h-6" />
          : <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-[78px] sm:bottom-[88px] right-4 sm:right-7 z-50 w-[calc(100vw-2rem)] max-w-[380px] flex flex-col rounded-2xl border border-brand-cream/15 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.7)] overflow-hidden"
          style={{ background: 'linear-gradient(160deg,#0f2119 0%,#08120e 100%)', maxHeight:'min(560px,calc(100svh - 120px))' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-brand-cream/10 shrink-0">
            <div className="w-8 h-8 rounded-full bg-emerald-950/80 border border-brand-mint/30 grid place-items-center text-brand-mint">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-brand-cream leading-none">Portfolio Assistant</p>
              <p className="text-[10px] font-mono text-brand-mint mt-0.5">Powered by OpenRouter · Ling 3.0</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-brand-cream transition-colors p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-950/80 border border-brand-mint/30 grid place-items-center text-brand-mint shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px]
                  ${m.role === 'user'
                    ? 'bg-brand-cream text-brand-obsidian rounded-tr-sm font-medium leading-relaxed'
                    : 'bg-white/[0.06] text-slate-200 rounded-tl-sm border border-white/[0.06]'}`}>
                  {m.role === 'user'
                    ? <span className="whitespace-pre-wrap">{m.content}</span>
                    : <MarkdownMessage text={m.content} />
                  }
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-950/80 border border-brand-mint/30 grid place-items-center text-brand-mint shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white/[0.06] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-mint animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-mint animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-mint animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions — only shown on first open */}
          {messages.length === 1 && (
            <div className="px-4 pb-3 flex flex-wrap gap-1.5 shrink-0">
              {SUGGESTED.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-[10px] font-mono px-2.5 py-1.5 rounded-lg border border-brand-cream/15 text-slate-300 hover:border-brand-mint/40 hover:text-brand-mint transition-all bg-white/[0.03]">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-brand-cream/10 shrink-0">
            <form onSubmit={e => { e.preventDefault(); send(); }}
              className="flex items-center gap-2 bg-white/[0.05] rounded-xl border border-brand-cream/10 px-3 py-2">
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything…"
                className="flex-1 bg-transparent text-xs sm:text-[13px] text-brand-cream placeholder-slate-500 outline-none" />
              <button type="submit" disabled={!input.trim() || loading}
                className="shrink-0 w-7 h-7 rounded-lg bg-brand-cream text-brand-obsidian grid place-items-center disabled:opacity-40 hover:bg-white transition-colors">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="border-t border-brand-cream/10 bg-[#08120e] py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <span className="font-serif text-lg font-bold text-brand-cream">A.</span>
          <span className="text-xs font-mono uppercase tracking-widest text-slate-300">Adan Rahman</span>
        </div>

        {/* Social links */}
        <div className="flex items-center gap-4">
          <a href="https://github.com/Adan-Rahman-4321" target="_blank" rel="noopener noreferrer"
            className="p-2 rounded-lg border border-brand-cream/10 text-slate-400 hover:border-brand-mint/40 hover:text-brand-mint hover:bg-emerald-950/40 transition-all"
            aria-label="GitHub">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </a>
          <a href="https://www.linkedin.com/in/adanrahman" target="_blank" rel="noopener noreferrer"
            className="p-2 rounded-lg border border-brand-cream/10 text-slate-400 hover:border-brand-mint/40 hover:text-brand-mint hover:bg-emerald-950/40 transition-all"
            aria-label="LinkedIn">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a href="mailto:adanrahman916@gmail.com"
            className="p-2 rounded-lg border border-brand-cream/10 text-slate-400 hover:border-brand-mint/40 hover:text-brand-mint hover:bg-emerald-950/40 transition-all"
            aria-label="Email">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
        </div>

        {/* Copyright */}
        <p className="font-mono text-xs text-slate-500">
          Designed & built with care · © {new Date().getFullYear()}
        </p>

        {/* Quick links */}
        <div className="flex items-center gap-5 font-mono text-xs">
          <a href={resumeFile} download="Adan Rehman's Resume.docx"
            className="text-slate-400 hover:text-brand-mint transition-colors flex items-center gap-1">
            Resume ⤓
          </a>
          <a href="#home"
            className="text-slate-400 hover:text-brand-mint transition-colors flex items-center gap-1">
            Back to top ↗
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════════════════════════ */
export default function App() {
  return (
    <>
      {/* Ambient glow spheres */}
      <div className="fixed top-[-6rem] left-[-6rem] w-[40vw] max-w-[550px] h-[40vw] max-h-[550px] bg-emerald-950/40 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-[30%] right-[-10rem] w-[40vw] max-w-[600px] h-[40vw] max-h-[600px] bg-teal-900/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[10%] left-1/4 w-[50vw] max-w-[700px] h-[50vw] max-h-[700px] bg-emerald-950/30 rounded-full blur-[120px] pointer-events-none z-0" />

      <Header />
      <main className="relative z-10">
        <Home />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
