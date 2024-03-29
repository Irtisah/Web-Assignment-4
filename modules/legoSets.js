const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];

const initialize = () => new Promise((resolve, reject) => {
  try {
    sets = setData.map(set => ({
      ...set,
      theme: themeData.find(theme => theme.id === set.theme_id).name
    }));
    resolve();
  } catch (error) {
    reject(new Error("Initialization cannot be completed"));
  }
});

const getAllSets = () => new Promise(resolve => resolve(sets));

const getSetByNum = setNum => new Promise((resolve, reject) => {
  const selectedSet = sets.find(set => set.set_num === setNum);
  if (selectedSet) {
    resolve(selectedSet);
  } else {
    reject(new Error("Requested set cannot be found"));
  }
});

const getSetsByTheme = theme => new Promise((resolve, reject) => {
  const filteredSets = sets.filter(set =>
    set.theme.toLowerCase().includes(theme.toLowerCase())
  );

  if (filteredSets.length > 0) {
    resolve(filteredSets);
  } else {
    reject(new Error("Requested sets cannot be found"));
  }
});

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };


