# Moesif Express Example

[Express](https://expressjs.com) is very popular web framework for node.js.

[Moesif](https://www.moesif.com) is an API analytics platform.
[moesif-nodejs](https://github.com/Moesif/moesif-nodejs)
is a middleware that makes integration with Moesif easy for Nodejs based apps including Express.

This example is an express application with Moesif's API analytics and monitoring integrated.


## How to run this example.

1. Install all dependencies: 

```bash
npm install
```

2. Add your Moesif Application Id to the `index.js`

Your Moesif Application Id can be found in the [_Moesif Portal_](https://www.moesif.com/).
After signing up for a Moesif account, your Moesif Application Id will be displayed during the onboarding steps. 

You can always find your Moesif Application Id at any time by logging 
into the [_Moesif Portal_](https://www.moesif.com/), click on the top right menu,
and then clicking _Installation_.

```javascript
var moesifOptions = {
  applicationId: 'your application id',
}
```

6. Run the example, it will listen on port 5000.

```bash
node index.js
```

7. Send some requests to some of the routes and verify that the API calls are captured in your Moesif account. 

```bash
curl http://localhost:5000
```

If you have the `node index.js` running, you can also run `npm test` to automatically trigger some API calls against the example server.
