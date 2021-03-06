const db = require("../models");
const path = require('path')

module.exports = {
    // Load index page
    serveMap: function(req, res) {
        db.EventData.findAll({}).then(function(events) {
            console.log(events);
            res.render("map", {events});
        });
    },

    // Login page get route
    serveLogin: function(req, res) {
        res.sendFile(path.join(__dirname.replace('controllers', 'views') + '/login.html'));
    },

    // Event chat get route  
    serveChat: function(req, res) {
        console.log(req.params.name);
        // (The weird part) Construct message log through nested ORM include statements
        db.EventData.findOne({
            where: { eventname: req.params.name },
        }).then((event) => {
            db.MessageData.findAll({
                where: {EventDatumId: event.id},
                attributes: ['username', 'content', 'createdAt', 'updatedAt']
            }).then(function(messageResults) {
                const payload = {
                    messageLog: messageResults.map((message) => {
                        console.log('createdAt', message.dataValues.createdAt);
                        return {
                            user: message.dataValues.username,
                            content: message.dataValues.content
                        };
                    }),
                    eventname: req.params.name
                };
                console.log('results', messageResults);
                res.render("chat", payload);
            });
        });
        // Find the one event
        // Send its parameters as an object along with a chat.handlebars view
        // Will render the live chatroom for that route
    },

    // Render 404 page for any unmatched routes
    serve404: function(req, res) {
        res.render("404");
    }
}