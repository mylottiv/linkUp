const apiController = require("../controllers/apiController");
module.exports = function(app, io) {

  //Get all events for map population
  app.get("/api/events", apiController.getAllEvents)

  //Chatlog API route for debug
  app.get('/api/events/chatlog/:id', apiController.getEventChatlog)

  // Create a new user
  app.post("/api/signup", apiController.createUser);

  // Controller for event creation post requests
  app.post("/api/events", apiController.createEvent(io));

  //Functionality of login event
  app.put("/api/login", apiController.loginUser);

  //Upon logout, the token is cleared from cookies
  app.put("/api/logout", apiController.logoutUser);

  //Finding an event by the eventname
  app.get("/api/event/:name", apiController.getEvent);

  // Delete an event by eventname
  app.delete("/api/delete/:eventname", apiController.deleteEvent);

}