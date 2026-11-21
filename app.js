(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const { norm, parseDate, load } = Catalog;
  const PAGE = CONFIG.pageSize;
  const mq = window.matchMedia("(min-width: 1000px)");

  const ICONS = {
    menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
    search: "M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
    close: "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
    up: "M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z",
    expand: "M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z",
    share: "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z",
    open: "M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z",
    sort: "M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z",
    games: "M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
    apps: "M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z",
    phone: "M17 1.01 7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"
  };
  const SVGNS = "http://www.w3.org/2000/svg";
  function icon(name) {
    const s = document.createElementNS(SVGNS, "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("class", "icon");
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
  function btn(cls, text, type) {
    const b = el("button", cls, text);
    b.type = type || "button";
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
  function hue(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }
  function initials(t) {
    const w = t.replace(/^the\s+/i, "").split(/\s+/).filter(Boolean);
    return ((w[0] || "?")[0] + (w[1] ? w[1][0] : (w[0] || "")[1] || "")).toUpperCase();
  }

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
  const SORTS = [["added", "Ditambah"], ["updated", "Diperbarui"], ["az", "A-Z"]];

  const state = { games: [], byNorm: new Map(), bySlug: new Map(), apps: [], platforms: [], stale: false, view: "all", platform: "", q: "", sort: "added", reverse: false, shown: PAGE };

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
    const list = state.apps.filter((a) => !q || norm(a.name).includes(q));
    return sorted(list, (a) => a.latest, (a) => a.name);
  }

  function media(g, cls) {
    const box = el("div", "media " + (cls || ""));
    box.setAttribute("aria-hidden", "true");
    const fallback = () => {
      box.replaceChildren();
      box.style.background = "hsl(" + hue(g.name) + " 55% 82%)";
      box.textContent = initials(g.name);
    };
    const src = safeUrl(g.cover);
    if (src) {
      const img = new Image();
      img.alt = "";
      img.loading = "lazy";
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

  function card(g) {
    const li = el("li");
    const b = btn("card");
    const body = el("div", "card-body");
    body.appendChild(el("h2", "", g.name));
    body.appendChild(el("p", "supporting", [g.platforms.join(", "), g.year].filter(Boolean).join(" / ")));
    const rp = repPort(g);
    if (rp && rp.project) body.appendChild(el("span", "chip", rp.project));
    b.append(media(g), body);
    b.addEventListener("click", () => { location.hash = g.slug; });
    li.appendChild(b);
    return li;
  }

  function appCard(a) {
    const li = el("li");
    const art = el("article", "app-card");
    const head = el("div", "app-head");
    head.append(el("h2", "", a.name), el("span", "pill", a.games.length + " game"));
    art.appendChild(head);
    if (a.latest) art.appendChild(el("p", "supporting", "Diperbarui " + fmtDate(a.latest)));
    if (a.games.length) {
      const panel = el("div", "app-panel");
      panel.hidden = true;
      const tg = btn("btn tonal wide", "Lihat game yang didukung");
      tg.setAttribute("aria-expanded", "false");
      tg.appendChild(icon("expand"));
      const rows = [];
      if (a.games.length >= 8) {
        const f = el("input", "field");
        f.type = "search";
        f.placeholder = "Filter " + a.games.length + " game";
        f.setAttribute("aria-label", "Filter game");
        f.addEventListener("input", () => {
          const q = norm(f.value);
          rows.forEach((r) => { r.el.hidden = !!q && !r.n.includes(q); });
        });
        panel.appendChild(f);
      }
      const ul = el("div", "app-games");
      a.games.forEach((g) => {
        const r = btn("app-game", g.name);
        if (g.year) r.appendChild(el("span", "year", g.year));
        r.addEventListener("click", () => { location.hash = g.slug; });
        rows.push({ el: r, n: norm(g.name) });
        ul.appendChild(r);
      });
      panel.appendChild(ul);
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
    $("count").textContent = items.length + (apps ? " aplikasi" : " game");
    $("empty").hidden = items.length > 0;
    const more = $("more");
    more.replaceChildren();
    if (items.length > state.shown) {
      const b = btn("btn filled wide", "Muat lebih banyak (" + (items.length - state.shown) + ")");
      b.addEventListener("click", () => { state.shown += PAGE; render(); });
      more.appendChild(b);
    }
    $("clear").hidden = !state.q;
    syncNav();
  }

  function navItem(label, iconName, onClick, key, count) {
    const b = btn("nav-item");
    b.dataset.key = key;
    if (iconName) b.appendChild(icon(iconName));
    b.appendChild(el("span", "nav-label", label));
    if (count !== undefined) b.appendChild(el("span", "nav-count", String(count)));
    b.addEventListener("click", onClick);
    return b;
  }

  function buildDrawer() {
    const nav = $("drawer-nav");
    nav.replaceChildren();
    nav.appendChild(navItem("Semua game", "games", () => setView("all"), "all", state.games.length));
    nav.appendChild(navItem("Aplikasi multi-game", "apps", () => setView("apps"), "apps", state.apps.length));
    nav.appendChild(navItem("Dual Screen", "phone", () => setView("dual"), "dual", state.games.filter((g) => g.dual).length));
    nav.appendChild(el("div", "nav-divider"));
    nav.appendChild(el("p", "nav-heading", "Platform"));
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
      d.dataset.group = name;
      const s = el("summary", "nav-item group-head");
      s.append(el("span", "nav-label", name), icon("expand"));
      d.appendChild(s);
      items.forEach((p) => d.appendChild(navItem(p, "", () => setView("platform", p), "p:" + norm(p), counts.get(norm(p)) || 0)));
      nav.appendChild(d);
    });
    syncNav();
  }

  function syncNav() {
    const key = state.view === "platform" ? "p:" + norm(state.platform) : state.view;
    document.querySelectorAll("#drawer-nav .nav-item[data-key]").forEach((b) => {
      const on = b.dataset.key === key;
      b.classList.toggle("active", on);
      if (on) { b.setAttribute("aria-current", "page"); const d = b.closest("details"); if (d) d.open = true; }
      else b.removeAttribute("aria-current");
    });
  }

  function syncInert() {
    $("drawer").inert = !mq.matches && !$("drawer").classList.contains("open");
  }
  function setDrawer(open) {
    $("drawer").classList.toggle("open", open);
    $("scrim").classList.toggle("show", open);
    document.body.classList.toggle("lock", open && !mq.matches);
    syncInert();
    if (open) { const f = $("drawer").querySelector(".nav-item"); if (f) f.focus(); }
    else if (!mq.matches) $("menu").focus();
  }

  function setView(view, platform) {
    state.view = view;
    state.platform = platform || "";
    state.q = "";
    state.shown = PAGE;
    $("q").value = "";
    if (!mq.matches) setDrawer(false);
    render();
    window.scrollTo({ top: 0 });
  }

  function setupControls() {
    const seg = $("seg");
    SORTS.forEach(([k, label]) => {
      const b = btn("", label);
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
    $("q").addEventListener("input", (e) => {
      state.q = e.target.value.trim();
      state.shown = PAGE;
      render();
    });
    $("clear").addEventListener("click", () => {
      $("q").value = "";
      state.q = "";
      render();
      $("q").focus();
    });
    $("reset").addEventListener("click", () => { $("q").value = ""; state.q = ""; render(); });
    $("menu").addEventListener("click", () => setDrawer(true));
    $("drawer-close").addEventListener("click", () => setDrawer(false));
    $("scrim").addEventListener("click", () => setDrawer(false));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && $("drawer").classList.contains("open")) setDrawer(false);
    });
    mq.addEventListener("change", () => { setDrawer(false); syncInert(); });
    $("fab").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", () => $("fab").classList.toggle("show", window.scrollY > 600), { passive: true });
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
  function portBlock(p) {
    const box = el("section", "port");
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
    if (main) actions.appendChild(linkBtn(main, /github\.com/i.test(main) ? "Buka di GitHub" : "Buka tautan", "filled"));
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
    hb.appendChild(el("h3", "", g.name));
    const chips = el("div", "chips");
    [g.year, g.genre].concat(g.platforms).filter(Boolean).forEach((c) => chips.appendChild(el("span", "chip", c)));
    hb.appendChild(chips);
    head.append(media(g, "big"), hb);
    body.appendChild(head);
    if (g.description) {
      const d = el("p", "desc clamp", g.description.replace(/\s*\|\|\|\s*/g, "\n").trim());
      body.appendChild(d);
      if (g.description.length > 200) {
        const t = btn("link", "Selengkapnya");
        t.addEventListener("click", () => { t.textContent = d.classList.toggle("clamp") ? "Selengkapnya" : "Ringkas"; });
        body.appendChild(t);
      }
    }
    body.appendChild(el("h4", "section-title", g.ports.length + " port tersedia"));
    g.ports.forEach((p) => body.appendChild(portBlock(p)));
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
    s.replaceChildren(el("div", "loader"), el("p", "", "Memuat katalog"));
    s.hidden = false;
  }
  function showError(err) {
    const s = $("status");
    const box = el("div", "error");
    box.append(el("h2", "", "Katalog gagal dimuat"), el("p", "", err && err.message ? err.message : "Terjadi kesalahan."));
    const r = btn("btn filled", "Coba lagi");
    r.addEventListener("click", init);
    box.appendChild(r);
    s.replaceChildren(box);
  }

  async function init() {
    showLoader();
    try {
      const cat = await load();
      state.games = cat.games.map(prepare);
      state.byNorm = new Map(state.games.map((g) => [g.key, g]));
      state.bySlug = new Map(state.games.map((g) => [g.slug, g]));
      state.apps = getApps(state.games);
      state.platforms = cat.platformOrder;
      state.stale = cat.stale;
      $("status").replaceChildren();
      if (cat.stale) $("status").appendChild(el("p", "stale", "Sumber data tidak bisa dijangkau. Menampilkan data tersimpan."));
      buildDrawer();
      render();
      route();
    } catch (err) {
      console.error(err);
      showError(err);
    }
  }

  document.querySelectorAll("[data-icon]").forEach((n) => n.appendChild(icon(n.dataset.icon)));
  setupControls();
  syncInert();
  init();
})();
