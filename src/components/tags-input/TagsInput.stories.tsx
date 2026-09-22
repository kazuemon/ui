import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
// 引数の userEvent は、LAN の IP で開いたとき（clipboard のない環境）は空になり、click などが呼べない
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import type { ListboxItem } from '../../internal/listbox/use-listbox-option';
import { TagsInput } from './TagsInput';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';

const skills: ListboxItem[] = [
  'デザイン',
  'フロントエンド',
  'バックエンド',
  'インフラ',
  'アクセシビリティ',
  'ライティング',
].map((label) => ({ label, value: label }));

const skillsSource = `const skills: ListboxItem[] = ['デザイン', 'フロントエンド', 'バックエンド'].map(
  (label) => ({ label, value: label })
);`;

// 開いた候補を、ページの body ではなくこの枠の中に描く。ドキュメントのページでも、ストーリーごとに収まる
function PopoverFrame({
  height = 'h-[22rem]',
  children,
}: {
  height?: string;
  children: (container: HTMLElement) => ReactNode;
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer} className={`relative max-w-sm ${height}`}>
      {container && children(container)}
    </div>
  );
}

// 開いた状態のストーリーも、ドキュメントのページでは閉じて描く
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

const meta = {
  title: 'Components/TagsInput',
  component: TagsInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '打った文字をタグにして並べる欄です。値の元は打った文字なので、決まった選択肢から選ぶときは Combobox（`multiple`）を使ってください。',
          '',
          '- Enter か、区切りの文字（既定は `,`）を打つと、打っている文字がタグになります。区切りの文字は `separators` で変えられます。',
          '- 区切りや改行・タブを含む文字を貼り付けると、まとめてタグになります。',
          '- 値は文字の配列です。`defaultValue` か、`value`・`onValueChange` で持ちます。`name` を渡すと、タグの数だけ同じ名前でフォームに送られます。',
          '- `items` を渡すと、打っているあいだに候補が出ます。候補にない文字もそのままタグになります。渡さないときは候補を出しません。',
          '- 同じ文字のタグは既定では足さず、すでにあるチップを一瞬強調します（`allowDuplicates` で足せます）。数の上限は `max` で決めます。',
          '- タグにしてよいかを確かめるときは `validate` を渡します。通らなかった文字はタグにならず、返した文をエラーの行に出します。',
          '- タグが増えると欄が高くなります。高さを止めたいときは `maxRows` で行数を指定します（あふれた分はスクロールします）。',
          '- 欄が空のときの Backspace は、1 回目で最後のチップを選び、2 回目で外します。チップの × でも外せます。',
          '- フォーカスが外れたときは、打っている途中の文字をタグにします（`commitOnBlur={false}` で捨てられます）。',
          '- 浮かぶ候補そのものに props を足すときは `popupProps`、位置の決め方（画面の端での逃がし方など）は `positionerProps`、打つ欄には `inputProps` を渡します。外を押して閉じるかは `dismissible`、Esc で閉じるかは `closeOnEscape` です。',
        ].join('\n'),
      },
    },
  },
  // Controls で既定の値を選んだ状態から始める（部品の既定と同じ値）
  args: {
    label: 'タグ',
    placeholder: '打って Enter で足す',
    captionPlacement: 'top',
    color: 'neutral',
    disabled: false,
    readOnly: false,
    clearable: true,
    allowDuplicates: false,
    commitOnBlur: true,
    openOnInputClick: false,
    autoHighlight: false,
    chipSize: 'sm',
    loading: false,
    loadingBehavior: 'non-blocking',
    loadingIndicator: 'spinner',
    loadingText: '読み込んでいます',
    modal: false,
    onValueChange: fn(),
    onReject: fn(),
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
    emptyText: { control: 'text' },
    errorText: { control: 'text' },
    warningText: { control: 'text' },
    successText: { control: 'text' },
    hideSuccessMark: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    infoText: { control: 'text' },
    color: { control: 'inline-radio', options: ['primary', 'secondary', 'neutral'] },
    chipSize: { control: 'inline-radio', options: ['sm', 'md'] },
    maxRows: { control: 'number' },
    enterKeyHint: {
      control: 'inline-radio',
      options: ['enter', 'done', 'go', 'next', 'send'],
      table: { defaultValue: { summary: "'enter'" } },
    },
    rejectMessage: { control: false },
    chipMaxWidth: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    clearable: { control: 'boolean' },
    clearName: { control: 'text' },
    chipsName: { control: 'text' },
    chipRemoveName: { control: false },
    allowDuplicates: { control: 'boolean' },
    commitOnBlur: { control: 'boolean' },
    max: { control: 'number' },
    separators: { control: 'object', table: { defaultValue: { summary: "[',']" } } },
    validate: { control: false },
    onReject: { control: false },
    openOnInputClick: { control: 'boolean' },
    autoHighlight: { control: 'boolean' },
    groupLabelStyle: { control: 'inline-radio', options: ['label', 'caption'] },
    showGroupSeparator: { control: 'boolean' },
    popoverMoreCue: { control: 'inline-radio', options: ['shadow', 'none'] },
    popoverMaxHeight: { control: 'inline-radio', options: ['screen', 'none'] },
    loading: { control: 'boolean' },
    loadingBehavior: { control: 'inline-radio', options: ['non-blocking', 'blocking'] },
    loadingIndicator: { control: 'inline-radio', options: ['spinner', 'bar'] },
    loadingText: { control: 'text' },
    loadedText: { control: false },
    modal: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    items: { control: false },
    filter: { control: false },
    filteredItems: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    inputValue: { control: false },
    defaultInputValue: { control: false },
    open: { control: false },
    defaultOpen: { control: false },
    portalContainer: { control: false },
    positionerProps: { control: false },
    popupProps: { control: false },
    inputProps: { control: false },
  },
} satisfies Meta<typeof TagsInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow = (Story: () => ReactNode) => (
  <div className="max-w-sm">
    <Story />
  </div>
);

export const Playground: Story = {
  name: '基本',
  args: { caption: '記事に付けるタグを打ってください', defaultValue: ['デザイン'] },
  decorators: [narrow],
};

export const Separators: Story = {
  name: '区切りで足す',
  args: { label: '記事のタグ', defaultValue: ['デザイン'] },
  parameters: {
    controls: { include: ['separators', 'placeholder'] },
    docs: {
      description: {
        story:
          '打っている文字は、Enter か区切りの文字（既定は `,`）でタグになります。区切りの文字は `separators` で変えられます（例: 読点も区切りにする `[",", "、"]`）。日本語の変換中の Enter では確定しません。ソフトウェアキーボードの実行キーは、既定では Enter を送るキー（`enterKeyHint="enter"`）です。',
      },
    },
  },
  decorators: [narrow],
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox');
    // ソフトウェアキーボードの実行キーは Enter を送る（「次へ」で隣の欄に移らない）
    await expect(input).toHaveAttribute('enterkeyhint', 'enter');
    // Enter で足す
    await userEvent.type(input, '実装{Enter}');
    await expect(canvas.getByText('実装')).toBeVisible();
    await expect(input).toHaveValue('');
    // 区切りの文字でも足す。区切りのあとの切れ端は欄に残る
    await userEvent.type(input, '設計,検証');
    await expect(canvas.getByText('設計')).toBeVisible();
    await expect(input).toHaveValue('検証');
    // 変換中（IME）の Enter では確定しない
    await userEvent.clear(input);
    await userEvent.type(input, 'にほんご');
    await userEvent.keyboard('{Process>}');
    input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    await userEvent.type(input, '{Enter}');
    await expect(canvas.queryByText('にほんご')).toBeNull();
    await expect(input).toHaveValue('にほんご');
    // 変換が終わってからの Enter で確定する
    input.dispatchEvent(
      new CompositionEvent('compositionend', { bubbles: true, data: 'にほんご' })
    );
    await userEvent.type(input, '{Enter}');
    await expect(canvas.getByText('にほんご')).toBeVisible();
  },
};

export const Paste: Story = {
  name: '貼り付けて足す',
  args: { label: 'メールの宛先', placeholder: '打つか、貼り付ける' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '区切りの文字・改行・タブを含む文字を貼り付けると、まとめてタグになります。区切りのない文字は、ふつうに欄へ入ります。表計算やメモから写すときに使えます。',
      },
    },
  },
  decorators: [narrow],
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.paste('taro@example.com,hanako@example.com\njiro@example.com');
    await expect(canvas.getByText('taro@example.com')).toBeVisible();
    await expect(canvas.getByText('hanako@example.com')).toBeVisible();
    await expect(canvas.getByText('jiro@example.com')).toBeVisible();
    await expect(input).toHaveValue('');
    // 区切りのない貼り付けは、そのまま欄に入る
    await userEvent.paste('saburo@example.com');
    await expect(input).toHaveValue('saburo@example.com');
  },
};

export const Duplicates: Story = {
  name: '同じタグを足したとき',
  args: { label: '記事のタグ', defaultValue: ['デザイン', '実装'] },
  parameters: {
    controls: { include: ['allowDuplicates'] },
    docs: {
      description: {
        story:
          '同じ文字のタグは既定では足さず、すでにあるチップを一瞬強調します。`allowDuplicates` を付けると、同じ文字でも足せます。',
      },
    },
  },
  decorators: [narrow],
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole('combobox');
    await userEvent.type(input, 'デザイン{Enter}');
    // チップは増えない（打った文字は消える）
    await expect(canvas.getAllByText('デザイン')).toHaveLength(1);
    await expect(args.onReject).toHaveBeenCalledWith('デザイン', 'duplicate');
  },
};

export const Limit: Story = {
  name: '数の上限',
  args: { label: '記事のタグ', max: 3, defaultValue: ['デザイン', '実装'], caption: '3 つまで' },
  parameters: {
    controls: { include: ['max'] },
    docs: {
      description: {
        story:
          '`max` を渡すと、その数までしか足せません。超えた分はタグにならず、`onReject` に `max` として届きます。「3 つまで」のような文は、部品ではなくキャプションに書きます。',
      },
    },
  },
  decorators: [narrow],
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole('combobox');
    await userEvent.type(input, '検証{Enter}');
    await expect(canvas.getByText('検証')).toBeVisible();
    await userEvent.type(input, '運用{Enter}');
    await expect(canvas.queryByText('運用')).toBeNull();
    await expect(args.onReject).toHaveBeenCalledWith('運用', 'max');
  },
};

export const Validate: Story = {
  name: '確かめてから足す',
  args: {
    label: 'メールの宛先',
    placeholder: 'メールアドレスを打つ',
    validate: (tag: string) =>
      tag.includes('@') ? null : `${tag} はメールアドレスの形ではありません`,
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`validate` を渡すと、タグにする前に確かめます。通らなかった文字はチップにならず、返した文を本体の下のエラーの行に出します。文は呼び出し側が作ります。',
      },
      source: sourceCode(`
        <TagsInput
          label="メールの宛先"
          placeholder="メールアドレスを打つ"
          validate={(tag) => (tag.includes('@') ? null : \`\${tag} はメールアドレスの形ではありません\`)}
        />
      `),
    },
  },
  decorators: [narrow],
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox');
    await userEvent.type(input, 'taro{Enter}');
    // タグにはならず、エラーの行が出る。直せるように、打った文字は欄に残る
    await waitFor(async () => {
      await expect(canvas.getByText('taro はメールアドレスの形ではありません')).toBeVisible();
    });
    await expect(input).toHaveValue('taro');
    // エラーの行は、欄の説明にもつながる
    await expect(input.getAttribute('aria-describedby')).toContain(
      canvas.getByText('taro はメールアドレスの形ではありません').id
    );
    // 通る文字を足すと、エラーの行は消える
    await userEvent.clear(input);
    await userEvent.type(input, 'taro@example.com{Enter}');
    await expect(canvas.getByText('taro@example.com')).toBeVisible();
  },
};

export const RemoveTags: Story = {
  name: 'タグを外す',
  args: { label: '記事のタグ', defaultValue: ['デザイン', '実装', '検証'] },
  parameters: {
    controls: { include: ['clearable'] },
    docs: {
      description: {
        story:
          'チップの × で 1 つずつ外せます。欄が空のときの Backspace は、1 回目で最後のチップを選び、2 回目で外します。← でもチップへ移れます。欄の端の × は、タグをすべて消します。',
      },
    },
  },
  decorators: [narrow],
  play: async ({ canvas, canvasElement }) => {
    const input = canvas.getByRole('combobox');
    // × で 1 つ外す
    await userEvent.click(canvas.getByRole('button', { name: '検証 を外す' }));
    await expect(canvas.queryByText('検証')).toBeNull();
    // 空の欄の Backspace は、1 回目で最後のチップを選ぶ（まだ消えない）
    await userEvent.click(input);
    await userEvent.keyboard('{Backspace}');
    const chips = canvasElement.querySelectorAll('[data-slot="tags-input-chip"]');
    await expect(document.activeElement).toBe(chips[chips.length - 1]);
    await expect(canvas.getByText('実装')).toBeVisible();
    // 2 回目で消える
    await userEvent.keyboard('{Backspace}');
    await expect(canvas.queryByText('実装')).toBeNull();
    // 端の × は、タグをすべて消す
    await userEvent.click(canvas.getByRole('button', { name: 'タグをすべて消去' }));
    await expect(canvas.queryByText('デザイン')).toBeNull();
  },
};

export const WithItems: Story = {
  tags: ['visual'],
  name: '候補を出す',
  args: {
    label: '記事のタグ',
    items: skills,
    defaultValue: ['デザイン'],
    defaultInputValue: 'フロント',
    emptyText: '当てはまる候補がありません',
    placeholder: '打って Enter で足す',
  },
  parameters: {
    controls: { include: ['openOnInputClick', 'autoHighlight', 'emptyText'] },
    docs: {
      description: {
        story:
          '`items` を渡すと、打っているあいだに候補が出ます。候補を押すとタグになり、候補にない文字も Enter でそのままタグになります。`items` を渡さなければ、候補は出ません。',
      },
      source: sourceCode(
        skillsSource,
        `
        <TagsInput
          label="記事のタグ"
          items={skills}
          placeholder="打って Enter で足す"
          emptyText="当てはまる候補がありません"
        />
        `
      ),
    },
  },
  render: (args, { viewMode }) => (
    <PopoverFrame>
      {(container) => (
        <TagsInput
          {...args}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={container}
          positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
        />
      )}
    </PopoverFrame>
  ),
};

export const ItemsPlay: Story = {
  name: '候補から足す',
  args: {
    label: '記事のタグ',
    items: skills,
    emptyText: '当てはまる候補がありません',
    placeholder: '打って Enter で足す',
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '候補を押すとタグになります。候補に当たらない文字でも、Enter を押せばそのままタグになります。',
      },
      source: sourceCode(
        skillsSource,
        `<TagsInput label="記事のタグ" items={skills} emptyText="当てはまる候補がありません" />`
      ),
    },
  },
  render: (args) => (
    <PopoverFrame>
      {(container) => (
        <TagsInput
          {...args}
          portalContainer={container}
          positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
        />
      )}
    </PopoverFrame>
  ),
  play: async ({ canvas, canvasElement }) => {
    const input = canvas.getByRole('combobox');
    const page = within(canvasElement.ownerDocument.body);
    // 打つと候補が出る。押すとタグになる
    await userEvent.type(input, 'イン');
    await userEvent.click(await page.findByRole('option', { name: 'インフラ' }));
    const chips = () => within(canvas.getByLabelText('追加したタグ'));
    await expect(chips().getByText('インフラ')).toBeVisible();
    // 候補にない文字も、Enter でそのままタグになる
    await userEvent.type(input, '社内ツール{Enter}');
    await expect(chips().getByText('社内ツール')).toBeVisible();
  },
};

export const InForm: Story = {
  name: 'フォームに送る',
  args: { label: '記事のタグ', name: 'tag', defaultValue: ['デザイン', '実装'] },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: '`name` を渡すと、タグの数だけ同じ名前でフォームに送られます。',
      },
    },
  },
  decorators: [narrow],
  render: (args) => (
    <form>
      <TagsInput {...args} />
    </form>
  ),
  play: async ({ canvas, canvasElement }) => {
    const names = () =>
      [...canvasElement.querySelectorAll<HTMLInputElement>('input[name="tag"]')].map(
        (el) => el.value
      );
    await expect(names()).toEqual(['デザイン', '実装']);
    await userEvent.type(canvas.getByRole('combobox'), '検証{Enter}');
    await expect(names()).toEqual(['デザイン', '実装', '検証']);
  },
};

export const Chips: Story = {
  tags: ['visual'],
  name: 'チップの大きさ',
  args: { label: '記事のタグ' },
  parameters: {
    controls: { include: ['chipSize', 'chipMaxWidth', 'color'] },
    docs: {
      description: {
        story:
          'チップの高さは `chipSize`（既定は `sm`）、最大幅は `chipMaxWidth` で決めます。最大幅を決めないときは、欄の幅までです。タグが増えると欄の高さが伸びます。',
      },
    },
  },
  render: (args) => (
    <Gallery>
      <Specimen label="sm（既定）">
        <TagsInput {...args} defaultValue={['デザイン', '実装']} />
      </Specimen>
      <Specimen label="md">
        <TagsInput {...args} chipSize="md" defaultValue={['デザイン', '実装']} />
      </Specimen>
      <Specimen label="chipMaxWidth">
        <TagsInput
          {...args}
          chipMaxWidth="8rem"
          defaultValue={['アクセシビリティの設計と検証', '実装']}
        />
      </Specimen>
      <Specimen label="たくさん">
        <TagsInput
          {...args}
          defaultValue={['デザイン', '実装', '検証', '運用', 'ドキュメント', '社内ツール']}
        />
      </Specimen>
    </Gallery>
  ),
};

export const MaxRows: Story = {
  tags: ['visual'],
  name: '行数の上限',
  args: {
    label: '記事のタグ',
    defaultValue: [
      'デザイン',
      '実装',
      '検証',
      '運用',
      'ドキュメント',
      '社内ツール',
      'アクセシビリティ',
    ],
  },
  parameters: {
    controls: { include: ['maxRows', 'chipSize'] },
    docs: {
      description: {
        story:
          '`maxRows` を渡すと、その行数で欄の高さが止まり、あふれた分は縦にスクロールします。続きがあることは端の内側の影で見せ、つまみは欄に載せたときとスクロールしているあいだに出ます。`maxRows={1}` だけは折り返さず、1 行のまま横にスクロールします。書かないときは、行が増えるたびに欄が高くなります。',
      },
    },
  },
  render: (args) => (
    <Gallery>
      <Specimen label="書かない（既定）">
        <TagsInput {...args} />
      </Specimen>
      <Specimen label="maxRows={2}">
        <TagsInput {...args} maxRows={2} />
      </Specimen>
      <Specimen label="maxRows={3}">
        <TagsInput {...args} maxRows={3} />
      </Specimen>
      <Specimen label="maxRows={1}（横にスクロール）">
        <TagsInput {...args} maxRows={1} />
      </Specimen>
    </Gallery>
  ),
};

export const RejectNotice: Story = {
  name: '弾いたことを文で知らせる',
  args: {
    label: '記事のタグ',
    defaultValue: ['デザイン', '実装'],
    infoText: '前回と同じタグを付けています',
    rejectMessage: (_reason, tag) => `「${tag}」は追加済みです`,
  },
  parameters: {
    controls: { include: ['infoText'] },
    docs: {
      description: {
        story: [
          '`rejectMessage` を渡すと、タグにならなかったときに短い文を本体の下の行（丸の「i」と青い文字）へ一瞬だけ出し、強調と同じ長さで消えます。文は呼び出し側が書きます。',
          '',
          '`infoText` も渡しているときは、そのあいだだけ同じ行の文が入れ替わり、消えると元の `infoText` に戻ります。行の高さは変わりません。読み上げは行ではなく見えない `role="status"` の箱が担うので、戻ったときに元の `infoText` が読み直されることはありません。',
        ].join('\n'),
      },
    },
  },
  decorators: [narrow],
  play: async ({ canvas, canvasElement }) => {
    const input = canvas.getByRole('combobox');
    const status = canvasElement.querySelector<HTMLElement>(
      '[data-slot="tags-input-reject-status"]'
    );
    const row = canvasElement.querySelector<HTMLElement>(
      '[data-slot="field-message"][data-kind="info"]'
    );
    if (!status || !row) throw new Error('読み上げの箱か info の行がありません');
    // 見える文（aria-hidden の span）と、読み上げに渡る文（sr-only の span）を別々に読む
    const shown = () => row.querySelector('[aria-hidden="true"]:not(svg)')?.textContent ?? '';
    const spoken = () =>
      [...row.querySelectorAll('*')]
        .filter((el) => el.children.length === 0 && !el.closest('[aria-hidden="true"]'))
        .map((el) => el.textContent)
        .join('');
    await expect(status.textContent).toBe('');
    await expect(row).toHaveTextContent('前回と同じタグを付けています');
    // すでにあるタグをもう一度足すと、見える文だけが入れ替わる
    await userEvent.type(input, 'デザイン{Enter}');
    await waitFor(async () => {
      await expect(shown()).toBe('「デザイン」は追加済みです');
    });
    // 読み上げに渡る文（行）は元の info のまま。弾いた文は、見えない status の箱だけが知らせる
    await expect(spoken()).toBe('前回と同じタグを付けています');
    await expect(status).toHaveTextContent('「デザイン」は追加済みです');
    // 消えると元の info に戻り、箱は空になる（戻った info は読み直さない）
    await waitFor(
      async () => {
        await expect(status.textContent).toBe('');
      },
      { timeout: 3000 }
    );
    await expect(row).toHaveTextContent('前回と同じタグを付けています');
    await expect(shown()).toBe('');
  },
};

export const Messages: Story = {
  tags: ['visual'],
  name: 'キャプション・エラー・警告',
  args: { label: '記事のタグ', defaultValue: ['デザイン'] },
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Gallery>
      <Specimen label="caption（上）">
        <TagsInput {...args} caption="3 つまで付けられます" />
      </Specimen>
      <Specimen label="caption（下）">
        <TagsInput {...args} caption="3 つまで付けられます" captionPlacement="bottom" />
      </Specimen>
      <Specimen label="errorText">
        <TagsInput
          {...args}
          caption="3 つまで付けられます"
          errorText="タグを 1 つ以上付けてください"
        />
      </Specimen>
      <Specimen label="warningText">
        <TagsInput {...args} warningText="似たタグがすでにあります" />
      </Specimen>
      <Specimen label="successText">
        <TagsInput {...args} successText="このタグで公開できます" />
      </Specimen>
      <Specimen label="infoText">
        <TagsInput {...args} infoText="前回と同じタグを付けています" />
      </Specimen>
    </Gallery>
  ),
};

export const Colors: Story = {
  tags: ['visual'],
  name: '色',
  args: { label: '記事のタグ', defaultValue: ['デザイン', '実装'] },
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Gallery>
      <Specimen label="neutral（既定）">
        <TagsInput {...args} color="neutral" />
      </Specimen>
      <Specimen label="primary">
        <TagsInput {...args} color="primary" />
      </Specimen>
      <Specimen label="secondary">
        <TagsInput {...args} color="secondary" />
      </Specimen>
    </Gallery>
  ),
};

export const Disabled: Story = {
  tags: ['visual'],
  name: '押せない・読み取り専用',
  args: { label: '記事のタグ' },
  parameters: {
    controls: { exclude: ['disabled', 'readOnly'] },
    docs: {
      description: {
        story:
          '`disabled` のチップは薄くなり、× も押せなくなります。`readOnly` は文字を打つ欄の読み取り専用と同じ見た目で、チップの × と端の × を出しません。どちらもフォームでは値が送られます。',
      },
    },
  },
  render: (args) => (
    <Gallery>
      <Specimen label="disabled（値あり）">
        <TagsInput {...args} disabled defaultValue={['デザイン', '実装']} />
      </Specimen>
      <Specimen label="disabled（プレースホルダ）">
        <TagsInput {...args} disabled placeholder="打って Enter で足す" />
      </Specimen>
      <Specimen label="readOnly">
        <TagsInput {...args} readOnly defaultValue={['設計', '検証']} />
      </Specimen>
    </Gallery>
  ),
  play: async ({ canvas }) => {
    const inputs = canvas.getAllByRole('combobox');
    const readOnly = inputs[inputs.length - 1];
    // 読み上げは「読み取り専用」。押せない（aria-disabled）とは伝えない
    await expect(readOnly).toHaveAttribute('aria-readonly', 'true');
    await expect(readOnly).not.toHaveAttribute('aria-disabled');
    // 読み取り専用では、× を出さず、打ってもタグにならない
    await expect(canvas.queryByRole('button', { name: '設計 を外す' })).toBeNull();
    await userEvent.type(readOnly, '運用{Enter}');
    await expect(canvas.queryByText('運用')).toBeNull();
    readOnly.blur();
  },
};

export const Loading: Story = {
  tags: ['visual'],
  name: '候補を読み込んでいるあいだ',
  args: { label: '記事のタグ', items: skills, loading: true, defaultValue: ['デザイン'] },
  parameters: {
    controls: { exclude: ['loading', 'loadingBehavior', 'loadingIndicator'] },
    docs: {
      description: {
        story:
          '候補を読み込んでいるあいだは `loading` を付けます。`non-blocking`（既定）では打てるままで、`blocking` では押せない欄と同じ見た目にし、プレースホルダの場所に `loadingText` を出します。',
      },
    },
  },
  render: (args) => (
    <Gallery>
      <Specimen label="non-blocking">
        <TagsInput {...args} />
      </Specimen>
      <Specimen label="blocking">
        <TagsInput {...args} loadingBehavior="blocking" placeholder="打って Enter で足す" />
      </Specimen>
      <Specimen label="bar">
        <TagsInput {...args} loadingIndicator="bar" />
      </Specimen>
    </Gallery>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  args: { label: '記事のタグ', defaultValue: ['デザイン', '実装'] },
  parameters: { controls: { disable: true } },
  render: (args) => (
    <DensityPair>
      <div className="w-64">
        <TagsInput {...args} />
      </div>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  args: { label: '記事のタグ', defaultValue: ['デザイン'] },
  parameters: { controls: { disable: true } },
  decorators: [narrow],
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox');
    // 読み上げの名前はラベル
    await expect(canvas.getByLabelText('記事のタグ')).toBe(input);
    // チップのまとまりと、チップの × には、何を外すのかが分かる名前が付く
    await expect(canvas.getByRole('button', { name: 'デザイン を外す' })).toBeVisible();
    await expect(canvas.getByLabelText('追加したタグ')).toBeVisible();
  },
};
