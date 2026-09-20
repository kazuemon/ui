import type { FormEvent } from 'react';

// フォームの中の DOM を読んで、エラーの行を集め、フォーカスを移す先を決める（design/adr/0044）

/** エラーの一覧の1行 */
export interface ErrorEntry {
  /** エラーの行の id。本体の説明（aria-describedby）に入っている */
  messageId: string;
  /** 本体（入力欄・Select のボタン）の id。リンクの先 */
  controlId: string;
  /** 欄の名前（ラベルの文字）。一覧のリンクで、エラーの文の前に置く */
  label: string;
  /** エラーの文。一覧のリンクの文にする（欄の下の文と同じ言葉） */
  text: string;
}

// 一覧のリンクの文（design/adr/0044 の追記）: 「欄の名前: エラーの文」。名前もエラーの文も同じ太さ
// 名前は、欄の下の文には書かれていないことが多い（「数字が入っていません」）ため、一覧でどの欄か分かるように足す
export const entryText = ({ label, text }: ErrorEntry) => (label ? `${label}: ${text}` : text);

// 本体は、エラーの行を説明（aria-describedby）に持つ要素（TextField の入力欄、Select のボタン）
const controlOf = (form: HTMLFormElement, messageId: string) =>
  form.querySelector<HTMLElement>(`[aria-describedby~="${CSS.escape(messageId)}"]`);

// 欄の名前（ラベルの文字）。ラベルの中の印（必須・任意）は読み上げから外しているので、一覧の名前からも外す
// 写しから印を消して読む（印が入れ子でも消える）
function labelTextOf(label: Element | null | undefined) {
  if (!label) return '';
  const copy = label.cloneNode(true);
  if (!(copy instanceof Element)) return '';
  for (const mark of copy.querySelectorAll('[data-slot="field-mark"]')) mark.remove();
  return (copy.textContent ?? '').trim();
}

// 開いているエラーの行（Field の data-slot="field-message"）を、見た目の順（DOM の順）に集める
// 警告は送信を止めないので入れない（エラーと警告が両方ある欄も、エラーの行だけ）
// 欄の名前は、同じ欄（行の箱の親）のラベル（data-slot="field-label"）の文字
export function collectErrors(form: HTMLFormElement): ErrorEntry[] {
  const entries: ErrorEntry[] = [];
  for (const region of form.querySelectorAll(
    '[data-slot="field-message"][data-open][data-kind="error"]'
  )) {
    const line = region.querySelector<HTMLElement>('[id]');
    const control = line && controlOf(form, line.id);
    if (!line || !control) continue;
    const label = region.parentElement?.querySelector(':scope > [data-slot="field-label"]');
    entries.push({
      messageId: line.id,
      controlId: control.id,
      label: labelTextOf(label),
      text: (line.textContent ?? '').trim(),
    });
  }
  return entries;
}

export const sameEntries = (a: ErrorEntry[], b: ErrorEntry[]) =>
  a.length === b.length &&
  a.every(
    (entry, i) =>
      entry.messageId === b[i].messageId &&
      entry.controlId === b[i].controlId &&
      entry.label === b[i].label &&
      entry.text === b[i].text
  );

// フォーカスを移す先。チェックボックス・ラジオのグループ（role="group"・"radiogroup"）は、グループそのものは
// フォーカスを受けないので、中の最初の選んだ項目（なければ最初の押せる項目）にする
function focusTargetOf(control: HTMLElement) {
  const role = control.getAttribute('role');
  if (role !== 'group' && role !== 'radiogroup') return control;
  const items = [
    ...control.querySelectorAll<HTMLElement>('[role="checkbox"], [role="radio"]'),
  ].filter(
    (item) =>
      // 「すべて選ぶ」の親の箱（Base UI の data-parent）には移さない。エラーは子を選ぶことについてなので
      !item.hasAttribute('data-parent') &&
      !item.hasAttribute('data-disabled') &&
      item.getAttribute('aria-disabled') !== 'true'
  );
  return items.find((item) => item.getAttribute('aria-checked') === 'true') ?? items[0] ?? control;
}

// 欄へフォーカスを移し、欄全体（ラベルからエラーの行まで）が見えるようにスクロールする
// select: 入力した文字を選ぶ（Base UI の Form と同じ。送信したときだけ）
export function focusField(form: HTMLFormElement, messageId: string, select: boolean) {
  const control = controlOf(form, messageId);
  if (!control) return;
  focusTargetOf(control).focus({ preventScroll: true });
  if (select && control instanceof HTMLInputElement) control.select();
  const region = form
    .querySelector(`#${CSS.escape(messageId)}`)
    ?.closest('[data-slot="field-message"]');
  region?.parentElement?.scrollIntoView({ block: 'nearest' });
}

// フォームの最初の送信のボタン（<button type="submit">・<input type="submit">）。Enter で送ったときにブラウザが押したことにするボタン
export function defaultSubmitButton(form: HTMLFormElement): Element | null {
  return (
    [...form.elements].find(
      (element) =>
        (element instanceof HTMLButtonElement || element instanceof HTMLInputElement) &&
        element.type === 'submit'
    ) ?? null
  );
}

// 送信中が終わったとき、送ったときの場所（押した送信のボタン、Enter を押した欄、body）にフォーカスが残っているか
// origin が null（送信なしに submitting になった）ときは残っていないとみなす。フォーカスがどこにもない（body）ときは、奪うものがないので残っているとみなす
export function focusStayedAt(origin: Element | null) {
  if (!origin) return false;
  const doc = origin.ownerDocument;
  const active = doc.activeElement;
  return active === origin || active === null || active === doc.body;
}

// 押した送信のボタン（SubmitEvent.submitter）。Enter で送ったときは、ブラウザが最初の送信のボタンを入れる
// ボタンなしに送ったとき（requestSubmit() など）は、Enter と同じく最初の送信のボタンにする
export function submitterOf(event: FormEvent<HTMLFormElement>) {
  const native = event.nativeEvent;
  const pressed =
    'submitter' in native && native.submitter instanceof Element ? native.submitter : null;
  return pressed ?? defaultSubmitButton(event.currentTarget);
}
