import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Chip } from '../../src/components/chip/Chip';
import {
  SegmentedControl,
  SegmentedControlItem,
  type SegmentedControlColor,
} from '../../src/components/segmented-control/SegmentedControl';
import { Toggle } from '../../src/components/toggle/Toggle';

// 軸 403（2 ラウンド目）: 色なし（neutral）の淡い面のつまみ（variant="soft"）の塗り
//   1 ラウンド目の決定: surface を既定にし、filled・soft と color（neutral・primary・secondary）を選べる（コミット 9fd9e87 の比較）
//   neutral の soft は、淡いグレー（--color-neutral）のつまみが入力欄のグレーの溝とほとんど同じで見分けにくいので、塗りを比べ直す
//   A・B は SegmentedControl だけを変える（--segmented-control-neutral-subtle）。C は --color-neutral ごと変え、Toggle・Chip もそろって濃くなる
const meta = {
  title: 'Design Review/403 SegmentedControl のつまみの面',
  id: 'design-review-403-segmented-control-knob',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B' },
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
    name: 'Chip・Toggle と同じ淡いグレー',
    intent:
      '色なしの淡い面を、Chip・Toggle の neutral soft と同じ淡いグレーにする。溝（入力欄のグレー）とほとんど同じ明るさで、つまみの位置は太字でしか分からない',
    spec: [
      ['つまみ', '淡いグレー（Chip・Toggle の neutral soft と同じ）'],
      ['Toggle・Chip', 'そのまま'],
    ],
    tokens: { '--segmented-control-neutral-subtle': 'var(--color-neutral)' },
  },
  {
    id: 'A',
    name: '一段濃いグレー（部品だけ）',
    intent:
      'つまみを入力欄の prefix・スイッチの OFF・チェックボックスの箱と同じ、一段濃いグレーにする。SegmentedControl だけを変え、Toggle・Chip の neutral soft はそのまま',
    spec: [
      ['つまみ', '入力欄の prefix のグレー'],
      ['Toggle・Chip', 'そのまま（淡いグレー）'],
    ],
    tokens: { '--segmented-control-neutral-subtle': 'var(--color-field-addon)' },
  },
  {
    id: 'B',
    name: '濃いグレーを溶かした面（部品だけ）',
    intent:
      'filled の濃いグレーを白に 3 割半ほど溶かした面にする。A よりもう一段濃く、primary・secondary の淡い面と同じくらい溝から浮く。Toggle・Chip はそのまま',
    spec: [
      ['つまみ', '濃いグレー 35%・白 65%'],
      ['Toggle・Chip', 'そのまま（淡いグレー）'],
    ],
    tokens: {
      '--segmented-control-neutral-subtle':
        'color-mix(in oklab, var(--color-neutral-strong) 35%, var(--color-surface))',
    },
  },
  {
    id: 'C',
    name: '一段濃いグレー（Toggle・Chip もそろえる）',
    intent:
      '色なしの淡い面（--color-neutral）そのものを一段濃いグレーにする。SegmentedControl・Toggle・Chip の neutral soft がそろって濃くなる',
    spec: [
      ['つまみ', '入力欄の prefix のグレー'],
      ['Toggle・Chip', '同じグレーに濃くなる'],
    ],
    tokens: {
      '--color-neutral': 'var(--color-field-addon)',
      '--segmented-control-neutral-subtle': 'var(--color-field-addon)',
    },
  },
];

const columns: Column[] = [
  { label: 'neutral', note: 'soft' },
  { label: 'primary', note: 'soft' },
  { label: 'secondary', note: 'soft' },
  { label: '参考: Toggle・Chip', note: 'neutral の soft（ON）と Chip' },
];

const colorOf: Record<string, SegmentedControlColor> = {
  neutral: 'neutral',
  primary: 'primary',
  secondary: 'secondary',
};

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={403}
      axis="SegmentedControl のつまみの面"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        if (column.label === '参考: Toggle・Chip')
          return (
            <div className="flex items-center gap-3">
              <Toggle variant="soft" defaultPressed>
                太字
              </Toggle>
              <Chip>下書き</Chip>
            </div>
          );
        return (
          <SegmentedControl<string>
            accessibleName="表示"
            defaultValue="board"
            variant="soft"
            color={colorOf[column.label]}
          >
            <SegmentedControlItem value="board">ボード</SegmentedControlItem>
            <SegmentedControlItem value="table">表</SegmentedControlItem>
            <SegmentedControlItem value="calendar">カレンダー</SegmentedControlItem>
          </SegmentedControl>
        );
      }}
    >
      <p>
        決定: B（濃いグレーを 35% 混ぜたつまみ）。SegmentedControl だけを変え、Toggle・Chip
        はそのまま（ADR は記録のときに振る）。hover
        の塗りとつまみが同じ色だと、押した瞬間に同じ色の面が滑ってきて見えるため。グレーの地に置くときは
        frame="outline" を勧める。
      </p>
      <p>
        1 ラウンド目の決定:
        白い面（surface）を既定にし、部品の色の塗り（filled）と淡い面（soft）、色（neutral・primary・secondary）もそれぞれ選べる。
      </p>
      <p>
        2 ラウンド目: 色なし（neutral）の soft
        は、つまみが溝とほとんど同じ明るさで見分けにくいので、つまみの塗りを比べ直します。primary・secondary
        の soft と並べて、neutral だけ浮いたり沈んだりしないかを見てください。A・B は
        SegmentedControl だけを変え、C は Toggle・Chip の neutral soft
        もそろえて濃くします（右の参考の列が変わります）。
      </p>
    </Comparison>
  ),
};
