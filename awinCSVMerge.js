const fs = require("fs");
const csv = require('fast-csv');
const ws = fs.createWriteStream('awin-original.csv');

(() => {
    try {
        const awinFromWeb = () => new Promise(resolve => {
            let returnList = [];
            csv.fromPath("awin-from-web.csv", {headers: true})
                .on('data', (data) => {
                    returnList.push(data);
                })
                .on('end', () => {
                    resolve(returnList);
                });
        });
        const awinAdvertisers = () => new Promise(resolve => {
            let returnList = [];
            csv.fromPath("awin-advertisers.csv", {headers: true})
                .on('data', (data) => {
                    returnList.push(data);
                })
                .on('end', () => {
                    resolve(returnList);
                });
        });

        Promise.all([awinFromWeb(), awinAdvertisers()]).then((responses) => {
            console.log(responses[1]);
            let newArray = [["Name", "Url", "Category"]];
            responses[0].forEach((company) => {
                const webCompany = responses[1].find((web) => web.advertiserId === company.id) || {};
                const category = webCompany.parentSectors || '';
                newArray.push([company.name, company.url, category]);
            });
            csv.write(newArray, {headers: true}).pipe(ws);
        });
    } catch (e) {
        console.log('our error', e);
    }
})();