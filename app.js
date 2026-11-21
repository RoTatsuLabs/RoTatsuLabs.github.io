(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const { norm, parseDate, load } = Catalog;
  const PAGE = CONFIG.pageSize;
  const mqRail = window.matchMedia("(min-width: 600px)");
  const mqPush = window.matchMedia("(min-width: 1200px)");
  const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const ICONS = {
    menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
    search: "M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
    close: "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
    expand: "M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z",
    share: "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z",
    open: "M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z",
    sort: "M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z",
    games: "M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
    apps: "M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z",
    phone: "M17 1.01 7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z",
    layers: "M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z",
    check: "M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
    auto: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18V4c4.41 0 8 3.59 8 8s-3.59 8-8 8z",
    light: "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z",
    dark: "M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"
  };
  const SVGNS = "http://www.w3.org/2000/svg";
  function icon(name, cls) {
    const s = document.createElementNS(SVGNS, "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("class", "icon" + (cls ? " " + cls : ""));
    s.setAttribute("aria-hidden", "true");
    const p = document.createElementNS(SVGNS, "path");
    p.setAttribute("d", ICONS[name]);
    s.appendChild(p);
    return s;
  }
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function btn(cls, text) {
    const b = el("button", cls, text);
    b.type = "button";
    return b;
  }
  const safeUrl = (u) => {
    try {
      const x = new URL(u);
      return /^https?:$/.test(x.protocol) ? x.href : "";
    } catch (e) { return ""; }
  };
  const fmtDate = (d) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const dateText = (v) => { const d = parseDate(v); return d ? fmtDate(d) : v; };
  function hash(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
  function initials(t) {
    const w = t.replace(/^the\s+/i, "").split(/\s+/).filter(Boolean);
    return ((w[0] || "?")[0] + (w[1] ? w[1][0] : (w[0] || "")[1] || "")).toUpperCase();
  }

  /* loading indicator: polygons morph between shapes while the catalog downloads; stops as soon as data arrives */
  const Loader = (function () {
    const N = 96;
    const SHAPES = [
      { n: 0, a: 0, sx: 1, sy: 1 },
      { n: 9, a: 0.1 },
      { n: 5, a: 0.08 },
      { n: 8, a: 0.14 },
      { n: 0, a: 0, sx: 1, sy: 0.68 },
      { n: 6, a: 0.11 }
    ];
    const pts = (s) => {
      const o = [];
      for (let i = 0; i < N; i++) {
        const t = (Math.PI * 2 * i) / N;
        const r = 1 + (s.a || 0) * Math.cos((s.n || 0) * t);
        o.push([r * Math.cos(t) * (s.sx || 1), r * Math.sin(t) * (s.sy || 1)]);
      }
      return o;
    };
    const SETS = SHAPES.map(pts);
    const ease = (p) => {
      const z = 0.8, w = Math.sqrt(380), wd = w * Math.sqrt(1 - z * z), t = p * 0.42;
      return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
    };
    const path = (a, b, k) => {
      let d = "";
      for (let i = 0; i < N; i++) {
        const x = a[i][0] + (b[i][0] - a[i][0]) * k, y = a[i][1] + (b[i][1] - a[i][1]) * k;
        d += (i ? "L" : "M") + x.toFixed(3) + " " + y.toFixed(3);
      }
      return d + "Z";
    };
    let raf = 0;
    function node() {
      const wrap = el("div", "loader");
      const svg = document.createElementNS(SVGNS, "svg");
      svg.setAttribute("viewBox", "-1.3 -1.3 2.6 2.6");
      svg.setAttribute("aria-hidden", "true");
      const g = document.createElementNS(SVGNS, "g");
      const p = document.createElementNS(SVGNS, "path");
      p.setAttribute("d", path(SETS[0], SETS[0], 0));
      g.appendChild(p);
      svg.appendChild(g);
      wrap.appendChild(svg);
      if (!mqMotion.matches) {
        const t0 = performance.now();
        const step = (now) => {
          const el_ = Math.max(0, now - t0), i = Math.floor(el_ / 700), k = ease(Math.min((el_ % 700) / 420, 1));
          p.setAttribute("d", path(SETS[i % SETS.length], SETS[(i + 1) % SETS.length], k));
          g.setAttribute("transform", "rotate(" + ((el_ / 4200) * 360).toFixed(1) + ")");
          raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      }
      return wrap;
    }
    return { node, stop: () => { cancelAnimationFrame(raf); raf = 0; } };
  })();

  const GROUPS = [
    ["Nintendo", /nintendo|game ?boy|famicom|\bnes\b|\bsnes\b|gamecube|\bwii\b|\b3?ds\b|switch|virtual boy|game & watch/],
    ["Sony", /sony|playstation|\bps\d?\b|\bpsp\b|vita|psx/],
    ["Sega", /sega|genesis|mega drive|saturn|dreamcast|master system|game gear/],
    ["Xbox", /xbox/]
  ];
  const groupOf = (label) => {
    const n = norm(label);
    for (const [name, re] of GROUPS) if (re.test(n)) return name;
    return "Lainnya";
  };
  const SORTS = [["az", "A-Z"], ["added", "Ditambah"], ["updated", "Diperbarui"]];

  const state = { games: [], bySlug: new Map(), apps: [], platforms: [], recent: [], view: "all", platform: "", q: "", sort: "az", reverse: false, shown: PAGE, ready: false };

  function prepare(g) {
    g.dual = g.ports.some((p) => norm(p.project).includes("dual screen"));
    g.search = norm([g.name].concat(g.ports.map((p) => p.project + " " + p.developer)).join(" "));
    return g;
  }

  function getApps(games) {
    const map = new Map();
    for (const g of games) for (const p of g.ports) {
      const project = (p.project || "").trim(), np = norm(project);
      const marked = ["multi-game apps", "multi game apps"].includes(norm(p.platform));
      if (np === "unofficial port" || np === "android port") continue;
      const name = marked ? g.name : project;
      if (!name) continue;
      const key = norm(name);
      if (!map.has(key)) map.set(key, { name, games: new Map(), latest: null, marked: false });
      const a = map.get(key);
      if (marked) a.marked = true;
      else if (project && !a.games.has(g.key)) a.games.set(g.key, g);
      const d = parseDate(p.lastUpdate);
      if (d && (!a.latest || d > a.latest)) a.latest = d;
    }
    const out = [];
    for (const a of map.values()) {
      if (a.games.size <= 1 && !a.marked) continue;
      a.games = [...a.games.values()].sort((x, y) => x.name.localeCompare(y.name, "en", { sensitivity: "base" }));
      out.push(a);
    }
    return out;
  }

  function sorted(list, getDate, getName) {
    const dir = state.reverse ? -1 : 1;
    const key = state.sort === "added" ? "added" : "updated";
    return list.sort((a, b) => {
      if (state.sort === "az") return getName(a).localeCompare(getName(b), "en", { sensitivity: "base" }) * dir;
      const x = getDate(a, key), y = getDate(b, key);
      if (!x && !y) return 0;
      if (!x) return 1;
      if (!y) return -1;
      return (y - x) * dir;
    });
  }
  function visibleGames() {
    const q = norm(state.q);
    const list = state.games.filter((g) => {
      if (state.view === "dual" && !g.dual) return false;
      if (state.view === "platform" && !g.platforms.some((p) => norm(p) === norm(state.platform))) return false;
      return !q || g.search.includes(q);
    });
    return sorted(list, (g, k) => g[k], (g) => g.name);
  }
  function visibleApps() {
    const q = norm(state.q);
    return sorted(state.apps.filter((a) => !q || norm(a.name).includes(q)), (a) => a.latest, (a) => a.name);
  }

  function media(g, cls, eager) {
    const box = el("div", "media tone-" + (hash(g.name) % 3) + (cls ? " " + cls : ""));
    box.setAttribute("aria-hidden", "true");
    const fallback = () => { box.replaceChildren(); box.textContent = initials(g.name); };
    const src = safeUrl(g.cover);
    if (src) {
      const img = new Image();
      img.alt = "";
      img.width = 144;
      img.height = 192;
      img.decoding = "async";
      if (eager) img.setAttribute("fetchpriority", "high"); else img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      img.onerror = fallback;
      img.src = src;
      box.appendChild(img);
    } else fallback();
    return box;
  }
  function repPort(g) {
    let best = null, bd = null;
    for (const p of g.ports) {
      const d = parseDate(p.lastUpdate);
      if (d && (!bd || d > bd)) { best = p; bd = d; }
    }
    return best || g.ports[0];
  }
  const openGame = (g) => { location.hash = g.slug; };

  function card(g) {
    const li = el("li");
    const b = btn("card");
    const body = el("div", "card-body");
    body.appendChild(el("h3", "", g.name));
    body.appendChild(el("p", "supporting", [g.platforms.join(", "), g.year].filter(Boolean).join(" / ")));
    const rp = repPort(g);
    if (rp && rp.project) body.appendChild(el("span", "chip", rp.project));
    b.append(media(g), body);
    b.addEventListener("click", () => openGame(g));
    li.appendChild(b);
    return li;
  }
  function slide(g, i) {
    const li = el("li");
    const b = btn("slide" + (i === 0 ? " lg" : i === 1 ? " md" : ""));
    b.setAttribute("aria-label", g.name);
    const cap = el("span", "cap");
    cap.append(el("strong", "", g.name), el("span", "", g.platforms[0] || ""));
    b.append(media(g, "", i < 2), cap);
    b.addEventListener("click", () => openGame(g));
    li.appendChild(b);
    return li;
  }

  function appCard(a) {
    const li = el("li");
    const art = el("article", "app-card");
    const head = el("div", "app-head");
    head.append(el("h3", "", a.name), el("span", "chip", a.games.length + " game"));
    art.appendChild(head);
    if (a.latest) art.appendChild(el("p", "supporting", "Diperbarui " + fmtDate(a.latest)));
    if (a.games.length) {
      const panel = el("div", "app-panel");
      panel.hidden = true;
      const tg = btn("btn tonal", "Lihat game yang didukung");
      tg.setAttribute("aria-expanded", "false");
      tg.appendChild(icon("expand", "chev"));
      const rows = [];
      const list = el("div", "app-games");
      if (a.games.length >= 8) {
        const id = "f" + hash(a.name);
        const lab = el("label", "", "Filter game");
        lab.htmlFor = id;
        const f = el("input", "field");
        f.id = id;
        f.type = "search";
        f.addEventListener("input", () => {
          const q = norm(f.value);
          rows.forEach((r) => { r.el.hidden = !!q && !r.n.includes(q); });
        });
        panel.append(lab, f);
      }
      a.games.forEach((g) => {
        const r = btn("app-game", g.name);
        if (g.year) r.appendChild(el("span", "year", g.year));
        r.addEventListener("click", () => openGame(g));
        rows.push({ el: r, n: norm(g.name) });
        list.appendChild(r);
      });
      panel.appendChild(list);
      tg.addEventListener("click", () => {
        const open = panel.hidden;
        panel.hidden = !open;
        tg.setAttribute("aria-expanded", String(open));
        tg.classList.toggle("open", open);
      });
      art.append(tg, panel);
    }
    li.appendChild(art);
    return li;
  }

  const viewTitle = () => state.view === "apps" ? "Aplikasi multi-game" : state.view === "dual" ? "Dual Screen" : state.view === "platform" ? state.platform : "Semua game";

  function render() {
    $("view-title").textContent = viewTitle();
    const apps = state.view === "apps";
    const items = apps ? visibleApps() : visibleGames();
    const list = $("list");
    list.replaceChildren();
    items.slice(0, state.shown).forEach((x) => list.appendChild(apps ? appCard(x) : card(x)));
    $("count").textContent = state.ready ? items.length + (apps ? " aplikasi" : " game") : "";
    const empty = state.ready && items.length === 0;
    $("empty").hidden = !empty;
    if (empty) $("empty-text").textContent = state.q
      ? "Tidak ada hasil untuk \"" + state.q + "\" di " + viewTitle().toLowerCase() + ". Coba kata kunci lain."
      : "Belum ada entri di " + viewTitle().toLowerCase() + ".";
    $("reset").hidden = !state.q;
    const more = $("more");
    more.replaceChildren();
    if (items.length > state.shown) {
      const b = btn("btn filled lg", "Tampilkan " + Math.min(PAGE, items.length - state.shown) + " lagi (" + (items.length - state.shown) + " tersisa)");
      b.addEventListener("click", () => { state.shown += PAGE; render(); });
      more.appendChild(b);
    }
    const showRecent = state.ready && state.view === "all" && !state.q && state.recent.length > 0;
    $("recent").hidden = !showRecent;
    if (showRecent && !$("carousel").children.length) state.recent.forEach((g, i) => $("carousel").appendChild(slide(g, i)));
    $("clear").hidden = !state.q;
    syncNav();
  }

  /* navigation rail: collapsed on wide screens, expanded as modal on phones */
  function railItem(label, iconName, onClick, key, count) {
    const b = btn("rail-item");
    b.dataset.key = key;
    const ind = el("span", "ind");
    if (iconName) ind.appendChild(icon(iconName));
    b.append(ind, el("span", "label", label));
    if (count !== undefined) b.appendChild(el("span", "rail-count", String(count)));
    b.addEventListener("click", onClick);
    return b;
  }
  function buildRail() {
    const nav = $("rail-nav");
    nav.replaceChildren();
    nav.appendChild(railItem("Semua game", "games", () => setView("all"), "all", state.games.length));
    nav.appendChild(railItem("Multi-game", "apps", () => setView("apps"), "apps", state.apps.length));
    nav.appendChild(railItem("Dual Screen", "phone", () => setView("dual"), "dual", state.games.filter((g) => g.dual).length));
    const only = railItem("Platform", "layers", () => setRail(true), "platform-all");
    only.classList.add("rail-collapsed-only");
    nav.appendChild(only);
    const wide = el("div", "rail-expanded-only");
    wide.appendChild(el("div", "rail-sep"));
    wide.appendChild(el("p", "rail-heading", "Platform"));
    const counts = new Map();
    state.games.forEach((g) => g.platforms.forEach((p) => counts.set(norm(p), (counts.get(norm(p)) || 0) + 1)));
    const buckets = new Map();
    state.platforms.forEach((p) => {
      const n = norm(p);
      if (n === "multi-game apps" || n === "multi game apps") return;
      const g = groupOf(p);
      if (!buckets.has(g)) buckets.set(g, []);
      buckets.get(g).push(p);
    });
    [...GROUPS.map((g) => g[0]), "Lainnya"].forEach((name) => {
      const items = buckets.get(name);
      if (!items) return;
      const d = el("details", "group");
      const s = el("summary", "rail-item group-head");
      s.append(el("span", "label", name), icon("expand", "chev"));
      d.appendChild(s);
      items.forEach((p) => {
        const it = railItem(p, "", () => setView("platform", p), "p:" + norm(p), counts.get(norm(p)) || 0);
        it.querySelector(".ind").remove();
        d.appendChild(it);
      });
      wide.appendChild(d);
    });
    nav.appendChild(wide);
    syncNav();
  }
  function syncNav() {
    const key = state.view === "platform" ? "p:" + norm(state.platform) : state.view;
    document.querySelectorAll("#rail-nav .rail-item[data-key]").forEach((b) => {
      const k = b.dataset.key;
      const on = k === key || (k === "platform-all" && state.view === "platform");
      if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
      if (on && k.startsWith("p:")) { const d = b.closest("details"); if (d) d.open = true; }
    });
  }

  let railOpener = null;
  const rail = $("rail");
  const isModal = () => !mqRail.matches || !mqPush.matches;
  function syncRail() {
    const open = rail.classList.contains("expanded");
    const modal = open && isModal();
    $("scrim").classList.toggle("show", modal);
    $("app").classList.toggle("rail-open", open);
    document.body.classList.toggle("lock", modal && !mqRail.matches);
    $("content").inert = modal;
    rail.inert = !mqRail.matches && !open;
    ["rail-toggle", "menu"].forEach((id) => {
      $(id).setAttribute("aria-expanded", String(open));
    });
    $("rail-toggle").setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    $("rail-toggle").replaceChildren(icon(open ? "close" : "menu"));
  }
  function setRail(open) {
    if (open) railOpener = document.activeElement;
    rail.classList.toggle("expanded", open);
    syncRail();
    if (open) {
      const f = rail.querySelector(".rail-item[aria-current='page']") || rail.querySelector(".rail-item") || $("rail-toggle");
      setTimeout(() => f && f.focus(), 0);
    } else {
      const back = mqRail.matches ? $("rail-toggle") : $("menu");
      if (railOpener && document.contains(railOpener) && railOpener.offsetParent !== null) railOpener.focus(); else back.focus();
    }
  }
  function setView(view, platform) {
    state.view = view;
    state.platform = platform || "";
    state.q = "";
    state.shown = PAGE;
    $("q").value = "";
    if (isModal() && rail.classList.contains("expanded")) setRail(false);
    render();
    window.scrollTo({ top: 0 });
  }
  function focusSearch() {
    if (rail.classList.contains("expanded") && isModal()) setRail(false);
    window.scrollTo({ top: 0, behavior: mqMotion.matches ? "auto" : "smooth" });
    setTimeout(() => $("q").focus({ preventScroll: true }), 60);
  }

  const THEMES = [["auto", "otomatis"], ["light", "terang"], ["dark", "gelap"]];
  let theme = "auto";
  try { const t = localStorage.getItem("dermaga-port:theme"); if (t === "light" || t === "dark") theme = t; } catch (e) {}
  function applyTheme(announce) {
    const root = document.documentElement;
    if (theme === "auto") delete root.dataset.theme; else root.dataset.theme = theme;
    const label = THEMES.find((t) => t[0] === theme)[1];
    const b = $("theme");
    b.replaceChildren(icon(theme));
    b.setAttribute("aria-label", "Tema: " + label + ". Ketuk untuk mengganti.");
    b.title = "Tema: " + label;
    try { if (theme === "auto") localStorage.removeItem("dermaga-port:theme"); else localStorage.setItem("dermaga-port:theme", theme); } catch (e) {}
    if (announce) snack("Tema: " + label);
  }

  function setupControls() {
    const seg = $("seg");
    SORTS.forEach(([k, label]) => {
      const b = btn("", "");
      b.append(icon("check", "chk"), el("span", "", label));
      b.setAttribute("aria-pressed", String(k === state.sort));
      b.addEventListener("click", () => {
        state.sort = k;
        state.shown = PAGE;
        [...seg.children].forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        render();
      });
      seg.appendChild(b);
    });
    $("reverse").addEventListener("click", () => {
      state.reverse = !state.reverse;
      $("reverse").setAttribute("aria-pressed", String(state.reverse));
      state.shown = PAGE;
      render();
    });
    $("q").addEventListener("input", (e) => { state.q = e.target.value.trim(); state.shown = PAGE; render(); });
    $("clear").addEventListener("click", () => { $("q").value = ""; state.q = ""; render(); $("q").focus(); });
    $("reset").addEventListener("click", () => { $("q").value = ""; state.q = ""; render(); $("q").focus(); });
    $("menu").addEventListener("click", () => setRail(true));
    $("rail-toggle").addEventListener("click", () => setRail(!rail.classList.contains("expanded")));
    $("scrim").addEventListener("click", () => setRail(false));
    $("rail-fab").addEventListener("click", focusSearch);
    $("fab").addEventListener("click", focusSearch);
    $("theme").addEventListener("click", () => {
      theme = THEMES[(THEMES.findIndex((t) => t[0] === theme) + 1) % THEMES.length][0];
      applyTheme(true);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && rail.classList.contains("expanded") && isModal()) setRail(false);
    });
    const onViewport = () => { if (!isModal() && rail.classList.contains("expanded")) $("scrim").classList.remove("show"); syncRail(); };
    mqRail.addEventListener("change", onViewport);
    mqPush.addEventListener("change", onViewport);
    window.addEventListener("scroll", () => $("fab").classList.toggle("show", window.scrollY > 480), { passive: true });
  }

  function snack(text) {
    const s = $("snack");
    s.textContent = text;
    s.classList.add("show");
    clearTimeout(snack.t);
    snack.t = setTimeout(() => s.classList.remove("show"), 2200);
  }

  const dlg = $("sheet");
  function fact(dl, label, value) {
    if (!value) return;
    const d = el("div");
    d.append(el("dt", "", label), el("dd", "", value));
    dl.appendChild(d);
  }
  function linkBtn(href, text, cls) {
    const a = el("a", "btn " + cls, text);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.appendChild(icon("open"));
    return a;
  }
  function portBlock(p, featured) {
    const box = el("section", "port" + (featured ? " featured" : ""));
    if (featured) box.appendChild(el("span", "tag", "Pembaruan terbaru"));
    box.appendChild(el("h4", "", p.project || "Port"));
    const dl = el("dl", "facts");
    fact(dl, "Platform", p.platform);
    fact(dl, "Developer", p.developer);
    fact(dl, "Versi", p.version);
    fact(dl, "Pembaruan terakhir", p.lastUpdate && dateText(p.lastUpdate));
    fact(dl, "Kontrol", p.controller);
    fact(dl, "File game", p.files);
    fact(dl, "Berfungsi", p.works);
    box.appendChild(dl);
    if (p.notes) box.appendChild(el("p", "note", p.notes));
    const main = safeUrl(p.url) || safeUrl(p.link);
    const actions = el("div", "actions");
    if (main) actions.appendChild(linkBtn(main, /github\.com/i.test(main) ? "Buka di GitHub" : "Buka tautan", "filled lg"));
    const proj = safeUrl(p.link);
    if (proj && proj !== main) actions.appendChild(linkBtn(proj, "Halaman proyek", "tonal"));
    const data = safeUrl(p.dataUrl);
    if (data) actions.appendChild(linkBtn(data, "Data game", "tonal"));
    if (actions.children.length) box.appendChild(actions);
    return box;
  }
  function openSheet(g) {
    const body = $("sheet-body");
    body.replaceChildren();
    const head = el("div", "sheet-head");
    const hb = el("div");
    const title = el("h2", "", g.name);
    title.id = "sheet-title";
    hb.appendChild(title);
    const chips = el("div", "chips");
    [g.year, g.genre].filter(Boolean).forEach((c) => chips.appendChild(el("span", "chip plain", c)));
    g.platforms.forEach((c) => chips.appendChild(el("span", "chip", c)));
    hb.appendChild(chips);
    head.append(media(g, "big", true), hb);
    body.appendChild(head);
    if (g.description) {
      const d = el("p", "desc clamp", g.description.replace(/\s*\|\|\|\s*/g, "\n").trim());
      body.appendChild(d);
      if (g.description.length > 200) {
        const t = btn("link-btn", "Selengkapnya");
        t.setAttribute("aria-expanded", "false");
        t.addEventListener("click", () => {
          const clamped = d.classList.toggle("clamp");
          t.textContent = clamped ? "Selengkapnya" : "Ringkas";
          t.setAttribute("aria-expanded", String(!clamped));
        });
        body.appendChild(t);
      }
    }
    body.appendChild(el("h3", "section-title", g.ports.length + " port tersedia"));
    const feat = repPort(g);
    const ordered = [feat].concat(g.ports.filter((p) => p !== feat));
    ordered.forEach((p, i) => body.appendChild(portBlock(p, i === 0 && g.ports.length > 1)));
    if (!dlg.open) dlg.showModal();
    dlg.querySelector(".sheet").scrollTop = 0;
  }
  function route() {
    const g = state.bySlug.get(decodeURIComponent(location.hash.slice(1)));
    if (g) openSheet(g);
    else if (dlg.open) dlg.close();
  }
  function closeSheet() { if (location.hash) history.back(); else dlg.close(); }
  $("sheet-close").addEventListener("click", closeSheet);
  dlg.addEventListener("click", (e) => { if (e.target === dlg) closeSheet(); });
  dlg.addEventListener("close", () => {
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  });
  window.addEventListener("hashchange", route);
  $("share").addEventListener("click", async () => {
    try {
      if (navigator.share) await navigator.share({ url: location.href });
      else { await navigator.clipboard.writeText(location.href); snack("Tautan disalin"); }
    } catch (e) {}
  });

  function showLoader() {
    const s = $("status");
    s.replaceChildren(Loader.node(), el("p", "note", "Memuat katalog dari sumber data. Ini bisa butuh beberapa detik."));
  }
  function showError(err) {
    Loader.stop();
    const s = $("status");
    const box = el("div", "error");
    box.setAttribute("role", "alert");
    box.append(
      el("h2", "", "Katalog tidak bisa dimuat"),
      el("p", "", (err && err.message ? err.message + " " : "") + "Periksa koneksi internet kamu, lalu muat ulang katalog.")
    );
    const r = btn("btn lg", "Muat ulang katalog");
    r.addEventListener("click", init);
    box.appendChild(r);
    s.replaceChildren(box);
  }

  async function init() {
    showLoader();
    try {
      const cat = await load();
      Loader.stop();
      state.games = cat.games.map(prepare);
      state.bySlug = new Map(state.games.map((g) => [g.slug, g]));
      state.apps = getApps(state.games);
      state.platforms = cat.platformOrder;
      state.recent = state.games.filter((g) => g.added).sort((a, b) => b.added - a.added).slice(0, 8);
      state.ready = true;
      $("status").replaceChildren();
      if (cat.stale) $("status").appendChild(el("p", "stale", "Sumber data tidak bisa dijangkau. Menampilkan salinan terakhir yang tersimpan di browser ini."));
      buildRail();
      render();
      route();
    } catch (err) {
      console.error(err);
      showError(err);
    }
  }

  document.querySelectorAll("[data-icon]").forEach((n) => n.appendChild(icon(n.dataset.icon)));
  setupControls();
  applyTheme(false);
  syncRail();
  render();
  init();
})();
