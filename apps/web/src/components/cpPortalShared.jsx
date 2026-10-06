import { Home, Users, TrendingUp, Settings, Building2, IndianRupee, Search, Headphones, UserCheck } from 'lucide-react';

// Shared by the Channel Partner portal pages (login + become-a-partner).
export const SKY_BG = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop';
export const FEATURES = [
  { icon: Home, label: 'Verified\nListings', bg: '#16a34a' },
  { icon: Users, label: 'Genuine\nBuyer Leads', bg: '#2563eb' },
  { icon: TrendingUp, label: 'Grow Your\nEarnings', bg: '#f59e0b' },
  { icon: Settings, label: 'Easy to Use\nPlatform', bg: '#7c3aed' },
];

export const STATS = [
  { icon: Building2, title: '100+', sub: 'Properties to Access' },
  { icon: Users, title: 'Genuine', sub: 'Buyer Requirements' },
  { icon: IndianRupee, title: 'Better', sub: 'Earning Opportunities' },
  { icon: TrendingUp, title: 'Dedicated Support', sub: 'for Channel Partners' },
];

export const WHY = [
  { icon: Search, bg: '#d1fae5', color: '#059669', title: 'Wide Property Inventory', text: 'Access residential, commercial and plotted properties across Greater Noida, Noida & YEIDA.' },
  { icon: UserCheck, bg: '#ffe4e6', color: '#e11d48', title: 'Verified Buyer Leads', text: 'Get genuine buyer enquiries and requirements.' },
  { icon: IndianRupee, bg: '#fef3c7', color: '#d97706', title: 'Manage Your Business', text: 'List properties, share links, track enquiries and grow your network.' },
  { icon: Headphones, bg: '#ede9fe', color: '#7c3aed', title: "We're With You", text: 'Dedicated support and ground-level assistance to help you close more deals.' },
];

export const CP_PORTAL_CSS = `
.cpl-root { min-height: 100vh; background: #fffdf8; font-family: inherit; color: #0f172a; overflow-x: hidden; }
.cpl-hero { position: relative; background: linear-gradient(180deg, #dbeafe 0%, #fef9ec 55%, #f0fdf4 100%); overflow: hidden; }
.cpl-sky { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0.32; }
.cpl-wash { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(255,253,245,0.92) 0%, rgba(255,253,245,0.55) 52%, rgba(255,253,245,0.15) 100%); }
.cpl-inner { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; padding: 28px 40px 0; display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); column-gap: 24px; min-height: 640px; }
.cpl-top { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.cpl-logo { height: 62px; width: auto; object-fit: contain; display: block; }
.cpl-apply-top { font-size: 14px; color: #334155; }
.cpl-apply-top a { color: #15803d; font-weight: 700; text-decoration: underline; margin-left: 6px; }
.cpl-left { position: relative; padding-bottom: 36px; }
.cpl-badge { display: inline-flex; align-items: center; gap: 8px; background: #166534; color: #fff; border-radius: 999px; padding: 9px 20px; font-size: 14px; font-weight: 600; letter-spacing: .4px; margin: 18px 0 16px; }
.cpl-h1 { font-size: 56px; line-height: 1.04; font-weight: 800; letter-spacing: -1.5px; margin: 0 0 16px; color: #0b1730; }
.cpl-h1 span { color: #15803d; }
.cpl-lead { font-size: 17px; line-height: 1.5; color: #1e293b; max-width: 460px; margin: 0 0 22px; }
.cpl-feats { display: flex; gap: 22px; margin-bottom: 22px; }
.cpl-feat { text-align: center; font-size: 13px; font-weight: 600; line-height: 1.25; color: #1e293b; white-space: pre-line; width: 84px; }
.cpl-feat i { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; color: #fff; box-shadow: 0 6px 14px rgba(0,0,0,.14); }
.cpl-brush { position: relative; display: inline-block; transform: rotate(-4deg); margin: 6px 0 0 -6px; padding: 22px 54px 22px 34px; background: #fde047; clip-path: polygon(2% 12%, 18% 2%, 60% 6%, 98% 0, 100% 40%, 96% 92%, 55% 100%, 10% 94%, 0 60%); font-family: 'Caveat', 'Segoe Script', 'Brush Script MT', cursive; font-style: italic; font-weight: 700; font-size: 34px; line-height: 1.05; color: #0b1730; }
.cpl-brush b { display: block; color: #14532d; }
.cpl-person { position: absolute; right: -10px; bottom: 0; height: 560px; width: auto; max-width: 62%; object-fit: contain; object-position: bottom; z-index: 0; pointer-events: none; }
.cpl-hand { position: absolute; top: 70px; right: 28%; font-family: 'Caveat', 'Segoe Script', cursive; font-style: italic; font-weight: 600; font-size: 25px; line-height: 1.1; color: #1e293b; transform: rotate(-8deg); z-index: 1; }
.cpl-right { display: flex; align-items: center; justify-content: center; padding-bottom: 40px; position: relative; z-index: 2; }
.cpl-card { width: 100%; max-width: 440px; background: #fff; border-radius: 24px; padding: 34px 34px 28px; box-shadow: 0 24px 60px rgba(15,23,42,.18); text-align: center; }
.cpl-card-logo { height: 52px; width: auto; display: block; margin: 0 auto 18px; }
.cpl-card h2 { font-size: 27px; font-weight: 800; margin: 0 0 10px; color: #0b1730; }
.cpl-card .sub { font-size: 14.5px; line-height: 1.5; color: #475569; margin: 0 auto 22px; max-width: 320px; }
.cpl-wa { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: linear-gradient(180deg, #22a652, #15803d); color: #fff; border: none; border-radius: 10px; padding: 15px 0; font-size: 17px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 18px rgba(21,128,61,.28); }
.cpl-secure { display: flex; justify-content: center; align-items: center; gap: 14px; font-size: 12.5px; color: #475569; margin: 16px 0 14px; }
.cpl-secure span { display: inline-flex; align-items: center; gap: 5px; }
.cpl-secure em { width: 1px; height: 14px; background: #cbd5e1; }
.cpl-or { display: flex; align-items: center; gap: 12px; color: #64748b; font-size: 13px; margin-bottom: 14px; }
.cpl-or::before, .cpl-or::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
.cpl-alt { width: 100%; display: flex; align-items: center; justify-content: center; gap: 9px; background: #f0fdf4; color: #166534; border: 1.5px solid #86efac; border-radius: 10px; padding: 13px 0; font-size: 15px; font-weight: 600; cursor: pointer; }
.cpl-foot { margin-top: 18px; font-size: 14.5px; color: #475569; }
.cpl-foot a, .cpl-foot button { color: #15803d; font-weight: 700; text-decoration: underline; background: none; border: none; cursor: pointer; padding: 0; font: inherit; font-weight: 700; }
.cpl-label { display: block; text-align: left; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 5px; }
.cpl-input { width: 100%; padding: 12px 14px; border-radius: 10px; border: 1.5px solid #d1d5db; font-size: 14.5px; outline: none; background: #fff; color: #111; box-sizing: border-box; }
.cpl-input:focus { border-color: #16a34a; }
.cpl-err { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; color: #dc2626; font-size: 14px; text-align: left; }
.cpl-stats { position: relative; z-index: 2; background: #0f3b33; color: #fff; border-radius: 40px 40px 0 0; max-width: 1280px; margin: 0 auto; }
.cpl-stats-in { display: grid; grid-template-columns: repeat(4, 1fr); padding: 22px 36px; }
.cpl-stat { display: flex; align-items: center; gap: 14px; padding: 0 18px; border-left: 1px solid rgba(255,255,255,.14); }
.cpl-stat:first-child { border-left: none; }
.cpl-stat svg { width: 40px; height: 40px; color: #facc15; flex-shrink: 0; }
.cpl-stat b { display: block; font-size: 23px; font-weight: 800; line-height: 1.1; }
.cpl-stat small { display: block; line-height: 1.3; font-size: 14px; color: #d1fae5; }
.cpl-why { max-width: 1280px; margin: 0 auto; padding: 36px 40px 56px; background: #fffdf8; border-radius: 40px 40px 0 0; margin-top: -1px; position: relative; z-index: 3; }
.cpl-why h3 { font-size: 30px; font-weight: 800; margin: 0 0 6px; color: #0b1730; }
.cpl-why h3 span { color: #15803d; }
.cpl-why .bar { width: 38px; height: 3px; background: #15803d; border-radius: 2px; margin-bottom: 22px; }
.cpl-why-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.cpl-why-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 18px; padding: 24px; box-shadow: 0 6px 20px rgba(15,23,42,.05); }
.cpl-why-card i { width: 62px; height: 62px; border-radius: 18px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.cpl-why-card h4 { font-size: 17px; font-weight: 700; margin: 0 0 6px; color: #0b1730; }
.cpl-why-card p { font-size: 14.5px; line-height: 1.5; color: #64748b; margin: 0; }
.cpl-m-only { display: none; }

@media (max-width: 960px) {
  .cpl-inner { grid-template-columns: minmax(0, 1fr); padding: 18px 16px 0; min-height: 0; }
  .cpl-left, .cpl-right, .cpl-card { min-width: 0; max-width: 100%; }
  .cpl-badge { font-size: 12.5px; padding: 8px 14px; }
  .cpl-top { justify-content: center; flex-direction: column; gap: 0; }
  .cpl-apply-top { display: none; }
  .cpl-logo { height: 54px; margin: 0 auto; }
  .cpl-left { text-align: center; padding-bottom: 0; }
  .cpl-h1 { font-size: 38px; letter-spacing: -1px; }
  .cpl-lead { margin-left: auto; margin-right: auto; font-size: 15.5px; }
  .cpl-feats { justify-content: center; gap: 4px; background: rgba(255,255,255,.55); backdrop-filter: blur(4px); border-radius: 22px; padding: 14px 8px; }
  .cpl-feat { width: 72px; font-size: 11.5px; }
  .cpl-feat i { width: 50px; height: 50px; }
  .cpl-brush, .cpl-d-only { display: none; }
  .cpl-m-only { display: block; }
  .cpl-person { position: relative; right: auto; display: block; margin: 8px auto -1px; height: 300px; max-width: 80%; }
  .cpl-hand { position: absolute; top: auto; bottom: 150px; right: 6%; font-size: 17px; }
  .cpl-right { padding-bottom: 28px; margin-top: -10px; }
  .cpl-card { border-radius: 24px; padding: 26px 22px 22px; }
  .cpl-card-logo { display: none; }
  .cpl-card h2 { font-size: 22px; }
  .cpl-secure { display: none; }
  .cpl-stats { border-radius: 0; }
  .cpl-stats-in { grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 16px 0; padding: 20px 14px; }
  .cpl-stat { padding: 0 10px; }
  .cpl-stat:nth-child(odd) { border-left: none; }
  .cpl-stat b { font-size: 18px; }
  .cpl-stat small { font-size: 12.5px; }
  .cpl-stat svg { width: 30px; height: 30px; }
  .cpl-why { border-radius: 28px 28px 0 0; padding: 26px 18px 40px; }
  .cpl-why h3 { font-size: 24px; }
  .cpl-why-grid { grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 12px; }
  .cpl-why-card { padding: 16px; }
  .cpl-why-card i { width: 50px; height: 50px; }
  .cpl-why-card h4 { font-size: 15px; }
  .cpl-why-card p { font-size: 13px; }
}

.cpl-perks { list-style: none; padding: 0; margin: 0 0 22px; text-align: left; display: flex; flex-direction: column; gap: 10px; }
.cpl-perks li { display: flex; align-items: center; gap: 10px; font-size: 15px; color: #1e293b; }
.cpl-perks svg { color: #16a34a; flex-shrink: 0; }
.cpl-apply-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: linear-gradient(180deg, #22a652, #15803d); color: #fff; border: none; border-radius: 12px; padding: 18px 0; font-size: 20px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 22px rgba(21,128,61,.32); text-decoration: none; }
.cpl-apply-btn:hover { filter: brightness(1.05); }
.cpl-apply-section { max-width: 700px; margin: 0 auto; padding: 8px 20px 64px; scroll-margin-top: 16px; }
.cpl-apply-section h3 { font-size: 30px; font-weight: 800; text-align: center; margin: 0 0 6px; color: #0b1730; }
.cpl-apply-section .lead2 { text-align: center; color: #64748b; margin: 0 0 24px; font-size: 15px; }

.cpl-form-card { padding: 36px 32px; }
@media (max-width: 640px) { .cpl-apply-section { padding: 8px 10px 48px; } .cpl-form-card { padding: 22px 16px; } }
@media (max-width: 960px) { .cpl-apply-section h3 { font-size: 24px; } .cpl-apply-btn { font-size: 18px; padding: 16px 0; } }
`;
