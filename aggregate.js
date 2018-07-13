/**
 * Aggregates GDP and Population Data by Continents
 * @param {*} filePath
 */
const fs = require('fs');

const aggregate = (filePath) => {
  const getCountryContinentMapping = fileObj => new Promise((resolve, reject) => {
    fs.readFile(fileObj, 'utf8', (err, fileContents) => {
      const splitString = fileContents.split('\n');
      let splitByComma;
      const countryContinentMap = new Map();
      for (let i = 0; i < splitString.length; i += 1) {
        splitByComma = splitString[i].split(',');
        countryContinentMap.set(splitByComma[0], splitByComma[1]);
      }
      resolve(countryContinentMap);
      if (err) reject(err);
    });
  });
  getCountryContinentMapping('./cc-mapping.txt').then((countryContinentMap) => {
    const getCPGdpMapping = () => new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, csvContent) => {
        const mapCountryPopulationGdp = new Map();
        const splitString = csvContent.split('\n');
        let splitByComma;
        let country;
        let population;
        let gdp;
        let continent;
        for (let ind = 1; ind < splitString.length - 1; ind += 1) {
          splitByComma = splitString[ind].split(',');
          if (splitByComma[0].slice(1, -1) !== 'European Union') {
            country = splitByComma[0].slice(1, -1);
            population = splitByComma[4].slice(1, -1);
            gdp = splitByComma[7].slice(1, -1);
            continent = countryContinentMap.get(country);
            mapCountryPopulationGdp.set(country, [population, gdp, continent]);
          }
        }
        resolve(mapCountryPopulationGdp);
        if (err) reject(err);
      });
    });
    getCPGdpMapping().then((mapCountryPopulationGdp) => {
      const gdpMap = new Map();
      const popMap = new Map();
      mapCountryPopulationGdp.forEach((value) => {
        if (popMap.has(value[2])) {
          popMap.set(value[2], parseFloat(popMap.get(value[2])) + parseFloat(value[0]));
        } else {
          popMap.set(value[2], parseFloat(value[0]));
        }
        if (gdpMap.has(value[2])) {
          gdpMap.set(value[2], parseFloat(gdpMap.get(value[2])) + parseFloat(value[1]));
        } else {
          gdpMap.set(value[2], parseFloat(value[1]));
        }
      });
      const jsonFormatString = {};
      gdpMap.forEach((value, key) => {
        jsonFormatString[key] = {
          GDP_2012: value,
          POPULATION_2012: popMap.get(key),
        };
      });
      const writeFileAsync = () => new Promise((resolve, reject) => {
        const outputfile = './output/output.json';
        fs.writeFile(outputfile, JSON.stringify(jsonFormatString, 2, 2), (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      writeFileAsync();
    });
  });
};

module.exports = aggregate;
