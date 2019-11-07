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
                user: 'bob',
                content: 'testytest'
                }
            ]
        }
    ]

// Home get controller
app.get('/:home?', function(req, res, next) {

    // Serve home view if route goes to root, "home", or "index"
    if (req.params.home === 'home' || req.params.home === 'index' || !req.params.home) {
        
        // Assemble array of room names
        const roomNames = rooms.map(function(room) {
            const name = {};
            name.roomName = room.roomName
            return name
        });

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

    // Assemble array of room names
    const roomNames = rooms.map(function(room) {

        // Wrap room name inside object and return
        const name = {};
        name.roomName = room.roomName
        return name
    
    });

    // Find index of relevant chatroom, if exists, otherwise will be -1
    const requestedRoomIndex = roomNames.indexOf(roomNames.find((name) => name.roomName === req.params.chat));

    console.log(requestedRoomIndex);
    console.log(rooms[requestedRoomIndex]);

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
