import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';

import { Button } from '../../src/components/button/Button';
import { Drawer } from '../../src/components/drawer/Drawer';
import { Link } from '../../src/components/link/Link';
import { type Candidate, type Column, Comparison } from './Comparison';
import { OverlayFrame } from './overlay-frame';

// 後半の軸 86: 横から出す Drawer の幅と影 — A（360px・開く向きの影）
// 変えるのは --sheet-side-width・--shadow-sheet-left・--shadow-sheet-right だけ。全案（現行版を含む）で軸の値を明示する

const down = '0 8px 24px rgb(from var(--color-shadow) r g b / 0.12)';
const toRight = '8px 0 24px rgb(from var(--color-shadow) r g b / 0.12)';
const toLeft = '-8px 0 24px rgb(from var(--color-shadow) r g b / 0.12)';
const width = (px: number) =>
  `min(calc(var(--spacing) * ${px / 4}), calc(100vw - var(--spacing) * 12))`;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '360px・下向きの影',
    intent: '影は浮かぶ面と同じ下向き。パネルの下の端では、影が画面の外に出る。',
    spec: [
      ['幅', '360px'],
      ['影', '下に 8px・ぼかし 24px・12%'],
    ],
    tokens: {
      '--sheet-side-width': width(360),
      '--shadow-sheet-left': down,
      '--shadow-sheet-right': down,
    },
  },
  {
    id: 'A',
    name: '360px・開く向きの影',
    intent: '下から出すシートの影を上に向けているのと同じく、影を開く向き（画面の内側）に向ける。',
    spec: [
      ['幅', '360px'],
      ['影', '内側に 8px・ぼかし 24px・12%'],
    ],
    tokens: {
      '--sheet-side-width': width(360),
      '--shadow-sheet-left': toRight,
      '--shadow-sheet-right': toLeft,
    },
  },
  {
    id: 'B',
    name: '320px・開く向きの影',
    intent: 'A の幅を詰める。スマートフォン（375px）でも、後ろの画面が少し見える。',
    spec: [
      ['幅', '320px'],
      ['影', '内側に 8px・ぼかし 24px・12%'],
    ],
    tokens: {
      '--sheet-side-width': width(320),
      '--shadow-sheet-left': toRight,
      '--shadow-sheet-right': toLeft,
    },
  },
  {
    id: 'C',
    name: '400px・開く向きの影',
    intent: 'A の幅を広げる。詳細を出すパネルに向く。',
    spec: [
      ['幅', '400px'],
      ['影', '内側に 8px・ぼかし 24px・12%'],
    ],
    tokens: {
      '--sheet-side-width': width(400),
      '--shadow-sheet-left': toRight,
      '--shadow-sheet-right': toLeft,
    },
  },
];

const columns: Column[] = [
  { label: '左', note: 'ナビゲーション' },
  { label: '右', note: '詳細' },
];

const pages = ['ホーム', 'Works', 'Blog', 'About', 'Contact'];

const cells: Record<string, (tokens: CSSProperties | undefined) => ReactNode> = {
  左: (tokens) => (
    <OverlayFrame density="fine" style={tokens} className="h-[380px] w-[640px]">
      {(frame) => (
        <Drawer
          title="メニュー"
          side="left"
          modal={false}
          initialFocus="popup"
          // 比べるあいだ開いたままにする（外や中のボタンを押しても閉じない）
          open
          container={frame}
        >
          <nav className="flex flex-col items-start gap-2">
            {pages.map((page) => (
              <Link key={page} href="#">
                {page}
              </Link>
            ))}
          </nav>
        </Drawer>
      )}
    </OverlayFrame>
  ),
  右: (tokens) => (
    <OverlayFrame density="fine" style={tokens} className="h-[380px] w-[640px]">
      {(frame) => (
        <Drawer
          title="注文の詳細"
          description="2026年9月18日 注文"
          side="right"
          modal={false}
          initialFocus="popup"
          // 比べるあいだ開いたままにする（外や中のボタンを押しても閉じない）
          open
          container={frame}
          actions={<Button color="primary">領収書を出す</Button>}
        >
          <p>ステッカー 3 点・送料無料。お届けは 9月21日の予定です。</p>
        </Drawer>
      )}
    </OverlayFrame>
  ),
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/86 横の Drawer の幅と影',
  id: 'design-review-86-drawer-side',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={86}
      axis="横の Drawer の幅と影"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => cells[column.label]?.(candidate.tokens)}
    >
      <p>
        <strong className="text-fg">決定: A（360px・開く向きの影）</strong>。「86
        はAで良さそうです。」
      </p>
      <p>
        画面の横から出す Drawer
        の幅と、影の向きを選びます。幅は既定の値で、画面が狭いときは右（左）に 48px
        を残して縮みます。
      </p>
      <p>
        下から出すシートは、影を上（開く向き）に向けています。影の向きの違いは小さく、パネルの上の端と下の端（下向きの影は上の端で薄く、下の端で濃い）で分かります。
      </p>
    </Comparison>
  ),
};
