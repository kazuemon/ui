import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';

import { Badge } from '../../src/components/badge/Badge';
import { Chip } from '../../src/components/chip/Chip';
import { Tag } from '../../src/components/tag/Tag';
import { HashIcon } from '../../src/internal/icons';
import { type Candidate, Comparison } from './Comparison';

// 軸 265: Tag・Badge・Chip の大きさを 1 本の軸にそろえるか。値は tokens.css の --tag-*・--badge-*・--chip-*
// 背景: いまは Chip だけ大きさの props がなく、Combobox の chipSize（sm・md）が部品の外に 2 段を持っている（ADR-0237 / M-30）
const meta = {
  title: 'Design Review/265 Tag・Badge・Chip の大きさ',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

type Tokens = CSSProperties & Record<`--${string}`, string>;

/** sm: 今の Tag（高さ 20px・左右 8px・キャプションの文字） */
const sm: Tokens = {
  '--tag-height': '20px',
  '--tag-pad-x': 'calc(var(--spacing) * 2)',
  '--tag-font': 'var(--text-caption)',
  '--tag-leading': 'var(--leading-caption)',
  '--chip-height': '20px',
  '--chip-pad-x': 'calc(var(--spacing) * 2)',
  '--chip-font': 'var(--text-caption)',
  '--chip-leading': 'var(--leading-caption)',
  '--badge-size': '16px',
  '--badge-dot': '8px',
  '--badge-pad-x': 'var(--spacing)',
  '--badge-font': 'var(--text-caption)',
};

/** md: 今の欄の中のチップ（高さ 32px＝部品の高さ − 12px・左右 8px・部品の中の文字） */
const md: Tokens = {
  '--tag-height': 'calc(var(--spacing-control) - var(--spacing) * 3)',
  '--tag-pad-x': 'calc(var(--spacing) * 2)',
  '--tag-font': 'var(--text-control)',
  '--tag-leading': 'var(--leading-control)',
  '--chip-height': 'calc(var(--spacing-control) - var(--spacing) * 3)',
  '--chip-pad-x': 'calc(var(--spacing) * 2)',
  '--chip-font': 'var(--text-control)',
  '--chip-leading': 'var(--leading-control)',
  '--badge-size': '20px',
  '--badge-dot': '10px',
  '--badge-pad-x': 'calc(var(--spacing) * 1.5)',
  '--badge-font': 'var(--text-caption)',
};

/** lg: 今の単体の Chip（部品の高さ 44px・部品の左右の余白 16px・部品の中の文字） */
const lg: Tokens = {
  '--tag-height': 'var(--spacing-control)',
  '--tag-pad-x': 'var(--spacing-control-x)',
  '--tag-font': 'var(--text-control)',
  '--tag-leading': 'var(--leading-control)',
  '--chip-height': 'var(--spacing-control)',
  '--chip-pad-x': 'var(--spacing-control-x)',
  '--chip-font': 'var(--text-control)',
  '--chip-leading': 'var(--leading-control)',
  '--badge-size': '24px',
  '--badge-dot': '12px',
  '--badge-pad-x': 'calc(var(--spacing) * 2)',
  '--badge-font': '14px',
};

interface Step {
  name: string;
  tokens: Tokens;
}

/** 候補ごとの段。部品によって段の数が違う現行版も同じ形で書ける */
const steps: Record<string, { tag: Step[]; badge: Step[]; chip: Step[] }> = {
  current: {
    tag: [{ name: '1 段（props なし）', tokens: {} }],
    badge: [{ name: '1 段（props なし）', tokens: {} }],
    chip: [
      {
        name: '欄の中 sm（Combobox の既定）',
        tokens: {
          '--chip-height': 'var(--combobox-chip-height)',
          '--chip-pad-x': 'var(--combobox-chip-padding-x)',
        },
      },
      {
        name: '欄の中 md',
        tokens: {
          '--chip-height': 'calc(var(--spacing-control) - var(--spacing) * 2)',
          '--chip-pad-x': 'var(--combobox-chip-padding-x)',
        },
      },
      { name: '単体の既定（部品の高さ）', tokens: {} },
    ],
  },
  A: {
    tag: [
      { name: 'sm', tokens: sm },
      { name: 'md', tokens: md },
    ],
    badge: [
      { name: 'sm', tokens: sm },
      { name: 'md', tokens: md },
    ],
    chip: [
      { name: 'sm', tokens: sm },
      { name: 'md', tokens: md },
    ],
  },
  B: {
    tag: [
      { name: 'sm', tokens: sm },
      { name: 'md', tokens: md },
      { name: 'lg', tokens: lg },
    ],
    badge: [
      { name: 'sm', tokens: sm },
      { name: 'md', tokens: md },
      { name: 'lg', tokens: lg },
    ],
    chip: [
      { name: 'sm', tokens: sm },
      { name: 'md', tokens: md },
      { name: 'lg', tokens: lg },
    ],
  },
  C: {
    tag: [{ name: '段なし（周りの文字に従う）', tokens: {} }],
    badge: [{ name: '段なし（周りの文字に従う）', tokens: {} }],
    chip: [{ name: '段なし（周りの文字に従う）', tokens: {} }],
  },
};

/** A・B の行の既定。Tag と Badge は sm、Chip は md（いまの見た目に一番近い組み合わせ） */
const defaultsPerPart: Tokens = {
  '--tag-height': sm['--tag-height'],
  '--tag-pad-x': sm['--tag-pad-x'],
  '--tag-font': sm['--tag-font'],
  '--tag-leading': sm['--tag-leading'],
  '--badge-size': sm['--badge-size'],
  '--badge-dot': sm['--badge-dot'],
  '--badge-pad-x': sm['--badge-pad-x'],
  '--badge-font': sm['--badge-font'],
  '--chip-height': md['--chip-height'],
  '--chip-pad-x': md['--chip-pad-x'],
  '--chip-font': md['--chip-font'],
  '--chip-leading': md['--chip-leading'],
};

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '段がない（Chip だけ欄の中で 2 段）',
    intent:
      'Tag と Badge は大きさを選べない。Chip も props はなく、Combobox・TagsInput の chipSize（sm・md）が部品の外から高さを差し替えている',
    spec: [
      ['Tag', '高さ 20px・左右 8px・12px'],
      ['Badge', '丸 16px・点 8px・12px'],
      ['Chip', '単体 44px / 欄の中 32px・36px'],
      ['段の名前', 'Chip だけ sm・md（Combobox の props）'],
    ],
  },
  {
    id: 'A',
    name: '2 段（sm・md）を 3 部品でそろえる',
    intent:
      'sm は今の Tag、md は今の欄の中のチップ。3 部品が同じ段の名前を持ち、Combobox の chipSize は Chip の size に畳む',
    spec: [
      ['段', 'sm 20px / md 32px'],
      ['左右の余白', 'sm 8px / md 8px'],
      ['文字', 'sm キャプション 12px / md 部品の文字 16px'],
      ['Badge の丸', 'sm 16px / md 20px（点 8px・10px）'],
      ['既定（案）', 'Tag・Badge は sm、Chip は md'],
    ],
    tokens: defaultsPerPart,
  },
  {
    id: 'B',
    name: '3 段（sm・md・lg）',
    intent:
      'A に、部品の高さと同じ lg を足す。見出しの横に置くタグや、押して絞り込むチップのように、ボタンと並ぶ大きさが要る場所に使う',
    spec: [
      ['段', 'sm 20px / md 32px / lg 部品の高さ 44px'],
      ['左右の余白', 'sm 8px / md 8px / lg 部品の左右 16px'],
      ['文字', 'sm 12px / md 16px / lg 16px'],
      ['Badge の丸', 'sm 16px / md 20px / lg 24px（点 8・10・12px）'],
      ['既定（案）', 'Tag・Badge は sm、Chip は md'],
    ],
    tokens: defaultsPerPart,
  },
  {
    id: 'C',
    name: '段を持たず、周りの文字に従う（em）',
    intent:
      '高さ・余白・文字を em で書く。本文の中でも注記の中でも、置いた場所の文字の大きさに合わせて縮む。段の名前も props も増えない',
    spec: [
      ['Tag', '文字 0.75em・高さ 1.667em（16px の中で 12px / 20px）'],
      ['Chip', '文字 1em・高さ 2em（16px の中で 16px / 32px）'],
      ['Badge', '文字 0.75em・丸 1.333em・点 0.5em'],
      ['段', 'なし（size の props を足さない）'],
    ],
    tokens: {
      '--tag-font': '0.75em',
      '--tag-leading': '1.3334em',
      '--tag-height': '1.6667em',
      '--tag-pad-x': '0.6667em',
      '--chip-font': '1em',
      '--chip-leading': '1.5em',
      '--chip-height': '2em',
      '--chip-pad-x': '0.5em',
      '--badge-font': '0.75em',
      '--badge-size': '1.3334em',
      '--badge-dot': '0.5em',
      '--badge-pad-x': '0.3334em',
    },
  },
];

function StepBlock({ name, tokens, children }: Step & { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-fg-subtle">{name}</span>
      <div className="flex flex-wrap items-center gap-2" style={tokens}>
        {children}
      </div>
    </div>
  );
}

function InlineRow({ size, label }: { size: number; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-fg-subtle">{label}</span>
      <p className="leading-relaxed" style={{ fontSize: size }}>
        下書きの記事 <Tag color="primary">公開前</Tag> に <Badge count={3} color="danger" /> 件の
        コメントが付き、<Chip readOnly>デザイン</Chip> のタグが残っています。
      </p>
    </div>
  );
}

const noop = () => {};

export const Sizes: Story = {
  name: '大きさの段',
  render: () => (
    <Comparison
      index={265}
      axis="Tag・Badge・Chip の大きさの 1 本の軸"
      candidates={candidates}
      columns={[
        { label: 'Tag', note: '文字だけ・アイコン付き' },
        { label: 'Badge', note: '数（1桁・3桁）と点' },
        { label: 'Chip', note: '消せる・読み取り専用' },
        { label: '文字の中', note: '本文 16px と注記 14px に混ぜる' },
      ]}
      renderCell={(column, candidate) => {
        const set = steps[candidate.id];
        if (column.label === 'Tag') {
          return (
            <div className="flex flex-col gap-4">
              {set.tag.map((step) => (
                <StepBlock key={step.name} {...step}>
                  <Tag>下書き</Tag>
                  <Tag color="success">公開中</Tag>
                  <Tag color="primary" className="gap-1">
                    <HashIcon className="size-[1.2em] shrink-0" />
                    デザイン
                  </Tag>
                </StepBlock>
              ))}
            </div>
          );
        }
        if (column.label === 'Badge') {
          return (
            <div className="flex flex-col gap-4">
              {set.badge.map((step) => (
                <StepBlock key={step.name} {...step}>
                  <Badge count={3} color="danger" />
                  <Badge count={128} color="danger" />
                  <Badge color="success" />
                  <span className="text-xs text-fg-muted">稼働中</span>
                </StepBlock>
              ))}
            </div>
          );
        }
        if (column.label === 'Chip') {
          return (
            <div className="flex flex-col gap-4">
              {set.chip.map((step) => (
                <StepBlock key={step.name} {...step}>
                  <Chip onRemove={noop} removeName="デザインを外す">
                    デザイン
                  </Chip>
                  <Chip readOnly>実装</Chip>
                </StepBlock>
              ))}
            </div>
          );
        }
        return (
          <div className="flex flex-col gap-4">
            <InlineRow size={16} label="本文 16px" />
            <InlineRow size={14} label="注記 14px" />
          </div>
        );
      }}
    >
      <p>
        小物（Tag・Badge・Chip）の大きさを、3 部品で 1 本の軸にそろえるかを選びます。いまは Chip
        だけ大きさの props がなく、Combobox・TagsInput の chipSize（sm・md）が部品の外から高さを
        差し替えています。決めたいのは、段の数と名前、Badge を同じ軸に乗せるか、そして既定です。
      </p>
      <p>
        推奨は <strong>B（3 段 sm・md・lg）</strong>です。sm・md・lg のどれも今ある値（今の Tag、
        今の欄の中のチップ、部品の高さ）で、新しい寸法を増やしません。lg
        があると、押して絞り込むチップや 見出しの横のタグが、ボタンと同じ高さで並べられます。A（2
        段） でも足りますが、lg が要る場面が出るたびに className
        で高さを足すことになります。C（em）は Prose
        の中に置くときは気持ちよく縮みますが、ボタンや入力欄と並べたときの高さが
        周りの文字しだいで決まってしまうので、部品どうしの縦のそろいが崩れます。
      </p>
      <p>
        なお、いまの chipSize=&quot;md&quot; は、実際には sm と同じ高さで描かれています（チップに
        --combobox-chip-height と --spacing-control を互いに参照する形で置いていて、CSS
        が循環と見て両方を捨てるため）。この行の 36px
        は、同じ計算をチップの外から渡して描いたものです。段を決めたら、この渡し方も一緒に直します。
      </p>
      <p>
        Badge も同じ段に乗せることを勧めます（sm 16px・md 20px・lg
        24px、点はその半分強）。数の丸だけ段を持たないと、md の Tag の横に 16px
        の丸が付いたときに小さく見えます。
      </p>
      <p>
        既定をどうするか教えてください。案は「部品ごとに違う既定」——Tag と Badge は sm、Chip は md
        （どれも今の見た目のまま）です。もう一つは「3 部品とも同じ既定」で、その場合は sm と md
        のどちらを既定にするかも選んでください。なお sm の Chip（高さ 20px）は、消す × の丸が 8px
        まで小さくなります。C の列と A・B の sm の行で確かめて、sm の Chip
        は消せない（読み取り専用）用途だけにするか、 ×
        の丸の詰め方を別に決めるかも合わせて教えてください。
      </p>
    </Comparison>
  ),
};
