import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  DescriptionItem,
  DescriptionList,
  type DescriptionListDivider,
} from '../../src/components/description-list/DescriptionList';

// 後半の軸 211: DescriptionList の組と組の区切りの見せ方
//   決定: 現行版（線なし）を既定にし、A（line）・C（framed）・E（leader-dotted）・F（leader-solid）も選べる形にした
//   1 行おきの帯（B）と、点線を文字のベースラインにそろえる D は採らないので、部品からも一覧からも外した
//   E（leader-dotted）・F（leader-solid）は、用語の右から説明までをつなぐ線を行の上下中央に引く

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '線なし（余白だけ）',
    intent:
      '組と組を 12px の余白だけで分ける。線も面もないので、記事や紹介文の流れの中にいちばん軽く置ける。組が多いと、どこまでが 1 組かが読み取りにくくなる。',
    spec: [
      ['divider', 'none（既定）'],
      ['組のあいだ', '12px'],
      ['左右の余白', '0'],
    ],
  },
  {
    id: 'A',
    name: '行のあいだに細い線',
    intent:
      '組のあいだに細い線を引き、上下に 12px の余白を取る。表の lines と同じ考え方で、1 組の範囲がはっきりする。いちばん上の組の上には線を引かない。',
    spec: [
      ['divider', 'line'],
      ['区切り', '細い線（1px）'],
      ['組の上下', '12px'],
    ],
  },
  {
    id: 'C',
    name: '外枠と行の線',
    intent:
      '外枠（部品の角）で全体を囲み、中に行の線を引く。表の framed と同じ形で、まとまった一覧として置ける。枠があるぶん重く、記事の流れの中では目立つ。',
    spec: [
      ['divider', 'framed'],
      ['区切り', '外枠（1px）＋行の線（1px）'],
      ['組の上下', '12px'],
    ],
  },
  {
    id: 'E',
    name: 'つなぐ点線（行の上下中央）',
    intent:
      '同じ点線を、行の上下中央に引く。ベースラインより高い位置になり、用語と説明のあいだを分ける線として読める。文字の下に付かないぶん、点が独立して見える。',
    spec: [
      ['divider', 'leader-dotted'],
      ['線', '点線（1px・薄いグレー）'],
      ['高さ', '行の上下中央'],
    ],
  },
  {
    id: 'F',
    name: 'つなぐ細い実線（行の上下中央）',
    intent:
      '点線をやめ、細い実線を行の上下中央に引く。いちばん静かで、表の罫線に近い。点線より連続して見えるぶん、用語と説明が 1 本の線でつながる。',
    spec: [
      ['divider', 'leader-solid'],
      ['線', '実線（1px・薄いグレー）'],
      ['高さ', '行の上下中央'],
    ],
  },
];

const dividerOf: Record<string, DescriptionListDivider> = {
  現行版: 'none',
  A: 'line',
  C: 'framed',
  E: 'leader-dotted',
  F: 'leader-solid',
};

const columns: Column[] = [
  { label: '3 組', note: '幅 360px' },
  { label: '6 組', note: '数が増えたとき' },
  { label: '説明が長い', note: '折り返す組が混じるとき' },
  { label: '白地でないところ', note: 'グレーの面の上に置いたとき' },
];

const profile = [
  ['所属', 'フリーランス'],
  ['職種', 'フロントエンドエンジニア'],
  ['拠点', '東京'],
  ['はじめた年', '2019 年'],
  ['得意', 'デザインシステム'],
  ['連絡先', 'hello@example.com'],
] as const;

function list(divider: DescriptionListDivider, count: number) {
  return (
    <DescriptionList divider={divider}>
      {profile.slice(0, count).map(([term, value]) => (
        <DescriptionItem key={term} term={term}>
          {value}
        </DescriptionItem>
      ))}
    </DescriptionList>
  );
}

function renderCell(column: Column, candidate: Candidate) {
  const divider = dividerOf[candidate.id] ?? 'none';
  switch (column.label) {
    case '6 組':
      return <div className="w-[360px]">{list(divider, 6)}</div>;
    case '説明が長い':
      return (
        <div className="w-[360px]">
          <DescriptionList divider={divider}>
            <DescriptionItem term="所属">フリーランス</DescriptionItem>
            <DescriptionItem term="担当">
              デザインシステムの設計と、部品の実装をひとりで進めています。原則を決めてから作る進め方です。
            </DescriptionItem>
            <DescriptionItem term="拠点">東京</DescriptionItem>
          </DescriptionList>
        </div>
      );
    case '白地でないところ':
      return <div className="w-[360px] rounded-card bg-neutral p-4">{list(divider, 3)}</div>;
    default:
      return <div className="w-[360px]">{list(divider, 3)}</div>;
  }
}

const meta = {
  title: 'Design Review/211 DescriptionList の区切り',
  id: 'design-review-211-description-list-divider',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'C', 'E', 'F'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={211}
      axis="DescriptionList の組と組の区切りの見せ方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => renderCell(column, candidate)}
    >
      <p>
        決定: 現行版（線なし）を既定にし、A（<code>divider=&quot;line&quot;</code>）・C（
        <code>divider=&quot;framed&quot;</code>）・E（<code>divider=&quot;leader-dotted&quot;</code>
        ）・F（<code>divider=&quot;leader-solid&quot;</code>）も選べる形にしました。
      </p>
      <p>
        採らなかった案: 1 行おきの帯（B）と、点線を文字のベースラインにそろえる D。D
        は部品から外したので、この一覧にもありません。E・F
        はどちらも用語の列の幅は使わず、用語は中身の幅、線が残りを埋め、説明は右に付きます。線は装飾なので読み上げには出しません。縦（
        <code>layout=&quot;stacked&quot;</code>）のときは引きません。
      </p>
    </Comparison>
  ),
};
