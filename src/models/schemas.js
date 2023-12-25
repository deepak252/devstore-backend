const mongoose = require('mongoose');
const { REGEX } = require('../config/constants');

exports.apkInfoSchema = mongoose.Schema(
  {
    version: String, //versionName
    package: String, //package
    minSdkVersion: Number, //usesSdk/minSdkVersion
    targetSdkVersion: Number, //usesSdk/targetSdkVersion
  },
  { _id: false }
);

exports.ipaInfoSchema = mongoose.Schema(
  {
    version: String, //CFBundleShortVersionString
    identifier: String, //CFBundleIdentifier
    minOSVersion: Number, //MinimumOSVersion
  },
  { _id: false }
);

exports.remoteFileSchema = mongoose.Schema(
  {
    url: {
      type: String,
      trim: true,
      match: [REGEX.URL, 'Invalid file URL'],
    },
    path: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);
