import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Avatar } from '../../src/components/avatar/Avatar';

// 軸 463: Avatar の 24px より小さい段（size="xs"）の大きさ・頭文字の大きさ・輪郭の太さ
const meta = {
  title: 'Design Review/463 アバターのいちばん小さい段',
  id: 'design-review-463-avatar-xs',
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

// 見本の画像（外に取りに行かない）
const svg = (body: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">${body}</svg>`)}`;
const photo = svg(
  '<rect width="160" height="160" fill="#7cc4f8"/><circle cx="80" cy="64" r="30" fill="#fff4cc"/><path d="M16 160c0-35 29-56 64-56s64 21 64 56Z" fill="#2f6b58"/>'
);
const palePhoto = svg(
  '<rect width="160" height="160" fill="#fdfdfd"/><circle cx="80" cy="66" r="28" fill="#f4f6f7"/><path d="M20 160c0-33 27-53 60-53s60 20 60 53Z" fill="#f7f9fa"/>'
);

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'いちばん小さいのは 24px',
    intent:
      'いまの段。xs がなく、いちばん小さい sm（24px）を小さい文字の横に置く。この行は sm で描く',
    spec: [
      ['大きさ', '24px（sm）'],
      ['頭文字', '10px'],
      ['輪郭', '1px'],
    ],
  },
  {
    id: 'A',
    name: '16px・頭文字 8px',
    intent:
      'アイコンの小さい段（16px）とそろえ、キャプション（12px）の行に収める。頭文字は 8px で、欧文の 2 文字は読みにくい',
    spec: [
      ['大きさ', '16px'],
      ['頭文字', '8px'],
      ['輪郭', '1px'],
    ],
    tokens: {
      '--avatar-size-xs': '16px',
      '--avatar-text-xs': '8px',
      '--avatar-outline-width-xs': '1px',
    },
  },
  {
    id: 'B',
    name: '16px・輪郭を細く',
    intent:
      'A の輪郭を 0.5px にする。16px の円では 1px の輪郭が太く見えるため。等倍の画面では 1px に丸めるか、消えることがある',
    spec: [
      ['大きさ', '16px'],
      ['頭文字', '8px'],
      ['輪郭', '0.5px'],
    ],
    tokens: {
      '--avatar-size-xs': '16px',
      '--avatar-text-xs': '8px',
      '--avatar-outline-width-xs': '0.5px',
    },
  },
  {
    id: 'C',
    name: '16px・頭文字 9px',
    intent:
      'A の頭文字を 1px 大きくする。和文の 1 文字は読みやすくなるが、欧文の 2 文字は円の縁に近づく',
    spec: [
      ['大きさ', '16px'],
      ['頭文字', '9px'],
      ['輪郭', '1px'],
    ],
    tokens: {
      '--avatar-size-xs': '16px',
      '--avatar-text-xs': '9px',
      '--avatar-outline-width-xs': '1px',
    },
  },
  {
    id: 'D',
    name: '20px・頭文字 9px',
    intent:
      '16px と 24px のあいだ。本文（14〜16px）の行に収まり、頭文字も読める。キャプションの行（行の高さ 16〜18px）からははみ出す',
    spec: [
      ['大きさ', '20px'],
      ['頭文字', '9px'],
      ['輪郭', '1px'],
    ],
    tokens: {
      '--avatar-size-xs': '20px',
      '--avatar-text-xs': '9px',
      '--avatar-outline-width-xs': '1px',
    },
  },
];

const columns: Column[] = [
  { label: '中身を並べる', note: '画像・白っぽい画像・和文・欧文・アイコン・四角' },
  { label: 'キャプションの横', note: '12px の文字の行' },
  { label: '本文の横', note: '部品の文字の行' },
  { label: '色付きの頭文字', note: 'primary・secondary' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={463}
      axis="アバターのいちばん小さい段"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const size = candidate.id === '現行版' ? 'sm' : 'xs';
        switch (column.label) {
          case '中身を並べる':
            return (
              <div className="flex items-center gap-3">
                <Avatar size={size} src={photo} alt="かずえもん" />
                <Avatar size={size} src={palePhoto} alt="かずえもん" />
                <Avatar size={size} name="かずえもん" />
                <Avatar size={size} name="Kazuya Miyamoto" />
                <Avatar size={size} name="かずえもん" fallback="icon" />
                <Avatar size={size} shape="square" src={photo} alt="かずえもん" />
              </div>
            );
          case 'キャプションの横':
            return (
              <p className="flex items-center gap-1.5 text-caption leading-caption text-fg-subtle">
                <Avatar size={size} src={photo} alt="" />
                かずえもん・3 分前に編集
              </p>
            );
          case '本文の横':
            return (
              <p className="flex items-center gap-2 text-control leading-control">
                <Avatar size={size} name="Kazuya Miyamoto" alt="" />
                Kazuya Miyamoto がコメントしました
              </p>
            );
          default:
            return (
              <div className="flex items-center gap-3">
                <Avatar size={size} name="かずえもん" color="primary" />
                <Avatar size={size} name="Kazuya Miyamoto" color="secondary" />
              </div>
            );
        }
      }}
    >
      <p>
        Avatar に、24px
        より小さい段（xs）を足しました。キャプションや表の小さい文字の横に、誰のものかを添えるときに使います。
        四角の角は 4px にしています。
      </p>
      <p>
        選ぶのは、大きさ・頭文字の大きさ・輪郭の太さです。xs で欧文の頭文字を 1 文字にするか（いまは
        2 文字）も教えてください。
      </p>
    </Comparison>
  ),
};
