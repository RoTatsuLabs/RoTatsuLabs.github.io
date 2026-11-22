(function (DP) {
  "use strict";
  const { $, $$, h, icon } = DP;

  /* posters */
  function poster(g, cls, eager) {
    const p = h("span", { class: "poster" + (cls ? " " + cls : "") });
    const fallback = () => {
      p.classList.add("noimg");
      p.dataset.tone = String(DP.hash(g.name) % 4);
      p.replaceChildren(h("span", { class: "mono", "aria-hidden": "true" }, DP.initials(g.name)));
    };
    const src = DP.safeUrl(g.cover);
    if (!src) { fallback(); return p; }
    const img = new Image();
    img.alt = "";
    img.width = 300;
    img.height = 400;
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    if (eager) img.setAttribute("fetchpriority", "high"); else img.loading = "lazy";
    img.onload = () => img.classList.add("ld");
    img.onerror = fallback;
    img.src = src;
    p.appendChild(img);
    if (img.complete && img.naturalWidth) img.classList.add("ld");
    return p;
  }

  function favButton(g) {
    const on = DP.favs.has(g.slug);
    const b = h("button", { class: "fav" + (on ? " on" : ""), type: "button", "data-slug": g.slug, "aria-pressed": String(on), "aria-label": (on ? "Remove " : "Save ") + g.name + (on ? " from saved games" : " to saved games") });
    b.appendChild(icon(on ? "heart" : "hearto"));
    b.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      DP.toast(DP.favs.toggle(g.slug) ? "Saved " + g.name : "Removed " + g.name);
    });
    return b;
  }
  document.addEventListener("favchange", (e) => {
    const { slug, on } = e.detail;
    $$(".fav").forEach((b) => {
      if (slug && b.dataset.slug !== slug) return;
      const now = DP.favs.has(b.dataset.slug);
      const name = b.getAttribute("aria-label").replace(/^(Save|Remove) | (to|from) saved games$/g, "");
      b.classList.toggle("on", now);
      b.setAttribute("aria-pressed", String(now));
      b.setAttribute("aria-label", (now ? "Remove " : "Save ") + name + (now ? " from saved games" : " to saved games"));
      b.replaceChildren(icon(now ? "heart" : "hearto"));
      if (slug && on) { b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
    });
    const n = DP.favs.all().length, c = $("#fav-count");
    if (c) { c.textContent = n ? String(n) : ""; c.classList.toggle("has", n > 0); }
  });

  function card(g, i, eager) {
    const p = poster(g, "", eager);
    const badges = h("span", { class: "badges" });
    if (g.isNew) badges.append(h("span", { class: "badge new" }, "New"));
    if (g.ports.length > 1) badges.append(h("span", { class: "badge" }, g.ports.length + " ports"));
    if (badges.children.length) p.appendChild(badges);
    const meta = [g.platforms[0], g.year].filter(Boolean).join(" \u00b7 ");
    const extra = [g.genres.slice(0, 2).join(", "), g.ports.length + (g.ports.length === 1 ? " port" : " ports")].filter(Boolean).join(" \u00b7 ");
    const link = h("a", { class: "card-link", href: "#/game/" + g.slug, "data-slug": g.slug },
      p,
      h("span", { class: "card-info" },
        h("strong", { class: "card-title" }, g.name),
        h("span", { class: "card-meta" }, meta),
        h("span", { class: "card-extra" }, extra)
      )
    );
    return h("article", { class: "card enter", style: "--i:" + Math.min(i || 0, 14) }, link, favButton(g));
  }

  function rail(items, opts) {
    const track = h("div", { class: "rail-track", tabindex: "-1" });
    items.forEach((g, i) => track.appendChild(card(g, i, i < 3 && opts && opts.eager)));
    const prev = h("button", { class: "rail-btn prev", type: "button", "aria-label": "Scroll left", disabled: true }, icon("chevl"));
    const next = h("button", { class: "rail-btn next", type: "button", "aria-label": "Scroll right" }, icon("chevr"));
    const sync = () => {
      prev.disabled = track.scrollLeft < 8;
      next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
    };
    const go = (d) => track.scrollBy({ left: d * track.clientWidth * 0.85, behavior: DP.reduced() ? "auto" : "smooth" });
    prev.addEventListener("click", () => go(-1));
    next.addEventListener("click", () => go(1));
    track.addEventListener("scroll", sync, { passive: true });
    setTimeout(sync, 60);
    return h("div", { class: "rail" }, track, prev, next);
  }

  function sectionHead(title, link, linkText) {
    return h("div", { class: "section-head" },
      h("h2", null, title),
      link ? h("a", { class: "more-link", href: link }, linkText || "View all", icon("arrow")) : null
    );
  }

  /* pointer tilt on posters (fine pointers only) */
  let tiltRaf = 0;
  document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || DP.reduced()) return;
    const p = e.target.closest && e.target.closest(".card .poster, .poster.big");
    if (!p) return;
    cancelAnimationFrame(tiltRaf);
    tiltRaf = requestAnimationFrame(() => {
      const r = p.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      p.style.setProperty("--ry", (x * 9).toFixed(2) + "deg");
      p.style.setProperty("--rx", (-y * 9).toFixed(2) + "deg");
    });
  }, { passive: true });
  document.addEventListener("pointerout", (e) => {
    const p = e.target.closest && e.target.closest(".poster");
    if (p && !p.contains(e.relatedTarget)) { p.style.removeProperty("--rx"); p.style.removeProperty("--ry"); }
  });

  /* header */
  $("#open-search").appendChild(icon("search"));
  $("#open-menu").appendChild(icon("menu"));
  $("#s-close").appendChild(icon("close"));
  $("#to-top").appendChild(icon("up"));
  const header = $("#header");
  let menuOpen = false, searchOpen = false, lastY = 0;
  function moveInd() {
    const a = $('#nav a[aria-current="page"]'), ind = $("#nav-ind");
    if (!a || !ind) return;
    const nr = $("#nav").getBoundingClientRect(), r = a.getBoundingClientRect();
    if (!r.width) return;
    ind.style.opacity = "1";
    ind.style.width = r.width + "px";
    ind.style.transform = "translateX(" + (r.left - nr.left) + "px)";
  }
  DP.setNav = (name) => {
    $$("#nav a, #mobile-nav a").forEach((a) => {
      if (a.dataset.route === name) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    const ind = $("#nav-ind");
    if (!$('#nav a[aria-current="page"]')) ind.style.opacity = "0";
    moveInd();
  };
  window.addEventListener("resize", moveInd);
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 24);
    header.classList.toggle("hide", y > lastY + 4 && y > 280 && !menuOpen && !searchOpen);
    if (y < lastY - 4) header.classList.remove("hide");
    lastY = y;
    const t = $("#to-top");
    if (t) t.classList.toggle("show", y > 900);
  }, { passive: true });

  function setMenu(open) {
    menuOpen = open;
    const m = $("#mobile-nav"), b = $("#open-menu");
    if (open) m.hidden = false;
    requestAnimationFrame(() => m.classList.toggle("open", open));
    b.setAttribute("aria-expanded", String(open));
    b.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    b.replaceChildren(icon(open ? "close" : "menu"));
    document.body.classList.toggle("lock", open);
    $("#main").inert = open;
    $("#footer").inert = open;
    if (open) setTimeout(() => $("#mobile-nav a").focus(), 50);
    else setTimeout(() => { if (!menuOpen) m.hidden = true; }, 520);
  }
  $("#open-menu").addEventListener("click", () => setMenu(!menuOpen));
  $("#mobile-nav").addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });

  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    const b = $("#theme");
    b.replaceChildren(icon(t === "dark" ? "light" : "dark"));
    b.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
    const f = $("#pref-theme");
    if (f) f.textContent = "Theme: " + (t === "dark" ? "Dark" : "Light");
  }
  function applyMotion(m) {
    const root = document.documentElement;
    if (m === "system") delete root.dataset.motion; else root.dataset.motion = m;
    const f = $("#pref-motion");
    if (f) f.textContent = "Motion: " + ({ system: "Follow device", full: "Full", reduced: "Reduced" })[m];
  }
  let theme = DP.pref("theme") === "light" ? "light" : "dark", motion = DP.pref("motion") || "system";
  applyTheme(theme);
  applyMotion(motion);
  $("#theme").addEventListener("click", () => { theme = theme === "dark" ? "light" : "dark"; DP.pref("theme", theme); applyTheme(theme); });
  $("#pref-theme").addEventListener("click", () => $("#theme").click());
  $("#pref-motion").addEventListener("click", () => {
    motion = ({ system: "full", full: "reduced", reduced: "system" })[motion] || "system";
    DP.pref("motion", motion);
    applyMotion(motion);
    DP.toast("Motion: " + ({ system: "follow device setting", full: "full animations", reduced: "reduced animations" })[motion]);
  });
  $("#to-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: DP.reduced() ? "auto" : "smooth" }));

  /* search overlay */
  const ov = $("#search"), sq = $("#sq"), sl = $("#s-list");
  let results = [], active = -1;
  function runSearch() {
    const q = sq.value.trim();
    results = q ? DP.search(q, 8) : DP.state.byAdded.slice(0, 6);
    active = results.length && q ? 0 : -1;
    $("#s-label").textContent = q ? (results.length ? "Top matches" : "No matches") : "Newly added";
    sl.replaceChildren(...results.map((g, i) => h("li", { id: "s-" + i, role: "option", "aria-selected": String(i === active), class: "s-item" + (i === active ? " on" : ""), style: "--i:" + i },
      h("a", { href: "#/game/" + g.slug, tabindex: "-1" }, poster(g, "mini"), h("span", { class: "s-text" }, h("strong", null, g.name), h("small", null, [g.platforms[0], g.year].filter(Boolean).join(" \u00b7 "))))
    )));
    if (q && !results.length) sl.appendChild(h("li", { class: "s-empty" }, "Nothing found for \"" + q + "\". Try a shorter name."));
    $("#s-all").hidden = !q;
    $("#s-all").href = "#/browse?q=" + encodeURIComponent(q);
    sq.setAttribute("aria-activedescendant", active >= 0 ? "s-" + active : "");
    sq.setAttribute("aria-expanded", String(results.length > 0));
  }
  function mark(i) {
    active = (i + results.length) % results.length;
    $$(".s-item", sl).forEach((n, k) => { n.classList.toggle("on", k === active); n.setAttribute("aria-selected", String(k === active)); });
    sq.setAttribute("aria-activedescendant", "s-" + active);
    const n = $("#s-" + active);
    if (n) n.scrollIntoView({ block: "nearest" });
  }
  DP.openSearch = () => {
    if (!DP.state || !DP.state.ready) return;
    searchOpen = true;
    ov.hidden = false;
    document.body.classList.add("lock");
    $("#main").inert = true;
    $("#footer").inert = true;
    requestAnimationFrame(() => ov.classList.add("open"));
    sq.value = "";
    runSearch();
    setTimeout(() => sq.focus(), 40);
  };
  DP.closeSearch = () => {
    if (!searchOpen) return;
    searchOpen = false;
    ov.classList.remove("open");
    document.body.classList.remove("lock");
    $("#main").inert = false;
    $("#footer").inert = false;
    setTimeout(() => { if (!searchOpen) ov.hidden = true; }, 380);
    $("#open-search").focus();
  };
  $("#open-search").addEventListener("click", DP.openSearch);
  $("#s-close").addEventListener("click", DP.closeSearch);
  ov.querySelector(".search-scrim").addEventListener("click", DP.closeSearch);
  sq.addEventListener("input", runSearch);
  sq.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); if (results.length) mark(active + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (results.length) mark(active - 1); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const q = sq.value.trim();
      DP.closeSearch();
      if (active >= 0 && results[active] && q) location.hash = "/game/" + results[active].slug;
      else location.hash = "/browse" + (q ? "?q=" + encodeURIComponent(q) : "");
    }
  });
  sl.addEventListener("click", (e) => { if (e.target.closest("a")) DP.closeSearch(); });
  $("#s-all").addEventListener("click", DP.closeSearch);
  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || "")) || e.target.isContentEditable;
    if (e.key === "Escape") {
      if (searchOpen) DP.closeSearch();
      else if (menuOpen) { setMenu(false); $("#open-menu").focus(); }
      else if (DP.closePanel) DP.closePanel();
    } else if ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
      e.preventDefault();
      DP.openSearch();
    }
  });

  DP.ui = { poster, card, rail, sectionHead, favButton };
})(window.DP);
