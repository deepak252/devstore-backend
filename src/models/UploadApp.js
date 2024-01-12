import mongoose from 'mongoose';
import { PLATFORM } from '../config/constants.js';
import { apkInfoSchema, ipaInfoSchema, remoteFileSchema } from './schemas.js';

const uploadAppSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User Id is required']
    },
    platform: {
      type: String,
      enum: PLATFORM,
      default: PLATFORM.ANDROID
    },
    file: {
      type: remoteFileSchema,
      required: [true, 'File is required']
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
        return this.deleteMany({ user: userId });
      },
      findAllByUserId(userId) {
        return this.find({ user: userId });
      }
    }
  }
);

export default mongoose.model('UploadApp', uploadAppSchema);
