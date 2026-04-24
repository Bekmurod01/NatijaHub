import React from 'react';
import { theme } from '../theme';

const Input = React.forwardRef(({ style, ...props }, ref) => (
	<input
		ref={ref}
		style={{
			width: '100%',
			padding: theme.spacing(1),
			borderRadius: theme.borderRadius,
			border: `1px solid ${theme.colors.border}`,
			fontSize: 16,
			fontFamily: theme.fontFamily,
			background: theme.colors.glass,
			color: theme.colors.text,
			outline: 'none',
			marginBottom: theme.spacing(1),
			transition: 'box-shadow 0.2s',
			boxShadow: '0 1px 2px rgba(30,41,59,0.04)',
			...style,
		}}
		{...props}
	/>
));

export default Input;
