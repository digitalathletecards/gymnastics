/* Digital Athlete Card — Showcase the Journey (3D glass balloons + themed modals)
   - Right side is a balloon bouquet
   - Each balloon has its own premium glass color
   - Modal theme matches balloon color (border/glow/accent)
   - Collapsible modals + accordion
   - Photo Cards includes silent looping video
*/

const $ = (sel, root = document) => root.querySelector(sel);

const els = {
  // Modal
  modalHost: $("#modalHost"),
  modalBackdrop: $("#modalBackdrop"),
  modal: $("#modal"),
  modalTitle: $("#modalTitle"),
  modalBody: $("#modalBody"),
  modalClose: $("#modalClose"),
  modalMinimize: $("#modalMinimize"),

  // Header
  copyLinkBtn: $("#copyLinkBtn"),
  shareBtn: $("#shareBtn"),

  // Athlete
  athletePhoto: $("#athletePhoto"),
  athleteName: $("#athleteName"),
  athleteSub: $("#athleteSub"),
  tierBadge: $("#tierBadge"),
  clubBadge: $("#clubBadge"),
  sportBadge: $("#sportBadge"),
  bioBtn: $("#bioBtn"),
  bioBtnPhoto: $("#bioBtnPhoto"),
  supportBtn: $("#supportBtn"),

  // Fundraising
  fundTitle: $("#fundTitle"),
  fundNumbers: $("#fundNumbers"),
  meterBar: $("#meterBar"),
  fundNote: $("#fundNote"),
  donateBtn: $("#donateBtn"),

  // Share section card
  shareChips: $("#shareChips"),
  openShareModalBtn: $("#openShareModalBtn"),

  // Gallery
  galleryGrid: $("#galleryGrid"),
  gallerySub: $("#gallerySub"),

  // Showcase
  showcaseStage: $("#showcaseStage"),

  // Footer
  builtBtn: $("#builtBtn"),
};

let DATA = null;
let stageParallaxOn = false;

/* ---------------------------
   Modal System + Theme
--------------------------- */

function setModalTheme(theme = "pink") {
  // theme values: pink | aqua | gold | violet | lime
  els.modal.setAttribute("data-theme", theme);
}

function openModal({ title = "Modal", sections = [], compact = false, theme = "pink" } = {}) {
  setModalTheme(theme);

  // Start expanded
  els.modal.classList.remove("modal--collapsed");
  els.modalMinimize.setAttribute("aria-expanded", "true");
  els.modalMinimize.textContent = "▾";
  els.modalMinimize.title = "Collapse";

  els.modalTitle.textContent = title;
  els.modalBody.innerHTML = buildAccordion(sections, compact);

  // GitHub Pages safe: toggle BOTH aria + class
  els.modalHost.setAttribute("aria-hidden", "false");
  els.modalHost.classList.add("is-open");

  document.body.classList.add("modalOpen");
  setTimeout(() => els.modalClose?.focus?.(), 0);
}

function closeModal() {
  els.modalHost.setAttribute("aria-hidden", "true");
  els.modalHost.classList.remove("is-open");
  document.body.classList.remove("modalOpen");
  els.modalBody.innerHTML = "";
}

function toggleModalCollapse() {
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
    // Safe fallback so page never breaks
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
      sponsors: {
        subtitle: "Thank you for helping build the journey.",
        items: [
          { logo: "sponsors/sponsor1.png", name: "Sponsor 1", url: "#" },
          { logo: "sponsors/sponsor2.png", name: "Sponsor 2", url: "#" },
          { logo: "sponsors/sponsor3.png", name: "Sponsor 3", url: "#" },
          { logo: "sponsors/sponsor4.png", name: "Sponsor 4", url: "#" },
        ],
      },
      stats: [
        { label: "Practices / week", value: "4" },
        { label: "New skills", value: "3" },
        { label: "Meets", value: "7" },
        { label: "PRs", value: "5" },
      ],
      journey: [
        { date: "This week", title: "Stuck the routine!", note: "Cleaner landings and stronger confidence." },
        { date: "Last meet", title: "Personal best", note: "A proud, calm performance under pressure." },
      ],
      upcoming: [
        { date: "Next weekend", title: "Winter Invitational", note: "Cheering squad ready 💕" },
      ],
      achievements: [
        { title: "Beam first place", note: "Great focus + control." },
        { title: "Level progress", note: "Strong momentum this season." },
      ],
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

  // Athlete
  els.athleteName.textContent = A.name || "Athlete Name";
  els.athleteSub.textContent = A.subtitle || "Tap to view bio";
  els.clubBadge.textContent = A.club || "Club";
  els.sportBadge.textContent = A.sport || "Sport";
  els.tierBadge.textContent = `🏅 ${A.tier || "Bronze"}`;
  if (A.photo) els.athletePhoto.src = A.photo;

  // Fundraising
  els.fundTitle.textContent = F.title || "Help cover travel, coaching, meet fees.";
  const current = Number(F.current || 0);
  const goal = Math.max(1, Number(F.goal || 1));
  const pct = clamp(Math.round((current / goal) * 100), 0, 100);
  els.fundNumbers.textContent = `$${formatNumber(current)} / $${formatNumber(goal)}`;
  els.meterBar.style.width = `${pct}%`;
  document.querySelector(".meter")?.setAttribute("aria-valuenow", String(pct));
  els.fundNote.textContent = F.note || `Athlete is ${pct}% to the season goal! Help finish strong 💕`;

  // Share chips
  els.shareChips.innerHTML = "";
  (S.chips || []).forEach(ch => {
    const b = document.createElement("button");
    b.className = "chip";
    b.type = "button";
    b.textContent = ch.label;
    b.addEventListener("click", () => runShare(ch.action));
    els.shareChips.appendChild(b);
  });

  // Gallery
  els.gallerySub.textContent = G.subtitle || "Highlights from training + meets.";
  buildGallery(G.items || []);

  // Showcase balloons
  buildShowcase();
}

function buildGallery(items) {
  els.galleryGrid.innerHTML = "";

  // Video Card (silent + loops while page open)
  const videoCard = document.createElement("button");
  videoCard.className = "gCard gCard--video";
  videoCard.type = "button";
  videoCard.innerHTML = `
    <div class="gMedia">
      <video class="gVideo" autoplay muted loop playsinline preload="metadata">
        <source src="images/layla-video.mp4" type="video/mp4" />
        <source src="images/layla-video.mov" type="video/quicktime" />
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

  // Image cards
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
          {
            label: it.title || "Photo",
            open: true,
            html: `
              <div class="modalMedia">
                <img src="${escapeHtml(src)}" alt="${escapeHtml(it.title || "Photo")}" />
              </div>
            `,
          },
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
              <source src="images/layla-video.mp4" type="video/mp4" />
              <source src="images/layla-video.mov" type="video/quicktime" />
            </video>
          </div>
          <div class="tinyNote">
            Best compatibility: add an MP4 named <strong>images/layla-video.mp4</strong>.
          </div>
        `,
      },
      { label: "Share this card", open: false, html: shareBlockHtml() },
    ],
  });

  document.querySelector(".modalVideo")?.play?.().catch(() => {});
}

/* ---------------------------
   Showcase Balloons + matching popups
--------------------------- */

function buildShowcase() {
  const stage = els.showcaseStage;
  if (!stage) return;

  stage.innerHTML = "";

  // Each balloon has its own color theme key = matches CSS and modal themes
  const balloons = [
    { theme: "gold",  emoji: "💎", label: "Sponsors",       sub: "Tap to view",   onClick: openSponsorsModal },
    { theme: "aqua",  emoji: "⚡", label: "Season Snapshot", sub: "Quick stats",   onClick: openSnapshotModal },
    { theme: "pink",  emoji: "⭐", label: "Journey",         sub: "Updates",       onClick: openJourneyModal },
    { theme: "violet",emoji: "📅", label: "Upcoming",       sub: "Next events",   onClick: openUpcomingModal },
    { theme: "lime",  emoji: "🏆", label: "Achievements",   sub: "This season",   onClick: openAchievementsModal },
  ];

  // bouquet cluster layout
  const positions = [
    { left: "10%", top: "16%", tx: "-6px", rot: "-2.6deg" },
    { left: "52%", top: "9%",  tx: "4px",  rot: "2.3deg"  },
    { left: "28%", top: "44%", tx: "7px",  rot: "1.4deg"  },
    { left: "62%", top: "40%", tx: "-4px", rot: "-1.9deg" },
    { left: "40%", top: "70%", tx: "2px",  rot: "-1.2deg" },
  ];

  balloons.forEach((b, i) => {
    const pos = positions[i] || positions[0];

    const btn = document.createElement("button");
    btn.className = "balloon";
    btn.type = "button";
    btn.setAttribute("aria-label", b.label);
    btn.setAttribute("data-c", b.theme);
    btn.style.left = pos.left;
    btn.style.top = pos.top;
    btn.style.setProperty("--tx", pos.tx);
    btn.style.setProperty("--rot", pos.rot);

    btn.innerHTML = `
      <span class="balloon__body"></span>
      <span class="balloon__depth"></span>
      <span class="balloon__content">
        <span class="balloon__emoji">${b.emoji}</span>
        <span class="balloon__label">${escapeHtml(b.label)}</span>
        <span class="balloon__sub">${escapeHtml(b.sub)}</span>
      </span>
      <span class="balloon__knot"></span>
      <span class="balloon__string"></span>
    `;

    btn.addEventListener("click", () => b.onClick(b.theme));
    stage.appendChild(btn);
  });

  enableStageParallax(stage);
}

function enableStageParallax(stage) {
  if (stageParallaxOn) return;
  stageParallaxOn = true;

  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (prefersReduced) return;

  const apply = (x, y) => {
    const balloons = stage.querySelectorAll(".balloon");
    balloons.forEach((el, idx) => {
      const depth = (idx + 1) / 10; // subtle
      const rx = (y * 6.5 * depth).toFixed(2);
      const ry = (x * -8.5 * depth).toFixed(2);
      el.style.transform = `rotate(var(--rot)) translate3d(var(--tx), 0px, 0px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
  };

  const onMove = (ev) => {
    const rect = stage.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = (ev.clientX - cx) / (rect.width / 2);
    const y = (ev.clientY - cy) / (rect.height / 2);
    apply(clamp(x, -1, 1), clamp(y, -1, 1));
  };

  stage.addEventListener("pointermove", onMove, { passive: true });
  stage.addEventListener("pointerleave", () => apply(0, 0), { passive: true });
}

/* ---------------------------
   Popups for balloons (theme passed in)
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
    return `<div class="noteCard"><div class="noteTitle">No sponsors yet</div><div class="noteText">Add sponsors in <strong>data/athlete.json</strong> to show them here.</div></div>`;
  }
  return `
    <div class="mList">
      ${items.map(s => `
        <div class="mItem">
          <div class="mTop">
            <div class="mTitle">${escapeHtml(s.name || "Sponsor")}</div>
            <div class="mMeta">${s.url ? "Tap to visit" : ""}</div>
          </div>
          <div class="mNote">${s.url ? `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener" style="color:rgba(255,255,255,.82);font-weight:900;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.18)">Open sponsor link</a>` : "Link not provided"}</div>
        </div>
      `).join("")}
    </div>
  `;
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
  return `
    <div class="mList">
      ${items.map(s => `
        <div class="mItem">
          <div class="mTop">
            <div class="mTitle">${escapeHtml(s.label || "Stat")}</div>
            <div class="mMeta">${escapeHtml(s.value ?? "")}</div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function openJourneyModal(theme = "pink") {
  const items = DATA.journey || [];
  openModal({
    title: "⭐ Journey",
    theme,
    sections: [
      { label: "Updates", open: true, html: () => timelineHtml(items) },
      { label: "Share this card", open: false, html: shareBlockHtml() },
    ],
  });
}

function openUpcomingModal(theme = "violet") {
  const items = DATA.upcoming || [];
  openModal({
    title: "📅 Upcoming",
    theme,
    sections: [
      { label: "Next events", open: true, html: () => timelineHtml(items, true) },
      { label: "Share this card", open: false, html: shareBlockHtml() },
    ],
  });
}

function openAchievementsModal(theme = "lime") {
  const items = DATA.achievements || [];
  openModal({
    title: "🏆 Achievements",
    theme,
    sections: [
      { label: "This season", open: true, html: () => achievementsHtml(items) },
      { label: "Share this card", open: false, html: shareBlockHtml() },
    ],
  });
}

function timelineHtml(items, isUpcoming = false) {
  if (!items.length) {
    return `<div class="noteCard"><div class="noteTitle">${isUpcoming ? "No upcoming events" : "No updates yet"}</div><div class="noteText">Add items in <strong>data/athlete.json</strong>.</div></div>`;
  }
  return `
    <div class="mList">
      ${items.map(it => `
        <div class="mItem">
          <div class="mTop">
            <div class="mTitle">${escapeHtml(it.title || it.name || "Item")}</div>
            <div class="mMeta">${escapeHtml(it.date || "")}</div>
          </div>
          ${it.note ? `<div class="mNote">${escapeHtml(it.note)}</div>` : ""}
        </div>
      `).join("")}
    </div>
  `;
}

function achievementsHtml(items) {
  if (!items.length) {
    return `<div class="noteCard"><div class="noteTitle">No achievements yet</div><div class="noteText">Add achievements in <strong>data/athlete.json</strong>.</div></div>`;
  }
  return `
    <div class="mList">
      ${items.map(a => `
        <div class="mItem">
          <div class="mTop">
            <div class="mTitle">${escapeHtml(a.title || "Achievement")}</div>
            <div class="mMeta">⭐</div>
          </div>
          ${a.note ? `<div class="mNote">${escapeHtml(a.note)}</div>` : ""}
        </div>
      `).join("")}
    </div>
  `;
}

/* ---------------------------
   Other Modals
--------------------------- */

function openBioModal() {
  const bio = DATA.athlete?.bio || {};
  const strengths = Array.isArray(bio.strengths) ? bio.strengths : [];

  openModal({
    title: "Athlete Bio",
    theme: "pink",
    sections: [
      {
        label: bio.headline || "About",
        open: true,
        html: `
          <div class="noteCard">
            <div class="noteTitle">${escapeHtml(DATA.athlete?.name || "Athlete")}</div>
            <div class="noteText">${escapeHtml(bio.about || "Add bio content in data/athlete.json")}</div>
          </div>
        `,
      },
      {
        label: "Strengths",
        open: false,
        html: `<div class="pillRow">${strengths.map(s => `<span class="pill pill--spark">${escapeHtml(s)}</span>`).join("")}</div>`,
      },
      { label: "Share this card", open: false, html: shareBlockHtml() },
    ],
  });
}

function openSupportModal() {
  const f = DATA.fundraising || {};
  const current = Number(f.current || 0);
  const goal = Math.max(1, Number(f.goal || 1));
  const pct = clamp(Math.round((current / goal) * 100), 0, 100);

  openModal({
    title: "Support / Donate",
    theme: "pink",
    sections: [
      {
        label: "Why it matters",
        open: true,
        html: `
          <div class="noteCard">
            <div class="noteTitle">Every share helps 💕</div>
            <div class="noteText">
              Sponsorships help cover meet fees, coaching, travel, and training so the focus stays on confidence + growth.
            </div>
          </div>
        `,
      },
      {
        label: "Goal progress",
        open: false,
        html: `
          <div class="noteCard">
            <div class="noteTitle">$${formatNumber(current)} raised</div>
            <div class="noteText">Goal: $${formatNumber(goal)} (${pct}%)</div>
          </div>
        `,
      },
      { label: "Share with sponsors", open: false, html: shareBlockHtml() },
    ],
  });
}

function openShareModal() {
  openModal({
    title: "Share Options",
    theme: "pink",
    sections: [
      { label: "Fast share", open: true, html: shareBlockHtml() },
      {
        label: "Sponsor message template",
        open: false,
        html: `
          <div class="noteCard">
            <div class="noteTitle">Copy/Paste</div>
            <div class="noteText">
              Hi! We’re raising support for ${escapeHtml(DATA.athlete?.name || "our athlete")}’s season.
              Would you consider sponsoring? Here’s the digital card with her journey + sponsor placements:
              <br/><br/><strong>${escapeHtml(location.href)}</strong>
            </div>
          </div>
        `,
      },
    ],
  });
}

function openBuiltModal() {
  openModal({
    title: "Built to be shared",
    theme: "pink",
    sections: [
      {
        label: "Parents + sponsors love it",
        open: true,
        html: `
          <div class="noteCard">
            <div class="noteTitle">A feel-good fundraising tool</div>
            <div class="noteText">
              A premium digital card that showcases the journey — easy to share, beautiful on every screen,
              and sponsor-friendly.
            </div>
          </div>
        `,
      },
      { label: "Share this page", open: false, html: shareBlockHtml() },
    ],
    compact: true,
  });
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
    case "text":
      window.open(`sms:?&body=${encodeURIComponent(text)}`, "_blank");
      break;
    case "whatsapp":
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
      break;
    case "facebook":
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
      break;
    case "x":
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
      break;
    case "email":
      window.open(`mailto:?subject=${encodeURIComponent("Support our athlete 💕")}&body=${encodeURIComponent(text)}`, "_blank");
      break;
    case "instagram":
      copyText(url);
      openModal({
        title: "Instagram Share",
        theme: "pink",
        sections: [{
          label: "Link copied ✅",
          open: true,
          html: `
            <div class="noteCard">
              Instagram doesn’t allow direct web prefill for posts/stories.
              <br/><br/>
              ✅ Link copied — paste into a Story / DM / bio.
            </div>
          `
        }],
        compact: true,
      });
      break;
  }
}

async function copyText(txt) {
  try {
    await navigator.clipboard.writeText(txt);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

/* ---------------------------
   Events
--------------------------- */

function wireModalDelegates() {
  els.modalBody.addEventListener("click", (e) => {
    const t = e.target;

    if (t?.matches?.("[data-copylink]")) {
      copyText(location.href);
      t.textContent = "Copied ✓";
      setTimeout(() => (t.textContent = "Copy"), 900);
      return;
    }

    const shareBtn = t?.closest?.("[data-share]");
    if (shareBtn) {
      runShare(shareBtn.getAttribute("data-share"));
      return;
    }
  });
}

function wireButtons() {
  // Modal controls
  els.modalClose.addEventListener("click", closeModal);
  els.modalBackdrop.addEventListener("click", closeModal);
  els.modalMinimize.addEventListener("click", toggleModalCollapse);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("modalOpen")) closeModal();
  });

  // Header
  els.copyLinkBtn.addEventListener("click", () => copyText(location.href));
  els.shareBtn.addEventListener("click", openShareModal);

  // Hero
  els.bioBtn.addEventListener("click", openBioModal);
  els.bioBtnPhoto.addEventListener("click", openBioModal);
  els.supportBtn.addEventListener("click", openSupportModal);

  // Fundraising
  els.donateBtn.addEventListener("click", openSupportModal);

  // Share card
  els.openShareModalBtn.addEventListener("click", openShareModal);

  // Footer
  els.builtBtn.addEventListener("click", openBuiltModal);
}

/* ---------------------------
   Utils
--------------------------- */

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function formatNumber(n) { return Number(n || 0).toLocaleString("en-US"); }

/* ---------------------------
   Boot
--------------------------- */

(async function init() {
  DATA = await loadData();
  renderAll();
  wireButtons();
  wireModalDelegates();
})();
