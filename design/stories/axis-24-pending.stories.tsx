import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button, type ButtonProps, type LoadingIndicator } from '../../src/components/Button';
import { Select, type SelectItem } from '../../src/components/Select';
import { TextField } from '../../src/components/TextField';
import { fieldStyles } from '../../src/components/field-styles';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 24: 送信中の残り（原則1）。ボタンの送信中は ADR-0034 で決まっている
// 2つの問いを、別のストーリーで比べる
//   入力欄と Select の送信中: 値を確かめている・選択肢を読み込んでいる・フォームを送っている、の3つの場面
//   動きを減らす設定: 回る円（overlay・inline）と流れる線（bar）を、prefers-reduced-motion: reduce のときどうするか
// 比べたときは部品に入力欄の送信中がなかったので、印（右端の回る円・下端の線・欄の下の知らせ・押せない見た目）はこの中で組み立てた
// 回る円と線は、Button と同じ形・同じ速さ（回る円は1秒で1周、線は --animate-loading-bar）
// 決定（design/adr/0042）: 止めるときは E、止めないときは G。動きを減らす設定では、回る円は A、線は B（ReducedMotion の E）
//   E・G の行は、部品の loading（TextField・Select）で描く。フォームを送っている列（欄を止めて、印はボタンだけ）は
//   部品にまだない形なので、比べたときの組み立てのまま。ほかの行も、比べたときの形をこの中で再現している
//   決めたあとのメモで、止めるときの「読み込んでいます」と押せない ▼ は #6E787D（プレースホルダの場所の文と同じ）になった
//   E・G の行は部品で描くので、この色になる。F の薄い ▼（#A3A5A6）と「読み込んでいます」は、比べたときの色のまま

// ── 共通: 回る円と線 ──────────────────────────────────

// 回る円。Button の Spinner と同じ形（薄い輪の上を濃い弧が回る）と速さ。色は置いた場所の文字の色
const Spinner = ({ small }: { small?: boolean }) => (
  <svg
    viewBox="0 0 16 16"
    className={['shrink-0 animate-spin', small ? 'size-3' : 'size-(--size-icon)'].join(' ')}
    aria-hidden
  >
    <circle
      cx="8"
      cy="8"
      r="6"
      fill="none"
      stroke="currentColor"
      strokeOpacity="0.3"
      strokeWidth="2"
    />
    <path
      d="M8 2a6 6 0 0 1 6 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// 開いた選択肢の「読み込んでいます」の行に描く回る円。Base UI の選択肢の中には部品を置けないので、同じ形を CSS の mask で描く
const spinnerMask = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><circle cx='8' cy='8' r='6' fill='none' stroke='black' stroke-opacity='0.3' stroke-width='2'/><path d='M8 2a6 6 0 0 1 6 6' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'/></svg>"
)}")`;

// ── 1. 入力欄と Select の送信中 ───────────────────────────

/** 印。status は欄の下の行（エラーの行）に出す知らせ */
type Sign = 'none' | 'spinner' | 'bar' | 'status';
/** E・F・G で選べる印（ADR-0034 のボタンと同じく、回る円と流れる線） */
type Indicator = 'spinner' | 'bar';
/**
 * Select の ▼。keep: そのまま（回る円は ▼ の左）、swap: 回る円に替える（A・B）
 * hide: 止めているあいだ隠す（E。回る円は ▼ のあった場所）、fade: 止めているあいだ薄くする（F。回る円は ▼ の左）
 */
type Caret = 'keep' | 'swap' | 'hide' | 'fade';

interface Look {
  sign: Sign;
  /** 待っているあいだ、欄を押せない見た目にして止める（ブロッキング: B・E・F） */
  blocking: boolean;
  caret: Caret;
  /** 止めて読み込んでいるあいだ、Select のプレースホルダの場所に「読み込んでいます」を出す（E・F） */
  loadingPlaceholder?: boolean;
  /** 部品の loading で描く（E・G。決定した形 — design/adr/0042）。フォームを送っているあいだは、この中の組み立てで描く */
  component?: boolean;
}

interface PendingCandidate extends Candidate {
  look: Look;
  /** 印を回る円と流れる線から選べる（E・F・G）。読み込んでいる列に両方を並べ、触って確かめる列で切り替える */
  indicators?: boolean;
}

const pendingCandidates: PendingCandidate[] = [
  {
    id: '現行版',
    look: { sign: 'none', blocking: false, caret: 'keep' },
    name: '何も変わらない',
    intent:
      'いまの TextField と Select。確かめているあいだも、読み込んでいるあいだも、見た目は変わらない。Select は、開くと空の選択肢が出る。送っているあいだも欄は書き換えられ、印はボタンだけ。',
    spec: [
      ['確かめている', '印なし'],
      ['読み込んでいる', '印なし。開くと空'],
      ['送っている', '欄はそのまま（書き換えられる）'],
    ],
  },
  {
    id: 'A',
    look: { sign: 'spinner', blocking: false, caret: 'swap' },
    name: '右端に回る円',
    intent:
      '欄の右端に、ボタンと同じ回る円を出す。Select では ▼ が回る円に替わる。欄は書き換えられ、フォーカスとエラーの枠線はそのまま。送っているあいだの印はボタンだけ。',
    spec: [
      ['確かめている', '右端に回る円（書き換えられる）'],
      ['読み込んでいる', '▼ の代わりに回る円。開くと「読み込んでいます」の行'],
      ['送っている', '欄はそのまま（書き換えられる）'],
      ['回る円', '▼ と同じ #525C60。欄の塗り 6.22:1、エラーの塗り 6.27:1'],
    ],
  },
  {
    id: 'B',
    look: { sign: 'spinner', blocking: true, caret: 'swap' },
    name: 'ボタンと同じ（押せない見た目）',
    intent:
      'ボタンの送信中（ADR-0034）と同じく、待っている欄を押せない欄の見た目にし、回る円は薄くしない。待っているあいだは書き換えられない。フォーカスは外さない。送っているあいだは、フォームの欄をすべてこの見た目にする。',
    spec: [
      ['確かめている', '押せない見た目＋右端に回る円（書き換えられない）'],
      ['読み込んでいる', '押せない見た目＋▼ の代わりに回る円（開けない）'],
      ['送っている', '欄を押せない見た目にする（書き換えられない）'],
      ['回る円', '#525C60。押せない塗り（#E1E3E4）で 5.33:1'],
    ],
  },
  {
    id: 'C',
    look: { sign: 'bar', blocking: false, caret: 'keep' },
    name: '下端に流れる線',
    intent:
      'ボタンの C と同じ線を、欄の下端（枠線の内側）に流す。欄は書き換えられる。フォーカス中とエラーのときは、枠線のすぐ内側を流れる。送っているあいだの印はボタンだけ。',
    spec: [
      ['確かめている', '下端に流れる線（書き換えられる）'],
      ['読み込んでいる', '下端に流れる線。開くと「読み込んでいます」の行'],
      ['送っている', '欄はそのまま（書き換えられる）'],
      ['線', '2px・本文の色の 60%（欄の塗り 3.78:1）・1.2 秒で流れる'],
    ],
  },
  {
    id: 'D',
    look: { sign: 'status', blocking: false, caret: 'keep' },
    name: '欄の下に知らせる',
    intent:
      '欄の下の行（エラーの文が出る行）に、回る円と「確認しています」を出す。回る円は、エラーの「!」と同じ場所に置く。ヘルプテキストは上に残す（軸 23）。欄の見た目は変えない。エラーのあとで確かめ直すときは、結果が出るまでエラーの文と置き換え、赤い枠線は残す。送っているあいだの印はボタンだけ。',
    spec: [
      ['確かめている', '欄の下に「確認しています」'],
      ['読み込んでいる', '欄の下に「選択肢を読み込んでいます」。開くと「読み込んでいます」の行'],
      ['送っている', '欄はそのまま（書き換えられる）'],
      ['エラーのとき', 'エラーの文と置き換える。赤い枠線は残す'],
      ['文字と円', 'キャプションと同じ #6E787D（白地 4.52:1）'],
    ],
  },
  {
    id: 'E',
    look: {
      sign: 'spinner',
      blocking: true,
      caret: 'hide',
      loadingPlaceholder: true,
      component: true,
    },
    indicators: true,
    name: '止める・▼ を隠す',
    intent:
      'B と同じく、待っているあいだは欄を押せない見た目にして止める。Select は、読み込むあいだプレースホルダの場所に「読み込んでいます」と出し、▼ を隠して開けなくする。読み込むと「選んでください」と ▼ に戻る。印は、ボタンと同じく回る円と流れる線から選べる。',
    spec: [
      ['読み込む前', 'プレースホルダの場所に理由（いまと同じ）'],
      ['読み込んでいる', '押せない見た目。「読み込んでいます」。▼ を隠し、開けない'],
      ['回る円の場所', '▼ のあった場所（▼ を隠すので）'],
      ['確かめる・送る', '押せない見た目（書き換えられない）。送るあいだの Select も ▼ を隠す'],
      [
        '文字',
        '「読み込んでいます」は理由の文と同じ #6E787D（3.51:1）。押せない文字の色 #A3A5A6 は選んだ値だけ',
      ],
      ['印', '回る円 #525C60（5.33:1）か、下端の線（3.56:1）'],
    ],
  },
  {
    id: 'F',
    look: { sign: 'spinner', blocking: true, caret: 'fade', loadingPlaceholder: true },
    indicators: true,
    name: '止める・▼ を薄く',
    intent:
      'E と同じく止める。▼ は隠さず、押せない文字の色に薄くする。回る円は、薄い ▼ の左に置く。読み込むと「選んでください」と、ふだんの ▼ に戻る。',
    spec: [
      ['読み込む前', 'プレースホルダの場所に理由（いまと同じ）'],
      ['読み込んでいる', '押せない見た目。「読み込んでいます」。▼ を薄くし、開けない'],
      ['回る円の場所', '薄い ▼ の左（間は 8px）'],
      ['確かめる・送る', 'E と同じ。送るあいだの Select も ▼ を薄くする'],
      ['薄い ▼', '#A3A5A6（1.92:1）。押せない欄の飾りなので、3:1 に届かなくてよい'],
      ['印', '回る円 #525C60（5.33:1）か、下端の線（3.56:1）'],
    ],
  },
  {
    id: 'G',
    look: { sign: 'spinner', blocking: false, caret: 'keep', component: true },
    indicators: true,
    name: '止めない・▼ の左に回る円',
    intent:
      'A と同じく止めない。都道府県を選ぶと、すぐに「選んでください」が出て開ける。開くと、選択肢の場所に「読み込んでいます」の行が出る。回る円は ▼ と置き換えず、▼ の左に置く。',
    spec: [
      ['読み込む前', 'プレースホルダの場所に理由（いまと同じ）'],
      ['読み込んでいる', '「選んでください」。開ける。開くと「読み込んでいます」の行'],
      ['回る円の場所', '▼ の左（間は 8px）。▼ はそのまま'],
      ['確かめる・送る', 'A と同じ（書き換えられる。送るあいだの印はボタンだけ）'],
      ['印', '回る円 #525C60（6.22:1）か、下端の線（3.78:1）'],
    ],
  },
];

const pendingColumns: Column[] = [
  {
    label: '値を確かめている',
    note: 'ユーザー名が使えるか、問い合わせているところ。上から、通常・フォーカス中・エラーのあとで確かめ直し。E・F・G は回る円で出しています',
  },
  {
    label: '選択肢を読み込んでいる',
    note: '市区町村の選択肢を読み込んでいるところ。上は閉じた Select（押すと開きます）、下は開いたもの（B は開けないので、フォーカス中）。E・F・G は、回る円と流れる線を並べました（開けるのは G だけ）',
  },
  {
    label: 'フォームを送っている',
    note: '保存するを押して、返事を待っているところ。ボタンは ADR-0034 の送信中',
  },
  {
    label: '触って確かめる',
    note: 'ユーザー名を入れて手を止めると、1.2 秒確かめます（admin と kazuemon は使えません）。都道府県を選ぶと、市区町村を 1.5 秒読み込みます。保存するは 2.4 秒待ちます。E・F・G は、上で印を切り替えられます。E・G は、都道府県を選ぶ前の市区町村（押せない欄）の ▼ を隠す形にも切り替えられます',
  },
];

// Select の ▼（BaseSelect.Icon）。回る円（data-axis24-end）とは別
const caretSelector =
  '[data-slot="control"] > span[aria-hidden].text-fg-muted:not([data-axis24-end])';

const pendingCss = `
/* 下端の線を置くため、欄の本体を位置の基準にする */
[data-axis24-field] [data-slot="control"] { position: relative; }
/* A・B・E: Select の ▼ を隠す（A・B は同じ場所に回る円を置く） */
[data-axis24-caret="hidden"] ${caretSelector} { display: none; }
/* F: 止めているあいだ、▼ を押せない文字の色に薄くする */
[data-axis24-caret="faded"] ${caretSelector} { color: var(--color-on-field-disabled); }
/* F・G: 回る円を ▼ の左に置く。▼ との間は 8px（ボタンの回る円とラベルの間と同じ） */
[data-axis24-spinner="left"] ${caretSelector} { order: 1; }
[data-axis24-spinner="left"] [data-axis24-end] { margin-inline-end: calc(8px - var(--space-control-x)); }
/* B・E・F: 押せない欄と同じ塗りと文字（ADR-0026）。枠線（フォーカスの青・エラーの赤）は変えない。回る円は薄くしない */
[data-axis24-look="disabled"] [data-slot="control"] {
  background-color: var(--color-field-disabled);
  color: var(--color-on-field-disabled);
  cursor: progress;
}
[data-axis24-look="disabled"] [data-slot="control"] :is(input, [data-placeholder], [data-slot="field-addon"]) {
  color: var(--color-on-field-disabled);
  cursor: progress;
}
/* D: 知らせを出しているあいだは、エラーの行を隠して知らせと置き換える（欄はエラーの状態のまま） */
[data-axis24-status] [data-slot="field-message"] { display: none; }
/* A・C・D・G: 選択肢を読み込んでいるあいだ、開いた選択肢に「読み込んでいます」の行を出す。高さと左の余白は項目と同じ */
[data-axis24-list="loading"] [data-slot="select-popup"] [role="listbox"]:empty {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: calc(var(--size-control) + 2 * var(--select-popup-padding));
  padding-inline: calc(var(--space-control-x) - var(--select-popup-padding));
  color: var(--color-fg-muted);
}
[data-axis24-list="loading"] [data-slot="select-popup"] [role="listbox"]:empty::before {
  content: '';
  flex-shrink: 0;
  width: var(--size-icon);
  height: var(--size-icon);
  background-color: currentColor;
  mask: ${spinnerMask} center / contain no-repeat;
  animation: var(--animate-spin);
}
[data-axis24-list="loading"] [data-slot="select-popup"] [role="listbox"]:empty::after { content: '読み込んでいます'; }`;

// 欄の右端の回る円。Select の ▼ と同じ色（--color-fg-muted）
// TextField では suffix に置くので、本体の右の余白の分だけ内側に寄せる
const EndSpinner = ({ inset }: { inset?: boolean }) => (
  <span
    aria-hidden
    data-axis24-end
    className={[
      'flex shrink-0 items-center text-fg-muted',
      inset && 'pr-[calc(var(--space-control-x)-var(--field-border-width))]',
    ]
      .filter(Boolean)
      .join(' ')}
  >
    <Spinner />
  </span>
);

// 欄の下端（枠線の内側）に流す線。Button の bar と同じ動き。色は本文の色の 60%（グレーのボタンの線と同じ）
const FieldBar = () => (
  <span
    aria-hidden
    className="pointer-events-none absolute inset-0 overflow-hidden rounded-[calc(var(--radius-control)-var(--field-border-width))]"
  >
    <span className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden">
      <span className="absolute inset-y-0 left-0 w-2/5 animate-loading-bar bg-fg opacity-60" />
    </span>
  </span>
);

// 欄の下の行に出す知らせ（D）。エラー・警告の行と同じ並び（アイコン＋文）で、アイコンの場所に小さな回る円を置く
// 色はキャプションと同じ。欄の外に置くので、欄とのあいだを --space-field-gap だけ空ける
const StatusLine = ({ children }: { children: ReactNode }) => (
  <div
    role="status"
    className={fieldStyles().message({ className: 'mt-(--space-field-gap) text-fg-subtle' })}
  >
    <span className="flex size-(--field-message-icon-size) shrink-0 items-center justify-center">
      <Spinner small />
    </span>
    <span className="min-w-0">{children}</span>
  </div>
);

interface PendingProps {
  look: Look;
  /** この欄そのものを待っている（確かめている・読み込んでいる）。案の印を出す */
  pending?: boolean;
  /** フォーム全体を送っている。止める案（B・E・F）だけが欄を押せない見た目にする（印はボタンだけ） */
  formBusy?: boolean;
  /** フォーカスした見た目を固定する */
  focusPreview?: boolean;
}

interface PendingTextFieldProps extends PendingProps {
  label: string;
  caption?: string;
  error?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}

function PendingTextField({
  look,
  pending = false,
  formBusy = false,
  focusPreview,
  onChange,
  ...props
}: PendingTextFieldProps) {
  // E・G は、この欄を待っているあいだを部品の loading で描く
  const real = !!look.component && !formBusy;
  const locked = !real && look.blocking && (pending || formBusy);
  let suffix: ReactNode;
  if (!real && pending && look.sign === 'spinner') suffix = <EndSpinner inset />;
  if (!real && pending && look.sign === 'bar') suffix = <FieldBar />;
  const status = !real && pending && look.sign === 'status';
  return (
    <div
      data-axis24-field
      data-axis24-look={locked ? 'disabled' : undefined}
      data-axis24-status={status || undefined}
      data-focus-preview={focusPreview || undefined}
    >
      <TextField
        {...props}
        autoComplete="off"
        suffix={suffix}
        readOnly={locked || undefined}
        aria-busy={(!real && pending) || undefined}
        aria-disabled={locked || undefined}
        loading={real && pending}
        loadingBehavior={look.blocking ? 'blocking' : 'non-blocking'}
        loadingIndicator={look.sign === 'bar' ? 'bar' : 'spinner'}
        onChange={onChange && ((event) => onChange(event.target.value))}
      />
      {status && <StatusLine>確認しています</StatusLine>}
    </div>
  );
}

interface PendingSelectProps extends PendingProps {
  label: string;
  items: SelectItem[];
  prefix?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  disabled?: boolean;
  /** Disabled のときの ▼（E・G の触って確かめる列で切り替える） */
  disabledIcon?: 'show' | 'hide';
  /** 開いたまま固定する */
  fixedOpen?: boolean;
}

// Select には印を置く場所がないので、本体（data-slot="control"）の中に portal で置く
// 浮かぶ選択肢はこの枠の中に描き、行ごとの CSS（読み込み中の行）が効くようにする
function PendingSelect({
  look,
  pending = false,
  formBusy = false,
  focusPreview,
  fixedOpen,
  placeholder,
  ...props
}: PendingSelectProps) {
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  // 本体は Select が描いたあとにできるので、次のフレームで探す
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      setTrigger(wrapper?.querySelector<HTMLElement>('[data-slot="control"]') ?? null)
    );
    return () => cancelAnimationFrame(id);
  }, [wrapper]);
  // E・G は、この欄を待っているあいだを部品の loading で描く（印・▼・読み込み中の行・開けないこと）
  const real = !!look.component && !formBusy;
  const locked = !real && look.blocking && (pending || formBusy);
  const spinner = !real && pending && look.sign === 'spinner';
  let caret: 'hidden' | 'faded' | undefined;
  if (look.caret === 'swap' && spinner) caret = 'hidden';
  if (look.caret === 'hide' && locked) caret = 'hidden';
  if (look.caret === 'fade' && locked) caret = 'faded';
  const loadingRow = !real && pending && !look.blocking && look.sign !== 'none';
  const status = !real && pending && look.sign === 'status';
  return (
    <div
      ref={setWrapper}
      data-axis24-field
      data-axis24-look={locked ? 'disabled' : undefined}
      data-axis24-caret={caret}
      // ▼ が見えているときは、回る円を ▼ の左に置く（隠したときは ▼ のあった場所）
      data-axis24-spinner={spinner && caret !== 'hidden' ? 'left' : undefined}
      data-axis24-list={loadingRow ? 'loading' : undefined}
      data-axis24-status={status || undefined}
      data-focus-preview={focusPreview || undefined}
      className="relative"
    >
      {wrapper && (
        <Select
          {...props}
          placeholder={
            !real && pending && look.loadingPlaceholder ? '読み込んでいます' : placeholder
          }
          loading={real && pending}
          loadingBehavior={look.blocking ? 'blocking' : 'non-blocking'}
          loadingIndicator={look.sign === 'bar' ? 'bar' : 'spinner'}
          container={wrapper}
          // 止めているあいだは開けない。開いたまま固定するものは、画面の外の行でも下に開く
          open={locked ? false : fixedOpen || undefined}
          modal={fixedOpen ? false : undefined}
          presentation={fixedOpen ? 'popover' : undefined}
          collisionAvoidance={fixedOpen ? { side: 'none', align: 'none' } : undefined}
        />
      )}
      {status && <StatusLine>選択肢を読み込んでいます</StatusLine>}
      {trigger && spinner && createPortal(<EndSpinner />, trigger)}
      {trigger && !real && pending && look.sign === 'bar' && createPortal(<FieldBar />, trigger)}
    </div>
  );
}

const CAPTION = '半角英数字と _ で入れてください';

// 並べた印の見出し（E・F・G の読み込んでいる列）
const Variant = ({ title, children }: { title?: string; children: ReactNode }) =>
  title ? (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-fg-subtle">{title}</span>
      {children}
    </div>
  ) : (
    children
  );

const withSign = (look: Look, sign: Sign): Look => ({ ...look, sign });

const CheckCell = ({ look }: { look: Look }) => (
  <div className="flex flex-col gap-5">
    <PendingTextField
      look={look}
      pending
      label="ユーザー名"
      defaultValue="kazuemon_"
      caption={CAPTION}
    />
    <PendingTextField
      look={look}
      pending
      focusPreview
      label="ユーザー名"
      defaultValue="kazuemon_"
      caption={CAPTION}
    />
    <PendingTextField
      look={look}
      pending
      label="ユーザー名"
      defaultValue="admin2"
      caption={CAPTION}
      error="このユーザー名は使えません"
    />
  </div>
);

const LoadCell = ({ candidate }: { candidate: PendingCandidate }) => {
  const { look } = candidate;
  const city = { label: '市区町村', prefix: '東京都', items: [], placeholder: '選んでください' };
  if (candidate.indicators) {
    return (
      <div className="flex flex-col gap-5 pb-16">
        <Variant title="回る円">
          <PendingSelect look={withSign(look, 'spinner')} pending {...city} />
        </Variant>
        <Variant title="流れる線">
          <PendingSelect look={withSign(look, 'bar')} pending {...city} />
        </Variant>
        {!look.blocking && (
          <Variant title="開いたもの（回る円）">
            <PendingSelect look={withSign(look, 'spinner')} pending fixedOpen {...city} />
          </Variant>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-5 pb-16">
      <PendingSelect look={look} pending {...city} />
      <PendingSelect
        look={look}
        pending
        {...city}
        fixedOpen={!look.blocking}
        focusPreview={look.blocking}
      />
    </div>
  );
};

const wards: SelectItem[] = [
  { label: '足立区', value: 'adachi' },
  { label: '荒川区', value: 'arakawa' },
  { label: '板橋区', value: 'itabashi' },
];

const SubmitCell = ({ look }: { look: Look }) => (
  <div className="flex flex-col gap-5">
    <PendingTextField look={look} formBusy label="お名前" defaultValue="山田 花子" />
    <PendingSelect
      look={look}
      formBusy
      label="住所"
      prefix="東京都"
      items={wards}
      defaultValue="adachi"
    />
    <Button color="primary" loading className="self-start">
      保存する
    </Button>
  </div>
);

const prefectures: SelectItem[] = [
  { label: '東京都', value: 'tokyo' },
  { label: '大阪府', value: 'osaka' },
  { label: '北海道', value: 'hokkaido' },
];
const cities: Record<string, SelectItem[]> = {
  tokyo: wards,
  osaka: [
    { label: '大阪市', value: 'osaka' },
    { label: '堺市', value: 'sakai' },
    { label: '豊中市', value: 'toyonaka' },
  ],
  hokkaido: [
    { label: '札幌市', value: 'sapporo' },
    { label: '函館市', value: 'hakodate' },
    { label: '旭川市', value: 'asahikawa' },
  ],
};
const TAKEN = ['admin', 'kazuemon'];

// 触って確かめる列の切り替え。E・F・G の印と、E・G の押せないときの ▼
function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: [value: T, text: string][];
  value: T;
  onChange: (value: T) => void;
}) {
  const name = useId();
  return (
    <div className="flex items-center gap-4 text-xs" data-axis24-switch>
      <span className="text-fg-subtle">{label}</span>
      {options.map(([option, text]) => (
        <label key={option} className="flex cursor-pointer items-center gap-1.5">
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
            className="accent-(--color-primary)"
          />
          {text}
        </label>
      ))}
    </div>
  );
}

// 流れを触って確かめる。ユーザー名は入力が 0.4 秒止まると 1.2 秒確かめる。エラーは、確かめ直しの結果が出るまで残す
function TryForm({ candidate }: { candidate: PendingCandidate }) {
  const [indicator, setIndicator] = useState<Indicator>('spinner');
  const [disabledIcon, setDisabledIcon] = useState<'show' | 'hide'>('show');
  const look = candidate.indicators ? withSign(candidate.look, indicator) : candidate.look;
  const [name, setName] = useState('');
  const [checking, setChecking] = useState(false);
  const [taken, setTaken] = useState(false);
  const [prefecture, setPrefecture] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [loadingCities, setLoadingCities] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const checkTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const otherTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => [...checkTimers.current, ...otherTimers.current].forEach(clearTimeout), []);
  const later = (list: ReturnType<typeof setTimeout>[], ms: number, run: () => void) => {
    list.push(setTimeout(run, ms));
  };

  const changeName = (value: string) => {
    setName(value);
    checkTimers.current.forEach(clearTimeout);
    checkTimers.current = [];
    setChecking(false);
    if (!value) {
      setTaken(false);
      return;
    }
    later(checkTimers.current, 400, () => {
      setChecking(true);
      later(checkTimers.current, 1200, () => {
        setChecking(false);
        setTaken(TAKEN.includes(value));
      });
    });
  };
  const changePrefecture = (value: string | null) => {
    setPrefecture(value);
    setCity(null);
    setLoadingCities(true);
    later(otherTimers.current, 1500, () => setLoadingCities(false));
  };
  const submit = () => {
    setSubmitting(true);
    later(otherTimers.current, 2400, () => setSubmitting(false));
  };

  return (
    <div className="flex flex-col gap-5">
      {candidate.indicators && (
        <div className="flex flex-col gap-2">
          <Choice
            label="印"
            options={[
              ['spinner', '回る円'],
              ['bar', '流れる線'],
            ]}
            value={indicator}
            onChange={setIndicator}
          />
          {candidate.look.component && (
            <Choice
              label="押せないときの ▼"
              options={[
                ['show', '出す（既定）'],
                ['hide', '隠す'],
              ]}
              value={disabledIcon}
              onChange={setDisabledIcon}
            />
          )}
        </div>
      )}
      <PendingTextField
        look={look}
        pending={checking}
        formBusy={submitting}
        label="ユーザー名"
        value={name}
        onChange={changeName}
        caption={CAPTION}
        error={taken ? 'このユーザー名は使えません' : undefined}
      />
      <PendingSelect
        look={look}
        formBusy={submitting}
        label="都道府県"
        items={prefectures}
        placeholder="選んでください"
        value={prefecture}
        onValueChange={changePrefecture}
      />
      <PendingSelect
        look={look}
        pending={loadingCities}
        formBusy={submitting}
        label="市区町村"
        items={prefecture && !loadingCities ? cities[prefecture] : []}
        placeholder={prefecture ? '選んでください' : '先に都道府県を選んでください'}
        value={city}
        onValueChange={setCity}
        disabled={!prefecture}
        disabledIcon={disabledIcon}
      />
      <Button color="primary" loading={submitting} onClick={submit} className="self-start">
        保存する
      </Button>
    </div>
  );
}

const PendingCell = ({ column, candidate }: { column: Column; candidate: PendingCandidate }) => {
  if (column.label === '値を確かめている') return <CheckCell look={candidate.look} />;
  if (column.label === '選択肢を読み込んでいる') return <LoadCell candidate={candidate} />;
  if (column.label === 'フォームを送っている') return <SubmitCell look={candidate.look} />;
  return <TryForm candidate={candidate} />;
};

// 開いたままの選択肢がフォーカスを取り、ページが最後の行までスクロールするのを戻す
const ResetFocus = () => {
  useEffect(() => {
    const id = setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      window.scrollTo(0, 0);
    }, 300);
    return () => clearTimeout(id);
  }, []);
  return null;
};

// ── 2. 動きを減らす設定 ──────────────────────────────────
// 各案の「設定がオンのとき」の動きを、data-axis24-rm を付けた列では設定にかかわらず出す
// data-axis24-follow を付けた列は、@media (prefers-reduced-motion: reduce) のときだけ同じ動きになる（本当の設定の道）
// 部品の中の印は、Button のクラス（animate-spin・animate-loading-bar）で探す
// E（決定）は、部品の動きを減らす設定の動き（--animate-spin-reduced・--animate-loading-bar-reduced）をそのまま使う
// ほかの行は、比べたときの動きを再現する。部品は設定がオンのとき自分で動きを変えるので、まずふだんの動きに戻してから案の動きを当てる

type Motion = 'current' | 'slow' | 'pulse' | 'text' | 'mixed' | 'decided';

interface MotionCandidate extends Candidate {
  motion: Motion;
}

const motionCandidates: MotionCandidate[] = [
  {
    id: '現行版',
    motion: 'current',
    name: 'そのまま回す',
    intent:
      'いまの動き。設定がオンでも、回る円は1秒で1周し、線も流れ続ける。止まるのは、押せない見た目への色の移り変わり（0.2 秒）だけ。この案を選ぶと、いまの動きを決まりにする。',
    spec: [
      ['回る円', '1秒で1周'],
      ['線', '1.2 秒で流れる'],
      ['色の移り変わり', '止まる（一瞬で切り替わる）'],
    ],
  },
  {
    id: 'A',
    motion: 'slow',
    name: 'ゆっくり回す',
    intent: '動きは残し、速さを 1/3 にする。回る円は3秒で1周、線は 3.6 秒で流れる。',
    spec: [
      ['回る円', '3秒で1周'],
      ['線', '3.6 秒で流れる'],
      ['色の移り変わり', '止まる'],
    ],
  },
  {
    id: 'B',
    motion: 'pulse',
    name: '明滅にする',
    intent:
      '回したり流したりせず、その場で濃くなったり薄くなったりする（1.6 秒で1往復）。回る円は止めた形のまま、線は幅いっぱいに引いて明滅する。',
    spec: [
      ['回る円', '止めて明滅（100% ↔ 35%）'],
      ['線', '幅いっぱいで明滅（60% ↔ 20%）'],
      [
        'いちばん薄いとき',
        '青いボタンの白い円は 1.73:1 → 1.22:1、線は 1.20:1。グレーのボタンの円は 10.73:1 → 1.96:1',
      ],
    ],
  },
  {
    id: 'C',
    motion: 'text',
    name: '止めて「送信中」と書く',
    intent:
      '動く印をやめ、止まった砂時計と「送信中」の文字にする。印の種類（overlay・inline・bar）によらず同じ形。文字は薄くしない。ボタンの幅は、元のラベルと「送信中」の広いほうになる。',
    spec: [
      ['印', '砂時計（止まる）＋「送信中」'],
      [
        '文字の色',
        '色のボタンは本文の色（薄い塗りの上で 6.22〜7.99:1）、枠線のボタンは枠線の色、グレー・白は元の色',
      ],
      ['ラベル', '隠れる'],
    ],
  },
  {
    id: 'D',
    motion: 'mixed',
    name: '円は回し、線は明滅',
    intent:
      '小さな回る円はそのまま回す。ボタンの幅いっぱいを横切る線だけを、B と同じ明滅にする。動きの大きさで分ける案。',
    spec: [
      ['回る円', '1秒で1周（いまのまま）'],
      ['線', '幅いっぱいで明滅（60% ↔ 20%）'],
      ['色の移り変わり', '止まる'],
    ],
  },
  {
    id: 'E',
    motion: 'decided',
    name: '円は A、線は B（決定）',
    intent:
      '回る円は A と同じく3秒で1周、線は B と同じく幅いっぱいに引いて明滅する。部品（Button・TextField・Select）とトークンで描いている。入力欄の印と、開いた選択肢の「読み込んでいます」の行も同じ動きになる。',
    spec: [
      ['回る円', '3秒で1周（--animate-spin-reduced）'],
      ['線', '幅いっぱいで明滅（60% ↔ 20%、1.6 秒 — --animate-loading-bar-reduced）'],
      ['色の移り変わり', '止まる'],
      ['入力欄・Select', '同じ動き'],
    ],
  },
];

const motionColumns: Column[] = [
  {
    label: '設定に従う（参考）',
    note: 'この端末の設定のまま動きます。設定がオフなら、ふだんの動きです。オンにすると、右の2列と同じになります',
  },
  {
    label: '設定がオンのとき: 回る円',
    note: '設定にかかわらず、オンのときの動きを出しています。上が overlay（既定）、下が inline',
  },
  { label: '設定がオンのとき: 流れる線', note: '同じく、bar のオンのときの動き' },
];

// 案ごとの「設定がオンのとき」の CSS。scope は、その動きにする範囲
const motionRules = (motion: Motion, scope: string) => {
  const spin = `${scope} [data-loading] .animate-spin`;
  const bar = `${scope} [data-loading] .animate-loading-bar`;
  const pulseBar = `${bar} { width: 100%; animation: axis24-bar-pulse 1.6s ease-in-out infinite; }`;
  switch (motion) {
    case 'slow':
      return `${spin} { animation-duration: 3s; }\n${bar} { animation-duration: 3.6s; }`;
    case 'pulse':
      return `${spin} { animation: axis24-pulse 1.6s ease-in-out infinite; }\n${pulseBar}`;
    case 'text':
      return [
        `${spin}, ${bar} { display: none; }`,
        // E のラベルは 55% に薄くしている。文字の知らせは薄くしない
        `${scope} [data-loading] > span:has([data-axis24-swap]) { opacity: 1; }`,
        `${scope} [data-loading] [data-axis24-swap-label] { visibility: hidden; }`,
        `${scope} [data-loading] [data-axis24-swap-busy] { display: inline-flex; }`,
      ].join('\n');
    case 'mixed':
      return pulseBar;
    case 'decided':
      // 部品が設定がオンのときに使うトークンを、固定した列でも当てる
      return `${spin} { animation: var(--animate-spin-reduced); }\n${bar} { width: 100%; animation: var(--animate-loading-bar-reduced); }`;
    default:
      return '';
  }
};

// 比べた行（E 以外）は、設定がオンでも部品の動き（adr/0042）ではなく、比べたときの動きにする
// :where で弱くし、上の案ごとの動きが勝つようにする
const compared =
  ':where([data-axis24-rm]:not([data-axis24-rm="decided"]), [data-axis24-follow]:not([data-axis24-follow="decided"]))';

const motionCss = [
  `${compared} [data-loading] .animate-spin { animation: var(--animate-spin); }`,
  `${compared} [data-loading] .animate-loading-bar { width: 40%; animation: var(--animate-loading-bar); }`,
  '@keyframes axis24-pulse { 50% { opacity: 0.35; } }',
  '@keyframes axis24-bar-pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.2; } }',
  // C: ラベルと「送信中」を同じ場所に重ね、幅を広いほうに合わせる。ふだんは「送信中」を描かない
  '[data-axis24-swap] { display: inline-grid; }',
  '[data-axis24-swap] > * { grid-area: 1 / 1; justify-self: center; }',
  '[data-axis24-swap-busy] { display: none; }',
  // 設定がオンのときに部品が止める色の移り変わり（motion-reduce:[transition:none]）を、固定した列でも止める
  '[data-axis24-rm] [data-loading], [data-axis24-rm] [data-loading] * { transition: none; }',
  ...motionCandidates.map((c) => motionRules(c.motion, `[data-axis24-rm="${c.motion}"]`)),
  '@media (prefers-reduced-motion: reduce) {',
  ...motionCandidates.map((c) => motionRules(c.motion, `[data-axis24-follow="${c.motion}"]`)),
  '}',
].join('\n');

// 砂時計（C）。文字と並ぶので、線は Regular の太さ（ADR-0018）
const HourglassIcon = () => (
  <svg
    viewBox="0 0 256 256"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className="size-(--size-icon) shrink-0"
    style={{ strokeWidth: 'var(--icon-stroke)' }}
  >
    <path d="M64 40h128l-64 88z" />
    <path d="M64 216h128l-64-88z" />
  </svg>
);

type Appearance = NonNullable<ButtonProps['appearance']>;
type Color = NonNullable<ButtonProps['color']>;

// C の「送信中」の色: 色のボタンは薄い塗りの上なので本文の色、枠線のボタンは枠線の色、グレー・白は元の文字の色
const busyTone = (appearance: Appearance, color: Color) => {
  if (appearance === 'outline') return 'var(--button-accent)';
  if (color === 'neutral' || color === 'surface') return 'var(--button-ink)';
  return 'var(--color-fg)';
};

interface BusyButtonProps {
  indicator: LoadingIndicator;
  appearance?: Appearance;
  color?: Color;
  full?: boolean;
  children: string;
}

// 送信中で固定した Button。C のために、ラベルと「送信中」を重ねて渡す（C でないときは「送信中」を描かない）
const BusyButton = ({
  indicator,
  appearance = 'filled',
  color = 'neutral',
  full,
  children,
}: BusyButtonProps) => (
  <Button
    loading
    loadingIndicator={indicator}
    appearance={appearance}
    color={color}
    className={full ? 'w-full' : undefined}
  >
    <span data-axis24-swap>
      <span data-axis24-swap-label>{children}</span>
      <span
        data-axis24-swap-busy
        className="items-center gap-2"
        style={{ color: busyTone(appearance, color) }}
      >
        <HourglassIcon />
        送信中
      </span>
    </span>
  </Button>
);

const Group = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="flex flex-col gap-2">
    <span className="text-xs text-fg-subtle">{title}</span>
    <div className="flex flex-wrap gap-3">{children}</div>
  </div>
);

const SpinnerButtons = () => (
  <div className="flex flex-col gap-5">
    <Group title="overlay（既定）">
      <BusyButton indicator="overlay" color="primary">
        保存する
      </BusyButton>
      <BusyButton indicator="overlay" color="secondary">
        応援する
      </BusyButton>
      <BusyButton indicator="overlay">再読み込み</BusyButton>
      <BusyButton indicator="overlay" color="surface">
        共有
      </BusyButton>
      <BusyButton indicator="overlay" appearance="outline" color="primary">
        下書きに保存
      </BusyButton>
    </Group>
    <Group title="inline">
      <BusyButton indicator="inline" color="primary">
        保存する
      </BusyButton>
      <BusyButton indicator="inline">再読み込み</BusyButton>
    </Group>
  </div>
);

const BarButtons = () => (
  <div className="flex flex-col gap-5">
    <Group title="bar">
      <BusyButton indicator="bar" color="primary">
        保存する
      </BusyButton>
      <BusyButton indicator="bar">再読み込み</BusyButton>
      <BusyButton indicator="bar" appearance="outline" color="primary">
        下書きに保存
      </BusyButton>
    </Group>
    <BusyButton indicator="bar" color="primary" full>
      ログイン
    </BusyButton>
  </div>
);

const FollowButtons = () => (
  <div className="flex flex-col gap-5">
    <Group title="overlay（既定）">
      <BusyButton indicator="overlay" color="primary">
        保存する
      </BusyButton>
      <BusyButton indicator="overlay">再読み込み</BusyButton>
    </Group>
    <Group title="inline">
      <BusyButton indicator="inline" color="primary">
        保存する
      </BusyButton>
      <BusyButton indicator="inline">再読み込み</BusyButton>
    </Group>
    <Group title="bar">
      <BusyButton indicator="bar" color="primary">
        保存する
      </BusyButton>
      <BusyButton indicator="bar">再読み込み</BusyButton>
    </Group>
  </div>
);

// E（決定）だけに足す入力欄。印は部品の loading（止めない TextField と、止める Select）
const LoadingFields = ({ indicator }: { indicator: Indicator }) => (
  <Group title={indicator === 'spinner' ? '入力欄（回る円）' : '入力欄（流れる線）'}>
    <div className="flex w-full flex-col gap-3">
      <TextField
        label="ユーザー名"
        defaultValue="kazuemon_"
        autoComplete="off"
        loading
        loadingIndicator={indicator}
      />
      <Select
        label="市区町村"
        prefix="東京都"
        items={[]}
        placeholder="選んでください"
        loading
        loadingBehavior="blocking"
        loadingIndicator={indicator}
      />
    </div>
  </Group>
);

const MotionCell = ({ column, motion }: { column: Column; motion: Motion }) => {
  const decided = motion === 'decided';
  if (column.label === '設定に従う（参考）')
    return (
      <div data-axis24-follow={motion} className="flex flex-col gap-5">
        <FollowButtons />
        {decided && <LoadingFields indicator="spinner" />}
      </div>
    );
  const spinner = column.label.endsWith('回る円');
  return (
    <div data-axis24-rm={motion} className="flex flex-col gap-5">
      {spinner ? <SpinnerButtons /> : <BarButtons />}
      {decided && <LoadingFields indicator={spinner ? 'spinner' : 'bar'} />}
    </div>
  );
};

// ── ストーリー ────────────────────────────────────────

interface ComparisonArgs {
  pick: string;
}

// E,G: 入力欄と Select の送信中の決定（止めるときは E、止めないときは G — design/adr/0042）
const pickOptions = ['', 'current', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'E,G'];

const meta = {
  title: 'Design Review/24 入力欄と Select の送信中',
  id: 'design-review-24-pending',
  parameters: {
    layout: 'fullscreen',
    pseudo: { focusWithin: ['[data-focus-preview] [data-slot="control"]'] },
  },
  args: { pick: '' },
  argTypes: {
    pick: {
      description:
        '採用した案（ADR の比較画像用）。F・G・E,G は入力欄と Select の送信中だけ。既定は、入力欄と Select では E,G、動きを減らす設定では E',
      control: 'inline-radio',
      options: pickOptions,
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const PendingField: Story = {
  name: '入力欄と Select の送信中',
  args: { pick: 'E,G' },
  render: ({ pick }) => (
    <>
      <style>{pendingCss}</style>
      <ResetFocus />
      <Comparison
        index={24}
        axis="送信中の残り: 入力欄と Select"
        pick={pick}
        candidates={pendingCandidates}
        columns={pendingColumns}
        renderCell={(column, candidate) => {
          const found = pendingCandidates.find((c) => c.id === candidate.id);
          return found && <PendingCell column={column} candidate={found} />;
        }}
      >
        <p>
          ADR-0034 で残した1つめです。ボタンの送信中は決まりましたが、入力欄と Select
          には、待っているときの見た目がありません。
        </p>
        <p>
          待つ場面は3つあります。入力した値を確かめているとき（ユーザー名が使えるか）、Select
          の選択肢を読み込んでいるとき（都道府県を選んだあとの市区町村）、フォーム全体を送っているときです。列にこの3つを並べました。いちばん右の列では、流れを触って確かめられます。
        </p>
        <p>
          回る円と線は、ボタンと同じ形・同じ速さです。どの案でも、フォーカスの青い枠線とエラーの赤い枠線（原則2）は変えません。エラーのあとで確かめ直すときは、結果が出るまでエラーを残します。
        </p>
        <p>
          E・F・G
          は、1回目を見て足した案です。ボタンと同じく、印を回る円と流れる線から選べます（ADR-0034）。「選択肢を読み込んでいる」の列に両方を並べ、「触って確かめる」の列でも切り替えられます。E・F
          は待っているあいだ欄を止め（ブロッキング）、G
          は止めません（ノンブロッキング）。止めているあいだの ▼ を、E は隠し、F は薄くします。
        </p>
        <p>
          どの案でも、都道府県を選ぶ前の市区町村は、いまと同じく押せない欄にして、プレースホルダの場所に理由を出します。
        </p>
        <p>
          ヘルプテキストはラベルのすぐ下に、エラーは欄の下の行に出るようになりました（軸 23）。D
          は、エラーと同じ欄の下の行に知らせを出し、ヘルプテキストは消しません。
        </p>
        <p>
          送っているあいだに欄を止めるかは、B・E・F（止める）とほかの案（止めない）の違いです。場面ごとに別の案を選んでもかまいません（例:
          確かめるのは A、送るのは B）。
        </p>
        <p>
          判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を選び、一言添えてください。E・F・G
          を選ぶときは、止めるか止めないかと、▼
          の扱いを選んでください。場面ごとに分けるときは、場面と案の組み合わせを書いてください。
        </p>
        <p>
          決定（ADR-0042）: 止めるときは E、止めないときは G で、部品の loadingBehavior
          で選べます（既定は G）。印は回る円（既定）と流れる線から選べます。押せない Select の ▼
          は、プレースホルダの場所の文と同じ #6E787D
          で出すか、隠すかを選べます。止めるときの「読み込んでいます」も #6E787D
          です。押せない文字の色 #A3A5A6
          は選んだ値だけにして、値が入った押せない欄と見分けます。E・G
          の行は部品で描いています。「フォームを送っている」の列だけは、部品にまだない形（欄を止めて、印はボタンだけ）なので、比べたときの形のままです。
        </p>
      </Comparison>
    </>
  ),
};

export const ReducedMotion: Story = {
  name: '動きを減らす設定',
  args: { pick: 'E' },
  render: ({ pick }) => (
    <>
      <style>{motionCss}</style>
      <Comparison
        index={24}
        axis="送信中の残り: 動きを減らす設定"
        pick={pick}
        candidates={motionCandidates}
        columns={motionColumns}
        renderCell={(column, candidate) => {
          const found = motionCandidates.find((c) => c.id === candidate.id);
          return found && <MotionCell column={column} motion={found.motion} />;
        }}
      >
        <p>
          ADR-0034
          で残した2つめです。端末で「視差効果を減らす」「アニメーションを減らす」などをオンにすると（prefers-reduced-motion:
          reduce）、いまのボタンは色の移り変わりだけが止まります。回る円は1秒で1周し、線も流れたままです。
        </p>
        <p>
          WCAG 2.3.3
          は、待っていることを伝える動きを、欠かせない動きとして扱います。そのため、回したままにするシステムも多くあります。一方で、ボタンの幅いっぱいを横切る線は、小さな回る円より大きな動きです。
        </p>
        <p>
          この端末では設定がオフなので、右の2列は、各案の「設定がオンのとき」の動きを、設定にかかわらず出しています。左の列は設定に従うので、オンにすると右の2列と同じになります。決まった形は、入力欄の印（もう1つのストーリー）にも当てます。
        </p>
        <p>どの動きがよいか、案を1つ選んで一言添えてください。</p>
        <p>
          決定（ADR-0042）: 回る円は A（3秒で1周）、線は B（幅いっぱいで明滅）です。E
          の行は、部品とトークンで描いています。入力欄の印にも同じ動きを当てるので、E
          の行には入力欄も並べました。ほかの行は、比べたときの動きのままです。
        </p>
      </Comparison>
    </>
  ),
};
