const express = require('express');
const router = express.Router();
const { getConversation, markAsRead, getChatUsers,sendMessage  } = require('../controllers/chatController');
const isLoggedin = require('../middleware/isLoggedin');

router.get('/conversation/:userId1/:userId2', isLoggedin, getConversation);
router.put('/mark-read', isLoggedin, markAsRead);
router.get("/chat-users", isLoggedin, getChatUsers);
router.post('/send', isLoggedin, sendMessage);
module.exports = router;
