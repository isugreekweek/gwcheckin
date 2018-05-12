var xlsx = require("xlsx"),
    db   = require("../server/database");

var encode = xlsx.utils.encode_cell,
    decode = xlsx.utils.decode_cell;

// The local name of the workbook containing member information
var BOOK = "GW18roster.xlsx";

// Mapping desired columns to their database column names
var COLS = {
  "Student ID #": "isu_id",
  "Email":        "net_id",
  "First":        "first_name",
  "Last":         "last_name",
  "Chapter":      "chapter"
};

// Members in central
var CENTRAL = [
  "hemeader",   //Hannah Meader
  "gmperrin",   //Grace Perrin
  "sgflumer",   //Sam Flumerfelt
  "jkf",        //Julianne Faulconer
  "kemoody",    //Kate Moody
  "kkmoss",     //Keith Moss
  "jglanz",     //Jessie Glanz
  "laurac",     //Laura Campbell
  "atcross",    //Alexa Cross
  "sbbetts",    //Spencer Betts
  "lkstu",      //Laura Studanski
  "ginac1",     //Gina Cerrentano
  "aemclean",   //Alison McLean
  "lbrooke",    //Leah Brooke
  "endecott",   //Luke Endecott
  "jnromero",   //Jorge Romero-Castro
  "cbergren",   //Coley Bergren
  "alexisr",    //Lexie Ruscheinski
  "reinx058",   //Steven Rein
  "ryheider",   //Ryan Heiderscheit
  "ruer",       //Riley Rue
  "ocweaver"    //Olivia Weaver
];

// Members in crew need to change these
var CREW = [
  "hannahjo",
  "mrc",
  "jgremel",
  "lbrooke",
  "aburney",
  "sbbetts",
  "jglanz",
  "aburns",
  "ruer",
  "bskubal",
  "ginac1",
  "lindsayj",
  "arsmith2",
  "macy",
  "mij",
  "jahrens",
  "smbailey",
  "imbeck",
  "nboehlje",
  "amdewitt",
  "disae",
  "sgflumer",
  "abbyg20",
  "kjgeolat",
  "dlhinton",
  "jhumke",
  "aliyaj",
  "carlyem",
  "aemclean",
  "kemoody",
  "sjneavor",
  "jppoferl",
  "trog0724",
  "schipper",
  "jsillman",
  "lkstu",
  "harvardw",
  "twzeller"
];

// Simple function to grab value from a sheet cell.
const getValue = ({ r, c }) => ( sheet[ encode({ r, c }) ] || {} ).v || "";

var readRow = function( sheet, row ) {
  var vals = [];

  // Testing
  /*for( var prop in sheet ) {
    if( prop[0] === '!' ) {
      console.log( prop, ":", sheet[ prop ] );
    }
  }*/

  // Read across the row until the last relevant column is hit
  for( var i = 0, e = sheet['!range'].e.c; i < e; i++ ) {
    vals.push( getValue({ r: row, c: i }) );
  }

  return vals;
};

var reduceRow = function( sheet, row, cols ) {
  var res = {}, val;

  // Grab the relevant columns
  for( var col in cols ) {
    val = getValue({ r: row, c: cols[ col ] });
    res[ col ] = (val + "").trim();
  }

  return res;
};

// First, open the workbook and grab the first sheet
var book = xlsx.readFile( BOOK );
var sheet = book.Sheets[ book.SheetNames[0] ];

// Make sure the sheet has a !range property
if( !sheet['!range'] ) {
  var ref = sheet['!ref'], e;

  if( !ref ) {
    console.log("Unable to determine bounds of worksheet");
    process.exit();
  }

  // Determine the bounds from !ref
  ref = ref.split(":");
  sheet['!range'] = {
    s: decode( ref[0] ),
    e: e = decode( ref[1] )
  }

  // Update end positions (to make them behave like array lengths)
  e.r++;
  e.c++;
}

// Then, locate the indices of the requested columns
var cols = readRow( sheet, 0 ).reduce(function( colMap, colName, index ) {
  // If the current column name is requested, add it to the map
  if( colName in COLS ) {
    colMap[ COLS[ colName ] ] = index;
  }

  // Return the map
  return colMap;
}, {});

// Now, columns have been located, so map each row into an object
var rows = [];
for( var i = 1, end = sheet['!range'].e.r - 1; i < end; i++ ) {
  rows.push( reduceRow( sheet, i, cols ) );
}

// Add each of the rows to the database, if it isn't there already
var len = rows.length,
    count = 0,
    added = 0,
    erred = 0,
    errors = {};

var checkDone = function() {
  if( count === len ) {
    console.log("Errors:");
    for( var err in errors ) {
      console.log("\n  %d\t%s\n", errors[err].count, err );
      errors[err].rows.forEach(function( row ) {
        console.log("    ", row );
      });
    }
    console.log("\nDone. Checked %d members, added %d new. %d failed (see errors above).", count, added, erred );

    // Disconnect from the database
    db.disconnect();
  }
};

rows.forEach(function( row ) {
  // If the row is missing a netid, don't add it.
  if( !row.net_id ) {
    const message = "Row is missing a net id.";

    if( !( message in errors ) ) {
      errors[ message ] = {
        count: 1,
        rows: [ row ]
      };
    } else {
      errors[ message ].count++;
      errors[ message ].rows.push( row );
    }

    // Skip this row.
    erred++;
    count++;

    checkDone();
    return;
  }
  // TODO Change after 2017. In 2017, netids are provided
  // in the form netid@iastate.edu. We must remove the @iastate.edu.
  row.net_id = row.net_id.split('@')[0];

  // Check if the member is in crew or central
  if( CENTRAL.indexOf( row.net_id ) > -1 ) {
    row.gw_role = "Central";
  } else if( CREW.indexOf( row.net_id ) > -1 ) {
    row.gw_role = "Crew";
  }

  
  db.addMemberToRoster( row, function( err, res ) {
    count++;

    if( err ) {
      erred++;

      if( !( err.message in errors ) ) {
        errors[ err.message ] = {
          count: 1,
          rows: [ row ]
        };
      } else {
        errors[ err.message ].count++;
        errors[ err.message ].rows.push( row );
      }
    } else {
      res.created && added++;
    }

    checkDone();
  });
});
