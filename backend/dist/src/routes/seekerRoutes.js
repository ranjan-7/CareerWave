"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// PUT /api/seeker/profile - Update seeker profile
router.put('/profile', auth_1.authenticate, auth_1.requireAuth, (0, auth_1.requireRole)(['SEEKER']), async (req, res) => {
    try {
        const { fullName, headline, bio, location, skills, experience, education, portfolioUrl, linkedinUrl, githubUrl, visibility, openToWork, resumeUrl, } = req.body;
        if (!fullName) {
            return res.status(400).json({ error: 'Full name is required' });
        }
        const updatedProfile = await db_1.prisma.jobSeekerProfile.update({
            where: { userId: req.user.userId },
            data: {
                fullName,
                headline,
                bio,
                location,
                skills: skills || '',
                experience: typeof experience === 'string' ? experience : JSON.stringify(experience || []),
                education: typeof education === 'string' ? education : JSON.stringify(education || []),
                portfolioUrl,
                linkedinUrl,
                githubUrl,
                visibility: visibility || 'PUBLIC',
                openToWork: openToWork !== undefined ? !!openToWork : true,
                resumeUrl,
            },
        });
        return res.status(200).json({ success: true, profile: updatedProfile });
    }
    catch (error) {
        console.error('Update seeker profile error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
