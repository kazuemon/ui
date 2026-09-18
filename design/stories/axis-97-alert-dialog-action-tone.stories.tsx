import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';

import { Button, type ButtonProps } from '../../src/components/button/Button';
import { Dialog } from '../../src/components/dialog/Dialog';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 97: AlertDialog の実行する側のボタンの見た目
// 部品の指定（Button の appearance・color）を行ごとに変える。全案で両方を明示する
//   比べるあいだは複数の面を同時に開いておくため、AlertDialog と同じ閉じ方の Dialog を、ほかの操作を止めない形（modal={false}）で描く

type ActionLook = Pick<ButtonProps, 'appearance' | 'color'>;

const looks: Record<string, ActionLook> = {
  現行版: { appearance: 'filled', color: 'danger' },
  A: { appearance: 'filled', color: 'primary' },
  B: { appearance: 'outline', color: 'danger' },
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '危険の色で塗る（既定）',
    intent:
      '実行する側を危険の色の塗りにする。消す・外すなど失うものがある操作が多いので、既定を危険の色にし、tone="primary" で主な色も選べる。',
    spec: [
      ['既定', 'tone="danger"（塗り・危険の色）'],
      ['選べる', 'tone="primary"（塗り・主な色）'],
    ],
  },
  {
    id: 'A',
    name: '主な色で塗る（既定）',
    intent:
      '実行する側を、ほかの Dialog と同じ主な色の塗りにする。危険の色は、消す操作のときに tone="danger" で選ぶ。',
    spec: [
      ['既定', 'tone="primary"（塗り・主な色）'],
      ['選べる', 'tone="danger"（塗り・危険の色）'],
    ],
  },
  {
    id: 'B',
    name: '危険の色の枠線',
    intent:
      '実行する側も枠線にし、どちらのボタンも塗らない。うっかり押しにくくするため、実行する側を目立たせすぎない。',
    spec: [
      ['実行する側', '枠線・危険の色'],
      ['取り消す側', '枠線・グレー'],
    ],
  },
];

const columns: Column[] = [
  { label: '中央', note: 'マウス。削除の確かめ' },
  { label: 'シート', note: '指。画面の下から出す形' },
];

// 画面の代わりの枠。面は画面に固定して出るので、枠を位置の基準にする（transform）
function Frame({
  density,
  className,
  children,
}: {
  density: 'fine' | 'coarse';
  className: string;
  children: (frame: HTMLElement) => ReactNode;
}) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setFrame}
      data-density={density}
      className={`relative ${className} [transform:translateZ(0)] overflow-clip rounded-card border border-line bg-bg`}
    >
      {frame && children(frame)}
    </div>
  );
}

function Preview({ look, sheet }: { look: ActionLook; sheet: boolean }) {
  return (
    <Frame
      density={sheet ? 'coarse' : 'fine'}
      className={sheet ? 'h-[420px] w-[360px]' : 'h-[300px] w-[560px]'}
    >
      {(frame) => (
        <Dialog
          title="下書きを削除しますか？"
          description="削除した下書きは元に戻せません。"
          presentation={sheet ? 'sheet' : 'popover'}
          modal={false}
          // 比べるあいだ開いたままにする
          open
          dismissible={false}
          closeOnEscape={false}
          closeButton={false}
          container={frame}
          actions={
            <>
              <Button appearance="outline">キャンセル</Button>
              <Button {...look}>削除する</Button>
            </>
          }
        />
      )}
    </Frame>
  );
}

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/97 AlertDialog の実行する側の色',
  id: 'design-review-97-alert-dialog-action-tone',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
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
      index={97}
      axis="AlertDialog の実行する側の色"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <Preview look={looks[candidate.id]} sheet={column.label === 'シート'} />
      )}
    >
      <p>
        <strong>
          決定: 現行版（tone="danger" を既定にし、primary も選べる）。ADR はあとで書く。
        </strong>
      </p>
      <p>
        取り消せない操作を確かめる AlertDialog
        の、実行する側のボタン（「削除する」）の見た目を選びます。取り消す側（「キャンセル」）はどの案でもグレーの枠線で、開いた直後のフォーカスは取り消す側にあります。
      </p>
      <p>
        原則7では、画面で最も進めたい操作は塗りです。危険の色は、ピンクと並んでも見分けられる暗めの赤です。
      </p>
      <p>
        現行版と A は「どちらを既定にするか」の違いで、どちらも tone
        で選べます。消す操作と、失うものはないが取り消せない操作（送信・公開）のどちらが多いかで決まります。
      </p>
    </Comparison>
  ),
};
