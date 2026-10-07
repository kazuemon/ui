import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useEffect, useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Combobox } from '../../src/components/combobox/Combobox';
import { Menu } from '../../src/components/menu/Menu';
import { MenuItem } from '../../src/components/menu/MenuItem';
import { Select } from '../../src/components/select/Select';
import { statePseudo } from '../../src/stories/story-states';

// 軸 580: 浮かぶ選択肢の一覧（Select・Combobox・TagsInput・Menu）のスクロールの見た目
const meta = {
  title: 'Design Review/580 浮かぶ一覧のスクロール',
  id: 'design-review-580-popover-list-scroll',
  parameters: {
    layout: 'fullscreen',
    // 「載せたとき」の列は、一覧の枠に hover を当てる（ScrollArea のつまみは、載せたときに出る）
    pseudo: statePseudo({ hover: '[data-slot="more-cue-scroll"]' }),
  },
  // 開いたまま並べた一覧が、ページのスクロールを止めないようにする（比べるためだけ）
  decorators: [
    (Story) => (
      <>
        <style>{'html, body { overflow: auto !important; }'}</style>
        <Story />
      </>
    ),
  ],
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

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'ブラウザのスクロールバー',
    intent:
      'スクロールバーはブラウザのもの（OS によって形が変わり、Windows ではいつも幅を取る）。続きがある端には内側の影を落とす。ここではブラウザの既定に近い灰色で描いている',
    spec: [
      ['スクロールバー', 'ブラウザのもの（いつも出る）'],
      ['続きの印', '端の内側の影'],
    ],
    tokens: {
      '--listbox-scroll-native': 'auto',
      '--listbox-scroll-thumb': 'hidden',
      '--listbox-scroll-thumb-idle': '0',
    },
  },
  {
    id: 'A',
    name: 'ScrollArea と同じ（Autocomplete と同じ）',
    intent:
      'ブラウザのスクロールバーを隠し、ScrollArea の細いつまみを、載せたとき・スクロール中だけ出す。続きは端の内側の影で見せる。Autocomplete の候補と同じ見た目になる',
    spec: [
      ['スクロールバー', 'ScrollArea のつまみ（載せたとき・スクロール中）'],
      ['続きの印', '端の内側の影'],
    ],
    tokens: {
      '--listbox-scroll-native': 'none',
      '--listbox-scroll-thumb': 'visible',
      '--listbox-scroll-thumb-idle': '0',
    },
  },
  {
    id: 'B',
    name: 'ScrollArea のつまみをいつも出す',
    intent:
      'A のつまみを、載せていなくてもいつも出す。開いた時点で、長い一覧だと分かる。細いので幅は取らない',
    spec: [
      ['スクロールバー', 'ScrollArea のつまみ（いつも）'],
      ['続きの印', '端の内側の影'],
    ],
    tokens: {
      '--listbox-scroll-native': 'none',
      '--listbox-scroll-thumb': 'visible',
      '--listbox-scroll-thumb-idle': '1',
    },
  },
];

type Kind = 'select' | 'combobox' | 'menu';

const columns: (Column & { kind: Kind; scroll: 'top' | 'middle' | 'end' })[] = [
  { label: 'Select（開いた直後）', note: '一覧の上端', kind: 'select', scroll: 'top' },
  {
    label: 'Select（載せたとき）',
    note: '途中までスクロールし、一覧にマウスを載せた状態',
    preview: 'hover',
    kind: 'select',
    scroll: 'middle',
  },
  {
    label: 'Combobox（末尾）',
    note: '最後までスクロールした状態',
    kind: 'combobox',
    scroll: 'end',
  },
  { label: 'Menu', note: '項目の多いメニュー。途中までスクロール', kind: 'menu', scroll: 'middle' },
];

const prefectures = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
].map((label, i) => ({ label, value: `pref-${i}` }));

// 開いたままの一覧を、列の位置までスクロールする
function useScrolled(frame: HTMLElement | null, scroll: 'top' | 'middle' | 'end') {
  useEffect(() => {
    if (!frame) return undefined;
    const id = setTimeout(() => {
      const viewport = frame.querySelector<HTMLElement>(
        '[data-slot="more-cue-scroll"] [data-scroll-viewport]'
      );
      if (!viewport) return;
      viewport.scrollTop =
        scroll === 'top' ? 0 : scroll === 'end' ? viewport.scrollHeight : viewport.scrollHeight / 3;
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      window.scrollTo(0, 0);
    }, 400);
    return () => clearTimeout(id);
  }, [frame, scroll]);
}

function Frame({ children }: { children: (frame: HTMLElement) => ReactNode }) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setFrame}
      data-density="fine"
      className="relative h-[460px] w-[300px] [transform:translateZ(0)] overflow-clip rounded-card border border-line bg-bg"
    >
      <div className="flex flex-col items-stretch gap-4 p-5">{frame && children(frame)}</div>
    </div>
  );
}

function Cell({ kind, scroll }: { kind: Kind; scroll: 'top' | 'middle' | 'end' }) {
  return <Frame>{(frame) => <Opened frame={frame} kind={kind} scroll={scroll} />}</Frame>;
}

function Opened({
  frame,
  kind,
  scroll,
}: {
  frame: HTMLElement;
  kind: Kind;
  scroll: 'top' | 'middle' | 'end';
}) {
  useScrolled(frame, scroll);
  if (kind === 'select')
    return (
      <Select
        label="都道府県"
        items={prefectures}
        defaultValue="pref-12"
        presentation="popover"
        open
        modal={false}
        portalContainer={frame}
      />
    );
  if (kind === 'combobox')
    return (
      <Combobox
        label="都道府県"
        items={prefectures}
        placeholder="選ぶ"
        presentation="popover"
        open
        modal={false}
        portalContainer={frame}
      />
    );
  return (
    <Menu
      trigger={<Button variant="outline">移動先</Button>}
      presentation="popover"
      open
      modal={false}
      portalContainer={frame}
      // 枠に収まるよう、面の高さに上限をかける（比べるためだけ）
      className="max-h-[300px]!"
    >
      {prefectures.map((item) => (
        <MenuItem key={item.value}>{item.label}</MenuItem>
      ))}
    </Menu>
  );
}

// 開いた直後は選んだ項目が hover の状態になるので、固定した列ではそれを外す
const highlightPreview = [
  '[role="option"][data-highlighted]:not([data-selected]) { background-color: transparent; }',
  '[role="option"][data-highlighted][data-selected] { background-color: var(--color-select-item-selected); }',
  '[role="menuitem"][data-highlighted] { background-color: transparent; }',
].join('\n');

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <>
      <style>{highlightPreview}</style>
      <Comparison
        index={580}
        axis="浮かぶ一覧のスクロール"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={(column) => {
          const { kind, scroll } = column as (typeof columns)[number];
          return <Cell kind={kind} scroll={scroll} />;
        }}
      >
        <p>
          Select・Combobox・TagsInput の浮かぶ選択肢と、Menu
          の一覧が長いときのスクロールの見た目を選びます。 Autocomplete の候補と ScrollArea
          は、すでに A の見た目です。いまの Select などはブラウザのスクロールバーなので、OS
          によって形が変わり、Windows では一覧の右にいつも幅を取って出ます。
        </p>
        <p>
          どの案も、続きがある端には内側の影を落とします（いまと同じ）。違うのはスクロールバーの出し方だけです。
          撮影の環境ではブラウザのスクロールバーが出ないことがあるので、現行版は Storybook
          を開いて見てください。
        </p>
        <p>決まったら、既定にする案と、選べるようにするかを教えてください。</p>
      </Comparison>
    </>
  ),
};
