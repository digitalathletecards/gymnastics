/* Candy Crush style premium drifting pieces in Showcase stage (defensive GH version) */

const $ = (sel, root = document) => root.querySelector(sel);

const els = {
  modalHost: $("#modalHost"),
  modalBackdrop: $("#modalBackdrop"),
  modal: $("#modal"),
  modalTitle: $("#modalTitle"),
  modalBody: $("#modalBody"),
  modalClose: $("#modalClose"),
  modalMinimize: $("#modalMinimize"),

  copyLinkBtn: $("#copyLinkBtn"),
  shareBtn: $("#shareBtn"),

  athletePhoto: $("#athletePhoto"),
  athleteName: $("#athleteName"),
  athleteSub: $("#athleteSub"),
  tierBadge: $("#tierBadge"),
  clubBadge: $("#clubBadge"),
  sportBadge: $("#sportBadge"),
  bioBtn: $("#bioBtn"),
  bioBtnPhoto: $("#bioBtnPhoto"),
  supportBtn: $("#supportBtn"),

  fundTitle: $("#fundTitle"),
  fundNumbers: $("#fundNumbers"),
  meterBar: $("#meterBar"),
  fundNote: $("#fundNote"),
  donateBtn: $("#donateBtn"),

  shareChips: $("#shareChips"),
  openShareModalBtn: $("#openShareModalBtn"),

  galleryGrid: $("#galleryGrid"),
  gallerySub: $("#gallerySub"),

  // Defensive: ID OR previous ID OR class
  showcaseStage:
    $("#showcaseStage") ||
    $("#bouquetStage") ||
    document.querySelector(".showcase__stage"),

  builtBtn: $("#builtBtn"),
};

let DATA = null;

/* ---------------------------
   Modal System + Theme
--------------------------- */
function setModalTheme(theme = "pink") {
  if (!els.modal) return;
  els.modal.setAttribute("data-theme", theme);
}

function openModal({ title = "Modal", sections = [], compact = false, theme = "pink" } = {}) {
  if (!els.modalHost || !els.modal || !els.modalBody || !els.modalTitle) return;

  setModalTheme(theme);

  els.modal.classList.remove("modal--collapsed");
  if (els.modalMinimize) {
    els.modalMinimize.setAttribute("aria-expanded", "true");
    els.modalMinimize.textContent = "▾";
    els.modalMinimize.title = "Collapse";
  }

  els.modalTitle.textContent = title;
  els.modalBody.innerHTML = buildAccordion(sections, compact);

  els.modalHost.setAttribute("aria-hidden", "false");
  els.modalHost.classList.add("is-open");
  document.body.classList.add("modalOpen");

  setTimeout(() => els.modalClose?.focus?.(), 0);
}

function closeModal() {
  if (!els.modalHost) return;
  els.modalHost.setAttribute("aria-hidden", "true");
  els.modalHost.classList.remove("is-open");
  document.body.classList.remove("modalOpen");
  if (els.modalBody) els.modalBody.innerHTML = "";
}

function toggleModalCollapse() {
  if (!els.modal || !els.modalMinimize) return;
  const collapsed = els.modal.classList.toggle("modal--collapsed");
  els.modalMinimize.setAttribute("aria-expanded", String(!collapsed));
  els.modalMinimize.textContent = collapsed ? "▸" : "▾";
  els.modalMinimize.title = collapsed ? "Expand" : "Collapse";
}

function buildAccordion(sections, compact = false) {
  const cls = compact ? "acc acc--compact" : "acc";
  return `
    <div class="${cls}">
      ${sections.map((s, idx) => {
        const openAttr = (s.open ?? (idx === 0)) ? "open" : "";
        return `
          <details class="acc__item" ${openAttr}>
            <summary class="acc__sum">
              <span class="acc__sumText">${escapeHtml(s.label || "Details")}</span>
              <span class="acc__chev" aria-hidden="true">▾</span>
            </summary>
            <div class="acc__panel">
              ${typeof s.html === "function" ? s.html() : (s.html || "")}
            </div>
          </details>
        `;
      }).join("")}
    </div>
  `;
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------------------------
   Data
--------------------------- */
async function loadData() {
  try {
    const res = await fetch("data/athlete.json", { cache: "no-store" });
    if (!res.ok) throw new Error("athlete.json not found");
    return await res.json();
  } catch {
    return {
      athlete: {
        name: "Layla Neitenbach",
        club: "KP Gymnastics",
        sport: "Gymnastics",
        tier: "Bronze",
        subtitle: "Tap to view bio",
        photo: "images/card1.PNG",
        bio: {
          headline: "Meet Layla",
          about: "A bright, hard-working gymnast who loves learning new skills and sharing the journey with family + sponsors.",
          strengths: ["Coachability", "Confidence", "Consistency"],
        },
      },
      fundraising: { title: "Help cover travel, coaching, meet fees.", current: 650, goal: 2000, note: "Layla is 33% to the season goal! Help finish strong 💕" },
      share: { chips: [
        { label: "💬 Text", action: "text" },
        { label: "💚 WhatsApp", action: "whatsapp" },
        { label: "📘 Facebook", action: "facebook" },
        { label: "📸 Instagram", action: "instagram" },
        { label: "𝕏 X", action: "x" },
        { label: "✉ Email", action: "email" },
      ]},
      gallery: {
        subtitle: "Highlights from training + meets.",
        items: [
          { src: "images/card1.PNG", title: "Training day" },
          { src: "images/card2.PNG", title: "Meet moment" },
          { src: "images/card3.png", title: "New skill" },
          { src: "images/card4.png", title: "Team energy" },
        ],
      },
      sponsors: { items: [] },
      stats: [
        { label: "Practices / week", value: "4" },
        { label: "New skills", value: "3" },
        { label: "Meets", value: "7" },
        { label: "PRs", value: "5" },
      ],
      journey: [{ date: "This week", title: "Stuck the routine!", note: "Cleaner landings and stronger confidence." }],
      upcoming: [{ date: "Next weekend", title: "Winter Invitational", note: "Cheering squad ready 💕" }],
      achievements: [{ title: "Beam first place", note: "Great focus + control." }],
    };
  }
}

/* ---------------------------
   Render
--------------------------- */
function renderAll() {
  const A = DATA.athlete || {};
  const F = DATA.fundraising || {};
  const S = DATA.share || {};
  const G = DATA.gallery || {};

  if (els.athleteName) els.athleteName.textContent = A.name || "Athlete Name";
  if (els.athleteSub) els.athleteSub.textContent = A.subtitle || "Tap to view bio";
  if (els.clubBadge) els.clubBadge.textContent = A.club || "Club";
  if (els.sportBadge) els.sportBadge.textContent = A.sport || "Sport";
  if (els.tierBadge) els.tierBadge.textContent = `🏅 ${A.tier || "Bronze"}`;
  if (els.athletePhoto && A.photo) els.athletePhoto.src = A.photo;

  const current = Number(F.current || 0);
  const goal = Math.max(1, Number(F.goal || 1));
  const pct = clamp(Math.round((current / goal) * 100), 0, 100);

  if (els.fundTitle) els.fundTitle.textContent = F.title || "Help cover travel, coaching, meet fees.";
  if (els.fundNumbers) els.fundNumbers.textContent = `$${formatNumber(current)} / $${formatNumber(goal)}`;
  if (els.meterBar) els.meterBar.style.width = `${pct}%`;
  document.querySelector(".meter")?.setAttribute("aria-valuenow", String(pct));
  if (els.fundNote) els.fundNote.textContent = F.note || `Athlete is ${pct}% to the season goal! Help finish strong 💕`;

  if (els.shareChips) {
    els.shareChips.innerHTML = "";
    (S.chips || []).forEach(ch => {
      const b = document.createElement("button");
      b.className = "chip";
      b.type = "button";
      b.textContent = ch.label;
      b.addEventListener("click", () => runShare(ch.action));
      els.shareChips.appendChild(b);
    });
  }

  if (els.gallerySub) els.gallerySub.textContent = G.subtitle || "Highlights from training + meets.";
  buildGallery(G.items || []);

  buildCandyShowcase();
}

/* ---------------------------
   Gallery video card
--------------------------- */
function buildVideoSourcesHtml() {
  const candidates = [
    { src: "images/layla-video.mp4", type: "video/mp4" },
    { src: "images/layla-video.mov", type: "video/quicktime" },
    { src: "images/layal%20video.mov", type: "video/quicktime" },
    { src: "images/layal%20video.mp4", type: "video/mp4" },
  ];
  return candidates.map(c => `<source src="${c.src}" type="${c.type}">`).join("\n");
}

function buildGallery(items) {
  if (!els.galleryGrid) return;
  els.galleryGrid.innerHTML = "";

  const videoCard = document.createElement("button");
  videoCard.className = "gCard gCard--video";
  videoCard.type = "button";
  videoCard.innerHTML = `
    <div class="gMedia">
      <video class="gVideo" autoplay muted loop playsinline preload="metadata">
        ${buildVideoSourcesHtml()}
      </video>
      <div class="gOverlay">
        <div class="gTitle">🎬 Highlight Reel</div>
        <div class="gSub">Plays silently · loops while open</div>
      </div>
    </div>
  `;
  videoCard.addEventListener("click", () => openVideoModal());
  els.galleryGrid.appendChild(videoCard);

  const vid = videoCard.querySelector("video");
  const tryPlay = () => vid?.play?.().catch(() => {});
  tryPlay();
  window.addEventListener("pointerdown", tryPlay, { once: true, passive: true });

  items.forEach((it, idx) => {
    const src = it.src || it.image || it.url;
    if (!src) return;

    const btn = document.createElement("button");
    btn.className = "gCard";
    btn.type = "button";
    btn.innerHTML = `
      <div class="gMedia">
        <img class="gImg" src="${escapeHtml(src)}" alt="${escapeHtml(it.title || `Photo ${idx + 1}`)}" loading="lazy" decoding="async" />
        <div class="gOverlay">
          <div class="gTitle">${escapeHtml(it.title || "Moment")}</div>
          <div class="gSub">Tap to expand</div>
        </div>
      </div>
    `;
    btn.addEventListener("click", () => {
      openModal({
        title: "Photo Card",
        theme: "pink",
        sections: [
          { label: it.title || "Photo", open: true, html: `<div class="modalMedia"><img src="${escapeHtml(src)}" alt="${escapeHtml(it.title || "Photo")}"></div>` },
          { label: "Share this moment", open: false, html: shareBlockHtml() },
        ],
      });
    });

    els.galleryGrid.appendChild(btn);
  });
}

function openVideoModal() {
  openModal({
    title: "Highlight Reel",
    theme: "pink",
    sections: [
      {
        label: "Video (silent loop)",
        open: true,
        html: `
          <div class="modalMedia">
            <video class="modalVideo" autoplay muted loop playsinline controls preload="metadata">
              ${buildVideoSourcesHtml()}
            </video>
          </div>
        `,
      },
      { label: "Share this card", open: false, html: shareBlockHtml() },
    ],
  });
  document.querySelector(".modalVideo")?.play?.().catch(() => {});
}

/* ---------------------------
   Candy drift showcase
--------------------------- */
let driftRAF = null;

function buildCandyShowcase() {
  const stage = els.showcaseStage;
  if (!stage) return;

  stage.innerHTML = "";

  const candies = [
    { theme: "gold",   kind: "wrap",  emoji: "💎", label: "Sponsors",       sub: "Tap to view",   onClick: openSponsorsModal },
    { theme: "aqua",   kind: "gem",   emoji: "⚡", label: "Season Snapshot", sub: "Quick stats",   onClick: openSnapshotModal },
    { theme: "pink",   kind: "jelly", emoji: "⭐", label: "Journey",         sub: "Updates",       onClick: openJourneyModal },
    { theme: "violet", kind: "donut", emoji: "📅", label: "Upcoming",       sub: "Next events",   onClick: openUpcomingModal },
    { theme: "lime",   kind: "pill",  emoji: "🏆", label: "Achievements",   sub: "This season",   onClick: openAchievementsModal },
  ];

  const wraps = candies.map((c, i) => {
    const wrap = document.createElement("div");
    wrap.className = "candyWrap";

    const btn = document.createElement("button");
    btn.className = "candy";
    btn.type = "button";
    btn.setAttribute("data-c", c.theme);
    btn.setAttribute("data-kind", c.kind);
    btn.setAttribute("aria-label", c.label);

    const wrapEnds = c.kind === "wrap"
      ? `<span class="candy__wrapLeft"></span><span class="candy__wrapRight"></span>`
      : "";
    const hole = c.kind === "donut" ? `<span class="candy__hole"></span>` : "";

    btn.innerHTML = `
      ${wrapEnds}
      <span class="candy__shell"></span>
      <span class="candy__tint"></span>
      <span class="candy__glaze"></span>
      <span class="candy__jelly"></span>
      ${hole}
      <span class="candy__content">
        <span class="candy__emoji">${c.emoji}</span>
        <span class="candy__label">${escapeHtml(c.label)}</span>
        <span class="candy__sub">${escapeHtml(c.sub)}</span>
      </span>
    `;

    btn.addEventListener("click", () => c.onClick(c.theme));
    wrap.appendChild(btn);
    stage.appendChild(wrap);

    const seed = 1.0 + i * 0.27;
    wrap._state = {
      x: 18 + i * 24,
      y: 22 + i * 20,
      vx: (Math.sin(seed * 3.0) * 0.095) + 0.075,
      vy: (Math.cos(seed * 2.7) * 0.095) + 0.060,
      wob: seed * 1000,
    };

    return wrap;
  });

  if (driftRAF) cancelAnimationFrame(driftRAF);
  startCandyDrift(stage, wraps);
}

function startCandyDrift(stage, wraps) {
  let last = performance.now();

  const tick = (t) => {
    const dt = Math.min(32, t - last);
    last = t;

    const rect = stage.getBoundingClientRect();
    const W = Math.max(320, rect.width);
    const H = Math.max(320, rect.height);

    wraps.forEach((wrap, idx) => {
      const s = wrap._state;
      if (!s) return;

      const size = window.innerWidth < 980 ? 112 : 126;

      s.wob += dt;
      const driftX = Math.sin((s.wob + idx * 460) / 2200) * 0.030;
      const driftY = Math.cos((s.wob + idx * 520) / 2500) * 0.026;

      s.x += (s.vx + driftX) * dt;
      s.y += (s.vy + driftY) * dt;

      const pad = 10;
      const maxX = W - size - pad;
      const maxY = H - size - pad;

      if (s.x < pad)  { s.x = pad;  s.vx = Math.abs(s.vx) * 0.96; }
      if (s.x > maxX) { s.x = maxX; s.vx = -Math.abs(s.vx) * 0.96; }
      if (s.y < pad)  { s.y = pad;  s.vy = Math.abs(s.vy) * 0.96; }
      if (s.y > maxY) { s.y = maxY; s.vy = -Math.abs(s.vy) * 0.96; }

      s.vx *= 0.9996;
      s.vy *= 0.9996;

      wrap.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
    });

    driftRAF = requestAnimationFrame(tick);
  };

  driftRAF = requestAnimationFrame(tick);
}

/* ---------------------------
   Candy modals
--------------------------- */
function openSponsorsModal(theme="gold"){
  const sp = DATA.sponsors?.items || [];
  openModal({
    title:"💎 Sponsors",
    theme,
    sections:[
      { label:"Sponsor list", open:true, html: () => sponsorsHtml(sp) },
      { label:"Share this card", open:false, html: shareBlockHtml() }
    ]
  });
}
function sponsorsHtml(items){
  if(!items.length){
    return `<div class="noteCard"><div class="noteTitle">No sponsors yet</div><div class="noteText">Add sponsors in <strong>data/athlete.json</strong>.</div></div>`;
  }
  return `<div class="mList">${items.map(s=>`
    <div class="mItem">
      <div class="mTop">
        <div class="mTitle">${escapeHtml(s.name||"Sponsor")}</div>
        <div class="mMeta">${s.url ? "Tap to visit" : ""}</div>
      </div>
      <div class="mNote">${s.url ? `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener" style="color:rgba(255,255,255,.82);font-weight:900;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.18)">Open sponsor link</a>` : "Link not provided"}</div>
    </div>
  `).join("")}</div>`;
}

function openSnapshotModal(theme="aqua"){
  const stats = DATA.stats || [];
  openModal({
    title:"⚡ Season Snapshot",
    theme,
    sections:[
      { label:"Quick stats", open:true, html: () => statsHtml(stats) },
      { label:"Share this card", open:false, html: shareBlockHtml() }
    ]
  });
}
function statsHtml(items){
  if(!items.length){
    return `<div class="noteCard"><div class="noteTitle">No stats yet</div><div class="noteText">Add stats in <strong>data/athlete.json</strong>.</div></div>`;
  }
  return `<div class="mList">${items.map(s=>`
    <div class="mItem"><div class="mTop">
      <div class="mTitle">${escapeHtml(s.label||"Stat")}</div>
      <div class="mMeta">${escapeHtml(s.value ?? "")}</div>
    </div></div>
  `).join("")}</div>`;
}

function openJourneyModal(theme="pink"){
  openModal({
    title:"⭐ Journey",
    theme,
    sections:[
      { label:"Updates", open:true, html: () => timelineHtml(DATA.journey || []) },
      { label:"Share this card", open:false, html: shareBlockHtml() }
    ]
  });
}
function openUpcomingModal(theme="violet"){
  openModal({
    title:"📅 Upcoming",
    theme,
    sections:[
      { label:"Next events", open:true, html: () => timelineHtml(DATA.upcoming || [], true) },
      { label:"Share this card", open:false, html: shareBlockHtml() }
    ]
  });
}
function openAchievementsModal(theme="lime"){
  openModal({
    title:"🏆 Achievements",
    theme,
    sections:[
      { label:"This season", open:true, html: () => achievementsHtml(DATA.achievements || []) },
      { label:"Share this card", open:false, html: shareBlockHtml() }
    ]
  });
}

function timelineHtml(items, isUpcoming=false){
  if(!items.length){
    return `<div class="noteCard"><div class="noteTitle">${isUpcoming ? "No upcoming events" : "No updates yet"}</div><div class="noteText">Add items in <strong>data/athlete.json</strong>.</div></div>`;
  }
  return `<div class="mList">${items.map(it=>`
    <div class="mItem">
      <div class="mTop">
        <div class="mTitle">${escapeHtml(it.title || it.name || "Item")}</div>
        <div class="mMeta">${escapeHtml(it.date || "")}</div>
      </div>
      ${it.note ? `<div class="mNote">${escapeHtml(it.note)}</div>` : ""}
    </div>
  `).join("")}</div>`;
}
function achievementsHtml(items){
  if(!items.length){
    return `<div class="noteCard"><div class="noteTitle">No achievements yet</div><div class="noteText">Add achievements in <strong>data/athlete.json</strong>.</div></div>`;
  }
  return `<div class="mList">${items.map(a=>`
    <div class="mItem">
      <div class="mTop">
        <div class="mTitle">${escapeHtml(a.title || "Achievement")}</div>
        <div class="mMeta">⭐</div>
      </div>
      ${a.note ? `<div class="mNote">${escapeHtml(a.note)}</div>` : ""}
    </div>
  `).join("")}</div>`;
}

/* ---------------------------
   Bio / Support / Share
--------------------------- */
function openBioModal(){
  const bio = DATA.athlete?.bio || {};
  const strengths = Array.isArray(bio.strengths) ? bio.strengths : [];
  openModal({
    title:"Athlete Bio",
    theme:"pink",
    sections:[
      { label: bio.headline || "About", open:true, html: `
        <div class="noteCard">
          <div class="noteTitle">${escapeHtml(DATA.athlete?.name || "Athlete")}</div>
          <div class="noteText">${escapeHtml(bio.about || "Add bio content in data/athlete.json")}</div>
        </div>
      `},
      { label:"Strengths", open:false, html: `<div>${strengths.map(s=>`<span class="pill pill--spark" style="margin:4px 6px 0 0;">${escapeHtml(s)}</span>`).join("")}</div>` },
      { label:"Share this card", open:false, html: shareBlockHtml() }
    ]
  });
}
function openSupportModal(){
  const f = DATA.fundraising || {};
  const current = Number(f.current||0);
  const goal = Math.max(1, Number(f.goal||1));
  const pct = clamp(Math.round((current/goal)*100), 0, 100);

  openModal({
    title:"Support / Donate",
    theme:"pink",
    sections:[
      { label:"Why it matters", open:true, html: `
        <div class="noteCard">
          <div class="noteTitle">Every share helps 💕</div>
          <div class="noteText">Sponsorships help cover meet fees, coaching, travel, and training so the focus stays on confidence + growth.</div>
        </div>
      `},
      { label:"Goal progress", open:false, html: `
        <div class="noteCard">
          <div class="noteTitle">$${formatNumber(current)} raised</div>
          <div class="noteText">Goal: $${formatNumber(goal)} (${pct}%)</div>
        </div>
      `},
      { label:"Share with sponsors", open:false, html: shareBlockHtml() }
    ]
  });
}
function openShareModal(){
  openModal({ title:"Share Options", theme:"pink", sections:[{ label:"Fast share", open:true, html: shareBlockHtml() }] });
}

function shareBlockHtml(){
  const url = location.href;
  return `
    <div class="shareBlock">
      <div class="shareRow">
        <input class="shareInput" value="${escapeHtml(url)}" readonly />
        <button class="btn btn--primary" type="button" data-copylink>Copy</button>
      </div>
      <div class="shareGrid">
        <button class="btn btn--soft" type="button" data-share="text">💬 Text</button>
        <button class="btn btn--soft" type="button" data-share="whatsapp">💚 WhatsApp</button>
        <button class="btn btn--soft" type="button" data-share="facebook">📘 Facebook</button>
        <button class="btn btn--soft" type="button" data-share="instagram">📸 Instagram</button>
        <button class="btn btn--soft" type="button" data-share="x">𝕏 X</button>
        <button class="btn btn--soft" type="button" data-share="email">✉ Email</button>
      </div>
      <div class="tinyNote">Pro move: send this to 3 local businesses today 💎</div>
    </div>
  `;
}

function runShare(kind){
  const url = location.href;
  const text = `Check out this digital athlete card 💕 ${url}`;
  switch(kind){
    case "text": window.open(`sms:?&body=${encodeURIComponent(text)}`, "_blank"); break;
    case "whatsapp": window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank"); break;
    case "facebook": window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank"); break;
    case "x": window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank"); break;
    case "email": window.open(`mailto:?subject=${encodeURIComponent("Support our athlete 💕")}&body=${encodeURIComponent(text)}`, "_blank"); break;
    case "instagram":
      copyText(url);
      openModal({ title:"Instagram Share", theme:"pink", sections:[{ label:"Link copied ✅", open:true, html:`<div class="noteCard">✅ Link copied — paste into a Story / DM / bio.</div>` }] });
      break;
  }
}
async function copyText(txt){
  try{ await navigator.clipboard.writeText(txt); }
  catch{
    const ta = document.createElement("textarea");
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

/* ---------------------------
   Wiring
--------------------------- */
function wireModalDelegates(){
  if(!els.modalBody) return;
  els.modalBody.addEventListener("click", (e)=>{
    const t = e.target;
    if(t?.matches?.("[data-copylink]")){
      copyText(location.href);
      t.textContent = "Copied ✓";
      setTimeout(()=>t.textContent="Copy", 900);
      return;
    }
    const shareBtn = t?.closest?.("[data-share]");
    if(shareBtn) runShare(shareBtn.getAttribute("data-share"));
  });
}

function wireButtons(){
  els.modalClose?.addEventListener("click", closeModal);
  els.modalBackdrop?.addEventListener("click", closeModal);
  els.modalMinimize?.addEventListener("click", toggleModalCollapse);
  document.addEventListener("keydown", (e)=>{
    if(e.key==="Escape" && document.body.classList.contains("modalOpen")) closeModal();
  });

  els.copyLinkBtn?.addEventListener("click", ()=>copyText(location.href));
  els.shareBtn?.addEventListener("click", openShareModal);

  els.bioBtn?.addEventListener("click", openBioModal);
  els.bioBtnPhoto?.addEventListener("click", openBioModal);
  els.supportBtn?.addEventListener("click", openSupportModal);

  els.donateBtn?.addEventListener("click", openSupportModal);
  els.openShareModalBtn?.addEventListener("click", openShareModal);
}

function clamp(n,a,b){ return Math.max(a, Math.min(b,n)); }
function formatNumber(n){ return Number(n||0).toLocaleString("en-US"); }

/* Boot */
(async function init(){
  DATA = await loadData();
  renderAll();
  wireButtons();
  wireModalDelegates();
})();
