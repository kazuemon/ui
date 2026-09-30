import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Accordion, AccordionItem } from '../../src/components/accordion/Accordion';
import { Collapsible } from '../../src/components/collapsible/Collapsible';
import { statePseudo } from '../../src/stories/story-states';

// 軸 416: Accordion・Collapsible の枠付きのカードの形（variant="card"）
const meta = {
  title: 'Design Review/416 開閉の枠付きのカードの形',
  id: 'design-review-416-collapsible-card',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: '[data-slot="collapsible-trigger"]',
      focusVisible: '[data-slot="collapsible-trigger"]',
    }),
  },
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

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '囲みなし（plain と同じ）',
    intent:
      'いまは囲む形がない。card を選んでも plain と同じ、線も間もない行になる。比べるための基準',
    spec: [
      ['角', '—'],
      ['輪郭', 'なし'],
      ['開いた行', '塗らない'],
      ['間', '0'],
    ],
    tokens: {
      '--collapsible-card-radius': 'var(--radius-control)',
      '--collapsible-card-line': 'transparent',
      '--collapsible-card-line-width': '0px',
      '--collapsible-card-fill': 'transparent',
      '--collapsible-card-open-fill': 'transparent',
      '--collapsible-card-gap': '0px',
    },
  },
  {
    id: 'A',
    name: 'カードの角・細い輪郭・間 8px',
    intent:
      '1 項目ずつ、カードと同じ角・白い面・細い輪郭で囲む。行の hover は plain と同じ淡いグレーを面の角で切って敷く。開いた行は塗らない',
    spec: [
      ['角', 'カードの角（16px）'],
      ['輪郭', '細い線（輪郭の色）1px'],
      ['開いた行', '塗らない'],
      ['間', '8px'],
    ],
    tokens: {
      '--collapsible-card-radius': 'var(--radius-card)',
      '--collapsible-card-line': 'var(--color-surface-line)',
      '--collapsible-card-line-width': 'var(--border-width-thin)',
      '--collapsible-card-fill': 'var(--color-surface)',
      '--collapsible-card-open-fill': 'transparent',
      '--collapsible-card-gap': 'calc(var(--spacing) * 2)',
    },
  },
  {
    id: 'B',
    name: '部品の角・細い輪郭・間 8px',
    intent:
      'A と同じ囲みを、ボタンや入力欄と同じ部品の角（12px）にする。行を囲むトグル（Switch の card）と同じ角で、行そのものに近い見た目',
    spec: [
      ['角', '部品の角（12px）'],
      ['輪郭', '細い線（輪郭の色）1px'],
      ['開いた行', '塗らない'],
      ['間', '8px'],
    ],
    tokens: {
      '--collapsible-card-radius': 'var(--radius-control)',
      '--collapsible-card-line': 'var(--color-surface-line)',
      '--collapsible-card-line-width': 'var(--border-width-thin)',
      '--collapsible-card-fill': 'var(--color-surface)',
      '--collapsible-card-open-fill': 'transparent',
      '--collapsible-card-gap': 'calc(var(--spacing) * 2)',
    },
  },
  {
    id: 'C',
    name: 'カードの角・開いた行を塗る・間 12px',
    intent:
      'A の囲みで、開いている項目の行（題）を淡いグレーで塗り、題と中身を分ける。どれが開いているかを遠目にも見せる。間は 12px と広め',
    spec: [
      ['角', 'カードの角（16px）'],
      ['輪郭', '細い線（輪郭の色）1px'],
      ['開いた行', '淡いグレー（入力欄の塗り）'],
      ['間', '12px'],
    ],
    tokens: {
      '--collapsible-card-radius': 'var(--radius-card)',
      '--collapsible-card-line': 'var(--color-surface-line)',
      '--collapsible-card-line-width': 'var(--border-width-thin)',
      '--collapsible-card-fill': 'var(--color-surface)',
      '--collapsible-card-open-fill': 'var(--color-field)',
      '--collapsible-card-gap': 'calc(var(--spacing) * 3)',
    },
  },
];

const columns: Column[] = [
  { label: 'Accordion', note: '3 項目・2 つ目が開いている' },
  { label: '閉じている' },
  { label: 'hover', preview: 'hover' },
  { label: 'フォーカス', note: 'キーボード', preview: 'focus' },
  { label: '開いている' },
];

const answer =
  '支払いの方法は、クレジットカードと銀行振込から選べます。あとから設定の画面で変えられます。';

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={416}
      axis="開閉の枠付きのカードの形"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) =>
        column.label === 'Accordion' ? (
          <div className="w-[360px]">
            <Accordion variant="card" defaultValue={['pay']}>
              <AccordionItem value="plan" title="プランはあとから変えられますか">
                {answer}
              </AccordionItem>
              <AccordionItem value="pay" title="支払いの方法を教えてください">
                {answer}
              </AccordionItem>
              <AccordionItem value="cancel" title="解約はいつでもできますか">
                {answer}
              </AccordionItem>
            </Accordion>
          </div>
        ) : (
          <div className="w-[300px]">
            <Collapsible
              variant="card"
              title="詳しい設定"
              defaultOpen={column.label === '開いている'}
            >
              {answer}
            </Collapsible>
          </div>
        )
      }
    >
      <p>
        Accordion・Collapsible の variant に、枠付きのカードの形 card を足します。項目を 1
        つずつ白い面と細い輪郭で囲み、続けて置いたときは少し離します。行の hover は plain
        と同じ淡いグレーで、囲みの角で切ります。フォーカスの線は囲みの内側に引きます。
      </p>
      <p>選ぶのは、囲みの角・開いている行の塗り・項目のあいだです。</p>
    </Comparison>
  ),
};
