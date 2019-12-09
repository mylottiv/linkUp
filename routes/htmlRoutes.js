const htmlController = require('../controllers/htmlController');
module.exports = function(app) {
  
  // Load index page
  app.get("/", htmlController.serveMap);

  // Login page get route
  app.get('/login', htmlController.serveLogin);

  // Event chat get route  
  app.get("/events/:name", htmlController.serveChat);

  // Render 404 page for any unmatched routes
  app.get("*", htmlController.serve404);
};
