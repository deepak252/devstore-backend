const mongoose = require('mongoose');

const metadataSchema = mongoose.Schema(
  {
    appCategories: [
      {
        type: String,
        default: [],
      },
    ],
    websiteCategories: [
      {
        type: String,
        default: [],
      },
    ],
    gameCategories: [
      {
        type: String,
        default: [],
      },
    ],
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Metadata', metadataSchema);
