"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Import routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const jobRoutes_1 = __importDefault(require("./routes/jobRoutes"));
const seekerRoutes_1 = __importDefault(require("./routes/seekerRoutes"));
const employerRoutes_1 = __importDefault(require("./routes/employerRoutes"));
const applicationRoutes_1 = __importDefault(require("./routes/applicationRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware setup
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Serve static upload assets
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../public/uploads')));
// Register API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/jobs', jobRoutes_1.default);
app.use('/api/seeker', seekerRoutes_1.default);
app.use('/api/employer', employerRoutes_1.default);
app.use('/api/applications', applicationRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', uptime: process.uptime() });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});
// Start listening
app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
});
