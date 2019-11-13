const express = require('express');
const router = express.Router();

module.exports = function(rooms, getRoomNames) {

    // Home get controller
    router.get('/:home?', function(req, res) {

        // Serve home view if route goes to root, "home", or "index"
        if (req.params.home === 'home' || req.params.home === 'index' || !req.params.home) {

            // Send list of rooms to home view
            roomNames = getRoomNames(rooms);
            res.render("home", {roomNames});

        }

    })

    // Chatroom get controller
    router.get('/rooms/:chat', function(req, res, next) {

        // Find index of relevant chatroom, if exists, otherwise will be -1
        const requestedRoomIndex = rooms.findIndex((name) => name.roomName === req.params.chat);
        console.log('index:', requestedRoomIndex)     
        // If the chatroom exists then the index will not be -1
        if (requestedRoomIndex !== -1) {
            
            // Serve given chatroom view
            res.render('chat', rooms[requestedRoomIndex]);
        
        }

        // If chatroom doesn't exist, redirect to home
        else {

            roomNames = getRoomNames(rooms);
            res.render('home', {roomNames});

        };

    })

    return router;
}