var https = require('node:https');
var { Logger } = require('./logger');

var args = process.argv.slice(2);
var [ CENTRALIZED_SERVER, network, port ] = args;

async function cleanUp() {
    var url = new URL(CENTRALIZED_SERVER + "/disconnect");
    
    url.searchParams.set("url", encodeURI(`${network}:${port}`));
    
    https.get(url.toString(), (res) => { Logger.log("Unregistered from centralized server; Response-code: " + res.statusCode, "Process::OnExit", Logger.VERBOSE); });
}

cleanUp();