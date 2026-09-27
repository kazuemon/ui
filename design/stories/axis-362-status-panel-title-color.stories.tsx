import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../src/components/button/Button';
import { StatusPanel } from '../../src/components/status-panel/StatusPanel';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 362: StatusPanel の色の範囲（見出しの文字にも色を使うか）— design/backlog.md
//   軸 361 でバッジの形と塗りを決めたあと、色をバッジだけに使うか、見出しの文字にも使うかを比べる
// 変えるのは次のトークンだけ（StatusPanel.tsx が読む。状態ごとに名前を分けた実在するトークンなので、5 状態ぶんまとめて上書きする）
//   --status-panel-title-color-{status}: 見出しの文字の色。既定はどの状態も本文と同じ濃紺（--color-fg）で色を持たない

const statuses = ['info', 'success', 'warning', 'danger', 'neutral'] as const;

// バッジの前景色と同じ値（軸361の淡い塗りの前景色 — design/tokens.css の --status-panel-badge-fg-* と同じ組）
const ink: Record<(typeof statuses)[number], string> = {
  info: 'var(--color-fg-info)',
  success: 'var(--color-fg-success)',
  warning: 'var(--color-fg-warning)',
  danger: 'var(--color-fg-danger)',
  neutral: 'var(--color-fg-muted)',
};

interface Shape {
  colored: boolean;
}

const candidate = (id: string, name: string, intent: string, s: Shape): Candidate => ({
  id,
  name,
  intent,
  spec: [['見出しの色', s.colored ? '状態の色（前景用）' : '色を持たない（本文と同じ）']],
  tokens: Object.fromEntries(
    statuses.map((status) => [
      `--status-panel-title-color-${status}`,
      s.colored ? ink[status] : 'var(--color-fg)',
    ])
  ),
});

const candidates: Candidate[] = [
  candidate(
    '現行版',
    '見出しは色を持たない',
    '色はバッジだけに使う。見出しは本文と同じ濃紺で、ページの中で浮かない。',
    { colored: false }
  ),
  candidate(
    'A',
    '見出しも状態の色（前景用）',
    '見出しの文字も、バッジと同じ前景色（白地でも基準を満たす前景用の値）にする。危険や警告のときに強く伝わる。',
    { colored: true }
  ),
];

const columns: Column[] = [
  { label: '危険（エラー）' },
  { label: '警告' },
  { label: '色を持たない（空状態）' },
];

const Cell = ({ column }: { column: Column }) => {
  if (column.label === '危険（エラー）') {
    return (
      <StatusPanel
        status="danger"
        title="読み込めませんでした"
        headingLevel={3}
        actions={<Button color="primary">もう一度試す</Button>}
      >
        通信が切れた可能性があります。時間をおいて、もう一度お試しください。
      </StatusPanel>
    );
  }
  if (column.label === '警告') {
    return (
      <StatusPanel status="warning" title="まもなく使えなくなります" headingLevel={3}>
        このプランは 9 月 30 日で終了します。
      </StatusPanel>
    );
  }
  return (
    <StatusPanel title="まだ一つも作成されていません" headingLevel={3}>
      作成すると、ここに一覧が並びます。
    </StatusPanel>
  );
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/362 StatusPanel（見出しの色）',
  id: 'design-review-362-status-panel-title-color',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={362}
      axis="StatusPanel（見出しの色）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        <strong className="text-fg">まだ決めていません</strong>
        。色をバッジだけに使うか、見出しの文字にも使うかを比べます。色を見出しにも使うと危険・警告は強く伝わりますが、色を持たない（neutral）ときは見出しがずっとグレーになるままです。
      </p>
      <p>
        色を持たない列（右端）は、A でも状態の色は付きません。neutral
        自身のグレー（本文よりわずかに淡い
        --color-fg-muted）に変わるだけです。差はわずかですが、見出しがふだんより少し淡くなります。
      </p>
      <p>どちらを既定にするかを一言添えてください。</p>
    </Comparison>
  ),
};
