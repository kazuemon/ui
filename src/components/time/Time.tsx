'use client';

import type { ComponentProps, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { dateTimeOptions, formatAbsolute, parseDate } from '../../internal/date/format-date';
import { timeText } from '../../internal/date/time-text';
import { useLocale } from '../../internal/date/use-locale';

// 日付・時刻。見た目は Text と同じ役割で、大きさと濃さは指定しなければ周りの文字のまま（src/internal/date/time-text.ts。RelativeTime と共有）
// 日時の解釈と書き方は src/internal/date/format-date.ts

export interface TimeProps
  extends Omit<ComponentProps<'time'>, 'dateTime'>, VariantProps<typeof timeText> {
  /**
   * 日時。`YYYY-MM-DD` の文字列は、時刻を持たない暦の日付として扱い、どのタイムゾーンでも同じ日を書きます。
   * それ以外（Date・ISO 8601 の文字列・ミリ秒）は、`timeZone` の時刻で書きます
   */
  dateTime: Date | string | number;
  /**
   * 時刻も書きます。ja-JP では「2026/09/18 09:30」です
   * @default false
   */
  withTime?: boolean;
  /**
   * Intl の日付の書き方。指定すると既定の「2026/09/18」の代わりに使います。
   * ja-JP では、full は「2026年9月18日金曜日」、long は「2026年9月18日」、medium と short は「2026/09/18」です
   */
  dateStyle?: Intl.DateTimeFormatOptions['dateStyle'];
  /**
   * Intl の時刻の書き方。ja-JP では、short は「9:30」、medium は「9:30:00」です。
   * dateStyle を書かずにこれだけを書くと、時刻だけを書きます
   */
  timeStyle?: Intl.DateTimeFormatOptions['timeStyle'];
  /**
   * Intl.DateTimeFormat の指定をそのまま渡します。指定すると withTime・dateStyle・timeStyle は使いません
   */
  format?: Intl.DateTimeFormatOptions;
  /**
   * 言語と地域。書かなければ ThemeProvider の locale、それもなければ ja-JP です
   */
  locale?: string;
  /**
   * 時刻を書くときのタイムゾーン。`YYYY-MM-DD` の日付には使いません。
   * 書かなければ ThemeProvider の timeZone、それもなければ Asia/Tokyo です（サーバーと閲覧者で文字が変わらないよう固定しています）
   */
  timeZone?: string;
  /**
   * 大きさ。指定しなければ周りの文字のままです。md は本文、sm は日付や注記です
   */
  size?: VariantProps<typeof timeText>['size'];
  /**
   * 見た目（濃さ）。body は本文、muted は補足、subtle は目立たせない文です。指定しなければ周りの文字のままです
   */
  variant?: VariantProps<typeof timeText>['variant'];
  /**
   * 書く文字を自分で決めるときに渡します。datetime 属性は dateTime から作ります
   */
  children?: ReactNode;
}

/**
 * 日付・時刻。`<time datetime>` を出し、読む文字は Intl.DateTimeFormat で書きます
 */
export function Time({
  dateTime,
  withTime = false,
  dateStyle,
  timeStyle,
  format,
  locale: localeProp,
  timeZone: timeZoneProp,
  size,
  variant,
  className,
  children,
  ...props
}: TimeProps) {
  const { locale, timeZone } = useLocale(localeProp, timeZoneProp);
  const parsed = parseDate(dateTime);
  const text = parsed
    ? formatAbsolute(
        parsed,
        dateTimeOptions({ withTime, dateStyle, timeStyle, format }),
        locale,
        timeZone
      )
    : String(dateTime);

  return (
    <time dateTime={parsed?.machine} className={timeText({ size, variant, className })} {...props}>
      {children ?? text}
    </time>
  );
}
