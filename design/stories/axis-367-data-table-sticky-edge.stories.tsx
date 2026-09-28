import type { Meta, StoryObj } from '@storybook/react-vite';

import type { TableVariant } from '../../src/components/table/Table';
import { type Candidate, type Column, Comparison } from './Comparison';
import { SampleTable } from './data-table-frame';

// 後半の軸 367: DataTable の貼り付いた見出しと、その下を通る行の境目
//   maxHeight を渡すと表の中で縦にスクロールし、見出しの行が上に貼り付く
//   原則1: ページの一部でも、スクロールした内容が下を通るようになったら重なりとして扱う。スクロールできる面は、切れる端に内側の影を落とす
//   境目は、スクロールした量（--cue-top）に合わせて出す
// 決定: 現行版（影）。線の案（A・B）は採らない。決めたあとは、A・B を DataTable へのクラスの上書きで再現する
//   あわせて、banded の丸い帯を th の ::before に描くようにした（貼り付いたとき、帯の角丸の外に下を通る行が透けないように）
//   lines の見出しにはもとから下の線があるので、線の案の違いは framed・banded で見える

const candidate = (
  id: string,
  name: string,
  intent: string,
  shadow: '0' | '1',
  line: '0' | '1'
): Candidate => ({
  id,
  name,
  intent,
  spec: [
    ['影', shadow === '1' ? 'スクロールすると出す（ScrollArea の端と同じ）' : 'なし'],
    ['線', line === '1' ? 'スクロールすると出す（細い境界線）' : 'なし'],
  ],
});

// 部品に入れなかった線の案を、クラスで上書きして再現する
const lineClass =
  '[&_thead_th]:shadow-[inset_0_calc(-1*var(--border-width-thin)*clamp(0,var(--cue-top,0)*100,1))_0_0_var(--color-line)]';
const classOf: Record<string, string | undefined> = {
  A: `${lineClass} [&_thead_th]:after:hidden`,
  B: lineClass,
};

const candidates: Candidate[] = [
  candidate(
    '現行版',
    '影',
    'スクロールすると、見出しの下に内側の影を落とす。ScrollArea・Select の続きの影と同じ見た目（原則1）。',
    '1',
    '0'
  ),
  candidate(
    'A',
    '線',
    '影を落とさず、スクロールすると見出しの下に細い線を引く。シートの見出しの区切り線と同じ考え。原則1 の「重なりには影」からは外れる。',
    '0',
    '1'
  ),
  candidate(
    'B',
    '線と影',
    'スクロールすると、細い線と影の両方を出す。境目がいちばんはっきりする。',
    '1',
    '1'
  ),
];

const variants: TableVariant[] = ['lines', 'framed', 'banded'];
const columns: Column[] = variants.map((variant) => ({
  label: variant,
  note: '少しスクロールしたところ',
}));

const meta = {
  title: 'Design Review/367 DataTable（貼り付いた見出しの境目）',
  id: 'design-review-367-data-table-sticky-edge',
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
type Story = StoryObj<{ pick: string }>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={367}
      axis="DataTable（貼り付いた見出しの境目）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, row) => (
        <SampleTable
          className={classOf[row.id]}
          variant={variants.find((variant) => variant === column.label)}
          rows={7}
          maxHeight={220}
          scrollTop={64}
          hideSelect
        />
      )}
    >
      <p>
        <strong className="text-fg">
          決定: 現行版（影）。丸い帯（banded）では、帯の角の外に下を通る行が透けないようにした
        </strong>
        。DataTable に maxHeight
        を渡すと、表の中で縦にスクロールし、見出しの行が上に貼り付きます。ここで決めるのは、貼り付いた見出しの下を行が通るときの境目です。どの案も、スクロールする前（いちばん上）では何も出しません。
      </p>
      <p>
        各セルはスクロールできます。上まで戻すと境目が消え、スクロールした量に合わせて濃くなるのを確かめられます。下の端の影（続きがあること）はどの案も同じです。
      </p>
      <p>どれを既定にするかを一言添えてください。</p>
    </Comparison>
  ),
};
