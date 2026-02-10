const Notification = require('../models/notificationModel');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20); // Limit to last 20
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            // Check if notification belongs to user
            if (notification.recipient.toString() !== req.user._id.toString()) {
                res.status(401);
                throw new Error('Not authorized');
            }

            notification.isRead = true;
            await notification.save();
            res.json(notification);
        } else {
            res.status(404);
            throw new Error('Notification not found');
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: 'All marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper: Create Notification (Internal Use)
const createNotification = async (recipientId, text, relatedIssueId, type = 'info') => {
    try {
        await Notification.create({
            recipient: recipientId,
            text,
            relatedIssue: relatedIssueId,
            type
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    createNotification
};
