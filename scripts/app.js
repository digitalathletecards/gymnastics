(() => {
  const byId = (id) => document.getElementById(id);
  const on = (el, evt, fn) => el && el.addEventListener(evt, fn);
  const setText = (el, val) => el && (el.textContent = val ?? "");
  const setAttr = (el, name, val) => el && val != null && el.setAttribute(name, String(val));

  const fmtMoney = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(n || 0));

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  function pageUrl() {
    return window.location.href.split("#")[0];
  }

  async function copyLink(text = pageUrl()) {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied!");
    } catch {
      prompt("Copy this link:", text);
    }
  }

  async function nativeShare({ title, text, url } = {}) {
    try {
      if (navigator.share) {
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
    // NOTE: social previews (FB/iMessage/etc.) do NOT run JS.
    // This is still helpful for browser title.
    const url = pageUrl();
    const fullName = `${ath.firstName || ""} ${ath.lastName || ""}`.trim() || "Digital Athlete Card";
    document.title = `${fullName} | ${ath.team || "Youth Sports"} | Fundraiser`;

    // optional: set canonical if element exists
    setAttr(byId("canonicalLink"), "href", url);
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
    if (spt) spt.textContent = `${ath.firstName || "This athlete"} is ${Math.round(pct)}% to the season goal! Help finish strong 💕`;

    on(byId("ctaDonate"), "click", () => {
      const donateUrl = ath.fundraising?.donateUrl;
      if (donateUrl) window.open(donateUrl, "_blank", "noopener");
      else alert("Add fundraising.donateUrl in data/athlete.json");
    });
  }

  function renderCards(ath) {
    const fan = byId("cardsFan");
    if (!fan) return;

    const photos = (ath.photos || []).filter((p) => p && p.src);
    fan.innerHTML = "";

    photos.forEach((p, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "photoCard";
      btn.style.backgroundImage = `url("${p.src}")`;
      btn.style.backgroundSize = "cover";
      btn.style.backgroundPosition = "center";
      btn.title = p.caption || `Photo ${idx + 1}`;

      // helpful debug if image missing
      const test = new Image();
      test.onload = () => {};
      test.onerror = () => console.warn("Missing photo:", p.src);
      test.src = p.src;

      fan.appendChild(btn);
    });
  }

  function renderSponsors(ath) {
    const strip = byId("sponsorStrip");
    const grid = byId("sponsorGrid");
    const sponsors = (ath.sponsors || []).filter(Boolean);

    if (strip) strip.innerHTML = "";
    if (grid) grid.innerHTML = "";

    sponsors.forEach((s) => {
      const name = s.name || "Sponsor";
      const logo = s.logo || "";

      // rail
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
          img.onerror = () => console.warn("Missing sponsor logo:", logo);
          a.appendChild(img);
        } else {
          a.textContent = name;
        }

        strip.appendChild(a);
      }

      // modal grid
      if (grid) {
        const a = document.createElement("a");
        a.className = "sponsorCard";
        a.href = s.url || "#";
        a.target = s.url ? "_blank" : "_self";
        a.rel = s.url ? "noopener" : "";
        a.innerHTML = `
          <div class="sponsorLogoBox">${logo ? `<img src="${logo}" alt="${name}" loading="lazy" onerror="this.style.display='none'">` : ""}</div>
          <div class="sponsorName">${name}</div>
          ${s.blurb ? `<div class="sponsorBlurb">${s.blurb}</div>` : ""}
          <div class="sponsorCta">Visit sponsor ↗</div>
        `;
        grid.appendChild(a);
      }
    });

    on(byId("btnOpenSponsors"), "click", () => openModal("sponsorsModal"));
    on(byId("btnBecomeSponsor"), "click", () => openModal("sponsorsModal"));
  }

  function wireShare(ath) {
    const url = pageUrl();
    const msg = ath.shareMessage || "Support this athlete’s season 💕";
    const encoded = encodeURIComponent(`${msg} ${url}`);

    const sms = byId("qsSms");
    if (sms) sms.href = `sms:&body=${encoded}`;
    const wa = byId("qsWhatsapp");
    if (wa) wa.href = `https://wa.me/?text=${encoded}`;
    const fb = byId("qsFacebook");
    if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    const em = byId("qsEmail");
    if (em) em.href = `mailto:?subject=${encodeURIComponent("Support this athlete’s season")}&body=${encoded}`;

    on(byId("btnCopyLink"), "click", () => copyLink(url));
    on(byId("btnNativeShare"), "click", () => nativeShare({ text: msg }));
    on(byId("ctaShare"), "click", () => nativeShare({ text: msg }));
    on(byId("btnShareProgress"), "click", () => {
      const t = byId("shareProgressText")?.textContent || msg;
      nativeShare({ text: t });
    });
  }

  async function init() {
    wireModals();

    const res = await fetch("data/athlete.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Missing data/athlete.json");
    const ath = await res.json();

    applySeo(ath);
    renderHero(ath);
    renderCards(ath);
    renderSponsors(ath);
    wireShare(ath);

    on(byId("openBioModal"), "click", () => openModal("bioModal"));
    on(byId("btnOpenAbout"), "click", () => openModal("aboutModal"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init().catch(console.error));
  } else {
    init().catch(console.error);
  }
})();
