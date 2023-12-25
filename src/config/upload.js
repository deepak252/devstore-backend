const multer = require('multer');
const { uniqueRandomString, currentDateISOString } = require('../utils/misc');
const path = require('path');
const { createDirectoryIfNotExists, removeFile, getFileExtension } = require('../utils/fileUtil');
const destPath = 'uploads/';

// const upload = multer({dest: 'uploads/'});

const getFileName = (user, file) => {
  let filename = uniqueRandomString();
  const ext = getFileExtension(file?.originalname);
  if(user?.username){
    filename = `${user.username}_${filename}`;
  }
  if(file.fieldname==='attachmentApp'){
    filename = `${filename}_app`;
  }else if(ext){
    filename = `${filename}.${ext}`;
  }
  return filename;
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create the 'uploads' folder if it doesn't exist
    createDirectoryIfNotExists(destPath);
    // Store files in the 'uploads/' directory
    cb(null, destPath);
  },
  filename: function (req, file, cb) {
    const filename = getFileName(req.user, file);
    cb(null, filename);
    //Ref: https://github.com/expressjs/multer/issues/259#issuecomment-691748926
    req.on('aborted', () => {
      console.log('Cancel Upload');
      file.stream.on('end', () => {
        removeFile(path.join(destPath, filename));
      });
      file.stream.emit('end');
    });
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
