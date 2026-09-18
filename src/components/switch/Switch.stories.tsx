import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect, fn } from 'storybook/test';

import { Switch } from './Switch';
import { DensityPair, Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

const colors = ['primary', 'secondary', 'neutral'] as const;
const placements = ['start', 'end'] as const;
const captionAppearances = ['plain', 'surface'] as const;
const frames = ['none', 'card', 'divided'] as const;
const longCaption = 'オンにすると、新しい記事が公開されたときにメールでお知らせします。';

// トラックと同じ行（部品の外枠）の中の要素。ラベルは label、キャプションは p
const partOf = (track: Element, selector: string) => {
  const part = track.parentElement?.querySelector(selector);
  if (!part) throw new Error(`${selector} が見つかりません`);
  return part;
};
const rowOf = (track: Element) => {
  if (!track.parentElement) throw new Error('行が見つかりません');
  return track.parentElement;
};

// 行の上端から、トラックとラベルの上端までの距離（キャプションの有無で変わらないことを確かめる）
const offsets = (track: Element) => {
  const top = rowOf(track).getBoundingClientRect().top;
  return {
    track: track.getBoundingClientRect().top - top,
    label: partOf(track, 'label').getBoundingClientRect().top - top,
  };
};

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
          '- トラックとラベルは、部品の高さの1行に並べます。`caption` はその下、ラベルの始まりにそろえて小さいグレーの文字で置きます。キャプションがあってもなくても、長くても、トラックとラベルの位置は変わりません。',
          '- `captionAppearance="surface"` にすると、キャプションをラベルの列に敷いた淡いグレーの面に出します。既定は面なし（`plain`）です。',
          '- `frame` を付けると、行の範囲を線で描き、行のどこを押しても切り替わります。このときトラックは行の縦の中央に置きます。',
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
    captionAppearance: 'plain',
    frame: 'none',
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
    captionAppearance: { control: 'inline-radio', options: captionAppearances },
    frame: { control: 'inline-radio', options: frames },
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
  tags: ['visual'],
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

export const CaptionAppearance: Story = {
  name: 'キャプションの見た目',
  parameters: {
    controls: { include: ['color', 'togglePlacement'] },
    docs: {
      description: {
        story:
          '`plain`（既定）はキャプションをラベルのすぐ下に置きます。`surface` はラベルの列に淡いグレーの面を敷いて出します。説明を、トラックとラベルの1行と分けて読ませたいときに使います。どちらでも、キャプションの有無や長さでトラックとラベルは動きません。',
      },
    },
  },
  render: (args) => (
    <Gallery columnWidth="20rem">
      {captionAppearances.map((appearance) => (
        <Specimen key={appearance} label={appearance === 'plain' ? 'plain（既定）' : 'surface'}>
          <div className="flex flex-col gap-2">
            <Switch
              {...args}
              captionAppearance={appearance}
              label="お知らせを受け取る"
              defaultChecked
            />
            <Switch
              {...args}
              captionAppearance={appearance}
              label="メールで受け取る"
              caption={longCaption}
            />
          </div>
        </Specimen>
      ))}
    </Gallery>
  ),
  play: async ({ canvasElement }) => {
    // 上から plain のキャプションなし・あり、surface のキャプションなし・あり
    const [plainOnly, plainCaption, surfaceOnly, surfaceCaption] = [
      ...canvasElement.querySelectorAll('[role="switch"]'),
    ];
    // キャプションがあっても、トラックとラベルは同じ位置
    for (const [only, captioned] of [
      [plainOnly, plainCaption],
      [surfaceOnly, surfaceCaption],
    ]) {
      const a = offsets(only);
      const b = offsets(captioned);
      await expect(b.track).toBeCloseTo(a.track, 1);
      await expect(b.label).toBeCloseTo(a.label, 1);
    }
    // plain は面なし、surface は面あり。どちらもラベルの始まりから
    await expect(getComputedStyle(partOf(plainCaption, 'p')).backgroundColor).toBe(
      'rgba(0, 0, 0, 0)'
    );
    await expect(getComputedStyle(partOf(surfaceCaption, 'p')).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)'
    );
    for (const track of [plainCaption, surfaceCaption]) {
      await expect(partOf(track, 'p').getBoundingClientRect().left).toBeCloseTo(
        partOf(track, 'label').getBoundingClientRect().left,
        1
      );
    }
  },
};

export const Frame: Story = {
  name: '行を囲む',
  parameters: {
    controls: { include: ['color', 'captionAppearance'] },
    docs: {
      description: {
        story:
          '`frame` を付けると、行の範囲を線で描き、行のどこを押しても切り替わります。設定の一覧のように、トラックを右（`togglePlacement="end"`）に置いて使います。囲みがあるときは、キャプションが長くても、トラックを行の縦の中央に置きます。hover で行が淡く塗られ、押しているあいだも行は濃くならず、ノブが縮みます。`divided` は、行を間をあけずに続けて置きます。',
      },
    },
  },
  render: (args) => (
    <Gallery columnWidth="20rem">
      {frames
        .filter((frame) => frame !== 'none')
        .map((frame) => (
          <Specimen key={frame} label={frame}>
            <div>
              <Switch
                {...args}
                frame={frame}
                togglePlacement="end"
                label="お知らせを受け取る"
                defaultChecked
              />
              <Switch
                {...args}
                frame={frame}
                togglePlacement="end"
                label="メールで受け取る"
                caption={longCaption}
              />
              <Switch
                {...args}
                frame={frame}
                togglePlacement="end"
                label="位置情報を使う"
                caption="この端末では使えません"
                disabled
              />
            </div>
          </Specimen>
        ))}
    </Gallery>
  ),
  play: async ({ canvasElement }) => {
    // トラックの縦の中央が、行（囲み）の縦の中央と同じ
    const tracks = [...canvasElement.querySelectorAll('[role="switch"]')];
    await expect(tracks).toHaveLength(6);
    for (const track of tracks) {
      const row = rowOf(track).getBoundingClientRect();
      const box = track.getBoundingClientRect();
      await expect(box.top + box.height / 2).toBeCloseTo(row.top + row.height / 2, 0);
    }
  },
};

// Show code: 表（Matrix）の中身は出ないので、代表の使い方を source.code に手で書く
export const Colors: Story = {
  name: '色',
  tags: ['visual'],
  parameters: {
    controls: { exclude: ['color', 'disabled', 'defaultChecked'] },
    docs: {
      description: {
        story:
          '行が ON のときの色（`color`）です。押せないときは、ON は色を残して薄くし、OFF はグレーのままにします。色を持たない `neutral` は、押せないときは ON も OFF も同じ淡いグレーの地にグレーのノブで、ノブの位置で状態を見せます。ラベルは押せない文字のグレーになります。',
      },
      source: sourceCode(`
        {/* color: primary・secondary・neutral（既定） */}
        <Switch label="お知らせを受け取る" color="primary" defaultChecked />
        <Switch label="お知らせを受け取る" color="primary" defaultChecked disabled />
      `),
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

// Show code: 表（Matrix）の中身は出ないので、行ごとの使い方を source.code に手で書く
export const States: Story = {
  name: '状態',
  tags: ['visual'],
  parameters: {
    // 押下は部品が pointer イベントで持つ（data-pressing）ので、pseudo-states では作れない。列の state から付ける
    pseudo: statePseudo({ focusVisible: '[role="switch"]' }),
    controls: { exclude: ['defaultChecked'] },
    docs: {
      description: {
        story:
          '押しているあいだはノブが少し縮みます。フォーカスの線はキーボードで操作したときだけ、トラックの外側に出ます。',
      },
      source: sourceCode(`
        {/* 押下・フォーカスの見た目は部品が受け持つ */}
        <Switch label="お知らせを受け取る" />
        <Switch label="お知らせを受け取る" defaultChecked />
      `),
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
      renderCell={(checked, { state }) => (
        <Switch
          {...args}
          defaultChecked={checked}
          data-pressing={state === 'active' ? '' : undefined}
        />
      )}
    />
  ),
};

export const Densities: Story = {
  name: '密度',
  tags: ['visual'],
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
