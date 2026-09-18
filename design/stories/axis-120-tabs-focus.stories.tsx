import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { TabsFocusTabColumn, TabsSample, tabsFocusPseudo } from './tabs-samples';

// 後半の軸 120: Tabs とその内容（TabPanel）にフォーカスしたときの線
// かずえもんのメモ: 「Tabs とその内容にフォーカスしたときのフォーカスリングについて考えたいです。
//   下線よりもはみ出しているので、違和感があります」「Tab の内容も pill の形のフォーカスリングになってしまいますね」
// タブは pill（--tabs-tab-radius）のまま外に離すので、線が下の印・並びの線の下まで出てしまう
// パネルは --radius-control（12px）のまま外に離すので、1行だと丈が低く、線が pill に見える
// どちらも focusRing（src/internal/focus-styles.ts）の離れ・角を、部品の内部の値（--tabs-tab-focus-*・--tabs-panel-focus-*）で
//   差し替えられるようにした（src/components/tabs/Tabs.tsx）。ここでは値だけを候補ごとに変える
// タブとパネルは別々の見せ方の問題なので、候補も別々に効かせる（A・B はタブだけ、C・D はパネルだけを変え、もう片方は現行のまま）

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'いまの形',
    intent:
      'タブは pill の角のまま外へ 2px 離すので、線が選んだタブの下の印・並び全体の下の線の下まで出る。パネルは部品の角（12px）のまま外へ 2px 離すので、1行だと丈が低く、線がタブに pill で張り付いて見える。',
    spec: [
      ['タブ 離れ', '外へ 2px（--focus-ring-offset）'],
      ['タブ 角', 'pill のまま（--tabs-tab-radius）'],
      ['パネル 離れ', '外へ 2px（--focus-ring-offset）'],
      ['パネル 角', '12px（--radius-control）'],
      ['パネル 止まり先', '常にパネル自体（tabIndex 0）'],
    ],
    tokens: {
      '--tabs-tab-focus-offset': 'var(--focus-ring-offset)',
      '--tabs-panel-radius': 'var(--radius-control)',
    },
  },
  {
    id: 'A',
    name: 'タブ: 内側へ（pill のまま）',
    intent:
      'タブの離れをマイナスにし、線をタブの内側へ引く。角は変えずpillのまま。線の下端が下の印・並びの線より上に、少し離れて収まる。パネルは比較のため現行のまま。',
    tokens: {
      '--tabs-tab-focus-offset': 'calc(var(--spacing) * -1)',
      '--tabs-panel-radius': 'var(--radius-control)',
    },
    spec: [
      ['タブ 離れ', '内側へ 4px（calc(var(--spacing) * -1)）'],
      ['タブ 角', 'pill のまま'],
      ['パネル', '現行のまま'],
    ],
  },
  {
    id: 'B',
    name: 'タブ: 内側へ＋角丸長方形',
    intent:
      'A に加え、フォーカス中だけ角を部品の角（12px）に変える。線が四隅で pill ほど丸まらず、角丸長方形になる。角を変えるクラスは塗り（hover・押下）と同じ変数を読むので、フォーカス中に hover が重なると塗りの角も一緒に変わる（許容する）。パネルは比較のため現行のまま。',
    tokens: {
      '--tabs-tab-focus-offset': 'calc(var(--spacing) * -1)',
      // 決定後の部品ではフォーカス中だけ角を変える値がないので、タブの角ごと変えて描く
      '--tabs-tab-radius': 'var(--radius-control)',
      '--tabs-panel-radius': 'var(--radius-control)',
    },
    spec: [
      ['タブ 離れ', '内側へ 4px'],
      ['タブ 角（フォーカス中）', '12px（--radius-control）。塗りの角も一緒に変わる'],
      ['パネル', '現行のまま'],
    ],
  },
  {
    id: 'C',
    name: 'パネル: さらに外側へ・同心の角',
    intent:
      'パネルの離れを 8px に広げ、角も離れた分だけ足して同心にする（12px + 8px = 20px）。文にぴったり張り付く pill ではなく、中身を囲む領域として見える。タブは比較のため現行のまま。',
    tokens: {
      // 決定後の部品ではパネルだけの離れがないので、全体の離れを広げ、タブは現行の 2px に戻して描く（線の角は離れの分だけ丸まる）
      '--focus-ring-offset': 'calc(var(--spacing) * 2)',
      '--tabs-tab-focus-offset': '2px',
      '--tabs-panel-radius': 'var(--radius-control)',
    },
    spec: [
      ['パネル 離れ', '外へ 8px（calc(var(--spacing) * 2)）'],
      ['パネル 角', '20px（12px + 8px。離れの分だけ足して同心に）'],
      ['タブ', '現行のまま'],
    ],
  },
  {
    id: 'D',
    name: 'パネル: 止まり先から外す',
    intent:
      'パネルの中に押せるもの（「続きを読む」リンク）があるときは、パネル自体を Tab の止まり先から外す（tabIndex を外す）。フォーカスはリンクへ直接移り、パネルの箱に線は出ない。WAI-ARIA の tabpanel パターンは、中に押せるものがあるときはパネル自体を止まり先にしなくてよいとしている。トークンでは表せないので、この行だけ props（tabIndex）で描く。タブは比較のため現行のまま。',
    spec: [
      ['パネル 止まり先', 'パネル自体ではなく中のリンク（tabIndex を外す）'],
      ['パネルの線', '出ない（リンク自身の focusRing が出る）'],
      ['タブ', '現行のまま'],
    ],
    tokens: {
      '--tabs-tab-focus-offset': 'var(--focus-ring-offset)',
      '--tabs-panel-radius': 'var(--radius-control)',
    },
  },
  {
    id: '決定',
    name: 'タブは A、パネルは角を小さく',
    intent:
      'タブは A（内側へ 4px・pill のまま）。パネルは離れを全体と同じ 2px のまま、角を 6px にする。1 行のパネルでも線が pill にならず、角丸の四角に見える。',
    spec: [
      ['タブ 離れ', '内側へ 4px'],
      ['タブ 角', 'pill のまま'],
      ['パネル 離れ', '外へ 2px'],
      ['パネル 角', '6px（--radius-md）'],
    ],
  },
];

const columns: Column[] = [
  {
    label: 'タブにフォーカス',
    note: '下線・underline・subtle の3つの印で。1つ目のタブへ',
    preview: 'tab',
  },
  { label: 'パネルにフォーカス（1行）', preview: 'panel-one' },
  { label: 'パネルにフォーカス（複数行）', preview: 'panel-several' },
];

const meta = {
  title: 'Design Review/120 Tabs のフォーカスの線',
  id: 'design-review-120-tabs-focus',
  tags: ['visual'],
  parameters: { layout: 'fullscreen', pseudo: tabsFocusPseudo },
  args: { pick: '決定' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D', '決定'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={120}
      axis="Tabs のフォーカスの線"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const panelFocusable = candidate.id !== 'D';
        switch (column.label) {
          case 'タブにフォーカス':
            return <TabsFocusTabColumn color="primary" />;
          case 'パネルにフォーカス（1行）':
            return (
              <TabsSample color="primary" panel panelLines="one" panelFocusable={panelFocusable} />
            );
          default:
            return (
              <TabsSample
                color="primary"
                panel
                panelLines="several"
                panelFocusable={panelFocusable}
              />
            );
        }
      }}
    >
      <p>
        <strong>
          決定（ADR 未定）: タブは A（内側へ・pill のまま）。パネルは C・D ではなく、角を小さくして
          1 行でも pill に見えない形にしました（最後の行）。
        </strong>
      </p>
      <p>
        タブは
        pill（丸ごと丸い角）のまま外へ離すので、線が選んだタブの下の印・並び全体の下の線の下まではみ出します。パネルは部品の角（12px）のまま外へ離すので、1
        行だと丈が低く、線がタブの中身に pill
        でぴったり張り付いて見えます。どちらも、フォーカスの線（outline）は要素自身の角（border-radius）に沿うので、決めたあとの部品は、タブの離れ（
        <code>--tabs-tab-focus-offset</code>）とパネルの角（<code>--tabs-panel-radius</code>
        ）だけを持ちます。現行版と A〜D
        の行は、その値と全体の離れを上書きして前の見た目を描いています。
      </p>
      <p>
        タブとパネルは別々の見え方の問題なので、候補も別々に効かせています。A・B
        はタブの線だけを変え、パネルは現行のまま。C・D
        はパネルの線だけを変え、タブは現行のまま。組み合わせて選べます。
      </p>
      <p>
        B
        は、フォーカス中の角を部品の角（--radius-control）に変える案です。角は塗り（hover・押下）と同じ変数で解いているので、フォーカス中に
        hover が重なると塗りの角も一緒に角丸長方形になります。線だけ別の角にする案（outline
        は要素自身の角に沿うため、線だけ丸めるには別の見せ方がいります）ではなく、この「一緒に変える」方を採りました。
      </p>
      <p>
        D
        は、パネルの中に押せるもの（リンクなど）があるときだけの案です。1行・複数行の列には、そのための「続きを読む」リンクを足しています。パネルの中身が文字だけで押せるものが無いときは、パネル自体を止まり先に残す必要があります（D
        はそのときには使えません）。
      </p>
      <p>
        タブの線（現行・A・B）と、パネルの線（現行・C・D）を、それぞれどれを既定にするか教えてください。
      </p>
    </Comparison>
  ),
};
