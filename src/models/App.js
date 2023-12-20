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
  isIOS: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  downloadUrl: {
    type: String,
    trim : true,
    match: [REGEX.URL, 'Invalid download URL']
  },
  totalDownloads: {
    type: Number,
    default: 0
  },
  sourceCode: {
    type: String,
    trim : true,
    match: [REGEX.URL, 'Invalid source code URL']
  },
  isSourceCodePublic: {
    type: Boolean,
    default: true
  },
  // appInfo: {
  //   type: Boolean,
  //   default: true
  // },
  isPrivate: {
    type: Boolean,
    default: false
  },
  // comments: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'User',
  //   },
  // ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
},{
  timestamps: true
});

module.exports = mongoose.model('App',appSchema);