/**
 *
 */
var destinationpath, querysql, sourcePath, sourceTableName, mongoInfo, dbCreds, dbInfo, envConf, collectionName;
var BeginOffSet, EndOffSet, configdata, cdata;
var origination = 2;
var stack = new Error().stack;
var ecode = new Error().code;
var fs = require('fs');
var toml = require('toml-js');

function dataDumpClass(source, destination){

	this.source = source;
	this.destination = destination;

	switch (source.toString().trim()){
	case 'Cure':
		getConfigdata();
		getCureConfig();
		sourceTableName = 'UWOpsTicketTracker';
		//this.sourceTableName = sourceTableName;
		origination = 1;
		break;

	case 'AD':
		// TODO AD config

	}

//TODO Refactor as a property of a MongoDB repo object. Switch statements are code smells
	switch (destination.toString().trim()){
	case 'csMongodb':
		//console.log('destinationpath: '+dbCreds);
		destinationpath = dbCreds;
	}

}

//This function gets the data from app.toml in config folder
function getConfigdata(){
	var configdata = fs.readFileSync('config/app.toml');
	//onsole.log('data: \n'+configdata);
	configdata = toml.parse(configdata);
	this.configdata = configdata;
	return configdata;
}


//function to set sourcePath for cure
function getCureConfig(){
	//fs = require("fs");
	//var filename = "./secret-cure-config.json";
	console.log("This is Cure");
	try {
		var cure = 'cure';
		sourcePath = this.configdata[cure];
		console.log(sourcePath);
	}
	catch (err) {
		config={};
		console.log('getCureConfig function '+err.stack);
		process.exit();
	}

}

//Function to send load to the destination
dataDumpClass.prototype.sendLoad = function(){
	//getConfigdata();
	// Get the environment name from nam_space in cf an return it in a variable
	function envVar(){
		console.log("Getting env var");
		var cfEnv = require("cfenv");
		console.log("Getting env var- Now get app env");
		var appEnv = cfEnv.getAppEnv();
		//console.log(appEnv);
		//appEnv = JSON.parse(appEnv);
		var app = JSON.stringify(appEnv.app);
		var spaceName = mongoInfo.space_name;

		//var configdata = fs.readFileSync('config/app.toml');
		//onsole.log('data: \n'+configdata);
<<<<<<< HEAD
		//envVardata = toml.parse(configdata);
		envVardata = this.configdata[mongoInfo];
		console.log('from toml envVardata: '+ envVardata);
		console.log(cdata);
		dbInfo = envVardata.uri;
		collectionName = envVardata.collectionName;
=======
		configdata = toml.parse(configdata);
		configdata = configdata[spaceName];
		dbInfo = configdata.uri;
		collectionName = configdata.collectionName;
>>>>>>> refs/remotes/csDataPump/master
		console.log('parsed the uri: ');

		return dbInfo, collectionName;

	}
	envVar();


	console.log('Starting prototype sendload');

	//console.log('print dbInfo: '+dbInfo);

	//Create a connection to Mongodb
	var MongoClient = require('mongodb').MongoClient
	, format = require('util').format;
	MongoClient.connect(dbInfo, function(err, db) {
		if (err) throw err.stack;
		console.log("Connected to Mongodb");

		//Switch case to sent the load to the correct loaction. 0 is for AD and 1 for Cure
		switch(origination){

		case 0:
			//TODO code for AD
			break;

		case 1:
			//create two variables for the query to run from the today -2 to today -1
			//var DateOffset = fs.readFileSync('config/Dateoffset.toml');
			//console.log('data: \n'+DateOffset);
			//DateOffset = toml.parse(DateOffset);
			var DateOffset = 'DateOffset';
			var BeginDayOffSet = 'BeginDayOffSet';
			var EndDayOffSet = 'EndDayOffSet';
			BeginOffSet = this.configdata[DateOffset];
			console.log('beginOffset: \n'+BeginOffSet);
			BeginOffSet = BeginOffSet.BeginDayOffSet;
			BeginOffSet = BeginOffSet;
			EndOffSet = this.configdata[DateOffset];
			EndOffSet = EndOffSet[EndDayOffSet];
			EndOffSet = EndOffSet;
			console.log('Begin: '+BeginOffSet);
			console.log('End: '+EndOffSet);

			var dateTime = require('node-datetime');
			var dt = dateTime.create();
			var presentDate = dt.format('m-d-Y');
			console.log(presentDate);
			dt.offsetInDays(BeginOffSet);
			var queryBeginDate = dt.format('m-d-Y');
			dt.offsetInDays(EndOffSet);
			var queryEndDate = dt.format('m-d-Y');
			console.log(queryEndDate);
			console.log(queryBeginDate);

			querysql="SELECT ID, FO_OwnerUserID,  FO_AckDate, FO_RemedyTicketNo, To_SubmitterName, TO_SubmitterEmail, TO_SubmitterContactNo," +
			"FO_SubmissionDate, FO_Severity, FO_Priority, UD_UserCompanyName, MD_SubmissionEmail, UD_UserLogonEmail," +
			"MD_DefectType, UC_ContactName, UC_ContactEmail, UC_BestTimeToContact, UC_UserContactNo, UC_PermissionToAccess," +
			" ID_Product, ID_TypeOfIssue, ID_OS, ID_Browser, ID_FoundThroghSSR, ID_SRREmail, ID_IssueSummary, MD_SaleAmount, " +
			"ID_StepsToReproduce, ID_Comment, MD_SLA, MD_Status, MD_NotifySLA, MD_Outlier, MD_CustImpact"
			+ " from " + sourceTableName + " where FO_SubmissionDate between '" + queryBeginDate + "' AND '" + queryEndDate + "'";

			//Connection to SQL with tedious
			var Connection = require('tedious').Connection;
			var rows = [];
			// Creating the SQL connection then call the getSqlData function to grab the data
			var connection = new Connection(sourcePath);
			connection.on('connect', function(err) {
				if (err) throw err.stack;
				console.log('Connection successful. executing the getSqlData function to query and store the result');
				getSqlData();
			}
			);
			//connection.close();

			var Request = require('tedious').Request;

			function insertIntoMongoDb(){
				console.log('inserting data into MongDB with option');
				//console.log('rows length: '+rows.lenght);

				var col = db.collection(collectionName);
				var batch = col.initializeUnorderedBulkOp({useLegacyOps: true});
				var a = 0;
				console.log("# of rows: "+rows.length);
				while (a < rows.length){

					//console.log('inside while loop. This is the a: '+a+'/n this is the value at a: '+JSON.stringify(rows[a]));
					batch.insert(rows[a])
					a++;
				}
				batch.execute(function(err, records) {
					if (err) throw err.stack;
					console.log('Successfully added '+rows.length+' records');
				});


			}

			//function to get SQL data
			function getSqlData() {
				//console.log('Getting data from SQL:\n'+querysql);
				request = new Request(querysql,
						function(err, rowCount, rows) {
					if (err) {
						console.log('error on Getting data from SQL: '+err.stack);
					} else {
						//console.log('the result is: '+rows);
						insertIntoMongoDb();
					}
				});
				request.on('row', function(columns) {
					var row = {};
					columns.forEach(function(column) {
						row[column.metadata.colName] = column.value;
					});

					rows.push(row);
				});

				connection.execSql(request);
			}

		}

	});

}

module.exports = dataDumpClass;
