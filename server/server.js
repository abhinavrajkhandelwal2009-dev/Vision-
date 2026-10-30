import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

import { initializeDatabase } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import inspectionRoutes from './routes/inspectionRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security: Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false
});

const inspectLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 120
});

// Middleware configuration
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsing with 50MB ceiling for high-res visual asset payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// System Health Check (Exempt from rate limits)
app.get('/api/health', (req, res) => {
  const isSupabase = !!(process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('your-project-id'));
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'VisionIntelligence AI Server',
    version: '1.0.0',
    platform: 'Render + Supabase Architecture',
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_actual_gemini_api_key_here'),
    supabaseConfigured: isSupabase,
    supabaseUrl: isSupabase ? process.env.SUPABASE_URL : null
  });
});

// Apply rate limiters to operational endpoints
app.use('/api', apiLimiter);
app.use('/api/inspect', inspectLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', inspectionRoutes);

// Serve static frontend assets if built
const clientDist = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>VisionIntelligence AI</title><style>body{font-family:sans-serif;padding:40px;background:#0f172a;color:#f8fafc;}</style></head>
        <body>
          <h2>VisionIntelligence AI Backend Active (Port ${PORT})</h2>
          <p>API endpoints ready. Start the frontend development server via: <code>cd client && npm run dev</code></p>
          <p>Health check: <a href="/api/health" style="color:#38bdf8;">/api/health</a></p>
        </body>
        </html>
      `);
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected internal server error occurred.'
  });
});

// Start Server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`🚀 VisionIntelligence AI Server running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🛡️  Role-Based Access Control & RLS Middleware active`);
      console.log(`🔍 Gemini Vision SDK Engine loaded`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();
