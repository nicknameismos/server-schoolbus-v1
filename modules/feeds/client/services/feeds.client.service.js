// Feeds service used to communicate Feeds REST endpoints
(function () {
  'use strict';

  angular
    .module('feeds')
    .factory('FeedsService', FeedsService);

  FeedsService.$inject = ['$resource'];

  function FeedsService($resource) {
    return $resource('api/feeds/:feedId', {
      feedId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
