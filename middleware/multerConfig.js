// multerConfig.js (example)
const multer = require('multer');
const path = require('path');

function createProfileImageUpload() {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/profileImages');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

  return multer({ storage: storage });
}

function createPostImageUpload() {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/postImages');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

  return multer({ storage: storage });
}

module.exports = {
  createProfileImageUpload,
  createPostImageUpload
};
