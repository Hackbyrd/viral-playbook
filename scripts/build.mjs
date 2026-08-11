import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { marked } from "marked";

const root = process.cwd();
const sourcePath = join(root, "content", "Viral-Video-Playbook-v4.md");
const output = join(root, "dist");
const downloads = join(output, "downloads");

const markdown = await readFile(sourcePath, "utf8");
const headings = [...markdown.matchAll(/^# PART (\d+):\s+(.+)$/gm)];

function titleCase(value) {
  const small = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "of", "on", "or", "the", "to", "vs", "with"]);
  return value
    .toLowerCase()
    .split(/(\s+)/)
    .map((word, index) => {
      const normalized = word.replace(/[^a-z]/g, "");
      if (["cta", "seo", "ctr", "avd", "pov", "sfx"].includes(normalized)) return word.toUpperCase();
      if (index && small.has(normalized)) return word;
      return word ? word[0].toUpperCase() + word.slice(1) : word;
    })
    .join("");
}

const parts = headings.map((heading, index) => {
  const end = headings[index + 1]?.index ?? markdown.length;
  const content = markdown.slice(heading.index + heading[0].length, end).trim();
  return {
    number: Number(heading[1]),
    title: titleCase(heading[2]),
    minutes: Math.max(1, Math.round(content.split(/\s+/).length / 200)),
    html: marked.parse(content),
  };
});

const groups = [
  ["Start Here", [1, 2, 3]],
  ["Ideas & Formats", [4]],
  ["Packaging & Craft", Array.from({ length: 10 }, (_, index) => index + 5)],
  ["Production", [15, 16, 17, 18, 19]],
  ["Publish & Measure", [20, 21, 22, 23, 24, 25]],
  ["Channel Business", Array.from({ length: 13 }, (_, index) => index + 26)],
];

const titleFor = (number) => parts.find((part) => part.number === number).title;
const nav = groups.map(([name, numbers]) => `
  <section class="nav-group">
    <h2>${name}</h2>
    ${numbers.map((number) => `<a href="#part-${number}" data-part="${number}"><b>${String(number).padStart(2, "0")}</b>${titleFor(number)}</a>`).join("")}
  </section>
`).join("");

const pages = parts.map((part) => `
  <article class="lesson" id="part-${part.number}" data-part="${part.number}">
    <header>
      <span>Part ${String(part.number).padStart(2, "0")} · ${part.minutes} min read</span>
      <h1>${part.title}</h1>
    </header>
    <div class="prose">${part.html}</div>
    <section class="check" aria-label="End of section check">
      <p class="eyebrow">End of section check</p>
      <h2>Can you apply this?</h2>
      <p>Write one decision you will make differently in your next video after reading this lesson.</p>
      <textarea placeholder="My next action…"></textarea>
      <button type="button" class="complete-check">Mark as reviewed</button>
    </section>
    <nav class="pager">
      <button type="button" class="previous">← Previous</button>
      <button type="button" class="next">Next section →</button>
    </nav>
  </article>
`).join("");

const index = parts.map(({ number, title, html }) => ({
  number,
  title,
  text: html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "),
}));

const totalMinutes = Math.round(markdown.split(/\s+/).length / 200);
const document = `<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="The Viral Video Playbook by Jonathan Chen.">
  <title>The Viral Video Playbook</title>
  <style>
    :root{--bg:#0b1020;--surface:#131d33;--surface-2:#1b2945;--text:#f5f7fc;--muted:#9eabc1;--line:#2c3d5d;--blue:#7893ff;--pink:#ff628e;--green:#48d8a0;--yellow:#f5c55d;--sidebar:300px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
    :root[data-theme=light]{--bg:#fbfcff;--surface:#fff;--surface-2:#eef3fb;--text:#172033;--muted:#62708b;--line:#d9e2f0;--blue:#405df6;--pink:#d83465;--green:#07865b;--yellow:#af7500}
    /* Warm, conversational documentation theme inspired by modern AI readers. */
    :root{--bg:#242321;--surface:#302e2a;--surface-2:#3b3833;--text:#f5f1e9;--muted:#c2b9ae;--line:#504b43;--blue:#df7d5c;--pink:#df7d5c;--green:#7eaf8a;--yellow:#d6ad53;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    :root[data-theme=light]{--bg:#faf9f6;--surface:#fffdf9;--surface-2:#f1eee8;--text:#272522;--muted:#746d65;--line:#ded8cf;--blue:#bf5b3d;--pink:#bf5b3d;--green:#3f7f52;--yellow:#a77a17}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);line-height:1.78;letter-spacing:.002em}.topbar{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:12px;min-height:64px;padding:9px 22px;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--bg) 93%,transparent);backdrop-filter:blur(16px)}.brand{color:var(--text);font-size:17px;font-weight:800;letter-spacing:-.035em;text-decoration:none;white-space:nowrap}.brand i{color:var(--blue);font-style:normal}.brand small{display:block;margin-top:3px;color:var(--muted);font-size:9px;font-weight:700;letter-spacing:.04em}.search-wrap{position:relative;width:min(440px,100%);margin-left:auto}#search{width:100%;padding:9px 14px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--text)}#search:focus{outline:2px solid color-mix(in srgb,var(--blue) 55%,transparent);outline-offset:2px}#search-results{display:none;position:absolute;top:calc(100% + 8px);width:100%;max-height:360px;overflow:auto;padding:8px;border:1px solid var(--line);border-radius:10px;background:var(--surface);box-shadow:0 18px 45px #0003}#search-results.open{display:block}.search-result{display:block;width:100%;padding:10px;border:0;border-radius:7px;background:none;color:var(--text);text-align:left}.search-result:hover{background:var(--surface-2)}.icon{width:38px;height:38px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--text)}.menu{display:none}.shell{display:grid;grid-template-columns:var(--sidebar) minmax(0,900px) 220px;max-width:1420px;margin:auto}.sidebar{position:sticky;top:64px;height:calc(100vh - 64px);overflow:auto;padding:28px 18px;border-right:1px solid var(--line)}.nav-group{margin-bottom:25px}.nav-group h2,.outline h2{margin:0 0 9px;padding:0 10px;color:var(--muted);font-size:10px;letter-spacing:.12em;text-transform:uppercase}.nav-group a{display:flex;gap:9px;padding:8px 10px;border-radius:7px;color:var(--muted);font-size:13px;line-height:1.35;text-decoration:none}.nav-group a b{color:var(--blue);font:11px/1.6 ui-monospace,monospace}.nav-group a:hover,.nav-group a.active{background:var(--surface-2);color:var(--text)}main{padding:0 60px 100px}.home{padding:82px 0 52px;border-bottom:1px solid var(--line)}.eyebrow{color:var(--blue);font-size:10px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}.home h1,.lesson h1{font-family:ui-serif,Georgia,Cambria,"Times New Roman",serif}.home h1{max-width:720px;margin:14px 0;font-size:clamp(46px,7vw,76px);line-height:.98;letter-spacing:-.055em}.home h1 em{color:var(--blue);font-style:italic}.lead{max-width:650px;color:var(--muted);font-size:19px;line-height:1.58}.stats{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px}.stats span{padding:5px 10px;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--muted);font-size:12px}.downloads{display:grid;gap:10px;margin:38px 0}.downloads a{padding:14px 16px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--text);font-weight:750;text-decoration:none}.downloads a:hover{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 8%,var(--surface))}.lesson{display:none;padding-top:64px}.lesson.active{display:block}.lesson header{padding-bottom:24px;border-bottom:1px solid var(--line)}.lesson header span{color:var(--blue);font-size:10px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}.lesson h1{margin:11px 0 0;font-size:clamp(37px,5vw,56px);line-height:1.05;letter-spacing:-.045em}.prose{max-width:740px;padding:34px 0;font-family:ui-serif,Georgia,Cambria,"Times New Roman",serif;font-size:18px;line-height:1.82}.prose h2,.prose h3{font-family:ui-sans-serif,system-ui,sans-serif}.prose h2{margin:46px 0 13px;font-size:25px;line-height:1.2;letter-spacing:-.03em}.prose h3{margin:30px 0 8px;font-size:18px;line-height:1.3}.prose p{margin:0 0 18px}.prose ul,.prose ol{padding-left:24px}.prose li{margin:7px 0}.prose pre{overflow:auto;padding:17px;border:1px solid var(--line);border-radius:10px;background:#1c1b19;color:#ece6dd;font:13px/1.65 ui-monospace,monospace}.prose code{font:12px ui-monospace,monospace}.prose blockquote{margin:22px 0;padding:15px 17px;border-left:3px solid var(--blue);background:color-mix(in srgb,var(--blue) 9%,var(--surface));font-family:ui-sans-serif,system-ui,sans-serif;font-size:16px}.prose table{width:100%;border-collapse:collapse;font-family:ui-sans-serif,system-ui,sans-serif;font-size:14px}.prose th,.prose td{padding:10px;border:1px solid var(--line);text-align:left}.check{padding:20px;border:1px solid color-mix(in srgb,var(--blue) 38%,var(--line));border-radius:12px;background:color-mix(in srgb,var(--blue) 8%,var(--surface));font-family:ui-sans-serif,system-ui,sans-serif}.check h2{margin:5px 0;font-size:21px}.check p{color:var(--muted)}.check textarea{width:100%;min-height:76px;padding:11px;border:1px solid var(--line);border-radius:8px;background:var(--surface-2);color:var(--text)}.check button,.pager button{margin-top:10px;padding:10px 14px;border:0;border-radius:8px;background:var(--blue);color:#fff;font-weight:800}.pager{display:flex;justify-content:space-between;gap:12px;margin-top:28px;padding-top:22px;border-top:1px solid var(--line)}.pager .previous{background:var(--surface);border:1px solid var(--line);color:var(--text)}.outline{position:sticky;top:90px;align-self:start;max-height:calc(100vh - 110px);overflow:auto;margin-top:26px;padding:18px 0;border:1px solid var(--line);border-radius:10px;background:var(--surface)}.outline a{display:block;padding:5px 13px;color:var(--muted);font-size:12px;line-height:1.35;text-decoration:none}.outline a:hover{color:var(--text)}@media(max-width:1100px){.shell{grid-template-columns:var(--sidebar) minmax(0,1fr)}.outline{display:none}}@media(max-width:800px){.menu{display:block}.shell{display:block}.sidebar{position:fixed;left:0;z-index:9;width:min(88vw,330px);transform:translateX(-105%);transition:transform .2s;background:var(--bg);box-shadow:18px 0 50px #0005}.nav-open .sidebar{transform:none}main{padding:0 20px 70px}.topbar{padding:9px 14px}}@media(max-width:580px){.topbar{flex-wrap:wrap}.search-wrap{order:3;flex-basis:100%;margin-bottom:2px}.sidebar{top:112px;height:calc(100vh - 112px)}.home h1{font-size:49px}.prose{font-size:17px}.prose h2{font-size:23px}}
  </style>
</head>
<body>
  <header class="topbar"><button class="icon menu" aria-label="Open navigation">☰</button><a class="brand" href="#home">Viral <i>Playbook</i><small>by Jonathan Chen</small></a><div class="search-wrap"><input id="search" type="search" placeholder="Search the playbook" aria-label="Search the playbook"><div id="search-results"></div></div><button id="theme" class="icon" aria-label="Switch theme">☀</button></header>
  <div class="shell"><aside class="sidebar">${nav}</aside><main>
    <section class="home" id="home"><p class="eyebrow">The Viral Video Playbook · Version 4</p><h1>Make videos people <em>cannot ignore.</em></h1><p class="lead">A practical system for YouTube Shorts and long-form video—from the idea through the autopsy.</p><div class="stats"><span>38 lessons</span><span>50 repeatable formats</span><span>~${totalMinutes} min read</span></div><section class="downloads"><a href="/downloads/Viral-Video-Playbook-v4.pdf" download>Download the PDF playbook</a><a href="/downloads/Viral-Video-Ideas-Skill.zip" download>Download the Viral Video Ideas skill</a></section></section>
    ${pages}
  </main><aside class="outline" id="outline"><h2>On this page</h2><p>Choose a lesson to see its outline.</p></aside></div>
  <script>
    const index = ${JSON.stringify(index)};
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
    const lessons = $$(".lesson");
    let current = 1;
    function showLesson(number, scroll = true) {
      const lesson = $("#part-" + number); if (!lesson) return;
      current = Number(number); $("#home").style.display = "none";
      lessons.forEach((item) => item.classList.toggle("active", item === lesson));
      $$(".nav-group a").forEach((link) => link.classList.toggle("active", Number(link.dataset.part) === current));
      const headings = $$("h2,h3", lesson).map((heading) => { if (!heading.id) heading.id = heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, "-"); return '<a href="#' + heading.id + '">' + heading.textContent + "</a>"; }).join("");
      $("#outline").innerHTML = "<h2>On this page</h2>" + headings;
      history.replaceState(null, "", "#part-" + current); if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
    }
    $$(".nav-group a").forEach((link) => link.addEventListener("click", (event) => { event.preventDefault(); showLesson(link.dataset.part); document.body.classList.remove("nav-open"); }));
    $$(".next").forEach((button) => button.addEventListener("click", () => showLesson(current + 1)));
    $$(".previous").forEach((button) => button.addEventListener("click", () => showLesson(current - 1)));
    $$(".complete-check").forEach((button) => button.addEventListener("click", () => { const lesson = button.closest(".lesson"); localStorage.setItem("viral-playbook-check-" + lesson.dataset.part, "reviewed"); button.textContent = "Reviewed ✓"; }));
    const storedTheme = localStorage.getItem("viral-playbook-theme") || "dark";
    function setTheme(theme) { document.documentElement.dataset.theme = theme; localStorage.setItem("viral-playbook-theme", theme); $("#theme").textContent = theme === "dark" ? "☀" : "☾"; }
    setTheme(storedTheme); $("#theme").addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
    $("#search").addEventListener("input", (event) => { const query = event.target.value.trim().toLowerCase(), results = $("#search-results"); if (!query) { results.classList.remove("open"); return; } const matches = index.filter((item) => (item.title + item.text).toLowerCase().includes(query)).slice(0, 12); results.innerHTML = matches.map((item) => '<button class="search-result" data-result="' + item.number + '"><strong>Part ' + item.number + " · " + item.title + '</strong><small>' + item.text.slice(0, 120) + "…</small></button>").join("") || "<p>No matching lessons.</p>"; results.classList.add("open"); $$(".search-result", results).forEach((button) => button.addEventListener("click", () => { showLesson(button.dataset.result); results.classList.remove("open"); $("#search").value = ""; })); });
    $(".menu").addEventListener("click", () => document.body.classList.toggle("nav-open"));
    const initial = location.hash.match(/^#part-(\\d+)$/); if (initial) showLesson(initial[1], false);
  </script>
</body>
</html>`;

await rm(output, { recursive: true, force: true });
await mkdir(downloads, { recursive: true });
await writeFile(join(output, "index.html"), document);
await writeFile(
  join(output, "print.html"),
  document
    .replace(".lesson{display:none", ".lesson{display:block")
    .replace('class="topbar"', 'class="topbar print-hidden"')
    .replace("  <script>", "  <style>@media print{.print-hidden,.sidebar,.outline,.pager,.check{display:none!important}.shell{display:block}.home{display:none!important}.lesson{display:block!important;page-break-after:always}main{padding:0}.prose{max-width:none}}</style><script>"),
);
await cp(join(root, "skills"), join(output, "skills"), { recursive: true });
console.log(`Built ${parts.length} lessons to dist/.`);
