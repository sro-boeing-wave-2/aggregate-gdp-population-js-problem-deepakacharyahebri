/**
 * Aggregates GDP and Population Data by Continents
 * @param {*} filePath
 */
const fs = require('fs');

const gdpMap = new Map();
const popMap = new Map();
const getCountryContinentMapping = (filePath) => {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const splitString = fileContents.split('\n');
  let splitByComma;
  const countryContinentMap = new Map();
  for (let i = 0; i < splitString.length; i += 1) {
    splitByComma = splitString[i].split(',');
    countryContinentMap.set(splitByComma[0], splitByComma[1]);
  }
  return countryContinentMap;
};
const getCountryPopulationGdpMapping = (filePath, countryContinentMap) => {
  const mapCountryPopulationGdp = new Map();
  const csvContent = fs.readFileSync(filePath, 'utf8');
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
  return mapCountryPopulationGdp;
};
const aggregatePopulationGdp = (value) => {
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
};
const aggregate = (filePath) => {
  const outputfile = './output/output.json';
  const countryContinentMap = getCountryContinentMapping('./cc-mapping.txt');
  const mapCountryPopulationGdp = getCountryPopulationGdpMapping(filePath, countryContinentMap);
  mapCountryPopulationGdp.forEach(aggregatePopulationGdp);
  const jasonFormatString = {};
  gdpMap.forEach((value, key) => {
    jasonFormatString[key] = {
      GDP_2012: value,
      POPULATION_2012: popMap.get(key),
    };
  });
  fs.writeFileSync(outputfile, JSON.stringify(jasonFormatString));
};

module.exports = aggregate;
