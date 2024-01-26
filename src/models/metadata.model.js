import { Schema, model } from 'mongoose';

const metadataSchema = new Schema(
  {
    appCategories: [
      {
        type: String,
        default: []
      }
    ],
    websiteCategories: [
      {
        type: String,
        default: []
      }
    ],
    gameCategories: [
      {
        type: String,
        default: []
      }
    ],
    enabled: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default model('Metadata', metadataSchema);
