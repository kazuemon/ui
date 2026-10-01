import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { OverlayFrame } from './overlay-frame';
import { Button } from '../../src/components/button/Button';
import { Drawer } from '../../src/components/drawer/Drawer';
import { Text } from '../../src/components/text/Text';
import { TextField } from '../../src/components/text-field/TextField';
import { OverlayClose } from '../../src/internal/overlay/overlay-close';

// 軸 514: Drawer を上から出す（side="top"）ときの、つまみの位置
const meta = {
  title: 'Design Review/514 Drawer を上から出すときのつまみ',
  id: 'design-review-514-drawer-top',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'つまみは下の端',
    intent:
      '足したときの形。はじいて閉じる向き（上）へ引くのは面の下の端なので、つまみを下の端に置く。指が届く側でもある',
    spec: [
      ['つまみ', '下の端（はじく向きの側）'],
      ['見出しの上', 'つまみの場所だけ空ける'],
    ],
    tokens: { '--drawer-top-handle-head': 'hidden', '--drawer-top-handle-foot': 'flex' },
  },
  {
    id: 'A',
    name: 'つまみは見出しの上',
    intent:
      '下から出すシートと同じ場所（見出しの上）に置く。どの向きのシートも見出しの並びがそろう。ただし画面の上の端に近く、指からは遠い',
    spec: [
      ['つまみ', '見出しの上（下から出すシートと同じ）'],
      ['下の端', 'なし'],
    ],
    tokens: { '--drawer-top-handle-head': 'visible', '--drawer-top-handle-foot': 'none' },
  },
  {
    id: 'B',
    name: 'つまみを出さない',
    intent:
      '上から出す面は知らせの一覧のように「読んで閉じる」面が多いので、つまみを出さず、× と外を押す・Esc で閉じる。はじいて閉じる動きは残るので、原則16（引けるときはつまみを出す）とは食い違う',
    spec: [
      ['つまみ', 'なし（はじいて閉じる動きは残る）'],
      ['見出しの上', 'つまみの場所だけ空ける'],
    ],
    tokens: { '--drawer-top-handle-head': 'hidden', '--drawer-top-handle-foot': 'none' },
  },
];

const columns: Column[] = [
  { label: '知らせの一覧', note: '下の操作なし' },
  { label: '下の操作あり', note: '縦に積む（既定の auto）' },
  { label: '入力の面', note: '欄と、操作の左に置く文' },
];

const notices = [
  '新しいコメントが 2 件あります',
  '「設計の見直し」の締め切りは明日です',
  'かずえもんさんがあなたを招待しました',
];

function Cell({ column }: { column: Column }) {
  const withActions = column.label !== '知らせの一覧';
  const form = column.label === '入力の面';
  return (
    <OverlayFrame width={360} height={480} density="coarse">
      {(frame) => (
        <Drawer
          side="top"
          title={form ? 'さがす' : 'お知らせ'}
          modal={false}
          dismissible={false}
          autoFocus={false}
          defaultOpen
          portalContainer={frame}
          actions={
            withActions ? (
              <>
                <OverlayClose render={<Button variant="outline">閉じる</Button>} />
                <OverlayClose
                  render={<Button color="primary">{form ? 'さがす' : 'すべて既読にする'}</Button>}
                />
              </>
            ) : undefined
          }
          actionsStart={form ? '3 件の条件で絞り込み中' : undefined}
        >
          {form ? (
            <TextField label="キーワード" defaultValue="デザイン" />
          ) : (
            <div className="flex flex-col gap-3">
              {notices.map((notice) => (
                <Text key={notice}>{notice}</Text>
              ))}
            </div>
          )}
        </Drawer>
      )}
    </OverlayFrame>
  );
}

export const Compare: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={514}
      axis="Drawer を上から出すときのつまみの位置"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        Drawer の side に top を足しました。下から出すシートを上下に返した形で、下の角を丸め、影は下へ向けます（原則1）。上へはじくと閉じ、半分の段は持ちません（中身の高さで開きます）。下の操作は、下から出すシートと同じく縦に積みます。
      </p>
      <p>
        決めるのはつまみの位置です。つまみは「引けること」の印で、はじいて閉じられるとき（closeOnSwipe）だけ出します。枠は指で操作する狭い画面の代わりです。
      </p>
    </Comparison>
  ),
};
