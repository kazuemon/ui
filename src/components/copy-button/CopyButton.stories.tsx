import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
// 引数の userEvent は、LAN の IP で開いたとき（clipboard のない環境）は空になり、click などが呼べない
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { CopyButton, type CopyButtonFeedback, type CopyButtonProps } from './CopyButton';
import { CopiedPreviewContext } from '../../internal/copy/use-copy';
import { DensityPair, Matrix } from '../../stories/story-parts';
import { type StateColumn, sourceCode, statePseudo } from '../../stories/story-states';

const feedbacks: CopyButtonFeedback[] = ['tooltip', 'label'];
const forms = [
  { label: '文字', iconOnly: false, shape: undefined },
  { label: 'アイコンだけ（square）', iconOnly: true, shape: 'square' },
  { label: 'アイコンだけ（round）', iconOnly: true, shape: 'round' },
] as const;
type Column = StateColumn & { copied?: boolean };
const stateColumns: Column[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
  { label: '押せない', disabled: true },
];

/** クリップボードの代わりを置いて、fn を返す。戻すときは restore を呼ぶ */
function stubClipboard(writeText = fn(async (_text: string) => {})) {
  const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  const restore = () => {
    if (original) Object.defineProperty(navigator, 'clipboard', original);
    else Reflect.deleteProperty(navigator, 'clipboard');
  };
  return { writeText, restore };
}

const meta = {
  title: 'Components/CopyButton',
  component: CopyButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '文字列をクリップボードに写すボタンです。写せると印がチェックに変わり、読み上げでも「コピーしました」と知らせます。',
          '',
          '- 写す文字列は `text` に渡します。関数を渡すと、押したときに呼んで、返した文字列を写します。',
          '- 既定は「コピー」の文字の付いた枠線のボタンです。並びが詰まっているところでは `iconOnly` でアイコンだけにします。アイコンだけのときは `label` が読み上げの名前になり、マウスを載せたときやキーボードでフォーカスしたときに吹き出しでも出ます。',
          '- アイコンだけのボタンの形は `shape` で選びます。`square`（既定）は文字のボタンと同じ角の正方形、`round` は丸です。',
          '- 何を写すのかが周りから分からないときは、`label="URL をコピー"` のように書きます。',
          '- 写せたことの見せ方は `feedback` で選びます。`tooltip`（既定）は吹き出しで「コピーしました」を出し、ボタンの幅は変わりません。`label` はボタンの中の文字を「コピーしました」に変え、文字の分だけボタンが横に伸びます。',
          '- 写せなかったとき（権限がない・安全でない接続）は見た目が変わりません。知らせるときは `onCopyError` を使います。',
        ].join('\n'),
      },
    },
  },
  // Controls で既定の値を選んだ状態から始める（部品の既定と同じ値）
  args: {
    text: 'pnpm add @kazuemon/ui',
    label: 'コピー',
    copiedLabel: 'コピーしました',
    iconOnly: false,
    shape: 'square',
    feedback: 'tooltip',
    appearance: 'outline',
    color: 'neutral',
    disabled: false,
    onCopied: fn(),
    onCopyError: fn(),
  },
  argTypes: {
    text: { control: 'text' },
    label: { control: 'text', table: { defaultValue: { summary: "'コピー'" } } },
    copiedLabel: { control: 'text', table: { defaultValue: { summary: "'コピーしました'" } } },
    iconOnly: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    shape: {
      control: 'inline-radio',
      options: ['square', 'round'],
      table: { defaultValue: { summary: "'square'" } },
    },
    feedback: {
      control: 'inline-radio',
      options: feedbacks,
      table: { defaultValue: { summary: "'tooltip'" } },
    },
    appearance: {
      control: 'inline-radio',
      options: ['filled', 'outline'],
      table: { defaultValue: { summary: "'outline'" } },
    },
    color: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'danger', 'neutral', 'white'],
      table: { defaultValue: { summary: "'neutral'" } },
    },
  },
} satisfies Meta<CopyButtonProps>;

export default meta;
type Story = StoryObj<Meta<CopyButtonProps>>;

export const Playground: Story = {
  name: '基本',
};

export const States: Story = {
  name: '形と状態',
  tags: ['visual'],
  parameters: {
    controls: { exclude: ['iconOnly', 'shape', 'disabled'] },
    pseudo: statePseudo({
      hover: '[data-slot="copy-button"]',
      focusVisible: '[data-slot="copy-button"]',
    }),
    docs: {
      description: {
        story: '行が形、列が状態です。押して写せたあとの見た目は「写せたことの見せ方」にあります。',
      },
      source: sourceCode(`
        <CopyButton text="pnpm add @kazuemon/ui" />
        <CopyButton text="pnpm add @kazuemon/ui" iconOnly />
        <CopyButton text="pnpm add @kazuemon/ui" iconOnly shape="round" />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={forms}
      rowLabel={(form) => form.label}
      columns={stateColumns}
      columnWidth="10rem"
      renderCell={(form, { disabled }) => (
        <CopyButton {...args} iconOnly={form.iconOnly} shape={form.shape} disabled={disabled} />
      )}
    />
  ),
};

export const Feedback: Story = {
  name: '写せたことの見せ方',
  tags: ['visual'],
  parameters: {
    controls: { exclude: ['iconOnly', 'shape', 'feedback'] },
    docs: {
      description: {
        story:
          '行が `feedback`、列が形です。どれも押して写せたあと（2 秒のあいだ）の見た目に止めています。',
      },
      source: sourceCode(`
        {/* 既定: 吹き出しで「コピーしました」 */}
        <CopyButton text="…" />
        {/* ボタンの中の文字を「コピーしました」に変える */}
        <CopyButton text="…" feedback="label" />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={feedbacks}
      rowLabel={(feedback) => feedback}
      columns={forms}
      columnWidth="12rem"
      renderCell={(feedback, form) => (
        // 吹き出しは下に出るので、その分を空けておく
        <div className="pb-12">
          <CopiedPreviewContext value>
            <CopyButton {...args} feedback={feedback} iconOnly={form.iconOnly} shape={form.shape} />
          </CopiedPreviewContext>
        </div>
      )}
    />
  ),
};

export const Densities: Story = {
  name: '密度',
  tags: ['visual'],
  render: (args) => (
    <DensityPair>
      <div className="flex flex-wrap items-center gap-3">
        <CopyButton {...args} />
        <CopyButton {...args} iconOnly />
        <CopyButton {...args} iconOnly shape="round" />
      </div>
    </DensityPair>
  ),
};

// play: 読み上げと、写す文字列の確かめ
export const Accessibility: Story = {
  name: '読み上げ',
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <CopyButton {...args} />
      <CopyButton {...args} iconOnly label="URL をコピー" text={() => 'https://k6n.jp/'} />
    </div>
  ),
  play: async ({ args, canvas }) => {
    const { writeText, restore } = stubClipboard();
    try {
      // 文字のボタン: 名前は「コピー」のまま。写せたら読み上げで知らせる
      const button = canvas.getByRole('button', { name: 'コピー' });
      await userEvent.click(button);
      await waitFor(() => expect(writeText).toHaveBeenCalledWith('pnpm add @kazuemon/ui'));
      await expect(args.onCopied).toHaveBeenCalledWith('pnpm add @kazuemon/ui');
      await waitFor(() =>
        expect(canvas.getAllByRole('status')[0]).toHaveTextContent('コピーしました')
      );
      await expect(button).toHaveAccessibleName('コピー');
      await expect(button).toHaveAttribute('data-copied');
      // 既定（tooltip）では、吹き出しで「コピーしました」を出す
      const body = within(document.body);
      await waitFor(() =>
        expect(
          body.getByText('コピーしました', { selector: '[data-slot="tooltip"]' })
        ).toBeVisible()
      );
      // アイコンだけのボタン: label が名前。関数を渡すと、押したときに呼ぶ
      await userEvent.click(canvas.getByRole('button', { name: 'URL をコピー' }));
      await waitFor(() => expect(writeText).toHaveBeenLastCalledWith('https://k6n.jp/'));
    } finally {
      restore();
    }
  },
};

export const CopyError: Story = {
  name: '写せなかったとき',
  play: async ({ args, canvas }) => {
    const { restore } = stubClipboard(
      fn(async (_text: string) => {
        throw new Error('denied');
      })
    );
    try {
      const button = canvas.getByRole('button', { name: 'コピー' });
      await userEvent.click(button);
      await waitFor(() => expect(args.onCopyError).toHaveBeenCalledTimes(1));
      await expect(button).not.toHaveAttribute('data-copied');
      await expect(canvas.getByRole('status')).toHaveTextContent('');
    } finally {
      restore();
    }
  },
};
