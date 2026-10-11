import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  Attachment,
  type AttachmentImageDisplay,
} from '../../src/components/attachment/Attachment';
import {
  docFile,
  fakeProps,
  photoFile,
  sampleItems,
  savedPhotoUrl,
  useFakeUpload,
} from '../../src/components/attachment/attachment-story-fixtures';
import { AttachmentList } from '../../src/components/attachment/AttachmentList';
import { Button } from '../../src/components/button/Button';

// 軸 656: 画像を添えたときの形。「触って試す」の列は、送るボタンで実際に進む
const meta = {
  title: 'Design Review/656 添えた画像の形',
  id: 'design-review-656-attachment-image',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const displayOf: Record<string, AttachmentImageDisplay> = {
  現行版: 'thumbnail',
  A: 'tile',
  B: 'tile',
  C: 'icon',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '札のまま、左の四角に縮小画像',
    intent:
      'ほかのファイルと同じ札で、左の四角（40px）だけを縮小画像にする。名前と大きさが読め、並びの高さと形がそろう。画像の中身は小さくしか見えない',
    spec: [
      ['imageDisplay', 'thumbnail'],
      ['四角', '40px・同心の角'],
    ],
  },
  {
    id: 'A',
    name: '画像だけの正方形（札と同じ高さ）',
    intent:
      '画像は名前を出さず、札と同じ高さ（54px）の正方形にする。並びの高さはそろい、横に多く並ぶ。名前は読み上げにだけ出す。外すボタンは右上の小さな塗りの丸。失敗したときは札に戻る',
    spec: [
      ['imageDisplay', 'tile'],
      ['--attachment-tile-size', '54px（札の高さ）'],
      ['外す', '右上・24px の塗りの丸'],
    ],
    tokens: {},
  },
  {
    id: 'B',
    name: '画像だけの大きな正方形',
    intent: 'A を 80px にして、画像の中身を見て選び直せるようにする。札と並ぶと高さがそろわない',
    spec: [
      ['imageDisplay', 'tile'],
      ['--attachment-tile-size', '80px'],
      ['外す', '右上・24px の塗りの丸'],
    ],
    tokens: { '--attachment-tile-size': 'calc(var(--spacing) * 20)' },
  },
  {
    id: 'C',
    name: '縮小画像を出さない',
    intent:
      '画像もほかのファイルと同じファイルのアイコンにする。いちばん軽いが、どの画像かは名前でしか分からない',
    spec: [['imageDisplay', 'icon']],
  },
];

const columns: Column[] = [
  { label: '送る前', note: '画像 2 つと PDF' },
  { label: '送ったあと', note: '自分の吹き出しの中（押すと開く）' },
  { label: '触って試す', note: '送る → 進む → 送ったあと。ZIP は一度失敗する' },
];

function Try({ display }: { display: AttachmentImageDisplay }) {
  const { items, send, retry, remove, reset } = useFakeUpload(sampleItems);
  return (
    <div className="flex w-[440px] max-w-full flex-col gap-3">
      <div className="rounded-control bg-field p-3">
        <AttachmentList aria-label="添えたファイル">
          {items.map((item) => (
            <Attachment
              key={item.id}
              {...fakeProps(item)}
              imageDisplay={display}
              onRemove={item.status === 'sent' ? undefined : () => remove(item.id)}
              onRetry={() => retry(item.id)}
            />
          ))}
        </AttachmentList>
      </div>
      <div className="flex gap-2">
        <Button size="sm" color="primary" onClick={send}>
          送る
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>
          はじめから
        </Button>
      </div>
    </div>
  );
}

export const Candidates: Story = {
  name: '画像の形',
  render: ({ pick }) => (
    <Comparison
      index={656}
      axis="添えた画像の形"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const display = displayOf[candidate.id];
        if (column.label === '触って試す') return <Try display={display} />;
        if (column.label === '送ったあと') {
          return (
            <div className="flex w-[300px] flex-col gap-2 rounded-card bg-primary-subtle p-3">
              <AttachmentList aria-label="添えたファイル">
                <Attachment
                  name="cover.svg"
                  size={38_000}
                  url={savedPhotoUrl}
                  type="image/svg+xml"
                  imageDisplay={display}
                />
                <Attachment
                  name="portfolio.pdf"
                  size={1_240_000}
                  url="#portfolio.pdf"
                  imageDisplay={display}
                />
              </AttachmentList>
              <p className="text-on-primary-subtle">写真と資料です</p>
            </div>
          );
        }
        return (
          <div className="w-[300px] rounded-control bg-field p-3">
            <AttachmentList aria-label="添えたファイル">
              <Attachment
                file={photoFile()}
                size={38_000}
                imageDisplay={display}
                onRemove={() => {}}
              />
              <Attachment
                file={photoFile('menu.svg')}
                size={52_000}
                progress={60}
                imageDisplay={display}
                onRemove={() => {}}
              />
              <Attachment
                file={docFile()}
                size={1_240_000}
                imageDisplay={display}
                onRemove={() => {}}
              />
            </AttachmentList>
          </div>
        );
      }}
    >
      <p>
        画像を添えたときの形を決めます。画像でないファイルは、どの案も同じ札です。送っている途中の画像の正方形は、下端に線を引きます。
      </p>
      <p>
        おすすめは現行版（札のまま縮小画像）です。名前と大きさが読め、画像とほかのファイルが混ざっても並びがそろいます。画像が多い場面（写真を送るチャット）では
        A（札と同じ高さの正方形）を選べるようにするのがよいと考えています。B
        は中身がよく見えますが、札と高さがそろいません。
      </p>
      <p>「X を既定にして、Y も選べる」の形で教えてください。</p>
    </Comparison>
  ),
};
