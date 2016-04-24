var watson = require('watson-developer-cloud');
var fs = require('fs');

// Initialize the Visual Recognition API
var visual_recognition = determineVisualRecognitionApi();

function determineVisualRecognitionApi()
{
  var settingsFile = fs.readFileSync('settings.json', 'utf8');
  var settings = JSON.parse(settingsFile);
  return watson.visual_recognition(settings);
}

// Save the XrayTypeClassifiers
var xrayTypeClassifiers = ["ChestFront_20730281", "KneeFront_1424148053"];

// Setup the classification parameters
var allTypeClassificationParameter = {
	images_file: openImageFileStream(),
	classifier_ids: xrayTypeClassifiers
};

function openImageFileStream()
{
  var pathToImage = process.argv[2];
  return fs.createReadStream(pathToImage);
}

visual_recognition.classify(allTypeClassificationParameter, xrayTypeClassificationCallback);
  
function xrayTypeClassificationCallback (error, response) {
	if (error) {
		processXrayTypeClassificationError(error);
	} else {
		processXrayTypeClassificationResponse(response);
	}
}

function processXrayTypeClassificationError(error) {
	console.log(error);
}

function processXrayTypeClassificationResponse(response) {
	var allImageAllTypeResponse = response['images'];
	var allTypeScore = allImageAllTypeResponse[0]['scores'];

	processXrayAllTypeClassificationScore(allTypeScore);
}

function processXrayAllTypeClassificationScore(allTypeScore) {
  if (allTypeScore === undefined) {
    processUnknownXrayType();
  } else {
    processAllKnownXrayTypeScore(allTypeScore);
  }
}

function processUnknownXrayType() {
  console.log("This is not a knee nor lungs.");
}

function processAllKnownXrayTypeScore(allTypeScore) {
  var typeName = allTypeScore[0]['name'];
  var typeScore = allTypeScore[0]['score'];

  processKnownXrayTypeScore(typeName, typeScore);
}

function processKnownXrayTypeScore(typeName, typeScore) {
  console.log("This is " + typeName + " with probability of " + typeScore);

  classifyQualityOfXrayWithKnownTypeName(typeName);
}

var typeClassifierToAllQualityClassifierIdMap = {
  "KneeFront": ["GoodKneeFront_338893760"],
  "ChestFront": ["GoodChestFront_1810506107"]
};

function classifyQualityOfXrayWithKnownTypeName(typeName) {
  var allQualityClassificationParameter = {
    images_file: openImageFileStream(),
    classifier_ids: typeClassifierToAllQualityClassifierIdMap[typeName]
  };

  classifyQualityOfXray(allQualityClassificationParameter);
}

function classifyQualityOfXray (parameters) {
  visual_recognition.classify(parameters, xrayQualityClassifiactionCallback);
}

function xrayQualityClassifiactionCallback(error, response) {
  if (error) {
    processXrayQualityClassificationError(error);
  } else {
    processXrayQualityClassificationResponse(response);
  }
}

function processXrayQualityClassificationError(error) {
  console.log(error);
}

function processXrayQualityClassificationResponse(response) {
  var allImageAllQualityResponse = response['images'];
  var allQualityScore = allImageAllQualityResponse[0]['scores'];

  processAllQualityScore(allQualityScore);
}

function processAllQualityScore(allQualityScore) {
  if(allQualityScore === undefined) {
    processLowQualityScore();
  } else {
    processAllHighQualityScore(allQualityScore);
  }
}

function processLowQualityScore() {
  console.log("This is a bad image.")
}

function processAllHighQualityScore(allQualityScore) {
  var qualityScore = allQualityScore[0]['score'];

  console.log("This is a good image with probability of " + qualityScore);
}