/* scripts/app.js — ultra-premium 3D gumballs, GH Pages safe */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from((r || document).querySelectorAll(s));

  const els = {
    showcaseStage: $("#showcaseStage"),
    galleryGrid: $("#galleryGrid"),
    gallerySub: $("#gallerySub"),
    meterBar: $("#meterBar"),
    fundNumbers: $("#fundNumbers"),
    fundTitle: $("#fundTitle"),
    donateBtn: $("#donateBtn"),
    bioBtn: $("#bioBtn"),
    bioBtnPhoto: $("#bioBtnPhoto"),
    shareChips: $("#shareChips"),

    modalHost: $("#modalHost"),
    modalBackdrop: $("#modalBackdrop"),
    modal: $("#modal"),
    modalTitle: $("#modalTitle"),
    modalBody: $("#modalBody"),
    modalClose: $("#modalClose"),
    modalMinimize: $("#modalMinimize"),
    copyLinkBtn: $("#copyLinkBtn"),
    shareBtn: $("#shareBtn"),
    openShareModalBtn: $("#openShareModalBtn"),
    builtBtn: $("#builtBtn"),
    supportBtn: $("#supportBtn"),
  };

  // add spark border to cards (if present)
  $$(".fxCard").forEach(card => {
    if (!card.querySelector(".sparkBorder")) {
      const d = document.createElement("div");
      d.className = "sparkBorder";
      card.appendChild(d);
    }
  });

  // ---------- Modal functions ----------
  const modalState = { open: false, minimized: false, lastFocus: null };

  function openModal({ title = "", theme = "pink", contentNode = null }) {
    modalState.lastFocus = document.activeElement;
    if (els.modal) els.modal.dataset.theme = theme;
    if (els.modalTitle) els.modalTitle.textContent = title;
    if (els.modalBody) {
      els.modalBody.innerHTML = "";
      if (contentNode) els.modalBody.appendChild(contentNode);
    }
    if (els.modal) els.modal.classList.remove("isMin");
    if (els.modalMinimize) { els.modalMinimize.setAttribute("aria-expanded", "true"); els.modalMinimize.textContent = "▾"; }
    if (els.modalHost) { els.modalHost.classList.add("isOpen"); els.modalHost.setAttribute("aria-hidden","false"); }
    modalState.open = true;
    requestAnimationFrame(() => { try { els.modalClose && els.modalClose.focus(); } catch {} });
  }
  function closeModal() {
    if (els.modalHost) { els.modalHost.classList.remove("isOpen"); els.modalHost.setAttribute("aria-hidden","true"); }
    modalState.open = false;
    try { modalState.lastFocus && modalState.lastFocus.focus(); } catch {}
  }
  function toggleMinimize() {
    modalState.minimized = !modalState.minimized;
    els.modal && els.modal.classList.toggle("isMin", modalState.minimized);
    els.modalMinimize && els.modalMinimize.setAttribute("aria-expanded", String(!modalState.minimized));
    els.modalMinimize && (els.modalMinimize.textContent = modalState.minimized ? "▸" : "▾");
  }
  els.modalBackdrop && els.modalBackdrop.addEventListener("click", closeModal);
  els.modalClose && els.modalClose.addEventListener("click", closeModal);
  els.modalMinimize && els.modalMinimize.addEventListener("click", toggleMinimize);
  window.addEventListener("keydown", (e) => { if (!modalState.open) return; if (e.key === "Escape") closeModal(); });

  // ---------- tiny utilities ----------
  function toast(msg) {
    let el = $("#toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      Object.assign(el.style,{
        position:"fixed", left:"50%", bottom:"18px", transform:"translateX(-50%)",
        padding:"10px 14px", borderRadius:"12px", background:"rgba(10,14,30,.78)",
        color:"white", zIndex:120, boxShadow:"0 18px 60px rgba(0,0,0,.5)", fontWeight:800
      });
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(el._t);
    el._t = setTimeout(()=> el.style.opacity = "0", 1600);
  }

  async function loadJSON(path) {
    const r = await fetch(`${path}?cb=${Date.now()}`, { cache: "no-store" });
    if (!r.ok) throw new Error(`Failed to load ${path} (${r.status})`);
    return r.json();
  }

  function pct(a,b){ if(!b||b<=0) return 0; return Math.max(0, Math.min(100, (a/b)*100)); }

  // ---------- Gallery (video autoplay inline) ----------
  function isVideo(p){ return /\.(mp4|webm|ogg|mov)$/i.test(p); }

  function buildGallery(items){
    if (!els.galleryGrid) return;
    els.galleryGrid.innerHTML = "";
    items.forEach(it => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mediaCard";
      btn.title = "Tap to expand";
      if (it.type === "video" || isVideo(it.src)) {
        const v = document.createElement("video");
        v.src = it.src; v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.preload = "metadata";
        v.setAttribute("playsinline",""); v.setAttribute("muted",""); v.setAttribute("loop",""); v.setAttribute("autoplay","");
        v.controls = false;
        v.addEventListener("canplay", ()=>{ try{ v.play(); }catch{} }, { once:true });
        btn.appendChild(v);
        const badge = document.createElement("div"); badge.className="playBadge"; badge.textContent="▶ Video"; btn.appendChild(badge);
        btn.addEventListener("click", ()=> openVideoModal(it));
      } else {
        const img = document.createElement("img"); img.src = it.src; img.alt = it.alt||"Photo"; img.loading="lazy"; img.decoding="async";
        btn.appendChild(img);
        btn.addEventListener("click", ()=> openImageModal(it));
      }
      els.galleryGrid.appendChild(btn);
    });
  }

  function openImageModal(it){
    const wrap = document.createElement("div");
    const img = document.createElement("img"); img.src = it.src; img.style.width="100%"; img.style.borderRadius="12px"; img.alt = it.alt || "Photo";
    wrap.appendChild(img);
    if (it.caption) wrap.appendChild(simpleSection("Caption", it.caption));
    openModal({ title: "🖼️ Photo", theme: "violet", contentNode: wrap });
  }
  function openVideoModal(it){
    const wrap = document.createElement("div");
    const v = document.createElement("video");
    v.src = it.src; v.controls = true; v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.preload = "metadata";
    v.style.width = "100%"; v.setAttribute("playsinline",""); v.setAttribute("muted",""); v.setAttribute("loop",""); v.setAttribute("autoplay","");
    wrap.appendChild(v);
    if (it.caption) wrap.appendChild(simpleSection("Clip", it.caption));
    wrap.appendChild(ctaRow([{ label:"Close", kind:"ghost", onClick: closeModal }]));
    openModal({ title: "▶ Video", theme: "cyan", contentNode: wrap });
    setTimeout(()=>{ try { v.play(); } catch {} }, 60);
  }

  function simpleSection(h, p){
    const box = document.createElement("div");
    box.className = "modalSection";
    const hh = document.createElement("h3"); hh.className="modalH"; hh.textContent = h; box.appendChild(hh);
    const pp = document.createElement("p"); pp.className="modalP"; pp.textContent = p; box.appendChild(pp);
    return box;
  }
  function ctaRow(actions){
    const row = document.createElement("div"); row.className = "modalCTA";
    actions.forEach(a=>{
      const b = document.createElement("button"); b.type="button";
      b.className = `btn ${a.kind === "primary" ? "btn--primary" : (a.kind === "ghost" ? "btn--ghost" : "")}`.trim();
      b.textContent = a.label;
      b.addEventListener("click", a.onClick);
      row.appendChild(b);
    });
    return row;
  }

  // ---------- Gumball generator (SVG metallic, pink shades) ----------
  const gumballDefs = [
    { key: "sponsors", label: "Sponsors", theme: "pink", colors: ["#ffd3f8","#ff86ea","#ff4fd8"] },
    { key: "snapshot", label: "Season Snapshot", theme: "pink", colors: ["#ffe9f4","#ffcce9","#ff7adf"] },
    { key: "journey", label: "Journey", theme: "pink", colors: ["#fff0f8","#ffd0ec","#ff8be0"] },
    { key: "upcoming", label: "Upcoming", theme: "pink", colors: ["#fff6fb","#ffdff6","#ff9be8"] },
    { key: "achievements", label: "Achievements", theme: "pink", colors: ["#fff9fc","#ffeefe","#ffb6e8"] },
  ];

  function gumballSVG(colors) {
    // colors: [light, mid, deep]
    const id = Math.random().toString(16).slice(2);
    const light = colors[0], mid = colors[1], deep = colors[2];

    // SVG: layered metallic gradients, chrome rim, specular streak, inner gloss, micro-sparkles
    return `
      <svg class="gumball__svg" viewBox="0 0 100 100" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="g_light_${id}" cx="30%" cy="28%" r="70%">
            <stop offset="0%" stop-color="${light}" stop-opacity="1"/>
            <stop offset="32%" stop-color="${mid}" stop-opacity="1"/>
            <stop offset="85%" stop-color="${deep}" stop-opacity="1"/>
            <stop offset="100%" stop-color="#000000" stop-opacity=".18"/>
          </radialGradient>

          <linearGradient id="g_rim_${id}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="rgba(255,255,255,.95)" stop-opacity=".96"/>
            <stop offset="40%" stop-color="rgba(255,255,255,.12)" stop-opacity=".12"/>
            <stop offset="100%" stop-color="rgba(0,0,0,.22)" stop-opacity=".18"/>
          </linearGradient>

          <radialGradient id="g_high_${id}" cx="38%" cy="24%" r="40%">
            <stop offset="0%" stop-color="white" stop-opacity=".86"/>
            <stop offset="18%" stop-color="white" stop-opacity=".36"/>
            <stop offset="60%" stop-color="white" stop-opacity=".06"/>
            <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
          </radialGradient>

          <filter id="f_blur_${id}" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.6"/>
          </filter>

          <filter id="f_glow_${id}" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          <mask id="mask_${id}">
            <rect width="100%" height="100%" fill="black"/>
            <circle cx="50" cy="50" r="44" fill="white"/>
          </mask>
        </defs>

        <!-- outer chrome rim -->
        <circle cx="50" cy="50" r="44" fill="url(#g_rim_${id})" opacity=".95"/>

        <!-- body metallic gradient -->
        <circle cx="50" cy="50" r="40" fill="url(#g_light_${id})" stroke="rgba(255,255,255,.02)" stroke-width="0.6"/>

        <!-- inner soft shadow for depth -->
        <ellipse cx="50" cy="58" rx="26" ry="12" fill="rgba(0,0,0,.12)" opacity=".7" filter="url(#f_blur_${id})"/>

        <!-- glossy highlight (top-left) -->
        <ellipse cx="38" cy="32" rx="28" ry="18" fill="url(#g_high_${id})" opacity=".95"/>

        <!-- specular streak (slanted) -->
        <g filter="url(#f_blur_${id})" opacity=".9">
          <rect x="20" y="14" width="20" height="8" rx="4" transform="rotate(-18 30 18)" fill="rgba(255,255,255,.54)"/>
        </g>

        <!-- tiny micro-sparkles inside -->
        <g class="sparkGroup" mask="url(#mask_${id})">
          <circle cx="28" cy="24" r="1.6" fill="white" opacity=".95"/>
          <circle cx="66" cy="28" r="1.2" fill="white" opacity=".86"/>
          <circle cx="60" cy="62" r="1.3" fill="white" opacity=".8"/>
          <circle cx="42" cy="68" r="1.1" fill="white" opacity=".75"/>
        </g>

        <!-- interior glow for ultra-premium shimmer -->
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1.2" opacity=".9" />

      </svg>
    `.trim();
  }

  function makeGumball(def, bounds) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gumball";
    btn.dataset.key = def.key;
    btn.dataset.theme = def.theme;

    // scale variants for organic arrangement
    const scale = 0.9 + Math.random() * 0.32;
    btn.style.width = `${84 * scale}px`;
    btn.style.height = `${84 * scale}px`;
    btn.innerHTML = `
      ${gumballSVG(def.colors)}
      <div class="gumball__halo"></div>
      <div class="gumball__rim"></div>
      <div class="gumball__streak"></div>
      <div class="gumball__sparkles"></div>
      <div class="gumball__label">${def.label}</div>
      <div class="gumball__twinkle" style="left:12%; top:14%; animation-delay: ${Math.random()*2}s"></div>
      <div class="gumball__twinkle" style="left:78%; top:22%; animation-delay: ${Math.random()*2.4}s"></div>
    `;

    // initial position inside bounds
    const pad = 12;
    const x = pad + Math.random() * Math.max(1, bounds.w - pad * 2 - 96);
    const y = pad + Math.random() * Math.max(1, bounds.h - pad * 2 - 110);

    const g = {
      el: btn,
      x, y,
      vx: (Math.random() * 0.38 + 0.08) * (Math.random() < 0.5 ? -1 : 1),
      vy: (Math.random() * 0.38 + 0.08) * (Math.random() < 0.5 ? -1 : 1),
      wob: Math.random() * Math.PI * 2,
      rot: (Math.random()*10 - 5),
      scale
    };

    btn.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${g.rot}deg)`;

    btn.addEventListener("click", () => openGumballModal(def));
    btn.addEventListener("mouseenter", () => bump(g, bounds));
    btn.addEventListener("touchstart", () => bump(g, bounds), { passive: true });

    return g;
  }

  function bump(g, bounds) {
    const cx = g.x + 42;
    const cy = g.y + 42;
    const dx = cx - bounds.w / 2;
    const dy = cy - bounds.h / 2;
    const len = Math.max(1, Math.hypot(dx, dy));
    g.vx += (dx / len) * 0.08;
    g.vy += (dy / len) * 0.08;
  }

  // modal content mapping (re-uses same sections as before)
  function openGumballModal(def) {
    const title = `🍬 ${def.label}`;
    const node = document.createElement("div");

    // content tailored by key
    if (def.key === "sponsors") {
      node.appendChild(simpleSection("Sponsor Spotlight", "Sponsors help cover travel, coaching, meet fees. Premium placement & stories."));
      node.appendChild(simpleSection("Offer", "Logo placement, featured updates, thank-you highlights."));
      node.appendChild(ctaRow([{ label:"Support / Donate", kind:"primary", onClick: () => toast("Connect donate link in data/athlete.json") }, { label:"Close", kind:"ghost", onClick: closeModal }]));
    }
    if (def.key === "snapshot") {
      node.appendChild(simpleSection("Season Snapshot", "Quick goals & progress overview."));
      node.appendChild(ctaRow([{ label:"Support", kind:"primary", onClick: ()=> $("#donateBtn")?.click() }, { label:"Close", kind:"ghost", onClick: closeModal }]));
    }
    if (def.key === "journey") {
      node.appendChild(simpleSection("Journey", "Photos, clips, and updates illustrating progress."));
      node.appendChild(ctaRow([{ label:"Open Share Options", kind:"primary", onClick: () => openShareModal() }, { label:"Close", kind:"ghost", onClick: closeModal }]));
    }
    if (def.key === "upcoming") {
      node.appendChild(simpleSection("Upcoming", "Next meets, training focuses, and dates."));
      node.appendChild(ctaRow([{ label:"Share Update", kind:"primary", onClick: ()=> openShareModal() }, { label:"Close", kind:"ghost", onClick: closeModal }]));
    }
    if (def.key === "achievements") {
      node.appendChild(simpleSection("Achievements", "Medals, personal bests, and milestones."));
      node.appendChild(ctaRow([{ label:"Copy Link", kind:"primary", onClick: copyLink }, { label:"Close", kind:"ghost", onClick: closeModal }]));
    }

    openModal({ title, theme: def.theme, contentNode: node });
  }

  // ---------- Drift loop ----------
  let gumballs = [];
  let raf = 0;

  function startGumballDrift() {
    const stage = els.showcaseStage;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const bounds = { w: rect.width, h: rect.height };

    stage.innerHTML = "";
    gumballs = gumballDefs.map(def => {
      const g = makeGumball(def, bounds);
      stage.appendChild(g.el);
      return g;
    });

    const pad = 10;

    const tick = () => {
      const r = stage.getBoundingClientRect();
      const w = r.width, h = r.height;
      gumballs.forEach(g => {
        g.wob += 0.018;
        const wobX = Math.cos(g.wob) * 0.18;
        const wobY = Math.sin(g.wob) * 0.18;

        g.x += (g.vx + wobX);
        g.y += (g.vy + wobY);

        const elW = g.el.offsetWidth || 84;
        const elH = g.el.offsetHeight || 84;

        if (g.x < pad) { g.x = pad; g.vx *= -1; }
        if (g.y < pad) { g.y = pad; g.vy *= -1; }
        if (g.x > w - elW - pad) { g.x = w - elW - pad; g.vx *= -1; }
        if (g.y > h - elH - pad) { g.y = h - elH - pad; g.vy *= -1; }

        const sp = Math.hypot(g.vx, g.vy);
        if (sp > 0.9) { g.vx *= 0.94; g.vy *= 0.94; }

        const rot = (g.vx * 8) + (Math.sin(g.wob) * 1.6);
        g.el.style.transform = `translate3d(${g.x}px, ${g.y}px, 0) rotate(${rot}deg)`;
      });

      raf = requestAnimationFrame(tick);
    };

    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }

  window.addEventListener("resize", () => { clearTimeout(window._gResize); window._gResize = setTimeout(startGumballDrift, 130); });

  // ---------- Share modal & copy ----------
  function copyLink() {
    const url = window.location.href;
    try { navigator.clipboard.writeText(url); toast("Link copied ✨"); } catch {
      const t = document.createElement("textarea"); t.value = url; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); toast("Link copied ✨"); } catch { toast("Copy failed"); } finally { t.remove(); }
    }
  }
  function openShareModal(){
    const node = document.createElement("div");
    node.appendChild(simpleSection("Share this card", "Send the link to family and sponsors — fast shares → real help."));
    node.appendChild(ctaRow([{ label:"↗ Copy Link", kind:"primary", onClick: copyLink }, { label:"Close", kind:"ghost", onClick: closeModal }]));
    openModal({ title:"📤 Share", theme:"pink", contentNode: node });
  }
  function shareVia(kind){
    const url = encodeURIComponent(window.location.href);
    if (kind === "facebook") window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
    else if (kind === "x") window.open(`https://twitter.com/intent/tweet?text=${url}`, "_blank");
    else { toast("Open share"); copyLink(); }
  }

  // ---------- tiny components ----------
  function simpleSection(h, p) {
    const box = document.createElement("div"); box.className = "modalSection";
    const hh = document.createElement("h3"); hh.className="modalH"; hh.textContent = h; box.appendChild(hh);
    if (p) { const pp = document.createElement("p"); pp.className = "modalP"; pp.textContent = p; box.appendChild(pp); }
    return box;
  }

  // ---------- Init (load data, build gallery, start gumballs) ----------
  async function init() {
    // share chips
    const chips = [
      { label:"💬 Text", fn: ()=> shareVia("sms") },
      { label:"💚 WhatsApp", fn: ()=> shareVia("whatsapp") },
      { label:"📘 Facebook", fn: ()=> shareVia("facebook") },
      { label:"✉️ Email", fn: ()=> shareVia("email") },
      { label:"📸 Instagram", fn: ()=> shareVia("instagram") },
      { label:"𝕏 X", fn: ()=> shareVia("x") },
    ];
    if (els.shareChips) {
      els.shareChips.innerHTML = "";
      chips.forEach(c=>{
        const btn = document.createElement("button"); btn.type="button"; btn.className="chip"; btn.textContent = c.label; btn.addEventListener("click", c.fn);
        els.shareChips.appendChild(btn);
      });
    }

    let data = null;
    try {
      data = await loadJSON("data/athlete.json");
    } catch (err) {
      console.error(err);
      toast("Could not load data/athlete.json");
      // still start gumballs with defaults (so stage is not empty)
      startGumballDrift();
      return;
    }

    // bind fundraiser
    const fg = data.fundraising || {};
    const raised = Number(fg.raised || 0), goal = Number(fg.goal || 0);
    els.fundTitle && (els.fundTitle.textContent = fg.title || "Help cover travel, coaching, meet fees.");
    els.fundNumbers && (els.fundNumbers.textContent = `$${raised.toLocaleString()} / $${goal.toLocaleString()}`);
    const p = pct(raised, goal); els.meterBar && (els.meterBar.style.width = `${p}%`);

    // build gallery
    const gallery = Array.isArray(data.gallery) ? data.gallery : [];
    if (els.gallerySub) els.gallerySub.textContent = data.gallerySub || "Highlights from training + meets.";
    buildGallery(gallery);

    // Start gumball drift (main)
    startGumballDrift();

    // donate / bio hooks
    els.donateBtn && els.donateBtn.addEventListener("click", ()=> {
      if (data.links && data.links.donate) window.open(data.links.donate, "_blank", "noopener");
      else toast("Add donate link to data/athlete.json");
    });
    els.bioBtn && els.bioBtn.addEventListener("click", ()=> openBio(data));
    els.bioBtnPhoto && els.bioBtnPhoto.addEventListener("click", ()=> openBio(data));
    els.copyLinkBtn && els.copyLinkBtn.addEventListener("click", copyLink);
    els.shareBtn && els.shareBtn.addEventListener("click", openShareModal);
    els.openShareModalBtn && els.openShareModalBtn.addEventListener("click", openShareModal);
    els.builtBtn && els.builtBtn.addEventListener("click", ()=> {
      openModal({ title:"✨ Built to be shared", theme:"pink", contentNode: simpleSection("Built to be shared", "Showcase the journey — cards starting at $199.99") });
    });
  }

  function openBio(data) {
    const node = document.createElement("div");
    node.appendChild(simpleSection("About", data.bio?.about || "Add a short athlete bio in data/athlete.json."));
    node.appendChild(ctaRow([{ label:"Close", kind:"ghost", onClick: closeModal }]));
    openModal({ title: `🏅 ${data.athlete?.name || "Athlete"} — Bio`, theme: "violet", contentNode: node });
  }

  // start
  init();

})();
