/**
 * Created by aldo on 1/3/14.
 */
'use strict';

var filters = angular.module('control.Filters', []);

filters.filter('evalCommand', [ 'Commands', 'Agents', function(Commands, Agents) {
    return function (line) {
      try {
        return eval(line);
      } catch (e) {
        if (e instanceof SyntaxError) {
          return e.message;
        }
      }
      return ""
    }
  }]);

filters.filter('pluck', function() {
    return function(array, key, shallow) {
      return _.chain(array).pluck(key).flatten(shallow !== false).value();
    }
  });

filters.filter('reverse', [ 'Commands', function (Commands) {
    return function (text) {
      return text.split("").reverse().join("")+" ";
    }
  }]);

filters.filter('sort', function() {

    // angular's orderBy can't accept an array index as its parameter
    return function(array, key) {
      return _.sortBy(array,function(el) { return _.result(el,key) })
    }

  });

filters.filter('tometric', function () {
    return function(text) {
      return text.replace(/\./g, "_")
    }
  });

filters.filter('uniq', function() {
    return function(array, key, isSorted) {
      return _.uniq(array, isSorted, function(el) { return _.result(el,key) });
    }
  });





