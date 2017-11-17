'use strict';

/**
 * Module dependencies
 */
var ordersPolicy = require('../policies/orders.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  orders = require('../controllers/orders.server.controller');

module.exports = function (app) {
  // Orders Routes

  app.route('/api/orders') //.all(core.requiresLoginToken, ordersPolicy.isAllowed)
    .get(orders.list);

  app.route('/api/orders').all(core.requiresLoginToken, ordersPolicy.isAllowed)
    .post(orders.create);

  app.route('/api/orders/:orderId').all(core.requiresLoginToken, ordersPolicy.isAllowed)
    .get(orders.read)
    .put(orders.update)
    .delete(orders.delete);

  // Finish by binding the Order middleware
  app.param('orderId', orders.orderByID);
};
