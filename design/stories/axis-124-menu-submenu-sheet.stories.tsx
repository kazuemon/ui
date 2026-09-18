import {
  CopyIcon,
  DownloadSimpleIcon,
  FolderIcon,
  PencilSimpleIcon,
  ShareNetworkIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Menu, type MenuSubmenuSheet } from '../../src/components/menu/Menu';
import { MenuItem, MenuSeparator, MenuSubmenu } from '../../src/components/menu/MenuItem';
import { PhoneFrame } from '../../src/stories/story-parts';

// 後半の軸 124: シートで開いた Menu の、入れ子のメニュー（MenuSubmenu）の開き方
// 仕組みは Menu の submenuSheet（cover・fit・fixed）。行ごとに props で変える
// 決定後: E を既定にし、B・D も選べるようにした。現行版（旧 stack）・A（旧 replace）は部品から外したので、
//   もう動く見本を出せない。行は残し、意図の説明だけ見せる（比較画像は記録のときに撮り直さない）

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '重ねる（中身の高さ）',
    intent:
      '親のシートの上に、中身の高さのシートを下から重ねる。親の見出しと × が上にのぞき、見出しと × が 2 つずつ見える。子の × は親に戻る（読み上げは「戻る」）。',
    spec: [
      ['面', '親の上に別のシート（中身の高さ）'],
      ['動き', '下から滑り出る'],
      ['見出し', '題と ×（親に戻る）'],
    ],
  },
  {
    id: 'A',
    name: '2 枚目のシートを右から重ねる',
    intent:
      '親のシートの上に、2 枚目のシートを右から滑り込ませて重ねる。2 枚目は親より低くならないので親はほぼ隠れるが、同じシートではなく、親のシートは下に残ったまま動かない。戻ると 2 枚目が右へ抜ける。見出しの左に ‹（戻る）、右に ×（すべて閉じる）。1 枚のシートの中で滑らせる形は D・E。',
    spec: [
      ['面', '親の上に別のシート（親より低くしない）'],
      ['動き', '右から滑り込む'],
      ['見出し', '‹（戻る）・題・×（すべて閉じる）'],
    ],
  },
  {
    id: 'B',
    name: '覆って重ねる',
    intent:
      '現行版と同じく下から重ねるが、親のシートを覆う高さにして、親の見出しをのぞかせない。見出しは A と同じく ‹ と ×。重なったことは動きで分かる。',
    spec: [
      ['面', '親の上に別のシート（親より低くしない）'],
      ['動き', '下から滑り出る'],
      ['見出し', '‹（戻る）・題・×（すべて閉じる）'],
    ],
  },
  {
    id: 'D',
    name: '1 枚のまま滑らせる（高さが伸び縮み）',
    intent:
      'シートは 1 枚のまま。開くと親の中身が左へ抜け、入れ子の中身が右から滑り込む。同時にシートの高さが中身に合わせて伸び縮みする（短ければ下がり、長ければ上がる。上限を超える分はシートの中でスクロール）。‹ で逆向きに戻る。2 枚目のシートは出ない。',
    spec: [
      ['面', '同じ 1 枚（高さは中身に合わせて動く）'],
      ['動き', '中身が右から滑り込む・高さが伸び縮み（シートと同じ時間と緩急）'],
      ['見出し', '‹（戻る）・題・×（すべて閉じる）'],
    ],
  },
  {
    id: 'E',
    name: '1 枚のまま滑らせる（高さは変えない・つまみで変えられる）',
    intent:
      'D と同じく 1 枚のシートの中で、親の中身が左へ抜け、入れ子の中身が右から滑り込む。シートの高さは中身では変わらず、最初に開いたメニューの高さで開く。上のつまみを引くと高さを変えられ、離すと「最初のメニューの高さ」か「シートの上限」の近い方に止まる（つまみを押すだけでも 2 つを切り替える）。変えた高さは入れ子へ滑っても保つ。下へはじくか、低く引いて離すと閉じる。長い中身はシートの中でスクロールし、短い中身では下が空く。',
    spec: [
      ['面', '同じ 1 枚（高さは中身では変わらない）'],
      ['つまみ', 'あり。2 段（最初のメニューの高さ・上限）に止まる。はじくと閉じる'],
      ['動き', '中身が右から滑り込む（シートと同じ時間と緩急）'],
      ['見出し', '‹（戻る）・題・×（すべて閉じる）'],
    ],
  },
];

// 現行版（旧 stack）・A（旧 replace）は部品から外し、もう作れない
const MODES: Partial<Record<string, MenuSubmenuSheet>> = {
  B: 'cover',
  D: 'fit',
  E: 'fixed',
};

const REMOVED = new Set(['現行版', 'A']);

const columns: Column[] = [
  { label: '入れ子の中身が短い', note: '共有を開いたところ（3 項目）' },
  { label: '入れ子の中身が長い', note: '移動を開いたところ（9 項目。親より長い）' },
  { label: '試す', note: '操作を押し、共有・移動を押す' },
];

const folders = [
  '受信箱',
  '下書き',
  '仕事',
  '個人',
  '旅行',
  '写真',
  '請求書',
  'アーカイブ',
  'あとで読む',
];

function Items({ open }: { open?: 'share' | 'move' }) {
  return (
    <>
      <MenuItem icon={<PencilSimpleIcon />}>編集</MenuItem>
      <MenuItem icon={<CopyIcon />}>複製</MenuItem>
      <MenuSubmenu
        icon={<ShareNetworkIcon />}
        defaultOpen={open === 'share'}
        items={
          <>
            <MenuItem>リンクを写す</MenuItem>
            <MenuItem>メールで送る</MenuItem>
            <MenuItem>SNS に投稿</MenuItem>
          </>
        }
      >
        共有
      </MenuSubmenu>
      <MenuSubmenu
        icon={<FolderIcon />}
        defaultOpen={open === 'move'}
        items={folders.map((folder) => (
          <MenuItem key={folder}>{folder}</MenuItem>
        ))}
      >
        移動
      </MenuSubmenu>
      <MenuItem icon={<DownloadSimpleIcon />}>書き出す</MenuItem>
      <MenuSeparator />
      <MenuItem icon={<TrashIcon />} danger>
        削除
      </MenuItem>
    </>
  );
}

const meta = {
  title: 'Design Review/124 Menu の入れ子（シート）',
  id: 'design-review-124-menu-submenu-sheet',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'E,B,D' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'D', 'E', 'E,B,D'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={124}
      axis="Menu の入れ子のメニュー（シート）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        if (REMOVED.has(candidate.id)) {
          return (
            <p className="max-w-[220px] text-xs leading-5 text-fg-subtle">
              この形は部品から外しました（比較画像は記録のときに撮り直しません）
            </p>
          );
        }
        const mode = MODES[candidate.id];
        if (column.label === '試す') {
          return (
            <PhoneFrame>
              {(frame) => (
                <Menu
                  trigger={<Button appearance="outline">操作</Button>}
                  title="操作"
                  presentation="sheet"
                  submenuSheet={mode}
                  container={frame}
                >
                  <Items />
                </Menu>
              )}
            </PhoneFrame>
          );
        }
        return (
          <PhoneFrame>
            {(frame) => (
              <Menu
                trigger={<Button appearance="outline">操作</Button>}
                title="操作"
                presentation="sheet"
                submenuSheet={mode}
                // 同じページで何枚も開いておくため、開閉を外から決め、ほかの操作を止めない
                open
                modal={false}
                container={frame}
              >
                <Items open={column.label === '入れ子の中身が短い' ? 'share' : 'move'} />
              </Menu>
            )}
          </PhoneFrame>
        );
      }}
    >
      <p>
        <strong>決定（ADR 未定）: E を既定にし、B・D も選べる</strong>
      </p>
      <p>
        指で操作するシートで、入れ子のメニュー（MenuSubmenu）をどう開くかを決めます。現行版は親のシートの上に短いシートを重ねるので、親の見出しと
        × が上にのぞき、見出しと × が 2 つ並びます。A は 2 枚目のシートを右から重ね、B
        は親を覆う高さのシートを下から重ねます。現行版・A
        は部品から外したので、行の説明だけ残しています。
      </p>
      <p>
        「試す」の列で、開く・戻る・閉じるの動きを確かめられます（指の操作に近づけるには、開発者ツールで端末の表示にしてください）。
      </p>
      <p>
        D と E は 2 巡目で足した案です。どちらもシートは 1 枚のまま、中身が右から滑り込みます。D
        はシートの高さが中身に合わせて伸び縮みし、E
        は最初に開いたメニューの高さのまま変わらず、上のつまみを引いて高さを変えられます（Select
        のシートのつまみと同じ操作）。「試す」の列で、共有（短い）と移動（長い）を開いて、‹
        で戻ってみてください。
      </p>
    </Comparison>
  ),
};
