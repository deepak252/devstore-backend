import { Schema, model } from 'mongoose';
import { PLATFORM, PROJECT_TYPE } from '../constants.js';
import { apkInfoSchema, ipaInfoSchema, remoteFileSchema } from './schemas.js';

const appPackageSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User Id is required']
    },
    projectType: {
      type: String,
      enum: PROJECT_TYPE
    },
    platform: {
      type: String,
      enum: PLATFORM,
      default: PLATFORM.ANDROID
    },
    packageFile: {
      type: remoteFileSchema,
      required: [true, 'packageFile is required']
    },
    apkInfo: {
      type: apkInfoSchema
    },
    ipaInfo: {
      type: ipaInfoSchema
    }
  },
  {
    timestamps: true,
    statics: {
      deleteAllByUserId(userId) {
        return this.deleteMany({ owner: userId });
      },
      findAllByUserId(userId) {
        return this.find({ owner: userId });
      }
    }
  }
);

export default model('AppPackage', appPackageSchema);
