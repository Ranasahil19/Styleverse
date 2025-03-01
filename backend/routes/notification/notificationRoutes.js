const express = require('express');
const { getNotification, markAsRead, deleteNotification } = require('../../controllers/notifications/notificationController');
const router = express.Router();

router.get('/:sellerId' , getNotification)

router.put('/mark-as-read/:notificationId', markAsRead)

router.delete('/:notificationId', deleteNotification)

module.exports = router;