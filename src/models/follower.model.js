import { Schema, model } from 'mongoose';

const followerSchema = new Schema(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    followee: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

export default model('Follower', followerSchema);
