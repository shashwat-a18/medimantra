const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// All routes require authentication
router.get('/', auth, notificationController.getUserNotifications);
// If not authenticated, return 401 error
router.use((req, res, next) => {
	if (!req.user) {
		return res.status(401).json({ error: 'Authentication required' });
	}
	next();
});
router.patch('/:notificationId/read', auth, notificationController.markAsRead);
router.patch('/read-all', auth, notificationController.markAllAsRead);
router.delete('/:notificationId', auth, notificationController.deleteNotification);
router.get('/stats', auth, notificationController.getNotificationStats);

module.exports = router;
