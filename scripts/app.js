/* Showcase the Journey — Photo-real Candy Pieces (SVG) + drift + themed modals */

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

  showcaseStage:
    $("#showcaseStage") ||
    $("#bouquetStage") ||
    document.querySelector(".showcase__stage"),

  builtBtn: $("#builtBtn"),
};

let DATA = null;
let driftRAF = null;

/* ---------------------------
   Modal System
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
      fundraising: {
        title: "Help cover travel, coaching, meet fees.",
        current: 650,
        goal: 2000,
        note: "Layla is 33% to the season goal! Help finish strong 💕",
      },
      share: {
        chips: [
          { label: "💬 Text", action: "text" },
          { label: "💚 WhatsApp", action: "whatsapp" },
          { label: "📘 Facebook", action: "facebook" },
          { label: "📸 Instagram", action: "instagram" },
          { label: "𝕏 X", action: "x" },
          { label: "✉ Email", action: "email" },
        ],
      },
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
   Gallery video card (silent loop)
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
   Photo-real Candy SVGs
--------------------------- */
function candySVG(kind, theme, uid) {
  // theme palette: base / deep / highlight
  const pal = {
    pink:   { a:"#ff4fd8", b:"#b55cff", h:"#ffd4f3" },
    aqua:   { a:"#2df7ff", b:"#5b7cff", h:"#e5feff" },
    gold:   { a:"#ffb13b", b:"#ff6a9e", h:"#fff2c8" },
    violet: { a:"#b55cff", b:"#3df3ff", h:"#f0d9ff" },
    lime:   { a:"#7dff5a", b:"#20d9ff", h:"#f2ffd8" },
  }[theme] || { a:"#ff4fd8", b:"#b55cff", h:"#ffd4f3" };

  // SVG filters/gradients need unique IDs per candy
  const g1 = `g1_${uid}`, g2 = `g2_${uid}`, shine = `sh_${uid}`, drop = `dp_${uid}`;

  // Helpers: common defs
  const defs = `
    <defs>
      <linearGradient id="${g1}" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="${pal.h}" stop-opacity="0.85"/>
        <stop offset="0.38" stop-color="${pal.a}" stop-opacity="0.92"/>
        <stop offset="1" stop-color="${pal.b}" stop-opacity="0.98"/>
      </linearGradient>
      <radialGradient id="${g2}" cx="35%" cy="28%" r="70%">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>
        <stop offset="0.25" stop-color="#ffffff" stop-opacity="0.18"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${shine}" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
        <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
      <filter id="${drop}" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="14" stdDeviation="10" flood-color="#000000" flood-opacity="0.45"/>
      </filter>
    </defs>
  `;

  // Candy types inspired by your reference image:
  // - lozenge (oval hard candy)
  // - stripe (striped cylinder candy)
  // - sprinkle (chocolate ball with sprinkles)
  // - gumdrop (tear drop)
  // - wrap (wrapped candy / cone)
  switch (kind) {
    case "lozenge":
      return `
      <svg class="candySvg" viewBox="0 0 140 140" aria-hidden="true">
        ${defs}
        <g filter="url(#${drop})">
          <path d="M70 14c28 0 50 22 50 50v12c0 28-22 50-50 50S20 104 20 76V64c0-28 22-50 50-50z"
                fill="url(#${g1})" stroke="rgba(255,255,255,.30)" stroke-width="1.2"/>
          <path d="M70 30c20 0 36 16 36 36v8c0 20-16 36-36 36S34 94 34 74v-8c0-20 16-36 36-36z"
                fill="rgba(255,255,255,.08)"/>
          <ellipse cx="52" cy="42" rx="18" ry="24" fill="url(#${g2})" opacity="0.9"/>
          <path d="M18 54h104" stroke="url(#${shine})" stroke-width="10" opacity="0.35"/>
        </g>
      </svg>`;
    case "stripe":
      return `
      <svg class="candySvg" viewBox="0 0 140 140" aria-hidden="true">
        ${defs}
        <g filter="url(#${drop})" transform="translate(10,20) rotate(-18 60 50)">
          <rect x="12" y="18" width="96" height="64" rx="32" fill="url(#${g1})" stroke="rgba(255,255,255,.28)" stroke-width="1.2"/>
          <rect x="34" y="18" width="16" height="64" rx="8" fill="rgba(255,255,255,.70)" opacity="0.85"/>
          <rect x="62" y="18" width="16" height="64" rx="8" fill="rgba(255,255,255,.70)" opacity="0.85"/>
          <rect x="90" y="18" width="16" height="64" rx="8" fill="rgba(255,255,255,.70)" opacity="0.85"/>
          <ellipse cx="36" cy="32" rx="18" ry="24" fill="url(#${g2})" opacity="0.8"/>
          <path d="M6 44h112" stroke="url(#${shine})" stroke-width="10" opacity="0.30"/>
        </g>
      </svg>`;
    case "sprinkle":
      return `
      <svg class="candySvg" viewBox="0 0 140 140" aria-hidden="true">
        ${defs}
        <g filter="url(#${drop})">
          <circle cx="70" cy="72" r="46" fill="#5b2b1c" stroke="rgba(255,255,255,.22)" stroke-width="1.2"/>
          <circle cx="56" cy="52" r="22" fill="url(#${g2})" opacity="0.9"/>
          <path d="M26 68h88" stroke="url(#${shine})" stroke-width="10" opacity="0.22"/>
          ${sprinkles()}
        </g>
      </svg>`;
    case "gumdrop":
      return `
      <svg class="candySvg" viewBox="0 0 140 140" aria-hidden="true">
        ${defs}
        <g filter="url(#${drop})">
          <path d="M70 20c26 0 44 22 44 46 0 36-26 56-44 56S26 102 26 66c0-24 18-46 44-46z"
                fill="url(#${g1})" stroke="rgba(255,255,255,.30)" stroke-width="1.2"/>
          <ellipse cx="52" cy="44" rx="18" ry="24" fill="url(#${g2})" opacity="0.85"/>
          <path d="M18 62h104" stroke="url(#${shine})" stroke-width="10" opacity="0.30"/>
        </g>
      </svg>`;
    case "wrap":
    default:
      // Wrapped candy / cone-ish (like the blue one in your reference)
      return `
      <svg class="candySvg" viewBox="0 0 140 140" aria-hidden="true">
        ${defs}
        <g filter="url(#${drop})">
          <!-- wrapper ends -->
          <path d="M16 70c10-12 16-18 26-18-6 10-6 26 0 36-10 0-16-6-26-18z"
                fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.22)" stroke-width="1"/>
          <path d="M124 70c-10-12-16-18-26-18 6 10 6 26 0 36 10 0 16-6 26-18z"
                fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.22)" stroke-width="1"/>

          <!-- main candy body -->
          <path d="M42 48c8-10 20-16 28-16s20 6 28 16c8 10 10 26 0 44-8 14-20 20-28 20s-20-6-28-20c-10-18-8-34 0-44z"
                fill="url(#${g1})" stroke="rgba(255,255,255,.30)" stroke-width="1.2"/>

          <!-- stripes -->
          <path d="M54 44c8 10 8 42 0 58" stroke="rgba(255,255,255,.80)" stroke-width="10" opacity="0.75" stroke-linecap="round"/>
          <path d="M86 44c8 10 8 42 0 58" stroke="rgba(255,255,255,.80)" stroke-width="10" opacity="0.75" stroke-linecap="round"/>

          <!-- highlight -->
          <ellipse cx="58" cy="52" rx="16" ry="22" fill="url(#${g2})" opacity="0.85"/>
          <path d="M26 66h88" stroke="url(#${shine})" stroke-width="10" opacity="0.26"/>
        </g>
      </svg>`;
  }
}

function sprinkles(){
  // deterministic sprinkle dots
  const dots = [
    [40,78,"#ff4fd8"], [56,94,"#2df7ff"], [76,92,"#ffd56a"], [92,80,"#7dff5a"],
    [46,62,"#ffffff"], [72,60,"#b55cff"], [86,64,"#ff7bd5"], [64,78,"#2df7ff"],
    [82,96,"#ffffff"], [58,112,"#ff4fd8"], [92,100,"#ffd56a"], [48,102,"#7dff5a"],
    [94,74,"#2df7ff"], [38,90,"#b55cff"], [70,104,"#ffffff"], [104,86,"#ff7bd5"]
  ];
  return dots.map(([x,y,c]) => `<circle cx="${x}" cy="${y}" r="4.6" fill="${c}" opacity="0.95"/>`).join("");
}

/* ---------------------------
   Candy Showcase Drift (smaller, more realistic)
--------------------------- */
function buildCandyShowcase() {
  const stage = els.showcaseStage;
  if (!stage) return;

  stage.innerHTML = "";

  // Match the "feel" of your reference image
  const candies = [
    { theme:"gold",   kind:"stripe",   label:"Sponsors",        sub:"Tap to view",  onClick: openSponsorsModal },
    { theme:"aqua",   kind:"wrap",     label:"Season Snapshot", sub:"Quick stats",  onClick: openSnapshotModal },
    { theme:"pink",   kind:"sprinkle", label:"Journey",         sub:"Updates",      onClick: openJourneyModal },
    { theme:"violet", kind:"lozenge",  label:"Upcoming",        sub:"Next events",  onClick: openUpcomingModal },
    { theme:"lime",   kind:"gumdrop",  label:"Achievements",    sub:"This season",  onClick: openAchievementsModal },
  ];

  const wraps = candies.map((c, i) => {
    const wrap = document.createElement("div");
    wrap.className = "candyWrap";

    const btn = document.createElement("button");
    btn.className = "candy";
    btn.type = "button";
    btn.setAttribute("aria-label", c.label);

    const uid = `${c.kind}_${c.theme}_${i}_${Math.random().toString(16).slice(2)}`;
    btn.innerHTML = `
      ${candySVG(c.kind, c.theme, uid)}
      <div class="candyLabel">
        <div class="candyLabel__t">${escapeHtml(c.label)}</div>
        <div class="candyLabel__s">${escapeHtml(c.sub)}</div>
      </div>
    `;

    btn.addEventListener("click", () => c.onClick(c.theme));

    wrap.appendChild(btn);
    stage.appendChild(wrap);

    // slower, floaty drift like objects in gel
    const seed = 1.05 + i * 0.29;
    wrap._state = {
      x: 24 + i * 26,
      y: 26 + i * 22,
      vx: (Math.sin(seed * 3.0) * 0.070) + 0.055,
      vy: (Math.cos(seed * 2.7) * 0.070) + 0.045,
      wob: seed * 1200,
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

      const size = window.innerWidth < 980 ? 118 : 132;

      s.wob += dt;

      // slower internal movement
      const driftX = Math.sin((s.wob + idx * 420) / 2600) * 0.020;
      const driftY = Math.cos((s.wob + idx * 520) / 2900) * 0.018;

      s.x += (s.vx + driftX) * dt;
      s.y += (s.vy + driftY) * dt;

      const pad = 10;
      const maxX = W - size - pad;
      const maxY = H - size - pad;

      if (s.x < pad)  { s.x = pad;  s.vx = Math.abs(s.vx) * 0.95; }
      if (s.x > maxX) { s.x = maxX; s.vx = -Math.abs(s.vx) * 0.95; }
      if (s.y < pad)  { s.y = pad;  s.vy = Math.abs(s.vy) * 0.95; }
      if (s.y > maxY) { s.y = maxY; s.vy = -Math.abs(s.vy) * 0.95; }

      // tiny damping
      s.vx *= 0.9997;
      s.vy *= 0.9997;

      wrap.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
    });

    driftRAF = requestAnimationFrame(tick);
  };

  driftRAF = requestAnimationFrame(tick);
}

/* ---------------------------
   Candy Modals
--------------------------- */
function openSponsorsModal(theme = "gold") {
  const sp = DATA.sponsors?.items || [];
  openModal({
    title: "💎 Sponsors",
    theme,
    sections: [
      { label: "Sponsor list", open: true, html: () => sponsorsHtml(sp) },
      { label: "Share this card", open: false, html: shareBlockHtml() },
    ],
  });
}
function sponsorsHtml(items) {
  if (!items.length) {
    return `<div class="noteCard"><div class="noteTitle">No sponsors yet</div><div class="noteText">Add sponsors in <strong>data/athlete.json</strong>.</div></div>`;
  }
  return `<div class="mList">${items.map(s => `
    <div class="mItem">
      <div class="mTop">
        <div class="mTitle">${escapeHtml(s.name || "Sponsor")}</div>
        <div class="mMeta">${s.url ? "Tap to visit" : ""}</div>
      </div>
      <div class="mNote">${s.url ? `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener" style="color:rgba(255,255,255,.82);font-weight:900;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.18)">Open sponsor link</a>` : "Link not provided"}</div>
    </div>
  `).join("")}</div>`;
}

function openSnapshotModal(theme = "aqua") {
  const stats = DATA.stats || [];
  openModal({
    title: "⚡ Season Snapshot",
    theme,
    sections: [
      { label: "Quick stats", open: true, html: () => statsHtml(stats) },
      { label: "Share this card", open: false, html: shareBlockHtml() },
    ],
  });
}
function statsHtml(items) {
  if (!items.length) {
    return `<div class="noteCard"><div class="noteTitle">No stats yet</div><div class="noteText">Add stats in <strong>data/athlete.json</strong>.</div></div>`;
  }
  return `<div class="mList">${items.map(s => `
    <div class="mItem"><div class="mTop">
      <div class="mTitle">${escapeHtml(s.label || "Stat")}</div>
      <div class="mMeta">${escapeHtml(s.value ?? "")}</div>
    </div></div>
  `).join("")}</div>`;
}

function openJourneyModal(theme = "pink") {
  openModal({
    title: "⭐ Journey",
    theme,
    sections: [
      { label: "Updates", open: true, html: () => timelineHtml(DATA.journey || []) },
      { label: "Share this card", open: false, html: shareBlockHtml() },
    ],
  });
}
function openUpcomingModal(theme = "violet") {
  openModal({
    title: "📅 Upcoming",
    theme,
    sections: [
      { label: "Next events", open: true, html: () => timelineHtml(DATA.upcoming || [], true) },
      { label: "Share this card", open: false, html: shareBlockHtml() },
    ],
  });
}
function openAchievementsModal(theme = "lime") {
  openModal({
    title: "🏆 Achievements",
    theme,
    sections: [
      { label: "This season", open: true, html: () => achievementsHtml(DATA.achievements || []) },
      { label: "Share this card", open: false, html: shareBlockHtml() },
    ],
  });
}

function timelineHtml(items, isUpcoming = false) {
  if (!items.length) {
    return `<div class="noteCard"><div class="noteTitle">${isUpcoming ? "No upcoming events" : "No updates yet"}</div><div class="noteText">Add items in <strong>data/athlete.json</strong>.</div></div>`;
  }
  return `<div class="mList">${items.map(it => `
    <div class="mItem">
      <div class="mTop">
        <div class="mTitle">${escapeHtml(it.title || it.name || "Item")}</div>
        <div class="mMeta">${escapeHtml(it.date || "")}</div>
      </div>
      ${it.note ? `<div class="mNote">${escapeHtml(it.note)}</div>` : ""}
    </div>
  `).join("")}</div>`;
}
function achievementsHtml(items) {
  if (!items.length) {
    return `<div class="noteCard"><div class="noteTitle">No achievements yet</div><div class="noteText">Add achievements in <strong>data/athlete.json</strong>.</div></div>`;
  }
  return `<div class="mList">${items.map(a => `
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
   Share
--------------------------- */
function shareBlockHtml() {
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

function runShare(kind) {
  const url = location.href;
  const text = `Check out this digital athlete card 💕 ${url}`;
  switch (kind) {
    case "text": window.open(`sms:?&body=${encodeURIComponent(text)}`, "_blank"); break;
    case "whatsapp": window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank"); break;
    case "facebook": window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank"); break;
    case "x": window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank"); break;
    case "email": window.open(`mailto:?subject=${encodeURIComponent("Support our athlete 💕")}&body=${encodeURIComponent(text)}`, "_blank"); break;
    case "instagram":
      copyText(url);
      openModal({
        title: "Instagram Share",
        theme: "pink",
        sections: [{ label: "Link copied ✅", open: true, html: `<div class="noteCard">✅ Link copied — paste into a Story / DM / bio.</div>` }],
        compact: true,
      });
      break;
  }
}

async function copyText(txt) {
  try { await navigator.clipboard.writeText(txt); }
  catch {
    const ta = document.createElement("textarea");
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

/* ---------------------------
   Delegates / wiring
--------------------------- */
function wireModalDelegates() {
  if (!els.modalBody) return;
  els.modalBody.addEventListener("click", (e) => {
    const t = e.target;
    if (t?.matches?.("[data-copylink]")) {
      copyText(location.href);
      t.textContent = "Copied ✓";
      setTimeout(() => (t.textContent = "Copy"), 900);
      return;
    }
    const shareBtn = t?.closest?.("[data-share]");
    if (shareBtn) runShare(shareBtn.getAttribute("data-share"));
  });
}

function wireButtons() {
  els.modalClose?.addEventListener("click", closeModal);
  els.modalBackdrop?.addEventListener("click", closeModal);
  els.modalMinimize?.addEventListener("click", toggleModalCollapse);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("modalOpen")) closeModal();
  });

  els.copyLinkBtn?.addEventListener("click", () => copyText(location.href));
  els.shareBtn?.addEventListener("click", () => openModal({ title: "Share Options", theme: "pink", sections: [{ label: "Fast share", open: true, html: shareBlockHtml() }] }));

  els.bioBtn?.addEventListener("click", () => openModal({
    title: "Athlete Bio",
    theme: "pink",
    sections: [{ label: "About", open: true, html: `<div class="noteCard"><div class="noteTitle">${escapeHtml(DATA.athlete?.name || "Athlete")}</div><div class="noteText">${escapeHtml(DATA.athlete?.bio?.about || "Add bio content in data/athlete.json")}</div></div>` }],
  }));
  els.bioBtnPhoto?.addEventListener("click", () => els.bioBtn?.click());
  els.supportBtn?.addEventListener("click", () => openModal({ title: "Support / Donate", theme: "pink", sections: [{ label: "Share to sponsors", open: true, html: shareBlockHtml() }] }));

  els.donateBtn?.addEventListener("click", () => els.supportBtn?.click());
  els.openShareModalBtn?.addEventListener("click", () => els.shareBtn?.click());
}

/* Utils */
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function formatNumber(n) { return Number(n || 0).toLocaleString("en-US"); }

/* Boot */
(async function init() {
  DATA = await loadData();
  renderAll();
  wireButtons();
  wireModalDelegates();
})();
