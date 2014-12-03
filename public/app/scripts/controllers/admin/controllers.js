/**
 * Created by aldo on 2/5/14.
 */
var admin = angular.module('control.admin.Controllers', []);

admin.controller('OrganizationsCtrl', [
         '$scope', '$log', '$rootScope', '$modal', 'growl', 'Session', 'AdminRestangular',

  function ($scope, $log, $rootScope, $modal, growl, Session, AdminRestangular ) {


  AdminRestangular.all('organizations').getList().then(function (organizations) {
    $scope.organizations = organizations;
  });

  // TODO - Delete Organization
  $scope.delete = function(organization) {
    organization.remove().then(function(response) {
      console.log(response);
      $scope.organizations = _.without($scope.organizations, organization);
      growl.addSuccessMessage(response.message, {ttl: 5000});
    }, function (response) {
      console.log(response);
      growl.addErrorMessage(response.data.message, {ttl: 5000});
    });
  };

  $scope.open = function (organization) {

    console.log(organization);
    if (organization === 'new') {
      $scope.newOrganization = true;
      $scope.organization = {
        organization: ''
        , organization_contact_name_first: ''
        , organization_contact_name_last: ''
        , organization_contact_email: ''
        , unit: ''
        , building: ''
        , street1: ''
        , street2: ''
        , city: ''
        , region: ''
        , country: ''
        , postal_code: ''
      };
    }
    else {
      $scope.newOrganization = false;
      $scope.organization = AdminRestangular.copy(organization);
    }

    var modalInstance = $modal.open({
      templateUrl: 'templates/views/admin/organizations/form.html',
      controller:  'OrgModalInstanceCtrl',
      dialogClass: 'modal dialog',
      resolve: {
        organization: function () {
          return $scope.organization;
        },
        newOrganization: function () {
          return $scope.newOrganization;
        },
        organizations: function () {
          return $scope.organizations;
        }
      }
    });

    modalInstance.result.then(function (organizations) {
      $scope.organizations = organizations;
      growl.addSuccessMessage('Organization has been saved.', {ttl: 5000});
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });

  }

}]);

var OrgModalInstanceCtrl = function ($scope
                                   , $http
                                   , $rootScope
                                   , $modalInstance
                                   , growl
                                   , AdminRestangular
                                   , organization
                                   , newOrganization
                                   , organizations
                                    ) {

  $scope.countries = [
    "Afghanistan", "Aland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola",
    "Anguilla", "Antarctica", "Antigua And Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
    "Bermuda", "Bhutan", "Bolivia, Plurinational State of", "Bonaire, Sint Eustatius and Saba", "Bosnia and Herzegovina",
    "Botswana", "Bouvet Island", "Brazil",
    "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia",
    "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China",
    "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo",
    "Congo, the Democratic Republic of the", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba",
    "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
    "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)",
    "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia",
    "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece",
    "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea",
    "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands", "Holy See (Vatican City State)",
    "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran, Islamic Republic of", "Iraq",
    "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya",
    "Kiribati", "Korea, Democratic People's Republic of", "Korea, Republic of", "Kuwait", "Kyrgyzstan",
    "Lao People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
    "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia, The Former Yugoslav Republic Of",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique",
    "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Moldova, Republic of",
    "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
    "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger",
    "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau",
    "Palestinian Territory, Occupied", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
    "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation",
    "Rwanda", "Saint Barthelemy", "Saint Helena, Ascension and Tristan da Cunha", "Saint Kitts and Nevis", "Saint Lucia",
    "Saint Martin (French Part)", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
    "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
    "Sint Maarten (Dutch Part)", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
    "South Georgia and the South Sandwich Islands", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
    "Svalbard and Jan Mayen", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic",
    "Taiwan, Province of China", "Tajikistan", "Tanzania, United Republic of", "Thailand", "Timor-Leste",
    "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
    "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
    "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu",
    "Venezuela, Bolivarian Republic of", "Viet Nam", "Virgin Islands, British", "Virgin Islands, U.S.",
    "Wallis and Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"
  ];

  $scope.submitted = false;
  $scope.container = {}; // https://github.com/angular-ui/bootstrap/issues/969
  $scope.container.organization = organization;
  $scope.container.newOrganization = newOrganization;

  $scope.orgForm = function() {
    if ($scope.container.org_form.$valid) {
      // Submit as normal
      if ($scope.container.organization._id === undefined) {
        organizations.post($scope.container.organization).then(function (response) {
          AdminRestangular.all('organizations').getList().then(function (organizations) {
            $modalInstance.close(organizations);
          });
        }, function (response) {
          console.log(response);
          growl.addErrorMessage('Could not create this organization.', {ttl: 10000});
        });
      } else { // Update
        organization.put().then(function (response) {
          AdminRestangular.all('organizations').getList().then(function (organizations) {
            $modalInstance.close(organizations);
          });
        }, function (response) {
          console.log(response);
          growl.addErrorMessage('Could not update this organization.', {ttl: 5000});
        });
      }
    } else {
      $scope.container.submitted = true;
    }
  };

  $scope.closeModal = function () {
    $modalInstance.dismiss('cancel');
  };

};

admin.controller('UsersCtrl', [
  '$scope', '$log', '$rootScope', '$modal', 'growl', 'Session', 'AdminRestangular',

  function ($scope, $log, $rootScope, $modal, growl, Session, AdminRestangular ) {


    AdminRestangular.all('users').getList().then(function (users) {
      $scope.users = users;
    });

    // TODO - Delete User
    $scope.delete = function(user) {
      user.remove().then(function(response) {
        console.log(response);
        $scope.users = _.without($scope.users, user);
        growl.addSuccessMessage(response.message, {ttl: 5000});
      }, function (response) {
        console.log(response);
        growl.addErrorMessage(response.data.message, {ttl: 5000});
      });
    };

    $scope.open = function (user) {

      console.log(user);
      if (user === 'new') {
        $scope.newUser = true;
        $scope.user = {
            user_contact_name_first: ''
          , user_contact_name_last: ''
          , user_contact_email: ''
          , user_password: ''
          , account_enable: ''
          , unit: ''
          , building: ''
          , street: ''
          , city: ''
          , region: ''
          , country: ''
          , postal_code: ''
        };
      }
      else {
        $scope.newUser = false;
        $scope.user = AdminRestangular.copy(user);
      }

      var modalInstance = $modal.open({
        templateUrl: 'templates/views/admin/users/form.html',
        controller:  'UserModalInstanceCtrl',
        dialogClass: 'modal dialog',
        resolve: {
          user: function () {
            return $scope.user;
          },
          newUser: function () {
            return $scope.newUser;
          },
          users: function () {
            return $scope.users;
          }
        }
      });

      modalInstance.result.then(function (users) {
        $scope.users = users;
        growl.addSuccessMessage('User has been saved.', {ttl: 5000});
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });

    }

  }]);

var UserModalInstanceCtrl = function ($scope
  , $rootScope
  , $modalInstance
  , growl
  , AdminRestangular
  , user
  , newUser
  , users
  ) {

  $scope.countries = [
    "Afghanistan", "Aland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola",
    "Anguilla", "Antarctica", "Antigua And Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
    "Bermuda", "Bhutan", "Bolivia, Plurinational State of", "Bonaire, Sint Eustatius and Saba", "Bosnia and Herzegovina",
    "Botswana", "Bouvet Island", "Brazil",
    "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia",
    "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China",
    "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo",
    "Congo, the Democratic Republic of the", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba",
    "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
    "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)",
    "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia",
    "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece",
    "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea",
    "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands", "Holy See (Vatican City State)",
    "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran, Islamic Republic of", "Iraq",
    "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya",
    "Kiribati", "Korea, Democratic People's Republic of", "Korea, Republic of", "Kuwait", "Kyrgyzstan",
    "Lao People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
    "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia, The Former Yugoslav Republic Of",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique",
    "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Moldova, Republic of",
    "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
    "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger",
    "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau",
    "Palestinian Territory, Occupied", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
    "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation",
    "Rwanda", "Saint Barthelemy", "Saint Helena, Ascension and Tristan da Cunha", "Saint Kitts and Nevis", "Saint Lucia",
    "Saint Martin (French Part)", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
    "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
    "Sint Maarten (Dutch Part)", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
    "South Georgia and the South Sandwich Islands", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
    "Svalbard and Jan Mayen", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic",
    "Taiwan, Province of China", "Tajikistan", "Tanzania, United Republic of", "Thailand", "Timor-Leste",
    "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
    "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
    "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu",
    "Venezuela, Bolivarian Republic of", "Viet Nam", "Virgin Islands, British", "Virgin Islands, U.S.",
    "Wallis and Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"
  ];

  $scope.enabled_options = [ true, false ];
  $scope.submitted = false;
  $scope.container = {}; // https://github.com/angular-ui/bootstrap/issues/969
  $scope.container.user = user;
  $scope.container.newUser = newUser;

  $scope.userForm = function() {
    if ($scope.container.user_form.$valid) {
      // Submit as normal
      if ($scope.container.user._id === undefined) {
        users.post($scope.container.user).then(function (response) {
          AdminRestangular.all('users').getList().then(function (users) {
            $modalInstance.close(users);
          });
        }, function (response) {
          console.log(response);
          growl.addErrorMessage('Could not create this user.', {ttl: 5000});
        });
      } else { // Update
        user.put().then(function (response) {
          AdminRestangular.all('users').getList().then(function (users) {
            $modalInstance.close(users);
          });
        }, function (response) {
          console.log(response);
          growl.addErrorMessage('Could not update this user.', {ttl: 5000});
        });
      }
    } else {
      $scope.container.submitted = true;
    }
  };

  $scope.closeModal = function () {
    $modalInstance.dismiss('cancel');
  };

};

