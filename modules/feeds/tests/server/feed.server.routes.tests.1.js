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
  token,
  feed;

/**
 * Feed routes tests
 */
describe('Feed CRUD tests with token', function () {

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
      phone: '123',
      provider: 'local'
    });

    token = '';

    // Save a user to the test db and create new Feed
    user.save(function () {
      feed = {
        name: 'Feed name',
        image: ['image'],
        islike: [],
        comments: [{
          user: user,
          comment: 'test comment',
        }],
        user: user
      };

      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }
          signinRes.body.loginToken.should.not.be.empty();
          token = signinRes.body.loginToken;

          done();
        });

    });
  });

  it('should be have Token logged in', function (done) {
    token.should.not.be.empty();
    done();
  });

  it('should be able to save a Feed if logged in with Token', function (done) {
    agent.post('/api/feeds')
      .set('authorization', 'Bearer ' + token)
      .send(feed)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        // var userId = user.id

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
            // (feeds[0].user.loginToken).should.equal(token);
            (feeds[0].name).should.match('Feed name');

            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to get list a Feed  by user if logged in with Token', function (done) {
    var FeedObj = new Feed(feed);
    var FeedObj2 = new Feed(feed);
    FeedObj2.user = null;
    FeedObj2.save();
    FeedObj.save();

    // Get a list of Feeds
    agent.get('/api/feedbyuser')
      .set('authorization', 'Bearer ' + token)
      .end(function (feedsGetErr, feedsGetRes) {
        // Handle Feeds save error
        if (feedsGetErr) {
          return done(feedsGetErr);
        }

        // Get Feeds list
        var feeds = feedsGetRes.body;

        // Set assertions

        (feeds.length).should.match(1);

        // Call the assertion callback
        done();
      });

  });

  it('update user islike', function (done) {
    agent.post('/api/feeds')
      .set('authorization', 'Bearer ' + token)
      .send(feed)
      .expect(200)
      .end(function (feedSaveErr, feedSaveRes) {
        // Handle signin error
        if (feedSaveErr) {
          return done(feedSaveErr);
        }

        var feeds = feedSaveRes.body;
        feeds.islike.push({
          user: user,
          created: Date.now()
        });

        agent.put('/api/feeds/' + feedSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(feeds)
          .expect(200)
          .end(function (feedUpdateErr, feedUpdateRes) {
            if (feedUpdateErr) {
              return done(feedUpdateErr);
            }
            var feedUpdate = feedUpdateRes.body;
            //(feedUpdate).should.match('');
            agent.get('/api/feeds/' + feedUpdate._id)
              .end(function (feedGetErr, feedGetRes) {
                if (feedGetErr) {
                  return done(feedGetErr);
                }

                // (feedGetRes.body.islike.user).should.match(feeds.user);
                done();

              });
          });
      });
  });

  it('should be able to save a Feed not name', function (done) {
    var data = {
      name: '',
      image: ['image'],
      islike: [],
      comments: [{
        user: user,
        comment: 'test comment',
      }],
      user: user
    };
    agent.post('/api/feeds')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(400)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        var feeds = signinRes.body.message;
        (feeds).should.match('กรุณากรอกชื่อ');
        return done();
      });
  });
  it('should be able to save a Feed not image', function (done) {
    var data = {
      name: 'sdfds',
      image: [],
      islike: [],
      comments: [{
        user: user,
        comment: 'test comment',
      }],
      user: user
    };
    agent.post('/api/feeds')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(400)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        var feeds = signinRes.body.message;
        (feeds).should.match('กรุณาเลือกรูป');
        return done();
      });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Feed.remove().exec(done);
    });
  });
});
