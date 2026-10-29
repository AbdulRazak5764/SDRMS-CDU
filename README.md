# Chaitanya (Deemed to be University) — Staff Digital Records Management System (SDRMS)
### Location: Hyderabad, Telangana, India | Administrative Authority: Registrar | Academic Leadership: Vice-Chancellor

A production-grade, enterprise Full-Stack **University Staff Digital Records Management System (SDRMS)** built to manage faculty, non-teaching, administrative, and technical records across all university faculties and constituent units.

---

## 🏛️ Institutional Features & Scope

1. **Institutional Identity**:
   - **University**: Chaitanya (Deemed to be University)
   - **Headquarters**: Hyderabad, Telangana, India
   - **Faculties & Departments**: Faculty of Science, Faculty of Engineering & Technology, Faculty of Allied Health Sciences, Faculty of Pharmacy, Faculty of Commerce & Business Management, Faculty of Nursing, Faculty of Agriculture.
   - **Theme**: Enterprise Navy Blue (`#0F2942`), Crisp Clean White (`#FFFFFF`), and Subtle Teal (`#0D9488`).

2. **User Roles & Strict RBAC Permissions**:
   - **Staff Member (Teaching & Non-Teaching)**: Self-entry for all 12 modules, passport photograph upload, PDF/image document uploads, draft saving, statutory declaration, profile submission, correction tracking, and printable dossier export.
   - **Department Head (HOD)**: Departmental staff review, document inspection, verification remarks, recommendation for approval, or return for correction.
   - **HR / Establishment Section**: Service record verification, employee ID maintenance, joining reports, experience verification, establishment reports.
   - **Registrar / Super Administrator**: Institution-wide management, master data administration (faculties, departments, designations, document compliance policies), system settings, audit logs, and authorized CSV exports.
   - **Vice-Chancellor (Read-Only)**: Executive dashboards, department strength breakdowns, progress tracking, and authorized reports.

---

## 📋 12-Module Staff Self-Entry System

| Section # | Module Title | Key Highlights & Validation |
|---|---|---|
| **Section 1** | **Basic Personal Information** | Employee ID (HR assigned), Full Name, Regional Name (Telugu/Hindi), Previous Name, DOB, Gender, Dual Addresses, Emergency Contact, and Passport Photo upload with live preview and 2MB validation. |
| **Section 2** | **Employment & Service Details** | Employee Category, Faculty, Department, Designation, Joining dates (University, Position, Department), Appointment order, and **Automated Service Duration Engine** (calculates University and Total experience with provisional/verified indicator). |
| **Section 3** | **Educational Qualifications** | Repeatable table for Diploma, UG, PG, M.Phil., Ph.D., and Postdoc with university, discipline, percentage/CGPA, registration number, and degree certificate scans. |
| **Section 4** | **Professional Qualifications & Eligibility** | Repeatable table for UGC-NET, CSIR-NET, SLET, GATE, GPAT, and Professional Council registrations (Pharmacy Council, Nursing Council, Bar Council). |
| **Section 5** | **Teaching Experience** | Collegiate and university teaching history with subjects taught, UG/PG/Ph.D. level involvement, and non-overlapping duration validation. |
| **Section 6** | **Research & Academic Contributions** | Indexed Publications (Scopus, Web of Science, UGC-CARE), Funded Projects (DST, DBT, AICTE), Patents, and Academic Contributions (Books, Awards, Ph.D. guidance). Includes a **"Not Applicable"** toggle for non-research/non-teaching staff. |
| **Section 7** | **Professional Development & Training** | Repeatable FDPs, orientation programmes, refresher courses, workshops, seminars, duration (hours/days), and mode (online/offline/hybrid). |
| **Section 8** | **Previous Employment History** | Prior organizational postings, joining and leaving dates, reason for leaving, and date sequence validation. |
| **Section 9** | **Salary & Payroll Reference Details** | Pay scale, basic pay, pay components, payroll code, disbursement bank, and **masked account identifiers** (`XXXX-XXXX-6789`) with strict role-restricted access. |
| **Section 10** | **Statutory & Administrative Documents** | Centralized upload vault for PDFs and images with **in-browser inline document previewer** and compliance status tracking. |
| **Section 11** | **Additional Service Information** | CAS promotions, leaves/deputations, departmental transfers, and service gap explanations. |
| **Section 12** | **Declaration & Final Submission** | Full profile preview, omission checklist with direct jump links to incomplete sections, exact statutory declaration checkbox, and electronic reference number generation (`CDU-SDRMS-2026-XXXX`). Profile locks automatically upon submission. |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ or v22+
- **Database**: SQLite with WAL mode (`sdrms.db` - automatically initialized with full master data)

### 2. Running the Application
```bash
# Start the full-stack server (serves API and production frontend on port 5000)
npm run server

# OR run Vite frontend in development mode with HMR on port 5173
npm run dev
```

Visit the application in your browser:
- Unified Application: **`http://localhost:5000`**
- Vite Dev Server: **`http://localhost:5173`**

---

## 🔑 Pre-Configured Test Accounts (1-Click Switcher Available)

For effortless review, the portal provides instant **1-Click Role Switcher buttons** directly on the login screen and top navigation bar:

| Role | Name & Title | Email | Default Password |
|---|---|---|---|
| **Teaching Faculty** | Dr. Ramesh Kumar Reddy (Asst. Prof, CSE) | `staff.teaching@chaitanya.edu.in` | `Staff@123` |
| **Non-Teaching Staff** | Ms. S. Sunitha (Senior Assistant, Admin) | `staff.admin@chaitanya.edu.in` | `Staff@123` |
| **Department Head (HOD)** | Dr. K. V. S. Sharma (HOD, CSE) | `hod.cse@chaitanya.edu.in` | `Hod@123` |
| **HR / Establishment** | Mr. M. Praveen (Assistant Registrar - HR) | `hr.establishment@chaitanya.edu.in` | `Hr@123` |
| **Registrar / Super Admin** | Dr. M. Sudhakar (Registrar) | `registrar@chaitanya.edu.in` | `Registrar@123` |
| **Vice-Chancellor** | Prof. G. Narayana (Vice-Chancellor) | `vc@chaitanya.edu.in` | `Vc@123` |

---

## 🖨️ Official Print & PDF Dossier

Clicking **"View / Print Profile Dossier"** opens a print-ready, official university letterhead layout:
- Chaitanya (Deemed to be University) official header and crest
- Passport photograph and verified identity summary
- Comprehensive tables for qualifications, service history, and research
- Document compliance seal
- Exact statutory declaration and counter-signature blocks for the Registrar.
- Supports single-click **"Print / Save as PDF"** formatted for A4 paper.
