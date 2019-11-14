require("dotenv").config();
var cookieParser = require('cookie-parser');
var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var app = express();
var PORT = process.env.PORT || 3000;
const server = app.listen(PORT, function() {
  console.log(
    "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
    PORT,
    PORT
  );
const io = require('socket.io').listen(server);



var db = require("./models");

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
require("./routes/apiRoutes")(app, io);
require("./routes/htmlRoutes")(app);

var syncOptions = { force: false };

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(function() {
  server;
  io.on('connection', function(socket) {
    console.log('Client connected!', socket.id)
  })
  });
});

module.exports = app;
