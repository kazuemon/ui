import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Notice } from '../../src/components/Notice';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 30: お知らせの ×（閉じるボタン）の大きさ
// 押せる範囲は見た目の範囲と一致させる（決定）。いまの × は行の高さ＋8px（指用 32px）で、部品の高さ（指用 44px）にも、
// 大きい指用（coarse-large、52px）にも従わない。hover と押下で敷く面が、押せる範囲そのもの
// 変えるのは次のトークンだけ（src/components/Notice.tsx が読む）
//   --notice-close-to-control: 0 は行の高さ＋8px、1 は部品の高さ（--size-control）
//   --notice-close-radius: 角丸
// どの案も、× は1行目の中央にそろえ、上と右にはみ出させる。アイコン（Bold）の大きさは変えない

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '行の高さ＋8px の丸',
    intent:
      '行の高さに 8px を足した丸。大きい指用でも 32px のままで、指用の部品の高さ（44px）にも届かない。',
    spec: [
      ['大きさ', 'マウス用 28px・指用 32px・大きい指用 32px'],
      ['形', '丸'],
    ],
    tokens: { '--notice-close-to-control': '0', '--notice-close-radius': 'var(--radius-pill)' },
  },
  {
    id: 'A',
    name: '部品の高さの丸',
    intent:
      '× を部品の高さ（ボタンや入力欄と同じ）にする。大きい指用では 52px。形はいまと同じ丸で、お知らせの角のそばに大きめの円が出る。',
    spec: [
      ['大きさ', 'マウス用 40px・指用 44px・大きい指用 52px'],
      ['形', '丸'],
    ],
    tokens: { '--notice-close-to-control': '1', '--notice-close-radius': 'var(--radius-pill)' },
  },
  {
    id: 'B',
    name: '部品の高さの角丸の四角',
    intent:
      'A と同じ大きさで、角を部品の角（12px）にする。Select のシートの × と同じ考え方で、お知らせの角とも形がそろう。',
    spec: [
      ['大きさ', 'マウス用 40px・指用 44px・大きい指用 52px'],
      ['形', '角丸の四角（部品の角 12px）'],
    ],
    tokens: { '--notice-close-to-control': '1', '--notice-close-radius': 'var(--radius-control)' },
  },
];

const columns: Column[] = [
  { label: 'マウス用（40px）', note: 'data-density="fine"' },
  { label: '指用（44px）', note: 'data-density="coarse"' },
  { label: '大きい指用（52px）', note: 'coarse-large' },
];

const Label = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-bold text-fg-subtle">{children}</p>
);

const close = () => {};

// 列ごとに密度を固定する。大きい指用は、指用の密度に coarse-large のクラスを足す
const Cell = ({ column }: { column: Column }) => {
  const density = column.label.startsWith('マウス') ? 'fine' : 'coarse';
  const large = column.label.startsWith('大きい');
  return (
    <div
      data-density={density}
      className={['flex max-w-[360px] flex-col gap-3', large && 'coarse-large']
        .filter(Boolean)
        .join(' ')}
    >
      <Label>通常</Label>
      <Notice color="info" title="メンテナンスのお知らせ" onClose={close}>
        9月20日 2:00〜4:00 は、サービスを使えません。
      </Notice>
      <Label>hover（押せる範囲）</Label>
      <div data-preview="hover" className="flex flex-col gap-3">
        <Notice color="info" title="メンテナンスのお知らせ" onClose={close}>
          9月20日 2:00〜4:00 は、サービスを使えません。
        </Notice>
        <Notice color="success" appearance="filled" onClose={close}>
          保存しました。
        </Notice>
      </div>
    </div>
  );
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/30 お知らせの閉じるボタン',
  id: 'design-review-30-notice-close',
  parameters: {
    layout: 'fullscreen',
    pseudo: { hover: ['[data-preview="hover"] button[aria-label="閉じる"]'] },
  },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={30}
      axis="お知らせの閉じるボタン"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        <strong className="text-fg">決まったこと</strong>
        。押せる範囲は、見た目の範囲と一致させます。お知らせの ×
        は、大きい指用（coarse-large）でも大きくならず、指用の部品の高さ（44px）にも届いていないので直します。
      </p>
      <p>
        ここで選ぶのは × の大きさと形です。× には、hover
        と押したときに押せる範囲の面が出ます（下の段は hover
        で固定しています）。アイコンの大きさは変えず、1行目の中央にそろえて、上と右にはみ出させます。
      </p>
      <p>
        列は密度です。マウス用・指用・大きい指用で、×
        の大きさが部品の高さについてくるかを見てください。
      </p>
      <p>どれを既定にするかを一言添えてください。</p>
    </Comparison>
  ),
};
