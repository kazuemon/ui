import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent } from 'storybook/test';

import { DropzoneFileList, type DropzoneFileEntry } from './DropzoneFileList';
import { Gallery, Specimen } from '../../stories/story-parts';

// 1x1 の透明 PNG。thumbnail のタイルで実際に画像として描けるようにする（見せかけの中身だと壊れた画像になる）
const TRANSPARENT_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

function pngBytes(): ArrayBuffer {
  const binary = atob(TRANSPARENT_PNG_BASE64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer as ArrayBuffer;
}

function makeFile(name: string, size: number, type = 'image/png') {
  if (type.startsWith('image/')) return new File([pngBytes()], name, { type });
  // 画像でないファイルは、大きさの表示を確かめられるよう、指定した大きさのまま作る
  return new File([new ArrayBuffer(size)], name, { type });
}

const sample: DropzoneFileEntry[] = [
  { file: makeFile('kazuemon-icon.png', 42_000) },
  { file: makeFile('portfolio.pdf', 1_240_000, 'application/pdf') },
];

const withProgress: DropzoneFileEntry[] = [
  { file: makeFile('kazuemon-icon.png', 42_000), progress: 100 },
  { file: makeFile('portfolio.pdf', 1_240_000, 'application/pdf'), progress: 42 },
];

const withError: DropzoneFileEntry[] = [
  { file: makeFile('kazuemon-icon.png', 42_000) },
  {
    file: makeFile('too-big.zip', 9_000_000, 'application/zip'),
    errorText: '大きすぎます',
  },
];

const meta = {
  title: 'Components/DropzoneFileList',
  component: DropzoneFileList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'Dropzone で選んだファイルの一覧です。名前・大きさと外すボタンを見せます（アップロードそのものは行いません）。',
          '',
          '- `variant`（既定 `list`）: `list` は1行ずつ、`thumbnail` は画像を正方形のタイルに並べます。画像でないファイルはアイコンになります。',
          '- `files` の各項目に `progress`（0〜100）を渡すと、既存の `Progress` で進み具合を出します。アップロードの実行と値の更新は使う側が行います。',
          '- `errorText` を渡すと、その項目だけ赤い枠・赤い文字になります。',
          '- `onRemove` を渡さないと、外すボタンは出ません。',
        ].join('\n'),
      },
    },
  },
  args: { files: sample },
} satisfies Meta<typeof DropzoneFileList>;

export default meta;
type Story = StoryObj<typeof meta>;

function RemovableDemo({ variant }: { variant: 'list' | 'thumbnail' }) {
  const [files, setFiles] = useState(sample);
  return (
    <div className="max-w-sm">
      <DropzoneFileList
        files={files}
        variant={variant}
        onRemove={(file) => setFiles((current) => current.filter((entry) => entry.file !== file))}
      />
    </div>
  );
}

export const Playground: Story = {
  name: '基本',
  render: () => <RemovableDemo variant="list" />,
};

export const Variants: Story = {
  tags: ['visual'],
  name: '見せ方（list・thumbnail）',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="20rem">
      <Specimen label="list（既定）">
        <DropzoneFileList files={sample} onRemove={() => {}} />
      </Specimen>
      <Specimen label="thumbnail">
        <DropzoneFileList files={sample} variant="thumbnail" onRemove={() => {}} />
      </Specimen>
    </Gallery>
  ),
};

export const Progress: Story = {
  tags: ['visual'],
  name: '進み具合・失敗',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="20rem">
      <Specimen label="進み具合（list）">
        <DropzoneFileList files={withProgress} variant="list" />
      </Specimen>
      <Specimen label="進み具合（thumbnail）">
        <DropzoneFileList files={withProgress} variant="thumbnail" />
      </Specimen>
      <Specimen label="失敗（list）">
        <DropzoneFileList files={withError} variant="list" onRemove={() => {}} />
      </Specimen>
    </Gallery>
  ),
};

export const Remove: Story = {
  name: '外す',
  parameters: { controls: { disable: true } },
  render: () => <RemovableDemo variant="list" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText('kazuemon-icon.png')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '外す: kazuemon-icon.png' }));
    await expect(canvas.queryByText('kazuemon-icon.png')).not.toBeInTheDocument();
    await expect(canvas.getByText('portfolio.pdf')).toBeVisible();
  },
};
