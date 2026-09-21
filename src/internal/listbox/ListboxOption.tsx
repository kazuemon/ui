import type { ReactNode } from 'react';

import { fieldStyles } from '../field/field-styles';
import { WarningIcon } from '../icons';
import { listboxOption } from './listbox-styles';
import type { ListboxItemNote } from './use-listbox-option';

const styles = fieldStyles();
// 2行目の並びと文字（項目の高さに関わらない slot）
const optionSlots = listboxOption();

// 選択肢の2行目（design/adr/0044、ADR-0254）。文の大きさと行の高さはキャプションと同じ
//   description: ただの説明。キャプションと同じ灰色（--color-fg-subtle）の文字だけ
//   reason: 選べない理由。description と同じ見た目で、意味だけが違う
//   warning: 本体の下の警告の行と同じ形（三角＋ --color-fg-warning）。選んだ項目の青い文字の中でも、警告の色のまま
function ListboxOptionNote({ note, id }: { note: ListboxItemNote; id: string }) {
  if (note.kind === 'description' || note.kind === 'reason')
    return (
      <span
        id={id}
        data-slot="select-item-note"
        data-kind={note.kind}
        className={optionSlots.reason()}
      >
        {note.text}
      </span>
    );
  return (
    <span
      id={id}
      data-slot="select-item-note"
      data-kind="warning"
      className={styles.message({ className: 'text-fg-warning' })}
    >
      <WarningIcon className={styles.messageIcon()} />
      <span className="min-w-0">{note.text}</span>
    </span>
  );
}

interface ListboxOptionContentProps {
  /** ラベルの下の2行目。ないときは1行のまま */
  note?: ListboxItemNote;
  /** useListboxOption が返す noteId */
  noteId: string;
  /** 選んだ印（Base UI の ItemIndicator に indicatorProps を広げたもの） */
  indicator?: ReactNode;
  /** ラベル（Base UI の ItemText や span に labelProps を広げたもの） */
  children: ReactNode;
}

/**
 * 選択肢1項目の中身（ラベル・2行目・選んだ印）。行そのもの（Base UI の Item）の中に置く
 * ラベルと印は、部品が作った要素を受け取る（Select は ItemText と ItemIndicator、Combobox は span と ItemIndicator）
 */
export function ListboxOptionContent({
  note,
  noteId,
  indicator,
  children,
}: ListboxOptionContentProps) {
  return (
    <>
      <div className={optionSlots.body()}>
        {children}
        {note && <ListboxOptionNote note={note} id={noteId} />}
      </div>
      {indicator}
    </>
  );
}
