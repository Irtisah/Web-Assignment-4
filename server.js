/********************************************************************************
 * WEB322 – Assignment 05*
 * 
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 * 
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 * 
 *  Name: __Irtisah Malik____________________ Student ID: ____154200224_________ Date: __12 April 2024____________
 * 
 * Published URL: _________https://web-assignment-4-3.onrender.com__________________________________________________
 * 
 *********************************************************************************/

const legoData = require("./modules/legoSets");
const express = require("express");
const path = require("path");
const { Sequelize } = require('sequelize');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true })); 

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/lego/sets", (req, res) => {
  const theme = req.query.theme;
  if (theme) {
    legoData.getSetsByTheme(theme)
      .then(setsByTheme => {
        if (setsByTheme.length === 0) {
          res.status(404).render("404", { message: "No sets found for theme." });
        } else {
          res.render("sets", { page: "/lego/sets", sets: setsByTheme, theme: theme }); 
        }
      })
      .catch(error => res.status(404).send(error.message));
  } else {
    legoData.getAllSets()
      .then(allSets => res.render("sets", { page: "/lego/sets", sets: allSets, theme: "" })) 
      .catch(error => res.status(404).send(error.message));
  }
});

app.get("/lego/sets/:num", (req, res) => {
  const setId = req.params.num; 
  legoData.getSetByNum(setId)
    .then(setByNum => {
      if (!setByNum) {
        res.status(404).render("404", { message: "No set found for set number." });
      } else {
        const theme = setByNum.theme;
        res.render("set", { set: setByNum, theme: theme });
      }
    })
    .catch(error => res.status(500).send(error.message));
});

app.get(['/lego/addSet', '/lego/addSet.html'], (req, res) => {
  legoData.getAllSets()
  .then(themes => {
      res.render("addSet", {themes});
  })
  .catch (err => {
      res.render("500", { message: `Error fetching themes: ${err}` });
  })
  
});
app.post('/lego/addSet', (req, res) => {
  legoData.addSet(req.body)
  .then(() => {
      res.redirect('/lego/sets');
  })
  .catch(err => {
      res.render("500", { message: ` error: ${err}` });
  });
});

app.get('/lego/editSet/:num', (req, res) => {
  const setNum = req.params.num;
  
  Promise.all([
      legoData.getSetByNum(setNum),
      legoData.getAllSets()
  ])
  .then(([setData, themeData]) => {
      res.render("editSet", { set: setData, themes: themeData });
  })
  .catch(err => {
      res.status(404).render("404", { message: err });
  });
});

app.post('/lego/editSet', (req, res) => {
  const setNum = req.body.set_num;
  const setData = req.body;

  legoData.editSet(setNum, setData)
  .then(() => {
      res.redirect('/lego/sets');
  })
  .catch(err => {
      res.render("500", { message: `error: ${err}` });
  });
});

app.post('/lego/deleteSet/:num', (req,res) => {
  const setNum = req.params.num;
  legoData.deleteSet(setNum)
      .then(() => {
          res.redirect('/lego/sets');
      })
      .catch((err) => {
          res.render("500", {message: ` error: ${err}`});
      });

});

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

module.exports = sequelize;

sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

legoData.initialize()
  .then(() => {
    console.log('Database initialized successfully');
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
  })
  .catch(error => console.error("Initialization cannot be completed:", error.message));

const { initialize, insertDataFromJSON } = require('./modules/legoSets.js');
initialize();
insertDataFromJSON();

module.exports = app;
