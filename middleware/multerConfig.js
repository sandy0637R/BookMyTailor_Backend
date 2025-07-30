// multerConfig.js
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

function createCustomImageUpload() {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/customRequests');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

  return multer({ storage });
}

function createClothImageUpload() {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/clothImages');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

  return multer({ storage });
}




module.exports = {
  createProfileImageUpload,
  createPostImageUpload,
  createCustomImageUpload,
  createClothImageUpload, 
};
