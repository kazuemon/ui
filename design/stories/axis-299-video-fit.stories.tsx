import type { Meta, StoryObj } from '@storybook/react-vite';

import { type VideoFit, Video } from '../../src/components/video/Video';
import sample from '../../src/components/video/__fixtures__/sample.webm?url';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 299: Video の中身の収め方（object-fit）。
//   決定: 既定値を持たせず、fit（'cover' | 'contain'）を必須の props にした（渡さないと型エラー）。
//   cover・contain のどちらも成り立つ選び方なので、単一のトークンの既定値ではなく props で使う側に選んでもらう形にした
//   （tokens.css の --video-fit は削除。--video-letterbox-fill は contain の余白の色として残す）
//   ここでは実際の fit を切り替えて比べる（トークンの上書きではない）。動画は 16:9 の見本を、枠の比を変えて収め方の違いを目立たせる

const meta = {
  title: 'Design Review/299 Video の収め方',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

const candidates: Candidate[] = [
  {
    id: 'current',
    name: 'cover（切り取って埋める）',
    intent:
      'Image・AspectRatio の既定と同じ。枠からはみ出た分を切り取り、隙間なく埋める。部品をまたいで収め方がそろう（整然）',
    spec: [['fit', 'cover']],
  },
  {
    id: 'A',
    name: 'contain（収める）',
    intent:
      '枠に収まるように縮め、余白は letterbox-fill の色で埋める。操作の録画・デモのように、切り取ると必要な UI が見えなくなる動画向け',
    spec: [
      ['fit', 'contain'],
      ['letterbox-fill', 'var(--skeleton-fill)'],
    ],
  },
];

const fitOf: Record<string, VideoFit> = { current: 'cover', A: 'contain' };

const columns: Column[] = [{ label: '正方形の枠（ratio=1）' }, { label: '縦長の枠（ratio=9/16）' }];

const ratioOf: Record<string, number> = {
  '正方形の枠（ratio=1）': 1,
  '縦長の枠（ratio=9/16）': 9 / 16,
};

export const Fit: Story = {
  name: '収め方',
  render: () => (
    <Comparison
      index={299}
      axis="Video の中身の収め方（object-fit）"
      pick="current,A"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <div className="w-48">
          <Video ratio={ratioOf[column.label]} src={sample} fit={fitOf[candidate.id]} />
        </div>
      )}
    >
      <p>
        決定: <code>fit</code> に既定値は持たせず、必ず渡してもらう形にしました。動画は 16:9
        の見本で、枠だけを正方形・縦長にして、切り取り方の違いを目立たせています。
      </p>
      <p>
        cover は Image・AspectRatio
        の既定と同じ切り取り方で、枠いっぱいに隙間なく埋まります。ただし枠の比が
        元の動画と大きく違うと、操作の録画のように画面の端の UI
        が切れて見えなくなることがあります。contain
        は切り取らず、余白（letterbox）を残したまま全体を見せます。デモ・録画のような「見せたい範囲が決まっている」動画に向きますが、
        枠の比によっては余白が目立ちます。どちらも成り立つ選び方なので、既定を 1
        つに決めず、使う側に選んでもらいます。
      </p>
    </Comparison>
  ),
};
