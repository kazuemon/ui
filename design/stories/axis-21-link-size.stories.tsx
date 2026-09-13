import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';

import { Button } from '../../src/components/Button';
import { CaretRightIcon } from '../../src/components/icons';
import { Link, type LinkProps } from '../../src/components/Link';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 21: リンクの大きさ（原則5・7・11）
// 色は ADR-0028、hover と押下は ADR-0027・ADR-0030、フォーカスは ADR-0031 で決まっている。変えるのは大きさだけ
// 1回目。枠線のリンクと文字のリンクで「大きさ」の意味が違うので、ストーリーを2つに分ける
// 決定は、どちらも現行版（ADR-0039）。部品の大きさは変えない。A〜D は比べた当時の値をこの中で再現している
//   枠線のリンク: 高さ・文字・左右の余白・押せる範囲（いまはボタンと同じ --size-control ほか）
//   文字のリンク: 文章の中では周りの文字に合わせる（どの案も同じ）。単独で置くときの文字と押せる範囲を比べる
// 部品はまだリンク用の寸法を持たないので、比較のためにこの中で組み立てる
//   枠線のリンク: 部品が読む --size-control などを、リンク用の値（--size-link など）に差し替える
//   押せる範囲: 見えない ::before を上下に広げる。点線の列では、その範囲を点線で描く
// どの行も、マウス用と指用を1つのセルに上下に並べる（data-density で固定）

// 密度ごとの値を、行のトークンから選ぶ（globals.css が --size-control を選ぶのと同じ仕組み）
const styles = `
.axis21 [data-density='fine'] {
  --size-link: var(--size-link-fine);
  --text-link: var(--text-link-fine);
  --leading-link: var(--leading-link-fine);
  --space-link-x: var(--space-link-x-fine);
  --size-link-icon: var(--size-link-icon-fine);
  --link-min-width: var(--link-min-width-fine);
  --size-link-hit: var(--size-link-hit-fine);
  --text-link-standalone: var(--text-link-standalone-fine);
  --leading-link-standalone: var(--leading-link-standalone-fine);
  --size-link-standalone-hit: var(--size-link-standalone-hit-fine);
}
.axis21 [data-density='coarse'] {
  --size-link: var(--size-link-coarse);
  --text-link: var(--text-link-coarse);
  --leading-link: var(--leading-link-coarse);
  --space-link-x: var(--space-link-x-coarse);
  --size-link-icon: var(--size-link-icon-coarse);
  --link-min-width: var(--link-min-width-coarse);
  --size-link-hit: var(--size-link-hit-coarse);
  --text-link-standalone: var(--text-link-standalone-coarse);
  --leading-link-standalone: var(--leading-link-standalone-coarse);
  --size-link-standalone-hit: var(--size-link-standalone-hit-coarse);
}
/* 枠線のリンク: 部品が読む寸法を、リンク用の値に差し替える */
.axis21-outline {
  --size-control: var(--size-link);
  --text-control: var(--text-link);
  --leading-control: var(--leading-link);
  --space-control-x: var(--space-link-x);
  --size-icon: var(--size-link-icon);
  position: relative;
  /* 並びの幅より広くはしない（2列の一覧で、隣の列にはみ出さない） */
  min-width: min(var(--link-min-width), 100%);
  justify-content: var(--link-justify);
}
/* 押せる範囲: 見た目の外側に、見えない面を上下に広げる（枠線 1.5px の外側まで含める） */
.axis21-outline::before {
  content: '';
  position: absolute;
  inset-inline: 0;
  top: 50%;
  height: max(var(--size-control), var(--size-link-hit));
  translate: 0 -50%;
  border-radius: 9999px;
}
.axis21-text-hit::before {
  content: '';
  position: absolute;
  inset-inline: 0;
  top: 50%;
  height: max(100%, var(--size-link-standalone-hit));
  translate: 0 -50%;
  border-radius: var(--link-text-radius);
}
[data-show-hit] .axis21-outline::before,
[data-show-hit] .axis21-text-hit::before {
  outline: 1px dashed var(--color-line-strong);
  outline-offset: -1px;
}
/* 単独で置く文字のリンクの行 */
.axis21-standalone {
  font-size: var(--text-link-standalone);
  line-height: var(--leading-link-standalone);
}`;

// ── 枠線のリンク ──────────────────────────────────────

type Sizes = [fine: string, coarse: string];

interface OutlineSize {
  height: Sizes;
  text: Sizes;
  leading: Sizes;
  spaceX: Sizes;
  icon: Sizes;
  /** 押せる範囲の高さ */
  hit: Sizes;
  minWidth?: Sizes;
  justify?: string;
}

const outlineTokens = (s: OutlineSize): Candidate['tokens'] => ({
  '--size-link-fine': s.height[0],
  '--size-link-coarse': s.height[1],
  '--text-link-fine': s.text[0],
  '--text-link-coarse': s.text[1],
  '--leading-link-fine': s.leading[0],
  '--leading-link-coarse': s.leading[1],
  '--space-link-x-fine': s.spaceX[0],
  '--space-link-x-coarse': s.spaceX[1],
  '--size-link-icon-fine': s.icon[0],
  '--size-link-icon-coarse': s.icon[1],
  '--size-link-hit-fine': s.hit[0],
  '--size-link-hit-coarse': s.hit[1],
  '--link-min-width-fine': s.minWidth?.[0] ?? '0px',
  '--link-min-width-coarse': s.minWidth?.[1] ?? '0px',
  // 並べ方は、いまの部品のまま（幅いっぱいに広げると中身は左に寄る）。D だけアイコンを右端に寄せる
  '--link-justify': s.justify ?? 'normal',
});

// 押せる範囲は、どの案もボタンと同じ高さ（マウス用 40px・指用 44px）まで広げる
const buttonHeight: Sizes = ['var(--size-control-fine)', 'var(--size-control-coarse)'];

const outlines: Candidate[] = [
  {
    id: '現行版',
    name: 'ボタンと同じ',
    intent:
      '枠線のボタンと同じ寸法（--size-control ほか）をそのまま使う。押せる範囲は見た目と同じ。',
    spec: [
      ['高さ', '40px（マウス）／44px（指）'],
      ['文字', '14px／16px・太字'],
      ['左右の余白', '12px／16px'],
      ['押せる範囲', '見た目と同じ'],
    ],
    tokens: outlineTokens({
      height: buttonHeight,
      text: ['var(--text-control-fine)', 'var(--text-control-coarse)'],
      leading: ['var(--leading-control-fine)', 'var(--leading-control-coarse)'],
      spaceX: ['var(--space-control-x-fine)', 'var(--space-control-x-coarse)'],
      icon: ['var(--size-icon-fine)', 'var(--size-icon-coarse)'],
      hit: buttonHeight,
    }),
  },
  {
    id: 'A',
    name: '4px 低い',
    intent:
      '文字はボタンと同じで、高さだけ 4px 低くする。ボタンと並べると、少しだけ控えめに見える。押せる範囲はボタンと同じ高さまで広げる。',
    spec: [
      ['高さ', '36px／40px'],
      ['文字', '14px／16px・太字（ボタンと同じ）'],
      ['左右の余白', '12px／14px'],
      ['押せる範囲', '40px／44px（上下に見えない広がり）'],
    ],
    tokens: outlineTokens({
      height: ['36px', '40px'],
      text: ['14px', '16px'],
      leading: ['20px', '24px'],
      spaceX: ['12px', '14px'],
      icon: ['16px', '20px'],
      hit: buttonHeight,
    }),
  },
  {
    id: 'B',
    name: '一段小さい',
    intent:
      '高さを 8px 低くし、文字もラベルと同じ大きさに下げる。ボタンとは別の、小物の pill に見える。押せる範囲はボタンと同じ高さまで広げる。',
    spec: [
      ['高さ', '32px／36px'],
      ['文字', '13px／14px・太字（ラベルと同じ）'],
      ['左右の余白', '12px／14px'],
      ['押せる範囲', '40px／44px（上下に見えない広がり）'],
    ],
    tokens: outlineTokens({
      height: ['32px', '36px'],
      text: ['13px', '14px'],
      leading: ['20px', '20px'],
      spaceX: ['12px', '14px'],
      icon: ['16px', '16px'],
      hit: buttonHeight,
    }),
  },
  {
    id: 'C',
    name: 'タグに近い',
    intent:
      'さらに小さく、タグに近い大きさにする。並びがいちばん軽い。見た目との差が大きいので、押せる範囲は上下に 6px ずつ広げる。',
    spec: [
      ['高さ', '28px／32px'],
      ['文字', '12px／13px・太字'],
      ['左右の余白', '10px／12px'],
      ['押せる範囲', '40px／44px（上下に見えない広がり）'],
    ],
    tokens: outlineTokens({
      height: ['28px', '32px'],
      text: ['12px', '13px'],
      leading: ['16px', '20px'],
      spaceX: ['10px', '12px'],
      icon: ['14px', '16px'],
      hit: buttonHeight,
    }),
  },
  {
    id: 'D',
    name: '横長（参照画像）',
    intent:
      'B の高さと文字で、参照画像の More のように横に長くする。最小の幅を決め、矢印などのアイコンを右端に寄せる。',
    spec: [
      ['高さ', '32px／36px'],
      ['文字', '13px／14px・太字'],
      ['左右の余白', '16px'],
      ['最小の幅', '144px／160px・アイコンは右端'],
      ['押せる範囲', '40px／44px（上下に見えない広がり）'],
    ],
    tokens: outlineTokens({
      height: ['32px', '36px'],
      text: ['13px', '14px'],
      leading: ['20px', '20px'],
      spaceX: ['16px', '16px'],
      icon: ['16px', '16px'],
      hit: buttonHeight,
      minWidth: ['144px', '160px'],
      justify: 'space-between',
    }),
  },
];

const outlineColumns: Column[] = [
  {
    label: 'ボタンと並べる',
    note: '上がマウス用、下が指用。左は同じ密度のボタン。点線は押せる範囲',
  },
  { label: '見出しの横の More', note: 'カードの一覧に添えたとき（参照画像の WORKS）' },
  {
    label: 'SNS のアカウント一覧',
    note: '原則7の例外（密度の高い並び）。2列に並べたとき。中身はいまの部品のまま左に寄る',
  },
];

// 外へ出るリンクの印（Phosphor の ArrowUpRight。テキストと並ぶので Regular の線幅 — ADR-0018）
const ArrowUpRightIcon = () => (
  <svg
    viewBox="0 0 256 256"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="size-(--size-icon) shrink-0"
    style={{ strokeWidth: 'var(--icon-stroke)' }}
  >
    <line x1="64" y1="192" x2="192" y2="64" />
    <polyline points="88 64 192 64 192 168" />
  </svg>
);

const OutlineLink = ({ className, ...props }: LinkProps) => (
  <Link
    appearance="outline"
    {...props}
    className={['axis21-outline', className].filter(Boolean).join(' ')}
  />
);

const densities = [
  ['fine', 'マウス用'],
  ['coarse', '指用'],
] as const;

// 同じ中身を、マウス用と指用に固定して上下に並べる
const BothDensities = ({ children, showHit }: { children: ReactNode; showHit?: boolean }) => (
  <div className="flex flex-col gap-5" data-show-hit={showHit || undefined}>
    {densities.map(([density, label]) => (
      <div key={density} data-density={density} className="flex flex-col gap-2">
        <span className="text-xs text-fg-subtle">{label}</span>
        {children}
      </div>
    ))}
  </div>
);

const WithButton = () => (
  <BothDensities showHit>
    <div className="flex flex-wrap items-center gap-2">
      <Button color="primary">お問い合わせ</Button>
      <OutlineLink color="secondary" href="#more">
        More
        <CaretRightIcon />
      </OutlineLink>
    </div>
  </BothDensities>
);

const SectionHead = () => (
  <BothDensities>
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="[font-size:var(--label-size)] leading-7 [font-weight:var(--label-weight)] [letter-spacing:var(--label-tracking)] text-fg-brand [text-transform:var(--label-transform)]">
          Works
        </h2>
        <OutlineLink color="secondary" href="#works">
          More
          <CaretRightIcon />
        </OutlineLink>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="aspect-video rounded-lg bg-neutral" />
        <div className="aspect-video rounded-lg bg-neutral" />
        <div className="aspect-video rounded-lg bg-neutral" />
      </div>
    </div>
  </BothDensities>
);

const accounts = ['Discord', 'X', 'YouTube', 'GitHub'];

const Accounts = () => (
  <BothDensities>
    <div className="grid grid-cols-2 gap-3">
      {accounts.map((account) => (
        <OutlineLink key={account} href={`#${account}`} className="w-full">
          {account}
          <ArrowUpRightIcon />
        </OutlineLink>
      ))}
    </div>
  </BothDensities>
);

// ── 文字のリンク ──────────────────────────────────────

interface TextSize {
  text: Sizes;
  leading: Sizes;
  hit: Sizes;
}

const textTokens = (s: TextSize): Candidate['tokens'] => ({
  '--text-link-standalone-fine': s.text[0],
  '--text-link-standalone-coarse': s.text[1],
  '--leading-link-standalone-fine': s.leading[0],
  '--leading-link-standalone-coarse': s.leading[1],
  '--size-link-standalone-hit-fine': s.hit[0],
  '--size-link-standalone-hit-coarse': s.hit[1],
});

// 見本の本文は 14px・行の高さ 24px（密度で変えない）
const texts: Candidate[] = [
  {
    id: '現行版',
    name: '周りの文字に合わせる',
    intent:
      '文字のリンクは大きさを持たず、置いた場所の文字をそのまま使う。単独で置いても、押せる範囲は文字の行だけ。',
    spec: [
      ['単独のときの文字', '周りと同じ（見本では 14px）'],
      ['単独の行の高さ', '周りと同じ（24px）'],
      ['押せる範囲', '文字の行だけ（約 22px）'],
    ],
    tokens: textTokens({ text: ['14px', '14px'], leading: ['24px', '24px'], hit: ['0px', '0px'] }),
  },
  {
    id: 'A',
    name: '単独ではボタンの文字',
    intent:
      '単独で置くときは、ボタンと同じ文字の大きさにする。指用では 16px になる。押せる範囲は、見えない広がりでボタンと同じ高さにする。',
    spec: [
      ['単独のときの文字', '14px（マウス）／16px（指）'],
      ['単独の行の高さ', '20px／24px'],
      ['押せる範囲', '40px／44px（上下に見えない広がり）'],
    ],
    tokens: textTokens({
      text: ['var(--text-control-fine)', 'var(--text-control-coarse)'],
      leading: ['var(--leading-control-fine)', 'var(--leading-control-coarse)'],
      hit: buttonHeight,
    }),
  },
  {
    id: 'B',
    name: '単独では行をボタンの高さに',
    intent:
      'A の文字で、行の高さそのものをボタンと同じにする。押せる範囲が周りの余白として見え、縦に並べても重ならない。',
    spec: [
      ['単独のときの文字', '14px／16px'],
      ['単独の行の高さ', '40px／44px（押せる範囲と同じ）'],
      ['押せる範囲', '40px／44px'],
    ],
    tokens: textTokens({
      text: ['var(--text-control-fine)', 'var(--text-control-coarse)'],
      leading: buttonHeight,
      hit: buttonHeight,
    }),
  },
  {
    id: 'C',
    name: '単独では小さく',
    intent:
      '参照画像の「すべてのアカウント一覧」のように、単独のリンクをキャプションと同じ小ささにする。押せる範囲は、見えない広がりでボタンと同じ高さにする。',
    spec: [
      ['単独のときの文字', '11px／12px（キャプションと同じ）'],
      ['単独の行の高さ', '16px'],
      ['押せる範囲', '40px／44px（上下に見えない広がり）'],
      ['文字の比', 'グレー 6.87:1（11px でも 4.5:1 以上）'],
    ],
    tokens: textTokens({
      text: ['var(--text-caption-fine)', 'var(--text-caption-coarse)'],
      leading: ['var(--leading-caption)', 'var(--leading-caption)'],
      hit: buttonHeight,
    }),
  },
  {
    id: 'D',
    name: '押せる範囲だけ広げる',
    intent:
      '文字は現行版と同じく周りに合わせ、単独のときだけ押せる範囲をボタンと同じ高さに広げる。見た目は現行版と変わらない。',
    spec: [
      ['単独のときの文字', '周りと同じ（14px）'],
      ['単独の行の高さ', '周りと同じ（24px）'],
      ['押せる範囲', '40px／44px（上下に見えない広がり）'],
    ],
    tokens: textTokens({ text: ['14px', '14px'], leading: ['24px', '24px'], hit: buttonHeight }),
  },
];

const textColumns: Column[] = [
  {
    label: '文章のあとに置く',
    note: '上がマウス用、下が指用。文章の中のリンクは、どの案も周りの文字のまま。点線は押せる範囲',
  },
  {
    label: '一覧の下に置く',
    note: '参照画像の「すべてのアカウント一覧」。枠線のリンクは現行版の大きさ',
  },
  {
    label: '縦に並べる',
    note: 'フッターのリンク。行の間は 8px。点線は押せる範囲。重なったところは、下のリンクが押される',
  },
];

// 文章の中のリンクは、押せる範囲を広げない
const inParagraph: CSSProperties & Record<`--${string}`, string> = {
  '--size-link-standalone-hit': '0px',
};

const Standalone = ({ href, children }: { href: string; children: ReactNode }) => (
  <p className="axis21-standalone">
    <Link href={href} className="axis21-text-hit">
      {children}
    </Link>
  </p>
);

const AfterParagraph = () => (
  <BothDensities showHit>
    <div className="flex flex-col gap-3 text-sm leading-6">
      <p>
        フロントエンドを中心に、デザインから配信まで手がけています。くわしくは
        <Link href="#works" className="axis21-text-hit" style={inParagraph}>
          制作実績
        </Link>
        をご覧ください。
      </p>
      <Standalone href="#blog">もっと見る</Standalone>
    </div>
  </BothDensities>
);

const UnderList = () => (
  <BothDensities>
    <div className="flex flex-col items-center gap-3 text-sm leading-6">
      <div className="grid w-full grid-cols-2 gap-3">
        {accounts.map((account) => (
          <Link key={account} appearance="outline" href={`#${account}`} className="w-full">
            {account}
          </Link>
        ))}
      </div>
      <Standalone href="#accounts">すべてのアカウント一覧</Standalone>
    </div>
  </BothDensities>
);

const Stacked = () => (
  <BothDensities showHit>
    <div className="flex flex-col items-start gap-2 pt-3 text-sm leading-6">
      <Standalone href="#privacy">プライバシーポリシー</Standalone>
      <Standalone href="#terms">利用規約</Standalone>
      <Standalone href="#contact">お問い合わせ</Standalone>
    </div>
  </BothDensities>
);

// ── ストーリー ────────────────────────────────────────

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/21 リンクの大きさ',
  id: 'design-review-21-link-size',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '枠線のリンク',
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
  render: ({ pick }) => (
    <div className="axis21">
      <style>{styles}</style>
      <Comparison
        index={21}
        axis="リンクの大きさ: 枠線のリンク"
        pick={pick}
        candidates={outlines}
        columns={outlineColumns}
        renderCell={(column) =>
          column.label === 'ボタンと並べる' ? (
            <WithButton />
          ) : column.label === '見出しの横の More' ? (
            <SectionHead />
          ) : (
            <Accounts />
          )
        }
      >
        <p>
          <strong className="text-fg">決定: 現行版のまま</strong>
          （ADR-0039）。「枠線のリンクは枠線のボタンと同じ、現行版で構いません。」
        </p>
        <p>
          1回目。枠線のリンク（More や SNS のアカウント）の大きさを選びます。色（ADR-0028）、hover
          と押下（ADR-0027）、フォーカスの線（ADR-0031）は決まっていて、どの案も同じです。
        </p>
        <p>
          いまの枠線のリンクは、枠線のボタンと同じ高さ・文字・余白です。原則5では、リンクは pill
          の小物です。原則7の例外では、More や SNS
          のアカウント一覧のような密度の高い並びに使います。参照画像の More と SNS
          のボタンは、文字が小さく、横に長い pill です。
        </p>
        <p>
          小さくする案は、押せる範囲を見えない広がりでボタンと同じ高さ（マウス用 40px・指用
          44px）まで広げます。左の列の点線がその範囲です。縦に並べるときは、点線どうしが重ならない間を空けます（SNS
          の一覧は 12px）。
        </p>
        <p>
          文字の色の比は、グレー 6.87:1・青 4.53:1・ピンク
          4.54:1（白地）です。どの大きさでも本文の基準 4.5:1 を満たします。枠線は文字と同じ色です。
        </p>
        <p>
          どの行も、マウス用と指用を上下に並べて固定しているので、ツールバーの「密度」はこの比較には効きません。判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
        </p>
      </Comparison>
    </div>
  ),
};

export const TextLink: Story = {
  name: '文字のリンク',
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
  render: ({ pick }) => (
    <div className="axis21">
      <style>{styles}</style>
      <Comparison
        index={21}
        axis="リンクの大きさ: 文字のリンク"
        pick={pick}
        candidates={texts}
        columns={textColumns}
        renderCell={(column) =>
          column.label === '文章のあとに置く' ? (
            <AfterParagraph />
          ) : column.label === '一覧の下に置く' ? (
            <UnderList />
          ) : (
            <Stacked />
          )
        }
      >
        <p>
          <strong className="text-fg">決定: 現行版のまま</strong>
          （ADR-0039）。「文字のリンクは現行版で良いです。領域に問題がある場合、ボタンを使う考えです。」
        </p>
        <p>
          1回目。文字のリンクを、文章の外に単独で置くとき（「もっと見る」など）の大きさを選びます。下線と
          hover（ADR-0030）は決まっていて、どの案も同じです。
        </p>
        <p>
          文章の中のリンクは、どの案も周りの文字の大きさのままにし、押せる範囲も広げません。行と行の間に広げると、上下の行のリンクと重なるためです。
        </p>
        <p>
          いまの文字のリンクは大きさを持たず、単独で置いても押せる範囲は文字の行だけ（約
          22px）です。指用のボタンの高さ（44px）の半分ほどです。点線が押せる範囲です。
        </p>
        <p>
          見本の本文は 14px
          です。どの行も、マウス用と指用を上下に並べて固定しています。単独のリンクの文字の大きさと、押せる範囲の取り方（見えない広がりか、行の高さか）を比べて、1案を選び一言添えてください。
        </p>
      </Comparison>
    </div>
  ),
};
