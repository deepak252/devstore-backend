import { Schema, model } from 'mongoose';

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: [true, "Comment can't  be empty"]
    },
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

export default model('Comment', commentSchema);
