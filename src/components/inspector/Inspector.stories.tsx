import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { useRef } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Inspector, InspectorActions, type InspectorProps } from './Inspector';
import { InspectorLayout, InspectorTrigger } from './InspectorLayout';
import { OverlayClose } from '../../internal/overlay/overlay-close';
import { DensityPair } from '../../stories/story-parts';
import { labelClass, sourceCode } from '../../stories/story-states';
import { Button } from '../button/Button';
import { Form } from '../form/Form';
import { Stack } from '../stack/Stack';
import { Switch } from '../switch/Switch';
import { TextField } from '../text-field/TextField';

const files = ['企画書.pdf', '見積もり.xlsx', 'ロゴ.svg', '議事録 9月.md', '写真 001.jpg'];

const details = (
  <div className="flex flex-col gap-4">
    <TextField label="名前" defaultValue="企画書.pdf" />
    <Switch label="リンクを知っている人に公開" defaultChecked />
    <Switch label="コメントを許可" />
  </div>
);

const longDetails = (
  <div className="flex flex-col gap-3">
    {Array.from({ length: 16 }, (_, i) => (
      <p key={i}>{i + 1}. 更新の履歴です。いつ、誰が、何を変えたかを確かめられます。</p>
    ))}
  </div>
);

/** 領域の代わりの枠。帯に開閉のボタンを置き、本文にファイルの一覧を並べる */
function Area({
  inspector,
  open,
  defaultOpen = true,
  height = 'h-[360px]',
  width = 'w-[720px]',
}: {
  inspector: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  height?: string;
  width?: string;
}) {
  return (
    <div
      className={`flex ${height} ${width} max-w-full flex-col overflow-hidden rounded-card border border-line bg-bg`}
    >
      <InspectorLayout
        header={
          <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2">
            <span className="font-bold">ファイル</span>
            <InspectorTrigger render={<Button variant="outline">詳細</Button>} />
          </div>
        }
        open={open}
        defaultOpen={defaultOpen}
        inspector={inspector}
      >
        <ul className="flex flex-col p-2">
          {files.map((file) => (
            <li key={file} className="rounded-control px-3 py-2 odd:bg-neutral">
              {file}
            </li>
          ))}
        </ul>
      </InspectorLayout>
    </div>
  );
}

const meta = {
  title: 'Components/Inspector',
  component: Inspector,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '決まった領域の中だけで開閉する、常駐のパネルです。選んだものの詳細や設定を、本文の横に出します。Drawer と違い、画面の最上層には出ず、裏を止めず、外を押しても閉じません。',
          '',
          '- `InspectorLayout` が領域です。`inspector` にパネル（`Inspector`）を、`children` に本文を渡します。領域は親の高さいっぱいに広がり、本文はその中でスクロールします。開閉の状態（`open`・`defaultOpen`・`onOpenChange`）は `InspectorLayout` が持ちます。',
          '- 開閉のボタンは `InspectorTrigger` の `render` に Button などを渡し、`InspectorLayout` の中に置きます。押すと開け閉めし、`aria-expanded` が付きます。`header` に渡した帯はパネルを重ねても隠れないので、開閉のボタンはそこに置くのが基本です。',
          '- `variant` で開き方を選びます。`push`（既定）は本文を押しのけて場所を占め、本文の幅が狭くなります。`overlay` は領域の中で本文の上に重ね、本文の幅は変えません。',
          '- 重ねる形の端の形は `overlayEdge` で選びます。`flush`（既定）は領域の端に着け、角を丸めません。`floating` は領域の端から少し離し、4 つの角を丸めて浮かべます。',
          '- 幅は `width` で変えられます。数値は px、文字列は CSS の長さです。書かないときは Drawer の横のパネルと同じ幅です。',
          '- 開閉の動きは `motion` で選びます。`slide`（既定）は領域の端から滑らせ、`none` は動かさずにすぐ切り替えます。何度も開け閉めする画面や、本文の折り返しが動くのを避けたいときは `none` にします。',
          '- `side` で出す辺を選びます。既定は `right` です。Sidebar を左に置くときは、反対の右に置きます。',
          '- 見出しには題（`title`）と説明（`description`）、右上に閉じる × を置きます。題はパネルの読み上げの名前になります。× を置かないときは `hideCloseButton` を渡し、`InspectorTrigger` か `actions` に閉じる手段を置きます。',
          '- 下に並べるボタンは `actions` に渡します。押して閉じるボタンは `OverlayClose` の `render` に渡します。',
          '- 中身の `Form` の送信のボタンを下に並べるときは、`actions` の代わりに、`Form` の中の最後に `InspectorActions` を置きます。見た目と並べ方は `actions` と同じ下の帯のままで（中身が長いときも下に残ります）、送信のボタンが `Form` の送信・Enter・送信中にそのまま加わります。`actions` と `InspectorActions` は、どちらか一方にします。',
          '- パネルの中にフォーカスがあるときは、Esc で閉じます（`closeOnEscape={false}` で止められます）。閉じると、フォーカスは開いたボタンへ戻ります。',
          '- 開いても、フォーカスは動きません。開いてすぐ触る要素があるときは、`autoFocus` にその要素を渡します。',
        ].join('\n'),
      },
    },
  },
  args: {
    title: '企画書.pdf',
    description: 'PDF・2.4 MB',
    side: 'right',
    variant: 'push',
    overlayEdge: 'flush',
    motion: 'slide',
    closeOnEscape: true,
    hideCloseButton: false,
    closeName: '閉じる',
    actionsLayout: 'auto',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    side: {
      control: 'inline-radio',
      options: ['right', 'left'],
      table: { defaultValue: { summary: "'right'" } },
    },
    variant: {
      control: 'inline-radio',
      options: ['push', 'overlay'],
      table: { defaultValue: { summary: "'push'" } },
    },
    overlayEdge: {
      control: 'inline-radio',
      options: ['flush', 'floating'],
      table: { defaultValue: { summary: "'flush'" } },
    },
    motion: {
      control: 'inline-radio',
      options: ['slide', 'none'],
      table: { defaultValue: { summary: "'slide'" } },
    },
    width: { control: 'text' },
    actionsLayout: {
      control: 'inline-radio',
      options: ['auto', 'end', 'fill', 'stack', 'stack-reverse'],
      table: { defaultValue: { summary: "'auto'" } },
    },
    actions: { control: false },
    children: { control: false },
    autoFocus: { control: false },
    returnFocus: { control: false },
  },
} satisfies Meta<typeof Inspector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        <InspectorLayout
          header={<InspectorTrigger render={<Button variant="outline">詳細</Button>} />}
          inspector={
            <Inspector title="企画書.pdf" description="PDF・2.4 MB">
              <Switch label="リンクを知っている人に公開" defaultChecked />
            </Inspector>
          }
        >
          {/* 本文 */}
        </InspectorLayout>
      `),
    },
  },
  render: (args) => <Area inspector={<Inspector {...args}>{details}</Inspector>} />,
};

const both = (args: InspectorProps, side: InspectorProps['side']) => (
  <div className="flex flex-col gap-6">
    {(['push', 'overlay'] as const).map((variant) => (
      <div key={variant} className="flex flex-col gap-2">
        <span className={labelClass}>{variant}</span>
        <Area
          inspector={
            <Inspector {...args} side={side} variant={variant}>
              {details}
            </Inspector>
          }
        />
      </div>
    ))}
  </div>
);

export const Variants: Story = {
  tags: ['visual'],
  name: '押しのける・重ねる',
  parameters: {
    controls: { include: ['title', 'description'] },
    docs: {
      description: {
        story:
          '`push` は本文を押しのけて場所を占め、本文と同じ面に置きます。`overlay` は領域の中で本文の上に重ね、影で本文から離します。',
      },
    },
  },
  render: (args) => both(args, 'right'),
};

export const Left: Story = {
  tags: ['visual'],
  name: '左に置く',
  parameters: { controls: { include: ['title', 'description'] } },
  render: (args) => both(args, 'left'),
};

export const OverlayEdges: Story = {
  tags: ['visual'],
  name: '重ねるときの端の形',
  parameters: {
    controls: { include: ['side'] },
    docs: {
      description: {
        story:
          '`overlayEdge="flush"`（既定）は領域の端に着け、角を丸めません。`floating` は領域の端から少し離し、4 つの角を丸めて浮かべます。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      {(['flush', 'floating'] as const).map((overlayEdge) => (
        <div key={overlayEdge} className="flex flex-col gap-2">
          <span className={labelClass}>{overlayEdge}</span>
          <Area
            inspector={
              <Inspector {...args} variant="overlay" overlayEdge={overlayEdge}>
                {details}
              </Inspector>
            }
          />
        </div>
      ))}
    </div>
  ),
};

export const Width: Story = {
  name: '幅を変える',
  args: { width: 280 },
  parameters: {
    controls: { include: ['width', 'variant'] },
    docs: {
      description: {
        story: '`width` に数値（px）か CSS の長さを渡すと、パネルの幅を変えられます。',
      },
    },
  },
  render: (args) => <Area inspector={<Inspector {...args}>{details}</Inspector>} />,
  play: async ({ canvas }) => {
    const panel = await canvas.findByRole('complementary', { name: '企画書.pdf' });
    await expect(panel.getBoundingClientRect().width).toBeCloseTo(280, 0);
  },
};

export const WidthPercent: Story = {
  name: '幅を割合で渡す',
  args: { width: '50%' },
  parameters: {
    controls: { include: ['width', 'variant'] },
    docs: {
      description: { story: '文字列で渡すと、領域の幅に対する割合（`50%`）なども使えます。' },
    },
  },
  render: (args) => <Area inspector={<Inspector {...args}>{details}</Inspector>} />,
  play: async ({ canvas, canvasElement }) => {
    const panel = await canvas.findByRole('complementary', { name: '企画書.pdf' });
    const body = canvasElement.querySelector('[data-slot="inspector-body"]');
    await waitFor(() =>
      expect(panel.getBoundingClientRect().width).toBeCloseTo(
        (body?.getBoundingClientRect().width ?? 0) / 2,
        0
      )
    );
  },
};

function AutoFocusExample(args: InspectorProps) {
  const target = useRef<HTMLButtonElement>(null);
  return (
    <Area
      inspector={
        <Inspector {...args} autoFocus={target}>
          <Button ref={target}>書き出す</Button>
        </Inspector>
      }
    />
  );
}

export const AutoFocus: Story = {
  name: '開いた直後の焦点',
  parameters: {
    controls: { include: ['variant'] },
    docs: {
      description: {
        story:
          '`autoFocus` に要素を渡すと、開いた直後にその要素へフォーカスを移します。はじめから開いているときも同じです。',
      },
    },
  },
  render: (args) => <AutoFocusExample {...args} />,
  play: async ({ canvas }) => {
    const button = await canvas.findByRole('button', { name: '書き出す' });
    await waitFor(() => expect(button).toHaveFocus());
  },
};

export const NoMotion: Story = {
  name: '動かさない',
  args: { motion: 'none' },
  parameters: {
    controls: { include: ['motion', 'variant'] },
    docs: {
      description: { story: '`motion="none"` は、開閉を動かさずにすぐ切り替えます。' },
    },
  },
  render: (args) => (
    <Area defaultOpen={false} inspector={<Inspector {...args}>{details}</Inspector>} />
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '詳細' }));
    // 押した直後から、パネルは開いた幅になっている
    const panel = await canvas.findByRole('complementary', { name: '企画書.pdf' });
    const frame = panel.parentElement;
    await expect(frame?.getBoundingClientRect().width).toBeCloseTo(
      panel.getBoundingClientRect().width,
      0
    );
  },
};

export const Closed: Story = {
  tags: ['visual'],
  name: '閉じている',
  parameters: {
    controls: { include: ['variant', 'side'] },
    docs: { description: { story: '閉じているあいだは、本文が領域いっぱいに広がります。' } },
  },
  render: (args) => (
    <Area defaultOpen={false} inspector={<Inspector {...args}>{details}</Inspector>} />
  ),
};

export const LongContent: Story = {
  tags: ['visual'],
  name: '長い中身と下の操作',
  parameters: {
    controls: { include: ['variant', 'side', 'actionsLayout'] },
    docs: {
      description: {
        story:
          '中身が長いときはパネルの中だけがスクロールし、上の端に区切り線、上下の端に続きの影を出します。`actions` はスクロールしても動きません。',
      },
    },
  },
  render: (args) => (
    <Area
      inspector={
        <Inspector
          {...args}
          title="更新の履歴"
          description={undefined}
          actions={
            <>
              <OverlayClose render={<Button variant="outline">閉じる</Button>} />
              <Button color="primary">書き出す</Button>
            </>
          }
        >
          {longDetails}
        </Inspector>
      }
    />
  ),
};

const detailsSubmit = fn();

export const WithForm: Story = {
  tags: ['visual'],
  name: 'Form と組む',
  parameters: {
    controls: { include: ['variant', 'side', 'actionsLayout'] },
    docs: {
      description: {
        story:
          '`Form` の中の最後に `InspectorActions` を置くと、下のボタンが `Form` の中に入ります。中身が長いときも、帯はパネルの下の端に残ります。入力欄で Enter を押すと送信します。',
      },
      source: sourceCode(`
        <Inspector title="詳細">
          <Form onFormSubmit={save}>
            <Stack>
              <TextField name="name" label="名前" />
              …
            </Stack>
            <InspectorActions>
              <OverlayClose render={<Button variant="outline">閉じる</Button>} />
              <Button type="submit" color="primary">保存する</Button>
            </InspectorActions>
          </Form>
        </Inspector>
      `),
    },
  },
  render: (args) => (
    <Area
      inspector={
        <Inspector {...args} description={undefined}>
          <Form onFormSubmit={detailsSubmit}>
            <Stack>
              <TextField name="name" label="名前" defaultValue="企画書.pdf" />
              <TextField name="owner" label="持ち主" defaultValue="かずえもん" />
              <TextField name="tags" label="タグ" />
              <Switch name="shared" label="リンクを知っている人に公開" defaultChecked />
            </Stack>
            <InspectorActions>
              <OverlayClose render={<Button variant="outline">閉じる</Button>} />
              <Button type="submit" color="primary">
                保存する
              </Button>
            </InspectorActions>
          </Form>
        </Inspector>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    detailsSubmit.mockClear();
    const panel = canvasElement.querySelector<HTMLElement>('[data-slot="inspector"]')!;
    const footer = panel.querySelector<HTMLElement>('[data-slot="inspector-footer"]')!;
    const content = panel.querySelector<HTMLElement>('[data-slot="inspector-content"]')!;
    await expect(footer.closest('form')).not.toBeNull();
    await expect(footer).toHaveAttribute('data-layout', 'end');
    // 中身はスクロールし、帯はパネルの下の端にある
    await waitFor(() => expect(content.scrollHeight).toBeGreaterThan(content.clientHeight));
    await waitFor(() =>
      expect(
        Math.abs(footer.getBoundingClientRect().bottom - panel.getBoundingClientRect().bottom)
      ).toBeLessThan(1)
    );
    await userEvent.type(within(panel).getByRole('textbox', { name: '名前' }), '{Enter}');
    await waitFor(() => expect(detailsSubmit).toHaveBeenCalledTimes(1));
    await expect(detailsSubmit.mock.calls[0]?.[0]).toMatchObject({ name: '企画書.pdf' });
  },
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { controls: { include: ['variant', 'side'] } },
  render: (args) => (
    <DensityPair>
      <Area width="w-[560px]" inspector={<Inspector {...args}>{details}</Inspector>} />
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げとキーボード',
  parameters: {
    docs: {
      description: {
        story:
          'パネルは題を名前に持つ補足の領域（complementary）です。開閉のボタンは開いているかを伝えます。パネルの中で Esc を押すと閉じ、フォーカスは開いたボタンへ戻ります。',
      },
    },
  },
  render: (args) => (
    <Area defaultOpen={false} inspector={<Inspector {...args}>{details}</Inspector>} />
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: '詳細' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // 閉じているあいだは、読み上げに出さない
    await expect(canvas.queryByRole('complementary')).toBeNull();

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panel = await canvas.findByRole('complementary', { name: '企画書.pdf' });
    await expect(panel).toHaveAccessibleDescription('PDF・2.4 MB');
    await expect(trigger).toHaveAttribute('aria-controls', panel.id);
    // 開いても、フォーカスは動かない（裏を止めない常駐のパネル）
    await expect(trigger).toHaveFocus();

    // パネルの中で Esc を押すと閉じ、開いたボタンへ戻る
    const name = await canvas.findByRole('textbox', { name: '名前' });
    await waitFor(() => expect(name).toBeVisible());
    name.focus();
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveFocus();

    // 右上の × でも閉じる
    await userEvent.click(trigger);
    const close = await canvas.findByRole('button', { name: '閉じる' });
    await userEvent.click(close);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};
