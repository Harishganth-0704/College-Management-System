# 🎓 College Management System

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue)](https://www.mongodb.com/mern-stack)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v17+-blue)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)](https://mongodb.com)

> A full-featured College Management System built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). It supports three user roles — **Admin**, **Faculty**, and **Student** — each with their own dedicated dashboard and features.

---

## 🚀 Live Features Overview

### 🛡️ Admin Features
| Feature | Description |
|---|---|
| 📊 Dashboard | Live stats — total students, faculty, branches, attendance health |
| 👩‍🎓 Student Management | Add, update, delete student accounts |
| 👨‍🏫 Faculty Management | Add, update, delete faculty accounts with full profiles |
| 🏛️ Branch Management | Manage college departments/branches |
| 📚 Subject Management | Add subjects per branch and semester |
| 📢 Notice Board | Post announcements for students and faculty |
| 📝 Exam Management | Manage exam schedules |
| 🗒️ My Notes | Create private/public notes with tag filters |
| 🔔 Notifications | View system-wide alerts and updates |
| 🔐 Audit Logs | View all system activity logs |

### 👨‍🏫 Faculty Features
| Feature | Description |
|---|---|
| 👤 Profile | View and edit personal profile with photo |
| 📅 Timetable | View and upload class timetables |
| 📦 Materials | Upload study materials (notes, assignments, etc.) |
| 📢 Notice | View college notices |
| 🔍 Student Info | Search students by name, enrollment, or semester |
| 📊 Marks | Enter and manage student marks |
| ✅ Attendance | Mark class-wise attendance (Present / Absent / Late) |
| 🗒️ My Notes | Personal note-taking with public sharing |
| 🔔 Notifications | Get alerts for students with low attendance |

### 🎓 Student Features
| Feature | Description |
|---|---|
| 👤 Profile | View personal academic profile |
| 📅 Timetable | View class schedules |
| 📦 Materials | Download study materials uploaded by faculty |
| 📢 Notice | View college announcements |
| 📝 Marks | View internal assessment marks |
| 📉 Attendance | Subject-wise attendance with % progress bars |
| 🖨️ Download Report | Print/Download attendance as a PDF report |
| 🗒️ My Notes | Personal notes with public link sharing |
| 🔔 Notifications | Automatic low attendance warnings (<75%) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js + Redux + Tailwind CSS |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas (Cloud) |
| **Auth** | JWT (JSON Web Tokens) |
| **File Storage** | Multer (local media storage) |
| **Email** | Nodemailer (password reset) |

---

## ⚙️ How to Run in VS Code (Step by Step)

### Prerequisites
Make sure you have these installed first:
- [Node.js](https://nodejs.org/) (v14 or above)
- [VS Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/)

---

### Step 1: Clone the Repository
Open VS Code → Press **Ctrl + `** to open Terminal, then run:

```bash
git clone https://github.com/Harishganth-0704/College-Management-System.git
cd College-Management-System
```

---

### Step 2: Setup Backend `.env` File
Go into the `backend` folder and create a file named `.env`:

```bash
cd backend
```

Create `.env` with this content:

```env
MONGODB_URI=<your-mongodb-atlas-uri>
PORT=4000
FRONTEND_API_LINK=http://localhost:3000
JWT_SECRET=THISISSECRET
NODEMAILER_EMAIL=your-email@gmail.com
NODEMAILER_PASS=your-app-password
```

> 💡 **MongoDB Atlas URI**: Go to [mongodb.com](https://cloud.mongodb.com) → Create a free cluster → Click "Connect" → Copy the connection string.

---

### Step 3: Setup Frontend `.env` File
Go into the `frontend` folder and create a file named `.env`:

```env
REACT_APP_APILINK=http://localhost:4000/api
REACT_APP_MEDIA_LINK=http://localhost:4000/media
```

---

### Step 4: Install Dependencies

Open **two separate terminals** in VS Code:

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm start
```

---

### Step 5: Open in Browser
Once both servers are running, open your browser and go to:

```
http://localhost:3000
```

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@gmail.com | admin123 |

> ⚠️ After first login, please change the password immediately from the Profile section.

---

## 👥 How to Use — Role-wise Guide

### 🛡️ Admin
1. Login at `localhost:3000` → Select **Admin** → Enter credentials.
2. Go to **Faculty** tab → Add new faculty members.
3. Go to **Student** tab → Add new students (assign branch, semester, enrollment no).
4. Go to **Branch** and **Subjects** tabs to set up the college structure.
5. Use **Dashboard** to monitor overall college stats at a glance.
6. Use **Notifications** to check system alerts.

### 👨‍🏫 Faculty
1. Login → Select **Faculty** → Enter your email & password.
2. Your Admin will give you the login credentials when registering you.
3. Go to **Attendance** → Select branch, semester, subject, date → Mark students as Present/Absent/Late → Submit.
4. Go to **Materials** → Upload study materials for students.
5. Go to **Marks** → Enter student marks.
6. Go to **Notifications** to see which students have low attendance.

### 🎓 Student
1. Login → Select **Student** → Enter your email & password.
2. Go to **Attendance** → See subject-wise attendance with % progress bars.
3. Click **"Download Report"** to print/save attendance as PDF.
4. Go to **Materials** → Download study notes uploaded by your teachers.
5. Go to **Notifications** → Check if any subjects have low attendance warnings.
6. Go to **My Notes** → Create your own personal study notes.

---

## 📁 Project Structure

```
College-Management-System/
├── backend/
│   ├── controllers/       → API logic (admin, faculty, student, attendance, notes...)
│   ├── models/            → MongoDB schemas
│   ├── routes/            → Express API routes
│   ├── middlewares/       → Auth (JWT), file upload (Multer)
│   ├── utils/             → Helper functions
│   ├── media/             → Uploaded profile photos & files
│   └── index.js           → Server entry point
│
├── frontend/
│   ├── src/
│   │   ├── Screens/
│   │   │   ├── Admin/     → Admin dashboard pages
│   │   │   ├── Faculty/   → Faculty dashboard pages
│   │   │   └── Student/   → Student dashboard pages
│   │   ├── components/    → Shared UI components
│   │   ├── redux/         → State management
│   │   └── utils/         → Axios config, helpers
│   └── public/
│
└── README.md
```

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/login` | Admin login |
| POST | `/api/faculty/login` | Faculty login |
| POST | `/api/student/login` | Student login |
| GET | `/api/attendance/my-summary` | Student: subject-wise attendance |
| GET | `/api/attendance/my-report` | Student: printable HTML report |
| POST | `/api/attendance` | Faculty: submit attendance |
| GET | `/api/attendance/admin-summary` | Admin: overall attendance stats |
| GET | `/api/note` | Get user's notes |
| POST | `/api/note` | Create a note |
| GET | `/api/public-note/:noteId` | View public note (no auth needed) |

---

## 📬 For Any Doubt Feel Free To Contact Me 🚀

- [My Portfolio](https://github.com/Harishganth-0704/portfolio)
- [LinkedIn](https://linkedin.com/in/harishganth07)
- [hkanth742@gmail.com](mailto:hkanth742@gmail.com)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
