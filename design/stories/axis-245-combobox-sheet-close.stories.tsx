import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';

import { Combobox, type ComboboxItem } from '../../src/components/combobox/Combobox';
import { PhoneFrame } from '../../src/stories/story-parts';
import { type Candidate, type Column, Comparison } from './Comparison';

const items: ComboboxItem[] = [
  { label: '千代田区', value: 'chiyoda' },
  { label: '中央区', value: 'chuo' },
  { label: '港区', value: 'minato' },
  { label: '新宿区', value: 'shinjuku' },
  { label: '文京区', value: 'bunkyo' },
  { label: '台東区', value: 'taito' },
  { label: '墨田区', value: 'sumida' },
  { label: '江東区', value: 'koto' },
];

type Look = 'current' | 'A' | 'B' | 'D' | 'E';

const settings = {
  current: { sheetCloseIcon: 'x', sheetCloseText: null },
  A: { sheetCloseIcon: 'chevron', sheetCloseText: null },
  B: { sheetCloseIcon: null, sheetCloseText: '完了' },
  D: { sheetCloseIcon: 'check', sheetCloseText: null },
  E: { sheetCloseIcon: 'check', sheetCloseText: '完了' },
} as const;

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '現行版（× と ×）',
    intent: '見出しの右上に閉じる ×、打つ欄の右端に消去 ×。同じ形が縦に並ぶ。',
    spec: [
      ['閉じる', '×'],
      ['消去', '打つ欄の右端の ×'],
    ],
  },
  {
    id: 'A',
    name: '閉じるを下向き矢印に',
    intent: '閉じるは「下げる」を表す ⌄。形が違うので、消去 × と見分けられる。',
    spec: [
      ['閉じる', '⌄（sheetCloseIcon="chevron"）'],
      ['消去', '打つ欄の右端の ×'],
    ],
  },
  {
    id: 'B',
    name: '閉じるを文字のボタンに',
    intent: '閉じるは「完了」の文字。文は sheetCloseText で渡す。',
    spec: [
      ['閉じる', '文字（sheetCloseIcon={null}・sheetCloseText="完了"）'],
      ['消去', '打つ欄の右端の ×'],
    ],
  },
  {
    id: 'D',
    name: '閉じるを ✓ のアイコンに',
    intent:
      '閉じるは「選び終えた」を表す ✓。複数選ぶときは、選んだ時点で反映されているので、動きと合う。文字は増えない。',
    spec: [
      ['閉じる', '✓（sheetCloseIcon="check"・sheetCloseText={null}）'],
      ['消去', '打つ欄の右端の ×'],
    ],
  },
  {
    id: 'E',
    name: '閉じるを ✓ と「完了」に',
    intent: '✓ と文字を並べる。文は sheetCloseText で渡す。B より、押すと終わることが分かる。',
    spec: [
      ['閉じる', '✓ ＋「完了」（既定）'],
      ['消去', '打つ欄の右端の ×'],
    ],
  },
];

const columns: Column[] = [
  { label: '単数（選んである）' },
  { label: '複数（チップ 2 つ）' },
  { label: '見出しだけ（ヘルプなし）' },
  { label: 'エラーあり' },
];

function Phone({ children }: { children: (area: HTMLElement) => ReactNode }) {
  const [area, setArea] = useState<HTMLDivElement | null>(null);
  return (
    <PhoneFrame>
      {() => (
        <>
          <div
            ref={setArea}
            aria-hidden
            className="pointer-events-none absolute inset-0 [transform:translateZ(0)] [&>*]:pointer-events-auto"
          />
          {area && children(area)}
        </>
      )}
    </PhoneFrame>
  );
}

function Cell({ column, look }: { column: Column; look: Look }) {
  const multiple = column.label.startsWith('複数');
  const noCaption = column.label.startsWith('見出しだけ');
  const hasError = column.label === 'エラーあり';
  return (
    <Phone>
      {(area) => (
        <Combobox
          {...settings[look]}
          presentation="sheet"
          label="行きたい区"
          caption={noCaption ? undefined : '複数選べます'}
          error={hasError ? '1 つ以上選んでください' : undefined}
          placeholder="探して選んでください"
          items={items}
          container={area}
          defaultOpen
          multiple={multiple}
          defaultValue={multiple ? ['minato', 'shinjuku'] : 'minato'}
          defaultInputValue={multiple ? undefined : '港区'}
        />
      )}
    </Phone>
  );
}

const meta = {
  title: 'Design Review/245 Combobox のシートの × と ×',
  id: 'design-review-245-combobox-sheet-close',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Candidates: Story = {
  name: 'candidates',
  render: () => (
    <Comparison
      index={245}
      axis="Combobox のシートの閉じると消去"
      pick="E"
      columns={columns}
      candidates={candidates}
      renderCell={(column, candidate) => <Cell column={column} look={candidate.id as Look} />}
    >
      <p>
        シートの見出しの右上の「閉じる」と、打つ欄の右端の「消去」が、同じ ×
        で縦に並んでいて、近く見えます。どう見分けますか。
      </p>
      <p>既定にする案と、props で選べるようにしたい案を教えてください。</p>
    </Comparison>
  ),
};

// ── スマホで実機を確かめる用（フレームなし・案ごとに独立） ─────────────────
function DevicePage({ look }: { look: Look }) {
  return (
    <div className="mx-auto flex min-h-[120vh] max-w-md flex-col gap-8 px-4 py-6">
      <p className="text-sm text-fg-muted">
        {candidates.find((c) => c.id === look)?.name}
        。欄を押して、シートの「閉じる」と「消去」を見分けられるか試してください
      </p>
      <Combobox
        {...settings[look]}
        multiple
        label="行きたい区"
        caption="複数選べます"
        placeholder="探して選んでください"
        items={items}
        defaultValue={['minato', 'shinjuku']}
      />
      <Combobox
        {...settings[look]}
        label="お届け先の区"
        placeholder="探して選んでください"
        items={items}
        defaultValue="minato"
      />
    </div>
  );
}

export const DeviceCurrent: Story = {
  name: 'スマホ 現行版（× と ×）',
  parameters: { layout: 'fullscreen' },
  render: () => <DevicePage look="current" />,
};
export const DeviceA: Story = {
  name: 'スマホ A 閉じるを下向き矢印に',
  parameters: { layout: 'fullscreen' },
  render: () => <DevicePage look="A" />,
};
export const DeviceB: Story = {
  name: 'スマホ B 閉じるを文字のボタンに',
  parameters: { layout: 'fullscreen' },
  render: () => <DevicePage look="B" />,
};
export const DeviceD: Story = {
  name: 'スマホ D 閉じるを ✓ のアイコンに',
  parameters: { layout: 'fullscreen' },
  render: () => <DevicePage look="D" />,
};
export const DeviceE: Story = {
  name: 'スマホ E 閉じるを ✓ と「完了」に',
  parameters: { layout: 'fullscreen' },
  render: () => <DevicePage look="E" />,
};
