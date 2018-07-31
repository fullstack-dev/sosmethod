const fs = require('fs')
const cordovaConfigFile = './config.xml';
var env = process.env.MY_ENV;

fs.readFile(cordovaConfigFile, 'utf8', function(err, data) {

  if (err) {
    return console.log(err);
  }

  let result;
  
  if (env === 'dev') {
  	if (data.includes("co.sosmethod.mobile.staging")) {
  		result = data.replace(/id="co.sosmethod.mobile.staging"/, 'id="co.sosmethod.mobile.dev"').replace('<name>SOS Stage</name>', '<name>SOS Dev</name>');
  	} else if (data.includes("co.sosmethod.mobile")) {
	    result = data.replace(/id="co.sosmethod.mobile"/, 'id="co.sosmethod.mobile.dev"').replace('<name>SOS Method</name>', '<name>SOS Dev</name>');
  	} else {
  		result = data;
  	}
  } else if (env === 'stage') {
  	if (data.includes("co.sosmethod.mobile.dev")) {
  		result = data.replace(/id="co.sosmethod.mobile.dev"/, 'id="co.sosmethod.mobile.staging"').replace('<name>SOS Dev</name>', '<name>SOS Stage</name>');
    } else if (data.includes("co.sosmethod.mobile")) {	
	    result = data.replace(/id="co.sosmethod.mobile"/, 'id="co.sosmethod.mobile.staging"').replace('<name>SOS Method</name>', '<name>SOS Stage</name>');
  	} else {
  		result = data
  	}
    
  } else {
  	if (data.includes("co.sosmethod.mobile.dev")) {
  		result = data.replace(/id="co.sosmethod.mobile.dev"/, 'id="co.sosmethod.mobile"').replace('<name>SOS Dev</name>', '<name>SOS Method</name>');
  	} else if (data.includes("co.sosmethod.mobile.staging")) {
  		result = data.replace(/id="co.sosmethod.mobile.staging"/, 'id="co.sosmethod.mobile"').replace('<name>SOS Stage</name>', '<name>SOS Method</name>');
  	} else {
  		result = data;
  	}
  }

  fs.writeFile(cordovaConfigFile, result, 'utf8', function(err) {
    if (err) {
      return console.log(err)
    }
  })

  if (env === 'dev') {
    fs.createReadStream('./resources/icon-dev.png').pipe(fs.createWriteStream('./resources/icon.png'));
  } else if (env === 'stage') {
    fs.createReadStream('./resources/icon-staging.png').pipe(fs.createWriteStream('./resources/icon.png'));
  } else {
    fs.createReadStream('./resources/icon-prod.png').pipe(fs.createWriteStream('./resources/icon.png'));
  }
})