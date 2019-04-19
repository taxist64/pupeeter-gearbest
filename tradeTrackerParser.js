
const puppeteer = require('puppeteer');


const fastCsv = require("fast-csv");
const fs = require("fs");
const fileStream = fs.createReadStream("trade-tracker-from-web.csv", {encoding: 'utf-16le'});
const ws = fs.createWriteStream('trade-tracker.csv');


(() => {
    try {
        /*const debug = true;
        let browserObj = { headless: true};
        if (debug) {
            browserObj = { devtools: true,
                headless: false,
                slowMo: 25
            };
        }
        const browser = await puppeteer.launch(browserObj);
        const page = await browser.newPage();
        const navigationPromise = page.waitForNavigation();

        const USER_NAME = 'kb_admitad';
        const USER_PASSW = '7rl^V8*fMx2^jF7fdO&e';


        await page.goto('https://tradetracker.com/publishers/');

        await navigationPromise;

        await page.waitForSelector('#open-close-login');
        await page.click('#open-close-login');


        await page.waitForSelector('#control-affiliate-username');
        await page.type('#control-affiliate-username', USER_NAME);
        await page.waitForSelector('#control-affiliate-password');
        await page.type('#control-affiliate-password', USER_PASSW);

        await page.click('[type="submit"]');

        await navigationPromise;

        await page.goto('https://affiliate.tradetracker.com/affiliateCampaign/list');

        await page.waitForSelector('#listview-20-export-csv');
        await page.click('#listview-20-export-csv');

        await browser.close();
        */
        let arr = [["Name", "Url", "Category"]];
        fastCsv
            .fromStream(fileStream, {headers : true})
            .on("data", (data) => {
                arr.push([data.Campaign, data.URL, data.Category]);
            })
            .on("error", (data) => {
                return false;
            })
            .on("end", () => {
                console.log("arr - ", arr);
                console.log("done");
                fastCsv.write(arr, {headers: true}).pipe(ws);
            });
    } catch (e) {
        console.log('our error', e);
    }

})();
