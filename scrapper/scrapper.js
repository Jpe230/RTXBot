var fs = require("fs");
const puppeteer = require("puppeteer-core");
const telegramBot = require("../telegrambot/bot");
const EXEC_PATH = process.env.EXEC_PATH;
const date = new Date();

if (EXEC_PATH == undefined) {
  console.error("Please set EXEC_PATH of your browser");
  process.exit(1);
}

exports.products = JSON.parse(
  fs.readFileSync("./scrapper/products.json", "utf8")
);

exports.scrap = (product, store) => {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({ executablePath: EXEC_PATH });
      const page = await browser.newPage();
      await page.goto(store.url);

      let foundItem = await page.evaluate((store) => {
        if ("selector-available" in store) {
          let items = document.querySelectorAll(store["selector-available"]);

          items.forEach((item) => {
            let innerText = item.textContent || item.innerText;
            if (innerText.includes(store["text-available"])) {
              return true;
            }
          });

          return false;
        }

        if ("selector-non-available" in store) {
          let tmpBool = false;
          let items = document.querySelectorAll(store["selector-non-available"]);

          items.forEach((item) => {
            let innerText = item.textContent || item.innerText;
            if (!innerText.includes(store["text-non-available"])) {
              tmpBool = true;
            }
          });

          return tmpBool;
        }
        return false;
      }, store);

      if (foundItem) {
        console.log("Found product!!");
        console.log(store.url);
        console.log("taking screenshot");

        let screenshotName = "../" + date.getDate().toString() + ".png";

        await page.screenshot({ path: screenshotName });

        console.log("Sending Telegram");
        telegramBot.SendMessage(product, store, screenshotName);
        console.log("Done Sending Telegram");
      } else {
        console.log("Product non available");
      }
      browser.close();
      return true;
    } catch (e) {
      return reject(e);
    }
  });
};

exports.testScrap = () => {
  let screenshotName = "./test.png";
  console.log("Sending Telegram");
  telegramBot.SendMessage("example", "example", screenshotName);
  console.log("Done Sending Telegram");
};
