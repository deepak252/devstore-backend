const mongoose = require('mongoose');
const { apkInfoSchema, ipaInfoSchema, remoteFileSchema } = require('./schemas');

const uploadAppSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User Id is required'],
    },
    isIos: {
      type: Boolean,
      required: [true, 'isIos is required'],
    },
    file: {
      type: remoteFileSchema,
      required: [true, 'File is required'],
    },
    apkInfo: {
      type: apkInfoSchema,
    },
    ipaInfo: {
      type: ipaInfoSchema,
    },
  },
  {
    timestamps: true,
    statics: {
      deleteAllByUserId(userId) {
        return this.deleteMany({ user: userId });
      },
      findAllByUserId(userId) {
        return this.find({ user: userId });
      },
    },
  }
);

module.exports = mongoose.model('UploadApp', uploadAppSchema);
