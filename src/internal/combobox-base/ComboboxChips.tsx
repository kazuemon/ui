'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { CSSProperties, ReactNode } from 'react';

import { Chip, ChipRemove } from '../../components/chip/Chip';
import type { ListboxColor } from '../listbox/listbox-colors';
import {
  type ComboboxChipSize,
  comboboxChipClass,
  comboboxChipsClass,
  comboboxTriggerChipsClass,
} from './combobox-control-styles';

// 欄の中に並ぶチップ（ADR-0217・0219・0259）。複数選ぶ Combobox と TagsInput が共有する
//   選んだ項目は欄の中にチップで並び、欄の高さが伸びる。← でチップへ移れる（Base UI の Chips）
//   チップの × の読み上げの名前は使う側が渡す（原則20。部品は文を作らない）
//   大きさは Chip の size にそのまま渡す（sm・md・lg。ADR-0259）

interface ChipLookProps {
  /** チップの色（原則6） */
  color: ListboxColor;
  /** チップの大きさ（Chip の size にそのまま渡す） */
  chipSize: ComboboxChipSize;
  /** 読み取り専用。× を出さない */
  readOnly?: boolean;
  /** 押せない（読み込み・送信中を含む） */
  disabled?: boolean;
  /** 最大幅（comboboxChipMaxWidthStyle） */
  chipStyle?: CSSProperties;
}

interface ComboboxChipsProps extends ChipLookProps {
  /** 値からラベルを引く表。外で絞り込んで項目が消えても、items に残っていれば引ける */
  labelOf: Map<string, string>;
  /** チップのまとまりの読み上げの名前 */
  chipsName: string;
  /** チップの × の読み上げの名前を作る関数 */
  chipRemoveName: (label: string) => string;
  /**
   * 箱（Base UI の Chips）に足すクラス。折り返し方はここで渡す
   * @default 'flex-wrap'
   */
  className?: string;
  /** チップ1つずつに足すクラス */
  chipClassName?: string;
  /** チップ1つずつに足す属性（どのチップかを示す印など）。タグの文字を受け取る */
  chipProps?: (value: string) => Record<`data-${string}`, string | undefined>;
  /** 箱ごと包む（TagsInput は、はみ出した分をスクロールさせる枠に入れる） */
  wrap?: (chips: ReactNode) => ReactNode;
  /** チップの後ろに置く打つ欄。選んだ値の並びを受け取る（プレースホルダの出し分けに使う） */
  children: (values: string[]) => ReactNode;
}

/** 欄の中のチップと打つ欄（Base UI の Chips）。選んだ値は Base UI の Value から受け取る */
export function ComboboxChips({
  labelOf,
  chipsName,
  chipRemoveName,
  color,
  chipSize,
  readOnly,
  disabled,
  chipStyle,
  className = 'flex-wrap',
  chipClassName,
  chipProps,
  wrap,
  children,
}: ComboboxChipsProps) {
  const chipClass = chipClassName ? `${comboboxChipClass} ${chipClassName}` : comboboxChipClass;
  return (
    <BaseCombobox.Value>
      {(values: string[]) => {
        const chips = (
          <BaseCombobox.Chips
            aria-label={values.length > 0 ? chipsName : undefined}
            className={`${comboboxChipsClass} ${className}`}
          >
            {values.map((item) => {
              const text = labelOf.get(item) ?? item;
              return (
                <BaseCombobox.Chip
                  key={item}
                  {...chipProps?.(item)}
                  render={
                    <Chip
                      color={color}
                      size={chipSize}
                      readOnly={readOnly}
                      disabled={disabled}
                      style={chipStyle}
                      className={chipClass}
                    />
                  }
                >
                  <span className="min-w-0 truncate">{text}</span>
                  {!readOnly && (
                    <BaseCombobox.ChipRemove
                      render={<ChipRemove aria-label={chipRemoveName(text)} />}
                      disabled={disabled || undefined}
                    />
                  )}
                </BaseCombobox.Chip>
              );
            })}
            {children(values)}
          </BaseCombobox.Chips>
        );
        return wrap ? wrap(chips) : chips;
      }}
    </BaseCombobox.Value>
  );
}

interface ComboboxTriggerChipsProps extends Omit<ChipLookProps, 'readOnly'> {
  values: string[];
  labelOf: Map<string, string>;
}

/**
 * 押すボタンの本体（シートに打つ欄を移したとき）に並ぶチップ
 * × はボタンの中に置けないので、外す操作はシートの中で行う
 */
export function ComboboxTriggerChips({
  values,
  labelOf,
  color,
  chipSize,
  disabled,
  chipStyle,
}: ComboboxTriggerChipsProps) {
  return (
    <span className={comboboxTriggerChipsClass}>
      {values.map((item) => (
        <Chip
          key={item}
          color={color}
          size={chipSize}
          disabled={disabled}
          style={chipStyle}
          className={comboboxChipClass}
        >
          <span className="min-w-0 truncate">{labelOf.get(item) ?? item}</span>
        </Chip>
      ))}
    </span>
  );
}
