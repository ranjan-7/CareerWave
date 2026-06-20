"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// PUT /api/employer/profile - Update employer profile
router.put('/profile', auth_1.authenticate, auth_1.requireAuth, (0, auth_1.requireRole)(['EMPLOYER']), async (req, res) => {
    try {
        const { companyName, logoUrl, coverUrl, description, industry, size, location, websiteUrl, linkedinUrl, } = req.body;
        if (!companyName) {
            return res.status(400).json({ error: 'Company name is required' });
        }
        const updatedProfile = await db_1.prisma.employerProfile.update({
            where: { userId: req.user.userId },
            data: {
                companyName,
                logoUrl,
                coverUrl,
                description,
                industry,
                size,
                location,
                websiteUrl,
                linkedinUrl,
            },
        });
        return res.status(200).json({ success: true, profile: updatedProfile });
    }
    catch (error) {
        console.error('Update employer profile error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// GET /api/employer/analytics - Retrieve recruiter stats & dashboards
router.get('/analytics', auth_1.authenticate, auth_1.requireAuth, (0, auth_1.requireRole)(['EMPLOYER']), async (req, res) => {
    try {
        const employer = await db_1.prisma.employerProfile.findUnique({
            where: { userId: req.user.userId },
        });
        if (!employer) {
            return res.status(404).json({ error: 'Employer profile not found' });
        }
        const totalJobs = await db_1.prisma.job.count({
            where: { employerId: employer.id },
        });
        const activeJobsCount = await db_1.prisma.job.count({
            where: { employerId: employer.id, status: 'ACTIVE' },
        });
        const totalApplications = await db_1.prisma.application.count({
            where: {
                job: { employerId: employer.id },
            },
        });
        const jobsList = await db_1.prisma.job.findMany({
            where: { employerId: employer.id },
            select: {
                id: true,
                title: true,
                status: true,
                createdAt: true,
                isFeatured: true,
                isUrgent: true,
                _count: {
                    select: {
                        applications: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const statusFunnel = await db_1.prisma.application.groupBy({
            by: ['status'],
            where: {
                job: { employerId: employer.id },
            },
            _count: {
                id: true,
            },
        });
        return res.status(200).json({
            success: true,
            analytics: {
                totalJobs,
                activeJobsCount,
                totalApplications,
                jobs: jobsList.map(j => ({
                    id: j.id,
                    title: j.title,
                    status: j.status,
                    createdAt: j.createdAt,
                    isFeatured: j.isFeatured,
                    isUrgent: j.isUrgent,
                    applicantsCount: j._count.applications,
                })),
                funnel: statusFunnel.map(stat => ({
                    status: stat.status,
                    count: stat._count.id,
                })),
            },
        });
    }
    catch (error) {
        console.error('Fetch employer analytics error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// GET /api/employer/candidates - Search candidate resume database
router.get('/candidates', auth_1.authenticate, auth_1.requireAuth, (0, auth_1.requireRole)(['EMPLOYER']), async (req, res) => {
    try {
        const skillsParam = req.query.skills || '';
        const locationParam = req.query.location || '';
        const whereClause = {
            visibility: { in: ['PUBLIC', 'EMPLOYERS_ONLY'] },
        };
        if (skillsParam) {
            whereClause.skills = { contains: skillsParam };
        }
        if (locationParam) {
            whereClause.location = { contains: locationParam };
        }
        const candidates = await db_1.prisma.jobSeekerProfile.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });
        return res.status(200).json({ success: true, candidates });
    }
    catch (error) {
        console.error('Fetch seekers error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
