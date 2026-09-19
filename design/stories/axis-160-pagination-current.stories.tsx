import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Pagination } from '../../src/components/pagination/Pagination';

// 後半の軸 160: Pagination のいまのページの印
//   --pagination-current-bg（いまのページの塗り）・--pagination-current-fg（その文字）
//   どの案でも、いまのページの文字は太字。ほかの番号はグレーの文字で、hover で文字の色を淡く敷く
//   近い前例: Navbar のいまいるページ（ADR-0130。既定は太字だけ、グレー・淡い青の pill も選べる）

const href = (page: number) => `#page-${page}`;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'グレーの塗り',
    intent:
      '色を持たない部品の選んだ印はグレー（原則6）。Navbar の neutral・Tree のいまいる行と同じ地に、本文の色の太字を載せる。ほかの番号の hover（淡い敷き）より一段はっきりしている。',
    spec: [
      ['塗り', 'グレー（--color-neutral）'],
      ['文字', '本文の色の太字'],
    ],
    tokens: {
      '--pagination-current-bg': 'var(--color-neutral)',
      '--pagination-current-fg': 'var(--color-fg)',
    },
  },
  {
    id: 'A',
    name: '濃い塗り（白い文字）',
    intent:
      '原則6 の「選んだものは部品の色の濃い塗り」を、色を持たない濃いグレーで。トグルの ON・選んだ箱と同じ塗り。並びの中でいまの位置がいちばん強く見える代わりに、記事一覧の下では重い。',
    spec: [
      ['塗り', '濃いグレー（--color-neutral-strong）'],
      ['文字', '白の太字'],
    ],
    tokens: {
      '--pagination-current-bg': 'var(--color-neutral-strong)',
      '--pagination-current-fg': 'var(--color-on-neutral-strong)',
    },
  },
  {
    id: 'B',
    name: '淡い青の塗り',
    intent:
      'Navbar の primary と同じ。淡い青の面に青い太字。サイトの色が出て人懐っこいが、色を指定していないのに青が出る。',
    spec: [
      ['塗り', '淡い青（--color-primary-subtle）'],
      ['文字', '青の太字（--color-on-primary-subtle）'],
    ],
    tokens: {
      '--pagination-current-bg': 'var(--color-primary-subtle)',
      '--pagination-current-fg': 'var(--color-on-primary-subtle)',
    },
  },
  {
    id: 'C',
    name: '太字だけ',
    intent:
      'Navbar の既定（text）と同じ。塗りを持たず、文字を本文の色の太字にするだけ。いちばん軽いが、1 桁の数字では太さの差が小さく、どれがいまのページか読み取りにくい。',
    spec: [
      ['塗り', 'なし'],
      ['文字', '本文の色の太字'],
    ],
    tokens: {
      '--pagination-current-bg': 'transparent',
      '--pagination-current-fg': 'var(--color-fg)',
    },
  },
];

const columns: Column[] = [
  { label: '通常', note: '10 ページのうち 5 ページ目' },
  { label: 'hover', note: '隣の番号（4）', preview: 'hover' },
  { label: 'hover（いまのページ）', note: '5 に載せたとき', preview: 'hover-current' },
  { label: 'フォーカス（キーボード）', note: 'いまのページ（5）', preview: 'focus' },
  { label: '狭いとき', note: '幅 320px' },
];

const neighbor = '[data-kind="page"][aria-label="4 ページ目"]';
const current = '[data-kind="page"][aria-current="page"]';

const meta = {
  title: 'Design Review/160 Pagination のいまのページの印',
  id: 'design-review-160-pagination-current',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: [`[data-preview="hover"] ${neighbor}`, `[data-preview="hover-current"] ${current}`],
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
      index={160}
      axis="Pagination のいまのページの印"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) =>
        column.label === '狭いとき' ? (
          <div className="w-[320px]">
            <Pagination page={5} count={10} href={href} align="start" />
          </div>
        ) : (
          <div className="w-[28rem]">
            <Pagination page={5} count={10} href={href} align="start" />
          </div>
        )
      }
    >
      <p>
        ページ番号の並びで、いまいるページ（<code>aria-current=&quot;page&quot;</code>
        ）をどう見せるかを選びます。どの案でも文字は太字です。ほかの番号は面を持たない押すもので、hover
        で文字の色を淡く敷き、押すと沈みます。
      </p>
      <p>
        Navbar のいまいるページ（ADR-0130）は太字だけが既定でしたが、ページ番号は 1〜2
        文字と短く、太さだけでは差が小さくなります。どれを既定にし、どれを選べるようにするかも教えてください。
      </p>
      <p>実際にマウスを載せて、Tab でも動かして確かめられます。</p>
    </Comparison>
  ),
};
