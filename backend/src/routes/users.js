const express = require('express');
const router = express.Router();
const {
  getProfile, getProfileBySlug, updateProfile, uploadAvatar,
  getMyTransactions, bookmarkSession, searchTeachers, getSkillSuggestions, getUserStats,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');

let upload;
if (process.env.AWS_ACCESS_KEY_ID && process.env.S3_BUCKET_NAME) {
  const s3 = new S3Client({ region: process.env.AWS_REGION });
  upload = multer({
    storage: multerS3({
      s3,
      bucket: process.env.S3_BUCKET_NAME,
      key: (req, file, cb) => {
        cb(null, `avatars/${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) cb(null, true);
      else cb(new Error('Only image files allowed'), false);
    },
  });
} else {
  upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });
}

// Specific routes MUST come before /:id to avoid being swallowed
router.get('/teachers', searchTeachers);
router.get('/skills/suggestions', getSkillSuggestions);
router.get('/profile/:slug', getProfileBySlug);
// /me/* routes before /:id
router.patch('/me', protect, validate(schemas.updateProfile), updateProfile);
router.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/me/transactions', protect, getMyTransactions);
router.post('/me/bookmarks/:sessionId', protect, bookmarkSession);
// Stats before /:id to avoid route shadowing
router.get('/:id/stats', getUserStats);
// Parameterized route last
router.get('/:id', getProfile);

module.exports = router;
