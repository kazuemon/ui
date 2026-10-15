import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { Attachment } from './Attachment';
import {
  docFile,
  fakeProps,
  photoFile,
  sampleItems,
  savedPhotoUrl,
  useFakeUpload,
} from './attachment-story-fixtures';
import { AttachmentList } from './AttachmentList';
import { Button } from '../button/Button';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';
import { statePseudo } from '../../stories/story-states';

const meta = {
  title: 'Components/Attachment',
  component: Attachment,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '添えたファイルの小さい札です。チャットの入力欄や吹き出しの中に、AttachmentList で横に並べます。送ることそのものは行わず、渡された値から状態を出します。',
          '',
          '- 送る前: `file` だけを渡します。名前と大きさを出し、`onRemove` を渡すと外すボタンが出ます。',
          '- 送っている途中: `progress`（0〜100。終わりが分からないときは `null`）を渡します。出し方は `progressIndicator`（`bar` が既定。`ring`・`edge`）で選びます。',
          '- 失敗: `errorText` を渡します。大きさの代わりに文が出て、`onRetry` を渡すともう一度送るボタンが出ます。',
          '- 送ったあと: `file` を外して `url` を渡します。名前が新しいタブで開くリンクになります（画像だけの正方形では、画像がリンクです）。',
          '- 画像も、既定ではほかのファイルと同じアイコンです（`imageDisplay="icon"`）。縮小画像を見せたいときは、左の四角に縮小画像（`thumbnail`）か、画像だけの正方形（`tile`）を選びます。正方形の大きさは `--attachment-tile-size` で変えられます。',
          '- 一覧の行として並べるときは DropzoneFileList を使います。',
        ].join('\n'),
      },
    },
  },
  args: {
    name: 'portfolio.pdf',
    size: 1_240_000,
    progressIndicator: 'bar',
    imageDisplay: 'icon',
    onRemove: fn(),
  },
  argTypes: {
    progress: { control: { type: 'range', min: 0, max: 100 } },
    errorText: { control: 'text' },
    progressIndicator: {
      control: 'inline-radio',
      options: ['bar', 'ring', 'edge'],
      table: { defaultValue: { summary: "'bar'" } },
    },
    imageDisplay: {
      control: 'inline-radio',
      options: ['icon', 'thumbnail', 'tile'],
      table: { defaultValue: { summary: "'icon'" } },
    },
  },
} satisfies Meta<typeof Attachment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

// 状態の一覧（画像と画像でないファイル）
export const States: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({ focusVisible: 'button' }),
  },
  render: () => (
    <Gallery columnWidth="16rem">
      <Specimen label="送る前">
        <Attachment file={docFile()} size={1_240_000} onRemove={() => {}} />
        <Attachment file={photoFile()} size={38_000} onRemove={() => {}} />
      </Specimen>
      <Specimen label="送っている途中">
        <Attachment file={docFile()} size={1_240_000} progress={42} onRemove={() => {}} />
        <Attachment file={photoFile()} size={38_000} progress={null} onRemove={() => {}} />
      </Specimen>
      <Specimen label="失敗">
        <Attachment
          file={docFile('2026-summer-trip-photos-all.zip', 'application/zip')}
          size={48_200_000}
          errorText="大きすぎます（上限 25 MB）"
          onRetry={() => {}}
          onRemove={() => {}}
        />
      </Specimen>
      <Specimen label="送ったあと（外せない）">
        <Attachment name="portfolio.pdf" size={1_240_000} url="#portfolio.pdf" />
        <Attachment name="cover.svg" size={38_000} url={savedPhotoUrl} type="image/svg+xml" />
      </Specimen>
      <Specimen label="画像の出し方（thumbnail・tile）">
        <Attachment file={photoFile()} size={38_000} imageDisplay="thumbnail" onRemove={() => {}} />
        <div className="flex gap-2">
          <Attachment file={photoFile()} size={38_000} imageDisplay="tile" onRemove={() => {}} />
          <Attachment
            file={photoFile()}
            size={38_000}
            imageDisplay="tile"
            progress={60}
            onRemove={() => {}}
          />
        </div>
      </Specimen>
      <Specimen label="外すボタンのフォーカス（キーボード）">
        <div data-preview="focus">
          <Attachment file={docFile()} size={1_240_000} onRemove={() => {}} />
        </div>
      </Specimen>
    </Gallery>
  ),
};

// 置く地: ページ・入力欄のグレー・吹き出し
export const Grounds: Story = {
  tags: ['visual'],
  name: '置く地',
  parameters: { controls: { disable: true } },
  render: () => {
    const row = (
      <AttachmentList aria-label="添えたファイル">
        <Attachment file={photoFile()} size={38_000} onRemove={() => {}} />
        <Attachment file={docFile()} size={1_240_000} progress={60} onRemove={() => {}} />
      </AttachmentList>
    );
    return (
      <div className="flex max-w-xl flex-col gap-6">
        <Specimen label="ページの上">{row}</Specimen>
        <Specimen label="入力欄（Composer）の中">
          <div className="flex flex-col gap-3 rounded-control bg-field p-3">
            {row}
            <p className="text-fg-subtle">メッセージを入力</p>
          </div>
        </Specimen>
        <Specimen label="自分の吹き出しの中（送ったあと）">
          <div className="ms-auto flex max-w-sm flex-col gap-2 rounded-card bg-primary-subtle p-3">
            <AttachmentList aria-label="添えたファイル">
              <Attachment name="portfolio.pdf" size={1_240_000} url="#portfolio.pdf" />
            </AttachmentList>
            <p className="text-on-primary-subtle">資料を送ります</p>
          </div>
        </Specimen>
      </div>
    );
  },
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { controls: { disable: true } },
  render: () => (
    <DensityPair>
      <AttachmentList aria-label="添えたファイル">
        <Attachment file={photoFile()} size={38_000} onRemove={() => {}} />
        <Attachment file={docFile()} size={1_240_000} progress={42} onRemove={() => {}} />
      </AttachmentList>
    </DensityPair>
  ),
};

// 狭い幅での並び: 折り返す（既定）と、横にスクロールする
export const ListWrap: Story = {
  tags: ['visual'],
  name: '並べ方',
  parameters: { controls: { disable: true } },
  render: () => {
    const items = (
      <>
        <Attachment file={photoFile()} size={38_000} onRemove={() => {}} />
        <Attachment file={docFile()} size={1_240_000} onRemove={() => {}} />
        <Attachment file={docFile('notes.txt', 'text/plain')} size={2_400} onRemove={() => {}} />
      </>
    );
    return (
      <div className="flex w-[343px] max-w-full flex-col gap-6">
        <Specimen label="折り返す（wrap、既定）">
          <AttachmentList aria-label="添えたファイル">{items}</AttachmentList>
        </Specimen>
        <Specimen label="横にスクロールする（wrap={false}）">
          <AttachmentList aria-label="添えたファイル" wrap={false}>
            {items}
          </AttachmentList>
        </Specimen>
      </div>
    );
  },
};

// 送る動きを触って確かめる（撮らない）
export const Sending: Story = {
  name: '送る動き',
  parameters: { controls: { disable: true } },
  render: () => <SendingDemo />,
};

function SendingDemo() {
  const { items, send, retry, remove, reset } = useFakeUpload(sampleItems);
  return (
    <div className="flex max-w-xl flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-control bg-field p-3">
        <AttachmentList aria-label="添えたファイル">
          {items.map((item) => (
            <Attachment
              key={item.id}
              {...fakeProps(item)}
              onRemove={item.status === 'sent' ? undefined : () => remove(item.id)}
              onRetry={() => retry(item.id)}
            />
          ))}
        </AttachmentList>
      </div>
      <div className="flex gap-2">
        <Button color="primary" onClick={send}>
          送る
        </Button>
        <Button variant="outline" onClick={reset}>
          はじめから
        </Button>
      </div>
    </div>
  );
}

export const Accessibility: Story = {
  name: '読み上げ',
  parameters: { controls: { disable: true } },
  args: { onRemove: fn(), onRetry: fn() },
  render: (args) => (
    <AttachmentList aria-label="添えたファイル">
      <Attachment file={docFile()} size={1_240_000} progress={42} onRemove={args.onRemove} />
      <Attachment
        file={docFile('big.zip', 'application/zip')}
        size={48_200_000}
        errorText="送れませんでした"
        onRetry={args.onRetry}
        onRemove={args.onRemove}
      />
      <Attachment name="resume.pdf" size={820_000} url="#resume.pdf" />
      <Attachment
        name="cover.svg"
        size={38_000}
        url={savedPhotoUrl}
        type="image/svg+xml"
        imageDisplay="tile"
      />
    </AttachmentList>
  ),
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('list', { name: '添えたファイル' })).toBeVisible();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4);
    await expect(
      canvas.getByRole('progressbar', { name: 'portfolio.pdf の進み具合' })
    ).toHaveAttribute('aria-valuenow', '42');
    await userEvent.click(canvas.getByRole('button', { name: '外す: portfolio.pdf' }));
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: 'もう一度送る: big.zip' }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
    await expect(canvas.getByText('送れませんでした')).toBeVisible();
    // 送ったあとは新しいタブで開くリンク。画像だけの正方形のリンクも、名前で読まれる
    await expect(canvas.getByRole('link', { name: /resume\.pdf/ })).toHaveAttribute(
      'target',
      '_blank'
    );
    await expect(canvas.getByRole('link', { name: /cover\.svg/ })).toHaveAttribute(
      'target',
      '_blank'
    );
  },
};
