import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { theme } from '../theme';

const Navbar = () => {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetchUnread = () => {
      api.get('/notifications').then(res => {
        setUnread(res.data.filter(n => !n.is_read).length);
      });
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.nav
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      style={{
        display: 'flex',
        gap: theme.spacing(2),
        alignItems: 'center',
        background: theme.colors.card,
        borderRadius: theme.borderRadius,
        boxShadow: theme.colors.shadow,
        padding: `${theme.spacing(1)} ${theme.spacing(3)}`,
        margin: theme.spacing(2),
        fontFamily: theme.fontFamily,
      }}
    >
      <Link to="/" style={{ fontWeight: 700, color: theme.colors.primary, textDecoration: 'none', fontSize: 20 }}>NatijaHub</Link>
      <div style={{ flex: 1 }} />
      <Link to="/notifications" style={{ position: 'relative', color: theme.colors.text, textDecoration: 'none' }}>
        <motion.span
          whileHover={{ scale: 1.2 }}
          style={{ fontSize: 22, marginRight: 4 }}
          role="img"
          aria-label="notifications"
        >🔔</motion.span>
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            style={{
              position: 'absolute',
              top: -6,
              right: -10,
              background: theme.colors.danger,
              color: '#fff',
              borderRadius: 999,
              fontSize: 13,
              padding: '2px 7px',
              fontWeight: 600,
              boxShadow: theme.colors.shadow,
            }}
          >
            {unread}
          </motion.span>
        )}
      </Link>
    </motion.nav>
  );
};

export default Navbar;
