import type { ComponentProps, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

import {
  dateTimeOptions,
  formatAbsolute,
  formatRelative,
  parseDate,
} from '../../internal/date/format-date';
import { timeText } from '../../internal/date/time-text';
import { useLocale } from '../../internal/date/use-locale';
import { useNow } from '../../internal/date/use-now';

// 「3 日前」のように、今からの隔たりで書く日時。見た目は Time と同じ（大きさと濃さは指定しなければ周りの文字のまま）
// 今の時刻はブラウザでだけ読む（src/internal/date/use-now.ts）。サーバーの HTML と hydration の最初の描画は
//   Time と同じふつうの日付で、そのあと相対に描き直す。ふつうの日付は title に残す

export interface RelativeTimeProps
  extends Omit<ComponentProps<'time'>, 'dateTime'>, VariantProps<typeof timeText> {
  /**
   * 日時。`YYYY-MM-DD` の文字列は、その日の 0 時（UTC）として隔たりを数えます
   */
  dateTime: Date | string | number;
  /**
   * 基準にする今の時刻。渡すと、サーバーでも最初から相対で書き、時間がたっても書き直しません（ビルドした時刻を渡すなど）。
   * 渡さなければブラウザの今の時刻を読み、1 分ごとに書き直します
   */
  now?: Date | number;
  /**
   * ふつうの日付（サーバーの HTML・最初の描画・title）の書き方。Time の withTime と同じです
   * @default false
   */
  withTime?: boolean;
  /**
   * ふつうの日付の書き方。Time の format と同じです
   */
  format?: Intl.DateTimeFormatOptions;
  /**
   * 言語と地域。書かなければ ThemeProvider の locale、それもなければ ja-JP です
   */
  locale?: string;
  /**
   * ふつうの日付を書くタイムゾーン。書かなければ ThemeProvider の timeZone、それもなければ Asia/Tokyo です
   */
  timeZone?: string;
  /**
   * 大きさ。指定しなければ周りの文字のままです
   */
  size?: VariantProps<typeof timeText>['size'];
  /**
   * 濃さ。指定しなければ周りの文字のままです
   */
  tone?: VariantProps<typeof timeText>['tone'];
  children?: ReactNode;
}

/**
 * 「3 日前」「昨日」のように、今からの隔たりで書く日時。`<time datetime>` を出し、ふつうの日付を title に残します
 */
export function RelativeTime({
  dateTime,
  now: nowProp,
  withTime = false,
  format,
  locale: localeProp,
  timeZone: timeZoneProp,
  size,
  tone,
  className,
  title,
  children,
  ...props
}: RelativeTimeProps) {
  const { locale, timeZone } = useLocale(localeProp, timeZoneProp);
  // サーバーと hydration の最初の描画では null（ふつうの日付を書く）にして、食い違いを避ける
  const mountedNow = useNow(nowProp === undefined);
  const parsed = parseDate(dateTime);
  if (!parsed) {
    return (
      <time className={timeText({ size, tone, className })} title={title} {...props}>
        {children ?? String(dateTime)}
      </time>
    );
  }

  const absolute = formatAbsolute(parsed, dateTimeOptions({ withTime, format }), locale, timeZone);
  const now = nowProp !== undefined ? new Date(nowProp).getTime() : mountedNow;
  const text = now === null ? absolute : formatRelative(parsed.date, now, locale);

  return (
    <time
      dateTime={parsed.machine}
      title={title ?? absolute}
      className={timeText({ size, tone, className })}
      {...props}
    >
      {children ?? text}
    </time>
  );
}
