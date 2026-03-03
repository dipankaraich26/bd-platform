"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const businesses_routes_1 = __importDefault(require("./routes/businesses.routes"));
const projects_routes_1 = __importDefault(require("./routes/projects.routes"));
const feedback_routes_1 = __importDefault(require("./routes/feedback.routes"));
const milestones_routes_1 = __importDefault(require("./routes/milestones.routes"));
const stats_routes_1 = __importDefault(require("./routes/stats.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));
// API routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/businesses', businesses_routes_1.default);
app.use('/api/projects', projects_routes_1.default);
app.use('/api/feedback', feedback_routes_1.default);
app.use('/api/milestones', milestones_routes_1.default);
app.use('/api/stats', stats_routes_1.default);
app.use(error_middleware_1.errorHandler);
app.listen(PORT, () => {
    console.log(`BD Platform backend running on port ${PORT}`);
});
exports.default = app;
