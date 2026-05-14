# Siha Angavu - Hospital Management System

A full-stack medical management system for patient records, appointments, and report generation.

## How to Access and Host This System

### 1. Instant Access (Online)
You can access your system immediately using these links:
- **Shared App Link (Standalone/Client View):** [Click Here to Open App](https://ais-pre-obkupkdryz6x45eeninz55-240591621421.europe-west3.run.app)
  *(Give this link to your client. It works like a normal app without the code editor.)*
- **Development App Link (With Editor):** [Open Dev View](https://ais-dev-obkupkdryz6x45eeninz55-240591621421.europe-west3.run.app)

### 2. Simple Deployment with HTTPS (Self-Hosting)
The easiest way to host this yourself for free with **full HTTPS support** is using **Render** or **Railway**:

#### Option A: Render.com (Recommended)
1. Upload your code to a **GitHub** repository.
2. Sign up at [Render.com](https://render.com).
3. Click "New" > "Web Service".
4. Connect your GitHub repository.
5. Set:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
6. Render will automatically provide an `https://...` URL for your app.

#### Option B: Local PC with HTTPS
If you run it on your local PC (`localhost:3000`), it is standard `http`. To make it `https` and accessible everywhere:
1. Use **Ngrok**: Download it and run `ngrok http 3000`.
2. It will give you a public `https://...` link that maps to your local machine.

## Important: Standalone App Version (Icon)
To make this look like a "normal app" on your phone or desktop:
1. Open the [Shared App Link](https://ais-pre-obkupkdryz6x45eeninz55-240591621421.europe-west3.run.app) in **Chrome** or **Safari**.
2. Click the **"Install App"** icon in the address bar (on Desktop) or **"Add to Home Screen"** (on Mobile).
3. It will now have its own icon and open without the browser navigation bar.

## Features
- **Standalone App**: Can be installed as a PWA on your desktop or phone (look for the "Install" icon in your browser address bar).
- **Secure Login**: Credentials are saved on the first login. Subsequent logins with the same username require the same password.
- **Reports**: Download Daily, Weekly, Monthly, or Annual reports in Word (.docx), Excel (.xlsx), or PowerPoint (.pptx) formats.
- **Statistics**: Visual analytics for patient attendance and clinical performance.

## Icons
The app is configured with a Hospital icon for the PWA experience.
