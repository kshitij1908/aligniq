import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/shared/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import GoalForm from './components/Goal/GoalForm';
import GoalList from './components/Goal/GoalList';
import GoalApproval from './components/Goal/GoalApproval';
import CheckInForm from './components/CheckIn/CheckInForm';
import ManagerCheckIn from './components/CheckIn/ManagerCheckIn';
import AchievementReport from './components/Reports/AchievementReport';
import CompletionDashboard from './components/Reports/CompletionDashboard';
import AuditTrail from './components/Reports/AuditTrail';
import Analytics from './components/Reports/Analytics';
import AdminPage from './pages/AdminPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="goals" element={<GoalList />} />
          <Route path="goals/new" element={<GoalForm />} />
          <Route path="approval" element={<GoalApproval />} />
          <Route path="check-ins" element={<CheckInForm />} />
          <Route path="team-checkins" element={<ManagerCheckIn />} />
          <Route path="reports/achievement" element={<AchievementReport />} />
          <Route path="reports/completion" element={<CompletionDashboard />} />
          <Route path="reports/analytics" element={<Analytics />} />
          <Route path="reports/audit" element={<AuditTrail />} />
          <Route path="admin/cycles" element={<AdminPage />} />
          <Route path="admin/users" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
