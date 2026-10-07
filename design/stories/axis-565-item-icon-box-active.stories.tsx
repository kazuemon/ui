import { CopyIcon, DownloadSimpleIcon, ShareNetworkIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Menu } from '../../src/components/menu/Menu';
import { MenuItem } from '../../src/components/menu/MenuItem';
import { ScreenFrame } from '../../src/stories/story-parts';

// 軸 565: 行が hover・キーボードで止まったときの、アイコンの箱（soft）の見せ方
const meta = {
  title: 'Design Review/565 止まった行のアイコンの箱',
  id: 'design-review-565-item-icon-box-active',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B' },
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
    name: '箱も行も同じグレー',
    intent:
      '箱の塗りと、止まった行の塗りが同じ入力欄の色。止まった行では箱が地に溶けて、アイコンだけが残る',
    spec: [
      ['ふだんの箱', '入力欄の塗り'],
      ['止まった行の箱', '入力欄の塗り（行と同じ）'],
      ['線', 'なし'],
    ],
    tokens: {
      '--item-icon-box-bg': 'var(--color-field)',
      '--item-icon-box-bg-active': 'var(--color-field)',
      '--item-icon-box-ring-width': '0px',
    },
  },
  {
    id: 'A',
    name: '止まった行では白い箱',
    intent: '止まった行だけ、箱を地の白にする。グレーの行の上に白い箱が抜けて見える（反転）',
    spec: [
      ['ふだんの箱', '入力欄の塗り'],
      ['止まった行の箱', '地の白'],
      ['線', 'なし'],
    ],
    tokens: {
      '--item-icon-box-bg': 'var(--color-field)',
      '--item-icon-box-bg-active': 'var(--color-bg)',
      '--item-icon-box-ring-width': '0px',
    },
  },
  {
    id: 'B',
    name: '止まった行では 1 段濃いグレー',
    intent:
      '止まった行だけ、箱に本文の色を hover と同じ割合で重ねて 1 段濃くする。ふだんの見た目は変わらない',
    spec: [
      ['ふだんの箱', '入力欄の塗り'],
      ['止まった行の箱', '入力欄の塗り＋本文の色 8%'],
      ['線', 'なし'],
    ],
    tokens: {
      '--item-icon-box-bg': 'var(--color-field)',
      '--item-icon-box-bg-active':
        'color-mix(in oklab, var(--color-field), var(--color-fg) var(--flat-hover-mix))',
      '--item-icon-box-ring-width': '0px',
    },
  },
  {
    id: 'C',
    name: '箱に細い線',
    intent:
      '塗りは変えず、箱の内側に細い線を引く。止まった行でも線で箱の形が残る。ふだんも線が見える',
    spec: [
      ['ふだんの箱', '入力欄の塗り＋細い線'],
      ['止まった行の箱', '入力欄の塗り＋細い線'],
      ['線', '細い境界線の色'],
    ],
    tokens: {
      '--item-icon-box-bg': 'var(--color-field)',
      '--item-icon-box-bg-active': 'var(--color-field)',
      '--item-icon-box-ring-width': 'var(--border-width-thin)',
      '--item-icon-box-ring-color': 'var(--color-line)',
    },
  },
];

const columns: Column[] = [
  { label: 'Menu', note: '行にマウスを載せる・矢印キーで移ると、止まった行の箱が変わる' },
];

export const Axis: Story = {
  name: '比較',
  render: (args) => (
    <Comparison
      index={565}
      axis="行が hover・キーボードで止まったときの、アイコンの箱（soft）の見せ方"
      pick={args.pick}
      candidates={candidates}
      columns={columns}
      renderCell={() => (
        <ScreenFrame height="h-[260px]" width="w-[360px]">
          {(frame) => (
            <Menu
              trigger={<Button variant="outline">共有</Button>}
              presentation="popover"
              modal={false}
              defaultOpen
              portalContainer={frame}
              positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
            >
              <MenuItem
                icon={<ShareNetworkIcon />}
                iconVariant="soft"
                description="リンクを知っている人が見られます"
              >
                リンクで共有
              </MenuItem>
              <MenuItem
                icon={<CopyIcon />}
                iconVariant="soft"
                description="同じ中身の下書きを作ります"
              >
                複製して共有
              </MenuItem>
              <MenuItem
                icon={<DownloadSimpleIcon />}
                iconVariant="soft"
                description="PDF で書き出します"
              >
                書き出す
              </MenuItem>
            </Menu>
          )}
        </ScreenFrame>
      )}
    >
      <p>決定: B（止まった行では箱を 1 段濃いグレーにする）（ADR-0491）。「B がよさそう。」</p>
      <p>
        `iconVariant="soft"`
        の箱は入力欄と同じグレーで、hover・キーボードで止まった行の塗りも同じグレーです。そのため止まった行では箱が消えます。NavigationMenuLink
        の箱も同じ値を使います。
      </p>
      <p>
        どの行も実際に動きます。行にマウスを載せるか、一覧をクリックしてから矢印キーで移ってください。
      </p>
    </Comparison>
  ),
};
