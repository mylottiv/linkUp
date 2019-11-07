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
const rooms = [
    {
        roomName: "Test1",
        users: ['bob', 'jane'],
        messages: [
            {
            user: 'bob',
            content: 'testytest'
            }
        ]
    },
    {
        roomName: "Test2",
        users: ['bob', 'jane'],
        messages: [
            {
            user: 'jane',
            content: 'testytest'
            }
        ]
    }
]

// Initialize array of roomName objects
const roomNames = rooms.map(function(room) {

    // Wrap room name inside object and return
    const name = {};
    name.roomName = room.roomName
    return name

});

// Home get controller
app.get('/:home?', function(req, res, next) {

    // Serve home view if route goes to root, "home", or "index"
    if (req.params.home === 'home' || req.params.home === 'index' || !req.params.home) {

        // Send list of rooms to home view
        res.render("home", {roomNames});

    }

    // Otherwise fall through to chat room route controller
    else {
        next();
    };

})

// Chatroom get controller
app.get('/:chat', function(req, res, next) {

    // Find index of relevant chatroom, if exists, otherwise will be -1
    const requestedRoomIndex = roomNames.indexOf(roomNames.find((name) => name.roomName === req.params.chat));

    // If the chatroom exists then the index will not be -1
    if (requestedRoomIndex !== -1) {
        
        // Serve given chatroom view
        res.render('chat', rooms[requestedRoomIndex]);
    
    }

    // If chatroom doesn't exist, redirect to home
    else {

        res.render('home', {roomNames});

    };

})

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
        rooms[roomNames.indexOf(roomNames.find((name) => name.roomName === roomName))].messages.push({user, content});
        
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
