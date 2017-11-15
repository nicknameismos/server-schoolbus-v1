'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Feed Schema
 */
var FeedSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Feed name',
    trim: true
  },
  image: {
    type: [String],
    default: '',
    required: 'Please fill Feed image'

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

mongoose.model('Feed', FeedSchema);
