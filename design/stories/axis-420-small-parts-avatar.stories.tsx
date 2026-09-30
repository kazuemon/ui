import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Avatar } from '../../src/components/avatar/Avatar';
import { Chip } from '../../src/components/chip/Chip';
import { Tag } from '../../src/components/tag/Tag';

// 軸 420: Tag・Chip の先頭のアバター（avatar）の大きさと左の余白
const meta = {
  title: 'Design Review/420 タグとチップの先頭のアバター',
  id: 'design-review-420-small-parts-avatar',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
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

const tokens = (inset: string, gap: string) => ({
  '--small-parts-avatar-inset': inset,
  '--small-parts-avatar-gap': gap,
});

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'アバターを置けない',
    intent: 'avatar を持たない。比べるための基準（文字だけで描く）',
    spec: [['アバター', 'なし']],
    tokens: tokens('calc(var(--spacing) * 0.5)', 'calc(var(--spacing) * 1)'),
  },
  {
    id: 'A',
    name: '周りに 2px',
    intent:
      'アバターを上下と左に 2px 空けて置く。pill の丸とアバターの丸がほぼ同心になり、左の端がそろう',
    spec: [
      ['上下・左の余白', '2px'],
      ['大きさ', '高さ − 4px（sm 16px）'],
      ['文字との間', '4px'],
    ],
    tokens: tokens('calc(var(--spacing) * 0.5)', 'calc(var(--spacing) * 1)'),
  },
  {
    id: 'B',
    name: '周りに 4px',
    intent: 'アバターを一回り小さくし、4px 空ける。面の中に収まって見え、軽い',
    spec: [
      ['上下・左の余白', '4px'],
      ['大きさ', '高さ − 8px（sm 12px）'],
      ['文字との間', '4px'],
    ],
    tokens: tokens('calc(var(--spacing) * 1)', 'calc(var(--spacing) * 1)'),
  },
  {
    id: 'C',
    name: '高さいっぱい',
    intent:
      'アバターを高さいっぱいにし、左の端に着ける。顔がいちばん大きく見える。縁のある形では縁に重なる',
    spec: [
      ['上下・左の余白', '0'],
      ['大きさ', '高さと同じ（sm 20px）'],
      ['文字との間', '4px'],
    ],
    tokens: tokens('0px', 'calc(var(--spacing) * 1)'),
  },
  {
    id: 'D',
    name: '周りに 2px・文字との間を広く',
    intent:
      'A の大きさで、文字との間を 6px に広げる。大きい段で顔と文字が詰まって見えないようにする',
    spec: [
      ['上下・左の余白', '2px'],
      ['大きさ', '高さ − 4px'],
      ['文字との間', '6px'],
    ],
    tokens: tokens('calc(var(--spacing) * 0.5)', 'calc(var(--spacing) * 1.5)'),
  },
];

const columns: Column[] = [
  { label: 'Tag', note: 'sm・md・lg' },
  { label: 'Tag の形', note: 'soft・outline・solid（軸 418 の A）' },
  { label: 'Chip', note: 'sm・md・lg。消すボタンあり' },
  { label: '頭文字', note: '画像がないとき' },
  { label: '並べたとき', note: '参加者の一覧' },
];

// 見本の画像（外に取りに行かない）
const svg = (body: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">${body}</svg>`)}`;
const photo = svg(
  '<rect width="160" height="160" fill="#7cc4f8"/><circle cx="80" cy="64" r="30" fill="#fff4cc"/><path d="M16 160c0-35 29-56 64-56s64 21 64 56Z" fill="#2f6b58"/>'
);
const photo2 = svg(
  '<rect width="160" height="160" fill="#f8b4c8"/><circle cx="80" cy="64" r="30" fill="#ffe7d1"/><path d="M16 160c0-35 29-56 64-56s64 21 64 56Z" fill="#5b4a8a"/>'
);
const noop = () => {};

function Cell({ column, candidate }: { column: Column; candidate: Candidate }) {
  const face = (src: string | undefined, name: string) =>
    candidate.id === '現行版' ? undefined : <Avatar src={src} name={name} alt="" />;
  switch (column.label) {
    case 'Tag':
      return (
        <div className="flex flex-col items-start gap-2">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Tag key={size} size={size} avatar={face(photo, 'かずえもん')}>
              かずえもん
            </Tag>
          ))}
        </div>
      );
    case 'Tag の形':
      return (
        <div className="flex flex-col items-start gap-2">
          {(['soft', 'outline', 'solid'] as const).map((variant) => (
            <Tag
              key={variant}
              size="md"
              variant={variant}
              color="primary"
              avatar={face(photo, 'かずえもん')}
            >
              かずえもん
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
              avatar={face(photo2, '山田 花子')}
              onRemove={noop}
              removeName="山田 花子を外す"
            >
              山田 花子
            </Chip>
          ))}
        </div>
      );
    case '頭文字':
      return (
        <div className="flex flex-col items-start gap-2">
          <Tag size="sm" avatar={face(undefined, 'Kazuemon')}>
            Kazuemon
          </Tag>
          <Chip size="md" avatar={face(undefined, '山田 花子')}>
            山田 花子
          </Chip>
          <Tag size="lg" avatar={face(undefined, 'Kazuemon')}>
            Kazuemon
          </Tag>
        </div>
      );
    default:
      return (
        <div className="flex w-[260px] flex-wrap gap-2">
          <Chip avatar={face(photo, 'かずえもん')} onRemove={noop} removeName="かずえもんを外す">
            かずえもん
          </Chip>
          <Chip avatar={face(photo2, '山田 花子')} onRemove={noop} removeName="山田 花子を外す">
            山田 花子
          </Chip>
          <Chip avatar={face(undefined, '佐藤 次郎')} onRemove={noop} removeName="佐藤 次郎を外す">
            佐藤 次郎
          </Chip>
        </div>
      );
  }
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={420}
      axis="タグとチップの先頭のアバター"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => <Cell column={column} candidate={candidate} />}
    >
      <p>
        Tag と Chip に avatar
        を足し、文字の前に人の顔（Avatar）を置けるようにします。アバターの大きさはタグ（チップ）の高さから決め、Avatar
        の size は使いません。Tag と Chip は同じ値を使います。
      </p>
      <p>
        選ぶのは、アバターの周りの余白（上下と左）と、文字との間です。アバターの左の余白は、文字だけのときの左右の余白より狭くします（丸の中に丸を置くので）。
      </p>
    </Comparison>
  ),
};
