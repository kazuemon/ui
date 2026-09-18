import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { CodeBlock } from '../../src/components/code-block/CodeBlock';
import { CodeGroup } from '../../src/components/code-group/CodeGroup';
import { npmHtml, pnpmHtml, yarnHtml } from '../../src/components/code-group/fixtures';

// 後半の軸 146: コードのタブ（CodeGroup）で、選んでいるタブをどう見せるか
//   --code-group-bar（下の線の太さ）・--code-group-bar-inset（線の幅）・--code-group-bar-color
//   --code-group-tab-selected（選んだタブの塗り）・--code-group-tab-radius・--code-group-tab-inset
//   --color-codeblock-head-bg（帯の地。ファイルタブの案だけ変える）
//   どの案でも、選んだタブの文字は濃く太い（Navbar の現行版と同じ）

function Sample({ appearance }: { appearance?: 'surface' | 'dark' }) {
  return (
    <div className="w-[22rem]">
      <CodeGroup appearance={appearance}>
        <CodeBlock title="pnpm" html={pnpmHtml} />
        <CodeBlock title="npm" html={npmHtml} />
        <CodeBlock title="yarn" html={yarnHtml} />
      </CodeGroup>
    </div>
  );
}

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '下の線',
    intent:
      'Navbar の underline と同じ考え。選んだタブの文字を濃く太くし、下に部品の色の線を引く。タブの並びが、コードの帯の中で押せる場所だと分かる。',
    spec: [
      ['選んだタブ', '濃い文字・太字＋下の線（2px）'],
      ['塗り', 'なし（hover のときだけ淡く敷く）'],
    ],
    tokens: {
      '--code-group-bar': 'calc(var(--spacing) / 2)',
      '--code-group-tab-selected': 'transparent',
    },
  },
  {
    id: 'A',
    name: '太字だけ（線なし）',
    intent:
      'Navbar の既定（text）と同じ。印は文字の濃さと太さだけ。帯に線が増えないので、いちばん静か。タブが 3 つ以上あるとき、どれを見ているか分かりにくい。',
    spec: [
      ['選んだタブ', '濃い文字・太字'],
      ['塗り', 'なし'],
    ],
    tokens: {
      '--code-group-bar': '0px',
      '--code-group-tab-selected': 'transparent',
    },
  },
  {
    id: 'B',
    name: 'グレーの面（pill）',
    intent:
      '選んだタブに、入力欄の prefix と同じ一段濃いグレーを敷く。一覧で選んだ項目と同じ表し方。線を増やさずに、どれを見ているかがはっきりする。',
    spec: [
      ['選んだタブ', '濃い文字・太字＋グレーの面'],
      ['角', '部品より小さい角（6px）'],
    ],
    tokens: {
      '--code-group-bar': '0px',
      '--code-group-tab-selected': 'var(--color-field-addon)',
    },
  },
  {
    id: 'C',
    name: 'ファイルタブ（帯を一段暗く、選んだタブだけ地の色）',
    intent:
      '帯そのものを一段暗くし、選んだタブだけをコードの地と同じ色にして、紙のタブのように手前へ出す。エディタに近い見た目。帯の色が増えるぶん、重く見える。',
    spec: [
      ['帯', 'コードの地より一段暗い'],
      ['選んだタブ', 'コードと同じ地の色でつながる'],
    ],
    tokens: {
      '--color-codeblock-head-bg': 'color-mix(in oklab, var(--color-field), var(--color-fg) 4%)',
      '--code-group-bar': '0px',
      '--code-group-tab-selected': 'var(--color-codeblock-bg)',
      '--code-group-tab-inset': '0px',
      '--code-group-tab-radius': 'var(--radius-md) var(--radius-md) 0 0',
    },
  },
];

const columns: Column[] = [
  { label: '通常', note: '3 つのタブ。左端を開いている' },
  { label: 'hover', note: '開いていないタブ（yarn）', preview: 'hover' },
  { label: 'フォーカス（キーボード）', note: '開いていないタブ（yarn）', preview: 'focus' },
  { label: '濃い地（dark）', note: '同じ案を dark で' },
];

const target = '[data-slot="code-group-tab"]:last-of-type';

const meta = {
  title: 'Design Review/146 コードのタブの見た目',
  id: 'design-review-146-code-group-tabs',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: [`[data-preview="hover"] ${target}`],
      focusVisible: [`[data-preview="focus"] ${target}`],
    },
  },
  args: { pick: 'current,A' },
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
      index={146}
      axis="コードのタブの見た目"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <Sample appearance={column.label === '濃い地（dark）' ? 'dark' : undefined} />
      )}
    >
      <p>
        同じことを別のやり方で書いたコード（pnpm / npm /
        yarn）を切り替えるタブで、いま開いているタブをどう見せるかを選びます。
        タブはコードの題の帯の場所に並びます。文字が濃く太くなるのは、どの案でも同じです。
      </p>
      <p>タブを押したり、Tab で入って ← → で動かしたりして確かめられます。</p>
      <p>
        <strong>どれを既定にしますか。</strong>
        コードの部品なので、利用者が選べるようにはせず、1 つに決める想定です。
      </p>
    </Comparison>
  ),
};
