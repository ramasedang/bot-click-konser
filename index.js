import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import cheerio from "cheerio";
import { Cluster } from "puppeteer-cluster";

puppeteer.use(StealthPlugin());

const coldplay = async (isTimeCheckEnabled = true) => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 3,
    puppeteerOptions: {
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        `--proxy-server=68.183.185.62:80`,
      ],
    },
  });

  await cluster.task(async ({ page, data }) => {
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (req.resourceType() === "image") {
        req.abort();
      } else {
        req.continue();
      }
    });

    let buttonHref = null;
    while (!buttonHref) {
      if (isTimeCheckEnabled) {
        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() + 7);
        const currentHours = currentDate.getHours();
        const currentMinutes = currentDate.getMinutes();
        if (currentHours > 9 || (currentHours === 9 && currentMinutes >= 58)) {
          await page.goto("https://coldplayinjakarta.com/");
        } else {
          console.log("It's not time yet. Waiting...");
          await new Promise((resolve) => setTimeout(resolve, 60000));
          continue;
        }
      } else {
        await page.goto("https://coldplayinjakarta.com/");
      }

      let html = await page.content();
      const $ = cheerio.load(html);
      const button = $(
        "div#layout > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div"
      );
      buttonHref = button.find("a").attr("href");
      if (buttonHref) {
        console.log("button href found");
        await page.goto(buttonHref);
      } else {
        console.log("button href not found");
        await page.reload();
      }
    }
  });

  for (let i = 0; i < 3; i++) {
    cluster.queue("https://coldplayinjakarta.com/");
  }

  await cluster.idle();
  await cluster.close();
};

// Call the function with the time check enabled
coldplay(false);

// Or call the function with the time check disabled
// coldplay(false);
