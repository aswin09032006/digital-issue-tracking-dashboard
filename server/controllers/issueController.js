const Issue = require('../models/issueModel');
const User = require('../models/userModel');
const { createNotification } = require('./notificationController');

// @desc    Create new issue
// @route   POST /api/issues
// @access  Private
const createIssue = async (req, res) => {
    try {
        const { title, description, category, priority } = req.body;

        if (!title || !description || !category || !priority) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const issue = await Issue.create({
            title,
            description,
            category,
            priority,
            createdBy: req.user._id,
        });

        res.status(201).json(issue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user issues
// @route   GET /api/issues/my
// @access  Private
const getMyIssues = async (req, res) => {
    try {
        const issues = await Issue.find({ createdBy: req.user._id }).sort({
            createdAt: -1,
        });
        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all issues
// @route   GET /api/issues
// @access  Private/Admin
const getAllIssues = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100; // Default limit 100
        const skip = (page - 1) * limit;

        const issues = await Issue.find({})
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Issue.countDocuments();

        res.json({
            issues,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get issue by ID
// @route   GET /api/issues/:id
// @access  Private
const getIssueById = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id).populate(
            'createdBy',
            'name email'
        );

        if (issue) {
            res.json(issue);
        } else {
            res.status(404).json({ message: 'Issue not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update issue status
// @route   PUT /api/issues/:id/status
// @access  Private/Admin
const updateStatus = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (issue) {
            // Check if user is admin OR the assigned user
            if (req.user.role === 'admin' || (issue.assignedTo && issue.assignedTo.toString() === req.user.name)) {
                // Note: storing name in assignedTo based on frontend input, but ideally should be ID. 
                // However, current implementation in IssueDetail sends a string (username).
                // Let's check how assignIssue saves it.
                // Looking at assignIssue: issue.assignedTo = req.body.assignedTo; 
                // And IssueDetail sends textual name.
                // So strict comparison with name should work if consistency is maintained.

                issue.status = req.body.status;
                const updatedIssue = await issue.save();

                // Notify Creator if status changed by someone else
                if (issue.createdBy.toString() !== req.user._id.toString()) {
                    await createNotification(
                        issue.createdBy,
                        `Status updated to ${req.body.status}: ${issue.title}`,
                        issue._id,
                        'info'
                    );
                }

                res.json(updatedIssue);

                // Real-time Update
                req.io.emit('issueUpdated', updatedIssue);
            } else {
                res.status(403).json({ message: 'Not authorized to update status' });
            }
        } else {
            res.status(404).json({ message: 'Issue not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign issue
// @route   PUT /api/issues/:id/assign
// @access  Private/Admin
const assignIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (issue) {
            const { assignedTo } = req.body;
            issue.assignedTo = assignedTo;
            const updatedIssue = await issue.save();

            // Notify the assigned user (if found)
            if (assignedTo) {
                const assignee = await User.findOne({ name: assignedTo });
                if (assignee) {
                    await createNotification(
                        assignee._id,
                        `You have been assigned to issue: ${issue.title}`,
                        issue._id,
                        'info'
                    );
                }
            }

            req.io.emit('issueUpdated', updatedIssue);
            if (assignedTo) {
                const assignee = await User.findOne({ name: assignedTo });
                if (assignee) req.io.emit('notification', { userId: assignee._id });
            }

            res.json(updatedIssue);
        } else {
            res.status(404).json({ message: 'Issue not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add comment
// @route   POST /api/issues/:id/comment
// @access  Private
const addComment = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (issue) {
            const comment = {
                user: req.user.name,
                text: req.body.text,
            };

            issue.comments.push(comment);
            await issue.save();

            // Notify Creator (if not the commenter)
            if (issue.createdBy.toString() !== req.user._id.toString()) {
                await createNotification(
                    issue.createdBy,
                    `New comment on your issue: ${issue.title}`,
                    issue._id,
                    'info'
                );
            }

            // Notify Assignee (if exists and not the commenter)
            if (issue.assignedTo) {
                const assignee = await User.findOne({ name: issue.assignedTo });
                if (assignee && assignee._id.toString() !== req.user._id.toString()) {
                    await createNotification(
                        assignee._id,
                        `New comment on assigned issue: ${issue.title}`,
                        issue._id,
                        'info'
                    );
                }
            }

            res.status(201).json(issue);

            req.io.emit('issueUpdated', issue);
            // Broad notification check (simplified for now, ideally strictly target users)
            req.io.emit('notification', { type: 'comment', issueId: issue._id });
        } else {
            res.status(404).json({ message: 'Issue not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createIssue,
    getMyIssues,
    getAllIssues,
    getIssueById,
    updateStatus,
    assignIssue,
    addComment,
};
