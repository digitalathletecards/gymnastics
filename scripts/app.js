/* Ultra-premium athlete card baseline:
   - Collapsible sections inside every modal (accordion)
   - Modal chrome can minimize/collapse
   - Photo Cards includes an always-looping muted video card while page is open
*/

const $ = (sel, root = document) => root.querySelector(sel);

const els = {
  // Core
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

  // Hero
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

  // Right rail
  sponsorGrid: $("#sponsorGrid"),
  sponsorSub: $("#sponsorSub"),
  becomeSponsorBtn: $("#becomeSponsorBtn"),
  statsGrid: $("#statsGrid"),
  timeline: $("#timeline"),
  upcomingList: $("#upcomingList"),
  achList: $("#achList"),

  // Footer
  builtBtn: $("#builtBtn"),
};

let DATA = null;

/* ---------------------------
   Modal System (collapsible)
--------------------------- */

function openModal({ title = "Modal", sections = [], compact = false } = {}) {
  // Ensure expanded state every time
  els.modal.classList.remove("modal--collapsed");
  els.modalMinimize.setAttribute("aria-expanded", "true");
  els.modalMinimize.textContent = "▾";
  els.modalMinimize.title = "Collapse";

  els.modalTitle.textContent = title;
  els.modalBody.innerHTML = buildAccordion(sections, compact);

  els.modalHost.setAttribute("aria-hidden", "false");
  document.body.classList.add("modalOpen");

  // Focus close for accessibility
  setTimeout(() => els.modalClose?.focus(), 0);
}

function closeModal() {
  els.modalHost.setAttribute("aria-hidden", "true");
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
      ${sections
        .map((s, idx) => {
          const openAttr = s.open ?? idx === 0 ? "open" : "";
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
        })
        .join("")}
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
   Data Loading
--------------------------- */

async function loadData() {
  // Use your existing athlete.json structure; fallback to a safe default if missing
  try {
    const res = await fetch("data/athlete.json", { cache: "no-store" });
    if (!res.ok) throw new Error("athlete.json not found");
    return await res.json();
  } catch (e) {
    return {
      athlete: {
        name: "Athlete Name",
        club: "KP Gymnastics",
        sport: "Gymnastics",
        tier: "Bronze",
        subtitle: "Tap to view bio",
        photo: "images/card1.PNG",
        bio: {
          headline: "Meet our athlete",
          about: "Add a short bio in data/athlete.json",
          strengths: ["Consistency", "Coachability", "Confidence"],
        },
      },
      fundraising: {
        title: "Help cover travel, coaching, meet fees.",
        current: 650,
        goal: 2000,
        note: "Athlete is 33% to the season goal! Help finish strong 💕",
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
        { title: "First place on beam", note: "Great focus + control." },
        { title: "New level readiness", note: "Progress you can feel." },
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
  const SP = DATA.sponsors || {};

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
  els.fundNumbers.textContent = `$${formatNumber(current)} / $${formatNumber(goal)}`;
  const pct = clamp(Math.round((current / goal) * 100), 0, 100);
  els.meterBar.style.width = `${pct}%`;
  const meter = document.querySelector(".meter");
  meter?.setAttribute("aria-valuenow", String(pct));
  els.fundNote.textContent = F.note || `Athlete is ${pct}% to the season goal! Help finish strong 💕`;

  // Share chips (quick actions)
  els.shareChips.innerHTML = "";
  (S.chips || []).forEach(ch => {
    const b = document.createElement("button");
    b.className = "chip";
    b.type = "button";
    b.textContent = ch.label;
    b.addEventListener("click", () => runShare(ch.action));
    els.shareChips.appendChild(b);
  });

  // Gallery (prepend looping silent video)
  els.gallerySub.textContent = G.subtitle || "Highlights from training + meets.";
  buildGallery(G.items || []);

  // Sponsors
  els.sponsorSub.textContent = SP.subtitle || "Thank you for helping build the journey.";
  buildSponsors(SP.items || []);

  // Stats / Journey / Upcoming / Achievements
  buildStats(DATA.stats || []);
  buildTimeline(DATA.journey || []);
  buildUpcoming(DATA.upcoming || []);
  buildAchievements(DATA.achievements || []);
}

function buildGallery(items) {
  els.galleryGrid.innerHTML = "";

  // 1) Video Card (always present)
  const videoCard = document.createElement("button");
  videoCard.className = "gCard gCard--video";
  videoCard.type = "button";
  videoCard.innerHTML = `
    <div class="gMedia">
      <video class="gVideo"
        autoplay
        muted
        loop
        playsinline
        preload="metadata">
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

  // Attempt to ensure autoplay kicks in on picky browsers (muted + playsinline should work)
  const vid = videoCard.querySelector("video");
  if (vid) {
    const tryPlay = () => vid.play().catch(() => {});
    // Try immediately + after first user gesture
    tryPlay();
    window.addEventListener("pointerdown", tryPlay, { once: true, passive: true });
  }

  // 2) Image cards from data
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
          {
            label: "Share this moment",
            open: false,
            html: shareBlockHtml(),
          },
        ],
      });
    });

    els.galleryGrid.appendChild(btn);
  });
}

function openVideoModal() {
  openModal({
    title: "Highlight Reel",
    sections: [
      {
        label: "Video (silent loop)",
        open: true,
        html: `
          <div class="modalMedia">
            <video class="modalVideo"
              autoplay
              muted
              loop
              playsinline
              controls
              preload="metadata">
              <source src="images/layla-video.mp4" type="video/mp4" />
              <source src="images/layla-video.mov" type="video/quicktime" />
            </video>
          </div>
          <div class="tinyNote">Tip: If the .mov doesn’t play in a browser, export an .mp4 (H.264) and keep the same filename above.</div>
        `,
      },
      {
        label: "Share this card",
        open: false,
        html: shareBlockHtml(),
      },
    ],
  });

  // Encourage play if needed
  const mv = document.querySelector(".modalVideo");
  mv?.play?.().catch(() => {});
}

function buildSponsors(items) {
  els.sponsorGrid.innerHTML = "";
  items.forEach((sp) => {
    const a = document.createElement("a");
    a.className = "sCard";
    a.href = sp.url || "#";
    a.target = "_blank";
    a.rel = "noopener";
    a.innerHTML = `
      <img class="sLogo" src="${escapeHtml(sp.logo || "")}" alt="${escapeHtml(sp.name || "Sponsor")}" loading="lazy" decoding="async" />
      <div class="sName">${escapeHtml(sp.name || "Sponsor")}</div>
    `;
    els.sponsorGrid.appendChild(a);
  });
}

function buildStats(items) {
  els.statsGrid.innerHTML = "";
  items.forEach(st => {
    const d = document.createElement("div");
    d.className = "stat";
    d.innerHTML = `
      <div class="stat__v">${escapeHtml(st.value ?? "")}</div>
      <div class="stat__l">${escapeHtml(st.label ?? "")}</div>
    `;
    els.statsGrid.appendChild(d);
  });
}

function buildTimeline(items) {
  els.timeline.innerHTML = "";
  items.forEach(j => {
    const row = document.createElement("div");
    row.className = "tItem";
    row.innerHTML = `
      <div class="tDot"></div>
      <div class="tBody">
        <div class="tTop">
          <div class="tTitle">${escapeHtml(j.title || "")}</div>
          <div class="tDate">${escapeHtml(j.date || "")}</div>
        </div>
        <div class="tNote">${escapeHtml(j.note || "")}</div>
      </div>
    `;
    els.timeline.appendChild(row);
  });
}

function buildUpcoming(items) {
  els.upcomingList.innerHTML = "";
  items.forEach(u => {
    const row = document.createElement("div");
    row.className = "uItem";
    row.innerHTML = `
      <div class="uDate">${escapeHtml(u.date || "")}</div>
      <div class="uMain">
        <div class="uTitle">${escapeHtml(u.title || "")}</div>
        <div class="uNote">${escapeHtml(u.note || "")}</div>
      </div>
    `;
    els.upcomingList.appendChild(row);
  });
}

function buildAchievements(items) {
  els.achList.innerHTML = "";
  items.forEach(a => {
    const row = document.createElement("div");
    row.className = "aItem";
    row.innerHTML = `
      <div class="aTitle">${escapeHtml(a.title || "")}</div>
      <div class="aNote">${escapeHtml(a.note || "")}</div>
    `;
    els.achList.appendChild(row);
  });
}

/* ---------------------------
   Share / Actions
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
      <div class="tinyNote">Pro move: send this to 3 local businesses today (gym, dentist, restaurant) 💎</div>
    </div>
  `;
}

function runShare(kind) {
  const url = location.href;
  const text = `Check out this digital athlete card 💕 ${url}`;

  // Some platforms don’t support direct share URLs cleanly (Instagram especially).
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
      // No official web-based prefill share like others; best UX is copy + open IG
      copyText(url);
      openModal({
        title: "Instagram Share",
        sections: [
          {
            label: "Copy link (done) ✅",
            open: true,
            html: `
              <div class="noteCard">
                Instagram doesn’t allow pre-filling a post from a web link.
                <br/><br/>
                ✅ Link copied — open Instagram and paste it into your Story / bio / DM.
              </div>
              <div class="shareGrid">
                <button class="btn btn--primary" type="button" data-openig>Open Instagram</button>
                <button class="btn btn--soft" type="button" data-copylink>Copy again</button>
              </div>
            `,
          },
        ],
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
  // Delegate clicks inside modal body
  els.modalBody.addEventListener("click", (e) => {
    const t = e.target;

    // Copy link buttons
    if (t?.matches?.("[data-copylink]")) {
      copyText(location.href);
      t.textContent = "Copied ✓";
      setTimeout(() => (t.textContent = "Copy"), 900);
      return;
    }

    // Share buttons
    const shareBtn = t?.closest?.("[data-share]");
    if (shareBtn) {
      runShare(shareBtn.getAttribute("data-share"));
      return;
    }

    // Open Instagram
    if (t?.matches?.("[data-openig]")) {
      // Opens IG website; app handoff depends on device
      window.open("https://www.instagram.com/", "_blank");
      return;
    }
  });
}

function openBioModal() {
  const bio = (DATA.athlete && DATA.athlete.bio) || {};
  const strengths = Array.isArray(bio.strengths) ? bio.strengths : [];

  openModal({
    title: "Athlete Bio",
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
        html: `
          <div class="pillRow">
            ${strengths.map(s => `<span class="pill pill--spark">${escapeHtml(s)}</span>`).join("")}
          </div>
        `,
      },
      {
        label: "Share this card",
        open: false,
        html: shareBlockHtml(),
      },
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
          <div class="progressCard">
            <div class="progressTop">
              <div class="progressNum">$${formatNumber(current)} raised</div>
              <div class="progressGoal">Goal: $${formatNumber(goal)} (${pct}%)</div>
            </div>
            <div class="progressBar">
              <div class="progressFill" style="width:${pct}%"></div>
            </div>
            <div class="tinyNote">Add real donation links + amounts in your implementation.</div>
          </div>
        `,
      },
      {
        label: "Share with sponsors",
        open: false,
        html: shareBlockHtml(),
      },
    ],
  });
}

function openShareModal() {
  openModal({
    title: "Share Options",
    sections: [
      { label: "Fast share", open: true, html: shareBlockHtml() },
      {
        label: "Sponsor script (copy/paste)",
        open: false,
        html: `
          <div class="noteCard">
            <div class="noteTitle">Message template</div>
            <div class="noteText">
              Hi! We’re raising support for ${escapeHtml(DATA.athlete?.name || "our athlete")}’s season.
              Would you consider sponsoring? Here’s the digital card with her journey + sponsor placements:
              <br/><br/><strong>${escapeHtml(location.href)}</strong>
            </div>
          </div>
          <div class="shareRow">
            <button class="btn btn--primary" type="button" data-copylink>Copy card link</button>
          </div>
        `,
      },
    ],
  });
}

function openBuiltModal() {
  openModal({
    title: "Built to be shared",
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
      {
        label: "Get one made",
        open: false,
        html: `
          <div class="noteCard">
            <div class="noteTitle">Showcase the Journey</div>
            <div class="noteText">Custom cards starting at <strong>$199.99</strong>.</div>
          </div>
          <div class="shareRow">
            <button class="btn btn--primary" type="button" onclick="window.open('#','_blank')">Showcase the Journey</button>
          </div>
        `,
      },
      {
        label: "Share this page",
        open: false,
        html: shareBlockHtml(),
      },
    ],
    compact: true,
  });
}

function wireButtons() {
  // Modal
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

  // Sponsors CTA
  els.becomeSponsorBtn.addEventListener("click", openShareModal);

  // Footer
  els.builtBtn.addEventListener("click", openBuiltModal);
}

/* ---------------------------
   Utilities
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
