import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { PreviewCard } from '../../src/components/preview-card/PreviewCard';
import {
  ArticlePreview,
  ProfilePreview,
} from '../../src/components/preview-card/preview-card-samples';

// 軸 571: PreviewCard の面の幅と余白
const meta = {
  title: 'Design Review/571 プレビューの面の大きさ',
  id: 'design-review-571-preview-card-size',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
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

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'Popover と同じ幅、画像は端まで',
    intent:
      '幅は Popover の上限と同じ 320px、余白は 16px。画像のある面は余白を外し、画像を面の端まで広げる',
    spec: [
      ['幅', '320px'],
      ['余白', '16px'],
      ['画像', '端まで'],
    ],
    tokens: {
      '--preview-card-width': 'calc(var(--spacing) * 80)',
      '--preview-card-padding': 'calc(var(--spacing) * 4)',
    },
  },
  {
    id: 'A',
    name: '小さめ',
    intent: '幅 280px・余白 12px。リンクの近くで目立ちすぎないが、題が 2 行を超えやすい',
    spec: [
      ['幅', '280px'],
      ['余白', '12px'],
      ['画像', '端まで'],
    ],
    tokens: {
      '--preview-card-width': 'calc(var(--spacing) * 70)',
      '--preview-card-padding': 'calc(var(--spacing) * 3)',
    },
  },
  {
    id: 'B',
    name: '大きめ',
    intent: '幅 384px・余白 16px。画像と説明をゆったり見せるが、リンクから離れた印象になる',
    spec: [
      ['幅', '384px'],
      ['余白', '16px'],
      ['画像', '端まで'],
    ],
    tokens: {
      '--preview-card-width': 'calc(var(--spacing) * 96)',
      '--preview-card-padding': 'calc(var(--spacing) * 4)',
    },
  },
  {
    id: 'C',
    name: '画像も余白の内側',
    intent: '幅 320px・余白 16px。画像を面の端まで広げず、文と同じ余白の内側に角丸で置く',
    spec: [
      ['幅', '320px'],
      ['余白', '16px'],
      ['画像', '余白の内側'],
    ],
    tokens: {
      '--preview-card-width': 'calc(var(--spacing) * 80)',
      '--preview-card-padding': 'calc(var(--spacing) * 4)',
    },
  },
];

const columns: Column[] = [
  { label: '記事（画像あり）', note: '画像・サイト・題・説明' },
  { label: 'プロフィール', note: '名前・ひとこと・数' },
];

function Cell({ column, candidate }: { column: Column; candidate: Candidate }) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const article = column.label.startsWith('記事');
  const inside = candidate.id === 'C';
  return (
    <div
      ref={setFrame}
      data-density="fine"
      className={`relative ${article ? 'h-[480px]' : 'h-[240px]'} w-[440px] max-w-full [transform:translateZ(0)] overflow-clip rounded-card border border-line bg-bg`}
    >
      {frame && (
        <div className="flex w-full justify-center pt-4">
          <PreviewCard
            href="https://example.com/"
            content={article ? <ArticlePreview bleed={!inside} /> : <ProfilePreview />}
            popupClassName={article && !inside ? 'p-0' : undefined}
            defaultOpen
            portalContainer={frame}
          >
            {article ? '候補を並べて選ぶループ' : '@kazuemon'}
          </PreviewCard>
        </div>
      )}
    </div>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={571}
      axis="プレビューの面の大きさ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => <Cell column={column} candidate={candidate} />}
    >
      <p>決定: 幅 320・余白 16 は現行版のまま。サムネイルは Card と同じ設定ができ、既定も Card に揃える（ADR-0489）</p>
      <p>
        PreviewCard
        の面の幅と余白、画像の置き方を決めます。面の見た目（白・細い輪郭・影・角）は、Popover
        と同じです。
      </p>
      <p>
        おすすめは現行版です。幅は Popover
        の上限にそろえ、画像のある面は、リンクカードと同じように画像を端まで広げます。選ぶときは、どれを既定にして、どれを選べるようにするか（幅は
        popupClassName の w-* で変えられます）も教えてください。
      </p>
    </Comparison>
  ),
};
