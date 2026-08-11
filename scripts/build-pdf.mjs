import { access, readdir } from "node:fs/promises";
import { delimiter, join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = process.cwd();
const printPath = join(root, "dist", "print.html");
const pdfPath = join(root, "dist", "downloads", "Viral-Video-Playbook-v4.pdf");

await access(printPath);

const expectedExecutable = chromium.executablePath();
let executablePath = expectedExecutable;

try {
  await access(expectedExecutable);
} catch {
  const segments = expectedExecutable.split(delimiter === ";" ? "\\" : "/");
  const browserIndex = segments.findIndex((segment) => segment.startsWith("chromium-"));
  const browserRoot = segments.slice(0, browserIndex + 1).join("/");
  const executableSuffix = segments.slice(browserIndex + 2);
  const candidates = await readdir(browserRoot);
  const alternate = candidates.find((candidate) => candidate.startsWith("chrome-"));

  if (alternate) {
    executablePath = join(browserRoot, alternate, ...executableSuffix);
  }
}

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage();

await page.goto(pathToFileURL(printPath).href, { waitUntil: "networkidle" });
await page.pdf({
  path: pdfPath,
  format: "Letter",
  printBackground: true,
  margin: { top: "0.45in", right: "0.45in", bottom: "0.45in", left: "0.45in" },
});

await browser.close();
console.log(`Generated ${pdfPath}`);
