import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';

import { Button } from '../../src/components/button/Button';
import { Dialog } from '../../src/components/dialog/Dialog';
import { Drawer } from '../../src/components/drawer/Drawer';
import { TextField } from '../../src/components/text-field/TextField';
import { OverlayClose } from '../../src/internal/overlay/overlay-close';
import { type Candidate, type Column, Comparison } from './Comparison';
import { OverlayFrame } from './overlay-frame';

// 後半の軸 83: Dialog とシートの、下の操作の並べ方 — B に決定（シートは縦に積む。積む順と横並びは actionsLayout で選べる）
// 変えるのは --dialog-actions-*・--sheet-actions-*（direction・justify・grow）だけ。全案（現行版を含む）で軸の値を明示する
//   right: 右寄せで文字の幅。fill: 横に並べて幅を等分。stack: 縦に積み、最後に渡した主な操作を上にする

const right = { direction: 'row', justify: 'flex-end', grow: '0 0 auto' };
const fill = { direction: 'row', justify: 'flex-end', grow: '1 1 0' };
const stack = { direction: 'column-reverse', justify: 'flex-end', grow: '0 0 auto' };
const stackSource = { direction: 'column', justify: 'flex-end', grow: '0 0 auto' };

const layout = (dialog: typeof right, sheet: typeof right) => ({
  '--dialog-actions-direction': dialog.direction,
  '--dialog-actions-justify': dialog.justify,
  '--dialog-actions-grow': dialog.grow,
  '--sheet-actions-direction': sheet.direction,
  '--sheet-actions-justify': sheet.justify,
  '--sheet-actions-grow': sheet.grow,
});

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'どちらも右寄せ',
    intent: 'Dialog もシートも、ボタンを文字の幅で右に寄せる。主な操作は右端。',
    spec: [
      ['Dialog', '右寄せ'],
      ['シート', '右寄せ'],
    ],
    tokens: layout(right, right),
  },
  {
    id: 'A',
    name: 'シートだけ幅を等分',
    intent:
      'パソコンの Dialog は右寄せのまま。指で押すシートは、ボタンを横に並べて幅を等分し、押す場所を大きくする。',
    spec: [
      ['Dialog', '右寄せ'],
      ['シート', '横に等分'],
    ],
    tokens: layout(right, fill),
  },
  {
    id: 'B',
    name: 'シートだけ縦に積む',
    intent:
      'シートでは、ボタンを幅いっぱいにして縦に積む。主な操作を上に置く。ボタンの文言が長くても折り返さない。',
    spec: [
      ['Dialog', '右寄せ'],
      ['シート', '縦に積む（主な操作が上）'],
    ],
    tokens: layout(right, stack),
  },
  {
    id: 'D',
    name: 'シートだけ縦に積む（渡した順）',
    intent:
      'B と同じ縦積みで、順番を渡したまま（左から「リンク・ボタン」と書いたら、上から「リンク・ボタン」）にする。',
    spec: [
      ['Dialog', '右寄せ'],
      ['シート', '縦に積む（渡した順に上から）'],
    ],
    tokens: layout(right, stackSource),
  },
  {
    id: 'C',
    name: 'どちらも幅を等分',
    intent: 'Dialog もシートも、ボタンを横に並べて幅を等分する。',
    spec: [
      ['Dialog', '横に等分'],
      ['シート', '横に等分'],
    ],
    tokens: layout(fill, fill),
  },
];

const columns: Column[] = [
  { label: 'Dialog', note: 'マウス' },
  { label: 'シート', note: '指。Drawer・狭い画面の Dialog' },
];

const actions = (
  <>
    <OverlayClose render={<Button appearance="outline">キャンセル</Button>} />
    <OverlayClose render={<Button color="primary">保存する</Button>} />
  </>
);

const cells: Record<string, (tokens: CSSProperties | undefined) => ReactNode> = {
  Dialog: (tokens) => (
    <OverlayFrame density="fine" style={tokens} className="h-[380px] w-[600px]">
      {(frame) => (
        <Dialog
          title="プロフィールを編集"
          description="公開するプロフィールに表示されます。"
          presentation="popover"
          modal={false}
          initialFocus="popup"
          // 比べるあいだ開いたままにする（外や中のボタンを押しても閉じない）
          open
          container={frame}
          actions={actions}
        >
          <TextField label="表示名" defaultValue="かずえもん" />
        </Dialog>
      )}
    </OverlayFrame>
  ),
  シート: (tokens) => (
    <OverlayFrame density="coarse" style={tokens} className="h-[520px] w-[360px]">
      {(frame) => (
        <Drawer
          title="プロフィールを編集"
          description="公開するプロフィールに表示されます。"
          modal={false}
          initialFocus="popup"
          // 比べるあいだ開いたままにする（外や中のボタンを押しても閉じない）
          open
          container={frame}
          actions={actions}
        >
          <TextField label="表示名" defaultValue="かずえもん" />
        </Drawer>
      )}
    </OverlayFrame>
  ),
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/83 下の操作の並べ方',
  id: 'design-review-83-overlay-actions',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'B', 'current', 'A', 'D', 'C'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={83}
      axis="下の操作の並べ方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => cells[column.label]?.(candidate.tokens)}
    >
      <p>
        <strong className="text-fg">
          決定: B（シートは縦に積み、最後に渡した主な操作が上。Dialog は右寄せ）。積む順と横並びは
          actionsLayout で選べる
        </strong>
        。「83 はデフォルト右寄せ、A と B
        が選べると嬉しい」「スマホ（シートの形）なら縦に、パソコン（ダイアログの形）なら横に、みたいなイメージでした。」「縦になったときはリンク→ボタンと、ボタン→リンクのどちらを希望するかは利用者がカスタムできるようにしたい」
      </p>
      <p>
        Dialog と、画面の下から出すシート（Drawer・狭い画面の
        Dialog）の、下に並べるボタンの置き方を選びます。ボタンは渡した順に並び、最後に渡したものが主な操作です。
      </p>
      <p>
        原則7では、押せる範囲は見た目の範囲と一致させます。指で押すシートでボタンを広げるなら、見た目のボタンそのものを大きくします。
      </p>
    </Comparison>
  ),
};
