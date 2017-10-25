(function () {
  'use strict';

  // Feeds controller
  angular
    .module('feeds')
    .controller('FeedsController', FeedsController);

  FeedsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'feedResolve'];

  function FeedsController ($scope, $state, $window, Authentication, feed) {
    var vm = this;

    vm.authentication = Authentication;
    vm.feed = feed;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Feed
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.feed.$remove($state.go('feeds.list'));
      }
    }

    // Save Feed
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.feedForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.feed._id) {
        vm.feed.$update(successCallback, errorCallback);
      } else {
        vm.feed.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('feeds.view', {
          feedId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
