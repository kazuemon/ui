import type { Meta, StoryObj } from '@storybook/react-vite';
import { type FormEvent, type ReactNode, useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../components/button/Button';
import { Checkbox } from '../components/checkbox/Checkbox';
import { CheckboxGroup } from '../components/checkbox/CheckboxGroup';
import { Form } from '../components/form/Form';
import { Radio, RadioGroup } from '../components/radio/Radio';
import type { ListboxItem } from '../internal/listbox/use-listbox-option';
import { Select } from '../components/select/Select';
import { Switch } from '../components/switch/Switch';
import { Text } from '../components/text/Text';
import { Textarea } from '../components/textarea/Textarea';
import { TextField } from '../components/text-field/TextField';
import { Matrix } from './story-parts';
import { type MatrixColumn, sourceCode } from './story-states';

// 必須・任意の印を、Field を通る部品でまとめて並べる一覧。印の形と、ラベルが折り返したときの見え方を見比べる

/** 印の指定。部品ごとの props は同じ名前で通る */
interface MarkValues {
  required?: boolean;
  requiredMark?: 'tag' | 'asterisk' | 'none';
  optionalMark?: 'text' | 'none';
}

interface MarkRow {
  name: string;
  render: (marks: MarkValues, label: string) => ReactNode;
}

const wards: ListboxItem[] = [
  { label: '渋谷区', value: 'shibuya' },
  { label: '新宿区', value: 'shinjuku' },
];

const rows: MarkRow[] = [
  { name: 'TextField', render: (marks, label) => <TextField {...marks} label={label} /> },
  {
    name: 'Textarea',
    render: (marks, label) => <Textarea {...marks} label={label} minRows={2} maxRows={2} />,
  },
  {
    name: 'Select',
    render: (marks, label) => (
      <Select {...marks} label={label} items={wards} placeholder="選んでください" />
    ),
  },
  { name: 'Checkbox', render: (marks, label) => <Checkbox {...marks} label={label} /> },
  { name: 'Switch', render: (marks, label) => <Switch {...marks} label={label} /> },
  {
    name: 'RadioGroup',
    render: (marks, label) => (
      <RadioGroup {...marks} label={label}>
        <Radio value="mail" label="メール" />
        <Radio value="tel" label="電話" />
      </RadioGroup>
    ),
  },
  {
    name: 'CheckboxGroup',
    render: (marks, label) => (
      <CheckboxGroup {...marks} label={label} caption="1つ以上選んでください">
        <Checkbox value="mail" label="メール" />
        <Checkbox value="tel" label="電話" />
      </CheckboxGroup>
    ),
  },
];

type MarkColumn = MatrixColumn & { values: MarkValues };

const columns: MarkColumn[] = [
  { label: '必須（タグ）', values: { required: true } },
  { label: '必須（*）', values: { required: true, requiredMark: 'asterisk' } },
  { label: '任意', values: { optionalMark: 'text' } },
  { label: '印なし', values: {} },
];

const meta = {
  title: 'Overview/必須と任意の印',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          '必須の欄は `required` を渡すと、ラベルの後ろに「必須」のタグが出ます。印は読み上げから外れ、必須であることは欄の `required`（`aria-required`）が伝えます。',
          '',
          '- `requiredMark="asterisk"` にすると、赤い「\\*」になります。この形を使うときは、「\\* は必須の項目です」の一文をフォームの先頭などに置いてください。文は使う側が書きます',
          '- `optionalMark="text"` にすると、`required` でない欄のラベルの後ろに「任意」が出ます。必須の印と組み合わせられます',
          '- `requiredMark="none"` で印を出さずに、`required` だけを付けられます',
          '- フォーム全体でそろえるときは `<Form requiredMark…>`、画面全体でそろえるときは `<ThemeProvider requiredMark…>` に渡します。欄に書いた props が勝ちます',
          '- CheckboxGroup は `role="group"` に `aria-required` を付けられません。必須であることは `caption` の文でも書いてください（「1つ以上選んでください」など）',
          '- 印は Form のエラーの一覧の欄の名前にも入りません',
        ].join('\n'),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** 部品ごとに、印の形を横に並べる */
export const Marks: Story = {
  name: '印の形',
  tags: ['visual'],
  parameters: {
    docs: {
      source: sourceCode(`
        <TextField label="お名前" required />
        <TextField label="お名前" required requiredMark="asterisk" />
        <TextField label="ニックネーム" optionalMark="text" />
      `),
    },
  },
  render: () => (
    <Matrix
      rows={rows}
      columns={columns}
      columnWidth="13rem"
      rowLabel={(row) => row.name}
      renderCell={(row, column) => row.render(column.values, row.name)}
    />
  ),
};

/** 幅の狭い欄で、ラベルが折り返したときの印の位置 */
export const Wrap: Story = {
  name: 'ラベルが折り返すとき',
  tags: ['visual'],
  render: () => (
    <div className="flex flex-wrap gap-8 p-1">
      {columns.map((column, index) => (
        <div key={index} className="w-44">
          <TextField
            {...column.values}
            label="お届け先の郵便番号と住所"
            caption="半角の数字で入力します"
          />
        </div>
      ))}
    </div>
  ),
};

const areas: ListboxItem[] = [
  { label: '東京都', value: 'tokyo' },
  { label: '大阪府', value: 'osaka' },
];

/** 印を「*」にそろえたフォーム。意味を伝える一文は、使う側がフォームの先頭に置く */
function AsteriskForm() {
  return (
    <Form requiredMark="asterisk" optionalMark="text" className="flex max-w-sm flex-col gap-5">
      <Text size="sm" variant="subtle">
        * は必須の項目です
      </Text>
      <TextField name="name" label="お名前" required autoComplete="off" />
      <TextField name="kana" label="ふりがな" autoComplete="off" />
      <Select label="都道府県" items={areas} placeholder="選んでください" required />
      <Button type="submit" color="primary" className="self-start">
        送る
      </Button>
    </Form>
  );
}

/** フォームでまとめて指定する */
export const WholeForm: Story = {
  name: 'フォームでそろえる',
  parameters: {
    docs: {
      description: {
        story:
          '`<Form requiredMark="asterisk">` で、中の欄の印をまとめて変えられます。「\\*」を使うときは、その意味を伝える一文をフォームの先頭などに置いてください。',
      },
      source: sourceCode(`
        <Form requiredMark="asterisk" optionalMark="text">
          <Text size="sm" variant="subtle">* は必須の項目です</Text>
          <TextField name="name" label="お名前" required />
          <TextField name="kana" label="ふりがな" />
          <Select label="都道府県" items={areas} placeholder="選んでください" required />
          <Button type="submit" color="primary">送る</Button>
        </Form>
      `),
    },
  },
  render: () => <AsteriskForm />,
};

function AnnounceForm() {
  const [error, setError] = useState<string | undefined>(undefined);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const field = event.currentTarget.elements.namedItem('name');
    const value = field instanceof HTMLInputElement ? field.value : '';
    setError(value ? undefined : 'お名前を入力してください');
  };
  return (
    <Form showErrorSummary onSubmit={onSubmit} className="flex max-w-sm flex-col gap-5">
      <TextField name="name" label="お名前" required autoComplete="off" errorText={error} />
      <Select label="都道府県" items={areas} placeholder="選んでください" required />
      <CheckboxGroup label="ご連絡の方法" required caption="1つ以上選んでください">
        <Checkbox value="mail" label="メール" />
        <Checkbox value="tel" label="電話" />
      </CheckboxGroup>
      <Button type="submit" color="primary" className="self-start">
        送る
      </Button>
    </Form>
  );
}

/** 印は読み上げから外れ、必須であることは欄の required が伝える */
export const Announce: Story = {
  name: '読み上げと必須',
  render: () => <AnnounceForm />,
  play: async ({ canvas }) => {
    // 印は読み上げから外す（aria-hidden）。欄の名前にも入らない
    for (const mark of canvas.getAllByText('必須')) {
      await expect(mark).toHaveAttribute('aria-hidden', 'true');
    }
    // 必須であることは、欄の required（aria-required）が伝える
    const name = canvas.getByRole('textbox', { name: 'お名前' });
    await expect(name).toBeRequired();
    await expect(canvas.getByRole('combobox', { name: '都道府県' })).toHaveAttribute(
      'aria-required',
      'true'
    );
    // グループ（role="group"）には aria-required を付けられないので、caption の文で伝える
    const group = canvas.getByRole('group', { name: 'ご連絡の方法' });
    await expect(group).not.toHaveAttribute('aria-required');
    await expect(group).toHaveAccessibleDescription(/1つ以上選んでください/);
    // エラーの一覧の欄の名前に、印の文字が入らない
    await userEvent.click(canvas.getByRole('button', { name: '送る' }));
    const summary = await canvas.findByRole('group', { name: '入力を確かめてください（1件）' });
    await waitFor(() =>
      expect(
        within(summary).getByRole('link', { name: 'お名前: お名前を入力してください' })
      ).toBeInTheDocument()
    );
    await expect(summary).not.toHaveTextContent('必須');
  },
};
