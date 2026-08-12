import { access, readdir } from "node:fs/promises";
import { delimiter, join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { locales } from "./i18n.mjs";

const root = process.cwd();

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

for (const [locale, config] of Object.entries(locales)) {
  const printPath = join(root, "dist", config.print);
  const pdfPath = join(root, "dist", "downloads", config.pdf);
  try {
    await access(printPath);
  } catch (error) {
    if (error.code === "ENOENT" && locale === "zh-TW") {
      console.warn("Skipped zh-TW PDF: translated print page is not available yet.");
      continue;
    }
    throw error;
  }

  await page.goto(pathToFileURL(printPath).href, { waitUntil: "networkidle" });
  await page.pdf({
    path: pdfPath,
    format: "Letter",
    printBackground: true,
    margin: { top: "0.45in", right: "0.45in", bottom: "0.45in", left: "0.45in" },
  });
  console.log(`Generated ${pdfPath}`);
}
await browser.close();
