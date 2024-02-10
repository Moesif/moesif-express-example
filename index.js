var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var superagent = require('superagent');
var _ = require('lodash');

var httpProxy = require('http-proxy');

var moesif = require('moesif-nodejs');
// var moesif = require('../moesif-nodejs/lib/index');

var port = process.env.PORT || 5050

// Set the options, the only required field is applicationId.
var moesifOptions = {

  applicationId: process.env.MOESIF_APPLICATION_ID || 'Your Moesif Application Id',

  // baseUri: 'https://api-dev.moesif.net',

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

  getSessionToken: function (req, res) {
    return req.headers['Authorization'];
  },

  getMetadata: function (req, res) {
    return {
      foo: 'express',
      bar: 'example',
      my_date_field: (new Date()).toISOString()
    }
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

moesifOptions.maskContent = function (event) {
  console.log('event before masking' + JSON.stringify(event));
  const newEvent = _.omit(event, ['request.headers.authorization']);
  console.log('event after masking' + JSON.stringify(newEvent));
  return newEvent;
}

var moesifMiddleware = moesif(moesifOptions);

app.use(moesifMiddleware);
// moesifMiddleware.startCaptureOutgoing();

app.get('/', function (req, res) {
  console.log(req.body);
  res.send('hello world!');
});

app.post('/multipart', function (req, res) {
  console.log('inside multi part');
  console.log(req.body);
  res.send('received');
});

app.get('/large-string-response', function(req, res) {
  var really_long_string = (new Array(10001)).join("x");
  res.send(really_long_string);
});

// router are prefaced by /api
// and uses bodyParser
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json({limit: '50mb', extended: true}));
router.use(bodyParser.text({type: 'text/plain'}))

router.get('/', function(req, res) {
  console.log('req body in customer api');
  console.log(req.body);
  res.json({ message: 'first json api'});
});

router.post('/large', function(req, res) {
  // moesifMiddleware.updateSubscription({
  //   subscriptionId: "test-nodejs",
  //   companyId: "test-nodejs2",
  //   status: "active",
  // }).then((result) => {
  //   console.log("subscription updated successfully", result);
  // }).catch((err) => {
  //   console.error("Error updating subscription", err);
  // });
  console.log('req body in customer api');
  console.log(req.body);
  res.json({ message: 'post successful'})
});

router.get('/large-object-response', function(req, res) {
  var reallyBigArray = (new Array(10001)).fill('hi');
  res.json(reallyBigArray);
});

router.get('/outgoing/posts', function(req, res) {
  console.log('outgoing is called');
  superagent.get('https://jsonplaceholder.typicode.com/todos/2').then(function (response) {
    console.log('back from outoging');
    console.log(response.body);
    res.json({ fromTypicode: response.body });
  }).catch(function(err) {
    res.status(500).json(err);
  });
});

/**
 * Example using http-proxy.
 */

var proxyRoute = express.Router();
const proxy = httpProxy.createProxyServer();

proxy.on('error', (error, req, res) => {
  if (error.code !== 'ECONNRESET') {
    console.error('proxy error', error);
  }
  if (!res.headersSent) {
    res.writeHead(500, { 'content-type': 'application/json' });
  }

  const json = { error: 'proxy_error', reason: error.message };
  res.end(JSON.stringify(json));
});


proxyRoute.use('/', (req, res) => {
  proxy.web(req, res, {
    target: 'http://jsonplaceholder.typicode.com',
    ws: false,
    changeOrigin: true,
  });
});

var governanceRoutes = express.Router();

governanceRoutes.get('/no_italy', (req, res) => {
  res.status(200).send({
    success: true
  });
});

governanceRoutes.get('/company1', (req, res) => {
  res.status(200).send({
    success: true
  });
});


governanceRoutes.get('/canada', (req, res) => {
  res.status(200).send({
    success: true
  });
});

governanceRoutes.get('/cairo', (req, res) => {
  res.status(200).send({
    success: true
  });
});

governanceRoutes.get('/for_companies_in_japan_only', (req, res) => {
  res.status(200).send({
    success: true
  });
});

governanceRoutes.get('/no_germany_companies_allowed', (req, res) => {
  res.status(200).send({
    success: true
  });
});

governanceRoutes.get('/random', (req, res) => {
  res.status(200).send({
    success: true
  });
});

governanceRoutes.get('/header_match', (req, res) => {
  res.status(200).send({
    success: true
  });
});


app.use('/api', router);

app.use('/proxy', proxyRoute);

app.use('/gov', governanceRoutes);

app.listen(port, function() {
  console.log('Example app is listening on port ' + port);
});
