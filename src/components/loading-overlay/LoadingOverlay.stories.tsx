import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { LoadingOverlay } from './LoadingOverlay';
import { Gallery, Specimen } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';
import { Button } from '../button/Button';
import { Card } from '../card/Card';
import { TextField } from '../text-field/TextField';

const meta = {
  title: 'Components/LoadingOverlay',
  component: LoadingOverlay,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'カードや表などの領域の上に重ねて、読み込み中であることを示し、下の操作を止める幕です。',
          '',
          '- 領域を `LoadingOverlay` で包み、読み込んでいるあいだ `loading` を true にします。幕は領域と同じ大きさで、真ん中に回る円が出ます。領域の角が丸いときは、`className` で同じ角丸を渡すと幕も同じ角になります。',
          '- 幕の色は `variant` で選びます。既定の `light` は面の色を透かした淡い幕、`dark` は後ろを暗くして白い円と文言を載せる幕です。',
          '- 既定では幕の後ろをぼかします。`blur={false}` でぼかしを外すと、`light` では面の色を濃くかぶせて、下をほとんど見せません。',
          '- 幕が出ているあいだ、下の領域は押せず、フォーカスも入りません。`loading` のあいだは、領域に `aria-busy` が付きます。幕が消えたとき、押していたものにフォーカスが残っていなければ、そこへ戻します。',
          '- 幕は、読み込みが始まるとすぐ出て、終わると 0.4 秒かけて消えます。一瞬で終わる読み込みでも、消えるときの動きで終わりが伝わります。',
          '- 一瞬で終わる読み込みで幕を出したくないときは、`delay`（ミリ秒。200 ほど）を渡します。そのあいだに終われば幕は出ません。出したあと、すぐ消えないようにするには `minDuration`（ミリ秒）です。',
          '- 出る動きと消える動きの長さは `enterDuration`・`exitDuration`（ミリ秒）で変えます。',
          '- 読み上げでは、幕が出たときに `loadingText`（既定「読み込んでいます」）を知らせます。円の下にも見せるときは `showLoadingText` を付けます。',
          '- 画面全体を読み込んでいるときは `fullscreen` にすると、領域ではなく画面にかぶせます。',
          '- 動きを減らす設定では、幕はすぐ出てすぐ消えます。',
        ].join('\n'),
      },
    },
  },
  args: { loading: false, delay: 0, minDuration: 0, fullscreen: false, showLoadingText: false },
  argTypes: {
    loading: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    delay: { control: 'number', table: { defaultValue: { summary: '0' } } },
    minDuration: { control: 'number', table: { defaultValue: { summary: '0' } } },
    enterDuration: { control: 'number', table: { defaultValue: { summary: '0' } } },
    exitDuration: { control: 'number', table: { defaultValue: { summary: '400' } } },
    variant: {
      control: 'inline-radio',
      options: ['light', 'dark'],
      table: { defaultValue: { summary: "'light'" } },
    },
    blur: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    fullscreen: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showLoadingText: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    loadingText: { control: 'text' },
  },
} satisfies Meta<typeof LoadingOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

function Sample() {
  return (
    <Card className="w-80">
      <div className="flex flex-col gap-3 p-4">
        <p className="font-bold">今月の記録</p>
        <TextField label="メモ" />
        <Button color="primary">保存する</Button>
      </div>
    </Card>
  );
}

export const Playground: Story = {
  name: '基本',
  args: { loading: true, delay: 0 },
  render: (args) => (
    <LoadingOverlay {...args} className="w-80 rounded-card">
      <Sample />
    </LoadingOverlay>
  ),
};

/** ボタンで読み込みを始める。1.5 秒たつと戻る */
function Interactive() {
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const start = () => {
    clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => setLoading(false), 1500);
  };
  return (
    <div className="flex flex-col items-start gap-4">
      <Button onClick={start}>読み込む</Button>
      <LoadingOverlay loading={loading} className="w-80 rounded-card">
        <Sample />
      </LoadingOverlay>
    </div>
  );
}

export const Trigger: Story = {
  name: '読み込みを始める',
  render: () => <Interactive />,
  parameters: {
    docs: {
      source: sourceCode(`
        const [loading, setLoading] = useState(false);

        <LoadingOverlay loading={loading} className="w-80 max-w-full rounded-card">
          <Card>…</Card>
        </LoadingOverlay>
      `),
    },
  },
};

export const States: Story = {
  tags: ['visual'],
  name: '幕と文言',
  args: { loading: true, delay: 0 },
  render: (args) => (
    <Gallery columnWidth="20rem">
      <Specimen label="円だけ（読み上げは文あり）">
        <LoadingOverlay {...args} className="w-80 max-w-full rounded-card">
          <Sample />
        </LoadingOverlay>
      </Specimen>
      <Specimen label="showLoadingText">
        <LoadingOverlay {...args} showLoadingText className="w-80 max-w-full rounded-card">
          <Sample />
        </LoadingOverlay>
      </Specimen>
      <Specimen label="loading でない">
        <LoadingOverlay {...args} loading={false} className="w-80 max-w-full rounded-card">
          <Sample />
        </LoadingOverlay>
      </Specimen>
    </Gallery>
  ),
};

export const Variants: Story = {
  tags: ['visual'],
  name: '幕の型',
  args: { loading: true, delay: 0, showLoadingText: true },
  render: (args) => (
    <Gallery columnWidth="20rem">
      {(
        [
          ['light', true],
          ['light', false],
          ['dark', true],
          ['dark', false],
        ] as const
      ).map(([variant, blur]) => (
        <Specimen key={`${variant}-${blur}`} label={`${variant}${blur ? '' : ' · blur={false}'}`}>
          <LoadingOverlay
            {...args}
            variant={variant}
            blur={blur}
            className="w-80 max-w-full rounded-card"
          >
            <Sample />
          </LoadingOverlay>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Behavior: Story = {
  name: '操作を止める',
  tags: ['!autodocs'],
  args: { delay: 0, minDuration: 0 },
  render: (args) => {
    return <Toggle {...args} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvasElement.querySelector('[data-slot="loading-overlay"]') as HTMLElement;
    const content = region.firstElementChild as HTMLElement;
    await expect(content.inert).toBe(false);
    await expect(content).not.toHaveAttribute('aria-busy');
    await userEvent.click(canvas.getByRole('button', { name: '切り替える' }));
    await waitFor(() => expect(content.inert).toBe(true));
    await expect(content).toHaveAttribute('aria-busy', 'true');
    await expect(await canvas.findByRole('status')).toHaveTextContent('読み込んでいます');
    await userEvent.click(canvas.getByRole('button', { name: '切り替える' }));
    await waitFor(() => expect(content.inert).toBe(false));
    await expect(content).not.toHaveAttribute('aria-busy');
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-slot="loading-overlay-veil"]')).toBeNull()
    );
  },
};

function Toggle(props: Parameters<typeof LoadingOverlay>[0]) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col items-start gap-4">
      <Button onClick={() => setLoading((value) => !value)}>切り替える</Button>
      <LoadingOverlay {...props} loading={loading} className="w-80 rounded-card">
        <Sample />
      </LoadingOverlay>
    </div>
  );
}

export const Flicker: Story = {
  name: '一瞬で終わる読み込みでは出ない',
  tags: ['!autodocs'],
  // 待ち（delay）を長めにとり、2 回の押下のあいだに待ちが過ぎないようにする
  args: { delay: 600, minDuration: 0 },
  render: (args) => <Toggle {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 幕が一度でも描かれたかを見張る（消える動きのあとに残っていないだけでは、出なかったことにならない）
    let appeared = false;
    const observer = new MutationObserver(() => {
      if (canvasElement.querySelector('[data-slot="loading-overlay-veil"]')) appeared = true;
    });
    observer.observe(canvasElement, { childList: true, subtree: true });
    await userEvent.click(canvas.getByRole('button', { name: '切り替える' }));
    await userEvent.click(canvas.getByRole('button', { name: '切り替える' }));
    await new Promise((resolve) => setTimeout(resolve, 700));
    observer.disconnect();
    await expect(appeared).toBe(false);
  },
};
