import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Popconfirm, type PopconfirmProps } from '../../src/components/popconfirm/Popconfirm';

// 後半の軸 600: Popconfirm の 2 つのボタンの並べ方と大きさ
//   見本は押すと開く（開いた面は、外を押すか Esc で閉じる）。1 つ開くと、ほかは閉じる

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '右寄せ・md',
    intent:
      'AlertDialog の中央に浮かべる形と同じ。2 つのボタンを右に寄せ、実行する側を右端に置く。ボタンは普通の大きさ（md）。',
    spec: [
      ['並び', '右寄せ・実行が右端'],
      ['ボタン', 'md'],
    ],
  },
  {
    id: 'A',
    name: '右寄せ・sm',
    intent:
      '右寄せのまま、ボタンを小さい段（sm）にする。面が小さな補足の大きさに収まり、軽く見える。',
    spec: [
      ['並び', '右寄せ・実行が右端'],
      ['ボタン', 'sm'],
    ],
  },
  {
    id: 'B',
    name: '幅を等分・md',
    intent:
      '2 つのボタンを面の幅いっぱいに等分する。押す的が広い。問いが短いと、ボタンが横に伸びる。',
    spec: [
      ['並び', '幅を等分'],
      ['ボタン', 'md'],
    ],
  },
  {
    id: 'C',
    name: '幅を等分・sm',
    intent: '等分で、ボタンを sm にする。',
    spec: [
      ['並び', '幅を等分'],
      ['ボタン', 'sm'],
    ],
  },
];

const columns: Column[] = [
  { label: '問いと説明', note: '一番ふつうの形' },
  { label: '問いだけ', note: '短いと面が狭くなる' },
];

const byCandidate: Record<string, Pick<PopconfirmProps, 'actionsLayout' | 'buttonSize'>> = {
  現行版: { actionsLayout: 'end', buttonSize: 'md' },
  A: { actionsLayout: 'end', buttonSize: 'sm' },
  B: { actionsLayout: 'fill', buttonSize: 'md' },
  C: { actionsLayout: 'fill', buttonSize: 'sm' },
};

const meta = {
  title: 'Design Review/600 Popconfirm のボタンの並び',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => {
      document.documentElement.style.overflow = 'auto';
      return <Story />;
    },
  ],
} satisfies Meta;

export default meta;

export const Axis: StoryObj = {
  render: () => (
    <Comparison
      index={600}
      axis="Popconfirm の 2 つのボタンの並べ方と大きさ"
      pick="current"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <Popconfirm
          {...byCandidate[candidate.id]}
          trigger={<Button variant="outline">削除</Button>}
          title="この下書きを削除しますか？"
          description={column.label === '問いと説明' ? '削除すると元に戻せません。' : undefined}
          actionLabel="削除する"
          presentation="popover"
        />
      )}
    >
      <p>
        ボタンを開いて、2 つのボタンの置き方と大きさを見比べてください。右寄せは AlertDialog
        と同じです。等分は押す的が広くなります。
      </p>
      <p>決定: 右寄せ・md を既定にし、buttonSize・actionsLayout で変えられる。</p>
    </Comparison>
  ),
};
