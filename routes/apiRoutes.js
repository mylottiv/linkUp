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

  // Create a new user
  app.post("/api/signup", function(req, res) {
    
    const {firstname, lastname, username, password, email} = req.body;
    
    db.UserData.findOrCreate({where: {username:req.body.username}, defaults: {firstname, lastname, username, password, email}})
    .then(function(results) {
      console.log(results)
      if(!results[1]) {
        res.json({status: "Failed", error: "Username already taken."})
      }
      else {
        res.json({status: "Success", error: "User registered."})
      }
    })
  });


  // Controller for event creation post requests
  app.post("/api/events", function(req, res) {

    // const {eventname, creator_id, placeid, location, description} = req.body;
    const {eventname, address, placeid, description, lat, lng} = req.body;

    console.log('eventname', eventname, 'address', address, 'placeid:', placeid, 'description', description, 'lat:', lat, 'lng', lng);

    // res.json({eventname, address, placeid, lat, lng})

    // Find UserData for user who submitted event
    // db.UserData.findOne({
    //   where: {
    //     username: req.body.username
    //   }
    // }).then(function(userResults) {

    //   const creator_id = (userResults !== undefined) ? userResults.id : 'defacto';
      // Create new event entry in DB
      db.EventData.create({    
        // creator_id,
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
      // .then(function(eventResults) {
      //   //Create a new chat entry for creator once new event entry is created
      //   db.ChatData.create({
      //     username: req.body.username,
      //     // chatroom_id: req.body.chatroom_id,
      //     active: true,
      //     // userdata_id: userResults.id
      //     EventDatumId: eventResults.id
      //   })
        .then(function(chatResults) {
          // Emit 'new event' event with data for new event
          // io.sockets.emit('new event', eventResults);
          // no way
          // Send a 201 'Created' status back to the client
          // Not neccessary to send the event data back to client as that will already be received from the socket event
          res.send('testing jquery prowess').status(201);
        }).catch(function(err) {
        console.log(err);
      });
    // });
  });


  //Functionality of login event
  app.post("/api/login", function(req, res) {
    let username = req.body.username
    db.UserData.findOne({where:{username, password:req.body.password}})
    .then(function(result){
      if (req.body.username && req.body.password) {
        //Creates a random token
        let rand = function() {
          return Math.random().toString(36).substr(2); // remove `0.`
        };
        let token = rand();

        db.UserData.update(
          {token: token},
          {where: {username}}
        ).then(function(result) {
          res.json(result);
        })
        
        //Sets a cookie with logintoken
        res.cookie('logintoken', token);

        // Return userInfo to client for local storage
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


  //Upon logout, the token is cleared from cookies
  app.post("/api/logout", function(req, res) {
    db.UserData.update({token: null},{where: {username: req.body.username}})
    .then(function(results) {
      res.clearCookie('logintoken');
      res.json(results);
    })
  });

  //Finding an event by the eventname
  app.get("/api/event/:name", function(req, res) {
    db.ChatData.findAll({
      include: [{
        model: db.EventData,
        where: {eventname: req.params.eventname}
      }],
      // include: [db.ChatData]
    }).then(function(result) {
      res.json(result);
    });
  });

  // Delete an event by eventname
  app.delete("/api/delete/:eventname", function(req, res) {
    db.UserData.destroy({ where: { eventname: req.params.eventname } })
    .then(function(results) {x
      res.json(results);
    });
  });
};
