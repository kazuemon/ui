import { DatePicker } from '../../src/components/date-picker/DatePicker';
import { DatePickerPanel } from '../../src/components/date-picker/DatePickerPanel';
import { pickerPopupClass } from '../../src/components/date-picker/PickerOverlay';
import { type PlainDate, Temporal } from '../../src/internal/date/plain-date';
import { cn } from '../../src/internal/tv';

// 軸 392〜396（DatePicker）の比較で共有する値と枠。軸を決めたら、最後の軸と一緒に消す

/** 比較で「今日」として扱う日（撮るたびに見た目が変わらないように） */
export const today = Temporal.PlainDate.from('2026-09-30');
/** 値ありの列の値 */
export const day = Temporal.PlainDate.from('2026-09-20');

/**
 * 開いた姿の見本。欄の下に、浮かべる面と同じ見た目・同じ中身をその場に描く
 * （本物の面を行ごとにいくつも開くと、面どうしが重なって比べられないため。位置は欄の左端・間 4px で、部品と同じ）
 * 余白などのトークンは、比較の行が置いた値がそのまま効く
 */
export function OpenPicker({
  value,
  showTodayButton = false,
}: {
  value: PlainDate | null;
  showTodayButton?: boolean;
}) {
  return (
    <div className="flex w-[320px] flex-col gap-1">
      <DatePicker label="予約日" today={today} defaultValue={value} />
      <div className={cn(pickerPopupClass, 'w-fit p-(--date-picker-popup-padding)')}>
        <DatePickerPanel
          value={value}
          onPick={() => {}}
          autoFocus={false}
          color="neutral"
          locale="ja-JP"
          timeZone="Asia/Tokyo"
          today={today}
          showTodayButton={showTodayButton}
          todayLabel="今日"
        />
      </div>
    </div>
  );
}
