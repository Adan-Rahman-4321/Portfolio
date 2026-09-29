/**
 * Portfolio Backend
 *  - /api/contact  →  Nodemailer + Gmail SMTP (100% free, no extensions)
 *  - /api/chat     →  OpenRouter RAG chatbot (inclusionai/ling-3.0-flash-fin)
 *
 * Run:  node --env-file=.env server/index.js
 *
 * Gmail setup (one-time, 2 minutes):
 *  1. myaccount.google.com → Security → 2-Step Verification → ON
 *  2. myaccount.google.com/apppasswords → App: "Mail", Device: "Portfolio"
 *  3. Copy the 16-char password → paste into GMAIL_APP_PASS in .env
 */

import express    from 'express';
import cors       from 'cors';
import nodemailer from 'nodemailer';

/* ── Gmail transporter ───────────────────────────────────────────────────── */
const GMAIL_USER = process.env.GMAIL_USER ?? '';
const GMAIL_PASS = process.env.GMAIL_APP_PASS ?? '';

const isSmtpReady = GMAIL_USER && GMAIL_PASS && !GMAIL_PASS.includes('your_');

const transporter = isSmtpReady
  ? nodemailer.createTransport({
      host:   'smtp.gmail.com',
      port:   465,
      secure: true,
      auth:   { user: GMAIL_USER, pass: GMAIL_PASS },
    })
  : null;

if (isSmtpReady) {
  transporter.verify((err) => {
    if (err) console.warn('⚠️  Gmail SMTP verify failed:', err.message);
    else     console.log('📧 Gmail SMTP ready');
  });
} else {
  console.warn('⚠️  GMAIL_USER / GMAIL_APP_PASS not set — email disabled');
}

/* ── Express ─────────────────────────────────────────────────────────────── */
const app  = express();
const PORT = process.env.PORT || 3001;

// Allow any localhost port (Vite picks whatever is free)
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const ok = /^http:\/\/localhost:\d+$/.test(origin)
            || origin === (process.env.CLIENT_URL ?? '');
    cb(ok ? null : new Error('CORS blocked'), ok);
  },
}));
app.use(express.json({ limit: '32kb' }));

/* ── HTML escape ─────────────────────────────────────────────────────────── */
const esc = (s) => String(s).replace(/[&<>"']/g,
  c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

/* ── Email templates ─────────────────────────────────────────────────────── */
const inquiryHtml = (name, email, message) => `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#08120e;color:#F4EEDD;padding:32px;border-radius:12px;border:1px solid rgba(244,238,221,0.15)">
  <h2 style="color:#34D399;margin-top:0">New Portfolio Inquiry</h2>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:6px 0;color:#a0b0a5;font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:0.08em">From</td></tr>
    <tr><td style="padding:0 0 14px;font-size:15px;font-weight:600;color:#F4EEDD">${esc(name)}</td></tr>
    <tr><td style="padding:6px 0;color:#a0b0a5;font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:0.08em">Reply-to</td></tr>
    <tr><td style="padding:0 0 14px"><a href="mailto:${esc(email)}" style="color:#34D399">${esc(email)}</a></td></tr>
    <tr><td style="padding:6px 0;color:#a0b0a5;font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:0.08em">Message</td></tr>
    <tr><td style="padding:0 0 14px;white-space:pre-wrap;line-height:1.75;color:#e2e8f0">${esc(message)}</td></tr>
  </table>
  <hr style="border:none;border-top:1px solid rgba(244,238,221,0.1);margin:24px 0"/>
  <p style="color:#64748b;font-size:11px;font-family:monospace;margin:0">Sent from adanrahman portfolio · adanrahman916@gmail.com</p>
</div>`;

const autoReplyHtml = (name, message) => `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#08120e;color:#F4EEDD;padding:32px;border-radius:12px;border:1px solid rgba(244,238,221,0.15)">
  <h2 style="color:#34D399;margin-top:0">Hey ${esc(name)},</h2>
  <p style="color:#e2e8f0;line-height:1.8;margin-top:0">Thanks for reaching out — I've received your message and will reply within 24–48 hours.</p>
  <blockquote style="border-left:3px solid #34D399;margin:20px 0;padding:12px 20px;background:rgba(52,211,153,0.06);border-radius:0 8px 8px 0;color:#94a3b8;font-style:italic;line-height:1.7">
    "${esc(message.slice(0, 200))}${message.length > 200 ? '…' : ''}"
  </blockquote>
  <p style="color:#e2e8f0;line-height:1.8">Check out my work on <a href="https://github.com/Adan-Rahman-4321" style="color:#34D399">GitHub</a> in the meantime.</p>
  <p style="color:#e2e8f0;margin-top:24px;margin-bottom:0">— Adan Rahman</p>
  <hr style="border:none;border-top:1px solid rgba(244,238,221,0.1);margin:24px 0"/>
  <p style="color:#64748b;font-size:11px;font-family:monospace;margin:0">adanrahman916@gmail.com · github.com/Adan-Rahman-4321</p>
</div>`;

/* ── POST /api/contact ───────────────────────────────────────────────────── */
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body ?? {};

  if (!name?.trim() || !email?.trim() || !message?.trim())
    return res.status(400).json({ success: false, error: 'All fields are required.' });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ success: false, error: 'Invalid email address.' });

  if (!transporter)
    return res.status(503).json({
      success: false,
      error: 'Email service is not configured yet. Please reach out directly at adanrahman916@gmail.com',
    });

  const safeName    = name.trim().slice(0, 100);
  const safeEmail   = email.trim().slice(0, 200);
  const safeMessage = message.trim().slice(0, 2000);
  const ownerEmail  = GMAIL_USER;

  try {
    // 1️⃣ Inquiry → Adan
    await transporter.sendMail({
      from:    `"Portfolio Contact" <${ownerEmail}>`,
      to:      ownerEmail,
      replyTo: safeEmail,
      subject: `Portfolio inquiry from ${safeName}`,
      html:    inquiryHtml(safeName, safeEmail, safeMessage),
    });

    // 2️⃣ Auto-reply → sender
    await transporter.sendMail({
      from:    `"Adan Rahman" <${ownerEmail}>`,
      to:      safeEmail,
      subject: `Got your message, ${safeName}!`,
      html:    autoReplyHtml(safeName, safeMessage),
    });

    return res.json({ success: true, message: 'Message sent!' });

  } catch (err) {
    console.error('SMTP error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to send email. Please try again or email adanrahman916@gmail.com directly.',
    });
  }
});

/* ── POST /api/chat ──────────────────────────────────────────────────────── */
const PORTFOLIO_CONTEXT = `
You are Adan Rahman's portfolio assistant — a helpful, concise AI embedded in his personal portfolio website.
Answer ONLY questions related to Adan and his work. For anything unrelated, politely redirect.

=== ABOUT ADAN ===
Name: Adan Rahman
Role: Backend Developer & .NET Specialist
Location: Rawalpindi, Pakistan
Education: BS Software Engineering — ARID Agriculture University, Rawalpindi
Email: adanrahman916@gmail.com
GitHub: https://github.com/Adan-Rahman-4321
LinkedIn: https://www.linkedin.com/in/adanrahman
Status: Available for select projects and full-time roles
Languages: English, Urdu, Punjabi

=== EXPERIENCE ===
- Web Development Intern at Arch Technologies, Rawalpindi (Feb 2026 – Mar 2026, 8 weeks)
- Specialization: .NET & Distributed REST APIs

=== SKILLS ===
Backend: C#, ASP.NET Core 8, Web API, MVC, Razor Pages, Entity Framework Core, LINQ, RESTful APIs, Node.js, Express.js, Python
Frontend: HTML5, CSS3, JavaScript, TypeScript, React, Next.js, Vite, React Router, Bootstrap 5, Tailwind CSS, jQuery, Font Awesome, SweetAlert2, Canvas API
Database: SQL Server, T-SQL, PostgreSQL, SQLite/SQL.js, MongoDB, Mongoose, Supabase, Turso (libSQL), EF Core Migrations, Relational DB Design, RLS
Security: JWT, ASP.NET Identity, Firebase Auth, Session-Based Auth, OAuth2, RBAC, OTP/Email Verification, Secure Coding
AI / LLM: LLM Integration, Prompt Engineering, Gemini API, OpenRouter, Gmail API, Microsoft Graph API, RAG, exifr, heic2any
DevOps: Docker, GitHub Actions, CI/CD, Git, Vercel, Render, Postman, Visual Studio, VS Code, jszip, QR Code Generation
Architecture: 3-Tier, Clean Architecture, REST API Design, Agile/Scrum, Repository Pattern, DI

=== PROJECTS ===
1. EduAI (Full Stack) — https://edu-ai-smart.vercel.app/
   AI bilingual education platform, 4 roles, Urdu/RTL, parent reports.
   Tech: Next.js 16, React 19, TypeScript, Supabase, PostgreSQL, Firebase, Gemini 2.0 Flash, OpenRouter, Vercel

2. Esport Stat System (Full Stack)
   Tournament management, automated scoring, leaderboards, live standings.
   Tech: ASP.NET Core 8, C#, MVC, EF Core, SQL Server, Docker, GitHub Actions

3. Student Management API (Backend)
   Secure CRUD REST API, 3-tier architecture, JWT auth.
   Tech: C#, ASP.NET Core 8, Web API, JWT, EF Core, SQL Server, Docker, GitHub Actions

4. Online Book Store (Full Stack)
   Role-based Admin/Customer, 3-tier architecture, responsive Bootstrap UI.
   Tech: ASP.NET Core MVC, C#, SQL Server, EF Core, Bootstrap

5. Foodie Files (Full Stack)
   CRUD recipe manager, Identity auth, RBAC, SMTP notifications.
   Tech: ASP.NET Core 8, MVC, ASP.NET Identity, SMTP, EF Core, SQL Server

6. Chaki Munshi (Full Stack) — https://chaki-munshi.onrender.com/
   All-in-one management system for atta chakki / flour mill operations.
   Features: Dashboard, customer records, wheat intake, flour issue tracking, payments, expenses, daily/monthly/yearly reports, invoice QR codes.
   Tech: React 19, Vite, Tailwind CSS 4, Node.js, Express 5, Turso (libSQL/SQLite), React Router 7

7. MetaStrip Pro (Frontend) — https://meta-remover-kappa.vercel.app/
   Privacy-first browser-based image metadata inspector and cleaner.
   Features: EXIF/GPS/IPTC/XMP inspection, client-side re-encoding, batch ZIP download, HEIC/HEIF conversion, no uploads or server.
   Tech: React, TypeScript, Vite, exifr, heic2any, jszip, lucide-react

8. Smart Diagnostic Lab System (Full Stack) — https://lab-diagnostic-system.vercel.app/
   Web-based diagnostic lab and slot management system with 5 user roles (Admin, Receptionist, Technician, Doctor, Patient).
   Covers: appointments, queue, samples, test results, billing, inventory, reports.
   Tech: Node.js, Express, SQL.js, HTML5, CSS3, JavaScript, Session Auth

9. TimeCrafters (Frontend) — https://timecrafter.vercel.app/
   Responsive luxury watch storefront with hero carousel, product collection, interactive cart, demo checkout dialogs.
   Tech: HTML5, CSS3, Bootstrap 5, JavaScript, Font Awesome, SweetAlert2

10. Lumina (Frontend) — https://lumina-gamma-beige.vercel.app/
    React ecommerce storefront with product catalog, category filtering, cart with quantity controls, checkout validation, client-side routing.
    Tech: React 19, React Router, Vite, lucide-react

11. Aim Buddy (Frontend) — https://aim-buddy.vercel.app/
    Gaming aim-training website with dark UI, landing page, about, blog cards, login/signup screens.
    Tech: HTML5, CSS3, Responsive Design, JavaScript

12. QR Generator with Login Module (Backend)
    Console-based QR code generator with login, signup, forgot-password flow, OTP email, and per-user QR PNG storage.
    Tech: C#, .NET 8, Console App, OTP Email, File-Based Storage, QR Code Generation

13. AI Email Manager System (Full Stack)
    Email management system that fetches and classifies emails into 4 categories (Most Important, Important, Casual, Promotional) using a native C# AI engine, with Gmail API and Microsoft Graph support.
    Tech: C#, .NET 8, ASP.NET Core, Razor Pages, EF Core, SQL Server, Gmail API, Microsoft Graph, Gemini AI, Bootstrap 5

=== CERTIFICATIONS ===
- .NET Specialist — ASP.NET Core, C#, Web API, EF Core
- Front-End Development — EWX Professional Training Institute

=== PERSONALITY ===
Curious by nature. Values dependable systems and accessible experiences.
Good work starts with good questions.
Open to internships, junior roles, contract, and freelance work.
`;

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0)
    return res.status(400).json({ success: false, error: 'Messages array is required.' });

  const apiKey = process.env.OPENROUTER_API_KEY ?? '';
  if (!apiKey || apiKey.includes('your_'))
    return res.status(503).json({ success: false, error: 'Chat service is not configured yet.' });

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
        'HTTP-Referer':  process.env.CLIENT_URL || 'http://localhost:5173',
        'X-Title':       'Adan Rahman Portfolio',
      },
      body: JSON.stringify({
        model:       'inclusionai/ling-3.0-flash-fin',
        messages:    [{ role: 'system', content: PORTFOLIO_CONTEXT }, ...messages.slice(-10)],
        max_tokens:  512,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        success: false,
        error: err?.error?.message || 'LLM request failed.',
      });
    }

    const data  = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "I'm not sure how to answer that right now.";
    return res.json({ success: true, reply });

  } catch (err) {
    console.error('Chat error:', err.message);
    return res.status(500).json({ success: false, error: 'Chat unavailable. Please try again.' });
  }
});

/* ── Start ───────────────────────────────────────────────────────────────── */
app.listen(PORT, () => console.log(`✅  Server → http://localhost:${PORT}`));
