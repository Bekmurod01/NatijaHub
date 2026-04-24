import React from 'react';
import { theme } from '../theme';

const Badge = ({ children, color = theme.colors.pill, style, ...props }) => (
	<span
		style={{
			display: 'inline-block',
			background: color,
			color: theme.colors.textSecondary,
			borderRadius: 999,
			padding: '4px 12px',
			fontSize: 13,
			fontWeight: 500,
			marginRight: 8,
			...style,
		}}
		{...props}
	>
		{children}
	</span>
);

export default Badge;
