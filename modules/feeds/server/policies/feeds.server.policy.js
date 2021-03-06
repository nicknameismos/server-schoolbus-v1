'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Feeds Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/feeds',
      permissions: '*'
    }, {
      resources: '/api/feeds/:feedId',
      permissions: '*'
    }, {
      resources: '/api/feedbyuser',
      permissions: '*'
    }, {
      resources: '/api/feeds/comment/:feedId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/feeds',
      permissions: ['get', 'post']
    }, {
      resources: '/api/feeds/:feedId',
      permissions: ['get', 'put']
    }, {
      resources: '/api/feedbyuser',
      permissions: ['get']
    }, {
      resources: '/api/feeds/comment/:feedId',
      permissions: ['put']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/feeds',
      permissions: ['get']
    }, {
      resources: '/api/feeds/:feedId',
      permissions: ['get', 'put']
    }, {
      resources: '/api/feedbyuser',
      permissions: ['get']
    }, {
      resources: '/api/feeds/comment/:feedId',
      permissions: ['put']
    }]
  }]);
};

/**
 * Check If Feeds Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Feed is being processed and the current user created it then allow any manipulation
  if (req.feed && req.user && req.feed.user && req.feed.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
