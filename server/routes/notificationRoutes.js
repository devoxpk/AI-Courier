const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  sendNotification,
  getUnreadCount
} = require('../controllers/notificationController');

// Customer routes
router.get('/mynotifications', protect, getMyNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/mark-read/:id', protect, markAsRead);
router.put('/mark-all-read', protect, markAllAsRead);

// Admin routes
router.route('/')
  .get(protect, authorize('admin'), getNotifications)
  .post(protect, authorize('admin'), createNotification);

router.route('/:id')
  .get(protect, getNotification)
  .put(protect, authorize('admin'), updateNotification)
  .delete(protect, authorize('admin'), deleteNotification);

router.post('/send', protect, authorize('admin'), sendNotification);

module.exports = router;