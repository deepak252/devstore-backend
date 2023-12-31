const mongoose = require('mongoose');
const { remoteFileSchema } = require('./schemas');
const { REGEX } = require('../config/constants');

const websiteSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Website name is required'],
    },
    description: {
      type: String,
    },
    icon: remoteFileSchema,
    images: [remoteFileSchema],
    video: remoteFileSchema,
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner Id is required'],
    },
    file: remoteFileSchema,
    totalDownloads: {
      type: Number,
      default: 0,
    },
    sourceCode: {
      type: String,
      trim: true,
      match: [REGEX.URL, 'Invalid source code URL'],
    },
    isSourceCodePublic: {
      type: Boolean,
      default: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
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
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Website', websiteSchema);
