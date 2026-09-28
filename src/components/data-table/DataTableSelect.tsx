'use client';

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { type ComponentProps, useContext } from 'react';

import { CheckboxMark } from '../../internal/choice/CheckboxMark';
import { choiceSize, choiceStyles } from '../../internal/choice/choice-styles';
import { DataTableContext } from './data-table-context';

// 選択の列。箱は Checkbox と同じ見た目（入力欄の仲間。internal/choice）で、横の文字は持たない。名前は読み上げだけ（accessibleName）
// 押せる範囲は箱だけ（原則17）。セルや行を押しても選ばない
// セルは中身の幅まで縮める。箱は文字の 1 行の高さの中央に置き、上寄せの行でも 1 行目の文字とそろえる
// 見出しの箱は「すべて選ぶ」。一部だけ選んでいるときは中間の状態（横線）

interface SelectBoxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  accessibleName: string;
}

function SelectBox({
  checked,
  indeterminate,
  onCheckedChange,
  disabled,
  accessibleName,
}: SelectBoxProps) {
  const { color } = useContext(DataTableContext);
  const s = choiceStyles({ color });
  return (
    <span className={['flex h-[1lh] items-center', choiceSize].join(' ')}>
      <BaseCheckbox.Root
        checked={checked ?? false}
        indeterminate={indeterminate}
        onCheckedChange={onCheckedChange ? (next) => onCheckedChange(next) : undefined}
        disabled={disabled}
        aria-label={accessibleName}
        className={s.box({ className: 'rounded-(--checkbox-radius)' })}
      >
        <BaseCheckbox.Indicator className={s.mark()}>
          <CheckboxMark />
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
    </span>
  );
}

const cellClass = 'w-px';

export interface DataTableSelectHeaderProps extends Omit<ComponentProps<'th'>, 'onChange'> {
  /** すべての行を選んでいるか。TanStack Table では `table.getIsAllPageRowsSelected()` を渡します */
  checked?: boolean;
  /**
   * 一部の行だけを選んでいるか。箱に横線を出します。TanStack Table では `table.getIsSomePageRowsSelected()` を渡します
   * @default false
   */
  indeterminate?: boolean;
  /** 箱を押したときに、次の値を渡して呼びます。TanStack Table では `table.toggleAllPageRowsSelected` を渡します */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * 押せない状態にします
   * @default false
   */
  disabled?: boolean;
  /**
   * 箱の読み上げの名前
   * @default 'すべての行を選ぶ'
   */
  accessibleName?: string;
  /** 見出しのセル（th）に付きます */
  className?: string;
}

/** 選択の列の見出し（th）。すべての行を選ぶ箱を置きます */
export function DataTableSelectHeader({
  checked,
  indeterminate,
  onCheckedChange,
  disabled,
  accessibleName = 'すべての行を選ぶ',
  className,
  ...props
}: DataTableSelectHeaderProps) {
  return (
    <th
      scope="col"
      data-slot="data-table-select"
      className={[cellClass, className].filter(Boolean).join(' ')}
      {...props}
    >
      <SelectBox
        checked={checked}
        indeterminate={indeterminate}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        accessibleName={accessibleName}
      />
    </th>
  );
}

export interface DataTableSelectCellProps extends Omit<ComponentProps<'td'>, 'onChange'> {
  /** この行を選んでいるか。TanStack Table では `row.getIsSelected()` を渡します */
  checked?: boolean;
  /** 箱を押したときに、次の値を渡して呼びます。TanStack Table では `row.toggleSelected` を渡します */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * 押せない状態にします。TanStack Table では `!row.getCanSelect()` を渡します
   * @default false
   */
  disabled?: boolean;
  /**
   * 箱の読み上げの名前。どの行かが分かる文にします（「注文 A-1024 を選ぶ」など）
   * @default '行を選ぶ'
   */
  accessibleName?: string;
  /** セル（td）に付きます */
  className?: string;
}

/** 選択の列のセル（td）。この行を選ぶ箱を置きます */
export function DataTableSelectCell({
  checked,
  onCheckedChange,
  disabled,
  accessibleName = '行を選ぶ',
  className,
  ...props
}: DataTableSelectCellProps) {
  return (
    <td
      data-slot="data-table-select"
      className={[cellClass, className].filter(Boolean).join(' ')}
      {...props}
    >
      <SelectBox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        accessibleName={accessibleName}
      />
    </td>
  );
}
