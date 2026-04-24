import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Btn from '../../components/Btn';
import { theme } from '../../theme';

const CompanyDashboard = () => {
  const [stats, setStats] = useState({ internships: 0, applications: 0, accepted: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStats() {
      const internshipsRes = await api.get('/company/internships');
      const applicationsRes = await api.get('/company/applications');
      setStats({
        internships: internshipsRes.data.length,
        applications: applicationsRes.data.length,
        accepted: applicationsRes.data.filter(a => a.status === 'accepted').length,
      });
    }
    fetchStats();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.colors.background }}>
      <Sidebar role="company" />
      <main style={{ flex: 1, padding: theme.spacing(4) }}>
        <h2 style={{ fontFamily: theme.fontFamily, fontWeight: 700, fontSize: 28, marginBottom: theme.spacing(2) }}>Company Dashboard</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: theme.spacing(3), marginBottom: theme.spacing(3) }}>
          <Card>Internships: {stats.internships}</Card>
          <Card>Applications: {stats.applications}</Card>
          <Card>Accepted: {stats.accepted}</Card>
        </div>
        <div style={{ display: 'flex', gap: theme.spacing(2) }}>
          <Btn onClick={() => navigate('/company/internships')}>Manage Internships</Btn>
          <Btn onClick={() => navigate('/company/applications')} variant="accent">View Applications</Btn>
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;
