import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Attachment } from '../../src/components/attachment/Attachment';
import { docFile, photoFile } from '../../src/components/attachment/attachment-story-fixtures';
import { AttachmentList } from '../../src/components/attachment/AttachmentList';

// 軸 657: 札を横に並べて、並びきらないときの並べ方。どのセルも右下の角を引くと幅が変わる
const meta = {
  title: 'Design Review/657 添えたファイルの並べ方',
  id: 'design-review-657-attachment-list',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const wrapOf: Record<string, boolean> = { 現行版: true, A: false };

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '折り返す',
    intent:
      '並びきらない札は次の行へ送る。添えたものが全部見えるが、数が増えるほど Composer が高くなり、打つ欄が下へ押される',
    spec: [
      ['wrap', 'true'],
      ['間', '8px'],
    ],
  },
  {
    id: 'A',
    name: '1 行のまま横にスクロール',
    intent:
      '札は 1 行に並べ、はみ出した分は横にスクロールする（ScrollArea。続きは端の内側の影で見せ、つまみは載せたとき・スクロール中に出る）。Composer の高さが変わらない。後ろの札は動かさないと見えない',
    spec: [
      ['wrap', 'false'],
      ['続き', '端の内側の影・横のつまみ'],
    ],
  },
];

const columns: Column[] = [
  { label: 'スマホの幅（3 つ）', note: '343px。右下の角を引くと幅が変わる' },
  { label: 'デスクトップの幅（7 つ）', note: '560px。右下の角を引くと幅が変わる' },
];

const items = (count: number) =>
  [
    <Attachment key="1" file={photoFile()} size={38_000} onRemove={() => {}} />,
    <Attachment key="2" file={docFile()} size={1_240_000} progress={40} onRemove={() => {}} />,
    <Attachment
      key="3"
      file={docFile('notes.txt', 'text/plain')}
      size={2_400}
      onRemove={() => {}}
    />,
    <Attachment key="4" file={photoFile('menu.svg')} size={52_000} onRemove={() => {}} />,
    <Attachment
      key="5"
      file={docFile('budget-2026.xlsx', 'application/vnd.ms-excel')}
      size={88_000}
      onRemove={() => {}}
    />,
    <Attachment
      key="6"
      file={docFile('slides.key', 'application/octet-stream')}
      size={6_400_000}
      onRemove={() => {}}
    />,
    <Attachment key="7" file={photoFile('map.svg')} size={12_000} onRemove={() => {}} />,
  ].slice(0, count);

export const Candidates: Story = {
  name: '並べ方',
  render: ({ pick }) => (
    <Comparison
      index={657}
      axis="添えたファイルの並べ方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const phone = column.label.startsWith('スマホ');
        return (
          <div
            data-density={phone ? 'coarse' : undefined}
            className="flex min-w-[200px] resize-x flex-col gap-3 overflow-hidden rounded-control bg-field p-3"
            style={{ width: phone ? 343 : 560, maxWidth: 900 }}
          >
            <AttachmentList aria-label="添えたファイル" wrap={wrapOf[candidate.id]}>
              {items(phone ? 3 : 7)}
            </AttachmentList>
            <p className="text-fg-subtle">メッセージを入力</p>
          </div>
        );
      }}
    >
      <p>
        Composer に札を横に並べて、並びきらないときにどうするかを決めます。灰色の面が Composer
        の代わりです。右下の角を引くと幅を変えられます。
      </p>
      <p>
        おすすめは、現行版（折り返す）を既定にし、A（横にスクロール）も選べる形です。札は数個のことが多く、全部が見えるほうが外し忘れや送り間違いに気づけます。たくさん添える画面や、Composer
        の高さを変えたくない画面では A を選びます。吹き出しの中は、どちらでも折り返しが自然です。
      </p>
      <p>「X を既定にして、Y も選べる」の形で教えてください。</p>
    </Comparison>
  ),
};
