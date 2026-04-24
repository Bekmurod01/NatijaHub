import React from 'react';
import Card from '../components/Card';
import { theme } from '../theme';

const NotFound = () => (
  <div style={{ minHeight: '100vh', background: theme.colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Card style={{ maxWidth: 420, textAlign: 'center' }}>
      <h2 style={{ fontFamily: theme.fontFamily, fontWeight: 800, fontSize: 28, marginBottom: theme.spacing(2), color: theme.colors.danger }}>404 - Page Not Found</h2>
      <p style={{ color: theme.colors.textSecondary, fontSize: 18 }}>The page you are looking for does not exist.</p>
    </Card>
  </div>
);

export default NotFound;
