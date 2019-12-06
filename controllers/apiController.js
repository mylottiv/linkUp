const db = require("../models");
module.exports = {

    //Get all events for map population
    getAllEvents: function(req, res) {
        db.EventData.findAll().then(function(results) {
        res.json({results});
        })
    },

    //Chatlog API route for debug
    getEventChatlog: function(req, res) {
        db.MessageData.findAll({
            where: { EventDatumId: req.params.id },
        }).then(function(results) {
            res.json(results);
        })
    },

    // Create a new user
    createUser: function(req, res) {
        
        const {firstName, lastName, username, password, email} = req.body;
        
        // Will check for matching email and usernames, otherwise will create new User instance
        db.UserData.findOrCreate({
            where: {
                username,
                email
            }, 
            defaults: {firstName, lastName, username, password, email}
        }).then(function(results) {
            console.log(results)
        
            // If the Username or Email exists, client is notified of conflict
            if(!results[1]) {
                res.json({status: "Failed", error: "Username or Email already taken."})
            }

            // Otherwise client is notified of create success
            else {
                res.json({status: "Success", error: "User registered."})
            };
        });
    },


    // Controller for event creation post requests
    // Use closure to access io from the apiRoutes file
    createEvent: function(io) {
        return function(req, res) {

            // const {eventname, creator_id, placeid, location, description} = req.body;
            const {eventname, address, placeid, description, lat, lng} = req.body;

            console.log('eventname', eventname, 'address', address, 'placeid:', placeid, 'description', description, 'lat:', lat, 'lng', lng);

            // Find UserData for user who submitted event
            db.UserData.findOne({
                where: { token: req.cookies.logintoken }
            }).then(function(userResults) {
                console.log(userResults);
                // const creator_id = (userResults !== undefined) ? userResults.id : 'defacto';
                // Create new event entry in DB
                db.EventData.create(
                    {    
                        // creator_id,
                        eventname,
                        address,
                        placeid: placeid,
                        groupsize: 5,
                        description,
                        current_groupsize: 1,
                        latitude: lat,
                        longitude: lng,
                        active: true
                    }
                ).then(function(eventResults) {
                    //Create a new chat entry for creator once new event entry is created
                    console.log(eventResults);
                    db.ChatData.create(
                        {
                            username: req.body.username,
                            // chatroom_id: req.body.chatroom_id,
                            active: true,
                            UserDatumId: userResults.id,
                            EventDatumId: eventResults.dataValues.id
                        }
                    ).then(function(chatResults) {
                        // Emit 'new event' event with data for new event
                        io.sockets.emit('new event', eventResults);

                        // Send a 201 'Created' status back to the client
                        // Not neccessary to send the event data back to client as that will already be received from the socket event
                        res.send('testing jquery prowess').status(201);
                    }).catch(function(err) {
                        console.log(err);
                    });
                }).catch(function(err) {
                    console.log(err);
                });
            });
        }
    },

    //Functionality of login event
    loginUser: function(req, res) {
        const email = req.body.email
        const password = req.body.password
        console.log(email, password);
        db.UserData.findOne({where:{email: email, password: password}})
        .then(function(data){

            const user = (data !== null) ? data.dataValues : undefined;
        
            // If the credentials are valid
            if (user) {

                //Creates a random token
                let rand = function() {
                    return Math.random().toString(36).substr(2); // remove `0.`
                };
                let token = rand();

                // Saves token to user database
                db.UserData.update(
                    {token: token},
                    {where: {id: user.id}}
                ).then(function(results) {
                    console.log(results);
                })
                
                //Sets a cookie for logintoken
                res.cookie('logintoken', token);

                // Return userInfo to client for local storage
                // let userInfo = {
                //   firstName: user.firstName,
                //   lastName: user.lastName,
                //   username: user.username,
                //   email: user.email
                // }

                res.send({username: data.username, redirect: '/'});

            }
            else {
                return res.json({error: "Invalid login"})
            };
        });
    },


    //Upon logout, the token is cleared from cookies
    logoutUser: function(req, res) {
        // const email = req.body.email;
        const token = req.cookies.logintoken;
        db.UserData.update({token: null},{where: {token: token}})
        .then(function(results) {
            res.clearCookie('logintoken');
            res.send({redirect: '/login'});
        })
    },

    //Finding an event by the eventname
    getEvent: function(req, res) {
        db.ChatData.findAll({
            include: [{
                model: db.EventData,
                where: {eventname: req.params.eventname}
            }]
        // include: [db.ChatData]
        }).then(function(result) {
            res.json(result);
        })
    },

    // Delete an event by eventname
    deleteEvent: function(req, res) {
        db.UserData.destroy({ where: { eventname: req.params.eventname } })
        .then(function(results) {
            res.json(results);
        });
    }

}