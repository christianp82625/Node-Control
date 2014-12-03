// Draw routes.  Locomotive's router provides expressive syntax for drawing
// routes, including support for resourceful routes, namespaces, and nesting.
// MVC routes can be mapped mapped to controllers using convenient
// `controller#action` shorthand.  Standard middleware in the form of
// `function(req, res, next)` is also fully supported.  Consult the Locomotive
// Guide on [routing](http://locomotivejs.org/guide/routing.html) for additional
// information.
module.exports = function routes() {
//  Session Routes
  this.match('/login', 'account#login', { via: ['POST'] });
  this.match('/logout', 'account#logout', { via: ['GET'] });

//  Account
  this.match('/checkuser', 'account#getUser', { via: 'GET' });

//  Query Routes
  this.match('/query', 'query#index', { via: ['GET'] });
  this.match('/query/agents/active', 'query#active', { via: ['GET'] });

//  Objects
  this.match('/', 'object#create', { via: ['POST'] });

//  Stats
  this.match('/application/stats', 'stat#index', { via: ['GET'] });

//  Graphite
  this.match('/render', 'graphite#render', { via: ['GET'] });
  this.match('/metrics/find', 'graphite#find', { via: ['GET'] });

  this.namespace('admin', function() {
    this.resources('organizations');
    this.resources('organization_licenses');
    this.resources('users');
    this.resources('user_organizations');
    this.match('/check/:field', 'helpers#check', { via: [ 'POST'] });
  });

}
