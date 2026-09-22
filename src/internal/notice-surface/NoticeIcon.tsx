import type { ReactNode } from 'react';

import { CheckCircleIcon, InfoIcon, WarningCircleIcon, WarningIcon } from '../icons';
import type { NoticeSurfaceStatus, NoticeVariant } from './notice-surface';

// 状態の色ごとのアイコン（design/adr/0041・0043）。neutral は持たない
const iconOf: Partial<Record<NoticeSurfaceStatus, (props: { className?: string }) => ReactNode>> = {
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  danger: WarningCircleIcon,
};

/** 1 行目の左のアイコン。icon を渡さないときは状態の色ごとのアイコン（muted と neutral ではなし）、false でなし */
export function NoticeIcon({
  status,
  variant,
  icon,
}: {
  status: NoticeSurfaceStatus;
  variant: NoticeVariant;
  icon?: ReactNode | false;
}) {
  const DefaultIcon = variant === 'muted' ? undefined : iconOf[status];
  const shown = icon === false ? null : (icon ?? (DefaultIcon ? <DefaultIcon /> : null));
  if (!shown) return null;
  return (
    <span
      aria-hidden="true"
      className="mt-(--notice-icon-offset) flex shrink-0 text-(color:--notice-icon-color) [&_svg]:size-(--spacing-icon)"
    >
      {shown}
    </span>
  );
}
