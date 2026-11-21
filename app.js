(function () {
  const $ = (id) => document.getElementById(id);
  const state = { q: "", cat: "Semua" };

  $("title").textContent = CONFIG.title;
  $("subtitle").textContent = CONFIG.subtitle;
  document.title = CONFIG.title;

  const cats = ["Semua", ...new Set(PORTS.map((p) => p.category))];
  const catsEl = $("cats");
  cats.forEach((c) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = c;
    b.className = "chip";
    b.setAttribute("aria-pressed", c === state.cat);
    b.addEventListener("click", () => {
      state.cat = c;
      [...catsEl.children].forEach((x) =>
        x.setAttribute("aria-pressed", x.textContent === c)
      );
      render();
    });
    catsEl.appendChild(b);
  });

  $("q").addEventListener("input", (e) => {
    state.q = e.target.value.trim().toLowerCase();
    render();
  });

  function card(p) {
    const li = document.createElement("li");
    li.className = "card";
    const head = document.createElement("div");
    head.className = "head";
    const h = document.createElement("h2");
    h.textContent = p.name;
    const s = document.createElement("span");
    s.className = "status " + p.status;
    s.textContent = CONFIG.statusLabels[p.status] || p.status;
    head.append(h, s);

    const d = document.createElement("p");
    d.textContent = p.desc;

    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = p.category + ", v" + p.version + ", oleh " + p.author;

    const a = document.createElement("a");
    a.href = p.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "Buka sumber";

    li.append(head, d, meta, a);
    return li;
  }

  function render() {
    const list = $("list");
    list.replaceChildren();
    const items = PORTS.filter((p) => {
      const inCat = state.cat === "Semua" || p.category === state.cat;
      const hay = (p.name + " " + p.desc + " " + p.author).toLowerCase();
      return inCat && hay.includes(state.q);
    });
    items.forEach((p) => list.appendChild(card(p)));
    $("count").textContent = items.length + " port";
    $("empty").hidden = items.length > 0;
  }

  render();
})();
