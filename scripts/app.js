:root{
  --bg0:#050613;
  --bg1:#070a1b;
  --card: rgba(255,255,255,.06);
  --card2: rgba(255,255,255,.08);
  --stroke: rgba(255,255,255,.12);
  --stroke2: rgba(255,255,255,.18);
  --text: rgba(255,255,255,.92);
  --muted: rgba(255,255,255,.62);
  --muted2: rgba(255,255,255,.45);
  --accent1:#ffb3e0;
  --accent2:#7dd3ff;
  --accent3:#a78bfa;
  --good:#6ee7b7;

  --shadow: 0 30px 90px rgba(0,0,0,.55);
  --shadow2: 0 16px 45px rgba(0,0,0,.45);

  --ff: "Manrope", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  --ff2:"Orbitron", ui-sans-serif, system-ui;

  --r: 24px;
  --ease: cubic-bezier(.2,.9,.2,1);
}

*{ box-sizing:border-box; }
html,body{ height:100%; }
body{
  margin:0;
  color:var(--text);
  font-family:var(--ff);
  background:
    radial-gradient(1100px 700px at 15% 10%, rgba(167,139,250,.18), transparent 55%),
    radial-gradient(900px 600px at 80% 15%, rgba(125,211,255,.12), transparent 55%),
    radial-gradient(700px 500px at 50% 95%, rgba(255,179,224,.10), transparent 55%),
    linear-gradient(180deg, var(--bg1), var(--bg0));
  overflow-x:hidden;
}

a{ color:inherit; }
button{ font-family:inherit; }

/* FX layers */
#fx-canvas{
  position:fixed;
  inset:0;
  width:100%;
  height:100%;
  z-index:0;
  pointer-events:none;
}

.vignette{
  position:fixed;
  inset:-2px;
  z-index:1;
  pointer-events:none;
  background:
    radial-gradient(1200px 700px at 50% 15%, transparent 55%, rgba(0,0,0,.55) 100%),
    radial-gradient(900px 600px at 50% 100%, transparent 55%, rgba(0,0,0,.55) 100%);
  mix-blend-mode: multiply;
}

.grain{
  position:fixed;
  inset:0;
  z-index:2;
  pointer-events:none;
  opacity:.10;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
}

/* Layout shell */
.shell{
  position:relative;
  z-index:3;
  max-width:1200px;
  margin:0 auto;
  padding:22px 18px 28px;
}

/* Topbar */
.topbar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:14px;
  padding:10px 12px;
  border-radius:18px;
  border:1px solid var(--stroke);
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  box-shadow: var(--shadow2);
  backdrop-filter: blur(14px);
}

.brand{ display:flex; align-items:center; gap:10px; }
.brand-dot{
  width:12px; height:12px; border-radius:999px;
  background: linear-gradient(135deg, var(--accent1), var(--accent2));
  box-shadow: 0 0 0 6px rgba(255,179,224,.08), 0 0 40px rgba(125,211,255,.22);
}
.brand-text{ display:flex; flex-direction:column; line-height:1.1; }
.brand-title{ font-weight:800; letter-spacing:.02em; }
.brand-sub{ font-size:12px; color:var(--muted2); }

.topbar-actions{ display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end; }

/* Chips */
.chip{
  border:1px solid var(--stroke);
  background: rgba(255,255,255,.06);
  color:var(--text);
  padding:10px 12px;
  border-radius:999px;
  display:inline-flex;
  align-items:center;
  gap:9px;
  cursor:pointer;
  transition: transform .35s var(--ease), background .35s var(--ease), border-color .35s var(--ease);
  backdrop-filter: blur(14px);
}
.chip:hover{
  transform: translateY(-1px);
  border-color: rgba(255,255,255,.22);
  background: rgba(255,255,255,.08);
}
.chip:active{ transform: translateY(0px) scale(.98); }
.chip.ghost{ background: rgba(255,255,255,.03); }
.chip-icon{
  width:18px; height:18px;
  display:grid; place-items:center;
  border-radius:6px;
  background: rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.10);
}

/* Hero */
.hero{
  display:grid;
  grid-template-columns: 1.2fr .8fr;
  gap:16px;
  margin-top:14px;
}
@media (max-width: 980px){
  .hero{ grid-template-columns: 1fr; }
}

.nameHero{
  position:relative;
  border:none;
  text-align:left;
  width:100%;
  padding:22px 20px 18px;
  border-radius: var(--r);
  border:1px solid var(--stroke);
  background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.03));
  box-shadow: var(--shadow);
  cursor:pointer;
  overflow:hidden;
  backdrop-filter: blur(16px);
  transition: transform .55s var(--ease), border-color .55s var(--ease);
}
.nameHero:hover{
  transform: translateY(-2px);
  border-color: rgba(255,255,255,.22);
}
.nameGlow{
  position:absolute; inset:-20%;
  background:
    radial-gradient(600px 260px at 25% 25%, rgba(255,179,224,.18), transparent 60%),
    radial-gradient(520px 260px at 80% 10%, rgba(125,211,255,.14), transparent 60%),
    radial-gradient(560px 320px at 60% 90%, rgba(167,139,250,.14), transparent 62%);
  filter: blur(6px);
  opacity:.9;
  transform: translateZ(0);
}

.nameLine{
  position:relative;
  display:block;
  font-family: var(--ff2);
  font-weight:900;
  letter-spacing:.02em;
  text-transform:uppercase;
  font-size: clamp(34px, 5vw, 64px);
  line-height:1.0;
  text-shadow:
    0 10px 45px rgba(0,0,0,.55),
    0 0 40px rgba(255,179,224,.18),
    0 0 60px rgba(125,211,255,.12);
}
.nameLine.last{
  background: linear-gradient(90deg, rgba(255,255,255,.92), rgba(255,179,224,.92), rgba(125,211,255,.9));
  -webkit-background-clip:text;
  background-clip:text;
  color: transparent;
}

.nameMeta{
  position:relative;
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  align-items:center;
  margin-top:14px;
}

.badge{
  font-size:12px;
  letter-spacing:.08em;
  text-transform:uppercase;
  padding:9px 10px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
}
.badge.soft{
  color: rgba(255,255,255,.78);
  background: rgba(255,255,255,.04);
}
.tapHint{
  margin-left:auto;
  font-size:12px;
  color: var(--muted2);
  display:flex;
  align-items:center;
  gap:10px;
}
.tapHint::before{
  content:"";
  width:8px; height:8px; border-radius:999px;
  background: linear-gradient(135deg, var(--accent1), var(--accent2));
  box-shadow: 0 0 16px rgba(255,179,224,.35);
}

/* Fireflies orbit ring */
.orbit{
  position:absolute;
  inset:-40px -40px auto auto;
  width:220px; height:220px;
  border-radius:999px;
  border:1px dashed rgba(255,255,255,.12);
  transform: rotate(-15deg);
  opacity:.9;
  filter: drop-shadow(0 0 20px rgba(255,179,224,.12));
}
.orbit::before,
.orbit::after{
  content:"";
  position:absolute;
  inset:0;
  border-radius:999px;
  background:
    radial-gradient(circle at 30% 20%, rgba(255,179,224,.9), transparent 40%),
    radial-gradient(circle at 70% 75%, rgba(125,211,255,.85), transparent 45%),
    radial-gradient(circle at 45% 55%, rgba(167,139,250,.75), transparent 45%);
  opacity:.6;
  filter: blur(10px);
  animation: orbitSpin 8s linear infinite;
}
.orbit::after{
  opacity:.35;
  filter: blur(18px);
  animation-duration: 12s;
}
@keyframes orbitSpin{
  from{ transform: rotate(0deg); }
  to{ transform: rotate(360deg); }
}

/* Goal card */
.heroRight{ display:flex; flex-direction:column; gap:12px; }

.goalCard{
  border-radius: var(--r);
  border:1px solid var(--stroke);
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  box-shadow: var(--shadow);
  padding:16px;
  overflow:hidden;
  position:relative;
  backdrop-filter: blur(16px);
}
.goalCard::before{
  content:"";
  position:absolute;
  inset:-40%;
  background:
    radial-gradient(400px 240px at 25% 30%, rgba(255,179,224,.16), transparent 60%),
    radial-gradient(380px 240px at 85% 10%, rgba(125,211,255,.12), transparent 60%);
  filter: blur(10px);
  opacity:.9;
}
.goalTop{ position:relative; display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
.goalTitle{ font-weight:800; letter-spacing:.01em; }
.goalSub{ font-size:12px; color: var(--muted2); margin-top:4px; max-width:42ch; }
.goalPill{
  position:relative;
  font-size:12px;
  padding:10px 10px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(0,0,0,.18);
  white-space:nowrap;
}

.progress{
  position:relative;
  margin-top:14px;
  height:12px;
  border-radius:999px;
  background: rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.10);
  overflow:hidden;
}
.progressBar{
  position:absolute;
  left:0; top:0; bottom:0;
  width:0%;
  border-radius:999px;
  background: linear-gradient(90deg, var(--accent1), var(--accent2), var(--accent3));
  box-shadow: 0 0 30px rgba(125,211,255,.25);
  transition: width .9s var(--ease);
}
.progressGlow{
  position:absolute;
  inset:-50%;
  background: radial-gradient(200px 90px at 30% 50%, rgba(255,179,224,.18), transparent 65%);
  opacity:.55;
  filter: blur(12px);
  pointer-events:none;
  animation: shimmer 2.6s var(--ease) infinite;
}
@keyframes shimmer{
  0%{ transform: translateX(-10%); opacity:.28; }
  50%{ transform: translateX(10%); opacity:.6; }
  100%{ transform: translateX(-10%); opacity:.28; }
}

.goalBottom{
  position:relative;
  margin-top:14px;
  display:flex;
  gap:10px;
  flex-wrap:wrap;
}

.cta{
  border:none;
  cursor:pointer;
  border-radius:16px;
  padding:12px 14px;
  display:flex;
  align-items:center;
  gap:10px;
  background: linear-gradient(90deg, rgba(255,179,224,.95), rgba(125,211,255,.92));
  color: rgba(10,12,25,.95);
  font-weight:900;
  letter-spacing:.01em;
  box-shadow: 0 18px 55px rgba(0,0,0,.45);
  position:relative;
  overflow:hidden;
  transition: transform .35s var(--ease), filter .35s var(--ease);
}
.cta:hover{ transform: translateY(-1px); filter: brightness(1.02); }
.cta:active{ transform: translateY(0px) scale(.985); }
.cta.secondary{
  background: rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.14);
  color: var(--text);
  box-shadow: none;
}
.ctaPulse{
  position:absolute;
  inset:-40%;
  background: radial-gradient(220px 110px at 30% 50%, rgba(255,255,255,.35), transparent 60%);
  filter: blur(14px);
  opacity:.22;
  animation: pulse 2.2s var(--ease) infinite;
}
@keyframes pulse{
  0%{ transform: translateX(-4%); opacity:.12; }
  50%{ transform: translateX(4%); opacity:.28; }
  100%{ transform: translateX(-4%); opacity:.12; }
}
.ctaText{ position:relative; }
.ctaArrow{ position:relative; opacity:.9; }

.microNote{
  border-radius: 18px;
  border:1px solid var(--stroke);
  background: rgba(255,255,255,.03);
  padding:12px 12px;
  display:flex;
  align-items:center;
  gap:10px;
  color: var(--muted);
  backdrop-filter: blur(14px);
}
.dotLive{
  width:10px; height:10px; border-radius:999px;
  background: var(--good);
  box-shadow: 0 0 0 6px rgba(110,231,183,.10), 0 0 30px rgba(110,231,183,.20);
}

/* Stage */
.stage{
  display:grid;
  grid-template-columns: 1.25fr .75fr;
  gap:16px;
  margin-top:16px;
}
@media (max-width: 980px){
  .stage{ grid-template-columns: 1fr; }
}

.cardsWrap{
  border-radius: var(--r);
  border:1px solid var(--stroke);
  background: rgba(255,255,255,.03);
  box-shadow: var(--shadow2);
  padding:16px;
  backdrop-filter: blur(16px);
  overflow:hidden;
}
.cardsHeader{ display:flex; justify-content:space-between; gap:12px; align-items:flex-end; }
.cardsTitle{ font-weight:900; letter-spacing:.01em; }
.cardsSub{ font-size:12px; color:var(--muted2); }

.cardsFan{
  position:relative;
  height:340px;
  margin-top:14px;
  display:grid;
  place-items:center;
  user-select:none;
  touch-action: pan-y;
}

.card{
  position:absolute;
  width:min(420px, 78vw);
  height:280px;
  border-radius: 22px;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  box-shadow: 0 30px 90px rgba(0,0,0,.55);
  transform: translateZ(0);
  transition: transform .65s var(--ease), filter .65s var(--ease), opacity .65s var(--ease);
  cursor:pointer;
}
.card img{
  width:100%; height:100%;
  object-fit: cover;
  display:block;
  transform: scale(1.03);
  filter: saturate(1.08) contrast(1.05);
}
.card::after{
  content:"";
  position:absolute;
  inset:0;
  background:
    radial-gradient(420px 200px at 20% 10%, rgba(255,179,224,.14), transparent 60%),
    radial-gradient(360px 220px at 85% 20%, rgba(125,211,255,.12), transparent 60%),
    linear-gradient(180deg, rgba(0,0,0,.10), rgba(0,0,0,.35));
  mix-blend-mode: screen;
  pointer-events:none;
  opacity:.75;
}
.card .cardLabel{
  position:absolute;
  left:14px; bottom:14px;
  display:flex; gap:8px; align-items:center;
  padding:10px 12px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.16);
  background: rgba(0,0,0,.18);
  backdrop-filter: blur(12px);
  color: rgba(255,255,255,.9);
  font-size:12px;
}
.card .cardLabel .spark{
  width:8px;height:8px;border-radius:999px;
  background: linear-gradient(135deg, var(--accent1), var(--accent2));
  box-shadow: 0 0 18px rgba(255,179,224,.25);
}

.cardsHint{
  display:flex; justify-content:center; gap:10px;
  margin-top:12px;
  color: var(--muted2);
  font-size:12px;
}
.kbd{
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.05);
  padding:6px 10px;
  border-radius:999px;
}
.sep{ opacity:.5; }

/* Events */
.eventsWrap{
  border-radius: var(--r);
  border:1px solid var(--stroke);
  background: rgba(255,255,255,.03);
  box-shadow: var(--shadow2);
  padding:16px;
  backdrop-filter: blur(16px);
}
.eventsTitle{ font-weight:900; letter-spacing:.01em; }
.eventsSub{ margin-top:4px; font-size:12px; color:var(--muted2); }
.eventGrid{
  margin-top:12px;
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap:10px;
}
.eventBtn{
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.05);
  border-radius:18px;
  padding:12px 12px;
  cursor:pointer;
  transition: transform .35s var(--ease), background .35s var(--ease), border-color .35s var(--ease);
  text-align:left;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}
.eventBtn:hover{
  transform: translateY(-1px);
  background: rgba(255,255,255,.07);
  border-color: rgba(255,255,255,.22);
}
.eventName{
  font-weight:800;
  letter-spacing:.02em;
}
.eventMeta{
  margin-top:4px;
  font-size:12px;
  color: var(--muted2);
}
.eventScore{
  font-family: var(--ff2);
  font-weight:900;
  letter-spacing:.03em;
  padding:10px 10px;
  border-radius:14px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(0,0,0,.18);
  min-width:72px;
  text-align:center;
}

/* Sponsors rail */
.sponsorRail{
  margin-top:14px;
  border-top:1px solid rgba(255,255,255,.10);
  padding-top:14px;
}
.sponsorTitle{ font-weight:900; font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:rgba(255,255,255,.84); }
.sponsorStrip{
  margin-top:10px;
  display:flex;
  gap:10px;
  overflow:auto;
  padding-bottom:6px;
}
.sLogo{
  flex:0 0 auto;
  width:112px;
  height:56px;
  border-radius:16px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.05);
  display:grid;
  place-items:center;
  cursor:pointer;
  transition: transform .35s var(--ease), border-color .35s var(--ease), background .35s var(--ease);
  overflow:hidden;
}
.sLogo:hover{
  transform: translateY(-1px);
  border-color: rgba(255,255,255,.22);
  background: rgba(255,255,255,.07);
}
.sLogo img{
  max-width:80%;
  max-height:70%;
  filter: drop-shadow(0 10px 25px rgba(0,0,0,.35));
}
.sponsorFoot{
  margin-top:10px;
  font-size:12px;
  color: var(--muted2);
}

/* Footer */
.footer{
  margin-top:16px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:14px 12px;
  border-radius:18px;
  border:1px solid var(--stroke);
  background: rgba(255,255,255,.03);
  backdrop-filter: blur(14px);
}
.footTitle{ font-weight:900; }
.footSub{ font-size:12px; color: var(--muted2); margin-top:2px; }
.footerRight{ display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end; }

/* NEW: footer brand logo centered under footer */
.footerBrandWrap{
  margin-top:12px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:8px;
}
.senxiaLogoBtn{
  border:none;
  cursor:pointer;
  padding:12px 14px;
  border-radius: 18px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.04);
  backdrop-filter: blur(14px);
  transition: transform .35s var(--ease), background .35s var(--ease), border-color .35s var(--ease), filter .35s var(--ease);
  box-shadow: 0 16px 45px rgba(0,0,0,.35);
}
.senxiaLogoBtn:hover{
  transform: translateY(-1px);
  background: rgba(255,255,255,.06);
  border-color: rgba(255,255,255,.22);
  filter: brightness(1.03);
}
.senxiaLogoBtn:active{ transform: translateY(0px) scale(.985); }
.senxiaLogoBtn img{
  display:block;
  height:34px;
  width:auto;
  filter: drop-shadow(0 10px 25px rgba(0,0,0,.45));
}
.footerBrandNote{
  font-size:12px;
  color: rgba(255,255,255,.55);
  text-align:center;
}

/* Modal */
.modalOverlay{
  position:fixed;
  inset:0;
  display:none;
  align-items:center;
  justify-content:center;
  padding:18px;
  background: rgba(0,0,0,.55);
  z-index:20;
}
.modalOverlay[data-open="true"]{ display:flex; }
.modalCard{
  width:min(880px, 96vw);
  border-radius: 26px;
  border:1px solid rgba(255,255,255,.16);
  background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04));
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
  overflow:hidden;
  position:relative;
}
.modalCard.wide{ width:min(1040px, 96vw); }
.modalClose{
  position:absolute;
  right:14px;
  top:14px;
  border:none;
  cursor:pointer;
  width:44px; height:44px;
  border-radius:14px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(0,0,0,.25);
  color: rgba(255,255,255,.9);
  transition: transform .35s var(--ease), background .35s var(--ease), border-color .35s var(--ease);
}
.modalClose:hover{
  transform: translateY(-1px);
  border-color: rgba(255,255,255,.22);
  background: rgba(0,0,0,.35);
}
.modalHead{
  padding:18px 18px 10px;
  border-bottom:1px solid rgba(255,255,255,.10);
  background:
    radial-gradient(600px 240px at 15% 30%, rgba(255,179,224,.14), transparent 60%),
    radial-gradient(520px 240px at 85% 0%, rgba(125,211,255,.12), transparent 60%);
}
.modalKicker{
  font-size:12px;
  letter-spacing:.18em;
  text-transform:uppercase;
  color: rgba(255,255,255,.72);
  font-weight:700;
}
.modalTitle{
  margin:8px 0 0;
  font-family: var(--ff2);
  font-weight:900;
  letter-spacing:.02em;
}
.modalMeta{
  margin-top:10px;
  display:flex;
  gap:10px;
  flex-wrap:wrap;
}
.metaPill{
  border:1px solid rgba(255,255,255,.14);
  background: rgba(0,0,0,.18);
  padding:8px 10px;
  border-radius:999px;
  font-size:12px;
}
.metaPill.soft{ background: rgba(255,255,255,.05); }

.modalBadges{ margin-top:10px; display:flex; flex-wrap:wrap; gap:10px; }
.modalBody{ padding:16px 18px 18px; }

/* Bio layout */
.bioGrid{
  display:grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap:14px;
}
@media (max-width: 860px){
  .bioGrid{ grid-template-columns: 1fr; }
}
.bioPhoto{
  height:240px;
  border-radius:22px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  overflow:hidden;
  box-shadow: 0 18px 55px rgba(0,0,0,.35);
  position:relative;
}
.bioPhoto::after{
  content:"";
  position:absolute;
  inset:0;
  background:
    radial-gradient(420px 180px at 30% 15%, rgba(255,179,224,.14), transparent 62%),
    radial-gradient(360px 180px at 85% 20%, rgba(125,211,255,.12), transparent 62%),
    linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.35));
  pointer-events:none;
}
.bioQuick{
  margin-top:12px;
  display:grid;
  gap:10px;
}
.quickRow{
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.05);
  border-radius:18px;
  padding:12px 12px;
}
.quickLabel{ font-size:12px; color:var(--muted2); }
.quickValue{ margin-top:6px; font-weight:800; }

.bioStory{
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.05);
  border-radius:22px;
  padding:14px 14px;
  line-height:1.55;
  color: rgba(255,255,255,.88);
}
.bioLinks{
  margin-top:12px;
  display:flex;
  gap:10px;
  flex-wrap:wrap;
}

/* Event modal */
.eventLayout{
  display:grid;
  grid-template-columns: 1.2fr .8fr;
  gap:14px;
}
@media (max-width: 900px){
  .eventLayout{ grid-template-columns: 1fr; }
}
.chartBox{
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.05);
  border-radius:22px;
  padding:12px;
  min-height:280px;
}
.meetList{
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.05);
  border-radius:22px;
  padding:12px;
  max-height:360px;
  overflow:auto;
}
.meetRow{
  display:flex;
  justify-content:space-between;
  gap:10px;
  padding:10px 10px;
  border-radius:16px;
  border:1px solid rgba(255,255,255,.10);
  background: rgba(0,0,0,.10);
  margin-bottom:10px;
}
.meetLeft{ display:flex; flex-direction:column; gap:4px; }
.meetName{ font-weight:900; }
.meetDate{ font-size:12px; color:var(--muted2); }
.meetScore{
  font-family: var(--ff2);
  font-weight:900;
  padding:8px 10px;
  border-radius:14px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(0,0,0,.18);
  min-width:72px;
  text-align:center;
}

/* Sponsors modal grid */
.sponsorGrid{
  display:grid;
  grid-template-columns: repeat(2, 1fr);
  gap:12px;
}
@media (max-width: 760px){
  .sponsorGrid{ grid-template-columns: 1fr; }
}
.sponsorCard{
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.05);
  border-radius:22px;
  padding:12px;
  display:flex;
  gap:12px;
  align-items:center;
  cursor:pointer;
  transition: transform .35s var(--ease), border-color .35s var(--ease), background .35s var(--ease);
}
.sponsorCard:hover{
  transform: translateY(-1px);
  border-color: rgba(255,255,255,.22);
  background: rgba(255,255,255,.07);
}
.sponsorThumb{
  width:84px;
  height:54px;
  border-radius:16px;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(0,0,0,.14);
  display:grid;
  place-items:center;
  overflow:hidden;
}
.sponsorThumb img{ max-width:80%; max-height:70%; }
.sponsorInfo{ display:flex; flex-direction:column; gap:6px; }
.sponsorName{ font-weight:900; }
.sponsorTag{ font-size:12px; color:var(--muted2); }

.aboutCopy{
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.05);
  border-radius:22px;
  padding:14px;
  line-height:1.55;
}

/* NEW: Senxia pitch styling */
.senxiaPitch{ line-height:1.6; }
.senxiaLead{
  margin:0 0 12px;
  border:1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.04);
  padding:12px 12px;
  border-radius:18px;
  color: rgba(255,255,255,.88);
}
.senxiaGrid{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap:12px;
}
@media (max-width: 860px){
  .senxiaGrid{ grid-template-columns: 1fr; }
}
.senxiaBox{
  border:1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.04);
  padding:12px 12px;
  border-radius:18px;
}
.senxiaBoxTitle{
  font-weight:900;
  margin-bottom:8px;
  letter-spacing:.01em;
}
.senxiaBox ul{
  margin:0;
  padding-left:18px;
  color: rgba(255,255,255,.84);
}
.senxiaCTArow{
  margin-top:14px;
  display:flex;
  align-items:center;
  gap:12px;
  flex-wrap:wrap;
}
.senxiaPrice{
  font-size:12px;
  color: rgba(255,255,255,.70);
  border:1px solid rgba(255,255,255,.12);
  background: rgba(0,0,0,.14);
  padding:10px 12px;
  border-radius:999px;
}
.senxiaFine{
  margin-top:12px;
  font-size:12px;
  color: rgba(255,255,255,.60);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce){
  *{ animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; scroll-behavior: auto !important; }
}
