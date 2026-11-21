(function () {
  const $ = (id) => document.getElementById(id);
  const PAGE = 20;
  const ALL = "Semua";
  const state = { q: "", platform: ALL, genre: ALL, sort: "added", shown: PAGE };
  const dlg = $("sheet");

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  const dash = (v) => (v === undefined || v === null || v === "" ? "-" : v);
  const best = (g) => Math.max(0, ...g.ports.map((p) => p.playable || 0));
  const latest = (g) =>
    g.ports.reduce((m, p) => ((p.updated || "") > m ? p.updated : m), "");

  function hue(s) {
    let h = 0;
    for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360;
    return h;
  }
  function initials(t) {
    const w = t.replace(/^the\s+/i, "").split(/\s+/).filter(Boolean);
    return ((w[0] || "?")[0] + (w[1] ? w[1][0] : (w[0] || "")[1] || "")).toUpperCase();
  }
  function tile(g) {
    const t = el("div", "tile", initials(g.title));
    t.style.background = "hsl(" + hue(g.title) + " 75% 62%)";
    t.setAttribute("aria-hidden", "true");
    return t;
  }
  function meter(v) {
    const m = el("div", "meter");
    m.setAttribute("role", "img");
    m.setAttribute("aria-label", v + "% bisa dimainkan");
    const on = Math.round(v / 10);
    for (let i = 0; i < 10; i++) m.appendChild(el("span", i < on ? "pip on" : "pip"));
    return m;
  }
  const meta = (g) =>
    [g.platform, g.year, g.genre].filter(Boolean).join(" / ");

  function uniq(key) {
    return [...new Set(GAMES.map((g) => g[key]).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );
  }

  function setup() {
    $("title").textContent = CONFIG.title;
    $("subtitle").textContent = CONFIG.subtitle;
    document.title = CONFIG.title;
    const total = GAMES.reduce((n, g) => n + g.ports.length, 0);
    $("stats").textContent = GAMES.length + " game, " + total + " port";

    const nav = $("platforms");
    [ALL, ...uniq("platform")].forEach((p) => {
      const b = el("button", "tag", p);
      b.type = "button";
      b.setAttribute("aria-pressed", p === state.platform);
      b.addEventListener("click", () => {
        state.platform = p;
        state.shown = PAGE;
        syncTags();
        render();
      });
      nav.appendChild(b);
    });

    const gs = $("genre");
    [ALL, ...uniq("genre")].forEach((g) => {
      const o = el("option", "", g === ALL ? "Semua genre" : g);
      o.value = g;
      gs.appendChild(o);
    });
    gs.addEventListener("change", () => {
      state.genre = gs.value;
      state.shown = PAGE;
      render();
    });

    const ss = $("sort");
    Object.keys(CONFIG.sortLabels).forEach((k) => {
      const o = el("option", "", CONFIG.sortLabels[k]);
      o.value = k;
      ss.appendChild(o);
    });
    ss.addEventListener("change", () => {
      state.sort = ss.value;
      state.shown = PAGE;
      render();
    });

    $("q").addEventListener("input", (e) => {
      state.q = e.target.value.trim().toLowerCase();
      state.shown = PAGE;
      render();
    });
    $("reset").addEventListener("click", () => {
      state.q = "";
      state.platform = ALL;
      state.genre = ALL;
      state.shown = PAGE;
      $("q").value = "";
      gs.value = ALL;
      syncTags();
      render();
    });
  }

  function syncTags() {
    [...$("platforms").children].forEach((b) =>
      b.setAttribute("aria-pressed", b.textContent === state.platform)
    );
  }

  function filtered() {
    const q = state.q;
    const list = GAMES.filter((g) => {
      if (state.platform !== ALL && g.platform !== state.platform) return false;
      if (state.genre !== ALL && g.genre !== state.genre) return false;
      if (!q) return true;
      const hay = (
        g.title + " " + g.platform + " " + g.genre + " " +
        g.ports.map((p) => p.name + " " + (p.developer || "")).join(" ")
      ).toLowerCase();
      return hay.includes(q);
    });
    const s = state.sort;
    list.sort((a, b) =>
      s === "az" ? a.title.localeCompare(b.title)
      : s === "compat" ? best(b) - best(a)
      : s === "updated" ? latest(b).localeCompare(latest(a))
      : (b.added || "").localeCompare(a.added || "")
    );
    return list;
  }

  function row(g) {
    const li = el("li");
    const b = el("button", "row");
    b.type = "button";
    const body = el("div", "row-body");
    body.append(el("h2", "", g.title), el("p", "meta", meta(g)));
    const v = best(g);
    const score = el("span", "score " + (v >= 90 ? "hi" : v > 0 ? "mid" : "none"), v > 0 ? v + "%" : "?");
    b.append(tile(g), body, score);
    b.addEventListener("click", () => {
      location.hash = g.id;
    });
    li.appendChild(b);
    return li;
  }

  function render() {
    const all = filtered();
    const list = $("list");
    list.replaceChildren();
    all.slice(0, state.shown).forEach((g) => list.appendChild(row(g)));
    $("count").textContent = "Menampilkan " + Math.min(state.shown, all.length) + " dari " + all.length + " game";
    $("empty").hidden = all.length > 0;
    const more = $("more");
    more.replaceChildren();
    if (all.length > state.shown) {
      const b = el("button", "btn ghost", "Tampilkan lagi (" + (all.length - state.shown) + " tersisa)");
      b.type = "button";
      b.addEventListener("click", () => {
        state.shown += PAGE;
        render();
      });
      more.appendChild(b);
    }
  }

  function portBlock(p) {
    const box = el("section", "port");
    const head = el("div", "port-head");
    head.appendChild(el("h4", "", p.name));
    box.appendChild(head);

    const dl = el("dl", "facts");
    [
      ["Developer", p.developer],
      ["Versi", p.version],
      ["Diperbarui", p.updated],
      ["Input", p.inputs],
      ["File game", p.files]
    ].forEach(([k, v]) => {
      const d = el("div");
      d.append(el("dt", "", k), el("dd", "", dash(v)));
      dl.appendChild(d);
    });
    box.appendChild(dl);

    const v = p.playable || 0;
    const compat = el("div", "compat");
    compat.appendChild(el("p", "compat-label", v > 0 ? v + "% bisa dimainkan" : "Belum ada data kompatibilitas"));
    if (v > 0) compat.appendChild(meter(v));
    box.appendChild(compat);

    if (p.url) {
      const a = el("a", "btn primary", p.linkLabel || "Buka tautan");
      a.href = p.url;
      a.target = "_blank";
      a.rel = "noopener";
      box.appendChild(a);
    }
    return box;
  }

  function openSheet(g) {
    const body = $("sheet-body");
    body.replaceChildren();

    const head = el("div", "sheet-head");
    const t = tile(g);
    t.classList.add("big");
    const hb = el("div");
    hb.append(el("h3", "", g.title), el("p", "meta", meta(g)));
    head.append(t, hb);
    body.appendChild(head);

    if (g.desc) {
      const d = el("p", "desc clamp", g.desc);
      body.appendChild(d);
      if (g.desc.length > 160) {
        const tg = el("button", "link", "Tampilkan semua");
        tg.type = "button";
        tg.addEventListener("click", () => {
          const open = d.classList.toggle("clamp");
          tg.textContent = open ? "Tampilkan semua" : "Ringkas";
        });
        body.appendChild(tg);
      }
    }

    body.appendChild(el("h4", "section-title", g.ports.length + " port tersedia"));
    g.ports.forEach((p) => body.appendChild(portBlock(p)));

    if (!dlg.open) dlg.showModal();
    dlg.querySelector(".sheet").scrollTop = 0;
  }

  function route() {
    const id = decodeURIComponent(location.hash.slice(1));
    const g = GAMES.find((x) => x.id === id);
    if (g) openSheet(g);
    else if (dlg.open) dlg.close();
  }

  function closeSheet() {
    if (location.hash) history.back();
    else dlg.close();
  }

  $("close").addEventListener("click", closeSheet);
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) closeSheet();
  });
  dlg.addEventListener("close", () => {
    if (location.hash)
      history.replaceState(null, "", location.pathname + location.search);
  });
  $("share").addEventListener("click", async () => {
    const b = $("share");
    try {
      if (navigator.share) await navigator.share({ url: location.href });
      else {
        await navigator.clipboard.writeText(location.href);
        b.textContent = "Tautan disalin";
        setTimeout(() => (b.textContent = "Bagikan"), 1500);
      }
    } catch (e) {}
  });
  window.addEventListener("hashchange", route);

  setup();
  render();
  route();
})();
