'use client';

import { useMemo, useRef, useState } from 'react';

import { Button } from '../button/Button';
import { TimeListbox } from './TimeListbox';
import {
  isOutOfRange,
  listKeyOf,
  listOptions,
  nearestIndex,
  timeColumns,
  withColumn,
} from './time-options';
import type { TimeLayout, TimeSegmentType } from '../../internal/date-segments/segments';
import { fromPlainTime } from '../../internal/date-segments/segments';
import { type PlainTime, Temporal } from '../../internal/date/plain-date';

/** 一覧の出し方。list は step ごとの時刻を 1 列に並べ、columns は時・分（午前・午後）を別々の列にします */
export type TimePickerVariant = 'list' | 'columns';

/** トークンの数を読む（0・1 の切り替えのトークン） */
function readSwitch(element: Element | null, name: string) {
  if (!element) return 0;
  return Number.parseFloat(getComputedStyle(element).getPropertyValue(name)) || 0;
}

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
//   列の形: 時・分（秒）・午前午後を欄と同じ順に並べる。選ぶたびに値が入り、面は開いたまま
//     閉じ方は --time-picker-done-display（下の「完了」）と --time-picker-close-on-last（いちばん小さい単位を選んだら閉じる）
//   値がないときに開く位置は --time-picker-empty-target（0: 先頭、1: いまの時刻の近く）
// props（closeOnSelect など）は、書いたときだけ同じトークンを面に置いて上書きする。書かないときはトークンの既定に従う
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
  const panelRef = useRef<HTMLDivElement>(null);
  const options = useMemo(
    () => (variant === 'list' ? listOptions(listLayout, minuteStep, min, max) : []),
    [variant, listLayout, minuteStep, min, max]
  );
  // 開いたときの値で、送る先を決める（開いているあいだに選び直しても一覧は動かさない）
  const [openedWith] = useState(value);

  if (variant === 'list') {
    const selectedKey = listKeyOf(value);
    const hasSelected = options.some((option) => option.key === selectedKey);
    // 値がないときの行き先は、選べる項目の中から探す
    const enabled = options.some((option) => !option.disabled)
      ? options.filter((option) => !option.disabled)
      : options;
    const firstEnabled = enabled[0];
    const initial = openedWith;
    const initialKey = initial
      ? (options[nearestIndex(options, initial)]?.key ?? null)
      : (enabled[nearestIndex(enabled, now)]?.key ?? null);
    return (
      <div ref={panelRef} data-slot="time-picker-panel" data-variant="list" className="text-input">
        <TimeListbox
          options={options}
          selectedKey={hasSelected ? selectedKey : null}
          initialKey={initialKey}
          emptyFallbackKey={initial ? null : (firstEnabled?.key ?? null)}
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
  const outOfRange = isOutOfRange(value, min, max);
  const style: Record<string, string> = {};
  if (closeOnSelect !== undefined) style['--time-picker-close-on-last'] = closeOnSelect ? '1' : '0';
  if (showDoneButton !== undefined)
    style['--time-picker-done-display'] = showDoneButton ? 'flex' : 'none';
  if (hideColumnDivider !== undefined)
    style['--time-picker-column-divider'] = hideColumnDivider ? '0px' : 'var(--border-width-thin)';
  if (showColumnHeading !== undefined)
    style['--time-picker-column-heading-display'] = showColumnHeading ? 'block' : 'none';
  return (
    <div
      ref={panelRef}
      data-slot="time-picker-panel"
      data-variant="columns"
      data-out-of-range={outOfRange || undefined}
      className="flex flex-col text-input"
      style={style}
    >
      <div className="flex min-h-0">
        {columns.map((column, index) => {
          const initialValues = fromPlainTime(openedWith, layout);
          const opened = initialValues[column.type];
          const nowKey = nowColumns[index]?.selectedKey ?? null;
          return (
            <div
              key={column.type}
              className={[
                'flex min-w-0 flex-1 flex-col',
                index > 0 && 'border-s-(length:--time-picker-column-divider) border-surface-line',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <TimeListbox
                column={column.type}
                options={column.options}
                selectedKey={column.selectedKey}
                initialKey={opened != null ? String(opened) : nowKey}
                emptyFallbackKey={opened != null ? null : (column.options[0]?.key ?? null)}
                label={columnNames[column.type]}
                heading={columnNames[column.type]}
                onSelect={(key) => {
                  const next = withColumn(value, column.type, Number(key), layout);
                  const close =
                    column.type === smallest &&
                    readSwitch(panelRef.current, '--time-picker-close-on-last') === 1;
                  onPick(next, close);
                }}
              />
            </div>
          );
        })}
      </div>
      <div
        data-slot="time-picker-footer"
        className="[display:var(--time-picker-done-display)] justify-end border-t-(length:--border-width-thin) border-surface-line p-(--select-popup-padding)"
      >
        <Button onClick={onDone}>{doneLabel}</Button>
      </div>
    </div>
  );
}

/** 刻みに丸めた時刻（列の形で、値がないときに送るいまの時刻） */
function roundTo(time: PlainTime, minuteStep: number) {
  const step = Math.min(60, Math.max(1, Math.round(minuteStep) || 1));
  const minute = Math.floor(time.minute / step) * step;
  return Temporal.PlainTime.from({ hour: time.hour, minute });
}
