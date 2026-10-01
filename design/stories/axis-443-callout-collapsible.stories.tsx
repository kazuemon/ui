import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Callout } from '../../src/components/callout/Callout';
import { statePseudo } from '../../src/stories/story-states';

// 軸 443: Callout の畳める形（collapsible）。開閉の印の位置と、題の行の hover の塗り
const meta = {
  title: 'Design Review/443 畳める囲み',
  id: 'design-review-443-callout-collapsible',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: '[data-slot="callout-trigger"]',
      focusVisible: '[data-slot="callout-trigger"]',
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
    name: '畳めない',
    intent: 'いまの囲み。題と中身がいつも見えている。比べるための基準',
    spec: [
      ['印の位置', '—'],
      ['hover の塗り', '—'],
    ],
  },
  {
    id: 'A',
    name: '印は右端・淡く塗る',
    intent:
      '開閉の印（▼、開くと ▲）を行の右端に置く。Collapsible の既定と同じ位置。載せると、題の行を囲みの文字の色 6% で塗る。閉じているときは囲み全体、開いているときは題の行だけ',
    spec: [
      ['印の位置', '右端'],
      ['hover の塗り', '文字の色 6%'],
    ],
    tokens: {
      '--callout-indicator-margin-start': 'auto',
      '--callout-trigger-hover-mix': '6%',
    },
  },
  {
    id: 'B',
    name: '印は題のすぐ後ろ・淡く塗る',
    intent:
      '印を題の直後に置く。題と印がひとかたまりで読め、幅の広い囲みでも目が右端まで飛ばない。塗りは A と同じ',
    spec: [
      ['印の位置', '題の後ろ（間 8px）'],
      ['hover の塗り', '文字の色 6%'],
    ],
    tokens: {
      '--callout-indicator-margin-start': '0px',
      '--callout-trigger-hover-mix': '6%',
    },
  },
  {
    id: 'C',
    name: '印は右端・はっきり塗る',
    intent:
      'A の位置で、塗りを 10% にする。淡い面の上でも押せることがはっきり分かる。開閉の行（Collapsible）の hover より少し濃い',
    spec: [
      ['印の位置', '右端'],
      ['hover の塗り', '文字の色 10%'],
    ],
    tokens: {
      '--callout-indicator-margin-start': 'auto',
      '--callout-trigger-hover-mix': '10%',
    },
  },
];

const columns: Column[] = [
  { label: '閉じている', note: 'soft・info' },
  { label: 'hover', note: '閉じている', preview: 'hover' },
  { label: 'フォーカス', note: 'キーボード', preview: 'focus' },
  { label: '開いて hover', note: 'soft・warning', preview: 'hover' },
  { label: '濃い塗り・hover', note: 'filled・danger', preview: 'hover' },
  { label: 'muted・開いている', note: 'アイコンなし' },
];

const body = 'pnpm add @kazuemon/ui のあと、アプリの入口で CSS を読み込みます。';

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={443}
      axis="畳める囲み"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const collapsible = candidate.id !== '現行版';
        switch (column.label) {
          case '開いて hover':
            return (
              <div data-reading className="w-[340px]">
                <Callout
                  status="warning"
                  title="古い版から上げるとき"
                  collapsible={collapsible}
                  defaultOpen
                >
                  v1 の size の値は v2 で変わりました。
                </Callout>
              </div>
            );
          case '濃い塗り・hover':
            return (
              <div data-reading className="w-[340px]">
                <Callout
                  status="danger"
                  variant="filled"
                  title="破壊的な変更"
                  collapsible={collapsible}
                >
                  v2 で size の値が変わりました。
                </Callout>
              </div>
            );
          case 'muted・開いている':
            return (
              <div data-reading className="w-[340px]">
                <Callout variant="muted" title="メモ" collapsible={collapsible} defaultOpen>
                  タブレットとマウスでは、浮かぶ選択肢のままです。
                </Callout>
              </div>
            );
          default:
            return (
              <div data-reading className="w-[340px]">
                <Callout status="info" title="インストールの手順" collapsible={collapsible}>
                  {body}
                </Callout>
              </div>
            );
        }
      }}
    >
      <p>
        Callout
        に畳める形（collapsible・defaultOpen）を足しました。題の行を押すと中身を開閉します。押せる範囲と塗りは、題の行から囲みの端まで広がります（閉じているときは囲み全体）。押しても濃くせず、沈めません（開閉の行と同じ）。
      </p>
      <p>
        選ぶのは、開閉の印の位置と、載せたときの塗りの濃さです。既定の推しは A
        です。題を見出しにする headingLevel は見た目を変えないので、比べていません。
      </p>
    </Comparison>
  ),
};
