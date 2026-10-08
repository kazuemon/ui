import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Card } from '../../src/components/card/Card';
import { LoadingOverlay } from '../../src/components/loading-overlay/LoadingOverlay';
import { TextField } from '../../src/components/text-field/TextField';

// 軸 642: LoadingOverlay が出るまでの待ちと、出る・消える動き
const meta = {
  title: 'Design Review/642 LoadingOverlay の待ちと動き',
  id: 'design-review-642-loading-overlay-timing',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

interface Timing {
  delay: number;
  minDuration: number;
}

const timings: Record<string, Timing> = {
  current: { delay: 200, minDuration: 400 },
  A: { delay: 200, minDuration: 400 },
  B: { delay: 200, minDuration: 400 },
  C: { delay: 0, minDuration: 0 },
};

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '待ち 200ms・最低 400ms・出入りとも 0.2 秒',
    intent:
      '0.2 秒以内に終わる読み込みでは出ない。出したら 0.4 秒は残す。出入りは 0.2 秒のフェード',
    spec: [
      ['出るまでの待ち', '200ms'],
      ['出したら最低', '400ms'],
      ['入り・抜け', '200ms・200ms'],
    ],
    tokens: { '--loading-overlay-duration-in': '200ms', '--loading-overlay-duration-out': '200ms' },
  },
  {
    id: 'A',
    name: '入りはすぐ・抜けは 0.4 秒',
    intent:
      '同じ待ち・最低の長さのまま、出るときは動かさずすぐ出し、消えるときだけ 0.4 秒かけて抜ける',
    spec: [
      ['出るまでの待ち', '200ms'],
      ['出したら最低', '400ms'],
      ['入り・抜け', 'すぐ・400ms'],
    ],
    tokens: { '--loading-overlay-duration-in': '0ms', '--loading-overlay-duration-out': '400ms' },
  },
  {
    id: 'B',
    name: '入りはすぐ・抜けは 0.8 秒',
    intent: 'A より抜けを長く（0.8 秒）して、終わった余韻をはっきり残す',
    spec: [
      ['出るまでの待ち', '200ms'],
      ['出したら最低', '400ms'],
      ['入り・抜け', 'すぐ・800ms'],
    ],
    tokens: { '--loading-overlay-duration-in': '0ms', '--loading-overlay-duration-out': '800ms' },
  },
  {
    id: 'C',
    name: '待たず、入りはすぐ・抜けは 0.4 秒',
    intent:
      '待ちも最低の長さもなくし、一瞬で終わる読み込みでも幕を出して、抜けの動きだけで終わりを伝える。幕は点滅せず、ふわっと消える',
    spec: [
      ['出るまでの待ち', 'なし'],
      ['出したら最低', 'なし'],
      ['入り・抜け', 'すぐ・400ms'],
    ],
    tokens: { '--loading-overlay-duration-in': '0ms', '--loading-overlay-duration-out': '400ms' },
  },
];

const columns: (Column & { ms: number })[] = [
  { label: '1.5 秒かかる読み込み', note: '遅い読み込み。幕の出入りの動きを見る', ms: 1500 },
  { label: '0.15 秒で終わる読み込み', note: '一瞬で終わる。幕が出てはいけない', ms: 150 },
  {
    label: '0.35 秒かかる読み込み',
    note: '待ちを少し過ぎて終わる。出て消えるまでの具合を見る',
    ms: 350,
  },
];

function Trial({ timing, ms }: { timing: Timing; ms: number }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col items-start gap-3">
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), ms);
        }}
      >
        読み込む
      </Button>
      <LoadingOverlay
        loading={loading}
        delay={timing.delay}
        minDuration={timing.minDuration}
        className="w-64 rounded-card"
      >
        <Card>
          <div className="flex flex-col gap-3 p-4">
            <p className="font-bold">今月の記録</p>
            <TextField label="メモ" />
          </div>
        </Card>
      </LoadingOverlay>
    </div>
  );
}

export const Axis: Story = {
  name: '待ちと動き',
  render: ({ pick }) => (
    <Comparison
      index={642}
      axis="LoadingOverlay が出るまでの待ちと動き"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <Trial timing={timings[candidate.id]} ms={(column as (typeof columns)[number]).ms} />
      )}
    >
      <p>
        返事:
        動きを付けるなら、入りはすぐ、抜けはゆっくり（一瞬の幕でも、終わりの動きに余裕を持たせる）。この案を、いまの待ち・最低の長さと組み合わせて並べました。
      </p>
      <p>
        読み込みが一瞬で終わるときに幕がちらつかないよう、出すまで少し待ちます。待ちの長さと、出入りの動きを選びます。各行の「読み込む」を押して、列ごとの長さの読み込みを試せます。
      </p>
      <p>
        既定を 1 つ選び、ほかの案も選べるようにするかを答えてください（待ちは
        `delay`、出したあとの最低の長さは `minDuration` で変えられます）。
      </p>
    </Comparison>
  ),
};
