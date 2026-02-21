/* Digital Athlete Card – premium UI + modern FX
   - Canvas particles + constellation links (mouse reactive)
   - Name orbit + subtle pulse glow
   - Data-driven cards/events/sponsors
   - Accessible modals (ESC close, click outside, focus handling)
   - Chart.js event chart
*/

(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  // ---------- Global toggles ----------
  let reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Persist reduce motion toggle
  try {
    const saved = localStorage.getItem("dac_reduce_motion");
    if (saved !== null) reduceMotion = saved === "1";
  } catch {}

  // ---------- Load data ----------
  async function loadData() {
    const res = await fetch("data/athlete.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load data/athlete.json");
    return res.json();
  }

  // ---------- Utilities ----------
  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
  function avg(arr){ return arr.length ? (arr.reduce((s,x)=>s+x,0)/arr.length) : 0; }
  function fmtMoney(n){
    try { return new Intl.NumberFormat(undefined, { style:"currency", currency:"USD", maximumFractionDigits:0 }).format(n); }
    catch { return `$${Math.round(n)}`; }
  }
  function fmtScore(n){
    return (Math.round(n * 100) / 100).toFixed(2);
  }
  function fmtDate(iso){
    // iso = YYYY-MM-DD
    const [y,m,d] = iso.split("-").map(x=>parseInt(x,10));
    const dt = new Date(y, (m-1), d);
    try { return dt.toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" }); }
    catch { return iso; }
  }

  async function copyText(text){
    try{
      await navigator.clipboard.writeText(text);
      toast("Copied to clipboard");
    }catch{
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast("Copied to clipboard");
    }
  }

  // ---------- Toast ----------
  let toastTimer = null;
  function toast(msg){
    let el = $("#toast");
    if (!el){
      el = document.createElement("div");
      el.id = "toast";
      el.style.position = "fixed";
      el.style.left = "50%";
      el.style.bottom = "22px";
      el.style.transform = "translateX(-50%)";
      el.style.zIndex = "50";
      el.style.padding = "12px 14px";
      el.style.borderRadius = "999px";
      el.style.border = "1px solid rgba(255,255,255,.14)";
      el.style.background = "rgba(0,0,0,.35)";
      el.style.backdropFilter = "blur(14px)";
      el.style.color = "rgba(255,255,255,.92)";
      el.style.boxShadow = "0 18px 55px rgba(0,0,0,.45)";
      el.style.fontFamily = "Manrope, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      el.style.fontWeight = "800";
      el.style.letterSpacing = ".01em";
      el.style.opacity = "0";
      el.style.transition = "opacity .35s cubic-bezier(.2,.9,.2,1), transform .35s cubic-bezier(.2,.9,.2,1)";
      el.style.pointerEvents = "none";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    el.style.transform = "translateX(-50%) translateY(-2px)";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateX(-50%) translateY(4px)";
    }, 1800);
  }

  // ---------- Modals (accessible-ish) ----------
  const modalState = {
    openId: null,
    lastActive: null
  };

  function openModal(id){
    const overlay = document.getElementById(id);
    if (!overlay) return;
    modalState.lastActive = document.activeElement;
    modalState.openId = id;

    overlay.setAttribute("data-open","true");
    overlay.setAttribute("aria-hidden","false");

    // focus first focusable
    const focusables = getFocusable(overlay);
    if (focusables.length) focusables[0].focus({ preventScroll: true });

    document.body.style.overflow = "hidden";
  }

  function closeModal(id){
    const overlay = document.getElementById(id);
    if (!overlay) return;

    overlay.removeAttribute("data-open");
    overlay.setAttribute("aria-hidden","true");

    modalState.openId = null;
    document.body.style.overflow = "";

    // restore focus
    if (modalState.lastActive && typeof modalState.lastActive.focus === "function"){
      modalState.lastActive.focus({ preventScroll: true });
    }
  }

  function getFocusable(root){
    return $$(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      root
    ).filter(el => !el.hasAttribute("disabled") && el.offsetParent !== null);
  }

  // ESC closes modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalState.openId){
      closeModal(modalState.openId);
    }
    // basic focus trap
    if (e.key === "Tab" && modalState.openId){
      const overlay = document.getElementById(modalState.openId);
      const f = getFocusable(overlay);
      if (!f.length) return;
      const first = f[0], last = f[f.length-1];
      if (e.shiftKey && document.activeElement === first){
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last){
        e.preventDefault(); first.focus();
      }
    }
  });

  // close buttons + click outside
  document.addEventListener("click", (e) => {
    const closeBtn = e.target.closest("[data-close]");
    if (closeBtn){
      const id = closeBtn.getAttribute("data-close");
      closeModal(id);
      return;
    }
    const overlay = e.target.classList && e.target.classList.contains("modalOverlay") ? e.target : null;
    if (overlay && overlay.getAttribute("data-open") === "true"){
      closeModal(overlay.id);
    }
  });

  // expose for debugging (and your earlier “openModal not found” issue)
  window.openModal = openModal;
  window.closeModal = closeModal;

  // ---------- Cards fan (drag/swipe) ----------
  function renderCards(cards){
    const fan = $("#cardsFan");
    fan.innerHTML = "";

    cards.forEach((c, i) => {
      const el = document.createElement("div");
      el.className = "card";
      el.dataset.index = String(i);

      const img = document.createElement("img");
      img.src = c.image;
      img.alt = c.label || `Card ${i+1}`;
      img.loading = "lazy";

      const label = document.createElement("div");
      label.className = "cardLabel";
      label.innerHTML = `<span class="spark" aria-hidden="true"></span><span>${escapeHtml(c.label || "Moment")}</span>`;

      el.appendChild(img);
      el.appendChild(label);
      fan.appendChild(el);
    });

    let active = Math.floor(cards.length / 2);
    layoutFan(active);

    // tap card to bring forward
    fan.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;
      active = parseInt(card.dataset.index, 10);
      layoutFan(active);
    });

    // drag/swipe
    let down = false;
    let startX = 0;
    let moved = false;

    const onDown = (clientX) => {
      down = true;
      moved = false;
      startX = clientX;
    };
    const onMove = (clientX) => {
      if (!down) return;
      const dx = clientX - startX;
      if (Math.abs(dx) > 18) moved = true;
      // subtle tilt while dragging
      fan.style.transform = `translateZ(0) rotateY(${clamp(dx / 80, -6, 6)}deg)`;
    };
    const onUp = (clientX) => {
      if (!down) return;
      down = false;
      fan.style.transform = "";
      const dx = clientX - startX;

      if (moved){
        if (dx < -40) active = clamp(active + 1, 0, cards.length - 1);
        if (dx > 40) active = clamp(active - 1, 0, cards.length - 1);
        layoutFan(active);
      }
    };

    fan.addEventListener("pointerdown", (e) => {
      fan.setPointerCapture(e.pointerId);
      onDown(e.clientX);
    });
    fan.addEventListener("pointermove", (e) => onMove(e.clientX));
    fan.addEventListener("pointerup", (e) => onUp(e.clientX));
    fan.addEventListener("pointercancel", (e) => onUp(e.clientX));

    // hover tilt (desktop)
    fan.addEventListener("mousemove", (e) => {
      if (reduceMotion) return;
      const r = fan.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width - 0.5;
      const cy = (e.clientY - r.top) / r.height - 0.5;
      fan.style.transform = `translateZ(0) rotateY(${cx * 6}deg) rotateX(${(-cy) * 4}deg)`;
    });
    fan.addEventListener("mouseleave", () => { fan.style.transform = ""; });

    function layoutFan(activeIndex){
      const els = $$(".card", fan);
      const spread = 16; // degrees
      const xStep = 48;  // px
      const zStep = 60;

      els.forEach((el) => {
        const i = parseInt(el.dataset.index, 10);
        const off = i - activeIndex;

        const rot = off * spread * 0.75;
        const tx = off * xStep;
        const ty = Math.abs(off) * 8;
        const scale = off === 0 ? 1.04 : 0.92;
        const z = 400 - Math.abs(off) * zStep;

        el.style.zIndex = String(100 - Math.abs(off));
        el.style.opacity = Math.abs(off) > 3 ? "0" : "1";
        el.style.transform = `translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg) scale(${scale}) translateZ(0)`;
        el.style.filter = off === 0 ? "brightness(1.02) saturate(1.05)" : "brightness(.92) saturate(.96)";
      });
    }
  }

  // ---------- Events ----------
  let chart = null;

  function calcStats(scores){
    const vals = scores.map(s => s.score);
    const a = avg(vals);
    const last = vals.length ? vals[vals.length - 1] : 0;
    const best = vals.length ? Math.max(...vals) : 0;
    return { a, last, best };
  }

  function renderEvents(events){
    const grid = $("#eventGrid");
    grid.innerHTML = "";

    events.forEach(evt => {
      const stats = calcStats(evt.scores);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "eventBtn";
      btn.dataset.event = evt.id;

      btn.innerHTML = `
        <div>
          <div class="eventName">${escapeHtml(evt.name)}</div>
          <div class="eventMeta">${evt.scores.length} meets • avg ${fmtScore(stats.a)}</div>
        </div>
        <div class="eventScore">${fmtScore(stats.last)}</div>
      `;

      btn.addEventListener("click", () => openEvent(evt));
      grid.appendChild(btn);
    });
  }

  function openEvent(evt){
    $("#eventTitle").textContent = evt.name;

    const stats = calcStats(evt.scores);
    $("#eventAvg").textContent = fmtScore(stats.a);
    $("#eventLast").textContent = fmtScore(stats.last);
    $("#eventBest").textContent = fmtScore(stats.best);

    // list
    const list = $("#meetList");
    list.innerHTML = evt.scores.slice().reverse().map(s => `
      <div class="meetRow">
        <div class="meetLeft">
          <div class="meetName">${escapeHtml(s.meet)}</div>
          <div class="meetDate">${escapeHtml(fmtDate(s.date))}</div>
        </div>
        <div class="meetScore">${fmtScore(s.score)}</div>
      </div>
    `).join("");

    // chart
    const labels = evt.scores.map(s => fmtDate(s.date));
    const data = evt.scores.map(s => s.score);

    const ctx = $("#eventScoreChart").getContext("2d");
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: evt.name,
          data,
          tension: 0.35,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => ` ${fmtScore(item.parsed.y)}`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: "rgba(255,255,255,.65)" },
            grid: { color: "rgba(255,255,255,.08)" }
          },
          y: {
            ticks: { color: "rgba(255,255,255,.65)" },
            grid: { color: "rgba(255,255,255,.08)" }
          }
        }
      }
    });

    openModal("eventModal");
  }

  // ---------- Sponsors ----------
  function renderSponsors(sponsors){
    const strip = $("#sponsorStrip");
    const grid = $("#sponsorGrid");
    strip.innerHTML = "";
    grid.innerHTML = "";

    sponsors.forEach(sp => {
      // rail logo
      const logo = document.createElement("div");
      logo.className = "sLogo";
      logo.title = sp.name;
      logo.innerHTML = `<img src="${sp.logo}" alt="${escapeHtml(sp.name)}" loading="lazy">`;
      logo.addEventListener("click", () => safeOpen(sp.url));
      strip.appendChild(logo);

      // modal card
      const card = document.createElement("div");
      card.className = "sponsorCard";
      card.innerHTML = `
        <div class="sponsorThumb"><img src="${sp.logo}" alt="${escapeHtml(sp.name)}" loading="lazy"></div>
        <div class="sponsorInfo">
          <div class="sponsorName">${escapeHtml(sp.name)}</div>
          <div class="sponsorTag">${escapeHtml(sp.tagline || "Sponsor")}</div>
        </div>
      `;
      card.addEventListener("click", () => safeOpen(sp.url));
      grid.appendChild(card);
    });
  }

  function safeOpen(url){
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // ---------- Bio ----------
  function renderBio(data){
    const a = data.athlete;

    $("#athleteFirstName").textContent = a.firstName || "First";
    $("#athleteLastName").textContent = a.lastName || "Last";
    $("#athleteTeam").textContent = a.team || "Team";
    $("#athleteDiscipline").textContent = a.discipline || "Sport";

    document.title = `${a.firstName || "Athlete"} ${a.lastName || ""} · Digital Athlete Card`.trim();

    $("#bioTitle").textContent = `${a.firstName || ""} ${a.lastName || ""}`.trim();
    $("#goalSubtitle").textContent = (data.fundraising && data.fundraising.subtitle) ? data.fundraising.subtitle : "Support the season.";
    $("#microNoteText").textContent = a.headline || "Live updates: scores • meets • sponsors";

    // badges in bio
    $("#bioBadges").innerHTML = `
      <span class="metaPill">${escapeHtml(a.team || "Team")}</span>
      <span class="metaPill soft">${escapeHtml(a.discipline || "Sport")}</span>
    `;

    // photo
    const heroPhoto = a.heroCardPhoto || (data.cards && data.cards[0] && data.cards[0].image) || "";
    const bioPhoto = $("#bioPhoto");
    bioPhoto.style.background = heroPhoto
      ? `url("${heroPhoto}") center/cover no-repeat`
      : "rgba(255,255,255,.06)";

    // quick facts
    const quick = $("#bioQuick");
    quick.innerHTML = (a.quickFacts || []).map(q => `
      <div class="quickRow">
        <div class="quickLabel">${escapeHtml(q.label)}</div>
        <div class="quickValue">${escapeHtml(q.value)}</div>
      </div>
    `).join("");

    // story
    const story = $("#bioStory");
    story.innerHTML = (a.story || []).map(p => `<p style="margin:0 0 10px">${escapeHtml(p)}</p>`).join("") +
      `<p style="margin:0;color:rgba(255,255,255,.72);font-size:12px">Thank you for supporting the journey.</p>`;

    // links
    const links = $("#bioLinks");
    links.innerHTML = "";
    (a.links || []).forEach(l => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.innerHTML = `<span class="chip-icon" aria-hidden="true">↗</span><span>${escapeHtml(l.label)}</span>`;
      btn.addEventListener("click", () => safeOpen(l.url));
      links.appendChild(btn);
    });
  }

  // ---------- Fundraising ----------
  function renderFundraising(data){
    const f = data.fundraising || { goalAmount: 0, raisedAmount: 0 };
    const goal = Number(f.goalAmount || 0);
    const raised = Number(f.raisedAmount || 0);
    const pct = goal > 0 ? clamp((raised / goal) * 100, 0, 100) : 0;

    $("#goalPill").textContent = `${fmtMoney(raised)} / ${fmtMoney(goal)}`;
    $("#progressBar").style.width = `${pct}%`;
  }

  // ---------- Buttons / Share ----------
  function wireActions(data){
    const shareUrl = data.athlete && data.athlete.shareUrl ? data.athlete.shareUrl : window.location.href;

    $("#btnCopyLink").addEventListener("click", () => copyText(shareUrl));
    $("#ctaShare").addEventListener("click", async () => {
      const payload = { title: document.title, text: "Check out this athlete’s season page:", url: shareUrl };
      if (navigator.share){
        try { await navigator.share(payload); }
        catch { /* user canceled */ }
      } else {
        copyText(shareUrl);
      }
    });

    const donateUrl = data.athlete && data.athlete.donateUrl ? data.athlete.donateUrl : "";
    $("#ctaDonate").addEventListener("click", () => {
      if (!donateUrl){
        toast("Add a donateUrl in data/athlete.json");
        return;
      }
      safeOpen(donateUrl);
    });

    $("#openBioModal").addEventListener("click", () => openModal("bioModal"));

    $("#btnOpenSponsors").addEventListener("click", () => openModal("sponsorsModal"));
    $("#btnOpenAbout").addEventListener("click", () => openModal("aboutModal"));

    $("#btnReduceMotion").addEventListener("click", () => {
      reduceMotion = !reduceMotion;
      try { localStorage.setItem("dac_reduce_motion", reduceMotion ? "1" : "0"); } catch {}
      toast(reduceMotion ? "Reduced motion enabled" : "Reduced motion disabled");
    });
  }

  // ---------- Canvas FX (mouse reactive particles + constellation + bloom-ish) ----------
  function startFx(){
    const canvas = $("#fx-canvas");
    const ctx = canvas.getContext("2d", { alpha: true });

    let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const mouse = { x: 0, y: 0, vx: 0, vy: 0, active: false };
    let lastT = performance.now();

    function resize(){
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    window.addEventListener("resize", resize);
    resize();

    // build particles
    const count = clamp(Math.floor((w*h) / 18000), 45, 120);
    const p = new Array(count).fill(0).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: 1.2 + Math.random() * 1.9,
      a: 0.18 + Math.random() * 0.22,
      hue: 200 + Math.random()*120
    }));

    function onMove(e){
      mouse.active = true;
      mouse.vx = e.clientX - mouse.x;
      mouse.vy = e.clientY - mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", (e) => {
      if (!e.touches || !e.touches[0]) return;
      onMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    }, { passive: true });

    function step(t){
      const dt = Math.min(32, t - lastT);
      lastT = t;

      ctx.clearRect(0,0,w,h);

      if (reduceMotion){
        // keep a minimal glow so it still looks premium
        drawConstellation(0.55);
        requestAnimationFrame(step);
        return;
      }

      // update particles
      for (const s of p){
        // subtle drift
        s.x += s.vx * dt;
        s.y += s.vy * dt;

        // wrap
        if (s.x < -20) s.x = w + 20;
        if (s.x > w + 20) s.x = -20;
        if (s.y < -20) s.y = h + 20;
        if (s.y > h + 20) s.y = -20;

        // mouse attraction (soft)
        if (mouse.active){
          const dx = mouse.x - s.x;
          const dy = mouse.y - s.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 220){
            const pull = (1 - dist/220) * 0.0009 * dt;
            s.vx += dx * pull;
            s.vy += dy * pull;
          }
        }

        // damp velocity to keep it elegant
        s.vx *= 0.995;
        s.vy *= 0.995;
      }

      // draw
      drawConstellation(1);

      requestAnimationFrame(step);
    }

    function drawConstellation(opacityMult){
      // soft bloom-ish: draw twice with blur-like technique (bigger alpha, then crisp)
      // (still 2D canvas, but looks cinematic)
      drawPass(1, 1.8, 0.35 * opacityMult);
      drawPass(0, 1.0, 1.0 * opacityMult);
    }

    function drawPass(blur, sizeMult, alphaMult){
      // points
      for (const s of p){
        const a = s.a * alphaMult;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${s.hue}, 90%, 75%, ${a})`;
        ctx.arc(s.x, s.y, s.r * sizeMult, 0, Math.PI*2);
        ctx.fill();
      }

      // links
      const maxD = 130;
      for (let i=0;i<p.length;i++){
        for (let j=i+1;j<p.length;j++){
          const a = p[i], b = p[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx,dy);
          if (d < maxD){
            const t = 1 - d/maxD;
            ctx.strokeStyle = `rgba(255,255,255,${(0.08 * t) * alphaMult})`;
            ctx.lineWidth = (blur ? 1.6 : 1.0) * sizeMult;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // mouse sparkle burst
      if (mouse.active){
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,179,224,${0.10 * alphaMult})`;
        ctx.arc(mouse.x, mouse.y, 70 * sizeMult, 0, Math.PI*2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(125,211,255,${0.08 * alphaMult})`;
        ctx.arc(mouse.x + mouse.vx * 0.2, mouse.y + mouse.vy * 0.2, 60 * sizeMult, 0, Math.PI*2);
        ctx.fill();
      }
    }

    requestAnimationFrame(step);
  }

  // ---------- Wiring ----------
  function escapeHtml(s){
    return String(s ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  // ---------- Init ----------
  loadData().then((data) => {
    renderBio(data);
    renderFundraising(data);
    renderCards(data.cards || []);
    renderEvents(data.events || []);
    renderSponsors(data.sponsors || []);
    wireActions(data);
    startFx();

    // default: clicking an event bubble feels instant
    // auto-open “All Around” if you want:
    // const aa = (data.events || []).find(e=>e.id==="allAround");
    // if (aa) openEvent(aa);
  }).catch((err) => {
    console.error(err);
    toast("Setup error: check console + data/athlete.json");
  });

})();
