import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { NumberFormat } from '../../src/components/number-format/NumberFormat';
import { Stat } from '../../src/components/stat/Stat';

// 後半の軸 213: Stat の数字の大きさ
//   決定: 現行版（見出し 1）を既定にし、ほかの段を size で選べる形にした（heading-1・heading-2・
//   heading-3・body）。Stat だけの px の大きさ（B・C）は作らない — 文字の尺度の段に乗せる
//   候補は --stat-value-text・--stat-value-leading の上書きだけで作る

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '見出し 1 と同じ（28／24）',
    intent:
      '見出しの段のいちばん大きい値をそのまま使う。マウスで 28px、指で 24px に自動で小さくなる。見出しと同じ大きさなので、記事の中に置いても浮かない。',
    spec: [
      ['大きさ', 'マウス 28px／指 24px'],
      ['行の高さ', 'マウス 40px／指 34px'],
      ['密度', '見出しの段に従う'],
    ],
    tokens: {
      '--stat-value-text': 'var(--text-heading-1)',
      '--stat-value-leading': 'var(--leading-heading-1)',
    },
  },
  {
    id: 'A',
    name: '見出し 2 と同じ（22／20）',
    intent:
      'ひとまわり小さくする。数字をいくつも並べる一覧で、行の高さが詰まる。1 つだけ大きく見せたい場面では弱い。',
    spec: [
      ['大きさ', 'マウス 22px／指 20px'],
      ['行の高さ', 'マウス 32px／指 30px'],
      ['密度', '見出しの段に従う'],
    ],
    tokens: {
      '--stat-value-text': 'var(--text-heading-2)',
      '--stat-value-leading': 'var(--leading-heading-2)',
    },
  },
  {
    id: 'B',
    name: '見出しより大きい（36px）',
    intent:
      '見出しの段から外れた、Stat だけの大きさにする。数字が主役になり、ラベルとの差がはっきりする。密度の値はまだ持たないので、指でも 36px のまま。',
    spec: [
      ['大きさ', '36px（密度によらず）'],
      ['行の高さ', '44px'],
      ['密度', '決まったら -fine／-coarse を足す'],
    ],
    tokens: {
      '--stat-value-text': '36px',
      '--stat-value-leading': '44px',
    },
  },
  {
    id: 'C',
    name: 'さらに大きい（44px）',
    intent:
      'ページの見出しより大きくし、数字だけを離れて読ませる。トップページに 3〜4 つ並べる使い方に向く。記事の中では大きすぎる。',
    spec: [
      ['大きさ', '44px（密度によらず）'],
      ['行の高さ', '52px'],
      ['密度', '決まったら -fine／-coarse を足す'],
    ],
    tokens: {
      '--stat-value-text': '44px',
      '--stat-value-leading': '52px',
    },
  },
];

const columns: Column[] = [
  { label: '3 桁', note: '単位とキャプション付き' },
  { label: '桁が多い', note: '桁区切りのある 5 桁' },
  { label: '増減付き', note: '数字の右に増減' },
  { label: '横に 3 つ並べる', note: 'トップページの想定' },
  { label: '指の密度', note: 'data-density="coarse"' },
];

function renderCell(column: Column) {
  switch (column.label) {
    case '桁が多い':
      return (
        <Stat
          label="閲覧数"
          value={<NumberFormat value={48219} />}
          caption="直近 30 日"
          align="start"
        />
      );
    case '増減付き':
      return (
        <Stat label="公開記事" value={128} unit="件" delta="12%" trend="up" caption="先月比" />
      );
    case '横に 3 つ並べる':
      return (
        <div className="flex w-[420px] gap-8">
          <Stat label="公開記事" value={128} unit="件" />
          <Stat label="閲覧数" value={<NumberFormat value={48219} />} />
          <Stat
            label="稼働率"
            value={<NumberFormat value={0.999} percent maximumFractionDigits={1} />}
          />
        </div>
      );
    case '指の密度':
      return (
        <div data-density="coarse">
          <Stat label="公開記事" value={128} unit="件" delta="12%" trend="up" caption="先月比" />
        </div>
      );
    default:
      return <Stat label="公開記事" value={128} unit="件" caption="先月比" />;
  }
}

const meta = {
  title: 'Design Review/213 Stat の数字の大きさ',
  id: 'design-review-213-stat-value-size',
  parameters: { layout: 'fullscreen' },
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
      index={213}
      axis="Stat の数字の大きさ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column)}
    >
      <p>
        決定: 現行版（見出し 1 と同じ）を既定にし、ほかの段を <code>size</code>
        で選べる形にしました（<code>heading-1</code>・<code>heading-2</code>・<code>heading-3</code>
        ・<code>body</code>）。全体で共通の尺度は文字の段なので、Stat だけの px
        の大きさ（B・C）は作りません。
      </p>
      <p>
        数字をどれだけ大きく見せるかです。ラベル（14px・太字）、単位（本文）、キャプション（12px）はどの案でも同じで、変えるのは数字の大きさと行の高さだけです。増減の見せ方はこの軸では現行版のまま（矢印＋色の文字）です（軸
        214）。
      </p>
      <p>
        見出しの段のトークンを指す案（現行版・A）は、指で操作するときに見出しと一緒に小さくなります。px
        で持つ案（B・C）は、いまはどちらの密度でも同じ大きさです。B か C
        を選んだときは、指用の値をいくつにするかもあわせて決めます。
      </p>
    </Comparison>
  ),
};
