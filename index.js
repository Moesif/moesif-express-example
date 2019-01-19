var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var superagent = require('superagent');

var moesifExpress = require('moesif-express');
var port = process.env.PORT || 5000

// Set the options, the only required field is applicationId.
var moesifOptions = {

  applicationId: process.env.MOESIF_APPLICATION_ID || 'your application id from moesif.',

  debug: true,

  identifyUser: function (req, res) {
    if (req.user) {
      return req.user.id;
    }
    return undefined;
  },

  getSessionToken: function (req, res) {
    return req.headers['Authorization'];
  },

  getMetadata: function (req, res) {
    return {
      foo: 'express',
      bar: 'example'
    }
  },

  // disableBatching: true,

  batchSize: 3,

  batchMaxTime: 20000,

  callback: function (error, data) {
    console.log('inside call back');
    console.log(JSON.stringify(error));
    console.log(JSON.stringify(data));
  }

  // samplingPercentage: 100
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.text({type: 'text/plain'}))

console.log
var moesifMiddleware = moesifExpress(moesifOptions);

app.use(moesifMiddleware);
moesifMiddleware.startCaptureOutgoing();

app.get('/', function (req, res) {
  res.send('hello world!');
});

app.post('/multipart', function (req, res) {
  console.log('inside multi part');
  console.log(req.body);
  res.send('received');
});

var router = express.Router();

router.get('/', function(req, res) {
  res.json({ message: 'first json api'});
});


router.post('/large', function(req, res) {
  console.log(req.body);
  res.json({ message: 'post successful'})
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

// router.get('/outgoing/')

app.use('/api', router);

app.listen(port, function() {
  console.log('Example app is listening on port ' + port);
});



