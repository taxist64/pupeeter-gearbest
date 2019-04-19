const puppeteer = require('puppeteer');
const fs = require("fs");
const csv = require('fast-csv');
const ws = fs.createWriteStream('trade-doubler.csv');

let dd = {
    set current (str) {
        this.log[this.log.length] = str;
    },
    get current () {
        return this.log;
    },
    log: [["Name", "Category", "Url"]]
};

(async function (dd) {
    try {
        const debug = true;
        let browserObj = {headless: true};
        if (debug) {
            browserObj = {
                devtools: true,
                headless: false,
                slowMo: 25
            };
        }
        const browser = await puppeteer.launch(browserObj);
        const page = await browser.newPage();
        const navigationPromise = page.waitForNavigation();

        const listUrl = (currentPage) =>
            `https://login.tradedoubler.com/pan/aProgramList.action?categoryChoosen=false&programGEListParameterTransport.currentPage=${currentPage}&programGEListParameterTransport.pageSize=100&programGEListParameterTransport.pageStreamValue=true`;
        const USER_NAME = 'lord17kay';
        const USER_PASSW = 'Victorys2846!';

        const LIST_SELECTOR = '.listtable tr';
        const NAME_SELECTOR = `${LIST_SELECTOR}:nth-child(INDEX) td:nth-child(1)`;
        const NAME_LINK_SELECTOR = `${NAME_SELECTOR} > a`;

        await page.goto('https://login.tradedoubler.com/public/aLogin.action');

        await page.setViewport({width: 1280, height: 800});

        await navigationPromise;

        await page.waitForSelector('#username');
        await page.type('#username', USER_NAME);
        await page.waitForSelector('#password');
        await page.type('#password', USER_PASSW);

        await page.click('[type="submit"]');

        await page.goto(listUrl(1));
        await page.waitForSelector(LIST_SELECTOR);


        let shops = await page.evaluate(() => {
            return document.querySelectorAll('[name="programGEListParameterTransport.siteId"] option').length
        });

        for (let j = 1; j <= shops; j++) {
            await page.evaluate((j) => {
                document.querySelector(`[name="programGEListParameterTransport.siteId"] option:nth-child(${j})`).selected = true;
            }, j);
            await page.click('[type="submit"]');
            await page.waitFor(100);
            await page.waitForSelector('.listtable');

            let pages = await page.evaluate((sel) => {
                return document.querySelectorAll('.listtable')[0].nextElementSibling.querySelectorAll('a').length
            });
            for (let i = 1; i <= pages; i++) {
                if (i > 1 || j > 1) {
                    await page.goto(listUrl(i));
                    await page.waitForSelector(LIST_SELECTOR);
                }
                let links = await page.evaluate((sel) => {
                    let list = document.querySelectorAll(sel);
                    let links = [];
                    let index = 0;

                    for (let element of list) {
                        index++;
                        if (!element.id) {
                            links.push({
                                name: element.querySelector('td:nth-child(1)').innerText,
                                category: element.querySelector('td:nth-child(2)').innerHTML.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&"),
                                index: index
                            })
                        }
                    }

                    return links;
                }, LIST_SELECTOR);
                await download(links, page, NAME_LINK_SELECTOR);
            }
        }

        await csv.write(dd.current, {headers : true}).pipe(ws);
        await browser.close();

    } catch (e) {
        console.log('our error', e);
    }

})(dd);

async function download(links, page, NAME_LINK_SELECTOR) {
    for await (let link of links) {
        try {
            let nameLinkSelector = NAME_LINK_SELECTOR.replace("INDEX", link.index);
            await page.click(nameLinkSelector);
            await page.click('#popBox a:nth-child(1)');
        } catch {
            continue;
        }
        try {
            await page.waitForSelector('[id="#_visitSite"]');
            let url = await page.evaluate(() => {
                let element = document.querySelector('[id="#_visitSite"]').nextElementSibling;
                return element ? element.getAttribute('href') : '';
            });
            await page.goBack();
            dd.current = [link.name, link.category, url];
        }
        catch (error) {
            await page.goBack();
        }
    }

}