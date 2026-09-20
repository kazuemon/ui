import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  DescriptionItem,
  DescriptionList,
} from '../../src/components/description-list/DescriptionList';
import { Tag } from '../../src/components/tag/Tag';

// 後半の軸 210: DescriptionList の用語と説明の並び
//   決定: 現行版（横・用語の列 128px・左寄せ）を既定にし、C（縦）を layout="stacked"、
//   B（用語の右寄せ）を termAlign="end" で選べる形にした。A（192px）は termWidth で指定する
//   候補は --description-direction・--description-term-width・--description-term-align・
//   --description-item-align・--description-column-gap・--description-row-gap の上書きだけで作る

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '横・用語の列 128px',
    intent:
      '用語を左の列に固定の幅で置き、説明をその右に置く。用語と説明の 1 行目のベースラインをそろえる。説明が長いときは、用語の列に回り込まずに折り返す。',
    spec: [
      ['並び', '横（用語が左）'],
      ['用語の列', '128px・左寄せ'],
      ['用語と説明の間', '16px'],
    ],
    tokens: {
      '--description-direction': 'row',
      '--description-item-align': 'baseline',
      '--description-term-width': '128px',
      '--description-term-align': 'start',
      '--description-column-gap': '16px',
      '--description-row-gap': '4px',
    },
  },
  {
    id: 'A',
    name: '横・用語の列 192px',
    intent:
      '用語の列を広げる。「はじめた年」「使っている技術」のような長い用語が折り返さない。そのぶん説明の幅は狭くなる。',
    spec: [
      ['並び', '横（用語が左）'],
      ['用語の列', '192px・左寄せ'],
      ['用語と説明の間', '16px'],
    ],
    tokens: {
      '--description-direction': 'row',
      '--description-item-align': 'baseline',
      '--description-term-width': '192px',
      '--description-term-align': 'start',
      '--description-column-gap': '16px',
      '--description-row-gap': '4px',
    },
  },
  {
    id: 'B',
    name: '横・用語を右寄せ',
    intent:
      '用語の列は 128px のまま、用語を右へ寄せる。用語と説明のあいだが詰まり、長さの違う用語でも説明の左端との距離が一定になる。',
    spec: [
      ['並び', '横（用語が左）'],
      ['用語の列', '128px・右寄せ'],
      ['用語と説明の間', '16px'],
    ],
    tokens: {
      '--description-direction': 'row',
      '--description-item-align': 'baseline',
      '--description-term-width': '128px',
      '--description-term-align': 'end',
      '--description-column-gap': '16px',
      '--description-row-gap': '4px',
    },
  },
  {
    id: 'C',
    name: '縦（用語の下に説明）',
    intent:
      '用語を説明の上に置く。部品の3層（ラベル・本体・キャプション）と同じ並びで、狭い幅でも説明が広く取れる。そのぶん縦に長くなり、一度に見える組の数は減る。',
    spec: [
      ['並び', '縦（用語が上）'],
      ['用語の列', 'なし（幅いっぱい）'],
      ['用語と説明の間', '4px'],
    ],
    tokens: {
      '--description-direction': 'column',
      '--description-item-align': 'stretch',
      '--description-term-width': 'auto',
      '--description-term-align': 'start',
      '--description-column-gap': '16px',
      '--description-row-gap': '4px',
    },
  },
];

const columns: Column[] = [
  { label: '短い用語', note: '幅 360px' },
  { label: '長い用語', note: '「はじめた年」「使っている技術」' },
  { label: '説明が長い', note: '2〜3 行に折り返す' },
  { label: '説明に部品', note: 'Tag を並べる' },
  { label: '狭い幅', note: '幅 240px（スマートフォンの想定）' },
];

function renderCell(column: Column) {
  switch (column.label) {
    case '長い用語':
      return (
        <div className="w-[360px]">
          <DescriptionList>
            <DescriptionItem term="はじめた年">2019 年</DescriptionItem>
            <DescriptionItem term="使っている技術">TypeScript</DescriptionItem>
            <DescriptionItem term="拠点">東京</DescriptionItem>
          </DescriptionList>
        </div>
      );
    case '説明が長い':
      return (
        <div className="w-[360px]">
          <DescriptionList>
            <DescriptionItem term="担当">
              デザインシステムの設計と、部品の実装をひとりで進めています。原則を決めてから作る進め方です。
            </DescriptionItem>
            <DescriptionItem term="拠点">東京</DescriptionItem>
          </DescriptionList>
        </div>
      );
    case '説明に部品':
      return (
        <div className="w-[360px]">
          <DescriptionList>
            <DescriptionItem term="使用技術">
              <div className="flex flex-wrap gap-2">
                <Tag color="primary">TypeScript</Tag>
                <Tag color="primary">React</Tag>
                <Tag color="primary">Tailwind CSS</Tag>
              </div>
            </DescriptionItem>
            <DescriptionItem term="公開">2026 年 9 月</DescriptionItem>
          </DescriptionList>
        </div>
      );
    case '狭い幅':
      return (
        <div className="w-[240px]">
          <DescriptionList>
            <DescriptionItem term="所属">フリーランス</DescriptionItem>
            <DescriptionItem term="職種">フロントエンドエンジニア</DescriptionItem>
          </DescriptionList>
        </div>
      );
    default:
      return (
        <div className="w-[360px]">
          <DescriptionList>
            <DescriptionItem term="所属">フリーランス</DescriptionItem>
            <DescriptionItem term="職種">エンジニア</DescriptionItem>
            <DescriptionItem term="拠点">東京</DescriptionItem>
          </DescriptionList>
        </div>
      );
  }
}

const meta = {
  title: 'Design Review/210 DescriptionList の用語と説明の並び',
  id: 'design-review-210-description-list-layout',
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
      index={210}
      axis="DescriptionList の用語と説明の並び"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column)}
    >
      <p>
        決定: 現行版（横・用語の列 128px・左寄せ）を既定にし、C（縦）を
        <code>layout=&quot;stacked&quot;</code>、B（用語の右寄せ）を
        <code>termAlign=&quot;end&quot;</code>
        で選べる形にしました。A（192px）は形としては持たず、用語が長いときは
        <code>termWidth</code> で列の幅を指定します。
      </p>
      <p>
        用語（dt）と説明（dd）をどう並べるかです。経歴・技術・メタ情報のように、名前と値が短い組を並べる場面を想定しています。
        区切りの線は、この軸では出していません（軸 211 で決めます）。
      </p>
      <p>
        どの案でも、説明が長いときは用語の列に回り込まず、説明の幅の中だけで折り返します。狭い幅の列（240px）は、スマートフォンでどう見えるかの確かめです。
      </p>
    </Comparison>
  ),
};
