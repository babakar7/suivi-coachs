import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const SHOTS = process.env.SHOTS_DIR ?? ".shots";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto(BASE, { waitUntil: "networkidle" });
await page.screenshot({ path: `${SHOTS}/01-home.png`, fullPage: true });

// Coach page via the first coach link (navigation only, no writes)
const coachLink = page.locator('a[href^="/coach/"]').first();
if ((await coachLink.count()) > 0) {
  await coachLink.click();
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `${SHOTS}/02-coach.png`, fullPage: true });

  // Expand the progress detail for the shot
  const toggle = page.locator('button:has-text("Voir le détail")');
  if ((await toggle.count()) > 0) {
    await toggle.click();
    await page.screenshot({ path: `${SHOTS}/03-coach-detail.png`, fullPage: true });
  }
} else {
  console.log("no coach link found on home");
}

await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await page.screenshot({ path: `${SHOTS}/04-login.png`, fullPage: true });

await browser.close();
console.log("done");
