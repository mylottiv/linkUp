const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT);
const path = require('path');
const io = require('socket.io').listen(server);
const exphbs = require('express-handlebars');

// Init Express Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

// Init express handlebars engine
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Init chatroom object
const Chatrooms = {
    rooms: [
        {roomName: "Showdown"}
    ],
}

// Home get controller
app.get('/:home?', function(req, res, next) {

    // Serve home view if route goes to root, "home", or "index"
    if (req.params.home === 'home' || req.params.home === 'index' || !req.params.home) {
        res.render("home", Chatrooms);
    }

    // Otherwise fall through to chat room route controller
    else {
        next();
    };

})

// Chatroom get controller
app.get('/:chat', function(req, res, next) {

    // Serve chatroom view for room name from route
    res.render('chat', {roomName: req.params.chat});

})

// Establish server connection
io.on('connection', function(socket) {

    console.log('Socket connected:');

    // Event handler for new messages
    socket.on('new message', function(newMessage) {
        console.log('New Socket Message', newMessage);
        io.emit('message', newMessage);
    });

    // Event handler for a currently typing user
    socket.on('typing', function(typingUser) {
        console.log(typingUser, 'is currently typing')
        io.emit('typing', typingUser);
    })

    socket.on('disconnect', function() {
        console.log('Socket disconnected');
    })
});
