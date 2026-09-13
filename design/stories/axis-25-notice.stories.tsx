import type { Meta, StoryObj } from '@storybook/react-vite';
import { type CSSProperties, type ReactNode, useState } from 'react';

import { Button } from '../../src/components/Button';
import { fieldStyles } from '../../src/components/field-styles';
import { focusRing } from '../../src/components/focus-styles';
import { WarningCircleIcon, WarningIcon, XIcon } from '../../src/components/icons';
import { Link } from '../../src/components/Link';
import { type NoticeAppearance, Notice as RealNotice } from '../../src/components/Notice';
import { Tag } from '../../src/components/Tag';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 25: お知らせと状態の色（原則6・原則12）。1回目
// 決定（adr/0043）: 状態の色は C（淡い面）を既定にし、D（濃い塗り）も選べる。形は A（縦に積む）で、E（枠線）も選べる
//   部品は src/components/Notice.tsx（appearance: soft = C、filled = D、outline = 形の E）
//   採用した行（色の C・D、形の A・E）は部品で描く。部品の役割トークンは、下の --color-notice-* と同じ名前なので、
//   行ごとの上書き（形の tone の切り替えを含む）がそのまま部品にも効く。ほかの行は、比べたときのこの中の Notice のまま
// 2つの問いを、別のストーリーで比べる
//   状態の色: 情報・成功・警告・危険の4つに、どの役割（お知らせの面・文字・アイコン、タグ、白地の文字）を当てるか
//   お知らせの形: 題・本文・アイコン・操作・× の並べ方と、角丸・余白・線
// いまあるのは、警告（adr/0038）と危険（adr/0023）の役割だけ。Success・Info は値の層（--palette-success-*・--palette-info-*）にだけある
// お知らせの部品はまだない。この中の Notice で組み、色はこの中だけの役割トークン（下の --color-*-success など）を行ごとに上書きして作る
//   --color-notice-{tone} / --color-on-notice-{tone}       お知らせの面と本文
//   --color-notice-{tone}-title / -icon / -line             題・アイコン・線（左の線と枠線）の色
//   --color-fg-success / --color-fg-info                    白地の文字・アイコン（入力欄の下の行）
//   タグ（淡い面＋同じ色相の濃い文字 — adr/0007）は、比べたときはこの中で上書きしていた。いまは tokens.css の
//     --color-tag-{tone} / --color-on-tag-{tone} と部品（<Tag color={tone}>）で描く。値は比べたときと同じ
//   --color-notice-{tone}-ring                              中のリンクと × のフォーカスの線（塗りの上で青が見えない案だけ文字の色）
//   --notice-radius / --notice-pad-add / --notice-gap / --notice-bar-width / --notice-border-*  形（問い2）
//     --notice-pad-add は、部品の左右の余白（--space-control-x）に足す量。お知らせの中で足すので、密度に合わせて変わる
// 比は design/tools/color.mjs で測った値。色の差（ΔE）は OKLab の距離 ×100

type Tone = 'info' | 'success' | 'warning' | 'danger';
type Layout = 'mock' | 'stack' | 'line' | 'card';
type Vars = Record<`--${string}`, string>;
type Tokens = CSSProperties & Vars;

const tones: Tone[] = ['info', 'success', 'warning', 'danger'];
const toneLabel: Record<Tone, string> = {
  info: '情報',
  success: '成功',
  warning: '警告',
  danger: '危険',
};

// ── 値 ────────────────────────────────────────────────
// 成功の緑: --palette-success-500 #6BF188 と同じ色相（148°）で、白地と淡い面の両方で 4.5:1 を満たすまで暗くした値
//   白地 5.02:1、淡い面 #E5F8E7 の上で 4.52:1（警告の #727200 と同じく、1つの値で両方に使う）
// 淡い面: ほかのタグの面と同じ明度 0.96（彩度 0.03）。いまの --palette-success-50 #E1FCE7 は明度 0.97・彩度 0.04
const green700 = '#008132';
const green50 = '#e5f8e7';
// 危険の淡い面: Danger と同じ色相で、タグの面と同じ明度 0.96・彩度 0.02。#BA012D を載せて 5.93:1
const dangerPale = '#feeded';
const navy = 'var(--color-fg)';
const white = 'var(--color-on-primary)';

// 案をまたいで同じにした役割。情報は Primary と同じ色相（値の層の Info #6B9FF1 も 259° で、Primary と 1.7° しか違わない）
const shared: Vars = {
  '--color-fg-success': green700,
  '--color-fg-info': 'var(--palette-blue-700)',
};

const fgOf: Record<Tone, string> = {
  info: 'var(--color-fg-info)',
  success: 'var(--color-fg-success)',
  warning: 'var(--color-fg-warning)',
  danger: 'var(--color-danger)',
};

interface ToneValue {
  surface: string;
  on: string;
  /** 題の色。省略すると本文と同じ */
  title?: string;
  icon: string;
  /** 左の線と枠線の色。省略すると前景用の色（白地 5.02〜6.71:1） */
  line?: string;
  /** 中のリンクと × のフォーカスの線。省略すると部品の青（ADR-0031） */
  ring?: string;
}

const toneTokens = (set: Record<Tone, ToneValue>, extra: Vars = {}): Tokens => {
  const out: Tokens = { ...shared, ...extra };
  for (const t of tones) {
    const v = set[t];
    out[`--color-notice-${t}`] = v.surface;
    out[`--color-on-notice-${t}`] = v.on;
    out[`--color-notice-${t}-title`] = v.title ?? v.on;
    out[`--color-notice-${t}-icon`] = v.icon;
    out[`--color-notice-${t}-line`] = v.line ?? fgOf[t];
    out[`--color-notice-${t}-ring`] = v.ring ?? 'var(--color-focus)';
  }
  return out;
};

// 警告は ADR-0038 のまま（黄色の塗りに濃紺の文字とアイコン）
const warningFill: ToneValue = {
  surface: 'var(--color-warning)',
  on: 'var(--color-on-warning)',
  icon: 'var(--color-on-warning)',
};

// ── 問い1: 状態の色 ──────────────────────────────────────

interface ToneCandidate extends Candidate {
  /** 役割があるもの。ないものは「ない」と描く */
  has: Tone[];
}

const toneCandidates: ToneCandidate[] = [
  {
    id: '現行版',
    name: '警告と危険だけ',
    intent:
      'お知らせの部品はない。警告は、軸 20 で仮に組んだ黄色の塗りに濃紺（ADR-0038）。危険は、ボタンと入力欄の赤だけで、お知らせとタグの役割はない。成功と情報は値の層にだけあり、役割がない。',
    spec: [
      ['警告', '#EFF16B に濃紺（11.49:1）・タグ・入力欄の下の行'],
      ['危険', 'ボタンと入力欄の下の行（#BA012D、白地 6.71:1）'],
      ['成功', '値の層だけ（#6BF188 白地 1.44:1・#E1FCE7）'],
      ['情報', '値の層だけ（#6B9FF1 白地 2.67:1・#E1ECFC）'],
    ],
    has: ['warning'],
    tokens: toneTokens({
      info: { surface: 'transparent', on: navy, icon: navy },
      success: { surface: 'transparent', on: navy, icon: navy },
      warning: warningFill,
      danger: { surface: 'transparent', on: navy, icon: navy },
    }),
  },
  {
    id: 'A',
    name: '明るい塗り（ガイドラインの色）',
    intent:
      '値の層の 500（#6BF188・#6B9FF1・#EFF16B）を、警告と同じく塗りにして濃紺の文字を載せる。情報・成功・警告の3つが、同じ作りになる。危険だけは濃い赤に白文字。明るい赤はピンクと見分けにくいため（ADR-0023）。青の塗りの上ではフォーカスの青い線が見えないので、線を文字の色にする（ADR-0031 の例外）。',
    spec: [
      ['情報', '#6B9FF1 に濃紺（5.17:1）'],
      ['成功', '#6BF188 に濃紺（9.58:1）'],
      ['警告', '#EFF16B に濃紺（11.49:1）— ADR-0038'],
      ['危険', '#BA012D に白（6.71:1）'],
      ['近い色', '情報の塗りとブランドの水色 #35B9FD の差 7.2'],
      ['フォーカス', '情報・成功は濃紺、危険は白。青だと 1.69・1.48:1。ADR-0031 の例外'],
    ],
    has: tones,
    tokens: toneTokens({
      info: { surface: 'var(--palette-info-500)', on: navy, icon: navy, ring: navy },
      success: { surface: 'var(--palette-success-500)', on: navy, icon: navy, ring: navy },
      warning: warningFill,
      danger: { surface: 'var(--color-danger)', on: white, icon: white, ring: white },
    }),
  },
  {
    id: 'B',
    name: '淡い面（警告だけ黄色の塗り）',
    intent:
      '情報・成功・危険は、タグと同じ淡い面に濃紺の文字。アイコンだけ同じ色相の濃い色にする。警告は ADR-0038 の黄色の塗りのまま。警告だけが強い塗りになり、危険より目立つ。',
    spec: [
      ['情報', '#E9F2FE に濃紺（12.23:1）・アイコン #196BD6（4.52:1）'],
      ['成功', '#E5F8E7 に濃紺（12.44:1）・アイコン #008132（4.52:1）'],
      ['警告', '#EFF16B に濃紺（11.49:1）— ADR-0038'],
      ['危険', '#FEEDED に濃紺（12.20:1）・アイコン #BA012D（5.93:1）'],
    ],
    has: tones,
    tokens: toneTokens({
      info: { surface: 'var(--palette-blue-50)', on: navy, icon: 'var(--palette-blue-700)' },
      success: { surface: green50, on: navy, icon: green700 },
      warning: warningFill,
      danger: { surface: dangerPale, on: navy, icon: 'var(--color-danger)' },
    }),
  },
  {
    id: 'C',
    name: '淡い面にそろえる（警告も淡く）',
    intent:
      '4つとも、タグと同じ淡い面にする（ADR-0007 の塗り方）。題とアイコンは同じ色相の濃い色、本文は濃紺。警告も淡い黄色 #F3F5CE にするので、ADR-0038 の「お知らせは黄色の塗り」を変えることになる。',
    spec: [
      ['情報', '#E9F2FE に題とアイコン #196BD6（4.52:1）'],
      ['成功', '#E5F8E7 に #008132（4.52:1）'],
      ['警告', '#F3F5CE に #727200（4.55:1）。ADR-0038 を変える'],
      ['危険', '#FEEDED に #BA012D（5.93:1）'],
      ['本文', '濃紺（12.20〜12.44:1）'],
    ],
    has: tones,
    tokens: toneTokens({
      info: {
        surface: 'var(--palette-blue-50)',
        on: navy,
        title: 'var(--palette-blue-700)',
        icon: 'var(--palette-blue-700)',
      },
      success: { surface: green50, on: navy, title: green700, icon: green700 },
      warning: {
        surface: 'var(--color-tag-warning)',
        on: navy,
        title: 'var(--color-fg-warning)',
        icon: 'var(--color-fg-warning)',
      },
      danger: {
        surface: dangerPale,
        on: navy,
        title: 'var(--color-danger)',
        icon: 'var(--color-danger)',
      },
    }),
  },
  {
    id: 'D',
    name: '濃い塗りに白文字（警告だけ黄色）',
    intent:
      '情報・成功・危険は、白文字が載る濃い塗りにする（危険のボタンと同じ使い方）。警告は ADR-0038 の黄色に濃紺。いちばん強い。情報のお知らせは Primary のボタンと同じ青になる。濃い塗りの上ではフォーカスの青い線が見えないので、線を白にする（ADR-0031 の例外）。',
    spec: [
      ['情報', '#2474DF（Primary）に白（4.53:1）'],
      ['成功', '#008132 に白（5.02:1）'],
      ['警告', '#EFF16B に濃紺（11.49:1）— ADR-0038'],
      ['危険', '#BA012D に白（6.71:1）'],
      ['フォーカス', '濃い塗りの上は白。青だと 1.00〜1.48:1。ADR-0031 の例外'],
    ],
    has: tones,
    tokens: toneTokens({
      info: { surface: 'var(--color-primary)', on: white, icon: white, ring: white },
      success: { surface: green700, on: white, icon: white, ring: white },
      warning: warningFill,
      danger: { surface: 'var(--color-danger)', on: white, icon: white, ring: white },
    }),
  },
  {
    id: 'E',
    name: '白い面に色の線',
    intent:
      '面は色を持たない。白い面に細い境界線を引き、左の 4px の線とアイコンだけを状態の色にする。文字は濃紺。警告も黄色を使わず、線とアイコンをオリーブ色にするので、ADR-0038 の「お知らせは黄色の塗り」を変えることになる。',
    spec: [
      ['面', '白に 1px の細い境界線 #DEE0E1'],
      ['左の線', '4px。前景用の色（白地 5.02〜6.71:1）'],
      ['アイコン', '線と同じ色'],
      ['文字', '濃紺（13.82:1）'],
      ['警告', '黄色を使わない。ADR-0038 を変える'],
    ],
    has: tones,
    tokens: toneTokens(
      {
        info: { surface: 'var(--color-surface)', on: navy, icon: fgOf.info },
        success: { surface: 'var(--color-surface)', on: navy, icon: fgOf.success },
        warning: { surface: 'var(--color-surface)', on: navy, icon: fgOf.warning },
        danger: { surface: 'var(--color-surface)', on: navy, icon: fgOf.danger },
      },
      {
        '--notice-bar-width': '4px',
        '--notice-border-width': '1px',
        '--notice-border-color': 'var(--color-line)',
      }
    ),
  },
];

const toneColumns: Column[] = [
  { label: 'お知らせ', note: '上から情報・成功・警告・危険。形は仮（問い2で比べる）' },
  {
    label: 'タグと入力欄の下の行',
    note: 'タグと白地の文字は、A〜E で同じ値です。入力欄の下の行はアイコン＋文（ADR-0041）',
  },
  {
    label: 'ページの中で',
    note: 'Primary・Secondary・Danger のボタンと、ブランドの水色の見出しの隣に置いたとき',
  },
];

// ── アイコン ──────────────────────────────────────────
// Phosphor（viewBox 256）。文字と並ぶので Regular の線幅（ADR-0018）。警告と危険は部品のアイコン（adr/0041）

const svgBase = {
  viewBox: '0 0 256 256',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  style: { strokeWidth: 'var(--icon-stroke)' },
} as const;

// 丸の「i」（Phosphor の Info）
const InfoIcon = ({ className }: { className?: string }) => (
  <svg {...svgBase} className={className}>
    <circle cx="128" cy="128" r="96" />
    <path d="M120,120a8,8,0,0,1,8,8v40a8,8,0,0,0,8,8" />
    <circle cx="124" cy="84" r="12" fill="currentColor" stroke="none" />
  </svg>
);

// 丸のチェック（Phosphor の CheckCircle）
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg {...svgBase} className={className}>
    <polyline points="88 136 112 160 168 104" />
    <circle cx="128" cy="128" r="96" />
  </svg>
);

const iconOf: Record<Tone, (props: { className?: string }) => ReactNode> = {
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  danger: WarningCircleIcon,
};

// ── お知らせ（この中だけの部品） ─────────────────────────
// 影は付けない（原則1: お知らせは押せない。押せるのは中のリンクとボタンだけ）
// 読み上げ: 題・本文・操作を role の箱に入れる。危険は alert、ほかは status。× は箱の外に置き、「閉じる」と読む

const roleOf: Record<Tone, 'alert' | 'status'> = {
  info: 'status',
  success: 'status',
  warning: 'status',
  danger: 'alert',
};

const noticeCss = [
  `[data-axis25-notice] {
    background-color: var(--nt-surface);
    color: var(--nt-on);
    border: var(--notice-border-width, 0px) solid var(--notice-border-color, transparent);
    border-radius: var(--notice-radius, var(--radius-control));
    --nt-pad: calc(var(--space-control-x) + var(--notice-pad-add, 0px));
    padding: var(--nt-pad);
    padding-inline-start: calc(var(--nt-pad) + var(--notice-bar-width, 0px));
    column-gap: var(--notice-gap, calc(var(--space-control-x) - 4px));
    --color-focus-ring: var(--nt-ring, var(--color-focus));
  }`,
  ...tones.map(
    (t) => `[data-axis25-notice][data-tone="${t}"] {
    --nt-surface: var(--color-notice-${t});
    --nt-on: var(--color-on-notice-${t});
    --nt-title: var(--color-notice-${t}-title);
    --nt-icon: var(--color-notice-${t}-icon);
    --nt-line: var(--color-notice-${t}-line);
    --nt-ring: var(--color-notice-${t}-ring);
  }`
  ),
  // 1行の形: 1行なら部品と同じ高さ
  `[data-axis25-notice][data-layout="line"] {
    min-height: var(--size-control);
    padding-block: calc((var(--size-control) - var(--leading-control)) / 2);
  }`,
  // 現行版（軸 20 の仮組み）: 余白と角丸は固定
  `[data-axis25-notice][data-layout="mock"] {
    padding: 12px 16px;
    column-gap: 12px;
    border-radius: var(--radius-control);
  }`,
  // 枠線の形（問い2 の E）: 白い面に、前景用の色の枠線。アイコンも線の色、文字は濃紺
  `[data-axis25-notice][data-variant="outline"] {
    --nt-surface: var(--color-surface);
    --nt-on: var(--color-fg);
    --nt-title: var(--color-fg);
    --nt-icon: var(--nt-line);
    --nt-ring: var(--color-focus);
    border: 1px solid var(--nt-line);
  }`,
  '[data-axis25-notice] [data-part="bar"] { width: var(--notice-bar-width, 0px); background-color: var(--nt-line); }',
  '[data-axis25-notice] [data-part="icon"] { color: var(--nt-icon); }',
  '[data-axis25-notice] [data-part="title"] { color: var(--nt-title); }',
].join('\n');

// お知らせの中のリンクは、お知らせの文字の色にする（白文字の塗りでも読めるように）
const inheritLink: Tokens = { '--link-color': 'currentColor' };

const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    aria-label="閉じる"
    onClick={onClick}
    className={[
      // 押せる範囲は 28px（指用 32px）。上下左右に 4px はみ出させ、1行目の中央にそろえる
      '-my-1 -mr-1 grid size-[calc(var(--leading-control)+8px)] shrink-0 cursor-pointer place-items-center rounded-pill',
      // 平らな要素（原則3、ADR-0027）: 文字の色を淡く敷き、押下で 1px 沈む
      'hover:bg-flat-hover active:translate-y-(--flat-press-depth) active:bg-flat-press',
      '[transition:background-color_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)] motion-reduce:[transition:none]',
      ...focusRing,
    ].join(' ')}
  >
    {/* アイコン単体なので Bold（ADR-0018） */}
    <XIcon standalone />
  </button>
);

interface NoticeProps {
  tone: Tone;
  layout?: Layout;
  variant?: 'fill' | 'outline';
  title?: string;
  children?: ReactNode;
  /** 操作の文言。stack・line は文字のリンク、card は白いボタン */
  action?: string;
  closable?: boolean;
}

function Notice({
  tone,
  layout = 'stack',
  variant = 'fill',
  title,
  children,
  action,
  closable,
}: NoticeProps) {
  const [closed, setClosed] = useState(false);
  const Icon = iconOf[tone];
  const mock = layout === 'mock';
  // 現行版（軸 20 の仮組み）は、操作と × を持たない
  const showAction = !!action && !mock;
  const link = showAction && (
    <Link href="#" className="font-bold" style={inheritLink} onClick={(e) => e.preventDefault()}>
      {action}
    </Link>
  );
  if (closed)
    return (
      <button
        type="button"
        className="cursor-pointer self-start text-xs text-fg-subtle underline underline-offset-4"
        onClick={() => setClosed(false)}
      >
        閉じたお知らせを戻す
      </button>
    );
  let content: ReactNode;
  if (layout === 'line') {
    content = (
      <div
        role={roleOf[tone]}
        className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1"
      >
        <p className="min-w-0 flex-[1_1_12em]">
          {title && (
            <strong data-part="title" className="font-bold">
              {title}
            </strong>
          )}
          {title && children && '　'}
          {children}
        </p>
        {link}
      </div>
    );
  } else {
    content = (
      <div
        role={roleOf[tone]}
        className={`flex min-w-0 flex-1 flex-col ${layout === 'card' ? 'gap-1.5' : 'gap-0.5'}`}
      >
        {title && (
          <p data-part="title" className="font-bold">
            {title}
          </p>
        )}
        {children && <p>{children}</p>}
        {showAction && layout === 'card' && (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button color="surface">{action}</Button>
          </div>
        )}
        {showAction && layout !== 'card' && <p className="mt-1">{link}</p>}
      </div>
    );
  }
  return (
    <div
      data-axis25-notice
      data-tone={tone}
      data-layout={layout}
      data-variant={variant}
      className={[
        'relative flex items-start overflow-hidden',
        mock ? 'text-sm leading-5' : 'text-(length:--text-control) leading-(--leading-control)',
      ].join(' ')}
    >
      <span data-part="bar" aria-hidden className="absolute inset-y-0 left-0" />
      <span data-part="icon" className="mt-0.5 flex shrink-0">
        <Icon className="size-(--size-icon)" />
      </span>
      {content}
      {closable && !mock && <CloseButton onClick={() => setClosed(true)} />}
    </div>
  );
}

// ── 問い1のセル ──────────────────────────────────────────

const Missing = ({ children }: { children: ReactNode }) => (
  <p className="rounded-control border border-dashed border-line px-4 py-3 text-xs leading-5 text-fg-subtle">
    {children}
  </p>
);

const missingValues: Record<Tone, string> = {
  info: '値の層の #6B9FF1・#E1ECFC だけ',
  success: '値の層の #6BF188・#E1FCE7 だけ',
  warning: '',
  danger: 'ボタンと入力欄の赤だけ',
};

const noticeSamples: Record<Tone, { title: string; body: string }> = {
  info: { title: 'メンテナンスのお知らせ', body: '9月20日の2時から4時まで、保存ができません。' },
  success: { title: '保存しました', body: '変更は、すぐにプロフィールに反映されます。' },
  warning: {
    title: 'メールアドレスが確認されていません',
    body: '確認するまで、お知らせのメールは届きません。',
  },
  danger: { title: '保存できませんでした', body: '通信が切れました。もう一度お試しください。' },
};

// real: 採用した行（C・D）は部品で描く。見た目は、この中の Notice で組んだときと同じ
interface ToneCellProps {
  has: Tone[];
  real?: NoticeAppearance;
}

const ToneNotices = ({ has, real }: ToneCellProps) => (
  <div className="flex flex-col gap-3">
    {tones.map((t) =>
      has.includes(t) ? (
        real ? (
          <RealNotice key={t} tone={t} appearance={real} title={noticeSamples[t].title}>
            {noticeSamples[t].body}
          </RealNotice>
        ) : (
          <Notice key={t} tone={t} title={noticeSamples[t].title}>
            {noticeSamples[t].body}
          </Notice>
        )
      ) : (
        <Missing key={t}>
          {toneLabel[t]}のお知らせ: 役割がない（{missingValues[t]}）
        </Missing>
      )
    )}
  </div>
);

const tagSamples: Record<Tone, string> = {
  info: 'お知らせ',
  success: '完了',
  warning: '期限まで3日',
  danger: '期限切れ',
};

// 入力欄の下の行（ADR-0041 の形）。成功と情報は部品にないので、同じ形をこの中で組む
const MessageLine = ({ tone, children }: { tone: Tone; children: ReactNode }) => {
  const styles = fieldStyles();
  const Icon = iconOf[tone];
  return (
    <p className={styles.message()} style={{ color: fgOf[tone] }}>
      <Icon className={styles.messageIcon()} />
      <span className="min-w-0">{children}</span>
    </p>
  );
};

const lineSamples: Record<Tone, string> = {
  info: 'ほかの人には、表示名だけが見えます',
  success: 'このユーザー名は使えます',
  warning: '20文字を超えると、一覧では途中で切れます',
  danger: 'メールアドレスの形が正しくありません',
};

const Caption = ({ children }: { children: ReactNode }) => (
  <p className="text-xs text-fg-subtle">{children}</p>
);

const TagsAndLines = ({ has }: { has: Tone[] }) => {
  const current = has.length === 1;
  // 現行版は、警告のタグと、警告・危険の行だけ。どちらも部品（TextField の error・warning）で描く
  const tagTones = current ? (['warning'] as Tone[]) : tones;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Caption>利用者が選ぶ色</Caption>
        <div className="flex flex-wrap gap-1.5">
          <Tag color="primary">公開中</Tag>
          <Tag color="secondary">おすすめ</Tag>
          <Tag>下書き</Tag>
        </div>
        <Caption>状態の色</Caption>
        <div className="flex flex-wrap gap-1.5">
          {tagTones.map((t) => (
            <Tag key={t} color={t}>
              {tagSamples[t]}
            </Tag>
          ))}
        </div>
        {current && <Caption>情報・成功・危険のタグはない</Caption>}
      </div>
      <div className="flex flex-col gap-3">
        <Caption>入力欄の下の行</Caption>
        {current ? (
          <>
            <TextField
              label="ユーザー名"
              defaultValue="kazuemon"
              error="このユーザー名は、ほかの人が使っています"
            />
            <TextField
              label="表示名"
              defaultValue="かずえもん（Kazuya Miyamoto）"
              warning={lineSamples.warning}
            />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-(--space-field-gap)">
              <TextField label="ユーザー名" defaultValue="kazuemon2026" />
              <MessageLine tone="success">{lineSamples.success}</MessageLine>
            </div>
            {tones
              .filter((t) => t !== 'success')
              .map((t) => (
                <MessageLine key={t} tone={t}>
                  {lineSamples[t]}
                </MessageLine>
              ))}
          </>
        )}
        {current && <Caption>成功・情報の行はない</Caption>}
      </div>
    </div>
  );
};

const PageContext = ({ has, real }: ToneCellProps) => (
  <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4">
    <div className="flex flex-col gap-1">
      {/* セクションラベル（原則10）: 大文字・800・前景用の水色 */}
      <p className="text-xl font-extrabold tracking-[0.04em] text-fg-brand uppercase">Account</p>
      <h3 className="text-base font-heading">アカウント</h3>
    </div>
    {has.includes('info') ? (
      real ? (
        <RealNotice tone="info" appearance={real}>
          パスワードは、半年ごとに変えることをおすすめします。
        </RealNotice>
      ) : (
        <Notice tone="info">パスワードは、半年ごとに変えることをおすすめします。</Notice>
      )
    ) : (
      <Missing>情報のお知らせ: 役割がない</Missing>
    )}
    <div className="flex flex-wrap gap-2">
      <Button color="primary">保存する</Button>
      <Button color="secondary">招待する</Button>
      <Button color="danger" appearance="outline">
        削除する
      </Button>
    </div>
    {has.includes('success') ? (
      real ? (
        <RealNotice tone="success" appearance={real} title="招待を送りました" />
      ) : (
        <Notice tone="success" title="招待を送りました" />
      )
    ) : (
      <Missing>成功のお知らせ: 役割がない</Missing>
    )}
    {has.includes('danger') ? (
      real ? (
        <RealNotice tone="danger" appearance={real} title="記事を削除できませんでした" />
      ) : (
        <Notice tone="danger" title="記事を削除できませんでした" />
      )
    ) : (
      <Missing>危険のお知らせ: 役割がない</Missing>
    )}
  </div>
);

// ── 問い2: お知らせの形 ───────────────────────────────────

interface ShapeCandidate extends Candidate {
  layout: Layout;
  variant?: 'fill' | 'outline';
}

const shapeCandidates: ShapeCandidate[] = [
  {
    id: '現行版',
    layout: 'mock',
    name: '軸 20 の仮組み',
    intent:
      '軸 20 で仮に組んだ形。アイコンの右に、太字の題と本文を積む。操作と × は持たない。文字は 14px で、密度で変わらない。',
    spec: [
      ['角丸', '12px（部品と同じ）'],
      ['余白', '上下 12px・左右 16px'],
      ['文字', '14px（密度で変わらない）'],
      ['操作・×', '持たない'],
    ],
  },
  {
    id: 'A',
    layout: 'stack',
    name: '縦に積む',
    intent:
      'アイコン、題、本文、操作（文字のリンク）を縦に積む。× は右上。文字と余白は部品の寸法（密度で変わる）。',
    spec: [
      ['角丸', '12px（部品と同じ）'],
      ['余白', '16px（マウス用 12px）'],
      ['文字', '部品と同じ（16px・マウス用 14px）'],
      ['操作', '本文の下に文字のリンク'],
      ['×', '右上。押せる範囲 32px（マウス用 28px）'],
    ],
    tokens: { '--notice-radius': 'var(--radius-control)' },
  },
  {
    id: 'B',
    layout: 'line',
    name: '1行にまとめる',
    intent:
      '題と本文を1つの文にし、操作と × を右端に置く。1行に収まれば、部品と同じ高さ。狭い幅では折り返し、操作は次の行に下がる。',
    spec: [
      ['角丸', '12px（部品と同じ）'],
      ['高さ', '1行なら部品と同じ（44px・マウス用 40px）'],
      ['並び', 'アイコン → 題＋本文 → 操作 → ×'],
      ['狭い幅', '折り返す。操作は次の行'],
    ],
    tokens: { '--notice-radius': 'var(--radius-control)' },
  },
  {
    id: 'C',
    layout: 'card',
    name: 'カードの形',
    intent:
      '角丸と余白をカードに合わせ、操作を白いボタンにする。お知らせは押せないので影はなく、影があるのは中のボタンだけ（原則1）。',
    spec: [
      ['角丸', '16px（カードと同じ）'],
      ['余白', '20px（マウス用 16px）'],
      ['操作', '白いボタン（影と輪郭あり — ADR-0025）'],
      ['×', '右上'],
    ],
    tokens: { '--notice-radius': 'var(--radius-card)', '--notice-pad-add': '4px' },
  },
  {
    id: 'D',
    layout: 'stack',
    name: '左の線',
    intent: 'A の左端に、4px の状態の色の線を足す。面の色は変えない。',
    spec: [
      ['角丸', '12px（部品と同じ）'],
      ['線', '左に 4px。前景用の色'],
      ['線と面の比', '4.24〜5.93:1（B の色のとき。黄色の上のオリーブ色が 4.24:1）'],
      ['ほか', 'A と同じ'],
    ],
    tokens: { '--notice-radius': 'var(--radius-control)', '--notice-bar-width': '4px' },
  },
  {
    id: 'E',
    layout: 'stack',
    variant: 'outline',
    name: '枠線',
    intent:
      '面を白にし、1px の状態の色の枠線で囲む。アイコンも枠線の色、文字は濃紺。塗りを持たないので、黄色も淡い面も出ない。',
    spec: [
      ['角丸', '12px（部品と同じ）'],
      ['面', '白'],
      ['枠線', '1px。前景用の色（白地 5.02〜6.71:1）'],
      ['アイコン', '枠線と同じ色'],
      ['ほか', 'A と同じ'],
    ],
    tokens: { '--notice-radius': 'var(--radius-control)' },
  },
];

const shapeColumns: Column[] = [
  { label: 'フォームの上', note: '警告。題・本文・操作・× をすべて持つとき' },
  { label: 'カードの中', note: '情報は本文と操作だけ、成功は題と × だけ' },
  {
    label: '指の寸法・狭い幅',
    note: '指用の密度に固定した画面の枠。危険は題・本文・操作、成功は題と ×',
  },
];

interface ShapeProps {
  candidate: ShapeCandidate;
  /** 採用した行（A・E）は部品で描く。そのときの見た目 */
  real?: NoticeAppearance;
}

// 採用した行は部品で描き、ほかの行はこの中の Notice のまま。× で閉じ、「閉じたお知らせを戻す」で戻せるのは同じ
// 操作の文字のリンクは、部品がお知らせの文字の色の太字にする（この中の Notice の inheritLink と font-bold と同じ）
function ShapeNotice({
  candidate,
  real,
  ...props
}: ShapeProps & Omit<NoticeProps, 'layout' | 'variant'>) {
  const [closed, setClosed] = useState(false);
  if (!real) return <Notice {...props} layout={candidate.layout} variant={candidate.variant} />;
  if (closed)
    return (
      <button
        type="button"
        className="cursor-pointer self-start text-xs text-fg-subtle underline underline-offset-4"
        onClick={() => setClosed(false)}
      >
        閉じたお知らせを戻す
      </button>
    );
  return (
    <RealNotice
      tone={props.tone}
      appearance={real}
      title={props.title}
      actions={
        props.action && (
          <Link href="#" onClick={(e) => e.preventDefault()}>
            {props.action}
          </Link>
        )
      }
      onClose={props.closable ? () => setClosed(true) : undefined}
    >
      {props.children}
    </RealNotice>
  );
}

const FormTop = ({ candidate, real }: ShapeProps) => (
  <div className="flex flex-col gap-5">
    <h2 className="text-xl font-heading">プロフィールの編集</h2>
    <ShapeNotice
      candidate={candidate}
      real={real}
      tone="warning"
      title="メールアドレスが確認されていません"
      action="確認メールを送る"
      closable
    >
      確認するまで、お知らせのメールは届きません。
    </ShapeNotice>
    <TextField label="表示名" defaultValue="かずえもん" />
    <TextField label="メールアドレス" defaultValue="kazu@example.com" />
    <Button color="primary" className="self-start">
      保存する
    </Button>
  </div>
);

const InCard = ({ candidate, real }: ShapeProps) => (
  <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4">
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-base font-heading">Blog の記事</h3>
      <Tag>下書き</Tag>
    </div>
    <ShapeNotice candidate={candidate} real={real} tone="info" action="公開する">
      この記事は下書きです。公開するまで、ほかの人には見えません。
    </ShapeNotice>
    <ShapeNotice candidate={candidate} real={real} tone="success" title="保存しました" closable />
    <p className="text-sm leading-6 text-fg-muted">
      新しいポートフォリオを作りました。Storybook で1つずつ部品を詰めています。
    </p>
  </div>
);

// スマートフォンの画面の代わり。セルの幅（1320px の画面で約 310px）が、狭いスマートフォンの幅に近い
const Phone = ({ candidate, real }: ShapeProps) => (
  <div
    data-density="coarse"
    className="flex w-full max-w-[375px] flex-col gap-5 overflow-clip rounded-[28px] border border-line bg-bg px-4 py-6"
  >
    <h2 className="text-xl font-heading">お届け先</h2>
    <ShapeNotice
      candidate={candidate}
      real={real}
      tone="danger"
      title="この住所にはお届けできません"
      action="お届けできる地域を見る"
    >
      23区内の住所を入力してください。
    </ShapeNotice>
    <TextField label="住所" defaultValue="東京都八王子市" />
    <ShapeNotice
      candidate={candidate}
      real={real}
      tone="success"
      title="クーポンを使いました"
      closable
    />
    <Button color="primary">注文する</Button>
  </div>
);

// 読み上げに渡る情報。Chrome の CDP（Accessibility.getFullAXTree）で、このストーリーのお知らせを測った値（2026-09-13）
// role の箱には名前を付けていない（名前は空）。中身（題・本文・リンク）が、そのまま読まれる
const heard: [tone: string, role: string, live: string, read: string][] = [
  [
    '危険',
    'alert',
    'assertive（割り込む）・atomic（全体を読み直す）',
    '名前なし。題・本文・リンク',
  ],
  ['警告・成功・情報', 'status', 'polite（区切りを待つ）・atomic', '名前なし。題・本文・リンク'],
  ['×（どの色も）', 'button', '—（role の外）', '「閉じる」'],
];

const HeardTable = () => (
  <div className="overflow-x-auto">
    <table className="text-xs leading-5">
      <thead>
        <tr className="text-left text-fg-subtle">
          <th className="pr-4 font-normal">色</th>
          <th className="pr-4 font-normal">role</th>
          <th className="pr-4 font-normal">live</th>
          <th className="font-normal">中身として読むもの</th>
        </tr>
      </thead>
      <tbody>
        {heard.map(([tone, role, live, read]) => (
          <tr key={tone}>
            <td className="pr-4">{tone}</td>
            <td className="pr-4 font-bold">{role}</td>
            <td className="pr-4">{live}</td>
            <td>{read}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── ストーリー ────────────────────────────────────────

interface ComparisonArgs {
  pick: string;
  /** 問い2の色。問い1の案の id */
  tone?: string;
}

const meta = {
  title: 'Design Review/25 お知らせと状態の色',
  id: 'design-review-25-notice',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

// 採用した行を部品で描くときの見た目（adr/0043）
const realTone: Record<string, NoticeAppearance> = { C: 'soft', D: 'filled' };
const realShape: Record<string, NoticeAppearance> = { A: 'soft', E: 'outline' };

export const Tones: Story = {
  name: '状態の色',
  args: { pick: 'C,D' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D', 'E'],
    },
  },
  render: ({ pick }) => (
    <>
      <style>{noticeCss}</style>
      <Comparison
        index={25}
        axis="お知らせと状態の色: 状態の色"
        pick={pick}
        candidates={toneCandidates}
        columns={toneColumns}
        renderCell={(column, candidate) => {
          const found = toneCandidates.find((c) => c.id === candidate.id);
          if (!found) return null;
          const real = realTone[found.id];
          if (column.label === 'お知らせ') return <ToneNotices has={found.has} real={real} />;
          if (column.label === 'タグと入力欄の下の行') return <TagsAndLines has={found.has} />;
          return <PageContext has={found.has} real={real} />;
        }}
      >
        <p>
          状態の4つの色（情報・成功・警告・危険）に、どの役割を当てるかを選びます。いまは警告（ADR-0038）と危険（ADR-0023）にだけ役割があります。成功（緑）と情報（青）は値の層にだけあり、軸
          20 で尋ねたときは答えがありませんでした。
        </p>
        <p>
          お知らせの部品はまだないので、このストーリーの中で組んでいます。形は下の「お知らせの形」で比べます。ここでは色だけを見てください。
        </p>
        <p>
          A〜E で同じにしたものがあります。白地の文字とアイコン（入力欄の下の行など）は、成功が
          #008132（白地 5.02:1）、情報が
          #196BD6（5.10:1）です。タグは淡い面に同じ色相の濃い文字です（ADR-0007）。成功は #E5F8E7 に
          #008132（4.52:1）、情報は Primary の青のタグと同じ、危険は #FEEDED に
          #BA012D（5.93:1）です。
        </p>
        <p>
          見分けにくい組み合わせが3つあります。数字は色の差（OKLab の距離 ×100）です。Danger
          とピンクの文字の色は 11.2 で、ADR-0023 ではこれを明度で見分けました。
        </p>
        <ul className="list-disc pl-5">
          <li>
            情報と Primary: 値の層の Info（#6B9FF1）は、Primary と色相が 1.7°
            しか違いません。どの案も、情報は Primary と同じ色相にしています。
          </li>
          <li>
            成功と警告: 文字の色 #008132 と #727200 の差は 9.5 で、Danger
            とピンクより近く、明度もほぼ同じ（1.02:1）です。アイコンの形（丸のチェックと三角）で見分けます。
          </li>
          <li>
            危険のタグとピンクのタグ: 面の差は 0.6 で、ほぼ同じ色です。文字の明度の差は 1.29:1
            です。
          </li>
        </ul>
        <p>
          現行版を除き、どの案も文字は 4.5:1、アイコンと線は 3:1
          を満たします。比は各案の表にあります。A と D では、塗りの上にフォーカスの青い線を引くと
          1.00〜1.69:1 で見えません。そのため、中のリンクと ×
          の線を文字の色（白か濃紺）にしています。「線は部品の色によらず青の1色」（ADR-0031）の例外になります。
        </p>
        <p>
          お知らせの色を、明るい塗り（A）、淡い面で警告だけ黄色（B）、すべて淡い面（C）、濃い塗り（D）、白い面に色の線（E）から比べてください。判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
        </p>
      </Comparison>
    </>
  ),
};

export const Shape: Story = {
  name: 'お知らせの形',
  // 色の既定は、決めた C（淡い面 — adr/0043）。比べたときの既定は B（警告だけ黄色の塗り）だった
  // 部品で描く行（A・E）も、tone の切り替えに合わせて色が変わる
  args: { tone: 'C', pick: 'A,E' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D', 'E'],
    },
    tone: {
      description: '色（「状態の色」の案）',
      control: 'inline-radio',
      options: ['A', 'B', 'C', 'D', 'E'],
    },
  },
  render: ({ pick, tone }) => (
    <div style={toneCandidates.find((c) => c.id === (tone || 'C'))?.tokens}>
      <style>{noticeCss}</style>
      <Comparison
        index={25}
        axis="お知らせと状態の色: お知らせの形"
        pick={pick}
        candidates={shapeCandidates}
        columns={shapeColumns}
        renderCell={(column, candidate) => {
          const found = shapeCandidates.find((c) => c.id === candidate.id);
          if (!found) return null;
          // 色の E（左の線と枠線）は部品にないので、そのときはこの中の Notice で描く
          const real = tone === 'E' ? undefined : realShape[found.id];
          if (column.label === 'フォームの上') return <FormTop candidate={found} real={real} />;
          if (column.label === 'カードの中') return <InCard candidate={found} real={real} />;
          return <Phone candidate={found} real={real} />;
        }}
      >
        <p>
          お知らせの形を選びます。題・本文・アイコン・操作（リンクやボタン）・閉じる ×
          の並べ方と、角丸・余白・線の付け方です。
        </p>
        <p>
          比べたときは、色を上の「状態の色」の
          B（淡い面で、警告だけ黄色の塗り）で仮に組んでいました。いまの既定は、決めた
          C（すべて淡い面 — ADR-0043）です。コントロールの tone で、A〜E の色に替えられます。色の E
          は左の線と枠線を持つので、tone を E にすると、どの形にも線が付き、A と D
          は同じ見た目になります。形の E（枠線）は面を白にするので、tone
          を替えても面の色は変わりません。
        </p>
        <p>
          どの案も、お知らせに影は付けません。影は押せることの記号で（原則1）、お知らせそのものは押せないためです。押せるのは中のリンクとボタンだけです。C
          の白いボタンは、ボタンなので影があります。
        </p>
        <p>
          読み上げの役割は、どの案も同じにしました。危険は role="alert"、ほかは role="status"
          です。どちらも、中身が変わったときに読む場所（live region）です。alert
          は読んでいる途中でも割り込み、status は区切りを待ちます。× は role
          の外に置き、「閉じる」と読みます。Chrome で測った値です。
        </p>
        <HeardTable />
        <p>
          ページを開いたときからあるお知らせは、多くの読み上げソフトで、どちらでも割り込みません。あとから出すときは、role
          の箱を先に置いておき、中身だけを入れます（部品を作るときに扱います）。
        </p>
        <p>
          左の列はフォームの上、真ん中はカードの中、右は指の寸法で幅の狭い画面です。×
          を押すと閉じ、「閉じたお知らせを戻す」で戻せます。判断の基準に最も近い案を1つ選び、一言添えてください。角丸（12px
          か 16px か）と、読み上げの役割の分け方（危険だけ alert
          でよいか）も、あわせて教えてください。
        </p>
      </Comparison>
    </div>
  ),
};

// ── 実装した Notice ─────────────────────────────────────

const appearances: [appearance: NoticeAppearance, label: string][] = [
  ['soft', 'soft（既定・色の C）'],
  ['filled', 'filled（色の D）'],
  ['outline', 'outline（形の E）'],
];

const densities: [density: 'fine' | 'coarse', label: string][] = [
  ['fine', 'マウス用の寸法'],
  ['coarse', '指用の寸法'],
];

const implementedSamples: Record<
  Tone,
  { title: string; body: string; button?: string; link: string }
> = {
  info: {
    title: 'メンテナンスのお知らせ',
    body: '9月20日の2時から4時まで、保存ができません。',
    link: '詳しく見る',
  },
  success: {
    title: '保存しました',
    body: '変更は、すぐにプロフィールに反映されます。',
    link: 'プロフィールを見る',
  },
  warning: {
    title: 'メールアドレスが確認されていません',
    body: '確認するまで、お知らせのメールは届きません。',
    button: '確認メールを送る',
    link: 'あとで',
  },
  danger: {
    title: '保存できませんでした',
    body: '通信が切れました。もう一度お試しください。',
    button: 'もう一度保存する',
    link: '下書きに残す',
  },
};

function ImplementedNotice({ tone, appearance }: { tone: Tone; appearance: NoticeAppearance }) {
  const [closed, setClosed] = useState(false);
  const sample = implementedSamples[tone];
  if (closed)
    return (
      <button
        type="button"
        className="cursor-pointer self-start text-xs text-fg-subtle underline underline-offset-4"
        onClick={() => setClosed(false)}
      >
        閉じたお知らせを戻す
      </button>
    );
  return (
    <RealNotice
      tone={tone}
      appearance={appearance}
      title={sample.title}
      onClose={() => setClosed(true)}
      actions={
        <>
          {sample.button && <Button color="surface">{sample.button}</Button>}
          <Link href="#" onClick={(e) => e.preventDefault()}>
            {sample.link}
          </Link>
        </>
      }
    >
      {sample.body}
    </RealNotice>
  );
}

export const Implemented: Story = {
  name: '実装した Notice',
  render: () => (
    <div className="flex min-h-screen flex-col gap-8 bg-bg px-6 py-8 text-fg">
      <header className="flex max-w-[68ch] flex-col gap-2">
        <h1 className="text-2xl font-heading">実装した Notice</h1>
        <p className="text-sm leading-6 text-fg-muted">
          tone（情報・成功・警告・危険）と appearance（soft・filled・outline）を指定した Notice
          です。どれも題・本文・操作・×
          を持ちます。操作は、警告と危険が白いボタンと文字のリンク、情報と成功が文字のリンクだけです。×
          を押すと閉じ、「閉じたお知らせを戻す」で戻せます。
        </p>
        <p className="text-sm leading-6 text-fg-muted">
          上はマウス用、下は指用の寸法に固定しています。Tab キーで、中のボタン・リンク・×
          のフォーカスの線を確かめられます。filled
          の中だけ、線がお知らせの文字の色（白か濃紺）になります。
        </p>
      </header>
      {densities.map(([density, label]) => (
        <section
          key={density}
          data-density={density}
          className="flex flex-col gap-4 border-t border-line pt-6"
        >
          <h2 className="text-sm font-bold">{label}</h2>
          <div className="grid gap-x-6 gap-y-4 md:grid-cols-3">
            {appearances.map(([appearance, appearanceLabel]) => (
              <div key={appearance} className="flex min-w-0 flex-col gap-3">
                <p className="text-xs text-fg-subtle">{appearanceLabel}</p>
                {tones.map((t) => (
                  <ImplementedNotice key={t} tone={t} appearance={appearance} />
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

// ── 実装した状態のタグ ─────────────────────────────────
// Tag の color に info・success・danger を足した（warning は adr/0038）。面と文字は soft のお知らせと同じ値 — adr/0043

const userTags: [color: 'primary' | 'secondary' | 'neutral', label: string][] = [
  ['primary', '公開中'],
  ['secondary', 'おすすめ'],
  ['neutral', '下書き'],
];

// 近い組み合わせ。情報と primary は同じ値、危険とピンクは面の差 0.6、成功と警告は文字の明度の比 1.02
const closePairs: [a: Tone | 'primary' | 'secondary', b: Tone | 'primary' | 'secondary'][] = [
  ['info', 'primary'],
  ['danger', 'secondary'],
  ['success', 'warning'],
];

const tagText: Record<Tone | 'primary' | 'secondary', string> = {
  ...tagSamples,
  primary: '公開中',
  secondary: 'おすすめ',
};

const TagRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-2">
    <p className="text-xs text-fg-subtle">{label}</p>
    <div className="flex flex-wrap items-center gap-1.5">{children}</div>
  </div>
);

export const ImplementedTags: Story = {
  name: '実装した状態のタグ',
  render: () => (
    <div className="flex min-h-screen flex-col gap-8 bg-bg px-6 py-8 text-fg">
      <header className="flex max-w-[68ch] flex-col gap-2">
        <h1 className="text-2xl font-heading">実装した状態のタグ</h1>
        <p className="text-sm leading-6 text-fg-muted">
          Tag の color に、状態の色の info・success・danger を足しました（warning
          はすでにあります）。面と文字は、soft のお知らせの面と題と同じ値です。info は primary
          と同じ値です。
        </p>
        <p className="text-sm leading-6 text-fg-muted">
          上はマウス用、下は指用の寸法に固定しています。
        </p>
      </header>
      {densities.map(([density, label]) => (
        <section
          key={density}
          data-density={density}
          className="flex flex-col gap-5 border-t border-line pt-6"
        >
          <h2 className="text-sm font-bold">{label}</h2>
          <TagRow label="利用者が選ぶ色（primary・secondary・neutral）">
            {userTags.map(([color, text]) => (
              <Tag key={color} color={color}>
                {text}
              </Tag>
            ))}
          </TagRow>
          <TagRow label="状態の色（info・success・warning・danger）">
            {tones.map((t) => (
              <Tag key={t} color={t}>
                {tagSamples[t]}
              </Tag>
            ))}
          </TagRow>
          <TagRow label="近い組み合わせ（情報と primary・危険とピンク・成功と警告）">
            {closePairs.map(([a, b]) => (
              <span key={a} className="me-4 inline-flex gap-1.5">
                <Tag color={a}>{tagText[a]}</Tag>
                <Tag color={b}>{tagText[b]}</Tag>
              </span>
            ))}
          </TagRow>
        </section>
      ))}
    </div>
  ),
};
