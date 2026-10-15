import type { Meta, StoryObj } from '@storybook/react-vite';

import { FieldTrial, OpenPanel, ScrollFree } from './cascader-axis-parts';
import { type Candidate, type Column, Comparison } from './Comparison';
import { categories, regions } from '../../src/components/cascader/cascader-story-items';

// 軸 647: Cascader の次の段を開くきっかけ（押したとき・マウスを載せたとき）
const meta = {
  title: 'Design Review/647 Cascader の次の段を開くきっかけ',
  id: 'design-review-647-cascader-expand',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
  decorators: [
    (Story) => (
      <ScrollFree>
        <Story />
      </ScrollFree>
    ),
  ],
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const openOnHover: Record<string, boolean> = { current: false, A: true };

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '押して開く（おすすめ・既定）',
    intent:
      '親を押すか → キーで、次の段を開く。マウスを載せただけでは塗りが付くだけで、段は替わらない。斜めに動かしてほかの親をかすめても、開いている段が替わらない',
    spec: [
      ['開くきっかけ', '押す・→・Enter'],
      ['載せたとき', '塗りだけ'],
      ['props', 'openOnHover={false}'],
    ],
  },
  {
    id: 'A',
    name: '載せて開く',
    intent:
      'マウスを親に載せて 100ms 待つと次の段が開く（Menu の入れ子と同じ）。ポインターが動いたときだけ数え、次の段へ斜めに向かうあいだは、かすめた親で開かない（止まって 300ms で開く）。指とシートでは押して開く',
    spec: [
      ['開くきっかけ', '載せて 100ms・押す・→'],
      ['載せたとき', '次の段が替わる'],
      ['props', 'openOnHover'],
    ],
  },
];

const columns: Column[] = [
  { label: '開いた面（2 段）', note: '面をそのまま触れる。親に載せる・押すを試す' },
  { label: '開いた面（3 段）', note: '斜めに動かして、ほかの親をかすめたときを試す' },
  { label: '欄から開く', note: '実際の部品' },
];

export const Axis: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={647}
      axis="Cascader の次の段を開くきっかけ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const hover = openOnHover[candidate.id];
        if (column.label.includes('2 段'))
          return (
            <OpenPanel items={regions} openOnHover={hover} defaultValue={['tokyo', 'shibuya']} />
          );
        if (column.label.includes('3 段'))
          return (
            <OpenPanel
              items={categories}
              openOnHover={hover}
              defaultValue={['books', 'novel', 'novel-1']}
            />
          );
        return <FieldTrial items={categories} label="カテゴリ" openOnHover={hover} />;
      }}
    >
      <p>
        決定: A（載せて開く）を既定にし、現行版（押して開く）も openOnHover={'{false}'}{' '}
        で選べるようにする。載せて開く形は Menu
        の入れ子と同じ考え方で直した。ポインターが実際に動いたときだけ開き（開いた直後や、段が増えて面がずれた直後に、止まったポインターの下へ来た行では開かない）、開いている次の段へ斜めに向かうあいだは、かすめた行で開かない（止まったら開く）。右端で開いたときの形は「右端で開く」のストーリーで試せる。
      </p>
      <p>
        浮かべる形で、親の次の段をいつ開くかを決めます。指で操作するとき・シートでは、どちらの案でも押して開きます。
      </p>
      <p>
        おすすめは現行版（押して開く）を既定にし、A（載せて開く）を openOnHover
        で選べるようにすることです。段が横に並ぶ部品では、右の段へマウスを動かす途中で別の親をかすめやすく、載せて開くと段が勝手に替わって見失いやすいためです。
      </p>
    </Comparison>
  ),
};

// 647 の続き: 段が減ったときの面の幅。雑貨のような浅い枝に載せて段が減ると、面が縮み（右端では面ごと右へずれ）、
//   ポインターのあった場所から列がなくなる。決定: C を既定にし、現行版は hideEmptyColumns で選べる。A・B は外した
//   （比べたときの動く見本は、決める前のコミット 8d5ae5d5 にある）
const widthModes: Record<string, boolean | undefined> = {
  current: true,
  A: undefined,
  B: undefined,
  C: false,
};

const widthCandidates: Candidate[] = [
  {
    id: 'current',
    name: '縮める',
    intent:
      '段が減ると、その分だけ面が縮む。右端で開いた形では、画面に収めるためにずらしていた分が戻り、面ごと右へ動く。ポインターの下から列がなくなる（Ant Design の Cascader も同じく縮む）',
    spec: [
      ['段が減ったとき', '面が縮む'],
      ['props', 'hideEmptyColumns'],
    ],
  },
  {
    id: 'A',
    name: '開いているあいだは縮めない',
    intent:
      'いちど広がった幅を、閉じるまで保つ。段が減ったところは空いた面のまま残り、面は動かない。Menu の入れ子が、子の面を閉じても親の面を動かさないのと同じ考え方',
    spec: [
      ['段が減ったとき', '空いた面を残す'],
      ['戻る', '閉じて開き直したとき'],
      ['props', '（外した）'],
    ],
  },
  {
    id: 'B',
    name: 'ポインターが面の外へ出るまで縮めない',
    intent:
      'A と同じく面の中で操作しているあいだは保ち、ポインターが面の外へ出たときに縮める。空いた面が残る時間は短いが、外へ出た瞬間に面が動く',
    spec: [
      ['段が減ったとき', '面の外へ出るまで保つ'],
      ['props', '（外した）'],
    ],
  },
  {
    id: 'C',
    name: 'はじめから木の深さの分だけ列を置く',
    intent:
      '開いたときから、木のいちばん深い段の数だけ列を並べる（まだ開いていない段は空の列）。広がることも縮むこともなく、右端でも一度もずれないが、開いた直後から空の列が見える',
    spec: [
      ['段が増減したとき', '面の幅は変わらない'],
      ['props', 'hideEmptyColumns={false}（既定）'],
    ],
  },
];

const widthColumns: Column[] = [
  {
    label: '開いた面（3 段）',
    note: '本 → 小説 と開いてから、雑貨・絵本に載せて段を減らす',
  },
  { label: '欄から開く', note: '実際の部品（載せて開く）' },
];

export const Width: Story = {
  name: '段が減ったときの面の幅',
  args: { pick: 'C,current' },
  render: ({ pick }) => (
    <Comparison
      index={647}
      axis="Cascader の段が減ったときの面の幅"
      pick={pick}
      candidates={widthCandidates}
      columns={widthColumns}
      renderCell={(column, candidate) => {
        const mode = widthModes[candidate.id];
        if (mode === undefined)
          return (
            <p className="max-w-60 text-xs leading-5 text-fg-subtle">
              部品から外しました（比べたときの見本はコミット 8d5ae5d5）
            </p>
          );
        if (column.label.startsWith('開いた面'))
          return (
            <OpenPanel
              items={categories}
              openOnHover
              hideEmptyColumns={mode}
              defaultValue={['books', 'novel', 'novel-1']}
            />
          );
        return <FieldTrial items={categories} label="カテゴリ" hideEmptyColumns={mode} />;
      }}
    >
      <p>
        決定:
        C（開いたときから木の深さの分だけ列を置く）を既定にする。どこまで深く選ぶかも開いたときに分かる。hideEmptyColumns
        で現行版（段の数に合わせて縮む。列が減る動きは許容する）にもできる。A・B は外した。
      </p>
      <p>
        雑貨のような浅い枝に載せて段が減ると、面が縮み、ポインターのあった場所から列がなくなります（右端で開いた形では、面ごと右へずれます）。段が減ったときの面の幅を決めます。右端の形は「右端で開く」のストーリーで試せます。
      </p>
      <p>
        ほかのライブラリでは、Ant Design の Cascader は段が減るとそのまま縮みます。Menu
        の入れ子（Base UI）は子の面が別の面なので、子を閉じても親の面は動きません。
      </p>
      <p>
        おすすめは
        A（開いているあいだは縮めない）を既定にすることです。面が動かないので、ポインターの下から列が消えず、右端でも縮んでずれることがありません。B
        は外へ出た瞬間に面が動き、C は開いた直後から空の列が並ぶのが重く見えます。
      </p>
    </Comparison>
  ),
};

// 右端で開くと、段が増えるたびに面が左へずれ、段が減ると右へ戻る。候補ごとに試す
export const RightEdge: Story = {
  name: '右端で開く',
  render: () => (
    <div className="flex flex-col gap-4 bg-bg p-6 text-fg">
      <p className="max-w-[68ch] text-sm text-fg-muted">
        画面の右端に置いた欄です（載せて開く）。段が増えると、面が画面に収まるよう左へずれます。本 →
        小説
        と開いてから、雑貨に載せて段を減らしたときの動きを、段が減ったときの面の幅の候補ごとに比べます。いちばん下は押して開く形（openOnHover=
        {'{false}'}）です。
      </p>
      {widthCandidates
        .filter((candidate) => widthModes[candidate.id] !== undefined)
        .map((candidate) => (
          <div
            key={candidate.id}
            className="flex min-h-[20rem] items-start justify-between gap-6 border-t border-line pt-4"
          >
            <p className="max-w-60 text-xs text-fg-muted">
              <span className="font-bold text-fg">{candidate.id}</span> {candidate.name}
            </p>
            <FieldTrial
              items={categories}
              label={`${candidate.id}: ${candidate.name}`}
              hideEmptyColumns={widthModes[candidate.id]}
            />
          </div>
        ))}
      <div className="flex min-h-[20rem] items-start justify-between gap-6 border-t border-line pt-4">
        <p className="max-w-60 text-xs text-fg-muted">押して開く（openOnHover=false）</p>
        <FieldTrial items={categories} label="押して開く" openOnHover={false} />
      </div>
    </div>
  ),
};
