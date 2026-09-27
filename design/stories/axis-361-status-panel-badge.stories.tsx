import type { Meta, StoryObj } from '@storybook/react-vite';
import { FolderOpenIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';

import { Icon } from '../../src/components/icon/Icon';
import { StatusPanel } from '../../src/components/status-panel/StatusPanel';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 361: StatusPanel のバッジ（アイコンの背景）— design/backlog.md
//   StatusPanel は空状態・見つからない・失敗の面。色とアイコンの割り当ては Notice・Callout と同じ status を使うが、
//   「大きな塗りの中にアイコンを置くバッジ」は Notice の行内アイコンにない、原則にない新しい見た目
//   ここで比べるのは、バッジの形（円・角丸四角）と塗りの濃さ（淡い塗りに濃い前景色・濃い塗りに白文字）の組み合わせ
// 変えるのは次のトークンだけ（StatusPanel.tsx が読む。状態ごとに名前を分けた実在するトークンなので、5 状態ぶんまとめて上書きする）
//   --status-panel-badge-radius: バッジの角（pill で円、--radius-card で角丸四角）
//   --status-panel-badge-bg-{status}・--status-panel-badge-fg-{status}: バッジの塗りと、中のアイコンの色
//     淡い塗り: 状態の淡い面に同じ色相の濃い前景色（Notice の soft と同じ） / 濃い塗り: 状態の濃い塗りに白文字（Notice の filled と同じ）

const statuses = ['info', 'success', 'warning', 'danger', 'neutral'] as const;

interface Shape {
  radius: string;
  fill: 'soft' | 'solid';
}

// 淡い塗り（現行版・A）は tokens.css の既定と同じ値。濃い塗り（B・C）は Notice の filled と同じ状態の塗りに白文字
const solidBg: Record<(typeof statuses)[number], string> = {
  info: 'var(--color-info)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  neutral: 'var(--color-neutral-strong)',
};
const solidFg: Record<(typeof statuses)[number], string> = {
  info: 'var(--color-on-info)',
  success: 'var(--color-on-success)',
  warning: 'var(--color-on-warning)',
  danger: 'var(--color-on-danger)',
  neutral: 'var(--color-on-neutral-strong)',
};
const softBg: Record<(typeof statuses)[number], string> = {
  info: 'var(--color-info-subtle)',
  success: 'var(--color-success-subtle)',
  warning: 'var(--color-warning-subtle)',
  danger: 'var(--color-danger-subtle)',
  neutral: 'var(--color-field)',
};
const softFg: Record<(typeof statuses)[number], string> = {
  info: 'var(--color-fg-info)',
  success: 'var(--color-fg-success)',
  warning: 'var(--color-fg-warning)',
  danger: 'var(--color-fg-danger)',
  neutral: 'var(--color-fg-muted)',
};

const candidate = (id: string, name: string, intent: string, s: Shape): Candidate => ({
  id,
  name,
  intent,
  spec: [
    ['形', s.radius === 'var(--radius-pill)' ? '円' : '角丸四角'],
    ['塗り', s.fill === 'soft' ? '淡い塗り・濃い前景色' : '濃い塗り・白文字'],
  ],
  tokens: {
    '--status-panel-badge-radius': s.radius,
    ...Object.fromEntries(
      statuses.flatMap((status) => [
        [`--status-panel-badge-bg-${status}`, s.fill === 'soft' ? softBg[status] : solidBg[status]],
        [`--status-panel-badge-fg-${status}`, s.fill === 'soft' ? softFg[status] : solidFg[status]],
      ])
    ),
  },
});

const candidates: Candidate[] = [
  candidate(
    '現行版',
    '円・淡い塗り',
    '実装した既定の形。円のバッジに、状態の淡い面（Notice の soft と同じ）と、同じ色相の濃い前景色のアイコン。',
    { radius: 'var(--radius-pill)', fill: 'soft' }
  ),
  candidate(
    'A',
    '角丸四角・淡い塗り',
    '現行版から形だけを変える。角は部品の一段大きい角（カードの角）。',
    { radius: 'var(--radius-card)', fill: 'soft' }
  ),
  candidate(
    'B',
    '円・濃い塗り',
    '現行版から塗りだけを変える。Notice の filled と同じ濃い塗りに、白文字（警告だけ黄色に濃紺）。',
    { radius: 'var(--radius-pill)', fill: 'solid' }
  ),
  candidate('C', '角丸四角・濃い塗り', '形と塗りの両方を変える。強めの印象。', {
    radius: 'var(--radius-card)',
    fill: 'solid',
  }),
];

const columns: Column[] = [
  { label: '空状態（neutral）', note: '既定のアイコンがないので icon を渡している' },
  { label: '見つかりません（info）' },
  { label: 'エラー（danger）' },
];

const Cell = ({ column }: { column: Column }) => {
  if (column.label.startsWith('空状態')) {
    return (
      <StatusPanel
        icon={<Icon icon={FolderOpenIcon} size="lg" standalone />}
        title="まだ一つも作成されていません"
        headingLevel={3}
      >
        作成すると、ここに一覧が並びます。
      </StatusPanel>
    );
  }
  if (column.label.startsWith('見つかりません')) {
    return (
      <StatusPanel
        status="info"
        icon={<Icon icon={MagnifyingGlassIcon} size="lg" standalone />}
        title="見つかりませんでした"
        headingLevel={3}
      >
        ほかの言葉で、もう一度お試しください。
      </StatusPanel>
    );
  }
  return (
    <StatusPanel status="danger" title="読み込めませんでした" headingLevel={3}>
      通信が切れた可能性があります。
    </StatusPanel>
  );
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/361 StatusPanel（バッジの形と塗り）',
  id: 'design-review-361-status-panel-badge',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={361}
      axis="StatusPanel（バッジの形と塗り）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        <strong className="text-fg">まだ決めていません</strong>。StatusPanel
        は、空状態・見つからない・失敗を、バッジ付きのアイコン・見出し・本文・操作で伝える新しい面です（design/backlog.md）。
        色とアイコンの既定は Notice・Callout と同じ status
        の割り当てをそのまま使いますが、「大きな塗りの中にアイコンを置くバッジ」自体は原則にない新しい見た目なので、ここで形（円・角丸四角）と塗りの濃さ（淡い・濃い）を比べます。
      </p>
      <p>
        列は使う場面です。空状態（色を持たない
        neutral）、見つからない（info）、エラー（danger）を並べています。neutral
        には既定のアイコンがないので、どの案も icon を渡しています。
      </p>
      <p>
        どれを既定にするかを一言添えてください。バッジの大きさや、見出しにも色を使うかは、別の軸（362・363）で比べます。
      </p>
    </Comparison>
  ),
};
