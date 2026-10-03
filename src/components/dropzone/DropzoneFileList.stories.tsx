import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';

import { DropzoneFileList, type DropzoneFileEntry } from './DropzoneFileList';
import { Link } from '../link/Link';
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

// 保存済みのファイル（サーバーにあるもの）と、いま選んだものを並べる
const savedPhoto = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#cfeafc"/><circle cx="84" cy="36" r="14" fill="#fff4cc"/><path d="M0 90 L40 56 L70 84 L120 60 L120 120 L0 120Z" fill="#2f6b58"/></svg>')}`;
const withSaved: DropzoneFileEntry[] = [
  { name: 'cover.svg', size: 38_000, url: savedPhoto, type: 'image/svg+xml', caption: '保存済み' },
  { name: 'resume.pdf', size: 820_000, url: '#resume.pdf', caption: '9月30日に保存' },
  { file: makeFile('kazuemon-icon.png', 42_000), progress: 60 },
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
          '- `onRemove` を渡さないと、外すボタンは出ません。押した項目とその位置を受け取ります。',
          '- 保存済みのファイル（サーバーにあるもの）は、`file` を書かずに `name`・`size`・`url` で渡します。`url` があれば、名前が新しいタブで開く下線のリンクになります。`thumbnail` では `url` を画像として出します（画像かどうかは `type` か、`url` の拡張子で決めます）。外すボタンの読み上げは「削除: {ファイル名}」です。',
          '- 項目の `caption` に、名前に添える文（「保存済み」、保存した日時など）を渡せます。`list` では大きさの後ろに、`thumbnail` では左上の札に出ます。部品は文を自動では付けません。',
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
        onRemove={(removed) => setFiles((current) => current.filter((entry) => entry !== removed))}
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

export const Saved: Story = {
  name: '保存済みのファイル',
  tags: ['visual'],
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="20rem">
      <Specimen label="list">
        <DropzoneFileList files={withSaved} onRemove={() => {}} />
      </Specimen>
      <Specimen label="thumbnail">
        <DropzoneFileList files={withSaved} variant="thumbnail" onRemove={() => {}} />
      </Specimen>
    </Gallery>
  ),
  play: async ({ canvas }) => {
    const [link] = canvas.getAllByRole('link', { name: /resume\.pdf/ });
    await expect(link).toHaveAttribute('href', '#resume.pdf');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(canvas.getAllByRole('button', { name: '削除: cover.svg' })).toHaveLength(2);
    await expect(canvas.getAllByRole('button', { name: '外す: kazuemon-icon.png' })).toHaveLength(
      2
    );
    await expect(canvas.getAllByText('9月30日に保存', { exact: false })).toHaveLength(2);
    // いま選んだものはリンクにしない
    await expect(
      canvas.queryByRole('link', { name: /kazuemon-icon\.png/ })
    ).not.toBeInTheDocument();
  },
};

export const SavedBroken: Story = {
  name: '保存済みの画像が読めないとき',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="max-w-sm">
      <DropzoneFileList
        variant="thumbnail"
        files={[{ name: 'missing.png', size: 12_000, url: 'data:image/png;base64,AAAA' }]}
        onRemove={() => {}}
      />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    // 読めなかった画像は、画像でないファイルと同じアイコンのタイルに替わる。名前と外すボタンは残る
    await waitFor(() => expect(canvasElement.querySelector('img')).toBeNull());
    await expect(canvasElement.querySelector('li svg')).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: /missing\.png/ })).toBeVisible();
    await expect(canvas.getByRole('button', { name: '削除: missing.png' })).toBeInTheDocument();
  },
};

export const CaptionLink: Story = {
  name: '添える文の中のリンク',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="max-w-sm">
      <DropzoneFileList
        variant="thumbnail"
        files={[
          {
            name: 'cover.svg',
            url: savedPhoto,
            type: 'image/svg+xml',
            caption: <Link href="#history">履歴</Link>,
          },
        ]}
      />
    </div>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: '履歴' });
    await userEvent.tab();
    await expect(link).toHaveFocus();
    // 札の中のリンクのフォーカスの線が、文を切る枠の内側に収まる
    const style = getComputedStyle(link);
    const ring = parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
    const box = link.parentElement!.getBoundingClientRect();
    const rect = link.getBoundingClientRect();
    await expect(rect.top - ring).toBeGreaterThanOrEqual(box.top - 0.5);
    await expect(rect.bottom + ring).toBeLessThanOrEqual(box.bottom + 0.5);
    await expect(rect.left - ring).toBeGreaterThanOrEqual(box.left - 0.5);
    await expect(rect.right + ring).toBeLessThanOrEqual(box.right + 0.5);
  },
};
