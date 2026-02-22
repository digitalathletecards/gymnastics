const $ = (sel, root=document) => root.querySelector(sel);

const state = { data: null };

function clamp01(x){ return Math.max(0, Math.min(1, x)); }
function money(n, currency="USD"){
  try{
    return new Intl.NumberFormat("en-US", { style:"currency", currency }).format(n);
  }catch{
    return `$${Number(n).toFixed(0)}`;
  }
}
function escapeHTML(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function escapeAttr(s){
  return escapeHTML(s).replaceAll("`","&#096;");
}
function safeOpen(url){
  if(!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

/* ---------- Mobile-safe viewport height ---------- */
function setVH(){
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

/* ---------- Cursor spotlights ---------- */
function bindSpotlights(){
  const cards = Array.from(document.querySelectorAll(".fxCard"));
  cards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    }, { passive:true });
  });
}

/* ---------- Modal System (hardened) ---------- */
function ensureModalHost(){
  const host = $("#modalHost");
  if(!host){
    alert("Modal host missing. Make sure index.html includes #modalHost at the end of <body>.");
    throw new Error("modalHost missing");
  }
  return host;
}

function openModal(title, bodyHTML){
  const host = ensureModalHost();
  const backdrop = $("#modalBackdrop");
  const closeBtn = $("#modalClose");

  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = bodyHTML;

  host.classList.add("isOpen");
  host.setAttribute("aria-hidden", "false");

  // extra hardening:
  host.style.display = "block";
  host.style.pointerEvents = "auto";

  const close = () => closeModal();
  backdrop.onclick = close;
  closeBtn.onclick = close;

  window.addEventListener("keydown", function esc(e){
    if(e.key === "Escape") closeModal();
    else window.addEventListener("keydown", esc, { once:true });
  }, { once:true });

  attachBrandMarkTilt();
}

function closeModal(){
  const host = $("#modalHost");
  if(!host) return;
  host.classList.remove("isOpen");
  host.setAttribute("aria-hidden", "true");
  host.style.display = "";
  host.style.pointerEvents = "";
  $("#modalBody").innerHTML = "";
}

/* ---------- Share ---------- */
function buildShareLinks(publicUrl, title){
  const url = encodeURIComponent(publicUrl);
  const text = encodeURIComponent(`${title} — Support & share the journey: ${publicUrl}`);
  return [
    { label: "💬 Text", hint: "Send via SMS", href: `sms:?&body=${text}` },
    { label: "💚 WhatsApp", hint: "Share to chats", href: `https://wa.me/?text=${text}` },
    { label: "📘 Facebook", hint: "Post to feed", href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
    { label: "✉️ Email", hint: "Sponsor outreach", href: `mailto:?subject=${encodeURIComponent(title)}&body=${text}` },
    { label: "📸 Instagram", hint: "Copy link + open IG", href: `https://www.instagram.com/` },
    { label: "𝕏 X (Twitter)", hint: "Post on X", href: `https://twitter.com/intent/tweet?text=${text}` }
  ];
}

async function copyToClipboard(text){
  try{
    await navigator.clipboard.writeText(text);
    toast("Link copied ✨");
  }catch{
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    toast("Link copied ✨");
  }
}

/* ---------- Toast ---------- */
let toastTimer = null;
function toast(msg){
  let el = $("#__toast");
  if(!el){
    el = document.createElement("div");
    el.id = "__toast";
    Object.assign(el.style, {
      position:"fixed",
      left:"50%",
      bottom:"18px",
      transform:"translateX(-50%)",
      padding:"10px 12px",
      borderRadius:"999px",
      border:"1px solid rgba(255,255,255,.12)",
      background:"rgba(18,20,32,.72)",
      backdropFilter:"blur(14px)",
      color:"rgba(255,255,255,.92)",
      fontWeight:"900",
      letterSpacing:".01em",
      boxShadow:"0 18px 50px rgba(0,0,0,.55)",
      zIndex:"100000",
      opacity:"0",
      transition:"opacity .2s ease, transform .2s ease"
    });
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = "1";
  el.style.transform = "translateX(-50%) translateY(-2px)";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateX(-50%) translateY(6px)";
  }, 1400);
}

/* ---------- Data ---------- */
async function loadData(){
  const res = await fetch("data/athlete.json", { cache: "no-store" });
  if(!res.ok) throw new Error("Failed to load data/athlete.json");
  const json = await res.json();
  return json.athlete;
}

/* ---------- Modals ---------- */
function openBioModal(){
  const a = state.data;
  const lines = (a.bio || []).map(p => `<p>${escapeHTML(p)}</p>`).join("");
  openModal("Athlete Bio", `
    <div class="modalSection">
      <h3>${escapeHTML(a.name)}</h3>
      <p><strong>${escapeHTML(a.club)}</strong> · ${escapeHTML(a.sport)} · Age ${escapeHTML(String(a.age ?? ""))}</p>
    </div>
    <div class="modalSection">
      <h3>About</h3>
      ${lines || "<p>Bio coming soon.</p>"}
    </div>
    <div class="modalSection">
      <h3>Support</h3>
      <p>Every sponsor helps cover coaching, meet fees, travel, and training—so the athlete can focus on growth and confidence.</p>
      <div class="modalActions">
        <button class="btn btn--primary" type="button" id="bioDonateBtn">Support / Donate</button>
        <button class="btn btn--ghost" type="button" id="bioCopyBtn">Copy Link</button>
      </div>
    </div>
  `);

  $("#bioDonateBtn").onclick = () => safeOpen(a.fundraising?.ctaUrl);
  $("#bioCopyBtn").onclick = () => copyToClipboard(a.share?.publicUrl || location.href);
}

function openSponsorModal(){
  openModal("Become a Sponsor", `
    <div class="modalSection">
      <h3>Why sponsor?</h3>
      <p>Sponsorship helps families cover the season—travel, coaching, meet fees—and it puts your business in front of a community that loves to support local.</p>
    </div>
    <div class="modalSection">
      <h3>Fast option</h3>
      <p>Tap “Share” and send this card to 3 potential sponsors. It’s the simplest way to fund the season.</p>
      <div class="modalActions">
        <button class="btn btn--primary" type="button" id="sponsorShareBtn">Open Share Options</button>
        <button class="btn btn--ghost" type="button" id="sponsorCopyBtn">Copy Link</button>
      </div>
    </div>
  `);
  const a = state.data;
  $("#sponsorShareBtn").onclick = () => openShareModal();
  $("#sponsorCopyBtn").onclick = () => copyToClipboard(a.share?.publicUrl || location.href);
}

function openShareModal(){
  const a = state.data;
  const publicUrl = a.share?.publicUrl || location.href;
  const title = `${a.name} · ${a.club}`;
  const links = buildShareLinks(publicUrl, title);

  const htmlLinks = links.map(x => `
    <a class="shareLink" href="${escapeAttr(x.href)}" target="_blank" rel="noopener noreferrer">
      <div>
        <div class="shareLink__label">${escapeHTML(x.label)}</div>
        <div class="shareLink__hint">${escapeHTML(x.hint)}</div>
      </div>
      <div class="pill">↗</div>
    </a>
  `).join("");

  openModal("Share via", `
    <div class="modalSection">
      <h3>Copy link</h3>
      <p>Share this card with family & sponsors in seconds.</p>
      <div class="modalActions">
        <button class="btn btn--primary" type="button" id="copyShareLinkBtn">Copy Link</button>
        <button class="btn btn--ghost" type="button" id="openDonateBtn">Open Support</button>
      </div>
    </div>

    <div class="modalSection">
      <h3>Social & Messaging</h3>
      <div class="shareGrid">${htmlLinks}</div>
      <p style="margin-top:10px;color:rgba(255,255,255,.70);font-size:13px;">
        Tip: For Instagram, copy the link above and paste it into your Story or bio.
      </p>
    </div>
  `);

  $("#copyShareLinkBtn").onclick = () => copyToClipboard(publicUrl);
  $("#openDonateBtn").onclick = () => safeOpen(a.fundraising?.ctaUrl);
}

function openBuiltModal(){
  openModal("Built to be shared", `
    <div class="brandMark" aria-label="Senxia">
      <div class="brandMark__halo"></div>
      <div class="brandMark__card">
        <img class="brandMark__img" src="assets/brand/Senxia.png" alt="SENXIA" loading="lazy" decoding="async" />
      </div>
      <div class="brandMark__tag">Powered by SENXIA</div>
    </div>

    <div class="modalSection">
      <h3>Parents love it</h3>
      <p>A single link that makes it effortless to keep everyone updated — meets, photos, milestones — while turning support into real funding with one share.</p>
    </div>

    <div class="modalSection">
      <h3>Sponsors get clarity</h3>
      <p>Businesses see the story, the goal, and the impact — with sponsor logos, links, and quick share buttons that drive action.</p>
    </div>

    <div class="modalSection">
      <h3>Launch your custom card</h3>
      <p>“Showcase the Journey” custom cards starting at <strong>$199.99</strong>. Premium design, easy sharing, sponsor-ready.</p>
      <div class="modalActions">
        <button class="btn btn--primary" type="button" id="showcaseBtn">Showcase the Journey</button>
        <button class="btn btn--ghost" type="button" id="shareFromBuiltBtn">Share This Card</button>
      </div>
    </div>
  `);

  $("#showcaseBtn").onclick = () => safeOpen("https://example.com/showcase");
  $("#shareFromBuiltBtn").onclick = () => openShareModal();
}

/* ---------- Image Modal ---------- */
function openImageModal(item, index, total){
  openModal(`Photo ${index}/${total}`, `
    <div class="modalSection">
      <h3>${escapeHTML(item.title || "Photo")}</h3>
      <p>${escapeHTML(item.tag || "Moment")}</p>
    </div>
    <div class="modalSection">
      <img class="zoomImg" src="${escapeAttr(item.src)}" alt="${escapeAttr(item.title || "Photo")}" />
    </div>
  `);
}

/* ---------- SENXIA Tilt ---------- */
function attachBrandMarkTilt(){
  const card = document.querySelector(".brandMark__card");
  if(!card) return;
  if(card.dataset.tiltBound === "1") return;
  card.dataset.tiltBound = "1";

  const strength = 9;
  const onMove = (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -strength;
    const ry = (px - 0.5) * strength;
    card.style.transform = `translateY(-2px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  };
  const onLeave = () => { card.style.transform = ""; };

  card.addEventListener("mousemove", onMove, { passive:true });
  card.addEventListener("mouseleave", onLeave, { passive:true });
}

/* ---------- FX Background ---------- */
function startFX(){
  const c = $("#fx");
  if(!c) return;
  const ctx = c.getContext("2d", { alpha: true });

  let w=0,h=0, dpr=1;
  const particles = [];
  const N = 70;

  const resize = () => {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = c.clientWidth = window.innerWidth;
    h = c.clientHeight = window.innerHeight;
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  window.addEventListener("resize", resize, { passive:true });
  resize();

  const rand = (a,b) => a + Math.random()*(b-a);

  for(let i=0;i<N;i++){
    particles.push({ x: rand(0,w), y: rand(0,h), r: rand(0.7, 2.1), vx: rand(-0.18, 0.18), vy: rand(-0.10, 0.22), a: rand(0.08, 0.22) });
  }

  function frame(){
    ctx.clearRect(0,0,w,h);

    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x < -20) p.x = w + 20;
      if(p.x > w + 20) p.x = -20;
      if(p.y < -20) p.y = h + 20;
      if(p.y > h + 20) p.y = -20;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(180, 220, 255, ${p.a})`;
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- Render ---------- */
function render(){
  const a = state.data;
  document.title = `${a.name} · ${a.club}`;

  $("#athleteName").textContent = a.name;
  $("#clubBadge").textContent = a.club;
  $("#sportBadge").textContent = a.sport;
  $("#tierBadge").textContent = a.tierLabel || "🏅 Sponsor";

  const img = $("#athletePhoto");
  img.src = a.photo || "";
  img.alt = `${a.name} photo`;

  // Fund
  const f = a.fundraising;
  $("#fundTitle").textContent = f.title;
  $("#fundNumbers").textContent = `${money(f.raised, f.currency)} / ${money(f.goal, f.currency)}`;

  const pct = clamp01(f.goal ? (f.raised / f.goal) : 0);
  const pctLabel = Math.round(pct * 100);
  $("#meterBar").style.width = `${pctLabel}%`;
  $("#fundNote").textContent = `${a.name.split(" ")[0]} is ${pctLabel}% to the season goal! Help finish strong 💕`;

  // Chips
  const chips = $("#shareChips");
  chips.innerHTML = "";
  ["💬 Text","💚 WhatsApp","📘 Facebook","✉️ Email","📸 Instagram","𝕏 X"].forEach(t=>{
    const s = document.createElement("span");
    s.className = "chip";
    s.textContent = t;
    chips.appendChild(s);
  });

  // Sponsors
  const grid = $("#sponsorGrid");
  grid.innerHTML = "";
  (a.sponsors || []).forEach(sp => {
    const link = document.createElement("a");
    link.className = "sponsor";
    link.href = sp.url || "#";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    link.innerHTML = `
      <div class="sponsor__logo">
        ${sp.image ? `<img src="${escapeAttr(sp.image)}" alt="${escapeAttr(sp.name || "Sponsor")}" loading="lazy" decoding="async" />` : ""}
      </div>
      <div>
        <div class="sponsor__name">${escapeHTML(sp.name || "Sponsor")}</div>
        <div class="sponsor__tier">${escapeHTML(sp.tier ? `${sp.tier} Sponsor` : "Sponsor")}</div>
      </div>
    `;
    grid.appendChild(link);
  });

  // Stats
  const statsGrid = $("#statsGrid");
  statsGrid.innerHTML = "";
  (a.stats || []).forEach(s => {
    const el = document.createElement("div");
    el.className = "stat";
    el.innerHTML = `<div class="stat__k">${escapeHTML(s.label || "")}</div><div class="stat__v">${escapeHTML(s.value || "")}</div>`;
    statsGrid.appendChild(el);
  });

  // Journey
  const timeline = $("#timeline");
  timeline.innerHTML = "";
  (a.journey || []).forEach(ev => {
    const el = document.createElement("div");
    el.className = "event";
    el.innerHTML = `
      <div class="event__top">
        <div class="event__title">${escapeHTML(ev.title || "Update")}</div>
        <div class="event__date">${escapeHTML(ev.date || "")}</div>
      </div>
      <div class="event__desc">${escapeHTML(ev.desc || "")}</div>
    `;
    timeline.appendChild(el);
  });

  // Upcoming
  const upcoming = $("#upcomingList");
  upcoming.innerHTML = "";
  (a.upcoming || []).forEach(u => {
    const el = document.createElement("div");
    el.className = "rowCard";
    el.innerHTML = `
      <div class="rowCard__top">
        <div class="rowCard__title">${escapeHTML(u.title || "")}</div>
        <div class="rowCard__meta">${escapeHTML(u.date || "")}</div>
      </div>
      <div class="rowCard__desc">${escapeHTML(u.desc || "")}</div>
    `;
    upcoming.appendChild(el);
  });

  // Achievements
  const ach = $("#achList");
  ach.innerHTML = "";
  (a.achievements || []).forEach(x => {
    const el = document.createElement("div");
    el.className = "rowCard";
    el.innerHTML = `
      <div class="rowCard__top">
        <div class="rowCard__title">${escapeHTML(x.title || "")}</div>
        <div class="rowCard__meta">${escapeHTML(x.date || "")}</div>
      </div>
      <div class="rowCard__desc">${escapeHTML(x.desc || "")}</div>
    `;
    ach.appendChild(el);
  });

  // Gallery
  const gallery = $("#galleryGrid");
  gallery.innerHTML = "";
  const g = (a.gallery || []);
  $("#gallerySub").textContent = g.length ? "Highlights from training + meets." : "Add photo cards in data/athlete.json.";
  g.forEach((it, idx) => {
    const card = document.createElement("div");
    card.className = "gCard";
    card.innerHTML = `
      <img src="${escapeAttr(it.src)}" alt="${escapeAttr(it.title || "Photo")}" loading="lazy" decoding="async" />
      <div class="gCard__cap">
        <b>${escapeHTML(it.title || "Photo")}</b>
        <span>${escapeHTML(it.tag || "Moment")}</span>
      </div>
    `;
    card.addEventListener("click", () => openImageModal(it, idx+1, g.length));
    gallery.appendChild(card);
  });

  // Buttons
  $("#donateBtn").onclick = () => safeOpen(f.ctaUrl);
  $("#supportBtn").onclick = () => safeOpen(f.ctaUrl);

  // Bind modal openers
  $("#bioBtn").onclick = () => openBioModal();
  $("#bioBtnPhoto").onclick = () => openBioModal();
  $("#becomeSponsorBtn").onclick = () => openSponsorModal();
  $("#shareBtn").onclick = () => openShareModal();
  $("#openShareModalBtn").onclick = () => openShareModal();
  $("#builtBtn").onclick = () => openBuiltModal();

  $("#copyLinkBtn").onclick = () => copyToClipboard(a.share?.publicUrl || location.href);

  bindSpotlights();
  requestAnimationFrame(() => document.body.classList.add("isLoaded"));
}

/* ---------- Boot ---------- */
(async function init(){
  setVH();
  window.addEventListener("resize", setVH, { passive:true });

  startFX();
  state.data = await loadData();
  render();
})();
