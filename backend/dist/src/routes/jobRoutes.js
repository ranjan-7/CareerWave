"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/jobs/save - Retrieve saved jobs for current seeker
router.get('/save', auth_1.authenticate, auth_1.requireAuth, (0, auth_1.requireRole)(['SEEKER']), async (req, res) => {
    try {
        const savedJobs = await db_1.prisma.savedJob.findMany({
            where: { userId: req.user.userId },
            include: {
                job: {
                    include: {
                        employer: {
                            select: {
                                companyName: true,
                                logoUrl: true,
                                location: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({ success: true, savedJobs: savedJobs.map(sj => sj.job) });
    }
    catch (error) {
        console.error('Fetch saved jobs error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// POST /api/jobs/save - Bookmark a job
router.post('/save', auth_1.authenticate, auth_1.requireAuth, (0, auth_1.requireRole)(['SEEKER']), async (req, res) => {
    try {
        const { jobId } = req.body;
        if (!jobId) {
            return res.status(400).json({ error: 'Missing jobId' });
        }
        const job = await db_1.prisma.job.findUnique({
            where: { id: jobId },
        });
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        const saved = await db_1.prisma.savedJob.create({
            data: {
                userId: req.user.userId,
                jobId,
            },
        });
        return res.status(201).json({ success: true, saved });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Job is already saved' });
        }
        console.error('Save job error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// DELETE /api/jobs/save - Unbookmark a job
router.delete('/save', auth_1.authenticate, auth_1.requireAuth, (0, auth_1.requireRole)(['SEEKER']), async (req, res) => {
    try {
        const jobId = req.query.jobId;
        if (!jobId) {
            return res.status(400).json({ error: 'Missing jobId parameter' });
        }
        await db_1.prisma.savedJob.delete({
            where: {
                userId_jobId: {
                    userId: req.user.userId,
                    jobId,
                },
            },
        });
        return res.status(200).json({ success: true, message: 'Job unsaved successfully' });
    }
    catch (error) {
        console.error('Unsave job error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// GET /api/jobs - List and search active jobs
router.get('/', async (req, res) => {
    try {
        const query = req.query.query || '';
        const location = req.query.location || '';
        const workMode = req.query.workMode || '';
        const jobType = req.query.jobType || '';
        const salaryMin = req.query.salaryMin ? parseInt(req.query.salaryMin, 10) : null;
        const isFeatured = req.query.featured === 'true';
        const whereClause = {
            status: 'ACTIVE',
        };
        if (query) {
            whereClause.OR = [
                { title: { contains: query } },
                { description: { contains: query } },
                { requirements: { contains: query } },
                { skills: { contains: query } },
            ];
        }
        if (location) {
            whereClause.location = { contains: location };
        }
        if (workMode) {
            whereClause.workMode = workMode;
        }
        if (jobType) {
            whereClause.jobType = jobType;
        }
        if (salaryMin !== null && !isNaN(salaryMin)) {
            whereClause.OR = [
                { salaryMax: { gte: salaryMin } },
                { salaryMin: { gte: salaryMin } },
            ];
        }
        if (isFeatured) {
            whereClause.isFeatured = true;
        }
        const jobs = await db_1.prisma.job.findMany({
            where: whereClause,
            include: {
                employer: {
                    select: {
                        id: true,
                        companyName: true,
                        logoUrl: true,
                        industry: true,
                        location: true,
                    },
                },
            },
            orderBy: [
                { isFeatured: 'desc' },
                { createdAt: 'desc' },
            ],
        });
        return res.status(200).json({ success: true, jobs });
    }
    catch (error) {
        console.error('Fetch jobs error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// POST /api/jobs - Create a new job listing
router.post('/', auth_1.authenticate, auth_1.requireAuth, (0, auth_1.requireRole)(['EMPLOYER']), async (req, res) => {
    try {
        const employerProfile = await db_1.prisma.employerProfile.findUnique({
            where: { userId: req.user.userId },
        });
        if (!employerProfile) {
            return res.status(404).json({ error: 'Employer profile not found' });
        }
        const { title, description, requirements, skills, location, workMode, jobType, salaryMin, salaryMax, hideSalary, deadline, } = req.body;
        if (!title || !description || !requirements || !skills || !location || !workMode || !jobType) {
            return res.status(400).json({ error: 'Missing required job fields' });
        }
        const job = await db_1.prisma.job.create({
            data: {
                employerId: employerProfile.id,
                title,
                description,
                requirements,
                skills,
                location,
                workMode,
                jobType,
                salaryMin: salaryMin ? parseInt(salaryMin, 10) : null,
                salaryMax: salaryMax ? parseInt(salaryMax, 10) : null,
                hideSalary: !!hideSalary,
                deadline: deadline ? new Date(deadline) : null,
                status: 'ACTIVE',
            },
        });
        return res.status(201).json({ success: true, job });
    }
    catch (error) {
        console.error('Create job error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// GET /api/homepage - Public landing page statistics and featured jobs
router.get('/homepage', async (req, res) => {
    try {
        const jobsCount = await db_1.prisma.job.count({ where: { status: 'ACTIVE' } });
        const companiesCount = await db_1.prisma.employerProfile.count();
        const seekersCount = await db_1.prisma.jobSeekerProfile.count();
        const featuredJobs = await db_1.prisma.job.findMany({
            where: { status: 'ACTIVE' },
            take: 6,
            include: {
                employer: {
                    select: {
                        companyName: true,
                        logoUrl: true,
                        location: true,
                    },
                },
            },
            orderBy: [
                { isFeatured: 'desc' },
                { createdAt: 'desc' },
            ],
        });
        return res.status(200).json({
            success: true,
            stats: {
                jobs: jobsCount,
                companies: companiesCount,
                seekers: seekersCount,
            },
            featuredJobs,
        });
    }
    catch (error) {
        console.error('Fetch homepage data error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// GET /api/jobs/:id - Fetch job details
router.get('/:id', async (req, res) => {
    try {
        const job = await db_1.prisma.job.findUnique({
            where: { id: req.params.id },
            include: {
                employer: {
                    select: {
                        id: true,
                        companyName: true,
                        logoUrl: true,
                        description: true,
                        industry: true,
                        size: true,
                        location: true,
                        websiteUrl: true,
                        linkedinUrl: true,
                    },
                },
            },
        });
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        return res.status(200).json({ success: true, job });
    }
    catch (error) {
        console.error('Fetch job detail error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// PUT /api/jobs/:id - Update job listing details
router.put('/:id', auth_1.authenticate, auth_1.requireAuth, (0, auth_1.requireRole)(['EMPLOYER']), async (req, res) => {
    try {
        const employerProfile = await db_1.prisma.employerProfile.findUnique({
            where: { userId: req.user.userId },
        });
        if (!employerProfile) {
            return res.status(404).json({ error: 'Employer profile not found' });
        }
        const job = await db_1.prisma.job.findUnique({
            where: { id: req.params.id },
        });
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        if (job.employerId !== employerProfile.id) {
            return res.status(403).json({ error: 'Forbidden. You do not own this job listing.' });
        }
        const { title, description, requirements, skills, location, workMode, jobType, salaryMin, salaryMax, hideSalary, status, deadline, } = req.body;
        const updatedJob = await db_1.prisma.job.update({
            where: { id: req.params.id },
            data: {
                title,
                description,
                requirements,
                skills,
                location,
                workMode,
                jobType,
                salaryMin: salaryMin ? parseInt(salaryMin, 10) : null,
                salaryMax: salaryMax ? parseInt(salaryMax, 10) : null,
                hideSalary: hideSalary !== undefined ? !!hideSalary : undefined,
                status,
                deadline: deadline ? new Date(deadline) : null,
            },
        });
        return res.status(200).json({ success: true, job: updatedJob });
    }
    catch (error) {
        console.error('Update job error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// DELETE /api/jobs/:id - Delete job listing
router.delete('/:id', auth_1.authenticate, auth_1.requireAuth, async (req, res) => {
    try {
        const job = await db_1.prisma.job.findUnique({
            where: { id: req.params.id },
        });
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        if (req.user.role !== 'ADMIN') {
            const employerProfile = await db_1.prisma.employerProfile.findUnique({
                where: { userId: req.user.userId },
            });
            if (!employerProfile || job.employerId !== employerProfile.id) {
                return res.status(403).json({ error: 'Forbidden. You do not have permission to delete this job.' });
            }
        }
        await db_1.prisma.job.delete({
            where: { id: req.params.id },
        });
        return res.status(200).json({ success: true, message: 'Job deleted successfully' });
    }
    catch (error) {
        console.error('Delete job error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
