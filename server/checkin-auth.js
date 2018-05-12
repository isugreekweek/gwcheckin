// Login credentials
var CREDS = {
  "gwcentral": "getbent",
  "gwgencos":  "gosseramundt"
};

// Logged-in users
var identities = {};

// TODO Access-checking function
var checkAccess = function( action, identity ) {
  return true;
}

// Random text parameters
var IDENTITY_LEN = 20;
var MIN_TOKEN_LEN = 10;
var MAX_TOKEN_LEN = 50;

// Random text generation
var DICT = "abcdefghijklmnopqrstuvwxyz0123456789";
var genRandom = function( len ) {
  var string = "";

  while( string.length < len ) {
    string += DICT[ Math.floor( Math.random() * DICT.length ) ];
  }

  return string;
};

var genIdentity = function() {
  var identity;
  
  // Make sure the identity is unique
  do {
    identity = genRandom( IDENTITY_LEN );
  } while( identity in identities );

  return identity;
};

var genToken = function() {
  return genRandom( Math.floor( Math.random() * ( MAX_TOKEN_LEN - MIN_TOKEN_LEN ) ) + MIN_TOKEN_LEN );
};


module.exports = {
  IDENTITY_LEN: IDENTITY_LEN,

  logIn: function( username, password ) {
    var ret = {}, identity, token;

    // If no such user exists, or wrong password
    if( !( username in CREDS ) || password !== CREDS[ username ] ) {
      ret.success = false;
      ret.reason = "The provided username and password do no match.";
    } else {
      // Otherwise, generate an identity and a token
      ret.success  = true;
      ret.identity = genIdentity( username );
      ret.token    = genToken();

      // Save these in the logons cache
      identities[ ret.identity ] = {
        user:  username,
        token: ret.token
      };
    }

    return ret;
  },

  logOut: function( identity ) {
    // If the given identity exists for the username, remove it
    if( identity in identities ) {
      delete identities[ identity ];
    }

    // Always return successful
    return {
      success: true
    };
  },

  isAuthorized: function( identity, token, path ) {
    // First, make sure the identity exists
    if( !( identity in identities ) ) {
      return {
        authorized: false,
        reason: "Bad login"
      }
    }

    // Then, make sure the identity and token match
    if( token !== identities[ identity ].token ) {
      return {
        authorized: false,
        reason: "Bad token"
      }
    }

    // Finally, if there is an action, make sure the identity's user has access
    if( path && !checkAccess( path, identity ) ) {
      return  {
        authorized: false,
        reason: "Insufficient access"
      }
    }

    // Otherwise, if we got here, all is good!
    return {
      authorized: true
    }
  },

  userFor: function( identity ) {
    return (identities[ identity ] || {}).user;
  },

  generateNextToken: function( identity ) {
    var token = genToken();

    identities[ identity ].token = token;

    return token;
  }
};