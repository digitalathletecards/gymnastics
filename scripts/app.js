/* ✨ Layla's Digital Athlete Card — Cotton Candy Dream Edition ✨ */
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');

:root{
  /* Core Palette — cotton candy + rose gold + pearl */
  --bg0: #1a0a18;
  --bg1: #220d1e;
  --pink1: #ff6eb4;
  --pink2: #ffaad4;
  --pink3: #ffd6ec;
  --peach: #ffb299;
  --lavender: #d4a8ff;
  --mint: #a8f0d4;
  --gold: #ffd700;
  --rose: #ff4d8b;
  --cream: #fff5f9;

  --card: rgba(255,182,215,.08);
  --card2: rgba(255,182,215,.12);
  --stroke: rgba(255,130,200,.22);
  --stroke2: rgba(255,130,200,.35);
  --text: #fff0f7;
  --muted: rgba(255,200,230,.72);
  --muted2: rgba(255,180,215,.52);

  --accent1: #ff6eb4;
  --accent2: #ffaad4;
  --accent3: #d4a8ff;
  --good: #a8f0d4;

  --shadow: 0 30px 90px rgba(200,0,100,.35);
  --shadow2: 0 16px 45px rgba(200,0,100,.25);
  --glow-pink: 0 0 40px rgba(255,110,180,.45), 0 0 80px rgba(255,110,180,.20);
  --glow-soft: 0 0 30px rgba(255,170,212,.30);

  --ff: "Nunito", system-ui, sans-serif;
  --ff2: "Fredoka One", cursive;

  --r: 28px;
  --ease: cubic-bezier(.2,.9,.2,1);
  --bounce: cubic-bezier(.34,1.56,.64,1);
}

*{ box-sizing:border-box; }
html,body{ height:100%; }

body{
  margin:0;
  color: var(--text);
  font-family: var(--ff);
  background:
    radial-gradient(ellipse 900px 600px at 10% 5%,  rgba(255,80,160,.22), transparent 55%),
    radial-gradient(ellipse 700px 500px at 85% 10%, rgba(212,168,255,.18), transparent 55%),
    radial-gradient(ellipse 800px 600px at 55% 95%, rgba(255,110,180,.15), transparent 55%),
    radial-gradient(ellipse 600px 400px at 30% 70%, rgba(255,200,240,.10), transparent 55%),
    linear-gradient(160deg, #1a0a18 0%, #220d1e 40%, #180816 100%);
  overflow-x: hidden;
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='5' fill='%23ff6eb4' opacity='.85'/%3E%3Ccircle cx='12' cy='12' r='9' stroke='%23ffaad4' stroke-width='1.5' fill='none' opacity='.55'/%3E%3C/svg%3E") 12 12, auto;
}

a{ color:inherit; }
button{ font-family:inherit; cursor:pointer; }

/* ── Floating hearts & stars background ── */
.float-deco{
  position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden;
}
.float-deco span{
  position:absolute;
  animation: floatUp linear infinite;
  opacity:0;
  font-size:18px;
  filter: drop-shadow(0 0 8px rgba(255,110,180,.6));
}
@keyframes floatUp{
  0%  { transform:translateY(110vh) rotate(0deg) scale(.6); opacity:0; }
  10% { opacity:.7; }
  90% { opacity:.5; }
  100%{ transform:translateY(-10vh)  rotate(360deg) scale(1.1); opacity:0; }
}

/* ── Canvas FX ── */
#fx-canvas{
  position:fixed; inset:0; width:100%; height:100%;
  z-index:1; pointer-events:none;
}

/* ── Grain overlay (soft pink) ── */
.grain{
  position:fixed; inset:0; z-index:2; pointer-events:none;
  opacity:.06;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
}

/* ── Shell ── */
.shell{
  position:relative; z-index:3;
  max-width:1200px; margin:0 auto;
  padding:20px 16px 28px;
}

/* ═══════════════════════════════════════
   TOPBAR
═══════════════════════════════════════ */
.topbar{
  display:flex; align-items:center; justify-content:space-between;
  gap:12px; padding:10px 14px;
  border-radius:999px;
  border:1.5px solid var(--stroke);
  background: linear-gradient(135deg, rgba(255,110,180,.14), rgba(212,168,255,.10));
  box-shadow: var(--shadow2), inset 0 1px 0 rgba(255,200,230,.15);
  backdrop-filter: blur(18px);
}

.brand{ display:flex; align-items:center; gap:10px; }
.brand-dot{
  width:14px; height:14px; border-radius:999px;
  background: linear-gradient(135deg, var(--pink1), var(--lavender));
  box-shadow: var(--glow-pink);
  animation: heartbeat 2.2s var(--ease) infinite;
}
@keyframes heartbeat{
  0%,100%{ transform:scale(1); }
  14%{ transform:scale(1.25); }
  28%{ transform:scale(1); }
  42%{ transform:scale(1.15); }
  56%{ transform:scale(1); }
}
.brand-text{ display:flex; flex-direction:column; line-height:1.15; }
.brand-title{ font-family:var(--ff2); font-size:15px; color:var(--pink2); letter-spacing:.01em; }
.brand-sub{ font-size:11px; color:var(--muted2); }

.topbar-actions{ display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end; }

/* ── Chips ── */
.chip{
  border:1.5px solid var(--stroke);
  background: rgba(255,110,180,.10);
  color: var(--text);
  padding:9px 14px;
  border-radius:999px;
  display:inline-flex; align-items:center; gap:8px;
  font-weight:800; font-size:13px;
  transition: transform .35s var(--bounce), background .3s, border-color .3s, box-shadow .3s;
  backdrop-filter: blur(14px);
}
.chip:hover{
  transform: translateY(-2px) scale(1.03);
  border-color: var(--pink1);
  background: rgba(255,110,180,.18);
  box-shadow: var(--glow-soft);
}
.chip:active{ transform:scale(.96); }
.chip.ghost{ background:rgba(255,110,180,.05); }
.chip-icon{
  width:20px; height:20px;
  display:grid; place-items:center;
  border-radius:8px;
  background: rgba(255,110,180,.15);
  border:1px solid rgba(255,110,180,.25);
}

/* ═══════════════════════════════════════
   HERO
═══════════════════════════════════════ */
.hero{
  display:grid;
  grid-template-columns:1.2fr .8fr;
  gap:14px; margin-top:14px;
}
@media(max-width:980px){ .hero{ grid-template-columns:1fr; } }

.nameHero{
  position:relative; border:none; text-align:left; width:100%;
  padding:24px 22px 20px;
  border-radius:var(--r);
  border:1.5px solid var(--stroke);
  background: linear-gradient(145deg, rgba(255,110,180,.13), rgba(212,168,255,.09), rgba(255,110,180,.07));
  box-shadow: var(--shadow), inset 0 1px 0 rgba(255,200,230,.18);
  overflow:hidden;
  backdrop-filter: blur(18px);
  transition: transform .55s var(--bounce), border-color .4s, box-shadow .4s;
}
.nameHero:hover{
  transform: translateY(-3px) scale(1.005);
  border-color: var(--pink1);
  box-shadow: var(--shadow), var(--glow-pink), inset 0 1px 0 rgba(255,200,230,.18);
}

/* Big shiny name glow blob */
.nameGlow{
  position:absolute; inset:-30%;
  background:
    radial-gradient(500px 280px at 20% 20%, rgba(255,110,180,.28), transparent 58%),
    radial-gradient(440px 260px at 80% 10%, rgba(212,168,255,.22), transparent 58%),
    radial-gradient(480px 300px at 55% 88%, rgba(255,170,212,.22), transparent 60%);
  filter:blur(8px); opacity:.95; transform:translateZ(0);
  animation:glowPulse 4s ease-in-out infinite;
}
@keyframes glowPulse{
  0%,100%{ opacity:.85; transform:scale(1) translateZ(0); }
  50%{ opacity:1; transform:scale(1.04) translateZ(0); }
}

.nameLine{
  position:relative; display:block;
  font-family:var(--ff2);
  letter-spacing:.01em;
  font-size:clamp(36px,5.2vw,68px);
  line-height:1.0;
  color:var(--cream);
  text-shadow: 0 4px 30px rgba(255,110,180,.5), 0 0 60px rgba(255,110,180,.18);
}
.nameLine.last{
  background:linear-gradient(90deg, #ff6eb4, #ffaad4, #d4a8ff, #ff6eb4);
  background-size:200% auto;
  -webkit-background-clip:text; background-clip:text;
  color:transparent;
  animation: gradShift 4s linear infinite;
}
@keyframes gradShift{
  0%{ background-position:0% center; }
  100%{ background-position:200% center; }
}

.nameMeta{
  position:relative; display:flex; flex-wrap:wrap;
  gap:10px; align-items:center; margin-top:14px;
}

.badge{
  font-size:11px; font-weight:800; letter-spacing:.06em;
  text-transform:uppercase; padding:8px 12px;
  border-radius:999px;
  border:1.5px solid rgba(255,110,180,.30);
  background: rgba(255,110,180,.12);
  color:var(--pink2);
}
.badge.soft{
  background:rgba(212,168,255,.10);
  border-color:rgba(212,168,255,.25);
  color:var(--lavender);
}
.tapHint{
  margin-left:auto; font-size:12px; color:var(--muted2);
  display:flex; align-items:center; gap:8px;
}
.tapHint::before{
  content:"🌸"; font-size:14px;
  animation: spin 3s linear infinite;
}
@keyframes spin{ to{ transform:rotate(360deg); } }

/* Orbit ring */
.orbit{
  position:absolute; inset:-40px -40px auto auto;
  width:230px; height:230px; border-radius:999px;
  border:1.5px dashed rgba(255,110,180,.20);
  transform:rotate(-15deg); opacity:.9;
  filter:drop-shadow(0 0 20px rgba(255,110,180,.18));
}
.orbit::before,.orbit::after{
  content:""; position:absolute; inset:0; border-radius:999px;
  background:
    radial-gradient(circle at 30% 20%, rgba(255,110,180,.95), transparent 40%),
    radial-gradient(circle at 72% 78%, rgba(212,168,255,.90), transparent 44%),
    radial-gradient(circle at 48% 55%, rgba(255,200,240,.80), transparent 46%);
  opacity:.65; filter:blur(10px);
  animation:orbitSpin 9s linear infinite;
}
.orbit::after{
  opacity:.38; filter:blur(20px); animation-duration:13s;
  animation-direction:reverse;
}
@keyframes orbitSpin{ to{ transform:rotate(360deg); } }

/* ── Bronze Level Badge ── */
.levelBadge{
  position:absolute; top:16px; right:16px;
  padding:8px 14px; border-radius:999px;
  font-family:var(--ff2); font-size:12px;
  background:linear-gradient(135deg, #c97c2e, #e8a84c, #c97c2e);
  background-size:200% auto;
  border:1.5px solid rgba(255,200,100,.45);
  box-shadow:0 0 22px rgba(200,120,40,.45), inset 0 1px 0 rgba(255,220,140,.35);
  color:#fff8ec;
  animation:gradShift 3s linear infinite;
  text-shadow:0 1px 4px rgba(0,0,0,.45);
}

/* ═══════════════════════════════════════
   GOAL CARD (Fundraising)
═══════════════════════════════════════ */
.heroRight{ display:flex; flex-direction:column; gap:12px; }

.goalCard{
  border-radius:var(--r);
  border:1.5px solid var(--stroke);
  background:linear-gradient(150deg, rgba(255,110,180,.13), rgba(212,168,255,.09), rgba(255,110,180,.07));
  box-shadow:var(--shadow), inset 0 1px 0 rgba(255,200,230,.16);
  padding:16px; overflow:hidden; position:relative;
  backdrop-filter:blur(18px);
}
.goalCard::before{
  content:""; position:absolute; inset:-40%;
  background:
    radial-gradient(380px 220px at 20% 25%, rgba(255,110,180,.20), transparent 58%),
    radial-gradient(340px 220px at 85% 8%,  rgba(212,168,255,.16), transparent 58%);
  filter:blur(12px); opacity:.9;
}
.goalTop{ position:relative; display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
.goalTitle{ font-family:var(--ff2); font-size:16px; color:var(--pink2); }
.goalSub{ font-size:12px; color:var(--muted2); margin-top:3px; max-width:40ch; }
.goalPill{
  position:relative; font-size:12px; font-weight:800;
  padding:9px 12px; border-radius:999px;
  border:1.5px solid rgba(255,110,180,.30);
  background:rgba(0,0,0,.25);
  white-space:nowrap; color:var(--pink2);
}

/* ── Progress bar ── */
.progress{
  position:relative; margin-top:14px; height:14px;
  border-radius:999px;
  background:rgba(255,110,180,.10);
  border:1.5px solid rgba(255,110,180,.18);
  overflow:hidden;
}
.progressBar{
  position:absolute; left:0; top:0; bottom:0; width:0%;
  border-radius:999px;
  background:linear-gradient(90deg, var(--rose), var(--pink1), var(--lavender), var(--pink2));
  background-size:200% auto;
  box-shadow:0 0 25px rgba(255,110,180,.5);
  transition:width 1.1s var(--ease);
  animation:gradShift 3s linear infinite;
}
/* Stars bouncing on progress bar tip */
.progressBar::after{
  content:"⭐";
  position:absolute; right:-8px; top:50%;
  transform:translateY(-50%);
  font-size:16px;
  filter:drop-shadow(0 0 6px rgba(255,215,0,.8));
  animation:starBounce 1s var(--bounce) infinite;
}
@keyframes starBounce{
  0%,100%{ transform:translateY(-50%) scale(1); }
  50%{ transform:translateY(-60%) scale(1.2); }
}
.progressGlow{
  position:absolute; inset:-60%;
  background:radial-gradient(180px 80px at 30% 50%, rgba(255,110,180,.22), transparent 65%);
  opacity:.6; filter:blur(10px); pointer-events:none;
  animation:shimmer 2.8s ease-in-out infinite;
}
@keyframes shimmer{
  0%{ transform:translateX(-10%); opacity:.25; }
  50%{ transform:translateX(10%); opacity:.65; }
  100%{ transform:translateX(-10%); opacity:.25; }
}

.goalBottom{ position:relative; margin-top:14px; display:flex; gap:10px; flex-wrap:wrap; }

/* ── CTA Buttons ── */
.cta{
  border:none; cursor:pointer; border-radius:18px;
  padding:13px 16px; display:flex; align-items:center; gap:10px;
  background:linear-gradient(90deg, var(--rose), var(--pink1), var(--lavender));
  background-size:200% auto;
  color:#fff; font-weight:900; font-family:var(--ff2); font-size:14px;
  box-shadow:0 14px 40px rgba(255,80,140,.4), inset 0 1px 0 rgba(255,255,255,.25);
  position:relative; overflow:hidden;
  transition:transform .35s var(--bounce), filter .3s;
  animation:gradShift 3s linear infinite;
}
.cta:hover{ transform:translateY(-2px) scale(1.03); filter:brightness(1.06); }
.cta:active{ transform:scale(.97); }
.cta.secondary{
  background:rgba(255,110,180,.10);
  border:1.5px solid var(--stroke);
  color:var(--text); box-shadow:none;
  animation:none;
}
.ctaPulse{
  position:absolute; inset:-40%;
  background:radial-gradient(200px 100px at 30% 50%, rgba(255,255,255,.35), transparent 60%);
  filter:blur(14px); opacity:.2;
  animation:pulse 2.2s ease-in-out infinite;
}
@keyframes pulse{
  0%,100%{ transform:translateX(-4%); opacity:.12; }
  50%{ transform:translateX(4%); opacity:.30; }
}
.ctaText,.ctaArrow{ position:relative; }

/* ── Micro note ── */
.microNote{
  border-radius:18px; border:1.5px solid var(--stroke);
  background:rgba(255,110,180,.06);
  padding:11px 14px; display:flex; align-items:center; gap:10px;
  color:var(--muted); font-size:13px;
  backdrop-filter:blur(14px);
}
.dotLive{
  width:10px; height:10px; border-radius:999px;
  background:var(--good);
  box-shadow:0 0 0 5px rgba(168,240,212,.12), 0 0 25px rgba(168,240,212,.25);
  animation:dotPulse 2s ease-in-out infinite;
}
@keyframes dotPulse{
  0%,100%{ box-shadow:0 0 0 5px rgba(168,240,212,.12), 0 0 25px rgba(168,240,212,.25); }
  50%{ box-shadow:0 0 0 8px rgba(168,240,212,.06), 0 0 40px rgba(168,240,212,.35); }
}

/* ═══════════════════════════════════════
   STAGE — Cards + Events
═══════════════════════════════════════ */
.stage{
  display:grid;
  grid-template-columns:1.25fr .75fr;
  gap:14px; margin-top:14px;
}
@media(max-width:980px){ .stage{ grid-template-columns:1fr; } }

/* ── Cards wrap ── */
.cardsWrap{
  border-radius:var(--r);
  border:1.5px solid var(--stroke);
  background:rgba(255,110,180,.05);
  box-shadow:var(--shadow2);
  padding:16px;
  backdrop-filter:blur(18px); overflow:hidden;
  position:relative;
}
.cardsWrap::before{
  content:""; position:absolute; inset:-60%; z-index:0; pointer-events:none;
  background:
    radial-gradient(350px 200px at 15% 20%, rgba(255,110,180,.12), transparent 60%),
    radial-gradient(300px 200px at 85% 80%, rgba(212,168,255,.10), transparent 60%);
  filter:blur(8px);
}
.cardsHeader{ position:relative; display:flex; justify-content:space-between; gap:12px; align-items:flex-end; }
.cardsTitle{ font-family:var(--ff2); font-size:16px; color:var(--pink2); }
.cardsSub{ font-size:12px; color:var(--muted2); }

.cardsFan{
  position:relative; height:340px; margin-top:14px;
  display:grid; place-items:center;
  user-select:none; touch-action:none; z-index:1;
}

/* ── Individual card ── */
.card{
  position:absolute;
  width:min(420px,78vw); height:280px;
  border-radius:26px; overflow:hidden;
  border:2px solid rgba(255,110,180,.25);
  background:rgba(255,110,180,.08);
  box-shadow:0 25px 70px rgba(200,0,80,.40), 0 0 0 1px rgba(255,200,220,.08);
  transform:translateZ(0);
  transition:transform .65s var(--bounce), filter .65s, opacity .55s;
  cursor:pointer;
}
.card:hover{ border-color:rgba(255,110,180,.5); }
.card img{
  width:100%; height:100%; object-fit:cover; display:block;
  transform:scale(1.04);
  filter:saturate(1.12) contrast(1.04);
  pointer-events:none; /* let clicks pass through to .card */
  user-select:none;
  -webkit-user-drag:none;
}
/* Iridescent overlay on cards */
.card::after{
  content:""; position:absolute; inset:0;
  background:
    radial-gradient(380px 180px at 18% 8%, rgba(255,110,180,.18), transparent 58%),
    radial-gradient(330px 200px at 88% 18%, rgba(212,168,255,.16), transparent 58%),
    linear-gradient(180deg, rgba(0,0,0,.06), rgba(0,0,0,.38));
  mix-blend-mode:screen; pointer-events:none; opacity:.8;
}
/* Sparkle shimmer sweep on active card */
.card[style*="scale(1.04)"]::before{
  content:""; position:absolute; inset:0; z-index:2;
  background:linear-gradient(105deg, transparent 40%, rgba(255,255,255,.12) 50%, transparent 60%);
  animation:cardSheen 3s ease-in-out infinite;
  pointer-events:none;
}
@keyframes cardSheen{
  0%{ transform:translateX(-100%); }
  60%,100%{ transform:translateX(200%); }
}
.card .cardLabel{
  position:absolute; left:14px; bottom:14px;
  display:flex; gap:8px; align-items:center;
  padding:9px 12px; border-radius:999px;
  border:1.5px solid rgba(255,110,180,.30);
  background:rgba(0,0,0,.22); backdrop-filter:blur(12px);
  color:rgba(255,255,255,.92); font-size:12px; font-weight:800;
  pointer-events:none; /* clicks pass through to .card */
}
.card .cardLabel .spark{
  width:9px; height:9px; border-radius:999px;
  background:linear-gradient(135deg, var(--pink1), var(--lavender));
  box-shadow:0 0 14px rgba(255,110,180,.55);
  animation:sparkle .8s ease-in-out infinite alternate;
}
@keyframes sparkle{
  from{ transform:scale(1); opacity:.9; }
  to{   transform:scale(1.4); opacity:1; }
}

.cardsHint{
  position:relative; z-index:1;
  display:flex; justify-content:center; gap:10px;
  margin-top:12px; color:var(--muted2); font-size:12px;
}
.kbd{
  border:1.5px solid rgba(255,110,180,.22);
  background:rgba(255,110,180,.07);
  padding:6px 12px; border-radius:999px; font-weight:800;
}
.sep{ opacity:.45; }

/* ═══════════════════════════════════════
   EVENTS
═══════════════════════════════════════ */
.eventsWrap{
  border-radius:var(--r); border:1.5px solid var(--stroke);
  background:rgba(255,110,180,.05);
  box-shadow:var(--shadow2); padding:16px;
  backdrop-filter:blur(18px);
}
.eventsTitle{ font-family:var(--ff2); font-size:16px; color:var(--pink2); }
.eventsSub{ margin-top:4px; font-size:12px; color:var(--muted2); }

.eventGrid{
  margin-top:12px; display:grid;
  grid-template-columns:1fr 1fr; gap:10px;
}

.eventBtn{
  border:1.5px solid rgba(255,110,180,.18);
  background:rgba(255,110,180,.07);
  border-radius:20px; padding:12px;
  cursor:pointer;
  transition:transform .35s var(--bounce), background .3s, border-color .3s, box-shadow .3s;
  text-align:left; display:flex; align-items:center;
  justify-content:space-between; gap:8px; color:var(--text);
}
.eventBtn:hover{
  transform:translateY(-2px) scale(1.02);
  background:rgba(255,110,180,.14);
  border-color:var(--pink1);
  box-shadow:var(--glow-soft);
}
.eventBtn:active{ transform:scale(.97); }
.eventName{ font-weight:900; font-size:13px; }
.eventMeta{ margin-top:3px; font-size:11px; color:var(--muted2); }
.eventScore{
  font-family:var(--ff2); font-size:15px;
  padding:9px 10px; border-radius:14px;
  border:1.5px solid rgba(255,110,180,.25);
  background:rgba(0,0,0,.22); min-width:70px;
  text-align:center; color:var(--pink2);
}

/* ── Sponsor Rail ── */
.sponsorRail{
  margin-top:14px; border-top:1.5px solid rgba(255,110,180,.15);
  padding-top:14px;
}
.sponsorTitle{
  font-weight:900; font-size:11px; letter-spacing:.10em;
  text-transform:uppercase; color:var(--pink2);
  display:flex; align-items:center; gap:8px;
}
.sponsorTitle::before{ content:"💎"; font-size:13px; }
.sponsorStrip{
  margin-top:10px; display:flex; gap:10px;
  overflow:auto; padding-bottom:6px;
}
.sLogo{
  flex:0 0 auto; width:112px; height:56px;
  border-radius:18px;
  border:1.5px solid rgba(255,110,180,.20);
  background:rgba(255,110,180,.07);
  display:grid; place-items:center;
  cursor:pointer;
  transition:transform .35s var(--bounce), border-color .3s, background .3s, box-shadow .3s;
  overflow:hidden;
}
.sLogo:hover{
  transform:translateY(-2px) scale(1.04);
  border-color:var(--pink1);
  background:rgba(255,110,180,.14);
  box-shadow:var(--glow-soft);
}
.sLogo img{ max-width:80%; max-height:70%; filter:drop-shadow(0 6px 16px rgba(0,0,0,.3)); }
.sponsorFoot{ margin-top:10px; font-size:11px; color:var(--muted2); }

/* ═══════════════════════════════════════
   FOOTER
═══════════════════════════════════════ */
.footer{
  margin-top:14px; display:flex; align-items:center;
  justify-content:space-between; gap:12px;
  padding:12px 16px; border-radius:999px;
  border:1.5px solid var(--stroke);
  background:rgba(255,110,180,.06);
  backdrop-filter:blur(14px);
}
.footTitle{ font-family:var(--ff2); font-size:14px; color:var(--pink2); }
.footSub{ font-size:11px; color:var(--muted2); margin-top:2px; }
.footerRight{ display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end; }

/* ═══════════════════════════════════════
   MODALS
═══════════════════════════════════════ */
.modalOverlay{
  position:fixed; inset:0; display:none;
  align-items:center; justify-content:center;
  padding:18px;
  background:rgba(20,0,15,.65);
  z-index:20; backdrop-filter:blur(4px);
}
.modalOverlay[data-open="true"]{ display:flex; }

.modalCard{
  width:min(880px,96vw);
  border-radius:28px;
  border:1.5px solid var(--stroke);
  background:linear-gradient(150deg, rgba(255,110,180,.14), rgba(212,168,255,.10), rgba(255,110,180,.08));
  box-shadow:var(--shadow), inset 0 1px 0 rgba(255,200,230,.16);
  backdrop-filter:blur(22px);
  overflow:hidden; position:relative;
  animation:modalIn .45s var(--bounce) both;
}
@keyframes modalIn{
  from{ transform:scale(.88) translateY(20px); opacity:0; }
  to{ transform:scale(1) translateY(0); opacity:1; }
}
.modalCard.wide{ width:min(1040px,96vw); }

.modalClose{
  position:absolute; right:14px; top:14px; border:none;
  width:42px; height:42px; border-radius:999px;
  border:1.5px solid rgba(255,110,180,.28);
  background:rgba(255,110,180,.12);
  color:var(--text); font-size:16px;
  transition:transform .3s var(--bounce), background .3s;
}
.modalClose:hover{
  transform:scale(1.15) rotate(90deg);
  background:rgba(255,110,180,.22);
}

.modalHead{
  padding:18px 18px 12px;
  border-bottom:1.5px solid rgba(255,110,180,.15);
  background:
    radial-gradient(500px 200px at 10% 25%, rgba(255,110,180,.16), transparent 60%),
    radial-gradient(440px 200px at 88% 0%,  rgba(212,168,255,.14), transparent 60%);
}
.modalKicker{
  font-size:11px; letter-spacing:.18em; text-transform:uppercase;
  color:var(--pink2); font-weight:800;
  display:flex; align-items:center; gap:6px;
}
.modalKicker::before{ content:"✨"; font-size:13px; }
.modalTitle{
  margin:8px 0 0; font-family:var(--ff2); font-size:clamp(18px,3vw,28px);
  color:var(--cream);
}
.modalMeta{ margin-top:10px; display:flex; gap:10px; flex-wrap:wrap; }
.metaPill{
  border:1.5px solid rgba(255,110,180,.25);
  background:rgba(255,110,180,.10);
  padding:7px 12px; border-radius:999px;
  font-size:12px; font-weight:700; color:var(--pink3);
}
.metaPill.soft{
  background:rgba(212,168,255,.10);
  border-color:rgba(212,168,255,.22);
  color:var(--lavender);
}
.modalBadges{ margin-top:10px; display:flex; flex-wrap:wrap; gap:10px; }
.modalBody{ padding:16px 18px 20px; }

/* ── Bio Layout ── */
.bioGrid{ display:grid; grid-template-columns:.9fr 1.1fr; gap:14px; }
@media(max-width:860px){ .bioGrid{ grid-template-columns:1fr; } }

.bioPhoto{
  height:250px; border-radius:24px;
  border:2px solid rgba(255,110,180,.30);
  background:rgba(255,110,180,.08);
  overflow:hidden;
  box-shadow:0 18px 55px rgba(200,0,80,.30), var(--glow-soft);
  position:relative;
}
.bioPhoto::after{
  content:""; position:absolute; inset:0;
  background:
    radial-gradient(380px 170px at 25% 10%, rgba(255,110,180,.16), transparent 60%),
    linear-gradient(180deg, rgba(0,0,0,.04), rgba(0,0,0,.32));
  pointer-events:none;
}
.bioQuick{ margin-top:12px; display:grid; gap:10px; }
.quickRow{
  border:1.5px solid rgba(255,110,180,.18);
  background:rgba(255,110,180,.07);
  border-radius:18px; padding:12px;
}
.quickLabel{ font-size:11px; color:var(--muted2); }
.quickValue{ margin-top:5px; font-weight:900; color:var(--pink3); }

.bioStory{
  border:1.5px solid rgba(255,110,180,.18);
  background:rgba(255,110,180,.07);
  border-radius:22px; padding:14px;
  line-height:1.6; color:rgba(255,240,247,.90);
  font-size:14px;
}
.bioLinks{ margin-top:12px; display:flex; gap:10px; flex-wrap:wrap; }

/* ── Event Modal ── */
.eventLayout{ display:grid; grid-template-columns:1.2fr .8fr; gap:14px; }
@media(max-width:900px){ .eventLayout{ grid-template-columns:1fr; } }

.chartBox{
  border:1.5px solid rgba(255,110,180,.18);
  background:rgba(255,110,180,.07);
  border-radius:22px; padding:12px; min-height:280px;
}
.meetList{
  border:1.5px solid rgba(255,110,180,.18);
  background:rgba(255,110,180,.07);
  border-radius:22px; padding:12px;
  max-height:360px; overflow:auto;
}
.meetRow{
  display:flex; justify-content:space-between; gap:10px;
  padding:10px 12px; border-radius:16px;
  border:1.5px solid rgba(255,110,180,.14);
  background:rgba(0,0,0,.14); margin-bottom:10px;
}
.meetLeft{ display:flex; flex-direction:column; gap:4px; }
.meetName{ font-weight:900; font-size:13px; color:var(--pink3); }
.meetDate{ font-size:11px; color:var(--muted2); }
.meetScore{
  font-family:var(--ff2); padding:8px 10px; border-radius:14px;
  border:1.5px solid rgba(255,110,180,.25);
  background:rgba(0,0,0,.22); min-width:68px;
  text-align:center; color:var(--pink2);
}

/* ── Sponsors Modal ── */
.sponsorGrid{ display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
@media(max-width:760px){ .sponsorGrid{ grid-template-columns:1fr; } }

.sponsorCard{
  border:1.5px solid rgba(255,110,180,.18);
  background:rgba(255,110,180,.07);
  border-radius:22px; padding:12px;
  display:flex; gap:12px; align-items:center; cursor:pointer;
  transition:transform .35s var(--bounce), border-color .3s, background .3s, box-shadow .3s;
}
.sponsorCard:hover{
  transform:translateY(-2px) scale(1.02);
  border-color:var(--pink1); background:rgba(255,110,180,.14);
  box-shadow:var(--glow-soft);
}
.sponsorThumb{
  width:84px; height:54px; border-radius:16px;
  border:1.5px solid rgba(255,110,180,.20);
  background:rgba(0,0,0,.14);
  display:grid; place-items:center; overflow:hidden;
}
.sponsorThumb img{ max-width:80%; max-height:70%; }
.sponsorInfo{ display:flex; flex-direction:column; gap:5px; }
.sponsorName{ font-weight:900; color:var(--pink3); }
.sponsorTag{ font-size:12px; color:var(--muted2); }

.aboutCopy{
  border:1.5px solid rgba(255,110,180,.18);
  background:rgba(255,110,180,.07);
  border-radius:22px; padding:14px; line-height:1.6;
}

/* ── Scrollbar (cute pink) ── */
::-webkit-scrollbar{ width:6px; height:6px; }
::-webkit-scrollbar-track{ background:rgba(255,110,180,.06); border-radius:999px; }
::-webkit-scrollbar-thumb{
  background:rgba(255,110,180,.35); border-radius:999px;
}
::-webkit-scrollbar-thumb:hover{ background:rgba(255,110,180,.55); }

/* ── Reduced motion ── */
@media(prefers-reduced-motion:reduce){
  *{
    animation-duration:.001ms !important;
    animation-iteration-count:1 !important;
    transition-duration:.001ms !important;
    scroll-behavior:auto !important;
  }
}
