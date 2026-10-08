import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { Button } from '../button/Button';
import { Form } from '../form/Form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../table/Table';
import { Editable, type EditableProps } from './Editable';
import { DensityPair, Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode } from '../../stories/story-states';

type Sample = { label: string; props: Partial<EditableProps> };

const stateRows: Sample[] = [
  { label: '値あり', props: { defaultValue: '2026 年の目標' } },
  { label: '空', props: { placeholder: '例: 2026 年の目標' } },
  { label: 'エラー', props: { defaultValue: '', errorText: '名前を入力してください' } },
  { label: '押せない', props: { defaultValue: '2026 年の目標', disabled: true } },
  { label: '読み取り専用', props: { defaultValue: '2026 年の目標', readOnly: true } },
];

// 書き換え中の列は defaultEditing で開き、欄のフォーカスを固定する
const stateColumns: (MatrixColumn & { label: string; editing?: boolean })[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
  { label: '書き換え中', state: 'active', editing: true },
];

const previewTarget = 'button[data-slot="editable-preview"]:not(:disabled)';
// 書き換え中の列。押せない・読み取り専用の行では書き換えにならないので、欄の見た目は固定しない
const editingControl = '[data-editing] [data-slot="control"]';
const statePseudoParams = {
  rootSelector: 'body',
  hover: [`[data-preview="hover"] ${previewTarget}`],
  focusVisible: [`[data-preview="focus"] ${previewTarget}`],
  focusWithin: [`[data-preview="active"] ${editingControl}`],
};

// 見本の幅。欄は入れ物の幅いっぱいに伸びるので、ふだんの置き場所に近い幅にする
const narrow: Decorator = (Story) => (
  <div className="max-w-sm">
    <Story />
  </div>
);

const meta = {
  title: 'Components/Editable',
  component: Editable,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'ふだんは文字として見え、押すと（またはフォーカスして Enter で）その場で書き換えられる欄です。見出しの名前の変更や、表のセルに使います。',
          '',
          '- 書き換えているあいだは、TextField と同じ入力欄になります。文字の位置は、文字のときと入力欄のときで変わりません。',
          '- Enter で確定し、Esc で取り消して元の値に戻します。欄の外へ出たときは、既定では確定します（`blurBehavior="cancel"` で取り消し）。',
          '- `multiline` を付けると複数行になり、Enter で改行、Ctrl（Mac では ⌘）＋ Enter で確定します。',
          '- `value`・`onValueChange` は打つたびの値です。保存は、確定したときに呼ばれる `onValueCommitted` で行います。',
          '- 文字のときは、文字の後ろに鉛筆を淡く置き、マウスを載せると濃くします。`editIndicator="hover"` では、載せたときだけ出します（指で操作しているときは、いつも淡く出します）。',
          '- `showActions` を付けると、書き換えているあいだ欄の右端に確定（✓）と取り消し（×）のボタンを出します。',
          '- 見えるラベルを置かないときは `accessibleName` を渡します。文字のときは、ラベル・値・「編集」の順に読み上げます（「編集」は `editName` で変えられます）。',
          '- `name` を付けると Form の値になります。書き換えている途中で送ったときは、途中の値を送ります。',
          '- 押せない（`disabled`）ときは文字を薄くし、押しても書き換えになりません。`readOnly` はただの文字として出します。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: '目標の名前',
    defaultValue: '2026 年の目標',
    placeholder: '例: 2026 年の目標',
    multiline: false,
    blurBehavior: 'commit',
    showActions: false,
    editIndicator: 'subtle',
    disabled: false,
    readOnly: false,
    onValueCommitted: fn(),
  },
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    placeholder: { control: 'text' },
    errorText: { control: 'text' },
    multiline: { control: 'boolean' },
    blurBehavior: {
      control: 'inline-radio',
      options: ['commit', 'cancel'],
      table: { defaultValue: { summary: "'commit'" } },
    },
    showActions: { control: 'boolean' },
    editIndicator: {
      control: 'inline-radio',
      options: ['subtle', 'hover'],
      table: { defaultValue: { summary: "'subtle'" } },
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
  },
} satisfies Meta<typeof Editable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  decorators: [narrow],
  play: async ({ canvas, args }) => {
    const preview = canvas.getByRole('button', { name: /目標の名前/ });
    await expect(preview).toHaveAccessibleName('目標の名前 2026 年の目標 編集');
    // 押すと入力欄になり、全体を選んだ状態でフォーカスが入る
    await userEvent.click(preview);
    const input = canvas.getByRole('textbox', { name: '目標の名前' });
    await expect(input).toHaveFocus();
    await userEvent.keyboard('2027 年の目標{Enter}');
    await expect(args.onValueCommitted).toHaveBeenLastCalledWith('2027 年の目標');
    // 確定したら、文字の側にフォーカスが戻る
    const after = canvas.getByRole('button', { name: /目標の名前/ });
    await expect(after).toHaveFocus();
    await expect(after).toHaveAccessibleName('目標の名前 2027 年の目標 編集');
    // Esc は取り消して元の値に戻す
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('textbox', { name: '目標の名前' })).toHaveFocus();
    await userEvent.keyboard('取り消す値{Escape}');
    await expect(canvas.getByRole('button', { name: /目標の名前/ })).toHaveAccessibleName(
      '目標の名前 2027 年の目標 編集'
    );
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
  },
};

export const States: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: { pseudo: statePseudoParams, controls: { disable: true } },
  render: () => (
    <Matrix
      rows={stateRows}
      columns={stateColumns}
      columnWidth="13rem"
      rowLabel={(row) => row.label}
      renderCell={(row, column) => (
        <Editable
          accessibleName={`${row.label}・${column.label}`}
          defaultEditing={column.editing}
          {...row.props}
        />
      )}
    />
  ),
};

export const EditIndicator: Story = {
  tags: ['visual'],
  name: '鉛筆の出し方',
  parameters: { pseudo: statePseudoParams, controls: { disable: true } },
  render: () => (
    <Matrix
      rows={(['subtle', 'hover'] as const).map((value) => ({ label: value }))}
      columns={stateColumns.slice(0, 3)}
      columnWidth="13rem"
      rowLabel={(row) => row.label}
      renderCell={(row, column) => (
        <Editable
          accessibleName={`${row.label}・${column.label}`}
          editIndicator={row.label}
          defaultValue="2026 年の目標"
        />
      )}
    />
  ),
};

export const Multiline: Story = {
  tags: ['visual'],
  name: '複数行',
  parameters: { pseudo: statePseudoParams, controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="16rem">
      <Specimen label="文字のとき">
        <Editable
          label="メモ"
          multiline
          defaultValue={'週に 1 本、記事を書く。\n書いたら SNS で知らせる。'}
        />
      </Specimen>
      <Specimen label="書き換え中">
        <div data-preview="active">
          <Editable
            label="メモ"
            multiline
            defaultEditing
            defaultValue={'週に 1 本、記事を書く。\n書いたら SNS で知らせる。'}
          />
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const Density: Story = {
  tags: ['visual'],
  name: '密度と大きさ',
  parameters: { controls: { disable: true } },
  render: () => (
    <DensityPair>
      <div className="flex w-64 flex-col gap-4">
        <Editable label="md" defaultValue="2026 年の目標" />
        <Editable label="sm" size="sm" defaultValue="2026 年の目標" />
        <Editable label="複数行" multiline defaultValue={'1 行目\n2 行目'} />
      </div>
    </DensityPair>
  ),
};

/** 文字のときと入力欄のときで、文字の位置が変わらないことを確かめる */
export const TextPosition: Story = {
  name: '文字の位置',
  decorators: [narrow],
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Editable accessibleName="1 行" defaultValue="かずえもん" />
      <Editable accessibleName="複数行" multiline defaultValue={'1 行目\n2 行目'} />
    </div>
  ),
  play: async ({ canvas }) => {
    for (const name of ['1 行', '複数行']) {
      const button = canvas.getByRole('button', { name: new RegExp(`^${name}`) });
      const text = button.querySelector('span')!;
      const before = text.getBoundingClientRect();
      const box = button.getBoundingClientRect();
      // 文字のときも、升の高さは文字の側の高さ（透明な入力欄が升を広げない）
      const cell = button.closest('[data-slot="editable"]')!.getBoundingClientRect();
      await expect(cell.height).toBeCloseTo(box.height, 0);
      await userEvent.click(button);
      const input = canvas.getByRole('textbox', { name });
      const style = getComputedStyle(input);
      const rect = input.getBoundingClientRect();
      // 文字の左端（input の左端＋内側の余白）と、1 行目の上端（上の余白＋行の高さと文字の高さの差の半分）をくらべる
      await expect(Math.abs(rect.left + parseFloat(style.paddingLeft) - before.left)).toBeLessThan(
        0.5
      );
      const outer = input.closest('[data-slot="control"]')!.getBoundingClientRect();
      await expect(Math.abs(outer.top - box.top)).toBeLessThan(0.5);
      await expect(Math.abs(outer.height - box.height)).toBeLessThan(0.5);
      await userEvent.keyboard('{Escape}');
    }
  },
};

export const BlurAndActions: Story = {
  name: '外へ出たとき・確定のボタン',
  decorators: [narrow],
  parameters: { controls: { disable: true } },
  args: { onValueCommitted: fn() },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Editable
        label="外へ出ると確定"
        defaultValue="確定する"
        onValueCommitted={args.onValueCommitted}
      />
      <Editable label="外へ出ると取り消し" defaultValue="取り消す" blurBehavior="cancel" />
      <Editable label="確定のボタン" defaultValue="ボタンで確定" showActions />
      <Button>外のボタン</Button>
    </div>
  ),
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^外へ出ると確定/ }));
    await userEvent.keyboard('A');
    await userEvent.click(canvas.getByRole('button', { name: '外のボタン' }));
    await expect(args.onValueCommitted).toHaveBeenLastCalledWith('A');
    await expect(canvas.getByRole('button', { name: /^外へ出ると確定/ })).toHaveAccessibleName(
      '外へ出ると確定 A 編集'
    );

    await userEvent.click(canvas.getByRole('button', { name: /^外へ出ると取り消し/ }));
    await userEvent.keyboard('B');
    await userEvent.click(canvas.getByRole('button', { name: '外のボタン' }));
    await expect(canvas.getByRole('button', { name: /^外へ出ると取り消し/ })).toHaveAccessibleName(
      '外へ出ると取り消し 取り消す 編集'
    );

    // ボタンへ移っても書き換えは続き、✓ で確定する
    await userEvent.click(canvas.getByRole('button', { name: /^確定のボタン/ }));
    await userEvent.keyboard('C');
    await userEvent.click(canvas.getByRole('button', { name: '確定' }));
    await expect(canvas.getByRole('button', { name: /^確定のボタン/ })).toHaveAccessibleName(
      '確定のボタン C 編集'
    );
  },
};

/** かな漢字変換の確定の Enter では、欄を確定しない */
export const Composition: Story = {
  name: 'かな漢字変換',
  decorators: [narrow],
  parameters: { controls: { disable: true } },
  args: { onValueCommitted: fn() },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /目標の名前/ }));
    const input = canvas.getByRole('textbox', { name: '目標の名前' });
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', keyCode: 229, bubbles: true, cancelable: true })
    );
    await expect(input).toHaveFocus();
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
  },
};

export const InForm: Story = {
  name: 'Form の中',
  decorators: [narrow],
  parameters: {
    controls: { disable: true },
    docs: {
      source: sourceCode(`
        <Form onFormSubmit={(values) => save(values)}>
          <Editable label="目標の名前" name="title" defaultValue="2026 年の目標" />
          <Button type="submit">保存</Button>
        </Form>
      `),
    },
  },
  args: { onValueCommitted: fn() },
  render: function Render() {
    const [sent, setSent] = useState<string>();
    return (
      <Form onFormSubmit={(values) => setSent(JSON.stringify(values))} className="gap-4">
        <Editable label="目標の名前" name="title" defaultValue="2026 年の目標" />
        <Button type="submit">保存</Button>
        <output className="text-sm text-fg-muted">{sent}</output>
      </Form>
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '保存' }));
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('{"title":"2026 年の目標"}')
    );
  },
};

const rows = [
  { id: 1, name: 'ポートフォリオを作る', owner: 'かずえもん' },
  { id: 2, name: '記事を 12 本書く', owner: 'かずえもん' },
  { id: 3, name: '部品を 100 個にする', owner: 'Claude' },
];

export const InTable: Story = {
  name: '表のセル',
  parameters: {
    controls: { disable: true },
    docs: {
      source: sourceCode(`
        <TableCell>
          <Editable accessibleName={\`\${row.name}の担当\`} size="sm" defaultValue={row.owner} />
        </TableCell>
      `),
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>目標</TableHeader>
          <TableHeader>担当</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <Editable accessibleName={`${row.owner}の目標`} size="sm" defaultValue={row.name} />
            </TableCell>
            <TableCell>
              <Editable accessibleName={`${row.name}の担当`} size="sm" defaultValue={row.owner} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
