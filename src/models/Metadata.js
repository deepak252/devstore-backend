import mongoose from 'mongoose';

const metadataSchema = mongoose.Schema(
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

export default mongoose.model('Metadata', metadataSchema);
