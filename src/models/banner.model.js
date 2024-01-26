import { Schema, model } from 'mongoose';
import { REGEX, BANNER_CATEGORY } from '../constants.js';

const bannerSchema = new Schema(
  {
    image: {
      type: String,
      required: [true, 'Banner image is required'],
      match: [REGEX.URL, 'Invalid image URL']
    },
    redirectUrl: {
      type: String,
      match: [REGEX.URL, 'Invalid redirect URL']
    },
    redirectPath: String,
    category: {
      type: String,
      enum: BANNER_CATEGORY,
      default: BANNER_CATEGORY.HOME
    }
  },
  { timestamps: true }
);

export default model('Banner', bannerSchema);
