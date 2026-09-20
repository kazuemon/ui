'use client';

import type { ComponentProps, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { useLocale } from '../../internal/date/use-locale';
import { textStyles } from '../../internal/reading/text';
import { tv } from '../../internal/tv';

// 数・通貨・割合・単位。見た目は Text と同じ役割（src/internal/reading/text.ts）で、大きさと濃さは指定しなければ周りの文字のまま
// 数字の幅は変えない（欧文フォント Mulish の数字は、はじめから等幅）
const numberFormat = tv({
  variants: {
    size: textStyles.size,
    tone: textStyles.tone,
  },
});

export interface NumberFormatProps
  extends Omit<ComponentProps<'data'>, 'value'>, VariantProps<typeof numberFormat> {
  /**
   * 数。`percent` のときは 1 を 100% として渡します（0.12 は 12%）
   */
  value: number | bigint;
  /**
   * 通貨として書きます。ISO 4217 の通貨コード（JPY・USD など）
   */
  currency?: string;
  /**
   * 通貨の書き方。ja-JP の JPY では、symbol は「￥1,280」、name は「1,280円」です
   * @default 'symbol'
   */
  currencyDisplay?: Intl.NumberFormatOptions['currencyDisplay'];
  /**
   * 割合として書きます（0.12 は「12%」）
   * @default false
   */
  percent?: boolean;
  /**
   * 単位を付けて書きます。Intl の単位名（kilometer・megabyte・kilometer-per-hour など）
   */
  unit?: string;
  /**
   * 単位の書き方。short は「12 km」、long は「12 キロメートル」、narrow は「12km」です
   * @default 'short'
   */
  unitDisplay?: Intl.NumberFormatOptions['unitDisplay'];
  /**
   * 小数の桁数の上限。指定しなければ、数は 3 桁、通貨は通貨の桁（JPY は 0、USD は 2）、割合は 0 桁です
   */
  maximumFractionDigits?: number;
  /**
   * Intl.NumberFormat の指定をそのまま渡します。ほかの指定より優先します
   */
  format?: Intl.NumberFormatOptions;
  /**
   * 言語と地域。書かなければ ThemeProvider の locale、それもなければ ja-JP です
   */
  locale?: string;
  /**
   * 大きさ。指定しなければ周りの文字のままです。md は本文、sm は注記です
   */
  size?: VariantProps<typeof numberFormat>['size'];
  /**
   * 濃さ。指定しなければ周りの文字のままです
   */
  tone?: VariantProps<typeof numberFormat>['tone'];
  /**
   * 書く文字を自分で決めるときに渡します。value 属性は value から作ります
   */
  children?: ReactNode;
}

/**
 * 数・通貨・割合・単位。`<data value>` を出し、読む文字は Intl.NumberFormat で書きます
 */
export function NumberFormat({
  value,
  currency,
  currencyDisplay,
  percent = false,
  unit,
  unitDisplay,
  maximumFractionDigits,
  format,
  locale: localeProp,
  size,
  tone,
  className,
  children,
  ...props
}: NumberFormatProps) {
  const { locale } = useLocale(localeProp);
  const style: Intl.NumberFormatOptions['style'] = currency
    ? 'currency'
    : percent
      ? 'percent'
      : unit
        ? 'unit'
        : 'decimal';
  const text = new Intl.NumberFormat(locale, {
    style,
    currency,
    currencyDisplay,
    unit,
    unitDisplay,
    maximumFractionDigits,
    ...format,
  }).format(value);

  return (
    <data value={String(value)} className={numberFormat({ size, tone, className })} {...props}>
      {children ?? text}
    </data>
  );
}
