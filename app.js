(function (DP) {
  "use strict";
  const { $, $$, h } = DP;
  const { norm, parseDate, load } = Catalog;
  DP.norm = norm;
  DP.parseDate = parseDate;
  DP.dateText = (v) => { const d = parseDate(v); return d ? DP.fmtDate(d) : v; };
  let leaves = [];
  DP.onLeave = (fn) => leaves.push(fn);
  const runLeave = () => leaves.splice(0).forEach((f) => { try { f(); } catch (e) {} });

  const FKEYS = ["platform", "genre", "decade", "files"];
  const uniq = (a) => [...new Set(a)];

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

  function buildState(cat) {
    const now = Date.now();
    const S = { ready: true, games: cat.games, labels: {}, facetTotals: {}, portCount: 0 };
    FKEYS.forEach((k) => { S.labels[k] = new Map(); S.facetTotals[k] = new Map(); });
    for (const g of S.games) {
      g.genres = uniq((g.genre || "").split(/[;,\/]/).map((x) => x.trim()).filter(Boolean));
      g.yearN = parseInt(g.year, 10) || 0;
      g.decade = g.yearN ? Math.floor(g.yearN / 10) * 10 + "s" : "";
      g.dual = g.ports.some((p) => norm(p.project).includes("dual screen"));
      g.isNew = !!g.added && now - g.added < 45 * 864e5;
      const vals = {
        platform: g.platforms,
        genre: g.genres,
        decade: g.decade ? [g.decade] : [],
        files: uniq(g.ports.map((p) => (p.files || "").trim()).filter(Boolean))
      };
      g.fv = {};
      FKEYS.forEach((k) => {
        g.fv[k] = new Set();
        vals[k].forEach((label) => {
          const n = norm(label);
          if (g.fv[k].has(n)) return;
          g.fv[k].add(n);
          if (!S.labels[k].has(n)) S.labels[k].set(n, label);
          S.facetTotals[k].set(n, (S.facetTotals[k].get(n) || 0) + 1);
        });
      });
      g.search = norm([g.name, g.platforms.join(" "), g.genres.join(" "), g.ports.map((p) => p.project + " " + p.developer).join(" ")].join(" "));
      S.portCount += g.ports.length;
    }
    const d = (a, b) => (!a && !b ? 0 : !a ? 1 : !b ? -1 : b - a);
    S.byAdded = S.games.slice().sort((a, b) => d(a.added, b.added));
    S.byUpdated = S.games.slice().sort((a, b) => d(a.updated, b.updated));
    S.bySlug = new Map(S.games.map((g) => [g.slug, g]));
    S.apps = getApps(S.games);
    S.platformStats = [...S.labels.platform.entries()]
      .filter(([k]) => k !== "multi-game apps" && k !== "multi game apps")
      .map(([k, name]) => ({ name, count: S.facetTotals.platform.get(k) || 0, covers: S.byAdded.filter((g) => g.cover && g.fv.platform.has(k)).slice(0, 3) }))
      .sort((a, b) => b.count - a.count);
    return S;
  }

  DP.search = (q, limit) => {
    const t = norm(q).split(/\s+/).filter(Boolean);
    if (!t.length) return [];
    const out = [];
    for (const g of DP.state.games) {
      if (!t.every((x) => g.search.includes(x))) continue;
      const n = norm(g.name);
      let s = 0;
      if (n === t.join(" ")) s += 5;
      if (n.startsWith(t[0])) s += 3; else if (n.includes(t[0])) s += 2;
      out.push([s, g]);
    }
    out.sort((a, b) => b[0] - a[0] || a[1].name.localeCompare(b[1].name));
    return out.slice(0, limit).map((x) => x[1]);
  };

  /* router */
  const main = $("#main");
  const ROUTES = [["home", /^\/$/], ["browse", /^\/browse$/], ["game", /^\/game\/([^/]+)$/], ["apps", /^\/apps$/], ["favorites", /^\/favorites$/], ["about", /^\/about$/]];
  function resolve() {
    let raw = location.hash.replace(/^#/, "") || "/";
    if (raw[0] !== "/") {
      const slug = decodeURIComponent(raw);
      if (DP.state && DP.state.bySlug.has(slug)) { history.replaceState(null, "", "#/game/" + slug); raw = "/game/" + slug; } else raw = "/" + raw;
    }
    const [path, qs] = raw.split("?");
    for (const [name, re] of ROUTES) { const m = path.replace(/\/+$/, "").replace(/^$/, "/").match(re); if (m) return { name, arg: m[1] ? decodeURIComponent(m[1]) : "", params: new URLSearchParams(qs || ""), path }; }
    return { name: "404", params: new URLSearchParams(), path };
  }
  const TITLES = { home: "Native Android game ports", browse: "Browse the catalog", apps: "Multi-game apps", favorites: "Saved games", about: "About", 404: "Page not found" };
  let current = { name: "", arg: "" }, nav = "push", prevHref = location.href, posterEl = null;
  const scrolls = new Map();

  function makePage(r) {
    try {
      if (r.name === "home") return DP.pages.home();
      if (r.name === "browse") return DP.pages.browse(r.params);
      if (r.name === "game") return DP.pages.game(r.arg);
      if (r.name === "apps") return DP.pages.apps(r.params);
      if (r.name === "favorites") return DP.pages.favorites();
      if (r.name === "about") return DP.pages.about();
      return DP.pages.notFound();
    } catch (e) {
      console.error(e);
      return h("div", { class: "view" }, h("div", { class: "wrap page-head" }, h("h1", null, "Something went wrong"), h("p", { class: "lede" }, "This page failed to load. Go back or reload the site."), h("a", { class: "btn primary", href: "#/" }, "Go home")));
    }
  }

  async function render(first) {
    const r = resolve();
    const href = location.href;
    const restore = nav !== "push" ? scrolls.get(href) : 0;
    const wasGame = current.name === "game" ? current.arg : "";
    const canVT = !first && !!document.startViewTransition && !DP.reduced();
    document.documentElement.classList.toggle("vt-on", canVT);
    const build = () => {
      runLeave();
      const node = makePage(r);
      main.replaceChildren(node);
      current = r;
      DP.setNav(r.name === "404" ? "" : r.name);
      const g = r.name === "game" && DP.state.bySlug.get(r.arg);
      document.title = (g ? g.name : TITLES[r.name] || "Android Ports Catalog") + " | Android Ports Catalog";
      const desc = $('meta[name="description"]');
      if (desc) desc.content = g ? g.name + " for Android: " + g.ports.length + (g.ports.length === 1 ? " port" : " ports") + " with developer, version and download details." : "Browse " + DP.num(DP.state.games.length) + " native Android game ports with compatibility details and download links.";
      DP.reveal(main);
      window.scrollTo(0, restore || 0);
      if (wasGame && r.name !== "game") {
        const el = $('.card-link[data-slug="' + wasGame + '"] .poster', main);
        if (el) { el.style.viewTransitionName = "poster"; posterEl = el; }
      }
      if (!first) { const t = $("h1", main); if (t) { t.tabIndex = -1; t.focus({ preventScroll: true }); } }
    };
    if (canVT) {
      try {
        const vt = document.startViewTransition(build);
        vt.ready.catch(() => {});
        vt.updateCallbackDone.catch(() => {});
        await vt.finished;
      } catch (e) {}
    } else build();
    if (posterEl) { posterEl.style.viewTransitionName = ""; posterEl = null; }
    nav = "push";
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[href^='#/']");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    nav = "push";
    const cl = a.closest(".card-link");
    if (cl && current.name !== "game") { const p = cl.querySelector(".poster"); if (p) { p.style.viewTransitionName = "poster"; posterEl = p; } }
  });
  if (window.navigation && navigation.addEventListener) navigation.addEventListener("navigate", (e) => { nav = e.navigationType === "traverse" ? "pop" : "push"; });
  else window.addEventListener("popstate", () => { nav = "pop"; });
  window.addEventListener("hashchange", () => {
    scrolls.set(prevHref, window.scrollY);
    prevHref = location.href;
    if (DP.state && DP.state.ready) render(false);
  });
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  async function boot() {
    try {
      const cat = await load();
      DP.state = buildState(cat);
      document.dispatchEvent(new CustomEvent("favchange", { detail: { slug: "", on: false } }));
      prevHref = location.href;
      await render(true);
      if (cat.stale) DP.toast("Source unreachable. Showing the last saved catalog.");
    } catch (err) {
      console.error(err);
      main.replaceChildren(h("div", { class: "view" }, h("div", { class: "wrap page-head" }, h("div", { class: "error", role: "alert" },
        h("h1", null, "The catalog could not load"),
        h("p", { class: "lede" }, (err && err.message ? err.message + " " : "") + "Check your connection, then try again."),
        h("button", { class: "btn primary", type: "button", onclick: () => { main.replaceChildren(h("div", { class: "wrap page-head" }, h("h1", null, "Loading"))); boot(); } }, "Try again")))));
    }
  }
  DP.state = { ready: false };
  boot();
})(window.DP);
