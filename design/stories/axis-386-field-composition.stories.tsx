import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 386: Field の組み立て方（API の軸。見た目は変えず、使う側のコードを並べる）
//   入力欄が label・caption・errorText を内蔵する形のままにするか、Field の部位を公開して組み立てられるようにするか
const meta = {
  title: 'Design Review/386 Field の組み立て方',
  id: 'design-review-386-field-composition',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の記録用）',
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
    name: '内蔵だけ',
    intent:
      '15 の入力欄が label・caption・errorText を持ち、ラベルは必ず上。読み上げのつなぎ（説明の順・エラーの一覧の名前・送信中のロック）は部品が持つ',
    spec: [
      ['公開するもの', '入力欄 15'],
      ['ラベル', '必須・上'],
    ],
  },
  {
    id: 'A',
    name: '内蔵のまま、置き場所を選べる',
    intent:
      '今の形に labelPlacement（top / start）を足し、label を省くときは accessibleName を必須にする。Form に既定の置き場所を持たせ、フォーム全体を一度に横にできる。変更は小さい',
    spec: [
      ['公開するもの', '入力欄 15'],
      ['足す props', 'labelPlacement・accessibleName'],
      ['Form', 'labelPlacement の既定'],
    ],
  },
  {
    id: 'B',
    name: 'A＋組み立ても公開',
    intent:
      'A に加えて、Field（FieldLabel・FieldCaption・FieldMessages）と、ラベルを持たない本体（SelectControl など）を公開する。内蔵の欄は Field と本体で組んだものになる。ふだんは内蔵、自由に並べたいとき・外の部品を入れたいときは組み立てる',
    spec: [
      ['公開するもの', '入力欄 15 ＋ Field の部位 ＋ 本体 15'],
      ['つなぎ', 'Field が文脈で本体に渡す'],
    ],
  },
  {
    id: 'C',
    name: '組み立てだけ',
    intent:
      '入力欄から label などを外し、いつも Field で包む（Chakra・Base UI・React Aria の形）。いちばん柔軟だが、書く量が増え、原則 4 の骨組みを守るのが使う側になる。全部品・全見本を書き直す',
    spec: [
      ['公開するもの', '本体 15 ＋ Field の部位'],
      ['ラベル', 'FieldLabel で書く'],
    ],
  },
];

const columns: Column[] = [
  { label: '表の下の帯', note: '1 ページの件数' },
  { label: '設定のフォーム', note: 'ラベルを全部横にそろえる' },
  { label: 'react-hook-form', note: '検証の結果を渡す' },
  { label: '外の部品を入れる', note: '色を選ぶ部品など、ライブラリにない本体' },
];

const code: Record<string, Record<string, string>> = {
  現行版: {
    表の下の帯: `// ラベルが上に出る。帯では浮く
<Select
  label="1 ページの件数"
  items={pageSizes}
/>`,
    設定のフォーム: `// 横に置けない
<Form>
  <TextField label="表示名" caption="…" />
  <Select label="言語" items={langs} />
</Form>`,
    'react-hook-form': `const { register, formState } = useForm();

<Form errors={toFormErrors(formState.errors)}>
  <TextField
    label="メール"
    name="email"
    inputProps={register('email')}
  />
</Form>`,
    外の部品を入れる: `// 作れない。ラベル・エラーの行を
// 自分で書き、aria-describedby も自分でつなぐ`,
  },
  A: {
    表の下の帯: `<Select
  label="1 ページの件数"
  labelPlacement="start"
  items={pageSizes}
/>

// 見える文で分かるとき
<Select
  accessibleName="1 ページの件数"
  items={pageSizes}
/>`,
    設定のフォーム: `<Form labelPlacement="start">
  <TextField label="表示名" caption="…" />
  <Select label="言語" items={langs} />
</Form>`,
    'react-hook-form': `// 現行版と同じ
<Form errors={toFormErrors(formState.errors)}>
  <TextField
    label="メール"
    name="email"
    inputProps={register('email')}
  />
</Form>`,
    外の部品を入れる: `// 現行版と同じく作れない`,
  },
  B: {
    表の下の帯: `// ふだんは A と同じ内蔵の形
<Select label="1 ページの件数"
  labelPlacement="start" items={pageSizes} />

// 自由に並べるとき
<Field name="pageSize">
  <FieldLabel>1 ページの件数</FieldLabel>
  <SelectControl items={pageSizes} />
</Field>`,
    設定のフォーム: `// A と同じ
<Form labelPlacement="start">
  <TextField label="表示名" caption="…" />
  <Select label="言語" items={langs} />
</Form>`,
    'react-hook-form': `// A と同じ。Controller で包むときも
<Controller name="lang" control={control}
  render={({ field, fieldState }) => (
    <Field error={fieldState.error?.message}>
      <FieldLabel>言語</FieldLabel>
      <SelectControl {...field} items={langs} />
      <FieldMessages />
    </Field>
  )} />`,
    外の部品を入れる: `<Field name="color" error={error}>
  <FieldLabel>テーマの色</FieldLabel>
  <FieldCaption>ボタンの色になります</FieldCaption>
  <FieldControl render={<ColorPicker />} />
  <FieldMessages />
</Field>`,
  },
  C: {
    表の下の帯: `<Field labelPlacement="start">
  <FieldLabel>1 ページの件数</FieldLabel>
  <Select items={pageSizes} />
</Field>`,
    設定のフォーム: `<Form labelPlacement="start">
  <Field>
    <FieldLabel>表示名</FieldLabel>
    <FieldCaption>…</FieldCaption>
    <TextInput />
    <FieldMessages />
  </Field>
  <Field>
    <FieldLabel>言語</FieldLabel>
    <Select items={langs} />
    <FieldMessages />
  </Field>
</Form>`,
    'react-hook-form': `<Field name="email"
  error={formState.errors.email?.message}>
  <FieldLabel>メール</FieldLabel>
  <TextInput {...register('email')} />
  <FieldMessages />
</Field>`,
    外の部品を入れる: `<Field name="color">
  <FieldLabel>テーマの色</FieldLabel>
  <FieldControl render={<ColorPicker />} />
  <FieldMessages />
</Field>`,
  },
};

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={386}
      axis="Field の組み立て方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <pre className="bg-codeblock-bg w-[320px] overflow-x-auto rounded-control p-3 font-mono text-xs leading-5 whitespace-pre">
          {code[candidate.id]?.[column.label]}
        </pre>
      )}
    >
      <p>
        決定（ADR-0366）: B。内蔵の形のまま、Field の部位とラベルを持たない本体も公開する。A
        を先に入れる段階は踏まない。
      </p>
      <p>
        見た目ではなく、使う側の書き方を決める軸です。部品名（SelectControl・FieldMessages
        など）は仮です。
      </p>
      <p>
        ほかのライブラリ: 内蔵だけは Mantine（label・description・error。自前の本体には
        Input.Wrapper）と MUI の TextField（別に FormControl・FormLabel・FormHelperText
        で組める）。組み立ては Chakra v3（Field.Root・Label・HelperText・ErrorText）、React Aria
        Components（TextField の中に Label・Input・Text・FieldError）、Base
        UI（Field.Root・Label・Control・Description・Error）。shadcn/ui は react-hook-form
        前提の組み立て（FormField・FormItem・FormLabel・FormControl・FormMessage）。Ant Design は
        Form.Item が label と layout="horizontal" を持つ。B は MUI・Mantine
        に近い「内蔵が既定、組み立ては逃げ道」の形です。
      </p>
      <p>
        react-hook-form との相性: どの形でも、検証の結果は Form の errors か欄の error
        に渡すので、差は小さいです。差が出るのは Controller で値を渡す欄（Select・Combobox
        など）で、組み立てると field
        をそのまま本体へ広げられます。今の内蔵の形では、value・onValueChange に分けて渡します。
      </p>
      <p>
        B を選ぶときは、組み立てで原則 4 の順（ラベル → キャプション → 本体 →
        行）が崩れても、読み上げの順を Field が保てるか（説明の id を集める仕組み）が要になります。
      </p>
    </Comparison>
  ),
};
