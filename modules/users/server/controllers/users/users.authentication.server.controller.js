'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  passport = require('passport'),
  jwt = require('jsonwebtoken'),
  User = mongoose.model('User');

var secret = 'keepitquiet';

// URLs for which user can't be redirected on signin
var noReturnUrls = [
  '/authentication/signin',
  '/authentication/signup'
];

/**
 * Signup
 */
exports.signup = function (req, res) {
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  // Init Variables
  var user = new User(req.body);
  var message = null;

  var tokenPayload = {
    username: user.username,
    loginExpires: user.loginExpires
  };

  // Add missing user fields
  user.provider = 'local';
  user.displayName = user.firstName + ' ' + user.lastName;
  user.loginToken = jwt.sign(tokenPayload, secret);
  user.loginExpires = Date.now() + (2 * 60 * 60 * 1000); // 2 hours

  // Then save the user
  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorTH(errorHandler.getErrorMessage(err))
      });
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function (err, resp) {
        if (err) {
          res.status(400).send(err);
          message: errorTH(errorHandler.getErrorMessage(err))
        } else {
          res.json(user);
        }
      });
    }
  });
};

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err || !user) {
      res.status(400).send(info);
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      });
    }
  })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function (req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * OAuth provider call
 */
exports.oauthCall = function (strategy, scope) {
  return function (req, res, next) {
    // Set redirection path on session.
    // Do not redirect to a signin or signup page
    if (noReturnUrls.indexOf(req.query.redirect_to) === -1) {
      req.session.redirect_to = req.query.redirect_to;
    }
    // Authenticate
    passport.authenticate(strategy, scope)(req, res, next);
  };
};

/**
 * OAuth callback
 */
exports.oauthCallback = function (strategy) {
  return function (req, res, next) {
    // Pop redirect URL from session
    var sessionRedirectURL = req.session.redirect_to;
    delete req.session.redirect_to;

    passport.authenticate(strategy, function (err, user, redirectURL) {
      if (err) {
        return res.redirect('/authentication/signin?err=' + encodeURIComponent(errorHandler.getErrorMessage(err)));
      }
      if (!user) {
        return res.redirect('/authentication/signin');
      }
      req.login(user, function (err) {
        if (err) {
          return res.redirect('/authentication/signin');
        }

        return res.redirect(redirectURL || sessionRedirectURL || '/');
      });
    })(req, res, next);
  };
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function (req, providerUserProfile, done) {
  if (!req.user) {
    // Define a search query fields
    var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
    var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

    // Define main provider search query
    var mainProviderSearchQuery = {};
    mainProviderSearchQuery.provider = providerUserProfile.provider;
    mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define additional provider search query
    var additionalProviderSearchQuery = {};
    additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define a search query to find existing user with current provider profile
    var searchQuery = {
      $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
    };

    User.findOne(searchQuery, function (err, user) {
      if (err) {
        return done(err);
      } else {
        if (!user) {
          var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

          User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
            user = new User({
              firstName: providerUserProfile.firstName,
              lastName: providerUserProfile.lastName,
              username: availableUsername,
              displayName: providerUserProfile.displayName,
              email: providerUserProfile.email,
              profileImageURL: providerUserProfile.profileImageURL,
              provider: providerUserProfile.provider,
              providerData: providerUserProfile.providerData
            });

            // And save the user
            user.save(function (err) {
              return done(err, user);
            });
          });
        } else {
          return done(err, user);
        }
      }
    });
  } else {
    // User is already logged in, join the provider data to the existing user
    var user = req.user;

    // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
    if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
      // Add the provider data to the additional provider data field
      if (!user.additionalProvidersData) {
        user.additionalProvidersData = {};
      }

      user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

      // Then tell mongoose that we've updated the additionalProvidersData field
      user.markModified('additionalProvidersData');

      // And save the user
      user.save(function (err) {
        return done(err, user, '/settings/accounts');
      });
    } else {
      return done(new Error('User is already connected using this provider'), user);
    }
  }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function (req, res, next) {
  var user = req.user;
  var provider = req.query.provider;

  if (!user) {
    return res.status(401).json({
      message: 'User is not authenticated'
    });
  } else if (!provider) {
    return res.status(400).send();
  }

  // Delete the additional provider
  if (user.additionalProvidersData[provider]) {
    delete user.additionalProvidersData[provider];

    // Then tell mongoose that we've updated the additionalProvidersData field
    user.markModified('additionalProvidersData');
  }

  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.login(user, function (err) {
        if (err) {
          return res.status(400).send(err);
        } else {
          return res.json(user);
        }
      });
    }
  });
};


function errorTH(err) {
  if (err.toString() === '11000 duplicate key error collection: mean-test.users index: phone already exists' || err.toString() === 'mean-test.users index: phone already exists' || err.toString() === 'Phone already exists') {
    return 'เบอร์โทรศัพท์นี้ถูกใช้แล้ว';
  } else if ((err.toString() === '11000 duplicate key error collection: mean-test.users index: username already exists' || err.toString() === 'mean-test.users index: username already exists' || err.toString() === 'Username already exists')) {
    return 'ชื่อบัญชีนี้ถูกใช้แล้ว';
  } else if ((err.toString() === '11000 duplicate key error collection: mean-test.users index: email already exists' || err.toString() === 'mean-test.users index: email already exists' || err.toString() === 'Email already exists')) {
    return 'อีเมล์นี้ถูกใช้แล้ว';
  } else if ((err.toString() === 'The password must be at least 10 characters long.')) {
    return 'รหัสผ่านต้องมีอย่างน้อย10ตัวอักษร';
  } else if ((err.toString() === 'The password must contain at least one special character.')) {
    return 'รหัสผ่านต้องมีอักขระอย่างน้อย 1 ตัว @, #, $';
  } else if ((err.toString() === 'The password may not contain sequences of three or more repeated characters.')) {
    return 'รหัสผ่านต้องไม่เรียงซ้ำกันเกิน 3 ตัวขึ้นไป';
  } else if ((err.toString() === 'The password must contain at least one uppercase letter.')) {
    return 'รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว';
  } else if ((err.toString() === 'The password must contain at least one lowercase letter.')) {
    return 'รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว';
  } else if ((err.toString() === 'The password must be at least 10 characters long. The password must contain at least one uppercase letter. The password must contain at least one number. The password must contain at least one special character.')) {
    return 'รหัสผ่านต้องมีความยาวอย่างน้อย 10 ตัว, รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อยหนึ่งตัว, รหัสผ่านต้องมีอย่างน้อยหนึ่งหมายเลข, รหัสผ่านต้องมีอักขระพิเศษอย่างน้อยหนึ่งอักขระ';
  } else if ((err.toString() === 'The password must be at least 10 characters long. The password must contain at least one lowercase letter. The password must contain at least one number. The password must contain at least one special character.')) {
    return 'รหัสผ่านต้องมีความยาวอย่างน้อย 10 ตัว, รหัสผ่านต้องมีอักษรตัวพิมพ์เล็กอย่างน้อยหนึ่งตัว, รหัสผ่านต้องมีอย่างน้อยหนึ่งหมายเลข, รหัสผ่านต้องมีอักขระพิเศษอย่างน้อยหนึ่งอักขระ';
  } else if ((err.toString() === 'The password must be at least 10 characters long. The password must contain at least one lowercase letter. The password must contain at least one uppercase letter. The password must contain at least one special character.')) {
    return 'รหัสผ่านต้องมีความยาวอย่างน้อย 10 ตัว, รหัสผ่านต้องมีอักษรตัวพิมพ์เล็กอย่างน้อยหนึ่งตัว, รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อยหนึ่งตัว, รหัสผ่านต้องมีอักขระพิเศษอย่างน้อยหนึ่งอักขระ';
  } else if ((err.toString() === 'The password must be at least 10 characters long. The password must contain at least one lowercase letter. The password must contain at least one uppercase letter. The password must contain at least one number.')) {
    return 'รหัสผ่านต้องมีความยาวอย่างน้อย 10 ตัว, รหัสผ่านต้องมีอักษรตัวพิมพ์เล็กอย่างน้อยหนึ่งตัว, รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อยหนึ่งตัว, รหัสผ่านต้องมีอย่างน้อยหนึ่งหมายเลข';
  } else if ((err.toString() === 'The password must be at least 10 characters long. The password must contain at least one number. The password must contain at least one special character.')) {
    return 'รหัสผ่านต้องมีความยาวอย่างน้อย 10 ตัว, รหัสผ่านต้องมีอย่างน้อยหนึ่งหมายเลข, รหัสผ่านต้องมีอักขระพิเศษอย่างน้อยหนึ่งอักขระ';
  } else if ((err.toString() === 'The password must be at least 10 characters long. The password must contain at least one uppercase letter. The password must contain at least one special character.')) {
    return 'รหัสผ่านต้องมีความยาวอย่างน้อย 10 ตัว, รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อยหนึ่งตัว, รหัสผ่านต้องมีอักขระพิเศษอย่างน้อยหนึ่งอักขระ';
  } else if ((err.toString() === 'The password must be at least 10 characters long. The password must contain at least one lowercase letter. The password must contain at least one special character.')) {
    return 'รหัสผ่านต้องมีความยาวอย่างน้อย 10 ตัว, รหัสผ่านต้องมีอักษรตัวพิมพ์เล็กอย่างน้อยหนึ่งตัว, รหัสผ่านต้องมีอักขระพิเศษอย่างน้อยหนึ่งอักขระ';
  } else if ((err.toString() === 'The password must be at least 10 characters long. The password must contain at least one lowercase letter. The password must contain at least one uppercase letter.')) {
    return 'รหัสผ่านต้องมีความยาวอย่างน้อย 10 ตัว, รหัสผ่านต้องมีอักษรตัวพิมพ์เล็กอย่างน้อยหนึ่งตัว, รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อยหนึ่งตัว';
  } else if ((err.toString() === 'The password must be at least 10 characters long. The password must contain at least one lowercase letter. The password must contain at least one number.')) {
    return 'รหัสผ่านต้องมีความยาวอย่างน้อย 10 ตัว, รหัสผ่านต้องมีอักษรตัวพิมพ์เล็กอย่างน้อยหนึ่งตัว, รหัสผ่านต้องมีอย่างน้อยหนึ่งหมายเลข';
  } else if ((err.toString() === 'The password must be at least 10 characters long. The password must contain at least one special character.')) {
    return 'รหัสผ่านต้องมีความยาวอย่างน้อย 10 ตัว, รหัสผ่านต้องมีอักขระพิเศษอย่างน้อยหนึ่งอักขระ';
  } else if ((err.toString() === 'Please fill a valid email address')) {
    return 'รูปแบบอีเมล์นี้ไม่ถูกต้อง';
  } else if ((err.toString() === 'Missing credentials')) {
    return 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง';
  } else {
    return err;
  }
}