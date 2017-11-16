'use strict';

/**
 * Module dependencies
 */
var feedsPolicy = require('../policies/feeds.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  feeds = require('../controllers/feeds.server.controller');

module.exports = function (app) {
  // Feeds Routes
  app.route('/api/feeds')//.all(core.requiresLoginToken, feedsPolicy.isAllowed)
    .get(feeds.list);

  app.route('/api/feeds').all(core.requiresLoginToken, feedsPolicy.isAllowed)
    .post(feeds.create);

  app.route('/api/feeds/:feedId').all(core.requiresLoginToken, feedsPolicy.isAllowed)
    .get(feeds.read)
    .put(feeds.update)
    .delete(feeds.delete);

  app.route('/api/feedbyuser').all(core.requiresLoginToken, feedsPolicy.isAllowed)
    .get(feeds.getFeedByUser);

  app.route('/api/feeds/comment/:feedId')//.all(feedsPolicy.isAllowed)
    .put(feeds.updateComment);
    
  // Finish by binding the Feed middleware
  app.param('feedId', feeds.feedByID);
};
