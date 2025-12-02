var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var superagent = require('superagent');
var _ = require('lodash');

var httpProxy = require('http-proxy');

var moesif = require('moesif-nodejs');


var port = process.env.PORT || 5050

// Set the options, the only required field is applicationId.
var moesifOptions = {

  applicationId: process.env.MOESIF_APPLICATION_ID || 'YOUR_MOESIF_APPLICATION_ID',

  baseUri: 'https://api.moesif.net',

  debug: true,

  identifyUser: function (req, res) {
    if (req.user) {
      return req.user.id;
    }
    if (req.headers['x-user-id']) {
      return req.headers['x-user-id'];
    }
    if (req.headers['my-user-id']) {
      return req.headers['my-user-id'];
    }
    return undefined;
  },

  identifyCompany: function (req, res) {
    if (req.headers['x-company-id']) {
      return req.headers['x-company-id']
    }
    if (req.headers['my-company-id']) {
      return req.headers['my-company-id'];
    }
    return undefined;
  },

  // batchMaxTime: 10000,
  // batchSize: 15,
  disableBatching: true,

  // modify the option below to test out limits for responseMaxBodySize
  responseMaxBodySize: 5000,

  maxOutgoingTimeout: 10,

  callback: function (error, data) {
    console.log('inside call back');
    console.log('error: ' + JSON.stringify(error));
  }
};


var moesifMiddleware = moesif(moesifOptions);

app.use(moesifMiddleware);

var governanceRoutes = express.Router();

governanceRoutes.get('/api/recons/11af661e-4445-4d30-aaae-c651fa70474c/initiate', (req, res) => {
  res.status(200).send({
    success: true
  });
});

app.use('/gov', governanceRoutes);

app.listen(port, function() {
  console.log('Example app is listening on port ' + port);
});
