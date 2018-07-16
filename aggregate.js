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
const writeFileAsync = (path, data) => new Promise((resolve, reject) => {
  fs.writeFile(path, data, (err) => {
    if (!err) resolve(data);
    else reject(err);
  });
});
const getCountryContinentMap = (fileContents) => {
  const countryContinentMap = new Map();
  const getRows = fileContents.split('\n');
  let splitByComma;
  for (let i = 0; i < getRows.length - 1; i += 1) {
    splitByComma = getRows[i].split(',');
    countryContinentMap.set(splitByComma[0], splitByComma[1]);
  }
  return countryContinentMap;
};
const getCSVContentsAsObjects = (fileContents, countryContinentMap) => {
  const rowOfContents = fileContents.replace(/["']+/g, '').split('\n');
  const headers = rowOfContents[0].split(',');
  const objectArray = [];
  let obj;
  for (let i = 1; i < rowOfContents.length - 1; i += 1) {
    obj = {};
    const splitByComma = rowOfContents[i].split(',');
    if (splitByComma[0] !== 'European Union') {
      for (let j = 0; j < headers.length; j += 1) {
        if (j === 0) obj[headers[j]] = splitByComma[j];
        else obj[headers[j]] = parseFloat(splitByComma[j]);
      }
      obj.Continent = countryContinentMap.get(splitByComma[0]);
      objectArray.push(obj);
    }
  }
  return objectArray;
};
const aggregate = filePath => new Promise((resolve, reject) => {
  Promise.all([readFileAsync(filePath), readFileAsync('./cc-mapping.txt')]).then((values) => {
    const countryMapData = values[1];
    const csvData = values[0];
    const countryContinentMap = getCountryContinentMap(countryMapData);
    const objectArray = getCSVContentsAsObjects(csvData, countryContinentMap);
    const toJSONObject = {};
    objectArray.forEach((obj) => {
      try {
        toJSONObject[obj.Continent].GDP_2012 += obj['GDP Billions (US Dollar) - 2012'];
        toJSONObject[obj.Continent].POPULATION_2012 += obj['Population (Millions) - 2012'];
      } catch (e) {
        toJSONObject[obj.Continent] = {
          GDP_2012: obj['GDP Billions (US Dollar) - 2012'],
          POPULATION_2012: obj['Population (Millions) - 2012'],
        };
      }
    });
    const dataToBeWrittenToFile = JSON.stringify(toJSONObject, 2, 2);
    writeFileAsync('./output/output.json', dataToBeWrittenToFile).then((data) => {
      resolve(data);
    }, err => reject(err));
  }, () => { });
});

module.exports = aggregate;
