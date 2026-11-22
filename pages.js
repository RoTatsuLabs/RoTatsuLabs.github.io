(function (DP) {
  "use strict";
  const { $, $$, h, icon } = DP;
  const U = () => DP.ui;
  const PAGE = 36;
  const NAPL = "https://fe2rr.github.io/";
  const REPO = "https://github.com/RoTatsuLabs/RoTatsuLabs.github.io";

  const wrap = (cls, ...kids) => h("div", { class: "wrap" + (cls ? " " + cls : "") }, ...kids);
  const reveal = (n, d) => { n.setAttribute("data-reveal", ""); if (d) n.style.setProperty("--d", d + "ms"); return n; };
  const para = (t) => t.split(/\s*\|\|\|\s*/).filter(Boolean).map((x) => h("p", null, x));
  const statusOf = (t) => {
    const n = DP.norm(t || "");
    if (!n) return "";
    if (/partial|some|minor|issue|bug|glitch|mostly|unstable/.test(n)) return "warn";
    if (/^(yes|works|working|playable|ok|full|100|true)/.test(n)) return "good";
    if (/^(no|not|broken|doesn|crash|false)/.test(n)) return "bad";
    return "";
  };
  const repPort = (g) => {
    let best = null, bd = null;
    for (const p of g.ports) { const d = DP.parseDate(p.lastUpdate); if (d && (!bd || d > bd)) { best = p; bd = d; } }
    return best || g.ports[0];
  };
  const crumbs = (items) => h("nav", { class: "crumbs", "aria-label": "Breadcrumb" },
    items.map((it, i) => [i ? icon("chevr", "sep") : null, it.href ? h("a", { href: it.href }, it.text) : h("span", { "aria-current": "page" }, it.text)]));

  /* ---------- home ---------- */
  function home() {
    const S = DP.state, U_ = U();
    const cols = window.innerWidth < 700 ? 3 : 6, K = [0.16, 0.38, 0.1, 0.3, 0.22, 0.44];
    const pool = S.byAdded.filter((g) => g.cover).slice(0, cols * 4);
    const wall = h("div", { class: "wall", "aria-hidden": "true", style: "--cols:" + cols });
    for (let c = 0; c < cols; c++) {
      const col = h("div", { class: "wall-col", style: "--k:" + K[c] + ";--c:" + c });
      pool.filter((_, i) => i % cols === c).forEach((g) => col.appendChild(U_.poster(g, "wall")));
      wall.appendChild(col);
    }
    const form = h("form", { class: "hero-search", role: "search" },
      h("label", { class: "sr-only", for: "hq" }, "Search the catalog"),
      icon("search"),
      h("input", { id: "hq", name: "q", type: "search", placeholder: "Search games or developers", autocomplete: "off", enterkeyhint: "search" }),
      h("button", { class: "btn primary", type: "submit" }, "Search"));
    form.addEventListener("submit", (e) => { e.preventDefault(); const q = form.q.value.trim(); location.hash = "/browse" + (q ? "?q=" + encodeURIComponent(q) : ""); });
    const hero = h("section", { class: "hero" }, wall,
      wrap("hero-copy",
        h("h1", null, "Every native Android port, in one place"),
        h("p", { class: "lede" }, "Browse " + DP.num(S.games.length) + " games and " + DP.num(S.portCount) + " community ports. See what runs, how well it runs and where to get it."),
        form,
        h("div", { class: "hero-links" }, h("a", { class: "btn ghost", href: "#/browse" }, "Browse all games", icon("arrow")), h("a", { class: "btn ghost", href: "#/apps" }, "Multi-game apps"))
      ));
    if (!DP.reduced()) {
      const onScroll = () => hero.style.setProperty("--sy", String(Math.min(window.scrollY, 900)));
      window.addEventListener("scroll", onScroll, { passive: true });
      DP.onLeave(() => window.removeEventListener("scroll", onScroll));
    }

    const stat = (n, label) => {
      const v = h("b", { class: "stat-n" }, "0");
      const box = h("div", { class: "stat" }, v, h("span", null, label));
      box.addEventListener("revealed", () => DP.countUp(v, n));
      return reveal(box);
    };
    const stats = h("section", { class: "stats" }, wrap("stats-row",
      stat(S.games.length, "games"), stat(S.portCount, "ports"), stat(S.platformStats.length, "platforms"), stat(S.apps.length, "multi-game apps")));

    const secNew = h("section", { class: "block" }, wrap("", U_.sectionHead("Newly added", "#/browse?sort=added"), U_.rail(S.byAdded.slice(0, 14))));
    reveal(secNew);

    const tiles = S.platformStats.slice(0, 8).map((p, i) => {
      const fan = h("span", { class: "fan", "aria-hidden": "true" }, p.covers.slice(0, 3).map((g, k) => h("span", { class: "fan-item", style: "--k:" + k }, U_.poster(g, "mini"))));
      return reveal(h("a", { class: "ptile", href: "#/browse?platform=" + encodeURIComponent(p.name) }, fan, h("span", { class: "ptile-text" }, h("strong", null, p.name), h("small", null, DP.num(p.count) + (p.count === 1 ? " game" : " games")))), i * 60);
    });
    const secPlat = h("section", { class: "block" }, wrap("", U_.sectionHead("Browse by platform", "#/browse", "All platforms"), h("div", { class: "ptiles" }, tiles)));

    const secUpd = reveal(h("section", { class: "block" }, wrap("", U_.sectionHead("Recently updated", "#/browse?sort=updated"), U_.rail(S.byUpdated.slice(0, 14)))));

    const appsTop = S.apps.slice().sort((a, b) => b.games.length - a.games.length).slice(0, 3);
    const secApps = reveal(h("section", { class: "block" }, wrap("",
      U_.sectionHead("Multi-game apps", "#/apps", "See all apps"),
      h("div", { class: "app-strip" }, appsTop.map((a) => h("a", { class: "app-tile", href: "#/apps?q=" + encodeURIComponent(a.name) },
        h("strong", null, a.name), h("span", null, DP.num(a.games.length) + " games supported"), a.latest ? h("small", null, "Updated " + DP.fmtDate(a.latest)) : null, icon("arrow")))))));

    const cta = reveal(h("section", { class: "block" }, wrap("", h("div", { class: "cta" },
      h("h2", null, "Missing a port, or found a dead link?"),
      h("p", null, "The catalog data comes from the NAPL community sheet. Corrections and new ports are submitted there, and they show up here the next time you open the site."),
      h("a", { class: "btn primary", href: NAPL, target: "_blank", rel: "noopener noreferrer" }, "Open NAPL", icon("open"))))));

    return h("div", { class: "view home" }, hero, stats, secNew, secPlat, secUpd, secApps, cta);
  }

  /* ---------- browse ---------- */
  const SORTS = [["added", "Newest added"], ["updated", "Recently updated"], ["az", "Title A to Z"], ["year-new", "Release year, newest"], ["year-old", "Release year, oldest"], ["ports", "Most ports"]];
  const GROUPS = [
    ["Nintendo", /nintendo|game ?boy|famicom|\bnes\b|\bsnes\b|gamecube|\bwii\b|\b3?ds\b|switch|virtual boy|game & watch/],
    ["Sony", /sony|playstation|\bps\d?\b|\bpsp\b|vita|psx/],
    ["Sega", /sega|genesis|mega drive|saturn|dreamcast|master system|game gear/],
    ["Microsoft", /xbox/]
  ];
  const groupOf = (l) => { const n = DP.norm(l); for (const [name, re] of GROUPS) if (re.test(n)) return name; return "Other"; };
  const FACETS = [
    { key: "platform", title: "Platform", grouped: true },
    { key: "genre", title: "Genre" },
    { key: "decade", title: "Release decade", asc: true },
    { key: "files", title: "Game files" },
    { key: "works", title: "Reported status" }
  ];

  function pass(g, f, skip) {
    if (f.q) { const t = DP.norm(f.q).split(/\s+/).filter(Boolean); if (!t.every((x) => g.search.includes(x))) return false; }
    if (f.dual && !g.dual) return false;
    for (const F of FACETS) {
      if (F.key === skip) continue;
      const sel = f[F.key];
      if (sel.length && !sel.some((v) => g.fv[F.key].has(DP.norm(v)))) return false;
    }
    return true;
  }
  function sortList(list, key) {
    const d = (a, b) => (!a && !b ? 0 : !a ? 1 : !b ? -1 : b - a);
    const by = { added: (a, b) => d(a.added, b.added), updated: (a, b) => d(a.updated, b.updated), az: (a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
      "year-new": (a, b) => (b.yearN || 0) - (a.yearN || 0), "year-old": (a, b) => (a.yearN || 9999) - (b.yearN || 9999), ports: (a, b) => b.ports.length - a.ports.length };
    return list.sort(by[key] || by.added);
  }

  function browse(params) {
    const S = DP.state, U_ = U();
    const f = { q: params.get("q") || "", sort: SORTS.some((s) => s[0] === params.get("sort")) ? params.get("sort") : "added", dual: params.get("dual") === "1" };
    FACETS.forEach((F) => { f[F.key] = params.getAll(F.key); });
    let shown = PAGE, view = DP.pref("view") === "list" ? "list" : "grid", current = [], rendered = 0;
    const refs = {};

    const grid = h("div", { class: "grid " + view, id: "grid" });
    const countEl = h("p", { class: "result-count", "aria-live": "polite" });
    const chipsEl = h("div", { class: "chips", "aria-label": "Active filters" });
    const more = h("div", { class: "more", id: "more" });
    const empty = h("div", { class: "empty", hidden: true }, h("h2", null, "No games match these filters"), h("p", null, "Try removing a filter or searching for a shorter name."), h("button", { class: "btn primary", type: "button", onclick: () => { clearAll(); } }, "Clear all filters"));
    const sentinel = h("div", { class: "sentinel", "aria-hidden": "true" });

    function toURL() {
      const p = new URLSearchParams();
      if (f.q) p.set("q", f.q);
      if (f.sort !== "added") p.set("sort", f.sort);
      if (f.dual) p.set("dual", "1");
      FACETS.forEach((F) => f[F.key].forEach((v) => p.append(F.key, v)));
      const s = p.toString();
      return "#/browse" + (s ? "?" + s : "");
    }
    function active() { return FACETS.reduce((n, F) => n + f[F.key].length, 0) + (f.dual ? 1 : 0); }
    function facetCounts(key) {
      const m = new Map();
      for (const g of S.games) if (pass(g, f, key)) for (const v of g.fv[key]) m.set(v, (m.get(v) || 0) + 1);
      return m;
    }
    function updateCounts() {
      FACETS.forEach((F) => {
        const c = facetCounts(F.key);
        for (const k in refs[F.key]) {
          const r = refs[F.key][k], n = c.get(k) || 0;
          r.cnt.textContent = DP.num(n);
          r.row.classList.toggle("zero", n === 0 && !r.input.checked);
          r.input.checked = f[F.key].some((v) => DP.norm(v) === k);
        }
        const b = $("#fgb-" + F.key);
        if (b) { b.textContent = f[F.key].length ? String(f[F.key].length) : ""; b.classList.toggle("has", f[F.key].length > 0); }
      });
      const dual = $("#f-dual"); if (dual) dual.checked = f.dual;
    }
    function renderChips() {
      const chips = [];
      const mk = (label, fn) => h("button", { class: "chip", type: "button", "aria-label": "Remove filter " + label, onclick: fn }, label, icon("close"));
      if (f.q) chips.push(mk("Search: " + f.q, () => { f.q = ""; $("#bq").value = ""; change(); }));
      FACETS.forEach((F) => f[F.key].forEach((v) => chips.push(mk(v, () => { f[F.key] = f[F.key].filter((x) => x !== v); change(); }))));
      if (f.dual) chips.push(mk("Dual screen", () => { f.dual = false; change(); }));
      if (chips.length > 1) chips.push(h("button", { class: "chip clear", type: "button", onclick: clearAll }, "Clear all"));
      chipsEl.replaceChildren(...chips);
      chipsEl.hidden = !chips.length;
      const fb = $("#filter-open .fcount");
      if (fb) { const n = active(); fb.textContent = n ? String(n) : ""; fb.hidden = !n; }
    }
    function appendCards(from, to) {
      const frag = document.createDocumentFragment();
      current.slice(from, to).forEach((g, i) => frag.appendChild(U_.card(g, i)));
      grid.appendChild(frag);
      rendered = to;
    }
    function renderResults(reset) {
      if (reset) {
        current = sortList(S.games.filter((g) => pass(g, f)), f.sort);
        grid.replaceChildren();
        rendered = 0;
      }
      const end = Math.min(shown, current.length);
      if (end > rendered) appendCards(rendered, end);
      countEl.textContent = DP.num(current.length) + (current.length === 1 ? " game" : " games");
      empty.hidden = current.length > 0;
      const left = current.length - rendered;
      more.replaceChildren();
      if (left > 0) more.appendChild(h("button", { class: "btn ghost", type: "button", onclick: () => { shown += PAGE; renderResults(false); } }, "Show " + Math.min(PAGE, left) + " more (" + DP.num(left) + " left)"));
      const pc = $("#panel-count"); if (pc) pc.textContent = "Show " + DP.num(current.length) + (current.length === 1 ? " game" : " games");
    }
    function change() {
      shown = PAGE;
      history.replaceState(null, "", toURL());
      renderChips();
      updateCounts();
      countEl.classList.remove("tick"); void countEl.offsetWidth; countEl.classList.add("tick");
      renderResults(true);
    }
    function clearAll() {
      f.q = ""; f.dual = false; FACETS.forEach((F) => { f[F.key] = []; });
      const bq = $("#bq"); if (bq) bq.value = "";
      change();
    }

    /* filter panel */
    function group(F) {
      const labels = [...S.labels[F.key].entries()];
      if (labels.length < 2 && F.key !== "platform") return null;
      const counts = S.facetTotals[F.key];
      labels.sort((a, b) => F.asc ? a[1].localeCompare(b[1]) : (counts.get(b[0]) || 0) - (counts.get(a[0]) || 0) || a[1].localeCompare(b[1]));
      if (F.key === "decade") labels.reverse();
      refs[F.key] = {};
      const body = h("div", { class: "fg-list" });
      let idx = 0, lastGroup = "";
      const rows = [];
      const order = F.grouped ? labels.map((l) => [groupOf(l[1]), l]).sort((a, b) => ["Nintendo", "Sony", "Sega", "Microsoft", "Other"].indexOf(a[0]) - ["Nintendo", "Sony", "Sega", "Microsoft", "Other"].indexOf(b[0])) : labels.map((l) => ["", l]);
      order.forEach(([grp, [k, label]]) => {
        if (F.grouped && grp !== lastGroup) { body.appendChild(h("p", { class: "fg-sub" }, grp)); lastGroup = grp; }
        const id = "f-" + F.key + "-" + idx++;
        const input = h("input", { type: "checkbox", id, class: "cb" });
        const cnt = h("span", { class: "cnt" }, "0");
        const row = h("label", { class: "fg-row", for: id }, input, h("span", { class: "box", "aria-hidden": "true" }, icon("check")), h("span", { class: "lbl" }, label), cnt);
        input.addEventListener("change", () => {
          f[F.key] = f[F.key].filter((x) => DP.norm(x) !== k);
          if (input.checked) f[F.key].push(label);
          change();
        });
        refs[F.key][k] = { input, cnt, row };
        rows.push(row);
        body.appendChild(row);
      });
      const open = F.key === "platform" || F.key === "genre" || f[F.key].length > 0;
      const bid = "fgb-" + F.key;
      const head = h("button", { class: "fg-head", type: "button", "aria-expanded": String(open), "aria-controls": "fgbody-" + F.key },
        h("span", null, F.title), h("span", { class: "fg-badge", id: bid }), icon("chevd", "chev"));
      const col = h("div", { class: "fg-collapse", id: "fgbody-" + F.key }, h("div", { class: "fg-inner" }, body));
      if (!open) col.inert = true;
      head.addEventListener("click", () => {
        const now = head.getAttribute("aria-expanded") !== "true";
        head.setAttribute("aria-expanded", String(now));
        col.inert = !now;
        wrapEl.classList.toggle("open", now);
      });
      const wrapEl = h("section", { class: "fg" + (open ? " open" : "") }, head, col);
      if (rows.length > 12 && !F.grouped) {
        body.classList.add("capped");
        const t = h("button", { class: "link-btn", type: "button", "aria-expanded": "false" }, "Show all " + rows.length);
        t.addEventListener("click", () => { const e = body.classList.toggle("capped"); t.textContent = e ? "Show all " + rows.length : "Show fewer"; t.setAttribute("aria-expanded", String(!e)); });
        col.firstChild.appendChild(t);
      }
      return wrapEl;
    }
    const dualRow = h("label", { class: "fg-row switch", for: "f-dual" }, h("input", { type: "checkbox", id: "f-dual", class: "cb" }), h("span", { class: "box", "aria-hidden": "true" }, icon("check")), h("span", { class: "lbl" }, "Dual screen games only"));
    dualRow.firstChild.addEventListener("change", (e) => { f.dual = e.target.checked; change(); });
    const panel = h("aside", { class: "filters", id: "filters", "aria-label": "Filters" },
      h("div", { class: "panel-head" }, h("h2", null, "Filters"), h("button", { class: "icon-btn", type: "button", id: "panel-close", "aria-label": "Close filters", onclick: () => DP.closePanel() }, icon("close"))),
      h("div", { class: "panel-body" }, FACETS.map(group), h("section", { class: "fg open" }, dualRow)),
      h("div", { class: "panel-foot" }, h("button", { class: "btn ghost", type: "button", onclick: clearAll }, "Clear all"), h("button", { class: "btn primary", type: "button", id: "panel-count", onclick: () => DP.closePanel() }, "Show games")));
    const scrim = h("div", { class: "panel-scrim", onclick: () => DP.closePanel() });
    let opener = null;
    DP.closePanel = () => {
      if (!panel.classList.contains("open")) return;
      panel.classList.remove("open"); scrim.classList.remove("show");
      document.body.classList.remove("lock");
      if (opener) opener.focus();
    };
    const openPanel = () => {
      opener = document.activeElement;
      panel.classList.add("open"); scrim.classList.add("show");
      document.body.classList.add("lock");
      setTimeout(() => $("#panel-close").focus(), 60);
    };

    const bq = h("input", { id: "bq", type: "search", placeholder: "Search this catalog", value: f.q, autocomplete: "off", enterkeyhint: "search" });
    let deb = 0;
    bq.addEventListener("input", () => { clearTimeout(deb); deb = setTimeout(() => { f.q = bq.value.trim(); change(); }, 180); });
    const sel = h("select", { id: "sort", class: "select", "aria-label": "Sort games" }, SORTS.map(([v, t]) => h("option", { value: v, selected: v === f.sort }, t)));
    sel.addEventListener("change", () => { f.sort = sel.value; change(); });
    const vbtn = (v, ic, label) => {
      const b = h("button", { class: "vt", type: "button", "aria-pressed": String(view === v), "aria-label": label }, icon(ic));
      b.addEventListener("click", () => {
        view = v; DP.pref("view", v); grid.className = "grid " + v;
        $$(".vt").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      });
      return b;
    };
    const toolbar = h("div", { class: "toolbar" },
      h("div", { class: "tb-search" }, h("label", { class: "sr-only", for: "bq" }, "Search this catalog"), icon("search"), bq),
      h("button", { class: "btn ghost filter-btn", id: "filter-open", type: "button", onclick: openPanel }, icon("filter"), "Filters", h("span", { class: "fcount", hidden: true })),
      h("div", { class: "tb-right" }, h("label", { class: "sr-only", for: "sort" }, "Sort"), sel, h("div", { class: "vtoggle", role: "group", "aria-label": "Layout" }, vbtn("grid", "grid", "Grid view"), vbtn("list", "list", "List view"))));

    const page = h("div", { class: "view browse" },
      wrap("page-head", crumbs([{ text: "Home", href: "#/" }, { text: "Browse" }]), h("h1", null, "Browse the catalog"), countEl),
      wrap("browse-body", panel, scrim, h("div", { class: "results" }, toolbar, chipsEl, grid, empty, more, sentinel)));

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => {
        if (es[0].isIntersecting && rendered < current.length && rendered > 0) { shown += PAGE; renderResults(false); io.unobserve(sentinel); io.observe(sentinel); }
      }, { rootMargin: "700px" });
      io.observe(sentinel);
      DP.onLeave(() => io.disconnect());
    }
    renderChips(); updateCounts(); renderResults(true);
    DP.onLeave(() => { DP.closePanel = null; document.body.classList.remove("lock"); });
    return page;
  }

  /* ---------- game ---------- */
  function portCard(p, open, only) {
    const st = statusOf(p.works);
    const stLabel = p.works ? p.works : "";
    const dl = h("dl", { class: "facts" });
    [["Platform", p.platform], ["Developer", p.developer], ["Version", p.version], ["Last update", p.lastUpdate && DP.dateText(p.lastUpdate)], ["Controller", p.controller], ["Game files", p.files], ["Reported status", p.works]].forEach(([k, v]) => {
      if (v) dl.appendChild(h("div", null, h("dt", null, k), h("dd", null, v)));
    });
    const main = DP.safeUrl(p.url) || DP.safeUrl(p.link), proj = DP.safeUrl(p.link), data = DP.safeUrl(p.dataUrl);
    const act = h("div", { class: "port-actions" });
    const lb = (href, text, cls) => h("a", { class: "btn " + cls, href, target: "_blank", rel: "noopener noreferrer" }, text, icon("open"));
    if (main) act.appendChild(lb(main, /github\.com/i.test(main) ? "Get it on GitHub" : "Get this port", "primary"));
    if (proj && proj !== main) act.appendChild(lb(proj, "Project page", "ghost"));
    if (data) act.appendChild(lb(data, "Game data", "ghost"));
    const body = h("div", { class: "port-body" }, dl, p.notes ? h("p", { class: "note" }, p.notes) : null, act);
    const title = h("span", { class: "port-title" }, h("strong", null, p.project || "Port"), h("small", null, p.developer || p.platform || ""));
    const chip = stLabel ? h("span", { class: "status " + st }, st === "good" ? icon("check") : null, stLabel) : null;
    if (only) return h("article", { class: "port open" }, h("div", { class: "port-head static" }, title, chip), h("div", { class: "port-collapse" }, body));
    const head = h("button", { class: "port-head", type: "button", "aria-expanded": String(open) }, title, chip, icon("chevd", "chev"));
    const col = h("div", { class: "port-collapse" }, body);
    if (!open) col.inert = true;
    const art = h("article", { class: "port" + (open ? " open" : "") }, head, col);
    head.addEventListener("click", () => { const now = !art.classList.contains("open"); art.classList.toggle("open", now); head.setAttribute("aria-expanded", String(now)); col.inert = !now; });
    return art;
  }

  function gamePage(slug) {
    const S = DP.state, U_ = U(), g = S.bySlug.get(slug);
    if (!g) return notFound();
    const feat = repPort(g), ordered = [feat].concat(g.ports.filter((p) => p !== feat));
    const main = DP.safeUrl(feat.url) || DP.safeUrl(feat.link);
    const cover = DP.safeUrl(g.cover);
    const big = U_.poster(g, "big", true);
    const actions = h("div", { class: "g-actions" },
      main ? h("a", { class: "btn primary lg", href: main, target: "_blank", rel: "noopener noreferrer" }, "Get this port", icon("open")) : h("a", { class: "btn primary lg", href: "#ports" , onclick: (e) => { e.preventDefault(); $("#ports").scrollIntoView({ behavior: DP.reduced() ? "auto" : "smooth" }); } }, "See ports", icon("arrow")),
      (() => { const b = h("button", { class: "btn ghost lg save", type: "button" }); const sync = () => { const on = DP.favs.has(g.slug); b.replaceChildren(icon(on ? "heart" : "hearto"), on ? "Saved" : "Save"); b.setAttribute("aria-pressed", String(on)); b.classList.toggle("on", on); }; sync(); b.addEventListener("click", () => { DP.toast(DP.favs.toggle(g.slug) ? "Saved " + g.name : "Removed " + g.name); }); const l = () => { if (b.isConnected) { sync(); b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); } }; document.addEventListener("favchange", l); DP.onLeave(() => document.removeEventListener("favchange", l)); return b; })(),
      h("button", { class: "icon-btn outline", type: "button", "aria-label": "Share this game", onclick: async () => { try { if (navigator.share) await navigator.share({ title: g.name, url: location.href }); else { await navigator.clipboard.writeText(location.href); DP.toast("Link copied"); } } catch (e) {} } }, icon("share")));
    const devs = [...new Set(g.ports.map((p) => p.developer).filter(Boolean))];
    const facts = h("dl", { class: "facts big" });
    [["Platform", g.platforms.join(", ")], ["Release year", g.year], ["Genre", g.genres.join(", ")], ["Ports", String(g.ports.length)], ["Developers", devs.join(", ")], ["Last update", g.updated && DP.fmtDate(g.updated)], ["Added to catalog", g.added && DP.fmtDate(g.added)]].forEach(([k, v]) => { if (v) facts.appendChild(h("div", null, h("dt", null, k), h("dd", null, v))); });

    const hero = h("section", { class: "g-hero" },
      cover ? h("div", { class: "backdrop", "aria-hidden": "true" }, h("img", { src: cover, alt: "", referrerpolicy: "no-referrer" })) : null,
      wrap("g-hero-in", crumbs([{ text: "Home", href: "#/" }, { text: "Browse", href: "#/browse" }, g.platforms[0] ? { text: g.platforms[0], href: "#/browse?platform=" + encodeURIComponent(g.platforms[0]) } : null, { text: g.name }].filter(Boolean)),
        h("div", { class: "g-grid" }, big,
          h("div", { class: "g-info" },
            h("div", { class: "g-tags" }, g.platforms.map((p) => h("a", { class: "tag", href: "#/browse?platform=" + encodeURIComponent(p) }, p)), g.genres.slice(0, 3).map((t) => h("a", { class: "tag soft", href: "#/browse?genre=" + encodeURIComponent(t) }, t))),
            h("h1", null, g.name), actions, facts))));

    const sections = [hero];
    if (g.description) {
      const d = h("div", { class: "desc clamp" }, para(g.description));
      const blk = h("div", null, h("h2", null, "Overview"), d);
      if (g.description.length > 420) {
        const t = h("button", { class: "link-btn", type: "button", "aria-expanded": "false" }, "Read more");
        t.addEventListener("click", () => { const c = d.classList.toggle("clamp"); t.textContent = c ? "Read more" : "Read less"; t.setAttribute("aria-expanded", String(!c)); });
        blk.appendChild(t);
      }
      sections.push(reveal(h("section", { class: "block" }, wrap("narrow", blk))));
    }
    const portsEl = h("div", { class: "ports" }, ordered.map((p, i) => portCard(p, i === 0, g.ports.length === 1)));
    sections.push(reveal(h("section", { class: "block", id: "ports" }, wrap("narrow", h("div", { class: "section-head" }, h("h2", null, g.ports.length === 1 ? "Available port" : "Available ports"), h("span", { class: "count-pill" }, String(g.ports.length))), portsEl))));
    const rel = S.games.filter((x) => x !== g && x.platforms.some((p) => g.platforms.includes(p))).sort((a, b) => (b.genres.some((t) => g.genres.includes(t)) ? 1 : 0) - (a.genres.some((t) => g.genres.includes(t)) ? 1 : 0) || a.name.localeCompare(b.name)).slice(0, 14);
    if (rel.length) sections.push(reveal(h("section", { class: "block" }, wrap("", U_.sectionHead("More on " + g.platforms[0], "#/browse?platform=" + encodeURIComponent(g.platforms[0])), U_.rail(rel)))));
    return h("div", { class: "view game" }, sections);
  }

  /* ---------- apps ---------- */
  function appsPage(params) {
    const S = DP.state;
    let q = params.get("q") || "";
    const list = h("div", { class: "apps-list" }), count = h("p", { class: "result-count", "aria-live": "polite" });
    function item(a, i) {
      let built = false;
      const panel = h("div", { class: "app-games" });
      const col = h("div", { class: "port-collapse" }, h("div", { class: "port-body" }, panel));
      col.inert = true;
      const head = h("button", { class: "port-head", type: "button", "aria-expanded": "false" },
        h("span", { class: "port-title" }, h("strong", null, a.name), h("small", null, DP.num(a.games.length) + " games" + (a.latest ? " \u00b7 Updated " + DP.fmtDate(a.latest) : ""))), icon("chevd", "chev"));
      const art = h("article", { class: "port app enter", style: "--i:" + Math.min(i, 10) }, head, col);
      head.addEventListener("click", () => {
        const now = !art.classList.contains("open");
        if (now && !built) {
          built = true;
          a.games.forEach((g) => panel.appendChild(h("a", { class: "mini-game", href: "#/game/" + g.slug }, U().poster(g, "mini"), h("span", null, g.name))));
          if (!a.games.length) panel.appendChild(h("p", { class: "muted" }, "The catalog lists this app but no supported games yet."));
        }
        art.classList.toggle("open", now); head.setAttribute("aria-expanded", String(now)); col.inert = !now;
      });
      return art;
    }
    function render() {
      const n = DP.norm(q);
      const items = S.apps.filter((a) => !n || DP.norm(a.name).includes(n) || a.games.some((g) => g.key.includes(n))).sort((a, b) => b.games.length - a.games.length);
      list.replaceChildren(...items.map(item));
      count.textContent = DP.num(items.length) + (items.length === 1 ? " app" : " apps");
      if (!items.length) list.appendChild(h("div", { class: "empty" }, h("h2", null, "No apps match"), h("p", null, "Try a different app name or a game it might support.")));
    }
    const input = h("input", { id: "aq", type: "search", placeholder: "Filter apps or supported games", value: q, autocomplete: "off" });
    let deb = 0;
    input.addEventListener("input", () => { clearTimeout(deb); deb = setTimeout(() => { q = input.value.trim(); history.replaceState(null, "", "#/apps" + (q ? "?q=" + encodeURIComponent(q) : "")); render(); }, 160); });
    render();
    return h("div", { class: "view apps" }, wrap("page-head", crumbs([{ text: "Home", href: "#/" }, { text: "Multi-game apps" }]), h("h1", null, "Multi-game apps"),
      h("p", { class: "lede" }, "Apps that run many games from one install, such as engines and frontends. Open one to see which games it supports.")),
      wrap("narrow", h("div", { class: "toolbar single" }, h("div", { class: "tb-search" }, h("label", { class: "sr-only", for: "aq" }, "Filter apps"), icon("search"), input), count), list));
  }

  /* ---------- saved ---------- */
  function favsPage() {
    const S = DP.state, U_ = U();
    const grid = h("div", { class: "grid grid-only" });
    const head = h("div", { class: "page-actions" });
    function render() {
      const items = DP.favs.all().map((s) => S.bySlug.get(s)).filter(Boolean);
      grid.replaceChildren(...items.map((g, i) => U_.card(g, i)));
      head.replaceChildren();
      if (items.length) {
        let armed = 0;
        const b = h("button", { class: "btn ghost", type: "button" }, "Clear all saved");
        b.addEventListener("click", () => { if (!armed) { armed = 1; b.textContent = "Tap again to confirm"; setTimeout(() => { armed = 0; b.textContent = "Clear all saved"; }, 3000); } else { DP.favs.clear(); } });
        head.appendChild(b);
      }
      if (!items.length) grid.replaceChildren(h("div", { class: "empty" }, h("h2", null, "Nothing saved yet"), h("p", null, "Tap the heart on any game to keep it here. Saved games stay on this device."), h("a", { class: "btn primary", href: "#/browse" }, "Browse the catalog", icon("arrow"))));
    }
    const l = () => { if (grid.isConnected) render(); };
    document.addEventListener("favchange", l);
    DP.onLeave(() => document.removeEventListener("favchange", l));
    render();
    return h("div", { class: "view favs" }, wrap("page-head", crumbs([{ text: "Home", href: "#/" }, { text: "Saved games" }]), h("h1", null, "Saved games"), head), wrap("", grid));
  }

  /* ---------- about ---------- */
  function aboutPage() {
    const faq = (q, a) => {
      const col = h("div", { class: "port-collapse" }, h("div", { class: "port-body" }, h("p", null, a)));
      col.inert = true;
      const head = h("button", { class: "port-head", type: "button", "aria-expanded": "false" }, h("span", { class: "port-title" }, h("strong", null, q)), icon("chevd", "chev"));
      const art = h("article", { class: "port" }, head, col);
      head.addEventListener("click", () => { const now = !art.classList.contains("open"); art.classList.toggle("open", now); head.setAttribute("aria-expanded", String(now)); col.inert = !now; });
      return art;
    };
    const ext = (href, t) => h("a", { href, target: "_blank", rel: "noopener noreferrer" }, t);
    return h("div", { class: "view about" },
      wrap("page-head", crumbs([{ text: "Home", href: "#/" }, { text: "About" }]), h("h1", null, "About Dermaga Port"), h("p", { class: "lede" }, "A browsable catalog of native Android ports of console and PC games, built for finding the right port quickly.")),
      wrap("narrow prose",
        reveal(h("section", null, h("h2", null, "Where the data comes from"), h("p", null, "Every entry is read live from the community sheet maintained by ", ext(NAPL, "NAPL"), " each time you open the site. Cover art comes from LaunchBox. Dermaga Port is an independent project and is not affiliated with either."))),
        reveal(h("section", null, h("h2", null, "Reading a port card"), h("p", null, "Each game lists one or more ports. A card shows the developer, the version, when it was last updated, the controllers it supports, whether you must supply your own game files, and the status reported by the community. Open the card to reach the download or project page."))),
        reveal(h("section", null, h("h2", null, "Questions"), h("div", { class: "ports" },
          faq("Does this site host games or files?", "No. Dermaga Port only links to external projects. It never hosts games, ROMs or port builds."),
          faq("What does \"game files needed\" mean?", "Some ports are only an engine. They need data from your own legally owned copy of the game. Ports that ship their own content say so on the card."),
          faq("Why is a port marked partial or broken?", "The status is reported by the community in the source sheet. It can change as projects update, so check the project page for the latest."),
          faq("Where are my saved games stored?", "Only in this browser, on this device. Clearing site data removes them. Nothing is sent to a server."),
          faq("How do I fix a wrong entry?", "Corrections go to the source sheet at NAPL. Once fixed there, the change appears here on the next load.")))),
        reveal(h("section", null, h("h2", null, "Source code"), h("p", null, "The site is open source. You can read the code or report a bug on ", ext(REPO, "GitHub"), ".")))));
  }

  function notFound() {
    return h("div", { class: "view nf" }, wrap("page-head", h("h1", null, "Page not found"), h("p", { class: "lede" }, "That link doesn't lead anywhere. The game may have been renamed or removed from the catalog."), h("div", { class: "hero-links" }, h("a", { class: "btn primary", href: "#/browse" }, "Browse the catalog", icon("arrow")), h("a", { class: "btn ghost", href: "#/" }, "Go home"))));
  }

  DP.pages = { home, browse, game: gamePage, apps: appsPage, favorites: favsPage, about: aboutPage, notFound };
})(window.DP);
