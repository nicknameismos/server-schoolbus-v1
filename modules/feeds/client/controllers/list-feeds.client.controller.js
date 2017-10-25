(function () {
  'use strict';

  angular
    .module('feeds')
    .controller('FeedsListController', FeedsListController);

  FeedsListController.$inject = ['FeedsService'];

  function FeedsListController(FeedsService) {
    var vm = this;

    vm.feeds = FeedsService.query();
  }
}());
