# AlignIQ 🎯

AlignIQ is a comprehensive, web-based **Goal Setting & Tracking Portal** designed to streamline how organizations manage employee performance goals. From goal creation and manager approvals to quarterly check-ins and high-level analytics, AlignIQ provides a seamless, end-to-end workflow for the entire organization.

## 🚀 Live Demo Mode
The application currently features a robust **in-memory data store** and a **demo-mode role switcher**, allowing you to seamlessly test the workflows from the perspective of an Employee, a Manager, or an Admin without needing a backend server!

## ✨ Key Features

### 👤 Role-Based Workflows
- **Employee Persona**: Create structured goals, submit for manager approval, and log quarterly check-ins to track progress.
- **Manager Persona**: Review team goals, approve/reject with actionable feedback, and oversee team check-ins with added comments.
- **Admin Persona**: Gain high-level visibility across the organization, manage performance cycles, and track all system changes.

### 🎯 Goal Management
- **Structured Creation**: Goals require specific details including Title, Description, Thrust Area (e.g., Sales, HR, IT), and a Unit of Measurement (MIN, MAX, TIMELINE, ZERO).
- **Weightage Validation**: Employees must assign a percentage weightage to each goal. The total weightage must equal exactly 100% before submission.
- **Approval Engine**: Managers can review submitted goals in bulk or individually, and send back goals requiring revisions with comments.

### 📊 Quarterly Check-ins & Automatic Scoring
- Submit achievement data against locked goals.
- The system automatically calculates a **Progress Score (0-100%)** based on the goal's target value and its Unit of Measurement type.

### 📈 Analytics & Reporting
- **Achievement Report**: Detailed, filterable data table of employee achievements with CSV export functionality.
- **Completion Dashboard**: Organization-wide metrics breaking down goal completion rates by department and specific managers.
- **Visual Analytics**: Interactive charts built with Recharts, displaying status distributions and performance averages.
- **Audit Trail**: A complete historical log of all goal updates and status transitions for compliance and tracking.

## 🛠️ Technology Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand (with in-memory persistence for demo purposes)
- **Styling**: Vanilla CSS with a custom, premium dark-mode Design System (Glassmorphism + CSS Variables)
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Routing**: React Router DOM

## 💻 Getting Started

To run this project locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/kshitij1908/aligniq.git
   cd aligniq
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Explore the app**
   Open `http://localhost:5173` in your browser. Click on any user card on the login screen to start exploring the application!

## 🛣️ Future Roadmap (Phase 2)
While Phase 1 focused on creating a highly interactive and fully-featured frontend prototype, Phase 2 will involve:
- Connecting to a **Node.js Express** backend.
- Migrating data to a **PostgreSQL** database (via Supabase).
- Implementing JWT-based authentication.

---
*Created by [Kshitij](https://github.com/kshitij1908).*
