/* ===============================
   Digital Athlete Card — app.js (PNG case-safe)
   =============================== */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const byId = (id) => document.getElementById(id);
  const on = (el, evt, fn, opts) => el && el.addEventListener(evt, fn, opts);
  const setText = (el, val) => el && (el.textContent = val ?? "");
  const setAttr = (el, name, val) => el && val != null && el.setAttribute(name, String(val));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const fmtMoney = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(n || 0));
  const fmtScore = (n) => (Number.isFinite(+n) ? (+n).toFixed(3).replace(/\.?0+$/, "") : "—");

  function domReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  // ---- image path case fallback (png <-> PNG) ----
  async function resolveImageUrl(src) {
    if (!src) return "";
    // If it's already absolute (http/https/data), return as is
    if (/^(https?:|data:)/i.test(src)) return src;

    const tryHead = async (url) => {
      try {
        const res = await fetch(url, { method: "HEAD", cache: "no-store" });
        return res.ok;
      } catch {
        return false;
      }
    };

    // Try original
    if (await tryHead(src)) return src;

    // Flip extension case if .png or .PNG
    const flipped = src.endsWith(".png")
      ? src.slice(0, -4) + ".PNG"
      : src.endsWith(".PNG")
      ? src.slice(0, -4) + ".png"
      : "";

    if (flipped && (await tryHead(flipped))) return flipped;

    // As a last resort, just return original (will show broken image but app won't crash)
    return src;
  }

  const state = {
    athlete: null,
    reducedMotion: false,
    chart: null,
    cardTimer: null,
    cardIndex: 0,
    milestonesHit: new Set(),
  };

  const LS = {
    reducedMotion: "dac_reduced_motion",
    milestones: "dac_milestones_v1",
  };

  function toast(msg) {
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
    clearTimeout(toast._t);
    toast._t = setTimeout(() => (el.style.opacity = "0"), 1300);
  }

  // ---- modals ----
  function openModal(id) {
    const overlay = byId(id);
    if (!overlay) return;
    overlay.setAttribute("aria-hidden", "false");
    overlay.classList.add("open");
    document.documentElement.classList.add("modalOpen");
  }
  function closeModal(id) {
    const overlay = byId(id);
    if (!overlay) return;
    overlay.setAttribute("aria-hidden", "true");
    overlay.classList.remove("open");
    const anyOpen = $$(".modalOverlay.open").length > 0;
    if (!anyOpen) document.documentElement.classList.remove("modalOpen");
  }
  function wireModalClose() {
    $$(".modalClose").forEach((btn) => {
      on(btn, "click", () => {
        const id = btn.getAttribute("data-close");
        if (id) closeModal(id);
        else btn.closest(".modalOverlay") && closeModal(btn.closest(".modalOverlay").id);
      });
    });
    $$(".modalOverlay").forEach((overlay) => {
      on(overlay, "click", (e) => e.target === overlay && closeModal(overlay.id));
    });
    on(document, "keydown", (e) => {
      if (e.key !== "Escape") return;
      const openOverlays = $$(".modalOverlay.open");
      if (openOverlays.length) closeModal(openOverlays[openOverlays.length - 1].id);
    });
  }

  // ---- SEO/meta ----
  function applySeo(ath) {
    const url = window.location.href.split("#")[0];
    const fullName = [ath.firstName, ath.lastName].filter(Boolean).join(" ").trim() || ath.name || "Digital Athlete Card";
    const team = ath.team || ath.club || "Youth Sports";
    const sport = ath.discipline || ath.sport || "Gymnastics";
    const level = ath.level || "";

    const title = `${fullName}${level ? " | " + level : ""} | ${team} | ${sport} Fundraiser`;
    const desc =
      ath.seoDescription ||
      ath.storyShort ||
      `Support ${fullName}${level ? ` (${level})` : ""}. View meet scores, performance charts, season highlights, and sponsor their journey.`;

    document.title = title;
    setAttr(byId("canonicalLink"), "href", url);
    setAttr(byId("ogUrl"), "content", url);

    setAttr(byId("ogTitle"), "content", `Support ${fullName}'s Season Journey ✨`);
    setAttr(byId("ogDesc"), "content", desc);
    setAttr(byId("twTitle"), "content", `Support ${fullName}'s Season ✨`);
    setAttr(byId("twDesc"), "content", desc);
    setAttr(byId("metaDesc"), "content", desc);

    // Share image: allow relative + case-safe
    (async () => {
      const shareImgRaw = ath.shareImageAbsolute || ath.shareImage || "";
      if (!shareImgRaw) return;
      const resolved = await resolveImageUrl(shareImgRaw);
      if (!resolved) return;
      const abs = /^https?:/i.test(resolved) ? resolved : new URL(resolved, url).toString();
      setAttr(byId("ogImage"), "content", abs);
      setAttr(byId("twImage"), "content", abs);
    })();

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: fullName,
      description: desc,
      sport,
      memberOf: team,
      url
    };
    const el = byId("jsonLd");
    if (el) el.textContent = JSON.stringify(jsonLd);
  }

  // ---- reduced motion ----
  function loadReducedMotion() {
    state.reducedMotion = localStorage.getItem(LS.reducedMotion) === "1";
    document.documentElement.classList.toggle("reduceMotion", state.reducedMotion);
  }
  function toggleReducedMotion() {
    state.reducedMotion = !state.reducedMotion;
    localStorage.setItem(LS.reducedMotion, state.reducedMotion ? "1" : "0");
    document.documentElement.classList.toggle("reduceMotion", state.reducedMotion);
    if (state.reducedMotion) stopCardAutoRotate();
    else startCardAutoRotate();
  }

  // ---- share ----
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
    const shareText = text || "Support this athlete’s season 💕 Tap to view scores, highlights, and sponsors.";
    const shareUrl = url || pageUrl();
    try {
      if (navigator.share) await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      else await copyLink(shareUrl);
    } catch {}
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
    if (em) em.href = `mailto:?subject=${encodeURIComponent("Support this athlete’s season")}&body=${encoded}`;

    on(byId("btnCopyLink"), "click", () => copyLink(url));
    on(byId("btnNativeShare"), "click", () => nativeShare());
    on(byId("ctaShare"), "click", () => nativeShare());
    on(byId("btnShareProgress"), "click", () => {
      const t = byId("shareProgressText")?.textContent || "Support this athlete’s season 💕";
      nativeShare({ text: t });
    });
  }

  // ---- hero/fundraising ----
  function renderHero(ath) {
    setText(byId("athleteFirstName"), ath.firstName || (ath.name || "").split(" ")[0] || "Athlete");
    setText(byId("athleteLastName"), ath.lastName || (ath.name || "").split(" ").slice(1).join(" ") || "");
    setText(byId("athleteTeam"), ath.team || ath.club || "Team");
    setText(byId("athleteDiscipline"), ath.discipline || ath.sport || "Gymnastics");

    const badge = byId("levelBadge");
    if (badge) badge.textContent = `🏅 ${ath.level || "Bronze"}`;

    const raised = Number(ath.fundraising?.raised ?? ath.raised ?? 0);
    const goal = Number(ath.fundraising?.goal ?? ath.goal ?? 0);
    const pct = goal > 0 ? clamp((raised / goal) * 100, 0, 100) : 0;

    setText(byId("goalPill"), `${fmtMoney(raised)} / ${fmtMoney(goal)}`);
    setText(byId("goalSubtitle"), ath.fundraising?.subtitle || "Help cover travel, coaching, meet fees.");
    const pb = byId("progressBar");
    if (pb) pb.style.width = `${pct}%`;

    const spt = byId("shareProgressText");
    if (spt) {
      const name = [ath.firstName, ath.lastName].filter(Boolean).join(" ").trim() || "This athlete";
      spt.textContent = `${name} is ${Math.round(pct)}% to the season goal! Help finish strong 💕`;
    }

    on(byId("ctaDonate"), "click", () => {
      const donateUrl = ath.fundraising?.donateUrl || ath.donateUrl || "";
      if (donateUrl) window.open(donateUrl, "_blank", "noopener");
      else toast("Add fundraising.donateUrl in athlete.json");
    });
  }

  // ---- bio modal ----
  async function renderBioModal(ath) {
    const name = [ath.firstName, ath.lastName].filter(Boolean).join(" ").trim() || ath.name || "Athlete";
    setText(byId("bioTitle"), name);

    const bioPhotoUrlRaw =
      ath.bio?.photo || ath.photo || ath.heroPhoto || (ath.photos?.[0]?.src || ath.photos?.[0]) || "";
    const bioPhotoUrl = await resolveImageUrl(bioPhotoUrlRaw);

    const bioPhoto = byId("bioPhoto");
    if (bioPhoto && bioPhotoUrl) {
      bioPhoto.style.backgroundImage = `url("${bioPhotoUrl}")`;
      bioPhoto.style.backgroundSize = "cover";
      bioPhoto.style.backgroundPosition = "center";
    }

    const facts = ath.bio?.quickFacts || [];
    const quick = byId("bioQuick");
    if (quick) {
      quick.innerHTML = (facts.length ? facts : [{ label: "Level", value: ath.level || "—" }])
        .map((f) => `<div class="bioFact"><strong>${escapeHtml(f.label || "")}</strong><span>${escapeHtml(f.value || "")}</span></div>`)
        .join("");
    }

    const story = ath.bio?.story || "";
    const storyEl = byId("bioStory");
    if (storyEl) storyEl.innerHTML = story ? `<p>${escapeHtml(story)}</p>` : `<p>${escapeHtml(name)}’s story will appear here.</p>`;

    const links = ath.links || [];
    const linksEl = byId("bioLinks");
    if (linksEl) {
      linksEl.innerHTML = links
        .filter((l) => l && l.url)
        .map((l) => `<a class="bioLink" href="${escapeAttr(l.url)}" target="_blank" rel="noopener">🔗 ${escapeHtml(l.label || "Link")} ↗</a>`)
        .join("");
    }

    on(byId("openBioModal"), "click", () => openModal("bioModal"));
  }

  // ---- cards ----
  async function renderCards(ath) {
    const wrap = byId("cardsFan");
    if (!wrap) return;
    wrap.innerHTML = "";

    const photosRaw = ath.photos || [];
    const photos = photosRaw.map((p) => (typeof p === "string" ? { src: p } : p)).filter((p) => p && p.src);

    if (!photos.length) {
      wrap.innerHTML = `<div style="opacity:.75;padding:20px;">Add photos[] in data/athlete.json</div>`;
      return;
    }

    // resolve src case-safe
    for (const p of photos) p._resolved = await resolveImageUrl(p.src);

    const cards = photos.map((p, idx) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "photoCard";
      card.style.backgroundImage = `url("${p._resolved}")`;
      card.style.backgroundSize = "cover";
      card.style.backgroundPosition = "center";
      card.dataset.index = String(idx);
      if (p.caption) {
        const cap = document.createElement("div");
        cap.className = "photoCap";
        cap.textContent = p.caption;
        card.appendChild(cap);
      }
      on(card, "click", () => openLightbox(p, idx, photos));
      return card;
    });

    cards.forEach((card, i) => {
      const n = cards.length;
      const mid = (n - 1) / 2;
      const rot = (i - mid) * 6;
      const tx = (i - mid) * 14;
      const ty = Math.abs(i - mid) * 4;
      card.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
      wrap.appendChild(card);
    });

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
    state.cardTimer = setInterval(() => {
      state.cardIndex = (state.cardIndex + 1) % cards.length;
      applyCardFront(cards, state.cardIndex);
    }, 2600);
  }
  function stopCardAutoRotate() {
    if (state.cardTimer) clearInterval(state.cardTimer);
    state.cardTimer = null;
  }

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
        </div>
      `;
      document.body.appendChild(lb);
      on(lb, "click", (e) => e.target === lb && (lb.style.display = "none"));
      on(byId("dacLbClose"), "click", () => (lb.style.display = "none"));
    }
    const img = byId("dacLbImg");
    const cap = byId("dacLbCap");
    img.src = photo._resolved || photo.src;
    img.alt = photo.alt || `Photo ${idx + 1}`;
    cap.textContent = photo.caption || "";
    lb.style.display = "flex";
  }

  // ---- events (same as before, kept compact) ----
  function normalizeEvents(ath) {
    const raw = ath.events || {};
    return Object.entries(raw).map(([key, arr]) => ({
      key,
      name: key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
      entries: (Array.isArray(arr) ? arr : []).map((x) => ({
        meet: x.meet || "Meet",
        date: x.date || "",
        score: x.score ?? null
      }))
    }));
  }
  function calcEventStats(entries) {
    const scores = entries.map((e) => +e.score).filter((n) => Number.isFinite(n));
    const last = scores.length ? scores[scores.length - 1] : null;
    const best = scores.length ? Math.max(...scores) : null;
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    return {
      lastStr: last == null ? "—" : fmtScore(last),
      bestStr: best == null ? "—" : fmtScore(best),
      avgStr: avg == null ? "—" : fmtScore(avg),
    };
  }
  function renderEvents(ath) {
    const grid = byId("eventGrid");
    if (!grid) return;
    const events = normalizeEvents(ath);
    grid.innerHTML = "";
    events.forEach((ev) => {
      const stats = calcEventStats(ev.entries);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "eventTile";
      btn.innerHTML = `
        <div class="eventTop">
          <div class="eventName">${escapeHtml(ev.name)}</div>
          <div class="eventScore">${escapeHtml(stats.lastStr)}</div>
        </div>
        <div class="eventMetaRow">
          <span class="eventMeta">Avg: <strong>${escapeHtml(stats.avgStr)}</strong></span>
          <span class="eventMeta soft">Best: <strong>${escapeHtml(stats.bestStr)}</strong></span>
        </div>
      `;
      on(btn, "click", () => openEventModal(ev));
      grid.appendChild(btn);
    });
  }
  function openEventModal(ev) {
    setText(byId("eventTitle"), ev.name);
    const stats = calcEventStats(ev.entries);
    setText(byId("eventAvg"), stats.avgStr);
    setText(byId("eventLast"), stats.lastStr);
    setText(byId("eventBest"), stats.bestStr);

    const list = byId("meetList");
    if (list) {
      list.innerHTML = [...ev.entries].reverse().map((m) => `
        <div class="meetItem">
          <div class="meetTop">
            <div class="meetName">${escapeHtml(m.meet)}</div>
            <div class="meetScore">${escapeHtml(fmtScore(+m.score))}</div>
          </div>
          <div class="meetSub"><div class="meetDate">${escapeHtml(m.date)}</div></div>
        </div>
      `).join("");
    }

    const canvas = byId("eventScoreChart");
    if (canvas && typeof Chart === "function") {
      if (state.chart) { try { state.chart.destroy(); } catch {} }
      const ctx = canvas.getContext("2d");
      state.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: ev.entries.map((e, i) => e.date || `Meet ${i + 1}`),
          datasets: [{ label: ev.name, data: ev.entries.map((e) => +e.score), tension: 0.3, borderWidth: 2 }]
        },
        options: { responsive: true, maintainAspectRatio: false, animation: state.reducedMotion ? false : { duration: 700 }, plugins: { legend: { display: false } } }
      });
    }

    openModal("eventModal");
  }

  // ---- sponsors ----
  function renderSponsors(ath) {
    const sponsors = (ath.sponsors || []).filter(Boolean);
    const strip = byId("sponsorStrip");
    const grid = byId("sponsorGrid");

    if (strip) strip.innerHTML = "";
    if (grid) grid.innerHTML = "";

    sponsors.forEach(async (s) => {
      const name = s.name || "Sponsor";
      const logo = await resolveImageUrl(s.logo || "");

      if (strip) {
        const a = document.createElement("a");
        a.className = "sponsorLogo";
        a.href = s.url || "#";
        a.target = s.url ? "_blank" : "_self";
        a.rel = s.url ? "noopener" : "";
        a.title = name;

        if (logo) {
          const img = document.createElement("img");
          img.src = logo;
          img.alt = name;
          img.loading = "lazy";
          a.appendChild(img);
        } else {
          a.textContent = name;
        }
        strip.appendChild(a);
      }

      if (grid) {
        const card = document.createElement("a");
        card.className = "sponsorCard";
        card.href = s.url || "#";
        card.target = s.url ? "_blank" : "_self";
        card.rel = s.url ? "noopener" : "";
        card.innerHTML = `
          <div class="sponsorLogoBox">${logo ? `<img src="${escapeAttr(logo)}" alt="${escapeAttr(name)}" loading="lazy">` : `<div class="sponsorFallback">${escapeHtml(name)}</div>`}</div>
          <div class="sponsorName">${escapeHtml(name)}</div>
          ${s.blurb ? `<div class="sponsorBlurb">${escapeHtml(s.blurb)}</div>` : ""}
          <div class="sponsorCta">Visit sponsor ↗</div>
        `;
        grid.appendChild(card);
      }
    });

    on(byId("btnOpenSponsors"), "click", () => openModal("sponsorsModal"));
    on(byId("btnBecomeSponsor"), "click", () => openModal("sponsorsModal"));
  }

  // ---- load athlete.json ----
  async function loadAthlete() {
    const res = await fetch("data/athlete.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load data/athlete.json");
    return res.json();
  }

  // ---- helpers ----
  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function escapeAttr(s) { return escapeHtml(s).replace(/`/g, "&#096;"); }

  domReady(async () => {
    try {
      loadReducedMotion();
      wireModalClose();

      state.athlete = await loadAthlete();
      applySeo(state.athlete);

      renderHero(state.athlete);
      await renderBioModal(state.athlete);
      await renderCards(state.athlete);
      renderEvents(state.athlete);
      renderSponsors(state.athlete);

      wireShareButtons();

      on(byId("btnReduceMotion"), "click", toggleReducedMotion);
      on(byId("btnOpenAbout"), "click", () => openModal("aboutModal"));
    } catch (e) {
      console.error(e);
      toast("Load error — check console.");
    }
  });
})();
