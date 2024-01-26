import { Schema, model } from 'mongoose';

const bookmarkSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project'
    }
  },
  {
    timestamps: true
  }
);

export default model('Bookmark', bookmarkSchema);
