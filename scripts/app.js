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

  // ---------- Cards fan ----------
  function renderCards(cards){
    const fan = $("#cardsFan");
    fan.innerHTML = "";

    cards.forEach((c,i)=>{
      const el = document.createElement("div");
      el.className = "card";
      el.dataset.index = String(i);

      const img = document.createElement("img");
      img.src = c.image; img.alt = c.label||`Card ${i+1}`; img.loading="lazy";

      const label = document.createElement("div");
      label.className = "cardLabel";
      label.innerHTML = `<span class="spark" aria-hidden="true"></span><span>${escapeHtml(c.label||"Moment")}</span>`;

      el.appendChild(img); el.appendChild(label); fan.appendChild(el);
    });

    let active = Math.floor(cards.length/2);
    layoutFan(active);

    // ── Pointer handling: cleanly separate tap vs drag ──
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
        // Pure tap — bring tapped card to front
        const card = e.target.closest(".card") || (downTarget && downTarget.closest(".card"));
        if(card){
          active = parseInt(card.dataset.index,10);
          layoutFan(active);
        }
      } else {
        // Drag swipe — advance active index
        if(dx < -40) active=clamp(active+1,0,cards.length-1);
        if(dx >  40) active=clamp(active-1,0,cards.length-1);
        layoutFan(active);
      }
      moved=false; downTarget=null;
    });

    fan.addEventListener("pointercancel",()=>{
      down=false; moved=false; downTarget=null;
      fan.style.transform="";
    });

    fan.addEventListener("mousemove",(e)=>{
      if(reduceMotion) return;
      const r=fan.getBoundingClientRect();
      const cx=(e.clientX-r.left)/r.width-0.5;
      const cy=(e.clientY-r.top)/r.height-0.5;
      fan.style.transform=`translateZ(0) rotateY(${cx*6}deg) rotateX(${-cy*4}deg)`;
    });
    fan.addEventListener("mouseleave",()=>{ fan.style.transform=""; });

    function layoutFan(activeIndex){
      const els=$$(".card",fan);
      els.forEach((el)=>{
        const i=parseInt(el.dataset.index,10);
        const off=i-activeIndex;
        const rot=off*14*0.75;
        const tx=off*48;
        const ty=Math.abs(off)*8;
        const scale=off===0?1.04:0.92;
        el.style.zIndex=String(100-Math.abs(off));
        el.style.opacity=Math.abs(off)>3?"0":"1";
        el.style.transform=`translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg) scale(${scale}) translateZ(0)`;
        el.style.filter=off===0?"brightness(1.04) saturate(1.12)":"brightness(.88) saturate(.90)";
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

  // ---------- Sponsors ----------
  function renderSponsors(sponsors){
    const strip=$("#sponsorStrip"),grid=$("#sponsorGrid");
    strip.innerHTML=""; grid.innerHTML="";
    sponsors.forEach(sp=>{
      const logo=document.createElement("div");
      logo.className="sLogo"; logo.title=sp.name;
      logo.innerHTML=`<img src="${sp.logo}" alt="${escapeHtml(sp.name)}" loading="lazy">`;
      logo.addEventListener("click",()=>safeOpen(sp.url));
      strip.appendChild(logo);

      const card=document.createElement("div");
      card.className="sponsorCard";
      card.innerHTML=`
        <div class="sponsorThumb"><img src="${sp.logo}" alt="${escapeHtml(sp.name)}" loading="lazy"></div>
        <div class="sponsorInfo">
          <div class="sponsorName">${escapeHtml(sp.name)}</div>
          <div class="sponsorTag">${escapeHtml(sp.tagline||"Sponsor")}</div>
        </div>
      `;
      card.addEventListener("click",()=>safeOpen(sp.url));
      grid.appendChild(card);
    });
  }

  function safeOpen(url){ if(!url) return; window.open(url,"_blank","noopener,noreferrer"); }

  // ---------- Bio ----------
  function renderBio(data){
    const a=data.athlete;
    $("#athleteFirstName").textContent=a.firstName||"First";
    $("#athleteLastName").textContent=a.lastName||"Last";
    $("#athleteTeam").textContent=a.team||"Team";
    $("#athleteDiscipline").textContent=a.discipline||"Sport";
    document.title=`${a.firstName||"Athlete"} ${a.lastName||""} · Digital Athlete Card`.trim();
    $("#bioTitle").textContent=`${a.firstName||""} ${a.lastName||""}`.trim();
    $("#goalSubtitle").textContent=(data.fundraising&&data.fundraising.subtitle)?data.fundraising.subtitle:"Support the season.";
    $("#microNoteText").textContent=a.headline||"Live updates: scores · meets · sponsors";

    $("#bioBadges").innerHTML=`
      <span class="metaPill">${escapeHtml(a.team||"Team")}</span>
      <span class="metaPill soft">${escapeHtml(a.discipline||"Sport")}</span>
    `;

    const heroPhoto=a.heroCardPhoto||(data.cards&&data.cards[0]&&data.cards[0].image)||"";
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

  // ---------- Fundraising ----------
  function renderFundraising(data){
    const f=data.fundraising||{goalAmount:0,raisedAmount:0};
    const goal=Number(f.goalAmount||0);
    const raised=Number(f.raisedAmount||0);
    const pct=goal>0?clamp((raised/goal)*100,0,100):0;
    $("#goalPill").textContent=`${fmtMoney(raised)} / ${fmtMoney(goal)}`;
    // animate progress bar in after a short delay for delight
    setTimeout(()=>{ $("#progressBar").style.width=`${pct}%`; },400);
  }

  // ---------- Actions ----------
  function wireActions(data){
    const shareUrl=data.athlete&&data.athlete.shareUrl?data.athlete.shareUrl:window.location.href;
    $("#btnCopyLink").addEventListener("click",()=>copyText(shareUrl));
    $("#ctaShare").addEventListener("click",async()=>{
      const payload={title:document.title,text:"🌸 Check out this athlete's season page:",url:shareUrl};
      if(navigator.share){ try{ await navigator.share(payload); }catch{ /* canceled */ } }
      else copyText(shareUrl);
    });
    const donateUrl=data.athlete&&data.athlete.donateUrl?data.athlete.donateUrl:"";
    $("#ctaDonate").addEventListener("click",()=>{
      if(!donateUrl){ toast("💕 Add a donateUrl in data/athlete.json"); return; }
      safeOpen(donateUrl);
    });
    $("#openBioModal").addEventListener("click",()=>openModal("bioModal"));
    $("#btnOpenSponsors").addEventListener("click",()=>openModal("sponsorsModal"));
    $("#btnOpenAbout").addEventListener("click",()=>openModal("aboutModal"));
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
