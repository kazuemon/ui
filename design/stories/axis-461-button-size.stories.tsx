import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlusIcon } from '@phosphor-icons/react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Icon } from '../../src/components/icon/Icon';
import { TextField } from '../../src/components/text-field/TextField';

// 軸 461: Button の小さい段（size="sm"）の高さ・文字・余白と、密度（マウス・指）との関係
const meta = {
  title: 'Design Review/461 ボタンの小さい段',
  id: 'design-review-461-button-size',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      focusVisible: ['[data-preview="focus"] button'],
    },
  },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '段は 1 つだけ',
    intent:
      'いまのボタン。大きさの段がなく、表の行や小さな面の中でも 44px のまま。この行だけ size を渡さずに描く',
    spec: [
      ['高さ', 'マウス 44px・指 44px'],
      ['文字', 'マウス 16px・指 14px'],
      ['左右の余白', '16px'],
      ['アイコン', 'マウス 20px・指 16px'],
    ],
  },
  {
    id: 'A',
    name: 'どちらの密度も 36px',
    intent:
      '密度によらず 36px にする。指でも小さくなり、押せる高さ 44px を割る（原則 11 の「マウスでも、指で押せる大きさを保つ」と逆向き）。比べるための基準',
    spec: [
      ['高さ', 'マウス 36px・指 36px'],
      ['文字', '14px（行 20px）'],
      ['左右の余白', '12px'],
      ['アイコン', '16px'],
    ],
    tokens: {
      '--spacing-control-sm-fine': '36px',
      '--spacing-control-sm-coarse': '36px',
      '--spacing-control-x-sm': '12px',
      '--text-control-sm': '14px',
      '--leading-control-sm': '20px',
      '--spacing-icon-sm': '16px',
    },
  },
  {
    id: 'B',
    name: 'マウスは 36px・指は 44px のまま',
    intent:
      'マウスでだけ低くする。指では高さを保ち、文字・左右の余白・アイコンだけが小さくなる（幅が詰まる）。入力欄に sm を足すときも同じ高さを読む',
    spec: [
      ['高さ', 'マウス 36px・指 44px'],
      ['文字', '14px（行 20px）'],
      ['左右の余白', '12px'],
      ['アイコン', '16px'],
    ],
    tokens: {
      '--spacing-control-sm-fine': '36px',
      '--spacing-control-sm-coarse': '44px',
      '--spacing-control-x-sm': '12px',
      '--text-control-sm': '14px',
      '--leading-control-sm': '20px',
      '--spacing-icon-sm': '16px',
    },
  },
  {
    id: 'C',
    name: 'マウスは 32px・指は 44px のまま',
    intent:
      'B よりマウスで一段低くする。表の行（行の高さ 40px 前後）に収まる。指では B と同じ。入力欄に足すと、24px の行に上下 4px で詰まって見えやすい',
    spec: [
      ['高さ', 'マウス 32px・指 44px'],
      ['文字', '14px（行 20px）'],
      ['左右の余白', '12px'],
      ['アイコン', '16px'],
    ],
    tokens: {
      '--spacing-control-sm-fine': '32px',
      '--spacing-control-sm-coarse': '44px',
      '--spacing-control-x-sm': '12px',
      '--text-control-sm': '14px',
      '--leading-control-sm': '20px',
      '--spacing-icon-sm': '16px',
    },
  },
  {
    id: 'D',
    name: 'マウスは 40px・指は 44px のまま',
    intent:
      'マウスで少しだけ低くする（以前のマウスの高さ）。md との差は小さく、文字と余白の差のほうが目立つ',
    spec: [
      ['高さ', 'マウス 40px・指 44px'],
      ['文字', '14px（行 20px）'],
      ['左右の余白', '12px'],
      ['アイコン', '16px'],
    ],
    tokens: {
      '--spacing-control-sm-fine': '40px',
      '--spacing-control-sm-coarse': '44px',
      '--spacing-control-x-sm': '12px',
      '--text-control-sm': '14px',
      '--leading-control-sm': '20px',
      '--spacing-icon-sm': '16px',
    },
  },
];

const columns: Column[] = [
  { label: 'マウス', note: 'md と sm を並べる（data-density="fine"）' },
  { label: '指', note: 'md と sm を並べる（data-density="coarse"）' },
  { label: 'フォーカス（マウス）', note: 'sm', preview: 'focus' },
  { label: '入力欄の横（マウス）', note: '入力欄は md のまま' },
  { label: '表の行（マウス）', note: '行末の操作' },
];

function SizeRow({ size }: { size: 'sm' | 'md' | undefined }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size={size} color="primary">
        保存
      </Button>
      <Button size={size} variant="outline">
        <Icon icon={PlusIcon} />
        追加
      </Button>
      <Button size={size} variant="underline">
        編集
      </Button>
      <Button size={size} iconOnly aria-label="追加" variant="outline">
        <Icon icon={PlusIcon} standalone />
      </Button>
    </div>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={461}
      axis="ボタンの小さい段"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const sm = candidate.id === '現行版' ? undefined : 'sm';
        switch (column.label) {
          case 'マウス':
          case '指':
            return (
              <div
                data-density={column.label === '指' ? 'coarse' : 'fine'}
                className="flex flex-col gap-3"
              >
                <SizeRow size="md" />
                <SizeRow size={sm} />
              </div>
            );
          case 'フォーカス（マウス）':
            return (
              <div data-density="fine">
                <Button size={sm} variant="outline">
                  編集
                </Button>
              </div>
            );
          case '入力欄の横（マウス）':
            return (
              <div data-density="fine" className="flex w-[300px] items-end gap-2">
                <TextField accessibleName="メールアドレス" placeholder="name@example.com" />
                <Button size={sm} color="primary">
                  招待
                </Button>
              </div>
            );
          default:
            return (
              <div
                data-density="fine"
                className="flex w-[300px] items-center justify-between border-y border-line py-1"
              >
                <span className="text-sm">請求書 2026-09</span>
                <Button size={sm} variant="underline">
                  ダウンロード
                </Button>
              </div>
            );
        }
      }}
    >
      <p>
        Button に大きさ（size）を足しました。sm
        は高さ・文字・左右の余白・アイコンを、ボタンの中だけ小さい段に差し替えます。中の回る円も一緒に小さくなります。
        高さはマウスと指で別の値を持ち、指のときは押せる高さ 44px
        を割らないようにできます（見えない押せる範囲は足しません）。
      </p>
      <p>
        選ぶのは、マウスの高さと、指でも低くするかです。あとで入力欄（TextField・Select
        など）にも同じ size を足すので、そのときは同じ高さを読んで、横に並んだ sm
        どうしの高さがそろいます。どれを既定の sm にするかも教えてください。
      </p>
    </Comparison>
  ),
};
