const puppeteer = require('puppeteer');
const fs = require("fs");
const csv = require('fast-csv');
const ws = fs.createWriteStream('awin-from-web.csv');

let dd = {
    set current (str) {
        this.log[this.log.length] = str;
    },
    get current () {
        return this.log;
    },
    log: [["name", "url", "id"]]
};

let companies = {
    set current (arr) {
        this.c = this.c.concat(arr);
    },
    get current () {
        return this.c;
    },
    c: []
};

(async function (dd, companies) {
    try {
        const debug = false;
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

        await page.click('[type="submit"]');

        await page.waitForSelector('#pageLength');
        await page.select('#pageLength', '40');

        await page.waitFor(100);

        const pageLength = await page.evaluate(() => {
            const pagBtns = document.querySelectorAll('.goToPage .paginationButton'),
                btnLength = pagBtns.length,
                pages = Number(pagBtns[btnLength - 1].dataset['page']);
            return isNaN(pages) ? 0 : pages - 1;

        });
        await setCompanies(page, pageLength);


            for (let i = 1; i <= companies.current.length - 1; i++) {
            const comp = companies.current[i];
            await page.goto(comp.url);
            await page.waitForSelector('#accountName');

            const link = await page.evaluate(() => {
                    let element = document.querySelector('div.list-group-icons a:nth-child(1)');
                    return element ? new URL(element.getAttribute('href')).origin : '';
                }),
                name = await page.evaluate(() => {
                    return document.querySelector('#accountName').innerHTML.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
                });

            dd.current = [name, link, comp.id];
        }
        await csv.write(dd.current, {headers : true}).pipe(ws);
        await browser.close();
    } catch (e) {
        console.log('our error', e);
    }

})(dd, companies);

async function setCompanies(page, pagesNumber) {
    for (let i = 0; i < 2; i ++) {
        const pageCompanies = await page.evaluate((self) => {
            let arr = [];
            for (let el of document.querySelectorAll('.merchantDirectory tr')) {
                if (el.classList.length > 0) {
                    const link = el.querySelector('.company a');
                    const id = link.dataset['merchantid'];
                    const url = link.href;
                    arr.push({id, url});
                }
            }
            console.log('arr - ', arr);
            return arr;
        });

        companies.current = pageCompanies;

        await page.waitForSelector('#nextPage');
        await page.click('#nextPage');
    }
}