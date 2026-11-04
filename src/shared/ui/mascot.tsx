import { motion, useReducedMotion } from 'motion/react';
import { useId } from 'react';

import { cn } from '@/shared/lib/cn';

export type MascotMood = 'happy' | 'sleepy' | 'curious' | 'sad' | 'wink' | 'party';

interface MascotProps {
	mood?: MascotMood;
	size?: number;
	className?: string;
}

/**
 * Талисман прототипа — совёнок Дек. Inline-SVG без внешних ассетов,
 * 6 состояний под пустые экраны, ошибки, успех и загрузку.
 */
export function Mascot({ mood = 'happy', size = 112, className }: MascotProps) {
	const rawId = useId();
	const bodyId = `owl-body-${rawId.replace(/:/g, '')}`;
	const bellyId = `owl-belly-${rawId.replace(/:/g, '')}`;
	const reduce = useReducedMotion();

	const sleepy = mood === 'sleepy';
	const winking = mood === 'wink';
	const sad = mood === 'sad';
	const party = mood === 'party';
	const happy = mood === 'happy' || party;

	const pupilX = mood === 'curious' ? 2.5 : 0;
	const pupilY = sad ? 2 : 0;

	return (
		<motion.svg
			viewBox="0 0 120 120"
			width={size}
			height={size}
			role="img"
			aria-label="Совёнок Дек — талисман цифрового деканата"
			className={cn('shrink-0 select-none', className)}
			animate={reduce ? undefined : { y: [0, -4, 0] }}
			transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
		>
			<defs>
				<linearGradient id={bodyId} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stopColor="#8FE3C6" />
					<stop offset="55%" stopColor="#7FD3F5" />
					<stop offset="100%" stopColor="#8FA8FF" />
				</linearGradient>
				<linearGradient id={bellyId} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
					<stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.55" />
				</linearGradient>
			</defs>

			{/* Ушки-перья */}
			<path d="M34 32 L27 14 L47 24 Z" fill="#0B2E59" />
			<path d="M86 32 L93 14 L73 24 Z" fill="#0B2E59" />

			{/* Тело */}
			<ellipse cx="60" cy="68" rx="38" ry="40" fill={`url(#${bodyId})`} />
			<ellipse cx="60" cy="80" rx="24" ry="25" fill={`url(#${bellyId})`} />

			{/* Крылья */}
			<ellipse cx="23" cy="72" rx="7.5" ry="16" fill="#0B2E59" opacity="0.82" />
			<ellipse cx="97" cy="72" rx="7.5" ry="16" fill="#0B2E59" opacity="0.82" />

			{/* Глаза */}
			{sleepy ? (
				<>
					<path
						d="M38 56 q9 6 18 0"
						stroke="#0B2E59"
						strokeWidth="3"
						fill="none"
						strokeLinecap="round"
					/>
					<path
						d="M64 56 q9 6 18 0"
						stroke="#0B2E59"
						strokeWidth="3"
						fill="none"
						strokeLinecap="round"
					/>
				</>
			) : (
				<>
					<circle cx="47" cy="56" r="13" fill="#FFFFFF" />
					<circle cx="73" cy="56" r="13" fill="#FFFFFF" />
					<g>
						<circle cx={47 + pupilX} cy={56 + pupilY} r="6" fill="#12203A" />
						<circle cx={73 + pupilX} cy={56 + pupilY} r="6" fill="#12203A" />
						<circle cx={45 + pupilX} cy={53.5 + pupilY} r="1.9" fill="#FFFFFF" />
						<circle cx={71 + pupilX} cy={53.5 + pupilY} r="1.9" fill="#FFFFFF" />
					</g>
					{winking ? (
						<path
							d="M64 55 q9 7 18 0"
							stroke="#0B2E59"
							strokeWidth="3"
							fill="none"
							strokeLinecap="round"
						/>
					) : null}
					{sad ? (
						<>
							<path
								d="M40 44 q7 -5 14 0"
								stroke="#0B2E59"
								strokeWidth="2.4"
								fill="none"
								strokeLinecap="round"
							/>
							<path
								d="M66 44 q7 -5 14 0"
								stroke="#0B2E59"
								strokeWidth="2.4"
								fill="none"
								strokeLinecap="round"
							/>
						</>
					) : null}
				</>
			)}

			{/* Клюв и улыбка */}
			<path d="M60 66 L53.5 75 L66.5 75 Z" fill="#F0A04B" />
			<path
				d={happy ? 'M52 84 q8 7 16 0' : 'M54 86 h12'}
				stroke="#0B2E59"
				strokeWidth="2.6"
				fill="none"
				strokeLinecap="round"
				opacity="0.85"
			/>

			{/* Румянец */}
			{happy ? (
				<>
					<ellipse cx="35" cy="74" rx="5" ry="3.2" fill="#FF9E9A" opacity="0.55" />
					<ellipse cx="85" cy="74" rx="5" ry="3.2" fill="#FF9E9A" opacity="0.55" />
				</>
			) : null}

			{/* Академическая шапочка */}
			<path d="M36 33 L60 22 L84 33 L60 44 Z" fill="#0B2E59" />
			<rect x="36" y="33" width="48" height="5" rx="2.5" fill="#0B2E59" />
			<path d="M84 35.5 v9" stroke="#F0A04B" strokeWidth="2.2" strokeLinecap="round" />
			<circle cx="84" cy="46.5" r="2.6" fill="#F0A04B" />

			{/* Настроение */}
			{party ? (
				<>
					<path
						d="M18 40 l2.4 5 5.2 .6 -3.9 3.6 1.1 5.1 -4.8 -2.7 -4.8 2.7 1.1 -5.1 -3.9 -3.6 5.2 -.6 Z"
						fill="#FFD66B"
					/>
					<circle cx="102" cy="34" r="3" fill="#FF9E9A" />
					<circle cx="26" cy="90" r="2.6" fill="#8FA8FF" />
				</>
			) : null}
			{sleepy ? (
				<text x="92" y="34" fontSize="12" fontWeight="700" fill="#5A6B7C">
					z
				</text>
			) : null}
			{sleepy ? (
				<text x="100" y="24" fontSize="9" fontWeight="700" fill="#5A6B7C">
					z
				</text>
			) : null}
			{sad ? <path d="M47 70 q2 5 0 8 q-3 -3 0 -8 Z" fill="#6BA6FF" /> : null}
			{mood === 'curious' ? (
				<text x="98" y="30" fontSize="15" fontWeight="800" fill="#0D5BD7">
					?
				</text>
			) : null}
		</motion.svg>
	);
}
