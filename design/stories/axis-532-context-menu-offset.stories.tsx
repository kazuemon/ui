import { CopyIcon, CursorIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { ContextMenu } from '../../src/components/context-menu/ContextMenu';
import { MenuItem, MenuSeparator } from '../../src/components/menu/MenuItem';
import { ScreenFrame } from '../../src/stories/story-parts';

// 軸 532: ContextMenu の一覧を、ポインタのどこに置くか
const meta = {
  title: 'Design Review/532 ポインタとの位置',
  id: 'design-review-532-context-menu-offset',
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
    name: '角をポインタに置く',
    intent: '一覧の左上の角を、ポインタの先にそのまま置く。ずれがなく、どこを押したかが分かる',
    spec: [
      ['ずれ', '0'],
      ['重なり', 'なし'],
    ],
    tokens: {
      '--context-menu-offset-x': '0px',
      '--context-menu-offset-y': '0px',
      '--context-menu-overlap-x': '0px',
      '--context-menu-overlap-y': '0px',
    },
  },
  {
    id: 'A',
    name: '少し離す',
    intent:
      'ポインタの先から、右下へ 8px 離す。ポインタが一覧に隠れず、最初の項目を誤って押しにくい',
    spec: [
      ['ずれ', '右下へ 8px'],
      ['重なり', 'なし'],
    ],
    tokens: {
      '--context-menu-offset-x': 'calc(var(--spacing) * 2)',
      '--context-menu-offset-y': 'calc(var(--spacing) * 2)',
      '--context-menu-overlap-x': '0px',
      '--context-menu-overlap-y': '0px',
    },
  },
  {
    id: 'B',
    name: '角を少し重ねる',
    intent:
      'ポインタの先が一覧の角の内側（4px）に入る。macOS のように、ポインタが一覧の中から始まる',
    spec: [
      ['ずれ', 'なし'],
      ['重なり', '4px'],
    ],
    tokens: {
      '--context-menu-offset-x': '0px',
      '--context-menu-offset-y': '0px',
      '--context-menu-overlap-x': 'var(--spacing)',
      '--context-menu-overlap-y': 'var(--spacing)',
    },
  },
  {
    id: 'C',
    name: '最初の項目をポインタの下に',
    intent:
      '最初の項目の行がポインタの真下に来るよう、一覧を上へ重ねる。押してすぐ最初の項目へ行けるが、ポインタの下が項目になる',
    spec: [
      ['ずれ', 'なし'],
      ['重なり', '面の余白＋項目の半分'],
    ],
    tokens: {
      '--context-menu-offset-x': '0px',
      '--context-menu-offset-y': '0px',
      '--context-menu-overlap-x': 'var(--spacing)',
      '--context-menu-overlap-y':
        'calc(var(--menu-popup-padding) + var(--border-width-thin) + var(--spacing-control) / 2)',
    },
  },
];

const columns: Column[] = [
  { label: '上のほう', note: '下へ開く' },
  { label: '右下の端', note: '端に当たると、反対側へ開く' },
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

// 開いた形を撮るため、ポインタの代わりに印の要素へ出す。印の位置にポインタの絵を置き、先が印の位置
function Cell({ frame, edge }: { frame: HTMLElement; edge: boolean }) {
  const pointer = useRef<HTMLSpanElement>(null);
  const [x, y] = edge ? [280, 190] : [120, 50];
  return (
    <>
      <span ref={pointer} aria-hidden className="absolute size-0" style={{ left: x, top: y }} />
      <CursorIcon
        aria-hidden
        weight="fill"
        className="pointer-events-none absolute z-20 size-5 text-fg"
        style={{ left: x - 2, top: y - 2 }}
      />
      <ContextMenu
        trigger={
          <div className="h-60 w-full rounded-card border border-dashed border-line-strong" />
        }
        presentation="popover"
        defaultOpen
        portalContainer={frame}
        positionerProps={{ anchor: pointer }}
      >
        {items}
      </ContextMenu>
    </>
  );
}

export const Axis: Story = {
  name: '比較',
  render: (args) => (
    <Comparison
      index={532}
      axis="ContextMenu の一覧を置く、ポインタとの位置"
      pick={args.pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <ScreenFrame height="h-[300px]" width="w-[360px]">
          {(frame) => <Cell frame={frame} edge={column.label === '右下の端'} />}
        </ScreenFrame>
      )}
    >
      <p>
        決定: 既定はずれ 0（現行版）。ポインタからのずれ x・y（px）を props で渡せる。重ねる形（B・C）は作らない（ADR-0477）。
      </p>
      <p>
        右クリックしたとき、一覧の角をポインタに対してどこへ置くか。ポインタの絵は、ポインタの先が印の位置にある見本です。
      </p>
      <p>
        既定を 1
        つ、選べるようにするものを足して選びます。指の長押しでは一覧が指に隠れないよう、Base UI が
        10px の大きさの的として扱います。
      </p>
    </Comparison>
  ),
};
