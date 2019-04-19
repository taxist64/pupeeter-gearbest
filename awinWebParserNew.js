const fs = require("fs");
const csv = require('fast-csv');
const ws = fs.createWriteStream('awin-original.csv');
const puppeteer = require('puppeteer');

(async () => {
    try {
        const awinFromWeb =  () => new Promise(resolve => {
            let returnList = [];
            csv.fromPath("awin-advertisers.csv", {headers: true})
                .on('data', (data) => {
                    returnList.push(data);
                })
                .on('end', () => {
                    resolve(returnList);
                });
        });
        awinFromWeb().then((response) => {
            newFunc(response).then(() => {
                console.log('Done');
            });
        });
    } catch (e) {
        console.log('our error', e);
    }
})();

async function newFunc (shops) {
    try {
        const debug = true;
        let browserObj = { headless: true};
        if (debug) {
            browserObj = {
                devtools: true,
                headless: false,
                slowMo: 50
            };
        }
        const browser = await puppeteer.launch(browserObj);
        const page = await browser.newPage();
        const navigationPromise = page.waitForNavigation();

        const USER_NAME = 'egeldt@adgo-online.de';
        const USER_PASSW = '6z4Eceq9FF';

        await page.goto('https://ui.awin.com/login?setLocale=en_GB');

        await page.setViewport({ width: 1280, height: 800 });

        await navigationPromise;

        await page.waitForSelector('#email');
        await page.type('#email', USER_NAME);
        await page.waitForSelector('#password');
        await page.type('#password', USER_PASSW);

        let arr = [["Name", "Url", "Category"]];
        await page.click('[type="submit"]');
        console.log('length - ', shops.length);
        await asyncForEach(shops, async (shop, idx) => {
            console.log('id - ', shop.advertiserId);
            console.log('----INDEX---- - ', idx);
            try {
                await page.goto(`https://marketplace.zanox.com/zanox/affiliate/1316827/1363397/merchant-profile/${shop.advertiserId}`);
                const selector = 'div.list-group-icons a:nth-child(1)';
                await page.waitForSelector(selector);
                const link = await page.evaluate((sel) => {
                    let element = document.querySelector(sel);
                    return element ? new URL(element.getAttribute('href')).origin : '';
                }, (selector));
                arr.push([shop.programName, link, shop.parentSectors]);
            } catch (e) {
                return;
            }
        });

        await csv.write(arr, {headers : true}).pipe(ws);
        await browser.close();
            // https://marketplace.zanox.com/zanox/affiliate/1316827/1363397/merchant-profile/5842
    } catch (e) {
        console.log('our error: ', e);

    }

}
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}