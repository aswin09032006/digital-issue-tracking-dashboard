const express = require('express');
const {
    createIssue,
    getMyIssues,
    getAllIssues,
    getIssueById,
    updateStatus,
    assignIssue,
    addComment,
} = require('../controllers/issueController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, createIssue).get(protect, admin, getAllIssues);
router.get('/my', protect, getMyIssues);
router.route('/:id').get(protect, getIssueById);
router.put('/:id/status', protect, admin, updateStatus);
router.put('/:id/assign', protect, admin, assignIssue);
router.post('/:id/comment', protect, addComment);

module.exports = router;
