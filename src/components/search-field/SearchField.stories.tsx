import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent } from 'storybook/test';

import { Button } from '../button/Button';
import { SearchField, type SearchFieldProps } from './SearchField';
import { DensityPair, Matrix } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

type Sample = MatrixColumn & { props: Partial<SearchFieldProps> };

const stateRows: Sample[] = [
  { label: '空', props: {} },
  { label: '値あり', props: { defaultValue: 'デザイン' } },
  { label: 'エラー', props: { defaultValue: 'あ', errorText: '2文字以上で検索してください' } },
  { label: '押せない', props: { defaultValue: 'デザイン', disabled: true } },
  { label: '読み取り専用', props: { defaultValue: 'デザイン', readOnly: true } },
  {
    label: '待っている（止める）',
    props: { defaultValue: 'デザイン', loading: true, loadingBehavior: 'blocking' },
  },
];

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: 'フォーカス', state: 'focus' },
];

const searchIcons = [false, true] as const;
const shapes = ['attached', 'floating'] as const;

const meta = {
  title: 'Components/SearchField',
  component: SearchField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '検索の語を打つ欄です。値があるあいだ右端に消去のボタンが出て、Esc でも消せます。',
          '',
          '- 制御するときは `value` と `onValueChange`、しないときは `defaultValue` を使います。消去のボタンと Esc で消したときは、`onValueChange` に空の文字を渡したあと `onCleared` を呼びます。',
          '- 虫眼鏡は既定で本体の内側に置きます。`hideSearchIcon` を付けると置きません。虫眼鏡は押せない印なので塗りを付けず、グレー地の消去のボタン（押せる）と見分けられるようにしています。',
          '- 「検索」のように実行するボタンは、欄の中に入れず、欄の外に色か枠線のボタンとして置きます。Enter はフォームを送ります（スマートフォンのキーボードには「検索」が出ます）。',
          '- 欄を止めているあいだ（押せない・`loadingBehavior="blocking"`・フォームの送信中）は、消去のボタンを押せない形で出し、Esc でも消しません。読み取り専用の欄には、消去のボタンを出しません。',
          '- そのほかの props は TextField と同じです。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: 'サイト内を検索',
    placeholder: '例: デザイン',
    hideSearchIcon: false,
    addonShape: 'attached',
    disabled: false,
    readOnly: false,
    loading: false,
  },
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    placeholder: { control: 'text' },
    errorText: { control: 'text' },
    hideSearchIcon: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    addonShape: { control: 'inline-radio', options: shapes },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
};

// Show code: 表（Matrix）の中身は出ないので、行ごとの使い方を source.code に手で書く
export const States: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: {
    pseudo: statePseudo({ hover: '[data-slot="control"]', focusWithin: '[data-slot="control"]' }),
    docs: {
      description: {
        story:
          '値があるあいだ、右端に消去のボタンが出ます。押せない欄と、待っているあいだ止める欄では、消去のボタンも押せません。読み取り専用の欄には出しません。',
      },
      source: sourceCode(`
        <SearchField label="サイト内を検索" placeholder="例: デザイン" />
        <SearchField label="サイト内を検索" defaultValue="デザイン" />
        <SearchField label="サイト内を検索" defaultValue="デザイン" disabled />
        <SearchField label="サイト内を検索" defaultValue="デザイン" readOnly />
        <SearchField label="サイト内を検索" defaultValue="デザイン" loading loadingBehavior="blocking" />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={stateRows}
      rowLabel={(row) => row.label}
      columns={stateColumns}
      columnWidth="16rem"
      renderCell={(row) => <SearchField {...args} {...row.props} />}
    />
  ),
};

// Show code: 表（Matrix）の中身は出ないので、使い方を source.code に手で書く
export const Icons: Story = {
  tags: ['visual'],
  name: '虫眼鏡の置き方',
  parameters: {
    controls: { exclude: ['hideSearchIcon', 'addonShape'] },
    docs: {
      description: {
        story:
          '列が虫眼鏡を出すかどうか（`hideSearchIcon`）、行が消去のボタンの形（`addonShape`）です。隠したときは、`prefix` に別のものを置けます。',
      },
      source: sourceCode(`
        <SearchField label="サイト内を検索" />
        <SearchField label="サイト内を検索" hideSearchIcon />
        <SearchField label="サイト内を検索" addonShape="floating" />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={shapes}
      rowLabel={(shape) => shape}
      columns={searchIcons.map((hideSearchIcon) => ({
        label: hideSearchIcon ? 'hideSearchIcon' : '既定',
        hideSearchIcon,
      }))}
      columnWidth="16rem"
      renderCell={(shape, { hideSearchIcon }) => (
        <SearchField
          {...args}
          defaultValue="デザイン"
          hideSearchIcon={hideSearchIcon}
          addonShape={shape}
        />
      )}
    />
  ),
};

function SearchForm() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <form
      role="search"
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(query);
      }}
    >
      <div className="flex items-end gap-2">
        <SearchField
          label="記事を検索"
          placeholder="例: デザイン"
          className="min-w-0 flex-1"
          value={query}
          onValueChange={setQuery}
        />
        <Button type="submit" color="primary">
          検索
        </Button>
      </div>
      <p className="text-sm text-fg-muted">
        {submitted === null ? 'まだ検索していません' : `「${submitted}」で検索しました`}
      </p>
    </form>
  );
}

// Show code: 状態を持つ例なので、写して使える形を source.code に手で書く
export const WithSubmitButton: Story = {
  name: '検索のボタンを欄の外に置く',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '実行する「検索」のボタンは、欄の外に色のボタンとして置きます。欄と同じ行の下端にそろえ、フォームに `role="search"` を付けます。Enter でも送れます。',
      },
      source: sourceCode(`
        const [query, setQuery] = useState('');
        <form role="search" onSubmit={…}>
          <div className="flex items-end gap-2">
            <SearchField label="記事を検索" className="min-w-0 flex-1" value={query} onValueChange={setQuery} />
            <Button type="submit" color="primary">検索</Button>
          </div>
        </form>
      `),
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  render: () => <SearchForm />,
  play: async ({ canvas }) => {
    const input = canvas.getByRole('searchbox', { name: '記事を検索' });
    await userEvent.type(input, 'デザイン{Enter}');
    await expect(canvas.getByText('「デザイン」で検索しました')).toBeInTheDocument();
  },
};

export const Clear: Story = {
  name: '消す',
  args: { onValueChange: fn(), onCleared: fn() },
  parameters: {
    docs: {
      description: {
        story:
          '消去のボタンを押すと、値を空にして欄にフォーカスを戻します。Esc でも消せます。空の欄で Esc を押したときは何もせず、外（ダイアログなど）に任せます。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole('searchbox', { name: 'サイト内を検索' });
    await expect(input).toHaveAttribute('enterkeyhint', 'search');
    await expect(canvas.queryByRole('button', { name: '入力内容を消去' })).toBeNull();

    await userEvent.type(input, 'かず');
    await userEvent.click(canvas.getByRole('button', { name: '入力内容を消去' }));
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('');
    await expect(args.onCleared).toHaveBeenCalledTimes(1);
    await expect(canvas.queryByRole('button', { name: '入力内容を消去' })).toBeNull();

    await userEvent.type(input, 'えもん');
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('');
    await expect(args.onCleared).toHaveBeenCalledTimes(2);
  },
};

export const Locked: Story = {
  name: '止めているあいだ',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '待っているあいだ止める欄では、消去のボタンを押せない形で出し、Esc でも消しません。読み取り専用の欄には消去のボタンを出しません。',
      },
    },
  },
  render: () => (
    <div className="flex max-w-sm flex-col gap-6">
      <SearchField
        label="止めている欄"
        defaultValue="デザイン"
        loading
        loadingBehavior="blocking"
      />
      <SearchField label="読み取り専用の欄" defaultValue="デザイン" readOnly />
    </div>
  ),
  play: async ({ canvas }) => {
    const blocked = canvas.getByRole('searchbox', { name: '止めている欄' });
    await expect(canvas.getByRole('button', { name: '入力内容を消去' })).toBeDisabled();
    blocked.focus();
    await userEvent.keyboard('{Escape}');
    await expect(blocked).toHaveValue('デザイン');
    // 読み取り専用の欄には出さないので、ボタンは止めている欄の 1 つだけ
    await expect(canvas.getAllByRole('button', { name: '入力内容を消去' })).toHaveLength(1);
  },
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  args: { defaultValue: 'デザイン' },
  parameters: {
    docs: {
      description: {
        story:
          '高さ・文字・余白は入力方式で切り替わります。ツールバーの「密度」でも切り替えられます。',
      },
    },
  },
  render: (args) => (
    <DensityPair>
      <div className="w-72">
        <SearchField {...args} />
      </div>
    </DensityPair>
  ),
};
