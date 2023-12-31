const mongoose = require('mongoose');
const { REGEX, BANNER_CATEGORY } = require('../config/constants');

const bannerSchema = mongoose.Schema({
  image: {
    type: String,
    required: [true, 'Banner image is required'],
    match: [REGEX.URL, 'Invalid image URL'],
  },
  redirectUrl: {
    type: String,
    match: [REGEX.URL, 'Invalid redirect URL'],
  },
  redirectPath: String,
  category: {
    type: String,
    enum: BANNER_CATEGORY,
    default: BANNER_CATEGORY.HOME
  }
},{timestamps: true});


module.exports = mongoose.model('Banner', bannerSchema);
