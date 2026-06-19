import { Router } from 'express';
import { prisma } from '../lib/db';
import { AuthenticatedRequest, authenticate, requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// PUT /api/seeker/profile - Update seeker profile
router.put('/profile', authenticate, requireAuth, requireRole(['SEEKER']), async (req: AuthenticatedRequest, res) => {
  try {
    const {
      fullName,
      headline,
      bio,
      location,
      skills,
      experience,
      education,
      portfolioUrl,
      linkedinUrl,
      githubUrl,
      visibility,
      openToWork,
      resumeUrl,
    } = req.body;

    if (!fullName) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    const updatedProfile = await prisma.jobSeekerProfile.update({
      where: { userId: req.user!.userId },
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
  } catch (error) {
    console.error('Update seeker profile error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
