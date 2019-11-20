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
    res.redirect("../login");
  });

  // Load example page and pass in an example by id
  app.get("/example/:id", function(req, res) {
    // db.UserData.findOne({ where: { id: req.params.id } }).then(function(dbExample) {
    //   res.render("example", {
    //     example: dbExample
    //   });
    // });
  });
  
  app.get("/events/:name", function(req, res) {
    db.EventData.findAll({where: { eventname: req.params.name } }).then(function(events) {
      console.log('results', events[0].dataValues);
      res.render("chat", events[0].dataValues);
    });
    // Find the one event
    // Send its parameters as an object along with a chat.handlebars view
    // Will render the live chatroom for that route
  });

  // Render 404 page for any unmatched routes
  app.get("*", function(req, res) {
    res.render("404");
  });
};
