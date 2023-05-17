import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import cheerio from "cheerio";
import { Cluster } from "puppeteer-cluster";

puppeteer.use(StealthPlugin());

const coldplay = async () => {
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
      ],
    },
  });

  // Disable images
  await cluster.task(async ({ page, data }) => {
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (req.resourceType() === "image") {
        req.abort();
      } else {
        req.continue();
      }
    });

    let ticket = "Not Started";
    while (ticket === "Not Started") {
      const currentDate = new Date();
      currentDate.setHours(currentDate.getHours() + 7);
      const currentHours = currentDate.getHours();
      const currentMinutes = currentDate.getMinutes();
      if (currentHours > 9 || (currentHours === 9 && currentMinutes >= 58)) {
        await page.goto("https://widget.loket.com/widget/3q5nwgknn8jdyqbe");
        await page.waitForSelector(
          "#main > div.widget-container > div.widget_event_info > div > div > strong"
        );
        let html = await page.content();
        const $ = cheerio.load(html);
        const not_started = $(
          "#ticket_list > tbody > tr.tr-table-243583 > td:nth-child(3) > span"
        );
        ticket = not_started.text();
        // console.log(ticket);
        if (ticket !== "Not Started") {
          console.log("Ticket status changed!");
          // Insert any action here when the ticket status changes.
        } else {
          console.log("Ticket status is still 'Not Started'. Reloading...");
          // await delay(3000);
          await page.reload();
        }
      } else {
        console.log("It's not time yet. Waiting...");
        await new Promise((resolve) => setTimeout(resolve, 60000));
      }
    }
  });

  for (let i = 0; i < 3; i++) {
    cluster.queue("https://coldplayinjakarta.com/");
  }

  await cluster.idle();
  await cluster.close();
};

coldplay();
