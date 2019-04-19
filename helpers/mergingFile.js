const fs = require("fs");
const csv = require('fast-csv');
const ws = fs.createWriteStream('resultCSV/all-full.csv');

const firstUrl = 'resultCSV/full-1.csv';
const secondUrl = 'resultCSV/full-2.csv';

(() => {
    try {
        const firstCSV = () => new Promise(resolve => {
            let returnList = [];
            csv.fromPath(firstUrl, {headers: true})
                .on('data', (data) => {
                    returnList.push(data);
                })
                .on('end', () => {
                    resolve(returnList);
                });
        });
        const secondCSV = () => new Promise(resolve => {
            let returnList = [];
            csv.fromPath(secondUrl, {headers: true})
                .on('data', (data) => {
                    returnList.push(data);
                })
                .on('end', () => {
                    resolve(returnList);
                });
        });

        Promise.all([firstCSV(), secondCSV()]).then((responses) => {
            let newArr = responses[0].concat(responses[1]);
            console.log(responses[0].length);
            console.log(responses[1].length);
            console.log(newArr.length);

            csv.write(newArr, {headers: true}).pipe(ws);
        });
    } catch (e) {
        console.log('our error', e);
    }
})();