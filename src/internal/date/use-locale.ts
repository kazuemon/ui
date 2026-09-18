import { useUIConfig } from '../ui-config';
import { DEFAULT_LOCALE, DEFAULT_TIME_ZONE } from './format-date';

/** 言語とタイムゾーン。部品の props → ThemeProvider → 既定（ja-JP・Asia/Tokyo）の順に勝つ */
export function useLocale(locale?: string, timeZone?: string) {
  const config = useUIConfig();
  return {
    locale: locale ?? config.locale ?? DEFAULT_LOCALE,
    timeZone: timeZone ?? config.timeZone ?? DEFAULT_TIME_ZONE,
  };
}
