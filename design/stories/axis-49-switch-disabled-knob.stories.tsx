import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fragment, type ReactNode } from 'react';

import { Switch } from '../../src/components/Switch';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 49: 押せない OFF のノブ
// 色つき（primary・secondary）の押せない OFF は、白いノブが押せない地（#F2F4F4）の上で 1.10:1 しかなく、ほとんど見えない
// 押せないものの地は、ON（色なし）も OFF もすべて #F2F4F4（直前の直し）。ここで選ぶのは、その上のノブの色
// 変えるのは次のトークンだけ（src/components/Switch.tsx が読む）
//   --color-switch-off-disabled-knob: 色つきの押せない OFF のノブの色
//   --switch-off-disabled-knob-own: そのノブに混ぜる部品の色の割合（srgb。0% は混ぜない）
//   --color-switch-neutral-disabled-knob: 色なしの押せないノブ（ON・OFF とも）
// 地の色（押せる OFF・押せない OFF・色なしの押せない ON）と薄さも、どの行も明示する

const ground = {
  '--color-switch-off': 'var(--color-field-addon)',
  '--color-switch-off-disabled': 'var(--color-field)',
  '--color-switch-neutral-on-disabled': 'var(--color-field)',
  '--switch-off-disabled-opacity': '1',
  '--switch-neutral-disabled-opacity': '1',
  '--disabled-opacity': '0.4',
};

const groundSpec: Candidate['spec'][number] = [
  '地',
  '押せる OFF #E1E3E4・押せないもの #F2F4F4（比 1.17）',
];

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '白いノブ（色つき）・グレーのノブ（色なし）',
    intent:
      '色つきの押せない OFF は、押せる OFF と同じ白いノブで、影だけを消す。白いノブは地にほとんど溶ける。色なしはグレーのノブ。',
    spec: [
      ['ノブ（色つきの OFF）', '白 #FFFFFF・地との比 1.10'],
      ['ノブ（色なし）', '#A3A5A6・地との比 2.24（ON・OFF とも）'],
      groundSpec,
      ['押せる OFF と', '色つきはノブが同じ白。地の差（1.17）と影だけ'],
      ['原則1', '色のない OFF を、グレーに寄せていない'],
    ],
    tokens: {
      ...ground,
      '--color-switch-off-disabled-knob': 'var(--color-surface)',
      '--switch-off-disabled-knob-own': '0%',
      '--color-switch-neutral-disabled-knob': 'var(--palette-gray-400)',
    },
  },
  {
    id: 'A',
    name: '色によらずグレー',
    intent:
      '色つきの押せない OFF のノブも、色なしと同じグレー（押せない文字の色）にする。押せない OFF は色によらず同じ見た目になる。',
    spec: [
      ['ノブ（色つきの OFF）', '#A3A5A6・地との比 2.24'],
      ['ノブ（色なし）', '#A3A5A6（同じ）'],
      groundSpec,
      ['押せる OFF と', 'ノブが白からグレーに（比 2.47）'],
      ['原則1', '書き換えなし。色のない OFF をグレーに寄せる'],
    ],
    tokens: {
      ...ground,
      '--color-switch-off-disabled-knob': 'var(--palette-gray-400)',
      '--switch-off-disabled-knob-own': '0%',
      '--color-switch-neutral-disabled-knob': 'var(--palette-gray-400)',
    },
  },
  {
    id: 'B',
    name: '色によらず濃いグレー',
    intent:
      '押せない地に載るノブを、キャプションと同じ濃いグレーにする（色つきの OFF、色なしの OFF と ON）。ノブの位置はいちばんはっきりするが、押せないのに押せる OFF の白いノブより濃い。',
    spec: [
      ['ノブ（色つきの OFF）', '#6E787D・地との比 4.09'],
      ['ノブ（色なし）', '#6E787D（ON・OFF とも）'],
      groundSpec,
      ['押せる OFF と', 'ノブが白から濃いグレーに（比 4.52）'],
      ['原則1', '書き換えが要る。「グレーに寄せて薄く」と逆向き'],
    ],
    tokens: {
      ...ground,
      '--color-switch-off-disabled-knob': 'var(--color-fg-subtle)',
      '--switch-off-disabled-knob-own': '0%',
      '--color-switch-neutral-disabled-knob': 'var(--color-fg-subtle)',
    },
  },
  {
    id: 'C',
    name: '部品の色を薄くしたノブ',
    intent:
      '色つきの押せない OFF のノブを、部品の色を 40% にした色（押せない ON のトラックと同じ色）にする。押せない ON と、色と白が入れ替わった形。色なしは A と同じ。',
    spec: [
      ['ノブ（色つきの OFF）', '青 #A7C7F2（地との比 1.57）・ピンク #FBADC7（1.60）'],
      ['ノブ（色なし）', '#A3A5A6・地との比 2.24'],
      groundSpec,
      ['押せる OFF と', 'ノブが白から薄い色に（比 1.74・1.76）。色相で分かる'],
      ['原則1', '書き換えが要る。押せる OFF にない色が、押せなくすると付く'],
    ],
    tokens: {
      ...ground,
      '--color-switch-off-disabled-knob': 'var(--color-surface)',
      '--switch-off-disabled-knob-own': '40%',
      '--color-switch-neutral-disabled-knob': 'var(--palette-gray-400)',
    },
  },
];

const columns: Column[] = [
  {
    label: '状態（上がマウス用・下が指用）',
    note: '行は色、列は状態。ノブと地だけを見るため、ラベルは読み上げ用に隠す',
  },
  {
    label: '行全体を押せる形（左がマウス用・右が指用）',
    note: 'frame="card"・"divided"、トラックは右',
  },
];

const colors = ['primary', 'secondary', 'neutral'] as const;
const states = [
  { label: 'OFF', checked: false, disabled: false },
  { label: 'ON', checked: true, disabled: false },
  { label: '押せない OFF', checked: false, disabled: true },
  { label: '押せない ON', checked: true, disabled: true },
];

const Note = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-bold text-fg-subtle">{children}</p>
);

// 色 × 状態の表。ラベルは隠し、トラックだけを並べる
const StateGrid = () => (
  <div className="grid w-fit grid-cols-[auto_repeat(4,max-content)] items-center gap-x-4">
    <span />
    {states.map((state) => (
      <Note key={state.label}>{state.label}</Note>
    ))}
    {colors.map((color) => (
      <Fragment key={color}>
        <Note>{color}</Note>
        {states.map((state) => (
          <Switch
            key={state.label}
            color={color}
            label={<span className="sr-only">{`${color} ${state.label}`}</span>}
            defaultChecked={state.checked}
            disabled={state.disabled}
          />
        ))}
      </Fragment>
    ))}
  </div>
);

const FrameRows = () => (
  <div className="flex flex-col gap-3">
    <Note>card</Note>
    <div>
      <Switch frame="card" togglePlacement="end" color="primary" label="primary・OFF" />
      <Switch
        frame="card"
        togglePlacement="end"
        color="primary"
        label="primary・押せない OFF"
        disabled
      />
      <Switch
        frame="card"
        togglePlacement="end"
        color="primary"
        label="primary・押せない ON"
        disabled
        defaultChecked
      />
    </div>
    <Note>divided</Note>
    <div>
      <Switch
        frame="divided"
        togglePlacement="end"
        color="secondary"
        label="secondary・押せない OFF"
        caption="この端末では使えません"
        disabled
      />
      <Switch
        frame="divided"
        togglePlacement="end"
        color="neutral"
        label="neutral・押せない OFF"
        disabled
      />
      <Switch
        frame="divided"
        togglePlacement="end"
        color="neutral"
        label="neutral・押せない ON"
        disabled
        defaultChecked
      />
    </div>
  </div>
);

const densities = ['fine', 'coarse'] as const;

const Cell = ({ column }: { column: Column }) => {
  const frames = column.label.startsWith('行全体');
  return (
    <div className={frames ? 'grid grid-cols-2 gap-6' : 'flex flex-col gap-6'}>
      {densities.map((density) => (
        <div key={density} data-density={density} className="flex min-w-0 flex-col gap-3">
          <Note>{density === 'fine' ? 'マウス用' : '指用'}</Note>
          {frames ? <FrameRows /> : <StateGrid />}
        </div>
      ))}
    </div>
  );
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/49 押せない OFF のノブ',
  id: 'design-review-49-switch-disabled-knob',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={49}
      axis="押せない OFF のノブ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        <strong className="text-fg">決まったこと</strong>（ADR-0069）。
        <strong className="text-fg">決まったこと</strong>
        。押せないトグルの地は、色なしの ON も OFF もすべて押せない OFF
        と同じ淡いグレー（#F2F4F4）です。色なしのノブはグレーで、状態はノブの位置で見せます。色つきの押せない
        ON は、色を残して薄くします（原則1）。
      </p>
      <p>
        <strong className="text-fg">決まったこと</strong>（ADR-0069）。
        問題。色つき（primary・secondary）の押せない OFF は、押せる OFF
        と同じ白いノブのままで、淡いグレーの地の上では 1.10:1 しかなく、ほとんど見えません。
      </p>
      <p>
        <strong className="text-fg">決まったこと</strong>（ADR-0069）。
        ここで選ぶのは、色つきの押せない OFF のノブの色です（B
        だけは、色なしのノブも同じ濃いグレーにします）。列は状態（OFF・ON・押せない OFF・押せない
        ON）を、マウス用と指用、行全体を押せる形の中で並べています。押せない OFF と押せない
        ON、押せない OFF と押せる OFF がそれぞれ見分けられるかを見てください。
      </p>
      <p>どれを既定にするかを一言添えてください。</p>
    </Comparison>
  ),
};
