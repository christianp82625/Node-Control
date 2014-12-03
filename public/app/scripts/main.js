'use strict';

var control = angular.module('control',
  [
    'ngRoute'
    , 'Scope.safeApply'
    , 'uiSlider'
    , 'ui.keypress'
    , 'ui.select2'
    , '$strap.directives'
    , 'ngGrid'
    , 'joint'
    , 'ngProgressLite'
    , 'angular-growl'
    , 'ui.bootstrap'
    , 'restangular'
    , 'control.Controllers'
    , 'control.admin.Controllers'
    , 'control.Filters'
    , 'control.Directives'
    , 'control.admin.Directives'
    , 'control.Services'
    , 'control.admin.Services'
    , 'control.Routes'
  ]
);

