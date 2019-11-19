const db = require("../models");

// As with all of these api routes, front end verification will need to be done before
// any action is completed. Normally you do this on the backend but that feature is not current priority.

// Init Google Maps Client
// const googleMapsClient = require('@google/maps').createClient({
//   key: 'AIzaSyBWQ-sFtacE3m0IMYrFlP7w_dgNQpL-bBw',
//   Promise: Promise
// });

module.exports = function(app, io) {
//   // Get all examples
//   app.get("/", function(req, res) {
//     db.EventData.findAll().then(function(result) {
//       res.render("index", {result})
//   });
// });

  //Get all events for map population
  app.get("/api/events", function(req, res) {
    db.EventData.findAll().then(function(results) {
      res.json({results});
    })
  })

  // Create a new example
  app.post("/api/signup", function(req, res) {
    db.findOne({where: {username:req.body.username}})
    .then(function(results) {
      if(req.body.username) {
        res.json({status: "Failed", error: "Username already taken."})
      }
      else {
        db.UserData.create({      
          firstname:req.body.firstname,
          lastname:req.body.lastname,
          username:req.body.username,
          password:req.body.password,
          email:req.body.email,
        })
        .then(function(results) {
          res.json(results);
      });
      }
    })
  });


  // Controller for event creation post requests
  app.post("/api/events", function(req, res) {

    // const {eventname, creator_id, placeid, location, description} = req.body;
    const {eventname, address, placeid, description, lat, lng} = req.body;

    console.log('eventname', eventname, 'address', address, 'placeid:', placeid, 'description', description, 'lat:', lat, 'lng', lng);

    // res.json({eventname, address, placeid, lat, lng})


    // Create new event entry in DB
    db.EventData.create({    
      creator_id: '1',
      eventname,
      address,
      placeid: placeid,
      groupsize: 5,
      description,
      current_groupsize: 1,
      latitude: lat,
      longitude: lng,
      active: true
    })
    .then(function(results) {
      io.sockets.emit('new event', results);

      //Create a new chat entry while new event entry is created
      db.ChatData.create({
        username:req.body.username,
        chatroom_id:req.body.chatroom_id,
        active: true,
        EventDatumId: 1
      }).then(function(results) {
        // Send a 201 'Created' status back to the client
        // Not neccessary to send the event data back to client as that will already be received from the socket event
        res.send('testing jquery prowess').status(201);
      }).catch(function(err) {
        console.log(err);
      })
    })
    .catch(function(err) {
      console.log(err);
    })
  });


  //Functionality of login event
  app.post("/api/login", function(req, res) {
    db.UserData.findOne({where:{username:req.body.username,password:req.body.password}})
    .then(function(result){
      if (req.body.username && req.body.password) {
        //Creates a random token
        let rand = function() {
          return Math.random().toString(36).substr(2); // remove `0.`
        };
        let token = rand();
        
        //Sets a cookie with logintoken
        res.cookie(logintoken, token);

        let userInfo = {
          firstname: result.firstname,
          lastname: result.lastname,
          username: result.username
        }

        res.json({userInfo});


      }
      else {
        return res.json({error: "Invalid login"})
      }
      })
  });


  //Finding an event by the eventname
  app.get("/api/event/:id", function(req, res) {
    db.EventData.findOne({
      where: {
        eventname: req.params.eventname
      },
      // include: [db.ChatData]
    }).then(function(result) {
      res.json(result);
    });
  });

  // Delete an event by eventname
  app.delete("/api/delete/:eventname", function(req, res) {
    db.UserData.destroy({ where: { eventname: req.params.eventname } })
    .then(function(results) {
      res.json(results);
    });
  });
};
