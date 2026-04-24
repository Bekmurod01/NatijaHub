import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/Card';
import Btn from '../../components/Btn';
import Spinner from '../../components/Spinner';
import { theme } from '../../theme';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/company/applications').then(res => {
      setApplications(res.data);
      setLoading(false);
    });
  }, [refresh]);

  const handleStatus = async (id, status) => {
    await api.put(`/company/applications/${id}/status`, { status });
    setRefresh(r => !r);
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.colors.background, padding: theme.spacing(4) }}>
      <h2 style={{ fontFamily: theme.fontFamily, fontWeight: 700, fontSize: 28, marginBottom: theme.spacing(2) }}>Applications</h2>
      {loading ? <Spinner /> : (
        <Card style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: theme.fontFamily }}>
            <thead>
              <tr style={{ background: theme.colors.pill }}>
                <th style={{ padding: theme.spacing(1), textAlign: 'left' }}>Internship</th>
                <th style={{ padding: theme.spacing(1), textAlign: 'left' }}>Applicant</th>
                <th style={{ padding: theme.spacing(1), textAlign: 'left' }}>Status</th>
                <th style={{ padding: theme.spacing(1), textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(a => (
                <tr key={a.id} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                  <td style={{ padding: theme.spacing(1) }}>{a.internship?.title}</td>
                  <td style={{ padding: theme.spacing(1) }}>{a.user_id}</td>
                  <td style={{ padding: theme.spacing(1) }}>{a.status}</td>
                  <td style={{ padding: theme.spacing(1) }}>
                    <Btn
                      disabled={a.status === 'accepted'}
                      onClick={() => handleStatus(a.id, 'accepted')}
                      variant="success"
                      style={{ marginRight: 8 }}
                    >Accept</Btn>
                    <Btn
                      disabled={a.status === 'rejected'}
                      onClick={() => handleStatus(a.id, 'rejected')}
                      variant="danger"
                    >Reject</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default Applications;
