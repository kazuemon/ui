import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  createContext,
  type FormEvent,
  type ReactNode,
  use,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { Button, type ButtonProps } from '../../src/components/Button';
import { Checkbox, CheckboxGroup, type ChoiceColor } from '../../src/components/Checkbox';
import { FieldAddonButton } from '../../src/components/FieldAddon';
import { Form } from '../../src/components/Form';
import { EyeIcon } from '../../src/components/icons';
import { Link, type LinkProps } from '../../src/components/Link';
import { Radio, RadioGroup } from '../../src/components/Radio';
import { Select, type SelectItem, type SelectProps } from '../../src/components/Select';
import { Switch, type SwitchFrame } from '../../src/components/Switch';
import { TextField, type TextFieldProps } from '../../src/components/TextField';

// 押せない状態（disabled・送信中・止める形）の一覧。軸の比較（Comparison）ではなく、部品ごとに見比べるための一覧
// 部品は今の見た目のまま描く（比較のときの上書き pins.tsx は使わない）
// 各セルは Measured で包み、本体・文字などの計算済みの値（getComputedStyle）を読んで、下に小さく出す（Controls の「測った値」）
//   値はいつも data-measure-lines にも入れる（撮影や確かめのスクリプトが読む）

// ---- 測る ----

type Kind = 'box' | 'text' | 'fill';

interface Target {
  name: string;
  el: Element | null | undefined;
  /** box: 塗り・文字・線・不透明度・影、text: 文字・不透明度、fill: 塗り・不透明度 */
  kind: Kind;
  /** 疑似要素（::placeholder）の文字の色を読むとき */
  pseudo?: string;
}

/** セルの中から、測る要素を選ぶ */
type Probe = (root: HTMLElement) => Target[];

let canvas: CanvasRenderingContext2D | null | undefined;

// 計算済みの色（rgb()・oklab() など）を [r, g, b, a] にする。rgb() 以外はキャンバスに塗って読む
function rgba(value: string): [number, number, number, number] | null {
  const m = value.match(
    /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/
  );
  if (m) {
    const alpha = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : +m[4];
    return [+m[1], +m[2], +m[3], alpha];
  }
  if (canvas === undefined) {
    const c = document.createElement('canvas');
    c.width = 1;
    c.height = 1;
    canvas = c.getContext('2d', { willReadFrequently: true });
  }
  if (!canvas) return null;
  canvas.clearRect(0, 0, 1, 1);
  canvas.fillStyle = 'rgb(0 0 0 / 0)';
  canvas.fillStyle = value;
  canvas.fillRect(0, 0, 1, 1);
  const d = canvas.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2], d[3] / 255];
}

const round = (n: number) => String(Math.round(n * 100) / 100);

function hex(value: string) {
  const c = rgba(value);
  if (!c) return value;
  if (c[3] === 0) return '透明';
  const h = `#${c
    .slice(0, 3)
    .map((n) => Math.round(n).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
  return c[3] < 0.995 ? `${h} α${round(c[3])}` : h;
}

// box-shadow を1つずつに分ける（括弧の中のカンマでは分けない）
function splitTop(value: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '(') depth++;
    else if (value[i] === ')') depth--;
    else if (value[i] === ',' && depth === 0) {
      parts.push(value.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(value.slice(start));
  return parts;
}

// 見える影があるか。Tailwind の ring などが置く、透明か長さ 0 の影は数えない
function hasShadow(value: string) {
  if (!value || value === 'none') return false;
  return splitTop(value).some((part) => {
    const color =
      part.match(
        /(?:rgba?|oklab|oklch|lab|lch|color|hsla?)\([^)]*\)|#[0-9a-f]{3,8}\b|transparent/i
      )?.[0] ?? 'currentcolor';
    const lengths = part.replace(color, '').match(/-?[\d.]+px/g) ?? [];
    const alpha = rgba(color)?.[3] ?? 1;
    return alpha > 0 && lengths.some((length) => parseFloat(length) !== 0);
  });
}

// 見えている不透明度。要素とセルまでの祖先の opacity を掛ける
function opacityOf(el: Element, boundary: Element) {
  let value = 1;
  for (let node: Element | null = el; node && node !== boundary; node = node.parentElement) {
    value *= parseFloat(getComputedStyle(node).opacity);
  }
  return value;
}

function describe(target: Target, boundary: Element): string | null {
  const { el, kind, name, pseudo } = target;
  if (!el) return null;
  const s = getComputedStyle(el);
  if (s.display === 'none' || s.visibility === 'hidden') return `${name}: 出さない`;
  const text = pseudo ? getComputedStyle(el, pseudo) : s;
  const bits: string[] = [];
  if (kind === 'box' || kind === 'fill') bits.push(`塗り ${hex(s.backgroundColor)}`);
  if (kind === 'box' || kind === 'text') bits.push(`文字 ${hex(text.color)}`);
  if (kind === 'box') {
    const line = parseFloat(s.borderTopWidth) > 0 ? hex(s.borderTopColor) : '透明';
    bits.push(`線 ${line === '透明' ? 'なし' : line}`);
  }
  bits.push(`不透明度 ${round(opacityOf(el, boundary))}`);
  if (kind === 'box') bits.push(`影 ${hasShadow(s.boxShadow) ? 'あり' : 'なし'}`);
  if (el instanceof HTMLAnchorElement) {
    const underline = s.textDecorationLine.includes('underline') || s.backgroundImage !== 'none';
    bits.push(`下線 ${underline ? 'あり' : 'なし'}`);
  }
  if (el instanceof HTMLButtonElement) {
    bits.push(el.matches(':disabled, [aria-disabled="true"]') ? '押せない' : '押せる');
  }
  return `${name}: ${bits.join(' · ')}`;
}

const MeasureContext = createContext<{ show: boolean; density: Density }>({
  show: false,
  density: 'toolbar',
});

/** セル1つ。中の部品を測り、「測った値」がオンなら下に出す */
function Measured({ name, probe, children }: { name: string; probe: Probe; children: ReactNode }) {
  const { show, density } = use(MeasureContext);
  const ref = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<string[]>([]);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const measure = () => {
      const next = probe(root)
        .map((target) => describe(target, root))
        .filter((line): line is string => line !== null);
      setLines((prev) => (prev.join('\n') === next.join('\n') ? prev : next));
    };
    measure();
    // 送信中の回る円がふわっと出る動きや、密度を変えたあとの切り替わりが終わってから、もう一度読む
    const timers = [400, 1200].map((ms) => window.setTimeout(measure, ms));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [probe, density]);
  return (
    <div
      className="flex min-w-0 flex-col gap-2"
      data-measure={name}
      data-measure-lines={JSON.stringify(lines)}
    >
      <div ref={ref}>{children}</div>
      {show && lines.length > 0 && (
        <ul className="flex flex-col gap-0.5 text-[11px] leading-4 text-fg-muted tabular-nums">
          {lines.map((line, i) => (
            <li key={`${i}-${line}`}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---- 部品ごとの測るところ ----

const q = (root: HTMLElement, selector: string) => root.querySelector(selector);
const errorLine = (root: HTMLElement) =>
  q(root, '[data-slot="field-message"][data-kind="error"][data-open] [id]');

const buttonProbe: Probe = (root) => {
  const body = q(root, 'button, a');
  return [
    { name: '本体', el: body, kind: 'box' },
    // 送信中は、ラベルを包みに入れて薄くする（回る円を重ねるとき）
    { name: 'ラベル', el: body?.querySelector(':scope > span:not([aria-hidden])'), kind: 'text' },
    { name: '回る円', el: q(root, '.animate-spin'), kind: 'text' },
    { name: '線', el: q(root, '.animate-loading-bar'), kind: 'fill' },
    { name: 'キャプション', el: q(root, '[data-slot="button-caption"]'), kind: 'text' },
  ];
};

const linkProbe: Probe = (root) => [
  { name: '本体', el: q(root, 'a'), kind: 'box' },
  { name: '↗', el: q(root, 'a svg'), kind: 'text' },
  { name: '周りの文字', el: q(root, '[data-around]'), kind: 'text' },
];

const fieldProbe: Probe = (root) => {
  const control = q(root, '[data-slot="control"]');
  const input = control?.querySelector('input');
  // Select の値（プレースホルダのときは data-placeholder）
  const value = control?.querySelector(':scope > .truncate');
  // Select の ▼（data-slot のない、アイコンを持つ子）
  const icon =
    control &&
    [...control.children].find(
      (child) => !child.hasAttribute('data-slot') && child.querySelector('svg')
    );
  const texts: Target[] = input
    ? [
        input.value
          ? { name: '値', el: input, kind: 'text' }
          : { name: '文（プレースホルダ）', el: input, kind: 'text', pseudo: '::placeholder' },
      ]
    : value
      ? [
          {
            name: value.hasAttribute('data-placeholder') ? '文（プレースホルダ）' : '値',
            el: value,
            kind: 'text',
          },
        ]
      : [];
  return [
    { name: 'ラベル', el: q(root, '[data-slot="field-label"]'), kind: 'text' },
    { name: 'キャプション', el: q(root, '[id$="caption"]'), kind: 'text' },
    { name: '欄', el: control, kind: 'box' },
    ...texts,
    { name: 'prefix・suffix の文字', el: q(root, '[data-slot="field-addon"]'), kind: 'box' },
    { name: 'suffix のボタン', el: q(root, '[data-slot="field-addon-button"]'), kind: 'box' },
    { name: '回る円', el: q(root, '[data-slot="field-spinner"]'), kind: 'text' },
    { name: '線', el: q(root, '.animate-loading-bar'), kind: 'fill' },
    { name: '▼', el: icon, kind: 'text' },
    { name: 'エラー', el: errorLine(root), kind: 'text' },
  ];
};

const switchProbe: Probe = (root) => [
  { name: '行', el: q(root, '[data-switch-frame]'), kind: 'box' },
  { name: 'トラック', el: q(root, '[role="switch"]'), kind: 'box' },
  { name: 'ノブ', el: q(root, '[role="switch"] > *'), kind: 'box' },
  { name: 'ラベル', el: q(root, 'label'), kind: 'text' },
  { name: 'キャプション', el: q(root, 'p'), kind: 'text' },
];

// チェックボックス・ラジオの箱1つ（箱・印・横の文字）
const choiceTargets = (box: Element, prefix = ''): Target[] => {
  const label = box.parentElement?.querySelector(':scope > label');
  const name = prefix && `「${label?.textContent ?? ''}」の`;
  return [
    { name: `${name}箱`, el: box, kind: 'box' },
    {
      name: `${name}印`,
      el: box.querySelector(':scope > *'),
      kind: box.getAttribute('role') === 'radio' ? 'fill' : 'text',
    },
    { name: `${name}横の文字`, el: label, kind: 'text' },
  ];
};

const choiceProbe: Probe = (root) => {
  const box = q(root, '[role="checkbox"], [role="radio"]');
  return [
    ...(box ? choiceTargets(box) : []),
    { name: 'キャプション', el: q(root, 'p'), kind: 'text' },
    { name: 'エラー', el: errorLine(root), kind: 'text' },
  ];
};

const groupProbe: Probe = (root) => [
  { name: '見出し', el: q(root, '[data-slot="field-label"]'), kind: 'text' },
  { name: 'キャプション', el: q(root, '[id$="caption"]'), kind: 'text' },
  ...[...root.querySelectorAll('[role="checkbox"], [role="radio"]')].flatMap((box) =>
    choiceTargets(box, 'item')
  ),
  { name: 'エラー', el: errorLine(root), kind: 'text' },
];

const formProbe: Probe = (root) => {
  const [text, select] = root.querySelectorAll('[data-slot="control"]');
  const [first, second] = root.querySelectorAll('button[type="submit"]');
  const box = q(root, '[role="checkbox"]');
  return [
    { name: 'TextField の欄', el: text, kind: 'box' },
    { name: 'Select の欄', el: select, kind: 'box' },
    ...(box ? choiceTargets(box, 'item') : []),
    { name: 'トグルのトラック', el: q(root, '[role="switch"]'), kind: 'box' },
    {
      name: 'トグルのラベル',
      el: q(root, '[role="switch"]')?.parentElement?.querySelector('label'),
      kind: 'text',
    },
    { name: '送信のボタン（押した）', el: first, kind: 'box' },
    { name: '回る円', el: q(root, '.animate-spin'), kind: 'text' },
    { name: '送信のボタン（ほか）', el: second, kind: 'box' },
  ];
};

// ---- 並べる枠 ----

interface Row {
  label: string;
  note?: string;
  /** 列の番号から、セルの中身を作る */
  cell: (column: number) => ReactNode;
}

function Table({
  id,
  columns,
  rows,
  probe,
  width = 232,
}: {
  id: string;
  columns: string[];
  rows: Row[];
  probe: Probe;
  width?: number;
}) {
  return (
    <div className="overflow-x-auto pb-2">
      <div
        className="grid gap-x-6"
        style={{ gridTemplateColumns: `168px repeat(${columns.length}, ${width}px)` }}
      >
        <div />
        {columns.map((column) => (
          <div key={column} className="pb-3 text-xs font-bold text-fg-subtle">
            {column}
          </div>
        ))}
        {rows.map((row) => (
          <div
            key={row.label}
            className="col-span-full grid grid-cols-subgrid items-start border-t border-line py-4"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold">{row.label}</span>
              {row.note && <span className="text-xs text-fg-subtle">{row.note}</span>}
            </div>
            {columns.map((column, i) => (
              <Measured key={column} name={`${id}｜${row.label}｜${column}`} probe={probe}>
                {row.cell(i)}
              </Measured>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex max-w-[72ch] flex-col gap-1">
        <h2 className="text-xl font-heading">{title}</h2>
        {note && <div className="text-sm leading-6 text-fg-muted">{note}</div>}
      </div>
      {children}
    </section>
  );
}

const SubTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-sm font-bold">{children}</h3>
);

const none = (text: string) => <span className="text-xs text-fg-subtle">{text}</span>;

const preventSubmit = (event: FormEvent<HTMLFormElement>) => event.preventDefault();

// ---- Button ----

type ButtonColor = NonNullable<ButtonProps['color']>;
type ButtonAppearance = NonNullable<ButtonProps['appearance']>;

const buttonColors: ButtonColor[] = ['primary', 'secondary', 'danger', 'neutral', 'white'];
const buttonAppearances: ButtonAppearance[] = ['filled', 'outline'];
const buttonColorNote: Record<ButtonColor, string> = {
  primary: '色を持つ',
  secondary: '色を持つ',
  danger: '色を持つ',
  neutral: '色を持たない（既定）',
  white: '白いボタン',
};

const buttonKinds = buttonAppearances.flatMap((appearance) =>
  buttonColors.map((color) => ({ appearance, color }))
);

// 列（状態）。キャプションありの表は、最初の3列だけ使う
const buttonStates: {
  label: string;
  props: Pick<ButtonProps, 'disabled' | 'loading' | 'inlineSpinner' | 'loadingIndicator'>;
}[] = [
  { label: '通常', props: {} },
  { label: '押せない', props: { disabled: true } },
  { label: '送信中（回る円）', props: { loading: true } },
  { label: '送信中（回る円を左に）', props: { loading: true, inlineSpinner: true } },
  { label: '送信中（線）', props: { loading: true, loadingIndicator: 'bar' } },
];
const captionStates = buttonStates.slice(0, 3);

const buttonRows: Row[] = buttonKinds.map(({ appearance, color }) => ({
  label: `${color} · ${appearance}`,
  note: buttonColorNote[color],
  cell: (i) => (
    <Button color={color} appearance={appearance} {...buttonStates[i].props}>
      保存する
    </Button>
  ),
}));

const captionText = '公開したあとは変更できません';

const captionRows: Row[] = [
  ...(
    [
      ['primary', 'filled'],
      ['neutral', 'filled'],
      ['secondary', 'outline'],
      ['neutral', 'outline'],
    ] as const
  ).map(([color, appearance]): Row => ({
    label: `${color} · ${appearance}`,
    cell: (i) => (
      <Button
        color={color}
        appearance={appearance}
        caption={captionText}
        {...captionStates[i].props}
      >
        公開する
      </Button>
    ),
  })),
  {
    label: 'ボタンの見た目のリンク',
    note: 'primary（Link の appearance="button"）',
    cell: (i) =>
      i === 2 ? (
        none('リンクは送信中を持たない')
      ) : (
        <Link
          appearance="button"
          color="primary"
          href="#top"
          caption={captionText}
          disabled={i === 1}
        >
          記事を読む
        </Link>
      ),
  },
];

// ボタンの見た目のリンク（Link の appearance="button"）。色は primary・secondary・neutral
// 押せないときは、色を指定していても押せないグレーのボタンと同じ見た目（原則7）
const buttonLinkRows: Row[] = (['primary', 'secondary', 'neutral'] as const).map((color) => ({
  label: color,
  note: buttonColorNote[color],
  cell: (i) => (
    <Link appearance="button" color={color} href="#top" disabled={i === 1}>
      記事を読む
    </Link>
  ),
}));

// ---- Link ----

type LinkColor = NonNullable<LinkProps['color']>;
type LinkAppearance = NonNullable<LinkProps['appearance']>;

const linkColors: LinkColor[] = ['primary', 'secondary', 'neutral'];
const linkAppearances: LinkAppearance[] = ['text', 'outline'];

function LinkSample({
  appearance,
  color,
  disabled,
  newTab,
}: {
  appearance: LinkAppearance;
  color: LinkColor;
  disabled?: boolean;
  newTab?: boolean;
}) {
  const target = newTab ? { href: 'https://k6n.jp/', target: '_blank' } : { href: '#top' };
  if (appearance === 'outline') {
    return (
      <Link appearance="outline" color={color} disabled={disabled} {...target}>
        もっと見る
      </Link>
    );
  }
  return (
    <p data-around className="text-sm leading-6 text-fg">
      記事は{' '}
      <Link color={color} disabled={disabled} {...target}>
        こちら
      </Link>{' '}
      から読めます
    </p>
  );
}

const linkStates: { label: string; props: { disabled?: boolean; newTab?: boolean } }[] = [
  { label: '通常', props: {} },
  { label: '押せない', props: { disabled: true } },
  { label: '新しいタブ（↗）', props: { newTab: true } },
  { label: '新しいタブ（↗）· 押せない', props: { newTab: true, disabled: true } },
];

const linkRows: Row[] = linkAppearances.flatMap((appearance) =>
  linkColors.map((color) => ({
    label: `${appearance} · ${color}`,
    note: color === 'neutral' ? '色を持たない（既定）' : '色を持つ',
    cell: (i) => <LinkSample appearance={appearance} color={color} {...linkStates[i].props} />,
  }))
);

// ---- TextField・Select ----

// TextField と Select で共通の、状態の props（readOnly は TextField だけ）
interface FieldStateProps {
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  loading?: boolean;
  loadingBehavior?: 'blocking' | 'non-blocking';
  loadingIndicator?: 'spinner' | 'bar';
}

interface FieldState {
  label: string;
  props: FieldStateProps;
  /** Form の submitting の中に置く */
  form?: boolean;
}

const errorText = '使えない文字が入っています';

function stateSet(withReadOnly: boolean): [FieldState[], FieldState[]] {
  const first: FieldState[] = [
    { label: '通常', props: {} },
    { label: '押せない', props: { disabled: true } },
    ...(withReadOnly ? [{ label: '読み取り専用', props: { readOnly: true } }] : []),
    { label: 'エラー', props: { error: errorText } },
    { label: 'エラー＋押せない', props: { error: errorText, disabled: true } },
  ];
  const waiting: FieldState[] = [
    { label: '待っている（止めない）', props: { loading: true } },
    { label: '待っている（止める）', props: { loading: true, loadingBehavior: 'blocking' } },
    {
      label: '待っている（止める・線）',
      props: { loading: true, loadingBehavior: 'blocking', loadingIndicator: 'bar' },
    },
    { label: 'フォームの送信中', props: {}, form: true },
  ];
  return [first, waiting];
}

const [textStates, textWaiting] = stateSet(true);
const [selectStates, selectWaiting] = stateSet(false);

const passwordButton = (disabled?: boolean) => (
  <FieldAddonButton aria-label="パスワードを表示" disabled={disabled}>
    <EyeIcon standalone />
  </FieldAddonButton>
);

const textSamples: { label: string; note?: string; props: TextFieldProps }[] = [
  {
    label: '値あり',
    props: { label: 'ユーザー名', caption: '半角英数字で入力します', defaultValue: 'kazuemon' },
  },
  {
    label: '空（プレースホルダ）',
    props: { label: 'ユーザー名', caption: '半角英数字で入力します', placeholder: '例: kazuemon' },
  },
  {
    label: 'prefix（文字）',
    props: {
      label: 'サイト',
      caption: 'ドメインから入力します',
      prefix: 'https://',
      defaultValue: 'k6n.jp',
    },
  },
  {
    label: 'suffix（文字）',
    props: { label: '価格', caption: '税込みで入力します', suffix: '円', defaultValue: '1200' },
  },
  {
    label: 'suffix（ボタン）',
    note: 'FieldAddonButton',
    props: {
      label: 'パスワード',
      caption: '8文字以上',
      type: 'password',
      defaultValue: 'secret123',
      suffix: passwordButton(),
    },
  },
  {
    label: 'suffix のボタンだけ押せない',
    note: 'FieldAddonButton の disabled',
    props: {
      label: 'パスワード',
      caption: '8文字以上',
      type: 'password',
      defaultValue: 'secret123',
      suffix: passwordButton(true),
    },
  },
];

const textRows = (states: FieldState[]): Row[] =>
  textSamples.map((sample) => ({
    label: sample.label,
    note: sample.note,
    cell: (i) =>
      states[i].form ? (
        <Form submitting onSubmit={preventSubmit}>
          <TextField {...sample.props} />
        </Form>
      ) : (
        <TextField {...sample.props} {...states[i].props} />
      ),
  }));

const slots: SelectItem[] = [
  { value: 'morning', label: '午前' },
  { value: 'afternoon', label: '14〜16時' },
  { value: 'evening', label: '18〜20時' },
  {
    value: 'night',
    label: '20〜21時',
    disabled: true,
    note: { kind: 'reason', text: 'この地域では選べません' },
  },
];

const cities: SelectItem[] = [
  { value: 'shibuya', label: '渋谷区' },
  { value: 'meguro', label: '目黒区' },
  { value: 'setagaya', label: '世田谷区' },
];

const selectSamples: { label: string; note?: string; props: SelectProps }[] = [
  {
    label: '選んだ値あり',
    note: '開くと、最後の選択肢が選べない（2行目に理由）',
    props: {
      label: '配送の時間帯',
      caption: '前日までに選びます',
      items: slots,
      defaultValue: 'morning',
    },
  },
  {
    label: '空（プレースホルダ）',
    props: {
      label: '配送の時間帯',
      caption: '前日までに選びます',
      items: slots,
      placeholder: '選んでください',
    },
  },
  {
    label: 'prefix（文字）',
    props: {
      label: '市区町村',
      caption: '都道府県を選んだあとに選びます',
      items: cities,
      prefix: '東京都',
      defaultValue: 'shibuya',
    },
  },
  {
    label: '▼を隠す',
    note: 'disabledIcon="hide"（押せないときだけ効く）',
    props: {
      label: '配送の時間帯',
      caption: '前日までに選びます',
      items: slots,
      defaultValue: 'morning',
      disabledIcon: 'hide',
    },
  },
];

const selectRows = (states: FieldState[]): Row[] =>
  selectSamples.map((sample) => ({
    label: sample.label,
    note: sample.note,
    cell: (i) =>
      states[i].form ? (
        <Form submitting onSubmit={preventSubmit}>
          <Select {...sample.props} />
        </Form>
      ) : (
        <Select {...sample.props} {...states[i].props} />
      ),
  }));

// ---- Switch ----

const choiceColors: ChoiceColor[] = ['primary', 'secondary', 'neutral'];
const colorNote = (color: ChoiceColor) =>
  color === 'neutral' ? '色を持たない（既定）' : '色を持つ';

const switchRows: Row[] = choiceColors.flatMap((color) =>
  [false, true].map((on) => ({
    label: `${color} · ${on ? 'ON' : 'OFF'}`,
    note: colorNote(color),
    cell: (i) => (
      <Switch
        color={color}
        defaultChecked={on}
        disabled={i === 1}
        label="新着をメールで受け取る"
        caption="週に1回まとめて届きます"
      />
    ),
  }))
);

const frames: SwitchFrame[] = ['none', 'card', 'divided'];

const switchFrameRows: Row[] = frames.flatMap((frame) =>
  (['neutral', 'primary'] as const).flatMap((color) =>
    [false, true].map((on) => ({
      label: `${frame} · ${color} · ${on ? 'ON' : 'OFF'}`,
      note: frame === 'none' ? undefined : 'togglePlacement="end"',
      cell: (i) => (
        <Switch
          frame={frame}
          togglePlacement={frame === 'none' ? 'start' : 'end'}
          color={color}
          defaultChecked={on}
          disabled={i === 1}
          label="新着をメールで受け取る"
          caption="週に1回まとめて届きます"
        />
      ),
    }))
  )
);

// ---- Checkbox・Radio ----

const checkStates = [
  { label: '選んでいない', props: {} },
  { label: '選んだ', props: { defaultChecked: true } },
  { label: '中間', props: { indeterminate: true } },
] as const;

const checkboxStates: { label: string; props: { disabled?: boolean; error?: string } }[] = [
  { label: '通常', props: {} },
  { label: '押せない', props: { disabled: true } },
  { label: 'エラー', props: { error: '同意が必要です' } },
  { label: 'エラー＋押せない', props: { error: '同意が必要です', disabled: true } },
];

const checkboxRows: Row[] = choiceColors.flatMap((color) =>
  checkStates.map((state) => ({
    label: `${color} · ${state.label}`,
    note: colorNote(color),
    cell: (i) => (
      <Checkbox
        color={color}
        label="利用規約に同意する"
        caption="内容は設定からいつでも読めます"
        {...state.props}
        {...checkboxStates[i].props}
      />
    ),
  }))
);

interface GroupMode {
  label: string;
  group?: boolean;
  item?: 'checked' | 'unchecked';
  error?: boolean;
}

const groupModes: GroupMode[] = [
  { label: '通常' },
  { label: 'グループごと押せない', group: true },
  { label: '選んだ1つが押せない', item: 'checked' },
  { label: '選んでいない1つが押せない', item: 'unchecked' },
  { label: 'エラー', error: true },
  { label: 'エラー＋押せない', error: true, group: true },
];

const checkboxGroupRows: Row[] = choiceColors.map((color) => ({
  label: color,
  note: `${colorNote(color)}。「すべて」は中間`,
  cell: (i) => {
    const mode = groupModes[i];
    return (
      <CheckboxGroup
        label="載せるもの"
        caption="1つ以上選びます"
        color={color}
        defaultValue={['text', 'image']}
        selectAll="すべて"
        allValues={['text', 'image', 'video']}
        disabled={mode.group}
        error={mode.error ? '選び直してください' : undefined}
      >
        <Checkbox value="text" label="本文" />
        <Checkbox value="image" label="画像" disabled={mode.item === 'checked'} />
        <Checkbox value="video" label="動画" disabled={mode.item === 'unchecked'} />
      </CheckboxGroup>
    );
  },
}));

const radioGroupRows: Row[] = choiceColors.map((color) => ({
  label: color,
  note: colorNote(color),
  cell: (i) => {
    const mode = groupModes[i];
    return (
      <RadioGroup
        label="公開の範囲"
        caption="あとから変えられます"
        color={color}
        defaultValue="public"
        disabled={mode.group}
        error={mode.error ? '選び直してください' : undefined}
      >
        <Radio value="public" label="全体に公開" disabled={mode.item === 'checked'} />
        <Radio value="limited" label="リンクを知っている人" disabled={mode.item === 'unchecked'} />
        <Radio value="private" label="自分だけ" />
      </RadioGroup>
    );
  },
}));

// ---- Form の送信中 ----

const formSample = (submitting: boolean) => (
  <Form submitting={submitting} onSubmit={preventSubmit} className="flex flex-col gap-4">
    <TextField label="名前" defaultValue="かずえもん" />
    <Select label="配送の時間帯" items={slots} defaultValue="morning" />
    <Checkbox label="お知らせを受け取る" defaultChecked />
    <Switch label="下書きとして残す" color="primary" defaultChecked />
    <RadioGroup label="公開の範囲" defaultValue="public" color="primary">
      <Radio value="public" label="全体に公開" />
      <Radio value="private" label="自分だけ" />
    </RadioGroup>
    <div className="flex flex-wrap gap-3">
      <Button type="submit" color="primary">
        送信する
      </Button>
      <Button type="submit" appearance="outline">
        下書きに保存
      </Button>
    </div>
  </Form>
);

// ---- ストーリー ----

type Density = 'toolbar' | 'fine' | 'coarse';

interface OverviewArgs {
  showMeasurements: boolean;
  density: Density;
}

const meta = {
  title: 'Design Review/押せない状態の一覧',
  id: 'design-review-disabled-overview',
  parameters: { layout: 'fullscreen' },
  args: { showMeasurements: false, density: 'toolbar' },
  argTypes: {
    showMeasurements: {
      name: '測った値',
      description:
        '各セルの下に、その場で読んだ値（塗り・文字・線の色、祖先を含めた不透明度、影のあるなし）を出す',
      control: 'boolean',
    },
    density: {
      name: '密度',
      description: '一覧全体の密度を固定する。「ツールバーのまま」はツールバーの「密度」に従う',
      control: {
        type: 'inline-radio',
        labels: { toolbar: 'ツールバーのまま', fine: 'マウス用', coarse: '指用' },
      },
      options: ['toolbar', 'fine', 'coarse'],
    },
  },
} satisfies Meta<OverviewArgs>;

export default meta;
type Story = StoryObj<OverviewArgs>;

export const Overview: Story = {
  name: '一覧',
  render: ({ showMeasurements, density }) => (
    <MeasureContext.Provider value={{ show: showMeasurements, density }}>
      <div
        id="top"
        data-density={density === 'toolbar' ? undefined : density}
        className="flex min-h-screen flex-col gap-12 bg-bg px-6 py-8 text-fg"
      >
        <header className="flex max-w-[72ch] flex-col gap-3">
          <p className="text-sm font-bold text-fg-subtle">一覧（比較ではありません）</p>
          <h1 className="text-2xl font-heading text-balance">押せない状態の一覧</h1>
          <div className="flex flex-col gap-2 text-sm leading-6 text-fg-muted">
            <p>
              かずえもんのメモ:「disabled の一貫性を確認するために、color/tone/error などそれぞれの
              disabled をまとめた story も作れますか？」（tone は、いまは color にまとめています）
            </p>
            <p>押せない状態の決まり（原則1・原則8）の要約です。</p>
            <ul className="flex list-disc flex-col gap-1 pl-5">
              <li>
                押せなくなったもの（無効・送信中）は浮いていません。影を消します。色を持つものは色を残して薄くし、色を持たないものはグレーに寄せて文字も薄くします。
              </li>
              <li>
                ラベルとキャプションは変えません（読めるまま）。押して反応する文字（チェックボックス・ラジオの横の文字、トグルのラベル）は本体の一部なので、本体と一緒に薄く・グレーにします。
              </li>
              <li>
                送信中も押せない見た目にします。ただし、動いている印（回る円・線）は薄くしません。
              </li>
              <li>
                入力欄:
                押せない欄は薄い塗り、文（プレースホルダ）は薄い文字、値はさらに薄い文字です。止める形（待っている・フォームの送信中）は押せない欄の見た目で、止めているあいだも
                suffix のボタンは押せます。
              </li>
              <li>
                押せないリンク:
                ボタンの見た目のリンクは押せないボタンと同じ見た目、枠線のリンクは押せないグレーの枠線のボタンと同じ見た目（色を指定していてもグレー）、文字のリンクはただの文字です。
              </li>
            </ul>
            <p>
              部品は今の見た目のまま描いています（比較のときの上書きはしていません）。各節は左に「通常」、右に「押せない」、必要なところは「送信中」「エラー」「エラー＋押せない」を並べています。
            </p>
            <p>
              密度は Controls
              の「密度」で一覧全体を固定できます。「ツールバーのまま」では、ツールバーの「密度」「指用の高さ」に従います。Controls
              の「測った値」をオンにすると、各セルの下に、その場で読んだ値（塗り・文字・線の色、祖先を含めた不透明度、影のあるなし）が出ます。
            </p>
            <p className="font-bold text-fg">
              決まりから外れて見えるところがあれば、部品と状態を一言で教えてください。
            </p>
          </div>
        </header>

        <Section
          title="Button"
          note='color × appearance。送信中は loading（回る円はラベルに重ねる既定と、inlineSpinner でラベルの左）と loadingIndicator="bar"。'
        >
          <Table
            id="Button"
            columns={buttonStates.map((state) => state.label)}
            rows={buttonRows}
            probe={buttonProbe}
            width={200}
          />
          <SubTitle>
            キャプションあり（押せなくても、送信中でも、キャプションは薄くしない）
          </SubTitle>
          <Table
            id="Button キャプション"
            columns={captionStates.map((state) => state.label)}
            rows={captionRows}
            probe={buttonProbe}
            width={200}
          />
          <SubTitle>
            ボタンの見た目のリンク（Link の appearance="button"。見た目は上のボタンと同じもの）
          </SubTitle>
          <Table
            id="Button リンク"
            columns={['通常', '押せない']}
            rows={buttonLinkRows}
            probe={buttonProbe}
            width={200}
          />
        </Section>

        <Section
          title="Link"
          note="appearance × color。押せない文字のリンクはただの文字（下線と ↗ なし、周りの文字の色）。押せない枠線のリンクは、押せないグレーの枠線のボタンと同じ。ボタンの見た目（appearance の button）のリンクも、押せないときは色を指定していても押せないグレーのボタンと同じ（原則7）。上の Button の節に並べています。"
        >
          <Table
            id="Link"
            columns={linkStates.map((state) => state.label)}
            rows={linkRows}
            probe={linkProbe}
            width={220}
          />
        </Section>

        <Section
          title="TextField"
          note="prefix・suffix（文字とボタン）を含む。suffix のボタンは FieldAddonButton で、欄が押せないときは一緒に押せなくなり、止めるときは押せるまま。"
        >
          <Table
            id="TextField"
            columns={textStates.map((s) => s.label)}
            rows={textRows(textStates)}
            probe={fieldProbe}
          />
          <SubTitle>待っている・フォームの送信中</SubTitle>
          <Table
            id="TextField 待っている"
            columns={textWaiting.map((s) => s.label)}
            rows={textRows(textWaiting)}
            probe={fieldProbe}
          />
        </Section>

        <Section
          title="Select"
          note="Select には読み取り専用（readOnly）の props はありません。color は開いた選択肢の印だけに効くので、本体は色によらず同じです。選べない選択肢は、開くと見えます。"
        >
          <Table
            id="Select"
            columns={selectStates.map((s) => s.label)}
            rows={selectRows(selectStates)}
            probe={fieldProbe}
          />
          <SubTitle>待っている・フォームの送信中</SubTitle>
          <Table
            id="Select 待っている"
            columns={selectWaiting.map((s) => s.label)}
            rows={selectRows(selectWaiting)}
            probe={fieldProbe}
          />
        </Section>

        <Section
          title="Switch"
          note="color × OFF・ON。ラベルは本体の一部なので押せないとグレー、キャプションは変えない。"
        >
          <Table
            id="Switch"
            columns={['通常', '押せない']}
            rows={switchRows}
            probe={switchProbe}
            width={280}
          />
          <SubTitle>行の形（frame）</SubTitle>
          <Table
            id="Switch frame"
            columns={['通常', '押せない']}
            rows={switchFrameRows}
            probe={switchProbe}
            width={320}
          />
        </Section>

        <Section
          title="Checkbox"
          note="1つだけ置くチェックボックスと、グループ（「すべて」の箱つき）。横の文字は本体の一部なので押せないとグレー、キャプションと見出しは変えない。"
        >
          <Table
            id="Checkbox"
            columns={checkboxStates.map((state) => state.label)}
            rows={checkboxRows}
            probe={choiceProbe}
            width={250}
          />
          <SubTitle>グループ（CheckboxGroup）</SubTitle>
          <Table
            id="CheckboxGroup"
            columns={groupModes.map((mode) => mode.label)}
            rows={checkboxGroupRows}
            probe={groupProbe}
            width={220}
          />
        </Section>

        <Section
          title="Radio"
          note="RadioGroup の color × 押せない形。「全体に公開」を選んだ状態。"
        >
          <Table
            id="RadioGroup"
            columns={groupModes.map((mode) => mode.label)}
            rows={radioGroupRows}
            probe={groupProbe}
            width={220}
          />
        </Section>

        <Section
          title="Form の送信中"
          note="Form の submitting。入力欄は止める形（押せない欄の見た目）、送信のボタンは押したもの（ここでは最初のもの）に印、ほかは押せない見た目だけ。チェックボックス・ラジオ・トグルも止め、押せない見た目にします（フォーカスは外れず、値も送られます）。"
        >
          <Table
            id="Form"
            columns={['送っていない', '送っている（submitting）']}
            rows={[{ label: 'Form の中の部品', cell: (i) => formSample(i === 1) }]}
            probe={formProbe}
            width={320}
          />
        </Section>
      </div>
    </MeasureContext.Provider>
  ),
};
