import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { FileInput, type FileInputVariant } from '../../src/components/file-input/FileInput';

// 軸 620: FileInput の欄の見た目の型。欄は実際に押せる（OS のファイル選択が開く）。選んだファイルは名前に出る
const meta = {
  title: 'Design Review/620 ファイル選択欄の見た目',
  id: 'design-review-620-file-input-look',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B' },
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

const photo = () => new File(['dummy'], 'profile-photo-2026.png', { type: 'image/png' });

const variantOf: Record<string, FileInputVariant> = { A: 'plain', B: 'attached' };

const candidates: Candidate[] = [
  {
    id: 'A',
    name: 'アイコンと名前だけ',
    intent:
      'ボタンを置かず、左にアップロードのアイコン。TextField と並べたとき、いちばん静か。押せることはアイコンと hover の濃さで伝える',
    spec: [
      ['型', 'variant="plain"'],
      ['左', 'アップロードのアイコン'],
      ['名前', '空のときは薄い「選択されていません」'],
    ],
  },
  {
    id: 'B',
    name: '左に接するグレーの塊',
    intent:
      'TextField の prefix と同じ、欄の左端に接するグレーの塊に「ファイルを選ぶ」。ネイティブの欄に近く、入力欄の付属の作りに揃う',
    spec: [
      ['型', 'variant="attached"'],
      ['塊', 'FieldAddon と同じグレー・太字'],
      ['名前', '塊の右に出す'],
    ],
  },
];

const columns: Column[] = [
  { label: '空', note: '押すと実際に選べる' },
  { label: '選んだ後', note: '長い名前は … で切る' },
  { label: 'エラー' },
  { label: '押せない' },
];

export const Look: Story = {
  name: '欄の見た目',
  render: ({ pick }) => (
    <Comparison
      index={620}
      axis="ファイル選択欄の見た目"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const variant = variantOf[candidate.id];
        const base = { label: '添付ファイル', variant };
        return (
          <div className="max-w-xs">
            {column.label === '空' && <FileInput {...base} />}
            {column.label === '選んだ後' && (
              <FileInput {...base} defaultValue={[photo()]} clearable />
            )}
            {column.label === 'エラー' && (
              <FileInput {...base} errorText="ファイルを選んでください" />
            )}
            {column.label === '押せない' && (
              <FileInput {...base} defaultValue={[photo()]} disabled />
            )}
          </div>
        );
      }}
    >
      <p>
        決定:
        左端に接するグレーの塊（B、attached）を既定にし、アイコンと名前だけ（A、plain）も選べる。ボタン付き（現行版）は外す。
      </p>
      <p>
        フォームの 1 行に置く、ファイルを選ぶ欄の見た目を決めます。どの案も、欄のどこを押しても OS
        のファイル選択が開きます。
      </p>
      <p>
        現行版（ボタン付き）を既定のおすすめにしています。選ぶ案があれば、「X を既定にして、Y
        も選べる」の形で教えてください。
      </p>
    </Comparison>
  ),
};
