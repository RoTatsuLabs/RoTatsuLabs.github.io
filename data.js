(function () {
  const norm = (v) => String(v ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const slug = (v) => norm(v).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const head = (v) => String(v ?? "").replace(/^\uFEFF/, "").trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  function parseCSV(csv) {
    const rows = [];
    let row = [], field = "", quoted = false;
    const push = () => { row.push(field); field = ""; };
    const end = () => { push(); if (row.some((v) => v.trim() !== "")) rows.push(row); row = []; };
    for (let i = 0; i < csv.length; i++) {
      const c = csv[i];
      if (c === '"') {
        if (quoted && csv[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted;
      } else if (c === "," && !quoted) push();
      else if ((c === "\n" || c === "\r") && !quoted) {
        if (c === "\r" && csv[i + 1] === "\n") i++;
        end();
      } else field += c;
    }
    if (field.length || row.length) end();
    if (!rows.length) return [];
    const keys = rows.shift().map(head);
    return rows.map((vals) => {
      const o = {};
      keys.forEach((k, i) => { if (k) o[k] = String(vals[i] || "").trim(); });
      return o;
    });
  }

  const col = (row, names) => {
    for (const n of names) {
      const k = head(n);
      if (Object.prototype.hasOwnProperty.call(row, k)) return String(row[k] || "").trim();
    }
    return "";
  };

  const MONTHS = { january: 0, enero: 0, february: 1, febrero: 1, march: 2, marzo: 2, april: 3, abril: 3, may: 4, mayo: 4, june: 5, junio: 5, july: 6, julio: 6, august: 7, agosto: 7, september: 8, septiembre: 8, setiembre: 8, october: 9, octubre: 9, november: 10, noviembre: 10, december: 11, diciembre: 11 };

  function parseDate(value) {
    const text = String(value ?? "").trim();
    if (!text) return null;
    let datePart = text, h = 0, mi = 0, s = 0;
    const t = text.match(/(?:\s+|T)(\d{1,2}):(\d{2})(?::(\d{2}))?\s*$/i);
    if (t) {
      h = +t[1]; mi = +t[2]; s = +(t[3] || 0);
      if (h > 23 || mi > 59 || s > 59) return null;
      datePart = text.slice(0, t.index).trim();
    }
    let y, m, d, x;
    if ((x = datePart.match(/^(\d{4})\s*,\s*([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)(?:\s+(\d{1,2}))?$/))) {
      const name = norm(x[2]);
      if (!Object.prototype.hasOwnProperty.call(MONTHS, name)) return null;
      y = +x[1]; m = MONTHS[name]; d = x[3] ? +x[3] : 1;
    } else if ((x = datePart.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))) {
      d = +x[1]; m = +x[2] - 1; y = +x[3];
    } else if ((x = datePart.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) {
      y = +x[1]; m = +x[2] - 1; d = +x[3];
    } else return null;
    const date = new Date(y, m, d, h, mi, s);
    return date.getFullYear() === y && date.getMonth() === m && date.getDate() === d ? date : null;
  }

  const F = {
    game: ["GAME", "GAME NAME", "NAME", "JUEGO"],
    year: ["YEAR", "ANO", "AÑO"],
    platform: ["PLATFORM", "PLATAFORM", "PLATAFORMA"],
    project: ["PROJECT", "PROYECTO"],
    link: ["LINK", "PROJECT LINK", "ENLACE"],
    url: ["URL", "PORT URL", "PORT LINK"],
    dataUrl: ["DATA URL", "DATA LINK", "GAME FILES URL"],
    developer: ["DEVELOPER", "DEVELOPER/PUBLISHER", "DESARROLLADOR"],
    version: ["VERSION", "VERSIÓN"],
    controller: ["CONTROLLER SUPPORT", "CONTROLLER", "GAMEPAD", "MANDO"],
    files: ["NEEDS GAME FILES?", "NEEDS GAME FILES", "GAME FILES", "NECESITA ARCHIVOS"],
    works: ["WORKS?", "WORKS", "FUNCIONA"],
    lastUpdate: ["LAST UPDATE", "LAST UPDATED", "ÚLTIMA ACTUALIZACIÓN"],
    dateAdded: ["DATE ADDED"],
    notes: ["NOTES", "NOTE", "NOTAS"],
    cover: ["COVER_URL", "COVER URL", "COVER", "COVER IMAGE", "IMAGE URL", "PORTADA"],
    genre: ["GENRE", "GÉNERO", "GENERO"],
    description: ["DESCRIPTION", "DESCRIPCIÓN", "DESCRIPCION"]
  };
  const PORT_KEYS = ["project", "link", "url", "dataUrl", "developer", "version", "controller", "files", "works", "lastUpdate", "dateAdded", "notes"];

  function processRows(rows) {
    let game = "", year = "";
    const out = [];
    for (const row of rows) {
      const g = col(row, F.game), y = col(row, F.year);
      if (g) game = g;
      if (y) year = y;
      const p = {};
      for (const k in F) p[k] = col(row, F[k]);
      p.game = game;
      p.year = year;
      p.platform = p.platform.replace(/\s+/g, " ");
      if (game && PORT_KEYS.some((k) => p[k])) out.push(p);
    }
    return out;
  }

  function groupGames(ports) {
    const map = new Map(), used = new Set();
    for (const p of ports) {
      const key = norm(p.game);
      if (!key) continue;
      let g = map.get(key);
      if (!g) {
        const base = slug(p.game) || "game";
        let s = base, i = 2;
        while (used.has(s)) s = base + "-" + i++;
        used.add(s);
        g = { name: p.game, key, slug: s, year: "", cover: "", genre: "", description: "", ports: [], platforms: [] };
        map.set(key, g);
      }
      for (const k of ["year", "cover", "genre", "description"]) if (!g[k] && p[k]) g[k] = p[k];
      if (p.platform && !g.platforms.includes(p.platform)) g.platforms.push(p.platform);
      g.ports.push(p);
    }
    const latest = (g, f) => g.ports.reduce((m, p) => {
      const d = parseDate(p[f]);
      return d && (!m || d > m) ? d : m;
    }, null);
    return [...map.values()].map((g) => ({ ...g, updated: latest(g, "lastUpdate"), added: latest(g, "dateAdded") }));
  }

  async function load() {
    let csv, stale = false;
    try {
      const r = await fetch(CONFIG.sheetUrl, { cache: "no-store" });
      if (!r.ok) throw new Error("Sumber data membalas HTTP " + r.status + ".");
      csv = await r.text();
      try { localStorage.setItem(CONFIG.cacheKey, csv); } catch (e) {}
    } catch (err) {
      let cached = null;
      try { cached = localStorage.getItem(CONFIG.cacheKey); } catch (e) {}
      if (!cached) throw err;
      csv = cached;
      stale = true;
    }
    const rows = parseCSV(csv);
    const ports = processRows(rows);
    if (!ports.length) throw new Error("Data dari sumber kosong atau formatnya tidak dikenali.");
    const order = [], seen = new Set();
    for (const r of rows) {
      const l = col(r, F.platform).replace(/\s+/g, " "), k = norm(l);
      if (l && !seen.has(k)) { seen.add(k); order.push(l); }
    }
    return { games: groupGames(ports), platformOrder: order, stale };
  }

  globalThis.Catalog = { norm, slug, parseDate, parseCSV, processRows, groupGames, load };
})();
