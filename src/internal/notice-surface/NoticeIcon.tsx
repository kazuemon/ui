import type { ReactNode } from 'react';

import { CheckCircleIcon, InfoIcon, WarningCircleIcon, WarningIcon } from '../icons';
import type { NoticeAppearance, NoticeColor } from './notice-surface';

// 状態の色ごとのアイコン（design/adr/0041・0043）。neutral は持たない
const iconOf: Partial<Record<NoticeColor, (props: { className?: string }) => ReactNode>> = {
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  danger: WarningCircleIcon,
};

/** 1 行目の左のアイコン。icon を渡さないときは状態の色ごとのアイコン（muted と neutral ではなし）、false でなし */
export function NoticeIcon({
  color,
  appearance,
  icon,
}: {
  color: NoticeColor;
  appearance: NoticeAppearance;
  icon?: ReactNode | false;
}) {
  const DefaultIcon = appearance === 'muted' ? undefined : iconOf[color];
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
