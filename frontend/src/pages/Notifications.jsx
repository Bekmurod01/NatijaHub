import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import Btn from '../components/Btn';
import Spinner from '../components/Spinner';
import { theme } from '../theme';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = () => {
      api.get('/notifications').then(res => {
        setNotifications(res.data);
        setLoading(false);
      });
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 7000);
    return () => clearInterval(interval);
  }, [refresh]);

  const markAsRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setRefresh(r => !r);
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.colors.background, padding: theme.spacing(4) }}>
      <h2 style={{ fontFamily: theme.fontFamily, fontWeight: 700, fontSize: 28, marginBottom: theme.spacing(2) }}>Notifications</h2>
      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gap: theme.spacing(2), maxWidth: 600 }}>
          {notifications.map(n => (
            <Card key={n.id} style={{ background: n.is_read ? theme.colors.card : theme.colors.pill }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: theme.colors.text }}>{n.message}</span>
                {!n.is_read && <Btn style={{ marginLeft: 16 }} onClick={() => markAsRead(n.id)} variant="accent">Mark as read</Btn>}
              </div>
              <span style={{ float: 'right', fontSize: 12, color: theme.colors.textSecondary }}>{new Date(n.created_at).toLocaleString()}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
