import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tab, TabList, TabPanel, Tabs, type TabsIndicator } from '../../src/components/tabs/Tabs';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 264: Tabs の縦向き（orientation="vertical"）の見た目。
//   値は tokens.css の --tabs-vertical-side（線と印を立てる側）・--tabs-vertical-tab-align（タブの寄せ）・
//   --tabs-vertical-list-width（並びの幅）。候補はこの 3 つの上書きだけで作る
const meta = {
  title: 'Design Review/264 Tabs の縦向き',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '線は中身側・左寄せ',
    intent:
      '縦向きの初案。線と印は並びの右端（中身に近い側）に立て、タブは左に寄せる。並びの幅はいちばん長いタブに合わせる',
    spec: [
      ['線の側', '中身側（右端）'],
      ['タブの寄せ', 'start'],
      ['並びの幅', 'max-content'],
    ],
  },
  {
    id: 'A',
    name: '線は外側',
    intent: '線と印を並びの左端（外側）に移す。文字の頭が印とそろい、中身との境目は余白だけになる',
    spec: [
      ['線の側', '外側（左端）'],
      ['タブの寄せ', 'start'],
      ['並びの幅', 'max-content'],
    ],
    tokens: { '--tabs-vertical-side': '0' },
  },
  {
    id: 'B',
    name: '線は中身側・右寄せ',
    intent:
      'タブを右に寄せ、文字の終わりを線にそろえる。見出しが中身に寄り、目が中身へ流れる（新聞の柱のような組み方）',
    spec: [
      ['線の側', '中身側（右端）'],
      ['タブの寄せ', 'end'],
      ['並びの幅', 'max-content'],
    ],
    tokens: { '--tabs-vertical-tab-align': 'end' },
  },
  {
    id: 'C',
    name: '幅を決めて、タブは幅いっぱい',
    intent:
      '並びの幅を決め（12rem）、タブを幅いっぱいに伸ばす。押せる範囲が横にそろい、subtle・segmented の塗りが帯になる',
    spec: [
      ['線の側', '中身側（右端）'],
      ['タブの寄せ', 'stretch（文字は行頭から）'],
      ['並びの幅', '12rem'],
    ],
    tokens: { '--tabs-vertical-tab-align': 'stretch', '--tabs-vertical-list-width': '12rem' },
  },
];

// 列は indicator の値（label がそのまま値）
const indicatorOf: Record<string, TabsIndicator> = {
  line: 'line',
  underline: 'underline',
  subtle: 'subtle',
  segmented: 'segmented',
};
const columns: Column[] = [
  { label: 'line', note: '線＋並びの線（既定）' },
  { label: 'underline', note: '線だけ' },
  { label: 'subtle', note: '淡い面' },
  { label: 'segmented', note: '溝とつまみ' },
];

export const Vertical: Story = {
  name: '縦向きの形',
  render: () => (
    <Comparison
      index={264}
      axis="Tabs の縦向き（線の側・タブの寄せ・並びの幅）"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <Tabs
          key={candidate.id}
          orientation="vertical"
          indicator={indicatorOf[column.label]}
          defaultValue="works"
        >
          <TabList aria-label={`${candidate.id} の ${column.label}`}>
            <Tab value="overview">概要</Tab>
            <Tab value="works">作品</Tab>
            <Tab value="blog">ブログ</Tab>
            <Tab value="contact">お問い合わせ</Tab>
          </TabList>
          <TabPanel
            value="works"
            className="text-(length:--text-control) leading-(--leading-control) text-fg-muted"
          >
            作品の一覧です。
          </TabPanel>
        </Tabs>
      )}
    >
      <p>
        タブを縦に積んだときの形を選びます。決めるのは 3
        つです。1つめは、選んだタブの印と並びの線を立てる側（中身に近い右端か、外側の左端か）。2つめは、タブの寄せ（左・右・幅いっぱい）。3つめは、並びの幅（いちばん長いタブに合わせるか、決めた幅にするか）。列は
        indicator の 4 つの値で、どの印でも成り立つ形かを見ます（text は印を出さないので、underline
        から棒を取った姿になります）。
      </p>
      <p>
        推奨は current です。線が中身のすぐ隣に立つので、並びと中身が 1
        つのまとまりに見え、横向きのときの「並びの下の線」と同じ役割がそのまま縦に立ちます。タブの文字は左に寄せると読み始めがそろい、並びの幅を決めないので長い見出しでも折り返しません。A（外側）は中身との境目が余白だけになり、並びが独立した列に見えます。B（右寄せ）は見出しが中身に寄って目が流れますが、読み始めがばらつきます。C（幅を決めて幅いっぱい）は
        subtle・segmented の塗りが帯になり、サイドの案内らしくなりますが、line・underline
        では印とタブの余白が広く空きます。
      </p>
      <p>
        既定をどれにしますか。どれか 1
        つを縦向きの既定にして、ほかを選べるようにもできます（たとえば「線は中身側が既定、外側も選べる」）。選べるようにする場合は、どれを
        props にするかも決めます。
      </p>
      <p>
        いま決めないこと:
        縦向きで並びが画面に入り切らないときの扱い（縦のスクロールと端の影）は、この軸では出していません。
      </p>
    </Comparison>
  ),
};
