import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import cheerio from 'cheerio';

puppeteer.use(StealthPlugin());

const browser = await puppeteer.launch({
  headless: false,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
  ],
});

const coldplay = async () => {
  const page = await browser.newPage();
  // disable images
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.resourceType() === 'image') {
      req.abort();
    } else {
      req.continue();
    }
  });

  let buttonHref = null;
  while (!buttonHref) {
    await page.goto('https://coldplayinjakarta.com/');
    let html = await page.content();
    const $ = cheerio.load(html);
    // check button contain href or not
    const button = $('div#layout > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div');
    buttonHref = button.find('a').attr('href');
    if (buttonHref) {
      console.log('button href found');
      await page.goto(buttonHref);
    } else {
      console.log('button href not found');
      await page.reload();
    }
  }
};

coldplay();
