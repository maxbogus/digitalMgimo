import { Bell, BellRing, TriangleAlert } from 'lucide-react';
import type { ComponentType } from 'react';

import type { NotificationPriority } from '@/shared/api/types';
import { Badge } from '@/shared/ui/badge';

interface PriorityMeta {
	label: string;
	variant: 'danger' | 'warning' | 'muted';
	icon: ComponentType<{ className?: string }>;
}

/** Подписи и стили приоритетов: три категории из требований ТЗ. */
export const PRIORITY_META: Record<NotificationPriority, PriorityMeta> = {
	critical: { label: 'Критично', variant: 'danger', icon: TriangleAlert },
	important: { label: 'Важно', variant: 'warning', icon: BellRing },
	info: { label: 'Информационно', variant: 'muted', icon: Bell },
};

interface PriorityBadgeProps {
	priority: NotificationPriority;
}

/** Бейдж приоритета: цвет + иконка + текст (не только цвет). */
export function PriorityBadge({ priority }: PriorityBadgeProps) {
	const meta = PRIORITY_META[priority];
	const Icon = meta.icon;

	return (
		<Badge variant={meta.variant}>
			<Icon className="size-3.5" />
			{meta.label}
		</Badge>
	);
}
