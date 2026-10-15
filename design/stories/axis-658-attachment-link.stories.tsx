import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Attachment } from '../../src/components/attachment/Attachment';
import { savedPhotoUrl } from '../../src/components/attachment/attachment-story-fixtures';
import { AttachmentList } from '../../src/components/attachment/AttachmentList';
import { statePseudo } from '../../src/stories/story-states';

// 軸 658: 送ったあとのファイルを開くとき、どこを押すか。「通常」と「外せる」の列は実際に押せる（新しいタブで開く）
const meta = {
  title: 'Design Review/658 送ったファイルの開き方',
  id: 'design-review-658-attachment-link',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({ hover: 'a', focusVisible: 'a' }),
  },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '名前だけがリンク',
    intent:
      '名前の文字に下線を引き、そこだけを押せるようにする（DropzoneFileList の保存済みのファイルと同じ）。押せる範囲は狭いが、下線でリンクだと分かる。札のほかの場所は押しても何も起きない',
    spec: [
      ['linkArea', 'name'],
      ['印', '名前の淡い下線。載せると濃く'],
      ['押せる範囲', '名前の文字の行'],
    ],
  },
];

const columns: Column[] = [
  { label: '通常', note: '押すと新しいタブで開く' },
  { label: 'hover', preview: 'hover' },
  { label: 'フォーカス（キーボード）', preview: 'focus' },
  { label: '外せる', note: '送ったあとに編集しているとき' },
];

export const Candidates: Story = {
  name: '開き方',
  render: ({ pick }) => (
    <Comparison
      index={658}
      axis="送ったファイルの開き方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        const removable = column.label === '外せる';
        return (
          <div className="flex w-[264px] flex-col gap-2 rounded-card bg-primary-subtle p-3">
            <AttachmentList aria-label="添えたファイル">
              <Attachment
                name="portfolio.pdf"
                size={1_240_000}
                url="https://example.com/portfolio.pdf"
                onRemove={removable ? () => {} : undefined}
              />
              {column.preview ? null : (
                <Attachment
                  name="cover.svg"
                  size={38_000}
                  url={savedPhotoUrl}
                  type="image/svg+xml"
                  onRemove={removable ? () => {} : undefined}
                />
              )}
            </AttachmentList>
            <p className="text-on-primary-subtle">資料を送ります</p>
          </div>
        );
      }}
    >
      <p>
        決定:
        現行版（名前だけがリンク）にする。札にほかの操作を足したい場面もありうるため。札全体をリンクにする形（A）は持たない。A
        は部品から外したので、比べた行は決めた時点のコミット 84b0e6c3 で開ける。
      </p>
      <p>
        送ったあとのファイル（吹き出しの中）を開くとき、どこを押せるようにするかを決めます。どちらも新しいタブで開きます。
      </p>
      <p>
        おすすめは A（札全体）を既定にし、現行版（名前だけ）も選べる形です。札は 1
        つのファイルを表す小さな面で、どこを押しても開くほうが指で押しやすく、Slack
        などのチャットの添付とも同じ感覚です。札の線で押せる範囲が見えるので、見えない広がりにはなりません。DropzoneFileList
        のような一覧の行では、名前だけのリンクのままにします。
      </p>
      <p>「X を既定にして、Y も選べる」の形で教えてください。</p>
    </Comparison>
  ),
};
