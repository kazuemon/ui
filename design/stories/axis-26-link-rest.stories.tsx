import { useRender } from '@base-ui/react/use-render';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  type ComponentProps,
  cloneElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { Button, type ButtonProps } from '../../src/components/Button';
import { ArrowUpRightIcon, CaretRightIcon, InfoIcon } from '../../src/components/icons';
import { Link, type LinkContentAlign, type LinkProps } from '../../src/components/Link';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 26: リンクの残り（原則7）。大きさは ADR-0039、色は ADR-0028、hover と押下は ADR-0027、フォーカスは ADR-0031 で決まっている
// 1回目。ADR-0039 で残した2つを、別のストーリーで比べる
//   幅いっぱいの枠線のリンク: SNS のアカウント一覧（2列）などで幅いっぱいに広げると、中身が左に寄る
//   ボタンの形のリンク: いまの Button は <button> だけで href を持てない。「広い範囲が要るときはボタンを使う」ための、ページを移るリンクがない
// 比べたときは部品がどちらも持たなかったので、比較のためにこの中で組み立てた
//   幅いっぱい: Link（appearance="outline"）の並べ方を、この中だけのトークン（--link-justify ほか）で差し替える
//   ボタンの形: Button の class を借りて <a> に付ける。押せない見た目は aria-disabled で下の CSS に足している
// 決定（design/adr/0046）: 幅いっぱいは A を既定にし、B・C も選べる（Link の contentAlign）。ボタンの形は B（render）
//   幅いっぱいの A・B・C の行は、部品（contentAlign）で描く。現行版と D は、比べたときの組み立てのまま
//   ボタンの形の行は、比べたときの組み立てのまま（部品は ↗ を必ず付けるので、見た目が変わる）。部品は「実装したリンク」で描く
//   Button の hover・押下は、決定のあと :not(:disabled) で書き直したので、<a> にも効く（下の CSS と同じ値）
// 決定のあと（4回目のメモ）: 文字のリンクの ↗ の大きさを、別のストーリー（ArrowSize）で比べ直す
//   行の違いはトークン --link-external-icon-size の値だけで、描くのは部品（Link）そのもの

// ── 1. 幅いっぱいの枠線のリンク ──────────────────────────
// 寄せ方は4つの形の組み合わせ。並べるとき（list）と1本だけのとき（single）で、行ごとに別の形を選べる
//   start: いまの部品（左に寄る）  center: 文字とアイコンをまとめて中央
//   between: 文字は左、アイコンは右端  center-end: 文字は中央、アイコンは右端
// トークンはキーワードと数だけにする。寸法（--size-icon）はリンクの上で解決させ、行の data-density に従わせる

type Align = 'start' | 'center' | 'between' | 'center-end';

const alignTokens = (context: 'list' | 'single', align: Align) => ({
  [`--${context}-link-justify`]:
    align === 'center' ? 'center' : align === 'between' ? 'space-between' : 'flex-start',
  // 文字の箱を広げて中央に置く（center-end）。反対側にアイコンと同じ幅を空けて、文字を箱全体の中央にする
  [`--${context}-link-grow`]: align === 'center-end' ? '1' : '0',
  [`--${context}-link-text-align`]: align === 'center-end' ? 'center' : 'start',
  [`--${context}-link-balance`]: align === 'center-end' ? '1' : '0',
});

const fullCss = `
[data-axis26-context='list'] {
  --link-justify: var(--list-link-justify);
  --link-grow: var(--list-link-grow);
  --link-text-align: var(--list-link-text-align);
  --link-balance: var(--list-link-balance);
}
[data-axis26-context='single'] {
  --link-justify: var(--single-link-justify);
  --link-grow: var(--single-link-grow);
  --link-text-align: var(--single-link-text-align);
  --link-balance: var(--single-link-balance);
}
/* 幅いっぱいに広げた枠線のリンク。左の余白に、アイコンと隙間（8px）の幅を足せる（center-end） */
.axis26-full {
  width: 100%;
  justify-content: var(--link-justify);
  padding-inline-start: calc(var(--space-control-x) + var(--link-balance) * (var(--size-icon) + 0.5rem));
}
.axis26-full > [data-axis26-label] {
  flex-grow: var(--link-grow);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: var(--link-text-align);
}`;

interface AlignCandidate extends Candidate {
  list: Align;
  single: Align;
  /** 部品で描くときの contentAlign（採った案だけ） */
  real?: LinkContentAlign;
}

const alignCandidate = (c: Omit<AlignCandidate, 'tokens'>): AlignCandidate => ({
  ...c,
  tokens: { ...alignTokens('list', c.list), ...alignTokens('single', c.single) },
});

const aligns: AlignCandidate[] = [
  alignCandidate({
    id: '現行版',
    name: '左に寄る',
    list: 'start',
    single: 'start',
    intent:
      'いまの部品のまま。文字とアイコンがまとまって左に寄り、右側が空く。アイコンの位置は文字の長さで変わる。',
    spec: [
      ['文字', '左'],
      ['アイコン', '文字のすぐ後ろ（8px）'],
      ['1本だけのとき', '同じ'],
    ],
  }),
  alignCandidate({
    id: 'A',
    name: '中央に寄せる',
    list: 'center',
    single: 'center',
    real: 'center',
    intent:
      '文字とアイコンをまとめて中央に置く。ボタンと同じ寄せ方。並べると、文字の長さで左右の端がそろわない。',
    spec: [
      ['文字', '中央（アイコンと一緒に）'],
      ['アイコン', '文字のすぐ後ろ（8px）'],
      ['1本だけのとき', '同じ'],
    ],
  }),
  alignCandidate({
    id: 'B',
    name: '文字は左、アイコンは右端',
    list: 'between',
    single: 'between',
    real: 'between',
    intent:
      '文字を左、アイコンを右端に置く。参照画像の SNS のボタンと More の形。並べると、文字の頭とアイコンが縦にそろう。',
    spec: [
      ['文字', '左'],
      ['アイコン', '右端（余白 12px／16px）'],
      ['1本だけのとき', '同じ'],
    ],
  }),
  alignCandidate({
    id: 'C',
    name: '文字は中央、アイコンは右端',
    list: 'center-end',
    single: 'center-end',
    real: 'center-end',
    intent:
      '文字は箱全体の中央、アイコンは右端に置く。アイコンは縦にそろい、文字はボタンのように中央に来る。左にアイコンと同じ幅を空けるので、文字の入る幅は少し狭い。',
    spec: [
      ['文字', '中央（箱全体の中央）'],
      ['アイコン', '右端（余白 12px／16px）'],
      ['1本だけのとき', '同じ'],
      ['左の余白', '余白＋アイコン＋8px'],
      [
        '文字が切れる',
        '指用の2列（1つ 150px）で「YouTube」。幅 375px の画面の2列（約 165px）なら収まる',
      ],
    ],
  }),
  alignCandidate({
    id: 'D',
    name: '並べるときは B、1本は A',
    list: 'between',
    single: 'center',
    intent:
      '一覧のように並べるときは B（アイコンを右端）、More のように1本だけのときは A（中央）にする。並びでは縦がそろい、1本では左右のつり合いがとれる。部品には、どちらにするかの指定が要る。',
    spec: [
      ['並べるとき', '文字は左、アイコンは右端（B）'],
      ['1本だけのとき', '文字とアイコンを中央（A）'],
    ],
  }),
];

const fullColumns: Column[] = [
  {
    label: 'SNS のアカウント一覧（2列）',
    note: '上がマウス用、下が指用。どれも外のサイトへ移るので ↗ が付く',
  },
  {
    label: '1列の一覧（スマートフォンの幅）',
    note: 'セルの幅いっぱい。文字の長さが違うと、寄せ方の差が見えやすい',
  },
  {
    label: 'カードの一覧の下の More',
    note: '1本だけ置く。ピンクは参照画像の WORKS の More と同じ色',
  },
];

// 外へ出るリンクの印は、部品の ArrowUpRightIcon（比べたときにこの中で描いていたものと同じ形 — ADR-0018 の Regular）

const densities = [
  ['fine', 'マウス用'],
  ['coarse', '指用'],
] as const;

// 同じ中身を、マウス用と指用に固定して上下に並べる
const BothDensities = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-5">
    {densities.map(([density, label]) => (
      <div key={density} data-density={density} className="flex flex-col gap-2">
        <span className="text-xs text-fg-subtle">{label}</span>
        {children}
      </div>
    ))}
  </div>
);

// 採った案（A・B・C）の行は、部品の contentAlign で描く（align）
// 現行版と D は、比べたときの組み立て（上のトークンと .axis26-full）のまま
type FullLinkProps = LinkProps & { icon: ReactNode; align?: LinkContentAlign };

const FullLink = ({ children, icon, align, ...props }: FullLinkProps) =>
  align ? (
    <Link appearance="outline" contentAlign={align} {...props} className="w-full">
      {children}
      {icon}
    </Link>
  ) : (
    <Link appearance="outline" {...props} className="axis26-full">
      <span data-axis26-label>{children}</span>
      {icon}
    </Link>
  );

const accounts = ['Discord', 'X', 'YouTube', 'GitHub'];
const longAccounts = ['Discord サーバー', 'X', 'YouTube チャンネル', 'GitHub'];

interface AlignProps {
  align?: LinkContentAlign;
}

const TwoColumns = ({ align }: AlignProps) => (
  <BothDensities>
    <div data-axis26-context="list" className="grid grid-cols-2 gap-3">
      {accounts.map((account) => (
        <FullLink key={account} align={align} href={`#${account}`} icon={<ArrowUpRightIcon />}>
          {account}
        </FullLink>
      ))}
    </div>
  </BothDensities>
);

const OneColumn = ({ align }: AlignProps) => (
  <BothDensities>
    <div data-axis26-context="list" className="flex flex-col gap-3">
      {longAccounts.map((account) => (
        <FullLink key={account} align={align} href={`#${account}`} icon={<ArrowUpRightIcon />}>
          {account}
        </FullLink>
      ))}
    </div>
  </BothDensities>
);

const CardsMore = ({ align }: AlignProps) => (
  <BothDensities>
    <div data-axis26-context="single" className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="flex flex-col gap-1">
            <div className="aspect-video rounded-lg bg-neutral" />
            <div className="h-2 w-3/4 rounded-pill bg-neutral" />
          </div>
        ))}
      </div>
      <FullLink align={align} color="secondary" href="#works" icon={<CaretRightIcon />}>
        More
      </FullLink>
    </div>
  </BothDensities>
);

// ── 2. ボタンの形のリンク ────────────────────────────────
// どの書き方も、行き着く要素は同じ <a>（Button と同じ class）。違うのは、利用者の書き方と型
// 案（行）は、下の「提案」のルールで描く
//   キーボード: リンクのまま（Enter で移る。Space はページのスクロール）
//   押せないとき: href を外し、role="link" と aria-disabled を付ける（Tab では止まらない）
//   外へ出る（target="_blank"）: 部品が文字の後ろに ↗ を付け、読み上げに「新しいタブで開きます」を足す
//   送信中（loading）: 持たない

type ButtonVisual = Pick<ButtonProps, 'appearance' | 'color'>;

// Button の見た目の class を、部品から借りる。Button は <button> を返す関数なので、呼んで class だけを取り出す
function useButtonClass(visual: ButtonVisual) {
  const element = Button({ ...visual }) as ReactElement<{ className?: string }>;
  return element.props.className ?? '';
}

// 比べたときの Button の hover・押下・Disabled は enabled:・disabled: で書かれていて、<a> には効かなかった
// 同じ値を、<a> では aria-disabled で分けて足す。決定のあと Button の hover・押下は :not(:disabled) になり
// <a> にも効くので、押せない見た目の <a> では沈まないように止める（translate: none）
const anchorCss = `
a[data-axis26-lb][aria-disabled='true'] { translate: none; }
a[data-axis26-lb]:not([aria-disabled='true']) { cursor: pointer; }
@media (hover: hover) {
  a[data-axis26-lb][data-appearance='filled']:not([aria-disabled='true']):hover { box-shadow: var(--shadow-raised-hover); }
  a[data-axis26-lb][data-appearance='filled'][data-color='neutral']:not([aria-disabled='true']):hover { box-shadow: var(--shadow-neutral-hover); }
  a[data-axis26-lb][data-appearance='outline']:not([aria-disabled='true']):hover { background-color: var(--color-flat-hover); }
}
a[data-axis26-lb][data-appearance='filled']:not([aria-disabled='true']):active { translate: 0 var(--press-depth); box-shadow: var(--shadow-raised-press); }
a[data-axis26-lb][data-appearance='filled'][data-color='neutral']:not([aria-disabled='true']):active { box-shadow: var(--shadow-neutral-press); }
a[data-axis26-lb][data-appearance='outline']:not([aria-disabled='true']):active { translate: 0 var(--flat-press-depth); background-color: var(--color-flat-press); }
/* 押せないとき（原則1、ADR-0026・0029）。色を持つものは 40% に薄く、グレーのものは明るいグレー */
a[data-axis26-lb][aria-disabled='true'] { cursor: not-allowed; opacity: var(--disabled-opacity); }
a[data-axis26-lb][data-appearance='filled'][aria-disabled='true'] { box-shadow: none; }
a[data-axis26-lb][data-appearance='filled'][data-color='neutral'][aria-disabled='true'] {
  opacity: var(--neutral-disabled-opacity);
  background-color: var(--color-neutral-disabled);
  color: var(--color-on-neutral-disabled);
}
a[data-axis26-lb][data-appearance='outline'][data-color='neutral'][aria-disabled='true'] {
  opacity: var(--outline-neutral-disabled-opacity);
  border-color: var(--color-outline-neutral-disabled-line);
  color: var(--color-outline-neutral-disabled-text);
  background-color: var(--color-outline-neutral-disabled-fill);
}`;

// 外へ出る印と、読み上げ用の文（画面には出ない）
const ExternalMark = () => (
  <>
    <ArrowUpRightIcon />
    <span className="sr-only">（新しいタブで開きます）</span>
  </>
);

interface AnchorButtonProps extends Omit<ComponentProps<'a'>, 'color'>, ButtonVisual {
  /** 押せないとき。href を外し、role="link" と aria-disabled を付ける */
  disabled?: boolean;
  /** 測るときの目印 */
  measure?: string;
}

// 行き着く要素。どの書き方（A・C・D）も、これを描く（B は Base UI の useRender で同じものを作る）
function AnchorButton({
  appearance = 'filled',
  color = 'neutral',
  disabled,
  href,
  target,
  rel,
  className,
  children,
  measure,
  ...props
}: AnchorButtonProps) {
  const external = target === '_blank' && !disabled;
  const buttonClass = useButtonClass({ appearance, color });
  return (
    <a
      {...props}
      href={disabled ? undefined : href}
      target={disabled ? undefined : target}
      rel={external ? 'noopener noreferrer' : rel}
      role={disabled ? 'link' : undefined}
      aria-disabled={disabled || undefined}
      data-axis26-lb=""
      data-appearance={appearance}
      data-color={color}
      data-axis26-measure={measure}
      className={[buttonClass, className].filter(Boolean).join(' ')}
    >
      {children}
      {external && <ExternalMark />}
    </a>
  );
}

// A: Button に href を足す。href があると <a> になる。loading・type は、href と一緒には渡せない（型で止める）
type ButtonAProps =
  | (ButtonProps & { href?: undefined })
  | (Omit<AnchorButtonProps, 'href'> & { href: string; loading?: never; type?: never });

function ButtonA(props: ButtonAProps) {
  if (props.href !== undefined) return <AnchorButton {...props} />;
  return <Button {...props} />;
}

// B: Base UI と同じ render。渡した要素（<a>、ルーターのリンクなど）に、Button の見た目と振る舞いを重ねる
// 押せないときは、渡された要素の href を部品が外す（そのままだと、渡した側の href が勝つ）
interface RenderProps {
  href?: string;
  target?: string;
}

interface ButtonBProps extends Omit<ButtonProps, 'render'> {
  render?: ReactElement<RenderProps>;
  measure?: string;
}

function RenderedButtonB({
  render,
  appearance = 'filled',
  color = 'neutral',
  disabled,
  className,
  children,
  measure,
}: ButtonBProps & { render: ReactElement<RenderProps> }) {
  const external = render.props.target === '_blank' && !disabled;
  const buttonClass = useButtonClass({ appearance, color });
  return useRender({
    render: disabled ? cloneElement(render, { href: undefined, target: undefined }) : render,
    props: {
      className: [buttonClass, className].filter(Boolean).join(' '),
      role: disabled ? 'link' : undefined,
      'aria-disabled': disabled || undefined,
      rel: external ? 'noopener noreferrer' : undefined,
      'data-axis26-lb': '',
      'data-appearance': appearance,
      'data-color': color,
      'data-axis26-measure': measure,
      children: (
        <>
          {children}
          {external && <ExternalMark />}
        </>
      ),
    },
  });
}

function ButtonB({ render, ...props }: ButtonBProps) {
  if (render) return <RenderedButtonB render={render} {...props} />;
  return <Button {...props} />;
}

// C: Link に Button の見た目を足す。枠線のリンク（pill）と名前がぶつかるので、ボタンの形は button・button-outline
interface LinkCProps extends Omit<LinkProps, 'appearance'> {
  appearance: 'button' | 'button-outline';
  disabled?: boolean;
  measure?: string;
}

const LinkC = ({ appearance, ...props }: LinkCProps) => (
  <AnchorButton appearance={appearance === 'button' ? 'filled' : 'outline'} {...props} />
);

// D: 別の部品。href は必ず渡し、loading・type は持たない。見た目は Button と同じ定義を共有する
interface LinkButtonDProps extends Omit<AnchorButtonProps, 'href'> {
  href: string;
}

const LinkButtonD = (props: LinkButtonDProps) => <AnchorButton {...props} />;

// ── 行ごとの書き方 ──────────────────────────────────────

type Kind = 'filled' | 'outline' | 'neutral';

const visuals: Record<Kind, ButtonVisual & { label: string; href: string }> = {
  filled: { appearance: 'filled', color: 'primary', label: '実績を見る', href: '#works' },
  outline: { appearance: 'outline', color: 'neutral', label: 'ブログ', href: '#blog' },
  neutral: { appearance: 'filled', color: 'neutral', label: 'お問い合わせ', href: '#contact' },
};

const GITHUB = 'https://github.com/kazuemon';

interface Parts {
  /** ページを移るリンク（ボタンの形） */
  nav: (kind: Kind) => ReactNode;
  /** 外のサイトへ移るリンク */
  external: () => ReactNode;
  /** 押せないリンク（最後のページの「次のページ」） */
  disabled: () => ReactNode;
}

// 測った値（Chrome の CDP の Accessibility.getPartialAXTree と、キーを実際に押した結果）
interface Heard {
  label: string;
  value: string;
}

interface ApiCandidate extends Candidate {
  code: string;
  parts: Parts;
  heard: Heard[];
}

const at = (id: string, what: string) => `${id}:${what}`;

// いまの部品で近いもの。Button に onClick で移る（見た目は同じだが <button>）か、枠線のリンク（pill）
const currentParts: Parts = {
  nav: (kind) => {
    const v = visuals[kind];
    if (kind === 'outline')
      return (
        <Link appearance="outline" href={v.href} data-axis26-measure={at('現行版', kind)}>
          {v.label}
        </Link>
      );
    return (
      <Button
        appearance={v.appearance}
        color={v.color}
        data-axis26-measure={at('現行版', kind)}
        onClick={() => {
          window.location.hash = v.href;
        }}
      >
        {v.label}
      </Button>
    );
  },
  external: () => (
    <Link
      appearance="outline"
      href={GITHUB}
      target="_blank"
      rel="noopener noreferrer"
      data-axis26-measure={at('現行版', 'external')}
    >
      GitHub
      <ArrowUpRightIcon />
    </Link>
  ),
  disabled: () => (
    <Button color="primary" disabled data-axis26-measure={at('現行版', 'disabled')}>
      次のページ
    </Button>
  ),
};

const aParts: Parts = {
  nav: (kind) => {
    const { label, ...v } = visuals[kind];
    return (
      <ButtonA {...v} measure={at('A', kind)}>
        {label}
      </ButtonA>
    );
  },
  external: () => (
    <ButtonA appearance="outline" href={GITHUB} target="_blank" measure={at('A', 'external')}>
      GitHub
    </ButtonA>
  ),
  disabled: () => (
    <ButtonA color="primary" href="#page-4" disabled measure={at('A', 'disabled')}>
      次のページ
    </ButtonA>
  ),
};

const bParts: Parts = {
  nav: (kind) => {
    const { label, href, ...v } = visuals[kind];
    return (
      <ButtonB {...v} render={<a href={href} />} measure={at('B', kind)}>
        {label}
      </ButtonB>
    );
  },
  external: () => (
    <ButtonB
      appearance="outline"
      render={<a href={GITHUB} target="_blank" />}
      measure={at('B', 'external')}
    >
      GitHub
    </ButtonB>
  ),
  disabled: () => (
    <ButtonB color="primary" render={<a href="#page-4" />} disabled measure={at('B', 'disabled')}>
      次のページ
    </ButtonB>
  ),
};

const cParts: Parts = {
  nav: (kind) => {
    const v = visuals[kind];
    return (
      <LinkC
        appearance={v.appearance === 'filled' ? 'button' : 'button-outline'}
        color={v.color === 'primary' ? 'primary' : 'neutral'}
        href={v.href}
        measure={at('C', kind)}
      >
        {v.label}
      </LinkC>
    );
  },
  external: () => (
    <LinkC appearance="button-outline" href={GITHUB} target="_blank" measure={at('C', 'external')}>
      GitHub
    </LinkC>
  ),
  disabled: () => (
    <LinkC
      appearance="button"
      color="primary"
      href="#page-4"
      disabled
      measure={at('C', 'disabled')}
    >
      次のページ
    </LinkC>
  ),
};

const dParts: Parts = {
  nav: (kind) => {
    const { label, ...v } = visuals[kind];
    return (
      <LinkButtonD {...v} measure={at('D', kind)}>
        {label}
      </LinkButtonD>
    );
  },
  external: () => (
    <LinkButtonD appearance="outline" href={GITHUB} target="_blank" measure={at('D', 'external')}>
      GitHub
    </LinkButtonD>
  ),
  disabled: () => (
    <LinkButtonD color="primary" href="#page-4" disabled measure={at('D', 'disabled')}>
      次のページ
    </LinkButtonD>
  ),
};

// A〜D は、同じ要素になるので、測った値も同じ
// Chrome の CDP（Accessibility.getPartialAXTree）と、focus() してから Enter・Space を押した結果（2026-09-13）
// 名前の「GitHub」と「（」の間の空白は、画面に出ない文（sr-only）の前に Chrome が入れるもの
const linkHeard: Heard[] = [
  { label: '要素', value: '<a href>' },
  { label: '役割と名前', value: 'link「実績を見る」' },
  { label: 'Tab', value: '止まる' },
  { label: 'Enter', value: '移る' },
  { label: 'Space', value: '移らない' },
  { label: '新しいタブ', value: '開ける（href がある）' },
  { label: '外へ出る', value: 'link「GitHub （新しいタブで開きます）」' },
  { label: '押せないとき', value: 'link・使用不可。Tab では止まらない' },
];

const apis: ApiCandidate[] = [
  {
    id: '現行版',
    name: '作れない（近いもの）',
    intent:
      'いまはボタンの形のリンクを作れない。Button に onClick で移る書き方は、見た目は同じだが中身は <button> で、新しいタブで開けず、移る先の URL も出ない。枠線のリンクは <a> だが、pill で塗りがない。',
    spec: [
      ['要素', '<button>（onClick）か、枠線のリンク'],
      ['見た目', 'Button と同じ／pill'],
      ['loading', 'Button なら持てる'],
    ],
    code: `<Button onClick={() => navigate('/works')}>
  実績を見る
</Button>

<Link appearance="outline" href="/blog">
  ブログ
</Link>`,
    parts: currentParts,
    heard: [
      { label: '要素', value: '<button>／<a href>（pill）' },
      { label: '役割と名前', value: 'button「実績を見る」' },
      { label: 'Tab', value: '止まる' },
      { label: 'Enter', value: '押せる（どちらも）' },
      { label: 'Space', value: '<button> は押せる。枠線のリンクは移らない' },
      { label: '新しいタブ', value: '開けない（href がない）' },
      { label: '外へ出る', value: 'link「GitHub」（新しいタブのことは読まれない）' },
      { label: '押せないとき', value: 'button・使用不可。Tab では止まらない' },
    ],
  },
  {
    id: 'A',
    name: 'Button に href',
    intent:
      '1つの部品で済み、Button と同じ appearance・color で書ける。href を渡すと <a> になる。型を「ボタン」と「リンク」に分け、loading と type は href と一緒に渡せないようにする。ルーターのリンク（Next.js の Link など）を使うには、別の口が要る。',
    spec: [
      ['部品', 'Button だけ'],
      ['loading', 'href と一緒には型エラー'],
      ['ルーター', '別の口が要る（Provider など）'],
    ],
    code: `<Button href="/works" color="primary">
  実績を見る
</Button>

<Button href={GITHUB} target="_blank">
<Button href="/page/4" disabled>`,
    parts: aParts,
    heard: linkHeard,
  },
  {
    id: 'B',
    name: 'Button に render（Base UI の形）',
    intent:
      'Base UI の部品と同じ書き方。渡した <a> やルーターのリンクに、Button の見た目を重ねる。書き方は長い。渡す要素しだいで振る舞いが変わり、loading を型で止められない。押せないときは、部品が渡された要素の href を外す。',
    spec: [
      ['部品', 'Button だけ'],
      ['loading', '型では止められない（部品が無視する）'],
      ['ルーター', 'そのまま渡せる'],
    ],
    code: `<Button
  color="primary"
  render={<a href="/works" />}
>
  実績を見る
</Button>

<Button render={<NextLink href="/works" />}>`,
    parts: bParts,
    heard: linkHeard,
  },
  {
    id: 'C',
    name: 'Link に Button の見た目',
    intent:
      '「移るものは Link」という分け方が保てる。ただし、角 12px のリンクができるので、原則5（リンクは pill）の例外になる。枠線のリンク（pill の outline）と、枠線のボタンの形（角 12px）の名前もぶつかる。Link の color には danger・surface がない。',
    spec: [
      ['部品', 'Link'],
      ['appearance', 'text・outline・button・button-outline'],
      ['loading', '持たない'],
      ['ルーター', 'Link と同じ（いまは <a> だけ）'],
    ],
    code: `<Link
  appearance="button"
  color="primary"
  href="/works"
>
  実績を見る
</Link>

<Link appearance="button-outline" href="/blog">`,
    parts: cParts,
    heard: linkHeard,
  },
  {
    id: 'D',
    name: '別の部品 LinkButton',
    intent:
      '型がいちばん素直。href は必ず渡し、loading・type は持たない。部品が1つ増え、Button と指定をそろえ続ける必要がある。見た目は Button と同じ定義を共有する。',
    spec: [
      ['部品', 'LinkButton を足す'],
      ['loading', '持たない'],
      ['ルーター', '別の口が要る（A と同じ）'],
    ],
    code: `<LinkButton href="/works" color="primary">
  実績を見る
</LinkButton>

<LinkButton href={GITHUB} target="_blank">
<LinkButton href="/page/4" disabled>`,
    parts: dParts,
    heard: linkHeard,
  },
];

const apiColumns: Column[] = [
  {
    label: '見た目（Button と並べる）',
    note: '上がマウス用、下が指用。左が本物の Button、右がこの行の書き方。上から塗り（青）・枠線・グレー',
  },
  {
    label: '外へ出る・押せないとき',
    note: 'GitHub は別のサイト（新しいタブ）。「次のページ」は最後のページで押せない',
  },
  {
    label: '書き方と読み上げ',
    note: '下の値は Chrome で測ったもの（読み上げに渡る役割と名前、キーを押した結果）',
  },
];

const kinds: Kind[] = ['filled', 'outline', 'neutral'];

const LooksCell = ({ parts }: { parts: Parts }) => (
  <BothDensities>
    <div className="grid grid-cols-2 items-center justify-items-start gap-x-3 gap-y-2">
      <span className="text-xs text-fg-subtle">Button</span>
      <span className="text-xs text-fg-subtle">リンク</span>
      {kinds.map((kind) => {
        const { label, href: _href, ...v } = visuals[kind];
        return [
          <Button key={`${kind}-button`} {...v}>
            {label}
          </Button>,
          <span key={`${kind}-link`} className="contents">
            {parts.nav(kind)}
          </span>,
        ];
      })}
    </div>
  </BothDensities>
);

const EdgeCell = ({ parts }: { parts: Parts }) => (
  <BothDensities>
    <div className="flex flex-wrap items-center gap-3">
      {parts.external()}
      {parts.disabled()}
    </div>
  </BothDensities>
);

const CodeCell = ({ candidate }: { candidate: ApiCandidate }) => (
  <div className="flex flex-col gap-4">
    <pre className="rounded-lg bg-field px-3 py-2 font-mono text-xs leading-5 [overflow-wrap:anywhere] whitespace-pre-wrap">
      {candidate.code}
    </pre>
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-l-2 border-line pl-3 text-xs leading-5">
      {candidate.heard.map(({ label, value }) => [
        <dt key={`${label}-dt`} className="text-fg-subtle">
          {label}
        </dt>,
        <dd key={`${label}-dd`}>{value}</dd>,
      ])}
    </dl>
  </div>
);

// ── ストーリー ────────────────────────────────────────

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/26 リンクの残り',
  id: 'design-review-26-link-rest',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const FullWidth: Story = {
  name: '幅いっぱいの枠線のリンク',
  args: { pick: 'A,B,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
  render: ({ pick }) => (
    <>
      <style>{fullCss}</style>
      <Comparison
        index={26}
        axis="リンクの残り: 幅いっぱいの枠線のリンク"
        pick={pick}
        candidates={aligns}
        columns={fullColumns}
        renderCell={(column, candidate) => {
          const align = aligns.find((c) => c.id === candidate.id)?.real;
          if (column.label === 'SNS のアカウント一覧（2列）') return <TwoColumns align={align} />;
          if (column.label === '1列の一覧（スマートフォンの幅）')
            return <OneColumn align={align} />;
          return <CardsMore align={align} />;
        }}
      >
        <p>
          決定: A を既定にし、B・C も選べるようにしました（ADR-0046、Link の contentAlign）。A・B・C
          の行は部品で描いています。現行版と D は、比べたときの組み立てです。
        </p>
        <p>
          1回目。ADR-0039
          で残した1つめです。枠線のリンクを幅いっぱいに広げると、いまは中身が左に寄り、右側が空きます。中身の寄せ方を選びます。
        </p>
        <p>
          大きさ（ADR-0039）、色（ADR-0028）、hover
          と押下（ADR-0027）、フォーカスの線（ADR-0031）は決まっていて、どの案も同じです。幅いっぱいでないときは、どの案も今と同じ見た目です。
        </p>
        <p>
          参照画像（旧ポートフォリオ）の SNS のボタンは、サービスのアイコンと文字が左、↗
          が右端です。WORKS の More も、文字が左で、矢印が右端です。B がこの形です。
        </p>
        <p>
          ADR-0039 の
          D（横長）も、アイコンを右端に置いていました。あのときは、小さい高さと最小の幅と一緒に比べ、採りませんでした。今回は大きさを変えず、幅いっぱいに広げたときの寄せ方だけを比べます。
        </p>
        <p>文字と枠線の色の比は、グレー 6.87:1・ピンク 4.54:1（白地）で、どの案も同じです。</p>
        <p>
          並べたときに縦がそろうか、1本だけのときに落ち着いて見えるかを見てください。判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
        </p>
      </Comparison>
    </>
  ),
};

export const ButtonLink: Story = {
  name: 'ボタンの形のリンク',
  args: { pick: 'B' },
  argTypes: {
    pick: {
      description: '採用した書き方（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
  render: ({ pick }) => (
    <>
      <style>{anchorCss}</style>
      <Comparison
        index={26}
        axis="リンクの残り: ボタンの形のリンク"
        pick={pick}
        candidates={apis}
        columns={apiColumns}
        renderCell={(column, candidate) => {
          const found = apis.find((c) => c.id === candidate.id);
          if (!found) return null;
          if (column.label === '見た目（Button と並べる）')
            return <LooksCell parts={found.parts} />;
          if (column.label === '外へ出る・押せないとき') return <EdgeCell parts={found.parts} />;
          return <CodeCell candidate={found} />;
        }}
      >
        <p>
          決定: 書き方は B（render）です。塗りを含む Button
          のすべての見た目をリンクにでき、リンクには ↗
          を必ず付けます（ADR-0046）。行は比べたときのままで、↗
          は外へ出るリンクにだけ付いています。部品で描いたものは「実装したリンク」にあります。
        </p>
        <p>
          1回目。ADR-0039
          で残した2つめです。「広い範囲が要るときはボタンを使う」と決めましたが、いまの Button は
          &lt;button&gt; だけで、href
          を持てません。ページを移るリンクを、ボタンの形で描く方法を選びます。
        </p>
        <p>
          A〜D は、どれも Button と同じ見た目の &lt;a&gt;
          になります。違うのは書き方と型です。読み上げでは link
          と読まれ、新しいタブでも開けます。現行版は、いまの部品で近いものです。
        </p>
        <p>
          いまの Button の hover・押下・押せないときの見た目は、&lt;a&gt;
          には効きません。このストーリーでは同じ値を足して描いています。部品を直すときに、あわせて直します。
        </p>
        <p>書き方のほかに、次の4つのルールも決めます。行はどれも「ア」で描いています。</p>
        <ol className="flex list-decimal flex-col gap-1 pl-5">
          <li>
            キーボード。ア: リンクのまま、Enter で移る（Space はページのスクロール）。イ:
            見た目がボタンなので、Space でも移る。
          </li>
          <li>
            押せないとき。ア: href を外し、使用不可のリンクにする（Tab では止まらない）。イ:
            同じ見た目で、Tab では止まる。ウ: リンクには押せない状態を持たせない（Button
            か文字にする）。
          </li>
          <li>
            外へ出る印（↗）。ア: 新しいタブで開くとき、部品が文字の後ろに ↗
            を付け、読み上げに「新しいタブで開きます」を足す。イ: 利用者が付ける。ウ: 付けない。
          </li>
          <li>
            送信中（loading）。ページを移るリンクには持たせません。回る円は、移り終わるまでの目安になりません。
          </li>
        </ol>
        <p>
          書き方（A〜D）を1つと、1〜3のルールそれぞれに、ア〜ウのどれにするかを選んで、一言添えてください。
        </p>
      </Comparison>
    </>
  ),
};

// ── 実装したリンク ────────────────────────────────────
// Next.js の Link のまね。受け取った props と ref を、そのまま <a> に渡す（next/link と同じ）
// prefetch は、この部品だけが読む props（渡した props が部品まで届くかを確かめる）
type FakeNextLinkProps = Omit<ComponentProps<'a'>, 'href'> & { href: string; prefetch?: boolean };

const FakeNextLink = ({ href, prefetch = true, ref, ...props }: FakeNextLinkProps) => (
  <a {...props} ref={ref} href={href} data-next-link="" data-prefetch={String(prefetch)} />
);

// ref が <a> に届いたかを、要素の印で見る
const markRef = (element: HTMLAnchorElement | null) => {
  if (element) element.dataset.refTag = element.tagName.toLowerCase();
};

type Appearance = NonNullable<ButtonProps['appearance']>;
type Color = NonNullable<ButtonProps['color']>;

const looks: [Appearance, Color, string][] = [
  ['filled', 'primary', '塗り・青'],
  ['filled', 'secondary', '塗り・ピンク'],
  ['filled', 'danger', '塗り・赤'],
  ['filled', 'neutral', '塗り・グレー'],
  ['filled', 'white', '塗り・白'],
  ['outline', 'primary', '枠線・青'],
  ['outline', 'secondary', '枠線・ピンク'],
  ['outline', 'danger', '枠線・赤'],
  ['outline', 'neutral', '枠線・グレー'],
];

const twinHeads = ['', 'Button', '<a>（render）', 'NextLink（render）', '新しいタブで開く'];

const ButtonLinks = () => (
  <BothDensities>
    <div className="grid grid-cols-[repeat(5,auto)] items-center justify-start justify-items-start gap-x-4 gap-y-2">
      {twinHeads.map((head) => (
        <span key={head} className="text-xs text-fg-subtle">
          {head}
        </span>
      ))}
      {looks.map(([appearance, color, label]) => {
        const id = `${appearance}-${color}`;
        const look = { appearance, color };
        return [
          <span key={`${id}-label`} className="text-xs text-fg-subtle">
            {label}
          </span>,
          <Button key={`${id}-button`} {...look} data-axis26-twin={`${id}:button`}>
            実績を見る
          </Button>,
          <Button
            key={`${id}-a`}
            {...look}
            render={<a href={`#${id}`} data-axis26-twin={`${id}:a`} />}
          >
            実績を見る
          </Button>,
          <Button
            key={`${id}-next`}
            {...look}
            render={
              <FakeNextLink
                href={`#${id}-next`}
                prefetch={false}
                ref={markRef}
                data-axis26-twin={`${id}:next`}
              />
            }
          >
            実績を見る
          </Button>,
          <Button
            key={`${id}-blank`}
            {...look}
            render={<a href={GITHUB} target="_blank" data-axis26-twin={`${id}:blank`} />}
          >
            GitHub
          </Button>,
        ];
      })}
    </div>
  </BothDensities>
);

// 押せないリンク（disabled — ADR-0046 の決定のあと）。押せるものと並べる
// 押せないリンクは、渡した要素（NextLink）を描かず、href のない <a role="link" aria-disabled="true"> になる
// onClick は、押しても呼ばれないことを確かめる印（呼ばれると data-clicked が付く）
const markClick = (event: MouseEvent<HTMLElement>) => {
  event.currentTarget.dataset.clicked = 'yes';
};

const disabledLooks: [Appearance, Color, string][] = [
  ['filled', 'primary', '塗り・青'],
  ['filled', 'neutral', '塗り・グレー'],
  ['outline', 'primary', '枠線・青'],
  ['outline', 'neutral', '枠線・グレー'],
];

const disabledHeads = [
  '',
  'Button',
  'Button（disabled）',
  'NextLink（render）',
  'NextLink（render・disabled）',
];

const DisabledButtonLinks = () => (
  <BothDensities>
    <div className="grid grid-cols-[repeat(5,auto)] items-center justify-start justify-items-start gap-x-4 gap-y-2">
      {disabledHeads.map((head) => (
        <span key={head} className="text-xs text-fg-subtle">
          {head}
        </span>
      ))}
      {disabledLooks.map(([appearance, color, label]) => {
        const id = `${appearance}-${color}`;
        const look = { appearance, color };
        const page = (key: string) => (
          <FakeNextLink
            href={`#${id}-page`}
            prefetch={false}
            ref={markRef}
            data-axis26-disabled={`${id}:${key}`}
          />
        );
        return [
          <span key={`${id}-label`} className="text-xs text-fg-subtle">
            {label}
          </span>,
          <Button key={`${id}-button`} {...look} data-axis26-disabled={`${id}:button`}>
            次のページ
          </Button>,
          <Button
            key={`${id}-button-off`}
            {...look}
            disabled
            data-axis26-disabled={`${id}:button-off`}
          >
            次のページ
          </Button>,
          <Button key={`${id}-next`} {...look} render={page('next')}>
            次のページ
          </Button>,
          <Button
            key={`${id}-next-off`}
            {...look}
            disabled
            onClick={markClick}
            render={page('next-off')}
          >
            次のページ
          </Button>,
        ];
      })}
    </div>
  </BothDensities>
);

type LinkAppearance = NonNullable<LinkProps['appearance']>;
type LinkColor = NonNullable<LinkProps['color']>;

const disabledLinkLooks: [LinkAppearance, LinkColor, string][] = [
  ['text', 'primary', '文字・青'],
  ['text', 'neutral', '文字・グレー'],
  ['outline', 'neutral', '枠線・グレー'],
  ['outline', 'secondary', '枠線・ピンク'],
];

const DisabledLinks = () => (
  <BothDensities>
    <div className="grid grid-cols-[repeat(3,auto)] items-center justify-start justify-items-start gap-x-4 gap-y-2">
      {['', 'NextLink（render）', 'NextLink（render・disabled）'].map((head) => (
        <span key={head} className="text-xs text-fg-subtle">
          {head}
        </span>
      ))}
      {disabledLinkLooks.map(([appearance, color, label]) => {
        const id = `link-${appearance}-${color}`;
        const link = (key: string, disabled?: boolean) => (
          <Link
            key={`${id}-${key}`}
            appearance={appearance}
            color={color}
            disabled={disabled}
            onClick={disabled ? markClick : undefined}
            render={<FakeNextLink href={`#${id}`} data-axis26-disabled={`${id}:${key}`} />}
          >
            {appearance === 'outline' ? 'More' : 'ブログ'}
            {appearance === 'outline' && <CaretRightIcon />}
          </Link>
        );
        return [
          <span key={`${id}-label`} className="text-xs text-fg-subtle">
            {label}
          </span>,
          link('next'),
          link('next-off', true),
        ];
      })}
    </div>
  </BothDensities>
);

// 文字のリンク（ADR-0046 の決定のあと）。同じタブ・新しいタブ・押せないを、段落の中で並べる
// 新しいタブで開くときだけ、部品が文字の後ろに ↗ を付け、読み上げに「新しいタブで開きます」を足す
// 同じタブで開くリンクには付けない。狭い段落では、↗ が最後の語と一緒に折り返す
// 押せない文字のリンクは、ただの文字と同じ見た目（下線・↗ なし、色は周りの文字のまま）
const textCases: [string, string, ReactNode][] = [
  [
    '同じタブ',
    'same',
    <>
      制作の記録は
      <Link color="primary" href="#blog" data-axis26-text="case:same">
        ブログ
      </Link>
      にまとめています。
    </>,
  ],
  [
    '新しいタブ',
    'blank',
    <>
      コードは
      <Link color="primary" href={GITHUB} target="_blank" data-axis26-text="case:blank">
        GitHub のリポジトリ
      </Link>
      にまとめています。
    </>,
  ],
  [
    '押せない',
    'same-off',
    <>
      制作の記録は
      <Link color="primary" href="#blog" disabled data-axis26-text="case:same-off">
        ブログ
      </Link>
      にまとめています。
    </>,
  ],
  [
    '押せない・新しいタブ',
    'blank-off',
    <>
      コードは
      <Link
        color="primary"
        href={GITHUB}
        target="_blank"
        disabled
        data-axis26-text="disabled:blank"
      >
        GitHub のリポジトリ
      </Link>
      にまとめています。
    </>,
  ],
  [
    '押せない（灰色の文の中）',
    'muted-off',
    <span key="muted-off" className="text-fg-muted">
      制作の記録は
      <Link href="#blog" disabled data-axis26-text="case:muted-off">
        ブログ
      </Link>
      にまとめています。
    </span>,
  ],
];

const TextLinkCases = () => (
  <div className="grid grid-cols-[auto_1fr] items-baseline justify-start gap-x-6 gap-y-2">
    {textCases.map(([label, key, sentence]) => [
      <span key={`${key}-label`} className="text-xs text-fg-subtle">
        {label}
      </span>,
      <p key={key} className="text-sm leading-6">
        {sentence}
      </p>,
    ])}
  </div>
);

const NewTabParagraph = ({ id, className }: { id: string; className?: string }) => (
  <p className={['text-sm leading-6', className].filter(Boolean).join(' ')}>
    制作の記録は
    <Link color="primary" href="#blog" data-axis26-text={`${id}:same`}>
      ブログ
    </Link>
    に、コードは
    <Link color="primary" href={GITHUB} target="_blank" data-axis26-text={`${id}:blank`}>
      GitHub のリポジトリ
    </Link>
    にまとめています。
  </p>
);

const TextLinks = () => (
  <div className="flex flex-col gap-4">
    <TextLinkCases />
    <div className="flex flex-col gap-1">
      <span className="text-xs text-fg-subtle">同じタブと新しいタブを1つの段落に</span>
      <NewTabParagraph id="wide" className="max-w-[40em]" />
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-xs text-fg-subtle">狭い段落（幅 14em）</span>
      <NewTabParagraph id="narrow" className="w-[14em] rounded-sm outline outline-line" />
    </div>
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm leading-6">
      <span>
        NextLink（render）・新しいタブ:{' '}
        <Link
          color="primary"
          render={<FakeNextLink href={GITHUB} target="_blank" data-axis26-text="next:blank" />}
        >
          GitHub
        </Link>
      </span>
    </div>
  </div>
);

// 枠線のリンクの新しいタブ（ADR-0046 の決定のあと）。アイコンを置いたときはそれを使い、アイコンがない新しいタブなら部品が ↗ を付ける
// 読み上げの「新しいタブで開きます」は、アイコンにかかわらず、新しいタブで開くリンクすべてに足す
const outlineCases: [string, string, ReactNode][] = [
  [
    'アイコンを置いた・新しいタブ（›）',
    'icon-caret',
    <Link
      appearance="outline"
      color="secondary"
      href={GITHUB}
      target="_blank"
      key="icon-caret"
      data-axis26-outline="icon-caret"
    >
      More
      <CaretRightIcon />
    </Link>,
  ],
  [
    'アイコンを置いた・新しいタブ（↗）',
    'icon-arrow',
    <Link
      appearance="outline"
      href={GITHUB}
      target="_blank"
      key="icon-arrow"
      data-axis26-outline="icon-arrow"
    >
      GitHub
      <ArrowUpRightIcon />
    </Link>,
  ],
  [
    'アイコンなし・新しいタブ',
    'auto',
    <Link appearance="outline" href={GITHUB} target="_blank" key="auto" data-axis26-outline="auto">
      GitHub
    </Link>,
  ],
  [
    'アイコンなし・同じタブ',
    'same',
    <Link appearance="outline" href="#blog" key="same" data-axis26-outline="same">
      ブログ
    </Link>,
  ],
];

// 子が1つだけのとき（ADR-0046 の「分かっていること」）。子が1つだけなら、アイコンでもアイコンとみなさない
// 新しいタブで開くなら、文字だけでもアイコンだけでも ↗ を足す。子が2つ以上で最後が要素なら、アイコンとみなして足さない
// アイコンだけのリンクは、Link に aria-label で名前を付ける
const singleChildRows: [string, string, (blank: boolean) => ReactNode][] = [
  ['文字だけ（子が1つ）', 'text', (blank) => (blank ? 'GitHub' : 'ブログ')],
  ['アイコンだけ（子が1つ）', 'icon', () => <InfoIcon />],
  // 子を1つの Fragment にまとめると、子が1つに見える。配列で渡す
  ['文字とアイコン（子が2つ）', 'both', () => ['More', <CaretRightIcon key="icon" />]],
];

const SingleChildLinks = () => (
  <BothDensities>
    <div className="grid grid-cols-[repeat(3,auto)] items-center justify-start justify-items-start gap-x-6 gap-y-2">
      {['', '同じタブ', '新しいタブ'].map((head) => (
        <span key={head} className="text-xs text-fg-subtle">
          {head}
        </span>
      ))}
      {singleChildRows.map(([label, key, content]) => [
        <span key={`${key}-label`} className="text-xs text-fg-subtle">
          {label}
        </span>,
        ...[false, true].map((blank) => (
          <Link
            key={`${key}-${blank ? 'blank' : 'same'}`}
            appearance="outline"
            href={blank ? GITHUB : '#blog'}
            target={blank ? '_blank' : undefined}
            aria-label={key === 'icon' ? '使い方' : undefined}
            data-axis26-single={`${key}:${blank ? 'blank' : 'same'}`}
          >
            {content(blank)}
          </Link>
        )),
      ])}
    </div>
  </BothDensities>
);

const OutlineNewTabLinks = () => (
  <BothDensities>
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
      {outlineCases.map(([label, key, link]) => (
        <div key={key} className="flex flex-col items-start gap-1">
          <span className="text-xs text-fg-subtle">{label}</span>
          {link}
        </div>
      ))}
    </div>
    <div className="grid w-full max-w-[26rem] grid-cols-2 gap-3">
      <Link
        appearance="outline"
        contentAlign="between"
        href={GITHUB}
        target="_blank"
        className="w-full"
        data-axis26-outline="between-auto"
      >
        GitHub
      </Link>
      <Link
        appearance="outline"
        contentAlign="center-end"
        href={GITHUB}
        target="_blank"
        className="w-full"
        data-axis26-outline="center-end-auto"
      >
        GitHub
      </Link>
    </div>
  </BothDensities>
);

const contentAligns: [LinkContentAlign, string][] = [
  ['center', 'center（既定・A）'],
  ['between', 'between（B）'],
  ['center-end', 'center-end（C）'],
];

const AlignedLinks = ({ align }: { align: LinkContentAlign }) => (
  <BothDensities>
    <div className="grid grid-cols-2 gap-3">
      {accounts.map((account) => (
        <Link
          key={account}
          appearance="outline"
          contentAlign={align}
          href={`#${account}`}
          className="w-full"
          data-axis26-align={`${align}:${account}`}
        >
          {account}
          <ArrowUpRightIcon />
        </Link>
      ))}
    </div>
    <Link
      appearance="outline"
      color="secondary"
      contentAlign={align}
      href="#works"
      className="w-full"
      data-axis26-align={`${align}:more`}
    >
      More
      <CaretRightIcon />
    </Link>
    <div className="flex">
      <Link
        appearance="outline"
        contentAlign={align}
        href="#github"
        data-axis26-align={`${align}:auto`}
      >
        GitHub
        <ArrowUpRightIcon />
      </Link>
    </div>
  </BothDensities>
);

export const Implemented: Story = {
  name: '実装したリンク',
  render: () => (
    <div className="flex min-h-screen flex-col gap-8 bg-bg px-6 py-8 text-fg">
      <header className="flex max-w-[68ch] flex-col gap-2">
        <h1 className="text-2xl font-heading">実装したリンク</h1>
        <p className="text-sm leading-6 text-fg-muted">
          Button の render と、Link の contentAlign・render
          です（ADR-0046）。文字のリンク（同じタブ・新しいタブ・押せない）、新しいタブで開く枠線のリンク、押せないリンク（disabled）も並べています。上下に2つあるものは、上がマウス用、下が指用です。
        </p>
      </header>
      <section className="flex flex-col gap-3 border-t border-line pt-6">
        <h2 className="text-sm font-bold">ボタンの見た目のリンク（Button の render）</h2>
        <p className="max-w-[68ch] text-xs leading-5 text-fg-muted">
          左の Button と見た目は同じで、要素だけが &lt;a&gt; です。リンクには ↗
          が必ず付きます。NextLink は next/link のまね（props と ref を &lt;a&gt;
          に渡す部品）です。新しいタブで開くリンクは、読み上げに「新しいタブで開きます」が足されます。
        </p>
        <ButtonLinks />
      </section>
      <section className="flex flex-col gap-3 border-t border-line pt-6">
        <h2 className="text-sm font-bold">文字のリンク</h2>
        <p className="max-w-[68ch] text-xs leading-5 text-fg-muted">
          同じタブで開くリンクは、下線だけです。新しいタブで開くときだけ、部品が文字の後ろに ↗
          を付け、読み上げに「新しいタブで開きます」を足します。↗
          は最後の語と一緒に折り返します。押せない文字のリンクは、ただの文字と同じ見た目です。下線も
          ↗ も付かず、色は周りの文字のままです（灰色の文の中なら灰色）。
        </p>
        <TextLinks />
      </section>
      <section className="flex flex-col gap-3 border-t border-line pt-6">
        <h2 className="text-sm font-bold">新しいタブで開く枠線のリンク</h2>
        <p className="max-w-[68ch] text-xs leading-5 text-fg-muted">
          アイコンを置いたときは、それを使います（› でも ↗ でも、↗
          は足しません）。アイコンがない新しいタブのリンクには、部品が ↗
          を付けます。同じタブで開くリンクには付けません。読み上げの「新しいタブで開きます」は、新しいタブで開くリンクすべてに足します。下の2つは、幅いっぱいの
          between・center-end で、部品が付けた ↗ も右端に来ます。
        </p>
        <OutlineNewTabLinks />
        <h3 className="pt-2 text-xs font-bold">子が1つだけのとき</h3>
        <p className="max-w-[68ch] text-xs leading-5 text-fg-muted">
          部品は、子が2つ以上で、最後の子が要素のときだけ、それをアイコンとみなします。子が1つだけのときは、アイコンでもアイコンとみなしません。そのため、新しいタブで開くなら、文字だけでもアイコンだけでも
          ↗ が付きます（アイコンだけのときは、アイコンの後ろに ↗ が並びます）。最後の子が
          ArrowUpRightIcon なら、どの形でも ↗ は足しません。アイコンだけのリンクは、Link に
          aria-label で名前を付けています。
        </p>
        <SingleChildLinks />
      </section>
      <section className="flex flex-col gap-3 border-t border-line pt-6">
        <h2 className="text-sm font-bold">押せないリンク（disabled）</h2>
        <p className="max-w-[68ch] text-xs leading-5 text-fg-muted">
          押せないリンクは、渡した要素（NextLink）を描かず、href のない &lt;a role="link"
          aria-disabled="true"&gt; になります。Tab
          では止まらず、押しても何もしません。読み上げでは「リンク、利用不可」です。ボタンの見た目のリンクは
          &lt;Button disabled&gt; と同じ見た目で、↗
          は残ります。枠線のリンクは、色にかかわらず、押せないグレーの枠線のボタンと同じ色（文字
          #A3A5A6、枠線
          #DEE0E1）になります。文字のリンクは、ただの文字と同じ見た目です（下の「文字・青」「文字・グレー」の右。段落の中の例は「文字のリンク」にあります）。
        </p>
        <DisabledButtonLinks />
        <DisabledLinks />
      </section>
      <section className="flex flex-col gap-3 border-t border-line pt-6">
        <h2 className="text-sm font-bold">幅いっぱいの枠線のリンク（Link の contentAlign）</h2>
        <p className="max-w-[68ch] text-xs leading-5 text-fg-muted">
          最後の GitHub は、幅が中身で決まるときです。center と between は同じ見た目で、center-end
          は左にアイコンと隙間の幅が空きます。
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          {contentAligns.map(([align, label]) => (
            <div key={align} className="flex flex-col gap-2">
              <h3 className="text-xs font-bold">{label}</h3>
              <AlignedLinks align={align} />
            </div>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-3 border-t border-line pt-6">
        <h2 className="text-sm font-bold">Link の render（Next.js の Link）</h2>
        <BothDensities>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              appearance="outline"
              color="secondary"
              render={<FakeNextLink href="#works-next" ref={markRef} />}
              data-axis26-link-next="outline"
            >
              More
              <CaretRightIcon />
            </Link>
            <Link
              color="primary"
              render={<FakeNextLink href="#blog-next" />}
              data-axis26-link-next="text"
            >
              ブログ
            </Link>
          </div>
        </BothDensities>
      </section>
    </div>
  ),
};

// ── 3. 文字のリンクの ↗ の大きさ（決定のあと） ─────────────
// 4回目のメモ（「矢印のサイズ、ちょっと比較してみてみたいです。」）を受けて、↗ の大きさだけを比べ直す
// 行の違いは、トークン --link-external-icon-size の値だけ（どの行も上書きする。現行版は比べたときの 0.8em。C の 0.85em に決まった）
//   部品が、下線の幅（↗ の線の右端まで）・重ねる量・下げる量（線の下端を基線に）をこの値から計算する
// 線は ADR-0018 の Regular（viewBox 256 に対して 16）のまま。箱と一緒に大きさが変わるので、↗ が小さいほど細い
// 測った値（Chrome の 1 倍の canvas。本文の英字 Mulish）: 14px で x の高さ 8px・l の縦の線 1.12px、16px で 9px・1.25px
//   矢印の高さ（線の端から端まで）は、箱の 144/256

const round2 = (n: number) => Number(n.toFixed(2));

// ↗ の箱の大きさと、線の太さ（箱の 16/256）
const arrowPx = (em: number, text: number) =>
  `${round2(em * text)}px・線 ${round2((em * text * 16) / 256)}px`;

const arrowCandidate = (id: string, name: string, em: number, intent: string): Candidate => ({
  id,
  name,
  intent,
  tokens: { '--link-external-icon-size': `${em}em` },
  spec: [
    ['大きさ', `${em}em`],
    ['14px の文字', arrowPx(em, 14)],
    ['16px の文字', arrowPx(em, 16)],
  ],
});

const arrowSizes: Candidate[] = [
  arrowCandidate(
    '現行版',
    'いまの大きさ',
    0.8,
    '3回目のメモのあと、0.75・0.8・0.85em を並べて選んだ大きさ。矢印の高さは 14px の文字で 6.3px で、英字の x（8px）の8割ほど。'
  ),
  arrowCandidate(
    'A',
    'かなり小さい',
    0.7,
    'いちばん小さい。印として控えめで、文の流れを止めない。矢印の高さは 5.5px（x の7割）。線は本文の英字の縦の線の半分ほどで、淡く見える。'
  ),
  arrowCandidate(
    'B',
    '少し小さい',
    0.75,
    '前回並べた下の案。前回は、文字に比べて小さく見えるとして選ばなかった。矢印の高さは 5.9px。'
  ),
  arrowCandidate(
    'C',
    '少し大きい',
    0.85,
    '前回並べた上の案。前回は、1em との違いが分かりにくいとして選ばなかった。矢印の高さは 6.7px。'
  ),
  arrowCandidate(
    'D',
    '大きい',
    0.9,
    '矢印の高さは 7.1px で、英字の x（8px）に近い。印ははっきりするが、文の中で少し目立つ。'
  ),
  arrowCandidate(
    'E',
    '文字と同じ（3回目のメモの前）',
    1,
    '3回目のメモの前の大きさ。矢印の高さは 7.9px で、英字の x とほぼ同じ。前は矢印の中心を文字の中心にそろえ、↗ の下に下線はなかった。この行は、位置と下線をいまの形で描いている。'
  ),
];

const textSizes = [
  { density: 'fine', label: 'マウス用（14px）', text: 'text-sm leading-6', zoom: 'h-18' },
  { density: 'coarse', label: '指用（16px）', text: 'text-base leading-7', zoom: 'h-21' },
] as const;

type TextSize = (typeof textSizes)[number];

const arrowColors: [LinkColor, string][] = [
  ['primary', '青'],
  ['neutral', 'グレー'],
];

// 同じタブ（ブログ）と、新しいタブ（日本語で終わる・英字で終わる）を1つの段落に
// data-axis26-arrow は測るときの目印（行:列:密度:色:リンク）
const ArrowParagraph = ({
  color,
  mark,
  className,
}: {
  color: LinkColor;
  mark: string;
  className: string;
}) => (
  <p className={className}>
    制作の記録は
    <Link color={color} href="#blog">
      ブログ
    </Link>
    に、コードは
    <Link color={color} href={GITHUB} target="_blank" data-axis26-arrow={`${mark}:repo`}>
      GitHub のリポジトリ
    </Link>
    にまとめています。質問は
    <Link color={color} href={GITHUB} target="_blank" data-axis26-arrow={`${mark}:github`}>
      GitHub
    </Link>
    の Issue へどうぞ。
  </p>
);

const ArrowParagraphs = ({ mark }: { mark: string }) => (
  <div className="flex flex-col gap-5">
    {textSizes.map((size) => (
      <div key={size.density} data-density={size.density} className="flex flex-col gap-2">
        <span className="text-xs text-fg-subtle">{size.label}</span>
        {arrowColors.map(([color]) => (
          <ArrowParagraph
            key={color}
            color={color}
            mark={`${mark}:${size.density}:${color}`}
            className={size.text}
          />
        ))}
      </div>
    ))}
  </div>
);

// 3 倍に拡大。↗ のまわり（段落の右端）を、切り抜いた箱に描く。左ははみ出して切れる
// hover 中の箱は、その箱にだけ data-preview="hover" を付けて、状態を固定する
const ZoomedArrow = ({ size, hover, mark }: { size: TextSize; hover?: boolean; mark: string }) => (
  <div
    data-preview={hover ? 'hover' : undefined}
    className={`${size.zoom} flex justify-end overflow-hidden rounded-sm outline outline-line`}
  >
    <p className={`${size.text} shrink-0 origin-top-right scale-300 pe-1 whitespace-nowrap`}>
      コードは
      <Link color="primary" href={GITHUB} target="_blank" data-axis26-arrow={mark}>
        リポジトリ
      </Link>
      に
    </p>
  </div>
);

const ZoomedArrows = ({ mark }: { mark: string }) => (
  <div className="flex flex-col gap-5">
    {textSizes.map((size) => (
      <div key={size.density} data-density={size.density} className="flex flex-col gap-2">
        <span className="text-xs text-fg-subtle">{size.label}</span>
        <ZoomedArrow size={size} mark={`${mark}:${size.density}:rest`} />
        <ZoomedArrow size={size} hover mark={`${mark}:${size.density}:hover`} />
      </div>
    ))}
  </div>
);

const NarrowArrowParagraphs = ({ mark }: { mark: string }) => (
  <div className="flex flex-col gap-5">
    {textSizes.map((size) => (
      <div key={size.density} data-density={size.density} className="flex flex-col gap-2">
        <span className="text-xs text-fg-subtle">{size.label}</span>
        <ArrowParagraph
          color="primary"
          mark={`${mark}:${size.density}:primary`}
          className={`${size.text} w-[14em] rounded-sm outline outline-line`}
        />
      </div>
    ))}
  </div>
);

const arrowColumns: Column[] = [
  {
    label: '段落',
    note: '上がマウス用（14px）、下が指用（16px）。それぞれ青とグレー。ブログは同じタブで開くので ↗ なし',
  },
  {
    label: 'hover 中',
    note: '下線が濃くなる。↗ の下の下線も、文字の下と一緒に濃くなる',
    preview: 'hover',
  },
  {
    label: '3 倍に拡大',
    note: '↗ のまわり。上が通常、下が hover 中。拡大して描き直した形なので、線の淡さは「段落」の列で見る',
  },
  {
    label: '狭い段落（幅 14em）',
    note: '↗ は最後の語と一緒に折り返す（↗ だけが次の行に来ない）',
  },
];

const arrowColumnKeys: Record<string, string> = {
  段落: 'para',
  'hover 中': 'hover',
  '3 倍に拡大': 'zoom',
  '狭い段落（幅 14em）': 'narrow',
};

export const ArrowSize: Story = {
  name: '文字のリンクの ↗ の大きさ',
  args: { pick: 'C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D', 'E'],
    },
  },
  parameters: { pseudo: { hover: ['[data-preview="hover"] a'] } },
  render: ({ pick }) => (
    <Comparison
      index={26}
      axis="リンクの残り: 文字のリンクの ↗ の大きさ"
      pick={pick}
      candidates={arrowSizes}
      columns={arrowColumns}
      renderCell={(column, candidate) => {
        const key = arrowColumnKeys[column.label];
        const mark = `${candidate.id}:${key}`;
        if (key === 'zoom') return <ZoomedArrows mark={mark} />;
        if (key === 'narrow') return <NarrowArrowParagraphs mark={mark} />;
        return <ArrowParagraphs mark={mark} />;
      }}
    >
      <p>
        ADR-0046
        の決定のあと。4回目のメモ「矢印のサイズ、ちょっと比較してみてみたいです。」を受けて、新しいタブで開く文字のリンクの
        ↗
        の大きさだけを比べ直します。3回目のメモ（「ちょっとだけ矢印は小さくしてみてほしいです（下寄りでOK）」）のあとは、0.75・0.8・0.85em
        を並べて 0.8em にしました。今回は、その外側の 0.7・0.9em と、3回目のメモの前の 1em
        も並べます。
      </p>
      <p>
        行の違いは、トークン --link-external-icon-size
        の値だけで、どの行も部品そのもので描いています。部品は、下線の長さと ↗
        を下げる量を、この値から計算します。どの行も、↗
        の線の下端は文字の基線にそろい、下線は文字の下と同じ位置・太さ・色のまま、↗
        の線の右端まで続きます。E（1em）は大きさだけが3回目のメモの前と同じで、位置と下線はいまの形です。
      </p>
      <p>
        線の太さは、文字と並ぶアイコンの Regular（ADR-0018。ADR-0015
        を置き換えたもの）のままです。線は ↗
        と一緒に大きさが変わるので、小さくするほど細くなります。14px の文字では、0.7em で
        0.61px、0.8em で 0.7px、1em で 0.88px です。本文の英字の縦の線（l）は 14px で約 1.1px、16px
        で約 1.3px なので、どの行も線は文字より細く、0.7em
        ではおよそ半分です（太すぎる行はありません）。ADR-0018 で Regular
        にしたのは、文字の線の太さとそろうからでした。小さい案を選ぶときは、線を太くするかも一緒に決めます。
      </p>
      <p>
        「3 倍に拡大」の列は、拡大して描き直した形です。1
        倍の画面での線の淡さは、「段落」の列で見てください。上下に2つあるものは、上がマウス用（14px）、下が指用（16px）です。
      </p>
      <p>
        文の中で ↗
        が目立ちすぎないか、小さすぎて見落とさないか、文字と並べて線が浮かないかを見てください。どの大きさがよいか1つ選び、一言添えてください。
      </p>
    </Comparison>
  ),
};
