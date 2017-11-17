'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Order = mongoose.model('Order');

/**
 * Globals
 */
var user,
  order;

/**
 * Unit tests
 */
describe('Order Model Unit Tests:', function () {
  beforeEach(function (done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    user.save(function () {
      order = new Order({
        name: 'Order Name',
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
      });

      done();
    });
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(0);
      return order.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function (done) {
      order.name = '';

      return order.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without image', function (done) {
      order.image = '';

      return order.save(function (err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function (done) {
    Order.remove().exec(function () {
      User.remove().exec(function () {
        done();
      });
    });
  });
});
