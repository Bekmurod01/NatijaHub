import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../theme';
import Btn from './Btn';
import Badge from './Badge';

const fallbackLogo = 'https://ui-avatars.com/api/?name=Company&background=E0E7FF&color=2563eb&size=64';

const InternshipCard = ({
	logo,
	title,
	location,
	salary,
	tags = [],
	onApply,
	onFavorite,
	isFavorite = false,
}) => {
	const [imgError, setImgError] = useState(false);
	const [fav, setFav] = useState(isFavorite);
	return (
		<motion.div
			whileHover={{ scale: 1.03, boxShadow: theme.colors.shadowHover, borderColor: theme.colors.accent }}
			initial={{ opacity: 0, y: 24 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: 'spring', stiffness: 120, damping: 18 }}
			style={{
				background: theme.colors.card,
				borderRadius: theme.borderRadius,
				boxShadow: theme.colors.shadow,
				border: `2px solid transparent`,
				padding: theme.spacing(3),
				display: 'flex',
				alignItems: 'center',
				gap: theme.spacing(3),
				marginBottom: theme.spacing(2),
				minWidth: 320,
				maxWidth: 480,
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			<motion.div
				whileHover={{ scale: 1.12 }}
				style={{
					minWidth: 64,
					minHeight: 64,
					borderRadius: 16,
					overflow: 'hidden',
					boxShadow: theme.colors.shadow,
					background: theme.colors.pill,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<img
					src={imgError ? fallbackLogo : logo}
					alt="Company Logo"
					style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 16, transition: 'transform 0.2s' }}
					loading="lazy"
					onError={() => setImgError(true)}
				/>
			</motion.div>
			<div style={{ flex: 1 }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: theme.colors.text }}>{title}</h3>
					<motion.button
						onClick={() => { setFav(f => !f); onFavorite && onFavorite(!fav); }}
						whileTap={{ scale: 0.8, rotate: 12 }}
						style={{
							background: 'none',
							border: 'none',
							cursor: 'pointer',
							marginLeft: 4,
							outline: 'none',
							display: 'flex',
							alignItems: 'center',
						}}
						aria-label={fav ? 'Unfavorite' : 'Favorite'}
					>
						<AnimatePresence initial={false}>
							{fav ? (
								<motion.span
									key="filled"
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									exit={{ scale: 0 }}
									style={{ color: theme.colors.accent, fontSize: 22 }}
								>
									★
								</motion.span>
							) : (
								<motion.span
									key="empty"
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									exit={{ scale: 0 }}
									style={{ color: theme.colors.textSecondary, fontSize: 22 }}
								>
									☆
								</motion.span>
							)}
						</AnimatePresence>
					</motion.button>
				</div>
				<div style={{ color: theme.colors.textSecondary, fontSize: 15, margin: '4px 0 8px 0' }}>
					{location} &bull; {salary}
				</div>
				<div style={{ marginBottom: 8 }}>
					{tags.map((tag, idx) => (
						<Badge key={idx}>{tag}</Badge>
					))}
				</div>
				<Btn
					onClick={onApply}
					style={{ marginTop: 8, minWidth: 120, boxShadow: theme.colors.shadow }}
				>
					Apply Now
				</Btn>
			</div>
		</motion.div>
	);
};

export default InternshipCard;