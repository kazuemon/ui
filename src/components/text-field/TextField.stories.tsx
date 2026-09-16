import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
// 引数の userEvent は、LAN の IP で開いたとき（clipboard のない環境）は空になり、click などが呼べない
import { expect, userEvent } from 'storybook/test';

import { FieldAddonButton } from '../field-addon/FieldAddon';
import { EyeIcon, EyeSlashIcon } from '../icons/icons';
import { TextField, type TextFieldProps } from './TextField';
import { DensityPair, Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

type Sample = MatrixColumn & { props: Partial<TextFieldProps> };

const stateRows: Sample[] = [
  { label: '空', props: {} },
  { label: '値あり', props: { defaultValue: 'かずえもん' } },
  { label: 'エラー', props: { error: '表示名を入力してください' } },
  {
    label: '警告',
    props: {
      defaultValue: 'かずえもん（Kazuya Miyamoto）',
      warning: '20文字を超えると、一覧では途中で切れます',
    },
  },
  { label: '押せない', props: { defaultValue: 'かずえもん', disabled: true } },
];

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: 'フォーカス', state: 'focus' },
];

const addonColumns: Sample[] = [
  {
    label: 'prefix',
    props: { label: 'Web サイト', prefix: 'https://', placeholder: 'example.com' },
  },
  {
    label: 'suffix',
    props: { label: '価格', suffix: '円', defaultValue: '1200', inputMode: 'numeric' },
  },
  {
    label: 'エラー',
    props: {
      label: 'Web サイト',
      prefix: 'https://',
      defaultValue: 'example',
      error: 'URL の形が正しくありません',
    },
  },
  {
    label: '押せない',
    props: { label: 'Web サイト', prefix: 'https://', defaultValue: 'example.com', disabled: true },
  },
  {
    label: 'ボタン',
    props: {
      label: 'パスワード',
      type: 'password',
      defaultValue: 'kazuemon',
      suffix: (
        <FieldAddonButton aria-label="パスワードを表示">
          <EyeIcon standalone />
        </FieldAddonButton>
      ),
    },
  },
];

const shapes = ['attached', 'floating'] as const;
const behaviors = ['non-blocking', 'blocking'] as const;
const indicators = ['spinner', 'bar'] as const;

const meta = {
  title: 'Components/TextField',
  component: TextField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '1行のテキストを入力する欄です。ラベル・キャプション（補足）・本体を縦に積みます。',
          '',
          '- `caption` は補足で、エラーや警告が出ても消えません。`captionPlacement` で、ラベルの下（既定）か本体の下かを選びます。',
          '- `error` を渡すと、欄が赤い枠線になり、本体の下に丸の「!」と文を出します。`warning` は欄の見た目を変えず、三角と文を出します。どちらも出たときに読み上げで知らせます。',
          '- `prefix`・`suffix` に文字を渡すと、本体の端にグレーのラベルが付きます。ボタンは `FieldAddonButton` を渡します。suffix のボタンは、パスワードの表示のように入力欄そのものを操作するものに限り、検索のように値を送るボタンは欄の外に置きます。',
          '- 値を確かめているあいだは `loading` を付けます。',
          '- そのほかの props（`name`・`defaultValue`・`onChange` など）は `<input>` に渡ります。',
        ].join('\n'),
      },
    },
  },
  // Controls で既定の値を選んだ状態から始める（部品の既定と同じ値）
  args: {
    label: '表示名',
    placeholder: 'かずえもん',
    captionPlacement: 'top',
    addonShape: 'attached',
    disabled: false,
    readOnly: false,
    loading: false,
    loadingBehavior: 'non-blocking',
    loadingIndicator: 'spinner',
  },
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    // 表の「Default」は、部品の引数の既定値からしか読まれない。既定値を持たない props はここで補う
    captionPlacement: {
      control: 'inline-radio',
      options: ['top', 'bottom'],
      table: { defaultValue: { summary: "'top'" } },
    },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    warning: { control: 'text' },
    prefix: { control: 'text' },
    suffix: { control: 'text' },
    addonShape: { control: 'inline-radio', options: shapes },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    loading: { control: 'boolean' },
    loadingBehavior: { control: 'inline-radio', options: behaviors },
    loadingIndicator: { control: 'inline-radio', options: indicators },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  args: { caption: '一覧とプロフィールに出ます' },
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
          '通常はグレーの塗りで枠線がなく、フォーカスで青い枠線が付きます（クリックでもキーボードでも）。エラーのあいだは赤い枠線のまま、hover でも塗りを変えません。',
      },
      source: sourceCode(`
        {/* hover・フォーカスの見た目は部品が受け持つ */}
        <TextField label="表示名" placeholder="かずえもん" />
        <TextField label="表示名" defaultValue="かずえもん" />
        <TextField label="表示名" error="表示名を入力してください" />
        <TextField
          label="表示名"
          defaultValue="かずえもん（Kazuya Miyamoto）"
          warning="20文字を超えると、一覧では途中で切れます"
        />
        <TextField label="表示名" defaultValue="かずえもん" disabled />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={stateRows}
      rowLabel={(row) => row.label}
      columns={stateColumns}
      columnWidth="16rem"
      renderCell={(row) => <TextField {...args} {...row.props} />}
    />
  ),
};

export const Messages: Story = {
  tags: ['visual'],
  name: 'キャプション・エラー・警告',
  parameters: {
    docs: {
      description: {
        story:
          '並びは ラベル → キャプション → 本体 → エラー → 警告 です。`captionPlacement="bottom"` ではキャプションが本体の下に移り、エラー・警告はその下に続きます。エラーと警告は両方出せます。',
      },
    },
  },
  render: (args) => (
    <Gallery>
      <Specimen label="caption（上）">
        <TextField {...args} caption="一覧とプロフィールに出ます" />
      </Specimen>
      <Specimen label="caption（下）">
        <TextField {...args} caption="一覧とプロフィールに出ます" captionPlacement="bottom" />
      </Specimen>
      <Specimen label="error">
        <TextField
          {...args}
          caption="一覧とプロフィールに出ます"
          error="表示名を入力してください"
        />
      </Specimen>
      <Specimen label="warning">
        <TextField
          {...args}
          caption="一覧とプロフィールに出ます"
          defaultValue="かずえもん（Kazuya Miyamoto）"
          warning="20文字を超えると、一覧では途中で切れます"
        />
      </Specimen>
      <Specimen label="error と warning">
        <TextField
          {...args}
          label="ユーザー名"
          caption="プロフィールの URL に使います"
          defaultValue="Kazuemon"
          error="このユーザー名はすでに使われています"
          warning="大文字は小文字にそろえて登録します"
        />
      </Specimen>
    </Gallery>
  ),
};

// Show code: 表（Matrix）の中身は出ないので、列ごとの使い方を source.code に手で書く
export const Addons: Story = {
  name: 'prefix・suffix',
  parameters: {
    controls: { exclude: ['prefix', 'suffix', 'addonShape'] },
    docs: {
      description: {
        story:
          '行が形（`addonShape`）です。`attached`（既定）は本体の端に接する塊、`floating` は本体の内側に少し浮かせます。`floating` は、欄の外形を入力欄だけのときと同じにしたいときや、グレーを軽く見せたいときに使います。文字の prefix・suffix を押しても、入力欄にフォーカスが移ります。',
      },
      source: sourceCode(`
        <TextField label="Web サイト" prefix="https://" placeholder="example.com" />
        <TextField label="価格" suffix="円" defaultValue="1200" inputMode="numeric" />
        {/* 本体の内側に少し浮かせる */}
        <TextField label="Web サイト" prefix="https://" addonShape="floating" />
        <TextField
          label="パスワード"
          type="password"
          suffix={
            <FieldAddonButton aria-label="パスワードを表示">
              <EyeIcon standalone />
            </FieldAddonButton>
          }
        />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={shapes}
      rowLabel={(shape) => shape}
      columns={addonColumns}
      columnWidth="13rem"
      renderCell={(shape, column) => <TextField {...args} {...column.props} addonShape={shape} />}
    />
  ),
};

// パスワードの表示を切り替える例。ボタンの名前は変えず、押しているかを aria-pressed で伝える
function PasswordField() {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      label="パスワード"
      caption="8文字以上で入力してください"
      autoComplete="new-password"
      defaultValue="kazuemon-2026"
      type={visible ? 'text' : 'password'}
      suffix={
        <FieldAddonButton
          aria-label="パスワードを表示"
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeSlashIcon standalone /> : <EyeIcon standalone />}
        </FieldAddonButton>
      }
    />
  );
}

// Show code: 状態を持ち、ハンドラーが要の例なので、写して使える部品の形を source.code に手で書く
export const PasswordToggle: Story = {
  name: 'パスワードの表示を切り替える',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`suffix` に `FieldAddonButton` を渡した例です。アイコンだけのボタンには `aria-label` を付けます。欄が押せないときは、ボタンも押せなくなります。',
      },
      source: sourceCode(`
        // ボタンの名前は変えず、押しているかを aria-pressed で伝える
        function PasswordField() {
          const [visible, setVisible] = useState(false);
          return (
            <TextField
              label="パスワード"
              caption="8文字以上で入力してください"
              autoComplete="new-password"
              type={visible ? 'text' : 'password'}
              suffix={
                <FieldAddonButton
                  aria-label="パスワードを表示"
                  aria-pressed={visible}
                  onClick={() => setVisible((current) => !current)}
                >
                  {visible ? <EyeSlashIcon standalone /> : <EyeIcon standalone />}
                </FieldAddonButton>
              }
            />
          );
        }
      `),
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  render: () => <PasswordField />,
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('パスワード');
    await expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(canvas.getByRole('button', { name: 'パスワードを表示' }));
    await expect(input).toHaveAttribute('type', 'text');
    await expect(canvas.getByRole('button', { name: 'パスワードを表示' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  },
};

// Show code: 表（Matrix）の中身は出ないので、行と列の使い方を source.code に手で書く
export const Loading: Story = {
  name: '待っているあいだ',
  args: { label: 'ユーザー名', defaultValue: 'kazuemon', loading: true },
  parameters: {
    controls: { exclude: ['loadingBehavior', 'loadingIndicator'] },
    docs: {
      description: {
        story: [
          '行が欄の扱い（`loadingBehavior`）、列が印（`loadingIndicator`）です。どちらの扱いでもフォーカスは外れません。',
          '',
          '- `non-blocking`（既定）: 書き換えられるままにします。入力した値をあとから確かめるときに使います。',
          '- `blocking`: 押せない欄と同じ見た目にし、書き換えられなくします。',
          '- `spinner`（既定）は右端に回る円、`bar` は下端に流れる線です。',
        ].join('\n'),
      },
      source: sourceCode(`
        <TextField label="ユーザー名" defaultValue="kazuemon" loading />
        <TextField label="ユーザー名" defaultValue="kazuemon" loading loadingBehavior="blocking" />
        <TextField label="ユーザー名" defaultValue="kazuemon" loading loadingIndicator="bar" />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={behaviors}
      rowLabel={(behavior) => behavior}
      columns={indicators.map((indicator) => ({ label: indicator, indicator }))}
      columnWidth="16rem"
      renderCell={(behavior, { indicator }) => (
        <TextField {...args} loadingBehavior={behavior} loadingIndicator={indicator} />
      )}
    />
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  args: { caption: '一覧とプロフィールに出ます' },
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
        <TextField {...args} />
      </div>
    </DensityPair>
  ),
};
