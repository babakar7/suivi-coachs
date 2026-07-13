import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const SHOTS = process.env.SHOTS_DIR ?? ".";
const results = [];
const step = (name, ok, detail = "") =>
  results.push(`${ok ? "PASS" : "FAIL"} — ${name}${detail ? ` — ${detail}` : ""}`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// 1. /admin redirects to login
await page.goto(`${BASE}/admin`);
step("/admin redirects to login", page.url().includes("/admin/login"), page.url());

// 2. wrong password rejected
await page.fill('input[name="password"]', "mauvais-mot-de-passe");
await page.click('button[type="submit"]');
await page.waitForSelector("text=Mot de passe incorrect");
step("wrong password shows French error", true);

// 3. correct password
await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL("**/admin");
step("correct password reaches dashboard", await page.isVisible("text=Tableau de bord"));

// 4. add coach
await page.fill('input[name="name"]', "Coach Test");
await page.click('form:has(input[name="name"]) button[type="submit"]');
await page.waitForSelector('article:has-text("Coach Test")');
step("coach added appears on dashboard", true);

// 5. duplicate coach rejected
await page.fill('input[name="name"]', "coach test");
await page.click('form:has(input[name="name"]) button[type="submit"]');
await page.waitForSelector("text=Cette coach existe déjà");
step("duplicate coach (case-insensitive) rejected", true);

// 6. home lists coach
await page.goto(BASE);
step("home lists Coach Test", await page.isVisible('a:has-text("Coach Test")'));
await page.screenshot({ path: `${SHOTS}/01-home.png` });

// 7. coach page
await page.click('a:has-text("Coach Test")');
await page.waitForSelector("text=Progression totale");
step("coach page renders", true);

// 8. log 1.5h Pratique / Reformer
await page.click('button:has-text("1,5 h")');
await page.click('button:has-text("Enregistrer la séance")');
await page.waitForSelector("text=Séance enregistrée");
await page.waitForSelector("text=1,5 h / 50 h");
step("1,5h Pratique logged; total 1,5/50 shown", true);
await page.screenshot({ path: `${SHOTS}/02-coach-after-first.png` });

// 9. continue banner remembers coach
await page.goto(BASE);
await page.waitForSelector("text=Continuer en tant que Coach Test");
step("continue banner shows last coach", true);
await page.click("text=Continuer en tant que Coach Test");
await page.waitForSelector("text=Progression totale");

// 10. validation: future date rejected
await page.fill('input[name="session_date"]', "2030-01-01");
await page.click('button:has-text("Enregistrer la séance")');
await page.waitForSelector("text=La date ne peut pas être dans le futur");
step("future date rejected with French error", true);

// 11. validation: 0 hours rejected (HTML min blocks it)
await page.fill('input[name="session_date"]', "2026-07-09");
const blocked = await page.evaluate(() => {
  const input = document.querySelector('input[name="hours"]');
  input.value = "0";
  return !input.form.checkValidity();
});
step("0 hours blocked by client-side validation", blocked);

// 12. fill remaining targets → 50h
// already 1.5 pratique; need 18.5 more + 10+10 enseignement + 10 observation
const fillers = [
  ["Pratique", "Reformer", "10"], // → 11.5
  ["Pratique", "Sol", "8.5"], // → 20 pratique
  ["Enseignement", "Reformer", "10"],
  ["Enseignement", "Sol", "10"],
  ["Observation", "Reformer", "10"],
];
for (const [type, eq, hours] of fillers) {
  await page.click(`fieldset:has(legend:text-matches("Type de séance")) button:has-text("${type}")`);
  await page.click(`fieldset:has(legend:text-matches("Équipement")) button:has-text("${eq}")`);
  await page.fill('input[name="hours"]', hours);
  await page.click('button:has-text("Enregistrer la séance")');
  await page.waitForSelector("text=Séance enregistrée");
  await page.waitForTimeout(300);
}
await page.waitForSelector("text=Félicitations, objectif atteint");
step("50h reached shows completion state", true);
await page.screenshot({ path: `${SHOTS}/03-coach-complete.png`, fullPage: true });

// 13. delete an entry → total decreases
page.on("dialog", (d) => d.accept());
const before = await page.textContent("section h2 + span, section span.font-mono");
await page.click('ul li:first-child button[aria-label="Supprimer cette séance"]');
await page.waitForSelector("text=Félicitations", { state: "detached", timeout: 5000 }).catch(() => {});
await page.waitForTimeout(800);
const totalText = await page.textContent("main section:first-of-type span.font-mono");
step("delete entry decreases total", totalText.includes("40"), `before=${before?.trim()} after=${totalText?.trim()}`);
await page.screenshot({ path: `${SHOTS}/04-after-delete.png` });

// 14. admin dashboard reflects totals
await page.goto(`${BASE}/admin`);
await page.waitForSelector('article:has-text("Coach Test")');
const card = await page.textContent('article:has-text("Coach Test")');
step("admin card shows 40h and 80%", card.includes("40") && card.includes("80"), card.replace(/\s+/g, " ").slice(0, 160));
await page.screenshot({ path: `${SHOTS}/05-admin.png`, fullPage: true });

// 15. archive coach → disappears from home
await page.click('article:has-text("Coach Test") button:has-text("Archiver")');
await page.waitForSelector('article:has-text("(archivée)")');
await page.goto(BASE);
await page.waitForTimeout(500);
const gone = !(await page.isVisible('ul a:has-text("Coach Test")'));
step("archived coach hidden from home picker", gone);

// 16. reactivate for cleanup check then logout
await page.goto(`${BASE}/admin`);
await page.click('button:has-text("Réactiver")');
await page.waitForTimeout(500);
await page.click('button:has-text("Se déconnecter")');
await page.waitForURL(`${BASE}/`);
await page.goto(`${BASE}/admin`);
step("after logout /admin redirects to login again", page.url().includes("/admin/login"), page.url());

await browser.close();
console.log(results.join("\n"));
if (results.some((r) => r.startsWith("FAIL"))) process.exit(1);
