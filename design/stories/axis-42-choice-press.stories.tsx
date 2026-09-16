import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Checkbox } from '../../src/components/Checkbox';
import { Radio, RadioGroup } from '../../src/components/Radio';
import { Switch } from '../../src/components/Switch';
import { type Candidate, type Column, Comparison } from './Comparison';
import { keepSwitchCaptionAsCompared, keepToggleColorAsCompared } from './pins';

// 後半の軸 42: チェックボックスとラジオを押したときの動き（原則3）
// いまは押しても何も変わらない。原則3「押したときは、押せるものすべてが一段沈む」「指で操作するときは、押したときの変化を hover より明らかに付ける」
// 変えるのは次のトークンだけ（src/components/Checkbox.tsx が読む。ラジオも同じ箱）
//   --choice-press-depth: 下へ沈む深さ
//   --choice-press-scale: 箱の縮み（1 で縮まない）
//   --choice-press-darken: 選んでいない箱の塗り（hover の塗り）に混ぜる本文の色の割合
//   --choice-on-press-darken: 選んだ箱の塗り（部品の色）に混ぜる黒の割合
// 動きの長さと緩急は、どの案もボタンの押下と同じ（--duration-press・--ease-press）

interface Values {
  depth: string;
  scale: number;
  darken: number;
  onDarken: number;
}

const candidate = (id: string, name: string, intent: string, v: Values): Candidate => ({
  id,
  name,
  intent,
  spec: [
    ['沈む', v.depth === '0px' ? 'なし' : 'ボタンと同じ 1px'],
    ['縮む', v.scale === 1 ? 'なし' : `${v.scale} 倍`],
    [
      '塗り',
      v.darken === 0
        ? 'hover のまま'
        : `選んでいない箱は hover に本文の色 ${v.darken}%、選んだ箱は黒 ${v.onDarken}%`,
    ],
  ],
  tokens: {
    '--choice-press-depth': v.depth,
    '--choice-press-scale': String(v.scale),
    '--choice-press-darken': `${v.darken}%`,
    '--choice-on-press-darken': `${v.onDarken}%`,
  },
});

const sink = 'var(--flat-press-depth)';

const candidates: Candidate[] = [
  candidate(
    '現行版',
    '変えない',
    '押しても箱は変わらない。マウスでは hover の塗りのまま、指では何も変わらない。',
    { depth: '0px', scale: 1, darken: 0, onDarken: 0 }
  ),
  candidate(
    'A',
    '沈む',
    '押しているあいだ、箱がボタンと同じ深さ（1px）・長さ・緩急で下へ沈む。横の文字は動かない。',
    { depth: sink, scale: 1, darken: 0, onDarken: 0 }
  ),
  candidate(
    'B',
    '縮む',
    '押しているあいだ、箱が 0.9 倍に縮む。トグルのノブが押すと縮むのと同じ考え。',
    { depth: '0px', scale: 0.9, darken: 0, onDarken: 0 }
  ),
  candidate(
    'C',
    '塗りが濃くなる',
    '押しているあいだ、塗りが hover よりもう一段濃くなる。選んだ箱も部品の色が少し暗くなる。形は変えない。',
    { depth: '0px', scale: 1, darken: 8, onDarken: 15 }
  ),
  candidate('D', '縮む＋濃くなる', 'B と C を合わせる。形と塗りの両方が変わる。', {
    depth: '0px',
    scale: 0.9,
    darken: 8,
    onDarken: 15,
  }),
  candidate(
    'E',
    '沈む＋濃くなる',
    'A と C を合わせる。平らなボタン（枠線のボタン）を押したときと同じ組み合わせ（沈んで塗りが濃くなる）。',
    { depth: sink, scale: 1, darken: 8, onDarken: 15 }
  ),
];

const columns: Column[] = [
  {
    label: '箱を押しているあいだ',
    note: '箱を押している見た目を固定。上から未選択・選択、ラジオの未選択・選択',
    preview: 'press',
  },
  {
    label: '横の文字を押しているあいだ',
    note: '横の文字を押している見た目を固定。箱も同じ変化をするか',
    preview: 'label-press',
  },
  { label: 'hover', note: '箱に hover した見た目を固定。押したときと比べる', preview: 'hover' },
  {
    label: '触って確かめる',
    note: '本物。箱や横の文字を押して、動きを確かめてください',
  },
  {
    label: 'トグルと並べる',
    note: '押している見た目を固定。トグルはノブが縮む（いまの動き）。上がマウス用・下が指用',
    preview: 'switch-press',
  },
];

const Note = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-bold text-fg-subtle">{children}</p>
);

const Items = () => (
  <>
    <Checkbox label="メール" />
    <Checkbox label="電話" defaultChecked />
    <RadioGroup label="配送の時間" defaultValue="pm">
      <Radio value="am" label="午前" />
      <Radio value="pm" label="午後" />
    </RadioGroup>
  </>
);

const ColoredItems = () => (
  <>
    <Checkbox label="青" color="primary" defaultChecked />
    <Checkbox label="ピンク" color="secondary" defaultChecked />
  </>
);

const WithSwitch = () => (
  <div className="flex flex-col">
    <Switch label="お知らせ" defaultChecked />
    <Checkbox label="メール" />
    <Checkbox label="電話" defaultChecked />
  </div>
);

// 各セルの左がマウス用、右が指用。密度はセルの中で固定する
// 「トグルと並べる」だけは上下に積む（半分の幅ではトグルの文字が折り返すため）
const Cell = ({ column }: { column: Column }) => {
  const stacked = column.preview === 'switch-press';
  return (
    <div className={stacked ? 'flex flex-col gap-6' : 'grid grid-cols-2 gap-4'}>
      {(['fine', 'coarse'] as const).map((density) => (
        <div key={density} data-density={density} className="flex min-w-0 flex-col gap-3">
          <Note>{density === 'fine' ? 'マウス用' : '指用'}</Note>
          {stacked ? (
            <WithSwitch />
          ) : (
            <>
              <Items />
              {column.preview === 'press' && <ColoredItems />}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

interface ComparisonArgs {
  pick: string;
}

const boxes = ['[role="checkbox"]', '[role="radio"]'];
const at = (preview: string, targets: string[]) =>
  targets.map((target) => `[data-preview="${preview}"] ${target}`);

const meta = {
  title: 'Design Review/42 チェックボックスとラジオを押したときの動き',
  id: 'design-review-42-choice-press',
  decorators: [keepSwitchCaptionAsCompared, keepToggleColorAsCompared],
  parameters: {
    layout: 'fullscreen',
    // 押しているあいだは hover も当てる（押すときはポインタが上にあるため）
    pseudo: {
      hover: [
        ...at('hover', boxes),
        ...at('press', boxes),
        ...at('label-press', ['label']),
        ...at('switch-press', ['[role="checkbox"]', '[role="switch"]']),
      ],
      active: [
        ...at('press', boxes),
        ...at('label-press', ['label']),
        ...at('switch-press', ['[role="checkbox"]', '[role="switch"]']),
      ],
    },
  },
  args: { pick: 'E' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D', 'E'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={42}
      axis="チェックボックスとラジオを押したときの動き"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        <strong className="text-fg">決まったこと</strong>
        （ADR-0063）。原則3は「押したときは、押せるものすべてが一段沈む」「指で操作するときは、押したときの変化を
        hover
        より明らかに付ける」としています。いまのチェックボックスとラジオは、押しても何も変わりません。マウスでは
        hover の塗りのまま、指では hover がないので、押したことが箱に出ません。
      </p>
      <p>
        ここで選ぶのは、押しているあいだの箱の変わり方です。A は沈む（ボタンと同じ 1px）、B
        は縮む（0.9 倍）、C は塗りが hover よりもう一段濃くなる、D は B と C、E は A と C
        を合わせたものです。どの案も、長さと緩急はボタンの押下と同じです。横の文字は本体の一部なので、横の文字を押しても箱が同じように変わります。押せない箱は変わりません。
      </p>
      <p>
        各セルの左がマウス用、右が指用です（右端の列だけ、上がマウス用・下が指用です）。左の3列は状態を固定しています。「触って確かめる」の列で、箱や横の文字を実際に押してください。指での違いは、スマホで開いて押すと分かります。
      </p>
      <p>どれを既定にするかを一言添えてください。</p>
    </Comparison>
  ),
};
