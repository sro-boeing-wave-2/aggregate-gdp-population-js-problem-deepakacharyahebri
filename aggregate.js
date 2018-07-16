/**
 * Aggregates GDP and Population Data by Continents
 * @param {*} filePath
 */
const fs = require('fs');

const readFileAsync = path => new Promise((resolve, reject) => {
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) reject(err);
    else resolve(data);
  });
});
const aggregate = filePath => new Promise((resolve) => {
  Promise.all([readFileAsync(filePath), readFileAsync('country-continent-map.json')]).then((values) => {
    const mapper = JSON.parse(values[1]);
    const csvFileContents = values[0].replace(/["']/g, '').split('\n');
    const headers = csvFileContents[0].split(',');
    const rowsOfCountryData = csvFileContents.slice(1, csvFileContents.length);
    const countryIndex = headers.indexOf('Country Name');
    const gdpIndex = headers.indexOf('GDP Billions (US Dollar) - 2012');
    const populationIndex = headers.indexOf('Population (Millions) - 2012');
    const aggregatedGdpPopulation = {};
    rowsOfCountryData.forEach((row) => {
      const splitData = row.split(',');
      if (mapper[splitData[countryIndex]] !== undefined) {
        try {
          aggregatedGdpPopulation[mapper[splitData[countryIndex]]].GDP_2012
          += parseFloat(splitData[gdpIndex]);
          aggregatedGdpPopulation[mapper[splitData[countryIndex]]].POPULATION_2012
          += parseFloat(splitData[populationIndex]);
        } catch (e) {
          aggregatedGdpPopulation[mapper[splitData[countryIndex]]] = {
            GDP_2012: parseFloat(splitData[gdpIndex]),
            POPULATION_2012: parseFloat(splitData[populationIndex]),
          };
        }
      }
    });
    fs.writeFile('./output/output.json', JSON.stringify(aggregatedGdpPopulation), (err) => {
      if (!err) resolve();
    });
  }, () => { });
});
module.exports = aggregate;
