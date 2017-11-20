'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Order = mongoose.model('Order'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  token,
  order;

/**
 * Order routes tests
 */
describe('Order CRUD tests token', function () {

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

    // Save a user to the test db and create new Order
    user.save(function () {
      order = {
        name: 'Order name',
        image: 'image',
        route: {
          routetype: 'เที่ยวเดียว',
          contact: 'Moss',
          tel: '0879815433',
          reception: {
            item: 'หมู่บ้านคาซ่าซิตี้',
            lat: 13.9987,
            long: 15.9876
          },
          school: {
            item: 'โรงเรียนอนุบาลเศรฐบุตร',
            lat: 24.5433,
            long: 107.1232
          },
          send: {
            item: 'หมู่บ้านคาซ่าซิตี้',
            lat: 13.9987,
            long: 15.9876

          }
        },
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

  it('should be able to save a Order if logged in', function (done) {

    var userId = user.id;

    // Save a new Order
    agent.post('/api/orders')
      .set('authorization', 'Bearer ' + token)
      .send(order)
      .expect(200)
      .end(function (orderSaveErr, orderSaveRes) {
        // Handle Order save error
        if (orderSaveErr) {
          return done(orderSaveErr);
        }

        // Get a list of Orders
        agent.get('/api/orders')
          .set('authorization', 'Bearer ' + token)
          .end(function (ordersGetErr, ordersGetRes) {
            // Handle Orders save error
            if (ordersGetErr) {
              return done(ordersGetErr);
            }

            // Get Orders list
            var orders = ordersGetRes.body;

            // Set assertions
            // (orders[0].user._id).should.equal(userId);
            (orders[0].name).should.match('Order name');
            (orders[0].image).should.match('image');
            (orders[0].reception).should.match('หมู่บ้านคาซ่าซิตี้');
            (orders[0].school).should.match('โรงเรียนอนุบาลเศรฐบุตร');
            (orders[0].send).should.match('หมู่บ้านคาซ่าซิตี้');

            // Call the assertion callback
            done();
          });
      });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Order.remove().exec(done);
    });
  });
});
