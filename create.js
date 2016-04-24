var watson = require('watson-developer-cloud');
var fs = require('fs');

// Parse the settings
var settingsFile = fs.readFileSync('settings.json', 'utf8');
var settings = JSON.parse(settingsFile);

// Initialize the Visual Recognition API
var visual_recognition = watson.visual_recognition(settings);

var params = {
	name: 'ChestFront',
	positive_examples: fs.createReadStream('./goodsampleschest.zip'),
	negative_examples: fs.createReadStream('./goodsamplesknee.zip')
};

visual_recognition.createClassifier(params, 
	function(err, response) {
   	 if (err)
      		console.log(err);
    	 else
   		console.log(JSON.stringify(response, null, 2));
});

params = {
	name: 'KneeFront',
	positive_examples: fs.createReadStream('./goodsamplesknee.zip'),
	negative_examples: fs.createReadStream('./goodsampleschest.zip')
};

visual_recognition.createClassifier(params, 
	function(err, response) {
   	 if (err)
      		console.log(err);
    	 else
   		console.log(JSON.stringify(response, null, 2));
});

params = {
	name: 'GoodChestFront',
	positive_examples: fs.createReadStream('./goodsampleschest.zip'),
	negative_examples: fs.createReadStream('./badsampleschest.zip')
};

visual_recognition.createClassifier(params, 
	function(err, response) {
   	 if (err)
      		console.log(err);
    	 else
   		console.log(JSON.stringify(response, null, 2));
});

params = {
	name: 'GoodKneeFront',
	positive_examples: fs.createReadStream('./goodsamplesknee.zip'),
	negative_examples: fs.createReadStream('./badsamplesknee.zip')
};

visual_recognition.createClassifier(params, 
	function(err, response) {
   	 if (err)
      		console.log(err);
    	 else
   		console.log(JSON.stringify(response, null, 2));
});
