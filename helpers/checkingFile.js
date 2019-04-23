const _ = require('lodash');

const fs = require("fs");
const csv = require('fast-csv');
const ws = fs.createWriteStream('full.csv');

(() => {
    try {
        const fileName = 'newFull.csv';
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
            let non_duplidated_data = _.uniqBy(data, 'name');
            non_duplidated_data.filter((item) => {
                return item.websiteadresse && item.websiteadresse!== ' ';
            });
            console.log(non_duplidated_data.length);

            non_duplidated_data.map((item) => {
                let httpArr = item.websiteadresse.split('http');
                if (httpArr.length > 2) {
                    item.websiteadresse = `http${httpArr[httpArr.length - 1]}`;
                    //console.log(item.websiteadresse);
                }
                let perc = item.websiteadresse.split('%');
                if (perc.length > 1) {
                    item.websiteadresse = perc[perc.length - 2];
                    // console.log(item.websiteadresse);
                }
                if  (httpArr.length === 1 ) {
                    //console.log('!!!!!', item.websiteadresse);
                   // console.log('!!!!!', httpArr);
                    item.websiteadresse = 'http://' + item.websiteadresse;
                }
                try {
                    item.websiteadresse = new URL(unescape(item.websiteadresse)).origin;

                } catch (e) {
                    item.websiteadresse = ''
                }
                item = item.websiteadresse.replace(/\s/g, '')
                return item;
            });
            non_duplidated_data.filter((item) => {
                return item.websiteadresse !=='' && item.websiteadresse!== ' ';
            });
            console.log(non_duplidated_data.length);
            non_duplidated_data = _.uniqBy(non_duplidated_data, (res) => {
                try {
                    return new URL(res.websiteadresse).host

                } catch (e) {
                    debugger
                    console.log('!!!' , res.websiteadresse);
                    return '';
                }
            });
            non_duplidated_data.filter((item) => {
                return item.websiteadresse !=='' && item.websiteadresse!== ' ';
            });
            console.log(non_duplidated_data.length);

            csv.write(non_duplidated_data, {headers: true}).pipe(ws);
        });
    } catch (e) {
        console.log('our error', e);
    }
})();