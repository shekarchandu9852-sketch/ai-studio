import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory backend data for Node.js API endpoints
const students = [
  { id: 'stu-001', name: 'Alex Rivera', rollNo: '2024-ISE-001', email: 'alex.rivera@mitmysuru.in', attendance: 81.4 },
  { id: 'stu-002', name: 'Sarah Chen', rollNo: '2024-ISE-002', email: 'sarah.chen@mitmysuru.in', attendance: 95.2 },
  { id: 'stu-003', name: 'David Kim', rollNo: '2024-ISE-003', email: 'david.kim@mitmysuru.in', attendance: 88.7 },
  { id: 'stu-004', name: 'Marcus Brody', rollNo: '2024-ISE-004', email: 'marcus.brody@mitmysuru.in', attendance: 71.8 },
  { id: 'stu-005', name: 'Priya Patel', rollNo: '2024-ISE-005', email: 'priya.patel@mitmysuru.in', attendance: 89.6 },
  { id: 'stu-006', name: 'Jordan Hayes', rollNo: '2024-ISE-006', email: 'jordan.hayes@mitmysuru.in', attendance: 83.1 },
  { id: 'stu-007', name: 'Elena Rostova', rollNo: '2024-ISE-007', email: 'elena.rostova@mitmysuru.in', attendance: 92.2 },
  { id: 'stu-008', name: 'Chloe Bennett', rollNo: '2024-ISE-008', email: 'chloe.bennett@mitmysuru.in', attendance: 62.3 },
];

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'AcademiaGuard Node.js Attendance & Warning Engine',
    timestamp: new Date().toISOString(),
    ruleThreshold: 85.0,
  });
});

// Get all students
app.get('/api/students', (req: Request, res: Response) => {
  res.json(students);
});

// Automated scan & warning notices endpoint
app.post('/api/warnings/dispatch-automated', (req: Request, res: Response) => {
  const deficient = students.filter((s) => s.attendance < 85.0);
  const notices = deficient.map((s) => ({
    id: `WARN-AUTO-${Date.now()}-${s.id}`,
    studentId: s.id,
    studentName: s.name,
    attendance: s.attendance,
    threshold: 85.0,
    severity: s.attendance < 65 ? 'CRITICAL' : s.attendance < 75 ? 'DEBARMENT' : 'CAUTION',
    dispatchedAt: new Date().toISOString(),
    channels: ['STUDENT_PORTAL', 'PARENT_EMAIL', 'SMS'],
  }));

  res.json({
    success: true,
    count: notices.length,
    notices,
  });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AcademiaGuard Node.js Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
