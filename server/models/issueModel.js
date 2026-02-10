const mongoose = require('mongoose');

const commentSchema = mongoose.Schema(
    {
        user: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    }
);

const issueSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: {
            type: String,
            required: true,
            enum: ['Bug', 'Infrastructure', 'Academic', 'Other'],
        },
        priority: {
            type: String,
            required: true,
            enum: ['Low', 'Medium', 'High'],
        },
        status: {
            type: String,
            required: true,
            default: 'Open',
            enum: ['Open', 'In Progress', 'Resolved'],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        assignedTo: { type: String, default: '' }, // String-based as requested
        comments: [commentSchema],
    },
    {
        timestamps: true,
    }
);

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
