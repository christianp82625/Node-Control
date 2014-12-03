/**
 * Created by aldo on 1/17/14.
 */
module.exports = httpBackendMock = function() {
  angular.module('httpBackendMock', ['ngMockE2E', 'control'])
    .run(function($httpBackend) {
      var authenticated = false;
      var currentUser = {
        username: 'paulsop@redwolfsecurity.com'
      };

      $httpBackend.whenGET('/api/auth').respond(function(method, url, data, headers) {
        return authenticated ? [200, currentUser, {}] : [401, {}, {}];
      });

      $httpBackend.whenPOST('/api/auth').respond(function(method, url, data, headers) {
        authenticated = true;
        return [200, currentUser, {}];
      });

      $httpBackend.whenDELETE('/api/auth').respond(function(method, url, data, headers) {
        authenticated = false;
        return [204, {}, {}];
      });

      $httpBackend.whenGET(/.*/).passThrough();
    })
};