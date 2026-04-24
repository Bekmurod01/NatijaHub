// src/theme.js
// Centralized theme for NatijaHub SaaS UI

export const theme = {
  fontFamily: `'Inter', 'Poppins', sans-serif`,
  borderRadius: 16,
  spacing: (factor) => `${factor * 8}px`,
  colors: {
    primary: '#2563eb',
    accent: '#6366f1',
    background: '#f8fafc',
    card: 'rgba(255,255,255,0.85)',
    cardDark: 'rgba(30,41,59,0.85)',
    text: '#1e293b',
    textSecondary: '#64748b',
    shadow: '0 4px 24px rgba(30,41,59,0.08)',
    shadowHover: '0 8px 32px rgba(30,41,59,0.16)',
    border: 'rgba(100,116,139,0.12)',
    gradient: 'linear-gradient(90deg, #6366f1 0%, #2563eb 100%)',
    pill: '#e0e7ff',
    danger: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    glass: 'rgba(255,255,255,0.6)',
    glassDark: 'rgba(30,41,59,0.6)',
  },
};
