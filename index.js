var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var moesif = require('moesif-nodejs');

var JsonWebToken = require('jsonwebtoken');
var { expressjwt: jwt } = require("express-jwt");

var port = process.env.PORT || 7500;

const FAKE_JWT_SECRETE_KEY = 'keep-your-secret-safe';

// Set the options, the only required field is applicationId.
var moesifOptions = {

  applicationId: process.env.MOESIF_APPLICATION_ID || 'Your Application Id',

  debug: true,

  identifyUser: function (req, res) {
    if (req.user) {
      return req.user.id;
    }
    if (req.headers['my-user-id']) {
      return req.headers['my-user-id'];
    }
    return undefined;
  },

  identifyCompany: function (req, res) {
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
      bar: 'example'
    }
  },

  // batchMaxTime: 10000,
  // batchSize: 15,
  disableBatching: true,

  // modify the option below to test out limits for responseMaxBodySize
  responseMaxBodySize: 5000,

  requestMaxBodySize: 100000,

  callback: function (error, data) {
    console.log('inside call back');
    console.log('error: ' + JSON.stringify(error));
  }
};


var moesifMiddleware = moesif(moesifOptions);

app.use(moesifMiddleware);


var jwtRoutes = express.Router();

// this is just an example for generate a JWT token that can be used for testing
// express jwt middle.
// this route is NOT protected because it is a fake example.
// you should have a real process for
// safely distributing JWT token
jwtRoutes.get('/generate-jwt-token', function(req, res) {
  const jwtData = {
    foo: 'bar'
  };
  const userId = 'firstuser';

  const token = JsonWebToken.sign(jwtData, FAKE_JWT_SECRETE_KEY, {
    expiresIn: '48h',
    subject: userId,
    issuer: `https://acmeinc.com/`,
    audience: 'world',
    algorithm: 'HS256'
  });

  res.json({ token });
});


// a fake route protected by express jwt middleware.
jwtRoutes.get(
  "/protected-by-jwt-check",
  jwt({ secret: FAKE_JWT_SECRETE_KEY, algorithms: ["HS256"] }),
  function (req, res) {
    console.log('decoded JWT token');
    console.log(JSON.stringify(req.auth, null, '  '));

    // again, express jwt decodes the token (assume valid) into req.auth
    res.json({
      decoded_token: req.auth
    });
  }
);

app.use('/jwt-test', jwtRoutes);

app.listen(port, function() {
  console.log('Example app is listening on port ' + port);
});
