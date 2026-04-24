import React from 'react';
import { motion } from 'framer-motion';
import { theme } from '../theme';

const Spinner = ({ size = 32, color = theme.colors.primary }) => (
	<motion.div
		animate={{ rotate: 360 }}
		transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
		style={{
			width: size,
			height: size,
			border: `4px solid ${color}33`,
			borderTop: `4px solid ${color}`,
			borderRadius: '50%',
			margin: 'auto',
			boxSizing: 'border-box',
		}}
	/>
);

export default Spinner;
