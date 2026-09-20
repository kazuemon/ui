'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { CSSProperties, ReactNode } from 'react';

import { Chip, ChipRemove } from '../../components/chip/Chip';
import type { ListboxColor } from '../listbox/listbox-colors';
import {
  comboboxChipClass,
  comboboxChipsClass,
  comboboxTriggerChipsClass,
} from './combobox-control-styles';

// 欄の中に並ぶチップ（ADR-0217・0219）。複数選ぶ Combobox と TagsInput が共有する
//   選んだ項目は欄の中にチップで並び、欄の高さが伸びる。← でチップへ移れる（Base UI の Chips）
//   チップの × の読み上げの名前は使う側が渡す（原則20。部品は文を作らない）

interface ChipLookProps {
  /** チップの色（原則6） */
  color: ListboxColor;
  /** 読み取り専用。× を出さない */
  readOnly?: boolean;
  /** 押せない（読み込み・送信中を含む） */
  disabled?: boolean;
  /** 最大幅と高さ（comboboxChipStyle） */
  chipStyle?: CSSProperties;
}

interface ComboboxChipsProps extends ChipLookProps {
  /** 値からラベルを引く表。外で絞り込んで項目が消えても、items に残っていれば引ける */
  labelOf: Map<string, string>;
  /** チップのまとまりの読み上げの名前 */
  chipsLabel: string;
  /** チップの × の読み上げの名前を作る関数 */
  chipRemoveLabel: (label: string) => string;
  /** チップの後ろに置く打つ欄。選んだ値の並びを受け取る（プレースホルダの出し分けに使う） */
  children: (values: string[]) => ReactNode;
}

/** 欄の中のチップと打つ欄（Base UI の Chips）。選んだ値は Base UI の Value から受け取る */
export function ComboboxChips({
  labelOf,
  chipsLabel,
  chipRemoveLabel,
  color,
  readOnly,
  disabled,
  chipStyle,
  children,
}: ComboboxChipsProps) {
  return (
    <BaseCombobox.Value>
      {(values: string[]) => (
        <BaseCombobox.Chips
          aria-label={values.length > 0 ? chipsLabel : undefined}
          className={comboboxChipsClass}
        >
          {values.map((item) => {
            const text = labelOf.get(item) ?? item;
            return (
              <BaseCombobox.Chip
                key={item}
                render={
                  <Chip
                    color={color}
                    readOnly={readOnly}
                    disabled={disabled}
                    style={chipStyle}
                    className={comboboxChipClass}
                  />
                }
              >
                <span className="min-w-0 truncate">{text}</span>
                {!readOnly && (
                  <BaseCombobox.ChipRemove
                    render={<ChipRemove aria-label={chipRemoveLabel(text)} />}
                    disabled={disabled || undefined}
                  />
                )}
              </BaseCombobox.Chip>
            );
          })}
          {children(values)}
        </BaseCombobox.Chips>
      )}
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
  disabled,
  chipStyle,
}: ComboboxTriggerChipsProps) {
  return (
    <span className={comboboxTriggerChipsClass}>
      {values.map((item) => (
        <Chip
          key={item}
          color={color}
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
