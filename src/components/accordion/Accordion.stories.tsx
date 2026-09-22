import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';

import { Accordion, AccordionItem, type AccordionVariant, type AccordionProps } from './Accordion';
import { DensityPair, Matrix } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

const faq = [
  {
    value: 'password',
    title: 'パスワードを忘れたときは？',
    answer:
      '届いたメールのリンクを開くと、新しいパスワードを決める画面に移ります。リンクは 24 時間で切れます。',
  },
  {
    value: 'mail',
    title: 'メールが届かないときは？',
    answer: '迷惑メールのフォルダを確かめてください。',
  },
  {
    value: 'leave',
    title: '退会するには？',
    answer: '設定の「アカウント」から手続きできます。',
  },
];

function FaqItems() {
  return faq.map((item) => (
    <AccordionItem key={item.value} value={item.value} title={item.title}>
      {item.answer}
    </AccordionItem>
  ));
}

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  subcomponents: { AccordionItem },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '押して中身を開閉する項目を、続けて並べた一覧です。FAQ や、記事の中の補足のように、いくつもの中身を題だけ並べて見せるときに使います。1 つだけのときは Collapsible を使います。',
          '',
          '- `Accordion` の中に `AccordionItem` を間をあけずに並べます。項目ごとに `title`（題）と中身を渡します。',
          '- 既定では 1 つ開くとほかは閉じます。いくつも同時に開けるようにするときは `multiple` を付けます。',
          '- 見た目は `variant` で選びます。既定は区切り線で区切る `divided` で、ほかに塗りなしの `plain`、開いている項目を塗る `open-filled`、いつも塗る `filled` があります。行と中身の見た目は Collapsible と同じです。',
          '- 開閉の印は、`indicator` で題の右（`end`）か左（`start`）に置きます。',
          '- はじめに開いておく項目は、`AccordionItem` の `value` を `defaultValue` に並べて指します。使う側で持つときは `value` と `onValueChange` を使います。',
          '- 題は見出し（既定は h3）で包みます。ページの見出しの並びに合わせて `headingLevel` を変えます。',
          '- 閉じた答えもページ内検索で見つけてほしいときは `hiddenUntilFound` を付けます。見つかると開きます。',
          '- 動きを減らす設定では、中身を動かさずにすぐ出します。',
        ].join('\n'),
      },
      source: sourceCode(`
        <Accordion defaultValue={['password']}>
          <AccordionItem value="password" title="パスワードを忘れたときは？">…</AccordionItem>
          <AccordionItem value="mail" title="メールが届かないときは？">…</AccordionItem>
        </Accordion>
      `),
    },
  },
  args: { variant: 'divided', indicator: 'end', multiple: false },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['divided', 'plain', 'open-filled', 'filled'],
      table: { defaultValue: { summary: 'divided' } },
    },
    indicator: {
      control: 'inline-radio',
      options: ['end', 'start'],
      table: { defaultValue: { summary: 'end' } },
    },
    multiple: { table: { defaultValue: { summary: 'false' } } },
    disabled: { table: { defaultValue: { summary: 'false' } } },
    hiddenUntilFound: { table: { defaultValue: { summary: 'false' } } },
    keepMounted: { table: { defaultValue: { summary: 'false' } } },
    headingLevel: {
      control: 'inline-radio',
      options: [2, 3, 4, 5, 6],
      table: { defaultValue: { summary: '3' } },
    },
  },
  render: (args) => (
    <div className="w-[360px] max-w-full">
      <Accordion {...args}>
        <FaqItems />
      </Accordion>
    </div>
  ),
} satisfies Meta<typeof Accordion>;

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
const triggerPseudo = statePseudo({
  hover: '[data-slot="accordion-trigger"]',
  active: '[data-slot="accordion-trigger"]',
  focusVisible: '[data-slot="accordion-trigger"]',
});

export const States: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: { pseudo: triggerPseudo },
  render: (args) => (
    <Matrix
      rows={rows}
      columns={stateColumns}
      columnWidth="14rem"
      rowLabel={(row) => rowLabels[row]}
      renderCell={(row) => (
        <Accordion {...args} defaultValue={row === 'open' ? ['a'] : []}>
          <AccordionItem value="a" title="パスワードを忘れたら" disabled={row === 'disabled'}>
            {faq[0].answer}
          </AccordionItem>
        </Accordion>
      )}
    />
  ),
};

const variants: AccordionVariant[] = ['divided', 'plain', 'open-filled', 'filled'];

function VariantGrid({ indicator }: Pick<AccordionProps, 'indicator'>) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-col gap-2">
          <p className="text-xs text-fg-subtle">{variant}</p>
          <Accordion variant={variant} indicator={indicator} defaultValue={['password']}>
            <FaqItems />
          </Accordion>
        </div>
      ))}
    </div>
  );
}

export const Variants: Story = {
  tags: ['visual'],
  name: '見た目',
  parameters: {
    docs: {
      description: {
        story:
          '`variant` の 4 つの見た目です。`divided` は項目のあいだの線を 1 本にし、`filled` は面がつながらないよう項目のあいだを少し離します。',
      },
    },
  },
  render: () => <VariantGrid indicator="end" />,
};

export const VariantsStart: Story = {
  tags: ['visual'],
  name: '見た目（印は左）',
  parameters: {
    docs: {
      description: {
        story:
          '`indicator="start"` にすると、印は題の左に移り、中身は題の頭にそろえて字下げします。',
      },
    },
  },
  render: () => <VariantGrid indicator="start" />,
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  render: () => (
    <DensityPair>
      <div className="w-[320px]">
        <Accordion defaultValue={['password']}>
          <FaqItems />
        </Accordion>
      </div>
    </DensityPair>
  ),
};

export const Multiple: Story = {
  name: 'いくつも開く',
  args: { multiple: true },
  parameters: {
    docs: {
      description: {
        story: '`multiple` を付けると、ほかの項目を閉じずに、いくつも同時に開けます。',
      },
    },
  },
};

function ControlledExample() {
  const [value, setValue] = useState<unknown[]>(['password']);
  return (
    <div className="flex w-[360px] max-w-full flex-col gap-3">
      <p className="text-sm">開いている項目: {value.length ? value.join('、') : 'なし'}</p>
      <Accordion value={value} onValueChange={setValue}>
        <FaqItems />
      </Accordion>
    </div>
  );
}

export const Controlled: Story = {
  name: '開閉を使う側で持つ',
  parameters: {
    docs: {
      source: sourceCode(`
        const [value, setValue] = useState<unknown[]>(['password']);
        <Accordion value={value} onValueChange={setValue}>…</Accordion>
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
          'ブラウザのページ内検索（Ctrl+F）で「24 時間」を探すと、閉じた項目が開いて見つかります。',
      },
    },
  },
};

export const Accessibility: Story = {
  name: '読み上げ',
  play: async ({ canvas }) => {
    // 題は見出し（既定は h3）の中のボタン
    const first = canvas.getByRole('button', { name: faq[0].title });
    const second = canvas.getByRole('button', { name: faq[1].title });
    await expect(first.closest('h3')).not.toBeNull();
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    // 押すと開き、中身が trigger の aria-controls で結ばれる
    await userEvent.click(first);
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    const panel = canvas.getByText(faq[0].answer).closest('[data-slot="accordion-panel"]');
    await expect(first.getAttribute('aria-controls')).toBe(panel?.id);
    // 既定では 1 つだけ開く。2 つ目を開くと 1 つ目は閉じる
    await userEvent.click(second);
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(canvas.queryByText(faq[0].answer)).toBeNull());
  },
};

export const MultipleCheck: Story = {
  name: 'いくつも開く（確かめ）',
  tags: ['!autodocs'],
  args: { multiple: true, headingLevel: 2 },
  play: async ({ canvas }) => {
    const first = canvas.getByRole('button', { name: faq[0].title });
    const second = canvas.getByRole('button', { name: faq[1].title });
    await expect(first.closest('h2')).not.toBeNull();
    await userEvent.click(first);
    await userEvent.click(second);
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(second).toHaveAttribute('aria-expanded', 'true');
  },
};

export const HiddenUntilFoundCheck: Story = {
  name: 'ページ内検索で開く（確かめ）',
  tags: ['!autodocs'],
  args: { hiddenUntilFound: true },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: faq[0].title });
    const panel = canvas.getByText(faq[0].answer).closest('[data-slot="accordion-panel"]');
    await expect(panel?.getAttribute('hidden')).toBe('until-found');
    panel?.dispatchEvent(new Event('beforematch', { bubbles: true }));
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
  },
};
