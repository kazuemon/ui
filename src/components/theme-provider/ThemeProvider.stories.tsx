import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { ThemeProvider } from './ThemeProvider';
import { Button } from '../button/Button';
import { NumberFormat } from '../number-format/NumberFormat';
import { Popover } from '../popover/Popover';
import { Select } from '../select/Select';
import { Switch } from '../switch/Switch';
import { TextField } from '../text-field/TextField';
import { Time } from '../time/Time';
import { labelClass } from '../../stories/story-states';

const wards = ['千代田区', '中央区', '港区', '新宿区', '文京区'].map((label, i) => ({
  label,
  value: `ward-${i + 1}`,
}));

// 設定の画面の見本。ThemeProvider の中の部品は、密度と出し方を props なしで受け取る
function SettingsForm() {
  return (
    <div className="flex w-[20rem] flex-col gap-5">
      <TextField label="表示名" defaultValue="かずえもん" />
      <Select label="住所" prefix="東京都" placeholder="選んでください" items={wards} />
      <Switch label="新着をメールで受け取る" defaultChecked />
      <div className="flex gap-3">
        <Button color="primary">保存</Button>
        <Popover
          title="保存について"
          description="この端末だけに保存されます。"
          trigger={<Button appearance="outline">詳しく</Button>}
        >
          {null}
        </Popover>
      </div>
    </div>
  );
}

const meta = {
  title: 'Components/ThemeProvider',
  component: ThemeProvider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '中の部品に、密度・浮かぶ UI の出し方・描く場所・言語とタイムゾーンの既定をまとめて渡す入口です。アプリの根か、画面の一部を包みます。',
          '',
          '- `density`（既定は `auto`）: `auto` は入力方式（マウスか指か）に合わせます。`fine`・`coarse` は、入力方式にかかわらずその密度に固定します。包みの箱は作らないので、並べ方は変わりません。',
          '- `presentation`（既定は `auto`）: Select・Dialog・Popover の出し方の既定です。`auto` は指で操作していて画面が狭いときだけ、画面の下から出すシートにします。`popover` はいつも浮かべ、`sheet` はいつもシートにします。',
          '- `portalContainer`（既定は `document.body`）: 浮かぶ部分（選択肢・Dialog・Popover・Tooltip・Drawer）と `Portal` を描く場所です。',
          '- `locale`（既定は `ja-JP`）・`timeZone`（既定は `Asia/Tokyo`）: 日付と数を書く言語と、時刻を書くタイムゾーンです。Time・RelativeTime・NumberFormat が読みます（NumberFormat は `locale` だけ）。',
          '- 部品に `presentation`・`container`・`locale`・`timeZone` を書いたときは、部品の値が勝ちます。ThemeProvider を入れ子にすると、内側で書いた値だけが外側より勝ちます。',
        ].join('\n'),
      },
    },
  },
  args: { density: 'auto' },
  argTypes: {
    density: { control: 'inline-radio', options: ['auto', 'fine', 'coarse'] },
    presentation: {
      control: 'inline-radio',
      options: ['auto', 'popover', 'sheet'],
      table: { defaultValue: { summary: "'auto'" } },
    },
  },
} satisfies Meta<typeof ThemeProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  render: (args) => (
    <ThemeProvider {...args}>
      <SettingsForm />
    </ThemeProvider>
  ),
};

export const Density: Story = {
  tags: ['visual'],
  name: '密度を固定する',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-start gap-12">
      <div className="flex flex-col gap-3">
        <p className={labelClass}>density="fine"</p>
        <ThemeProvider density="fine">
          <SettingsForm />
        </ThemeProvider>
      </div>
      <div className="flex flex-col gap-3">
        <p className={labelClass}>density="coarse"</p>
        <ThemeProvider density="coarse">
          <SettingsForm />
        </ThemeProvider>
      </div>
    </div>
  ),
};

// 画面の一部（スマートフォンの画面の代わり）だけを、シートで出す・その枠の中に描く設定にする
function PhoneScreen() {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setFrame}
      className="relative h-[560px] w-[375px] max-w-full [transform:translateZ(0)] overflow-clip rounded-[28px] border border-line bg-bg"
    >
      <div className="px-5 pt-8">
        {frame && (
          <ThemeProvider density="coarse" presentation="sheet" portalContainer={frame}>
            <SettingsForm />
          </ThemeProvider>
        )}
      </div>
    </div>
  );
}

export const PresentationAndContainer: Story = {
  name: '出し方と描く場所',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`presentation="sheet"` と `portalContainer` を渡した ThemeProvider の中では、Select と Popover に何も書かなくても、枠の中の下から出すシートになります。',
      },
    },
  },
  render: () => <PhoneScreen />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '詳しく' }));
    // 枠（portalContainer）の中に、シートとして描かれる
    const dialog = await within(canvasElement).findByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(canvasElement.contains(dialog)).toBe(true);
    await userEvent.keyboard('{Escape}');
  },
};

export const LocaleAndTimeZone: Story = {
  name: '言語とタイムゾーン',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '外側で en-US・UTC にし、内側で timeZone だけを America/New_York にしたものです。内側は、書いた timeZone だけが外側より勝ちます。',
      },
    },
  },
  render: () => (
    <ThemeProvider locale="en-US" timeZone="UTC">
      <p className="flex gap-4">
        <Time dateTime="2026-09-18T00:30:00Z" withTime data-testid="outer" />
        <NumberFormat value={1280} currency="JPY" data-testid="price" />
      </p>
      <ThemeProvider timeZone="America/New_York">
        <p>
          <Time dateTime="2026-09-18T00:30:00Z" withTime data-testid="inner" />
        </p>
      </ThemeProvider>
    </ThemeProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('outer')).toHaveTextContent('09/18/2026, 00:30');
    await expect(canvas.getByTestId('price')).toHaveTextContent('¥1,280');
    await expect(canvas.getByTestId('inner')).toHaveTextContent('09/17/2026, 20:30');
  },
};
