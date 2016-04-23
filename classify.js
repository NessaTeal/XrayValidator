var watson = require('watson-developer-cloud');
var fs = require('fs');

var image = process.argv[2];

var visual_recognition = watson.visual_recognition({
  username: '1dca8c73-6e8f-44e2-b6be-c97354e20354',
  password: 'zLbPquNw7TZ0',
  version: 'v2-beta',
  version_date: '2015-12-02'
});

var params = {
	images_file: fs.createReadStream(image),
	classifier_ids: fs.readFileSync('./classifierlist.json')
};

visual_recognition.classify(params, 
	function(err, response) {
   	 if (err)
      		console.log(err);
    	else
    	{

	    	var images = response['images']; 
	    	var scores = images[0]['scores'];
	    	
	    	if(scores != null)
	    	{	
		    	var name = scores[0]['name'];
		    	var score = scores[0]['score'];
		    	
		    	console.log("This is " + name + " with probability " + score);
		    	
		    	var params2 = {
		    			images_file: fs.createReadStream(image),
		    			classifier_ids: ""
		    	};
		    	
		    	if(name == "KneeFront")
		    	{
		    		params2.classifier_ids = ["GoodKneeFront_338893760"];
		    	}
		    	else if(name == "ChestFront")
		    	{
		    		params2.classifier_ids = ["GoodChestFront_1810506107"];
		    	}
		    	
		    	visual_recognition.classify(params2, 
		    			function(err, response2) {
		    		   	 if (err)
		    		      		console.log(err);
		    		    	else
		    		    	{
		    		    		var images2 = response2['images']; 
		    		        	var scores2 = images2[0]['scores'];
		    		        	if(scores2 != null)
		    		        	{
		    		        		var score2 = scores2[0]['score'];
		    		    			console.log("This is good image with probability " + score2);
		    		        	}
		    		        	else
		    		        	{
		    		        		console.log("This is bad image");
		    		        	}
		    		    	}
		    	});
	    	}
	    	else
	    	{
	    		console.log("This is not knee or lungs.");
	    	}
    	}
});