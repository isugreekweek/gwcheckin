var // App secrets
    K = "D2Hn4JUwDmCl276uhQIXrMsje",
    S = "lSQLivroVR1Op0j0pcavybrDHynMse1gMDgKHpHB6YzqL48xRH",
    
    // NodeJS requires
    https       = require("https"),
    querystring = require("querystring"),
    
    // To hold the resulting bearer token
    bearer,
    
    // Remembering and requesting Tweets
    tweets,
    getTweets,
    
    // Refreshing of Tweets
    REQUEST_SPACING = 60000,
    
    // Request to get relevant Tweets
    TWEET_REQUEST = {
      method: 'GET',
      host:   'api.twitter.com',
      path:   '/1.1/statuses/user_timeline.json',
      headers: {
        'User-Agent':      'Iowa State Greek Week 2016',
        'Content-Type':    'application/json;charset=UTF-8'
      },

      // Not used by https.request, but put here for convenience
      params: {
        "screen_name": "greekweekISU",
        "count":       20
      }
    };

// First, append query parameters to url for requesting Tweets
TWEET_REQUEST.path += "?" + querystring.stringify( TWEET_REQUEST.params );

// Method to obtain tweets based on TWEET_REQUEST
getTweets = function() {
  console.log("Updating Tweets...");

  var req = https.request( TWEET_REQUEST, function( res ) {
    var data = "";
  
    // Receive chunks of data
    res.on("data", function( chunk ) {
      data += chunk;
    })
    
    // Once all chunks are received, parse as JSON
    res.on("end", function() {
      tweets = JSON.parse( data );
      console.log("Tweets have been updated.");
    });
  });
  
  // End the request
  req.end();
};

// Determine Twitter auth token credentials based on their algorithm
var cred = new Buffer( encodeURIComponent( K ) + ":" + encodeURIComponent( S ) ).toString("base64");

// POST to the Twitter API to obtain the token
var req = new https.request({
  method: "POST",
  host:   "api.twitter.com",
  path:   "/oauth2/token",
  headers: {
    "Authorization":  "Basic " + cred,
    "Content-Type":   "application/x-www-form-urlencoded;charset=UTF-8",
    "Content-Length": 29
  }
}, function( res ) {
  var data = "";

  // Receive chunks of data
  res.on("data", function( chunk ) {
    data += chunk;
  });
  
  // Once all chunks are received, parse as JSON
  res.on("end", function() {
    var resData = JSON.parse( data );

    if( resData.token_type !== 'bearer' ) {
      // Invalid token type
      console.log("Error: token returned from Twitter API is not of type 'bearer'");
    } else {
      // Otherwise save the token!
      bearer = resData.access_token;
      TWEET_REQUEST.headers['Authorization'] = "Bearer " + bearer;

      // Once this happens, get relevantTweets and refresh at an interval
      getTweets();
      setInterval( getTweets, REQUEST_SPACING );
    }
  });
});

// Write the request for API authorization
req.write("grant_type=client_credentials");
req.end();

module.exports = {
  getTweets: function() {
    return tweets;
  }
};