import React from 'react';
import { motion } from 'framer-motion';
import { theme } from '../theme';

const Card = ({ children, style, ...props }) => (
	<motion.div
		whileHover={{ scale: 1.03, boxShadow: theme.colors.shadowHover }}
		initial={{ opacity: 0, y: 24 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ type: 'spring', stiffness: 120, damping: 18 }}
		style={{
			background: theme.colors.card,
			borderRadius: theme.borderRadius,
			boxShadow: theme.colors.shadow,
			padding: theme.spacing(3),
			border: `1px solid ${theme.colors.border}`,
			backdropFilter: 'blur(8px)',
			...style,
		}}
		{...props}
	>
		{children}
	</motion.div>
);

export default Card;
