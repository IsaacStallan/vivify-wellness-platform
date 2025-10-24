const mongoose = require('mongoose');

const basecampPostSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true,
        unique: true,
        default: () => `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },
    mountain: {
        type: String,
        required: true,
        enum: ['fuji', 'kilimanjaro', 'elbrus', 'denali', 'aconcagua', 'vinson', 'everest'],
        index: true
    },
    basecampName: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    username: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 500
    },
    sherpaPoints: {
        type: Number,
        default: 0,
        min: 0
    },
    upvotedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    flagged: {
        type: Boolean,
        default: false
    },
    flaggedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    flagReasons: [String],
    moderationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'auto-blocked'],
        default: 'pending'
    },
    moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    moderatedAt: Date
}, {
    timestamps: true
});

// Indexes
basecampPostSchema.index({ mountain: 1, basecampName: 1, createdAt: -1 });
basecampPostSchema.index({ userId: 1, createdAt: -1 });
basecampPostSchema.index({ moderationStatus: 1, createdAt: -1 });

// Pre-save hook for content moderation
basecampPostSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('content')) {
        // Basic profanity filter (simplified)
        const blockedWords = [
            'profanity1', 'profanity2', // Add actual blocked words
        ];

        const contentLower = this.content.toLowerCase();
        const hasProfanity = blockedWords.some(word => contentLower.includes(word));

        // Check for contact info patterns
        const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(this.content);
        const hasPhone = /\b\d{10,}\b/.test(this.content);
        const hasURL = /(https?:\/\/|www\.)/i.test(this.content);

        if (hasProfanity || hasEmail || hasPhone || hasURL) {
            this.moderationStatus = 'auto-blocked';
            this.flagged = true;
            this.flagReasons.push('Automated content filter triggered');
        } else {
            this.moderationStatus = 'approved'; // Auto-approve if passes basic checks
        }
    }
    next();
});

// Instance methods
basecampPostSchema.methods.upvote = async function(userId) {
    if (!this.upvotedBy.includes(userId)) {
        this.upvotedBy.push(userId);
        this.sherpaPoints += 1;
        await this.save();
        return true;
    }
    return false;
};

basecampPostSchema.methods.removeUpvote = async function(userId) {
    const index = this.upvotedBy.indexOf(userId);
    if (index > -1) {
        this.upvotedBy.splice(index, 1);
        this.sherpaPoints = Math.max(0, this.sherpaPoints - 1);
        await this.save();
        return true;
    }
    return false;
};

basecampPostSchema.methods.flag = async function(userId, reason) {
    if (!this.flaggedBy.includes(userId)) {
        this.flaggedBy.push(userId);
        this.flagged = true;
        if (reason) {
            this.flagReasons.push(reason);
        }
        if (this.flaggedBy.length >= 3) {
            this.moderationStatus = 'pending';
        }
        await this.save();
        return true;
    }
    return false;
};

// Static methods
basecampPostSchema.statics.getBasecampPosts = async function(mountain, basecampName, limit = 50) {
    return await this.find({
        mountain,
        basecampName,
        moderationStatus: { $in: ['approved', 'pending'] }
    })
    .populate('userId', 'username school yearLevel')
    .sort({ sherpaPoints: -1, createdAt: -1 })
    .limit(limit);
};

basecampPostSchema.statics.getUserPosts = async function(userId, limit = 20) {
    return await this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
};

basecampPostSchema.statics.getFlaggedPosts = async function() {
    return await this.find({
        moderationStatus: { $in: ['pending', 'auto-blocked'] }
    })
    .populate('userId', 'username school')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('BasecampPost', basecampPostSchema);
