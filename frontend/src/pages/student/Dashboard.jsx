import React from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import { theme } from '../../theme';

const StudentDashboard = () => (
  <div style={{ display: 'flex', minHeight: '100vh', background: theme.colors.background }}>
    <Sidebar role="student" />
    <main style={{ flex: 1, padding: theme.spacing(4) }}>
      <h2 style={{ fontFamily: theme.fontFamily, fontWeight: 700, fontSize: 28, marginBottom: theme.spacing(2) }}>Student Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: theme.spacing(3) }}>
        <Card>Welcome to your dashboard!</Card>
        <Card>Only accessible by student users.</Card>
      </div>
    </main>
  </div>
);

export default StudentDashboard;
