import { InfoIcon, MedalIcon, UsersThreeIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type MouseEvent, useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Sidebar } from '../../src/components/sidebar/Sidebar';
import { SidebarItem } from '../../src/components/sidebar/SidebarItem';
import { SidebarLayout } from '../../src/components/sidebar/SidebarLayout';
import { SidebarSection } from '../../src/components/sidebar/SidebarSection';
import { Text } from '../../src/components/text/Text';

// 軸 501: 入れ子を持つ SidebarItem をリンクにしたときの、リンクと山形（開け閉めのボタン）の境目と hover
const row = '[data-target="stage"]';
const toggle = `${row} + [data-slot="sidebar-item-toggle"]`;
// 現行版は行全体が開け閉めのボタンなので、山形の列でも行に状態を当てる
const wholeRow = `${row}:not([href])`;
const at = (preview: string, target: string) => `[data-preview="${preview}"] ${target}`;

const meta = {
  title: 'Design Review/501 入れ子を持つリンクの行',
  id: 'design-review-501-sidebar-parent-link',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: [at('hover', row), at('button-hover', toggle), at('button-hover', wholeRow)],
      focusVisible: [at('focus', row), at('button-focus', toggle), at('button-focus', wholeRow)],
    },
  },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '行全体が開け閉め',
    intent:
      '入れ子を持つ行は href を受けず、行全体が開け閉めのボタン。ステージそのもののページには移れない',
    spec: [
      ['行', '開け閉めのボタン（href は無視）'],
      ['山形', '行の中の印'],
    ],
  },
  {
    id: 'A',
    name: '行の中の小さな山形',
    intent:
      '行全体をリンクにし、右端に ︙ と同じ大きさ（24px）の山形のボタンを重ねる。山形に載せても行の面は残し、山形に一段濃い四角を足す',
    spec: [
      ['山形', '24px・行の文字の右端にそろえる'],
      ['行の面', '山形の下まで通す'],
      ['山形に hover', '行は hover のまま＋山形に押下の濃さ'],
    ],
    tokens: {
      '--sidebar-toggle-size': 'calc(var(--spacing) * 6)',
      '--sidebar-toggle-inside': '1',
      '--sidebar-toggle-reserve': 'calc(var(--spacing-icon) + var(--spacing) * 2)',
      '--sidebar-toggle-inset': '0px',
      '--sidebar-toggle-divider': 'transparent',
      '--sidebar-toggle-hover-depth': '1',
      '--sidebar-toggle-row-hover': '1',
    },
  },
  {
    id: 'B',
    name: '2 つの面に分ける',
    intent:
      'リンクの面を右から縮め、行の高さの正方形の山形を隣に置く。載せた側だけが塗られ、押せる範囲がそのまま見える',
    spec: [
      ['山形', '行の高さの正方形・行の右端'],
      ['行の面', '山形の手前で切る（2px あける）'],
      ['山形に hover', '山形だけ hover の色'],
    ],
    tokens: {
      '--sidebar-toggle-size': 'var(--spacing-control)',
      '--sidebar-toggle-inside': '0',
      '--sidebar-toggle-reserve': '0px',
      '--sidebar-toggle-inset': 'calc(var(--spacing-control) + var(--spacing) / 2)',
      '--sidebar-toggle-divider': 'transparent',
      '--sidebar-toggle-hover-depth': '0',
      '--sidebar-toggle-row-hover': '0',
    },
  },
  {
    id: 'C',
    name: '仕切り線で分ける',
    intent:
      '行の面は 1 つのまま、右端に行の高さの山形を置き、あいだに縦の細い線を引く（分割ボタンの形）。山形に載せると行も塗り、山形を一段濃くする',
    spec: [
      ['山形', '行の高さの正方形・行の右端'],
      ['仕切り', '縦の細い線（いつも出す）'],
      ['山形に hover', '行は hover のまま＋山形に押下の濃さ'],
    ],
    tokens: {
      '--sidebar-toggle-size': 'var(--spacing-control)',
      '--sidebar-toggle-inside': '0',
      '--sidebar-toggle-reserve': 'var(--spacing-control)',
      '--sidebar-toggle-inset': '0px',
      '--sidebar-toggle-divider': 'var(--color-line)',
      '--sidebar-toggle-hover-depth': '1',
      '--sidebar-toggle-row-hover': '1',
    },
  },
  {
    id: 'D',
    name: '小さな山形・載せた側だけ',
    intent:
      'A と同じ置き方で、山形に載せたときは行の面を消し、山形の四角だけを塗る。押す先がリンクではないことが分かりやすい',
    spec: [
      ['山形', '24px・行の文字の右端にそろえる'],
      ['行の面', '山形の下まで通す'],
      ['山形に hover', '行は塗らない・山形だけ hover の色'],
    ],
    tokens: {
      '--sidebar-toggle-size': 'calc(var(--spacing) * 6)',
      '--sidebar-toggle-inside': '1',
      '--sidebar-toggle-reserve': 'calc(var(--spacing-icon) + var(--spacing) * 2)',
      '--sidebar-toggle-inset': '0px',
      '--sidebar-toggle-divider': 'transparent',
      '--sidebar-toggle-hover-depth': '0',
      '--sidebar-toggle-row-hover': '0',
    },
  },
];

const columns: Column[] = [
  { label: '通常', note: '押して試せます（移らずに下に出します）' },
  { label: '行（リンク）に hover', note: 'ステージ', preview: 'hover' },
  { label: '山形に hover', note: 'ステージ', preview: 'button-hover' },
  { label: '行（リンク）にフォーカス', note: 'キーボード', preview: 'focus' },
  { label: '山形にフォーカス', note: 'キーボード', preview: 'button-focus' },
  { label: 'いまいる行', note: 'ステージのページにいる' },
];

function Demo({ link, current }: { link: boolean; current: boolean }) {
  const [went, setWent] = useState('');
  // 見本なので移らず、押した行き先を下に出す
  const go = (event: MouseEvent<HTMLElement>) => {
    const href = event.currentTarget.getAttribute('href');
    if (!href) return;
    event.preventDefault();
    setWent(href);
  };
  return (
    <div className="flex flex-col gap-2">
      {/* SidebarLayout は置かれた面が 48rem より狭いと Drawer にするので、広い骨組みの左だけを見せる */}
      <div style={{ width: 300, height: 280 }} className="overflow-hidden border border-line">
        <div style={{ width: 800, height: 280 }}>
          <SidebarLayout
            sidebar={
              <Sidebar>
                <SidebarSection title="試合管理">
                  <SidebarItem
                    label="大会の概要"
                    icon={<InfoIcon />}
                    href="#overview"
                    onClick={go}
                  />
                  <SidebarItem
                    label="ステージ"
                    icon={<MedalIcon />}
                    href={link ? '#stage' : undefined}
                    current={current}
                    defaultExpanded
                    onClick={go}
                    data-target="stage"
                  >
                    <SidebarItem label="予選リーグ" href="#qualifier" onClick={go} />
                    <SidebarItem label="決勝リーグ" href="#final" onClick={go} />
                  </SidebarItem>
                  <SidebarItem
                    label="参加チーム"
                    icon={<UsersThreeIcon />}
                    href="#teams"
                    onClick={go}
                  />
                </SidebarSection>
              </Sidebar>
            }
          >
            <div />
          </SidebarLayout>
        </div>
      </div>
      <Text size="sm" variant="subtle">
        {went ? `移る先: ${went}` : '行を押すと、移る先をここに出します'}
      </Text>
    </div>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={501}
      axis="入れ子を持つリンクの行"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <Demo link={candidate.id !== '現行版'} current={column.label === 'いまいる行'} />
      )}
    >
      <p>
        入れ子を持つ SidebarItem にも href
        を渡せるようにしました。行はリンクになり、押すとそのページへ移ります。開け閉めは、行の右端の山形のボタンに分けます（リンクの中にボタンは置けないため、行とは別の要素です）。キーボードでは、リンク・山形の順に止まります。
      </p>
      <p>
        選ぶのは、リンクと山形の境目の見せ方と、山形に載せたときの塗り方です。どの案も、山形は開くと下を向きます。畳んだ列の扱いは軸
        502 で比べます。
      </p>
    </Comparison>
  ),
};
