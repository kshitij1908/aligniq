import React from 'react';
import { useAuthStore } from '../stores/authStore';
import EmployeeDashboard from '../components/Dashboard/EmployeeDashboard';
import ManagerDashboard from '../components/Dashboard/ManagerDashboard';
import AdminDashboard from '../components/Dashboard/AdminDashboard';

export default function DashboardPage() {
  const { currentUser } = useAuthStore();
  if (!currentUser) return null;

  switch (currentUser.role) {
    case 'ADMIN': return <AdminDashboard />;
    case 'MANAGER': return <ManagerDashboard />;
    default: return <EmployeeDashboard />;
  }
}
