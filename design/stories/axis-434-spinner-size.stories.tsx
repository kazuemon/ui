import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Card, CardBody } from '../../src/components/card/Card';
import { Spinner } from '../../src/components/loading/Loading';
import { Text } from '../../src/components/text/Text';

// 軸 434: 回る円（Spinner）の大きさの段（size）と、段ごとの線の太さ・薄い輪の濃さ
const meta = {
  title: 'Design Review/434 回る円の大きさ',
  id: 'design-review-434-spinner-size',
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

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '大きさは 1 つだけ',
    intent:
      'いまの回る円。部品の中の文字と並ぶ大きさ（指用 16px・マウス用 20px）しかなく、sm・md・lg を選んでも同じ大きさになる。比べるための基準',
    spec: [
      ['sm・md・lg', 'すべて部品のアイコンと同じ'],
      ['線', '大きさに比例（16px で 2px）'],
      ['薄い輪', '30%'],
    ],
    tokens: {
      '--spinner-size-sm': 'var(--spacing-icon)',
      '--spinner-size-md': 'var(--spacing-icon)',
      '--spinner-size-lg': 'var(--spacing-icon)',
      '--spinner-stroke-sm': '2',
      '--spinner-stroke-md': '2',
      '--spinner-stroke-lg': '2',
      '--spinner-track-opacity': '0.3',
    },
  },
  {
    id: 'A',
    name: 'Icon と同じ段（16・20・24px）',
    intent:
      'アイコンの段（Icon の sm・md・lg）とそろえる。文字やボタンの横に置く大きさまで。面の真ん中に置くには小さい',
    spec: [
      ['sm・md・lg', '16px・20px・24px'],
      ['線', '大きさに比例（2px・2.5px・3px）'],
      ['薄い輪', '30%'],
    ],
    tokens: {
      '--spinner-size-sm': 'calc(var(--spacing) * 4)',
      '--spinner-size-md': 'calc(var(--spacing) * 5)',
      '--spinner-size-lg': 'calc(var(--spacing) * 6)',
      '--spinner-stroke-sm': '2',
      '--spinner-stroke-md': '2',
      '--spinner-stroke-lg': '2',
      '--spinner-track-opacity': '0.3',
    },
  },
  {
    id: 'B',
    name: '面に置く大きい段（16・24・40px）・線は比例',
    intent:
      'lg を 40px にし、カードや一覧の真ん中に 1 つだけ置く読み込み中に使えるようにする。線は大きさに比例して太くなる（40px で 5px）',
    spec: [
      ['sm・md・lg', '16px・24px・40px'],
      ['線', '大きさに比例（2px・3px・5px）'],
      ['薄い輪', '30%'],
    ],
    tokens: {
      '--spinner-size-sm': 'calc(var(--spacing) * 4)',
      '--spinner-size-md': 'calc(var(--spacing) * 6)',
      '--spinner-size-lg': 'calc(var(--spacing) * 10)',
      '--spinner-stroke-sm': '2',
      '--spinner-stroke-md': '2',
      '--spinner-stroke-lg': '2',
      '--spinner-track-opacity': '0.3',
    },
  },
  {
    id: 'C',
    name: '面に置く大きい段・線は細いまま',
    intent:
      'B の大きさで、線を 2〜2.5px に保つ。大きくしても線が太らず、軽い見た目のまま（原則の「線は細く」）',
    spec: [
      ['sm・md・lg', '16px・24px・40px'],
      ['線', '2px・2.5px・2.5px'],
      ['薄い輪', '30%'],
    ],
    tokens: {
      '--spinner-size-sm': 'calc(var(--spacing) * 4)',
      '--spinner-size-md': 'calc(var(--spacing) * 6)',
      '--spinner-size-lg': 'calc(var(--spacing) * 10)',
      '--spinner-stroke-sm': '2',
      '--spinner-stroke-md': '1.67',
      '--spinner-stroke-lg': '1',
      '--spinner-track-opacity': '0.3',
    },
  },
  {
    id: 'D',
    name: 'C・薄い輪なし（弧だけ）',
    intent:
      'C から薄い輪を消し、回る弧だけにする。さらに軽く見える。ボタンや入力欄の中の円も弧だけになる。小さい段では、弧が短い線のように見える',
    spec: [
      ['sm・md・lg', '16px・24px・40px'],
      ['線', '2px・2.5px・2.5px'],
      ['薄い輪', 'なし'],
    ],
    tokens: {
      '--spinner-size-sm': 'calc(var(--spacing) * 4)',
      '--spinner-size-md': 'calc(var(--spacing) * 6)',
      '--spinner-size-lg': 'calc(var(--spacing) * 10)',
      '--spinner-stroke-sm': '2',
      '--spinner-stroke-md': '1.67',
      '--spinner-stroke-lg': '1',
      '--spinner-track-opacity': '0',
    },
  },
];

const columns: Column[] = [
  { label: '段を並べる', note: 'sm・md・lg と、control・text' },
  { label: 'カードの真ん中', note: 'lg と読み上げの名前' },
  { label: '文の横', note: 'size="text"' },
  { label: 'ボタンの送信中', note: '変わらないこと（control）' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={434}
      axis="回る円の大きさ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        switch (column.label) {
          case '段を並べる':
            return (
              <div className="flex items-end gap-5 text-fg-muted">
                {(['sm', 'md', 'lg', 'control', 'text'] as const).map((size) => (
                  <div key={size} className="flex flex-col items-center gap-2">
                    <Spinner size={size} />
                    <span className="text-xs text-fg-subtle">{size}</span>
                  </div>
                ))}
              </div>
            );
          case 'カードの真ん中':
            return (
              <Card className="w-[260px]">
                <CardBody className="grid h-40 place-items-center text-fg-muted">
                  <Spinner size="lg" accessibleName="読み込んでいます" />
                </CardBody>
              </Card>
            );
          case '文の横':
            return (
              <Text className="flex items-center gap-2 text-fg-muted">
                <Spinner size="text" />
                コメントを読み込んでいます
              </Text>
            );
          default:
            return (
              <div className="flex gap-3">
                <Button loading>保存</Button>
                <Button loading inlineSpinner variant="outline">
                  保存
                </Button>
              </div>
            );
        }
      }}
    >
      <p>
        回る円（Spinner）に大きさ（size）と読み上げの名前（accessibleName）を足しました。control（既定）と
        text は周りの文字に合わせる大きさで、いまのボタンや入力欄の中の円はそのままです。sm・md・lg
        は密度で変わらない段で、lg はカードや一覧の真ん中に 1
        つだけ置く読み込み中に使います。accessibleName を書くと role="status"
        の箱に入れて読み上げます。
      </p>
      <p>
        ロードマップの Spinner
        は、この回る円を公開の部品として仕上げる形で済ませる想定です（別の部品は作りません）。選ぶのは、sm・md・lg
        の大きさと、大きい段の線の太さ、薄い輪のあるなしです。どれを既定にするかも教えてください。
      </p>
    </Comparison>
  ),
};
