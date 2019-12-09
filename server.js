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

// Import Google Maps key from env variable
// const key = process.env.GOOGLE_MAPS_KEY

var db = require("./models");

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

// HTTP Request Intercept Middleware for Debug
app.use(function(req, res, next) {
  console.log('arrival', req.url);
  next()
})

// Middleware for authenticating login status of all client requests
// In future will want to update this to actually check if the login token is valid
app.use(function(req, res, next) {
  if (req.cookies.logintoken !== undefined || req.url === '/login' || req.url === '/api/login') {
    const message = (req.cookies.logintoken) ? "Cookie valid" : 'No token needed: Login';
    console.log(message);
    next();
  }
  else {
    console.log('Invalid cookie, redirecting to login page');
    res.redirect('/login');
  }
})

// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
    // helpers: {
    //   : function() {return key}
    // }
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

    console.log('Socket connected:', socket.id);

    // Join handler for user connection to specific chat rooms
    socket.on('join', function(clientConnectRequest) {

      // Parse out the relevant variables
      const {username, room} = clientConnectRequest;

      // Obtain event id from database
      db.EventData.findOne({where: {eventname: room}})
      .then(function(eventResult) {
        const eventId = eventResult.id;
        // Obtain user id from database
        db.UserData.findOne({where: {username: username}}).then(function(userResults) {
          const userId = userResults.id;
          // Find or Create chat client if doesn't already exist
          db.ChatData.findOrCreate({where: {UserDatumId: userId, EventDatumId: eventId}, defaults: {username, EventDatumId: eventId, active: true, UserDatumId: userId}})
          .spread(function(chatResults, created) {
            console.log(created);
            function resolveJoin() {
              console.log('Socket', socket.id, 'joined room:', room); 

              // Connect user socket to room
              socket.join(room);

              // Notify the room of the new user
              socket.to(room).emit('join', username);
            };
            // If the client exists, update active to true
            if (!created) {
              db.ChatData.update({active: true}, {where: {UserDatumId: userId, EventDatumId: eventId}})
              .then(resolveJoin)
            }
            // Otherwise, resolve join as normal
            else {
              resolveJoin();
            }
          });
        });
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
        // Then find the chat client that sent the message
        db.ChatData.findOne({
          where: {
            username: user,
            EventDatumId: eventResults.id
          }
        // Save message in Message Database table
        }).then(function(chatResults) {
          db.MessageData.create({
            username: user,
            content,
            ChatDatumId: chatResults.id
          }).then(function(messageResults) {
            // Sends new message to all users in room
            io.to(roomName).emit('new message', {user, content});
          });
        });   
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
