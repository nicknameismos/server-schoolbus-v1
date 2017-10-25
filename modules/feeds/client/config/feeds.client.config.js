(function () {
  'use strict';

  angular
    .module('feeds')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Feeds',
      state: 'feeds',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'feeds', {
      title: 'List Feeds',
      state: 'feeds.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'feeds', {
      title: 'Create Feed',
      state: 'feeds.create',
      roles: ['user']
    });
  }
}());
