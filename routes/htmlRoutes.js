const db = require("../models");
const path = require('path')



module.exports = function(app) {
  //This GET route already exists in the api routes file
  
  // Load index page
  app.get("/", function(req, res) {
    // res.render("index");
    db.EventData.findAll({}).then(function(events) {
      console.log(events);
      res.render("index", {events});
    });
  });

  // Login page get route
  app.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname.replace('routes', 'views') + '\\' + 'login.html'));
  });

  // Load example page and pass in an example by id
  app.get("/example/:id", function(req, res) {
    // db.UserData.findOne({ where: { id: req.params.id } }).then(function(dbExample) {
    //   res.render("example", {
    //     example: dbExample
    //   });
    // });
  });

  // Render 404 page for any unmatched routes
  app.get("*", function(req, res) {
    res.render("404");
  });
};
