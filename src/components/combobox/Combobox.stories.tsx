import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
// 引数の userEvent は、LAN の IP で開いたとき（clipboard のない環境）は空になり、click などが呼べない
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Combobox, type ComboboxGroup, type ComboboxItem, type ComboboxProps } from './Combobox';
import { DensityPair, Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { labelClass, sourceCode } from '../../stories/story-states';

const wards: ComboboxItem[] = [
  '千代田区',
  '中央区',
  '港区',
  '新宿区',
  '文京区',
  '台東区',
  '墨田区',
  '江東区',
  '品川区',
  '目黒区',
  '大田区',
  '世田谷区',
  '渋谷区',
  '中野区',
  '杉並区',
  '豊島区',
  '北区',
  '荒川区',
  '板橋区',
  '練馬区',
  '足立区',
  '葛飾区',
  '江戸川区',
].map((label, i) => ({ label, value: `ward-${i + 1}` }));

const areas: ComboboxItem[] = [
  { label: '千代田区', value: 'chiyoda' },
  { label: '中央区', value: 'chuo' },
  { label: '荒川区', value: 'arakawa', note: { kind: 'warning', text: 'お届けが翌日になります' } },
  {
    label: '八王子市',
    value: 'hachioji',
    disabled: true,
    note: { kind: 'reason', text: 'お届けできません' },
  },
  { label: '港区', value: 'minato' },
];

const skills: ComboboxItem[] = [
  { label: 'デザイン', value: 'design' },
  { label: 'フロントエンド', value: 'frontend' },
  { label: 'バックエンド', value: 'backend' },
  { label: 'インフラ', value: 'infra' },
  { label: 'アクセシビリティの設計と検証', value: 'a11y' },
  { label: 'ライティング', value: 'writing' },
];

const prefectures: ComboboxGroup[] = [
  {
    label: '関東',
    items: [
      { label: '東京都', value: 'tokyo' },
      { label: '神奈川県', value: 'kanagawa' },
      { label: '埼玉県', value: 'saitama' },
      { label: '千葉県', value: 'chiba' },
    ],
  },
  {
    label: '近畿',
    items: [
      { label: '大阪府', value: 'osaka' },
      { label: '京都府', value: 'kyoto' },
      { label: '兵庫県', value: 'hyogo' },
    ],
  },
  {
    label: '九州',
    items: [
      { label: '福岡県', value: 'fukuoka' },
      { label: '熊本県', value: 'kumamoto' },
      {
        label: '沖縄県',
        value: 'okinawa',
        disabled: true,
        note: { kind: 'reason', text: 'お届けできません' },
      },
    ],
  },
];

// Show code に出す選択肢の並び（先頭の数件だけ）
const wardsSource = `const wards: ComboboxItem[] = [
  { label: '千代田区', value: 'ward-1' },
  { label: '中央区', value: 'ward-2' },
  { label: '港区', value: 'ward-3' },
  // …
];`;

const behaviors = ['non-blocking', 'blocking'] as const;
const indicators = ['spinner', 'bar'] as const;

// 開いた選択肢を、ページの body ではなくこの枠の中に描く。ドキュメントのページでも、ストーリーごとに収まる
function PopoverFrame({
  height = 'h-[26rem]',
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
  title: 'Components/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '打った文字で選択肢を絞り込み、その中から選ぶ欄です。ラベル・キャプション・エラー・警告の形は TextField や Select と同じです。選択肢が多くて、探しながら選びたいときに使います。数が少ないときは Select を使ってください。',
          '',
          '- 選択肢は `items` で渡します。`label`・`value` の並びをそのまま渡すと 1 つの一覧に、`label` と `items` を持つまとまりの並びを渡すと、見出し付きのまとまりに分かれます。選べない選択肢には `disabled` を、ラベルの下の 2 行目には `note` を付けます。',
          '- `multiple` を付けると複数選べます。選んだ項目は欄の中にチップで並び、欄の高さが伸びます。チップの × か、欄の先頭で ← を押してから Backspace で外せます。',
          '- 値は `defaultValue` か、`value`・`onValueChange` で持ちます。`multiple` では文字の配列になります。`name` を渡すと、フォームに値が送られます。',
          '- 当たる選択肢がないときの文は `emptyText` で渡します。部品は文を組み立てません。',
          '- 選択肢を読み込んでいるあいだは `loading` を付けます。読み込んでいるあいだに開くと、読み上げで `loadingText` を知らせ、開いたまま読み込みが終わると選択肢の数（`loadedText`）を知らせます。',
          '- 絞り込みを外でするときは、`onInputValueChange` で打った文字を受け取り、`filteredItems` に結果を渡します。`filter` に `null` を渡すと、部品の中では絞り込みません。',
          '- `readOnly` にすると、文字を打つ欄の読み取り専用と同じ見た目になります。フォーカスでき、値をなぞって写せますが、選択肢は開かず値も変わりません。フォームでは値が送られます。',
          '',
          '「開いた状態」などのストーリーは、ストーリーの画面では開いて表示します。このページでは閉じているので、欄を押して開いてください。',
        ].join('\n'),
      },
    },
  },
  // Controls で既定の値を選んだ状態から始める（部品の既定と同じ値）
  args: {
    label: '住所',
    items: wards,
    placeholder: '区名を打って探す',
    emptyText: '当てはまる区がありません',
    captionPlacement: 'top',
    color: 'neutral',
    multiple: false,
    disabled: false,
    readOnly: false,
    clearable: true,
    openOnInputClick: true,
    autoHighlight: false,
    groupLabelStyle: 'label',
    groupSeparator: false,
    disabledIcon: 'show',
    popoverMoreCue: 'shadow',
    popoverMaxHeight: 'screen',
    loading: false,
    loadingBehavior: 'non-blocking',
    loadingIndicator: 'spinner',
    loadingText: '読み込んでいます',
    modal: false,
    onValueChange: fn(),
    onOpenChange: fn(),
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
    error: { control: 'text' },
    warning: { control: 'text' },
    success: { control: 'text' },
    successMark: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    info: { control: 'text' },
    color: { control: 'inline-radio', options: ['primary', 'secondary', 'neutral'] },
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    clearable: { control: 'boolean' },
    clearLabel: { control: 'text' },
    chipsLabel: { control: 'text' },
    chipRemoveLabel: { control: false },
    openOnInputClick: { control: 'boolean' },
    autoHighlight: { control: 'boolean' },
    groupLabelStyle: { control: 'inline-radio', options: ['label', 'caption'] },
    groupSeparator: { control: 'boolean' },
    disabledIcon: { control: 'inline-radio', options: ['show', 'hide'] },
    popoverMoreCue: { control: 'inline-radio', options: ['shadow', 'none'] },
    popoverMaxHeight: { control: 'inline-radio', options: ['screen', 'none'] },
    loading: { control: 'boolean' },
    loadingBehavior: { control: 'inline-radio', options: behaviors },
    loadingIndicator: { control: 'inline-radio', options: indicators },
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
    container: { control: false },
    collisionAvoidance: { control: false },
  },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow = (Story: () => ReactNode) => (
  <div className="max-w-sm">
    <Story />
  </div>
);

export const Playground: Story = {
  name: '基本',
  args: { caption: 'お届けは23区内だけです' },
  decorators: [narrow],
};

export const Single: Story = {
  name: '打って絞り込んで選ぶ',
  args: { label: 'お届け先の区', name: 'ward' },
  parameters: {
    docs: {
      description: {
        story:
          '欄を押すと選択肢が開き、文字を打つと絞り込まれます。矢印キーで動いて Enter で選ぶか、押して選びます。選ぶと欄に選択肢の名前が入り、`name` を渡しているときはフォームにその値が送られます。',
      },
    },
  },
  decorators: [narrow],
  render: (args) => (
    <form>
      <Combobox {...args} />
    </form>
  ),
  play: async ({ args, canvas, canvasElement }) => {
    const input = canvas.getByRole('combobox');
    const page = within(canvasElement.ownerDocument.body);
    // 読み上げの名前はラベル
    await expect(canvas.getByLabelText('お届け先の区')).toBe(input);
    // スマホの実行キーを「次へ」にしない（Enter は候補の選択に使う）
    await expect(input).toHaveAttribute('enterkeyhint', 'enter');
    // 打つと絞り込まれる
    await userEvent.click(input);
    await userEvent.type(input, '世田');
    await waitFor(async () => {
      await expect(page.getAllByRole('option')).toHaveLength(1);
    });
    // 矢印キーと Enter で選ぶ
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.onValueChange).toHaveBeenCalledWith('ward-12');
    await expect(input).toHaveValue('世田谷区');
    // フォームに送られるのは value（ラベルではない）
    const hidden = canvasElement.querySelector<HTMLInputElement>('input[name="ward"]');
    await expect(hidden).not.toBeNull();
    await expect(hidden?.value).toBe('ward-12');
    // 押しても選べる
    await userEvent.click(input);
    await userEvent.click(await page.findByRole('option', { name: '港区' }));
    await expect(input).toHaveValue('港区');
    // Esc は閉じるだけ。選んだ値は消さない（消すのは ✕）。✕ は Tab で止まる
    await userEvent.click(input);
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toHaveValue('港区');
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: '入力内容を消去' })).toHaveFocus();
  },
};

export const Multiple: Story = {
  name: '複数選ぶ',
  args: {
    label: '得意なこと',
    items: skills,
    placeholder: '打って探す',
    emptyText: '当てはまるものがありません',
    multiple: true,
    defaultValue: ['design'],
    name: 'skill',
  },
  parameters: {
    controls: { include: ['color', 'multiple', 'clearable'] },
    docs: {
      description: {
        story:
          '`multiple` では、選んだ項目が欄の中にチップで並びます。チップが増えると欄の高さが伸び、長いラベルは途中で切ります。チップの × で 1 つずつ外せます。欄の先頭で ← を押すとチップへ移り、Backspace でも外せます。',
      },
    },
  },
  decorators: [narrow],
  play: async ({ canvas, canvasElement }) => {
    const input = canvas.getByRole('combobox');
    const page = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByText('デザイン')).toBeVisible();
    await expect(input).toHaveAttribute('enterkeyhint', 'enter');
    // もう1つ選ぶ。選んでも選択肢は開いたまま
    await userEvent.click(input);
    await userEvent.click(await page.findByRole('option', { name: 'インフラ' }));
    await expect(canvas.getByText('インフラ')).toBeVisible();
    // フォームには、同じ名前で選んだ数だけ送られる
    const names = () =>
      [...canvasElement.querySelectorAll<HTMLInputElement>('input[name="skill"]')].map(
        (el) => el.value
      );
    await expect(names()).toEqual(['design', 'infra']);
    // × で外す
    await userEvent.click(canvas.getByRole('button', { name: 'インフラ を外す' }));
    await expect(canvas.queryByText('インフラ')).toBeNull();
    await expect(names()).toEqual(['design']);
  },
};

export const Grouped: Story = {
  name: 'まとまり',
  args: {
    label: '都道府県',
    items: prefectures,
    placeholder: '都道府県を打って探す',
    emptyText: '当てはまる都道府県がありません',
  },
  parameters: {
    controls: { include: ['groupLabelStyle', 'groupSeparator'] },
    docs: {
      description: {
        story:
          '`items` に `label` と `items` を持つまとまりの並びを渡すと、見出し付きのまとまりに分かれます。絞り込んだときは、当たる選択肢を持つまとまりだけが残ります。見出しの文字は `groupLabelStyle`、まとまりのあいだの区切り線は `groupSeparator` で選びます。',
      },
      source: sourceCode(`
        const prefectures: ComboboxGroup[] = [
          { label: '関東', items: [{ label: '東京都', value: 'tokyo' }, { label: '神奈川県', value: 'kanagawa' }] },
          { label: '近畿', items: [{ label: '大阪府', value: 'osaka' }, { label: '京都府', value: 'kyoto' }] },
        ];

        <Combobox label="都道府県" items={prefectures} placeholder="都道府県を打って探す" emptyText="当てはまる都道府県がありません" />
      `),
    },
  },
  render: (args, { viewMode }) => (
    <PopoverFrame>
      {(container) => (
        <Combobox
          key={`${args.groupLabelStyle}-${String(args.groupSeparator)}`}
          {...args}
          defaultOpen={openOnLoad(viewMode)}
          container={container}
          collisionAvoidance={{ side: 'none', align: 'none' }}
        />
      )}
    </PopoverFrame>
  ),
  play: async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    // まとまりの見出しが、そのまとまりの読み上げの名前になる
    await expect(await page.findByRole('group', { name: '関東' })).toBeVisible();
    // 絞り込むと、当たる選択肢を持つまとまりだけが残る
    await userEvent.type(canvas.getByRole('combobox'), '大阪');
    await waitFor(async () => {
      await expect(page.getAllByRole('option')).toHaveLength(1);
    });
    await expect(page.queryByText('関東')).toBeNull();
    await expect(page.getByText('近畿')).toBeVisible();
  },
};

// Show code: 枠（PopoverFrame）の中身は出ないので、使い方を source.code に手で書く
export const Open: Story = {
  tags: ['visual'],
  name: '開いた状態',
  args: { defaultValue: 'ward-3' },
  parameters: {
    controls: { include: ['popoverMaxHeight', 'popoverMoreCue', 'color'] },
    docs: {
      description: {
        story:
          '欄の下に浮かべた選択肢です。選んだ項目は淡い面と太字とチェックで示します（色は `color`）。`popoverMaxHeight="screen"`（既定）では画面の高さの半分までに収め、最後の項目を半分だけ見せて、続きがあることを示します。',
      },
      source: sourceCode(
        wardsSource,
        `
        <Combobox
          label="住所"
          placeholder="区名を打って探す"
          emptyText="当てはまる区がありません"
          items={wards}
          defaultValue="ward-3"
        />
        `
      ),
    },
  },
  render: (args, { viewMode }) => (
    <PopoverFrame>
      {(container) => (
        <Combobox
          // 高さの上限と影の指定を変えたときは、測り直すために描き直す
          key={`${args.popoverMaxHeight}-${args.popoverMoreCue}-${args.color}`}
          {...args}
          defaultOpen={openOnLoad(viewMode)}
          container={container}
          collisionAvoidance={{ side: 'none', align: 'none' }}
        />
      )}
    </PopoverFrame>
  ),
};

// Show code: 枠（PopoverFrame）の中身は出ないので、使い方を source.code に手で書く
export const ItemNotes: Story = {
  name: '選べない選択肢と2行目',
  args: { label: '市区町村', items: areas, defaultValue: 'chiyoda' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`disabled` の選択肢は押せない文字の色になり、押しても選ばれません。`note` の `reason` は灰色の文字だけ、`warning` は警告の行と同じ三角と文字です。2行目のある選択肢だけ高くなります。',
      },
      source: sourceCode(`
        const areas: ComboboxItem[] = [
          { label: '千代田区', value: 'chiyoda' },
          { label: '荒川区', value: 'arakawa', note: { kind: 'warning', text: 'お届けが翌日になります' } },
          { label: '八王子市', value: 'hachioji', disabled: true, note: { kind: 'reason', text: 'お届けできません' } },
        ];

        <Combobox label="市区町村" items={areas} placeholder="打って探す" emptyText="当てはまる市区町村がありません" />
      `),
    },
  },
  render: (args, { viewMode }) => (
    <PopoverFrame height="h-[22rem]">
      {(container) => (
        <Combobox
          {...args}
          defaultOpen={openOnLoad(viewMode)}
          container={container}
          collisionAvoidance={{ side: 'none', align: 'none' }}
        />
      )}
    </PopoverFrame>
  ),
};

// Show code: 枠（PopoverFrame）の中身は出ないので、使い方を source.code に手で書く
export const Empty: Story = {
  name: '当たる選択肢がないとき',
  args: { label: 'お届け先の区', defaultInputValue: 'さっぽろ' },
  parameters: {
    controls: { include: ['emptyText'] },
    docs: {
      description: {
        story:
          '打った文字に当たる選択肢がないときは、`emptyText` の行だけを出します。文は呼び出し側が渡します。読み上げにも、いまの読み上げが終わってから知らせます。',
      },
      source: sourceCode(
        wardsSource,
        `
        <Combobox
          label="お届け先の区"
          items={wards}
          placeholder="区名を打って探す"
          emptyText="当てはまる区がありません"
        />
        `
      ),
    },
  },
  render: (args, { viewMode }) => (
    <PopoverFrame height="h-[14rem]">
      {(container) => (
        <Combobox
          {...args}
          defaultOpen={openOnLoad(viewMode)}
          container={container}
          collisionAvoidance={{ side: 'none', align: 'none' }}
        />
      )}
    </PopoverFrame>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await expect(await page.findByText('当てはまる区がありません')).toBeVisible();
    await expect(page.queryAllByRole('option')).toHaveLength(0);
  },
};

export const Messages: Story = {
  tags: ['visual'],
  name: 'キャプション・エラー・警告',
  args: { label: '市区町村', items: areas },
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Gallery>
      <Specimen label="caption（上）">
        <Combobox {...args} caption="お届けは23区内だけです" />
      </Specimen>
      <Specimen label="caption（下）">
        <Combobox {...args} caption="お届けは23区内だけです" captionPlacement="bottom" />
      </Specimen>
      <Specimen label="error">
        <Combobox {...args} caption="お届けは23区内だけです" error="市区町村を選んでください" />
      </Specimen>
      <Specimen label="warning">
        <Combobox
          {...args}
          caption="お届けは23区内だけです"
          defaultValue="arakawa"
          warning="荒川区は、お届けが翌日になります"
        />
      </Specimen>
      <Specimen label="success">
        <Combobox {...args} defaultValue="chiyoda" success="この住所にお届けできます" />
      </Specimen>
      <Specimen label="info">
        <Combobox {...args} defaultValue="chiyoda" info="前回と同じ住所を選んでいます" />
      </Specimen>
    </Gallery>
  ),
};

export const Disabled: Story = {
  tags: ['visual'],
  name: '押せない',
  parameters: {
    controls: { exclude: ['disabled', 'disabledIcon'] },
    docs: {
      description: {
        story:
          '選んだ値は押せない文字の色になり、プレースホルダの文はふだんの色のままです。消すボタンも押せなくなります。▼ は `disabledIcon="hide"` で隠せます。',
      },
    },
  },
  render: (args) => (
    <Gallery>
      <Specimen label="値あり">
        <Combobox {...args} disabled defaultValue="ward-3" />
      </Specimen>
      <Specimen label="プレースホルダ">
        <Combobox {...args} disabled />
      </Specimen>
      <Specimen label="複数選ぶ">
        <Combobox
          {...args}
          items={skills}
          multiple
          disabled
          defaultValue={['design', 'frontend']}
        />
      </Specimen>
    </Gallery>
  ),
};

export const ReadOnly: Story = {
  tags: ['visual'],
  name: '読み取り専用',
  parameters: {
    controls: { exclude: ['readOnly', 'disabled'] },
    docs: {
      description: {
        story:
          '`readOnly` の欄は、文字を打つ欄の読み取り専用と同じ見た目です。塗りを持たず、細い破線の輪郭と一段淡い値の文字になり、フォーカスすると破線が枠線に変わります。値はなぞって写せます。消すボタンとチップの × は出しません。打っても選択肢は開かず値も変わりませんが、フォームでは値が送られます。',
      },
    },
  },
  render: (args) => (
    <Gallery>
      <Specimen label="値あり">
        <Combobox {...args} readOnly defaultValue="ward-3" />
      </Specimen>
      <Specimen label="複数選ぶ">
        <Combobox
          {...args}
          items={skills}
          multiple
          readOnly
          defaultValue={['design', 'frontend']}
        />
      </Specimen>
    </Gallery>
  ),
  play: async ({ canvas }) => {
    const [input] = canvas.getAllByRole('combobox');
    // 読み上げは「読み取り専用」。押せない（aria-disabled）とは伝えない
    await expect(input).toHaveAttribute('aria-readonly', 'true');
    await expect(input).not.toHaveAttribute('aria-disabled');
    // 押しても選択肢は開かない
    await userEvent.click(input);
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    // 消すボタンは出さない
    await expect(canvas.queryByRole('button', { name: '入力内容を消去' })).toBeNull();
    input.blur();
  },
};

// Show code: 表（Matrix）と枠（PopoverFrame）の中身は出ないので、使い方を source.code に手で書く
export const Loading: Story = {
  tags: ['visual'],
  name: '読み込んでいるあいだ',
  args: { loading: true },
  parameters: {
    controls: { exclude: ['loading', 'loadingBehavior', 'loadingIndicator'] },
    docs: {
      description: {
        story: [
          '行が欄の扱い（`loadingBehavior`）、列が印（`loadingIndicator`）です。',
          '',
          '- `non-blocking`（既定）: 止めません。打てるままで、開くと選択肢の最後に `loadingText` の行を出します。回る円は ▼ の左に出ます。',
          '- `blocking`: 押せない欄と同じ見た目にし、開けなくします。プレースホルダの場所に `loadingText` を出し、▼ の場所に回る円を出します。',
        ].join('\n'),
      },
      source: sourceCode(
        wardsSource,
        `
        <Combobox label="住所" items={wards} loading />
        <Combobox label="住所" items={wards} loading loadingBehavior="blocking" />
        <Combobox label="住所" items={wards} loading loadingIndicator="bar" />
        `
      ),
    },
  },
  render: (args, { viewMode }) => (
    <div className="flex flex-col gap-10">
      <Matrix
        rows={behaviors}
        rowLabel={(behavior) => behavior}
        columns={indicators.map((indicator) => ({ label: indicator, indicator }))}
        columnWidth="16rem"
        renderCell={(behavior, { indicator }) => (
          <Combobox {...args} loadingBehavior={behavior} loadingIndicator={indicator} />
        )}
      />
      <div className="flex flex-col gap-3">
        <p className={labelClass}>non-blocking で開いたとき</p>
        <PopoverFrame height="h-[22rem]">
          {(container) => (
            <Combobox
              {...args}
              items={wards.slice(0, 4)}
              defaultOpen={openOnLoad(viewMode)}
              container={container}
              collisionAvoidance={{ side: 'none', align: 'none' }}
            />
          )}
        </PopoverFrame>
      </div>
    </div>
  ),
};

// はじめて開いたときに選択肢を読み込み、1.5 秒で終わる
function LoadOnOpenCombobox({ onOpenChange, ...props }: Omit<ComboboxProps, 'items' | 'loading'>) {
  const [items, setItems] = useState<ComboboxItem[]>([]);
  const [loading, setLoading] = useState(false);
  return (
    <Combobox
      {...props}
      items={items}
      loading={loading}
      onOpenChange={(next) => {
        onOpenChange?.(next);
        if (!next || loading || items.length) return;
        setLoading(true);
        setTimeout(() => {
          setItems(areas);
          setLoading(false);
        }, 1500);
      }}
    />
  );
}

// Show code: 状態を持ち、ハンドラーが要の例なので、写して使える部品の形を source.code に手で書く
export const LoadOnOpen: Story = {
  name: '開いてから読み込みが終わる',
  args: {
    label: '市区町村',
    placeholder: '打って探す',
    emptyText: '当てはまる市区町村がありません',
  },
  parameters: {
    controls: { include: ['loadingText', 'loadingIndicator'] },
    docs: {
      description: {
        story: [
          'はじめて開いたときに選択肢を読み込み、1.5 秒で終わる例です。',
          '',
          '- 読み込んでいるあいだに開くと、読み上げで `loadingText`（「読み込んでいます」）を知らせます。開いたまま読み込みが終わると、選択肢の数（`loadedText`。既定は「5 件の選択肢」の形）を知らせます。閉じると知らせる文は空に戻ります。',
          '- 知らせるのは、欄のそばにいつも置いた見えない `role="status"` の箱です。開くと同時に現れる箱は、読み上げソフトによっては読まれないためです。見える読み込み中の行は、二重に読まないよう role の箱にしません。',
          '',
          'もう一度試すときは、ストーリーを描き直してください。',
        ].join('\n'),
      },
      source: sourceCode(`
        // はじめて開いたときに選択肢を読み込む
        function AreaCombobox() {
          const [items, setItems] = useState<ComboboxItem[]>([]);
          const [loading, setLoading] = useState(false);
          return (
            <Combobox
              label="市区町村"
              placeholder="打って探す"
              emptyText="当てはまる市区町村がありません"
              items={items}
              loading={loading}
              onOpenChange={(open) => {
                if (!open || loading || items.length) return;
                setLoading(true);
                // 読み込みの代わり。1.5 秒で終わる
                setTimeout(() => {
                  setItems(areas);
                  setLoading(false);
                }, 1500);
              }}
            />
          );
        }
      `),
    },
  },
  render: (args) => (
    <PopoverFrame height="h-[22rem]">
      {(container) => (
        <LoadOnOpenCombobox
          {...args}
          container={container}
          collisionAvoidance={{ side: 'none', align: 'none' }}
        />
      )}
    </PopoverFrame>
  ),
  play: async ({ canvas, canvasElement }) => {
    const status = canvasElement.querySelector<HTMLElement>('[data-slot="combobox-status"]');
    if (!status) throw new Error('status の箱がありません');
    await expect(status).toHaveAttribute('role', 'status');
    await expect(status.textContent).toBe('');
    await userEvent.click(canvas.getByRole('combobox'));
    await waitFor(() => expect(status).toHaveTextContent('読み込んでいます'));
    // 見える読み込み中の行は role の箱にしない
    const row = canvasElement.querySelector('[data-slot="combobox-loading"]');
    await expect(row).not.toBeNull();
    await expect(row).not.toHaveAttribute('role');
    await waitFor(() => expect(status).toHaveTextContent('5 件の選択肢'), { timeout: 3000 });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(status.textContent).toBe(''));
  },
};

// 打った文字を外に渡し、返ってきた結果を filteredItems で出す（絞り込みを外でする）
function AsyncCombobox(props: Omit<ComboboxProps, 'items' | 'loading' | 'filteredItems'>) {
  const [results, setResults] = useState<ComboboxItem[]>([]);
  const [loading, setLoading] = useState(false);
  return (
    <Combobox
      {...props}
      items={wards}
      filter={null}
      filteredItems={results}
      loading={loading}
      onInputValueChange={(text) => {
        const query = text.trim();
        if (query === '') {
          setResults([]);
          setLoading(false);
          return;
        }
        setLoading(true);
        // 問い合わせの代わり。0.6 秒で返る
        setTimeout(() => {
          setResults(wards.filter((ward) => ward.label.includes(query)));
          setLoading(false);
        }, 600);
      }}
    />
  );
}

// Show code: 状態を持ち、ハンドラーが要の例なので、写して使える部品の形を source.code に手で書く
export const AsyncFilter: Story = {
  name: '外で絞り込む',
  args: {
    label: 'お届け先の区',
    placeholder: '区名を打って探す',
    emptyText: '当てはまる区がありません',
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '絞り込みを外（サーバーなど）でするときは、`filter` に `null` を渡して部品の中の絞り込みを止め、`onInputValueChange` で受け取った文字で問い合わせ、返ってきた結果を `filteredItems` に渡します。`items` には選んだ項目を残しておきます。問い合わせているあいだは `loading` を付けます。',
      },
      source: sourceCode(`
        function WardCombobox() {
          const [results, setResults] = useState<ComboboxItem[]>([]);
          const [loading, setLoading] = useState(false);
          return (
            <Combobox
              label="お届け先の区"
              placeholder="区名を打って探す"
              emptyText="当てはまる区がありません"
              items={wards}
              // 部品の中では絞り込まず、返ってきた結果をそのまま出す
              filter={null}
              filteredItems={results}
              loading={loading}
              onInputValueChange={(text) => {
                const query = text.trim();
                if (query === '') {
                  setResults([]);
                  setLoading(false);
                  return;
                }
                setLoading(true);
                search(query).then((found) => {
                  setResults(found);
                  setLoading(false);
                });
              }}
            />
          );
        }
      `),
    },
  },
  render: (args) => (
    <PopoverFrame height="h-[22rem]">
      {(container) => (
        <AsyncCombobox
          {...args}
          container={container}
          collisionAvoidance={{ side: 'none', align: 'none' }}
        />
      )}
    </PopoverFrame>
  ),
  play: async ({ canvas, canvasElement }) => {
    const input = canvas.getByRole('combobox');
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(input);
    await userEvent.type(input, '田');
    // 返ってくるまでは読み込み中の行を出し、返ったら結果を出す
    await waitFor(
      async () => {
        await expect(page.getAllByRole('option').length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
    await expect(page.getByRole('option', { name: '世田谷区' })).toBeVisible();
  },
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  args: { label: '住所', defaultValue: 'ward-3' },
  parameters: { controls: { disable: true } },
  render: (args) => (
    <DensityPair>
      <div className="w-64">
        <Combobox {...args} />
        <div className="h-4" />
        <Combobox {...args} items={skills} multiple defaultValue={['design', 'a11y']} />
      </div>
    </DensityPair>
  ),
};
