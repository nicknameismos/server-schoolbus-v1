'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Feed = mongoose.model('Feed');

/**
 * Globals
 */
var user,
  feed;

/**
 * Unit tests
 */
describe('Feed Model Unit Tests:', function() {
  beforeEach(function(done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    user.save(function() {
      feed = new Feed({
        name: 'Feed Name',
        image:['img'],
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return feed.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function(done) {
      feed.name = '';

      return feed.save(function(err) {
        should.exist(err);
        done();
      });
    });
    it('should be able to show an error when try to save without image', function(done) {
      feed.image = [];

      return feed.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) {
    Feed.remove().exec(function() {
      User.remove().exec(function() {
        done();
      });
    });
  });
});
