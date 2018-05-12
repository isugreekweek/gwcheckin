var app = require("./server/app"),
    api = require("./server/api"),

    bodyParser = require("body-parser"),

    express = require("express");

// Use HTTP POST parsers
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: true }) );

// Determine the port to bind to (process.env.PORT is for Heroku)
app.set('port', ( process.env.PORT || 5000 ));

// Save the top directory
app.set('dir', __dirname );

// On empty url, return the main file
app.get("/", function( req, res ) {
  res.sendFile( __dirname + "/checkin/webpage/index.htm" );
});

// Serve /checkin files when requested
app.use("/", express.static( __dirname + "/checkin/webpage" ));

// Mount the API router
app.use("/api", api );

// Server gw2016.css statically
app.get("/gw2016.css", function( req, res ) {
  res.sendFile( __dirname + "/webapp/gw2016.css" );
});

// Serve files for paths under image/ js/ or doc/
app.use("/image", express.static( __dirname + "/webapp/image" ));
app.use("/js",    express.static( __dirname + "/webapp/js" ));
app.use("/doc",   express.static( __dirname + "/webapp/doc" ));

// Placeholder response -- redirect to index
app.use(function( req, res ) {
  res.redirect("/");
});

// Listen on the designated port
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});