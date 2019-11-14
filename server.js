require("dotenv").config();
var cookieParser = require('cookie-parser');
var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
const path = require('path');


var db = require("./models");

var app = express();
var PORT = process.env.PORT || 3000;

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

// app.use(function(req, res, next) {
//   if(req.cookies.logintoken || req.url === '/login') {
//     const message = (req.cookies.logintoken) ? "Cookie valid" : 'No token needed: Login Page';
//     console.log(message);
//     next();
//   }
//   else {
//     res.redirect('../login');
//   }
// })


// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Routes
require("./routes/apiRoutes")(app);
require("./routes/htmlRoutes")(app);

var syncOptions = { force: false };

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(function() {
  app.listen(PORT, function() {
    console.log(
      "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
      PORT,
      PORT
    );
  });
});

module.exports = app;
