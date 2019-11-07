const express = require('express');
const router = express.Router()

module.exports = function(rooms, roomNames) {

    // Home get controller
    router.get('/:home?', function(req, res, next) {

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
    router.get('/:chat', function(req, res, next) {

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

    return router;
}