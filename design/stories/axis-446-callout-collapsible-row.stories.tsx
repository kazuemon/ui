import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Callout } from '../../src/components/callout/Callout';
import { statePseudo } from '../../src/stories/story-states';

// 軸 446: 畳める囲み（Callout の collapsible）の題の行。帯の上下の余白、帯と中身のあいだ、帯の塗りと線
const meta = {
  title: 'Design Review/446 畳める囲みの題の行',
  id: 'design-review-446-callout-collapsible-row',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: '[data-slot="callout-trigger"]',
      focusVisible: '[data-slot="callout-trigger"]',
    }),
  },
  args: { pick: 'current,E' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current,E', 'current', 'A', 'B', 'C', 'D', 'E'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

// 塗りは囲みの文字の色を混ぜる割合
const fills = (rest: string, hover: string, open: string, openHover: string) => ({
  '--callout-row-fill-mix': rest,
  '--callout-row-fill-hover-mix': hover,
  '--callout-row-fill-open-mix': open,
  '--callout-row-fill-open-hover-mix': openHover,
});

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '塗りを題の上下にそろえる',
    intent:
      '題の行の上下は囲みの余白（16px）。開いているときも塗りを題の下へ同じだけ広げ、中身は塗りの下端から始める。題と中身のあいだが、畳めない囲みより広い',
    spec: [
      ['帯の上下', '16px（囲みの余白）'],
      ['帯と中身のあいだ', '0（題と中身は 16px）'],
      ['塗り', 'hover だけ 6%'],
      ['帯の下の線', 'なし'],
    ],
    tokens: {
      '--callout-row-band': '0',
      ...fills('0%', '6%', '0%', '6%'),
      '--callout-row-rule-width': '0px',
    },
  },
  {
    id: 'A',
    name: '開閉の行のような帯',
    intent:
      '題の行を、開閉の行（Accordion）と同じ部品の高さの帯にする。閉じた囲みは 1 行の帯になり、開くと中身は帯の下に帯の上下と同じだけ空けて始める。hover の塗りは帯だけで、中身に触れない',
    spec: [
      ['帯の上下', '8px（部品の高さの帯）'],
      ['帯と中身のあいだ', '8px（題と中身は 16px）'],
      ['塗り', 'hover だけ 6%'],
      ['帯の下の線', 'なし'],
    ],
    tokens: {
      '--callout-row-band': '1',
      ...fills('0%', '6%', '0%', '6%'),
      '--callout-row-rule-width': '0px',
    },
  },
  {
    id: 'B',
    name: 'A ＋ 開いた帯を塗る',
    intent:
      'A に加えて、開いているときは帯を淡く塗る（Accordion の open-filled）。開いた囲みの題が見出しの帯のように分かれる。開いて載せると少し濃く',
    spec: [
      ['帯の上下', '8px'],
      ['帯と中身のあいだ', '8px'],
      ['塗り', 'hover 6%・開いて 6%・開いて hover 10%'],
      ['帯の下の線', 'なし'],
    ],
    tokens: {
      '--callout-row-band': '1',
      ...fills('0%', '6%', '6%', '10%'),
      '--callout-row-rule-width': '0px',
    },
  },
  {
    id: 'C',
    name: 'A ＋ 帯の下に線',
    intent:
      'A に加えて、開いているときは帯と中身のあいだに細い線を、囲みの端から端まで引く（Accordion の divided）。線は囲みの文字の色 16%',
    spec: [
      ['帯の上下', '8px'],
      ['帯と中身のあいだ', '8px（線の下から）'],
      ['塗り', 'hover だけ 6%'],
      ['帯の下の線', '1px・文字の色 16%'],
    ],
    tokens: {
      '--callout-row-band': '1',
      ...fills('0%', '6%', '0%', '6%'),
      '--callout-row-rule-width': '1px',
    },
  },
  {
    id: 'D',
    name: 'A ＋ 帯をいつも塗る',
    intent:
      'A に加えて、帯を閉じていても開いていても淡く塗る（Accordion の filled）。押せる行だとはじめから分かる。載せると少し濃く',
    spec: [
      ['帯の上下', '8px'],
      ['帯と中身のあいだ', '8px'],
      ['塗り', 'いつも 6%・hover 10%'],
      ['帯の下の線', 'なし'],
    ],
    tokens: {
      '--callout-row-band': '1',
      ...fills('6%', '10%', '6%', '10%'),
      '--callout-row-rule-width': '0px',
    },
  },
  {
    id: 'E',
    name: '現行版の高さ ＋ 帯の下に線',
    intent:
      '題の行の上下は現行版と同じ囲みの余白（16px）のまま、開いているときは塗りの下端に C と同じ細い線を囲みの端から端まで引き、中身は線の下に同じだけ空けて始める',
    spec: [
      ['帯の上下', '16px（囲みの余白）'],
      ['帯と中身のあいだ', '16px（線の下から）'],
      ['塗り', 'hover だけ 6%'],
      ['帯の下の線', '1px・文字の色 16%'],
    ],
    tokens: {
      '--callout-row-band': '0',
      '--callout-row-gap': '1',
      ...fills('0%', '6%', '0%', '6%'),
      '--callout-row-rule-width': '1px',
    },
  },
  {
    id: '参考',
    name: '畳めない囲み',
    intent: '畳めない Callout。題と中身のあいだ、上下の余白の比べる相手',
    spec: [
      ['上下', '16px'],
      ['題と中身', '2px'],
    ],
  },
];

const columns: Column[] = [
  { label: '閉じている' },
  { label: '閉じて hover', preview: 'hover' },
  { label: '開いている' },
  { label: '開いて hover', preview: 'hover' },
  { label: 'フォーカス', note: '開いている・キーボード', preview: 'focus' },
];

function Cell({ column, candidate }: { column: Column; candidate: Candidate }) {
  const collapsible = candidate.id !== '参考';
  const open = column.label !== '閉じている' && column.label !== '閉じて hover';
  return (
    <div data-reading className="flex w-[320px] flex-col gap-4">
      <Callout
        status="info"
        title="インストールの手順"
        collapsible={collapsible}
        defaultOpen={open}
      >
        pnpm add @kazuemon/ui のあと、アプリの入口で CSS を読み込みます。
      </Callout>
      <Callout
        status="warning"
        icon={false}
        title="古い版から上げるとき"
        collapsible={collapsible}
        defaultOpen={open}
      >
        v1 の size の値は v2 で変わりました。
      </Callout>
    </div>
  );
}

function Description({ density }: { density: string }) {
  return (
    <>
      <p>
        決定: 既定は現行版（塗りを題の上下にそろえる）。E（現行版の高さのまま、開いているとき塗りの下端に細い線を引く）も選べる。A〜D は採らない。ユーザーの返事:「Callout の開ける形ですが、Accordion のような挙動にするといい感じな気がしています。現状の見た目はちょっとイマイチですね」→ 比較を見て →「5981 は現行版の高さでCの線を付けるとどうですか？」→ E を足した →「開けるようにした場合は現行で、Eも選べるという感じで。」
      </p>
      <p>
        畳める囲み（collapsible）の題の行の形を選びます。いまの形は、開いているときも塗りを題の上下にそろえるため、題と中身のあいだが畳めない囲み（参考の行）より広く空きます。
        A〜D
        は、題の行を開閉の行（Accordion・Collapsible）と同じ部品の高さの帯にし、中身を帯の下に置きます。
      </p>
      <p>
        行は案、列は状態です。各セルは、上が info（アイコンあり）、下が
        warning（アイコンなし）。この表は
        {density}
        の密度です。候補はトークンの上書きだけで作っています。既定は現行版、ほかに選べる形として E を採りました。
      </p>
    </>
  );
}

const renderCell = (column: Column, candidate: Candidate) => (
  <Cell column={column} candidate={candidate} />
);

export const Axis: Story = {
  name: '446 畳める囲みの題の行（マウス）',
  render: ({ pick }) => (
    <div data-density="fine">
      <Comparison
        index={446}
        axis="畳める囲みの題の行"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={renderCell}
      >
        <Description density="マウス（fine）" />
      </Comparison>
    </div>
  ),
};

export const Coarse: Story = {
  name: '446 畳める囲みの題の行（指）',
  render: ({ pick }) => (
    <div data-density="coarse">
      <Comparison
        index={446}
        axis="畳める囲みの題の行（指）"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={renderCell}
      >
        <Description density="指（coarse）" />
      </Comparison>
    </div>
  ),
};
