var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var moesifExpress = require('moesif-express');
var port = process.env.PORT || 5000

// Set the options, the only required field is applicationId.
var moesifOptions = {

  applicationId: process.env.MOESIF_APPLICATION_ID || 'SET ME',

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
  }
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(moesifExpress(moesifOptions));

app.get('/', function (req, res) {
  res.send('hello world!');
});

var router = express.Router();

router.get('/', function(req, res) {
  res.json({ message: 'first json api'});
});


app.use('/api', router);

app.listen(port, function() {
  console.log('Example app is listening on port ' + port);
});
