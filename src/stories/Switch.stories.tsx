import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { fn } from 'storybook/test';

import { Switch } from '../components/Switch';
import { DensityPair, Gallery, Matrix, Specimen } from './story-parts';
import { type MatrixColumn, statePseudo } from './story-states';

const colors = ['primary', 'secondary', 'neutral'] as const;
const placements = ['start', 'end'] as const;

const valueColumns: (MatrixColumn & { checked: boolean; disabled: boolean })[] = [
  { label: 'OFF', checked: false, disabled: false },
  { label: 'ON', checked: true, disabled: false },
  { label: '押せない OFF', checked: false, disabled: true },
  { label: '押せない ON', checked: true, disabled: true },
];

const meta = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'ON と OFF を切り替えるトグルです。トラックとラベル（とキャプション）を横に並べます。ラベルを押しても切り替わります。',
          '',
          '- `togglePlacement` はトラックの位置です。`start`（既定）は文字の左、`end` は文字の右です。設定の一覧のように、トラックを行の右端にそろえて並べたいときは `end` にします。',
          '- `color` は ON のときの色です。指定しないときは濃いグレー（`neutral`）です。OFF のトラックは、色にかかわらず入力欄と同じグレーです。',
          '- 押せないときは、トラックを薄くし、ラベルをほかの押せない文字と同じグレーにします。キャプションは説明なので、読めるままです。',
          '- 状態は `defaultChecked` で部品に任せるか、`checked`・`onCheckedChange` で外から持ちます。',
        ].join('\n'),
      },
    },
  },
  // Controls で既定の値を選んだ状態から始める（部品の既定と同じ値）
  args: {
    label: 'お知らせを受け取る',
    color: 'neutral',
    togglePlacement: 'start',
    disabled: false,
    defaultChecked: false,
    onCheckedChange: fn(),
  },
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    // 表の「Default」は、部品の引数の既定値からしか読まれない。既定値を持たない props はここで補う
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    togglePlacement: { control: 'inline-radio', options: placements },
    disabled: { control: 'boolean' },
    defaultChecked: { control: 'boolean' },
    checked: { control: false },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow = (Story: () => ReactNode) => (
  <div className="max-w-sm">
    <Story />
  </div>
);

export const Playground: Story = {
  name: '基本',
  decorators: [narrow],
};

export const Placement: Story = {
  name: 'トラックの位置',
  parameters: {
    controls: { include: ['color'] },
    docs: {
      description: {
        story:
          '`start`（既定）はトラックを文字の左に、`end` は右に置きます。`end` は、設定の一覧のように行の右端にトラックをそろえたいときに使います。最後の行は押せないトグルです。',
      },
    },
  },
  render: (args) => (
    <Gallery columnWidth="20rem">
      {placements.map((placement) => (
        <Specimen key={placement} label={placement === 'start' ? 'start（既定）' : 'end'}>
          <div className="flex flex-col gap-2">
            <Switch
              {...args}
              togglePlacement={placement}
              label="メールで受け取る"
              caption="週に1回、まとめて届きます"
              defaultChecked
            />
            <Switch
              {...args}
              togglePlacement={placement}
              label="プッシュ通知"
              caption="コメントがついたときに届きます"
            />
            <Switch
              {...args}
              togglePlacement={placement}
              label="位置情報を使う"
              caption="この端末では使えません"
              disabled
            />
          </div>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Colors: Story = {
  name: '色',
  parameters: {
    controls: { exclude: ['color', 'disabled', 'defaultChecked'] },
    docs: {
      description: {
        story:
          '行が ON のときの色（`color`）です。押せないときは、ON は色を残して薄くし、OFF はグレーのままにします。ラベルは押せない文字のグレーになります。',
      },
    },
  },
  render: (args) => (
    <Matrix
      rows={colors}
      rowLabel={(color) => color}
      columns={valueColumns}
      columnWidth="13rem"
      renderCell={(color, { checked, disabled }) => (
        <Switch {...args} color={color} defaultChecked={checked} disabled={disabled} />
      )}
    />
  ),
};

export const States: Story = {
  name: '状態',
  parameters: {
    pseudo: statePseudo({ active: '[role="switch"]', focusVisible: '[role="switch"]' }),
    controls: { exclude: ['defaultChecked'] },
    docs: {
      description: {
        story:
          '押しているあいだはノブが少し縮みます。フォーカスの線はキーボードで操作したときだけ、トラックの外側に出ます。',
      },
    },
  },
  render: (args) => (
    <Matrix
      rows={[false, true]}
      rowLabel={(checked) => (checked ? 'ON' : 'OFF')}
      columns={[
        { label: '通常' },
        { label: '押下', state: 'active' },
        { label: 'フォーカス（キーボード）', state: 'focus' },
      ]}
      columnWidth="13rem"
      renderCell={(checked) => <Switch {...args} defaultChecked={checked} />}
    />
  ),
};

export const Densities: Story = {
  name: '密度',
  parameters: {
    docs: {
      description: {
        story:
          '行の高さ・トラック・ノブの大きさは入力方式で切り替わります。ツールバーの「密度」でも切り替えられます。',
      },
    },
  },
  render: (args) => (
    <DensityPair>
      <div className="w-72">
        <Switch {...args} caption="週に1回、まとめて届きます" defaultChecked />
      </div>
    </DensityPair>
  ),
};
