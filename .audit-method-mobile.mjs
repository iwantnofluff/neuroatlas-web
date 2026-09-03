import { chromium } from "playwright";
const browser = await chromium.launch();

const viewports = [
  { width: 375, height: 667, label: "iphone-se" },
  { width: 390, height: 844, label: "iphone-14" },
  { width: 360, height: 740, label: "android-common" },
];

for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "load", timeout: 60000 });
  await page.mouse.move(vp.width / 2, vp.height / 2);
  // Scroll to progress ~0.9 so all three cards are revealed (worst case).
  for (let i = 0; i < 60; i++) {
    const p = await page.evaluate(() => {
      const el = document.getElementById("the-method");
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      return total > 0 ? (-r.top) / total : -1;
    });
    if (p > 0.9) break;
    await page.mouse.wheel(0, 220);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(500);

  const info = await page.evaluate(() => {
    const section = document.getElementById("the-method");
    const sticky = section.querySelector(":scope > div");
    const cards = Array.from(section.querySelectorAll(".card-glass"));
    const heading = section.querySelector("h2");
    return {
      stickyClientHeight: sticky.clientHeight,
      stickyScrollHeight: sticky.scrollHeight,
      overflowing: sticky.scrollHeight > sticky.clientHeight,
      headingRect: heading.getBoundingClientRect(),
      cardRects: cards.map((c) => c.getBoundingClientRect()),
      lastCardBottom: cards[cards.length - 1]?.getBoundingClientRect().bottom,
      viewportHeight: window.innerHeight,
    };
  });
  console.log(vp.label, JSON.stringify(info, null, 1));
  await page.screenshot({ path: `/tmp/method-${vp.label}.png` });
  await ctx.close();
}

await browser.close();
