import type { Meta, StoryObj } from '@storybook/react-vite';

import { ListCell, StaticCell, focusTarget, scrollableDecorator } from './action-bar-axis-parts';
import { type Candidate, type Column, Comparison } from './Comparison';
import type { ActionBarVariant } from '../../src/components/action-bar/ActionBar';
import { statePseudo } from '../../src/stories/story-states';

// 軸 651: ActionBar の帯の面
const meta = {
  title: 'Design Review/651 ActionBar の帯の面',
  id: 'design-review-651-action-bar-surface',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({ focusVisible: focusTarget }),
  },
  decorators: [scrollableDecorator],
  args: { pick: 'A,current,B,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

// 決めたあと、面は部品の variant になった。行ごとに variant を渡す
const variants: Record<string, ActionBarVariant> = {
  現行版: 'neutral-strong',
  A: 'surface',
  B: 'primary-subtle',
  C: 'primary',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '濃いグレーの面',
    intent:
      'ラフのとおり、濃いグレー（トグルの ON と同じ濃さ）に白い文字。白い一覧の上で、いま選んでいることがいちばんはっきり分かる。削除は、この面で読める淡い赤',
    spec: [
      ['面', '濃いグレー（neutral-strong）'],
      ['文字', '白'],
      ['危険', '赤を白に寄せた淡い赤（4.6:1）'],
      ['輪郭・影', 'なし・浮かぶ面の影'],
    ],
  },
  {
    id: 'A',
    name: '白い面＋影＋細い輪郭',
    intent:
      'ほかの重なる面（メニュー・トースト）と同じ白い面。いちばん軽いが、白い一覧の上では帯が埋もれやすく、出たことに気づきにくい',
    spec: [
      ['面', '白（surface）'],
      ['文字', '本文の濃紺'],
      ['危険', '危険の前景（赤）'],
      ['輪郭・影', '細い輪郭・浮かぶ面の影'],
    ],
  },
  {
    id: 'B',
    name: '淡い青の面',
    intent:
      '選んだ行と同じ淡い青。選んだ行と帯が同じ色でつながって見える。一覧の行の淡い青と重なると、帯の縁が影だけになる',
    spec: [
      ['面', '淡い青（primary-subtle）'],
      ['文字', '淡い面の上の青'],
      ['危険', '危険の前景（赤）'],
      ['輪郭・影', 'なし・浮かぶ面の影'],
    ],
  },
  {
    id: 'C',
    name: '青の面',
    intent:
      '色の塗り（primary）に白い文字。いちばん強い。青の上では赤が読めないので、削除も白い文字になり、危険の色で見分けられない',
    spec: [
      ['面', '青（primary）'],
      ['文字', '白'],
      ['危険', '白（赤は青の上で 3:1 に届かない）'],
      ['輪郭・影', 'なし・浮かぶ面の影'],
    ],
  },
];

const columns: Column[] = [
  {
    label: '操作できる見本',
    note: '行を選ぶと帯が出ます。× か Esc（帯の中で）で外し、削除で選んだ行が消えます',
  },
  { label: 'キーボードのフォーカス', note: '× のボタンに線を出したところ', preview: 'focus' },
  { label: 'アイコン付き・押せない操作', note: '複製を押せなくしたところ' },
];

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={651}
      axis="ActionBar の帯の面"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const barProps = { variant: variants[candidate.id] };
        return column.label === '操作できる見本' ? (
          <ListCell barProps={barProps} />
        ) : column.preview === 'focus' ? (
          <StaticCell preview="focus" barProps={barProps} />
        ) : (
          <StaticCell icons disabled barProps={barProps} />
        );
      }}
    >
      <p>
        決定: A（白い面に影と細い輪郭）を既定にし、現行版（濃いグレー）・B（淡い青）・C（青）も
        variant で選べる（surface・neutral-strong・primary-subtle・primary）。C
        では削除も白い文字のまま。「デフォルトは A として、他も選べると良さそう」
      </p>
      <p>
        選んでいるあいだだけ下に浮かぶ帯の面を選びます。幅・角・影の強さ・中の並び（× → 件数 →
        操作）はどの案も同じです。フォーカスの線は、どの案も帯の文字の色です。
      </p>
      <p>
        おすすめは現行版（濃いグレーの面）です。白い一覧の上で出たことがすぐ分かり、ほかの重なる面（白）とも見分けられます。削除の淡い赤も読めます。既定は現行版にし、ほかの案も
        variant で選べるようにするか（するならどれか）を教えてください。
      </p>
    </Comparison>
  ),
};
