import { CalendarBlankIcon, HashIcon, MapPinIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Chip } from '../../src/components/chip/Chip';
import { Icon } from '../../src/components/icon/Icon';
import { Tag } from '../../src/components/tag/Tag';

// 軸 419: Tag・Chip の先頭のアイコン（icon）の大きさと色
const meta = {
  title: 'Design Review/419 タグとチップの先頭のアイコン',
  id: 'design-review-419-small-parts-icon',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const tokens = (scale: string, mix: string) => ({
  '--small-parts-icon-scale': scale,
  '--small-parts-icon-mix': mix,
  '--small-parts-icon-gap': 'calc(var(--spacing) * 1)',
});

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'アイコンを置けない',
    intent:
      'icon を持たない。子に置くと、大きさも間もそろわない。比べるための基準（文字だけで描く）',
    spec: [['アイコン', 'なし']],
    tokens: tokens('1.25', '100%'),
  },
  {
    id: 'A',
    name: '文字と同じ大きさ・文字の色',
    intent:
      'アイコンを文字の大きさ（1em）にする。sm で 12px、md・lg で 16px。小さなタグでも上下が詰まらない',
    spec: [
      ['大きさ', '文字の 1 倍（sm 12px・md/lg 16px）'],
      ['色', '文字と同じ'],
      ['文字との間', '4px'],
    ],
    tokens: tokens('1', '100%'),
  },
  {
    id: 'B',
    name: '文字の 1.25 倍・文字の色',
    intent:
      'Icon の既定（文の中のアイコン）と同じ 1.25 倍。sm で 15px、md・lg で 20px。ボタンやリンクの中のアイコンと同じ比率',
    spec: [
      ['大きさ', '文字の 1.25 倍（sm 15px・md/lg 20px）'],
      ['色', '文字と同じ'],
      ['文字との間', '4px'],
    ],
    tokens: tokens('1.25', '100%'),
  },
  {
    id: 'C',
    name: '文字と同じ大きさ・淡い色',
    intent:
      'A の大きさで、アイコンの色を文字の色の 65% に薄める。文字を主役にし、アイコンは添えるだけにする',
    spec: [
      ['大きさ', '文字の 1 倍'],
      ['色', '文字の色 65%'],
      ['文字との間', '4px'],
    ],
    tokens: tokens('1', '65%'),
  },
  {
    id: 'D',
    name: '文字の 1.25 倍・淡い色',
    intent: 'B の大きさで、色を 65% に薄める。大きさで形を読ませ、色で重さを抑える',
    spec: [
      ['大きさ', '文字の 1.25 倍'],
      ['色', '文字の色 65%'],
      ['文字との間', '4px'],
    ],
    tokens: tokens('1.25', '65%'),
  },
];

const columns: Column[] = [
  { label: 'Tag', note: 'sm・md・lg' },
  { label: 'Tag の色', note: '7 色（sm）' },
  { label: 'Tag の形', note: 'soft・outline・solid（軸 418 の A）' },
  { label: 'Chip', note: 'sm・md・lg。消すボタンあり' },
  { label: 'ブログの記事の見出し' },
];

const colors = ['primary', 'secondary', 'neutral', 'info', 'success', 'warning', 'danger'] as const;
const noop = () => {};

function Cell({ column, candidate }: { column: Column; candidate: Candidate }) {
  const icon = (glyph: typeof HashIcon) =>
    candidate.id === '現行版' ? undefined : <Icon icon={glyph} />;
  switch (column.label) {
    case 'Tag':
      return (
        <div className="flex flex-col items-start gap-2">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Tag key={size} size={size} icon={icon(HashIcon)}>
              デザイン
            </Tag>
          ))}
        </div>
      );
    case 'Tag の色':
      return (
        <div className="flex w-[240px] flex-wrap gap-2">
          {colors.map((color) => (
            <Tag key={color} color={color} icon={icon(HashIcon)}>
              {color}
            </Tag>
          ))}
        </div>
      );
    case 'Tag の形':
      return (
        <div className="flex flex-col items-start gap-2">
          {(['soft', 'outline', 'solid'] as const).map((variant) => (
            <Tag key={variant} variant={variant} color="primary" icon={icon(CalendarBlankIcon)}>
              10 月 1 日
            </Tag>
          ))}
        </div>
      );
    case 'Chip':
      return (
        <div className="flex flex-col items-start gap-2">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Chip
              key={size}
              size={size}
              icon={icon(MapPinIcon)}
              onRemove={noop}
              removeName="東京を外す"
            >
              東京
            </Chip>
          ))}
        </div>
      );
    default:
      return (
        <div className="flex w-[260px] flex-col gap-2">
          <p className="text-lg font-bold">デザインシステムを 1 軸ずつ決める</p>
          <div className="flex flex-wrap gap-1.5">
            <Tag icon={icon(HashIcon)}>デザイン</Tag>
            <Tag icon={icon(HashIcon)}>React</Tag>
            <Tag variant="outline" icon={icon(CalendarBlankIcon)}>
              10 月 1 日
            </Tag>
          </div>
        </div>
      );
  }
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={419}
      axis="タグとチップの先頭のアイコン"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => <Cell column={column} candidate={candidate} />}
    >
      <p>
        決定: A（文字と同じ大きさ・文字の色）。アイコンの色は既定でタグの文字の色、Text の color
        と同じ色を選べるようにする。65% に薄める案は採らない。「A
        でいいかなと思いますが、そもそもアイコン色は Text と同じものが選べる（したがってデフォルトは
        Text
        の色）と良さそうです。サイズについては同じ大きさが一番バランスがいいかなと思っています。」
      </p>
      <p>
        Tag と Chip に icon
        を足し、文字の前にアイコンを置けるようにします。大きさと色はタグ（チップ）が決め、Icon
        でも素の svg でも同じ見た目にそろえます。Tag と Chip は同じ値を使います。
      </p>
      <p>選ぶのは、アイコンの大きさ（文字に対する比率）と色です。文字との間はどの案も 4px です。</p>
    </Comparison>
  ),
};
