/**
 * Created by aldo on 12/20/13.
 */
var mongoose = require("mongoose")
  , Factory = require('factory-lady')
  , User    = require('../../app/models/user')
  , user_fixture = require('../fixtures/user')
  , Organization = require("../../app/models/organization")
  , org_fixture = require('../fixtures/organization')
  , OrganizationLicense = require("../../app/models/organization_license")
  , org_lic_fixture = require('../fixtures/organization_license')
  , UserOrganization = require("../../app/models/user_organization")
  , user_org_fixture = require('../fixtures/user_organization')
  , moment = require('moment');

mongoose.connect('mongodb://localhost/control_test');

describe("Users", function() {

  before(function (done) {
    User.remove({}, function() {
      done();
    })
  });

  beforeEach(function(done){
    Factory.define('user', User, user_fixture.user_enabled);
    done();
  });

  afterEach(function(done){
    User.remove({}, function() {
      done();
    });
  });

  it("creates a new one", function(done){

    Factory.build('user', function(user) {
      user.user_password_sha256 = User.encryptPassword(user_fixture.user_enabled.password);

      user.save(function(err) {
        if (err) {
          done(err)
        }
        user.user_contact_email.should.equal("aldo+1@satio.com.ar");
        user.user_password_sha256.should.not.equal("alduro");
        done();
      });
    });

  });

  it("authenticates and returns user with valid login", function(done) {

    Factory.build('user', function(user) {
      user.user_password_sha256 = User.encryptPassword(user_fixture.user_enabled.password);

      user.save(function(err) {
        if (err) {
          done(err)
        }
        if (user.authenticate(user_fixture.user_enabled.password)) {
          user.user_contact_email.should.equal("aldo+1@satio.com.ar");
          done();
        };
      });
    });

  });

  it("authenticates and returns fail with invalid login", function(done) {

    Factory.build('user', function(user) {
      user.user_password_sha256 = User.encryptPassword(user_fixture.user_enabled.password);

      user.save(function(err) {
        if (err) {
          done(err)
        }
        if(!user.authenticate("liar")) {
          done();
        };
      });
    });

  });

});

describe("User account status", function() {

  before(function (done) {
    User.remove({}, function() {
      done();
    })
  });

  beforeEach(function(done){
    Factory.define('user', User, user_fixture.user_disabled);
    done();
  });

  afterEach(function(done){
    User.remove({}, function() {
      done();
    });
  });


//  it('should reject access when license does not start yet', function(done) {
//    var today = Math.round(moment()/1000);
//
//    user.create("Redwolf Security"
//      , "Aldo"
//      , "Nievas"
//      , "aldo+1@satio.com.ar"
//      , "alduro"
//      , Math.round(moment().add('days', 1)/1000) // License starts in 1 day
//      , Math.round(moment().add('days', 5)/1000) // License ends in 6 days
//      , true  // Account enabled
//      , function(created_user) { // Success callback
//        created_user.license_start_epoch_s.should.be.above(today);
//        done();
//      }, function(error) { // Error callback
//        done(error);
//      });
//
//  });
//
//  it('should accept access when license has started already', function(done) {
//    var today = Math.round(moment()/1000);
//
//    user.create("Redwolf Security"
//      , "Aldo"
//      , "Nievas"
//      , "aldo+1@satio.com.ar"
//      , "alduro"
//      , Math.round(moment().add('days', -1)/1000) // License starts in 1 day
//      , Math.round(moment().add('days', 5)/1000) // License ends in 6 days
//      , true  // Account enabled
//      , function(created_user) { // Success callback
//        created_user.license_start_epoch_s.should.be.below(today);
//        done();
//      }, function(error) { // Error callback
//        done(error);
//      });
//
//  });
//
//  it('should reject access when license expired', function(done) {
//    var today = Math.round(moment()/1000);
//
//    user.create("Redwolf Security"
//      , "Aldo"
//      , "Nievas"
//      , "aldo+1@satio.com.ar"
//      , "alduro"
//      , Math.round(moment().add('days', -10)/1000) // License started 10 days ago
//      , Math.round(moment().add('days', -5)/1000) // License ended 5 days ago
//      , true  // Account enabled
//      , function(created_user) { // Success callback
//        created_user.license_start_epoch_s.should.be.below(today);
//        done();
//      }, function(error) { // Error callback
//        done(error);
//      });
//
//  });

  it('should reject access when account is disabled', function(done) {

    Factory.build('user', function(user) {
      user.user_password_sha256 = User.encryptPassword(user_fixture.user_enabled.password);

      user.save(function(err) {
        if (err) {
          done(err)
        }
        user.account_enable.should.be.false;
        done();
      });
    });

  });

});

// *************** Organizations **********************************************//
describe("Organizations", function(){

  before(function (done) {
    Organization.remove({}, function() {
      done();
    })
  });

  beforeEach(function(done){
    Factory.define('organization', Organization, org_fixture.org1);
    done();
  });

  afterEach(function(done){
    Organization.remove({}, function() {
      done();
    });
  });

  it("creates a new organization", function(done) {

    Factory.create('organization', function (organization) {
      organization.organization_contact_email.should.equal("aldo+1@satio.com.ar");
      organization.organization.should.equal("Redwolf Security");
      done();
    });

  });

  it('should reject creation. Name is required.', function(done) {

    Factory.build('organization', { organization: ''}, function (organization) {
      organization.save(function(err) {
        if (err) {
          err.errors.organization.message.should.equal("Organization is required");
          done();
        }
      });
    });

  });

  it('should reject creation. Contact First Name is required.', function(done) {

    Factory.build('organization', { organization_contact_name_first: ''}, function (organization) {
      organization.save(function(err) {
        if (err) {
          err.errors.organization_contact_name_first.message.should.equal("Contact First Name is required");
          done();
        }
      });
    });

  });

  it('should reject creation. Contact Last Name is required.', function(done) {

    Factory.build('organization', { organization_contact_name_last: ''}, function (organization) {
      organization.save(function(err) {
        if (err) {
          err.errors.organization_contact_name_last.message.should.equal("Contact Last Name is required");
          done();
        }
      });
    });

  });

  it('should reject creation. Contact Email is required.', function(done) {

    Factory.build('organization', { organization_contact_email: ''}, function (organization) {
      organization.save(function(err) {
        if (err) {
          err.errors.organization_contact_email.message.should.equal("Contact Email is required");
          done();
        }
      });
    });

  });

});

// *************** Organizations **********************************************//
describe("Organization Licenses", function(){

  before(function (done) {
    Organization.remove({}, function() {
      OrganizationLicense.remove({}, function () {
        done();
      })
    })
  });

  beforeEach(function(done){
    Factory.define('organization', Organization, org_fixture.org1);
    Factory.define('activeOrgLicense', OrganizationLicense, org_lic_fixture.orgLic_active);
    Factory.define('orgLicInvalid', OrganizationLicense, org_lic_fixture.orgLic_invalid);
    done();
  });

  afterEach(function(done){
    Organization.remove({}, function() {
      OrganizationLicense.remove({}, function () {
        done();
      })
    });
  });

  it("creates a new one", function(done) {

    Factory.create('organization', function (organization) {
      Factory.build('activeOrgLicense', { organization_oid: organization._id }, function (orgLic) {
        orgLic.save(function (err) {
          if (err) {
            done(err);
          }
          orgLic.organization_name.should.equal("Redwolf Security");
          orgLic.license_enabled.should.equal(true);
          orgLic.organization_oid.should.equal(organization._id);
          done();
        });
      });
    });

  });

  it("should reject creation without name", function(done) {

    Factory.create('organization', function (organization) {
      Factory.build('activeOrgLicense', { organization_oid: organization._id, organization_name: '' }, function (orgLic) {
        orgLic.save(function (err) {
          if (err) {
            err.errors.organization_name.message.should.equal("Organization Name is required");
            done();
          }
        });
      });
    });

  });

  it("should reject creation without organization reference", function(done) {

    Factory.create('organization', function (organization) {
      Factory.build('activeOrgLicense', function (orgLic) {
        orgLic.save(function (err) {
          if (err) {
            err.errors.organization_oid.message.should.equal("Organization Ref is required");
            done();
          }
        });
      });
    });

  });

  it("should reject creation when license_start_epoch_s is greater than license_end_epoch_s", function(done) {

    Factory.create('organization', function (organization) {
      Factory.build('orgLicInvalid', { organization_oid: organization._id }, function (orgLic) {
          orgLic.save(function (err) {
            if (err) {
              err.should.eql(new Error("License start should be minor than License end."));
              done();
            }
          });
      });
    });

  });


  describe("Finding Organization Licenses", function(){

    beforeEach(function(done){
      Organization.remove({}, function() {
        OrganizationLicense.remove({}, function () {
          Factory.define('organization', Organization, org_fixture.org1);
          Factory.define('activeOrgLicense', OrganizationLicense, org_lic_fixture.orgLic_active);
          Factory.define('notStartedOrgLicense', OrganizationLicense, org_lic_fixture.orgLic_notstarted);
          done();
        });
      });
    });

    afterEach(function(done){
      Organization.remove({}, function() {
        OrganizationLicense.remove({}, function () {
          done();
        })
      });
    });

    it("finds an Organization License by Id and Organization is populated.", function(done) {

      Factory.create('organization', function (organization) {
        Factory.build('activeOrgLicense', { organization_oid: organization._id }, function (actOrgLic) {
          actOrgLic.save(function (err) {
            if (err) {
              done(err);
            }
            OrganizationLicense.load(actOrgLic._id, function (err, orgLic) {
              orgLic.organization_name.should.equal('Redwolf Security');
              orgLic.organization_oid.organization.should.equal('Redwolf Security');
              orgLic.organization_oid.organization_contact_email.should.equal('aldo+1@satio.com.ar');
              done();
            });
          });
        });
      });

    });

    it("finds an active Organization License.", function(done) {
      this.timeout(30000);

      Factory.create('organization', function (organization) {
        Factory.build('activeOrgLicense', { organization_oid: organization._id }, function (actOrgLic) {
          actOrgLic.save(function (err) {
            if (err) {
              done(err);
            }
            Factory.build('notStartedOrgLicense', { organization_oid: organization._id }, function (notStartedOrgLic) {
              notStartedOrgLic.save(function (err) {
                if (err) {
                  done(err);
                }
                Organization.hasActiveLicense(organization._id.toString(), function (err, results) {
                  if (err) {
                    done(err);
                  }
                  results[0]._id.toString().should.equal(actOrgLic._id.toString());
                  results[0].organization_name.should.equal('Redwolf Security');
                  results[0].organization_oid.organization_contact_email.should.equal('aldo+1@satio.com.ar');
                  done();
                })
              })
            });
          });
        });
      })

    });
  });

});

describe("User Organization", function() {

  beforeEach(function(done){
    Organization.remove({}, function() {
      User.remove({}, function () {
        UserOrganization.remove({}, function () {
          Factory.define('organization', Organization, org_fixture.org1);
          Factory.define('userEnabled', User, user_fixture.user_enabled);
          Factory.define('userOrganization', UserOrganization, user_org_fixture.userOrg);
          done();
        });
      })
    });
  });

  afterEach(function(done){
    Organization.remove({}, function() {
      User.remove({}, function () {
        UserOrganization.remove({}, function () {
          done();
        });
      })
    });
  });

  it("creates a new one", function(done) {

    Factory.create('organization', function (organization) {
      Factory.build('userEnabled', function(user) {
        user.user_password_sha256 = User.encryptPassword(user_fixture.user_enabled.password);

        user.save(function(err) {
          if (err) {
            done(err)
          }
          Factory.build('userOrganization', { organization_oid: organization._id
                                          , organization_name: organization.organization
                                          , user_contact_email: user.user_contact_email
                                          , user_oid: user._id }
          , function (userOrg) {
            userOrg.save(function (err) {
              if (err) {
                done(err);
              }
              userOrg.organization_name.should.equal(organization.organization);
              userOrg.user_contact_email.should.equal(user.user_contact_email);
              userOrg.organization_oid.toString().should.equal(organization._id.toString());
              userOrg.user_oid.toString().should.equal(user._id.toString());
              userOrg.activeRoles().should.be.an.Array;
              userOrg.activeRoles()[0].should.have.property('role', 'site_administrator');
              userOrg.activeRoles()[0].should.have.property('hasRole', true);
//              userOrg.findRole('organization_administrator').should.be.an.Array;
              userOrg.findRole('organization_administrator').should.have.property('role', 'organization_administrator');
              userOrg.findRole('organization_administrator').should.have.property('hasRole', false);
              done();
            }); // userOrg.save
          }); // Factory userOrganization
        }); // user.save
      })
    });

  });

  it("should reject creation without organization name", function(done) {

    Factory.create('organization', function (organization) {
      Factory.build('user', function(user) {
        user.user_password_sha256 = User.encryptPassword(user_fixture.user_enabled.password);

        user.save(function(err) {
          if (err) {
            done(err)
          }
          Factory.build('userOrganization', { organization_oid: organization._id
              , organization_name: ''
              , user_contact_email: user.user_contact_email
              , user: user._id }
            , function (userOrg) {
              userOrg.save(function (err) {

                if (err) {
                  err.errors.organization_name.message.should.equal("Organization Name is required");
                  done();
                }
              });
          });
        });
      });
    });

  });

  it("should reject creation without user email", function(done) {

    Factory.create('organization', function (organization) {
      Factory.build('user', function(user) {
        user.user_password_sha256 = User.encryptPassword(user_fixture.user_enabled.password);

        user.save(function(err) {
          if (err) {
            done(err)
          }
          Factory.build('userOrganization', { organization_oid: organization._id
              , organization_name: organization.organization
              , user_contact_email: ''
              , user: user._id }
            , function (userOrg) {
              userOrg.save(function (err) {

                if (err) {
                  err.errors.user_contact_email.message.should.equal("User Email is required");
                  done();
                }
              });
            });
        });
      });
    });

  });
});

describe("Create a user that belongs to an Organization", function() {

  beforeEach(function(done){
    Organization.remove({}, function() {
      OrganizationLicense.remove({}, function () {
        User.remove({}, function () {
          UserOrganization.remove({}, function () {
            Factory.define('organization', Organization, org_fixture.org1);
            Factory.define('activeOrgLicense', OrganizationLicense, org_lic_fixture.orgLic_active);
            Factory.define('expiredOrgLicense', OrganizationLicense, org_lic_fixture.orgLic_expired);
            Factory.define('userEnabled', User, user_fixture.user_enabled);
            Factory.define('userOrganization', UserOrganization, user_org_fixture.userOrg);
            done();
          });
        });
      });
    });
  });

  afterEach(function(done){
    Organization.remove({}, function() {
      OrganizationLicense.remove({}, function() {
        User.remove({}, function () {
          UserOrganization.remove({}, function () {
            done();
          });
        });
      });
    });
  });

  it("with Active License", function(done) {

    Factory.create('organization', function (organization) {
      Factory.build('user', function(user) {
        user.user_password_sha256 = User.encryptPassword(user_fixture.user_enabled.password);

        user.save(function(err) {
          if (err) {
            done(err)
          }
          Factory.build('activeOrgLicense', { organization_oid: organization._id, organization_name: organization.organization }, function (orgLic) {
            orgLic.save(function (err) {
              if (err) {
                done(err);
              }
              Factory.build('userOrganization', { organization_oid: organization._id
                  , organization_name: organization.organization
                  , user_contact_email: user.user_contact_email
                  , user_oid: user._id }
                , function (userOrg) {
                  userOrg.save(function (err) {
                    if (err) {
                      done(err);
                    }
                    Organization.hasActiveLicense(userOrg.organization_oid.toString(), function (err, orgLic) {
                      if (err) done(err);
                    })
                    if (user.authenticate(user_fixture.user_enabled.password) && orgLic) {
                      user.user_contact_email.should.equal("aldo@satio.com.ar");
                      done();
                    };
                  }); // userOrg.save
                }); // Factory userOrganization
              });
            });
        }); // user.save
      })
    });

  });

  it("with inactive License", function(done) {

    Factory.create('organization', function (organization) {
      Factory.build('user', function(user) {
        user.user_password_sha256 = User.encryptPassword(user_fixture.user_enabled.password);

        user.save(function(err) {
          if (err) {
            done(err)
          }
          Factory.build('expiredOrgLicense', { organization_oid: organization._id, organization_name: organization.organization }, function (orgLic) {
            orgLic.save(function (err) {
              if (err) {
                done(err);
              }
              Factory.build('userOrganization', { organization_oid: organization._id
                  , organization_name: organization.organization
                  , user_contact_email: user.user_contact_email
                  , user_oid: user._id }
                , function (userOrg) {
                  userOrg.save(function (err) {
                    if (err) {
                      done(err);
                    }
                    // NO active license - Authentication shouldn't pass
                   Organization.hasActiveLicense(userOrg.organization, function (err, orgLic) {
                      if (err) done(err);
                      if (user.authenticate(user_fixture.user_enabled.password) && orgLic) {
                        user.user_contact_email.should.equal("aldo@satio.com.ar");
                      }
                      orgLic.should.eql([]);
                      done();
                    });
                  }); // userOrg.save
                }); // Factory userOrganization
            });
          });
        }); // user.save
      })
    });

  });

});