var db = require("../models");

module.exports = function(app) {
  // Get all examples
  app.get("/", function(req, res) {
    db.EventData.findAll().then(function(result) {
      res.render("index", {result})
  });
});

  // Create a new example
  app.post("/api/signup", function(req, res) {
    db.UserData.create({      
      firstname:req.body.firstname,
      lastname:req.body.lastname,
      username:req.body.username,
      password:req.body.password,
      email:req.body.email,
      })
      .then(function(dbExample) {
      res.json(dbExample);
    });
  });

  app.post("/api/events", function(req, res) {
    db.EventData.create({    
      eventname:req.body.eventname,  
      username:req.body.username,
      address:req.body.address,
      city:req.body.city,
      state:req.body.state,
      zipcode:req.body.zipcode,
      active: true
      })
      .then(function(results) {
        res.json(results);
      })
  });

  app.post("/api/login", function(req, res) {
    db.UserData.count({ where: { username: req.body.username, password: req.body.password } })
    .then(count => {
      if (count != 0) {
        return res.json({username: req.body.username});
      }
      else {
        return res.json({error: "Invalid login"})
      }
      })
  });



  // Delete an example by id
  app.delete("/api/examples/:id", function(req, res) {
    db.UserData.destroy({ where: { id: req.params.id } }).then(function(dbExample) {
      res.json(dbExample);
    });
  });
};
