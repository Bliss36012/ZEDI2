import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILES = {
  PATIENTS: path.join(DATA_DIR, 'patients.json'),
  BOOKINGS: path.join(DATA_DIR, 'bookings.json'),
  REMINDERS: path.join(DATA_DIR, 'reminders.json'),
  USERS: path.join(DATA_DIR, 'users.json'),
  LOGIN_LOGS: path.join(DATA_DIR, 'login_logs.json'),
};

async function ensureDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    for (const [key, file] of Object.entries(DATA_FILES)) {
      try {
        await fs.access(file);
      } catch {
        await fs.writeFile(file, JSON.stringify([]));
      }
    }
  } catch (error) {
    console.error("Error creating data directory:", error);
  }
}

import { 
  format, startOfDay, startOfWeek, startOfMonth, startOfYear, 
  subDays, subMonths, isWithinInterval, parseISO, endOfDay
} from 'date-fns';
import ExcelJS from 'exceljs';
import * as docx from 'docx';
import PptxGenJS from 'pptxgenjs';

async function readDataFile(file: string) {
  try {
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.warn(`File ${file} was corrupted or missing. Resetting to [].`);
    await fs.writeFile(file, JSON.stringify([]));
    return [];
  }
}

async function startServer() {
  await ensureDataFiles();
  const app = express();
  app.use(express.json());
  
  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API ${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
  });

  const PORT = 3000;

  // Stats Helper
  const getPeriodStats = (patients: any[], bookings: any[], reminders: any[], period: string) => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily': startDate = startOfDay(now); break;
      case 'weekly': startDate = startOfWeek(now); break;
      case 'monthly': startDate = startOfMonth(now); break;
      case 'semi-annually': startDate = subMonths(now, 6); break;
      case 'annually': startDate = startOfYear(now); break;
      default: startDate = startOfMonth(now);
    }

    const interval = { start: startDate, end: endOfDay(now) };

    const periodPatients = patients.filter(p => isWithinInterval(parseISO(p.createdAt || p.dob), interval));
    const periodBookings = bookings.filter(b => isWithinInterval(parseISO(b.date), interval));
    const periodReminders = reminders.filter(r => isWithinInterval(parseISO(r.date), interval));

    const totalConsultations = patients.reduce((acc, p) => {
      const visits = p.medicalHistory?.filter((m: any) => isWithinInterval(parseISO(m.date), interval)) || [];
      return acc + visits.length;
    }, 0);

    const bookingStats = {
      total: periodBookings.length,
      scheduled: periodBookings.filter(b => b.status === 'Scheduled').length,
      completed: periodBookings.filter(b => b.status === 'Completed').length,
      cancelled: periodBookings.filter(b => b.status === 'Cancelled').length
    };

    const reminderStats = {
      total: periodReminders.length,
      completed: periodReminders.filter(r => r.completed).length,
      pending: periodReminders.filter(r => !r.completed).length
    };

    return {
      period,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(now, 'yyyy-MM-dd'),
      newPatients: periodPatients.length,
      totalConsultations,
      bookingStats,
      reminderStats,
      patients: patients.length,
      locationStats: patients.reduce((acc, p) => {
        p.medicalHistory?.forEach((m: any) => {
          if (isWithinInterval(parseISO(m.date), interval)) {
            acc[m.location] = (acc[m.location] || 0) + 1;
          }
        });
        return acc;
      }, {} as Record<string, number>)
    };
  };

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Auth Routes
  app.post("/api/login", async (req, res) => {
    console.log(`Login attempt for username: ${req.body.username}`);
    try {
      const { fullName, username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const users = await readDataFile(DATA_FILES.USERS);

      let user = users.find((u: any) => u.username === username);

      if (!user) {
        // First login with this username: Save credentials
        user = { 
          fullName: fullName || username, 
          username, 
          password, 
          createdAt: new Date().toISOString() 
        };
        users.push(user);
        await fs.writeFile(DATA_FILES.USERS, JSON.stringify(users));
      } else {
        // Subsequent logins MUST use the same credentials
        if (user.password !== password) {
          return res.status(401).json({ error: "Access denied. Incorrect credentials for this username." });
        }
      }

      // Log the successful login
      const logs = await readDataFile(DATA_FILES.LOGIN_LOGS);
      logs.push({ username, timestamp: new Date().toISOString() });
      await fs.writeFile(DATA_FILES.LOGIN_LOGS, JSON.stringify(logs.slice(-500))); // Keep more logs

      res.json({ success: true, user: { fullName: user.fullName, username: user.username } });
    } catch (error) {
      res.status(500).json({ error: "Login system failure" });
    }
  });

  // API Routes
  app.get("/api/patients", async (req, res) => {
    try {
      const data = await fs.readFile(DATA_FILES.PATIENTS, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: "Failed to read patients" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      await fs.writeFile(DATA_FILES.PATIENTS, JSON.stringify(req.body));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save patients" });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const data = await fs.readFile(DATA_FILES.BOOKINGS, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: "Failed to read bookings" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      await fs.writeFile(DATA_FILES.BOOKINGS, JSON.stringify(req.body));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save bookings" });
    }
  });

  app.get("/api/reminders", async (req, res) => {
    try {
      const data = await fs.readFile(DATA_FILES.REMINDERS, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: "Failed to read reminders" });
    }
  });

  app.post("/api/reminders", async (req, res) => {
    try {
      await fs.writeFile(DATA_FILES.REMINDERS, JSON.stringify(req.body));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save reminders" });
    }
  });

  app.get("/api/reports/excel", async (req, res) => {
    try {
      const period = (req.query.period as string) || 'monthly';
      const [patients, bookings, reminders] = await Promise.all([
        fs.readFile(DATA_FILES.PATIENTS, 'utf-8').then(JSON.parse).catch(() => []),
        fs.readFile(DATA_FILES.BOOKINGS, 'utf-8').then(JSON.parse).catch(() => []),
        fs.readFile(DATA_FILES.REMINDERS, 'utf-8').then(JSON.parse).catch(() => []),
      ]);

      const stats = getPeriodStats(patients, bookings, reminders, period);
      const workbook = new ExcelJS.Workbook();
      
      // Summary Sheet
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 20 }
      ];
      summarySheet.addRows([
        { metric: 'Report Period', value: stats.period.toUpperCase() },
        { metric: 'Start Date', value: stats.startDate },
        { metric: 'End Date', value: stats.endDate },
        { metric: 'Total Patients', value: stats.patients },
        { metric: 'New Patients (Period)', value: stats.newPatients },
        { metric: 'Total Consultations', value: stats.totalConsultations },
        { metric: 'Scheduled Bookings', value: stats.bookingStats.scheduled },
        { metric: 'Completed Bookings', value: stats.bookingStats.completed },
        { metric: 'Completed Reminders', value: stats.reminderStats.completed }
      ]);

      // Patients Sheet
      const patientsSheet = workbook.addWorksheet('Patients');
      patientsSheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'DOB', key: 'dob', width: 15 },
        { header: 'Gender', key: 'gender', width: 10 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Email', key: 'email', width: 25 }
      ];
      patientsSheet.addRows(patients);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=siha_angavu_report_${period}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate Excel report" });
    }
  });

  app.get("/api/reports/word", async (req, res) => {
    try {
      const period = (req.query.period as string) || 'monthly';
      const [patients, bookings, reminders] = await Promise.all([
        fs.readFile(DATA_FILES.PATIENTS, 'utf-8').then(JSON.parse).catch(() => []),
        fs.readFile(DATA_FILES.BOOKINGS, 'utf-8').then(JSON.parse).catch(() => []),
        fs.readFile(DATA_FILES.REMINDERS, 'utf-8').then(JSON.parse).catch(() => []),
      ]);

      const stats = getPeriodStats(patients, bookings, reminders, period);
      
      const doc = new docx.Document({
        sections: [{
          properties: {},
          children: [
            new docx.Paragraph({
              text: "SIHA ANGAVU - MEDICAL MANAGEMENT SYSTEM",
              heading: docx.HeadingLevel.TITLE,
              alignment: docx.AlignmentType.CENTER,
            }),
            new docx.Paragraph({
              text: `${period.toUpperCase()} PERFORMANCE REPORT`,
              heading: docx.HeadingLevel.HEADING_1,
              alignment: docx.AlignmentType.CENTER,
            }),
            new docx.Paragraph({ text: `Generated on: ${new Date().toLocaleString()}`, alignment: docx.AlignmentType.CENTER }),
            new docx.Paragraph({ text: "" }),
            new docx.Paragraph({ text: "1. Statistics Overview", heading: docx.HeadingLevel.HEADING_2 }),
            new docx.Paragraph({ text: `• Period: ${stats.startDate} to ${stats.endDate}` }),
            new docx.Paragraph({ text: `• Total New Patients: ${stats.newPatients}` }),
            new docx.Paragraph({ text: `• Total Consultations: ${stats.totalConsultations}` }),
            new docx.Paragraph({ text: `• Booking Completion: ${stats.bookingStats.completed} / ${stats.bookingStats.total}` }),
            new docx.Paragraph({ text: "" }),
            new docx.Paragraph({ text: "2. Attendance Locations", heading: docx.HeadingLevel.HEADING_2 }),
            ...Object.entries(stats.locationStats).map(([loc, count]) => 
              new docx.Paragraph({ text: `• ${loc}: ${count} visits` })
            ),
          ],
        }],
      });

      const buffer = await docx.Packer.toBuffer(doc);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename=siha_angavu_report_${period}.docx`);
      res.send(buffer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate Word report" });
    }
  });

  app.get("/api/reports/ppt", async (req, res) => {
    try {
      const period = (req.query.period as string) || 'monthly';
      const [patients, bookings, reminders] = await Promise.all([
        fs.readFile(DATA_FILES.PATIENTS, 'utf-8').then(JSON.parse).catch(() => []),
        fs.readFile(DATA_FILES.BOOKINGS, 'utf-8').then(JSON.parse).catch(() => []),
        fs.readFile(DATA_FILES.REMINDERS, 'utf-8').then(JSON.parse).catch(() => []),
      ]);

      const stats = getPeriodStats(patients, bookings, reminders, period);
      const pres = new PptxGenJS();
      
      // Title Slide
      let slide = pres.addSlide();
      slide.addText("SIHA ANGAVU", { x: 1, y: 1, w: '80%', fontSize: 44, color: '00695c', bold: true, align: 'center' });
      slide.addText(`${period.toUpperCase()} PERFORMANCE SUMMARY`, { x: 1, y: 2, w: '80%', fontSize: 28, color: '666666', align: 'center' });
      slide.addText(`Report Date: ${new Date().toLocaleDateString()}`, { x: 1, y: 4, w: '80%', fontSize: 14, color: '999999', align: 'center' });

      // Stats Slide
      slide = pres.addSlide();
      slide.addText("Key Statistics", { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: '00695c' });
      slide.addText([
        { text: `New Patients: ${stats.newPatients}\n`, options: { fontSize: 20 } },
        { text: `Total Consultations: ${stats.totalConsultations}\n`, options: { fontSize: 20 } },
        { text: `Completed Appointments: ${stats.bookingStats.completed}\n`, options: { fontSize: 20 } },
        { text: `Reminder Success Rate: ${((stats.reminderStats.completed / (stats.reminderStats.total || 1)) * 100).toFixed(1)}%`, options: { fontSize: 20 } }
      ], { x: 0.5, y: 1.5, w: '90%' });

      const buffer = await (pres as any).write('nodebuffer') as Buffer;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      res.setHeader('Content-Disposition', `attachment; filename=siha_angavu_report_${period}.pptx`);
      res.send(buffer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate PPT report" });
    }
  });

  app.get("/api/report", async (req, res) => {
    try {
      const [patients, bookings, reminders] = await Promise.all([
        fs.readFile(DATA_FILES.PATIENTS, 'utf-8').then(JSON.parse).catch(() => []),
        fs.readFile(DATA_FILES.BOOKINGS, 'utf-8').then(JSON.parse).catch(() => []),
        fs.readFile(DATA_FILES.REMINDERS, 'utf-8').then(JSON.parse).catch(() => []),
      ]);

      const calculateAge = (dob: string) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      };

      let report = `SIHA ANGAVU - SYSTEM DATA REPORT\n`;
      report += `Generated on: ${new Date().toLocaleString()}\n`;
      report += `==========================================\n\n`;

      report += `1. PATIENTS LIST (${patients.length} total)\n`;
      report += `------------------------------------------\n`;
      if (patients.length === 0) {
        report += `No patient records found.\n`;
      } else {
        patients.forEach((p: any, i: number) => {
          const dobStr = p.dob || '';
          const age = dobStr ? calculateAge(dobStr) : 'N/A';
          const lastVisit = (p.medicalHistory && p.medicalHistory.length > 0) 
            ? p.medicalHistory[p.medicalHistory.length - 1].date 
            : 'No visits recorded';
          
          report += `${i + 1}. ${p.name || 'Unknown Patient'} (ID: ${p.id || 'N/A'})\n`;
          report += `   DOB: ${dobStr || 'Not specified'} (Age: ${age}) | Gender: ${p.gender || 'Not specified'}\n`;
          report += `   Phone: ${p.phone || 'N/A'} | Email: ${p.email || 'N/A'}\n`;
          report += `   Address: ${p.address || 'N/A'}\n`;
          report += `   Last Visit: ${lastVisit}\n`;
          report += `   Medical History Summary:\n`;
          if (p.medicalHistory && p.medicalHistory.length > 0) {
            p.medicalHistory.forEach((m: any) => {
              report += `     - ${m.date || 'No Date'}: ${m.diagnosis || 'No Diagnosis'} (${m.doctor || 'Unknown Doctor'} at ${m.location || 'Unknown Location'})\n`;
            });
          } else {
            report += `     - No records found\n`;
          }
          report += `\n`;
        });
      }

      report += `\n2. BOOKINGS & APPOINTMENTS (${bookings.length} total)\n`;
      report += `------------------------------------------\n`;
      if (bookings.length === 0) {
        report += `No upcoming bookings found.\n`;
      } else {
        bookings.forEach((b: any, i: number) => {
          report += `${i + 1}. Patient: ${b.patientName || 'Unknown'}\n`;
          report += `   Date: ${b.date || 'N/A'} | Time: ${b.time || 'N/A'}\n`;
          report += `   Type: ${b.type || 'N/A'}\n`;
          report += `   Status: ${b.status || 'N/A'}\n`;
          if (b.notes) report += `   Notes: ${b.notes}\n`;
          report += `\n`;
        });
      }

      report += `\n3. ACTIVE REMINDERS (${reminders.length} total)\n`;
      report += `------------------------------------------\n`;
      if (reminders.length === 0) {
        report += `No active reminders found.\n`;
      } else {
        reminders.forEach((r: any, i: number) => {
          report += `${i + 1}. Title: ${r.title || 'Untitled'}\n`;
          report += `   Description: ${r.description || 'No description'}\n`;
          report += `   Date: ${r.date || 'N/A'} | Time: ${r.time || 'N/A'}\n`;
          report += `   Type: ${r.type || 'N/A'} | Status: ${r.completed ? 'Completed' : 'Pending'}\n\n`;
        });
      }

      report += `\n==========================================\n`;
      report += `End of Report\n`;

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename=siha_angavu_summary_report.txt');
      res.send(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  app.get("/api/export", async (req, res) => {
    try {
      const [patients, bookings, reminders] = await Promise.all([
        fs.readFile(DATA_FILES.PATIENTS, 'utf-8').then(JSON.parse).catch(() => []),
        fs.readFile(DATA_FILES.BOOKINGS, 'utf-8').then(JSON.parse).catch(() => []),
        fs.readFile(DATA_FILES.REMINDERS, 'utf-8').then(JSON.parse).catch(() => []),
      ]);

      const exportData = {
        patients,
        bookings,
        reminders,
        exportedAt: new Date().toISOString(),
        version: "1.0.0"
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=siha_angavu_backup.json');
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  app.post("/api/restore", async (req, res) => {
    try {
      const { patients, bookings, reminders } = req.body;
      
      if (!patients || !bookings || !reminders) {
        return res.status(400).json({ error: "Invalid backup file format" });
      }

      await Promise.all([
        fs.writeFile(DATA_FILES.PATIENTS, JSON.stringify(patients)),
        fs.writeFile(DATA_FILES.BOOKINGS, JSON.stringify(bookings)),
        fs.writeFile(DATA_FILES.REMINDERS, JSON.stringify(reminders)),
      ]);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to restore data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the dist folder
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // SPA fallback: handle all routes by serving index.html
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
