import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { type ReactNode, useState } from 'react';

import {
  Combobox,
  type ComboboxItem,
  type ComboboxPresentation,
  type ComboboxSheetInput,
} from '../../src/components/combobox/Combobox';
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
  { label: '品川区', value: 'shinagawa' },
  { label: '目黒区', value: 'meguro' },
  { label: '世田谷区', value: 'setagaya' },
  { label: '渋谷区', value: 'shibuya' },
];

// 候補ごとの指定（props）。トークンでは表せない軸なので、行ごとに部品の指定を変える
const settings: Record<
  string,
  { presentation: ComboboxPresentation; sheetInput?: ComboboxSheetInput }
> = {
  current: { presentation: 'popover' },
  A: { presentation: 'sheet', sheetInput: 'field' },
  B: { presentation: 'sheet', sheetInput: 'inside' },
};

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '現行版（いつも浮かべる）',
    intent:
      '指で操作していても、選択肢は欄の下に浮かぶ。キーボードが出ると、選択肢はその下に隠れる。',
    spec: [
      ['出し方', 'popover'],
      ['打つ欄', '欄のまま'],
      ['後ろの画面', '暗くしない'],
    ],
  },
  {
    id: 'A',
    name: '打つ欄は欄に残す',
    intent:
      '選択肢だけを画面の下から出す。欄にフォーカスとキーボードが残り、シートはキーボードの上（見えている範囲）に収まる。',
    spec: [
      ['出し方', 'sheet'],
      ['打つ欄', 'sheetInput="field"'],
      ['後ろの画面', '暗くしない（欄を読むため）'],
      ['シートの見出し', 'ラベル・ヘルプテキスト・×'],
    ],
  },
  {
    id: 'B',
    name: '打つ欄をシートの中へ',
    intent:
      '欄は押すと開くボタン（Select と同じ形）。シートの見出しの下に打つ欄が出て、チップもシートの中で外す。',
    spec: [
      ['出し方', 'sheet'],
      ['打つ欄', 'sheetInput="inside"'],
      ['後ろの画面', '暗くする'],
      ['シートの見出し', 'ラベル・ヘルプテキスト・×＋打つ欄'],
    ],
  },
];

const columns: Column[] = [
  { label: '閉じている', note: 'キーボードなし' },
  { label: '開いた（選択肢）', note: 'キーボードあり' },
  { label: '打って絞り込んだ', note: '「谷」で 2 件に絞り込み' },
  { label: 'multiple（開いた）', note: 'チップ 2 つ' },
];

// ソフトウェアキーボードの見立て。実機の代わりに、画面の下を 300px ふさぐ
const KEYBOARD = 300;

/**
 * スマートフォンの枠に、キーボードの見立てを足したもの
 * 見えている範囲（キーボードの上）を重なる面の描き場所（container）に渡す。シートは position: fixed で、
 * いちばん近い transform を持つ祖先を基準にするので、この箱がそのまま「キーボードに隠れない範囲」になる
 */
function Phone({
  keyboard,
  children,
}: {
  keyboard: boolean;
  children: (area: HTMLElement) => ReactNode;
}) {
  const [area, setArea] = useState<HTMLDivElement | null>(null);
  return (
    <PhoneFrame>
      {() => (
        <>
          <div
            ref={setArea}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 [transform:translateZ(0)] [&>*]:pointer-events-auto"
            style={{ bottom: keyboard ? KEYBOARD : 0 }}
          />
          {area && children(area)}
          {keyboard && (
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 z-20 flex items-start justify-center border-t border-line bg-neutral pt-2 text-xs text-fg-subtle"
              style={{ height: KEYBOARD }}
            >
              ソフトウェアキーボード（{KEYBOARD}px の見立て）
            </div>
          )}
        </>
      )}
    </PhoneFrame>
  );
}

function Cell({ column, candidate }: { column: Column; candidate: Candidate }) {
  const setting = settings[candidate.id] ?? settings.current;
  const closed = column.label === '閉じている';
  const multiple = column.label.startsWith('multiple');
  return (
    <Phone keyboard={!closed}>
      {(area) => (
        <Combobox
          {...setting}
          label="お届け先の区"
          caption="23区内だけにお届けします"
          placeholder="探して選んでください"
          items={items}
          container={area}
          defaultOpen={!closed}
          multiple={multiple}
          defaultValue={multiple ? ['minato', 'setagaya'] : undefined}
          defaultInputValue={column.label === '打って絞り込んだ' ? '谷' : undefined}
        />
      )}
    </Phone>
  );
}

const meta = {
  title: 'Design Review/242 Combobox のシート表示',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Candidates: Story = {
  name: 'candidates',
  render: () => (
    <Comparison
      index={242}
      axis="Combobox の狭い画面での出し方"
      pick="current"
      columns={columns}
      candidates={candidates}
      renderCell={(column, candidate) => <Cell column={column} candidate={candidate} />}
    >
      <p>
        Select
        は、指で操作していて画面が狭いとき、選択肢を画面の下から出すシートにします（原則16）。Combobox
        には打つ欄があるので、シートとソフトウェアキーボードが同時に出ます。どちらの形にしますか。
      </p>
      <p>
        A
        は打つ欄を欄に残します。欄にフォーカスとキーボードが残ったまま、選択肢だけがキーボードの上に出ます。B
        は欄を押すボタンにして、打つ欄をシートの中に移します（Select
        と同じ形になり、複数選んだチップもシートの中で外します）。
      </p>
      <p>
        列の灰色の帯は、ソフトウェアキーボードの見立てです（実機のキーボードは出せないので、300px
        の場所取りにしています）。現行版の列では、浮かぶ選択肢がその帯に隠れます。
      </p>
      <p>
        A
        のシートの見出しは、欄のラベルと同じ文が並びます（欄がシートの外に見えているため）。見出しを省いて、つまみと
        × だけにする形も選べます。
      </p>
      <p>
        既定をどちらにしますか。presentation（auto・popover・sheet）は Select
        と同じで、ThemeProvider でもまとめて決められます。
      </p>
    </Comparison>
  ),
};

// ── スマホで実機を確かめる用（フレームなし・案ごとに独立） ─────────────────
// iframe を直接開く: http://<このマシンの IP>:6020/iframe.html?id=<story-id>&viewMode=story
// 実機のキーボードと visualViewport で確かめるため、擬似のキーボードや枠は置かない

const notes =
  '打つ・選ぶ・キーボードを引っ込める・画面を回す・上下にスクロールする、を試してください';

function DevicePage({ look, autoFocus }: { look: 'current' | 'A' | 'B'; autoFocus?: boolean }) {
  const setting = {
    ...settings[look],
    sheetAutoFocus: autoFocus,
    // B は開いた時点で目いっぱいの高さにする（キーボードの上の見えている範囲）
    ...(look === 'B' ? { sheetDetent: 'full' as const } : {}),
  };
  return (
    <div className="mx-auto flex min-h-[160vh] max-w-md flex-col gap-8 px-4 py-6">
      <p className="text-sm text-fg-muted">
        {look === 'current'
          ? '現行版（いつも浮かべる）'
          : look === 'A'
            ? 'A 打つ欄は欄に残す'
            : 'B シートの中に打つ欄'}
        。{notes}
      </p>
      <Combobox
        {...setting}
        label="お届け先の区"
        caption="23区内だけにお届けします"
        placeholder="探して選んでください"
        items={items}
      />
      <Combobox
        {...setting}
        multiple
        label="行きたい区"
        placeholder="探して選んでください"
        items={items}
        defaultValue={['minato', 'setagaya']}
      />
      <p className="text-sm text-fg-muted">
        （下にスクロールしたときの欄の見え方を確かめるための余白です）
      </p>
      <div className="mt-auto">
        <Combobox
          {...setting}
          label="画面の下にある欄"
          caption="キーボードで隠れないか確かめます"
          placeholder="探して選んでください"
          items={items}
        />
      </div>
    </div>
  );
}

export const DeviceCurrent: Story = {
  name: 'スマホ 現行版（浮かべる）',
  parameters: { layout: 'fullscreen' },
  render: () => <DevicePage look="current" />,
};

export const DeviceA: Story = {
  name: 'スマホ A 打つ欄は欄に残す',
  parameters: { layout: 'fullscreen' },
  render: () => <DevicePage look="A" />,
};

export const DeviceB: Story = {
  name: 'スマホ B シートの中に打つ欄',
  parameters: { layout: 'fullscreen' },
  render: () => <DevicePage look="B" />,
};

export const DeviceBFocus: Story = {
  name: 'スマホ B シートの中に打つ欄（開いたらすぐ打てる）',
  parameters: { layout: 'fullscreen' },
  render: () => <DevicePage look="B" autoFocus />,
};

// 開いたら打つ欄にフォーカスが当たることの確かめ（テスト専用。画面には出さない。
// play を付けると、実機でストーリーを開いた瞬間に自動で操作が走り、ユーザーの操作にならずキーボードが出ないため）
export const DeviceBFocusCheck: Story = {
  name: 'スマホ B（開いたらすぐ打てる）の確かめ',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  render: () => <DevicePage look="B" autoFocus />,
  play: async ({ canvasElement }) => {
    const [field] = within(canvasElement).getAllByRole('combobox');
    await userEvent.click(field);
    await waitFor(async () => {
      const active = canvasElement.ownerDocument.activeElement;
      await expect(active?.tagName).toBe('INPUT');
      await expect(active?.closest('[data-slot="combobox-sheet-input"]')).not.toBeNull();
    });
  },
};
