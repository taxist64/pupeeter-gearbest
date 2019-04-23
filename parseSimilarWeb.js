const axios = require('axios');
const fs = require('fs');
const util = require('util');
const log_file = fs.createWriteStream('debug.log', {flags: 'w'});
const log_stdout = process.stdout;

const csv = require('fast-csv');

const resultFile = 'resultCSV/awin-full-3.csv';
const inputFileName = 'awin-aborted-1.csv';
const abortedFileName = 'awin-aborted.csv';
const notFoundFileName = 'awin-404.csv';

const ws = fs.createWriteStream(resultFile);

const countryList = {
    276: 'Germany',
    703: 'Slovakia',
    756: 'Switzerland',
    40: 'Austria',
    840: 'United States',
    250: 'France',
    826: 'United Kingdom',
    56: 'Belgium',
    528: 'Netherlands',
    380: 'Italy',
    442: 'Luxembourg',
    356: 'India',
    704: 'Viet Nam',
    792: 'Turkey',
    616: 'Poland',
    804: 'Ukraine',
    76: 'Brazil',
    124: 'Canada',
    232: 'Eritrea',
    100: 'Bulgaria',
    44: 'Bahamas',
    226: 'Equatorial Guinea',
    203: 'Czech Republic',
    300: 'Greece',
    112: 'Belarus',
    233: 'Estonia',
    484: 'Mexico',
    620: 'Portugal',
    156: 'China',
    36: 'Australia',
    630: 'Puerto Rico',
    643: 'Russian Federation',
    752: 'Sweden',
    586: 'Pakistan',
    724: 'Spain',
    170: 'Colombia',
    152: 'Chile',
    360: 'Indonesia',
    50: 'Bangladesh',
    688: 'Serbia',
    566: 'Nigeria',
    638: 'Reunion',
    554: 'New Zealand',
    348: 'Hungary',
    578: 'Norway',
    710: 'South Africa',
    148: 'Chad',
    32: 'Argentina',
    60: 'Bermuda',
    136: 'Cayman Islands',
    398: 'Kazakhstan',
    268: 'Georgia',
    764: 'Thailand',
    158: 'Taiwan',
    458: 'Malaysia',
    862: 'Venezuela',
    372: 'Ireland',
    516: 'Namibia',
    858: 'Uruguay',
    4: 'Afghanistan',
    608: 'Philippines',
    332: 'Haiti',
    392: 'Japan',
    388: 'Jamaica',
    52: 'Barbados',
    604: 'Peru',
    218: 'Ecuador',
    642: 'Romania',
    214: 'Dominican Republica',
    682: 'Saudi Arabia',
    788: 'Tunisia',
    180: 'Congo Republic',
    376: 'Israel',
    634: 'Qatar',
    28: 'Antigua and Barbuda',
    428: 'Latvia',
    833: 'Isle of Man',
    850: 'Virgin Islands, U.S.',
    454: 'Malawi',
    410: 'Korea Republic',
    646: 'Rwanda',
    191: 'Croatia',
    705: 'Slovenia',
    208: 'Denmark',
    818: 'Egypt',
    784: 'United Arab Emirates',
    246: 'Finland',
    414: 'Kuwait',
    344: 'Hong Kong',
    70: 'Bosnia',
    662: 'Saint Lucia',
    328: 'Guyana',
    440: 'Lithuania',
    364: 'Iran',
    438: 'Liechtenstein',
    352: 'Iceland',
    807: 'Macedonia',
    116: 'Cambodia',
    504: 'Morocco',
    12: 'Algeria',
    591: 'Panama',
    736: 'Sudan',
    288: 'Ghana',
    422: 'Lebanon',
    702: 'Singapore',
    600: 'Paraguay',
    24: 'Angola',
    320: 'Guatemala',
    508: 'Mozambique',
    132: 'Cape Verde',
    368: 'Iraq',
    312: 'Guadeloupe',
    212: 'Dominica',
    426: 'Lesotho',
    68: 'Bolivia',
    275: 'Palestinian',
    316: 'Guam',
    474: 'Martinique',
    674: 'San Marino',
    8: 'Albania',
    196: 'Cyprus',
    831: 'Guernsey',
    498: 'Moldova',
    678: 'Sao Tome and Principe',
    480: 'Mauritius',
    659: 'Saint Kitts and Nevis',
    834: 'Tanzania',
    496: 'Mongolia',
    860: 'Uzbekistan',
    234: 'Faroe Islands',
    140: 'Central African',
    832: 'Jersey',
    492: 'Monaco',
    178: 'Congo',
    670: 'Saint Vincent',
    304: 'Greenland',
    92: 'Virgin Islands',
    466: 'Mali',
    780: 'Trinidad and Tobago',
    404: 'Kenya'
};

// import {countryList} from './countryList';


console.log = function (d) { //
    log_file.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
};

(() => {
    let companylist = [["Name", "URL", "Category", "Similar Web Category", "2 months visit", "GEO top 1", "GEO top 2", "GEO top 3", "GEO top 4", "GEO top 5", "Global Rank", "Country Rank", "Category Rank"]];
    let companylist404 = [["Name", "URL", "Category"]];
    let companylistAborted = [["Name", "URL", "Category"]];
    const fromWeb = () => new Promise(resolve => {
        let returnList = [];
        csv.fromPath(inputFileName, {headers: true})
            .on('data', (data) => {
                returnList.push(data);
            })
            .on('end', () => {
                resolve(returnList);
            });
    });

    async function asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36';

    fromWeb().then((data) => {
        const getRandomInt = (min, max) =>
            Math.floor(Math.random() * (max - min)) + min;
        const start = async () => {
            const waitFor = (ms) => new Promise(r => setTimeout(r, ms));

            await asyncForEach(data, async (parseCompany, idx) => {

                await waitFor(getRandomInt(4000, 7000));

                let dirtyUrl = '';
                try {
                    dirtyUrl = new URL(parseCompany.URL).origin;
                } catch (e) {
                    dirtyUrl = '';
                }

                const urlAPI = dirtyUrl.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
                console.log(new Date().toLocaleString());
                console.log(urlAPI);
                axios.interceptors.request.use(function (config) {
                    return config;
                }, function (error) {
                    return Promise.reject(error);
                });

                axios.interceptors.response.use(function (response) {
                    return response || {};
                }, function (error) {
                    const status = error.response ? error.response.status : null;
                    const code = error.code || null;

                    if (status === 404) {
                        return Promise.resolve({data: '404'});
                    } else if (code === 'ECONNABORTED') {
                        return Promise.resolve({data: 'aborted'});
                    } else {
                        return Promise.reject(error);
                    }
                });
                axios.get(`https://api.similarweb.com/v1/SimilarWebAddon/${urlAPI}/all`, {
                    timeout: 60000
                })
                    .then(res => {
                        if (res.data === '404') {
                            console.log('404');
                            companylist404.push([parseCompany.Name, dirtyUrl, parseCompany.Category]);
                            companylist.push([parseCompany.Name, dirtyUrl, parseCompany.Category]);
                        } else if (res.data === 'aborted') {
                            console.log('aborted');
                            companylistAborted.push([parseCompany.Name, dirtyUrl, parseCompany.Category]);
                        } else {

                            const companyDescription = res.data || {};
                            const getValue = (key, localKey) =>
                                companyDescription[key]
                                    ? companyDescription[key][localKey] ? companyDescription[key][localKey] : ''
                                    : '';
                            const objectDesc = {
                                globalRank: getValue('GlobalRank', 'Rank'),
                                countryRank: getValue('CountryRank', 'Rank'),
                                categoryRank: getValue('CategoryRank', 'Rank'),
                                swCategory: companyDescription['Category'] || '',
                                country1: '',
                                country2: '',
                                country3: '',
                                country4: '',
                                country5: '',
                                monthlyVisits: ''
                            };

                            if (companyDescription['EstimatedMonthlyVisits']) {
                                const monthlyVisitsArr = Object.entries(companyDescription['EstimatedMonthlyVisits']),
                                    mArrLength = monthlyVisitsArr.length;
                                if (mArrLength !== 0) {
                                    objectDesc.monthlyVisits = mArrLength > 1
                                        ? monthlyVisitsArr[mArrLength - 1][1] + monthlyVisitsArr[mArrLength - 2][1]
                                        : monthlyVisitsArr[mArrLength - 1][1];
                                }
                            }
                            const topCountryShares = companyDescription['TopCountryShares'];
                            if (topCountryShares && topCountryShares.length) {
                                topCountryShares.forEach((country, i) => {
                                    const percent = Number(country['Value'] * 100).toFixed(2);
                                    let countryName = '';
                                    for (let key in countryList) {
                                        if (key === country['Country'].toString()) {
                                            countryName = countryList[key];
                                        }
                                    }
                                    countryName = countryName || country['Country'].toString();
                                    const objKey = `country${i+1}`;
                                    objectDesc[objKey] = `${countryName} - ${percent}`;
                                });

                            }


                            companylist.push([parseCompany.Name, dirtyUrl, parseCompany.Category, objectDesc.swCategory, objectDesc.monthlyVisits,
                                objectDesc.country1, objectDesc.country2, objectDesc.country3, objectDesc.country4,
                                objectDesc.country5, objectDesc.globalRank, objectDesc.countryRank, objectDesc.categoryRank]);
                                console.log('SUCCESS');
                        }
                    })
                    .catch(error => {
                        console.log('!!!!!!!!ERROR!!!!!!!!!!');
                        if (error.status) {
                            console.log(error.data);
                            console.log(error.status);
                            console.log(error.headers);
                        } else {
                            console.log(error);
                        }
                    });
            });

            await waitFor(getRandomInt(15000, 20000));

            await csv.write(companylist, {headers : true}).pipe(ws);
            if (companylist404.length > 1) {

                const ws404 = fs.createWriteStream(notFoundFileName);
                await csv.write(companylist404, {headers : true}).pipe(ws404);
            }
            if (companylistAborted.length > 1) {
                const wsAborted = fs.createWriteStream(abortedFileName);
                await csv.write(companylistAborted, {headers : true}).pipe(wsAborted);
            }

            console.log('Done');
        };
        start();

    });
})();

