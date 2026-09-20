import type { ReactNode } from 'react';

import { fieldStyles } from '../field/field-styles';
import { WarningCircleIcon, WarningIcon } from '../icons';

/** シートの見出しに出す欄のエラー・警告の行 */
export interface SheetMessage {
  kind: 'error' | 'warning';
  content: ReactNode;
  id: string;
}

interface SheetFieldTitleProps {
  label: ReactNode;
  caption?: ReactNode;
  captionId: string;
  messages: SheetMessage[];
  /**
   * ヘルプテキストがないときも、その 1 行の高さを空けておく（見出しは、空けた行を含めたまとまりの上下中央に置く）。
   * 見出しの下に打つ欄などが続くとき、ヘルプテキストのあるなしで、その位置が変わらないようにする
   */
  reserveCaption?: boolean;
}

const styles = fieldStyles();
// 題は欄のラベルと同じ大きさ、ヘルプテキストはキャプションと同じ大きさ（欄の上の文字と同じ）
const titleClass = 'text-(length:--text-label) leading-(--leading-label) font-bold';
const captionClass = 'text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle';

// 欄のシート（Select・Combobox）の見出しの題のまとまり: ラベル・ヘルプテキスト・欄のエラー・警告
// ラベル・ヘルプテキスト・エラー・警告は、本体に付いているので読み上げでは隠す
// ヘルプテキストとエラー・警告は、選択肢の一覧（listbox）の説明にもつなぐ（design/adr/0044）
// ヘルプテキストは、本体のどちら（captionPlacement）に置いていても、ラベルの下に出す
// 欄のエラー・警告は、ヘルプテキストの下に、本体の下と同じ行（アイコン＋文）で出す（design/adr/0044）
//   シートが本体の下の行を隠すことがあるため。浮かぶ選択肢には出さない
//   両方あるときはエラー → 警告。行の間は、ヘルプテキストとの間と同じ 4px（design/adr/0041 の追記）
export function SheetFieldTitle({
  label,
  caption,
  captionId,
  messages,
  reserveCaption,
}: SheetFieldTitleProps) {
  return (
    <>
      <div
        aria-hidden
        className={titleClass}
        // ヘルプテキストの行だけを空けているとき、見出しは、空けた行を含めたまとまりの上下中央に置く
        style={
          !caption && reserveCaption
            ? { marginTop: 'calc((var(--leading-caption) + 2px) / 2)' }
            : undefined
        }
      >
        {label}
      </div>
      {caption ? (
        <div aria-hidden id={captionId} className={captionClass}>
          {caption}
        </div>
      ) : (
        reserveCaption && (
          <div
            aria-hidden
            data-slot="sheet-caption-spacer"
            style={{ height: 'calc((var(--leading-caption) - 2px) / 2)' }}
          />
        )
      )}
      {messages.map(({ kind, content, id }) => {
        const Icon = kind === 'error' ? WarningCircleIcon : WarningIcon;
        return (
          <div
            aria-hidden
            key={kind}
            id={id}
            data-slot="sheet-field-message"
            data-kind={kind}
            className={styles.message({
              className: ['mt-0.5', kind === 'error' ? 'text-fg-danger' : 'text-fg-warning'].join(
                ' '
              ),
            })}
          >
            <Icon className={styles.messageIcon()} />
            <span className="min-w-0">{content}</span>
          </div>
        );
      })}
    </>
  );
}
