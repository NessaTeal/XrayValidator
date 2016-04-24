var watson = require('watson-developer-cloud');
var fs = require('fs');

var visualRecognitionApi = determineVisualRecognitionApi();

// Run the script
classifyTypeOfXrayImage();

// Define the functions
function determineVisualRecognitionApi() {
  var settingsFile = fs.readFileSync('settings.json', 'utf8');
  var settings = JSON.parse(settingsFile);
  return watson.visual_recognition(settings);
}

function classifyTypeOfXrayImage() {
  var xrayTypeClassificationParameter = determineXrayTypeClassificationParameter();
  visualRecognitionApi.classify(xrayTypeClassificationParameter, xrayImageTypeClassificationCallback);
}

function determineXrayTypeClassificationParameter() {
  var allXrayImageTypeClassifierId = ["ChestFront_20730281", "KneeFront_1424148053"];

  return {
    images_file: openImageFileStream(),
    classifier_ids: allXrayImageTypeClassifierId
  };
}

function openImageFileStream() {
  var pathToImage = process.argv[2];
  return fs.createReadStream(pathToImage);
}

function xrayImageTypeClassificationCallback(error, response) {
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

function classifyQualityOfXrayWithKnownTypeName(typeName) {
  var qualityClassificationParameter = buildQualityClassificationParameter(typeName);
  classifyQualityOfXray(qualityClassificationParameter);
}

function buildQualityClassificationParameter(imageTypeName) {
  var typeClassifierToAllQualityClassifierIdMap = determineTypeClassifierToAllQualityClassifierMap();

  return {
    images_file: openImageFileStream(),
    classifier_ids: typeClassifierToAllQualityClassifierIdMap[imageTypeName]
  };
}

function determineTypeClassifierToAllQualityClassifierMap() {
  return {
    "KneeFront": ["GoodKneeFront_338893760"],
    "ChestFront": ["GoodChestFront_1810506107"]
  };
}

function classifyQualityOfXray (parameters) {
  visualRecognitionApi.classify(parameters, xrayQualityClassificationCallback);
}

function xrayQualityClassificationCallback(error, response) {
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