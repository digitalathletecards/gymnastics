(() => {
  const byId = (id) => document.getElementById(id);
  const on = (el, evt, fn) => el && el.addEventListener(evt, fn);
  const setText = (el, val) => el && (el.textContent = val ?? "");
  const setHTML = (el, val) => el && (el.innerHTML = val ?? "");
  const setAttr = (el, name, val) => el && val != null && el.setAttribute(name, String(val));

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const fmtMoney = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(n || 0));

  function pageUrl() {
    return window.location.href.split("#")[0];
  }

  function vib(ms = 10) {
    try { if (navigator.vibrate) navigator.vibrate(ms); } catch {}
  }

  async function copyLink(text = pageUrl()) {
    try {
      await navigator.clipboard.writeText(text);
      vib(12);
      toast("Copied link ✨");
    } catch {
      prompt("Copy this link:", text);
    }
  }

  async function nativeShare({ title, text, url } = {}) {
    try {
      if (navigator.share) {
        vib(12);
        await navigator.share({
          title: title || document.title,
          text: text || "Support this athlete’s season 💕",
          url: url || pageUrl()
        });
      } else {
        await copyLink(url || pageUrl());
      }
    } catch {}
  }

  function toast(msg) {
    // tiny inline toast without extra markup
    const t = document.createElement("div");
    t.style.cssText = `
      position:fixed;left:50%;bottom:88px;transform:translateX(-50%);
      background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.16);
      color:rgba(255,255,255,.92);padding:10px 12px;border-radius:14px;
      font:900 13px Nunito,system-ui;backdrop-filter:blur(10px);
      box-shadow:0 18px 60px rgba(0,0,0,.45);z-index:9999;
      opacity:0;transition:opacity .18s ease, transform .18s ease;
    `;
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => {
      t.style.opacity = "1";
      t.style.transform = "translateX(-50%) translateY(-4px)";
    });
    setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateX(-50%) translateY(0px)";
      setTimeout(() => t.remove(), 220);
    }, 1400);
  }

  function openModal(id) {
    const m = byId(id);
    if (!m) return;
    m.classList.add("open");
    m.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("modalOpen");
  }

  function closeModal(id) {
    const m = byId(id);
    if (!m) return;
    m.classList.remove("open");
    m.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".modalOverlay.open")) {
      document.documentElement.classList.remove("modalOpen");
    }
  }

  function wireModals() {
    document.querySelectorAll(".modalClose").forEach((btn) => {
      on(btn, "click", () => {
        vib(8);
        const id = btn.getAttribute("data-close");
        if (id) closeModal(id);
      });
    });

    document.querySelectorAll(".modalOverlay").forEach((overlay) => {
      on(overlay, "click", (e) => {
        if (e.target === overlay) closeModal(overlay.id);
      });
    });

    on(document, "keydown", (e) => {
      if (e.key !== "Escape") return;
      const open = document.querySelector(".modalOverlay.open");
      if (open) closeModal(open.id);
    });
  }

  function applySeo(ath) {
    const url = pageUrl();
    const fullName = `${ath.firstName || ""} ${ath.lastName || ""}`.trim() || "Digital Athlete Card";
    const seo = ath.seo || {};

    document.title = seo.title || `${fullName} | ${ath.team || "Youth Sports"} | Fundraiser`;

    // in-browser meta updates (doesn't fix all social scrapers, but helps)
    const desc = seo.description || `Support ${fullName}. View meet scores and sponsor the season.`;
    const ogTitle = seo.shareTitle || `Support ${fullName}'s Season Journey ✨`;
    const ogDesc = seo.shareDescription || desc;

    const shareImgRel = seo.shareImage || "images/senxia.png";
    const shareImgAbs = new URL(shareImgRel, url).toString();

    // set meta if present
    setAttr(document.querySelector('meta[name="description"]'), "content", desc);
    setAttr(document.querySelector('meta[property="og:title"]'), "content", ogTitle);
    setAttr(document.querySelector('meta[property="og:description"]'), "content", ogDesc);
    setAttr(document.querySelector('meta[property="og:url"]'), "content", url);
    setAttr(document.querySelector('meta[property="og:image"]'), "content", shareImgAbs);

    setAttr(document.querySelector('meta[name="twitter:title"]'), "content", ogTitle);
    setAttr(document.querySelector('meta[name="twitter:description"]'), "content", ogDesc);
    setAttr(document.querySelector('meta[name="twitter:image"]'), "content", shareImgAbs);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: fullName,
      sport: ath.discipline || "Gymnastics",
      memberOf: ath.team || "Team",
      description: desc,
      url
    };
    const el = byId("jsonLd");
    if (el) el.textContent = JSON.stringify(jsonLd);
  }

  function renderHero(ath) {
    setText(byId("athleteFirstName"), ath.firstName || "Athlete");
    setText(byId("athleteLastName"), ath.lastName || "");
    setText(byId("athleteTeam"), ath.team || "Team");
    setText(byId("athleteDiscipline"), ath.discipline || "Gymnastics");

    const badge = byId("levelBadge");
    if (badge) badge.textContent = `🏅 ${ath.level || "Bronze"}`;

    const raised = Number(ath.fundraising?.raised || 0);
    const goal = Number(ath.fundraising?.goal || 0);
    const pct = goal > 0 ? clamp((raised / goal) * 100, 0, 100) : 0;

    setText(byId("goalPill"), `${fmtMoney(raised)} / ${fmtMoney(goal)}`);
    setText(byId("goalSubtitle"), ath.fundraising?.subtitle || "Help cover travel, coaching, meet fees.");

    const bar = byId("progressBar");
    if (bar) bar.style.width = `${pct}%`;

    const spt = byId("shareProgressText");
    if (spt) {
      const name = ath.firstName || "This athlete";
      spt.textContent = `${name} is ${Math.round(pct)}% to the season goal! Help finish strong 💕`;
    }

    // Suggested donation chips
    const suggestRow = byId("suggestRow");
    if (suggestRow) {
      const amounts = ath.fundraising?.suggestedAmounts || [];
      setHTML(suggestRow, "");
      amounts.forEach((amt) => {
        const b = document.createElement("button");
        b.className = "suggestChip";
        b.type = "button";
        b.textContent = `${fmtMoney(amt)}`;
        b.title = "Suggested donation";
        on(b, "click", () => {
          vib(12);
          toast(`Suggested: ${fmtMoney(amt)} 💕`);
          const donateUrl = ath.fundraising?.donateUrl;
          if (donateUrl) window.open(donateUrl, "_blank", "noopener");
        });
        suggestRow.appendChild(b);
      });
    }

    on(byId("ctaDonate"), "click", () => {
      vib(12);
      const donateUrl = ath.fundraising?.donateUrl;
      if (donateUrl) window.open(donateUrl, "_blank", "noopener");
      else alert("Add fundraising.donateUrl in data/athlete.json");
    });
  }

  function buildCards(ath) {
    const fan = byId("cardsFan");
    if (!fan) return;

    const photos = (ath.photos || []).filter((p) => p && p.src);
    fan.innerHTML = "";

    const stack = [];

    photos.forEach((p, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "photoCard";
      btn.style.backgroundImage = `url("${p.src}")`;
      btn.style.backgroundSize = "cover";
      btn.style.backgroundPosition = "center";
      btn.setAttribute("aria-label", p.alt || `Photo ${idx + 1}`);

      // caption overlay
      const cap = document.createElement("div");
      cap.className = "photoCap";
      cap.textContent = p.caption || "✨";
      btn.appendChild(cap);

      // open photo modal
      on(btn, "click", () => {
        vib(10);
        const img = byId("photoFull");
        const title = byId("photoTitle");
        const c = byId("photoCaption");
        if (img) img.src = p.src;
        if (title) title.textContent = p.caption || "Journey Moment";
        if (c) c.textContent = p.caption || "";
        openModal("photoModal");
      });

      fan.appendChild(btn);
      stack.push(btn);
    });

    // fan layout
    function layout(frontIndex = 0) {
      stack.forEach((el, i) => {
        const rel = (i - frontIndex + stack.length) % stack.length;
        const depth = Math.min(rel, 5);

        const rot = (depth - 2) * 6;
        const x = (depth - 2) * 22;
        const y = depth * 5;

        el.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
        el.style.zIndex = String(100 - depth);

        if (rel === 0) el.classList.add("front");
        else el.classList.remove("front");

        el.style.opacity = depth >= 5 ? "0" : "1";
      });
    }

    let front = 0;
    layout(front);

    // auto rotate
    let timer = null;
    const reduced = () => document.documentElement.classList.contains("reduceMotion");

    function start() {
      if (timer) clearInterval(timer);
      if (reduced()) return;
      timer = setInterval(() => {
        front = (front + 1) % stack.length;
        layout(front);
      }, 4200);
    }
    start();

    // drag to rotate (basic)
    let down = false;
    let startX = 0;

    on(fan, "pointerdown", (e) => {
      down = true;
      startX = e.clientX;
      fan.setPointerCapture?.(e.pointerId);
    });
    on(fan, "pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 60) {
        front = (front + (dx > 0 ? -1 : 1) + stack.length) % stack.length;
        layout(front);
        startX = e.clientX;
        vib(6);
      }
    });
    on(fan, "pointerup", () => { down = false; });

    // pause on hover
    on(fan, "mouseenter", () => { if (timer) clearInterval(timer); });
    on(fan, "mouseleave", () => start());

    // expose for reduce motion toggle
    return { restart: start };
  }

  function renderBio(ath) {
    const fullName = `${ath.firstName || ""} ${ath.lastName || ""}`.trim();

    setText(byId("bioTitle"), fullName || "Athlete");

    const badges = byId("bioBadges");
    if (badges) {
      badges.innerHTML = `
        <span class="metaPill">${ath.level || "Level"}</span>
        <span class="metaPill soft">${ath.team || "Team"}</span>
        <span class="metaPill soft">${ath.discipline || "Sport"}</span>
      `;
    }

    const photo = byId("bioPhoto");
    if (photo) {
      const src = ath.bio?.photo || "";
      photo.style.backgroundImage = src ? `url("${src}")` : "none";
      photo.style.backgroundSize = "cover";
      photo.style.backgroundPosition = "center";
    }

    const quick = byId("bioQuick");
    if (quick) {
      const facts = ath.bio?.quickFacts || [];
      quick.innerHTML = facts.map(f => `
        <div class="bioFact"><span>${f.label || ""}</span><strong>${f.value || ""}</strong></div>
      `).join("");
    }

    const story = byId("bioStory");
    if (story) {
      const lines = ath.bio?.story || [];
      story.innerHTML = lines.map(p => `<p>${escapeHtml(p)}</p>`).join("");
    }

    const links = byId("bioLinks");
    if (links) {
      const ls = ath.bio?.links || [];
      links.innerHTML = ls.map(l => `
        <a class="bioLink" href="${l.url}" target="_blank" rel="noopener">${escapeHtml(l.label || "Link")} ↗</a>
      `).join("");
    }
  }

  function renderSponsors(ath) {
    const strip = byId("sponsorStrip");
    const grid = byId("sponsorGrid");
    const ctaBox = byId("sponsorCtaBox");
    const spotlight = byId("spotlight");
    const sponsors = (ath.sponsors || []).filter(Boolean);

    if (strip) strip.innerHTML = "";
    if (grid) grid.innerHTML = "";

    sponsors.forEach((s) => {
      const name = s.name || "Sponsor";
      const logo = s.logo || "";

      // rail logo tiles
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

        on(a, "click", () => vib(10));
        strip.appendChild(a);
      }

      // modal sponsor cards
      if (grid) {
        const a = document.createElement("a");
        a.className = "sponsorCard";
        a.href = s.url || "#";
        a.target = s.url ? "_blank" : "_self";
        a.rel = s.url ? "noopener" : "";
        a.innerHTML = `
          <div class="sponsorLogoBox">${logo ? `<img src="${logo}" alt="${escapeHtml(name)}" loading="lazy">` : ""}</div>
          <div class="sponsorName">${escapeHtml(name)}</div>
          ${s.blurb ? `<div class="sponsorBlurb">${escapeHtml(s.blurb)}</div>` : ""}
          <div class="sponsorCta">Visit sponsor ↗</div>
        `;
        on(a, "click", () => vib(10));
        grid.appendChild(a);
      }
    });

    // sponsor CTA inside modal
    if (ctaBox) {
      const scta = ath.sponsorCta || {};
      ctaBox.innerHTML = `
        <div class="t">${escapeHtml(scta.title || "Become a Sponsor 💎")}</div>
        <div class="p">${escapeHtml(scta.copy || "Sponsors help power the season. Tap to learn more.")}</div>
        <a href="${scta.buttonUrl || "#"}" target="_blank" rel="noopener">${escapeHtml(scta.buttonText || "Sponsor this season →")}</a>
      `;
    }

    // spotlight rotation
    if (spotlight && sponsors.length) {
      spotlight.classList.add("on");
      let idx = 0;

      const paint = () => {
        const s = sponsors[idx % sponsors.length];
        const name = s.name || "Sponsor";
        spotlight.innerHTML = `
          <div class="spotTitle">💎 Sponsor Spotlight</div>
          <a class="spotCard" href="${s.url || "#"}" target="${s.url ? "_blank" : "_self"}" rel="${s.url ? "noopener" : ""}">
            <div class="spotLogo">${s.logo ? `<img src="${s.logo}" alt="${escapeHtml(name)}">` : ""}</div>
            <div class="spotMeta">
              <div class="spotName">${escapeHtml(name)}</div>
              <div class="spotBlurb">${escapeHtml(s.blurb || "Thank you for supporting youth sports!")}</div>
              <div class="spotCta">Tap to visit ↗</div>
            </div>
          </a>
        `;
      };

      paint();
      setInterval(() => {
        if (document.documentElement.classList.contains("reduceMotion")) return;
        idx++;
        paint();
      }, 6200);
    }

    on(byId("btnOpenSponsors"), "click", () => { vib(10); openModal("sponsorsModal"); });
    on(byId("btnBecomeSponsor"), "click", () => { vib(10); openModal("sponsorsModal"); });
  }

  let chart = null;

  function renderEvents(ath) {
    const grid = byId("eventGrid");
    if (!grid) return;

    const events = (ath.events || []).filter(Boolean);
    grid.innerHTML = "";

    events.forEach((ev) => {
      const scores = (ev.scores || []).map(s => Number(s.score));
      const last = scores.length ? scores[scores.length - 1] : 0;
      const best = scores.length ? Math.max(...scores) : 0;
      const avg = scores.length ? (scores.reduce((a,b)=>a+b,0) / scores.length) : 0;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "eventTile";
      btn.innerHTML = `
        <div class="eventTop">
          <div class="eventName">${escapeHtml(ev.emoji || "🏅")} ${escapeHtml(ev.name || "Event")}</div>
          <div class="eventScore">${last ? last.toFixed(2) : "—"}</div>
        </div>
        <div class="eventMetaRow">
          <div>Avg <strong>${avg ? avg.toFixed(2) : "—"}</strong></div>
          <div>Best <strong>${best ? best.toFixed(2) : "—"}</strong></div>
        </div>
      `;
      on(btn, "click", () => {
        vib(10);
        openEventModal(ev);
      });
      grid.appendChild(btn);
    });
  }

  function openEventModal(ev) {
    setText(byId("eventTitle"), `${ev.emoji || "🏅"} ${ev.name || "Event"}`);

    const scores = (ev.scores || []).map(s => Number(s.score));
    const labels = (ev.scores || []).map(s => s.meet || s.date || "Meet");
    const last = scores.length ? scores[scores.length - 1] : 0;
    const best = scores.length ? Math.max(...scores) : 0;
    const avg = scores.length ? (scores.reduce((a,b)=>a+b,0) / scores.length) : 0;

    setText(byId("eventAvg"), avg ? avg.toFixed(2) : "0.00");
    setText(byId("eventLast"), last ? last.toFixed(2) : "0.00");
    setText(byId("eventBest"), best ? best.toFixed(2) : "0.00");

    // meet list
    const list = byId("meetList");
    if (list) {
      list.innerHTML = (ev.scores || []).slice().reverse().map(m => `
        <div class="meetItem">
          <div class="meetTop">
            <div class="meetName">${escapeHtml(m.meet || "Meet")}</div>
            <div class="meetScore">${Number(m.score || 0).toFixed(2)}</div>
          </div>
          <div class="meetSub">${escapeHtml(m.date || "")}</div>
        </div>
      `).join("");
    }

    // chart
    const ctx = byId("eventScoreChart");
    if (ctx && window.Chart) {
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: "Score",
            data: scores,
            tension: 0.35,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: "rgba(255,255,255,.72)" }, grid: { color: "rgba(255,255,255,.06)" } },
            y: { ticks: { color: "rgba(255,255,255,.72)" }, grid: { color: "rgba(255,255,255,.06)" } }
          }
        }
      });
    }

    openModal("eventModal");
  }

  function wireShare(ath) {
    const url = pageUrl();
    const baseMsg = ath.share?.message || "Support this athlete’s season 💕";
    const tags = (ath.share?.hashtags || []).join(" ");
    const msg = `${baseMsg} ${url} ${tags}`.trim();
    const encoded = encodeURIComponent(msg);

    const sms = byId("qsSms");
    if (sms) sms.href = `sms:&body=${encoded}`;

    const wa = byId("qsWhatsapp");
    if (wa) wa.href = `https://wa.me/?text=${encoded}`;

    const fb = byId("qsFacebook");
    if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

    const em = byId("qsEmail");
    if (em) em.href = `mailto:?subject=${encodeURIComponent("Support this season")}&body=${encoded}`;

    on(byId("btnCopyLink"), "click", () => copyLink(url));
    on(byId("btnNativeShare"), "click", () => nativeShare({ text: msg }));
    on(byId("ctaShare"), "click", () => nativeShare({ text: msg }));

    on(byId("btnShareProgress"), "click", () => {
      const t = byId("shareProgressText")?.textContent || msg;
      nativeShare({ text: `${t} ${url}` });
    });
  }

  function wireStickyBar() {
    const bar = byId("stickyBar");
    if (!bar) return;

    const showAfter = 180;
    const onScroll = () => {
      const isMobile = window.matchMedia("(max-width: 520px)").matches;
      if (!isMobile) { bar.classList.remove("on"); return; }
      if (window.scrollY > showAfter) bar.classList.add("on");
      else bar.classList.remove("on");
    };
    on(window, "scroll", onScroll);
    on(window, "resize", onScroll);
    onScroll();
  }

  function wireReduceMotion(cardsApi) {
    const btn = byId("btnReduceMotion");
    if (!btn) return;

    const key = "dac_reduce_motion";
    const saved = localStorage.getItem(key);
    if (saved === "1") document.documentElement.classList.add("reduceMotion");

    const refresh = () => {
      const onRM = document.documentElement.classList.contains("reduceMotion");
      btn.textContent = onRM ? "Motion On" : "Reduce Motion";
      if (cardsApi?.restart) cardsApi.restart();
    };
    refresh();

    on(btn, "click", () => {
      vib(10);
      document.documentElement.classList.toggle("reduceMotion");
      localStorage.setItem(key, document.documentElement.classList.contains("reduceMotion") ? "1" : "0");
      refresh();
    });
  }

  function wireMobileButtons() {
    on(byId("sbDonate"), "click", () => byId("ctaDonate")?.click());
    on(byId("sbShare"), "click", () => byId("btnNativeShare")?.click());
    on(byId("sbSponsors"), "click", () => byId("btnOpenSponsors")?.click());
  }

  function wireAboutBio() {
    on(byId("openBioModal"), "click", () => { vib(10); openModal("bioModal"); });
    on(byId("btnOpenAbout"), "click", () => { vib(10); openModal("aboutModal"); });
  }

  function milestoneCelebrate(pct) {
    if (!window.confetti) return;

    const overlay = byId("milestoneOverlay");
    const em = byId("milestoneEmoji");
    const msg = byId("milestoneMsg");
    const sub = byId("milestoneSub");

    const step =
      pct >= 100 ? { e: "🏆", m: "Goal reached!", s: "You did it — thank you for the love! 💕" } :
      pct >= 75 ? { e: "✨", m: "75% milestone!", s: "So close — keep sharing! 📤" } :
      pct >= 50 ? { e: "🎉", m: "Halfway there!", s: "Thank you for powering the season 💎" } :
      pct >= 25 ? { e: "🌟", m: "25% milestone!", s: "The journey is underway — thank you! 💕" } :
      null;

    if (!step) return;

    if (em) em.textContent = step.e;
    if (msg) msg.textContent = step.m;
    if (sub) sub.textContent = step.s;

    if (overlay) {
      overlay.style.display = "flex";
      overlay.setAttribute("aria-hidden", "false");
    }

    // confetti burst
    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.65 } });
      setTimeout(() => confetti({ particleCount: 60, spread: 95, origin: { y: 0.55 } }), 220);
    } catch {}

    setTimeout(() => {
      if (overlay) {
        overlay.style.display = "none";
        overlay.setAttribute("aria-hidden", "true");
      }
    }, 1800);
  }

  function runMilestoneOnce(ath) {
    const goal = Number(ath.fundraising?.goal || 0);
    const raised = Number(ath.fundraising?.raised || 0);
    const pct = goal > 0 ? clamp((raised / goal) * 100, 0, 200) : 0;

    const key = "dac_milestone_shown";
    const lastShown = Number(localStorage.getItem(key) || 0);

    const steps = [25, 50, 75, 100];
    const currentStep = steps.reverse().find(s => pct >= s) || 0;

    if (currentStep > 0 && currentStep > lastShown && !document.documentElement.classList.contains("reduceMotion")) {
      localStorage.setItem(key, String(currentStep));
      setTimeout(() => milestoneCelebrate(pct), 700);
    }
  }

  // simple canvas particles (premium shimmer)
  function startCanvasFx() {
    const c = byId("fx-canvas");
    if (!c) return;

    const ctx = c.getContext("2d");
    const dots = [];
    const N = 55;

    const resize = () => {
      c.width = window.innerWidth * devicePixelRatio;
      c.height = window.innerHeight * devicePixelRatio;
      c.style.width = window.innerWidth + "px";
      c.style.height = window.innerHeight + "px";
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < N; i++) {
      dots.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 1 + Math.random() * 2.2,
        vx: (-0.2 + Math.random() * 0.4),
        vy: (-0.18 + Math.random() * 0.36),
        a: 0.15 + Math.random() * 0.35
      });
    }

    const reduced = () => document.documentElement.classList.contains("reduceMotion");

    function tick() {
      if (!ctx) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (!reduced()) {
        for (const d of dots) {
          d.x += d.vx;
          d.y += d.vy;

          if (d.x < -30) d.x = window.innerWidth + 30;
          if (d.x > window.innerWidth + 30) d.x = -30;
          if (d.y < -30) d.y = window.innerHeight + 30;
          if (d.y > window.innerHeight + 30) d.y = -30;
        }
      }

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${d.a})`;
        ctx.fill();

        // connect near neighbors
        for (let j = i + 1; j < dots.length; j++) {
          const e = dots[j];
          const dx = d.x - e.x;
          const dy = d.y - e.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 110) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / 110) * 0.10})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(e.x, e.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(tick);
    }
    tick();
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function init() {
    wireModals();
    wireStickyBar();
    wireMobileButtons();
    wireAboutBio();
    startCanvasFx();

    const res = await fetch("data/athlete.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Missing data/athlete.json");
    const ath = await res.json();

    applySeo(ath);
    renderHero(ath);
    renderBio(ath);
    renderSponsors(ath);
    renderEvents(ath);
    wireShare(ath);

    const cardsApi = buildCards(ath);
    wireReduceMotion(cardsApi);

    runMilestoneOnce(ath);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init().catch(console.error));
  } else {
    init().catch(console.error);
  }
})();
