import React from 'react';
import { motion } from 'framer-motion';
import { theme } from '../theme';

const Btn = ({ children, style, variant = 'primary', ...props }) => {
	const color =
		variant === 'primary' ? theme.colors.primary :
		variant === 'accent' ? theme.colors.accent :
		variant === 'danger' ? theme.colors.danger :
		theme.colors.primary;
	return (
		<motion.button
			whileHover={{ scale: 1.04, boxShadow: theme.colors.shadowHover }}
			whileTap={{ scale: 0.98 }}
			transition={{ type: 'spring', stiffness: 200, damping: 18 }}
			style={{
				background: color,
				color: '#fff',
				border: 'none',
				borderRadius: theme.borderRadius,
				padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
				fontFamily: theme.fontFamily,
				fontWeight: 600,
				fontSize: 16,
				cursor: 'pointer',
				boxShadow: theme.colors.shadow,
				outline: 'none',
				...style,
			}}
			{...props}
		>
			{children}
		</motion.button>
	);
};

export default Btn;
