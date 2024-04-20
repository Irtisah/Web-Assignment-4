const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const themeSchema = new Schema({
  name: { type: String, required: true }
});

const setSchema = new Schema({
  set_num: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  year: Number,
  num_parts: Number,
  theme: { type: Schema.Types.ObjectId, ref: 'Theme' },
  img_url: String
});

const Theme = mongoose.model('Theme', themeSchema);
const Set = mongoose.model('Set', setSchema);

async function initialize() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log("Connecting to MongoDB Atlas");

    await Theme.deleteMany({});
    await Set.deleteMany({});

    const themes = require('../data/themeData.json');
    const themeDocs = await Theme.insertMany(themes);

    const sets = require('../data/setData.json').map(set => {
      return {
        ...set,
        theme: themeDocs.find(theme => theme.name === set.theme).id
      };
    });

    await Set.insertMany(sets);
    console.log('Database initialized and data loaded successfully');
  } catch (err) {
    console.error('Initialization cannot be completed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

async function getAllSets() {
  return Set.find().populate('theme');
}

async function getSetByNum(setNum) {
  return Set.findOne({ set_num: setNum }).populate('theme');
}

async function getSetsByTheme(themeName) {
  return Set.find().populate({
    path: 'theme',
    match: { name: { $regex: new RegExp(themeName, 'i') } }
  });
}

async function loadInitialData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.DB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connection established");

    console.log("Deleting old data...");
    await Theme.deleteMany({});
    await Set.deleteMany({});

    const themes = require('../data/themeData.json');
    const themeDocs = await Theme.insertMany(themes);
    
    const sets = require('../data/setData.json').map(set => {
      return {
        ...set,
        theme: themeDocs.find(theme => theme.name === set.theme).id
      };
    });

    await Set.insertMany(sets);

    console.log('Data successfully loaded!');
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}



module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, loadInitialData };
