import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Card, CardBody } from '../../src/components/card/Card';
import { Stat } from '../../src/components/stat/Stat';

// 軸 431: Stat の読み込み中（loading）。数字の場所に置く Skeleton の帯の長さ・太さ・角
const meta = {
  title: 'Design Review/431 数字の読み込み中',
  id: 'design-review-431-stat-loading',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['A,current', '', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '読み込み中なし',
    intent:
      'いまの Stat。読み込み中の形がないので、使う側が「—」などの文字を数字の場所に入れている。比べるための基準',
    spec: [
      ['帯', 'なし（「—」を入れる）'],
      ['読み上げ', '「—」をそのまま読む'],
    ],
  },
  {
    id: 'A',
    name: '文字の行と同じ帯（1em）',
    intent:
      'Skeleton の文字の行をそのまま使う。帯の太さは文字の大きさ（1em）で、数字の文字より少し背が高い。長さは 3 文字ほど',
    spec: [
      ['長さ', '3em'],
      ['太さ', '1em（Skeleton の文字の行と同じ）'],
      ['角', '小さな角（radius-sm）'],
    ],
    tokens: {
      '--stat-loading-width': '3em',
      '--stat-loading-bar': '1em',
      '--stat-loading-radius': 'var(--radius-sm)',
    },
  },
  {
    id: 'B',
    name: '数字の高さの帯（0.7em）',
    intent:
      '帯の太さを数字の字面の高さ（およそ 0.7em）に合わせる。大きな数字でも帯が太くなりすぎず、読み込んだあとの数字と同じ重さに見える',
    spec: [
      ['長さ', '3em'],
      ['太さ', '0.7em（数字の字面）'],
      ['角', '小さな角（radius-sm）'],
    ],
    tokens: {
      '--stat-loading-width': '3em',
      '--stat-loading-bar': '0.7em',
      '--stat-loading-radius': 'var(--radius-sm)',
    },
  },
  {
    id: 'C',
    name: '数字の高さの帯・長め（5em）',
    intent:
      'B の帯を 5 文字ほどに伸ばす。売上のような桁の多い数字の代わりに置いたとき、読み込んだあとの幅に近い',
    spec: [
      ['長さ', '5em'],
      ['太さ', '0.7em（数字の字面）'],
      ['角', '小さな角（radius-sm）'],
    ],
    tokens: {
      '--stat-loading-width': '5em',
      '--stat-loading-bar': '0.7em',
      '--stat-loading-radius': 'var(--radius-sm)',
    },
  },
  {
    id: 'D',
    name: '数字の高さの帯・丸い端',
    intent: 'B の帯の端を pill にする。タグやバーと同じ丸い端で、やわらかく見える',
    spec: [
      ['長さ', '3em'],
      ['太さ', '0.7em（数字の字面）'],
      ['角', 'pill'],
    ],
    tokens: {
      '--stat-loading-width': '3em',
      '--stat-loading-bar': '0.7em',
      '--stat-loading-radius': 'var(--radius-pill)',
    },
  },
];

const columns: Column[] = [
  { label: '既定の大きさ（2xl）', note: '単位・増減・キャプションあり' },
  { label: '読み込んだあと', note: '同じ Stat。高さが変わらないか' },
  { label: '小さい段を 3 つ並べる', note: 'size="lg"・カードの上' },
  { label: '大きい段（4xl）・中央寄せ' },
];

const current = (candidate: Candidate) => candidate.id === '現行版';

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={431}
      axis="数字の読み込み中"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const loading = !current(candidate);
        const value = current(candidate) ? '—' : 128;
        switch (column.label) {
          case '既定の大きさ（2xl）':
            return (
              <Stat
                label="公開記事"
                value={value}
                unit="件"
                delta="12%"
                deltaIndicator="up"
                caption="先月比"
                loading={loading}
              />
            );
          case '読み込んだあと':
            return (
              <Stat
                label="公開記事"
                value={128}
                unit="件"
                delta="12%"
                deltaIndicator="up"
                caption="先月比"
              />
            );
          case '小さい段を 3 つ並べる':
            return (
              <Card className="w-[420px]">
                <CardBody className="grid grid-cols-3 gap-4">
                  <Stat
                    label="訪問"
                    value={current(candidate) ? '—' : '12,480'}
                    size="lg"
                    loading={loading}
                  />
                  <Stat
                    label="稼働率"
                    value={current(candidate) ? '—' : '99.9'}
                    unit="%"
                    size="lg"
                    loading={loading}
                  />
                  <Stat
                    label="売上"
                    value={current(candidate) ? '—' : '¥1.2M'}
                    size="lg"
                    loading={loading}
                  />
                </CardBody>
              </Card>
            );
          default:
            return (
              <Stat
                label="参加者"
                value={current(candidate) ? '—' : '1,024'}
                unit="人"
                size="4xl"
                align="center"
                loading={loading}
              />
            );
        }
      }}
    >
      <p>
        決定: loading を渡したときは A（Skeleton の文字の行と同じ太さ 1em・長さ
        3em・小さな角）。値がなく loading
        も渡さないときは現行版のまま（使う側が「—」などを入れ、部品は何も足さない）。ユーザーの返事「値が無い時は現行版になって、loading
        なら A になるとかですかね。」
      </p>
      <p>
        Stat に読み込み中（loading）を足しました。数字の場所に Skeleton の文字の行を 1
        本置き、全体に aria-busy
        を付けます。読み上げでは、数字の代わりに「読み込んでいます」と読みます。
      </p>
      <p>
        選ぶのは、帯の長さ・太さ・角です。帯の行の高さは数字と同じなので、読み込んだときに下の内容は跳びません。ラベル・単位・キャプションは読み込む前から出し、増減は数字と一緒に届くものとして読み込むまで出しません（別の扱いがよければ教えてください）。どれを既定にするかも教えてください。
      </p>
    </Comparison>
  ),
};
