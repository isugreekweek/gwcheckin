var express = require('express'),
    app     = express(),

    bodyParser = require('body-parser');

// Allow JSON parsing
app.use( bodyParser.json() );

// Export the app for other files to use
module.exports = app;