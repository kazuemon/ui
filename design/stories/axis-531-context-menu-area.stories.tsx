import { CopyIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { ContextMenu } from '../../src/components/context-menu/ContextMenu';
import { MenuItem, MenuSeparator } from '../../src/components/menu/MenuItem';
import { ScreenFrame } from '../../src/stories/story-parts';

// 軸 531: ContextMenu が開いているあいだの、範囲（trigger）の見せ方
const meta = {
  title: 'Design Review/531 開いているあいだの範囲の見せ方',
  id: 'design-review-531-context-menu-area',
  parameters: { layout: 'fullscreen' },
  // 開いたまま並べた一覧が、ページのスクロールを止めないようにする（比べるためだけ）
  decorators: [
    (Story) => (
      <>
        <style>{'html, body { overflow: auto !important; }'}</style>
        <Story />
      </>
    ),
  ],
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '何も変えない',
    intent:
      '開いても範囲は変えない。ブラウザやファイラーの右クリックと同じ。どの行に開いたかは、一覧の位置で分かる',
    spec: [
      ['面', 'なし'],
      ['輪郭', 'なし'],
    ],
    tokens: {
      '--context-menu-area-bg': 'transparent',
      '--context-menu-area-ring-width': '0px',
    },
  },
  {
    id: 'A',
    name: '面を淡く敷く',
    intent:
      '範囲に入力欄と同じ淡い面を敷く。hover の塗りと同じ言葉で「いま選んでいる」と示す。大きな範囲では面が広く出る',
    spec: [
      ['面', '入力欄の塗り'],
      ['輪郭', 'なし'],
    ],
    tokens: {
      '--context-menu-area-bg': 'var(--color-field)',
      '--context-menu-area-ring-width': '0px',
    },
  },
  {
    id: 'B',
    name: '細い輪郭を出す',
    intent:
      '範囲の外に、細い輪郭を出す。大きな範囲でも面を塗らないので背景（写真など）を隠さない。輪郭は寸法を変えない',
    spec: [
      ['面', 'なし'],
      ['輪郭', '細い・濃い線'],
    ],
    tokens: {
      '--context-menu-area-bg': 'transparent',
      '--context-menu-area-ring-width': 'var(--border-width-thin)',
      '--context-menu-area-ring-color': 'var(--color-line-strong)',
    },
  },
  {
    id: 'C',
    name: '面と輪郭の両方',
    intent: '淡い面と細い輪郭を重ねる。いちばんはっきり示すが、一覧の行が並ぶと騒がしくなる',
    spec: [
      ['面', '入力欄の塗り'],
      ['輪郭', '細い・濃い線'],
    ],
    tokens: {
      '--context-menu-area-bg': 'var(--color-field)',
      '--context-menu-area-ring-width': 'var(--border-width-thin)',
      '--context-menu-area-ring-color': 'var(--color-line-strong)',
    },
  },
];

const columns: Column[] = [
  { label: '一覧の行', note: '3 行のうち、真ん中で開く' },
  { label: '大きな範囲', note: '画面いっぱいの作業面' },
];

const items = (
  <>
    <MenuItem icon={<PencilSimpleIcon />}>名前を変える</MenuItem>
    <MenuItem icon={<CopyIcon />}>複製</MenuItem>
    <MenuSeparator />
    <MenuItem icon={<TrashIcon />} status="danger">
      削除
    </MenuItem>
  </>
);

const rowClass = 'flex h-12 items-center rounded-control px-4 text-fg';

// 開いた形を撮るため、ポインタの代わりに印の要素へ出す
function Cell({ frame, kind }: { frame: HTMLElement; kind: 'rows' | 'canvas' }) {
  const pointer = useRef<HTMLSpanElement>(null);
  const menu = (
    <ContextMenu
      trigger={
        kind === 'rows' ? (
          <div className={rowClass}>設計メモ.md</div>
        ) : (
          <div className="h-60 w-full rounded-card border border-line bg-bg px-4 py-3 text-fg-muted">
            作業面
          </div>
        )
      }
      presentation="popover"
      defaultOpen
      portalContainer={frame}
      positionerProps={{ anchor: pointer }}
    >
      {items}
    </ContextMenu>
  );
  return (
    <>
      <span
        ref={pointer}
        aria-hidden
        className="absolute size-0"
        style={kind === 'rows' ? { left: 150, top: 118 } : { left: 150, top: 100 }}
      />
      {kind === 'rows' ? (
        <div className="flex w-full flex-col">
          <div className={rowClass}>見積書.pdf</div>
          {menu}
          <div className={rowClass}>議事録.docx</div>
        </div>
      ) : (
        menu
      )}
    </>
  );
}

export const Axis: Story = {
  name: '比較',
  render: (args) => (
    <Comparison
      index={531}
      axis="ContextMenu が開いているあいだの、範囲の見せ方"
      pick={args.pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <ScreenFrame height="h-[300px]" width="w-[360px]">
          {(frame) => <Cell frame={frame} kind={column.label === '一覧の行' ? 'rows' : 'canvas'} />}
        </ScreenFrame>
      )}
    >
      <p>
        決定: 既定は範囲を変えない（現行版）。A（入力欄の淡い面）を props で選べる。輪郭（B・C）は作らない（ADR-0476）。
      </p>
      <p>
        右クリックで開いたとき、どの範囲に対する操作かを範囲に残すか。範囲は使う側が作る要素なので、見せ方はトークンの上書きだけで決まります。
      </p>
      <p>
        既定を 1 つ、選べるようにするものを足して選びます（例: 「A を既定にして、B も選べる」）。
      </p>
    </Comparison>
  ),
};
