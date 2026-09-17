import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';

import { Button } from '../../src/components/button/Button';
import { Popover } from '../../src/components/popover/Popover';
import { Switch } from '../../src/components/switch/Switch';
import { type Candidate, type Column, Comparison } from './Comparison';
import { OverlayFrame } from './overlay-frame';

// 後半の軸 85: Popover の閉じる × と、本体を指す矢印 — 現行版（どちらもなし）を既定にし、A（矢印）を arrow で選べる
// 変えるのは --popover-arrow-display・--popover-close-display・--popover-close-space だけ（比べるための切り替え。決まったら部品で畳む）
// 全案（現行版を含む）で軸の値を明示する

const toggles = (arrow: boolean, close: boolean) => ({
  '--popover-arrow-display': arrow ? 'block' : 'none',
  '--popover-close-display': close ? 'block' : 'none',
  '--popover-close-space': close ? 'var(--spacing-control)' : '0px',
});

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'どちらもなし',
    intent:
      '外を押すか Esc で閉じる。ほかの操作を止めないので、閉じる手段は置かない。本体との位置で、どこから開いたかを見せる。',
    spec: [
      ['×', 'なし'],
      ['矢印', 'なし'],
    ],
    tokens: toggles(false, false),
  },
  {
    id: 'A',
    name: '矢印',
    intent: '本体を指す小さな矢印を付け、どこから開いたかをはっきりさせる。面と同じ白と輪郭。',
    spec: [
      ['×', 'なし'],
      ['矢印', 'あり'],
    ],
    tokens: toggles(true, false),
  },
  {
    id: 'B',
    name: '×',
    intent: 'シートと同じく右上に × を置き、閉じる手段を目に見える形にする。',
    spec: [
      ['×', 'あり'],
      ['矢印', 'なし'],
    ],
    tokens: toggles(false, true),
  },
  {
    id: 'C',
    name: '矢印と ×',
    intent: 'A と B を合わせる。',
    spec: [
      ['×', 'あり'],
      ['矢印', 'あり'],
    ],
    tokens: toggles(true, true),
  },
];

const columns: Column[] = [
  { label: '題と中身', note: '下に出す' },
  { label: '文だけ', note: '上に出す・題なし' },
];

const cells: Record<string, (tokens: CSSProperties | undefined) => ReactNode> = {
  題と中身: (tokens) => (
    <OverlayFrame density="fine" style={tokens} className="h-[280px] w-[380px]">
      {(frame) => (
        <div className="flex justify-center pt-5">
          <Popover
            title="表示の設定"
            description="この端末だけに保存されます。"
            presentation="popover"
            trigger={<Button appearance="outline">表示</Button>}
            // 比べるあいだ開いたままにする（外や中のボタンを押しても閉じない）
            open
            container={frame}
          >
            <div className="flex flex-col gap-3">
              <Switch label="画像を表示" defaultChecked />
              <Switch label="動きを減らす" />
            </div>
          </Popover>
        </div>
      )}
    </OverlayFrame>
  ),
  文だけ: (tokens) => (
    <OverlayFrame density="fine" style={tokens} className="h-[280px] w-[380px]">
      {(frame) => (
        <div className="flex h-full items-end justify-center pb-5">
          <Popover
            side="top"
            presentation="popover"
            trigger={<Button appearance="outline">送料について</Button>}
            // 比べるあいだ開いたままにする（外や中のボタンを押しても閉じない）
            open
            container={frame}
          >
            3,000円以上のご注文で送料が無料になります。沖縄県と離島は別の料金です。
          </Popover>
        </div>
      )}
    </OverlayFrame>
  ),
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/85 Popover の × と矢印',
  id: 'design-review-85-popover-close-arrow',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current,A', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={85}
      axis="Popover の × と矢印"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => cells[column.label]?.(candidate.tokens)}
    >
      <p>
        <strong className="text-fg">
          決定: 現行版（どちらもなし）を既定にし、A（矢印）を arrow で選べる
        </strong>
        。「85 は現行版がデフォルトで、Aを選べる、がよさそうです。」
      </p>
      <p>
        本体のそばに浮かべる Popover に、右上の閉じる ×
        と、本体を指す矢印を付けるかを選びます。どの案でも、外を押すか Esc
        で閉じます。画面の下から出すシートでは、いつも × を置きます。
      </p>
      <p>「X を既定にして Y も選べる」形にするなら、選べる方は props で切り替える形にします。</p>
    </Comparison>
  ),
};
