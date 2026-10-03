'use client';

import { useMemo, useState } from 'react';

import { Button } from '../button/Button';
import { TimeListbox } from './TimeListbox';
import { listKeyOf, listOptions, nearestIndex, timeColumns, withColumn } from './time-options';
import type { TimeLayout, TimeSegmentType } from '../../internal/date-segments/segments';
import { fromPlainTime } from '../../internal/date-segments/segments';
import { type PlainTime, Temporal } from '../../internal/date/plain-date';
import { isTimeOutOfRange } from '../../internal/date/range';
import { tv } from '../../internal/tv';

/** 一覧の出し方。list は step ごとの時刻を 1 列に並べ、columns は時・分（午前・午後）を別々の列にします */
export type TimePickerVariant = 'list' | 'columns';

// 列の形の見た目。列のあいだの細い縦線（divider）は既定で引き、hideColumnDivider で消す
const columnsPanel = tv({
  slots: {
    column: 'flex min-w-0 flex-1 flex-col',
    footer:
      'flex justify-end border-t-(length:--border-width-thin) border-surface-line p-(--spacing)',
  },
  variants: {
    divider: {
      true: { column: 'border-surface-line not-first:border-s-(length:--border-width-thin)' },
      false: {},
    },
  },
  defaultVariants: { divider: true },
});

interface TimePickerPanelProps {
  variant: TimePickerVariant;
  /** 欄と同じ並び（秒を含むことがある） */
  layout: TimeLayout;
  /** 1 列の形の文字の並び（秒なし） */
  listLayout: TimeLayout;
  value: PlainTime | null;
  /** 値がないときに一覧を送る先の候補（いまの時刻） */
  now: PlainTime;
  minuteStep: number;
  showSeconds: boolean;
  min?: PlainTime;
  max?: PlainTime;
  columnNames: Record<TimeSegmentType, string>;
  /** 1 列の形の一覧の名前 */
  listName: string;
  doneLabel: string;
  closeOnSelect?: boolean;
  showDoneButton?: boolean;
  hideColumnDivider?: boolean;
  showColumnHeading?: boolean;
  /** 値を選んだとき。close は面を閉じるか */
  onPick: (value: PlainTime, close: boolean) => void;
  onDone: () => void;
}

// 浮かぶ面の中身
//   1 列の形: step ごとの時刻を 1 列に。項目は Select の選択肢と同じ（左寄せ・選んだ項目にチェック）。選ぶと閉じる
//   列の形: 時・分（秒）・午前午後を欄と同じ順に並べる。選ぶたびに値が入り、いちばん小さい単位（分、秒を出すときは秒）を選んだら閉じる
//     closeOnSelect={false} では開いたまま。showDoneButton で下に「完了」を出す。見出しは showColumnHeading で出す
//   値がないときは、いまの時刻の近くを開く
export function TimePickerPanel({
  variant,
  layout,
  listLayout,
  value,
  now,
  minuteStep,
  showSeconds,
  min,
  max,
  columnNames,
  listName,
  doneLabel,
  closeOnSelect,
  showDoneButton,
  hideColumnDivider,
  showColumnHeading,
  onPick,
  onDone,
}: TimePickerPanelProps) {
  const options = useMemo(
    () => (variant === 'list' ? listOptions(listLayout, minuteStep, min, max) : []),
    [variant, listLayout, minuteStep, min, max]
  );
  // 開いたときの値で、送る先を決める（開いているあいだに選び直しても一覧は動かさない）
  const [openedWith] = useState(value);

  if (variant === 'list') {
    const selectedKey = listKeyOf(value);
    const hasSelected = options.some((option) => option.key === selectedKey);
    // 開いたときの行き先（選んでいる時刻、なければいまの時刻の近く）は、選べる項目の中から探す
    //   値が min・max の外でも、フォーカス（tabIndex=0）を押せない項目に置かず、選べる項目のうちいちばん近いものにする
    const enabled = options.some((option) => !option.disabled)
      ? options.filter((option) => !option.disabled)
      : options;
    const initialKey = enabled[nearestIndex(enabled, openedWith ?? now)]?.key ?? null;
    return (
      <div data-slot="time-picker-panel" data-variant="list" className="text-input">
        <TimeListbox
          options={options}
          selectedKey={hasSelected ? selectedKey : null}
          initialKey={initialKey}
          label={listName}
          showCheck
          onSelect={(key) => {
            const option = options.find((item) => item.key === key);
            if (option) onPick(option.time, closeOnSelect ?? true);
          }}
        />
      </div>
    );
  }

  const columns = timeColumns(layout, value, minuteStep, showSeconds);
  const nowColumns = timeColumns(layout, roundTo(now, minuteStep), minuteStep, showSeconds);
  const smallest: TimeSegmentType = showSeconds ? 'second' : 'minute';
  // 列の形は項目を止めず、選んだ結果が外なら欄をエラーの見た目にする
  const outOfRange = isTimeOutOfRange(value, min, max);
  const s = columnsPanel({ divider: !hideColumnDivider });
  return (
    <div
      data-slot="time-picker-panel"
      data-variant="columns"
      data-out-of-range={outOfRange || undefined}
      className="flex flex-col text-input"
    >
      <div className="flex min-h-0">
        {columns.map((column, index) => {
          const initialValues = fromPlainTime(openedWith, layout);
          const opened = initialValues[column.type];
          const nowKey = nowColumns[index]?.selectedKey ?? null;
          return (
            <div key={column.type} className={s.column()}>
              <TimeListbox
                column={column.type}
                options={column.options}
                selectedKey={column.selectedKey}
                initialKey={opened != null ? String(opened) : nowKey}
                label={columnNames[column.type]}
                heading={showColumnHeading ? columnNames[column.type] : undefined}
                onSelect={(key) => {
                  const next = withColumn(value, column.type, Number(key), layout);
                  onPick(next, column.type === smallest && (closeOnSelect ?? true));
                }}
              />
            </div>
          );
        })}
      </div>
      {showDoneButton && (
        <div data-slot="time-picker-footer" className={s.footer()}>
          <Button onClick={onDone}>{doneLabel}</Button>
        </div>
      )}
    </div>
  );
}

/** 刻みに丸めた時刻（列の形で、値がないときに送るいまの時刻） */
function roundTo(time: PlainTime, minuteStep: number) {
  const step = Math.min(60, Math.max(1, Math.round(minuteStep) || 1));
  const minute = Math.floor(time.minute / step) * step;
  return Temporal.PlainTime.from({ hour: time.hour, minute });
}
