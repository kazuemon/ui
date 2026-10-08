import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, userEvent, waitFor } from 'storybook/test';

import { FileInput, type FileInputProps, type FileInputRejection } from './FileInput';
import { Button } from '../button/Button';
import { Form } from '../form/Form';
import { DensityPair, Matrix } from '../../stories/story-parts';
import { enabledControl, type MatrixColumn, statePseudo } from '../../stories/story-states';

type Sample = MatrixColumn & { props: Partial<FileInputProps> };

const photo = () => new File(['dummy'], 'photo.png', { type: 'image/png' });
const photos = () => [photo(), new File(['b'], 'cover.jpg', { type: 'image/jpeg' })];

function dispatchDrag(
  type: 'dragenter' | 'dragover' | 'dragleave' | 'drop',
  element: Element,
  dataTransfer: DataTransfer
) {
  element.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer }));
}

const stateRows: Sample[] = [
  { label: '空', props: {} },
  { label: '1 つ選んだ', props: { defaultValue: [photo()] } },
  { label: '消せる', props: { defaultValue: [photo()], clearable: true } },
  { label: 'エラー', props: { errorText: 'ファイルを選んでください' } },
  { label: '押せない', props: { defaultValue: [photo()], disabled: true } },
  { label: '読み取り専用', props: { defaultValue: [photo()], readOnly: true } },
];

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
];

const meta = {
  title: 'Components/FileInput',
  component: FileInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'フォームの 1 行に収まる、ファイルを選ぶ入力欄です。TextField と同じ高さ・塗り・枠線で、ラベル・キャプション・状態の文も同じ並びです。大きな落とし場所が要るときは Dropzone を使います。',
          '',
          '- 押すか、フォーカスして Enter・Space で OS のファイル選択が開きます。ファイルを欄に落としても選べます（受けるときは欄の面と線が変わります。`droppable={false}` で止められます）。文を変えたい落とし場所には Dropzone を使います。',
          '- 左端の塊（既定）のほか、`variant="plain"` でアイコンと名前だけの形も選べます。',
          '- `accept`・`multiple` は `<input type="file">` と同じ意味です。`maxSize`（バイト）・`maxFiles`・`validateFile` は Dropzone と同じ判定で、弾いたファイルは `onFilesRejected` に理由とともに渡ります。',
          '- 選び直すと、いまの選択を置き換えます（ネイティブの欄と同じ）。値は `File[]` で、`name` を付けるとフォームの送信に入ります。',
          '- `clearable` で、選んだファイルを外す × を右端に出します。',
          '- 複数のときの出し方は、`multipleDisplay` で、既定の「a.png ほか 2 件」のほか、欄に件数・欄の下に Chip の列（`below`）も選べます。',
          '- 押せない・読み取り専用・Form の送信中は、TextField と同じ見た目になります。',
        ].join('\n'),
      },
    },
  },
  args: { label: '添付ファイル' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['plain', 'attached'],
      table: { defaultValue: { summary: "'attached'" } },
    },
    multipleDisplay: {
      control: 'inline-radio',
      options: ['first', 'below'],
      table: { defaultValue: { summary: "'first'" } },
    },
  },
} satisfies Meta<typeof FileInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  render: (args) => (
    <div className="max-w-sm">
      <FileInput {...args} />
    </div>
  ),
};

export const States: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({ hover: enabledControl, focusWithin: enabledControl }),
  },
  render: () => (
    <Matrix
      rows={stateRows}
      rowLabel={(row) => row.label}
      columns={stateColumns}
      columnWidth="18rem"
      renderCell={(row) => <FileInput label="添付ファイル" {...row.props} />}
    />
  ),
};

export const Variants: Story = {
  tags: ['visual'],
  name: '見た目の型と複数',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid max-w-sm gap-4">
      {(['plain', 'attached'] as const).map((variant) => (
        <FileInput key={variant} label={variant} variant={variant} defaultValue={[photo()]} />
      ))}
      {(['first', 'below'] as const).map((multipleDisplay) => (
        <FileInput
          key={multipleDisplay}
          label={`複数: ${multipleDisplay}`}
          multiple
          multipleDisplay={multipleDisplay}
          defaultValue={photos()}
        />
      ))}
    </div>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  render: () => (
    <DensityPair>
      <div className="w-72">
        <FileInput label="添付ファイル" defaultValue={[photo()]} clearable />
      </div>
    </DensityPair>
  ),
};

function Demo(props: Partial<FileInputProps>) {
  const [files, setFiles] = useState<File[]>([]);
  const [rejections, setRejections] = useState<FileInputRejection[]>([]);
  return (
    <div className="max-w-sm">
      <FileInput
        label="添付ファイル"
        accept="image/*"
        maxSize={5 * 1000 * 1000}
        {...props}
        value={files}
        onValueChange={(next) => {
          setFiles(next);
          setRejections([]);
        }}
        onFilesRejected={setRejections}
        errorText={
          rejections.length > 0
            ? rejections.map((r) => `${r.file.name}: 受け付けられません`).join('、')
            : undefined
        }
      />
    </div>
  );
}

export const Behavior: Story = {
  name: '読み上げ・落とす・選ぶ・外す',
  parameters: { controls: { disable: true } },
  render: () => <Demo clearable multiple />,
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('添付ファイル') as HTMLInputElement;
    await expect(input).toHaveAttribute('type', 'file');
    await expect(canvas.getByText('選択されていません')).toBeVisible();

    // 落とす（受け付ける）
    const dt = new DataTransfer();
    dt.items.add(new File(['x'], 'photo.png', { type: 'image/png' }));
    dt.items.add(new File(['y'], 'cover.png', { type: 'image/png' }));
    dispatchDrag('drop', input, dt);
    await expect(await canvas.findByText('photo.png')).toBeVisible();
    await expect(canvas.getByText('ほか 1 件')).toBeVisible();
    await expect(input.files).toHaveLength(2);

    // 落とす（種類が違う）。値は変わらない
    const bad = new DataTransfer();
    bad.items.add(new File(['z'], 'note.txt', { type: 'text/plain' }));
    dispatchDrag('drop', input, bad);
    await waitFor(async () => expect(await canvas.findByText(/note\.txt/)).toBeVisible());
    await expect(input.files).toHaveLength(2);

    // 外す（×）。入力が空になり、文が戻る
    await userEvent.click(canvas.getByRole('button', { name: '選んだファイルを外す' }));
    await expect(await canvas.findByText('選択されていません')).toBeVisible();
    await expect(input.files).toHaveLength(0);
  },
};

export const NotDroppable: Story = {
  name: '落とせない欄',
  parameters: { controls: { disable: true } },
  render: () => <Demo droppable={false} />,
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('添付ファイル') as HTMLInputElement;
    const dt = new DataTransfer();
    dt.items.add(new File(['x'], 'photo.png', { type: 'image/png' }));
    dispatchDrag('drop', input, dt);
    await expect(canvas.getByText('選択されていません')).toBeVisible();
    await expect(input.files).toHaveLength(0);
  },
};

export const Below: Story = {
  name: '欄の下に Chip の列',
  parameters: { controls: { disable: true } },
  render: () => <Demo multiple multipleDisplay="below" />,
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('添付ファイル') as HTMLInputElement;
    const dt = new DataTransfer();
    dt.items.add(new File(['x'], 'a.png', { type: 'image/png' }));
    dt.items.add(new File(['y'], 'b.png', { type: 'image/png' }));
    dispatchDrag('drop', input, dt);
    await expect(await canvas.findByText('2 件のファイル')).toBeVisible();
    await userEvent.click(await canvas.findByRole('button', { name: 'a.png を外す' }));
    await waitFor(() => expect(input.files).toHaveLength(1));
    // 外した × は消えるので、残った Chip の × へフォーカスが移る
    await waitFor(() => expect(canvas.getByRole('button', { name: 'b.png を外す' })).toHaveFocus());
  },
};

export const InForm: Story = {
  name: 'フォームに送る',
  parameters: { controls: { disable: true } },
  render: () => (
    <Form>
      <div className="grid max-w-sm gap-3">
        <FileInput label="アイコン" name="icon" defaultValue={[photo()]} />
        <Button type="reset">戻す</Button>
      </div>
    </Form>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('アイコン') as HTMLInputElement;
    await expect(input).toHaveAttribute('name', 'icon');
    const data = new FormData(input.form!);
    await expect((data.get('icon') as File).name).toBe('photo.png');
  },
};
