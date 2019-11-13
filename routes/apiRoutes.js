const db = require("../models");

// As with all of these api routes, front end verification will need to be done before
// any action is completed. Normally you do this on the backend but that feature is not current priority.

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
      description,
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

  app.post("/api/chatroom", function(req, res) {
    
  })

  //Joining an event

  app.post("api/join/:eventname", function(req, res) {
    db.EventData.count(
      { where: 
        {groupsize: req.body.groupsize}
      }).then(count => {
        if (count < req.body.active_groupsize) {
          db.EventData.update(
            {group_size: req.body.group_size + 1}, 
            {where: {creator_id: req.params.creatorid}})
            .then(function(result) {
              res.json(results);
            })  
        }
        else {
            res.json({error: "Invalid login"})
        }
      })

      // TODO: Make Users joined event list

    });



  // Delete an event by eventname
  
  app.delete("/api/delete/:eventname", function(req, res) {
    db.UserData.destroy({ where: { eventname: req.params.eventname } })
    .then(function(results) {
      res.json(results);
    });
  });
};
