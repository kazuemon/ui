import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Tree, TreeItem } from '../../src/components/tree/Tree';

// 後半の軸 150: 木の「いまいる行」の印
//   --tree-current-bg（面）・--tree-current-fg（文字）・--tree-current-bar（左の印の太さ。0 でなし）・--tree-current-bar-color
//   どの案でも、いまいる行の文字は太字（Navbar の現行版と同じ）
//   色を持たないとき（neutral）の面は、Select の選んだ項目と同じグレー。色を指定すると、その色の淡い面になる

function Sample({ color }: { color?: 'primary' | 'secondary' | 'neutral' }) {
  return (
    <div className="w-56">
      <Tree label="ドキュメント" color={color}>
        <TreeItem label="はじめに" href="#intro" onClick={(e) => e.preventDefault()} />
        <TreeItem label="部品" defaultExpanded>
          <TreeItem label="Button" href="#button" onClick={(e) => e.preventDefault()} />
          <TreeItem
            label="TextField"
            href="#text-field"
            current
            onClick={(e) => e.preventDefault()}
          />
          <TreeItem label="Select" href="#select" onClick={(e) => e.preventDefault()} />
        </TreeItem>
        <TreeItem label="デザイン原則" href="#principles" onClick={(e) => e.preventDefault()} />
      </Tree>
    </div>
  );
}

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '淡い面＋太字',
    intent:
      '一覧で選んだ項目（Select）と同じ表し方。面で場所がすぐ分かる。行の hover も面なので、載せているのか、いまいる行なのかは濃さの差で見分ける。',
    spec: [
      ['面', 'あり（色を指定するとその淡い面）'],
      ['文字', '太字・濃い'],
      ['左の印', 'なし'],
    ],
    tokens: { '--tree-current-bar': '0px' },
  },
  {
    id: 'A',
    name: '太字だけ（面なし）',
    intent:
      'Navbar のいまいるページと同じ、文字の濃さと太さだけ。面が hover 専用になるので、載せたときの反応がいちばん読みやすい。長い一覧では、いまいる行を探しにくい。',
    spec: [
      ['面', 'なし'],
      ['文字', '太字・濃い'],
      ['左の印', 'なし'],
    ],
    tokens: {
      '--tree-current-bg': 'transparent',
      '--tree-current-hover': 'var(--tree-row-hover)',
      '--tree-current-bar': '0px',
    },
  },
  {
    id: 'B',
    name: '左に色の縦線＋太字',
    intent:
      '行の左端に部品の色の短い縦線を引く。面を使わないので hover とぶつからず、段が深くても左端の線で場所が分かる。線が案内線（軸 149）と並ぶと、線が増えて見える。',
    spec: [
      ['面', 'なし'],
      ['文字', '太字・濃い'],
      ['左の印', '2px の縦線（部品の色）'],
    ],
    tokens: {
      '--tree-current-bg': 'transparent',
      '--tree-current-hover': 'var(--tree-row-hover)',
      '--tree-current-bar': 'calc(var(--spacing) / 2)',
    },
  },
  {
    id: 'C',
    name: '淡い面＋左に色の縦線',
    intent:
      '面と線の両方。ドキュメントのサイドバーでよく見る形で、いちばんはっきりする。印が 2 つになるぶん、静かさは減る。',
    spec: [
      ['面', 'あり'],
      ['文字', '太字・濃い'],
      ['左の印', '2px の縦線（部品の色）'],
    ],
    tokens: { '--tree-current-bar': 'calc(var(--spacing) / 2)' },
  },
];

const columns: Column[] = [
  { label: '色なし（neutral）' },
  { label: '青（primary）' },
  { label: 'ピンク（secondary）' },
  { label: 'いまいる行に hover', note: '色なし', preview: 'hover' },
];

const target = '[data-slot="tree-item"][href="#text-field"]';

const meta = {
  title: 'Design Review/150 木のいまいる行の印',
  id: 'design-review-150-tree-current',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: [`[data-preview="hover"] ${target}`],
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
      index={150}
      axis="木のいまいる行の印"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <Sample
          color={
            column.label === '青（primary）'
              ? 'primary'
              : column.label === 'ピンク（secondary）'
                ? 'secondary'
                : 'neutral'
          }
        />
      )}
    >
      <p>
        <strong>
          決定: 現行版（淡い面＋太字）を既定にし、A（太字だけ）も選べる（
          <code>currentIndicator</code>）。
        </strong>
        B・C（左に色の縦線）は採りませんでした。
      </p>
      <p>
        いま開いているページの行を、どう見せるかを選びます。どの案でも文字は太字です。行に載せたときの塗り（グレー）は共通なので、
        面を使う案では「載せている行」と「いまいる行」が近い見え方になります。いちばん右の列で、いまいる行に載せたところを見られます。
      </p>
      <p>
        <strong>どれを既定にしますか。</strong>
        色（<code>color</code>）は利用者が選べます。印の形は 1 つに決めるか、props
        で選べるようにするかも決めてください。
      </p>
    </Comparison>
  ),
};
