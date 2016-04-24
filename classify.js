var watson = require('watson-developer-cloud');
var fs = require('fs');

var visualRecognitionApi;

classifyTypeOfXrayImage();

function classifyTypeOfXrayImage() {
  visualRecognitionApi = determineVisualRecognitionApi();
  var xrayImageTypeClassificationParameter = determineXrayImageTypeClassificationParameter();
  visualRecognitionApi.classify(xrayImageTypeClassificationParameter, xrayImageTypeClassificationCallback);
}

function determineVisualRecognitionApi() {
  var settingsFile = fs.readFileSync('settings.json', 'utf8');
  var settings = JSON.parse(settingsFile);
  return watson.visual_recognition(settings);
}

function determineXrayImageTypeClassificationParameter() {
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
    processUnknownXrayImageType();
  } else {
    processAllKnownXrayImageTypeScore(allTypeScore);
  }
}

function processUnknownXrayImageType() {
  console.log("This is not a knee nor lungs.");
}

function processAllKnownXrayImageTypeScore(allTypeScore) {
  var typeName = allTypeScore[0]['name'];
  var typeScore = allTypeScore[0]['score'];

  processKnownXrayImageTypeScore(typeName, typeScore);
}

function processKnownXrayImageTypeScore(typeName, typeScore) {
  console.log("This is " + typeName + " with probability of " + typeScore);

  classifyQualityOfXrayImageWithKnownType(typeName);
}

function classifyQualityOfXrayImageWithKnownType(xrayImageTypeName) {
  var qualityClassificationParameter = buildQualityClassificationParameter(xrayImageTypeName);
  classifyQualityOfXrayImage(qualityClassificationParameter);
}

function buildQualityClassificationParameter(xrayImageTypeName) {
  var typeClassifierToAllQualityClassifierIdMap = determineTypeClassifierToAllQualityClassifierMap();

  return {
    images_file: openImageFileStream(),
    classifier_ids: typeClassifierToAllQualityClassifierIdMap[xrayImageTypeName]
  };
}

function determineTypeClassifierToAllQualityClassifierMap() {
  return {
    "KneeFront": ["GoodKneeFront_338893760"],
    "ChestFront": ["GoodChestFront_1810506107"]
  };
}

function classifyQualityOfXrayImage (parameters) {
  visualRecognitionApi.classify(parameters, xrayImageQualityClassificationCallback);
}

function xrayImageQualityClassificationCallback(error, response) {
  if (error) {
    processXrayImageQualityClassificationError(error);
  } else {
    processXrayImageQualityClassificationResponse(response);
  }
}

function processXrayImageQualityClassificationError(error) {
  console.log(error);
}

function processXrayImageQualityClassificationResponse(response) {
  var allXrayImageQualityResponse = response['images'];
  var allXrayImageQualityScore = allXrayImageQualityResponse[0]['scores'];

  processAllXrayImageQualityScore(allXrayImageQualityScore);
}

function processAllXrayImageQualityScore(allXrayImageQualityScore) {
  if(allXrayImageQualityScore === undefined) {
    processLowXrayImageQualityScore();
  } else {
    processAllHighXrayImageQualityScore(allXrayImageQualityScore);
  }
}

function processLowXrayImageQualityScore() {
  console.log("This is a bad image.")
}

function processAllHighXrayImageQualityScore(allXrayImageQualityScore) {
  var xrayImageQualityScore = allXrayImageQualityScore[0]['score'];

  console.log("This is a good image with probability of " + xrayImageQualityScore);
}