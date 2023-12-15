// const mongoose = require('mongoose');

// const websiteSchema = mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Website name is required']
//   },
//   description: {
//     type: String
//   },
//   icon: {
//     type: String,
//     trim : true,
//     required: [true, 'Website icon is required'],
//     match: [REGEX.URL, 'Invalid icon URL']
//   },
//   images: [
//     {
//       type : String,
//       trim : true,
//       match: [REGEX.URL, 'Invalid image URL']
//     }
//   ],
//   video: {
//     type: String,
//     trim : true,
//     match: [REGEX.URL, 'Invalid video URL']
//   },
//   categories: [
//     {
//       type : String,
//       trim : true
//     }
//   ],
//   githubUrl: {
//     type: String,
//     trim : true,
//     match: [REGEX.URL, 'Invalid github URL']
//   },
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('Website', websiteSchema);