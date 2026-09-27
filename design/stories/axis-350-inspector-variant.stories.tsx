import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { InspectorArea } from './inspector-frame';
import type { InspectorVariant } from '../../src/components/inspector/Inspector';

// 軸 350: Inspector の開き方（variant）の既定
//   push（本文を押しのける）と overlay（領域の中で本文の上に重ねる）は両方選べる形で作った。ここでは既定だけを決める
//   トークンではなく props の既定を比べる軸なので、行ごとに variant を変えて描く（部品のコードは分けていない）

const columns: Column[] = [
  { label: '開いている（領域 560px）', note: '「詳細」を押すと開閉を試せます' },
  { label: '狭い領域（400px）', note: '本文が狭くなるか、隠れるか' },
  { label: '左に置く（560px）' },
];

const candidates: (Candidate & { variant: InspectorVariant })[] = [
  {
    id: '現行版',
    name: 'push（押しのける）',
    intent:
      '開くと本文の幅を狭め、パネルが場所を占める。ページと同じレイヤーなので影を付けず、線で本文と分ける（原則1）。本文とパネルを同時に見ながら操作できる。開閉のたびに本文の幅が変わり、折り返しが動く。',
    spec: [
      ['variant', 'push'],
      ['影', 'なし（線で分ける）'],
      ['本文の幅', 'パネルの幅だけ狭くなる'],
    ],
    variant: 'push',
  },
  {
    id: 'A',
    name: 'overlay（重ねる）',
    intent:
      '開いても本文の幅は変えず、領域の中で本文の上に重ねる。重なる面なので、本文の側へ影を落とし、本文の側の角を丸める（原則1・5。Drawer の横のパネルと同じ）。開閉で本文が動かない代わりに、パネルの下の本文は隠れる。',
    spec: [
      ['variant', 'overlay'],
      ['影', 'Drawer の横のパネルと同じ'],
      ['本文の幅', '変わらない（下が隠れる）'],
    ],
    variant: 'overlay',
  },
];

function renderCell(column: Column, candidate: Candidate) {
  const variant = candidates.find((c) => c.id === candidate.id)?.variant ?? 'push';
  if (column.label.startsWith('狭い')) {
    return <InspectorArea variant={variant} width="w-[400px]" />;
  }
  if (column.label.startsWith('左')) {
    return <InspectorArea variant={variant} side="left" />;
  }
  return <InspectorArea variant={variant} />;
}

const meta = {
  title: 'Design Review/350 Inspectorの開き方',
  id: 'design-review-350-inspector-variant',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;
type Story = StoryObj<{ pick: string }>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={350}
      axis="Inspectorの開き方（押しのける・重ねる）の既定"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p>
        Inspector は、決まった領域の中だけで開閉する常駐のパネルです。Drawer
        から裏を止める動きと画面の最上層を抜いたもので、Sidebar の反対側に置く想定です。
      </p>
      <p>
        開き方は、本文を押しのけて場所を占める push と、領域の中で本文の上に重ねる overlay
        の両方を選べるようにしてあります。どちらを既定にするかを選んでください。
      </p>
      <p>
        push はページと同じレイヤーなので影を付けず（原則1）、overlay は重なる面なので影を付けます。
        どちらも領域の外（画面の最上層）には出ません。各セルの「詳細」を押すと開閉の動きも試せます。
      </p>
    </Comparison>
  ),
};
