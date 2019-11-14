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
const io = require('socket.io').listen(server);



var db = require("./models");

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

// app.use(function(req, res, next) {
//   if(req.cookies.logintoken || req.url === '/login') {
//     const message = (req.cookies.logintoken) ? "Cookie valid" : 'No token needed: Login Page';
//     console.log(message);
//     next();
//   }
//   else {
//     res.redirect('../login');
//   }
// })


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

    console.log('Socket connected:');

    // Join handler for user connection to specific chat rooms
    socket.on('join', function(room) {

        // Connect user socket to room
        socket.join(room);

        console.log('Socket joined room:', room);

    })

    // Event handler for new messages
    socket.on('new message', function(newMessage) {

        console.log('New Socket Message', newMessage);

        // Destructure message data
        const {roomName, user, content} = newMessage;

        // Add message to relevant chatroom message list
        // rooms[getRoomNames(rooms).indexOf(getRoomNames(rooms).find((name) => name.roomName === roomName))].messages.push({user, content});
        
        // Sends new message to all users in room
        io.to(roomName).emit('new message', {user, content});
    });

    // Event handler for a currently typing user
    socket.on('typing', function(data) {
        const {user, roomName} = data;
        console.log(user, 'is currently typing');
        socket.to(roomName).emit('typing', user);
    })

    socket.on('disconnect', function() {
        console.log('Socket disconnected');
        socket.leaveAll();
    })
  });
  });
});

module.exports = app;
