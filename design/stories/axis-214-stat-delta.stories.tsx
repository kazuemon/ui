import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { NumberFormat } from '../../src/components/number-format/NumberFormat';
import { Stat } from '../../src/components/stat/Stat';

// 後半の軸 214: Stat の増減の見せ方
//   決定: 現行版（矢印＋色の文字）を既定にし、矢印の有無（deltaIcon）と淡い面の有無（deltaFill）を
//   それぞれ選べる形にした。数字の下の行へ置く案（C）は採らない
//   残した候補は props で描く（比べるための --stat-delta-fill・--stat-delta-basis は部品に畳んで消した）

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '矢印＋色の文字（数字の右）',
    intent:
      '数字の右に、向きの矢印と色の付いた文字を置く。面を持たないので軽く、色が読めなくても矢印の向きで増減が分かる。数字が長いと、増減は折り返して次の行に落ちる。',
    spec: [
      ['deltaIcon', 'true（既定）'],
      ['deltaFill', 'false（既定）'],
      ['置く場所', '数字の右'],
    ],
  },
  {
    id: 'A',
    name: '色の文字だけ（矢印なし）',
    intent:
      '矢印をやめ、色と文字の符号（「+12%」）だけで増減を表す。いちばん軽いが、符号を書かないと色だけが頼りになる。',
    spec: [
      ['deltaIcon', 'false'],
      ['deltaFill', 'false'],
      ['置く場所', '数字の右'],
    ],
  },
  {
    id: 'B',
    name: '淡い面の pill',
    intent:
      '矢印と文字を、色に合わせた淡い面の pill に載せる。タグと同じ塗り方で、数字から切り離して読める。面があるぶん重くなり、数字の横で目立つ。',
    spec: [
      ['deltaIcon', 'true'],
      ['deltaFill', 'true'],
      ['置く場所', '数字の右'],
    ],
  },
];

const columns: Column[] = [
  { label: '増えた', note: 'trend="up"（成功の緑）' },
  { label: '減った', note: 'trend="down"（危険の赤）' },
  { label: '変わらず', note: 'trend="flat"（グレー）' },
  { label: '減ってうれしい', note: 'trend="down" tone="positive"' },
  { label: '横に 3 つ並べる', note: '桁の違う数字がそろうか' },
];

function renderCell(column: Column, candidate: Candidate) {
  // A は矢印なし（符号を文字に書く）、B は淡い面の pill
  const deltaIcon = candidate.id !== 'A';
  const deltaFill = candidate.id === 'B';
  const sign = (text: string) => (deltaIcon ? text : `+${text}`);
  const props = { deltaIcon, deltaFill };
  switch (column.label) {
    case '減った':
      return (
        <Stat
          label="離脱率"
          value={32}
          unit="%"
          delta={deltaIcon ? '4pt' : '-4pt'}
          trend="down"
          caption="先月比"
          {...props}
        />
      );
    case '変わらず':
      return (
        <Stat
          label="稼働率"
          value={99.9}
          unit="%"
          delta="0.0pt"
          trend="flat"
          caption="先月比"
          {...props}
        />
      );
    case '減ってうれしい':
      return (
        <Stat
          label="表示にかかる時間"
          value={0.82}
          unit="秒"
          delta={deltaIcon ? '18%' : '-18%'}
          trend="down"
          tone="positive"
          caption="先月比"
          {...props}
        />
      );
    case '横に 3 つ並べる':
      return (
        <div className="flex w-[440px] gap-8">
          <Stat label="公開記事" value={128} unit="件" delta={sign('12%')} trend="up" {...props} />
          <Stat
            label="閲覧数"
            value={<NumberFormat value={48219} />}
            delta={deltaIcon ? '3%' : '-3%'}
            trend="down"
            {...props}
          />
          <Stat label="購読" value={512} delta="0" trend="flat" {...props} />
        </div>
      );
    default:
      return (
        <Stat
          label="公開記事"
          value={128}
          unit="件"
          delta={sign('12%')}
          trend="up"
          caption="先月比"
          {...props}
        />
      );
  }
}

const meta = {
  title: 'Design Review/214 Stat の増減の見せ方',
  id: 'design-review-214-stat-delta',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={214}
      axis="Stat の増減（delta）の見せ方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => renderCell(column, candidate)}
    >
      <p>
        決定: 現行版（矢印＋色の文字）を既定にし、矢印の有無（<code>deltaIcon</code>
        ）と淡い面の有無（
        <code>deltaFill</code>
        ）を、それぞれ選べる形にしました。数字の下の行へ置く案（C）は採らないので、一覧からも外しています。
      </p>
      <p>
        増減をどう見せるかです。色は成功の緑・危険の赤・グレーの 3
        つで、どの案でも同じです。増えたことが良いか悪いかは部品には分からないので、色は使う側が選びます（4
        列目は、減ったのに緑にした例です）。数字の大きさは現行版のまま（見出し 1）です（軸 213）。
      </p>
      <p>
        色だけで伝えないため、どの案も矢印か符号のどちらかで向きが分かるようにしています。A
        は矢印を出さないので、文字の側に符号（「+12%」）を書く前提になります。
      </p>
    </Comparison>
  ),
};
