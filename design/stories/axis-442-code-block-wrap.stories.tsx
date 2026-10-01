import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { CodeBlock } from '../../src/components/code-block/CodeBlock';
import { longLineHtml, typescriptHtml } from '../../src/components/code-block/fixtures';

// 軸 442: CodeBlock の折り返し（wrap）。折り返した続きの行の字下げ
const meta = {
  title: 'Design Review/442 コードの折り返し',
  id: 'design-review-442-code-block-wrap',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
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

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '折り返さない（横にスクロール）',
    intent: 'いまの形。長い行はコードの部分だけが横にスクロールする。wrap を渡さないときはこのまま',
    spec: [['続きの行', '—（折り返さない）']],
  },
  {
    id: 'A',
    name: '折り返す・字下げなし',
    intent:
      '続きの行を行の頭にそろえる。文章の段落と同じ見た目。行番号がないと、どこからが次の行か分かりにくい',
    spec: [['続きの行の字下げ', '0']],
    tokens: { '--codeblock-wrap-indent': '0ch' },
  },
  {
    id: 'B',
    name: '折り返す・2 文字下げる',
    intent:
      '続きの行を 2 文字ぶん右へ下げる（ぶら下げ）。行の頭が左に出るので、行の切れ目が見える。字下げしたコードの中では、続きと次の段の区別がやや弱い',
    spec: [['続きの行の字下げ', '2 文字（2ch）']],
    tokens: { '--codeblock-wrap-indent': '2ch' },
  },
  {
    id: 'C',
    name: '折り返す・4 文字下げる',
    intent:
      '続きの行を 4 文字ぶん下げる。2 文字の段のコードとも見分けやすいが、狭い幅では 1 行に入る文字が減る',
    spec: [['続きの行の字下げ', '4 文字（4ch）']],
    tokens: { '--codeblock-wrap-indent': '4ch' },
  },
];

const columns: Column[] = [
  { label: '長い行', note: '480px' },
  { label: '行番号あり', note: '480px' },
  { label: '字下げしたコード・狭い幅', note: '320px' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={442}
      axis="コードの折り返し"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const wrap = candidate.id !== '現行版';
        switch (column.label) {
          case '長い行':
            return (
              <div data-reading className="w-[480px]">
                <CodeBlock title="posts.ts" wrap={wrap} html={longLineHtml} />
              </div>
            );
          case '行番号あり':
            return (
              <div data-reading className="w-[480px]">
                <CodeBlock title="posts.ts" wrap={wrap} lineNumbers html={longLineHtml} />
              </div>
            );
          default:
            return (
              <div data-reading className="w-[320px]">
                <CodeBlock title="src/lib/posts.ts" wrap={wrap} html={typescriptHtml} />
              </div>
            );
        }
      }}
    >
      <p>
        CodeBlock
        に折り返し（wrap）を足しました。渡すと、長い行を横にスクロールさせずに折り返します。既定は折り返さない（いまのまま）です。
      </p>
      <p>
        選ぶのは、折り返した続きの行をどれだけ字下げするかです。既定の推しは B（2
        文字）です。行番号があるときも、続きの行には番号が付きません。
      </p>
    </Comparison>
  ),
};
