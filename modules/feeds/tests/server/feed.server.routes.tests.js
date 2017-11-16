'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Feed = mongoose.model('Feed'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  feed;

/**
 * Feed routes tests
 */
describe('Feed CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Feed
    user.save(function () {
      feed = {
        name: 'Feed name',
        image: ['image'],
        islike:[{
          user:user
        }],
        comments:[{
          user:user,
          comment:'test comment',
        }]

      };

      done();
    });
  });

  it('should be able to save a Feed if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Feed
        agent.post('/api/feeds')
          .send(feed)
          .expect(200)
          .end(function (feedSaveErr, feedSaveRes) {
            // Handle Feed save error
            if (feedSaveErr) {
              return done(feedSaveErr);
            }

            // Get a list of Feeds
            agent.get('/api/feeds')
              .end(function (feedsGetErr, feedsGetRes) {
                // Handle Feeds save error
                if (feedsGetErr) {
                  return done(feedsGetErr);
                }

                // Get Feeds list
                var feeds = feedsGetRes.body;

                // Set assertions
                (feeds[0].user._id).should.equal(userId);
                (feeds[0].name).should.match('Feed name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Feed if not logged in', function (done) {
    agent.post('/api/feeds')
      .send(feed)
      .expect(403)
      .end(function (feedSaveErr, feedSaveRes) {
        // Call the assertion callback
        done(feedSaveErr);
      });
  });

  it('should not be able to save an Feed if no name is provided', function (done) {
    // Invalidate name field
    feed.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Feed
        agent.post('/api/feeds')
          .send(feed)
          .expect(400)
          .end(function (feedSaveErr, feedSaveRes) {
            // Set message assertion
            (feedSaveRes.body.message).should.match('Please fill Feed name');

            // Handle Feed save error
            done(feedSaveErr);
          });
      });
  });

  it('should be able to update an Feed if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Feed
        agent.post('/api/feeds')
          .send(feed)
          .expect(200)
          .end(function (feedSaveErr, feedSaveRes) {
            // Handle Feed save error
            if (feedSaveErr) {
              return done(feedSaveErr);
            }

            // Update Feed name
            feed.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Feed
            agent.put('/api/feeds/' + feedSaveRes.body._id)
              .send(feed)
              .expect(200)
              .end(function (feedUpdateErr, feedUpdateRes) {
                // Handle Feed update error
                if (feedUpdateErr) {
                  return done(feedUpdateErr);
                }

                // Set assertions
                (feedUpdateRes.body._id).should.equal(feedSaveRes.body._id);
                (feedUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Feeds if not signed in', function (done) {
    // Create new Feed model instance
    var feedObj = new Feed(feed);

    // Save the feed
    feedObj.save(function () {
      // Request Feeds
      request(app).get('/api/feeds')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Feed if not signed in', function (done) {
    // Create new Feed model instance
    var feedObj = new Feed(feed);

    // Save the Feed
    feedObj.save(function () {
      request(app).get('/api/feeds/' + feedObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', feed.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Feed with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/feeds/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Feed is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Feed which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Feed
    request(app).get('/api/feeds/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Feed with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Feed if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Feed
        agent.post('/api/feeds')
          .send(feed)
          .expect(200)
          .end(function (feedSaveErr, feedSaveRes) {
            // Handle Feed save error
            if (feedSaveErr) {
              return done(feedSaveErr);
            }

            // Delete an existing Feed
            agent.delete('/api/feeds/' + feedSaveRes.body._id)
              .send(feed)
              .expect(200)
              .end(function (feedDeleteErr, feedDeleteRes) {
                // Handle feed error error
                if (feedDeleteErr) {
                  return done(feedDeleteErr);
                }

                // Set assertions
                (feedDeleteRes.body._id).should.equal(feedSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Feed if not signed in', function (done) {
    // Set Feed user
    feed.user = user;

    // Create new Feed model instance
    var feedObj = new Feed(feed);

    // Save the Feed
    feedObj.save(function () {
      // Try deleting Feed
      request(app).delete('/api/feeds/' + feedObj._id)
        .expect(403)
        .end(function (feedDeleteErr, feedDeleteRes) {
          // Set message assertion
          (feedDeleteRes.body.message).should.match('User is not authorized');

          // Handle Feed error error
          done(feedDeleteErr);
        });

    });
  });

  it('should be able to get a single Feed that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Feed
          agent.post('/api/feeds')
            .send(feed)
            .expect(200)
            .end(function (feedSaveErr, feedSaveRes) {
              // Handle Feed save error
              if (feedSaveErr) {
                return done(feedSaveErr);
              }

              // Set assertions on new Feed
              (feedSaveRes.body.name).should.equal(feed.name);
              should.exist(feedSaveRes.body.user);
              should.equal(feedSaveRes.body.user._id, orphanId);

              // force the Feed to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Feed
                    agent.get('/api/feeds/' + feedSaveRes.body._id)
                      .expect(200)
                      .end(function (feedInfoErr, feedInfoRes) {
                        // Handle Feed error
                        if (feedInfoErr) {
                          return done(feedInfoErr);
                        }

                        // Set assertions
                        (feedInfoRes.body._id).should.equal(feedSaveRes.body._id);
                        (feedInfoRes.body.name).should.equal(feed.name);
                        should.equal(feedInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Feed.remove().exec(done);
    });
  });
});
