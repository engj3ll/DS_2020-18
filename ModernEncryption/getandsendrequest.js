const request = require('request');
const cheerio = require('cheerio');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path')

const import_file = (namefilesaved,link)=>{
	if(namefilesaved == ''){
		console.log('File name is missing <name>!');
		process.exit();
	}else if(link == ''){
		console.log('Link is missing <name>!');
		process.exit();
	}
request(link,(error,response,html)=>{
	
	if(error || response.statusCode != 200){
		console.log('Fail to connect make sure you have correct link!');
		process.exit();
	}
	const $ = cheerio.load(html);
	const crytext = $.text();

	var matches = crytext.match(/[\-]+[A-Z\s]+[\-]+/g); // check if is pem file
	if(matches.length%2 != 0){
		console.log('This is not .pem file');
		process.exit();
	}

	var crytpto_text = crytext.match(/[\-]+[A-Z\s]+[\-]+(.*?)[\-]+[A-Z\s]+[\-]+/s);
	const crytotext_found = crytpto_text[1];
	const rsa_length = crytotext_found.length;
	if(rsa_length < 120){
		console.log('RSA MATCH not found');
		process.exit();
	}
	var extension = '';
	if(rsa_length < 500){
		extension = '.pub.pem'; // rsa public 
	}else{
		extension = '.pem'; // rsa private 
	}
	fs.mkdir("./ModernEncryption/Keys", function(err) {
	  if (err) {
		  if (err.code != 'EEXIST') {
			console.log(err)
		  }
	  }
	})
	if(extension == '.pem'){
	var extension_public = '.pub.pem';
	var privateKey = crytext;
    var test = crypto.createPrivateKey({'key': privateKey,'passphrase': 'top secret','cipher': 'aes-256-cbc'})
	var test2 = crypto.createPublicKey(test).export({'type':'spki','format': 'pem','cipher': 'aes-256-cbc','passphrase':'top secret'});
	
	fs.writeFile(path.join(__dirname,"/Keys/"+namefilesaved+extension_public), test2, function (err) {
	  if (err) throw err;
	  console.log('Saved RSA Public: '+namefilesaved+extension_public);
	});	
	}

	fs.writeFile(path.join(__dirname,"/Keys/"+namefilesaved+extension), crytext, function (err) {
	  if (err) throw err;
	  console.log('Saved RSA: '+namefilesaved+extension);
	});
});
}

const showlistkeys = ()=>{
const checkforkeys = path.join(__dirname,"/Keys/") 
fs.readdir(checkforkeys, (err, files) => {
console.log("-----------------------------");
var file_output = "";
var total_keys = 0;
	if(err || files == null){
		console.log("No keys here");
	}else{
	
		files.forEach(file => {
		
			
			var takethisfile = file.match(/(.*?)\.(.*)/);
			if(!file_output.includes("\n| "+takethisfile[1])){
				file_output += "\n| "+takethisfile[1]+' '.repeat(15-takethisfile[1].length);
				total_keys += 1;
			}
			if(takethisfile[2] === 'pem')
				file_output += "[Private]";
			else if (takethisfile[2] === 'pub.pem'){
				let counterToken = 0;
				if (fs.existsSync(path.join(__dirname,'../Core/Token/CoreToken.rtf'))) {
					var data = fs.readFileSync(path.join(__dirname,'../Core/Token/CoreToken.rtf')).toString();
					var spliter = data.split('|'+takethisfile[1]+'|');
					file_output += "[Public]"+'['+(spliter.length-1)+' Tokens]';
				}else{
				file_output += "[Public]"+'['+counterToken+' Tokens]';
				}
			}
		});
		
		console.log(file_output);
		
	}
	console.log("> Total keys: "+total_keys);
console.log("\n-----------------------------");
});

}
module.exports = {import_file,showlistkeys};
// in end of line is the end of the words 