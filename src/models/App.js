const mongoose = require('mongoose');
const { REGEX } = require('../config/constants');

const appSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'App name is required']
  },
  description: {
    type: String
  },
  icon: {
    type: String,
    trim : true,
    required: [true, 'App icon is required'],
    match: [REGEX.URL, 'Invalid icon URL']
  },
  images: [
    {
      type : String,
      trim : true,
      match: [REGEX.URL, 'Invalid image URL']
    }
  ],
  video: {
    type: String,
    trim : true,
    match: [REGEX.URL, 'Invalid video URL']
  },
  categories: [
    {
      type : String,
      trim : true
    }
  ],
  downloadUrl: {
    type: String,
    trim : true,
    match: [REGEX.URL, 'Invalid download URL']
  },
  githubUrl: {
    type: String,
    trim : true,
    match: [REGEX.URL, 'Invalid github URL']
  },
},{
  timestamps: true
});

module.exports = mongoose.model('App',appSchema);