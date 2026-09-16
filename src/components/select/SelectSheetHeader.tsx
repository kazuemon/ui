import type { PointerEventHandler, ReactNode, Ref } from 'react';

import { fieldStyles } from '../../internal/field/field-styles';
import { focusRing } from '../../internal/focus-styles';
import { WarningCircleIcon, WarningIcon, XIcon } from '../icons/icons';

/** シートの見出しに出す欄のエラー・警告の行 */
export interface SheetMessage {
  kind: 'error' | 'warning';
  content: ReactNode;
  id: string;
}

interface SelectSheetHeaderProps {
  ref: Ref<HTMLDivElement>;
  /** 選択肢が長く、つまみを出して引けるか */
  long: boolean;
  label: ReactNode;
  caption?: ReactNode;
  captionId: string;
  messages: SheetMessage[];
  onClose: () => void;
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
}

const styles = fieldStyles();

// シートの見出し: つまみ・ラベル・閉じるボタン・ヘルプテキスト・欄のエラー・警告
// ラベル・ヘルプテキスト・エラー・警告は、本体に付いているので読み上げでは隠す
// ヘルプテキストとエラー・警告は、選択肢の一覧（listbox）の説明にもつなぐ（design/adr/0044）
export function SelectSheetHeader({
  ref,
  long,
  label,
  caption,
  captionId,
  messages,
  onClose,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: SelectSheetHeaderProps) {
  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={['flex shrink-0 flex-col select-none', long && 'cursor-grab touch-none']
        .filter(Boolean)
        .join(' ')}
    >
      {/* つまみ: 選択肢が長いときだけ出す。場所はいつも取っておく（高さを測るため） */}
      <div aria-hidden className="flex h-4 items-center justify-center">
        <div
          className={['h-1 w-9 rounded-pill bg-(color:--color-line)', !long && 'invisible']
            .filter(Boolean)
            .join(' ')}
        />
      </div>
      {/* ラベルとヘルプテキストは1つのまとまりにし、× とは切り離す
        × は右上に固定する（ヘルプテキストが長くなっても動かない）。ラベルの行は × の中央にそろえる
        ヘルプテキストは、本体のどちら（captionPlacement）に置いていても、ラベルの下に出す
        欄のエラー・警告は、ヘルプテキストの下に、本体の下と同じ行（アイコン＋文）で出す（design/adr/0044）
        シートが本体の下の行を隠すことがあるため。浮かぶ選択肢には出さない
        両方あるときはエラー → 警告。行の間は、ヘルプテキストとの間と同じ 4px（design/adr/0041 の追記） */}
      <div className="relative">
        <div
          aria-hidden
          className="flex flex-col gap-0.5 py-[calc((var(--spacing-control)-var(--leading-label))/2)] pr-(--spacing-control) pl-[calc(var(--spacing-control-x)-var(--select-popup-padding))]"
        >
          <div className="text-(length:--text-label) leading-(--leading-label) font-bold">
            {label}
          </div>
          {caption && (
            <div
              id={captionId}
              className="text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle"
            >
              {caption}
            </div>
          )}
          {messages.map(({ kind, content, id }) => {
            const Icon = kind === 'error' ? WarningCircleIcon : WarningIcon;
            return (
              <div
                key={kind}
                id={id}
                data-slot="select-sheet-message"
                data-kind={kind}
                className={styles.message({
                  className: [
                    'mt-0.5',
                    kind === 'error' ? 'text-fg-danger' : 'text-fg-warning',
                  ].join(' '),
                })}
              >
                <Icon className={styles.messageIcon()} />
                <span className="min-w-0">{content}</span>
              </div>
            );
          })}
        </div>
        {/* 選ばずに閉じる。アイコンだけのボタンなので線は Bold（design/adr/0018）
          Tab では止まらない（開いた直後のフォーカスを選んだ項目に置くため）。キーボードでは Esc で閉じる */}
        <button
          type="button"
          tabIndex={-1}
          aria-label="閉じる"
          onClick={onClose}
          className={[
            'absolute top-0 right-0 flex size-(--spacing-control) cursor-pointer items-center justify-center rounded-[calc(var(--radius-control)-var(--select-popup-padding))] text-fg-muted',
            ...focusRing,
            '[transition:background-color_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press)]',
            'hover:bg-flat-hover active:bg-flat-press motion-reduce:[transition:none]',
          ].join(' ')}
        >
          <XIcon standalone />
        </button>
      </div>
    </div>
  );
}
