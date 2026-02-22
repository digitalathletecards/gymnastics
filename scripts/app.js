/* ===============================
   Digital Athlete Card — app.js
   Drop-in, copy/paste complete file
   Works with: index.html you posted + data/athlete.json
   =============================== */

(() => {
  // -----------------------------
  // Safe DOM helpers (no null crashes)
  // -----------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const byId = (id) => document.getElementById(id);
  const on = (el, evt, fn, opts) => el && el.addEventListener(evt, fn, opts);
  const setText = (el, val) => el && (el.textContent = val ?? "");
  const setHTML = (el, val) => el && (el.innerHTML = val ?? "");
  const setAttr = (el, name, val) => el && val != null && el.setAttribute(name, String(val));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const fmtMoney = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(n || 0));
  const fmtScore = (n) => (Number.isFinite(+n) ? (+n).toFixed(3).replace(/\.?0+$/, "") : "—");

  function domReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  // -----------------------------
  // App state
  // -----------------------------
  const state = {
    athlete: null,
    reducedMotion: false,
    currentEventKey: null,
    chart: null,
    milestonesHit: new Set(),
    cardTimer: null,
    cardIndex: 0,
  };

  const LS = {
    reducedMotion: "dac_reduced_motion",
    sponsorClicks: "dac_sponsor_clicks_v1",
    milestones: "dac_milestones_v1",
  };

  // -----------------------------
  // Modal controls
  // -----------------------------
  function openModal(id) {
    const overlay = byId(id);
    if (!overlay) return;
    overlay.setAttribute("aria-hidden", "false");
    overlay.classList.add("open");
    document.documentElement.classList.add("modalOpen");
    // focus first close button for accessibility
    const closeBtn = $(`[data-close="${id}"]`, overlay) || $(".modalClose", overlay);
    closeBtn && closeBtn.focus({ preventScroll: true });
  }

  function closeModal(id) {
    const overlay = byId(id);
    if (!overlay) return;
    overlay.setAttribute("aria-hidden", "true");
    overlay.classList.remove("open");
    // only remove modalOpen if no other modals are open
    const anyOpen = $$('.modalOverlay.open').length > 0;
    if (!anyOpen) document.documentElement.classList.remove("modalOpen");
  }

  function wireModalClose() {
    // click close buttons
    $$(".modalClose").forEach((btn) => {
      on(btn, "click", () => {
        const id = btn.getAttribute("data-close");
        if (id) closeModal(id);
        else {
          const overlay = btn.closest(".modalOverlay");
          overlay && closeModal(overlay.id);
        }
      });
    });

    // click outside card closes
    $$(".modalOverlay").forEach((overlay) => {
      on(overlay, "click", (e) => {
        if (e.target === overlay) closeModal(overlay.id);
      });
    });

    // ESC closes topmost
    on(document, "keydown", (e) => {
      if (e.key !== "Escape") return;
      const openOverlays = $$(".modalOverlay.open");
      if (!openOverlays.length) return;
      closeModal(openOverlays[openOverlays.length - 1].id);
    });
  }

  // -----------------------------
  // SEO + social tags
  // NOTE: OG image MUST be absolute URL for best previews.
  // -----------------------------
  function applySeo(ath) {
    const url = window.location.href.split("#")[0];

    const fullName = [ath.firstName, ath.lastName].filter(Boolean).join(" ").trim() || ath.name || "Digital Athlete Card";
    const team = ath.team || ath.club || "Youth Sports";
    const sport = ath.discipline || ath.sport || "Gymnastics";
    const level = ath.level || ath.badge || "";

    const title = `${fullName}${level ? " | " + level : ""} | ${team} | ${sport} Fundraiser`;
    const desc =
      ath.seoDescription ||
      ath.storyShort ||
      `Support ${fullName}${level ? ` (${level})` : ""}. View meet scores, performance charts, season highlights, and sponsor their journey.`;

    // Title tag
    document.title = title;
    const pageTitle = byId("pageTitle");
    if (pageTitle) pageTitle.textContent = title;

    // Meta description
    const metaDesc = byId("metaDesc");
    if (metaDesc) metaDesc.setAttribute("content", desc);

    // Canonical + og:url
    setAttr(byId("canonicalLink"), "href", url);
    setAttr(byId("ogUrl"), "content", url);

    // OG + Twitter title/desc
    setAttr(byId("ogTitle"), "content", `Support ${fullName}'s Season Journey ✨`);
    setAttr(byId("ogDesc"), "content", desc);
    setAttr(byId("twTitle"), "content", `Support ${fullName}'s Season ✨`);
    setAttr(byId("twDesc"), "content", desc);

    // Share image (absolute recommended)
    // athlete.json can include shareImageAbsolute (best) or shareImage (relative)
    let shareImg = ath.shareImageAbsolute || "";
    if (!shareImg && ath.shareImage) {
      try {
        shareImg = new URL(ath.shareImage, url).toString();
      } catch {
        shareImg = "";
      }
    }
    if (shareImg) {
      setAttr(byId("ogImage"), "content", shareImg);
      setAttr(byId("twImage"), "content", shareImg);
    }

    // JSON-LD structured data (simple & safe)
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: fullName,
      description: desc,
      sport: sport,
      memberOf: team,
      url,
      sameAs: (ath.links || [])
        .map((l) => l?.url)
        .filter(Boolean),
    };
    const jsonLdEl = byId("jsonLd");
    if (jsonLdEl) jsonLdEl.textContent = JSON.stringify(jsonLd);
  }

  // -----------------------------
  // Reduced motion
  // -----------------------------
  function loadReducedMotion() {
    const saved = localStorage.getItem(LS.reducedMotion);
    state.reducedMotion = saved === "1";
    document.documentElement.classList.toggle("reduceMotion", state.reducedMotion);
  }

  function toggleReducedMotion() {
    state.reducedMotion = !state.reducedMotion;
    localStorage.setItem(LS.reducedMotion, state.reducedMotion ? "1" : "0");
    document.documentElement.classList.toggle("reduceMotion", state.reducedMotion);
    // stop/start auto-rotation
    if (state.reducedMotion) stopCardAutoRotate();
    else startCardAutoRotate();
  }

  // -----------------------------
  // Share utilities
  // -----------------------------
  function pageUrl() {
    return window.location.href.split("#")[0];
  }

  async function copyLink(text = pageUrl()) {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied!");
    } catch {
      prompt("Copy this link:", text);
    }
  }

  async function nativeShare({ title, text, url } = {}) {
    const shareTitle = title || document.title || "Digital Athlete Card";
    const shareText =
      text || "Support this athlete’s season 💕 Tap to view scores, highlights, and sponsors.";
    const shareUrl = url || pageUrl();

    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      } else {
        await copyLink(shareUrl);
      }
    } catch {
      // user canceled share — ignore
    }
  }

  function wireShareButtons() {
    const url = pageUrl();
    const baseMsg = state.athlete?.shareMessage || "Support this athlete’s season 💕 View scores, highlights, and sponsors:";
    const encoded = encodeURIComponent(`${baseMsg} ${url}`);

    const sms = byId("qsSms");
    if (sms) sms.href = `sms:&body=${encoded}`;

    const wa = byId("qsWhatsapp");
    if (wa) wa.href = `https://wa.me/?text=${encoded}`;

    const fb = byId("qsFacebook");
    if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

    const em = byId("qsEmail");
    if (em)
      em.href = `mailto:?subject=${encodeURIComponent("Support this athlete’s season")}&body=${encoded}`;

    on(byId("btnCopyLink"), "click", () => copyLink(url));
    on(byId("ctaShare"), "click", () => nativeShare());
    on(byId("btnNativeShare"), "click", () => nativeShare());

    on(byId("btnShareProgress"), "click", () => {
      const t = byId("shareProgressText")?.textContent || "Support this athlete’s season 💕";
      nativeShare({ text: `${t}` });
    });
  }

  // Simple toast (no CSS dependency; uses alert fallback)
  let toastTimer = null;
  function toast(msg) {
    // If your CSS includes a nicer toast, you can replace this.
    // Keeping it ultra-safe for copy/paste.
    const elId = "dacToast";
    let el = byId(elId);
    if (!el) {
      el = document.createElement("div");
      el.id = elId;
      el.style.cssText =
        "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9999;" +
        "background:rgba(0,0,0,.72);color:#fff;padding:10px 14px;border-radius:999px;" +
        "font:600 13px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Arial;letter-spacing:.2px;" +
        "backdrop-filter: blur(10px);box-shadow:0 14px 40px rgba(0,0,0,.35);opacity:0;transition:opacity .2s ease";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.style.opacity = "0"), 1300);
  }

  // -----------------------------
  // Sponsor click analytics (local only)
  // -----------------------------
  function getSponsorClicks() {
    try {
      return JSON.parse(localStorage.getItem(LS.sponsorClicks) || "{}") || {};
    } catch {
      return {};
    }
  }

  function bumpSponsorClick(name) {
    const data = getSponsorClicks();
    data[name] = (data[name] || 0) + 1;
    localStorage.setItem(LS.sponsorClicks, JSON.stringify(data));
  }

  function renderSponsorAnalyticsBanner() {
    const banner = byId("sponsorAnalyticsBanner");
    if (!banner) return;

    const clicks = getSponsorClicks();
    const entries = Object.entries(clicks).sort((a, b) => b[1] - a[1]);

    if (!entries.length) {
      banner.style.display = "none";
      return;
    }

    banner.style.display = "block";
    banner.style.padding = "14px 14px 0";
    banner.style.color = "rgba(255,255,255,.85)";
    banner.style.fontSize = "13px";

    const top = entries.slice(0, 3).map(([n, c]) => `<strong>${escapeHtml(n)}</strong> (${c})`).join(" · ");
    banner.innerHTML = `<div style="opacity:.9">Sponsor clicks (this device): ${top}${entries.length > 3 ? " · …" : ""}</div>`;
  }

  // -----------------------------
  // Populate hero + fundraising
  // -----------------------------
  function renderHero(ath) {
    setText(byId("athleteFirstName"), ath.firstName || (ath.name || "").split(" ")[0] || "Athlete");
    setText(byId("athleteLastName"), ath.lastName || (ath.name || "").split(" ").slice(1).join(" ") || "");
    setText(byId("athleteTeam"), ath.team || ath.club || "Team");
    setText(byId("athleteDiscipline"), ath.discipline || ath.sport || "Gymnastics");

    // badge
    const badge = byId("levelBadge");
    if (badge) {
      const level = ath.level || "Bronze";
      badge.textContent = `🏅 ${level}`;
      badge.setAttribute("aria-label", level);
    }

    // fundraising
    const raised = Number(ath.fundraising?.raised ?? ath.raised ?? 0);
    const goal = Number(ath.fundraising?.goal ?? ath.goal ?? 0);
    const pct = goal > 0 ? clamp((raised / goal) * 100, 0, 100) : 0;

    setText(byId("goalPill"), `${fmtMoney(raised)} / ${fmtMoney(goal)}`);
    const subtitle = ath.fundraising?.subtitle || "Help cover travel, coaching, meet fees.";
    setText(byId("goalSubtitle"), subtitle);

    const pb = byId("progressBar");
    if (pb) pb.style.width = `${pct}%`;

    // Share progress text
    const spt = byId("shareProgressText");
    if (spt) {
      const name = [ath.firstName, ath.lastName].filter(Boolean).join(" ").trim() || "This athlete";
      spt.textContent = `${name} is ${Math.round(pct)}% to the season goal! Help finish strong 💕`;
    }

    // Donate button
    on(byId("ctaDonate"), "click", () => {
      const donateUrl = ath.fundraising?.donateUrl || ath.donateUrl || "";
      if (donateUrl) window.open(donateUrl, "_blank", "noopener");
      else toast("Add fundraising.donateUrl in athlete.json");
    });

    // Celebrate milestones (confetti + overlay) based on pct
    checkMilestones(pct, ath);
  }

  // -----------------------------
  // Milestones (confetti + overlay)
  // -----------------------------
  function loadMilestones() {
    try {
      const saved = JSON.parse(localStorage.getItem(LS.milestones) || "[]");
      if (Array.isArray(saved)) saved.forEach((m) => state.milestonesHit.add(String(m)));
    } catch {}
  }

  function saveMilestones() {
    localStorage.setItem(LS.milestones, JSON.stringify(Array.from(state.milestonesHit)));
  }

  function fireConfetti() {
    if (state.reducedMotion) return;
    if (typeof window.confetti !== "function") return;
    window.confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.7 },
    });
  }

  function showMilestoneOverlay({ emoji, msg, sub }) {
    const overlay = byId("milestoneOverlay");
    const e = byId("milestoneEmoji");
    const m = byId("milestoneMsg");
    const s = byId("milestoneSub");
    if (!overlay || !e || !m || !s) return;

    e.textContent = emoji || "🎉";
    m.textContent = msg || "Milestone reached!";
    s.textContent = sub || "Thank you for the support!";

    overlay.style.display = "flex";
    setTimeout(() => (overlay.style.display = "none"), 1800);
  }

  function checkMilestones(pct, ath) {
    const steps = [
      { k: "25", at: 25, emoji: "✨", msg: "25% reached!", sub: "Momentum is building — keep sharing 💕" },
      { k: "50", at: 50, emoji: "🎉", msg: "Halfway there!", sub: "This is huge — thank you supporters!" },
      { k: "75", at: 75, emoji: "🚀", msg: "75% reached!", sub: "Almost there — one more push!" },
      { k: "100", at: 100, emoji: "🏆", msg: "Goal reached!", sub: "Season powered — thank you sponsors!" },
    ];

    for (const step of steps) {
      if (pct >= step.at && !state.milestonesHit.has(step.k)) {
        state.milestonesHit.add(step.k);
        saveMilestones();
        fireConfetti();
        const who = [ath.firstName, ath.lastName].filter(Boolean).join(" ").trim() || "This athlete";
        showMilestoneOverlay({
          emoji: step.emoji,
          msg: `${who}: ${step.msg}`,
          sub: step.sub,
        });
      }
    }
  }

  // -----------------------------
  // Bio modal rendering
  // -----------------------------
  function renderBioModal(ath) {
    const name = [ath.firstName, ath.lastName].filter(Boolean).join(" ").trim() || ath.name || "Athlete";
    setText(byId("bioTitle"), name);

    // badges
    const badges = [];
    if (ath.level) badges.push({ t: `🏅 ${ath.level}` });
    if (ath.team) badges.push({ t: `🏟️ ${ath.team}` });
    if (ath.discipline) badges.push({ t: `🤸 ${ath.discipline}` });
    if (ath.hometown) badges.push({ t: `📍 ${ath.hometown}` });

    const bioBadges = byId("bioBadges");
    if (bioBadges) {
      bioBadges.innerHTML = badges
        .map((b) => `<span class="badge">${escapeHtml(b.t)}</span>`)
        .join("");
    }

    // photo
    const photoUrl = ath.bio?.photo || ath.photo || ath.heroPhoto || (ath.photos?.[0]?.src || ath.photos?.[0]) || "";
    const bioPhoto = byId("bioPhoto");
    if (bioPhoto) {
      if (photoUrl) {
        bioPhoto.style.backgroundImage = `url("${photoUrl}")`;
        bioPhoto.style.backgroundSize = "cover";
        bioPhoto.style.backgroundPosition = "center";
      } else {
        bioPhoto.style.backgroundImage = "";
      }
    }

    // quick facts
    const facts = ath.bio?.quickFacts || ath.quickFacts || [];
    const quick = byId("bioQuick");
    if (quick) {
      if (facts && facts.length) {
        quick.innerHTML = facts
          .map((f) => `<div class="bioFact"><strong>${escapeHtml(f.label || "")}</strong><span>${escapeHtml(f.value || "")}</span></div>`)
          .join("");
      } else {
        quick.innerHTML = `<div class="bioFact"><strong>Level</strong><span>${escapeHtml(ath.level || "—")}</span></div>`;
      }
    }

    // story
    const story = ath.bio?.storyHtml || ath.bio?.story || ath.story || "";
    const storyEl = byId("bioStory");
    if (storyEl) {
      storyEl.innerHTML = story ? sanitizeSimple(story) : `<p>${escapeHtml(name)}’s story will appear here.</p>`;
    }

    // links
    const links = ath.links || ath.bio?.links || [];
    const linksEl = byId("bioLinks");
    if (linksEl) {
      linksEl.innerHTML = links
        .filter((l) => l && l.url)
        .map((l) => {
          const label = l.label || l.platform || "Link";
          const icon = l.icon || "🔗";
          return `<a class="bioLink" href="${escapeAttr(l.url)}" target="_blank" rel="noopener">${escapeHtml(icon)} ${escapeHtml(label)} <span aria-hidden="true">↗</span></a>`;
        })
        .join("");
    }

    on(byId("openBioModal"), "click", () => openModal("bioModal"));
  }

  // -----------------------------
  // Cards (photo fan)
  // -----------------------------
  function renderCards(ath) {
    const wrap = byId("cardsFan");
    if (!wrap) return;
    wrap.innerHTML = "";

    const photosRaw = ath.photos || ath.cards || [];
    const photos = photosRaw
      .map((p) => (typeof p === "string" ? { src: p } : p))
      .filter((p) => p && p.src);

    if (!photos.length) {
      wrap.innerHTML = `<div style="opacity:.75;padding:20px;">Add photos[] in data/athlete.json</div>`;
      return;
    }

    const cards = photos.map((p, idx) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "photoCard";
      card.setAttribute("aria-label", p.alt || `Photo ${idx + 1}`);
      card.style.backgroundImage = `url("${p.src}")`;
      card.style.backgroundSize = "cover";
      card.style.backgroundPosition = "center";
      card.dataset.index = String(idx);

      // caption overlay (optional)
      if (p.caption) {
        const cap = document.createElement("div");
        cap.className = "photoCap";
        cap.textContent = p.caption;
        card.appendChild(cap);
      }

      on(card, "click", () => openLightbox(p, idx, photos));
      return card;
    });

    // Fan layout: stagger transforms
    cards.forEach((card, i) => {
      const n = cards.length;
      const mid = (n - 1) / 2;
      const rot = (i - mid) * 6; // degrees
      const tx = (i - mid) * 14; // px
      const ty = Math.abs(i - mid) * 4; // px
      card.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
      wrap.appendChild(card);
    });

    // Drag to bring front (simple pointer)
    let drag = false;
    let startX = 0;

    on(wrap, "pointerdown", (e) => {
      drag = true;
      startX = e.clientX;
      wrap.setPointerCapture?.(e.pointerId);
    });

    on(wrap, "pointerup", () => (drag = false));
    on(wrap, "pointercancel", () => (drag = false));
    on(wrap, "pointermove", (e) => {
      if (!drag || state.reducedMotion) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) < 18) return;
      startX = e.clientX;
      // rotate index
      state.cardIndex = (state.cardIndex + (dx < 0 ? 1 : -1) + cards.length) % cards.length;
      applyCardFront(cards, state.cardIndex);
    });

    // Start rotation
    state.cardIndex = 0;
    applyCardFront(cards, state.cardIndex);
    startCardAutoRotate(cards);
  }

  function applyCardFront(cards, idx) {
    cards.forEach((c, i) => {
      c.style.zIndex = String(i === idx ? 50 : 10);
      c.classList.toggle("front", i === idx);
    });
  }

  function startCardAutoRotate(cards) {
    stopCardAutoRotate();
    if (state.reducedMotion) return;
    if (!cards || !cards.length) return;

    state.cardTimer = setInterval(() => {
      state.cardIndex = (state.cardIndex + 1) % cards.length;
      applyCardFront(cards, state.cardIndex);
    }, 2600);
  }

  function stopCardAutoRotate() {
    if (state.cardTimer) clearInterval(state.cardTimer);
    state.cardTimer = null;
  }

  // Simple lightbox modal (created on demand)
  function openLightbox(photo, idx, photos) {
    let lb = byId("dacLightbox");
    if (!lb) {
      lb = document.createElement("div");
      lb.id = "dacLightbox";
      lb.style.cssText =
        "position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;padding:18px;";
      lb.innerHTML = `
        <div style="position:relative;max-width:min(980px,92vw);max-height:86vh;width:100%;">
          <button id="dacLbClose" type="button" aria-label="Close" style="
            position:absolute;top:-10px;right:-10px;border:none;border-radius:999px;
            width:44px;height:44px;background:rgba(255,255,255,.12);color:#fff;
            font-size:20px;cursor:pointer;backdrop-filter:blur(10px);">✕</button>
          <img id="dacLbImg" alt="" style="width:100%;height:auto;max-height:86vh;object-fit:contain;border-radius:18px;box-shadow:0 40px 120px rgba(0,0,0,.55)" />
          <div id="dacLbCap" style="margin-top:10px;color:rgba(255,255,255,.85);font:600 13px/1.3 system-ui;"></div>
          <div style="position:absolute;left:-10px;top:50%;transform:translateY(-50%);">
            <button id="dacLbPrev" type="button" aria-label="Previous" style="width:44px;height:44px;border:none;border-radius:999px;background:rgba(255,255,255,.12);color:#fff;font-size:22px;cursor:pointer;">‹</button>
          </div>
          <div style="position:absolute;right:-10px;top:50%;transform:translateY(-50%);">
            <button id="dacLbNext" type="button" aria-label="Next" style="width:44px;height:44px;border:none;border-radius:999px;background:rgba(255,255,255,.12);color:#fff;font-size:22px;cursor:pointer;">›</button>
          </div>
        </div>
      `;
      document.body.appendChild(lb);
      on(lb, "click", (e) => {
        if (e.target === lb) lb.style.display = "none";
      });
      on(byId("dacLbClose"), "click", () => (lb.style.display = "none"));
    }

    let cur = idx;
    const img = byId("dacLbImg");
    const cap = byId("dacLbCap");

    const render = () => {
      const p = photos[cur];
      if (!p) return;
      img.src = p.src;
      img.alt = p.alt || `Photo ${cur + 1}`;
      cap.textContent = p.caption || "";
    };

    on(byId("dacLbPrev"), "click", (e) => {
      e.stopPropagation();
      cur = (cur - 1 + photos.length) % photos.length;
      render();
    });
    on(byId("dacLbNext"), "click", (e) => {
      e.stopPropagation();
      cur = (cur + 1) % photos.length;
      render();
    });

    render();
    lb.style.display = "flex";
  }

  // -----------------------------
  // Events + chart modal
  // -----------------------------
  function normalizeEvents(ath) {
    // Accept either:
    // events: [{ key:"vault", name:"Vault", scores:[{meet,date,score}], ... }]
    // or events: { vault:[{...}], bars:[{...}] }
    const raw = ath.events || ath.scores || {};

    if (Array.isArray(raw)) {
      return raw.map((e) => ({
        key: e.key || slug(e.name || ""),
        name: e.name || e.key || "Event",
        icon: e.icon || "",
        entries: (e.scores || e.meets || e.entries || []).map(normalizeScoreEntry),
      }));
    }

    // object map
    return Object.entries(raw).map(([key, arr]) => ({
      key,
      name: titleCase(key.replace(/_/g, " ")),
      icon: "",
      entries: (Array.isArray(arr) ? arr : []).map(normalizeScoreEntry),
    }));
  }

  function normalizeScoreEntry(x) {
    if (!x) return { meet: "", date: "", score: null };
    return {
      meet: x.meet || x.name || x.title || "",
      date: x.date || x.when || "",
      score: x.score ?? x.value ?? null,
      notes: x.notes || "",
      location: x.location || "",
    };
  }

  function renderEvents(ath) {
    const grid = byId("eventGrid");
    if (!grid) return;

    const events = normalizeEvents(ath);

    if (!events.length) {
      grid.innerHTML = `<div style="opacity:.75;padding:12px;">Add events in athlete.json</div>`;
      return;
    }

    grid.innerHTML = "";
    events.forEach((ev) => {
      const stats = calcEventStats(ev.entries);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "eventTile";
      btn.dataset.key = ev.key;

      btn.innerHTML = `
        <div class="eventTop">
          <div class="eventName">${escapeHtml(ev.icon ? `${ev.icon} ${ev.name}` : ev.name)}</div>
          <div class="eventScore">${escapeHtml(stats.lastStr)}</div>
        </div>
        <div class="eventMetaRow">
          <span class="eventMeta">Avg: <strong>${escapeHtml(stats.avgStr)}</strong></span>
          <span class="eventMeta soft">Best: <strong>${escapeHtml(stats.bestStr)}</strong></span>
        </div>
      `;

      on(btn, "click", () => openEventModal(ev, ath));
      grid.appendChild(btn);
    });
  }

  function calcEventStats(entries) {
    const scores = entries.map((e) => +e.score).filter((n) => Number.isFinite(n));
    const last = scores.length ? scores[scores.length - 1] : null;
    const best = scores.length ? Math.max(...scores) : null;
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

    return {
      last,
      best,
      avg,
      lastStr: last == null ? "—" : fmtScore(last),
      bestStr: best == null ? "—" : fmtScore(best),
      avgStr: avg == null ? "—" : fmtScore(avg),
    };
  }

  function openEventModal(ev, ath) {
    state.currentEventKey = ev.key;

    setText(byId("eventTitle"), ev.name);
    const stats = calcEventStats(ev.entries);

    setText(byId("eventAvg"), stats.avgStr);
    setText(byId("eventLast"), stats.lastStr);
    setText(byId("eventBest"), stats.bestStr);

    // Meet list
    const list = byId("meetList");
    if (list) {
      const items = [...ev.entries].slice().reverse(); // newest first
      list.innerHTML = items
        .map((m) => {
          const date = m.date ? `<div class="meetDate">${escapeHtml(m.date)}</div>` : "";
          const loc = m.location ? `<div class="meetLoc">${escapeHtml(m.location)}</div>` : "";
          const notes = m.notes ? `<div class="meetNotes">${escapeHtml(m.notes)}</div>` : "";
          return `
            <div class="meetItem">
              <div class="meetTop">
                <div class="meetName">${escapeHtml(m.meet || "Meet")}</div>
                <div class="meetScore">${escapeHtml(fmtScore(+m.score))}</div>
              </div>
              <div class="meetSub">
                ${date}${loc}${notes}
              </div>
            </div>
          `;
        })
        .join("");
    }

    // Chart
    renderChart(ev, ath);

    openModal("eventModal");
  }

  function renderChart(ev) {
    const canvas = byId("eventScoreChart");
    if (!canvas) return;

    // Destroy existing chart
    if (state.chart) {
      try {
        state.chart.destroy();
      } catch {}
      state.chart = null;
    }

    const labels = ev.entries.map((e, i) => e.date || e.meet || `Meet ${i + 1}`);
    const data = ev.entries.map((e) => (Number.isFinite(+e.score) ? +e.score : null));

    const ctx = canvas.getContext("2d");
    if (!ctx || typeof Chart !== "function") return;

    state.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${ev.name} Score`,
            data,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: state.reducedMotion ? false : { duration: 700 },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
        scales: {
          x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true } },
          y: { beginAtZero: false, grid: { display: true } },
        },
      },
    });
  }

  // -----------------------------
  // Sponsors rail + modal
  // -----------------------------
  function normalizeSponsors(ath) {
    const raw = ath.sponsors || ath.supporters || [];
    return (raw || [])
      .map((s) => (typeof s === "string" ? { name: s } : s))
      .filter((s) => s && (s.name || s.logo));
  }

  function renderSponsors(ath) {
    const sponsors = normalizeSponsors(ath);

    // rail
    const strip = byId("sponsorStrip");
    if (strip) {
      strip.innerHTML = "";
      sponsors.slice(0, 10).forEach((s) => {
        const a = document.createElement("a");
        a.className = "sponsorLogo";
        a.href = s.url || "#";
        a.target = s.url ? "_blank" : "_self";
        a.rel = s.url ? "noopener" : "";

        // For clickability, ensure entire tile is clickable + has title
        a.title = s.name || "Sponsor";

        // prefer <img> for SEO/accessibility
        if (s.logo) {
          const img = document.createElement("img");
          img.src = s.logo;
          img.alt = s.name || "Sponsor logo";
          img.loading = "lazy";
          a.appendChild(img);
        } else {
          a.textContent = s.name || "Sponsor";
        }

        on(a, "click", () => {
          if (s.name) bumpSponsorClick(s.name);
          renderSponsorAnalyticsBanner();
        });

        strip.appendChild(a);
      });
    }

    // modal grid
    const grid = byId("sponsorGrid");
    if (grid) {
      grid.innerHTML = sponsors
        .map((s) => {
          const logo = s.logo
            ? `<img src="${escapeAttr(s.logo)}" alt="${escapeAttr(s.name || "Sponsor")}" loading="lazy" />`
            : `<div class="sponsorFallback">${escapeHtml(s.name || "Sponsor")}</div>`;
          const sub = s.blurb ? `<div class="sponsorBlurb">${escapeHtml(s.blurb)}</div>` : "";
          const href = s.url || "#";
          const target = s.url ? `target="_blank" rel="noopener"` : "";
          return `
            <a class="sponsorCard" href="${escapeAttr(href)}" ${target} data-sponsor="${escapeAttr(s.name || "")}">
              <div class="sponsorLogoBox">${logo}</div>
              <div class="sponsorName">${escapeHtml(s.name || "Sponsor")}</div>
              ${sub}
              <div class="sponsorCta">Visit sponsor <span aria-hidden="true">↗</span></div>
            </a>
          `;
        })
        .join("");

      // click tracking
      $$("[data-sponsor]", grid).forEach((a) => {
        on(a, "click", () => {
          const n = a.getAttribute("data-sponsor");
          if (n) bumpSponsorClick(n);
          renderSponsorAnalyticsBanner();
        });
      });
    }

    on(byId("btnOpenSponsors"), "click", () => {
      renderSponsorAnalyticsBanner();
      openModal("sponsorsModal");
    });

    // "Become sponsor" button
    on(byId("btnBecomeSponsor"), "click", () => {
      // if athlete.json has becomeSponsorUrl, open it; else open sponsors modal
      const url = ath.sponsorInfoUrl || ath.becomeSponsorUrl || "";
      if (url) window.open(url, "_blank", "noopener");
      else openModal("sponsorsModal");
    });
  }

  // -----------------------------
  // Supporters feed (optional)
  // -----------------------------
  function renderSupporters(ath) {
    const section = byId("supportersSection");
    const feed = byId("supportersFeed");
    if (!section || !feed) return;

    const supporters = ath.supporters || ath.recentSupporters || [];
    if (!Array.isArray(supporters) || !supporters.length) {
      section.style.display = "none";
      return;
    }

    section.style.display = "";
    feed.innerHTML = supporters
      .slice(0, 12)
      .map((s) => {
        const name = escapeHtml(s.name || s.firstName || "Supporter");
        const amount = s.amount != null ? `<span class="supAmt">${escapeHtml(fmtMoney(s.amount))}</span>` : "";
        const when = s.when || s.date || "";
        const time = when ? `<span class="supWhen">${escapeHtml(when)}</span>` : "";
        return `<div class="supporterChip">${name}${amount}${time}</div>`;
      })
      .join("");
  }

  // -----------------------------
  // About modal + Create own
  // -----------------------------
  function wireAbout(ath) {
    on(byId("btnOpenAbout"), "click", () => openModal("aboutModal"));
    on(byId("btnCreateOwn"), "click", () => {
      const url = ath.createOwnUrl || ath.productUrl || "";
      if (url) window.open(url, "_blank", "noopener");
      else toast("Add createOwnUrl in athlete.json");
    });
  }

  // -----------------------------
  // Background FX (minimal & safe)
  // -----------------------------
  function initFx() {
    // If you already have fancy FX elsewhere, this won’t interfere.
    // This is intentionally light and safe.

    // Float deco: sprinkle a few emojis
    const deco = byId("floatDeco");
    if (deco && !state.reducedMotion) {
      const symbols = ["✨", "💎", "🌸", "🎀", "⭐"];
      const count = 14;
      deco.innerHTML = "";
      for (let i = 0; i < count; i++) {
        const s = document.createElement("span");
        s.textContent = symbols[i % symbols.length];
        s.style.cssText =
          "position:absolute;opacity:.18;font-size:18px;left:" +
          Math.random() * 100 +
          "%;top:" +
          Math.random() * 100 +
          "%;transform:translate(-50%,-50%);filter:blur(.2px)";
        deco.appendChild(s);
      }
    }

    // Canvas particles: keep super minimal to avoid perf issues
    const canvas = byId("fx-canvas");
    if (!canvas || state.reducedMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(2, window.devicePixelRatio || 1);
    let w = 0, h = 0;

    const particles = Array.from({ length: 40 }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.0007,
      vy: (Math.random() - 0.5) * 0.0007,
      a: 0.10 + Math.random() * 0.12,
    }));

    function resize() {
      w = canvas.clientWidth || window.innerWidth;
      h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;

        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    }
    tick();

    // stop on reduced motion toggle (page reload not required)
    state._stopFx = () => cancelAnimationFrame(raf);
  }

  // -----------------------------
  // Data loading
  // -----------------------------
  async function loadAthlete() {
    // You can change the path if you use per-athlete pages
    const path = "data/athlete.json";
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
    return await res.json();
  }

  // -----------------------------
  // Wiring top-level controls
  // -----------------------------
  function wireGlobalButtons(ath) {
    // bio open is wired in renderBioModal
    // sponsors open in renderSponsors

    on(byId("btnReduceMotion"), "click", () => {
      toggleReducedMotion();
      toast(state.reducedMotion ? "Reduced motion: ON" : "Reduced motion: OFF");
    });

    // Optional: clicking footer title shares
    on(byId("footerTitle"), "click", () => nativeShare());

    // Optional: About + Create own
    wireAbout(ath);
  }

  // -----------------------------
  // Main init
  // -----------------------------
  domReady(async () => {
    try {
      loadReducedMotion();
      loadMilestones();
      wireModalClose();

      const ath = await loadAthlete();
      state.athlete = ath;

      applySeo(ath);

      renderHero(ath);
      renderBioModal(ath);
      renderCards(ath);
      renderEvents(ath);
      renderSponsors(ath);
      renderSupporters(ath);

      wireShareButtons();
      wireGlobalButtons(ath);

      initFx();
    } catch (err) {
      console.error(err);
      toast("Error loading athlete card. Check console.");
    }
  });

  // -----------------------------
  // Helpers
  // -----------------------------
  function slug(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function titleCase(s) {
    return String(s || "")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase() + w.slice(1))
      .join(" ");
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/`/g, "&#096;");
  }

  // very light sanitizer: allows basic tags only if you pass storyHtml
  function sanitizeSimple(html) {
    const allowed = new Set(["B", "STRONG", "I", "EM", "BR", "P", "UL", "OL", "LI", "A", "SPAN"]);
    const tmp = document.createElement("div");
    tmp.innerHTML = String(html || "");

    const walk = (node) => {
      [...node.children].forEach((child) => {
        if (!allowed.has(child.tagName)) {
          // unwrap
          child.replaceWith(...child.childNodes);
        } else {
          // clean attributes
          [...child.attributes].forEach((attr) => {
            const n = attr.name.toLowerCase();
            const v = attr.value || "";
            const keep =
              (child.tagName === "A" && (n === "href" || n === "target" || n === "rel")) ||
              (child.tagName !== "A" && n === "class");
            if (!keep) child.removeAttribute(attr.name);
            if (child.tagName === "A" && n === "href") {
              // block javascript: urls
              if (/^\s*javascript:/i.test(v)) child.setAttribute("href", "#");
              child.setAttribute("target", "_blank");
              child.setAttribute("rel", "noopener");
            }
          });
          walk(child);
        }
      });
    };
    walk(tmp);
    return tmp.innerHTML;
  }
})();
