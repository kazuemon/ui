import type { Meta, StoryObj } from '@storybook/react-vite';
import { FolderOpenIcon } from '@phosphor-icons/react';

import { Button } from '../../src/components/button/Button';
import { Icon } from '../../src/components/icon/Icon';
import { StatusPanel } from '../../src/components/status-panel/StatusPanel';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 363: StatusPanel の全体の大きさ（design/backlog.md）
//   StatusPanel は、一覧の中の小さな空状態から、画面いっぱいの 404・エラーページまで使う。
//   同じ大きさのままでよいか、コンパクトな段とゆったりした段を分けるかを比べる
// 変えるのは次のトークンだけ（StatusPanel.tsx が読む）
//   --status-panel-width: 面全体の幅の上限（中央寄せ）
//   --status-panel-gap・--status-panel-actions-gap: アイコン・見出し・本文・操作のあいだの余白
//   --status-panel-badge-size・--status-panel-icon-size: バッジと中のアイコンの大きさ
//   --status-panel-title-size・--status-panel-title-leading: 見出しの大きさ

interface Shape {
  width: string;
  gap: string;
  actionsGap: string;
  badge: string;
  icon: string;
  titleSize: string;
  titleLeading: string;
}

const candidate = (id: string, name: string, intent: string, s: Shape): Candidate => ({
  id,
  name,
  intent,
  spec: [
    ['幅の上限', s.width],
    ['バッジ', s.badge],
    ['見出し', s.titleSize],
  ],
  tokens: {
    '--status-panel-width': s.width,
    '--status-panel-gap': s.gap,
    '--status-panel-actions-gap': s.actionsGap,
    '--status-panel-badge-size': s.badge,
    '--status-panel-icon-size': s.icon,
    '--status-panel-title-size': s.titleSize,
    '--status-panel-title-leading': s.titleLeading,
  },
});

const candidates: Candidate[] = [
  candidate(
    '現行版',
    '1 段のみ（実装した既定）',
    '場面によらず同じ大きさ。幅 28rem・バッジ 56px・見出しは見出し 3 段の大きさ。',
    {
      width: '28rem',
      gap: 'calc(var(--spacing) * 3)',
      actionsGap: 'calc(var(--spacing) * 3)',
      badge: 'calc(var(--spacing) * 14)',
      icon: 'var(--icon-size-lg)',
      titleSize: 'var(--text-heading-3)',
      titleLeading: 'var(--leading-heading-3)',
    }
  ),
  candidate(
    'A',
    'コンパクト（一覧の中の空状態向け）',
    '現行版よりひとまわり小さい。カードや一覧の中に収めても重くならない。',
    {
      width: '22rem',
      gap: 'calc(var(--spacing) * 2)',
      actionsGap: 'calc(var(--spacing) * 2)',
      badge: 'calc(var(--spacing) * 10)',
      icon: 'var(--icon-size-md)',
      titleSize: 'var(--text-heading-4)',
      titleLeading: 'var(--leading-heading-4)',
    }
  ),
  candidate(
    'B',
    'ゆったり（ページ全体向け）',
    '404・エラーのページ全体を任せても寂しくならない大きさ。',
    {
      width: '32rem',
      gap: 'calc(var(--spacing) * 4)',
      actionsGap: 'calc(var(--spacing) * 4)',
      badge: 'calc(var(--spacing) * 18)',
      icon: 'var(--icon-size-lg)',
      titleSize: 'var(--text-heading-2)',
      titleLeading: 'var(--leading-heading-2)',
    }
  ),
];

const columns: Column[] = [
  { label: '一覧の中（幅 320px の枠）' },
  { label: 'ページ全体（幅 640px の枠）' },
];

const Cell = ({ column }: { column: Column }) => {
  const narrow = column.label.startsWith('一覧');
  return (
    <div
      className="mx-auto flex items-center justify-center border border-dashed border-line p-4"
      style={{ width: narrow ? 320 : 640, minHeight: narrow ? 200 : 320 }}
    >
      <StatusPanel
        icon={<Icon icon={FolderOpenIcon} size="lg" standalone />}
        title="まだ一つも作成されていません"
        headingLevel={3}
        actions={narrow ? undefined : <Button color="primary">作成する</Button>}
      >
        作成すると、ここに一覧が並びます。
      </StatusPanel>
    </div>
  );
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/363 StatusPanel（全体の大きさ）',
  id: 'design-review-363-status-panel-size',
  parameters: { layout: 'fullscreen' },
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
      index={363}
      axis="StatusPanel（全体の大きさ）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        <strong className="text-fg">まだ決めていません</strong>。StatusPanel
        は、一覧の中の小さな空状態から、404・エラーのページ全体まで使います。同じ大きさのままでよいか、場面で段を分けるかを比べます。
      </p>
      <p>
        段を分ける案（A・B）を採るときは、大きさの選び方（props
        で選ぶか、置く場所の幅で自動に決めるか）も決める必要があります。まずは、どの大きさが場面に合うかを見てください。
      </p>
      <p>
        左列は幅 320px の枠（一覧やカードの中を想定）、右列は幅 640px
        の枠（ページ全体を想定。操作ボタンも付けています）です。
      </p>
      <p>どれを既定にするか、場面で使い分けたいかを一言添えてください。</p>
    </Comparison>
  ),
};
