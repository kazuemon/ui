import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  FileInput,
  type FileInputMultipleDisplay,
} from '../../src/components/file-input/FileInput';

// 軸 621: 複数のファイルを選んだときの出し方。欄は実際に押せる（複数選べる）
const meta = {
  title: 'Design Review/621 ファイル選択欄の複数',
  id: 'design-review-621-file-input-multiple',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const file = (name: string) => new File(['x'], name, { type: 'image/png' });
const few = () => [file('photo.png'), file('cover.png')];
const many = () => [
  file('2026-summer-trip-001.png'),
  file('2026-summer-trip-002.png'),
  file('menu.png'),
  file('receipt.png'),
  file('map.png'),
];

const displayOf: Record<string, FileInputMultipleDisplay> = {
  現行版: 'first',
  C: 'below',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '「photo.png ほか 2 件」',
    intent:
      '先頭の名前と残りの数。1 行のまま、何を選んだかが 1 つ分かる。長い名前だけを … で切り、「ほか N 件」は残す。個々のファイルは外せない（全部を × で外すか、選び直す）',
    spec: [
      ['型', 'multipleDisplay="first"'],
      ['高さ', '変わらない'],
    ],
  },
  {
    id: 'C',
    name: '欄に「4 件のファイル」＋欄の下に Chip の列',
    intent:
      '欄は件数だけで 1 行のまま。選んだファイルの名前は、欄の下に Chip の列で並べる（Dropzone のファイル一覧と同じ位置）。× で 1 つずつ外せる。欄の中が折り返さない代わりに、欄の下が増える',
    spec: [
      ['型', 'multipleDisplay="below"'],
      ['欄', '件数だけ（高さは変わらない）'],
      ['下', 'Chip の列（折り返す）。× で 1 つずつ外す'],
    ],
  },
];

const columns: Column[] = [
  { label: '空', note: '押すと複数選べる' },
  { label: '2 つ' },
  { label: '5 つ', note: '名前が長いものを含む' },
  { label: '外せる（clearable）' },
];

export const Multiple: Story = {
  name: '複数の出し方',
  render: ({ pick }) => (
    <Comparison
      index={621}
      axis="ファイル選択欄の複数の出し方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const base = {
          label: '添付ファイル',
          multiple: true,
          multipleDisplay: displayOf[candidate.id],
        };
        return (
          <div className="max-w-xs">
            {column.label === '空' && <FileInput {...base} />}
            {column.label === '2 つ' && <FileInput {...base} defaultValue={few()} />}
            {column.label === '5 つ' && <FileInput {...base} defaultValue={many()} />}
            {column.label === '外せる（clearable）' && (
              <FileInput {...base} defaultValue={few()} clearable />
            )}
          </div>
        );
      }}
    >
      <p>
        決定: 「photo.png ほか 2 件」（現行版）を既定にし、欄に件数・欄の下に Chip
        の列（C）も選べる。件数だけ（A）と欄の中の Chip（B）は外す。
      </p>
      <p>
        複数のファイルを選べる欄で、選んだものをどう見せるかを決めます。1
        つのときは、どの案もファイル名を出します。
      </p>
      <p>
        現行版（「photo.png ほか 2 件」）を既定にします。C は、欄に件数・欄の下に Chip
        の列を置く組み合わせです（欄は attached が前提）。選ぶ案があれば、「X を既定にして、Y
        も選べる」の形で教えてください。
      </p>
    </Comparison>
  ),
};
