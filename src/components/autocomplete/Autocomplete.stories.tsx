import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
// 引数の userEvent は、LAN の IP で開いたとき（clipboard のない環境）は空になり、click などが呼べない
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Autocomplete, type AutocompleteProps } from './Autocomplete';
import type { ListboxGroup } from '../../internal/listbox/listbox-items';
import type { ListboxItem } from '../../internal/listbox/use-listbox-option';
import { Icon } from '../icon/Icon';
import { DensityPair, Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';

const cities: ListboxItem[] = [
  '札幌市',
  '仙台市',
  'さいたま市',
  '千葉市',
  '東京都',
  '横浜市',
  '川崎市',
  '新潟市',
  '金沢市',
  '静岡市',
  '名古屋市',
  '京都市',
  '大阪市',
  '神戸市',
  '広島市',
  '福岡市',
  '那覇市',
].map((label, i) => ({ label, value: `city-${i + 1}` }));

const areas: ListboxItem[] = [
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

const regions: ListboxGroup[] = [
  {
    label: '関東',
    items: [
      { label: '東京都', value: 'tokyo' },
      { label: '神奈川県', value: 'kanagawa' },
      { label: '埼玉県', value: 'saitama' },
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
    ],
  },
];

// Show code に出す候補の並び（先頭の数件だけ）
const citiesSource = `const cities: ListboxItem[] = [
  { label: '札幌市', value: 'city-1' },
  { label: '仙台市', value: 'city-2' },
  { label: 'さいたま市', value: 'city-3' },
  // …
];`;

const behaviors = ['non-blocking', 'blocking'] as const;
const indicators = ['spinner', 'bar'] as const;

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
  title: 'Components/Autocomplete',
  component: Autocomplete,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '文字を打つと、候補を提案してくれる入力欄です。値は打った文字そのもので、候補にない文字もそのまま打てます。候補は打つ手間を減らす提案です。候補の中から選ぶことを求めるときは Combobox を使ってください。',
          '',
          '- 候補は `items` で渡します。`label`・`value` の並びをそのまま渡すと 1 つの一覧に、`label` と `items` を持つまとまりの並びを渡すと、見出し付きのまとまりに分かれます。選べない候補には `disabled` を、ラベルの下の 2 行目には `note` を付けます。',
          '- 値は `defaultValue` か、`value`・`onValueChange` で持ちます。文字列です。候補を選ぶと、その候補の `label` が欄に入ります。`name` を渡すと、フォームに欄の文字が送られます。',
          '- 候補を選んだときの動きは 3 つです。既定では、欄に入れて候補を閉じます。`closeOnSelect={false}` にすると、欄に入れたまま開いておきます。`onSelect` の `event.preventDefault()` を呼ぶと、欄も候補もそのままにします（候補を押して別の画面へ移すときなど）。',
          '- `openOn` で候補を開く契機を選びます。既定の `input` は文字を打ったあとです。`focus`・`click` は、空でも候補を出します（最近の検索を出すときなど）。どれでも ↓ キーで開きます。',
          '- 絞り込みは `filter` で決めます。既定（`true`）は部分一致で絞り込みます。関数を渡すと、「とう」で「東京」を出すような条件にできます。`false` は絞り込まず、`items` をそのまま出します（検索の API に問い合わせるとき）。',
          '- `completeInput` を付けると、矢印キーで印を移した候補の文字を、欄に仮に入れます（入力を候補に補正します）。既定は付けません。',
          '- 欄の頭の印は `icon` で渡します。既定は何も置かない、飾りのない欄です。文字を消す ✕ は `clearable`（既定は出す）で出さないこともできます。',
          '- 欄が空のときに最近の検索などを出すには、`emptyItems` に見出し付きの候補を渡します。空でもフォーカスで開きます。',
          '- Esc は、候補が開いていれば閉じるだけで、打った文字は消しません。候補が閉じているときは何もしません。',
          '- 当たる候補がないときの文は `emptyText` で渡します（文字でも要素でも渡せます）。書かないときは、当たる候補がなければ何も開きません。',
          '- 候補を読み込んでいるあいだは `loading` を付けます。絞り込みを外でするときは、`onValueChange` で打った文字を受け取って `items` を差し替え、`filter={false}` にします。',
          '- 浮かぶ候補そのものに props を足すときは `popupProps`、位置の決め方（画面の端での逃がし方など）は `positionerProps`、打つ欄には `inputProps` を渡します。外を押して閉じるかは `dismissible`、Esc で閉じるかは `closeOnEscape` です。',
          '',
          '「開いた状態」などのストーリーは、ストーリーの画面では開いて表示します。このページでは閉じているので、欄に打って開いてください。',
        ].join('\n'),
      },
    },
  },
  // Controls で既定の値を選んだ状態から始める（部品の既定と同じ値）
  args: {
    label: '都市',
    items: cities,
    placeholder: '都市名を打って探す',
    captionPlacement: 'top',
    color: 'neutral',
    disabled: false,
    readOnly: false,
    clearable: true,
    openOn: 'input',
    filter: true,
    completeInput: false,
    closeOnSelect: true,
    autoHighlight: false,
    groupLabelStyle: 'label',
    showGroupSeparator: false,
    popoverMaxHeight: 'screen',
    loading: false,
    loadingBehavior: 'non-blocking',
    loadingIndicator: 'spinner',
    loadingText: '読み込んでいます',
    modal: false,
    onValueChange: fn(),
    onSelect: fn(),
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
    errorText: { control: 'text' },
    warningText: { control: 'text' },
    successText: { control: 'text' },
    hideSuccessMark: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    infoText: { control: 'text' },
    color: { control: 'inline-radio', options: ['primary', 'secondary', 'neutral'] },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    clearable: { control: 'boolean' },
    clearName: {
      control: 'text',
      table: { defaultValue: { summary: "'入力内容を消去'" } },
    },
    openOn: { control: 'inline-radio', options: ['input', 'focus', 'click'] },
    enterKeyHint: {
      control: 'inline-radio',
      options: ['enter', 'done', 'go', 'next', 'send'],
      table: { defaultValue: { summary: "'enter'" } },
    },
    filter: { control: 'boolean' },
    completeInput: { control: 'boolean' },
    closeOnSelect: { control: 'boolean' },
    autoHighlight: { control: 'boolean' },
    groupLabelStyle: { control: 'inline-radio', options: ['label', 'caption'] },
    showGroupSeparator: { control: 'boolean' },
    popoverMaxHeight: { control: 'inline-radio', options: ['screen', 'none'] },
    loading: { control: 'boolean' },
    loadingBehavior: { control: 'inline-radio', options: behaviors },
    loadingIndicator: { control: 'inline-radio', options: indicators },
    loadingText: { control: 'text' },
    loadedText: { control: false },
    modal: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    items: { control: false },
    icon: { control: false },
    emptyItems: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    onSelect: { control: false },
    open: { control: false },
    defaultOpen: { control: false },
    portalContainer: { control: false },
    positionerProps: { control: false },
    popupProps: { control: false },
    inputProps: { control: false },
  },
} satisfies Meta<typeof Autocomplete>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow = (Story: () => ReactNode) => (
  <div className="max-w-sm">
    <Story />
  </div>
);

export const Playground: Story = {
  name: '基本',
  args: { caption: '候補にない都市も打てます' },
  decorators: [narrow],
};

export const Suggest: Story = {
  name: '打って候補を選ぶ',
  args: { label: 'お住まいの都市', name: 'city' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '文字を打つと、当たる候補が欄の下に出ます。候補を選ぶと、その文字が欄に入って候補が閉じます。候補にない文字も、そのまま打てます。',
      },
      source: sourceCode(
        citiesSource,
        `
        <Autocomplete label="お住まいの都市" name="city" items={cities} placeholder="都市名を打って探す" />
        `
      ),
    },
  },
  decorators: [narrow],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('combobox');
    // Android のキーボードが実行キーを「次へ」にしないよう、既定は enter
    await expect(input).toHaveAttribute('enterkeyhint', 'enter');
    // 打つまでは開かない
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await userEvent.type(input, '京');
    await waitFor(() => expect(page.getByRole('option', { name: '東京都' })).toBeVisible());
    await expect(page.getByRole('option', { name: '京都市' })).toBeVisible();
    await expect(page.queryByRole('option', { name: '札幌市' })).toBeNull();
    await userEvent.click(page.getByRole('option', { name: '京都市' }));
    await expect(input).toHaveValue('京都市');
    await expect(args.onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'city-12' }),
      expect.anything()
    );
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'));
    // 空にすると閉じる
    await userEvent.type(input, '{Backspace}{Backspace}{Backspace}');
    await userEvent.type(input, '大');
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
    await userEvent.type(input, '{Backspace}');
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'));
    // 候補にない文字も打てる
    await userEvent.clear(input);
    await userEvent.type(input, 'どこかの町');
    await expect(input).toHaveValue('どこかの町');
  },
};

export const Grouped: Story = {
  name: 'まとまりに分ける',
  args: { label: '地方', items: regions, placeholder: '地方を打って探す' },
  parameters: {
    controls: { include: ['groupLabelStyle', 'showGroupSeparator'] },
    docs: {
      description: {
        story:
          '`items` にまとまり（`label` と `items`）の並びを渡すと、見出し付きで並びます。見出しの文字は `groupLabelStyle`、まとまりのあいだの線は `showGroupSeparator` で決めます。',
      },
      source: sourceCode(`
        const regions: ListboxGroup[] = [
          { label: '関東', items: [{ label: '東京都', value: 'tokyo' }, /* … */] },
          { label: '近畿', items: [{ label: '大阪府', value: 'osaka' }, /* … */] },
        ];

        <Autocomplete label="地方" items={regions} placeholder="地方を打って探す" />
      `),
    },
  },
  decorators: [narrow],
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.type(within(canvasElement).getByRole('combobox'), '府');
    await waitFor(() => expect(page.getByRole('option', { name: '大阪府' })).toBeVisible());
    await expect(page.getByText('近畿')).toBeVisible();
    await expect(page.queryByText('関東')).toBeNull();
  },
};

export const Open: Story = {
  tags: ['visual'],
  name: '開いた状態',
  args: { defaultValue: '市' },
  parameters: {
    controls: { include: ['popoverMaxHeight', 'color'] },
    docs: {
      description: {
        story:
          '欄の下に浮かべた候補です。候補が長いときは、ScrollArea と同じく、続きがある端の内側の影を出し、つまみは枠に載せたときとスクロール中に出ます。候補に選んだ印（チェック・面）はありません。hover とキーボードで選んでいる候補は、入力欄と同じグレーの面です。',
      },
      source: sourceCode(
        citiesSource,
        `
        <Autocomplete label="都市" items={cities} placeholder="都市名を打って探す" />
        `
      ),
    },
  },
  render: (args, { viewMode }) => (
    <PopoverFrame>
      {(container) => (
        <Autocomplete
          key={`${args.popoverMaxHeight}-${args.color}`}
          {...args}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={container}
          positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
        />
      )}
    </PopoverFrame>
  ),
};

const searchIcon = <Icon icon={MagnifyingGlassIcon} />;

export const WithIcon: Story = {
  tags: ['visual'],
  name: '欄の頭の印',
  args: { label: '都市', defaultValue: '' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '既定は飾りのない文字入力欄です。`icon` を渡すと、欄の頭に置きます。検索の欄にするときは、虫眼鏡を渡します。印は押せません。文字があるあいだは、端に消去のボタンが出ます（`clearable={false}` で出さない）。',
      },
      source: sourceCode(
        citiesSource,
        `
        <Autocomplete label="都市" items={cities} icon={<Icon icon={MagnifyingGlassIcon} />} />
        <Autocomplete label="都市" items={cities} clearable={false} />
        `
      ),
    },
  },
  render: (args) => (
    <Gallery>
      <Specimen label="印なし（既定）">
        <Autocomplete {...args} />
      </Specimen>
      <Specimen label="印なし（文字あり）">
        <Autocomplete {...args} defaultValue="京都" />
      </Specimen>
      <Specimen label="icon（虫眼鏡）">
        <Autocomplete {...args} icon={searchIcon} placeholder="都市名を打って探す" />
      </Specimen>
      <Specimen label="icon（文字あり）">
        <Autocomplete {...args} icon={searchIcon} defaultValue="京都" />
      </Specimen>
      <Specimen label="clearable={false}">
        <Autocomplete {...args} clearable={false} defaultValue="京都" />
      </Specimen>
    </Gallery>
  ),
};

export const SelectBehavior: Story = {
  name: '選んだときの動き',
  args: { label: '都市', closeOnSelect: false },
  parameters: {
    controls: { include: ['closeOnSelect'] },
    docs: {
      description: {
        story: [
          '候補を選んだときの動きは 3 つです。',
          '',
          '- 既定（`closeOnSelect`）: 欄に入れて閉じます。',
          '- `closeOnSelect={false}`: 欄に入れて、開いたままにします。続けて別の候補に印を移して選び直せます（このストーリー）。',
          '- `onSelect` で `event.preventDefault()`: 欄も候補もそのままにします。次のストーリー「選んでも欄を変えない」です。',
        ].join('\n'),
      },
      source: sourceCode(
        citiesSource,
        `
        <Autocomplete label="都市" items={cities} closeOnSelect={false} />
        `
      ),
    },
  },
  decorators: [narrow],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('combobox');
    await userEvent.type(input, '京');
    await waitFor(() => expect(page.getByRole('option', { name: '京都市' })).toBeVisible());
    await userEvent.click(page.getByRole('option', { name: '京都市' }));
    await expect(input).toHaveValue('京都市');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
  },
};

// 選んだ候補の名前を、欄の外に出す（欄は変えない）
function PreventSelectExample(props: AutocompleteProps) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="flex max-w-sm flex-col gap-3">
      <Autocomplete
        {...props}
        onSelect={(item, event) => {
          event.preventDefault();
          setPicked(item.label);
          props.onSelect?.(item, event);
        }}
      />
      <p className="text-sm text-fg-muted" data-testid="picked">
        選んだ候補: {picked ?? 'まだありません'}
      </p>
    </div>
  );
}

export const PreventSelect: Story = {
  name: '選んでも欄を変えない',
  args: { label: '都市の検索' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`onSelect` で `event.preventDefault()` を呼ぶと、選んだ文字を欄に入れず、候補も閉じません。候補を押して別の画面へ移すときなど、打った文字を残したいときに使います。下の例は、選んだ候補の名前を別の場所に出します。',
      },
      source: sourceCode(
        citiesSource,
        `
        <Autocomplete
          label="都市の検索"
          items={cities}
          onSelect={(item, event) => {
            event.preventDefault();
            router.push(\`/cities/\${item.value}\`);
          }}
        />
        `
      ),
    },
  },
  render: (args) => <PreventSelectExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('combobox');
    await userEvent.type(input, '京');
    await waitFor(() => expect(page.getByRole('option', { name: '京都市' })).toBeVisible());
    await userEvent.click(page.getByRole('option', { name: '京都市' }));
    await expect(canvas.getByTestId('picked')).toHaveTextContent('京都市');
    await expect(input).toHaveValue('京');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
  },
};

export const OpenOnFocus: Story = {
  name: '開く契機',
  args: { label: '最近の検索', openOn: 'focus', placeholder: '欄を押すと候補が出ます' },
  parameters: {
    controls: { include: ['openOn'] },
    docs: {
      description: {
        story:
          '`openOn` の既定は `input` で、文字を打ったあとに開きます。`focus` は欄にフォーカスが入ったとき、`click` は欄を押したときに、空でも候補を出します。最近の検索や、よく選ばれる候補を出すときに使います。',
      },
      source: sourceCode(
        citiesSource,
        `
        <Autocomplete label="最近の検索" items={cities} openOn="focus" />
        `
      ),
    },
  },
  decorators: [narrow],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('combobox');
    await userEvent.click(input);
    await waitFor(() => expect(page.getByRole('option', { name: '札幌市' })).toBeVisible());
    // Esc は閉じるだけ。文字は消さない
    await userEvent.type(input, '京');
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('京');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  },
};

export const Keyboard: Story = {
  name: 'キーボード',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '↓ で開き、↑↓ で候補に印を移し、Enter で選びます。Esc は、開いていれば閉じるだけで、打った文字は消しません。閉じているときの Esc は何もしません。Tab は候補に印があっても欄から次へ移すだけです。',
      },
    },
  },
  decorators: [narrow],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('combobox');
    await userEvent.type(input, '市');
    await waitFor(() => expect(page.getByRole('option', { name: '札幌市' })).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('市');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    // 閉じているときの Esc は何もしない
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('市');
    // ↓ で開いて、印を移し、Enter で選ぶ
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(page.getByRole('option', { name: '札幌市' })).toBeVisible());
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(input).not.toHaveValue('市');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  },
};

export const Sheet: Story = {
  name: 'シートで出す',
  args: { label: '都市', presentation: 'sheet' },
  parameters: {
    controls: { include: ['presentation', 'sheetInput', 'focusInputOnOpen'] },
    docs: {
      description: {
        story:
          '指で操作していて画面が狭いときは、候補を画面の下から出すシートにします（`presentation="auto"`、既定）。`sheetInput="inside"`（既定）では、欄を押すとシートが開き、見出しの下に打つ欄が移ります。`"field"` では欄を残し、候補だけをシートに出します。ここでは `presentation="sheet"` で固定しています。',
      },
      source: sourceCode(
        citiesSource,
        `
        <Autocomplete label="都市" items={cities} presentation="sheet" />
        `
      ),
    },
  },
  decorators: [narrow],
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const control = canvasElement.querySelector<HTMLElement>('[data-slot="control"]');
    await expect(control).not.toBeNull();
    await userEvent.click(control!);
    // シートに移った打つ欄。欄の本体（ボタン）も combobox の役割なので、シートの中を指す
    const body = canvasElement.ownerDocument.body;
    await waitFor(() =>
      expect(body.querySelector('[data-slot="autocomplete-sheet-input"] input')).not.toBeNull()
    );
    const input = body.querySelector<HTMLInputElement>(
      '[data-slot="autocomplete-sheet-input"] input'
    )!;
    await expect(input).toHaveAttribute('enterkeyhint', 'enter');
    await userEvent.type(input, '京');
    await waitFor(() => expect(page.getByRole('option', { name: '京都市' })).toBeVisible());
    await userEvent.click(page.getByRole('option', { name: '京都市' }));
    await waitFor(() => expect(control).toHaveTextContent('京都市'));
  },
};

export const ItemNotes: Story = {
  name: '選べない候補と2行目',
  args: { label: '市区町村', items: areas, defaultValue: '' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`disabled` の候補は押せない文字の色になり、押しても選ばれません。`note` の `description`（ただの説明）と `reason`（選べない理由）は灰色の文字だけ、`warning` は警告の行と同じ三角と文字です。2行目のある候補だけ高くなります。',
      },
      source: sourceCode(`
        const areas: ListboxItem[] = [
          { label: '荒川区', value: 'arakawa', note: { kind: 'warning', text: 'お届けが翌日になります' } },
          { label: '八王子市', value: 'hachioji', disabled: true, note: { kind: 'reason', text: 'お届けできません' } },
        ];

        <Autocomplete label="市区町村" items={areas} openOn="focus" />
      `),
    },
  },
  render: (args, { viewMode }) => (
    <PopoverFrame height="h-[20rem]">
      {(container) => (
        <Autocomplete
          {...args}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={container}
          positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
        />
      )}
    </PopoverFrame>
  ),
};

export const Empty: Story = {
  name: '当たる候補がないとき',
  args: { label: '都市', defaultValue: 'さっぽろ' },
  parameters: {
    controls: { include: ['emptyText'] },
    docs: {
      description: {
        story:
          '`emptyText` を渡すと、当たる候補がないときにその文の行を出します。渡さないときは何も開きません。候補は提案なので、多くの欄では文を渡さず、そのまま打ち続けられるようにします。',
      },
      source: sourceCode(
        citiesSource,
        `
        <Autocomplete label="都市" items={cities} emptyText="当てはまる都市がありません" />
        `
      ),
    },
  },
  render: (args, { viewMode }) => (
    <PopoverFrame height="h-[12rem]">
      {(container) => (
        <Autocomplete
          {...args}
          emptyText={args.emptyText ?? '当てはまる都市がありません'}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={container}
          positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
        />
      )}
    </PopoverFrame>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await expect(await page.findByText('当てはまる都市がありません')).toBeVisible();
    await expect(page.queryAllByRole('option')).toHaveLength(0);
  },
};

export const NoMatch: Story = {
  name: '当たる候補がないとき（文なし）',
  args: { label: '都市' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`emptyText` を渡さないときは、当たる候補がなければ候補の面そのものを出しません。そのまま打ち続けられます。',
      },
    },
  },
  decorators: [narrow],
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const input = within(canvasElement).getByRole('combobox');
    await userEvent.type(input, '京');
    await waitFor(() => expect(page.getByRole('option', { name: '京都市' })).toBeVisible());
    await userEvent.type(input, 'ぜんぜん当たらない');
    await waitFor(() => expect(page.queryAllByRole('option')).toHaveLength(0));
    const popup = canvasElement.ownerDocument.querySelector('[data-slot="autocomplete-popup"]');
    await waitFor(() => expect(popup).not.toBeVisible());
    await expect(input).toHaveValue('京ぜんぜん当たらない');
  },
};

// 読み仮名を持つ候補。filter の関数が、label のほかに読み仮名でも当てる
const readings: Record<string, string> = {
  'city-tokyo': 'とうきょう',
  'city-tokai': 'とうかい',
  'city-tottori': 'とっとり',
  'city-kyoto': 'きょうと',
  'city-osaka': 'おおさか',
  'city-sapporo': 'さっぽろ',
};
const readingCities: ListboxItem[] = [
  { label: '東京都', value: 'city-tokyo' },
  { label: '東海市', value: 'city-tokai' },
  { label: '鳥取市', value: 'city-tottori' },
  { label: '京都市', value: 'city-kyoto' },
  { label: '大阪市', value: 'city-osaka' },
  { label: '札幌市', value: 'city-sapporo' },
];
const matchReading = (item: ListboxItem, query: string) =>
  item.label.includes(query) || (readings[item.value] ?? '').startsWith(query);

export const CustomFilter: Story = {
  name: '絞り込みの条件を決める',
  args: { label: '都市', items: readingCities, placeholder: '読み仮名でも探せます' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`filter` に関数を渡すと、絞り込みの条件を決められます。関数は候補と打った文字を受け取り、出す候補に true を返します。下の例は、読み仮名を持つ候補で、「とう」と打つと「東京都」も「東海市」も出ます。',
      },
      source: sourceCode(`
        const readings = { 'city-tokyo': 'とうきょう', 'city-tokai': 'とうかい' /* … */ };
        const matchReading = (item: ListboxItem, query: string) =>
          item.label.includes(query) || readings[item.value].startsWith(query);

        <Autocomplete label="都市" items={cities} filter={matchReading} />
      `),
    },
  },
  decorators: [narrow],
  render: (args) => <Autocomplete {...args} filter={matchReading} />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.type(within(canvasElement).getByRole('combobox'), 'とう');
    await waitFor(() => expect(page.getByRole('option', { name: '東京都' })).toBeVisible());
    await expect(page.getByRole('option', { name: '東海市' })).toBeVisible();
    await expect(page.queryByRole('option', { name: '大阪市' })).toBeNull();
  },
};

export const CompleteInput: Story = {
  name: '入力を候補に補正する',
  args: { label: '都市', completeInput: true },
  parameters: {
    controls: { include: ['completeInput', 'filter'] },
    docs: {
      description: {
        story:
          '`completeInput` を付けると、矢印キーで印を移した候補の文字が、欄に仮に入ります。Esc で打った文字に戻ります。`filter={false}` と組み合わせると、絞り込まずに一覧を固定して、印を移した候補を欄に映せます。',
      },
    },
  },
  decorators: [narrow],
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const input = within(canvasElement).getByRole('combobox');
    await userEvent.type(input, '京');
    await waitFor(() => expect(page.getByRole('option', { name: '京都市' })).toBeVisible());
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(input).toHaveValue('京都市');
  },
};

const recentItems: ListboxGroup[] = [
  {
    label: '最近の検索',
    items: [cities[11], cities[15], cities[0]],
  },
];

export const EmptyItems: Story = {
  name: '空のときの候補',
  args: { label: '都市', emptyItems: recentItems, placeholder: '欄を押すと最近の検索が出ます' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`emptyItems` に見出し付きの候補を渡すと、欄が空のあいだ、`items` の代わりにこれを出します。空でも開くよう、フォーカスで開きます。文字を打つと `items` の絞り込みに切り替わり、消して空に戻すと最近の検索に戻ります。',
      },
      source: sourceCode(
        citiesSource,
        `
        const recent: ListboxGroup[] = [
          { label: '最近の検索', items: [cities[11], cities[15]] },
        ];

        <Autocomplete label="都市" items={cities} emptyItems={recent} />
        `
      ),
    },
  },
  decorators: [narrow],
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const input = within(canvasElement).getByRole('combobox');
    await userEvent.click(input);
    await waitFor(() => expect(page.getByText('最近の検索')).toBeVisible());
    await expect(page.getAllByRole('option')).toHaveLength(3);
    await userEvent.type(input, '京');
    await waitFor(() => expect(page.queryByText('最近の検索')).toBeNull());
    await userEvent.type(input, '{Backspace}');
    await waitFor(() => expect(page.getByText('最近の検索')).toBeVisible());
  },
};

export const ScrollCue: Story = {
  name: '候補が長いとき',
  args: { label: '都市' },
  parameters: {
    controls: { include: ['popoverMaxHeight'] },
    docs: {
      description: {
        story:
          '候補が長いときは、ScrollArea と同じ見た目でスクロールします。続きがある端の内側の影と、載せたとき・スクロール中に出るつまみです。矢印キーで印を移すと、印の付いた候補が見える位置へスクロールします。つまみの帯は、欄とは別のキーボードの止まり先にはなりません。',
      },
    },
  },
  decorators: [narrow],
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;
    const input = within(canvasElement).getByRole('combobox');
    await userEvent.type(input, '市');
    await waitFor(() =>
      expect(body.querySelector('[data-slot="autocomplete-popup"]')).not.toBeNull()
    );
    const viewport = body.querySelector<HTMLElement>(
      '[data-slot="autocomplete-popup"] [data-slot="scroll-area-viewport"]'
    )!;
    // 欄とは別のキーボードの止まり先にしない
    await expect(viewport).toHaveAttribute('tabindex', '-1');
    await waitFor(() => expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight));
    for (let i = 0; i < 14; i++) await userEvent.keyboard('{ArrowDown}');
    // 印の付いた候補が、枠の中に見えている
    await waitFor(async () => {
      const active = viewport.querySelector<HTMLElement>('[role="option"][data-highlighted]');
      await expect(active).not.toBeNull();
      const a = active!.getBoundingClientRect();
      const v = viewport.getBoundingClientRect();
      await expect(a.top).toBeGreaterThanOrEqual(v.top - 1);
      await expect(a.bottom).toBeLessThanOrEqual(v.bottom + 1);
    });
    await expect(viewport.scrollTop).toBeGreaterThan(0);
  },
};

export const Messages: Story = {
  tags: ['visual'],
  name: 'キャプション・エラー・警告',
  args: { label: '都市' },
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Gallery>
      <Specimen label="caption（上）">
        <Autocomplete {...args} caption="候補にない都市も打てます" />
      </Specimen>
      <Specimen label="caption（下）">
        <Autocomplete {...args} caption="候補にない都市も打てます" captionPlacement="bottom" />
      </Specimen>
      <Specimen label="errorText">
        <Autocomplete
          {...args}
          caption="候補にない都市も打てます"
          errorText="都市を入れてください"
        />
      </Specimen>
      <Specimen label="warningText">
        <Autocomplete
          {...args}
          defaultValue="荒川区"
          warningText="荒川区は、お届けが翌日になります"
        />
      </Specimen>
      <Specimen label="successText">
        <Autocomplete {...args} defaultValue="京都市" successText="この都市にお届けできます" />
      </Specimen>
      <Specimen label="infoText">
        <Autocomplete {...args} defaultValue="京都市" infoText="前回と同じ都市です" />
      </Specimen>
    </Gallery>
  ),
};

export const Disabled: Story = {
  tags: ['visual'],
  name: '押せない',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`disabled` は押せない欄と同じ見た目です。`readOnly` は、フォーカスでき、文字をなぞって写せますが、候補は開かず文字も変わりません。',
      },
    },
  },
  render: (args) => (
    <Gallery>
      <Specimen label="disabled">
        <Autocomplete {...args} disabled />
      </Specimen>
      <Specimen label="disabled（文字あり）">
        <Autocomplete {...args} disabled defaultValue="京都市" />
      </Specimen>
      <Specimen label="readOnly（文字あり）">
        <Autocomplete {...args} readOnly defaultValue="京都市" />
      </Specimen>
      <Specimen label="icon・disabled">
        <Autocomplete {...args} icon={searchIcon} disabled />
      </Specimen>
    </Gallery>
  ),
};

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
          '- `non-blocking`（既定）: 止めません。打てるままで、開くと候補の最後に `loadingText` の行を出します。回る円は欄の端に出ます。',
          '- `blocking`: 押せない欄と同じ見た目にし、開けなくします。プレースホルダの場所に `loadingText` を出します。',
        ].join('\n'),
      },
      source: sourceCode(
        citiesSource,
        `
        <Autocomplete label="都市" items={cities} loading />
        <Autocomplete label="都市" items={cities} loading loadingBehavior="blocking" />
        `
      ),
    },
  },
  render: (args) => (
    <Matrix
      rows={behaviors}
      rowLabel={(behavior) => behavior}
      columns={indicators.map((indicator) => ({ label: indicator, indicator }))}
      columnWidth="16rem"
      renderCell={(behavior, { indicator }) => (
        <Autocomplete {...args} loadingBehavior={behavior} loadingIndicator={indicator} />
      )}
    />
  ),
};

// 打った文字で、1 秒後に候補を返す（外で絞り込む）
function AsyncAutocomplete(props: Omit<AutocompleteProps, 'items' | 'loading'>) {
  const [items, setItems] = useState<ListboxItem[]>([]);
  const [loading, setLoading] = useState(false);
  return (
    <Autocomplete
      {...props}
      items={items}
      filter={false}
      loading={loading}
      onValueChange={(text) => {
        props.onValueChange?.(text);
        if (!text) {
          setItems([]);
          return;
        }
        setLoading(true);
        setTimeout(() => {
          setItems(cities.filter((city) => city.label.includes(text)));
          setLoading(false);
        }, 400);
      }}
    />
  );
}

// Show code: 状態を持ち、ハンドラーが要の例なので、写して使える形を source.code に手で書く
export const AsyncSuggest: Story = {
  name: '外で候補を探す',
  args: { label: '都市' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '候補を検索の API から取るときは、`onValueChange` で打った文字を受け取り、`items` を差し替えます。`filter={false}` で、部品の中では絞り込みません。読み込んでいるあいだは `loading` を付けます（打つたびに問い合わせないよう、待つ処理は呼び出し側で入れます）。',
      },
      source: {
        language: 'tsx',
        code: `const [items, setItems] = useState<ListboxItem[]>([]);
const [loading, setLoading] = useState(false);

<Autocomplete
  label="都市"
  items={items}
  filter={false}
  loading={loading}
  onValueChange={async (text) => {
    setLoading(true);
    setItems(await searchCities(text));
    setLoading(false);
  }}
/>`,
      },
    },
  },
  render: (args) => (
    <div className="max-w-sm">
      <AsyncAutocomplete {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.type(within(canvasElement).getByRole('combobox'), '京');
    await waitFor(
      async () => {
        await expect(page.getAllByRole('option').length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
    await expect(page.getByRole('option', { name: '京都市' })).toBeVisible();
  },
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  args: { label: '都市', defaultValue: '京都' },
  parameters: { controls: { disable: true } },
  render: (args) => (
    <DensityPair>
      <div className="w-64">
        <Autocomplete {...args} />
        <div className="h-4" />
        <Autocomplete {...args} icon={searchIcon} />
      </div>
    </DensityPair>
  ),
};
