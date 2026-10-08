import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Popconfirm } from '../../src/components/popconfirm/Popconfirm';

// 後半の軸 602: Popconfirm を開いた直後の焦点
//   見本は押すと開く（開いた面は、外を押すか Esc で閉じる）。1 つ開くと、ほかは閉じる

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'いつも取り消す側',
    intent:
      'AlertDialog と同じ。開いた直後の焦点は取り消す側。開いてすぐ Enter を押しても実行されない。実行するには Tab で動くか、押す。',
    spec: [
      ['danger', '取り消す側'],
      ['primary', '取り消す側'],
    ],
  },
  {
    id: 'A',
    name: 'いつも実行する側',
    intent:
      '開いてすぐ Enter で実行できる。キーボードで素早く確かめる使い方に向くが、うっかり Enter で消すおそれがある。',
    spec: [
      ['danger', '実行する側'],
      ['primary', '実行する側'],
    ],
  },
  {
    id: 'B',
    name: '色で変える',
    intent:
      '失うものがある danger は取り消す側、失うものがない primary は実行する側。危ない操作だけ守る。',
    spec: [
      ['danger', '取り消す側'],
      ['primary', '実行する側'],
    ],
  },
];

const columns: Column[] = [{ label: 'danger（削除）' }, { label: 'primary（公開）' }];

const meta = {
  title: 'Design Review/602 Popconfirm の最初の焦点',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;

export const Axis: StoryObj = {
  render: () => (
    <Comparison
      index={602}
      axis="Popconfirm を開いた直後の焦点"
      pick="B"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const danger = column.label.startsWith('danger');
        const focus =
          candidate.id === '現行版'
            ? 'cancel'
            : candidate.id === 'A'
              ? 'action'
              : danger
                ? 'cancel'
                : 'action';
        return (
          <Popconfirm
            autoFocus={focus}
            color={danger ? 'danger' : 'primary'}
            trigger={<Button variant="outline">{danger ? '削除' : '公開'}</Button>}
            title={danger ? 'この下書きを削除しますか？' : '今すぐ公開しますか？'}
            actionLabel={danger ? '削除する' : '公開する'}
            presentation="popover"
          />
        );
      }}
    >
      <p>
        ボタンを開いて、どちらのボタンに焦点が当たるか（輪郭の線）を見てください。キーボードで開いて
        Enter を押したときの結果も試してください。
      </p>
      <p>
        決定: 色で変える（danger は取り消す側、primary は実行する側）を既定にし、autoFocus
        で上書きできる。
      </p>
    </Comparison>
  ),
};
