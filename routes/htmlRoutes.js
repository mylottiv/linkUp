const db = require("../models");
const path = require('path')



module.exports = function(app) {
  
  // Load index page
  app.get("/", function(req, res) {
    db.EventData.findAll({}).then(function(events) {
      console.log(events);
      res.render("map", {events});
    });
  });

  // Login page get route
  app.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname.replace('routes', 'views') + '/login.html'));
  });

  // Event chat get route  
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
