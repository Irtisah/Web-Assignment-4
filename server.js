/********************************************************************************
 * WEB322 – Assignment 06*
 * 
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 * 
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 * 
 *  Name: __Irtisah Malik____________________ Student ID: ____154200224_________ Date: __19 April 2024____________
 * 
 * 
 * GitHub Repository URL: _____________________________________________________
 * Deployed Application URL: __________________________________________________
 * 
 *********************************************************************************/


const legoData = require("./modules/legoSets");
const express = require("express");
const path = require("path");
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

mongoose.connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("Error connecting to MongoDB:", err));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.render("home"));
app.get("/about", (req, res) => res.render("about"));

app.get("/lego/sets", async (req, res) => {
  try {
    const theme = req.query.theme;
    const sets = theme ? await legoData.getSetsByTheme(theme) : await legoData.getAllSets();
    res.render("sets", { page: "/lego/sets", sets, theme: theme || "" });
  } catch (error) {
    res.status(404).render("404", { message: error.message });
  }
});

app.get("/lego/sets/:num", async (req, res) => {
  try {
    const setByNum = await legoData.getSetByNum(req.params.num);
    if (!setByNum) {
      res.status(404).render("404", { message: "No set found for set number." });
    } else {
      res.render("set", { set: setByNum, theme: setByNum.theme });
    }
  } catch (error) {
    res.status(500).render("500", { message: error.message });
  }
});

app.get('/lego/addSet', async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render("addSet", { themes });
  } catch (error) {
    res.render("500", { message: `Error fetching themes: ${error}` });
  }
});

app.post('/lego/addSet', async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect('/lego/sets');
  } catch (error) {
    res.render("500", { message: `Error: ${error}` });
  }
});

app.get('/lego/editSet/:num', async (req, res) => {
  try {
    const [setData, themeData] = await Promise.all([
      legoData.getSetByNum(req.params.num),
      legoData.getAllThemes()
    ]);
    res.render("editSet", { set: setData, themes: themeData });
  } catch (error) {
    res.status(404).render("404", { message: error.message });
  }
});

app.post('/lego/editSet', async (req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect('/lego/sets');
  } catch (error) {
    res.render("500", { message: `Error: ${error}` });
  }
});

app.post('/lego/deleteSet/:num', async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect('/lego/sets');
  } catch (error) {
    res.render("500", { message: `Error: ${error}` });
  }
});


app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
