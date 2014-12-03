/**
 * Created by aldo on 4/1/14.
 */

var admin_directives = angular.module('control.admin.Directives', []);

admin_directives.directive('ensureUnique', function($http) {
  return {
    require: 'ngModel',
    link: function(scope, ele, attrs, c) {
      if (scope.container.newOrganization) {
        scope.$watch(attrs.ngModel, function() {
          $http({
            method: 'POST',
            url: '/admin/check/' + attrs.ensureUnique,
            data: { 'value': scope.$eval(attrs.ngModel) }
          }).success(function(data,status,headers,cfg) {
            c.$setValidity('unique', data.isUnique);
          }).error(function(data,status,headers,cfg) {
            c.$setValidity('unique', false);
          });
        });
      } else { // Editing - only check if values are different because email already exist.
        scope.$watch(attrs.ngModel, function(newValue, oldValue) {
          if ( newValue !== oldValue ) {
            $http({
              method: 'POST',
              url: '/admin/check/' + attrs.ensureUnique,
              data: { 'value': scope.$eval(attrs.ngModel) }
            }).success(function(data,status,headers,cfg) {
              c.$setValidity('unique', data.isUnique);
            }).error(function(data,status,headers,cfg) {
              c.$setValidity('unique', false);
            });
          }
        });
      }
    }
  }
});

/**
 * A generic confirmation for risky actions.
 * Usage: Add attributes: ng-really-message="Are you sure"? ng-really-click="takeAction()" function
 */
admin_directives.directive('ngReallyClick', [function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('click', function() {
        var message = attrs.ngReallyMessage;
        if (message && confirm(message)) {
          scope.$apply(attrs.ngReallyClick);
        }
      });
    }
  }
}]);