const mongoose = require('mongoose');
const { apkInfoSchema, ipaInfoSchema, remoteFileSchema } = require('./schemas');
const { REGEX, PLATFORM } = require('../config/constants');

const appSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'App name is required'],
    },
    description: {
      type: String,
    },
    icon: remoteFileSchema,
    images: [remoteFileSchema],
    video: remoteFileSchema,
    featureGraphic: remoteFileSchema,
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
    platform: {
      type: String,
      enum: PLATFORM,
      default: PLATFORM.ANDROID,
    },
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
    apkInfo: {
      type: apkInfoSchema,
    },
    ipaInfo: {
      type: ipaInfoSchema,
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

module.exports = mongoose.model('App', appSchema);
