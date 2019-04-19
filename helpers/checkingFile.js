const _ = require('lodash');

const fs = require("fs");
const csv = require('fast-csv');
const ws = fs.createWriteStream('unique-full.csv');

(() => {
    try {
        const fileName = 'all-full.csv';
        const csvFile = () => new Promise(resolve => {
            let returnList = [];
            csv.fromPath(fileName, {headers: true})
                .on('data', (data) => {
                    returnList.push(data);
                })
                .on('end', () => {
                    resolve(returnList);
                });
        });

        csvFile().then((data) => {
            console.log(data.length);
            let non_duplidated_data = _.uniqBy(data, 'Name');
            non_duplidated_data.map((item) => {
                let httpArr = item.URL.split('http');
                if (httpArr.length > 2) {
                    item.URL = `http${httpArr[httpArr.length - 1]}`;
                    console.log(item.URL);
                }
                let perc = item.URL.split('%');
                if (perc.length > 1) {
                    item.URL = perc[perc.length - 2];
                    console.log(item.URL);
                }
                item.URL = new URL(item.URL).origin;
                return item;
            });
            non_duplidated_data = _.uniqBy(data, (res) => new URL(res.URL).host);
            console.log(non_duplidated_data.length);

            csv.write(non_duplidated_data, {headers: true}).pipe(ws);
        });
    } catch (e) {
        console.log('our error', e);
    }
})();