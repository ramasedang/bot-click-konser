import puppeteer from "puppeteer-extra";
import useProxy from "puppeteer-page-proxy";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", async (request) => {
    await useProxy(
      request,
      "socks5://dmproxy5387:dmproxy5387@154.85.125.216:6427"
    );
  });

  const pageUrl = "https://coldplayinjakarta.com/";

  await page.goto(pageUrl);
}

run();
