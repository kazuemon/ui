import type { ComponentProps, ReactNode } from 'react';

import { XIcon } from '../icons';
import { sheetCloseButtonClass } from './sheet-styles';

interface SheetHeaderProps extends Omit<ComponentProps<'div'>, 'children'> {
  /**
   * つまみを出すか。false でも場所は取っておく（高さを測るため、出し入れで見出しが動かないようにするため）
   * null はつまみの場所を持たない（中央に浮かべる Dialog）
   */
  handle: boolean | null;
  /** 右上の閉じるボタン（SheetCloseButton）。Base UI の Close に render で渡すこともある。null は置かない（題が右端まで使える） */
  close: ReactNode;
  /** 題のまとまり（題・説明・欄のエラーなど） */
  children: ReactNode;
}

// シートの見出し: つまみ・題のまとまり・右上の × — adr/0037
// Select のシート・Drawer・狭い画面の Dialog と Popover で共有する
// 題のまとまりは × とは切り離す。× は右上に固定し、説明が長くなっても動かない。題の行は × の中央にそろえる
// 位置は面の内側の余白（--sheet-inset。Select は選択肢の余白、Drawer は 0）から逆算する
// 題の行の高さは --sheet-title-leading（既定はラベルの行の高さ）。× はその行の中央にそろう
//   題の左: 面の端から --sheet-padding-x。× : 面の端から --sheet-close-inset
// 引いて高さを変える操作（Select のつまみ）は、渡された pointer のハンドラで受ける
export function SheetHeader({ handle, close, children, className, ...props }: SheetHeaderProps) {
  return (
    <div
      {...props}
      className={['flex shrink-0 flex-col select-none', className].filter(Boolean).join(' ')}
    >
      {handle !== null && (
        <div aria-hidden className="flex h-4 items-center justify-center">
          <div
            className={['h-1 w-9 rounded-pill bg-(color:--color-line)', !handle && 'invisible']
              .filter(Boolean)
              .join(' ')}
          />
        </div>
      )}
      <div className="relative">
        <div
          className={[
            'flex flex-col gap-0.5 py-[calc((var(--spacing-control)-var(--sheet-title-leading,var(--leading-label)))/2)] pl-[calc(var(--sheet-padding-x)-var(--sheet-inset,0px))]',
            close == null
              ? 'pr-[calc(var(--sheet-padding-x)-var(--sheet-inset,0px))]'
              : 'pr-[calc(var(--spacing-control)+var(--sheet-close-inset)-var(--sheet-inset,0px))]',
          ].join(' ')}
        >
          {children}
        </div>
        {close != null && (
          <div className="absolute top-0 right-[calc(var(--sheet-close-inset)-var(--sheet-inset,0px))]">
            {close}
          </div>
        )}
      </div>
    </div>
  );
}

/** 閉じる × */
export function SheetCloseButton({
  label = '閉じる',
  ...props
}: Omit<ComponentProps<'button'>, 'children'> & { label?: string }) {
  return (
    <button type="button" aria-label={label} className={sheetCloseButtonClass} {...props}>
      <XIcon standalone />
    </button>
  );
}
