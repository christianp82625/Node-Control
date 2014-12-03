/**
 * Created by aldo on 1/14/14.
 */
'use strict';

var LoginPage = function() {
  this.usernameInput = element(by.model('user.username'));
  this.passwordInput = element(by.model('user.password'));

  this.get = function() {
    browser.get('/#/login');
  };

  this.setUsername = function(name) {
    this.usernameInput.sendKeys(name);
  };

  this.setPassword = function(pass) {
    this.passwordInput.sendKeys(pass);
  };
};

describe('login page', function() {

  it('should show up login view', function() {
    var loginPage = new LoginPage();
    loginPage.get();

    browser.findElements(by.model('user.username')).then(function(arr){
      expect(arr.length).toEqual(1);
    });
  });

  it('should get login success', function() {
    var loginPage = new LoginPage();
    loginPage.get();

    loginPage.setUsername('paulsop@redwolfsecurity.com');
    loginPage.setPassword('alduro');

    browser.findElement(by.css('.btn.btn-primary')).then(function(btn){
      btn.click();
    });

    // Login Ok and next view shows Menu of 12 options.
    element.all(by.css('ul[ng-show="loggedIn"] li')).then(function(arr) {
      expect(arr.length).toEqual(12);
    });

  });

  it('should fail with bad credentials', function() {
    var loginPage = new LoginPage();
    loginPage.get();

    loginPage.setUsername('paulsop@redwolfsecurity.com');
    loginPage.setPassword('badpass');

    browser.findElement(by.css('.btn.btn-primary')).then(function(btn){
      btn.click().then(function () {
        // Bad Login. It will show error message.
        element(by.css('.alert.alert-danger span strong')).getText().then(function(message) {
          expect(message).toEqual('Invalid email or password.');
        });
      });
    });


  });

});

//  it('should get login success', function() {
//
//      $httpBackend.expect('POST', 'http://localhost:3002/login')
//        .respond(200, "{ success : 'true', message: 'Welcome to Redwolf Security dashboard.', user: { id: 1, user_contact_email: 'paulsop@redwolfsecurity.com' }");
//
//      session.login('paulsop@redwolfsecurity.com', 'alduro')
//        .then(function(data) {
//          expect(data.success).toBeTruthy();
//        });
//
//      $httpBackend.flush();
//
//  });
