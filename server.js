/********************************************************************************
 * WEB322 – Assignment 04*
 * 
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 * 
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 * 
 *  Name: __Irtisah Malik____________________ Student ID: ____154200224_________ Date: __29 March 2024____________
 * 
 * Published URL: ___________________________________________________________
 * 
 *********************************************************************************/

const legoData = require("./modules/legoSets");
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));

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

app.use((req, res) => {
  res.status(404).render("404", { message: "No page found for route." });
});

app.use((req, res) => {
  res.status(404).render("404", { message: "The page cannot be found." });
});

legoData.initialize()
  .then(() => {
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
  })
  .catch(error => console.error("Initialization cannot be completed:", error.message));

module.exports = app;
