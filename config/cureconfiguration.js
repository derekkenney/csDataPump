var fs = require('fs');
var concat = require('concat-stream');
var toml = require('toml');
var cfEnv = require("cfenv");

function CureConfiguration(){

  sourceTableName = 'UWOpsTicketTracker';
	origination = 1;

}

module.exports = CureConfiguration;
