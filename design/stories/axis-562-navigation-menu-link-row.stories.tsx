import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { NavbarSample } from './navigation-menu-axis-parts';

// 軸 562: NavigationMenu の面の中の行き先の行（題の太さとアイコンの置き方）
const meta = {
  title: 'Design Review/562 NavigationMenu の行き先の行',
  id: 'design-review-562-navigation-menu-link-row',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
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
    name: 'Menu の項目に寄せる',
    intent:
      '題は部品の文字のまま（太くしない）。アイコンは文字より一段大きく、塗りなしで題の前に置く（原則21）。説明はキャプションの文字',
    spec: [
      ['題', '標準の太さ'],
      ['アイコン', '24px・塗りなし'],
      ['説明', 'キャプション（小さいグレー）'],
    ],
    tokens: {
      '--navigation-menu-link-title-weight': '400',
      '--navigation-menu-link-icon-size': 'calc(var(--spacing-icon) + var(--spacing))',
      '--navigation-menu-link-icon-box': 'var(--navigation-menu-link-icon-size)',
      '--navigation-menu-link-icon-bg': 'transparent',
      '--navigation-menu-link-icon-radius': '0px',
    },
  },
  {
    id: 'A',
    name: '題を太くする',
    intent:
      '題を太字にして、説明との差をはっきりさせる。いまいるページの印（題を太く）は、太さでは見分けられなくなる',
    spec: [
      ['題', '太字'],
      ['アイコン', '24px・塗りなし'],
      ['説明', 'キャプション（小さいグレー）'],
    ],
    tokens: {
      '--navigation-menu-link-title-weight': '700',
      '--navigation-menu-link-icon-size': 'calc(var(--spacing-icon) + var(--spacing))',
      '--navigation-menu-link-icon-box': 'var(--navigation-menu-link-icon-size)',
      '--navigation-menu-link-icon-bg': 'transparent',
      '--navigation-menu-link-icon-radius': '0px',
    },
  },
  {
    id: 'B',
    name: 'アイコンをグレーの箱に置く',
    intent:
      'アイコンを、入力欄と同じグレーの角丸の箱（40px）に入れる。題と説明の 2 行の高さに箱がそろい、行の頭がそろって見える',
    spec: [
      ['題', '標準の太さ'],
      ['アイコン', '20px を 40px のグレーの箱に'],
      ['説明', 'キャプション（小さいグレー）'],
    ],
    tokens: {
      '--navigation-menu-link-title-weight': '400',
      '--navigation-menu-link-icon-size': 'var(--spacing-icon)',
      '--navigation-menu-link-icon-box': 'calc(var(--spacing) * 10)',
      '--navigation-menu-link-icon-bg': 'var(--color-field)',
      '--navigation-menu-link-icon-radius': 'calc(var(--radius-control) - var(--spacing))',
    },
  },
];

const columns: Column[] = [
  { label: 'アイコンと説明', note: 'Works' },
  { label: '見出しと説明（アイコンなし）', note: 'Blog' },
];

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={562}
      axis="NavigationMenu の行き先の行"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <NavbarSample open={column.label.startsWith('アイコン') ? 'works' : 'blog'} />
      )}
    >
      <p>
        決定: 行は現行版。アイコンをグレーの箱に入れる形（B）は、利用者が選べる props
        にする（ADR-0486）。「こちらも見た目上 menu
        と同じなので、現行版でいいかなと思いました。アイコンにグレーを敷くかどうかは Menu
        自体のバリエーションとして捉えて、ユーザー側が選択できる、が良さそうかなと。」
      </p>
      <p>
        開いた面に並べる行き先の、題の太さとアイコンの置き方を選びます。hover
        とキーボードで止まったときのグレーの塗り、説明の文字はどの案も同じです。
      </p>
      <p>
        Works の「Web サイト」はいまいるページで、題を太くしています。A
        では、ほかの行と太さで見分けられなくなります。
      </p>
    </Comparison>
  ),
};
