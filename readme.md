# Moesif Express Example

[Express](https://expressjs.com) is very popular web framework for node.js.

[Moesif](https://www.moesif.com) is an API analytics platform.
[moesif-express](https://github.com/Moesif/moesif-express)
is a middleware that makes integration with Moesif easy for Express or even Node based web apps. 

This example is an example express application with Moesif-Express integrated. 


## How to run this example.

1. Install all dependencies: `$ npm install`

2. Be sure to edit the `index.js` to change the application id to your
application id obtained from Moesif.

```
var moesifOptions = {
  applicationId: 'your application id',

}
```

6. To run: `$ node index.js`

7. Send some requests to some of the routes and verify that the API calls are captured in
your Moesif account.