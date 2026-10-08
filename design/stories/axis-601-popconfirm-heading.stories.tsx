import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Popconfirm } from '../../src/components/popconfirm/Popconfirm';

// 後半の軸 601: Popconfirm の問いの出し方（説明と警告の印）
//   見本は押すと開く（開いた面は、外を押すか Esc で閉じる）。1 つ開くと、ほかは閉じる

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '問い＋説明・印なし',
    intent: '問い（太字）の下に説明を小さく添える。AlertDialog と同じ 2 段で、静か。',
    spec: [
      ['段', '問い＋説明'],
      ['警告の印', 'なし'],
    ],
  },
  {
    id: 'A',
    name: '問いだけ・印なし',
    intent:
      '説明は置かず、問い 1 行だけにする。いちばん小さい面。何が起きるかは問いと実行の文言で伝える。',
    spec: [
      ['段', '問いだけ'],
      ['警告の印', 'なし'],
    ],
  },
  {
    id: 'B',
    name: '問い＋説明・印あり',
    intent:
      '問いの前に三角の「!」を置く。danger では赤く、primary では淡いグレー。危ない操作だと一目で分かる。',
    spec: [
      ['段', '問い＋説明'],
      ['警告の印', 'あり（danger は赤）'],
    ],
  },
  {
    id: 'C',
    name: '問いだけ・印あり',
    intent:
      '問い 1 行に、前に三角の「!」を置く。ポップアップ版の古典的な形（Ant Design など）に近い。',
    spec: [
      ['段', '問いだけ'],
      ['警告の印', 'あり'],
    ],
  },
];

const columns: Column[] = [
  { label: 'danger（削除）', note: '失うものがある' },
  { label: 'primary（公開）', note: '失うものはない' },
];

const withIcon = (id: string) => id === 'B' || id === 'C';
const withDescription = (id: string) => id === '現行版' || id === 'B';

const meta = {
  title: 'Design Review/601 Popconfirm の問いの出し方',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;

export const Axis: StoryObj = {
  render: () => (
    <Comparison
      index={601}
      axis="Popconfirm の問いの出し方（説明と警告の印）"
      pick="current"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const danger = column.label.startsWith('danger');
        return (
          <Popconfirm
            showIcon={withIcon(candidate.id)}
            color={danger ? 'danger' : 'primary'}
            trigger={<Button variant="outline">{danger ? '削除' : '公開'}</Button>}
            title={danger ? 'この下書きを削除しますか？' : '今すぐ公開しますか？'}
            description={
              withDescription(candidate.id)
                ? danger
                  ? '削除すると元に戻せません。'
                  : '公開すると、フォロワーに通知が届きます。'
                : undefined
            }
            actionLabel={danger ? '削除する' : '公開する'}
            presentation="popover"
          />
        );
      }}
    >
      <p>
        ボタンを開いて、問いの出し方を見比べてください。説明の有無と警告の印は、別々に選べます。
      </p>
      <p>決定: 問い＋説明・印なしを既定にし、showIcon で印を付けられる。description は省ける。</p>
    </Comparison>
  ),
};
