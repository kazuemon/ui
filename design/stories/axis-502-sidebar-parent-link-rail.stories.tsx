import { InfoIcon, MedalIcon, UsersThreeIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Sidebar } from '../../src/components/sidebar/Sidebar';
import {
  type SidebarRailLinkCompare,
  SidebarRailLinkCompareContext,
} from '../../src/components/sidebar/sidebar-context';
import { SidebarItem } from '../../src/components/sidebar/SidebarItem';
import { SidebarLayout } from '../../src/components/sidebar/SidebarLayout';
import { SidebarSection } from '../../src/components/sidebar/SidebarSection';

// 軸 502: 畳んだ列（rail）で、入れ子を持つリンクの行をどう扱うか
const at = (preview: string, target: string) => `[data-preview="${preview}"] ${target}`;
const row = '[data-target="stage"]';

const meta = {
  title: 'Design Review/502 入れ子を持つリンクの行（畳んだ列）',
  id: 'design-review-502-sidebar-parent-link-rail',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: [at('hover', row)],
      focusVisible: [at('focus', row)],
    },
  },
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
    name: '面を開くだけ',
    intent:
      '入れ子を持つ行は href を受けない。アイコンに載せる・押すと横に面を開き、面の見出しに行の名前を出す',
    spec: [
      ['アイコンを押す', '面を開く'],
      ['面の先頭', '見出し（ステージ）'],
    ],
  },
  {
    id: 'A',
    name: '面の先頭にリンク',
    intent:
      'アイコンは今どおり面を開く。面の先頭に行そのもののリンク（ステージ）を置き、区切り線のあとに入れ子を並べる。指でもキーボードでも同じ手順で行ける',
    spec: [
      ['アイコンを押す', '面を開く'],
      ['面の先頭', 'ステージへのリンク＋区切り線'],
      ['見出し', 'submenuTitle を渡したときだけ'],
    ],
  },
  {
    id: 'B',
    name: 'アイコンがリンク',
    intent:
      'アイコンそのものをリンクにし、押すとステージへ移る。載せると今どおり面を開く（見出しはステージ）。hover のない指の画面では、入れ子に行けない',
    spec: [
      ['アイコンを押す', 'ステージへ移る'],
      ['アイコンに載せる', '面を開く'],
      ['面の先頭', '見出し（ステージ）'],
    ],
  },
];

const columns: Column[] = [
  { label: '通常', note: '載せる・押して試せます' },
  { label: 'アイコンに hover', note: 'ステージ', preview: 'hover' },
  { label: 'アイコンにフォーカス', note: 'キーボード', preview: 'focus' },
  { label: '面を開いたところ', note: 'ステージのページにいる' },
];

function Demo({ link, compare }: { link: boolean; compare: SidebarRailLinkCompare }) {
  return (
    // SidebarLayout は置かれた面が 48rem より狭いと Drawer にするので、広い骨組みの左だけを見せる
    <div style={{ width: 300, height: 260 }} className="overflow-hidden border border-line">
      <div style={{ width: 800, height: 260 }}>
        <SidebarRailLinkCompareContext value={compare}>
          <SidebarLayout
            defaultCollapsed
            sidebar={
              <Sidebar>
                <SidebarSection title="試合管理">
                  <SidebarItem label="大会の概要" icon={<InfoIcon />} href="#overview" />
                  <SidebarItem
                    label="ステージ"
                    icon={<MedalIcon />}
                    href={link ? '#stage' : undefined}
                    current={compare.flyoutDefaultOpen}
                    data-target="stage"
                  >
                    <SidebarItem label="予選リーグ" href="#qualifier" />
                    <SidebarItem label="決勝リーグ" href="#final" />
                  </SidebarItem>
                  <SidebarItem label="参加チーム" icon={<UsersThreeIcon />} href="#teams" />
                </SidebarSection>
              </Sidebar>
            }
          >
            <div />
          </SidebarLayout>
        </SidebarRailLinkCompareContext>
      </div>
    </div>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={502}
      axis="入れ子を持つリンクの行（畳んだ列）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <Demo
          link={candidate.id !== '現行版'}
          compare={{
            railParentLink: candidate.id === 'B' ? 'icon' : 'flyout',
            flyoutDefaultOpen: column.label === '面を開いたところ',
          }}
        />
      )}
    >
      <p>
        軸 501 で、入れ子を持つ SidebarItem
        もリンクにできるようにしました。畳んだ列ではアイコンしか残らないので、アイコンを押したときに移るか、入れ子の面を開くかを決めます。
      </p>
      <p>
        狭い画面を Menu で出すとき（narrowPresentation="menu"）と、面の中の入れ子は、どの案でも A
        と同じく、入れ子の面の先頭にリンクを置きます（Menu の項目は、移る・開くのどちらか 1
        つしか持てないため）。
      </p>
    </Comparison>
  ),
};
