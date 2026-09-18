import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
// 引数の userEvent は、LAN の IP で開いたとき（clipboard のない環境）は空になり、click などが呼べない
import { expect, userEvent } from 'storybook/test';

import { TextField } from '../text-field/TextField';
import { Textarea, type TextareaProps } from './Textarea';
import { DensityPair, Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

type Sample = MatrixColumn & { props: Partial<TextareaProps> };

const longText = [
  'はじめまして、かずえもんです。',
  'ふだんは Web のフロントエンドを書いています。',
  'この部品は、問い合わせのフォームやブログのコメント欄で使う想定です。',
  '長い文を書くと、欄が下に伸びていきます。',
  '上限の行数を超えると、欄の中でスクロールします。',
  '行の高さと上下の余白は、1 行の入力欄とそろえています。',
  'ここまでで 6 行です。',
  '7 行目です。',
  '8 行目です。',
  '9 行目です。ここから先はスクロールします。',
].join('\n');

const stateRows: Sample[] = [
  { label: '空', props: {} },
  { label: '値あり', props: { defaultValue: 'はじめまして。\nかずえもんです。' } },
  { label: 'エラー', props: { error: '本文を入力してください' } },
  {
    label: '警告',
    props: {
      defaultValue: 'はじめまして。',
      warning: '短い文は、一覧では前後の文とつながって見えます',
    },
  },
  { label: '押せない', props: { defaultValue: 'はじめまして。', disabled: true } },
];

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: 'フォーカス', state: 'focus' },
];

const heightRows: { label: string; props: Partial<TextareaProps> }[] = [
  { label: '既定（3〜8 行・つまみあり）', props: {} },
  { label: 'つまみなし', props: { resizable: false } },
  { label: '1 行から伸ばす', props: { minRows: 1 } },
  { label: '高さを固定（4 行）', props: { minRows: 4, maxRows: 4, resizable: false } },
];

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '複数行のテキストを入力する欄です。ラベル・キャプション・本体・エラーの並びと見た目は TextField と同じです。',
          '',
          '- 高さは入力に合わせて `minRows`（既定 3）から `maxRows`（既定 8）まで伸び、超えると欄の中でスクロールします。スクロールのつまみは ScrollArea と同じです。',
          '- 右下のつまみで、利用者が高さを変えられます（`resizable`、既定であり）。一度変えると、その高さのままになります。',
          '- `minRows` と `maxRows` を同じにすると、高さが変わらない欄になります。',
          '- 1 行ぶんの高さと 1 行目の文字の位置は、TextField と同じです。',
          '- `showCount` を渡すと、本体の右下の下に「12 / 200」の形で文字数を出します。上限は `maxCount`（超えても打てる）か `maxLength`（ブラウザが打つのを止める）です。',
          '- `maxCount` を超えると、`showCount` がなくても文字数を出し、数を赤にします。超えているあいだは欄もエラーの見た目（赤い枠線・`aria-invalid`）にし、読み上げでも知らせます。欄を変えたくないときは `overCountInvalid={false}` を渡します。送信を止めるときは、超えていたら `error` を渡します。',
          '- そのほかの props（`name`・`defaultValue`・`onChange` など）は `<textarea>` に渡ります。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: '本文',
    placeholder: 'ご用件をお書きください',
    captionPlacement: 'top',
    minRows: 3,
    maxRows: 8,
    resizable: true,
    showCount: false,
    disabled: false,
    readOnly: false,
  },
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    captionPlacement: {
      control: 'inline-radio',
      options: ['top', 'bottom'],
      table: { defaultValue: { summary: "'top'" } },
    },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    warning: { control: 'text' },
    minRows: { control: { type: 'number', min: 1 } },
    resizable: { control: 'boolean' },
    maxRows: { control: { type: 'number', min: 1 } },
    maxCount: { control: { type: 'number', min: 1 } },
    overCountInvalid: { control: 'boolean' },
    maxLength: { control: { type: 'number', min: 1 } },
    showCount: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  args: { caption: '返事はメールで送ります' },
  decorators: [
    (Story) => (
      <div className="max-w-md">
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
          '通常はグレーの塗りで枠線がなく、フォーカスで青い枠線が付きます。エラーのあいだは赤い枠線のまま、hover でも塗りを変えません。TextField と同じです。',
      },
      source: sourceCode(`
        <Textarea label="本文" placeholder="ご用件をお書きください" />
        <Textarea label="本文" error="本文を入力してください" />
        <Textarea label="本文" defaultValue="はじめまして。" disabled />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={stateRows}
      rowLabel={(row) => row.label}
      columns={stateColumns}
      columnWidth="16rem"
      renderCell={(row) => <Textarea {...args} {...row.props} />}
    />
  ),
};

// Show code: 表（Matrix）の中身は出ないので、行ごとの使い方を source.code に手で書く
export const Heights: Story = {
  tags: ['visual'],
  name: '高さ',
  parameters: {
    controls: { exclude: ['minRows', 'maxRows', 'resizable'] },
    docs: {
      description: {
        story: [
          '行が高さの指定、列が中身の長さです。入力に合わせて `minRows` から `maxRows` まで伸び、超えると欄の中でスクロールします。',
          '',
          '- `resizable={false}`: 右下のつまみを出しません。',
          '- `minRows={1}`: 空のときは 1 行（TextField と同じ高さ）。コメントの欄のように、短く書くことが多い場所に使います。',
          '- `minRows` と `maxRows` を同じにすると、高さが変わりません。',
        ].join('\n'),
      },
      source: sourceCode(`
        <Textarea label="本文" />
        <Textarea label="本文" resizable={false} />
        <Textarea label="本文" minRows={1} />
        <Textarea label="本文" minRows={4} maxRows={4} resizable={false} />
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={heightRows}
      rowLabel={(row) => row.label}
      columns={[
        { label: '空', value: undefined },
        { label: '短い文', value: 'はじめまして。\nかずえもんです。' },
        { label: '長い文', value: longText },
      ]}
      columnWidth="16rem"
      renderCell={(row, column) => (
        <Textarea {...args} {...row.props} defaultValue={(column as { value?: string }).value} />
      )}
    />
  ),
};

export const Messages: Story = {
  tags: ['visual'],
  name: 'キャプション・エラー・文字数',
  parameters: {
    docs: {
      description: {
        story:
          '並びは ラベル → キャプション → 本体 → 文字数 → エラー → 警告 です。文字数は `showCount` を渡したときと、`maxCount` を超えたときに出ます。',
      },
    },
  },
  render: (args) => (
    <Gallery>
      <Specimen label="caption">
        <Textarea {...args} caption="返事はメールで送ります" />
      </Specimen>
      <Specimen label="文字数">
        <Textarea
          {...args}
          caption="返事はメールで送ります"
          defaultValue="はじめまして。かずえもんです。"
          maxCount={200}
          showCount
        />
      </Specimen>
      <Specimen label="上限を超えた（showCount なし）">
        <Textarea
          {...args}
          caption="30文字まで"
          defaultValue="はじめまして。かずえもんです。ポートフォリオを見て連絡しました。"
          maxCount={30}
        />
      </Specimen>
      <Specimen label="上限を超えた（overCountInvalid={false}）">
        <Textarea
          {...args}
          caption="30文字まで"
          defaultValue="はじめまして。かずえもんです。ポートフォリオを見て連絡しました。"
          maxCount={30}
          overCountInvalid={false}
        />
      </Specimen>
      <Specimen label="文字数と error">
        <Textarea
          {...args}
          defaultValue="よろしく"
          maxCount={200}
          showCount
          error="10文字以上で入力してください"
        />
      </Specimen>
      <Specimen label="1 行の TextField と並べる">
        <div className="flex flex-col gap-4">
          <TextField label="件名" defaultValue="はじめまして" />
          <Textarea {...args} minRows={1} defaultValue="よろしくお願いします" />
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const Count: Story = {
  name: '文字数を数える',
  args: { maxCount: 10, showCount: true },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas, canvasElement }) => {
    const textarea = canvas.getByLabelText('本文');
    await expect(textarea.tagName).toBe('TEXTAREA');
    // maxCount は打つのを止めない（ブラウザの maxlength は付けない）
    await expect(textarea).not.toHaveAttribute('maxlength');
    await expect(textarea).toHaveAccessibleDescription('10文字まで。いま0文字');
    await userEvent.type(textarea, 'かずえもん');
    // 見えている数（読み上げでは、下の説明の文で読む）
    await expect(canvasElement.querySelector('[id$="count"] > [aria-hidden]')).toHaveTextContent(
      '5 / 10'
    );
    await expect(textarea).toHaveAccessibleDescription('10文字まで。いま5文字');
    await expect(textarea).not.toHaveAttribute('aria-invalid', 'true');
    // 超えても打てる。数を赤にし、説明と知らせの文で超えたことを伝え、aria-invalid を付ける
    await userEvent.type(textarea, 'です。よろしく');
    await expect(textarea).toHaveValue('かずえもんです。よろしく');
    await expect(canvas.getByText('12')).toHaveClass('text-fg-danger');
    await expect(textarea).toHaveAccessibleDescription('10文字を超えています。いま12文字');
    await expect(textarea).toHaveAttribute('aria-invalid', 'true');
    const live = canvasElement.querySelector('[aria-live="polite"].sr-only');
    await expect(live).toHaveTextContent('10文字を超えています');
    // 戻ったときも知らせる
    await userEvent.type(textarea, '{backspace}{backspace}{backspace}');
    await expect(live).toHaveTextContent('10文字以内に戻りました');
    await expect(textarea).not.toHaveAttribute('aria-invalid', 'true');
  },
};

export const CountForced: Story = {
  name: '上限を超えたら文字数を出す',
  args: { maxCount: 10 },
  parameters: {
    docs: {
      description: {
        story:
          '`showCount` がなくても、`maxCount` を超えているあいだは文字数を出します。戻ると消えます。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    const textarea = canvas.getByLabelText('本文');
    await userEvent.type(textarea, 'かずえもんです。');
    await expect(canvas.queryByText('/ 10', { exact: false })).toBeNull();
    await userEvent.type(textarea, 'よろしく');
    await expect(canvas.getByText('12')).toBeVisible();
    // 超えているあいだは欄をエラーの状態にする（エラーの行は出さない）
    await expect(textarea.closest('[data-invalid]')).not.toBeNull();
    await expect(textarea).toHaveAttribute('aria-invalid', 'true');
    await userEvent.type(textarea, '{backspace}{backspace}{backspace}');
    await expect(canvas.queryByText('/ 10', { exact: false })).toBeNull();
    await expect(textarea.closest('[data-invalid]')).toBeNull();
  },
};

export const Scroll: Story = {
  name: '行数の上限を超えたとき',
  args: { maxRows: 4, caption: '4 行を超えると、欄の中でスクロールします' },
  parameters: {
    docs: {
      description: {
        story:
          '`maxRows` を超えると欄の中でスクロールし、ScrollArea と同じつまみが出ます。打っているあいだは、キャレットのある行が上下の余白ごと見える位置に保たれます。Tab で止まるのは欄だけです。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas, canvasElement }) => {
    const textarea = canvas.getByLabelText('本文');
    await userEvent.click(textarea);
    await userEvent.type(
      textarea,
      '1 行目{enter}2 行目{enter}3 行目{enter}4 行目{enter}5 行目{enter}6 行目'
    );
    const viewport = canvasElement.querySelector<HTMLElement>(
      '[data-slot="textarea-scroll"] > [role="presentation"]'
    );
    // 上限の高さで止まり、中でスクロールする。つまみは ScrollArea と同じもの
    // （キャレットを見える位置に保つのはブラウザの動きで、userEvent の入力では起きないので、ここでは確かめない）
    await expect(viewport).not.toBeNull();
    await expect(viewport!.scrollHeight).toBeGreaterThan(viewport!.clientHeight);
    await expect(canvasElement.querySelector('[data-slot="scroll-area-thumb"]')).not.toBeNull();
    // スクロールする枠は Tab で止まらない（止まるのは欄だけ）
    await expect(viewport).toHaveAttribute('tabindex', '-1');
  },
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  args: { caption: '返事はメールで送ります' },
  parameters: {
    docs: {
      description: {
        story: '余白は入力方式で切り替わります。文字の大きさは、指でもマウスでも同じです。',
      },
    },
  },
  render: (args) => (
    <DensityPair>
      <div className="w-72">
        <Textarea {...args} />
      </div>
    </DensityPair>
  ),
};
