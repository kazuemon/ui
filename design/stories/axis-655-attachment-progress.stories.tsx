import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  Attachment,
  type AttachmentProgressIndicator,
} from '../../src/components/attachment/Attachment';
import {
  docFile,
  fakeProps,
  photoFile,
  sampleItems,
  useFakeUpload,
} from '../../src/components/attachment/attachment-story-fixtures';
import { AttachmentList } from '../../src/components/attachment/AttachmentList';
import { Button } from '../../src/components/button/Button';

// 軸 655: 送っている途中の進み具合の出し方。「触って試す」の列は、送るボタンで実際に進む（1 つは途中で一度失敗する）
const meta = {
  title: 'Design Review/655 添えたファイルの進み具合',
  id: 'design-review-655-attachment-progress',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const indicatorOf: Record<string, AttachmentProgressIndicator> = {
  現行版: 'bar',
  A: 'ring',
  B: 'edge',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '名前の下の細い帯',
    intent:
      'ラフのとおり、大きさの行を細い帯（Progress の xs）に置き換える。DropzoneFileList の一行と同じ出し方で、残りが長さで読める。割合が数で分かるときは帯の後ろに「42%」を添える。送っているあいだは大きさが見えなくなる',
    spec: [
      ['progressIndicator', 'bar'],
      ['帯', '2px・primary・地はグレー'],
      ['大きさ', '途中は隠す'],
      ['割合', '帯の後ろに「42%」（null のときは出さない）'],
    ],
  },
  {
    id: 'A',
    name: 'アイコンの周りの円',
    intent:
      '左の四角に淡い白の幕を敷き、その上に円を描く。名前と大きさの行はそのままで、割合を大きさの後ろに文字で添える。札の形が送る前と変わらない。円は小さいので、残りは文字で読む',
    spec: [
      ['progressIndicator', 'ring'],
      ['円', '直径 28px・線 2.5px・primary'],
      ['大きさ', '残す。「・42%」を添える'],
    ],
  },
  {
    id: 'B',
    name: '札の下端に沿う線',
    intent:
      '札の下端に、地のない線（2px）を引く。札の角で切れる。名前と大きさの行はそのままで、割合を文字で添える。いちばん静かだが、線が札の線に重なって見落としやすい',
    spec: [
      ['progressIndicator', 'edge'],
      ['線', '2px・primary・地なし・札の角で切る'],
      ['大きさ', '残す。「・42%」を添える'],
    ],
  },
];

const columns: Column[] = [
  { label: '途中（42%）', note: 'PDF と画像' },
  { label: '終わりが分からない', note: 'progress={null}' },
  { label: '触って試す', note: '送る → 進む → 送ったあと。ZIP は一度失敗する' },
];

function Try({ indicator }: { indicator: AttachmentProgressIndicator }) {
  const { items, send, retry, remove, reset } = useFakeUpload(sampleItems);
  return (
    <div className="flex w-[520px] max-w-full flex-col gap-3">
      <div className="rounded-control bg-field p-3">
        <AttachmentList aria-label="添えたファイル">
          {items.map((item) => (
            <Attachment
              key={item.id}
              {...fakeProps(item)}
              progressIndicator={indicator}
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
  name: '進み具合の出し方',
  render: ({ pick }) => (
    <Comparison
      index={655}
      axis="添えたファイルの進み具合の出し方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const indicator = indicatorOf[candidate.id];
        if (column.label === '触って試す') return <Try indicator={indicator} />;
        const progress = column.label === '終わりが分からない' ? null : 42;
        return (
          <div className="flex w-[240px] flex-col gap-2">
            <Attachment
              file={docFile()}
              size={1_240_000}
              progress={progress}
              progressIndicator={indicator}
              onRemove={() => {}}
            />
            <Attachment
              file={photoFile()}
              size={38_000}
              progress={progress}
              progressIndicator={indicator}
              onRemove={() => {}}
            />
          </div>
        );
      }}
    >
      <p>
        Composer
        に添えたファイルを送っているあいだ、どこまで進んだかをどう見せるかを決めます。送る前・失敗・送ったあとの見た目はどの案も同じです。
      </p>
      <p>
        おすすめは現行版（名前の下の帯）です。ラフのとおりで、DropzoneFileList
        の一行と同じ出し方になり、残りが長さで読めます。A（円）は札の形が変わらないのが良い点ですが、40px
        の四角の中の円は小さく、残りは文字に頼ります。B（下端の線）はいちばん静かですが、札の線と重なって見落としやすいです。
      </p>
      <p>「X を既定にして、Y も選べる」の形で教えてください。</p>
    </Comparison>
  ),
};
