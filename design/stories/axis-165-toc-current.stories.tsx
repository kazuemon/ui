import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { TocLiveScene } from './toc-live-scene';
import {
  TableOfContents,
  type TableOfContentsItem,
} from '../../src/components/table-of-contents/TableOfContents';

// 後半の軸 165: TableOfContents の今の見出しの印
//   --toc-current-bar-width・--toc-current-bar-color（一覧の左の線に重ねる印の線）
//   --toc-current-bg・--toc-current-fg（今の見出しの塗りと文字）
//   どの案でも今の見出しは太字。ほかの見出しはグレーの文字で、hover で文字の色を淡く敷く
//   近い前例: Navbar（ADR-0130。既定は太字だけ）、Tree（ADR-0163。既定は淡い面＋太字、左の縦線は採らず）、
//     Pagination（ADR-0177。既定はグレーの塗り）

const items: TableOfContentsItem[] = [
  { id: 'intro', text: 'はじめに', level: 2 },
  { id: 'tokens', text: 'トークンの層', level: 2 },
  { id: 'role-tokens', text: '役割のトークン', level: 3 },
  { id: 'part-tokens', text: '部品のトークン', level: 3 },
  { id: 'density', text: '密度の切り替え', level: 2 },
  { id: 'motion', text: '動きの手応え', level: 2 },
];

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '線の上に濃い線',
    intent:
      '一覧の左の細い線の上に、今の見出しの高さだけ本文の色の太い線を重ねる。線の位置で、長い目次のどのあたりを読んでいるかが一目で分かる。色を持たない印はグレー〜濃紺（原則6）。',
    spec: [
      ['印の線', '太い線（2px）・本文の色'],
      ['塗り', 'なし'],
      ['文字', '本文の色の太字'],
    ],
    tokens: {
      '--toc-current-bar-width': 'var(--border-width-thick)',
      '--toc-current-bar-color': 'var(--color-fg)',
      '--toc-current-bg': 'transparent',
      '--toc-current-fg': 'var(--color-fg)',
    },
  },
  {
    id: 'A',
    name: '太字だけ',
    intent:
      'Navbar の既定（text）と同じ。線を重ねず、文字を本文の色の太字にするだけ。いちばん軽いが、見出しが並ぶと太さの差だけでは目で追いにくい。',
    spec: [
      ['印の線', 'なし'],
      ['塗り', 'なし'],
      ['文字', '本文の色の太字'],
    ],
    tokens: {
      '--toc-current-bar-width': '0px',
      '--toc-current-bar-color': 'transparent',
      '--toc-current-bg': 'transparent',
      '--toc-current-fg': 'var(--color-fg)',
    },
  },
  {
    id: 'B',
    name: '淡い面',
    intent:
      'Tree のいまいる行（fill）と同じ。今の見出しの行にグレーの面を敷く。行の範囲がはっきりするが、hover の淡い敷きと近い見え方になる。',
    spec: [
      ['印の線', 'なし'],
      ['塗り', 'グレー（一覧で選んだ項目と同じ）'],
      ['文字', '本文の色の太字'],
    ],
    tokens: {
      '--toc-current-bar-width': '0px',
      '--toc-current-bar-color': 'transparent',
      '--toc-current-bg': 'var(--color-select-neutral-selected)',
      '--toc-current-fg': 'var(--color-fg)',
    },
  },
  {
    id: 'C',
    name: '青い線と青い文字',
    intent:
      '現行版の線と文字を青にする。サイトの色が出て人懐っこいが、色を指定していないのに青が出る（Navbar の primary・Pagination の primary に近い）。',
    spec: [
      ['印の線', '太い線（2px）・青（--color-primary）'],
      ['塗り', 'なし'],
      ['文字', '青の太字（--color-on-primary-subtle）'],
    ],
    tokens: {
      '--toc-current-bar-width': 'var(--border-width-thick)',
      '--toc-current-bar-color': 'var(--color-primary)',
      '--toc-current-bg': 'transparent',
      '--toc-current-fg': 'var(--color-on-primary-subtle)',
    },
  },
];

const columns: Column[] = [
  { label: '1 段目が今の見出し', note: '「密度の切り替え」' },
  { label: '2 段目が今の見出し', note: '「役割のトークン」' },
  { label: 'hover', note: '今の見出しに載せたとき', preview: 'hover' },
  { label: 'フォーカス（キーボード）', note: '今の見出し', preview: 'focus' },
  { label: '記事の横', note: '枠の中をスクロールすると、印が移る' },
];

const current = 'a[aria-current]';

const meta = {
  title: 'Design Review/165 TableOfContents の今の見出しの印',
  id: 'design-review-165-toc-current',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: [`[data-preview="hover"] ${current}`],
      focusVisible: [`[data-preview="focus"] ${current}`],
    },
  },
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

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={165}
      axis="TableOfContents の今の見出しの印"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) =>
        column.label === '記事の横' ? (
          <TocLiveScene />
        ) : (
          <div className="w-[13rem]">
            <TableOfContents
              items={items}
              currentId={column.label === '2 段目が今の見出し' ? 'role-tokens' : 'density'}
            />
          </div>
        )
      }
    >
      <p>
        記事の横の目次で、今読んでいる見出し（<code>aria-current=&quot;location&quot;</code>
        ）をどう見せるかを選びます。どの案でも文字は太字で、ほかの見出しはグレーの文字です。一覧の左には、どの案でも細い線を引いています（線を引くかどうかは軸
        166 で比べます）。
      </p>
      <p>
        右の列の記事は、枠の中をスクロールすると印が見出しから見出しへ移ります。読みながら目の端で追えるかも見てください。どれを既定にし、どれを選べるようにするかも教えてください。
      </p>
    </Comparison>
  ),
};
