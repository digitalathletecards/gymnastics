/* Digital Athlete Card — GH Pages safe (relative paths, strict IDs) */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const els = {
    fx: $("#fx"),
    athletePhoto: $("#athletePhoto"),
    athleteName: $("#athleteName"),
    athleteSub: $("#athleteSub"),
    tierBadge: $("#tierBadge"),
    clubBadge: $("#clubBadge"),
    sportBadge: $("#sportBadge"),
    fundTitle: $("#fundTitle"),
    fundNumbers: $("#fundNumbers"),
    fundNote: $("#fundNote"),
    meterBar: $("#meterBar"),
    galleryGrid: $("#galleryGrid"),
    gallerySub: $("#gallerySub"),
    shareChips: $("#shareChips"),

    showcaseStage: $("#showcaseStage"),

    copyLinkBtn: $("#copyLinkBtn"),
    shareBtn: $("#shareBtn"),
    openShareModalBtn: $("#openShareModalBtn"),
    bioBtn: $("#bioBtn"),
    bioBtnPhoto: $("#bioBtnPhoto"),
    supportBtn: $("#supportBtn"),
    donateBtn: $("#donateBtn"),
    builtBtn: $("#builtBtn"),

    modalHost: $("#modalHost"),
    modalBackdrop: $("#modalBackdrop"),
    modal: $("#modal"),
    modalTitle: $("#modalTitle"),
    modalBody: $("#modalBody"),
    modalClose: $("#modalClose"),
    modalMinimize: $("#modalMinimize"),
  };

  // Add sparkly border layer to all fxCards (purely decorative).
  $$(".fxCard").forEach(card => {
    const layer = document.createElement("div");
    layer.className = "sparkBorder";
    card.appendChild(layer);
  });

  // ---------- Modal ----------
  const modalState = {
    open: false,
    minimized: false,
    lastFocus: null,
  };

  function openModal({ title, theme = "pink", contentNode }) {
    modalState.lastFocus = document.activeElement;
    els.modal.dataset.theme = theme;
    els.modalTitle.textContent = title;

    els.modalBody.innerHTML = "";
    if (contentNode) els.modalBody.appendChild(contentNode);

    els.modal.classList.remove("isMin");
    modalState.minimized = false;
    els.modalMinimize.setAttribute("aria-expanded", "true");
    els.modalMinimize.textContent = "▾";

    els.modalHost.classList.add("isOpen");
    els.modalHost.setAttribute("aria-hidden", "false");
    modalState.open = true;

    // Basic focus
    requestAnimationFrame(() => els.modalClose.focus());
  }

  function closeModal() {
    els.modalHost.classList.remove("isOpen");
    els.modalHost.setAttribute("aria-hidden", "true");
    modalState.open = false;

    if (modalState.lastFocus && typeof modalState.lastFocus.focus === "function") {
      modalState.lastFocus.focus();
    }
  }

  function toggleMinimize() {
    modalState.minimized = !modalState.minimized;
    els.modal.classList.toggle("isMin", modalState.minimized);
    els.modalMinimize.setAttribute("aria-expanded", String(!modalState.minimized));
    els.modalMinimize.textContent = modalState.minimized ? "▸" : "▾";
  }

  els.modalBackdrop.addEventListener("click", closeModal);
  els.modalClose.addEventListener("click", closeModal);
  els.modalMinimize.addEventListener("click", toggleMinimize);

  window.addEventListener("keydown", (e) => {
    if (!modalState.open) return;
    if (e.key === "Escape") closeModal();
  });

  // ---------- Clipboard / Share ----------
  async function copyLink() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied ✨");
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); toast("Link copied ✨"); }
      catch { toast("Copy failed — select & copy from address bar"); }
      finally { ta.remove(); }
    }
  }

  function openShareModal() {
    const node = document.createElement("div");

    node.appendChild(section(
      "Share this card",
      "Send the link to family + potential sponsors. A quick share often turns into real support.",
      {
        grid: [
          chipAction("💬 Text", () => shareVia("sms")),
          chipAction("💚 WhatsApp", () => shareVia("whatsapp")),
          chipAction("📘 Facebook", () => shareVia("facebook")),
          chipAction("✉️ Email", () => shareVia("email")),
          chipAction("📸 Instagram", () => shareVia("instagram")),
          chipAction("𝕏 X", () => shareVia("x")),
        ]
      }
    ));

    node.appendChild(section(
      "Pro tip",
      "Share with 3 sponsors today. Include one sentence about what the funds cover (travel, coaching, meet fees).",
      { list: [
        "Keep it short and upbeat.",
        "Add one highlight (recent meet, new skill, personal best).",
        "Ask for a small monthly amount or a one-time gift."
      ]}
    ));

    node.appendChild(ctaRow([
      { label: "↗ Copy Link", kind: "primary", onClick: copyLink },
      { label: "Close", kind: "ghost", onClick: closeModal },
    ]));

    openModal({ title: "📤 Share Options", theme: "cyan", contentNode: node });
  }

  function shareVia(kind) {
    const url = window.location.href;
    const text = `Check out this Digital Athlete Card ✨\n${url}`;
    const enc = encodeURIComponent;

    // Note: Instagram doesn't have a universal web share URL; we provide a helpful fallback.
    let target = url;
    if (kind === "sms") target = `sms:?&body=${enc(text)}`;
    if (kind === "whatsapp") target = `https://wa.me/?text=${enc(text)}`;
    if (kind === "facebook") target = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
    if (kind === "email") target = `mailto:?subject=${enc("Digital Athlete Card")}&body=${enc(text)}`;
    if (kind === "x") target = `https://twitter.com/intent/tweet?text=${enc(text)}`;

    if (kind === "instagram") {
      toast("Instagram: copy the link, then paste into IG bio/story link sticker.");
      copyLink();
      return;
    }
    window.open(target, "_blank", "noopener,noreferrer");
  }

  els.copyLinkBtn.addEventListener("click", copyLink);
  els.shareBtn.addEventListener("click", openShareModal);
  els.openShareModalBtn.addEventListener("click", openShareModal);

  // ---------- Toast ----------
  let toastTimer = null;
  function toast(msg) {
    let el = $("#toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.style.position = "fixed";
      el.style.left = "50%";
      el.style.bottom = "18px";
      el.style.transform = "translateX(-50%)";
      el.style.padding = "10px 12px";
      el.style.borderRadius = "14px";
      el.style.border = "1px solid rgba(255,255,255,.16)";
      el.style.background = "rgba(10,14,30,.72)";
      el.style.backdropFilter = "blur(14px)";
      el.style.color = "rgba(255,255,255,.92)";
      el.style.fontWeight = "850";
      el.style.letterSpacing = ".12px";
      el.style.boxShadow = "0 18px 70px rgba(0,0,0,.45)";
      el.style.zIndex = "80";
      el.style.opacity = "0";
      el.style.transition = "opacity .18s ease";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.style.opacity = "0"), 1800);
  }

  // ---------- Data ----------
  async function loadAthlete() {
    // Cache-bust helps GH Pages when it keeps older JSON around.
    const url = `data/athlete.json?cb=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load athlete.json (${res.status})`);
    return res.json();
  }

  function pct(a, b) {
    if (!b || b <= 0) return 0;
    return Math.max(0, Math.min(100, (a / b) * 100));
  }

  // ---------- Gallery ----------
  function isVideoPath(path) {
    return /\.(mp4|webm|ogg|mov)$/i.test(path);
  }

  function buildGallery(items) {
    els.galleryGrid.innerHTML = "";

    items.forEach((it) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "mediaCard";
      card.title = "Tap to expand";
      card.setAttribute("aria-label", "Open media");

      const src = it.src;

      if (it.type === "video" || isVideoPath(src)) {
        const v = document.createElement("video");
        v.src = src;
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.autoplay = true;
        v.preload = "metadata";
        v.setAttribute("playsinline", "");
        v.setAttribute("muted", "");
        v.setAttribute("loop", "");
        v.setAttribute("autoplay", "");
        v.controls = false;

        // Try to start playback (some browsers require user gesture; muted usually works).
        v.addEventListener("canplay", () => { try { v.play(); } catch {} }, { once: true });

        card.appendChild(v);

        const badge = document.createElement("div");
        badge.className = "playBadge";
        badge.textContent = "▶ Video";
        card.appendChild(badge);

        card.addEventListener("click", () => openVideoModal(it));
      } else {
        const img = document.createElement("img");
        img.src = src;
        img.alt = it.alt || "Photo";
        img.loading = "lazy";
        img.decoding = "async";
        card.appendChild(img);
        card.addEventListener("click", () => openImageModal(it));
      }

      els.galleryGrid.appendChild(card);
    });
  }

  function openImageModal(it) {
    const wrap = document.createElement("div");
    const img = document.createElement("img");
    img.src = it.src;
    img.alt = it.alt || "Photo";
    img.style.width = "100%";
    img.style.borderRadius = "18px";
    img.style.border = "1px solid rgba(255,255,255,.12)";
    img.style.background = "rgba(255,255,255,.03)";
    wrap.appendChild(img);

    if (it.caption) {
      wrap.appendChild(section("Caption", it.caption));
    }

    openModal({ title: "🖼️ Photo", theme: "violet", contentNode: wrap });
  }

  function openVideoModal(it) {
    const wrap = document.createElement("div");

    const v = document.createElement("video");
    v.src = it.src;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.autoplay = true;
    v.controls = true;
    v.preload = "metadata";
    v.style.width = "100%";
    v.style.borderRadius = "18px";
    v.style.border = "1px solid rgba(255,255,255,.12)";
    v.style.background = "rgba(255,255,255,.03)";
    v.setAttribute("playsinline", "");
    v.setAttribute("muted", "");
    v.setAttribute("loop", "");
    v.setAttribute("autoplay", "");

    wrap.appendChild(v);

    if (it.caption) wrap.appendChild(section("Clip", it.caption));
    wrap.appendChild(ctaRow([
      { label: "Close", kind: "ghost", onClick: closeModal }
    ]));

    openModal({ title: "▶ Video", theme: "cyan", contentNode: wrap });

    // Attempt play in modal
    setTimeout(() => { try { v.play(); } catch {} }, 50);
  }

  // ---------- Candy Showcase ----------
  const candyDefs = [
    { key: "sponsors", label: "Sponsors", theme: "pink", color: "#ff4fd8" },
    { key: "snapshot", label: "Season Snapshot", theme: "gold", color: "#ffd86b" },
    { key: "journey", label: "Journey", theme: "violet", color: "#a27cff" },
    { key: "upcoming", label: "Upcoming", theme: "cyan", color: "#3ce7ff" },
    { key: "achievements", label: "Achievements", theme: "mint", color: "#4cffc9" },
  ];

  function candySVG(hex) {
    // Candy Crush–style glossy candy with highlight + inner shading
    // (SVG uses radial gradients so it looks “real” vs a flat blob)
    const id = Math.random().toString(16).slice(2);
    return `
      <svg class="candy__svg" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <radialGradient id="g0_${id}" cx="30%" cy="25%" r="70%">
            <stop offset="0%" stop-color="white" stop-opacity=".75"/>
            <stop offset="22%" stop-color="white" stop-opacity=".18"/>
            <stop offset="60%" stop-color="white" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="g1_${id}" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stop-color="${hex}" stop-opacity="1"/>
            <stop offset="55%" stop-color="${hex}" stop-opacity="1"/>
            <stop offset="100%" stop-color="#000000" stop-opacity=".22"/>
          </radialGradient>
          <radialGradient id="g2_${id}" cx="50%" cy="60%" r="60%">
            <stop offset="0%" stop-color="white" stop-opacity=".22"/>
            <stop offset="65%" stop-color="white" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="rim_${id}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="white" stop-opacity=".30"/>
            <stop offset="50%" stop-color="white" stop-opacity=".08"/>
            <stop offset="100%" stop-color="#000" stop-opacity=".10"/>
          </linearGradient>
          <filter id="soft_${id}" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
        </defs>

        <!-- Outer candy body (rounded square-ish) -->
        <path d="M28 14
                 C18 16 13 22 12 31
                 L10 52
                 C9 62 13 70 22 76
                 L36 86
                 C44 92 56 92 64 86
                 L78 76
                 C87 70 91 62 90 52
                 L88 31
                 C87 22 82 16 72 14
                 L55 10
                 C52 9 48 9 45 10
                 Z"
              fill="url(#g1_${id})"/>

        <!-- Subtle rim -->
        <path d="M28 14
                 C18 16 13 22 12 31
                 L10 52
                 C9 62 13 70 22 76
                 L36 86
                 C44 92 56 92 64 86
                 L78 76
                 C87 70 91 62 90 52
                 L88 31
                 C87 22 82 16 72 14
                 L55 10
                 C52 9 48 9 45 10
                 Z"
              fill="none" stroke="url(#rim_${id})" stroke-width="2" opacity=".9"/>

        <!-- Inner “gel” highlight -->
        <path d="M34 22
                 C26 24 22 29 21 37
                 L20 52
                 C19 60 22 66 29 70
                 L40 77
                 C46 81 54 81 60 77
                 L71 70
                 C78 66 81 60 80 52
                 L79 37
                 C78 29 74 24 66 22
                 L53 19
                 C51 18.6 49 18.6 47 19
                 Z"
              fill="rgba(255,255,255,.08)" opacity=".55"/>

        <!-- Top glossy bloom -->
        <ellipse cx="40" cy="30" rx="28" ry="22" fill="url(#g0_${id})"/>

        <!-- Small sparkle streak -->
        <path d="M62 26 C70 30 72 38 68 44"
              stroke="white" stroke-opacity=".32" stroke-width="4"
              stroke-linecap="round" filter="url(#soft_${id})"/>

        <!-- Bottom depth glow -->
        <ellipse cx="55" cy="68" rx="28" ry="18" fill="url(#g2_${id})" opacity=".45"/>
      </svg>
    `.trim();
  }

  function makeCandy(def, i, bounds) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "candy";
    btn.dataset.key = def.key;
    btn.dataset.theme = def.theme;

    // Random scale for organic feel
    const scale = 0.88 + Math.random() * 0.26;
    btn.style.width = `${74 * scale}px`;
    btn.style.height = `${74 * scale}px`;

    btn.innerHTML = `
      ${candySVG(def.color)}
      <div class="candy__ring"></div>
      <div class="candy__label">${def.label}</div>
    `;

    // initial position
    const pad = 14;
    const x = pad + Math.random() * (bounds.w - pad * 2 - 80);
    const y = pad + Math.random() * (bounds.h - pad * 2 - 110);

    const candy = {
      el: btn,
      x, y,
      vx: (Math.random() * 0.35 + 0.12) * (Math.random() < 0.5 ? -1 : 1),
      vy: (Math.random() * 0.35 + 0.12) * (Math.random() < 0.5 ? -1 : 1),
      wob: Math.random() * Math.PI * 2,
      rot: (Math.random() * 12 - 6),
      scale
    };

    btn.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${candy.rot}deg)`;

    btn.addEventListener("click", () => openCandyModal(def));
    btn.addEventListener("mouseenter", () => bumpCandy(candy, bounds));
    btn.addEventListener("touchstart", () => bumpCandy(candy, bounds), { passive: true });

    return candy;
  }

  function bumpCandy(c, bounds) {
    // gentle push away from edges so it feels alive
    const centerX = c.x + 34;
    const centerY = c.y + 34;
    const dx = centerX - bounds.w / 2;
    const dy = centerY - bounds.h / 2;
    const len = Math.max(1, Math.hypot(dx, dy));
    c.vx += (dx / len) * 0.08;
    c.vy += (dy / len) * 0.08;
  }

  function openCandyModal(def) {
    const theme = def.theme;
    const title = `🍬 ${def.label}`;

    const node = document.createElement("div");

    if (def.key === "sponsors") {
      node.appendChild(section("Sponsor Spotlight",
        "Sponsors help cover travel, coaching, meet fees, and make it possible to compete with confidence.",
        { list: [
          "Logo placement on this card",
          "Shout-outs on share links",
          "Quarterly sponsor update message"
        ]}
      ));
      node.appendChild(section("Become a sponsor",
        "Pick a tier that feels right—every amount helps and means the world to this athlete.",
        { grid: [
          infoTile("🥉 Bronze", "Great for local businesses. Small monthly or one-time gift."),
          infoTile("🥈 Silver", "Bigger visibility + sponsor feature in updates."),
          infoTile("🥇 Gold", "Top placement + featured sponsor story."),
          infoTile("💎 Diamond", "Premium placement + custom sponsor highlight.")
        ]}
      ));
      node.appendChild(ctaRow([
        { label: "Support / Donate", kind: "primary", onClick: () => toast("Tip: connect Donate button to your payment link.") },
        { label: "Share to Sponsors", kind: "ghost", onClick: openShareModal }
      ]));
    }

    if (def.key === "snapshot") {
      node.appendChild(section("Season Snapshot",
        "A quick look at goals, progress, and what support helps fund this season.",
        { grid: [
          infoTile("🎀 Goal", $("#fundNumbers")?.textContent || "$0 / $0"),
          infoTile("📍 Focus", $("#fundTitle")?.textContent || "Training + meets"),
          infoTile("🗓️ Rhythm", "Practice · Meets · Recovery"),
          infoTile("💫 Why it matters", "Confidence, discipline, and big dreams.")
        ]}
      ));
      node.appendChild(section("What your support covers",
        "Travel, meet fees, coaching, and safe equipment—so the athlete can focus on performing their best.",
        { list: ["Meet entry fees", "Coaching time", "Travel + lodging", "Uniforms + gear"] }
      ));
      node.appendChild(ctaRow([
        { label: "Support / Donate", kind: "primary", onClick: () => $("#donateBtn")?.click() },
        { label: "Close", kind: "ghost", onClick: closeModal }
      ]));
    }

    if (def.key === "journey") {
      node.appendChild(section("Journey",
        "This is the story sponsors love: effort, growth, and proud moments.",
        { list: [
          "Training highlights & new skills",
          "Meet moments and personal bests",
          "Photos + video progress updates"
        ]}
      ));
      node.appendChild(section("Add a new highlight",
        "Keep the card fresh with one new photo/video each week. It’s the easiest way to keep sponsors engaged.",
        { grid: [
          infoTile("📸 Weekly", "New training clip"),
          infoTile("🏅 Monthly", "Meet recap"),
          infoTile("✨ Milestones", "New skill unlocked"),
          infoTile("💌 Thank-you", "Sponsor shout-out")
        ]}
      ));
      node.appendChild(ctaRow([
        { label: "Open Share Options", kind: "primary", onClick: openShareModal },
        { label: "Close", kind: "ghost", onClick: closeModal }
      ]));
    }

    if (def.key === "upcoming") {
      node.appendChild(section("Upcoming",
        "A simple schedule block makes sponsors feel involved and keeps family excited.",
        { list: [
          "Next meet: add date + location",
          "Training focus this week",
          "Goal skill to master"
        ]}
      ));
      node.appendChild(section("Sponsor-friendly update",
        "Send a short message after each meet: one photo + one sentence about growth.",
        { list: ["What went well", "What we’re working on", "What’s next"] }
      ));
      node.appendChild(ctaRow([
        { label: "Share Update", kind: "primary", onClick: openShareModal },
        { label: "Close", kind: "ghost", onClick: closeModal }
      ]));
    }

    if (def.key === "achievements") {
      node.appendChild(section("Achievements",
        "Celebrate milestones — they’re perfect moments to share with sponsors and family.",
        { grid: [
          infoTile("🏅 Medal moments", "Add recent placements"),
          infoTile("📈 Personal best", "New score PR"),
          infoTile("✨ New skill", "Unlocked this season"),
          infoTile("💪 Character", "Consistency + courage")
        ]}
      ));
      node.appendChild(section("Thank-you message",
        "A quick thank-you note goes a long way. Sponsors remember how you made them feel.",
        { list: ["Be specific", "Share impact", "Invite them to follow along"] }
      ));
      node.appendChild(ctaRow([
        { label: "Copy Link to Share", kind: "primary", onClick: copyLink },
        { label: "Close", kind: "ghost", onClick: closeModal }
      ]));
    }

    openModal({ title, theme, contentNode: node });
  }

  // Drift simulation inside the stage
  let candies = [];
  let driftRAF = 0;

  function startCandyDrift() {
    const stage = els.showcaseStage;
    if (!stage) return;

    // Ensure stage has measurable bounds before placing candies
    const rect = stage.getBoundingClientRect();
    const bounds = { w: rect.width, h: rect.height };

    stage.innerHTML = "";
    candies = [];

    // Create candies
    candyDefs.forEach((def, i) => {
      const c = makeCandy(def, i, bounds);
      candies.push(c);
      stage.appendChild(c.el);
    });

    // Animate
    const pad = 10;
    const tick = (t) => {
      // recompute bounds in case of resize (lightweight)
      const r = stage.getBoundingClientRect();
      const w = r.width, h = r.height;

      candies.forEach((c) => {
        c.wob += 0.02;
        const wobX = Math.cos(c.wob) * 0.22;
        const wobY = Math.sin(c.wob) * 0.22;

        c.x += (c.vx + wobX);
        c.y += (c.vy + wobY);

        // Soft edge bounce
        const elW = c.el.offsetWidth || 74;
        const elH = c.el.offsetHeight || 74;

        if (c.x < pad) { c.x = pad; c.vx *= -1; }
        if (c.y < pad) { c.y = pad; c.vy *= -1; }
        if (c.x > w - elW - pad) { c.x = w - elW - pad; c.vx *= -1; }
        if (c.y > h - elH - pad) { c.y = h - elH - pad; c.vy *= -1; }

        // Gentle speed clamp
        const sp = Math.hypot(c.vx, c.vy);
        if (sp > 0.75) { c.vx *= 0.92; c.vy *= 0.92; }

        // Subtle rotate based on velocity
        const rot = (c.vx * 10) + (Math.sin(c.wob) * 2);
        c.el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) rotate(${rot}deg)`;
      });

      driftRAF = requestAnimationFrame(tick);
    };

    cancelAnimationFrame(driftRAF);
    driftRAF = requestAnimationFrame(tick);
  }

  // Resize handling
  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => startCandyDrift(), 120);
  });

  // ---------- UI sections builders ----------
  function section(title, text, opts = {}) {
    const box = document.createElement("div");
    box.className = "modalSection";

    const h = document.createElement("h3");
    h.className = "modalH";
    h.textContent = title;
    box.appendChild(h);

    if (text) {
      const p = document.createElement("p");
      p.className = "modalP";
      p.textContent = text;
      box.appendChild(p);
    }

    if (opts.list && Array.isArray(opts.list)) {
      const ul = document.createElement("ul");
      ul.className = "modalList";
      opts.list.forEach(li => {
        const item = document.createElement("li");
        item.textContent = li;
        ul.appendChild(item);
      });
      box.appendChild(ul);
    }

    if (opts.grid && Array.isArray(opts.grid)) {
      const grid = document.createElement("div");
      grid.className = "modalGrid";
      opts.grid.forEach(node => grid.appendChild(node));
      box.appendChild(grid);
    }

    return box;
  }

  function infoTile(title, desc) {
    const t = document.createElement("div");
    t.className = "modalSection";
    t.style.margin = "0";
    t.style.padding = "12px";
    const h = document.createElement("div");
    h.className = "modalH";
    h.style.fontSize = "13px";
    h.style.marginBottom = "4px";
    h.textContent = title;
    const p = document.createElement("div");
    p.className = "modalP";
    p.style.fontSize = "13px";
    p.textContent = desc;
    t.appendChild(h);
    t.appendChild(p);
    return t;
  }

  function ctaRow(actions) {
    const row = document.createElement("div");
    row.className = "modalCTA";
    actions.forEach(a => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `btn ${a.kind === "primary" ? "btn--primary" : (a.kind === "ghost" ? "btn--ghost" : "")}`.trim();
      b.textContent = a.label;
      b.addEventListener("click", a.onClick);
      row.appendChild(b);
    });
    return row;
  }

  function chipAction(label, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }

  // ---------- Bio & Built-to-be-shared ----------
  function openBioModal(data) {
    const node = document.createElement("div");

    node.appendChild(section("About", data.bio?.about || "Add a short athlete bio in data/athlete.json."));
    node.appendChild(section("Why this matters",
      "This card helps family stay updated and makes it easy for sponsors to support the season in a feel-good way.",
      { list: ["Parents share once, updates stay live", "Sponsors see progress over time", "Simple link = simple support"] }
    ));

    openModal({ title: `🏅 ${data.athlete?.name || "Athlete"} — Bio`, theme: "violet", contentNode: node });
  }

  function openBuiltModal() {
    const node = document.createElement("div");
    node.appendChild(section(
      "Showcase the Journey",
      "A digital athlete card sponsors actually want to open — with highlights, progress, and one-tap sharing.",
      { list: [
        "Feels premium and modern",
        "Built for quick sponsor sharing",
        "Photos + video + updates in one link"
      ]}
    ));
    node.appendChild(ctaRow([
      { label: "Showcase the Journey — cards start at $199.99", kind: "primary", onClick: () => toast("Hook this button to your sales page link.") },
      { label: "Close", kind: "ghost", onClick: closeModal }
    ]));
    openModal({ title: "✨ Built to be shared", theme: "pink", contentNode: node });
  }

  // ---------- FX Canvas (lightweight) ----------
  function startCanvasFX() {
    const c = els.fx;
    if (!c) return;
    const ctx = c.getContext("2d", { alpha: true });

    let w = 0, h = 0;
    const dots = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() * 0.06 + 0.02) * (Math.random() < 0.5 ? -1 : 1),
      vy: (Math.random() * 0.06 + 0.02) * (Math.random() < 0.5 ? -1 : 1),
      r: Math.random() * 1.4 + 0.6,
      a: Math.random() * 0.45 + 0.10
    }));

    function resize() {
      w = c.width = Math.floor(window.innerWidth * devicePixelRatio);
      h = c.height = Math.floor(window.innerHeight * devicePixelRatio);
      c.style.width = "100%";
      c.style.height = "100%";
      ctx.setTransform(1,0,0,1,0,0);
    }
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      dots.forEach(d => {
        d.x += d.vx / 100;
        d.y += d.vy / 100;
        if (d.x < -0.05) d.x = 1.05;
        if (d.x > 1.05) d.x = -0.05;
        if (d.y < -0.05) d.y = 1.05;
        if (d.y > 1.05) d.y = -0.05;

        const px = d.x * w;
        const py = d.y * h;

        ctx.beginPath();
        ctx.arc(px, py, d.r * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${d.a})`;
        ctx.fill();
      });

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ---------- Init ----------
  async function init() {
    startCanvasFX();

    // Share chips row (always visible)
    const chipDefs = [
      { label: "💬 Text", fn: () => shareVia("sms") },
      { label: "💚 WhatsApp", fn: () => shareVia("whatsapp") },
      { label: "📘 Facebook", fn: () => shareVia("facebook") },
      { label: "✉️ Email", fn: () => shareVia("email") },
      { label: "📸 Instagram", fn: () => shareVia("instagram") },
      { label: "𝕏 X", fn: () => shareVia("x") },
    ];
    els.shareChips.innerHTML = "";
    chipDefs.forEach(c => els.shareChips.appendChild(chipAction(c.label, c.fn)));

    // Load JSON + bind
    let data;
    try {
      data = await loadAthlete();
    } catch (err) {
      console.error(err);
      toast("Could not load data/athlete.json");
      return;
    }

    const athlete = data.athlete || {};
    els.athleteName.textContent = athlete.name || "Athlete Name";
    els.athleteSub.textContent = athlete.sub || "Tap to view bio";
    els.tierBadge.textContent = athlete.tier || "🏅 Bronze";
    els.clubBadge.textContent = athlete.club || "Club";
    els.sportBadge.textContent = athlete.sport || "Sport";

    if (athlete.photo) {
      els.athletePhoto.src = athlete.photo;
    } else {
      // harmless placeholder (transparent) if missing
      els.athletePhoto.src =
        "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="rgba(255,255,255,.06)"/><text x="50%" y="52%" text-anchor="middle" fill="rgba(255,255,255,.55)" font-size="16" font-family="Arial">Photo</text></svg>`);
    }

    // Fundraising
    const fundraising = data.fundraising || { raised: 0, goal: 0, title: "" };
    const raised = Number(fundraising.raised || 0);
    const goal = Number(fundraising.goal || 0);
    els.fundTitle.textContent = fundraising.title || "Help cover travel, coaching, meet fees.";
    els.fundNumbers.textContent = `$${raised.toLocaleString()} / $${goal.toLocaleString()}`;
    const p = pct(raised, goal);
    els.meterBar.style.width = `${p}%`;
    $(".meter")?.setAttribute("aria-valuenow", String(Math.round(p)));
    els.fundNote.textContent = goal > 0 ? `${Math.round(p)}% of season goal reached` : "Set a goal in athlete.json";

    // Gallery
    const gallery = Array.isArray(data.gallery) ? data.gallery : [];
    els.gallerySub.textContent = data.gallerySub || "Highlights from training + meets.";
    buildGallery(gallery);

    // Candy drift
    startCandyDrift();

    // Bio
    els.bioBtn.addEventListener("click", () => openBioModal(data));
    els.bioBtnPhoto.addEventListener("click", () => openBioModal(data));

    // Donate (placeholder behavior)
    els.donateBtn.addEventListener("click", () => {
      if (data.links?.donate) {
        window.open(data.links.donate, "_blank", "noopener,noreferrer");
      } else {
        toast("Add a donate link in data/athlete.json → links.donate");
        openCandyModal(candyDefs[1]); // Snapshot
      }
    });

    // Support button = donate for now
    els.supportBtn.addEventListener("click", () => els.donateBtn.click());

    // Built to be shared
    els.builtBtn.addEventListener("click", openBuiltModal);
  }

  init();
})();
