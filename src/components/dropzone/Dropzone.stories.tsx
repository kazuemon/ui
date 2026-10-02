import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, userEvent, waitFor } from 'storybook/test';

import { Dropzone, DropzoneControl, type DropzoneProps, type DropzoneRejection } from './Dropzone';
import { Field, FieldCaption, FieldLabel, FieldMessages } from '../field/Field';
import { DropzoneFileList } from './DropzoneFileList';
import { DensityPair, Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { type MatrixColumn, statePseudo } from '../../stories/story-states';

type Sample = MatrixColumn & { props: Partial<DropzoneProps> };

const photo = () => new File(['dummy'], 'photo.png', { type: 'image/png' });

/**
 * DataTransfer を渡して、実際のドラッグ・ドロップと同じ DragEvent を起こす。
 * storybook/test の fireEvent は、渡した DataTransfer の中身（items・files）を
 * 素の new DataTransfer() へ own property だけコピーしようとするため、
 * items・files が prototype の getter であることと合わず、空になってしまう
 * （@testing-library/dom の既知の制約）。DragEvent を自分で作って dispatch すると、
 * 渡した DataTransfer がそのまま event.dataTransfer に入る
 */
function dispatchDrag(
  type: 'dragenter' | 'dragover' | 'dragleave' | 'drop',
  element: Element,
  dataTransfer: DataTransfer
) {
  element.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer }));
}

const stateRows: Sample[] = [
  { label: '通常', props: {} },
  { label: '値あり', props: { defaultValue: [photo()] } },
  { label: 'エラー', props: { errorText: '画像を選んでください' } },
  { label: '押せない', props: { defaultValue: [photo()], disabled: true } },
  { label: '読み取り専用', props: { defaultValue: [photo()], readOnly: true } },
];

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
];

const reasonText: Record<string, string> = {
  accept: '受け付けていない種類のファイルです',
  maxSize: '大きすぎます',
  maxFiles: '選べる数を超えています',
};

// 理由の文。custom は validateFile が返した文をそのまま出す
const rejectionText = (r: DropzoneRejection) =>
  `${r.file.name}: ${r.reason === 'custom' ? r.message : reasonText[r.reason]}`;

/** Playground・使い方の例。選んだファイルの一覧（DropzoneFileList）と組み合わせる、写して使える形 */
function DropzoneDemo(props: Partial<DropzoneProps>) {
  const [files, setFiles] = useState<File[]>([]);
  const [rejections, setRejections] = useState<DropzoneRejection[]>([]);
  return (
    <div className="flex max-w-sm flex-col gap-3">
      <Dropzone
        label="画像"
        caption="JPEG・PNG、1 つ 5MB まで"
        accept="image/png,image/jpeg"
        multiple
        maxSize={5 * 1000 * 1000}
        maxFiles={3}
        {...props}
        value={files}
        onValueChange={(next) => {
          setFiles(next);
          setRejections([]);
        }}
        onFilesRejected={setRejections}
        errorText={
          props.errorText ??
          (rejections.length > 0 ? rejections.map(rejectionText).join('、') : undefined)
        }
      />
      <DropzoneFileList
        files={files.map((file) => ({ file }))}
        onRemove={(file) => setFiles((current) => current.filter((f) => f !== file))}
      />
    </div>
  );
}

const meta = {
  title: 'Components/Dropzone',
  component: Dropzone,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'ファイルを落とす・押して選ぶ場所です。ラベル・キャプション・本体（Field）の3層で、TextField などと同じ並びです。',
          '',
          '- 押すか、フォーカスして Enter・Space で OS のファイル選択が開きます。ファイルを落としても選べます。',
          '- `accept`・`multiple` は `<input type="file">` と同じ意味です。`maxSize`（バイト）・`maxFiles` で、大きさと数の上限を決めます。',
          '- 独自の条件で弾くときは `validateFile` を渡し、受け付けないファイルに理由の文を返します。',
          '- 受け付けなかったファイルは、選ぶたびに `onFilesRejected` に理由（`accept`・`maxSize`・`maxFiles`・`custom`）とともに渡ります。`custom` のときは `validateFile` が返した文も `message` で渡ります。欄自体は選んだ分だけを `onValueChange` で受け取ります。',
          '- 選んだファイルの一覧は `DropzoneFileList` と組み合わせます（名前・大きさ・外すボタン。任意で `Progress` 用の進み具合）。アップロードそのものは行いません。',
          '- 押せない（`disabled`）・読み取り専用（`readOnly`）は、押せないときと同じ見た目になります。読み取り専用はフォーカスでき、フォームでは値が送られます。',
        ].join('\n'),
      },
    },
  },
  args: { label: '画像' },
} satisfies Meta<typeof Dropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  render: (args) => <DropzoneDemo {...args} />,
};

export const States: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({
      hover: '[data-slot="dropzone"]',
      focusVisible: '[data-slot="dropzone"] input',
    }),
  },
  render: () => (
    <Matrix
      rows={stateRows}
      rowLabel={(row) => row.label}
      columns={stateColumns}
      columnWidth="14rem"
      renderCell={(row) => <Dropzone label="画像" {...row.props} />}
    />
  ),
};

export const Drag: Story = {
  tags: ['visual'],
  name: 'ファイルを持ってきた',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery>
      <Specimen label="受け付ける">
        <Dropzone label="受け付ける対象" accept="image/*" />
      </Specimen>
      <Specimen label="受け付けない">
        <Dropzone label="受け付けない対象" accept="image/*" />
      </Specimen>
    </Gallery>
  ),
  // dragenter だけ起こし、そのまま（drop も dragleave もしない）にした姿を撮る
  play: async ({ canvas }) => {
    const acceptInput = canvas.getByLabelText('受け付ける対象');
    const acceptTransfer = new DataTransfer();
    acceptTransfer.items.add(new File(['dummy'], 'photo.png', { type: 'image/png' }));
    dispatchDrag('dragenter', acceptInput, acceptTransfer);

    const rejectInput = canvas.getByLabelText('受け付けない対象');
    const rejectTransfer = new DataTransfer();
    rejectTransfer.items.add(new File(['dummy'], 'note.txt', { type: 'text/plain' }));
    dispatchDrag('dragenter', rejectInput, rejectTransfer);

    // dispatchEvent は React の状態の更新をすぐには描き直さないので、反映を待つ
    await waitFor(() =>
      expect(acceptInput.closest('[data-slot="dropzone"]')).toHaveAttribute('data-drag', 'accept')
    );
    await waitFor(() =>
      expect(rejectInput.closest('[data-slot="dropzone"]')).toHaveAttribute('data-drag', 'reject')
    );
  },
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  render: () => (
    <DensityPair>
      <div className="w-72">
        <Dropzone label="画像" />
      </div>
    </DensityPair>
  ),
};

// dragenter・dragleave の数え方の落とし穴（子要素をまたぐたびに発火する）は、input が箱いっぱいを覆い
// 子要素を持たないことで避けている。drop で実際に受け付けた・弾いたことを確かめる
export const Behavior: Story = {
  name: '読み上げ・落とす・選ぶ',
  parameters: { controls: { disable: true } },
  render: () => <DropzoneDemo />,
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('画像') as HTMLInputElement;
    await expect(input).toHaveAttribute('type', 'file');
    await expect(input).toHaveAttribute('multiple');

    // 受け付ける（accept・大きさ・数のどれにも当たらない）
    const okTransfer = new DataTransfer();
    const ok = new File(['x'.repeat(10)], 'photo.png', { type: 'image/png' });
    okTransfer.items.add(ok);
    dispatchDrag('drop', input, okTransfer);
    // dispatchEvent は React の状態の更新をすぐには描き直さないので、findByText で反映を待つ
    await expect(await canvas.findByText('photo.png')).toBeVisible();
    // Form で送るときの値。DataTransfer で input.files に入れているので、受け付けた分が読める
    await expect(input.files).toHaveLength(1);
    await expect(input.files?.[0].name).toBe('photo.png');

    // 受け付けない（accept に当たらない種類）。エラーの行は開く動きがあるので、開き終わるまで待つ
    const wrongTypeTransfer = new DataTransfer();
    wrongTypeTransfer.items.add(new File(['x'], 'note.txt', { type: 'text/plain' }));
    dispatchDrag('drop', input, wrongTypeTransfer);
    await waitFor(async () =>
      expect(await canvas.findByText(/note\.txt: 受け付けていない種類のファイルです/)).toBeVisible()
    );
    // 弾いたファイルは値に加わらない
    await expect(input.files).toHaveLength(1);

    // 受け付けない（大きすぎる）
    const bigTransfer = new DataTransfer();
    const big = new File(['x'.repeat(6 * 1000 * 1000)], 'big.png', { type: 'image/png' });
    bigTransfer.items.add(big);
    dispatchDrag('drop', input, bigTransfer);
    await waitFor(async () =>
      expect(await canvas.findByText(/big\.png: 大きすぎます/)).toBeVisible()
    );
    await expect(input.files).toHaveLength(1);
  },
};

export const Rejected: Story = {
  name: '受け付けない数（maxFiles）',
  parameters: { controls: { disable: true } },
  render: () => <DropzoneDemo maxFiles={1} multiple accept={undefined} />,
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('画像') as HTMLInputElement;
    const first = new DataTransfer();
    first.items.add(new File(['a'], 'a.txt', { type: 'text/plain' }));
    dispatchDrag('drop', input, first);
    await expect(await canvas.findByText('a.txt')).toBeVisible();

    const second = new DataTransfer();
    second.items.add(new File(['b'], 'b.txt', { type: 'text/plain' }));
    dispatchDrag('drop', input, second);
    await waitFor(async () =>
      expect(await canvas.findByText(/b\.txt: 選べる数を超えています/)).toBeVisible()
    );
    await expect(canvas.queryByText('b.txt')).not.toBeInTheDocument();
  },
};

export const SingleRejectsExtra: Story = {
  name: '1 つしか選べない欄に 2 つ落とす',
  parameters: { controls: { disable: true } },
  render: () => <DropzoneDemo multiple={false} maxFiles={undefined} accept={undefined} />,
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('画像') as HTMLInputElement;
    const dt = new DataTransfer();
    dt.items.add(new File(['a'], 'a.txt', { type: 'text/plain' }));
    dt.items.add(new File(['b'], 'b.txt', { type: 'text/plain' }));
    dispatchDrag('drop', input, dt);
    // 先頭だけを受け付け、2 つ目は数の上限の理由で知らせる
    await expect(await canvas.findByText('a.txt')).toBeVisible();
    await waitFor(async () =>
      expect(await canvas.findByText(/b\.txt: 選べる数を超えています/)).toBeVisible()
    );
    await waitFor(() => expect(input.files).toHaveLength(1));
  },
};

export const ControlledIgnored: Story = {
  name: '親が値を採らなければ送らない',
  parameters: { controls: { disable: true } },
  // value を固定し、onValueChange を受けても値を変えない（制御モードで親が提案を採らない）
  render: () => <Dropzone label="画像" multiple value={[]} onValueChange={() => {}} />,
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('画像') as HTMLInputElement;
    const dt = new DataTransfer();
    dt.items.add(new File(['a'], 'a.txt', { type: 'text/plain' }));
    dispatchDrag('drop', input, dt);
    await waitFor(() => expect(input.files).toHaveLength(0));
  },
};

export const RemoveFromValue: Story = {
  name: '一覧で外したファイルは送らない',
  parameters: { controls: { disable: true } },
  render: () => <DropzoneDemo accept={undefined} />,
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('画像') as HTMLInputElement;
    const dt = new DataTransfer();
    dt.items.add(new File(['a'], 'a.txt', { type: 'text/plain' }));
    dt.items.add(new File(['b'], 'b.txt', { type: 'text/plain' }));
    dispatchDrag('drop', input, dt);
    await waitFor(() => expect(input.files).toHaveLength(2));

    // 親の値から外すと、Form に送る input.files からも外れる
    await userEvent.click(canvas.getByRole('button', { name: '外す: a.txt' }));
    await waitFor(() => expect(input.files).toHaveLength(1));
    await expect(input.files?.[0]?.name).toBe('b.txt');
  },
};

export const Disabled: Story = {
  name: '押せない・読み取り専用は変わらない',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex max-w-sm flex-col gap-6">
      <Dropzone label="押せない" disabled defaultValue={[photo()]} />
      <Dropzone label="読み取り専用" readOnly defaultValue={[photo()]} />
    </div>
  ),
  play: async ({ canvas }) => {
    const disabledInput = canvas.getByLabelText('押せない') as HTMLInputElement;
    const readOnlyInput = canvas.getByLabelText('読み取り専用') as HTMLInputElement;
    await expect(disabledInput).toBeDisabled();
    await expect(readOnlyInput).not.toBeDisabled();
    await expect(readOnlyInput).toHaveAttribute('aria-readonly', 'true');

    // 落としても変わらない
    const dt = new DataTransfer();
    dt.items.add(new File(['x'], 'new.png', { type: 'image/png' }));
    dispatchDrag('drop', readOnlyInput, dt);
    await expect(canvas.queryByText('new.png')).not.toBeInTheDocument();

    // 読み取り専用でもフォーカスできる（Tab で止まる）
    await userEvent.tab();
    // 何にフォーカスが乗るかは前後のストーリー枠に依存するため、ここでは投げないことだけを確かめる
  },
};

export const LabelStart: Story = {
  name: 'ラベルを左に置く',
  parameters: {
    docs: {
      description: {
        story: '`labelPlacement="start"` で、見出しを本体の左に置きます。',
      },
    },
  },
  render: () => <Dropzone label="画像" labelPlacement="start" accept="image/*" />,
};

export const Composed: Story = {
  name: '組み立てる',
  parameters: {
    docs: {
      description: {
        story:
          '並べ方を変えたいときは、`Field` の中に `FieldLabel`・`DropzoneControl`・`FieldCaption`・`FieldMessages` を置きます。見出し・キャプション・状態の文・`disabled`・`required`・`name` は `Field` に渡し、受け付けるファイルの条件と値は `DropzoneControl` に渡します。',
      },
    },
  },
  render: () => (
    <Field label="画像" caption="プロフィールに出ます" name="avatar" required>
      <FieldLabel />
      <DropzoneControl accept="image/*" />
      <FieldCaption />
      <FieldMessages />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    await expect(input).toHaveAccessibleName('画像');
    await expect(input).toHaveAccessibleDescription('プロフィールに出ます');
    await expect(input).toHaveAttribute('name', 'avatar');
    await expect(input).toHaveAttribute('aria-required', 'true');
  },
};

export const ValidateFile: Story = {
  name: '独自の条件で弾く（validateFile）',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "`validateFile` は、種類と大きさを通ったファイルを 1 つずつ受け取り、受け付けないときは理由の文を返します。弾いたファイルは `onFilesRejected` に `reason: 'custom'` と、返した文（`message`）で渡ります。",
      },
    },
  },
  render: () => (
    <DropzoneDemo
      accept={undefined}
      validateFile={(file) =>
        file.name.includes(' ') ? '名前に空白のあるファイルは選べません' : null
      }
    />
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('画像') as HTMLInputElement;
    const dt = new DataTransfer();
    dt.items.add(new File(['a'], 'my photo.png', { type: 'image/png' }));
    dt.items.add(new File(['b'], 'photo.png', { type: 'image/png' }));
    dispatchDrag('drop', input, dt);
    // 通ったファイルだけを受け付け、弾いたファイルは返した文で知らせる
    await expect(await canvas.findByText('photo.png')).toBeVisible();
    await waitFor(async () =>
      expect(
        await canvas.findByText(/my photo\.png: 名前に空白のあるファイルは選べません/)
      ).toBeVisible()
    );
    await waitFor(() => expect(input.files).toHaveLength(1));
  },
};
