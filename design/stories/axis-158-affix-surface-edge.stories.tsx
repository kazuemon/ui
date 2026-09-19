import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { BarScene } from '../../src/components/affix/story-scenes';

// 後半の軸 158: 帯として留める Affix（surface）の、下の内容との境目
//   画面に貼り付いて内容が下を通るものは、重なりとして扱う（原則1）。Navbar の sticky は「細い線（既定）・淡い影」を選べる（ADR-0131）
//   Affix の帯は、留まる前はページの一部（すぐ下に内容が続く）なので、境目を留まったときだけ出すか、いつも出すかも比べる
//   候補は Affix のトークン（--affix-line・--affix-line-stuck・--affix-shadow-*-stuck）の上書きだけで作る
//   目次や「上へ戻る」のように面を持たない使い方（surface なし）には関わらない

const none = '0 0 #0000';

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '留まったときだけ細い線',
    intent:
      '留まる前は線を出さず、本文と地続きに見せる。留まって内容が下を通りはじめたら、貼り付けた Navbar の既定と同じ細い線で区切る。',
    spec: [
      ['留まる前', '境目なし'],
      ['留まったあと', '細い線'],
    ],
    tokens: {
      '--affix-line': 'transparent',
      '--affix-line-stuck': 'var(--color-line)',
      '--affix-shadow-top-stuck': none,
      '--affix-shadow-bottom-stuck': none,
    },
  },
  {
    id: 'A',
    name: '留まったときだけ淡い影',
    intent:
      '留まったら、線の代わりに淡い影を落として重なりとして見せる（Navbar の stickyEdge="shadow" と同じ影）。下に留まる帯は影を上へ向ける。',
    spec: [
      ['留まる前', '境目なし'],
      ['留まったあと', '淡い影（Navbar の shadow と同じ）'],
    ],
    tokens: {
      '--affix-line': 'transparent',
      '--affix-line-stuck': 'transparent',
      '--affix-shadow-top-stuck': 'var(--navbar-sticky-shadow)',
      '--affix-shadow-bottom-stuck': '0 -4px 16px rgb(from var(--color-shadow) r g b / 0.08)',
    },
  },
  {
    id: 'B',
    name: 'いつも細い線',
    intent:
      '留まる前から細い線で区切り、留まっても変えない。Navbar と同じく、帯であることをいつも見せる。スクロールで見た目が変わらない。',
    spec: [
      ['留まる前', '細い線'],
      ['留まったあと', '細い線'],
    ],
    tokens: {
      '--affix-line': 'var(--color-line)',
      '--affix-line-stuck': 'var(--color-line)',
      '--affix-shadow-top-stuck': none,
      '--affix-shadow-bottom-stuck': none,
    },
  },
  {
    id: 'C',
    name: '境目なし（白い面だけ）',
    intent:
      '線も影も付けず、白い面だけで下の内容を隠す。いちばん軽いが、内容が帯の下へ消えていく境目は面の端だけになる。',
    spec: [
      ['留まる前', '境目なし'],
      ['留まったあと', '境目なし'],
    ],
    tokens: {
      '--affix-line': 'transparent',
      '--affix-line-stuck': 'transparent',
      '--affix-shadow-top-stuck': none,
      '--affix-shadow-bottom-stuck': none,
    },
  },
];

const columns: Column[] = [
  { label: '上の帯: 留まる前', note: 'スクロールする前' },
  { label: '上の帯: 留まったあと', note: '内容が帯の下を通っている' },
  { label: '下の帯: 留まったあと', note: '記事を読んでいるあいだ' },
  { label: '下の帯: 留まる前', note: '記事の終わりで本来の位置に収まった' },
];

const size = { width: 'w-[400px]', height: 'h-[260px]' };

function renderCell(column: Column) {
  switch (column.label) {
    case '上の帯: 留まる前':
      return <BarScene {...size} />;
    case '上の帯: 留まったあと':
      return <BarScene {...size} scroll={240} />;
    case '下の帯: 留まったあと':
      return <BarScene {...size} edge="bottom" />;
    default:
      return <BarScene {...size} edge="bottom" scroll="end" />;
  }
}

const meta = {
  title: 'Design Review/158 帯として留めるときの境目',
  id: 'design-review-158-affix-surface-edge',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
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
      index={158}
      axis="帯として留める Affix の、下の内容との境目"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column)}
    >
      <p>
        Affix
        は、スクロールしても画面の端に留まる枠です。目次や「上へ戻る」のように中身が自分の見た目を持つときは、枠は何も描きません。ここで決めるのは、記事の題と共有のボタンを並べた帯のように、白い面を敷いて内容が下を通る使い方（surface）の境目です。
      </p>
      <p>
        画面に貼り付いて内容が下を通るものは重なりとして扱う、と決めています（原則1）。貼り付けた
        Navbar
        は細い線が既定で、淡い影も選べます（ADR-0131）。帯は留まる前は本文と地続きなので、境目を留まったときだけ出すか、いつも出すかも比べます。
      </p>
      <p>
        各セルの枠の中はスクロールできます。上下に動かして、境目が出る瞬間も見てください。どれを既定にするか、ほかに選べるようにしたい案があれば、それも教えてください。
      </p>
    </Comparison>
  ),
};
