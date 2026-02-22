/* ✨ Digital Athlete Card — Cotton Candy Dream Edition
   - Pink / lavender constellation particles (mouse reactive)
   - Floating hearts, stars, sparkles background
   - Data-driven cards / events / sponsors
   - Accessible modals (ESC, click-outside, focus trap)
   - Chart.js with pink theme
*/

(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  // ---------- Global toggles ----------
  let reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  try {
    const saved = localStorage.getItem("dac_reduce_motion");
    if (saved !== null) reduceMotion = saved === "1";
  } catch {}

  // ---------- Load data ----------
  async function loadData() {
    const res = await fetch("data/athlete.json", { cache:"no-store" });
    if (!res.ok) throw new Error("Failed to load data/athlete.json");
    return res.json();
  }

  // ---------- Utilities ----------
  function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
  function avg(arr){ return arr.length ? arr.reduce((s,x)=>s+x,0)/arr.length : 0; }
  function fmtMoney(n){
    try{ return new Intl.NumberFormat(undefined,{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n); }
    catch{ return `$${Math.round(n)}`; }
  }
  function fmtScore(n){ return (Math.round(n*100)/100).toFixed(2); }
  function fmtDate(iso){
    const [y,m,d] = iso.split("-").map(x=>parseInt(x,10));
    const dt = new Date(y,(m-1),d);
    try{ return dt.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"}); }
    catch{ return iso; }
  }
  async function copyText(text){
    try{ await navigator.clipboard.writeText(text); toast("✨ Copied to clipboard!"); }
    catch{
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); ta.remove();
      toast("✨ Copied to clipboard!");
    }
  }

  // ---------- Toast ----------
  let toastTimer = null;
  function toast(msg){
    let el = $("#toast");
    if(!el){
      el = document.createElement("div");
      el.id = "toast";
      Object.assign(el.style, {
        position:"fixed", left:"50%", bottom:"22px",
        transform:"translateX(-50%)",
        zIndex:"50", padding:"12px 20px",
        borderRadius:"999px",
        border:"1.5px solid rgba(255,110,180,.35)",
        background:"rgba(26,8,24,.85)",
        backdropFilter:"blur(18px)",
        color:"rgba(255,240,247,.95)",
        boxShadow:"0 14px 50px rgba(200,0,80,.35), 0 0 30px rgba(255,110,180,.20)",
        fontFamily:"'Fredoka One', cursive",
        fontSize:"14px",
        letterSpacing:".02em",
        opacity:"0",
        transition:"opacity .35s cubic-bezier(.2,.9,.2,1), transform .35s cubic-bezier(.2,.9,.2,1)",
        pointerEvents:"none",
        whiteSpace:"nowrap"
      });
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    el.style.transform = "translateX(-50%) translateY(-3px)";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>{
      el.style.opacity = "0";
      el.style.transform = "translateX(-50%) translateY(4px)";
    }, 2000);
  }

  // ---------- Floating deco (hearts, stars, sparkles) ----------
  function startFloatingDeco(){
    if(reduceMotion) return;
    const container = $("#floatDeco");
    if(!container) return;
    const emojis = ["🌸","💕","⭐","✨","🩷","💖","🌟","🎀","💫","🩰","🌺","💗"];
    let count = 0;
    const max = 18;

    function spawnOne(){
      if(count >= max || reduceMotion) return;
      const el = document.createElement("span");
      el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      const duration = 8 + Math.random()*12;
      const delay = Math.random()*4;
      const left = Math.random()*100;
      const size = 12 + Math.random()*16;
      el.style.left = `${left}vw`;
      el.style.fontSize = `${size}px`;
      el.style.animationDuration = `${duration}s`;
      el.style.animationDelay = `${delay}s`;
      container.appendChild(el);
      count++;
      setTimeout(()=>{
        el.remove(); count--;
      }, (duration+delay)*1000+500);
    }

    // initial burst
    for(let i=0;i<12;i++) setTimeout(spawnOne, i*300);
    // keep spawning
    setInterval(()=>{ if(count < max) spawnOne(); }, 1200);
  }

  // ---------- Modals ----------
  const modalState = { openId:null, lastActive:null };

  function openModal(id){
    const overlay = document.getElementById(id);
    if(!overlay) return;
    modalState.lastActive = document.activeElement;
    modalState.openId = id;
    overlay.setAttribute("data-open","true");
    overlay.setAttribute("aria-hidden","false");
    const f = getFocusable(overlay);
    if(f.length) f[0].focus({preventScroll:true});
    document.body.style.overflow = "hidden";
  }

  function closeModal(id){
    const overlay = document.getElementById(id);
    if(!overlay) return;
    overlay.removeAttribute("data-open");
    overlay.setAttribute("aria-hidden","true");
    modalState.openId = null;
    document.body.style.overflow = "";
    if(modalState.lastActive && typeof modalState.lastActive.focus==="function"){
      modalState.lastActive.focus({preventScroll:true});
    }
  }

  function getFocusable(root){
    return $$('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',root)
      .filter(el=>!el.hasAttribute("disabled")&&el.offsetParent!==null);
  }

  document.addEventListener("keydown",(e)=>{
    if(e.key==="Escape"&&modalState.openId) closeModal(modalState.openId);
    if(e.key==="Tab"&&modalState.openId){
      const overlay = document.getElementById(modalState.openId);
      const f = getFocusable(overlay);
      if(!f.length) return;
      const first=f[0],last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey&&document.activeElement===last){ e.preventDefault(); first.focus(); }
    }
  });

  document.addEventListener("click",(e)=>{
    const cb = e.target.closest("[data-close]");
    if(cb){ closeModal(cb.getAttribute("data-close")); return; }
    const ov = e.target.classList&&e.target.classList.contains("modalOverlay")?e.target:null;
    if(ov&&ov.getAttribute("data-open")==="true") closeModal(ov.id);
  });

  window.openModal = openModal;
  window.closeModal = closeModal;

  // ---------- Cards fan (auto-rotating + lightbox) ----------
  function renderCards(cards){
    const fan = $("#cardsFan");
    fan.innerHTML = "";

    cards.forEach((c,i)=>{
      const el = document.createElement("div");
      el.className = "card";
      el.dataset.index = String(i);
      el.setAttribute("role","button");
      el.setAttribute("tabindex","0");
      el.setAttribute("aria-label", `View ${c.label||"card "+(i+1)} larger`);

      const img = document.createElement("img");
      img.src = c.image; img.alt = c.label||`Card ${i+1}`; img.loading="lazy";
      img.style.pointerEvents="none";

      const label = document.createElement("div");
      label.className = "cardLabel";
      label.style.pointerEvents="none";
      label.innerHTML = `<span class="spark" aria-hidden="true"></span><span>${escapeHtml(c.label||"Moment")}</span>`;

      el.appendChild(img); el.appendChild(label); fan.appendChild(el);
    });

    let active = 0;
    let autoTimer = null;
    let paused = false;
    let expandedIndex = null; // which card is in lightbox

    layoutFan(active);

    // ── Auto-rotate: advance every 2.5s ──
    function startAuto(){
      stopAuto();
      if(reduceMotion) return;
      autoTimer = setInterval(()=>{
        if(!paused && expandedIndex === null){
          active = (active + 1) % cards.length;
          layoutFan(active);
        }
      }, 2500);
    }
    function stopAuto(){ clearInterval(autoTimer); autoTimer=null; }

    startAuto();

    // Pause on hover/focus so user can look
    fan.addEventListener("mouseenter",()=>{ paused=true; });
    fan.addEventListener("mouseleave",()=>{ paused=false; });
    fan.addEventListener("focusin",()=>{ paused=true; });
    fan.addEventListener("focusout",()=>{ paused=false; });

    // ── Lightbox ──
    function buildLightbox(){
      if(document.getElementById("cardLightbox")) return;
      const lb = document.createElement("div");
      lb.id = "cardLightbox";
      Object.assign(lb.style,{
        position:"fixed", inset:"0", zIndex:"99",
        display:"none", alignItems:"center", justifyContent:"center",
        background:"rgba(20,4,18,.88)", backdropFilter:"blur(12px)",
        cursor:"zoom-out", padding:"20px"
      });

      const inner = document.createElement("div");
      Object.assign(inner.style,{
        position:"relative", maxWidth:"92vw", maxHeight:"88vh",
        borderRadius:"28px", overflow:"hidden",
        border:"2px solid rgba(255,110,180,.45)",
        boxShadow:"0 40px 120px rgba(200,0,80,.5), 0 0 80px rgba(255,110,180,.25)",
        animation:"lbIn .45s cubic-bezier(.34,1.56,.64,1) both"
      });

      const lbImg = document.createElement("img");
      lbImg.id = "cardLightboxImg";
      Object.assign(lbImg.style,{
        display:"block", maxWidth:"92vw", maxHeight:"88vh",
        objectFit:"contain", userSelect:"none", pointerEvents:"none"
      });

      const lbLabel = document.createElement("div");
      lbLabel.id = "cardLightboxLabel";
      Object.assign(lbLabel.style,{
        position:"absolute", bottom:"16px", left:"50%",
        transform:"translateX(-50%)",
        background:"rgba(0,0,0,.45)", backdropFilter:"blur(10px)",
        border:"1.5px solid rgba(255,110,180,.35)",
        borderRadius:"999px", padding:"8px 18px",
        color:"rgba(255,230,245,.95)", fontFamily:"'Fredoka One',cursive",
        fontSize:"15px", whiteSpace:"nowrap", pointerEvents:"none"
      });

      // Close button
      const closeBtn = document.createElement("button");
      closeBtn.innerHTML = "✕";
      Object.assign(closeBtn.style,{
        position:"absolute", top:"12px", right:"12px",
        width:"38px", height:"38px", borderRadius:"50%", border:"none",
        background:"rgba(255,110,180,.25)", color:"#fff",
        fontSize:"16px", cursor:"pointer", zIndex:"2",
        transition:"transform .2s, background .2s"
      });
      closeBtn.addEventListener("mouseenter",()=>{ closeBtn.style.background="rgba(255,110,180,.5)"; closeBtn.style.transform="scale(1.1)"; });
      closeBtn.addEventListener("mouseleave",()=>{ closeBtn.style.background="rgba(255,110,180,.25)"; closeBtn.style.transform="scale(1)"; });

      // Prev / Next arrows
      ["prev","next"].forEach(dir=>{
        const btn = document.createElement("button");
        btn.id = `lb${dir}`;
        btn.innerHTML = dir==="prev" ? "‹" : "›";
        Object.assign(btn.style,{
          position:"absolute", top:"50%",
          [dir==="prev"?"left":"right"]:"12px",
          transform:"translateY(-50%)",
          width:"44px", height:"44px", borderRadius:"50%", border:"none",
          background:"rgba(255,110,180,.22)", color:"#fff",
          fontSize:"28px", cursor:"pointer", zIndex:"2",
          transition:"transform .2s, background .2s", lineHeight:"1"
        });
        btn.addEventListener("mouseenter",()=>{ btn.style.background="rgba(255,110,180,.45)"; btn.style.transform="translateY(-50%) scale(1.12)"; });
        btn.addEventListener("mouseleave",()=>{ btn.style.background="rgba(255,110,180,.22)"; btn.style.transform="translateY(-50%) scale(1)"; });
        btn.addEventListener("click",(e)=>{
          e.stopPropagation();
          expandedIndex = dir==="prev"
            ? (expandedIndex - 1 + cards.length) % cards.length
            : (expandedIndex + 1) % cards.length;
          showLightbox(expandedIndex);
        });
        inner.appendChild(btn);
      });

      inner.appendChild(lbImg);
      inner.appendChild(lbLabel);
      inner.appendChild(closeBtn);
      lb.appendChild(inner);
      document.body.appendChild(lb);

      // Close on backdrop click or close btn
      lb.addEventListener("click",(e)=>{
        if(e.target===lb) closeLightbox();
      });
      closeBtn.addEventListener("click", closeLightbox);

      // Keyboard nav
      document.addEventListener("keydown",(e)=>{
        if(expandedIndex===null) return;
        if(e.key==="Escape") closeLightbox();
        if(e.key==="ArrowRight"){ expandedIndex=(expandedIndex+1)%cards.length; showLightbox(expandedIndex); }
        if(e.key==="ArrowLeft"){ expandedIndex=(expandedIndex-1+cards.length)%cards.length; showLightbox(expandedIndex); }
      });

      // Inject keyframe animation
      if(!document.getElementById("lbStyles")){
        const s = document.createElement("style");
        s.id="lbStyles";
        s.textContent=`@keyframes lbIn{ from{transform:scale(.82);opacity:0;} to{transform:scale(1);opacity:1;} }`;
        document.head.appendChild(s);
      }
    }

    function showLightbox(index){
      buildLightbox();
      const lb = document.getElementById("cardLightbox");
      const img = document.getElementById("cardLightboxImg");
      const lbl = document.getElementById("cardLightboxLabel");
      const c = cards[index];
      img.src = c.image;
      img.alt = c.label||`Card ${index+1}`;
      lbl.textContent = c.label||`Card ${index+1}`;
      expandedIndex = index;
      lb.style.display="flex";
      document.body.style.overflow="hidden";
      paused=true;
    }

    function closeLightbox(){
      const lb = document.getElementById("cardLightbox");
      if(lb) lb.style.display="none";
      expandedIndex=null;
      document.body.style.overflow="";
      paused=false;
    }

    // ── Pointer handling: tap = lightbox, drag = manual advance ──
    let down=false, startX=0, startY=0, moved=false, downTarget=null;

    fan.addEventListener("pointerdown",(e)=>{
      fan.setPointerCapture(e.pointerId);
      down=true; moved=false;
      startX=e.clientX; startY=e.clientY;
      downTarget=e.target;
    });

    fan.addEventListener("pointermove",(e)=>{
      if(!down) return;
      const dx=e.clientX-startX, dy=e.clientY-startY;
      if(Math.abs(dx)>8||Math.abs(dy)>8) moved=true;
      if(moved) fan.style.transform=`translateZ(0) rotateY(${clamp(dx/80,-6,6)}deg)`;
    });

    fan.addEventListener("pointerup",(e)=>{
      if(!down) return;
      down=false;
      fan.style.transform="";
      const dx=e.clientX-startX;

      if(!moved){
        // Tap — open lightbox for the tapped card (or active if tapping center)
        const card = e.target.closest(".card") || (downTarget && downTarget.closest(".card"));
        if(card){
          const tappedIndex = parseInt(card.dataset.index,10);
          // Bring it to front first if it's not active
          if(tappedIndex !== active){
            active = tappedIndex;
            layoutFan(active);
            // Small delay so the fan animates before lightbox opens
            setTimeout(()=>showLightbox(tappedIndex), 350);
          } else {
            showLightbox(tappedIndex);
          }
        }
      } else {
        // Swipe — advance manually
        if(dx < -40){ active=clamp(active+1,0,cards.length-1); layoutFan(active); }
        if(dx >  40){ active=clamp(active-1,0,cards.length-1); layoutFan(active); }
      }
      moved=false; downTarget=null;
    });

    fan.addEventListener("pointercancel",()=>{
      down=false; moved=false; downTarget=null;
      fan.style.transform="";
    });

    // Keyboard: Enter/Space on focused card opens lightbox
    fan.addEventListener("keydown",(e)=>{
      if(e.key==="Enter"||e.key===" "){
        const card = document.activeElement.closest(".card");
        if(card){ e.preventDefault(); showLightbox(parseInt(card.dataset.index,10)); }
      }
    });

    function layoutFan(activeIndex){
      const els=$$(".card",fan);
      els.forEach((el)=>{
        const i=parseInt(el.dataset.index,10);
        const off=i-activeIndex;
        const rot=off*14*0.75;
        const tx=off*48;
        const ty=Math.abs(off)*8;
        const scale=off===0?1.06:0.92;
        el.style.zIndex=String(100-Math.abs(off));
        el.style.opacity=Math.abs(off)>3?"0":"1";
        el.style.cursor=off===0?"zoom-in":"pointer";
        el.style.transform=`translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg) scale(${scale}) translateZ(0)`;
        el.style.filter=off===0?"brightness(1.05) saturate(1.15)":"brightness(.86) saturate(.88)";
      });
    }
  }

  // ---------- Events ----------
  let chart=null;
  function calcStats(scores){
    const vals=scores.map(s=>s.score);
    return { a:avg(vals), last:vals.length?vals[vals.length-1]:0, best:vals.length?Math.max(...vals):0 };
  }

  function renderEvents(events){
    const grid=$("#eventGrid");
    grid.innerHTML="";
    events.forEach(evt=>{
      const stats=calcStats(evt.scores);
      const btn=document.createElement("button");
      btn.type="button"; btn.className="eventBtn"; btn.dataset.event=evt.id;
      btn.innerHTML=`
        <div>
          <div class="eventName">${escapeHtml(evt.name)}</div>
          <div class="eventMeta">${evt.scores.length} meets · avg ${fmtScore(stats.a)}</div>
        </div>
        <div class="eventScore">${fmtScore(stats.last)}</div>
      `;
      btn.addEventListener("click",()=>openEvent(evt));
      grid.appendChild(btn);
    });
  }

  function openEvent(evt){
    $("#eventTitle").textContent = evt.name;
    const stats=calcStats(evt.scores);
    $("#eventAvg").textContent=fmtScore(stats.a);
    $("#eventLast").textContent=fmtScore(stats.last);
    $("#eventBest").textContent=fmtScore(stats.best);

    const list=$("#meetList");
    list.innerHTML=evt.scores.slice().reverse().map(s=>`
      <div class="meetRow">
        <div class="meetLeft">
          <div class="meetName">${escapeHtml(s.meet)}</div>
          <div class="meetDate">${escapeHtml(fmtDate(s.date))}</div>
        </div>
        <div class="meetScore">${fmtScore(s.score)}</div>
      </div>
    `).join("");

    const labels=evt.scores.map(s=>fmtDate(s.date));
    const data=evt.scores.map(s=>s.score);
    const ctx=$("#eventScoreChart").getContext("2d");
    if(chart) chart.destroy();

    // Pink gradient fill
    const gradient=ctx.createLinearGradient(0,0,0,300);
    gradient.addColorStop(0,"rgba(255,110,180,.45)");
    gradient.addColorStop(1,"rgba(255,110,180,.02)");

    chart=new Chart(ctx,{
      type:"line",
      data:{
        labels,
        datasets:[{
          label:evt.name, data,
          tension:0.42,
          fill:true,
          backgroundColor:gradient,
          borderColor:"rgba(255,110,180,.9)",
          borderWidth:2.5,
          pointBackgroundColor:"#ff6eb4",
          pointBorderColor:"rgba(255,255,255,.8)",
          pointBorderWidth:2,
          pointRadius:6,
          pointHoverRadius:9,
        }]
      },
      options:{
        responsive:true,
        maintainAspectRatio:false,
        plugins:{
          legend:{display:false},
          tooltip:{
            backgroundColor:"rgba(26,8,24,.9)",
            borderColor:"rgba(255,110,180,.35)",
            borderWidth:1,
            titleColor:"rgba(255,200,230,.9)",
            bodyColor:"rgba(255,240,247,.85)",
            callbacks:{label:(item)=>` ${fmtScore(item.parsed.y)}`}
          }
        },
        scales:{
          x:{
            ticks:{color:"rgba(255,180,215,.65)"},
            grid:{color:"rgba(255,110,180,.08)"},
            border:{color:"rgba(255,110,180,.12)"}
          },
          y:{
            ticks:{color:"rgba(255,180,215,.65)"},
            grid:{color:"rgba(255,110,180,.08)"},
            border:{color:"rgba(255,110,180,.12)"}
          }
        }
      }
    });
    openModal("eventModal");
  }

  // ---------- Sponsors + Click Tracking ----------
  // Simple in-page click tracker (replace with gtag for real analytics)
  const sponsorClicks={};
  function trackSponsor(name){
    sponsorClicks[name]=(sponsorClicks[name]||0)+1;
    // Google Analytics event (fires if gtag is loaded)
    try{
      if(typeof gtag!=="undefined"){
        gtag("event","sponsor_click",{sponsor_name:name,page_location:window.location.href});
      }
    }catch{}
    updateAnalyticsBanner();
  }

  function updateAnalyticsBanner(){
    const el=document.getElementById("sponsorAnalyticsBanner");
    if(!el||!Object.keys(sponsorClicks).length) return;
    const lines=Object.entries(sponsorClicks)
      .sort((a,b)=>b[1]-a[1])
      .map(([n,c])=>`<span class="analyticsRow"><b>${escapeHtml(n)}</b> — ${c} click${c!==1?"s":""} this session</span>`)
      .join("");
    el.innerHTML=`<div class="analyticsTitle">📊 This session's sponsor clicks</div>${lines}`;
    el.style.display="block";
  }

  function renderSponsors(sponsors){
    const strip=$("#sponsorStrip"),grid=$("#sponsorGrid");
    strip.innerHTML=""; grid.innerHTML="";

    sponsors.forEach(sp=>{
      // ── Rail logo ──
      const logo=document.createElement("div");
      logo.className="sLogo"; logo.title=sp.name;
      logo.innerHTML=`
        <img src="${sp.logo}" alt="${escapeHtml(sp.name)}" loading="lazy">
        <div class="sLogoOverlay">Visit →</div>
      `;
      logo.addEventListener("click",()=>{ trackSponsor(sp.name); safeOpen(sp.url); });
      strip.appendChild(logo);

      // ── Modal card ──
      const card=document.createElement("div");
      card.className="sponsorCard";
      card.innerHTML=`
        <div class="sponsorThumb"><img src="${sp.logo}" alt="${escapeHtml(sp.name)}" loading="lazy"></div>
        <div class="sponsorInfo">
          <div class="sponsorName">${escapeHtml(sp.name)}</div>
          <div class="sponsorTag">${escapeHtml(sp.tagline||"Sponsor")}</div>
          <div class="sponsorVisit">Visit sponsor →</div>
        </div>
      `;
      card.addEventListener("click",()=>{ trackSponsor(sp.name); safeOpen(sp.url); });
      grid.appendChild(card);
    });
  }

  function safeOpen(url){ if(!url) return; window.open(url,"_blank","noopener,noreferrer"); }

  // ---------- Bio + SEO Meta ----------
  function renderBio(data){
    const a=data.athlete;
    const fullName=`${a.firstName||""} ${a.lastName||""}`.trim();
    const shareUrl=a.shareUrl||window.location.href;
    const heroPhoto=a.heroCardPhoto||(data.cards&&data.cards[0]&&data.cards[0].image)||"";
    const level=a.level||"Bronze";
    const f=data.fundraising||{};

    // ── DOM ──
    $("#athleteFirstName").textContent=a.firstName||"First";
    $("#athleteLastName").textContent=a.lastName||"Last";
    $("#athleteTeam").textContent=a.team||"Team";
    $("#athleteDiscipline").textContent=a.discipline||"Sport";
    if($("#levelBadge")) $("#levelBadge").textContent=`🏅 ${level}`;
    $("#bioTitle").textContent=fullName;
    $("#goalSubtitle").textContent=f.subtitle||"Support the season.";
    $("#microNoteText").textContent=a.headline||"Live updates: scores · meets · sponsors";

    // ── SEO: Dynamic Title ──
    const seoTitle=`${fullName} | ${level} ${a.discipline||"Gymnast"} | ${a.team||""} | Season Fundraiser`;
    document.title=seoTitle;
    const pt=document.getElementById("pageTitle"); if(pt) pt.textContent=seoTitle;

    // ── SEO: Meta Description ──
    const seoDesc=`Support ${fullName}, a ${level} Level ${a.discipline||"gymnast"} at ${a.team||""}. View meet scores, performance charts, season highlights, and sponsor their competitive journey.`;
    const md=document.getElementById("metaDesc"); if(md) md.setAttribute("content",seoDesc);

    // ── SEO: Canonical ──
    const cl=document.getElementById("canonicalLink"); if(cl) cl.setAttribute("href",shareUrl);

    // ── Open Graph ──
    const ogT=`Support ${a.firstName||"this athlete"}'s ${a.discipline||"Gymnastics"} Journey ✨`;
    const ogD=`View scores, season highlights, and sponsor ${fullName}'s competitive ${a.discipline||"gymnastics"} season at ${a.team||""}.`;
    const setMeta=(id,val)=>{ const el=document.getElementById(id); if(el) el.setAttribute("content",val); };
    setMeta("ogTitle",ogT); setMeta("ogDesc",ogD);
    setMeta("ogUrl",shareUrl); setMeta("ogImage",heroPhoto?`${window.location.origin}/${heroPhoto}`:"");
    setMeta("twTitle",`Support ${a.firstName||"this athlete"}'s ${a.discipline||"Gymnastics"} Season`);
    setMeta("twDesc",`Tap to view scores, meet history, and sponsor ${a.firstName||"this athlete"}'s season.`);
    setMeta("twImage",heroPhoto?`${window.location.origin}/${heroPhoto}`:"");

    // ── Structured Data (JSON-LD) ──
    const jsonLd={
      "@context":"https://schema.org",
      "@type":"Person",
      "name":fullName,
      "sport":a.discipline||"Gymnastics",
      "memberOf":{ "@type":"SportsOrganization","name":a.team||"" },
      "description":seoDesc,
      "url":shareUrl
    };
    const jl=document.getElementById("jsonLd");
    if(jl) jl.textContent=JSON.stringify(jsonLd);

    // ── Bio Modal ──
    $("#bioBadges").innerHTML=`
      <span class="metaPill">${escapeHtml(a.team||"Team")}</span>
      <span class="metaPill soft">${escapeHtml(a.discipline||"Sport")}</span>
      <span class="metaPill soft">🏅 ${escapeHtml(level)}</span>
    `;
    const bioPhoto=$("#bioPhoto");
    bioPhoto.style.background=heroPhoto?`url("${heroPhoto}") center/cover no-repeat`:"rgba(255,110,180,.08)";

    const quick=$("#bioQuick");
    quick.innerHTML=(a.quickFacts||[]).map(q=>`
      <div class="quickRow">
        <div class="quickLabel">${escapeHtml(q.label)}</div>
        <div class="quickValue">${escapeHtml(q.value)}</div>
      </div>
    `).join("");

    const story=$("#bioStory");
    story.innerHTML=(a.story||[]).map(p=>`<p style="margin:0 0 10px">${escapeHtml(p)}</p>`).join("")+
      `<p style="margin:0;color:rgba(255,200,230,.72);font-size:12px">💕 Thank you for supporting the journey.</p>`;

    const links=$("#bioLinks");
    links.innerHTML="";
    (a.links||[]).forEach(l=>{
      const btn=document.createElement("button");
      btn.type="button"; btn.className="chip";
      btn.innerHTML=`<span class="chip-icon" aria-hidden="true">↗</span><span>${escapeHtml(l.label)}</span>`;
      btn.addEventListener("click",()=>safeOpen(l.url));
      links.appendChild(btn);
    });
  }

  // ---------- Fundraising + Milestones ----------
  function renderFundraising(data){
    const f=data.fundraising||{goalAmount:0,raisedAmount:0};
    const goal=Number(f.goalAmount||0);
    const raised=Number(f.raisedAmount||0);
    const pct=goal>0?clamp((raised/goal)*100,0,100):0;
    const a=data.athlete||{};
    const firstName=a.firstName||"This athlete";

    $("#goalPill").textContent=`${fmtMoney(raised)} / ${fmtMoney(goal)}`;

    // Share progress button text
    const sp=$("#shareProgressText");
    if(sp) sp.textContent=`${firstName} is ${Math.round(pct)}% to her goal! Share 📊`;

    // Animate progress bar after short delay then check milestones
    setTimeout(()=>{
      $("#progressBar").style.width=`${pct}%`;
      setTimeout(()=>checkMilestone(pct, firstName), 1000);
    },400);

    // Recent supporters feed (from JSON if provided)
    if(data.supporters && data.supporters.length){
      const sec=$("#supportersSection");
      const feed=$("#supportersFeed");
      if(sec&&feed){
        sec.style.display="block";
        feed.innerHTML=data.supporters.slice(0,6).map(s=>`
          <div class="supporterItem">
            <div class="supporterAvatar">${(s.name||"?")[0].toUpperCase()}</div>
            <div class="supporterInfo">
              <div class="supporterName">${escapeHtml(s.name||"Anonymous")}</div>
              <div class="supporterTime">${escapeHtml(s.time||"Recently")}</div>
            </div>
            ${s.amount?`<div class="supporterAmount">${fmtMoney(s.amount)}</div>`:""}
          </div>
        `).join("");
      }
    }
  }

  // Milestone celebration
  const shownMilestones = new Set();
  function checkMilestone(pct, name){
    const milestones=[
      {at:25, emoji:"🌸", msg:`${name} is 25% there!`, sub:"Amazing start — keep sharing!"},
      {at:50, emoji:"🎀", msg:`Halfway there!`, sub:`${name} is 50% to her goal!`},
      {at:75, emoji:"⭐", msg:`75% reached!`, sub:"So close — help push her over!"},
      {at:100,emoji:"🏆", msg:`Goal reached!`, sub:`${name} did it! Thank you!`},
    ];
    for(const m of milestones){
      if(pct>=m.at && !shownMilestones.has(m.at)){
        shownMilestones.add(m.at);
        showMilestone(m);
        return;
      }
    }
  }

  function showMilestone(m){
    const ov=document.getElementById("milestoneOverlay");
    if(!ov) return;
    document.getElementById("milestoneEmoji").textContent=m.emoji;
    document.getElementById("milestoneMsg").textContent=m.msg;
    document.getElementById("milestoneSub").textContent=m.sub;
    ov.style.display="flex";

    // Confetti burst
    if(typeof confetti!=="undefined"){
      confetti({ particleCount:120, spread:80, origin:{y:0.55},
        colors:["#ff6eb4","#ffaad4","#d4a8ff","#ffd700","#ff4d8b"] });
    }

    setTimeout(()=>{ ov.style.display="none"; }, 4500);
    ov.addEventListener("click",()=>{ ov.style.display="none"; },{once:true});
  }

  // ---------- Actions + All Share Channels ----------
  function wireActions(data){
    const a=data.athlete||{};
    const shareUrl=a.shareUrl||window.location.href;
    const firstName=a.firstName||"This athlete";
    const f=data.fundraising||{};
    const goal=Number(f.goalAmount||0);
    const raised=Number(f.raisedAmount||0);
    const pct=goal>0?Math.round(clamp((raised/goal)*100,0,100)):0;

    const shareText=`Help ${firstName} reach her ${a.discipline||"gymnastics"} season goal! 🌸💕`;
    const progressText=`${firstName} is ${pct}% to her ${a.discipline||"gymnastics"} season goal! Help her finish strong! 🏅`;

    // ── Copy Link ──
    $("#btnCopyLink").addEventListener("click",()=>copyText(shareUrl));

    // ── Native Share (mobile sheet) ──
    const nativeBtn=$("#btnNativeShare");
    if(nativeBtn){
      if(navigator.share){
        nativeBtn.addEventListener("click",async()=>{
          try{ await navigator.share({title:document.title,text:shareText,url:shareUrl}); }
          catch(e){ if(e.name!=="AbortError") copyText(shareUrl); }
        });
      } else {
        nativeBtn.style.display="none"; // hide on desktop where not supported
      }
    }

    // ── CTA Share ──
    $("#ctaShare").addEventListener("click",async()=>{
      if(navigator.share){
        try{ await navigator.share({title:document.title,text:shareText,url:shareUrl}); }
        catch{ copyText(shareUrl); }
      } else copyText(shareUrl);
    });

    // ── Donate ──
    const donateUrl=a.donateUrl||"";
    $("#ctaDonate").addEventListener("click",()=>{
      if(!donateUrl){ toast("💕 Add a donateUrl in data/athlete.json"); return; }
      safeOpen(donateUrl);
    });

    // ── Quick Share: SMS ──
    const qsSms=$("#qsSms");
    if(qsSms) qsSms.href=`sms:?body=${encodeURIComponent(shareText+" "+shareUrl)}`;

    // ── Quick Share: WhatsApp ──
    const qsWa=$("#qsWhatsapp");
    if(qsWa) qsWa.href=`https://wa.me/?text=${encodeURIComponent(shareText+" "+shareUrl)}`;

    // ── Quick Share: Facebook ──
    const qsFb=$("#qsFacebook");
    if(qsFb) qsFb.href=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

    // ── Quick Share: Email ──
    const qsEmail=$("#qsEmail");
    if(qsEmail) qsEmail.href=`mailto:?subject=${encodeURIComponent(document.title)}&body=${encodeURIComponent(shareText+"\n\n"+shareUrl)}`;

    // ── Share Progress ──
    const spBtn=$("#btnShareProgress");
    if(spBtn){
      spBtn.addEventListener("click",async()=>{
        const payload={title:document.title,text:progressText,url:shareUrl};
        if(navigator.share){ try{ await navigator.share(payload); }catch{ copyText(`${progressText} ${shareUrl}`); } }
        else copyText(`${progressText} ${shareUrl}`);
      });
    }

    // ── Become Sponsor ──
    const bsBtn=$("#btnBecomeSponsor");
    if(bsBtn){
      bsBtn.addEventListener("click",()=>{
        const sponsorEmail=a.sponsorContactEmail||a.links?.find(l=>l.label==="Email")?.url||"";
        if(sponsorEmail) safeOpen(sponsorEmail.replace("mailto:","mailto:")||`mailto:?subject=Sponsorship Inquiry for ${firstName}`);
        else{ copyText(shareUrl); toast("💎 Share this page with potential sponsors!"); }
      });
    }

    // ── Create Your Own ──
    const coBtn=$("#btnCreateOwn");
    if(coBtn) coBtn.addEventListener("click",()=>toast("🌸 Coming soon — Digital Athlete Cards for every gym!"));

    // ── Modals ──
    $("#openBioModal").addEventListener("click",()=>openModal("bioModal"));
    $("#btnOpenSponsors").addEventListener("click",()=>openModal("sponsorsModal"));
    $("#btnOpenAbout").addEventListener("click",()=>openModal("aboutModal"));

    // ── Reduce Motion ──
    $("#btnReduceMotion").addEventListener("click",()=>{
      reduceMotion=!reduceMotion;
      try{ localStorage.setItem("dac_reduce_motion",reduceMotion?"1":"0"); }catch{}
      toast(reduceMotion?"🌸 Reduced motion on":"✨ Full sparkles restored!");
    });
  }

  // ---------- Canvas FX — pink constellation ----------
  function startFx(){
    const canvas=$("#fx-canvas");
    const ctx=canvas.getContext("2d",{alpha:true});
    let w=0,h=0,dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1));
    const mouse={x:0,y:0,vx:0,vy:0,active:false};
    let lastT=performance.now();

    function resize(){
      w=Math.floor(window.innerWidth); h=Math.floor(window.innerHeight);
      canvas.width=Math.floor(w*dpr); canvas.height=Math.floor(h*dpr);
      canvas.style.width=w+"px"; canvas.style.height=h+"px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    window.addEventListener("resize",resize); resize();

    const count=clamp(Math.floor((w*h)/18000),50,130);
    // Hues: 300-340 = pinks/roses, 280-300 = lavenders
    const p=new Array(count).fill(0).map(()=>({
      x:Math.random()*w, y:Math.random()*h,
      vx:(Math.random()-.5)*.20, vy:(Math.random()-.5)*.20,
      r:1.1+Math.random()*2.0,
      a:0.18+Math.random()*.24,
      hue:280+Math.random()*60  // pink-lavender range
    }));

    function onMove(e){
      mouse.active=true;
      mouse.vx=e.clientX-mouse.x; mouse.vy=e.clientY-mouse.y;
      mouse.x=e.clientX; mouse.y=e.clientY;
    }
    window.addEventListener("mousemove",onMove,{passive:true});
    window.addEventListener("touchmove",(e)=>{
      if(!e.touches||!e.touches[0]) return;
      onMove({clientX:e.touches[0].clientX,clientY:e.touches[0].clientY});
    },{passive:true});

    function step(t){
      const dt=Math.min(32,t-lastT); lastT=t;
      ctx.clearRect(0,0,w,h);
      if(reduceMotion){ drawConst(0.6); requestAnimationFrame(step); return; }
      for(const s of p){
        s.x+=s.vx*dt; s.y+=s.vy*dt;
        if(s.x<-20) s.x=w+20; if(s.x>w+20) s.x=-20;
        if(s.y<-20) s.y=h+20; if(s.y>h+20) s.y=-20;
        if(mouse.active){
          const dx=mouse.x-s.x,dy=mouse.y-s.y,dist=Math.hypot(dx,dy);
          if(dist<240){ const pull=(1-dist/240)*.0009*dt; s.vx+=dx*pull; s.vy+=dy*pull; }
        }
        s.vx*=.994; s.vy*=.994;
      }
      drawConst(1);
      requestAnimationFrame(step);
    }

    function drawConst(om){
      drawPass(1,1.9,0.30*om);
      drawPass(0,1.0,1.0*om);
    }

    function drawPass(blur,sm,am){
      for(const s of p){
        ctx.beginPath();
        ctx.fillStyle=`hsla(${s.hue},90%,78%,${s.a*am})`;
        ctx.arc(s.x,s.y,s.r*sm,0,Math.PI*2);
        ctx.fill();
      }
      const maxD=125;
      for(let i=0;i<p.length;i++){
        for(let j=i+1;j<p.length;j++){
          const a=p[i],b=p[j];
          const dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);
          if(d<maxD){
            const t=1-d/maxD;
            ctx.strokeStyle=`rgba(255,110,180,${(0.09*t)*am})`;
            ctx.lineWidth=(blur?1.7:1.0)*sm;
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          }
        }
      }
      // mouse bloom — pink heart-ish glow
      if(mouse.active){
        ctx.beginPath();
        ctx.fillStyle=`rgba(255,110,180,${0.12*am})`;
        ctx.arc(mouse.x,mouse.y,75*sm,0,Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle=`rgba(212,168,255,${0.09*am})`;
        ctx.arc(mouse.x+mouse.vx*.2,mouse.y+mouse.vy*.2,60*sm,0,Math.PI*2);
        ctx.fill();
      }
    }
    requestAnimationFrame(step);
  }

  // ---------- Helpers ----------
  function escapeHtml(s){
    return String(s??"")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  // ---------- Init ----------
  loadData().then((data)=>{
    renderBio(data);
    renderFundraising(data);
    renderCards(data.cards||[]);
    renderEvents(data.events||[]);
    renderSponsors(data.sponsors||[]);
    wireActions(data);
    startFx();
    startFloatingDeco();
  }).catch((err)=>{
    console.error(err);
    toast("💕 Setup: check console + data/athlete.json");
  });

})();
