import type { Meta, StoryObj } from '@storybook/react-vite';

import type { TableVariant } from '../../src/components/table/Table';
import { type Candidate, type Column, Comparison } from './Comparison';
import { SampleTable } from './data-table-frame';

// 後半の軸 366: DataTable の既定の見た目（見出しの面・線）と見出しの文字の色
//   見た目（variant）は Table と同じ 3 つ（lines・framed・banded。ADR-0090）。どれも選べるので、ここで決めるのは DataTable の既定
//   Table の既定は、記事の中でいちばん軽い lines。データの表は画面の主役で行も多いので、別の既定がよいかを見る
//   C は見出しの文字を本文より一段淡い色にする案（決めたあとはクラスで上書きして再現する）
// 決定: 既定は現行版（lines・見出しは本文の色）。framed・banded は variant で選べる。C（淡い見出し）は採らない

const variantOf: Record<string, TableVariant> = {
  現行版: 'lines',
  A: 'framed',
  B: 'banded',
  C: 'lines',
};

const headClassOf: Record<string, string | undefined> = {
  C: '[&_thead_th]:text-fg-muted',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '横線だけ（Table と同じ既定）',
    intent: '行のあいだの横線と、見出しの下の線。いちばん軽い。記事の中の表と同じ見た目。',
    spec: [
      ['variant の既定', 'lines'],
      ['見出しの文字', '本文の色・太字'],
    ],
  },
  {
    id: 'A',
    name: '外枠と見出しのグレーの面',
    intent:
      '表を部品の角の枠で囲み、見出しの行にグレーの面を敷く。画面の中で表のまとまりがはっきりする。上下の帯とも分かれる。',
    spec: [
      ['variant の既定', 'framed'],
      ['見出しの文字', '本文の色・太字'],
    ],
  },
  {
    id: 'B',
    name: '丸い見出しの帯',
    intent:
      '見出しの行を丸い帯のグレーの面にし、セルの余白を広げる。ゆったりして見える分、行は少なく見える。',
    spec: [
      ['variant の既定', 'banded'],
      ['見出しの文字', '本文の色・太字'],
    ],
  },
  {
    id: 'C',
    name: '横線だけ・見出しを淡い文字に',
    intent:
      '現行版から見出しの文字だけを本文より一段淡い色にする。値が主役になり、見出しは読み飛ばせる。太さはそのまま。',
    spec: [
      ['variant の既定', 'lines'],
      ['見出しの文字', '--color-fg-muted・太字'],
    ],
  },
];

const columns: Column[] = [
  { label: '4 行', note: '1 行選んでいる' },
  { label: '見出しの下を通るところ', note: '高さの上限を付けて少しスクロールしたところ' },
];

const meta = {
  title: 'Design Review/366 DataTable（既定の見た目と見出しの文字）',
  id: 'design-review-366-data-table-head',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,A,B' },
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

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={366}
      axis="DataTable（既定の見た目と見出しの文字）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) =>
        column.label === '4 行' ? (
          <SampleTable
            variant={variantOf[candidate.id]}
            selected={['A-1025']}
            className={headClassOf[candidate.id]}
          />
        ) : (
          <SampleTable
            variant={variantOf[candidate.id]}
            rows={7}
            maxHeight={200}
            scrollTop={56}
            className={headClassOf[candidate.id]}
          />
        )
      }
    >
      <p>
        <strong className="text-fg">
          決定: 既定は現行版（横線だけ・見出しは本文の色）。framed・banded は variant で選べる。C
          は採らない
        </strong>
        。DataTable の見た目（variant）は Table と同じ 3
        つから選べます。ここで決めるのは、何も渡さないときの既定と、見出しの文字の色です。
      </p>
      <p>
        Table
        の既定は、記事の中でいちばん軽い横線だけの形です。データの表は画面の主役になり、行も多く、上下に検索やページ送りの帯が付くので、別の既定がよいかを比べます。
      </p>
      <p>どれを既定にするかを一言添えてください。ほかの見た目は variant でいつでも選べます。</p>
    </Comparison>
  ),
};
