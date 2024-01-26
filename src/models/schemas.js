import { Schema } from 'mongoose';
import { REGEX } from '../constants.js';

export const apkInfoSchema = new Schema(
  {
    version: String, //versionName
    package: String, //package
    minSdkVersion: Number, //usesSdk/minSdkVersion
    targetSdkVersion: Number //usesSdk/targetSdkVersion
  },
  { _id: false }
);

export const ipaInfoSchema = new Schema(
  {
    version: String, //CFBundleShortVersionString
    identifier: String, //CFBundleIdentifier
    minOSVersion: Number //MinimumOSVersion
  },
  { _id: false }
);

export const remoteFileSchema = new Schema(
  {
    url: {
      type: String,
      trim: true,
      match: [REGEX.URL, 'Invalid file URL']
    },
    path: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

export const linkSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      trim: true,
      match: [REGEX.URL, 'Invalid URL']
    },
    description: {
      type: String,
      required: true
    }
  },
  { _id: false }
);
