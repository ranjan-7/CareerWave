import { Router } from 'express';
import { prisma } from '../lib/db';
import { AuthenticatedRequest, authenticate, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/applications - Get applications list based on role
router.get('/', authenticate, requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const session = req.user!;
    const jobId = req.query.jobId as string;

    if (session.role === 'SEEKER') {
      const seekerProfile = await prisma.jobSeekerProfile.findUnique({
        where: { userId: session.userId },
      });

      if (!seekerProfile) {
        return res.status(404).json({ error: 'Seeker profile not found' });
      }

      const applications = await prisma.application.findMany({
        where: { seekerId: seekerProfile.id },
        include: {
          job: {
            include: {
              employer: {
                select: {
                  companyName: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
      });

      return res.status(200).json({ success: true, applications });

    } else if (session.role === 'EMPLOYER') {
      const employerProfile = await prisma.employerProfile.findUnique({
        where: { userId: session.userId },
      });

      if (!employerProfile) {
        return res.status(404).json({ error: 'Employer profile not found' });
      }

      const whereClause: any = {
        job: { employerId: employerProfile.id },
      };

      if (jobId) {
        whereClause.jobId = jobId;
      }

      const applications = await prisma.application.findMany({
        where: whereClause,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
            },
          },
          seeker: {
            select: {
              id: true,
              fullName: true,
              headline: true,
              location: true,
              skills: true,
              resumeUrl: true,
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
      });

      return res.status(200).json({ success: true, applications });

    } else if (session.role === 'ADMIN') {
      const applications = await prisma.application.findMany({
        include: {
          job: {
            select: {
              id: true,
              title: true,
              employer: { select: { companyName: true } },
            },
          },
          seeker: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
      });

      return res.status(200).json({ success: true, applications });
    }

    return res.status(400).json({ error: 'Invalid role session' });

  } catch (error) {
    console.error('Fetch applications error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/applications - Apply for a job
router.post('/', authenticate, requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const session = req.user!;
    if (session.role !== 'SEEKER') {
      return res.status(401).json({ error: 'Unauthorized. Only job seekers can apply.' });
    }

    const seekerProfile = await prisma.jobSeekerProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!seekerProfile) {
      return res.status(404).json({ error: 'Job seeker profile not found' });
    }

    const { jobId, resumeUrl, coverLetter, screeningAnswers } = req.body;

    if (!jobId || !resumeUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        employer: {
          select: {
            id: true,
            userId: true,
            companyName: true,
          },
        },
      },
    });

    if (!job || job.status !== 'ACTIVE') {
      return res.status(404).json({ error: 'Job not found or is no longer accepting applications' });
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        seekerId: seekerProfile.id,
      },
    });

    if (existingApplication) {
      return res.status(409).json({ error: 'You have already applied for this job' });
    }

    const application = await prisma.$transaction(async (tx) => {
      const newApp = await tx.application.create({
        data: {
          jobId,
          seekerId: seekerProfile.id,
          resumeUrl,
          coverLetter,
          screeningAnswers: screeningAnswers ? JSON.stringify(screeningAnswers) : null,
          status: 'APPLIED',
        },
      });

      await tx.notification.create({
        data: {
          userId: job.employer.userId,
          type: 'NEW_APPLICATION',
          title: 'New Application Received',
          message: `${seekerProfile.fullName} applied for your job opening: "${job.title}"`,
          link: `/employer/jobs/${job.id}/applicants`,
        },
      });

      return newApp;
    });

    return res.status(201).json({ success: true, application });

  } catch (error) {
    console.error('Apply job error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/applications/:id - Fetch single application details
router.get('/:id', authenticate, requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const session = req.user!;
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        job: {
          include: {
            employer: true,
          },
        },
        seeker: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Role verification logic
    if (session.role === 'SEEKER') {
      const seekerProfile = await prisma.jobSeekerProfile.findUnique({
        where: { userId: session.userId },
      });
      if (!seekerProfile || application.seekerId !== seekerProfile.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    } else if (session.role === 'EMPLOYER') {
      const employerProfile = await prisma.employerProfile.findUnique({
        where: { userId: session.userId },
      });
      if (!employerProfile || application.job.employerId !== employerProfile.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    return res.status(200).json({ success: true, application });

  } catch (error) {
    console.error('Fetch application details error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/applications/:id - Update application status, ratings, notes
router.put('/:id', authenticate, requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const session = req.user!;
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            employerId: true,
          },
        },
        seeker: {
          select: {
            id: true,
            userId: true,
            fullName: true,
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (session.role !== 'ADMIN') {
      const employerProfile = await prisma.employerProfile.findUnique({
        where: { userId: session.userId },
      });

      if (!employerProfile || application.job.employerId !== employerProfile.id) {
        return res.status(403).json({ error: 'Forbidden. You do not have permission to update this application.' });
      }
    }

    const { status, internalNotes, rating } = req.body;

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (internalNotes !== undefined) dataToUpdate.internalNotes = internalNotes;
    if (rating !== undefined) dataToUpdate.rating = rating ? parseInt(rating, 10) : null;

    const updatedApplication = await prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id: req.params.id },
        data: dataToUpdate,
      });

      if (status && status !== application.status) {
        let statusText = status.toLowerCase().replace('_', ' ');
        statusText = statusText.replace(/\b\w/g, (c: string) => c.toUpperCase());

        await tx.notification.create({
          data: {
            userId: application.seeker.userId,
            type: 'APPLICATION_STATUS',
            title: `Application Status Update`,
            message: `Your application for "${application.job.title}" has been updated to: ${statusText}.`,
            link: `/seeker/dashboard`,
          },
        });
      }

      return updated;
    });

    return res.status(200).json({ success: true, application: updatedApplication });

  } catch (error) {
    console.error('Update application error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
