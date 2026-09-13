import { Select as BaseSelect } from '@base-ui/react/select';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  type CSSProperties,
  createContext,
  type FormEvent,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';

import { Button } from '../../src/components/Button';
import { Field } from '../../src/components/Field';
import { FieldAddon } from '../../src/components/FieldAddon';
import { controlBox, fieldStyles } from '../../src/components/field-styles';
import { focusRing } from '../../src/components/focus-styles';
import { Form } from '../../src/components/Form';
import {
  CaretDownIcon,
  CheckIcon,
  WarningCircleIcon,
  WarningIcon,
  XIcon,
} from '../../src/components/icons';
import { Link } from '../../src/components/Link';
import { Select, type SelectItem, type SelectPresentation } from '../../src/components/Select';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 27: エラー・警告の知らせ方（原則4 — ヘルプテキストとエラー・警告の残り）。1回目
// 並びと見た目は ADR-0041 で決まっている。残った3つを、別のストーリーで比べる
//   出たときの知らせ方: エラー・警告の行が出ても、読み上げで知らせない（aria-live はない）
//   下の内容の動き: 行が出ると、下の内容が1行分（指用 24px・マウス用 22px）動く
//   シートの文: Select のボトムシート（ADR-0037）の見出しに、エラー・警告を出さない
// 決めたこと（design/adr/0044）
//   出たときの知らせ方: 送信したときは E（既定）と C（Form の errorSummary）。欄を離れたときなどは A（polite）
//   下の内容の動き: B（行の高さと濃さを 0.2 秒で開き、閉じる）。どちらも部品（Field・Form）に入れた
//   部品の行が polite になり、開閉が動くようになったので、比べたときの形を次のように保つ
//     出たときの知らせ方: 現行版・C・E（欄を離れたとき）の行は、行の箱を aria-live="off" に戻す（useNoLive）
//       A の行は部品の TextField、E の送信の列は部品の Form で描く
//     下の内容の動き: 現行版と C（ふつうのフォーム）の行は、動きの長さを 0s にして跳ばす。B の行は部品のまま描く
//   シートの文: A（見出しのヘルプテキストの下に、本体の下と同じ行を出す。一覧の説明にもつなぐ）。部品（Select）に入れた
//   選択肢に付く文: A（お届けできない選択肢は選べなくし、理由を2行目に。遅れる選択肢は警告の2行目）
//     部品（Select の items の disabled・note）に入れた。文は呼び出し側が渡す（部品は文を組み立てない）
//   部品の Select がシートの見出しに欄の文を出すようになったので、比べたときの形を次のように保つ
//     シートの文: A の行は部品のまま。現行版と B の行は部品の見出しの行を隠す（B の帯はこの中で足す）。C の行は、警告の行だけ隠す
//     選択肢に付く文: 現行版の行は、部品の見出しの行を隠す。A〜D の行は、比べたときの NoteSelect のまま
//       部品で A を描くと、荒川区を選んだシートの見出しに、欄の警告（荒川区は、お届けが翌日になります）も出る。比べたときの A は出さなかった
//       部品の A は「実装した Form」の市区町村で確かめられる
// 現行版の行は、部品（TextField・Select）をそのまま使う
// 部品にない形は、この中の OwnField で組む。本体は TextField のまま使い、エラー・警告の行だけを自前の箱に出す
//   TextField の Field は display: contents にして、ラベル・キャプション・本体・行を外の枠に並べる（軸 23 の MessageField と同じ仕組み）
//   TextField には error に true を渡して欄をエラーの状態にし、中の行（中身は空）は隠す
//   説明（aria-describedby）は、キャプション → 行の順で渡す（ADR-0041 と同じ順）
// 4つ目のストーリー（選択肢に付く文）は、比べたときに部品になかった形を、この中の NoteSelect で組む（見た目は Select のクラスを写したもの）
//   比べたときの部品に要る変更（案）。A に決まり、はじめの3つを部品に入れた（design/adr/0044）
//   - SelectItem に disabled（Base UI の Select.Item にそのまま渡す）と note を足す。部品の note の kind は reason・warning（error は B・C だけ）
//   - note のある項目は、ラベルの下に2行目を出し、高さを伸ばす（1行の項目は今の高さのまま）
//     読み上げの名前はラベルだけ（aria-labelledby）、2行目は説明（aria-describedby）にする
//   - 選択肢に関係ない欄の文を、シートの見出しのヘルプテキストの下に出す。一覧（listbox）の説明にもつなぐ
//   - C は、error・warning と一緒に付け先の指定（仮の名前 messageTarget: 'field' | 'option'）を渡す（採らなかった）
//   - D は、選択肢を群に分ける（Base UI の Select.Group・Select.GroupLabel。採らなかった）

type Kind = 'error' | 'warning';

interface Message {
  kind: Kind;
  text: string;
}

type Status = 'normal' | Kind;

const styles = fieldStyles();

const signed = (value: number) =>
  value === 0 ? '±0px' : `${value > 0 ? '+' : '−'}${Math.abs(value)}px`;

const textOf = (el: Element | null | undefined) =>
  (el?.textContent ?? '').replace(/\s+/g, ' ').trim();

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

// ── 共通: エラー・警告の行 ─────────────────────────────
// 部品の行（Field の message）と同じ形。エラーは丸の「!」と #BA012D、警告は三角と #727200（ADR-0041）

function MessageLine({
  message,
  id,
  className,
  style,
}: {
  message: Message;
  id?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const Icon = message.kind === 'error' ? WarningCircleIcon : WarningIcon;
  const color = message.kind === 'error' ? 'text-danger' : 'text-fg-warning';
  return (
    <div
      id={id}
      data-axis27-line={message.kind}
      className={styles.message({ className: [color, className].filter(Boolean).join(' ') })}
      style={style}
    >
      <Icon className={styles.messageIcon()} />
      <span className="min-w-0">{message.text}</span>
    </div>
  );
}

// 行の出し方
//   mount: 部品（TextField）のまま。行は高さと濃さを開き、閉じる（design/adr/0044 — 比べたときの B）
//     比べたときの現行版の形（出たときに足して跳ぶ）は、動きの長さ（--duration-field-message）を 0s にして描く
//   reserve: 文がなくても行の場所を取っておく。overlay: 場所を取らず、本体の下に浮かべて重ねる
type LineMode = 'mount' | 'reserve' | 'overlay';

const fieldCss = `
/* TextField の Field を display: contents にして、ラベル・本体を外の枠の並びに加える */
[data-axis27-field] > :first-child { display: contents; }
/* TextField の中の行。中身はなく、欄をエラーの状態にするためだけに置く */
[data-axis27-field] > :first-child > [data-slot="field-message"] { display: none; }
/* 並び: ラベル（0）→ キャプション（1）→ 本体（3）→ 行の箱（4）。キャプションは本体の上（ADR-0041 の F） */
[data-axis27-field] > :first-child > [data-slot="control"] { order: 3; }
[data-axis27-field] > [data-axis27-caption] { order: 1; }
/* 行の箱はいつもある。空のときに間（--space-field-gap）が増えないよう、箱の上の間を打ち消し、行の上に持たせる */
[data-axis27-field] > [data-axis27-region] { order: 4; margin-top: calc(-1 * var(--space-field-gap)); }
[data-axis27-region]:not([data-axis27-region="overlay"]) [data-axis27-line] { padding-top: var(--space-field-gap); }
/* reserve: 文がなくても、行 1 つ分（間＋ 16px）を取っておく */
[data-axis27-region="reserve"] { min-height: calc(var(--space-field-gap) + var(--leading-caption)); }
/* overlay: 場所を取らず、本体のすぐ下に浮かべる。浮かぶ UI なので、選択肢と同じ白い面・細い境界線・影（原則1の例外 — ADR-0036） */
[data-axis27-region="overlay"] { position: relative; height: 0; }
[data-axis27-region="overlay"] [data-axis27-line] {
  position: absolute; top: 4px; left: 0; z-index: 2; max-width: 100%;
  padding: 4px 8px; border-radius: 8px; background-color: var(--color-select-popup);
  border: var(--select-popup-line-width) solid var(--color-select-popup-line);
  box-shadow: var(--shadow-select-popup);
}
/* シート: 開いた直後は選んだ項目が hover の状態になるので、固定した列ではそれを外す（軸 19 と同じ） */
[data-sheet-preview] [role="option"][data-highlighted] { background-color: transparent; }
[data-sheet-preview] [role="option"][data-highlighted][data-selected] { background-color: var(--color-select-item-selected); }
`;

interface OwnFieldProps {
  label: string;
  caption?: string;
  message: Message | null;
  mode?: LineMode;
  /** 行を包む箱（いつもある）の属性。知らせ方の案で、aria-live・role を付ける */
  region?: { 'aria-live'?: 'polite' | 'off'; role?: 'alert' };
  name?: string;
  id?: string;
  type?: string;
  defaultValue?: string;
  onBlur?: (value: string) => void;
}

function OwnField({
  label,
  caption,
  message,
  mode = 'mount',
  region,
  onBlur,
  ...input
}: OwnFieldProps) {
  const id = useId();
  const captionId = `${id}caption`;
  const messageId = `${id}message`;
  const describedBy =
    [caption && captionId, message && messageId].filter(Boolean).join(' ') || undefined;
  return (
    <div data-axis27-field={mode} className="flex flex-col gap-(--space-field-gap)">
      <TextField
        label={label}
        error={message?.kind === 'error' || undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        onBlur={onBlur ? (event) => onBlur(event.currentTarget.value) : undefined}
        {...input}
      />
      {caption && (
        <div id={captionId} data-axis27-caption className={styles.caption()}>
          {caption}
        </div>
      )}
      <div data-axis27-region={mode} {...region}>
        {message && (
          <MessageLine key={`${message.kind}${message.text}`} message={message} id={messageId} />
        )}
      </div>
    </div>
  );
}

// ═══ 1. 出たときの知らせ方 ═══════════════════════════════

type AnnounceMode = 'none' | 'polite' | 'alert' | 'summary' | 'combo' | 'first';
type Timing = 'blur' | 'submit';

interface AnnounceCandidate extends Candidate {
  mode: AnnounceMode;
}

// 測った値は、Chrome の CDP（Accessibility.getPartialAXTree）で、このストーリーの欄を測ったもの（2026-09-13）
const announceCandidates: AnnounceCandidate[] = [
  {
    id: '現行版',
    mode: 'none',
    name: '知らせない',
    intent:
      'いまの Field。エラー・警告の行は、出るだけで読み上げでは知らせない。本体に入ったときに、説明（キャプション → エラー・警告）として読まれる。送信しても、フォーカスは「登録する」のまま。',
    spec: [
      ['出たとき', '知らせない'],
      ['欄に入ったとき', '説明として読む'],
      ['送信したとき', '知らせない。フォーカスは動かない'],
      ['行の属性（測った値）', 'live なし（エラーは役割なし、警告は段落）'],
    ],
  },
  {
    id: 'A',
    mode: 'polite',
    name: '行を polite で知らせる',
    intent:
      'エラー・警告の行を、いつもある箱（aria-live="polite"）の中に出す。出たときと変わったときに、いまの読み上げが終わってから読む。欄に入ったときも、これまでどおり説明として読む。送信で一度に何行も出ると、上から順に続けて読む。',
    spec: [
      ['出たとき', 'エラーも警告も、読み終えてから読む'],
      ['欄に入ったとき', '説明として読む'],
      ['送信したとき', '出た行を順に読む。フォーカスは動かない'],
      ['行の属性（測った値）', '箱が live: polite'],
    ],
  },
  {
    id: 'B',
    mode: 'alert',
    name: 'エラーだけ割り込む',
    intent:
      'エラーの行だけを、いつもある role="alert" の箱に出し、いまの読み上げに割り込んで読む。警告は送信を止めないので、知らせない（現行版と同じ）。一度に2つ以上のエラーが出ると、後のほうが前のほうを遮ることがある。',
    spec: [
      ['出たとき', 'エラーは割り込んで読む。警告は読まない'],
      ['欄に入ったとき', '説明として読む'],
      ['送信したとき', 'エラーを割り込んで読む。フォーカスは動かない'],
      ['行の属性（測った値）', '箱が alert（live: assertive・atomic）'],
    ],
  },
  {
    id: 'C',
    mode: 'summary',
    name: '送信したときに一覧で（GOV.UK）',
    intent:
      '欄を離れても確かめない。送信すると、フォームの上にエラーの一覧（見出しと、各欄へのリンク）を出し、フォーカスを一覧へ移す。フォーカスが移るので、一覧が読まれる。リンクを押すと、その欄へ移る。欄の行は知らせない。警告は一覧に入れない。',
    spec: [
      ['出たとき', '欄を離れても確かめない'],
      ['欄に入ったとき', '説明として読む'],
      ['送信したとき', 'フォーカスが一覧に移り、一覧を読む'],
      ['一覧の属性（測った値）', 'group（名前は見出し）・tabindex="-1"'],
      ['一覧の見た目（仮）', '#FEF2F1 に 2px の #BA012D。見出し 12.62:1、リンク 6.13:1'],
    ],
  },
  {
    id: 'D',
    mode: 'combo',
    name: '一覧＋polite（組み合わせ）',
    intent:
      '欄を離れたときは、A と同じく polite で知らせる。送信したときは、C と同じく一覧を出してフォーカスを移す。送信のときは欄の行を知らせない（一覧と重ねて読まないため）。',
    spec: [
      ['出たとき', 'A と同じ（読み終えてから読む）'],
      ['欄に入ったとき', '説明として読む'],
      ['送信したとき', 'C と同じ（一覧に移る）。欄の行は知らせない'],
      ['行の属性（測った値）', '箱が live: polite（送信のときは off）'],
    ],
  },
  {
    id: 'E',
    mode: 'first',
    name: '送信したら最初のエラーの欄へ',
    intent:
      '欄の行は、現行版と同じく知らせない。送信すると、エラーのある最初の欄へフォーカスを移し、入力した文字を選んだ状態にする。移った欄の名前と説明（キャプション → エラー）が読まれる。Base UI の Form がもともと持つ動き（focusFirstInvalid）で、新しい部品は要らない。警告の欄には移らない。',
    spec: [
      ['出たとき', '知らせない（現行版と同じ）'],
      ['欄に入ったとき', '説明として読む'],
      ['送信したとき', '最初のエラーの欄に移り、その欄を読む。ほかの欄のエラーは読まない'],
      ['移った先（測った値）', 'メールアドレスの欄（無効・説明はキャプション → エラー）'],
    ],
  },
];

const announceColumns: Column[] = [
  {
    label: '欄を離れたときに確かめる',
    note: '入力して Tab キーで離れると、その欄を確かめて文を出します（C は確かめません）',
  },
  {
    label: '送信したときに確かめる',
    note: '「登録する」を押すと、すべての欄を確かめます',
  },
];

interface AnnounceFieldSpec {
  name: string;
  label: string;
  caption: string;
  defaultValue: string;
  validate: (value: string) => Message | null;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const announceFields: AnnounceFieldSpec[] = [
  {
    name: 'email',
    label: 'メールアドレス',
    caption: 'ログインに使います',
    defaultValue: 'kazu@',
    validate: (value) => {
      if (emailPattern.test(value)) return null;
      return {
        kind: 'error',
        text: value ? 'メールアドレスの形が正しくありません' : 'メールアドレスを入力してください',
      };
    },
  },
  {
    name: 'displayName',
    label: '表示名',
    caption: '一覧とプロフィールに出ます',
    defaultValue: 'かずえもん（Kazuya Miyamoto）',
    validate: (value) =>
      value.length > 20
        ? { kind: 'warning', text: '20文字を超えると、一覧では途中で切れます' }
        : null,
  },
];

// 各セルの「読み上げの流れ」。ARIA の決まりどおりに読んだときの流れ
const flows: Record<AnnounceMode, Record<Timing, string[]>> = {
  none: {
    blur: [
      'メールアドレスから Tab で離れる → 次の欄を読むだけ。出たエラーは読まない',
      '戻ると → 説明として「ログインに使います メールアドレスの形が正しくありません」',
    ],
    submit: [
      '「登録する」を押す → 何も読まない。フォーカスはボタンのまま',
      'どこが悪いかは、欄を順に回って知る',
    ],
  },
  polite: {
    blur: [
      'Tab で離れる → 次の欄を読み終えてから「メールアドレスの形が正しくありません」',
      '警告も同じように読む。戻ると、説明としてもう一度読む',
    ],
    submit: [
      '「登録する」を押す → 出た行を上から順に、読み終えてから続けて読む',
      'フォーカスはボタンのまま。欄へは自分で移る',
    ],
  },
  alert: {
    blur: [
      'Tab で離れる → 次の欄の読み上げに割り込んで「メールアドレスの形が正しくありません」',
      '警告は読まない（現行版と同じ）',
    ],
    submit: [
      '「登録する」を押す → エラーだけを割り込んで読む。警告は読まない',
      'エラーが一度に2つ以上出ると、後のほうが前のほうを遮ることがある',
    ],
  },
  summary: {
    blur: ['離れても確かめないので、何も出ない・読まない'],
    submit: [
      '「登録する」を押す → フォーカスが上の一覧に移り、「入力を確かめてください（1件）」と中身を読む',
      'リンクを押す → その欄に移り、説明を読む。警告は一覧に入らない',
    ],
  },
  first: {
    blur: ['現行版と同じ。離れても読まない。戻ると、説明として読む'],
    submit: [
      '「登録する」を押す → フォーカスがメールアドレスに移り、「メールアドレス、無効、ログインに使います メールアドレスの形が正しくありません」',
      'エラーが2つ以上あっても、読むのは最初の欄だけ。警告の欄には移らない',
    ],
  },
  combo: {
    blur: ['A と同じ。次の欄を読み終えてから、出た文を読む'],
    submit: [
      'C と同じ。フォーカスが一覧に移って読む',
      '欄の行は、送信のときは知らせない（一覧と重ねて読まないため）',
    ],
  },
};

// ── ページの中で真似た読み上げ ──────────────────────────
// 本物の読み上げソフトではない。フォーカスが入った要素の名前・役割・説明と、live region に足された文を記録する
//   polite は、いま読んでいるもの（フォーカスの読み上げ）のあとに並べる。alert（assertive）はすぐに並べる
//   live region は、箱があとから足されたときは読まない。role="alert" だけは、足されたときにも読む

type How = 'focus' | 'polite' | 'assertive';

interface Heard {
  n: number;
  how: How;
  text: string;
}

const howLabel: Record<How, string> = {
  focus: '入ったとき',
  polite: '読み終えてから',
  assertive: '割り込んで',
};

function spoken(el: HTMLElement) {
  const refs = [...new Set((el.getAttribute('aria-describedby') ?? '').split(/\s+/))];
  const description = refs
    .filter(Boolean)
    .map((ref) => textOf(document.getElementById(ref)))
    .filter(Boolean)
    .join(' ');
  if (el instanceof HTMLInputElement) {
    return [
      textOf(el.labels?.[0]),
      'テキスト入力',
      el.getAttribute('aria-invalid') === 'true' && '無効',
      description,
    ]
      .filter(Boolean)
      .join('、');
  }
  if (el instanceof HTMLButtonElement)
    return `${el.getAttribute('aria-label') ?? textOf(el)}、ボタン`;
  if (el instanceof HTMLAnchorElement) return `${textOf(el)}、リンク`;
  // フォーカスを移した一覧（tabindex="-1"）。名前（見出し）のあとに中身を読む
  const labelledBy = el.getAttribute('aria-labelledby');
  const name = labelledBy ? textOf(document.getElementById(labelledBy)) : '';
  const rest = textOf(el).replace(name, '').trim();
  return [name, el.getAttribute('role') === 'group' && 'グループ', rest].filter(Boolean).join('、');
}

function useReader(root: HTMLElement | null) {
  const [log, setLog] = useState<Heard[]>([]);
  useEffect(() => {
    if (!root) return undefined;
    let n = 0;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const push = (how: How, text: string) => {
      n += 1;
      const entry = { n, how, text };
      setLog((current) => [...current, entry].slice(-8));
    };
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement) push('focus', spoken(event.target));
    };
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          const alert = node.matches('[role="alert"]')
            ? node
            : node.querySelector('[role="alert"]');
          const region = alert ?? node.parentElement?.closest('[aria-live], [role="alert"]');
          if (!region) continue;
          const live =
            region.getAttribute('role') === 'alert'
              ? 'assertive'
              : region.getAttribute('aria-live');
          const text = textOf(alert ?? node);
          if (!text) continue;
          if (live === 'assertive') push('assertive', text);
          if (live === 'polite') {
            const timer = setTimeout(() => {
              timers.delete(timer);
              push('polite', text);
            }, 60);
            timers.add(timer);
          }
        }
      }
    });
    observer.observe(root, { childList: true, subtree: true });
    root.addEventListener('focusin', onFocus);
    return () => {
      observer.disconnect();
      root.removeEventListener('focusin', onFocus);
      for (const timer of timers) clearTimeout(timer);
    };
  }, [root]);
  return { log, clear: () => setLog([]) };
}

// 部品の行の箱（aria-live="polite" — design/adr/0044）を、off に戻す。比べたとき、部品の行には aria-live がなかった
// 欄が描き直されたとき（はじめに戻す）も戻す。Form の外では部品は polite のまま変えないので、React が戻すことはない
function useNoLive(root: HTMLElement | null, enabled: boolean) {
  useLayoutEffect(() => {
    if (!root || !enabled) return undefined;
    const apply = () => {
      for (const region of root.querySelectorAll('[data-slot="field-message"]')) {
        if (region.getAttribute('aria-live') !== 'off') region.setAttribute('aria-live', 'off');
      }
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-live'],
    });
    return () => observer.disconnect();
  }, [root, enabled]);
}

const ReaderLog = ({ log }: { log: Heard[] }) => (
  <div className="flex flex-col gap-1">
    <p className="text-xs font-bold text-fg-muted">読み上げの記録（ページの中で真似たもの）</p>
    <ol className="flex min-h-10 flex-col gap-1 border-l-2 border-line pl-3 text-xs leading-5">
      {log.length === 0 ? (
        <li className="text-fg-subtle">まだ何も読んでいません</li>
      ) : (
        log.map((entry) => (
          <li key={entry.n} data-axis27-heard={entry.how}>
            <span className="font-bold">{howLabel[entry.how]}</span> {entry.text}
          </li>
        ))
      )}
    </ol>
  </div>
);

// ── C・D の一覧（GOV.UK のエラーの一覧の形） ─────────────
// 見た目は仮。エラーの欄と同じ組み合わせ（淡い赤の面＋2px の赤い枠）にした

interface SummaryItem {
  inputId: string;
  text: string;
}

// 一覧のリンクは赤い文字（Link の色の変数を上書きする）。淡い赤の面の上で 6.13:1
const dangerLink: CSSProperties & Record<'--link-color', string> = {
  '--link-color': 'var(--color-danger)',
};

function ErrorSummary({
  items,
  summaryRef,
}: {
  items: SummaryItem[];
  summaryRef: RefObject<HTMLDivElement | null>;
}) {
  const headingId = useId();
  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="group"
      aria-labelledby={headingId}
      data-axis27-summary
      className={[
        'flex flex-col gap-1 rounded-control border-2 border-danger bg-field-invalid px-4 py-3 text-sm leading-5',
        ...focusRing,
      ].join(' ')}
    >
      <p id={headingId} className="flex items-center gap-1 font-bold text-fg">
        <WarningCircleIcon className="size-4 shrink-0 text-danger" />
        入力を確かめてください（{items.length}件）
      </p>
      <ul className="flex flex-col gap-0.5 pl-5">
        {items.map((item) => (
          <li key={item.inputId}>
            <Link
              href={`#${item.inputId}`}
              style={dangerLink}
              onClick={(event) => {
                event.preventDefault();
                document.getElementById(item.inputId)?.focus();
              }}
            >
              {item.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnnounceCell({ candidate, timing }: { candidate: AnnounceCandidate; timing: Timing }) {
  const { mode } = candidate;
  const id = useId();
  const [round, setRound] = useState(0);
  const [messages, setMessages] = useState<Record<string, Message | null>>({});
  // どちらで確かめたか。D は、送信で出た行を知らせない
  const [source, setSource] = useState<Timing>('blur');
  const [summary, setSummary] = useState<SummaryItem[] | null>(null);
  const [focusTick, setFocusTick] = useState(0);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const playing = useRef(0);
  const { log, clear } = useReader(root);
  // 比べたときの現行版・C・E（欄を離れたとき）は、行を知らせなかった（aria-live がない）
  // 部品の行の箱は polite になった（design/adr/0044）ので、この行だけ off に戻す
  useNoLive(root, mode === 'none' || mode === 'summary' || (mode === 'first' && timing === 'blur'));

  useEffect(() => {
    if (focusTick) summaryRef.current?.focus();
  }, [focusTick]);
  useEffect(
    () => () => {
      playing.current += 1;
    },
    []
  );

  const checksOnBlur = timing === 'blur' && mode !== 'summary';
  const inputId = (name: string) => `${id}${name}`;
  const check = (spec: AnnounceFieldSpec, value: string) => {
    setSource('blur');
    setMessages((current) => ({ ...current, [spec.name]: spec.validate(value) }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const next: Record<string, Message | null> = {};
    for (const spec of announceFields) {
      const input = form.elements.namedItem(spec.name);
      next[spec.name] = spec.validate(input instanceof HTMLInputElement ? input.value : '');
    }
    setSource('submit');
    setMessages(next);
    if (mode === 'summary' || mode === 'combo') {
      const items = announceFields.flatMap((spec) => {
        const message = next[spec.name];
        return message?.kind === 'error'
          ? [{ inputId: inputId(spec.name), text: message.text }]
          : [];
      });
      setSummary(items.length ? items : null);
      if (items.length) setFocusTick((tick) => tick + 1);
    }
    // E は、部品の Form がこの描画のあとで、最初のエラーの欄へフォーカスを移して文字を選ぶ
  };

  const reset = () => {
    playing.current += 1;
    setRound((current) => current + 1);
    setMessages({});
    setSummary(null);
    setSource('blur');
    clear();
  };

  // 流れを再生: 欄に入る → 離れる（または送信する）→ もう一度欄に入る
  const play = async () => {
    reset();
    const token = playing.current;
    const wait = async (ms: number) => {
      await sleep(ms);
      return playing.current === token;
    };
    const email = () => document.getElementById(inputId('email'));
    if (!(await wait(400))) return;
    email()?.focus();
    if (!(await wait(1200))) return;
    if (timing === 'blur') {
      document.getElementById(inputId('displayName'))?.focus();
      if (!(await wait(1600))) return;
      // 表示名から離れる（再生のボタンへ）
      playerRef.current?.querySelector('button')?.focus();
      if (!(await wait(1400))) return;
      email()?.focus();
      return;
    }
    const submit = root?.querySelector<HTMLButtonElement>('[data-axis27-submit]');
    submit?.focus();
    if (!(await wait(1000))) return;
    submit?.click();
    if (!(await wait(1800))) return;
    const link = root?.querySelector<HTMLAnchorElement>('[data-axis27-summary] a');
    if (!link) {
      email()?.focus();
      return;
    }
    link.focus();
    if (!(await wait(1000))) return;
    link.click();
  };

  const body = (
    <>
      {announceFields.map((spec) => {
        const message = messages[spec.name] ?? null;
        const onBlur = checksOnBlur ? (value: string) => check(spec, value) : undefined;
        // 現行版・A・C・E は部品の TextField。A は部品の行（polite）のまま、ほかは useNoLive で off に戻している
        if (mode !== 'alert' && mode !== 'combo')
          return (
            <TextField
              key={spec.name}
              id={inputId(spec.name)}
              name={spec.name}
              label={spec.label}
              caption={spec.caption}
              defaultValue={spec.defaultValue}
              autoComplete="off"
              error={message?.kind === 'error' ? message.text : undefined}
              warning={message?.kind === 'warning' ? message.text : undefined}
              onBlur={onBlur ? (event) => onBlur(event.currentTarget.value) : undefined}
            />
          );
        let region: OwnFieldProps['region'] = {
          'aria-live': source === 'submit' ? 'off' : 'polite',
        };
        if (mode === 'alert') region = message?.kind === 'warning' ? {} : { role: 'alert' };
        return (
          <OwnField
            key={spec.name}
            id={inputId(spec.name)}
            name={spec.name}
            label={spec.label}
            caption={spec.caption}
            defaultValue={spec.defaultValue}
            message={message}
            region={region}
            onBlur={onBlur}
          />
        );
      })}
      {timing === 'submit' && (
        <Button type="submit" color="primary" className="self-start" data-axis27-submit>
          登録する
        </Button>
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-4" data-axis27-announce={mode} data-timing={timing}>
      <div ref={setRoot} className="flex flex-col gap-4">
        {summary && <ErrorSummary items={summary} summaryRef={summaryRef} />}
        {mode === 'first' && timing === 'submit' ? (
          // E の送信の列は、部品の Form（既定の知らせ方）で描く
          <Form key={round} onSubmit={onSubmit} className="flex flex-col gap-5">
            {body}
          </Form>
        ) : (
          <form key={round} noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
            {body}
          </form>
        )}
      </div>
      <div ref={playerRef} data-axis27-player className="flex flex-wrap gap-2">
        <Button appearance="outline" onClick={() => void play()}>
          流れを再生
        </Button>
        <Button appearance="outline" onClick={reset}>
          はじめに戻す
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold text-fg-muted">読み上げの流れ</p>
        <ol className="flex list-decimal flex-col gap-1 pl-4 text-xs leading-5">
          {flows[mode][timing].map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
      <ReaderLog log={log} />
    </div>
  );
}

// ═══ 2. 下の内容の動き ════════════════════════════════

interface ShiftCandidate extends Candidate {
  /** ふつうのフォームでの出し方 */
  normal: LineMode;
  /** 密なフォームでの出し方 */
  compact: LineMode;
}

// 測った値は、このストーリーのセルを Chrome で測ったもの（2026-09-13）
const shiftCandidates: ShiftCandidate[] = [
  {
    id: '現行版',
    normal: 'mount',
    compact: 'mount',
    // 部品の行は B の動きになったので、動きの長さを 0 にして、比べたときの形（跳ぶ）に戻す
    tokens: { '--duration-field-message': '0s' },
    name: '出たときに足す',
    intent:
      'いまの Field。エラー・警告の行は、出たときに足す。本体とキャプションは動かないが、下の内容が1行分（指用 24px・マウス用 22px）跳ぶ。',
    spec: [
      ['行の場所', '出たときに足す'],
      ['下の内容', '指用 +24px・マウス用 +22px 跳ぶ'],
      ['ふだんの高さ', '変わらない'],
    ],
  },
  {
    id: 'A',
    normal: 'reserve',
    compact: 'reserve',
    name: '行の場所をいつも取っておく',
    intent:
      '文がなくても、行の場所（空の行）をいつも取っておく。出ても消えても、下の内容は動かない。そのぶん、ふだんから1欄につき1行高い。文が2行になると、2行目の分は動く。',
    spec: [
      ['行の場所', 'いつも取っておく（空の行）'],
      ['下の内容', '±0px'],
      ['ふだんの高さ', '1欄につき 指用 +24px・マウス用 +22px'],
      ['5欄のフォーム', '+110px（マウス用）'],
    ],
  },
  {
    id: 'B',
    // 決めたあとは、部品（Field）の動きで描く
    normal: 'mount',
    compact: 'mount',
    name: '高さを開いて閉じる',
    intent:
      '行の高さを 0.2 秒で開き、閉じる（押下と同じ緩急）。文も同時に濃くなる。下の内容は動くが、跳ばずに滑る。動きを減らす設定のときは、動かさずに切り替える（現行版と同じ）。',
    spec: [
      ['行の場所', '出たときに足す'],
      ['動き', '高さと濃さを 0.2 秒（--ease-press）'],
      [
        '測った動き（マウス用）',
        '押してから 77ms で 9px、106ms で 16px、139ms で 19px、238ms で 22px（部品で測り直した値。現行版は最初のフレームで 22px）',
      ],
      ['動きを減らす設定', 'すぐ切り替える'],
    ],
    tokens: { '--duration-field-message': '200ms' },
  },
  {
    id: 'C',
    normal: 'mount',
    compact: 'reserve',
    // ふつうのフォームは現行版と同じ。現行版と同じく、動きの長さを 0 にして跳ばす
    tokens: { '--duration-field-message': '0s' },
    name: '密なフォームだけ取っておく',
    intent:
      'ふだんは現行版と同じ。フォームに指定（仮の名前 reserveMessage）を付けたときだけ、A と同じく行の場所を取っておく。どこで付けるかはアプリが決める。ここでは、右の列の密なフォームにだけ付けている。',
    spec: [
      ['行の場所', '指定したフォームだけ、いつも取っておく'],
      ['下の内容', 'ふつう +24px・+22px、指定したフォームは ±0px'],
      ['ふだんの高さ', '指定したフォームだけ 1欄 +22px（マウス用）'],
      ['部品の変更', 'フォームか欄に指定を足す'],
    ],
  },
  {
    id: 'D',
    normal: 'overlay',
    compact: 'overlay',
    name: '浮かべて重ねる',
    intent:
      '行の場所を取らず、文を本体のすぐ下に浮かべる（ツールチップのような形）。下の内容は動かないが、下の欄のラベルを隠す。浮かぶ UI なので、選択肢と同じ白い面・細い境界線・影にした（原則1の例外）。',
    spec: [
      ['行の場所', '取らない'],
      ['下の内容', '±0px'],
      ['重なり', '下の欄のラベルに 10px 重なる（密なフォームは 14px）'],
      ['面', '白・1px #DEE0E1・選択肢と同じ影'],
    ],
  },
];

const shiftColumns: Column[] = [
  {
    label: 'ふつうのフォーム（指用）',
    note: 'ボタンで、パスワードの欄を ふだん・警告・エラー に切り替えます。どの行も一緒に切り替わります',
  },
  { label: 'ふつうのフォーム（マウス用）', note: '同じフォームを、マウス用の寸法で' },
  {
    label: '密なフォーム（マウス用・5欄）',
    note: 'キャプションのない5つの欄で、電話番号の欄を切り替えます。C は、このフォームにだけ指定を付けています',
  },
];

interface ShiftFieldSpec {
  label: string;
  caption?: string;
  defaultValue: string;
  type?: string;
  /** 切り替える欄の文 */
  messages?: Record<Kind, string>;
}

const normalForm: ShiftFieldSpec[] = [
  { label: 'お名前', defaultValue: '山田 花子' },
  {
    label: 'パスワード',
    caption: '8文字以上で、英字と数字を含めます',
    defaultValue: 'kazuemon',
    type: 'password',
    messages: { error: '数字が入っていません', warning: 'よく使われるパスワードに似ています' },
  },
  { label: 'メールアドレス', defaultValue: 'hanako@example.com' },
];

const compactForm: ShiftFieldSpec[] = [
  { label: 'お名前', defaultValue: '山田 花子' },
  { label: 'フリガナ', defaultValue: 'ヤマダ ハナコ' },
  {
    label: '電話番号',
    defaultValue: '080-1234-5678',
    messages: { error: '電話番号の形が正しくありません', warning: 'ほかの登録と同じ番号です' },
  },
  { label: '郵便番号', defaultValue: '116-0013' },
  { label: '住所', defaultValue: '荒川区西日暮里 1-2-3' },
];

interface ShiftState {
  status: Status;
  setStatus: (status: Status) => void;
  auto: boolean;
  setAuto: (auto: boolean) => void;
}

const ShiftContext = createContext<ShiftState | null>(null);

const useShift = () => {
  const state = useContext(ShiftContext);
  if (!state) throw new Error('ShiftContext がありません');
  return state;
};

const statuses: [Status, string][] = [
  ['normal', 'ふだん'],
  ['warning', '警告'],
  ['error', 'エラー'],
];

function ShiftControls() {
  const { status, setStatus, auto, setAuto } = useShift();
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map(([value, label]) => (
        <Button
          key={value}
          // 選んでいる状態はグレーの塗り。青い塗りは「登録する」だけにする（原則7）
          appearance={!auto && status === value ? 'filled' : 'outline'}
          color="neutral"
          aria-pressed={!auto && status === value}
          data-axis27-status={value}
          onClick={() => {
            setAuto(false);
            setStatus(value);
          }}
        >
          {label}
        </Button>
      ))}
      <Button
        appearance={auto ? 'filled' : 'outline'}
        color="neutral"
        aria-pressed={auto}
        onClick={() => {
          if (!auto) setStatus(cycle[0]);
          setAuto(!auto);
        }}
      >
        くり返す
      </Button>
    </div>
  );
}

function ShiftField({
  spec,
  mode,
  status,
}: {
  spec: ShiftFieldSpec;
  mode: LineMode;
  status: Status;
}) {
  const message: Message | null =
    spec.messages && status !== 'normal' ? { kind: status, text: spec.messages[status] } : null;
  if (mode === 'mount')
    return (
      <TextField
        label={spec.label}
        caption={spec.caption}
        defaultValue={spec.defaultValue}
        type={spec.type}
        autoComplete="off"
        error={message?.kind === 'error' ? message.text : undefined}
        warning={message?.kind === 'warning' ? message.text : undefined}
      />
    );
  return (
    <OwnField
      mode={mode}
      label={spec.label}
      caption={spec.caption}
      defaultValue={spec.defaultValue}
      type={spec.type}
      message={message}
    />
  );
}

interface Readout {
  dy?: number;
  height: number;
  overlap: number;
}

function ShiftCell({ candidate, column }: { candidate: ShiftCandidate; column: Column }) {
  const { status } = useShift();
  const compact = column.label.startsWith('密な');
  const density = column.label.includes('指用') ? 'coarse' : 'fine';
  const mode = compact ? candidate.compact : candidate.normal;
  const form = compact ? compactForm : normalForm;
  const formRef = useRef<HTMLDivElement>(null);
  // ふだんのときの「登録する」の位置。ほかの状態との差を出す
  const base = useRef<number | null>(null);
  const [readout, setReadout] = useState<Readout>({ height: 0, overlap: 0 });
  useLayoutEffect(() => {
    const box = formRef.current;
    if (!box) return undefined;
    const measure = () => {
      const rect = box.getBoundingClientRect();
      const submit = box.querySelector('[data-axis27-submit]');
      const top = submit ? Math.round(submit.getBoundingClientRect().top - rect.top) : 0;
      if (status === 'normal') base.current = top;
      // 浮かべた文が、下の欄のラベルに重なる量
      let overlap = 0;
      const line = box.querySelector('[data-axis27-region="overlay"] [data-axis27-line]');
      const next = line?.closest('[data-axis27-field]')?.nextElementSibling?.querySelector('label');
      if (line && next) {
        const a = line.getBoundingClientRect();
        const b = next.getBoundingClientRect();
        overlap = Math.max(0, Math.round(Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)));
      }
      setReadout({
        dy: base.current === null ? undefined : top - base.current,
        height: Math.round(rect.height),
        overlap,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [status]);
  return (
    <div data-density={density} className="flex flex-col gap-4">
      <ShiftControls />
      <p className="text-xs leading-5 text-fg-subtle tabular-nums" data-axis27-readout>
        {readout.dy === undefined
          ? `フォームの高さ ${readout.height}px`
          : `「登録する」${signed(readout.dy)}（ふだんとの差）・フォームの高さ ${readout.height}px`}
        {readout.overlap > 0 && `・下の欄のラベルに ${readout.overlap}px 重なる`}
      </p>
      <div
        ref={formRef}
        data-axis27-form={mode}
        className={['flex flex-col', compact ? 'gap-4' : 'gap-5'].join(' ')}
      >
        {form.map((spec) => (
          <ShiftField key={spec.label} spec={spec} mode={mode} status={status} />
        ))}
        <Button color="primary" className="self-start" data-axis27-submit>
          登録する
        </Button>
      </div>
    </div>
  );
}

// くり返すときの順番
const cycle: Status[] = ['error', 'normal', 'warning', 'normal'];

function ShiftStory({ pick }: { pick: string }) {
  const [status, setStatus] = useState<Status>('normal');
  const [auto, setAuto] = useState(false);
  useEffect(() => {
    if (!auto) return undefined;
    // 最初の cycle[0] は「くり返す」を押したときに入れている
    let i = 0;
    const timer = setInterval(() => {
      i = (i + 1) % cycle.length;
      setStatus(cycle[i]);
    }, 1500);
    return () => clearInterval(timer);
  }, [auto]);
  return (
    <ShiftContext.Provider value={{ status, setStatus, auto, setAuto }}>
      <style>{fieldCss}</style>
      <Comparison
        index={27}
        axis="エラー・警告の知らせ方: 下の内容の動き"
        pick={pick}
        candidates={shiftCandidates}
        columns={shiftColumns}
        renderCell={(column, candidate) => {
          const found = shiftCandidates.find((c) => c.id === candidate.id);
          return (
            found && (
              <div data-axis27-row={found.id}>
                <ShiftCell candidate={found} column={column} />
              </div>
            )
          );
        }}
      >
        <p>
          エラー・警告の行が出たときに、下の内容をどう動かすかを選びます。いまは、行が出ると下の内容が1行分（指用
          24px・マウス用 22px）跳びます。本体とキャプションは動きません（ADR-0041）。
        </p>
        <p>
          決めたこと（ADR-0044）: B にしました。部品（Field）の行が、高さと濃さを 0.2
          秒で開き、閉じます。B の行は部品のまま描いています。現行版と C
          のふつうのフォームは、動きの長さを 0 にして、比べたときの跳ぶ動きに戻しています。
        </p>
        <p>
          セルのボタンで、パスワードの欄（密なフォームは電話番号の欄）を
          ふだん・警告・エラーに切り替えます。どの行も一緒に切り替わるので、動き方を並べて見られます。「くり返す」を押すと、1.5
          秒ごとに切り替わり続けます。セルの数字は、「登録する」が動いた量とフォームの高さを測ったものです。
        </p>
        <p>
          行の場所を取っておくと（A・C）、動かないかわりに、ふだんから欄が高くなります。右の列の5欄のフォームで、その分を比べてください。B
          の動きは、動きを減らす設定のときは止めます。D は、この比較のために仮に組んだ形です。
        </p>
        <p>下の内容の動きをどう扱うか、1案を選んで一言添えてください。</p>
      </Comparison>
    </ShiftContext.Provider>
  );
}

// ═══ 3. シートの文 ═══════════════════════════════════

type SheetPlace = 'none' | 'caption' | 'band' | 'error-only';

interface SheetCandidate extends Candidate {
  place: SheetPlace;
}

const sheetCandidates: SheetCandidate[] = [
  {
    id: '現行版',
    place: 'none',
    name: '出さない',
    intent:
      'シートの見出しは、ラベルとヘルプテキストだけ（ADR-0041 で決めた形）。エラー・警告は本体の下にあり、シートが低いときは、暗くなった後ろに見える。',
    spec: [
      ['シートの見出し', 'ラベル → ヘルプテキスト'],
      ['エラー・警告', '出さない（本体の下だけ）'],
    ],
  },
  {
    id: 'A',
    place: 'caption',
    name: 'ヘルプテキストの下に',
    intent:
      'ヘルプテキストのすぐ下に、本体の下と同じアイコン付きの行を出す。ラベル・ヘルプテキスト・エラー（警告）が1つのまとまりになる。× の位置は変わらない。',
    spec: [
      ['シートの見出し', 'ラベル → ヘルプテキスト → エラー（警告）'],
      ['文の形', '本体の下と同じ。エラー #BA012D（白地 6.71:1）、警告 #727200（5.09:1）'],
      ['見出しの高さ', '+20px（文が1行のとき）'],
    ],
  },
  {
    id: 'B',
    place: 'band',
    name: '選択肢の上に帯で',
    intent:
      '見出しの下、選択肢のすぐ上に、シートの幅いっぱいの淡い帯で出す。見出しとは切り離し、選択肢への注意として見せる。',
    spec: [
      ['場所', '見出しの下、選択肢のすぐ上'],
      ['文の形', '帯。エラーは #FEF2F1 に #BA012D（6.13:1）、警告は #F3F5CE に #727200（4.55:1）'],
      ['見出しの高さ', '+36px（文が1行のとき）'],
    ],
  },
  {
    id: 'C',
    place: 'error-only',
    name: 'エラーだけ',
    intent:
      'A の形で、エラーだけを出す。警告は送信を止めないので、シートには出さない（本体の下だけ）。',
    spec: [
      ['シートの見出し', 'ラベル → ヘルプテキスト → エラー'],
      ['警告', '出さない（本体の下だけ）'],
      ['見出しの高さ', 'エラーのとき +20px'],
    ],
  },
];

const sheetColumns: Column[] = [
  {
    label: 'エラー（開いた状態）',
    note: '「八王子市」を選んでいて、お届けできない。選び直すと、欄とシートの文も変わります',
  },
  { label: '警告（開いた状態）', note: '「荒川区」を選んでいて、お届けが翌日になる' },
];

const areas: SelectItem[] = ['足立区', '荒川区', '板橋区', '江戸川区', '八王子市', '町田市'].map(
  (label, i) => ({ label, value: `area-${i}` })
);

const areaMessage = (value: string | null): Message | null => {
  if (value === 'area-4' || value === 'area-5')
    return { kind: 'error', text: 'この地域にはお届けできません' };
  if (value === 'area-1') return { kind: 'warning', text: '荒川区は、お届けが翌日になります' };
  return null;
};

// B の帯を足す場所（シートの見出し全体。つまみ・ラベル・×）を探す。帯は、この最後（選択肢のすぐ上）に足す
// 部品の見出しの形（× の親の親が見出し全体）に頼る
const findHeader = (frame: HTMLElement): HTMLElement | null => {
  const close = frame.querySelector('[data-slot="select-popup"] button[aria-label="閉じる"]');
  const header = close?.parentElement?.parentElement;
  return header instanceof HTMLElement ? header : null;
};

// 部品の Select は、見出しのヘルプテキストの下に欄の文を出す（design/adr/0044 — 比べたときの A）
// 比べたときの形に戻す: 現行版と B は、その行を隠す（B の帯はこの中で足す）。C は警告の行だけ隠す（エラーだけ出す）
const sheetCss = `
[data-axis27-row="現行版"] [data-slot="select-sheet-message"],
[data-axis27-row="B"] [data-slot="select-sheet-message"],
[data-axis27-row="C"] [data-slot="select-sheet-message"][data-kind="warning"] { display: none; }
`;

// スマートフォンの画面（375 × 700）。指で操作する密度に固定する（軸 19 と同じ枠）
function SheetPhone({ candidate, initial }: { candidate: SheetCandidate; initial: string }) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const [value, setValue] = useState<string | null>(initial);
  const [header, setHeader] = useState<HTMLElement | null>(null);
  const message = areaMessage(value);
  useEffect(() => {
    if (!frame) return undefined;
    // シートは開いたまま描かれるので、見出しができたところで場所を覚える
    const check = () => {
      const found = findHeader(frame);
      if (found) {
        observer.disconnect();
        setHeader(found);
      }
    };
    const observer = new MutationObserver(check);
    observer.observe(frame, { childList: true, subtree: true });
    const timer = setTimeout(check, 0);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [frame]);
  const { place } = candidate;
  // A・C の行（ヘルプテキストの下）は、部品の見出しの行のまま（C の警告は sheetCss で隠す）。B の帯だけ、この中で足す
  const shown = message && place === 'band' ? message : null;
  let extra: ReactNode = null;
  if (header && shown)
    extra = createPortal(
      // 見出しと同じく、読み上げでは隠す（本体の説明につながっている）
      <div
        aria-hidden
        data-axis27-band={shown.kind}
        className="mb-1 flex items-start gap-(--field-message-gap) text-(length:--text-caption) leading-(--leading-caption)"
        style={{
          marginInline: 'calc(-1 * var(--select-popup-padding))',
          padding: '8px var(--space-control-x)',
          backgroundColor:
            shown.kind === 'error' ? 'var(--color-field-invalid)' : 'var(--color-tag-warning)',
          color: shown.kind === 'error' ? 'var(--color-danger)' : 'var(--color-fg-warning)',
        }}
      >
        {shown.kind === 'error' ? (
          <WarningCircleIcon className={styles.messageIcon()} />
        ) : (
          <WarningIcon className={styles.messageIcon()} />
        )}
        <span className="min-w-0">{shown.text}</span>
      </div>,
      header
    );
  return (
    <div
      ref={setFrame}
      data-density="coarse"
      data-sheet-preview
      className="relative h-[700px] w-[375px] [transform:translateZ(0)] overflow-clip rounded-[28px] border border-line bg-bg"
    >
      <div className="flex flex-col gap-5 px-5 pt-8">
        <h2 className="text-xl font-heading">お届け先</h2>
        <TextField label="お名前" defaultValue="山田 花子" />
        {frame && (
          <Select
            label="住所"
            prefix="東京都"
            caption="お届けは23区内だけです"
            items={areas}
            value={value}
            onValueChange={setValue}
            error={message?.kind === 'error' ? message.text : undefined}
            warning={message?.kind === 'warning' ? message.text : undefined}
            container={frame}
            presentation="sheet"
            open
            modal={false}
          />
        )}
        <TextField label="番地・建物名" defaultValue="西日暮里 1-2-3" />
      </div>
      {extra}
    </div>
  );
}

// 開いたままの選択肢がフォーカスを取り、ページがスクロールするのを戻す（軸 19 と同じ）
const ResetFocus = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      window.scrollTo(0, 0);
      // 狭い画面では、比較の横スクロールも右の列へ動くので戻す
      for (const el of document.querySelectorAll('.overflow-x-auto')) el.scrollLeft = 0;
    }, 300);
    return () => clearTimeout(timer);
  }, []);
  return null;
};

// ═══ 4. 選択肢に付く文 ═════════════════════════════════
// 文を2つに分ける。選択肢に付く文（八王子市・町田市はお届けできない、荒川区はお届けが翌日になる）と、選択肢に関係ない欄の文
// 現行版の行は部品（Select）のまま。A〜D は、選択肢の2行目と選べない選択肢を NoteSelect で組む
//   シートは中身の高さで開く。部品は、中身が画面の半分を超えると半分の高さで開き、つまみを出す
//   ここでは文を見比べるため、すべての選択肢を出す（2行目のある項目は、1つにつき 指用・マウス用とも +8px 高い。52px・48px）
//   浮かぶ選択肢の高さの上限と続きの影は、選択肢が短いので省いた

type NoteKind = Kind | 'reason';

interface Note {
  kind: NoteKind;
  text: string;
}

// 部品の SelectItem（disabled・note — design/adr/0044）と同じ形。note の種類に、比べた B・C の error を足している
//   disabled: 選べない（A・D）。Base UI の Select.Item の disabled（aria-disabled。矢印キーでは止まる）
//   note: ラベルの下の2行目。reason は選べない理由（灰色・アイコンなし）、error・warning は印（アイコン＋色）
interface NoteOption extends Omit<SelectItem, 'note'> {
  note?: Note;
}

type OptionPlace = 'none' | 'disable' | 'mark' | 'target' | 'group';

interface OptionCandidate extends Candidate {
  place: OptionPlace;
}

// 測った値は、このストーリーを Chrome の CDP（Accessibility.getPartialAXTree）で測ったもの（2026-09-13）
// コントラストは design/tools/color.mjs で計算した
const optionCandidates: OptionCandidate[] = [
  {
    id: '現行版',
    place: 'none',
    name: '選択肢に付けない',
    intent:
      'いまの部品（ADR-0041）。選択肢には何も付かず、どれも選べる。選んだあとに、本体の下にエラー・警告が出る。シートの見出しは、ラベルとヘルプテキストだけ。',
    spec: [
      ['選択肢', '文なし。どれも選べる'],
      ['選んだあと', '本体の下にエラー・警告'],
      ['欄の文', '本体の下だけ（シートには出さない）'],
    ],
  },
  {
    id: 'A',
    place: 'disable',
    name: '選べなくする',
    intent:
      'お届けできない選択肢は、選べなくする。ラベルの下に、理由を灰色の小さな文字で出す。お届けが遅れる荒川区は選べるままで、三角と警告の色の文を付ける。選べないので、欄に選択肢のエラーは出ない。選択肢に関係ない欄の文は、シートのヘルプテキストの下と、本体の下に出す。',
    spec: [
      ['エラーの選択肢', '選べない。ラベル #A3A5A6、理由 #6E787D（白地 4.52:1）'],
      ['警告の選択肢', '選べる。三角＋文 #727200（白地 5.09:1）'],
      ['選んだあと', '警告だけ本体の下に（見出しには出さない）'],
      ['欄の文', 'ヘルプテキストの下と本体の下'],
      ['読み上げ（測った値）', '選べない選択肢は「八王子市」・説明「お届けできません」・disabled'],
      [
        'キーボード（測った値）',
        '↓ で選べない選択肢にも止まる（読める）。Enter・押しても選ばれない',
      ],
      ['部品の指定（案）', 'items の各項目に disabled と note'],
    ],
  },
  {
    id: 'B',
    place: 'mark',
    name: '選べるが印を付ける',
    intent:
      'どの選択肢も選べる。お届けできない選択肢には丸の「!」と赤い文を、遅れる選択肢には三角と警告の色の文を、ラベルの下に付ける。選ぶと、本体の下にエラー・警告が出る。文は選択肢に付いているので、シートの見出しには足さない。欄の文は A と同じ。',
    spec: [
      ['エラーの選択肢', '選べる。丸の「!」＋文 #BA012D（白地 6.71:1、選んだ項目の上 5.94:1）'],
      ['警告の選択肢', 'A と同じ（選んだ項目の上 4.51:1）'],
      ['選んだあと', '本体の下にエラー・警告（見出しには出さない）'],
      ['欄の文', 'A と同じ'],
      ['読み上げ（測った値）', '「八王子市」・説明「お届けできません」'],
      ['部品の指定（案）', 'items の各項目に note'],
    ],
  },
  {
    id: 'C',
    place: 'target',
    name: '欄の文に付け先を指定',
    intent:
      '選択肢には、前もって何も付けない。欄に渡すエラー・警告に、付け先の指定（仮の名前 messageTarget）を足す。"option" の文は、選んでいる選択肢のラベルの下に B の形で出し、見出しには出さない。"field"（既定）の文は、ヘルプテキストの下に出す。どちらも本体の下にも出す。選んだあとに確かめるフォームに向く。',
    spec: [
      ['選ぶ前', '選択肢に何も付かない（現行版と同じ）'],
      ['"option" の文', '選んでいる選択肢の下（B の形）と本体の下'],
      ['"field" の文', 'ヘルプテキストの下と本体の下'],
      ['部品の指定（案）', 'error・warning と一緒に messageTarget: "field" | "option"'],
    ],
  },
  {
    id: 'D',
    place: 'group',
    name: '選べない選択肢をまとめる',
    intent:
      'お届けできない選択肢を、「お届けできない地域」の見出しを付けて最後にまとめ、選べなくする。理由は1つずつ書かず、見出しで伝える。まとめるので並びが変わる（この例では、もともと最後）。遅れる選択肢は、その場所で A と同じ警告の文を付ける。欄の文は A と同じ。',
    spec: [
      ['エラーの選択肢', '最後にまとめて選べない。見出し #6E787D（白地 4.52:1）'],
      ['警告の選択肢', 'A と同じ'],
      ['欄の文', 'A と同じ'],
      ['読み上げ（測った値）', '群の名前「お届けできない地域」、選択肢は「八王子市」・disabled'],
      ['部品の指定（案）', '選択肢を群に分け、群に見出しを付ける'],
    ],
  },
];

const optionColumns: Column[] = [
  {
    label: 'シート（開いた状態）',
    note: '荒川区を選んでいる（お届けが翌日になる）。八王子市・町田市はお届けできない',
  },
  { label: '浮かぶ選択肢（開いた状態・マウス用）', note: 'まだ選んでいない' },
  {
    label: '欄の文（シート）',
    note: 'ボタンで、選択肢に関係ない文を切り替えます。どの行も一緒に切り替わります',
  },
  {
    label: '触って確かめる',
    note: '八王子市や荒川区を選ぶ、選ばずに「次へ」を押す、を試せます',
  },
];

interface OptionArea extends SelectItem {
  /** 選択肢に付く文。error はお届けできない、warning はお届けが遅れる */
  kind?: Kind;
}

const optionAreas: OptionArea[] = [
  { label: '足立区', value: 'adachi' },
  { label: '荒川区', value: 'arakawa', kind: 'warning' },
  { label: '板橋区', value: 'itabashi' },
  { label: '江戸川区', value: 'edogawa' },
  { label: '八王子市', value: 'hachioji', kind: 'error' },
  { label: '町田市', value: 'machida', kind: 'error' },
];

const areaField = {
  label: '市区町村',
  prefix: '東京都',
  caption: 'お届けは23区内だけです',
  placeholder: '選んでください',
};

// 選択肢の2行目の文（短く）
const noteText: Record<Kind, string> = {
  error: 'お届けできません',
  warning: 'お届けが翌日になります',
};

// 選んだ選択肢の文（本体の下）
const chosenMessage = (value: string | null): Message | null => {
  const area = optionAreas.find((a) => a.value === value);
  if (!area?.kind) return null;
  return area.kind === 'error'
    ? { kind: 'error', text: `${area.label}にはお届けできません` }
    : { kind: 'warning', text: `${area.label}は、お届けが翌日になります` };
};

// 選択肢に関係ない欄の文。どの選択肢を選んでも（選ばなくても）出る
type FieldCase = 'required' | 'postal' | 'server';

interface FieldCaseSpec {
  button: string;
  /** そのときに選んでいる選択肢 */
  value: string | null;
  message: Message;
}

const fieldCaseOrder: FieldCase[] = ['required', 'postal', 'server'];

const fieldCases: Record<FieldCase, FieldCaseSpec> = {
  required: {
    button: '選ばずに送信',
    value: null,
    message: { kind: 'error', text: '市区町村を選んでください' },
  },
  postal: {
    button: '郵便番号と合わない',
    value: 'itabashi',
    message: { kind: 'error', text: '郵便番号（116-0013）の市区町村と違います' },
  },
  server: {
    button: '確かめられない',
    value: 'adachi',
    message: { kind: 'error', text: '住所を確かめられませんでした' },
  },
};

interface Shown {
  items: NoteOption[];
  /** D: 選べない選択肢を、見出しを付けて最後にまとめる */
  tail?: { label: string; items: NoteOption[] };
  /** 本体の下の文 */
  message: Message | null;
  /** シートの見出し（ヘルプテキストの下）の文 */
  header: Message | null;
}

const plainItem = ({ label, value }: OptionArea): NoteOption => ({ label, value });

const markedItem = (area: OptionArea): NoteOption =>
  area.kind
    ? { ...plainItem(area), note: { kind: area.kind, text: noteText[area.kind] } }
    : plainItem(area);

// 案ごとに、選択肢・本体の下の文・見出しの文を決める。field は選択肢に関係ない欄の文
function shownFor(place: OptionPlace, value: string | null, field: Message | null): Shown {
  // 本体の下には1つだけ出す（部品と同じ）。欄の文があればそれを、なければ選んだ選択肢の文を出す
  const message = field ?? chosenMessage(value);
  switch (place) {
    case 'disable':
      return {
        items: optionAreas.map((area) =>
          area.kind === 'error'
            ? { ...plainItem(area), disabled: true, note: { kind: 'reason', text: noteText.error } }
            : markedItem(area)
        ),
        message,
        header: field,
      };
    case 'mark':
      return { items: optionAreas.map(markedItem), message, header: field };
    case 'target': {
      // 付け先が "option" の文（選んだ選択肢の文）は、選んでいる選択肢の下に。"field" の文は見出しに
      const target = field ? null : message;
      return {
        items: optionAreas.map((area) =>
          target && area.value === value ? { ...plainItem(area), note: target } : plainItem(area)
        ),
        message,
        header: field,
      };
    }
    case 'group':
      return {
        items: optionAreas.filter((area) => area.kind !== 'error').map(markedItem),
        tail: {
          label: 'お届けできない地域',
          items: optionAreas
            .filter((area) => area.kind === 'error')
            .map((area) => ({ ...plainItem(area), disabled: true })),
        },
        message,
        header: field,
      };
    default:
      return { items: optionAreas.map(plainItem), message, header: null };
  }
}

// Select と同じ切り替えの基準（src/components/Select.tsx の SHEET_QUERY）。触って確かめる列の auto で使う
const SHEET_QUERY = [
  '(pointer: coarse) and (orientation: portrait) and (max-width: 767.98px)',
  '(pointer: coarse) and (orientation: landscape) and (max-width: 1023.98px)',
].join(', ');

const useNarrowScreen = () =>
  useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(SHEET_QUERY);
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => window.matchMedia(SHEET_QUERY).matches,
    () => false
  );

// 選択肢の2行目。reason: 選べない理由（キャプションと同じ灰色、アイコンなし）
// error・warning: 本体の下の行と同じ形（ADR-0041）。選んだ項目の青い文字の中でも、文の色のまま
function OptionNote({ note, id }: { note: Note; id: string }) {
  if (note.kind === 'reason')
    return (
      <span
        id={id}
        data-axis27-note="reason"
        className="text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle"
      >
        {note.text}
      </span>
    );
  const Icon = note.kind === 'error' ? WarningCircleIcon : WarningIcon;
  return (
    <span
      id={id}
      data-axis27-note={note.kind}
      className={styles.message({
        className: note.kind === 'error' ? 'text-danger' : 'text-fg-warning',
      })}
    >
      <Icon className={styles.messageIcon()} />
      <span className="min-w-0">{note.text}</span>
    </span>
  );
}

// 項目の見た目は Select と同じ。高さは最小にし、2行目のある項目だけ伸ばす
const noteItemClass = [
  'flex min-h-(--size-control) cursor-pointer items-center gap-(--space-control-x) rounded-[calc(var(--radius-control)-var(--select-popup-padding))] px-[calc(var(--space-control-x)-var(--select-popup-padding))] outline-none select-none',
  'data-highlighted:bg-(color:--color-select-item-highlight)',
  'data-selected:text-(color:--color-on-select-item-selected) data-selected:not-data-highlighted:bg-(color:--color-select-item-selected)',
  'data-selected:data-highlighted:bg-(color:--color-select-item-selected-highlight)',
  // 選べない選択肢: ラベルは押せない文字の色（#A3A5A6 — ADR-0026）。hover でも塗らない
  'data-disabled:cursor-not-allowed data-disabled:text-(color:--color-on-field-disabled) data-disabled:data-highlighted:bg-transparent',
].join(' ');

function NoteItem({ item }: { item: NoteOption }) {
  const id = useId();
  const { note } = item;
  return (
    <BaseSelect.Item
      value={item.value}
      disabled={item.disabled}
      // 読み上げの名前はラベルだけ、2行目は説明にする
      aria-labelledby={note ? `${id}label` : undefined}
      aria-describedby={note ? `${id}note` : undefined}
      className={[noteItemClass, note && 'py-1.5'].filter(Boolean).join(' ')}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <BaseSelect.ItemText id={`${id}label`}>{item.label}</BaseSelect.ItemText>
        {note && <OptionNote note={note} id={`${id}note`} />}
      </div>
      <BaseSelect.ItemIndicator className="flex text-(color:--color-select-check)">
        <CheckIcon />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

interface AreaSelectProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  presentation: SelectPresentation;
  open?: boolean;
  modal?: boolean;
  container?: HTMLElement | null;
  /** 開いたまま固定する列。画面の外の行でも下に開くよう、反対側に出さない（軸 18 と同じ） */
  pinned?: boolean;
}

// Select の見た目を写し、選択肢の2行目・選べない選択肢・見出しの文を足したもの（A〜D）
function NoteSelect({
  items,
  tail,
  message,
  header,
  value,
  onValueChange,
  presentation,
  open: openProp,
  modal,
  container,
  pinned,
}: Shown & AreaSelectProps) {
  const narrow = useNarrowScreen();
  const sheet = presentation === 'sheet' || (presentation === 'auto' && narrow);
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const id = useId();
  const headerCaptionId = `${id}caption`;
  const headerMessageId = `${id}message`;
  const all = tail ? [...items, ...tail.items] : items;
  return (
    <Field
      label={areaField.label}
      caption={areaField.caption}
      error={message?.kind === 'error' ? message.text : undefined}
      warning={message?.kind === 'warning' ? message.text : undefined}
      nativeLabel={false}
    >
      {(describedBy) => {
        // 一覧（listbox）の説明: ヘルプテキスト → 欄の文。選択肢に付く文は、その選択肢の説明にあるので入れない
        // シートは見出しの文を、浮かぶ選択肢は本体の上下の文（キャプション・行）を指す
        const [captionRef, messageRef] = describedBy?.split(' ') ?? [];
        const listDescribedBy =
          (sheet
            ? [headerCaptionId, header && headerMessageId]
            : [captionRef, header && messageRef]
          )
            .filter(Boolean)
            .join(' ') || undefined;
        return (
          <BaseSelect.Root
            items={all}
            value={value}
            onValueChange={onValueChange}
            open={open}
            onOpenChange={setOpenState}
            modal={modal}
          >
            <BaseSelect.Trigger
              aria-describedby={describedBy}
              data-slot="control"
              data-addon-shape="attached"
              className={controlBox({
                className: [
                  'cursor-pointer text-left data-popup-open:border-focus data-popup-open:bg-field-focus',
                  '[--field-addon-pad:calc(var(--space-control-x)-var(--field-border-width))]',
                ],
              })}
            >
              <FieldAddon>{areaField.prefix}</FieldAddon>
              <BaseSelect.Value
                className="min-w-0 flex-1 truncate data-placeholder:text-fg-subtle"
                placeholder={areaField.placeholder}
              />
              <BaseSelect.Icon className="flex text-fg-muted">
                <CaretDownIcon />
              </BaseSelect.Icon>
            </BaseSelect.Trigger>
            <BaseSelect.Portal container={container}>
              {sheet && (
                <BaseSelect.Backdrop className="fixed inset-0 z-10 bg-(color:--color-select-sheet-backdrop) transition-opacity duration-(--duration-sheet) ease-(--ease-sheet) data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
              )}
              <BaseSelect.Positioner
                alignItemWithTrigger={false}
                collisionAvoidance={pinned ? { side: 'none', align: 'none' } : undefined}
                sideOffset={4}
                data-presentation={sheet ? 'sheet' : 'popover'}
                className={[
                  'z-10 outline-none',
                  sheet &&
                    'inset-x-0! top-auto! bottom-0! left-0! flex max-h-[85%] flex-col [position:fixed]! [transform:none]!',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <BaseSelect.Popup
                  data-slot="select-popup"
                  className={[
                    'p-(--select-popup-padding) text-(length:--text-control) leading-(--leading-control) text-fg outline-none',
                    'border-(length:--select-popup-line-width) border-(color:--color-select-popup-line) bg-(color:--color-select-popup)',
                    sheet
                      ? [
                          'flex min-h-0 w-full flex-col rounded-t-(--select-sheet-radius) border-x-0 border-b-0 py-0 [box-shadow:var(--shadow-select-sheet)]',
                          '[transition:translate_var(--duration-sheet)_var(--ease-sheet)] motion-reduce:[transition:none]',
                          'data-ending-style:translate-y-full data-starting-style:translate-y-full',
                        ].join(' ')
                      : [
                          'min-w-(--anchor-width) origin-(--transform-origin) overflow-clip rounded-control py-0 [box-shadow:var(--shadow-select-popup)]',
                          'transition-[opacity,scale] duration-(--duration-press) ease-press data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0',
                        ].join(' '),
                  ].join(' ')}
                >
                  {/* シートの見出し（Select と同じ）。ヘルプテキストの下に、選択肢に関係ない欄の文を足す */}
                  {sheet && (
                    <div className="flex shrink-0 flex-col select-none">
                      <div aria-hidden className="flex h-4 items-center justify-center">
                        <div className="invisible h-1 w-9 rounded-pill bg-(color:--color-line)" />
                      </div>
                      <div className="relative">
                        <div
                          aria-hidden
                          className="flex flex-col gap-0.5 py-[calc((var(--size-control)-var(--leading-label))/2)] pr-(--size-control) pl-[calc(var(--space-control-x)-var(--select-popup-padding))]"
                        >
                          <div className="text-(length:--text-label) leading-(--leading-label) font-bold">
                            {areaField.label}
                          </div>
                          <div
                            id={headerCaptionId}
                            className="text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle"
                          >
                            {areaField.caption}
                          </div>
                          {header && (
                            <MessageLine
                              key={`${header.kind}${header.text}`}
                              message={header}
                              id={headerMessageId}
                              className="mt-0.5"
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-label="閉じる"
                          onClick={() => setOpenState(false)}
                          className={[
                            'absolute top-0 right-0 flex size-(--size-control) cursor-pointer items-center justify-center rounded-[calc(var(--radius-control)-var(--select-popup-padding))] text-fg-muted',
                            ...focusRing,
                            'hover:bg-flat-hover active:bg-flat-press',
                          ].join(' ')}
                        >
                          <XIcon standalone />
                        </button>
                      </div>
                    </div>
                  )}
                  <BaseSelect.List
                    aria-describedby={listDescribedBy}
                    className={
                      sheet
                        ? 'min-h-0 flex-1 overflow-y-auto pb-[max(var(--select-popup-padding),env(safe-area-inset-bottom))]'
                        : 'max-h-[min(var(--available-height),var(--select-popup-max-height,var(--available-height)))] overflow-y-auto py-(--select-popup-padding)'
                    }
                  >
                    {items.map((item) => (
                      <NoteItem key={item.value} item={item} />
                    ))}
                    {tail && (
                      <BaseSelect.Group
                        data-axis27-group
                        className="mt-1 border-t border-(color:--color-select-popup-line) pt-1"
                      >
                        <BaseSelect.GroupLabel className="flex h-8 items-center px-[calc(var(--space-control-x)-var(--select-popup-padding))] text-(length:--text-caption) leading-(--leading-caption) font-bold text-fg-subtle">
                          {tail.label}
                        </BaseSelect.GroupLabel>
                        {tail.items.map((item) => (
                          <NoteItem key={item.value} item={item} />
                        ))}
                      </BaseSelect.Group>
                    )}
                  </BaseSelect.List>
                </BaseSelect.Popup>
              </BaseSelect.Positioner>
            </BaseSelect.Portal>
          </BaseSelect.Root>
        );
      }}
    </Field>
  );
}

// 現行版は部品の Select、A〜D は NoteSelect
function AreaSelect({
  place,
  shown,
  ...props
}: AreaSelectProps & { place: OptionPlace; shown: Shown }) {
  if (place !== 'none') return <NoteSelect {...shown} {...props} />;
  const { pinned, ...rest } = props;
  return (
    <Select
      {...areaField}
      items={shown.items.map(({ label, value }) => ({ label, value }))}
      error={shown.message?.kind === 'error' ? shown.message.text : undefined}
      warning={shown.message?.kind === 'warning' ? shown.message.text : undefined}
      collisionAvoidance={pinned ? { side: 'none', align: 'none' } : undefined}
      {...rest}
    />
  );
}

// スマートフォンの画面（375 × 700）。指で操作する密度に固定する（シートの文と同じ枠）
// 選び直すと、選択肢に関係ない欄の文は消える（確かめ直すまで出さない）
function OptionPhone({
  place,
  initial,
  field,
}: {
  place: OptionPlace;
  initial: string | null;
  field: Message | null;
}) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const [value, setValue] = useState(initial);
  const shown = shownFor(place, value, value === initial ? field : null);
  return (
    <div
      ref={setFrame}
      data-density="coarse"
      data-axis27-fixed
      className="relative h-[700px] w-[375px] [transform:translateZ(0)] overflow-clip rounded-[28px] border border-line bg-bg"
    >
      <div className="flex flex-col gap-5 px-5 pt-8">
        <h2 className="text-xl font-heading">お届け先</h2>
        <TextField label="郵便番号" defaultValue="116-0013" />
        {frame && (
          <AreaSelect
            place={place}
            shown={shown}
            value={value}
            onValueChange={setValue}
            presentation="sheet"
            open
            modal={false}
            container={frame}
          />
        )}
        <TextField label="番地・建物名" defaultValue="西日暮里 1-2-3" />
      </div>
    </div>
  );
}

// 画面の広い端末（マウス用）。浮かぶ選択肢を開いたまま固定する
// 部品は浮かぶ選択肢の高さを、枠の高さの半分までにする（ADR-0037）。どの行も切れないよう、枠を 600px にする
function OptionPopover({ place }: { place: OptionPlace }) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const [value, setValue] = useState<string | null>(null);
  const shown = shownFor(place, value, null);
  return (
    <div
      ref={setFrame}
      data-density="fine"
      data-axis27-fixed
      className="relative flex h-[600px] flex-col gap-5 overflow-clip rounded-card border border-line bg-bg p-5"
    >
      {frame && (
        <AreaSelect
          place={place}
          shown={shown}
          value={value}
          onValueChange={setValue}
          presentation="popover"
          open
          modal={false}
          container={frame}
          pinned
        />
      )}
      <TextField label="番地・建物名" defaultValue="西日暮里 1-2-3" />
    </div>
  );
}

interface FieldCaseState {
  fieldCase: FieldCase;
  setFieldCase: (fieldCase: FieldCase) => void;
}

const FieldCaseContext = createContext<FieldCaseState | null>(null);

const useFieldCase = () => {
  const state = useContext(FieldCaseContext);
  if (!state) throw new Error('FieldCaseContext がありません');
  return state;
};

function OptionFieldCell({ place }: { place: OptionPlace }) {
  const { fieldCase, setFieldCase } = useFieldCase();
  const spec = fieldCases[fieldCase];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {fieldCaseOrder.map((key) => (
          <Button
            key={key}
            // 選んでいる状態はグレーの塗り（下の内容の動きと同じ）
            appearance={fieldCase === key ? 'filled' : 'outline'}
            color="neutral"
            aria-pressed={fieldCase === key}
            data-axis27-case={key}
            onClick={() => setFieldCase(key)}
          >
            {fieldCases[key].button}
          </Button>
        ))}
      </div>
      <OptionPhone key={fieldCase} place={place} initial={spec.value} field={spec.message} />
    </div>
  );
}

// 触って確かめる: 選ばずに「次へ」を押すと、欄の文（選んでください）が出る。選ぶと消える
function OptionTryForm({ place }: { place: OptionPlace }) {
  const [value, setValue] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const field = submitted && value === null ? fieldCases.required.message : null;
  const shown = shownFor(place, value, field);
  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <AreaSelect
        place={place}
        shown={shown}
        value={value}
        onValueChange={setValue}
        presentation="auto"
      />
      <Button type="submit" color="primary" className="self-start" data-axis27-submit>
        次へ
      </Button>
    </form>
  );
}

function OptionTry({ place }: { place: OptionPlace }) {
  const [round, setRound] = useState(0);
  return (
    <div className="flex flex-col gap-4">
      <OptionTryForm key={round} place={place} />
      <Button
        appearance="outline"
        className="self-start"
        onClick={() => setRound((current) => current + 1)}
      >
        はじめに戻す
      </Button>
    </div>
  );
}

const optionCss = `
/* 列の幅: シートの列は、スマートフォンの画面（375px）が入る幅にする */
[data-axis27-option] .overflow-x-auto > .grid {
  grid-template-columns: minmax(200px, 240px) minmax(375px, 1fr) minmax(300px, 1fr) minmax(375px, 1fr) minmax(300px, 1fr) !important;
}
/* 開いたまま固定した列: 開いた直後の hover の見た目を外す（軸 19 と同じ） */
[data-axis27-fixed] [role="option"][data-highlighted] { background-color: transparent; }
[data-axis27-fixed] [role="option"][data-highlighted][data-selected] { background-color: var(--color-select-item-selected); }
/* 開いたまま固定した浮かぶ選択肢: 画面の下の方の行でも切れないよう、画面の下までの空き（--available-height）で高さを抑えない */
[data-axis27-fixed] [data-presentation="popover"] [role="listbox"] { --available-height: 9999px; }
/* 部品の Select は、シートの見出しに欄の文を出す（design/adr/0044）。比べたときの現行版は出さなかったので隠す */
[data-axis27-row="現行版"] [data-slot="select-sheet-message"] { display: none; }
`;

function OptionStory({ pick }: { pick: string }) {
  const [fieldCase, setFieldCase] = useState<FieldCase>('required');
  return (
    <FieldCaseContext.Provider value={{ fieldCase, setFieldCase }}>
      <style>{optionCss}</style>
      <ResetFocus />
      <div data-axis27-option>
        <Comparison
          index={27}
          axis="エラー・警告の知らせ方: 選択肢に付く文"
          pick={pick}
          candidates={optionCandidates}
          columns={optionColumns}
          renderCell={(column, candidate) => {
            const found = optionCandidates.find((c) => c.id === candidate.id);
            if (!found) return null;
            const index = optionColumns.indexOf(column);
            return (
              <div data-axis27-row={found.id} data-axis27-column={index}>
                {index === 0 && <OptionPhone place={found.place} initial="arakawa" field={null} />}
                {index === 1 && <OptionPopover place={found.place} />}
                {index === 2 && <OptionFieldCell place={found.place} />}
                {index === 3 && <OptionTry place={found.place} />}
              </div>
            );
          }}
        >
          <p>
            Select
            の選択肢に関わるエラー・警告を、どこに出すかを選びます。「シートの文」では、文をシートのヘルプテキストの下に出す
            A が好まれました。ここでは、文を2つに分けて考えます。
          </p>
          <p>
            1つは、選択肢に付く文です（八王子市・町田市はお届けできない、荒川区はお届けが翌日になる）。もう1つは、選択肢に関係ない欄の文です（選ばずに送信した、郵便番号と合わない、住所を確かめられなかった）。A〜D
            は、欄の文をヘルプテキストの下に出します。違いは、選択肢に付く文の出し方と、部品にどちらの文かを伝える方法です。
          </p>
          <p>
            シートの列は幅 375px
            のスマートフォンの画面で、指で操作する寸法です。浮かぶ選択肢の列はマウス用の寸法です。どちらも開いたまま固定しています。選択肢の2行目と選べない選択肢は、比べたときは部品になかったので、この中で組んでいます（現行版の行は部品のまま）。
          </p>
          <p>
            画面が狭いときは、表を横にスクロールすると右の列が見えます。浮かぶ選択肢では、本体の下の文が開いた選択肢に隠れます（どの案も同じ）。
          </p>
          <p>選択肢に付く文をどう出すか、1案を選んで一言添えてください。</p>
          <p>
            決めたこと（ADR-0044）: A にしました。部品の Select の選択肢に、disabled（選べない）と
            note（ラベルの下の2行目。種類は選べない理由と警告）を足し、欄の文をシートの見出しのヘルプテキストの下に出すようにしました。文は呼び出し側が渡します。A〜D
            の行は、比べたときの組み立てのままです。部品で A
            を描くと、荒川区を選んだシートの見出しに欄の警告も出ます（比べたときの A
            は出しませんでした）。部品は「実装した
            Form」の市区町村で確かめられます。現行版の行は、部品の見出しの行を隠して、比べたときの形に戻しています。
          </p>
        </Comparison>
      </div>
    </FieldCaseContext.Provider>
  );
}

// ═══ 実装した Form ═══════════════════════════════════
// 決めた形（design/adr/0044）を、部品の Form・TextField・Select で描く
// 値を確かめるのはこのストーリー（アプリの役）。Form は、送信で出たエラーのあとでフォーカスを移すだけ

// 使われているユーザー名（あとから確かめる例。ADR-0042 の回る円を出して 0.8 秒待つ）
const takenNames = ['kazuemon', 'admin'];

const implChecks = {
  email: (value: string): Message | null => {
    if (emailPattern.test(value)) return null;
    return {
      kind: 'error',
      text: value ? 'メールアドレスの形が正しくありません' : 'メールアドレスを入力してください',
    };
  },
  // 大文字と小文字は区別しない（「Kazuemon」も使われている）
  username: (value: string): Message | null => {
    if (!value) return { kind: 'error', text: 'ユーザー名を入力してください' };
    if (takenNames.includes(value.toLowerCase()))
      return { kind: 'error', text: 'このユーザー名はすでに使われています' };
    return null;
  },
  // 大文字が入っているときの警告。すぐ確かめる。使われている名前のエラーと両方出ることがある（design/adr/0041 の追記）
  usernameCase: (value: string): Message | null =>
    /[A-Z]/.test(value) ? { kind: 'warning', text: '大文字は小文字にそろえて登録します' } : null,
  displayName: (value: string): Message | null =>
    value.length > 20
      ? { kind: 'warning', text: '20文字を超えると、一覧では途中で切れます' }
      : null,
  // お届けできない八王子市・町田市は、選べない選択肢にした（implAreas）ので、ここでは確かめない
  area: (value: string | null): Message | null => {
    if (!value) return { kind: 'error', text: '市区町村を選んでください' };
    if (value === 'area-1') return { kind: 'warning', text: '荒川区は、お届けが翌日になります' };
    return null;
  },
};

// 決めた選択肢の形（design/adr/0044 — 選択肢に付く文の A）
//   お届けできない地域は選べなくし、理由を2行目に出す。お届けが遅れる荒川区は選べるままで、警告の2行目を付ける
const implAreas: SelectItem[] = areas.map((item) => {
  if (item.value === 'area-4' || item.value === 'area-5')
    return { ...item, disabled: true, note: { kind: 'reason', text: 'お届けできません' } };
  if (item.value === 'area-1')
    return { ...item, note: { kind: 'warning', text: 'お届けが翌日になります' } };
  return item;
});

type ImplName = keyof typeof implChecks;

const errorOf = (message: Message | null | undefined) =>
  message?.kind === 'error' ? message.text : undefined;
const warningOf = (message: Message | null | undefined) =>
  message?.kind === 'warning' ? message.text : undefined;

function ImplementedFields({ errorSummary }: { errorSummary: boolean }) {
  const [messages, setMessages] = useState<Partial<Record<ImplName, Message | null>>>({});
  const [area, setArea] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const set = (name: ImplName, message: Message | null) =>
    setMessages((current) => ({ ...current, [name]: message }));

  // 送信: すべての欄を確かめる。確かめている途中のユーザー名は、ここで確かめ直す
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const value = (name: string) => {
      const input = form.elements.namedItem(name);
      return input instanceof HTMLInputElement ? input.value : '';
    };
    clearTimeout(timer.current);
    setChecking(false);
    setMessages({
      email: implChecks.email(value('email')),
      username: implChecks.username(value('username')),
      usernameCase: implChecks.usernameCase(value('username')),
      displayName: implChecks.displayName(value('displayName')),
      area: implChecks.area(area),
    });
  };

  return (
    <Form errorSummary={errorSummary} onSubmit={onSubmit} className="flex flex-col gap-5">
      <TextField
        name="email"
        label="メールアドレス"
        caption="ログインに使います"
        defaultValue="kazu@"
        autoComplete="off"
        error={errorOf(messages.email)}
        onBlur={(event) => set('email', implChecks.email(event.currentTarget.value))}
      />
      <TextField
        name="username"
        label="ユーザー名"
        caption="プロフィールの URL に使います"
        defaultValue="Kazuemon"
        autoComplete="off"
        loading={checking}
        error={errorOf(messages.username)}
        warning={warningOf(messages.usernameCase)}
        onBlur={(event) => {
          const { value } = event.currentTarget;
          clearTimeout(timer.current);
          set('usernameCase', implChecks.usernameCase(value));
          if (!value) {
            setChecking(false);
            set('username', implChecks.username(value));
            return;
          }
          set('username', null);
          setChecking(true);
          timer.current = setTimeout(() => {
            setChecking(false);
            set('username', implChecks.username(value));
          }, 800);
        }}
      />
      <TextField
        name="displayName"
        label="表示名"
        caption="一覧とプロフィールに出ます"
        defaultValue="かずえもん（Kazuya Miyamoto）"
        autoComplete="off"
        warning={warningOf(messages.displayName)}
        onBlur={(event) => set('displayName', implChecks.displayName(event.currentTarget.value))}
      />
      <Select
        label="市区町村"
        prefix="東京都"
        caption="お届けは23区内だけです"
        placeholder="選んでください"
        items={implAreas}
        value={area}
        onValueChange={(value) => {
          setArea(value);
          set('area', implChecks.area(value));
        }}
        error={errorOf(messages.area)}
        warning={warningOf(messages.area)}
      />
      <Button type="submit" color="primary" className="self-start" data-axis27-submit>
        登録する
      </Button>
    </Form>
  );
}

function ImplementedForm({ errorSummary }: { errorSummary: boolean }) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [round, setRound] = useState(0);
  const { log, clear } = useReader(root);
  return (
    <div className="flex flex-col gap-4" data-axis27-impl={errorSummary ? 'summary' : 'first'}>
      <div ref={setRoot}>
        <ImplementedFields key={round} errorSummary={errorSummary} />
      </div>
      <Button
        appearance="outline"
        className="self-start"
        onClick={() => {
          setRound((current) => current + 1);
          clear();
        }}
      >
        はじめに戻す
      </Button>
      <ReaderLog log={log} />
    </div>
  );
}

const implementedColumns: [boolean, string, string][] = [
  [
    false,
    '送信したら最初のエラーの欄へ（既定）',
    '<Form>。フォーカスが最初のエラーの欄に移り、入力した文字を選びます',
  ],
  [
    true,
    'エラーの一覧（errorSummary）',
    '<Form errorSummary>。フォームの上に一覧を出し、一覧へフォーカスを移します。リンクで各欄へ移ります',
  ],
];

function ImplementedStory() {
  return (
    <div className="flex min-h-screen flex-col gap-8 bg-bg px-6 py-8 text-fg">
      <header className="flex max-w-[68ch] flex-col gap-3">
        <p className="text-sm font-bold text-fg-subtle">後半の軸 27</p>
        <h1 className="text-2xl font-heading">実装した Form</h1>
        <div className="flex flex-col gap-2 text-sm leading-6 text-fg-muted">
          <p>
            決めた形（ADR-0044）を、部品の Form・TextField・Select
            で描いたものです。値を確かめるのはこのストーリー（アプリの役）です。
          </p>
          <p>
            メールアドレスと表示名は、欄を離れたときに確かめます。ユーザー名は、離れると回る円を出して
            0.8
            秒確かめてから、文を出します（「kazuemon」「admin」は使われています。大文字と小文字は区別しません）。市区町村は、選んだときに確かめます。どれも、出た行は読み終えてから読みます（polite）。
          </p>
          <p>
            ユーザー名に大文字が入っていると、離れたときにすぐ警告を出します。使われている名前のエラーと両方あるときは、エラーの行の下に警告の行を出します（ADR-0041
            の追記）。読み上げと開閉の動きは、行ごとに働きます。
          </p>
          <p>
            市区町村の選択肢は、選択肢に付く文の
            A（ADR-0044）です。八王子市・町田市は選べず、理由（お届けできません）を2行目に出します。荒川区は選べるままで、警告の2行目が付きます。欄のエラー・警告は、シートの見出しのヘルプテキストの下にも出ます（指で操作する狭い画面）。
          </p>
          <p>
            「登録する」を押すと、すべての欄を確かめます。左は、最初のエラーの欄へフォーカスが移ります。右は、フォームの上にエラーの一覧を出し、一覧へフォーカスを移します。一覧のリンクは「欄の名前:
            エラーの文」です。送信で出た行は知らせません（移った先で読むため）。
          </p>
          <p>
            行は、高さと濃さを 0.2
            秒で開き、閉じます。キャプションと本体は動かず、下の内容が滑ります。動きを減らす設定では、すぐ切り替わります。読み上げの記録は、ページの中で真似たものです（「出たときの知らせ方」と同じ）。
          </p>
        </div>
      </header>
      <div className="grid gap-x-8 gap-y-10 md:grid-cols-2">
        {implementedColumns.map(([errorSummary, label, note]) => (
          <section key={label} className="flex min-w-0 flex-col gap-4 border-t border-line pt-6">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm font-bold">{label}</h2>
              <p className="text-xs text-fg-subtle">{note}</p>
            </div>
            <ImplementedForm errorSummary={errorSummary} />
          </section>
        ))}
      </div>
    </div>
  );
}

// ── ストーリー ────────────────────────────────────────

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/27 エラー・警告の知らせ方',
  id: 'design-review-27-message-announce',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

const pickArg = (options: string[]) => ({
  pick: {
    description: '採用した案（ADR の比較画像用）',
    control: 'inline-radio' as const,
    options: ['', 'current', ...options],
  },
});

export const Announce: Story = {
  name: '出たときの知らせ方',
  // メモ「27 については、お勧めいただいたものを実装してみてもらってもいいですか？ C のケースも選べるようにはしたいかもですね。」
  // 送信したときは E（既定）と C（選べる）、欄を離れたときは A
  args: { pick: 'A,C,E' },
  argTypes: pickArg(['A', 'B', 'C', 'D', 'E']),
  render: ({ pick }) => (
    <>
      <style>{fieldCss}</style>
      <Comparison
        index={27}
        axis="エラー・警告の知らせ方: 出たときの読み上げ"
        pick={pick}
        candidates={announceCandidates}
        columns={announceColumns}
        renderCell={(column, candidate) => {
          const found = announceCandidates.find((c) => c.id === candidate.id);
          return (
            found && (
              <div data-axis27-row={found.id}>
                <AnnounceCell
                  candidate={found}
                  timing={column.label.startsWith('欄を') ? 'blur' : 'submit'}
                />
              </div>
            )
          );
        }}
      >
        <p>
          エラー・警告の行（ADR-0041）が出たときに、読み上げでどう知らせるかを選びます。いまは知らせません（aria-live
          はない）。本体に入ったときに、説明として読まれるだけです。
        </p>
        <p>
          確かめる時機は2つあります。欄を離れたとき（左の列）と、送信したとき（右の列）です。案によって、時機ごとの読み方が変わります。
        </p>
        <p>
          見た目はほとんど変わりません。各セルの「読み上げの流れ」は、ARIA
          の決まりどおりに読んだときの流れです。「流れを再生」を押すと、ページの中で真似た読み上げを「読み上げの記録」に出します。本物の読み上げソフトではないので、読む順や言い回しはソフトによって違います。各案の表の「測った値」は、Chrome
          の CDP で測った値です。
        </p>
        <p>
          C と D の一覧（淡い赤の面に赤い枠）は、この比較のために仮に組んだ見た目です。E は、Base UI
          の Form を使うと、もともとこう動きます（いまの部品は Form を包んでいません）。
        </p>
        <p>
          欄を離れたときと送信したときに、どう知らせるのがよいか、1案を選んで一言添えてください。
        </p>
        <p>
          決めたこと（ADR-0044）:
          送信したときは、エラーのある最初の欄へフォーカスを移します（E。既定）。長いフォームでは、エラーの一覧を出して一覧へフォーカスを移す形（C。Form
          の errorSummary）も選べます。欄を離れたときや、あとから確かめたときは、行を polite
          で知らせます（A）。送信で出た行は知らせません。部品は「実装した Form」で確かめられます。
        </p>
        <p>
          部品の行は polite
          になったので、現行版・C・E（欄を離れたとき）の行は、比べたときの形（aria-live
          なし）に戻しています。A の行は部品の TextField、E の送信の列は部品の Form で描いています。
        </p>
      </Comparison>
    </>
  ),
};

export const Shift: Story = {
  name: '下の内容の動き',
  // メモ「内容の動きは B が好みです。」
  args: { pick: 'B' },
  argTypes: pickArg(['A', 'B', 'C', 'D']),
  render: ({ pick }) => <ShiftStory pick={pick} />,
};

export const SheetMessage: Story = {
  name: 'シートの文',
  // メモ「シートの文は A が良いなと思いましたが、…」（選択肢に関係ない欄の文について。選択肢に付く文は OptionMessage で比べる）
  // 決めたこと（design/adr/0044）: A。部品の Select が、見出しのヘルプテキストの下に欄の文を出す
  args: { pick: 'A' },
  argTypes: pickArg(['A', 'B', 'C']),
  render: ({ pick }) => (
    <>
      <style>{fieldCss}</style>
      <style>{sheetCss}</style>
      <ResetFocus />
      <Comparison
        index={27}
        axis="エラー・警告の知らせ方: シートの文"
        pick={pick}
        candidates={sheetCandidates}
        columns={sheetColumns}
        renderCell={(column, candidate) => {
          const found = sheetCandidates.find((c) => c.id === candidate.id);
          return (
            found && (
              <div data-axis27-row={found.id}>
                <SheetPhone
                  candidate={found}
                  initial={column.label.startsWith('エラー') ? 'area-4' : 'area-1'}
                />
              </div>
            )
          );
        }}
      >
        <p>
          Select のボトムシート（ADR-0037）に、欄のエラー・警告を出すかを選びます。ADR-0041
          では、シートの見出しはラベルとヘルプテキストだけにし、エラー・警告は出さないことにしました（現行版）。ただし、どうするかは後半の軸に残しています。A〜C
          は、その決めを変える案です。
        </p>
        <p>
          いまは、シートが低いとき（ここでは選択肢が6つ）は、本体の下の文が、暗くなった後ろに見えています。選択肢が長く、シートを高く広げると隠れます。
        </p>
        <p>
          各セルは幅 375px
          のスマートフォンの画面で、指で操作する寸法です。シートは開いたまま固定しています。選び直すと、欄とシートの文も変わります（足立区・板橋区・江戸川区は文なし、荒川区は警告、八王子市・町田市はエラー）。
        </p>
        <p>シートにエラー・警告を出すか、出すならどこに出すか、1案を選んで一言添えてください。</p>
        <p>
          決めたこと（ADR-0044）: A にしました。部品の Select
          が、シートの見出しのヘルプテキストの下に、本体の下と同じ行でエラー・警告を出し、選択肢の一覧の説明にもつなぎます。浮かぶ選択肢には出しません。A
          の行は部品のまま描いています。現行版と B の行は部品の見出しの行を隠し（B
          の帯はこの中で足す）、C の行は警告の行だけを隠して、比べたときの形に戻しています。
        </p>
      </Comparison>
    </>
  ),
};

export const OptionMessage: Story = {
  name: '選択肢に付く文',
  // メモ「27 は A が良さそうです。選択肢が選べない理由は複数あり、グルーピングは難しいと思いました。…」
  args: { pick: 'A' },
  argTypes: pickArg(['A', 'B', 'C', 'D']),
  render: ({ pick }) => <OptionStory pick={pick} />,
};

export const Implemented: Story = {
  name: '実装した Form',
  render: () => <ImplementedStory />,
};
