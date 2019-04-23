const _ = require('lodash');

const fs = require("fs");
const csv = require('fast-csv');
const ws = fs.createWriteStream('newFull.csv');
const ws1 = fs.createWriteStream('part1.csv');

(() => {
    try {
        const fileName = 'full.csv';
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
            let partArray = data.slice(0, 15000);
            let newArray = data.slice(15001, data.length);

            csv.write(newArray, {headers: true}).pipe(ws);
            csv.write(partArray, {headers: true}).pipe(ws1);
        });
    } catch (e) {
        console.log('our error', e);
    }
})();