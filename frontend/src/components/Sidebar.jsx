import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { theme } from '../theme';

const links = [
  { to: '/student', icon: '🏠', label: 'Dashboard' },
  { to: '/student/internships', icon: '💼', label: 'Internships' },
  { to: '/notifications', icon: '🔔', label: 'Notifications' },
];

const Sidebar = ({ role = 'student' }) => (
  <motion.aside
    initial={{ x: -48, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
    style={{
      width: 72,
      background: theme.colors.card,
      borderRadius: theme.borderRadius,
      boxShadow: theme.colors.shadow,
      padding: theme.spacing(2),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: theme.spacing(2),
      minHeight: '80vh',
      margin: theme.spacing(2),
    }}
  >
    {links.map(link => (
      <NavLink
        key={link.to}
        to={link.to}
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: 12,
          background: isActive ? theme.colors.pill : 'none',
          color: isActive ? theme.colors.primary : theme.colors.textSecondary,
          fontSize: 24,
          textDecoration: 'none',
          transition: 'background 0.2s',
        })}
      >
        <motion.span whileHover={{ scale: 1.2 }}>{link.icon}</motion.span>
        <span style={{ fontSize: 11, marginTop: 2 }}>{link.label}</span>
      </NavLink>
    ))}
  </motion.aside>
);

export default Sidebar;
