'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Order Schema
 */
var OrderSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Order name',
    trim: true
  },
  image: {
    type: String,
    default: '',
    required: 'Please fill Order image'
  },
  route: {
    type: {
      routetype: String,
      contact: String,
      tel: Number,
      reception: {
        item: String,
        lat: Number,
        long: Number
      },
      school: {
        item: String,
        lat: Number,
        long: Number
      },
      send: {
        item: String,
        lat: Number,
        long: Number
      }
    }
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Order', OrderSchema);
