const db = require("../models");

// Init Google Maps Client
// const googleMapsClient = require('@google/maps').createClient({
//   key: 'AIzaSyBWQ-sFtacE3m0IMYrFlP7w_dgNQpL-bBw',
//   Promise: Promise
// });

module.exports = function(app) {
//   // Get all examples
//   app.get("/", function(req, res) {
//     db.EventData.findAll().then(function(result) {
//       res.render("index", {result})
//   });
// });

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


  // Controller for event creation post requests
  app.post("/api/events", function(req, res) {

    const {eventname, creator_id, placeid, location, description} = req.body;
    const {lat, lng} = location;

    // Create new event entry in DB
    db.EventData.create({    
      creator_id,
      eventname,
      address,
      place_id: placeid,
      latitude: lat,
      longitute: lng,
      active: true
    })
    .then(function(results) {
      res.json(results);
    })
    .catch(function(err) {
      console.log(err);
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
