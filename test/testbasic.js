var assert = require('assert');

var superagent = require('superagent');

var port = 5000;
var apiEndPoint = 'http://localhost:' + port;

var userIdHeader = 'my-user-id';
var companyIdHeader = 'my-company-id';

describe('Testing basic api call', function() {
  it('test updating a company profile for acme1', function() {
    return superagent
      .post(apiEndPoint + '/api/companies/acme1')
      .send({ company_domain: 'acme1.com', num_employees: 2000, category: 'space' });
  });

  it('test updating a company profile for acme2', function() {
    return superagent
    .post(apiEndPoint + '/api/companies/acme2')
    .send({ company_domain: 'acme2.com', num_employees: 220, category: 'earth' });
  });

  it('tests updating a user profile for u01', function() {
    return superagent
      .post(apiEndPoint + '/api/users/u01')
      .send({ email: 'joe+1@acme1.com', name: 'joe 1' })
      .then(() => {});
  });

  it('tests updating a user profile for u02', function() {
    return superagent
      .post(apiEndPoint + '/api/users/u02')
      .send({ email: 'steve+2@acme1.com', name: 'stev3', first_name: 'blah', lastName: 'hello' })
      .then(() => {});
  });


  it('test updating a user profile for u03', function() {
    return superagent
      .post(apiEndPoint + '/api/users/u03')
      .send({ email: 'alice+3@acme1.com', name: 'alice 1', p1: 'one', p2: 'two' });
  });

  it('test with basic json get with user u03', function() {
    return superagent
      .get(apiEndPoint + '/api')
      .set(userIdHeader, 'u03')
      .set(companyIdHeader, 'acme2')
      .then(() => {});
  });

  it('test with a large post with user u01', function() {
    return superagent
      .post(apiEndPoint + '/api/large')
      .set(userIdHeader, 'u01')
      .set(companyIdHeader, 'acme1')
      .send({ foo: 'bar' })
      .then(() => {});
  });


  it('test with basic json get with user u01', function() {
    return superagent
      .get(apiEndPoint + '/api')
      .set(userIdHeader, 'u01')
      .set(companyIdHeader, 'acme1')
      .then(() => {});
  });

  it('test with basic json get with user u02', function() {
    return superagent
      .get(apiEndPoint + '/api')
      .set(userIdHeader, 'u02')
      .set(companyIdHeader, 'acme1')
      .then(() => {});
  });

  it('test with proxy get with user u02', function() {
    return superagent
      .get(apiEndPoint + '/proxy/posts/1')
      .set(userIdHeader, 'u02')
      .set(companyIdHeader, 'acme1')
      .then(() => {});
  });
});
