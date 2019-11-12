const express = require('express');
const router = express.Router();

module.exports = function(rooms, roomNames) {
    router.get('/rooms', function(req, res){
        res.json(roomNames(rooms));
    });

    router.get('/users', function(req, res){
        console.log('get users');
        res.json('get users');
    });

    router.post('/rooms', function(req, res){
        console.log('here', req.body, req.body.roomName);
        const {roomName, creator} = req.body;
        rooms.push({        
            roomName,
            users: [creator],
            messages: [
                {
                user: creator,
                content: 'Created Room'
                }
        ]});
        console.log(rooms);
        res.status(204);
    });

    router.post('/users', function(){

    })

    return router;
}