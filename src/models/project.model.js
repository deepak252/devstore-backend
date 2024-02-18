import { Schema, model } from 'mongoose';
import { REGEX, PLATFORM, PROJECT_TYPE } from '../constants.js';
import {
  apkInfoSchema,
  ipaInfoSchema,
  linkSchema,
  remoteFileSchema
} from './schemas.js';

const projectSchema = new Schema(
  {
    projectType: {
      type: String,
      enum: PROJECT_TYPE
    },
    name: {
      type: String,
      required: [true, 'App name is required']
    },
    description: {
      type: String
    },
    icon: remoteFileSchema,
    images: [remoteFileSchema],
    video: remoteFileSchema,
    featureGraphic: remoteFileSchema,
    categories: [
      {
        type: String,
        trim: true
      }
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner Id is required']
    },
    sourceCode: {
      type: String,
      trim: true,
      match: [REGEX.URL, 'Invalid source code URL']
    },
    isSourceCodePublic: {
      type: Boolean,
      default: true
    },
    otherLinks: [
      {
        type: linkSchema
      }
    ],
    isPrivate: {
      type: Boolean,
      default: false
    },
    /**  Website */
    websiteLink: {
      type: String,
      trim: true,
      match: [REGEX.URL, 'Invalid website URL']
    },
    /**  Apps and Games */
    packageFile: remoteFileSchema,
    platform: {
      type: String,
      enum: PLATFORM,
      default: PLATFORM.ANDROID
    },
    apkInfo: {
      type: apkInfoSchema
    },
    ipaInfo: {
      type: ipaInfoSchema
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
    /*****/

    // comments: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User',
    //   },
    // ],
    // likes: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User'
    //   }
    // ],
  },
  {
    timestamps: true
  }
);

export default model('Project', projectSchema);
