import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { TextField } from '../../src/components/text-field/TextField';
import { Textarea } from '../../src/components/textarea/Textarea';

// 後半の軸 152: 読み取り専用の欄（TextField・Textarea の readOnly）の形
//   原則8: 編集できる欄はグレーの塗り。読み取り専用の欄の形は、この軸で一から決める
//   前の原則の「読み取り専用は下線だけ」は、参照画像（プロフィール画面）のキーと値の組を読み違えたものだった（ADR-0164）
//   いまの部品は、読み取り専用でも編集できる欄と同じ見た目（現行版）
//   候補は --field-readonly-* の上書きだけで作る（src/internal/field/field-styles.ts の controlBox）
// 決定: C2（塗りなし・破線の輪郭（3:1）・値の文字を一段淡く）。ADR は記録のときに書く

type Tokens = NonNullable<Candidate['tokens']>;

// 全案で軸の値を明示する。いまの値（編集できる欄と同じ）から、案ごとに差だけを書く
const base: Tokens = {
  '--field-readonly-fill': 'var(--color-field)',
  '--field-readonly-fill-hover': 'var(--color-field-hover)',
  '--field-readonly-addon-fill': 'var(--color-field-addon)',
  '--field-readonly-radius': 'var(--radius-control)',
  '--field-readonly-line': 'var(--color-surface-line)',
  '--field-readonly-underline-width': '0px',
  '--field-readonly-outline-width': '0px',
  '--field-readonly-outline-style': 'solid',
  '--field-readonly-text': 'var(--color-fg)',
  '--field-readonly-flush': '0',
};
const readonly = (tokens: Tokens): Tokens => ({ ...base, ...tokens });
const noFill: Tokens = {
  '--field-readonly-fill': 'transparent',
  '--field-readonly-fill-hover': 'transparent',
  '--field-readonly-addon-fill': 'transparent',
};
// 入力欄の塗りを白に半分混ぜた色（軸 151 の B2 の hover と同じ作り）
const paleFill = 'color-mix(in oklab, var(--color-field) 50%, var(--color-surface))';

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '編集できる欄と同じ',
    intent:
      '読み取り専用でも、編集できる欄と同じグレーの塗りのまま。hover で塗りが濃くなる。見た目だけでは、書き換えられる欄と見分けられない。',
    spec: [
      ['塗り', 'グレー（編集できる欄と同じ）'],
      ['線', 'なし'],
      ['hover', '塗りが半段濃く'],
      ['prefix・suffix', 'グレーの塊'],
      ['値の位置', '欄の余白の内側'],
    ],
    tokens: readonly({}),
  },
  {
    id: 'A',
    name: '淡い塗り',
    intent:
      '欄の形と塗りは残し、塗りを編集できる欄の半分の濃さにする。並べると一段淡く見え、書き換えられない欄だと分かる。hover では濃くしない。押せない欄（濃いグレーの塗りと淡い文字）とは、塗りの濃さと文字の濃さの両方で違う。',
    spec: [
      ['塗り', '編集できる欄の半分の濃さ'],
      ['線', 'なし'],
      ['hover', '変えない'],
      ['prefix・suffix', '編集できる欄の塗りの濃さ'],
      ['値の位置', '欄の余白の内側'],
    ],
    tokens: readonly({
      '--field-readonly-fill': paleFill,
      '--field-readonly-fill-hover': paleFill,
      '--field-readonly-addon-fill': 'var(--color-field)',
    }),
  },
  {
    id: 'B',
    name: '細い輪郭',
    intent:
      '塗りをなくし、白いボタンやカードと同じ細い輪郭で欄の形だけを残す。欄の場所と大きさ、値の位置は編集できる欄と同じ。',
    spec: [
      ['塗り', 'なし（白）'],
      ['線', '細い輪郭（白いボタンと同じ色）'],
      ['hover', '変えない'],
      ['prefix・suffix', '塗りなし（文字だけ）'],
      ['値の位置', '欄の余白の内側'],
    ],
    tokens: readonly({ ...noFill, '--field-readonly-outline-width': 'var(--border-width-thin)' }),
  },
  {
    id: 'C',
    name: '破線の輪郭',
    intent:
      'B の輪郭を破線にし、3:1 の濃さにする。実線の枠（白いボタン・カード・フォーカス）と線の種類で見分け、「ここは触れない」ことを線で示す。',
    spec: [
      ['塗り', 'なし（白）'],
      ['線', '破線の輪郭（3:1 の濃さ）'],
      ['hover', '変えない'],
      ['prefix・suffix', '塗りなし（文字だけ）'],
      ['値の位置', '欄の余白の内側'],
    ],
    tokens: readonly({
      ...noFill,
      '--field-readonly-line': 'var(--color-line-strong)',
      '--field-readonly-outline-width': 'var(--border-width-thin)',
      '--field-readonly-outline-style': 'dashed',
    }),
  },
  {
    id: 'C2',
    name: 'C＋値の文字を一段淡く',
    intent:
      'C の値の文字を、本文より一段淡いグレー（キャプションより濃い）にする。白地で 6.9:1 あり、読みものの基準（4.5:1）を満たす。押せない欄の文字（2.5:1）よりずっと濃いので、押せない欄とは文字でも見分けられる。',
    spec: [
      ['塗り', 'なし（白）'],
      ['線', '破線の輪郭（3:1 の濃さ）'],
      ['値の文字', '一段淡いグレー（白地 6.9:1）'],
      ['hover', '変えない'],
      ['値の位置', '欄の余白の内側'],
    ],
    tokens: readonly({
      ...noFill,
      '--field-readonly-line': 'var(--color-line-strong)',
      '--field-readonly-outline-width': 'var(--border-width-thin)',
      '--field-readonly-outline-style': 'dashed',
      '--field-readonly-text': 'var(--color-fg-muted)',
    }),
  },
  {
    id: 'C3',
    name: 'C＋値の文字をキャプションの淡さに',
    intent:
      'C の値の文字を、キャプションと同じ淡いグレーにする。白地で 4.5:1 で、読み取り専用の値に使える最も淡い色。これより淡くすると、押せない欄と同じく読みづらくなる。',
    spec: [
      ['塗り', 'なし（白）'],
      ['線', '破線の輪郭（3:1 の濃さ）'],
      ['値の文字', 'キャプションと同じグレー（白地 4.5:1）'],
      ['hover', '変えない'],
      ['値の位置', '欄の余白の内側'],
    ],
    tokens: readonly({
      ...noFill,
      '--field-readonly-line': 'var(--color-line-strong)',
      '--field-readonly-outline-width': 'var(--border-width-thin)',
      '--field-readonly-outline-style': 'dashed',
      '--field-readonly-text': 'var(--color-fg-subtle)',
    }),
  },
  {
    id: 'D',
    name: '値だけ',
    intent:
      '塗りも線もなくし、ラベルの下に値を文として置く。値はラベルの左端にそろえる。欄の高さは保つので、編集できる欄と並べても行がずれない。キーと値の組を並べた表示に近い見え方になる。',
    spec: [
      ['塗り', 'なし'],
      ['線', 'なし'],
      ['hover', '変えない'],
      ['prefix・suffix', '塗りなし（文字だけ）'],
      ['値の位置', 'ラベルの左端'],
    ],
    tokens: readonly({ ...noFill, '--field-readonly-flush': '1' }),
  },
  {
    id: 'E',
    name: '幅いっぱいの下線',
    intent:
      'D に、欄の幅いっぱいの細い下線を足す。値の置き場所の幅が分かる。参照画像のキーと値の組と同じ形なので、キーと値の組の部品を作るときに、見た目が重なる。',
    spec: [
      ['塗り', 'なし'],
      ['線', '幅いっぱいの細い下線'],
      ['hover', '変えない'],
      ['prefix・suffix', '塗りなし（文字だけ）'],
      ['値の位置', 'ラベルの左端'],
    ],
    tokens: readonly({
      ...noFill,
      '--field-readonly-radius': '0px',
      '--field-readonly-line': 'var(--color-line)',
      '--field-readonly-underline-width': 'var(--border-width-thin)',
      '--field-readonly-flush': '1',
    }),
  },
];

const columns: Column[] = [
  { label: '通常' },
  { label: 'hover', preview: 'hover' },
  {
    label: 'フォーカス',
    note: '読み取り専用でもフォーカスできる（値を選んで写せる）',
    preview: 'focus',
  },
  { label: 'prefix・suffix', note: '文字の prefix と suffix' },
  { label: '複数行', note: 'Textarea' },
  { label: 'ほかの欄と並べる', note: '上から、編集できる欄・読み取り専用・押せない欄' },
];

const width = 'w-[260px]';

function renderCell(column: Column) {
  switch (column.label) {
    case 'prefix・suffix':
      return (
        <div className={`flex flex-col gap-4 ${width}`}>
          <TextField label="サイト" prefix="https://" defaultValue="k6n.jp" readOnly />
          <TextField label="月額" suffix="円" defaultValue="1,200" readOnly />
        </div>
      );
    case '複数行':
      return (
        <div className={width}>
          <Textarea
            label="自己紹介"
            defaultValue={'UI コンポーネントを作っています。\n水色とピンクが好きです。'}
            readOnly
          />
        </div>
      );
    case 'ほかの欄と並べる':
      return (
        <div className={`flex flex-col gap-4 ${width}`}>
          <TextField label="表示名" defaultValue="かずえもん" />
          <TextField
            label="ユーザー ID"
            caption="あとから変えられません"
            defaultValue="kazuemon"
            readOnly
          />
          <TextField
            label="招待コード"
            caption="管理者だけが変えられます"
            defaultValue="K6N-2026"
            disabled
          />
        </div>
      );
    default:
      return (
        <div className={width}>
          <TextField label="ユーザー ID" defaultValue="kazuemon" readOnly />
        </div>
      );
  }
}

const meta = {
  title: 'Design Review/152 読み取り専用の欄の形',
  id: 'design-review-152-readonly-field',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: ['[data-preview="hover"] [data-slot="control"]'],
      focusWithin: ['[data-preview="focus"] [data-slot="control"]'],
    },
  },
  args: { pick: 'C2' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'C2', 'C3', 'D', 'E'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={152}
      axis="読み取り専用の欄の形"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column)}
    >
      <p>
        編集できる欄はグレーの塗りです（原則
        8）。読み取り専用の欄の形は、ここで一から決めます。塗りを持たせるかどうかも決めていません。前の原則の「読み取り専用は下線だけ」は、参照画像のキーと値の組を読み違えたものでした。
      </p>
      <p>
        読み取り専用の欄はフォーカスでき、値を選んで写せます。フォーカスしたときは、編集できる欄と同じ枠線が付きます。値をラベルの左端にそろえる案（D・E）では、フォーカスの枠線が値に近づきます。押せない欄（disabled）とも見分けられるかを、右端の列で見てください。
      </p>
      <p>
        どれを既定にするか、ほかに選べるようにしたい案があれば、それも教えてください。トークンでは作れないので並べていませんが、鍵のアイコンを欄の右端に置く形も足せます。
      </p>
    </Comparison>
  ),
};
