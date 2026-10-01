import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Menu } from '../../src/components/menu/Menu';
import { MenuItem } from '../../src/components/menu/MenuItem';
import type {
  ListContextValue,
  SortableMenuLayout,
} from '../../src/components/sortable/sortable-context';
import { MoveMenuItems } from '../../src/components/sortable/SortableMoveActions';
import {
  defaultMoveToTargetLabel,
  defaultSwapLabel,
} from '../../src/components/sortable/use-sortable-list';

// 軸 484: ︙ のメニューに足す「〜へ移動」（ほかのリストへ）・「〜と入れ替え」の並べ方
const meta = {
  title: 'Design Review/484 並べ替えのメニューの移す先',
  id: 'design-review-484-sortable-menu-layout',
  parameters: { layout: 'fullscreen' },
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
    name: '移動の操作だけ',
    intent:
      '︙ のメニューは、同じリストの中の上へ・下へ・先頭へ・末尾へだけ。ほかのリストへは引くしかなく、項目を足す口もなかった。比べるための基準',
    spec: [
      ['移す先', 'なし'],
      ['入れ替え', 'なし'],
      ['足す項目', 'なし'],
    ],
  },
  {
    id: 'A',
    name: '区切り線のあとに並べる',
    intent:
      '移動の操作のあとに区切り線を引き、「あとでへ移動」「済みへ移動」を 1 つずつ並べる。1 回押せば済む。移す先や項目が多いと縦に長くなる',
    spec: [
      ['menuLayout', 'flat'],
      ['移す先', '区切り線のあとに 1 つずつ'],
      ['入れ替え', '区切り線のあとに 1 つずつ'],
    ],
  },
  {
    id: 'B',
    name: '入れ子にまとめる',
    intent:
      '「別のリストへ移動 ›」「入れ替え ›」の入れ子に入れる。メニューは短いまま。1 段深くなり、押す回数が 1 回増える',
    spec: [
      ['menuLayout', 'submenu'],
      ['移す先', '「別のリストへ移動 ›」の中'],
      ['入れ替え', '「入れ替え ›」の中'],
    ],
  },
  {
    id: 'C',
    name: '見出しを付けたまとまり',
    intent:
      'A と同じく 1 つずつ並べ、まとまりごとに小さな見出し（別のリストへ移動・入れ替え）を付ける。何の操作かが読みやすいが、いちばん長い',
    spec: [
      ['menuLayout', 'group'],
      ['移す先', '見出し「別のリストへ移動」の下'],
      ['入れ替え', '見出し「入れ替え」の下'],
    ],
  },
];

const layoutOf: Record<string, SortableMenuLayout | undefined> = {
  現行版: undefined,
  A: 'flat',
  B: 'submenu',
  C: 'group',
};

const columns: Column[] = [
  { label: '︙ を開いたところ', note: '「下書きを書く」の ︙。移す先 2 つ、入れ替える相手 3 つ' },
  { label: '項目を足したとき', note: 'SortableItem の menu に「複製」「削除」' },
];

const order = ['draft', 'review', 'image', 'publish'];
const names = new Map([
  ['draft', '下書きを書く'],
  ['review', '見直しを頼む'],
  ['image', '見出しの画像を作る'],
  ['publish', '公開する'],
]);
const noop = () => {};

function listValue(layout: SortableMenuLayout | undefined): ListContextValue {
  return {
    variant: 'card',
    dragSourceVariant: 'outline',
    grabArea: 'handle',
    disabled: false,
    instructionId: '',
    moveActions: 'item-menu',
    labels: {
      up: '上へ移動',
      down: '下へ移動',
      first: '先頭へ移動',
      last: '末尾へ移動',
      menu: '移動',
      swap: defaultSwapLabel,
      moveTo: defaultMoveToTargetLabel,
      moveToTitle: '別のリストへ移動',
      swapTitle: '入れ替え',
    },
    order,
    moveTargets: layout
      ? [
          { value: 'later', label: 'あとで' },
          { value: 'done', label: '済み' },
        ]
      : undefined,
    showSwapActions: layout != null,
    menuLayout: layout ?? 'flat',
    names,
    moveTo: noop,
    swap: noop,
    moveToTarget: noop,
    claimFocus: () => false,
  };
}

function OpenMenu({ layout, extra }: { layout?: SortableMenuLayout; extra: boolean }) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setFrame} className="relative h-[640px] w-[440px] [transform:translateZ(0)]">
      {frame && (
        <Menu
          trigger={
            <button type="button" aria-label="下書きを書くを移動" className="size-10">
              ︙
            </button>
          }
          presentation="popover"
          modal={false}
          defaultOpen
          portalContainer={frame}
        >
          <MoveMenuItems
            list={listValue(layout)}
            item="draft"
            defaultSubmenuOpen={layout === 'submenu' && !extra}
            menu={
              extra ? (
                <>
                  <MenuItem>複製</MenuItem>
                  <MenuItem status="danger">削除</MenuItem>
                </>
              ) : undefined
            }
          />
        </Menu>
      )}
    </div>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={484}
      axis="並べ替えのメニューの移す先"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <OpenMenu layout={layoutOf[candidate.id]} extra={column.label.startsWith('項目')} />
      )}
    >
      <p>
        決定: どの案も採らない。部品が「〜へ移動」「〜と入れ替え」を組み立てる口は消し、︙
        のメニューは何もしなければ既定の項目（上へ・下へ・先頭へ・末尾へ）だけを出す。使う側は、既定の項目のあとに自分の
        MenuItem を足す・既定の項目を出さない・既定の動きを呼べる関数を受け取って Menu
        を自分で組み直す、ができる。リストをまたぐ移動はレシピの側で組む。ユーザーの返事「ユーザーが好きなように
        Menu
        を追加できる、でいいんじゃないかなと思いました。そもそも上へ移動とかも変えたい可能性があるので、何もしなければ上下先頭末尾を、カスタムしたい場合はデフォルトのを無効にしたり、自分で
        Menu を構成しなおせる、とかでいいかなと。」
      </p>
      <p>
        moveActions="item-menu" の ︙ のメニューに、3 つの口を足しました。moveTargets と
        onMoveToTarget
        で「〜へ移動」（ほかのリストへ。いままでドラッグでしかできなかった）、showSwapActions
        で「〜と入れ替え」（同じリストのほかの項目と入れ替える）、SortableItem の menu
        でその項目だけの操作（複製・削除など）です。
      </p>
      <p>
        選ぶのは、移す先と入れ替える相手の並べ方です（どれも menuLayout
        で切り替えています。決まったら 1
        つの形に畳みます）。項目を足す口（menu）は、どの案でも移動の操作のあとに区切り線を挟んで並べます。メニューは画面の下の端に当たると上に開くので、見る行を画面の上のほうへスクロールしてください。
      </p>
    </Comparison>
  ),
};
