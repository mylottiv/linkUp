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
    console.log(req.params.name);
    // (The weird part) Construct message log through nested ORM include statements
    db.MessageData.findAll({
      include: [{
        model: db.ChatData,
        attributes: ['id'],
        include: {
          model: db.EventData,
          attributes: ['id'],
          where: { eventname: req.params.name }
        }
      }],
      attributes: ['username', 'content', 'createdAt', 'updatedAt']
      }).then(function(messageResults) {
        const payload = {
          messageLog: messageResults.map((message) => {
            return {
              user: message.dataValues.username,
              content: message.dataValues.content
            }
          }),
          eventname: req.params.name
        };
        console.log('results');
        res.render("chat", payload);
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
