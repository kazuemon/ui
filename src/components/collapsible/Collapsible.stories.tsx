import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';

import { Button } from '../button/Button';
import { Text } from '../text/Text';
import { Collapsible, type CollapsibleAppearance, type CollapsibleIndicator } from './Collapsible';
import { DensityPair, Matrix } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

const answer =
  '届いたメールのリンクを開くと、新しいパスワードを決める画面に移ります。リンクは 24 時間で切れます。';

const meta = {
  title: 'Components/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '押して中身を開閉する行です。詳しい設定、FAQ の答え、「もっと見る」の続きのように、ふだんは隠しておける中身に使います。',
          '',
          '- 行全体を押せます。マウスを載せると行が淡く塗られ、開閉の印は開くと向きが変わります。',
          '- 行の見た目は `appearance` で選びます。ふだんは塗りなしの `plain`、開いている行を塗る `open-filled`、いつも塗る `filled`、区切り線で区切る `divided` です。',
          '- 開閉の印は、`indicator` で題の右（`end`）か左（`start`）に置きます。見た目とは別に選べます。',
          '- 開閉は `defaultOpen`（はじめの状態）か、`open` と `onOpenChange`（使う側で持つ）で決めます。',
          '- 行の代わりに自分のボタンを置くときは、`trigger` に Button などを渡します。見た目はその要素のままで、開いているあいだ `aria-expanded` が付きます。',
          '- 閉じた中身もページ内検索で見つけてほしいときは `hiddenUntilFound` を付けます。見つかると開きます。',
          '- 閉じているあいだも中の入力の値を保ちたいときは `keepMounted` を付けます。',
          '- 動きを減らす設定では、中身を動かさずにすぐ出します。',
        ].join('\n'),
      },
    },
  },
  args: { title: 'パスワードを忘れたときは？', children: answer },
  argTypes: {
    title: { control: 'text' },
    children: { control: 'text' },
    appearance: {
      control: 'inline-radio',
      options: ['plain', 'open-filled', 'filled', 'divided'],
      table: { defaultValue: { summary: 'plain' } },
    },
    indicator: {
      control: 'inline-radio',
      options: ['end', 'start'],
      table: { defaultValue: { summary: 'end' } },
    },
    defaultOpen: { table: { defaultValue: { summary: 'false' } } },
    disabled: { table: { defaultValue: { summary: 'false' } } },
    hiddenUntilFound: { table: { defaultValue: { summary: 'false' } } },
    keepMounted: { table: { defaultValue: { summary: 'false' } } },
  },
  render: (args) => (
    <div className="w-[360px] max-w-full">
      <Collapsible {...args} />
    </div>
  ),
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

type Row = 'closed' | 'open' | 'disabled';
const rows: Row[] = ['closed', 'open', 'disabled'];
const rowLabels: Record<Row, string> = {
  closed: '閉じている',
  open: '開いている',
  disabled: '押せない',
};
const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: '押下', state: 'active' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
];

export const States: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: {
    pseudo: statePseudo({
      hover: '[data-slot="collapsible-trigger"]',
      active: '[data-slot="collapsible-trigger"]',
      focusVisible: '[data-slot="collapsible-trigger"]',
    }),
  },
  render: (args) => (
    <Matrix
      rows={rows}
      columns={stateColumns}
      columnWidth="14rem"
      rowLabel={(row) => rowLabels[row]}
      renderCell={(row) => (
        <Collapsible
          {...args}
          title="パスワードを忘れたら"
          defaultOpen={row === 'open'}
          disabled={row === 'disabled'}
        >
          {answer}
        </Collapsible>
      )}
    />
  ),
};

const appearances: CollapsibleAppearance[] = ['plain', 'open-filled', 'filled', 'divided'];
type Variant = { appearance?: CollapsibleAppearance; indicator?: CollapsibleIndicator };
type OpenColumn = MatrixColumn & { open?: boolean };
const appearanceColumns: OpenColumn[] = [
  { label: '閉じている' },
  { label: 'hover', state: 'hover' },
  { label: '開いている', open: true },
  { label: '開いていて hover', state: 'hover', open: true },
  { label: 'フォーカス（キーボード）', state: 'focus' },
];
const appearancePseudo = statePseudo({
  hover: '[data-slot="collapsible-trigger"]',
  focusVisible: '[data-slot="collapsible-trigger"]',
});

function AppearanceMatrix({ indicator }: { indicator: CollapsibleIndicator }) {
  return (
    <Matrix
      rows={appearances}
      columns={appearanceColumns}
      columnWidth="12rem"
      rowLabel={(row) => row}
      renderCell={(row, column) => (
        <Collapsible
          title="詳しい設定"
          appearance={row}
          indicator={indicator}
          defaultOpen={column.open}
        >
          リンクは 24 時間で切れます。
        </Collapsible>
      )}
    />
  );
}

export const Appearances: Story = {
  tags: ['visual'],
  name: '見た目（印は右）',
  parameters: {
    docs: {
      description: {
        story:
          '`appearance` の 4 つの見た目です。開閉の印は既定の右（`indicator="end"`）で、閉じているときは下向き、開くと上を向きます。',
      },
    },
    pseudo: appearancePseudo,
  },
  render: () => <AppearanceMatrix indicator="end" />,
};

export const AppearancesStart: Story = {
  tags: ['visual'],
  name: '見た目（印は左）',
  parameters: {
    docs: {
      description: {
        story:
          '`indicator="start"` にすると、印は題の左に移り、閉じているときは右向き、開くと下を向きます。中身は題の頭にそろえて字下げします。どの見た目とも組み合わせられます。',
      },
    },
    pseudo: appearancePseudo,
  },
  render: () => <AppearanceMatrix indicator="start" />,
};

function FaqList({ appearance, indicator }: Partial<Variant>) {
  return (
    <div>
      <Collapsible
        title="パスワードを忘れたときは？"
        appearance={appearance}
        indicator={indicator}
        defaultOpen
      >
        {answer}
      </Collapsible>
      <Collapsible title="メールが届かないときは？" appearance={appearance} indicator={indicator}>
        迷惑メールのフォルダを確かめてください。
      </Collapsible>
      <Collapsible title="退会するには？" appearance={appearance} indicator={indicator}>
        設定の「アカウント」から手続きできます。
      </Collapsible>
    </div>
  );
}

export const Stacked: Story = {
  tags: ['visual'],
  name: '続けて並べる',
  parameters: {
    docs: {
      description: {
        story:
          'FAQ のように続けて並べられます。開いた行の中身は、次の行を下へ押し出します。`filled` は面がつながらないよう少し離し、`divided` はあいだの線を 1 本にします。',
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8">
      {appearances.map((appearance) => (
        <div key={appearance} className="flex flex-col gap-2">
          <p className="text-xs text-fg-subtle">{appearance}</p>
          <FaqList appearance={appearance} />
        </div>
      ))}
    </div>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  render: () => (
    <DensityPair>
      <div className="w-[320px]">
        <Collapsible title="パスワードを忘れたときは？" defaultOpen>
          {answer}
        </Collapsible>
        <Collapsible title="メールが届かないときは？">
          迷惑メールのフォルダを確かめてください。
        </Collapsible>
      </div>
    </DensityPair>
  ),
};

export const CustomTrigger: Story = {
  name: '自分のボタンで開閉する',
  parameters: {
    docs: {
      description: {
        story:
          '`trigger` に渡した要素で開閉します。見た目はその要素のままです。中身の余白は `panelClassName` で付けます。',
      },
      source: sourceCode(`
        <Collapsible
          trigger={<Button appearance="outline">すべての項目を見る</Button>}
          panelClassName="pt-3"
        >
          …
        </Collapsible>
      `),
    },
  },
  render: () => (
    <div className="w-[360px] max-w-full">
      <Collapsible
        trigger={<Button appearance="outline">すべての項目を見る</Button>}
        panelClassName="pt-3"
      >
        <Text>{answer}</Text>
      </Collapsible>
    </div>
  ),
};

function ControlledExample() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-[360px] max-w-full flex-col gap-3">
      <p className="text-sm">{open ? '開いています' : '閉じています'}</p>
      <Collapsible title="詳しい設定" open={open} onOpenChange={setOpen}>
        {answer}
      </Collapsible>
    </div>
  );
}

export const Controlled: Story = {
  name: '開閉を使う側で持つ',
  parameters: {
    docs: {
      source: sourceCode(`
        const [open, setOpen] = useState(false);
        <Collapsible title="詳しい設定" open={open} onOpenChange={setOpen}>…</Collapsible>
      `),
    },
  },
  render: () => <ControlledExample />,
};

export const HiddenUntilFound: Story = {
  name: 'ページ内検索で開く',
  args: { hiddenUntilFound: true },
  parameters: {
    docs: {
      description: {
        story:
          'ブラウザのページ内検索（Ctrl+F）で「24 時間」を探すと、閉じた行が開いて見つかります。',
      },
    },
  },
};

export const Accessibility: Story = {
  name: '読み上げ',
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'パスワードを忘れたときは？' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText(answer)).toBeNull();
    // 行を押すと開き、中身が trigger の aria-controls で結ばれる
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panel = canvas.getByText(answer).closest('[data-slot="collapsible-panel"]');
    await expect(panel).not.toBeNull();
    await expect(trigger.getAttribute('aria-controls')).toBe(panel?.id);
    // キーボード（Enter）でも閉じる。閉じる動きのあとで中身が消える
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(canvas.queryByText(answer)).toBeNull());
  },
};

export const HiddenUntilFoundCheck: Story = {
  name: 'ページ内検索で開く（確かめ）',
  tags: ['!autodocs'],
  args: { hiddenUntilFound: true },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button');
    // 閉じていても中身はページに残り、hidden="until-found" で隠れている
    const panel = canvas.getByText(answer).closest('[data-slot="collapsible-panel"]');
    await expect(panel?.getAttribute('hidden')).toBe('until-found');
    // ページ内検索で見つかったとき（beforematch）に開く
    panel?.dispatchEvent(new Event('beforematch', { bubbles: true }));
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
  },
};
