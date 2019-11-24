require("dotenv").config();
var cookieParser = require('cookie-parser');
var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var app = express();
var PORT = process.env.PORT || 3000;
const server = app.listen(PORT, function() {
  console.log(
    "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
    PORT,
    PORT
  );
});
const io = require('socket.io').listen(server);



var db = require("./models");

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));


// Middleware for forcing user login authentication
// app.use(function(req, res, next) {
//   if (req.cookies.logintoken !== undefined || req.url === '/login') {
//     const message = (req.cookies.logintoken) ? "Cookie valid" : 'No token needed: Login Page';
//     console.log(message);
//     next();
//   }
//   else {
//     res.redirect('/login');
//   }
// })

app.use(function(req, res, next) {
  console.log('arrival');
  next()
})

// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Routes
require("./routes/apiRoutes")(app, io);
require("./routes/htmlRoutes")(app);

var syncOptions = { force: false };

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(function() {

  server;

  // Establish socket.io server connection
  io.on('connection', function(socket) {

    console.log('Socket connected:', socket);

    // Join handler for user connection to specific chat rooms
    socket.on('join', function(clientConnectRequest) {

      // Parse out the relevant variables
      const {user, clientRoomName} = clientConnectRequest;

      const activePar = true;

      // Obtain event id from database
      db.EventData.findOne({where: {eventname: clientRoomName}})
      .then(function(eventResult) {
        // const eventId = eventResult;
        // // Create chat client if doesn't already exist
        // db.ChatData.findOrCreate({where: {username: username}, defaults: {username, activePar, eventId}})
        // .then(function(testResults) {
        //   // Set active to true if client exists
        //   const newValues = (!testResults[1]) ? {active: true} : {};
        //   db.ChatData.update({where: {username: username}}, newValues)
        //   .then(function(results) {
            console.log('Socket joined room:', clientRoomName); 

            // Connect user socket to room
            socket.join(clientRoomName);

            // Notify the room of the new user
            socket.to(clientRoomName).emit('join', user);
        //   });
        // });
      });



    })

    // Event handler for new messages
    socket.on('new message', function(newMessage) {

      console.log('New Socket Message', newMessage);

      // Destructure message data
      const {roomName, user, content} = newMessage;
      
      // First find the relevant event
      db.EventData.findOne({
        where: {
          eventname: roomName
        }
      }).then(function(eventResults) {
        // // Then find the chat client that sent the message
        // db.ChatData.findOne({
        //   where: {
        //     username: user,
        //     EventDatumId: eventResults.id
        //   }
        // // Save message in Message Database table
        // }).then(function(chatResults) {
        //   db.MessageData.create({
        //     username: user,
        //     content,
        //     ChatDatumId: chatResults.id
        //   }).then(function(messageResults) {
            // Sends new message to all users in room
            io.to(roomName).emit('new message', {user, content});
          // });
        // });   
      });     
    });

    // Event handler for a currently typing user
    socket.on('typing', function(data) {
      const {user, roomName} = data;
      console.log(user, 'is currently typing');
      socket.to(roomName).emit('typing', user);
    });

    socket.on('disconnect', function() {
      console.log('Socket disconnected');
      
      // Update chatClient active status to 'false'
      
      socket.leaveAll();
    });
  });
});

module.exports = app;
