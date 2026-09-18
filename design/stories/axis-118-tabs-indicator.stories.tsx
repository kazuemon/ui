import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { TabsSample, tabsPseudo } from './tabs-samples';
import type { TabsIndicator } from '../../src/components/tabs/Tabs';

// 後半の軸 118: Tabs の選んだタブの印
// 決定（ADR 未定）: 現行版（下の線＋並びの線）を既定にし、A（下の線だけ）・B（淡い面の pill）・C（溝とつまみ）・D（文字だけ）も選べるようにします（Tabs の indicator）
// 印の形は部品の値に畳んだので、各行は indicator の値だけで描く

const LOOKS: Record<string, TabsIndicator> = {
  現行版: 'line',
  A: 'underline',
  B: 'subtle',
  C: 'segmented',
  D: 'text',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '下の線＋並びの線',
    intent:
      '選んだタブの下に、部品の色の線を引く。並び全体の下にも細い境界線を引き、線がその上に載る。文字は本文の色で太く。',
    spec: [
      ['印', 'タブの幅の線（太さは入力欄の枠線と同じ）'],
      ['印の色', '部品の色（グレーは濃いグレー）'],
      ['並び', '下に細い境界線'],
      ['選んだ文字', '本文の色・太字'],
    ],
  },
  {
    id: 'A',
    name: '下の線だけ',
    intent:
      '現行版から並びの境界線を外す。Navbar の underline と同じく、線は選んだタブの下にだけある。',
    spec: [
      ['印', 'タブの幅の線'],
      ['印の色', '部品の色'],
      ['並び', '線なし'],
      ['選んだ文字', '本文の色・太字'],
    ],
  },
  {
    id: 'B',
    name: '淡い面の pill',
    intent:
      '選んだタブに部品の色の淡い面を pill で敷き、文字をその色にする。Navbar の neutral・primary、タグと同じ「淡い面に濃い文字」。グレーはグレーの面に本文の色。',
    spec: [
      ['印', 'タブ全体の pill'],
      ['印の色', '部品の色の淡い面（グレーはグレーの面）'],
      ['並び', '線なし'],
      ['選んだ文字', '部品の色（淡い面の上の文字）・太字'],
    ],
  },
  {
    id: 'C',
    name: '溝とつまみ（segmented）',
    intent:
      '並びに入力欄と同じグレーの溝を pill で敷き、選んだタブを白いつまみにする。つまみにはトグルのノブと同じ影。溝の余白の分だけタブを低くし、並び全体を部品の高さにそろえる。',
    spec: [
      ['印', '白いつまみ（トグルのノブの影）'],
      ['印の色', '白（部品の色は文字に出る）'],
      ['並び', '入力欄のグレーの溝・内側の余白 4px'],
      ['選んだ文字', '部品の色・太字'],
    ],
  },
  {
    id: 'D',
    name: '文字だけ',
    intent: '印を出さず、選んだタブの文字を部品の色で太くするだけ。いちばん軽い。',
    spec: [
      ['印', 'なし'],
      ['並び', '線なし'],
      ['選んだ文字', '部品の色・太字（グレーは本文の色）'],
    ],
  },
];

const columns: Column[] = [
  { label: 'グレー（既定）', note: '「概要」を選んだところ' },
  { label: 'Primary' },
  { label: 'Secondary' },
  { label: 'hover・押せないタブ', note: '「作品」に hover。「登壇」は押せない', preview: 'hover' },
  { label: 'フォーカス（Primary）', note: '選んでいる「概要」にキーボードで', preview: 'focus' },
];

const meta = {
  title: 'Design Review/118 Tabs の選んだタブの印',
  id: 'design-review-118-tabs-indicator',
  parameters: { layout: 'fullscreen', pseudo: tabsPseudo },
  args: { pick: 'current,A,B,C,D' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={118}
      axis="Tabs の選んだタブの印"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const indicator = LOOKS[candidate.id];
        switch (column.label) {
          case 'Primary':
            return <TabsSample indicator={indicator} color="primary" />;
          case 'Secondary':
            return <TabsSample indicator={indicator} color="secondary" />;
          case 'hover・押せないタブ':
            return <TabsSample indicator={indicator} disabled />;
          case 'フォーカス（Primary）':
            return <TabsSample indicator={indicator} color="primary" />;
          default:
            return <TabsSample indicator={indicator} />;
        }
      }}
    >
      <p>
        <strong>
          決定（ADR 未定）: 現行版（下の線＋並びの線）を既定にし、A（下の線だけ）・B（淡い面の
          pill）・C（溝とつまみ）・D（文字だけ）も選べるようにします（Tabs の indicator）。
        </strong>
      </p>
      <p>
        タブは、同じ場所の中身を見出しで切り替える部品です。選んでいるタブをどう見せるかを決めます。タブの高さは部品の高さ（密度）で、hover
        は平らなボタンと同じく本文の色を淡く敷き、押すと沈みます。選んだ文字はどの案でも太くします（太くしても幅は変わりません）。
      </p>
      <p>
        印の色は部品の色に従い、指定しないときはグレーです。印は選んだタブへ動きます（動きは軸 119
        で決めています。ここでは各行のタブを押すと動きます）。
      </p>
      <p>
        近い前例は Navbar
        のいまいるページの印（文字だけが既定、グレーの面・淡い青の面・下の線を選べる）です。
      </p>
      <p>
        B のグレーは、選んだタブの面と hover
        の面がどちらもグレーで、近く見えます（hover・押せないタブの列）。C
        のつまみの影は、押せることではなく「つまみ」であることの記号として、トグルのノブから借りています。
      </p>
    </Comparison>
  ),
};
