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
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);line-height:1.7}.topbar{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:12px;min-height:64px;padding:9px 22px;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(16px)}.brand{color:var(--text);font-size:17px;font-weight:850;letter-spacing:-.045em;text-decoration:none;white-space:nowrap}.brand i{color:var(--pink);font-style:normal}.brand small{display:block;margin-top:3px;color:var(--muted);font-size:9px;font-weight:700;letter-spacing:.04em}.search-wrap{position:relative;width:min(440px,100%);margin-left:auto}#search{width:100%;padding:9px 14px;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--text)}#search-results{display:none;position:absolute;top:calc(100% + 8px);width:100%;max-height:360px;overflow:auto;padding:8px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}#search-results.open{display:block}.search-result{display:block;width:100%;padding:9px;border:0;border-radius:8px;background:none;color:var(--text);text-align:left}.search-result:hover{background:var(--surface-2)}.icon{width:38px;height:38px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--text)}.menu{display:none}.shell{display:grid;grid-template-columns:var(--sidebar) minmax(0,900px) 220px;max-width:1420px;margin:auto}.sidebar{position:sticky;top:64px;height:calc(100vh - 64px);overflow:auto;padding:26px 18px;border-right:1px solid var(--line)}.nav-group{margin-bottom:23px}.nav-group h2,.outline h2{margin:0 0 8px;padding:0 10px;color:var(--muted);font-size:11px;letter-spacing:.1em;text-transform:uppercase}.nav-group a{display:flex;gap:9px;padding:7px 10px;border-radius:9px;color:var(--muted);font-size:13px;line-height:1.3;text-decoration:none}.nav-group a b{color:var(--blue);font:11px/1.6 ui-monospace,monospace}.nav-group a:hover,.nav-group a.active{background:var(--surface-2);color:var(--text)}main{padding:0 54px 90px}.home{padding:70px 0 45px;border-bottom:1px solid var(--line)}.eyebrow{color:var(--blue);font-size:11px;font-weight:850;letter-spacing:.1em;text-transform:uppercase}.home h1{max-width:700px;margin:12px 0;font-size:clamp(44px,7vw,74px);line-height:.94;letter-spacing:-.07em}.home h1 em{color:var(--pink);font-style:normal}.lead{max-width:650px;color:var(--muted);font-size:19px;line-height:1.5}.stats{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}.stats span{padding:5px 10px;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--muted);font-size:12px}.downloads{display:grid;gap:12px;margin:36px 0}.downloads a{padding:14px;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:var(--text);font-weight:750;text-decoration:none}.lesson{display:none;padding-top:60px}.lesson.active{display:block}.lesson header{padding-bottom:24px;border-bottom:1px solid var(--line)}.lesson header span{color:var(--blue);font-size:11px;font-weight:850;letter-spacing:.1em;text-transform:uppercase}.lesson h1{margin:10px 0 0;font-size:clamp(34px,5vw,54px);line-height:1.04;letter-spacing:-.06em}.prose{max-width:760px;padding:30px 0}.prose h2{margin:42px 0 12px;font-size:27px;line-height:1.15;letter-spacing:-.035em}.prose h3{margin:28px 0 8px;font-size:20px}.prose p{margin:0 0 16px}.prose ul,.prose ol{padding-left:23px}.prose li{margin:6px 0}.prose pre{overflow:auto;padding:16px;border:1px solid var(--line);border-radius:12px;background:#080c16;color:#dce5f6}.prose code{font-family:ui-monospace,monospace}.prose blockquote{margin:20px 0;padding:14px;border-left:4px solid var(--pink);background:color-mix(in srgb,var(--pink) 9%,var(--surface))}.prose table{width:100%;border-collapse:collapse}.prose th,.prose td{padding:10px;border:1px solid var(--line);text-align:left}.check{padding:18px;border:1px solid color-mix(in srgb,var(--blue) 40%,var(--line));border-radius:14px;background:color-mix(in srgb,var(--blue) 9%,var(--surface))}.check h2{margin:5px 0;font-size:22px}.check p{color:var(--muted)}.check textarea{width:100%;min-height:76px;padding:10px;border:1px solid var(--line);border-radius:9px;background:var(--surface-2);color:var(--text)}.check button,.pager button{margin-top:10px;padding:10px 14px;border:0;border-radius:9px;background:var(--blue);color:#fff;font-weight:800}.pager{display:flex;justify-content:space-between;gap:12px;margin-top:26px;padding-top:20px;border-top:1px solid var(--line)}.pager .previous{background:var(--surface);border:1px solid var(--line);color:var(--text)}.outline{position:sticky;top:90px;align-self:start;max-height:calc(100vh - 110px);overflow:auto;margin-top:26px;padding:17px 0;border:1px solid var(--line);border-radius:12px;background:var(--surface)}.outline a{display:block;padding:4px 12px;color:var(--muted);font-size:12px;text-decoration:none}@media(max-width:1100px){.shell{grid-template-columns:var(--sidebar) minmax(0,1fr)}.outline{display:none}}@media(max-width:800px){.menu{display:block}.shell{display:block}.sidebar{position:fixed;left:0;z-index:9;width:min(88vw,330px);transform:translateX(-105%);transition:transform .2s;background:var(--bg);box-shadow:18px 0 50px #0005}.nav-open .sidebar{transform:none}main{padding:0 20px 70px}.topbar{padding:9px 14px}}@media(max-width:580px){.topbar{flex-wrap:wrap}.search-wrap{order:3;flex-basis:100%;margin-bottom:2px}.sidebar{top:112px;height:calc(100vh - 112px)}.home h1{font-size:47px}.prose h2{font-size:24px}}
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
