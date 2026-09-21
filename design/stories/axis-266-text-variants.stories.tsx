import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../../src/components/text/Text';
import { type Candidate, Comparison } from './Comparison';

// 軸 266: Text の variant の段のうち、label・caption の見た目（ADR-0236 の M-08）
// 濃さの 3 段（body・muted・subtle）は決まっている。label・caption は大きさ・行の高さ・太さ・色をまとめて決める組で、
//   いまは欄のラベル・キャプション（src/internal/field/field-styles.ts）と同じ値のまま仮置きになっている
// 候補は design/tokens.css の --text-variant-label-*・--text-variant-caption-* の上書きだけで作る
const meta = {
  title: 'Design Review/266 Text の variant の段',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '欄と同じ（ラベル 14 太字・キャプション 12 subtle）',
    intent:
      '欄のラベル・キャプションと同じ大きさ・太さ・色。欄ではない文を欄の並びに混ぜても、行がそろう',
    spec: [
      ['label', '14px / 20 ・太字 ・fg'],
      ['caption', '12px / 16 ・そのまま ・subtle'],
      ['密度', 'どちらも同じ大きさ（原則11）'],
    ],
    tokens: {
      '--text-variant-label-size': 'var(--text-label)',
      '--text-variant-label-leading': 'var(--leading-label)',
      '--text-variant-label-weight': '700',
      '--text-variant-label-color': 'var(--color-fg)',
      '--text-variant-caption-size': 'var(--text-caption)',
      '--text-variant-caption-leading': 'var(--leading-caption)',
      '--text-variant-caption-weight': 'inherit',
      '--text-variant-caption-color': 'var(--color-fg-subtle)',
    },
  },
  {
    id: 'A',
    name: '本文の段に寄せる（ラベルは本文の大きさで太字）',
    intent:
      'label を本文と同じ大きさの太字にして、見出しの段には入らない小見出しにする。caption は本文より小さい注記の大きさ',
    spec: [
      ['label', '本文（マウス 16 / 指 14）・太字 ・fg'],
      ['caption', '注記（マウス 14 / 指 12）・そのまま ・subtle'],
      ['密度', '本文と一緒に変わる'],
    ],
    tokens: {
      '--text-variant-label-size': 'var(--text-body)',
      '--text-variant-label-leading': 'var(--leading-body)',
      '--text-variant-label-weight': '700',
      '--text-variant-label-color': 'var(--color-fg)',
      '--text-variant-caption-size': 'var(--text-body-sm)',
      '--text-variant-caption-leading': 'var(--leading-body-sm)',
      '--text-variant-caption-weight': 'inherit',
      '--text-variant-caption-color': 'var(--color-fg-subtle)',
    },
  },
  {
    id: 'B',
    name: '小さな見出しラベル（ラベルは注記の大きさで太字・muted）',
    intent:
      'label を一段小さく薄くして、節の上に置く見出しラベルにする。caption は現行版と同じ 12px のまま',
    spec: [
      ['label', '注記（マウス 14 / 指 12）・太字 ・muted'],
      ['caption', '12px / 16 ・そのまま ・subtle（現行版と同じ）'],
      ['密度', 'label だけ本文と一緒に変わる'],
    ],
    tokens: {
      '--text-variant-label-size': 'var(--text-body-sm)',
      '--text-variant-label-leading': 'var(--leading-body-sm)',
      '--text-variant-label-weight': '700',
      '--text-variant-label-color': 'var(--color-fg-muted)',
      '--text-variant-caption-size': 'var(--text-caption)',
      '--text-variant-caption-leading': 'var(--leading-caption)',
      '--text-variant-caption-weight': 'inherit',
      '--text-variant-caption-color': 'var(--color-fg-subtle)',
    },
  },
  {
    id: 'C',
    name: '本文の段・弱めの太さ（ラベルは本文の大きさで中くらい）',
    intent:
      'label は本文と同じ大きさで中くらいの太さ。caption は注記の大きさで、薄すぎない muted にする',
    spec: [
      ['label', '本文（マウス 16 / 指 14）・中くらい ・fg'],
      ['caption', '注記（マウス 14 / 指 12）・そのまま ・muted'],
      ['密度', '本文と一緒に変わる'],
    ],
    tokens: {
      '--text-variant-label-size': 'var(--text-body)',
      '--text-variant-label-leading': 'var(--leading-body)',
      '--text-variant-label-weight': '500',
      '--text-variant-label-color': 'var(--color-fg)',
      '--text-variant-caption-size': 'var(--text-body-sm)',
      '--text-variant-caption-leading': 'var(--leading-body-sm)',
      '--text-variant-caption-weight': 'inherit',
      '--text-variant-caption-color': 'var(--color-fg-muted)',
    },
  },
];

function Settings() {
  return (
    <div className="flex w-[19rem] flex-col gap-2">
      <Text variant="label">メールで知らせる</Text>
      <Text>新しい記事が出たときに、登録したアドレスへ送ります。</Text>
      <Text variant="caption">配信は 1 日 1 通までです。</Text>
    </div>
  );
}

function Card() {
  return (
    <div className="flex w-[19rem] flex-col gap-1 rounded-card border border-line p-4">
      <Text variant="label">最終更新</Text>
      <Text variant="caption">2026年9月18日 10:24</Text>
    </div>
  );
}

function Article() {
  return (
    <div data-reading className="flex w-[19rem] flex-col gap-2">
      <Text variant="muted">muted: この節は、書きかけのまま公開しています。</Text>
      <Text variant="label">label: 図 1 画面の並び</Text>
      <Text variant="caption">caption: 左がマウス、右が指のときの密度です。</Text>
      <Text size="sm" variant="subtle">
        subtle: 2026年9月17日・Design
      </Text>
    </div>
  );
}

export const Variants: Story = {
  name: 'label・caption の見た目',
  render: () => (
    <Comparison
      index={266}
      axis="Text の variant の段（label・caption の見た目）"
      candidates={candidates}
      columns={[
        { label: '設定画面の項目', note: 'label ・本文 ・caption' },
        { label: 'カードの中', note: 'label と caption だけ' },
        { label: '記事の中の補足', note: 'muted ・subtle と並べる' },
      ]}
      renderCell={(column) => {
        if (column.label === '設定画面の項目') return <Settings />;
        if (column.label === 'カードの中') return <Card />;
        return <Article />;
      }}
    >
      <p>
        <code>Text</code> の <code>variant</code> のうち、<code>label</code> と <code>caption</code>{' '}
        の見た目を選びます。濃さの 3 段（<code>body</code>・<code>muted</code>・<code>subtle</code>
        ）は決まっていて、ここで決めるのは「大きさ・行の高さ・太さ・色をまとめて持つ 2
        つを、欄のラベル・キャプションと同じにするか、本文の段に寄せるか」です。
      </p>
      <p>
        現行版は欄と同じ値です。欄ではない見出しを欄の並びに混ぜたとき、行の大きさがそろいます。密度でも大きさが変わりません（原則11）。A・C
        は本文の段に寄せるので、指で操作しているときは本文と一緒に小さくなります。
      </p>
      <p>
        推奨は current です。本文の大きさの太字（A）や中くらいの太さ（C）は、
        <code>weight</code> と <code>size</code> だけでも書けます（
        <code>&lt;Text weight=&quot;bold&quot;&gt;</code>・
        <code>&lt;Text size=&quot;sm&quot; variant=&quot;subtle&quot;&gt;</code>
        ）。<code>label</code>・<code>caption</code>{' '}
        という名前をわざわざ持つ意味は、欄のラベル・キャプションと同じ大きさになることだと思います。
      </p>
      <p>
        どれを既定にしますか。current を既定にして、本文の段に寄せたいところは <code>weight</code>・
        <code>size</code> で書く、という決め方もできます。
      </p>
    </Comparison>
  ),
};
