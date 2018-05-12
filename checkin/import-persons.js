var xlsx = require("xlsx"),
    db   = require("../server/database"),
    chapters = require("./chapters");

var encode = xlsx.utils.encode_cell,
    decode = xlsx.utils.decode_cell;

// A list of workbooks to read in
// If <name> is an element of BOOKS, then the script will look for a book
// called waivers-<name>.xls and will import the waiver data into a table
// called waivers.<name>
//We now have just one book for everything, used Microsoft ACCESS to clean up.
var BOOKS = [ "CheckInData" ] 

var doneCount = 0;
var checkDisconnect = function() {
  if( ++doneCount === BOOKS.length + 1 ) db.disconnect(); 
};

// A mapping from column headers to property names //TODO change mapping. -- Should be pretty easy too.
// var COLS = {
//   "First Name":   "first",
//   "Last Name":    "last",
//   "Organization": "chapter"
// };

//New mapping for one excel doc
var COLS = {
	"ISU NetID": "net_id", 
	"ISU ID": "isu_id",
	"First": "first_name",
	"Last": "last_name",
	"Chapter": "chapter",
	"Gen Waiver": "w_general",
	"Basketball": "basketball",
	"Dodgeball": "dodgeball",
	"LipSync": "lipsync",
	"Track": "track",
	"Treds": "treds",
	"Trivia Blast": "trivia",
	"Volleyball": "volleyball",
	"Technical": "technical"
}

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
  "jessdwy",
  "kabeebe",
  "meuchner",
  "amfox",
  "dwgasper",
  "khanscom",
  "thenry",
  "vlh",
  "cikeller",
  "mathis",
  "nlnauman",
  "hnpeters04",
  "aregmi",
  "lsimons",
  "kywest",
  "meganp16",
  "iherna",
  "amdewitt",
  "gantoine",
  "aupperle",
  "sbak",
  "katielc",
  "rjcarter",
  "bdellis",
  "bpelse",
  "sgard",
  "ralphm",
  "jknguyen",
  "acrahn",
  "cstark",
  "tboyle",
  "rford",
  "skarkosh",
  "patkarys",
  "gkiefer",
  "kovalsky",
  "bdl",
  "mhedayat",
  "alexpic",
  "tmready",
  "trog0724",
  "jacobs3",
  "tads",
  "cecarney"
];

/* Used to get every row. */
var readRow = function( sheet, row ) {
  var vals = [];

  // Read across the row until the last relevant column is hit
  for( var i = 0, e = sheet['!range'].e.c; i < e; i++ ) {
    vals.push( sheet[ encode({ r: row, c: i }) ].v );
  }
  
  return vals;
};

/* Used to get the columns specified. */
var reduceRow = function( sheet, row, cols ) {
  var res = {}, val;

  // Grab the relevant columns
  for( var col in cols ) {
    val = sheet[ encode({ r: row, c: cols[ col ] }) ];
    res[ col ] = val ? val.v : "";
  }
  
  return res;
};

/* This is to send the data from the workbook the database */
var readBookToDatabase = function( name, cb ) {
  // First, open the workbook and grab the first sheet
  var book;
  try {
    book = xlsx.readFile( `${name}18.xls` );
  } catch( e ) {
    book = xlsx.readFile( `${name}18.xlsx` );
  }
  var sheet = book.Sheets[ book.SheetNames[0] ];
  

  // If the sheet has no range, add one from ref.
  if( !sheet['!range'] && sheet['!ref'] ) {
    const parts = sheet['!ref'].split(':');
    sheet['!range'] = {
      s: decode(parts[0]),
      e: decode(parts[1])
    }
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

  var rows = [];
  //This loop is the issue. TODO
  for( var i = 1, end = sheet['!range'].e.r + 1; i < end; i++ ) {
	if (!(i === 0)) {
		rows.push( reduceRow( sheet, i, cols ) );
	}
  }

  // Attempt to mark each row in the database
  var len = rows.length,
      counts = {
        seen: 0,
        erred: 0,
        failNone: 0,
        failMany: 0,
        success: 0
      };
  var failed = [],
      succeeded = [];

  // Callback checking so we know when to close the db
  var checkDone = function() {
    if( counts.seen < len ) return;

    console.log("Done importing '%s' waivers. (%d attempted, %d failed.)", name, len, failed.length );
    console.log("\n  %d erred", counts.erred );
//    failed.filter( row => row[1] === "error" ).forEach( row => {
//      console.log( row[0], row[2] );
//    });
//    console.log("\n  %d failed because no matching roster entry was found", counts.failNone );
    failed.filter( row => row[1] === "none" ).forEach( row => console.log( row[0] ));
    console.log("\n  %d failed because more than one matching roster entry was found", counts.failMany );
    failed.filter( row => row[1] === "many" ).forEach( row => {
      console.log( row[0], "Options are:", row[2] )
    });
    console.log("\n  %d succeeded\n", counts.success );

    checkDisconnect();
  }

  rows.forEach(function( row ) {
  	
  	if( CENTRAL.indexOf( row.net_id ) > -1 ) {
    	row.gw_role = 'Central';
  	} else if( CREW.indexOf( row.net_id ) > -1 ) {
    	row.gw_role = 'Crew';
  	} else {
  		row.gw_role = '';
  	}
  	
    db.addMemberToDB( row, function( err, res ) {
      counts.seen++;
      // If an error occurred, add it to the stack of errors
      if( err ) {
        counts.erred++;
        failed.push([ row, "error", err ]);
      } else {
        if( res.updated ) {
          counts.success++;
          succeeded.push( row );
        } /*else if( res.options.length ) {
          counts.failMany++;
          failed.push([ row, "many", res.options ]);
        }*/ else {
          counts.failNone++;
          failed.push([ row, "none", res.options ]);
        }
      }

      checkDone();
    });
  });
};

// Read each of the books into the database
BOOKS.forEach( readBookToDatabase );



// TODO this was only for 2016. Left here as a reference in case it
// happens again.
// PIKE sent paper general waivers, their netids are in "pikes.json"
// Read PIKEs into the database
/*var pikes = require("./pikes.json");
var failed = [], notFound = [], count = 0;
var printResults = function() {
  console.log("\n-----Pike stuff-----")
  console.log("  Failed: ", failed);
  console.log("  Not found: ", notFound);
  checkDisconnect();
}
pikes.forEach(function( netId ) {
  // Add it to the database!
  db.setWaiverStatusByNetID( netId, "general", true, function( err, res ) {
    if( err ) {
      failed.push( netId );
    } else if( !res.success ) {
      notFound.push( netId );
    }

    if( ++count === pikes.length ) printResults();
  });
});*/

// Disconnect from the database
//db.disconnect();
