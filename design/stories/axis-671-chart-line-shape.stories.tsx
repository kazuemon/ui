import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { LineChartPreview } from './line-chart-preview';

// 決定: 現行版（折れ線・2px）をレシピの既定にする。なめらか・細い線は Docs で案内する — ADR-0543
// 軸 671: 線の形と太さ。Recharts の Line の type と strokeWidth を行ごとに変える（線はライブラリが描くので、レシピの既定を決める）
const meta = {
  title: 'Design Review/671 グラフの線の形と太さ',
  id: 'design-review-671-chart-line-shape',
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

const shapes: Record<string, { curve: 'linear' | 'monotone'; lineWidth: string }> = {
  現行版: { curve: 'linear', lineWidth: 'var(--border-width-thick)' },
  A: { curve: 'monotone', lineWidth: 'var(--border-width-thick)' },
  B: { curve: 'linear', lineWidth: 'var(--border-width-medium)' },
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '折れ線・2px',
    intent:
      '値と値を直線で結ぶ。点の位置がそのまま角になり、どこに値があるかが読める。角が並ぶので、少し硬く見える',
    spec: [
      ['形', '折れ線（linear）'],
      ['太さ', '2px'],
    ],
  },
  {
    id: 'A',
    name: 'なめらか・2px',
    intent:
      '値を通るなめらかな曲線（monotone）で結ぶ。角がなく、やわらかい。値の上下を行き過ぎない曲線なので形は崩れないが、値のない途中も値があるように見える',
    spec: [
      ['形', 'なめらか（monotone）'],
      ['太さ', '2px'],
    ],
  },
  {
    id: 'B',
    name: '折れ線・1.5px',
    intent:
      '現行版の線を一段細くする。軽く、線が重なっても下の線が見える。白地では色が少し淡く見える',
    spec: [
      ['形', '折れ線（linear）'],
      ['太さ', '1.5px'],
    ],
  },
];

const columns: Column[] = [{ label: '3 系列', note: '触ると動く' }, { label: '1 系列' }];

export const Candidates: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={671}
      axis="グラフの線の形と太さ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <LineChartPreview
          seriesCount={column.label === '1 系列' ? 1 : 3}
          {...shapes[candidate.id]}
        />
      )}
    >
      <p>
        線グラフの線の形（値の結び方）と太さを決めます。線は Recharts
        が描くので、ここで決めるのはレシピの既定です（使う側は Line の type と strokeWidth
        で変えられます）。
      </p>
      <p>
        推し: A（なめらか・2px）。「やわらかい」に合い、角が並ぶ硬さがなくなります。monotone
        は値の上下を行き過ぎないので、形を読み違えません。値の位置を正確に見せたいグラフ（点の数が少ないもの）は、現行版の折れ線が向きます。
      </p>
    </Comparison>
  ),
};
