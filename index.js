var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var superagent = require('superagent');

// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

var moesifExpress = require('moesif-express');
var httpProxy = require('http-proxy');

var port = process.env.PORT || 5000

// Set the options, the only required field is applicationId.
var moesifOptions = {

  applicationId: process.env.MOESIF_APPLICATION_ID || 'Your Moesif Application Id',

  debug: false,

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

  disableBatching: true,

  logBody: true,

  // batchSize: 3,

  // batchMaxTime: 20000,

  callback: function (error, data) {
    console.log('inside call back');
    console.log('error: ' + JSON.stringify(error));
  }
};


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

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json({limit: '50mb', extended: true}));
router.use(bodyParser.text({type: 'text/plain'}))

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

router.post('/users(/:userId)', function(req, res) {
  // updateUser can be called anywhere in the node
  // this is just an example it can be easily triggered by the
  // test script.

  // Only userId is required.
  // Campaign object is optional, but useful if you want to track ROI of acquisition channels
  // See https://www.moesif.com/docs/api#users for campaign schema
  // metadata can be any custom object
  var user = {
    userId: req.params.userId,
    companyId: '67890', // If set, associate user with a company object
    campaign: {
      utmSource: 'google',
      utmMedium: 'cpc', 
      utmCampaign: 'adwords',
      utmTerm: 'api+tooling',
      utmContent: 'landing'
    },
    metadata: {
      email: 'john@acmeinc.com',
      firstName: 'John',
      lastName: 'Doe',
      title: 'Software Engineer',
      salesInfo: {
          stage: 'Customer',
          lifetimeValue: 24000,
          accountOwner: 'mary@contoso.com'
      }
    }
  };

  moesifMiddleware.updateUser(user, function(err) {
    if (err) {
      console.log('update user error');
      console.log(err);
      res.status(500).end();
    }
    res.status(201).json({ user_updated: true });
  });
});

router.post('/companies(/:companyId)', function(req, res) {
  
  // Only companyId is required.
  // Campaign object is optional, but useful if you want to track ROI of acquisition channels
  // See https://www.moesif.com/docs/api#update-a-company for campaign schema
  // metadata can be any custom object
  var company = {
    companyId: req.params.companyId,
    companyDomain: 'acmeinc.com', // If domain is set, Moesif will enrich your profiles with publicly available info 
    campaign: { 
      utmSource: 'google',
      utmMedium: 'cpc', 
      utmCampaign: 'adwords',
      utmTerm: 'api+tooling',
      utmContent: 'landing'
    },
    metadata: {
      orgName: 'Acme, Inc',
      planName: 'Free Plan',
      dealStage: 'Lead',
      mrr: 24000,
      demographics: {
        alexaRanking: 500000,
        employeeCount: 47
      }
    }
  };
  
  moesifMiddleware.updateCompany(company, function(err) {
    if (err) {
      console.log('update company error');
      console.log(err);
      res.status(500).end();
    }
    res.status(201).json({ company_updated: true });
  });
});

/**
 * Example proxy section.
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


app.use('/api', router);

app.use('/proxy', proxyRoute);


app.listen(port, function() {
  console.log('Example app is listening on port ' + port);
});
