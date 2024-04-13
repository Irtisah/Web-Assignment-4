const { Sequelize, DataTypes, Op } = require('sequelize');
const fs = require('fs').promises;

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const Theme = sequelize.define('Theme', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING
  }
}, {
  timestamps: false
});

const Set = sequelize.define('Set', {
  set_num: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING
  },
  year: {
    type: DataTypes.INTEGER
  },
  num_parts: {
    type: DataTypes.INTEGER
  },
  theme_id: {
    type: DataTypes.INTEGER
  },
  img_url: {
    type: DataTypes.STRING
  }
}, {
  timestamps: false
});

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

const initialize = async () => {
  try {
    await sequelize.sync();

    const themeData = JSON.parse(await fs.readFile('themeData.json', 'utf8'));
    const setData = JSON.parse(await fs.readFile('setData.json', 'utf8'));

    const themes = await Theme.findAll();
    if (themes.length === 0) {
      for (const theme of themeData) {
        await Theme.create(theme);
      }
    }

    const sets = await Set.findAll();
    if (sets.length === 0) {
      for (const set of setData) {
        await Set.create(set);
      }
    }

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Initialization cannot be completed:', err.message);
  }
};

const getAllSets = () => {
  return Set.findAll({ include: [Theme] });
};

const getSetByNum = (setNum) => {
  return Set.findOne({ where: { set_num: setNum }, include: [Theme] });
};

const getSetsByTheme = async (themeName) => {
  try {
    const theme = await Theme.findOne({
      where: { name: { [Op.iLike]: `%${themeName}%` } }
    });

    if (!theme) {
      return [];
    }

    const sets = await Set.findAll({
      include: [Theme],
      where: { theme_id: theme.id }
    });

    return sets;
  } catch (error) {
    console.error('Error retrieving sets by theme:', error);
    throw error;
  }
};

async function insertDataFromJSON() {
  try {
    const setsData = JSON.parse(await fs.readFile(`${__dirname}/../data/setData.json`, 'utf8'));
    const themesData = JSON.parse(await fs.readFile(`${__dirname}/../data/themeData.json`, 'utf8'));

    for (const theme of themesData) {
      await Theme.findOrCreate({ where: { id: theme.id }, defaults: theme });
    }

    for (const set of setsData) {
      await Set.findOrCreate({ where: { set_num: set.set_num }, defaults: set });
    }
    console.log('Data has been inserted successfully.');
  } catch (error) {
    console.error('Error occurred in inserting data:', error);
  }
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, insertDataFromJSON };
