(function () {
  'use strict';

  angular
    .module('feeds')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('feeds', {
        abstract: true,
        url: '/feeds',
        template: '<ui-view/>'
      })
      .state('feeds.list', {
        url: '',
        templateUrl: 'modules/feeds/client/views/list-feeds.client.view.html',
        controller: 'FeedsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Feeds List'
        }
      })
      .state('feeds.create', {
        url: '/create',
        templateUrl: 'modules/feeds/client/views/form-feed.client.view.html',
        controller: 'FeedsController',
        controllerAs: 'vm',
        resolve: {
          feedResolve: newFeed
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Feeds Create'
        }
      })
      .state('feeds.edit', {
        url: '/:feedId/edit',
        templateUrl: 'modules/feeds/client/views/form-feed.client.view.html',
        controller: 'FeedsController',
        controllerAs: 'vm',
        resolve: {
          feedResolve: getFeed
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Feed {{ feedResolve.name }}'
        }
      })
      .state('feeds.view', {
        url: '/:feedId',
        templateUrl: 'modules/feeds/client/views/view-feed.client.view.html',
        controller: 'FeedsController',
        controllerAs: 'vm',
        resolve: {
          feedResolve: getFeed
        },
        data: {
          pageTitle: 'Feed {{ feedResolve.name }}'
        }
      });
  }

  getFeed.$inject = ['$stateParams', 'FeedsService'];

  function getFeed($stateParams, FeedsService) {
    return FeedsService.get({
      feedId: $stateParams.feedId
    }).$promise;
  }

  newFeed.$inject = ['FeedsService'];

  function newFeed(FeedsService) {
    return new FeedsService();
  }
}());
