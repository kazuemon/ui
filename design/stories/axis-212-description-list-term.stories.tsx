import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  DescriptionItem,
  DescriptionList,
} from '../../src/components/description-list/DescriptionList';

// 後半の軸 212: DescriptionList の用語（dt）の見せ方
//   決定: 現行版（本文の大きさ・太字・本文の色）を既定にし、Field のラベルと同じ見た目（14px・太字・
//   本文の色）を termStyle="label" で選べる形にした。一段淡くする案（A・B、C の淡い色）は採らない
//   残した候補は termStyle の props で描く（淡さのトークンは部品から外した）

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '本文の大きさ・太字・本文の色',
    intent:
      '用語は値の名前（ラベル）なので、太字で本文と同じ濃さにする。説明と同じ大きさなので、横に並べたときに行の高さがそろう。用語と説明の差は太さだけになる。',
    spec: [
      ['termStyle', 'default（既定）'],
      ['大きさ', '本文（マウス 16／指 14）'],
      ['太さ・濃さ', '太字・本文と同じ'],
    ],
  },
  {
    id: 'C',
    name: 'ラベルの大きさ・太字・本文の色',
    intent:
      '用語を入力欄のラベルと同じ見た目（14px・太字・本文の色）にする。Field のラベルとそろい、値との差がはっきりする。横に並べると、用語と説明の 1 行目がベースラインでそろう。',
    spec: [
      ['termStyle', 'label'],
      ['大きさ', 'ラベル（14px・密度によらず同じ）'],
      ['太さ・濃さ', '太字・本文と同じ'],
    ],
  },
];

const columns: Column[] = [
  { label: '横に並べる', note: '幅 360px' },
  { label: '縦に並べる', note: 'layout="stacked"' },
  { label: '組が多い', note: '6 組' },
  { label: '指の密度', note: 'data-density="coarse"' },
];

const profile = [
  ['所属', 'フリーランス'],
  ['職種', 'フロントエンドエンジニア'],
  ['拠点', '東京'],
  ['はじめた年', '2019 年'],
  ['得意', 'デザインシステム'],
  ['連絡先', 'hello@example.com'],
] as const;

function list(termStyle: 'default' | 'label', count: number, stacked = false) {
  return (
    <DescriptionList termStyle={termStyle} layout={stacked ? 'stacked' : 'horizontal'}>
      {profile.slice(0, count).map(([term, value]) => (
        <DescriptionItem key={term} term={term}>
          {value}
        </DescriptionItem>
      ))}
    </DescriptionList>
  );
}

function renderCell(column: Column, candidate: Candidate) {
  const termStyle = candidate.id === 'C' ? 'label' : 'default';
  switch (column.label) {
    case '縦に並べる':
      return <div className="w-[300px]">{list(termStyle, 3, true)}</div>;
    case '組が多い':
      return <div className="w-[360px]">{list(termStyle, 6)}</div>;
    case '指の密度':
      return (
        <div data-density="coarse" className="w-[360px]">
          {list(termStyle, 3)}
        </div>
      );
    default:
      return <div className="w-[360px]">{list(termStyle, 3)}</div>;
  }
}

const meta = {
  title: 'Design Review/212 DescriptionList の用語の見せ方',
  id: 'design-review-212-description-list-term',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={212}
      axis="DescriptionList の用語（dt）の大きさ・太さ・濃さ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => renderCell(column, candidate)}
    >
      <p>
        決定: 現行版（本文の大きさ・太字・本文の色）を既定にし、Field のラベルと同じ見た目（14px・
        太字・本文の色）を <code>termStyle=&quot;label&quot;</code>
        で選べる形にしました。用語を一段淡くする案（A・B）は採らないので、一覧からも外しています。
      </p>
      <p>
        用語は値の名前なので、部品のラベルと同じ扱いにするか、本文と同じ扱いにするかを決めます。
        説明（dd）はどの案でも本文の大きさ・本文の色のままです。区切りの線は出していません（軸
        211）。
      </p>
      <p>
        原則 4
        は「ラベルは太字」とだけ決めていて、大きさは決めていません。どちらの案も濃さは本文と同じで、変わるのは大きさだけです。
      </p>
    </Comparison>
  ),
};
