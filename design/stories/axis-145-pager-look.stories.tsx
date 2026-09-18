import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Pager } from '../../src/components/pager/Pager';

// 後半の軸 145: Pager（記事の前後へ移るナビ）の、前後の行き先の見た目
// 決定: 現行版（押せるカード）を既定にし、B（矢印付きの文字のリンク）も選べるようにした（appearance="card" | "text"）
//   採らなかった A（枠線の pill）・C（区切り線の下に文字）は、ここでだけ作る
//   現行版と A は押せるカードの見た目のトークン（--pager-card-*）の上書きで作る
//   B と C は appearance="text"。C の区切り線は、部品ではなくこのストーリーの枠で引く
//   小さい見出し（「前の記事」）を既定で出すかは未決。列で --pager-label-display を切り替えて見る

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '押せるカード 2 つ',
    intent:
      '前と次を、押せるカードと同じ面にする。地と同じ白なので細い輪郭で面を見せ、hover で面を入力欄の塗りにし、輪郭を 3:1 の濃さにする。押すと沈む。記事の下で、次に読むものが 2 つの塊として見える。',
    spec: [
      ['面', '白（カードと同じ）・細い輪郭'],
      ['角', 'カードの角'],
      ['hover', '面が入力欄の塗り・輪郭が濃く'],
      ['押下', '1px 沈む'],
    ],
    tokens: {
      '--pager-card-padding-block': 'calc(var(--spacing) * 3)',
      '--pager-card-padding-inline': 'calc(var(--spacing) * 4)',
      '--pager-card-radius': 'var(--radius-card)',
      '--pager-card-line-width': 'var(--border-width-thin)',
      '--pager-card-line': 'var(--color-surface-line)',
      '--pager-card-line-hover': 'var(--color-line-strong)',
      '--pager-card-fill': 'var(--color-surface)',
      '--pager-card-fill-hover': 'var(--color-field)',
      '--pager-card-fill-press': 'var(--color-field)',
    },
  },
  {
    id: 'A',
    name: '枠線のリンク 2 つ（pill）',
    intent:
      '密度の高い並びと同じく、塗りではなく枠線に落とす（原則7）。枠線のリンクと同じ pill で、hover は文字の色を淡く敷き、押すと沈む。カードより軽く、記事の本文と競わない。',
    spec: [
      ['面', 'なし・中太の枠線（pill）'],
      ['角', '丸（pill）'],
      ['hover', '文字の色を淡く敷く'],
      ['押下', '敷く色が濃くなり 1px 沈む'],
    ],
    tokens: {
      '--pager-card-padding-block': 'calc(var(--spacing) * 2)',
      '--pager-card-padding-inline': 'var(--spacing-control-x)',
      '--pager-card-radius': 'var(--radius-pill)',
      '--pager-card-line-width': 'var(--border-width-medium)',
      '--pager-card-line': 'var(--color-fg-muted)',
      '--pager-card-line-hover': 'var(--color-fg-muted)',
      '--pager-card-fill': 'transparent',
      '--pager-card-fill-hover':
        'color-mix(in oklab, var(--color-fg) var(--flat-hover-mix), transparent)',
      '--pager-card-fill-press':
        'color-mix(in oklab, var(--color-fg) var(--flat-press-mix), transparent)',
    },
  },
  {
    id: 'B',
    name: '矢印付きの文字のリンク 2 つ',
    intent:
      '面も枠線も持たず、矢印と題だけを左右に置く。題は文字のリンクと同じで、ふだんは淡い下線、hover で下線だけが濃くなる。押すと沈む。記事の終わりがいちばん静かに見える。押せる範囲は矢印と文字の幅だけで、左右に寄せた空きでは反応しない（原則7）。',
    spec: [
      ['見た目', 'appearance="text"'],
      ['面', 'なし'],
      ['題', '淡い下線（hover で濃く）'],
      ['押せる範囲', '矢印と文字の幅'],
    ],
    tokens: {
      '--pager-text-radius': 'var(--radius-control)',
      '--pager-text-underline': 'var(--color-link-underline)',
      '--pager-text-underline-hover': 'var(--color-link-underline-hover)',
    },
  },
  {
    id: 'C',
    name: '区切り線の下に文字だけ',
    intent:
      'B に、記事の本文との境目として細い区切り線を 1 本足す。線は本文と切り離す役で、押せる範囲ではない。',
    spec: [
      ['見た目', 'appearance="text" ＋ 区切り線'],
      ['面', 'なし'],
      ['題', '淡い下線（hover で濃く）'],
      ['区切り線', '上に細い線・下に 16px'],
    ],
    tokens: {
      '--pager-text-radius': 'var(--radius-control)',
      '--pager-text-underline': 'var(--color-link-underline)',
      '--pager-text-underline-hover': 'var(--color-link-underline-hover)',
    },
  },
];

const columns: Column[] = [
  { label: '通常', note: '「前の記事」の小さい見出しあり' },
  { label: '小さい見出しなし', note: '題だけを置く' },
  { label: 'hover', note: '前の行き先に hover', preview: 'hover' },
];

const prev = { href: '#prev', title: 'トークンの決め方' };
const next = { href: '#next', title: 'カードの押し心地を詰める' };

// 幅を決めて、前後を横に並べたところで比べる（狭いと縦に積む）
const width: CSSProperties = { width: '400px' };
const noLabel: CSSProperties & Record<`--${string}`, string> = { '--pager-label-display': 'none' };

const meta = {
  title: 'Design Review/145 Pager の行き先の見た目',
  id: 'design-review-145-pager-look',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: ['[data-preview="hover"] [data-slot="pager-item"][data-direction="prev"]'],
    },
  },
  args: { pick: 'current,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'current,B'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={145}
      axis="Pager（記事の前後へ移るナビ）の行き先の見た目"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const text = candidate.id === 'B' || candidate.id === 'C';
        const pager = <Pager appearance={text ? 'text' : 'card'} prev={prev} next={next} />;
        return (
          <div style={column.label === '小さい見出しなし' ? { ...width, ...noLabel } : width}>
            {/* C の区切り線は、部品ではなくここで引く（採らなかった案） */}
            {candidate.id === 'C' ? (
              <div className="border-t border-line pt-4">{pager}</div>
            ) : (
              pager
            )}
          </div>
        );
      }}
    >
      <p>
        <strong>
          決定: 現行版（押せるカード 2 つ）を既定にし、B（矢印付きの文字のリンク 2
          つ）も選べるようにしました（appearance="card" | "text"）。A（枠線の pill）と
          C（区切り線の下に文字）は採りません。B の押せる範囲は、矢印と文字の幅だけにします。
        </strong>
      </p>
      <p>
        ブログ記事の下に置く「前の記事 /
        次の記事」の見た目です。矢印は外向き、文字は前が左寄せ・次が右寄せで、
        どれも同じです。選んだのは、行き先を<strong>どれくらいの重さの面で見せるか</strong>です。
      </p>
      <p>
        影はどれも付けません（原則1: ページと同じレイヤー）。hover
        と押下はどの案も持ちます（原則3）。押せる範囲は、見えている面の範囲です（原則7）。
      </p>
      <p>
        列は、題の上の小さい見出し（「前の記事」）を出す場合と出さない場合です。見出しを出すと、矢印がなくても前後が分かります。出さないと軽くなり、題だけが並びます。
      </p>
      <p>
        <strong>小さい見出しを既定で出すかは、まだ決まっていません。</strong>
        いまは出す形にしてあります。
      </p>
    </Comparison>
  ),
};
