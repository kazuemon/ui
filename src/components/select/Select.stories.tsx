import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
// 引数の userEvent は、LAN の IP で開いたとき（clipboard のない環境）は空になり、click などが呼べない
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Select, type SelectItem, type SelectProps } from './Select';
import { TextField } from '../text-field/TextField';
import { Gallery, Matrix, PhoneFrame, Specimen } from '../../stories/story-parts';
import { labelClass, sourceCode } from '../../stories/story-states';

const wards: SelectItem[] = [
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

const times: SelectItem[] = ['午前中', '14〜16時', '16〜18時', '18〜20時', '19〜21時'].map(
  (label, i) => ({ label, value: `time-${i + 1}` })
);

const areas: SelectItem[] = [
  { label: '千代田区', value: 'chiyoda' },
  { label: '中央区', value: 'chuo' },
  { label: '荒川区', value: 'arakawa', note: { kind: 'warning', text: 'お届けが翌日になります' } },
  {
    label: '八王子市',
    value: 'hachioji',
    disabled: true,
    note: { kind: 'reason', text: 'お届けできません' },
  },
  {
    label: '町田市',
    value: 'machida',
    disabled: true,
    note: { kind: 'reason', text: 'お届けできません' },
  },
  { label: '港区', value: 'minato' },
];

// Show code に出す選択肢の並び（先頭の数件だけ）
const wardsSource = `const wards: SelectItem[] = [
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
// 開くと選んだ選択肢にフォーカスが移り、ページがそのストーリーの位置まで流れてしまうため
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

const meta = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '選択肢から1つを選ぶ欄です。ラベル・キャプション・エラー・警告の形は TextField と同じです。',
          '',
          '- 選択肢は `items`（`label`・`value`）で渡します。選べない選択肢には `disabled` を、ラベルの下の2行目には `note` を付けます。`note` の `kind` は、選べない理由なら `reason`、選べるが選ぶ前に知っておいてほしいことなら `warning` です。文は呼び出し側で組み立てて渡します。',
          '- 選択肢の出し方は `presentation` で決めます。既定の `auto` は、指で操作していて画面が狭いときだけ、画面の下から出るシートにします。それ以外では本体の下に浮かべます。',
          '- `prefix` には文字を渡せます（例: 都道府県を選んだあとの市区町村の欄に「東京都」）。',
          '- 選択肢を読み込んでいるあいだは `loading` を付けます。読み込んでいるあいだに開くと、読み上げで `loadingText` を知らせ、開いたまま読み込みが終わると選択肢の数（`loadedText`）を知らせます。',
          '- 値は `defaultValue` か、`value`・`onValueChange` で持ちます。',
          '- `readOnly` にすると、文字を打つ欄の読み取り専用と同じ見た目（塗りなし・細い破線の輪郭・一段淡い値の文字）になります。フォーカスでき、値をなぞって写せます。選択肢は開かず値も変わりませんが、フォームでは送られます。',
          '- `required` を付けると、ラベルの後ろに印（既定は「必須」のタグ）が出て、本体に aria-required が付きます。印は読み上げから外れます。印の形は `requiredMark`、任意の欄の「任意」は `optionalMark` で決めます。',
          '- `placeholder` は、選んだ値と見分けられるよう「選んでください」のように、まだ選んでいないと分かる書き方にします。選択肢の名前をそのまま書くと、選んだ値に見えます。',
          '',
          '「開いた状態」などのストーリーは、ストーリーの画面では開いて表示します。このページでは閉じているので、本体を押して開いてください。',
        ].join('\n'),
      },
    },
  },
  // Controls で既定の値を選んだ状態から始める（部品の既定と同じ値）
  args: {
    label: '住所',
    prefix: '東京都',
    items: wards,
    placeholder: '選んでください',
    captionPlacement: 'top',
    addonShape: 'attached',
    disabled: false,
    readOnly: false,
    disabledIcon: 'show',
    presentation: 'auto',
    sheetDetent: 'half',
    sheetMoreCue: 'divider-always-shadow',
    popoverMoreCue: 'shadow',
    popoverMaxHeight: 'screen',
    loading: false,
    loadingBehavior: 'non-blocking',
    loadingIndicator: 'spinner',
    loadingText: '読み込んでいます',
    modal: true,
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
    error: { control: 'text' },
    warning: { control: 'text' },
    success: { control: 'text' },
    successMark: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    info: { control: 'text' },
    prefix: { control: 'text' },
    addonShape: { control: 'inline-radio', options: ['attached', 'floating'] },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    disabledIcon: { control: 'inline-radio', options: ['show', 'hide'] },
    presentation: { control: 'inline-radio', options: ['auto', 'popover', 'sheet'] },
    sheetDetent: { control: 'inline-radio', options: ['half', 'full'] },
    sheetMoreCue: {
      control: 'select',
      options: ['shadow', 'divider', 'divider-always', 'divider-shadow', 'divider-always-shadow'],
    },
    popoverMoreCue: { control: 'inline-radio', options: ['shadow', 'none'] },
    popoverMaxHeight: { control: 'inline-radio', options: ['screen', 'none'] },
    loading: { control: 'boolean' },
    loadingBehavior: { control: 'inline-radio', options: behaviors },
    loadingIndicator: { control: 'inline-radio', options: indicators },
    loadingText: { control: 'text' },
    loadedText: { control: false },
    modal: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    items: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    open: { control: false },
    defaultOpen: { control: false },
    container: { control: false },
    collisionAvoidance: { control: false },
  },
} satisfies Meta<typeof Select>;

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

export const Choose: Story = {
  name: '選ぶ',
  args: { label: 'お届けの時間帯', prefix: undefined, items: times, presentation: 'popover' },
  parameters: {
    docs: {
      description: {
        story:
          '本体を押して選択肢を開き、1つ選ぶまでの操作です。Interactions のパネルで再生できます。キーボードでは、本体にフォーカスして Space か ↓ で開き、矢印キーで動いて Enter で選びます。',
      },
    },
  },
  decorators: [narrow],
  play: async ({ args, canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('combobox'));
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(await page.findByRole('option', { name: '14〜16時' }));
    await expect(args.onValueChange).toHaveBeenCalled();
    await expect(canvas.getByRole('combobox')).toHaveTextContent('14〜16時');
  },
};

// Show code: 枠（PopoverFrame）の中身は出ないので、Select の使い方を source.code に手で書く
export const Open: Story = {
  tags: ['visual'],
  name: '開いた状態',
  parameters: {
    controls: { include: ['popoverMaxHeight', 'popoverMoreCue', 'addonShape'] },
    docs: {
      description: {
        story:
          '本体の下に浮かべた選択肢です。`popoverMaxHeight="screen"`（既定）では画面の高さの半分までに収め、最後の項目を半分だけ見せて、続きがあることを示します。上下に続きがあるときは、内側に影を出します（`popoverMoreCue`）。',
      },
      source: sourceCode(
        wardsSource,
        `
        <Select
          label="住所"
          prefix="東京都"
          placeholder="選んでください"
          items={wards}
          defaultValue="ward-3"
          presentation="popover"
          // 画面の高さの半分までに収め、上下に続きがあれば内側に影を出す（どちらも既定）
          popoverMaxHeight="screen"
          popoverMoreCue="shadow"
        />
        `
      ),
    },
  },
  render: (args, { viewMode }) => (
    <PopoverFrame>
      {(container) => (
        <Select
          // 高さの上限と影の指定を変えたときは、測り直すために描き直す
          key={`${args.popoverMaxHeight}-${args.popoverMoreCue}`}
          {...args}
          presentation="popover"
          defaultValue="ward-3"
          defaultOpen={openOnLoad(viewMode)}
          modal={false}
          container={container}
          collisionAvoidance={{ side: 'none', align: 'none' }}
        />
      )}
    </PopoverFrame>
  ),
};

// Show code: 枠（PopoverFrame）の中身は出ないので、Select の使い方を source.code に手で書く
export const ItemNotes: Story = {
  name: '選べない選択肢と2行目',
  args: { label: '市区町村', items: areas },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`disabled` の選択肢は押せない文字の色になり、押しても選ばれません。矢印キーでは止まり、選べないことと理由が読まれます。`note` の `reason` は灰色の文字だけ、`warning` は警告の行と同じ三角と文字です。2行目のある選択肢だけ高くなります。',
      },
      source: sourceCode(`
        const areas: SelectItem[] = [
          { label: '千代田区', value: 'chiyoda' },
          { label: '中央区', value: 'chuo' },
          // 選べるが、選ぶ前に知っておいてほしいこと
          { label: '荒川区', value: 'arakawa', note: { kind: 'warning', text: 'お届けが翌日になります' } },
          // 選べない理由
          { label: '八王子市', value: 'hachioji', disabled: true, note: { kind: 'reason', text: 'お届けできません' } },
          { label: '町田市', value: 'machida', disabled: true, note: { kind: 'reason', text: 'お届けできません' } },
          { label: '港区', value: 'minato' },
        ];

        <Select label="市区町村" prefix="東京都" placeholder="選んでください" items={areas} defaultValue="chiyoda" />
      `),
    },
  },
  render: (args, { viewMode }) => (
    <PopoverFrame>
      {(container) => (
        <Select
          {...args}
          presentation="popover"
          defaultValue="chiyoda"
          defaultOpen={openOnLoad(viewMode)}
          modal={false}
          container={container}
          collisionAvoidance={{ side: 'none', align: 'none' }}
        />
      )}
    </PopoverFrame>
  ),
};

export const Messages: Story = {
  tags: ['visual'],
  name: 'キャプション・エラー・警告',
  args: { label: '市区町村', items: areas },
  render: (args) => (
    <Gallery>
      <Specimen label="caption（上）">
        <Select {...args} caption="お届けは23区内だけです" />
      </Specimen>
      <Specimen label="caption（下）">
        <Select {...args} caption="お届けは23区内だけです" captionPlacement="bottom" />
      </Specimen>
      <Specimen label="error">
        <Select {...args} caption="お届けは23区内だけです" error="市区町村を選んでください" />
      </Specimen>
      <Specimen label="warning">
        <Select
          {...args}
          caption="お届けは23区内だけです"
          defaultValue="arakawa"
          warning="荒川区は、お届けが翌日になります"
        />
      </Specimen>
    </Gallery>
  ),
};

export const SuccessInfo: Story = {
  name: '成功・情報',
  args: { label: 'お届けの時間帯', prefix: undefined, items: times, defaultValue: 'time-2' },
  parameters: {
    controls: { exclude: ['success', 'successMark', 'info'] },
    docs: {
      description: {
        story:
          '`success` は本体の下に丸のチェックと緑の文字で出し、▼ の左にもチェックを置きます。下の行だけにするときは `successMark={false}` を付けます。`info` は丸の「i」と青い文字の行です。どちらも欄の枠線は変えません。',
      },
    },
  },
  render: (args) => (
    <Gallery>
      <Specimen label="success">
        <Select {...args} success="この時間帯にお届けできます" />
      </Specimen>
      <Specimen label="successMark={false}">
        <Select {...args} success="この時間帯にお届けできます" successMark={false} />
      </Specimen>
      <Specimen label="info">
        <Select {...args} info="前回と同じ時間帯を選んでいます" />
      </Specimen>
    </Gallery>
  ),
  play: async ({ canvasElement }) => {
    // チェックは success の欄にだけ出る（successMark={false} と info では出ない）
    const marks = canvasElement.querySelectorAll('[data-slot="field-success-mark"]');
    await expect(marks).toHaveLength(1);
    await expect(marks[0]).toBeVisible();
  },
};

export const Disabled: Story = {
  tags: ['visual'],
  name: '押せない',
  parameters: {
    controls: { exclude: ['disabled', 'disabledIcon'] },
    docs: {
      description: {
        story:
          '選んだ値は押せない文字の色になり、プレースホルダの文はふだんの色のままです。値が入った押せない欄と、文を出している欄を見分けられます。▼ は `disabledIcon="hide"` で隠せます。',
      },
    },
  },
  render: (args) => (
    <Gallery>
      <Specimen label="値あり">
        <Select {...args} disabled defaultValue="ward-3" />
      </Specimen>
      <Specimen label="プレースホルダ">
        <Select {...args} disabled placeholder="先に都道府県を選んでください" />
      </Specimen>
      <Specimen label='disabledIcon="hide"'>
        <Select {...args} disabled disabledIcon="hide" defaultValue="ward-3" />
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
          '`readOnly` の欄は、文字を打つ欄の読み取り専用と同じ見た目です。塗りを持たず、細い破線の輪郭と一段淡い値の文字になり、フォーカスすると破線が枠線に変わります。値はなぞって写せます。▼ は選ぶ欄だと分かるよう残しますが、押せるようには見せないので一段淡くします。押しても選択肢は開かず、キーボードでも値は変わりませんが、フォームでは値が送られます。',
      },
    },
  },
  render: (args) => (
    <Gallery>
      <Specimen label="値あり">
        <Select {...args} readOnly defaultValue="ward-3" />
      </Specimen>
      <Specimen label="プレースホルダ">
        <Select {...args} readOnly />
      </Specimen>
    </Gallery>
  ),
  play: async ({ canvas }) => {
    const [trigger] = canvas.getAllByRole('combobox');
    // 読み上げは「読み取り専用」。押せない（aria-disabled）とは伝えない
    await expect(trigger).toHaveAttribute('aria-readonly', 'true');
    await expect(trigger).not.toHaveAttribute('aria-disabled');
    // 押しても選択肢は開かない
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // 文字の欄の読み取り専用と同じく、値はなぞって写せる（押せない欄では写せない）
    await expect(getComputedStyle(trigger).userSelect).not.toBe('none');
    // フォーカスできる（見た目の比較は、線のない状態で撮るので最後に外す）
    trigger.focus();
    await expect(trigger).toHaveFocus();
    trigger.blur();
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
          '- `non-blocking`（既定）: 止めません。開けるままで、開くと選択肢の最後に `loadingText` の行を出します。回る円は ▼ の左に出ます。',
          '- `blocking`: 押せない欄と同じ見た目にし、開けなくします。プレースホルダの場所に `loadingText` を出し、▼ の場所に回る円を出します。',
        ].join('\n'),
      },
      source: sourceCode(
        wardsSource,
        `
        <Select label="住所" prefix="東京都" items={wards} loading />
        <Select label="住所" prefix="東京都" items={wards} loading loadingBehavior="blocking" />
        <Select label="住所" prefix="東京都" items={wards} loading loadingIndicator="bar" />
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
          <Select {...args} loadingBehavior={behavior} loadingIndicator={indicator} />
        )}
      />
      <div className="flex flex-col gap-3">
        <p className={labelClass}>non-blocking で開いたとき</p>
        <PopoverFrame height="h-[22rem]">
          {(container) => (
            <Select
              {...args}
              items={wards.slice(0, 4)}
              presentation="popover"
              defaultOpen={openOnLoad(viewMode)}
              modal={false}
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
function LoadOnOpenSelect({ onOpenChange, ...props }: Omit<SelectProps, 'items' | 'loading'>) {
  const [items, setItems] = useState<SelectItem[]>([]);
  const [loading, setLoading] = useState(false);
  return (
    <Select
      {...props}
      items={items}
      loading={loading}
      onOpenChange={(next) => {
        onOpenChange?.(next);
        if (!next || loading || items.length) return;
        setLoading(true);
        setTimeout(() => {
          setItems(times);
          setLoading(false);
        }, 1500);
      }}
    />
  );
}

// Show code: 状態を持ち、ハンドラーが要の例なので、写して使える部品の形を source.code に手で書く
export const LoadOnOpen: Story = {
  name: '開いてから読み込みが終わる',
  args: { label: 'お届けの時間帯', prefix: undefined },
  parameters: {
    controls: { include: ['loadingText', 'loadingIndicator'] },
    docs: {
      description: {
        story: [
          'はじめて開いたときに選択肢を読み込み、1.5 秒で終わる例です。',
          '',
          '- 読み込んでいるあいだに開くと、読み上げで `loadingText`（「読み込んでいます」）を知らせます。開いたまま読み込みが終わると、選択肢の数（`loadedText`。既定は「5 件の選択肢」の形）を知らせます。閉じると知らせる文は空に戻ります。',
          '- 知らせるのは、本体のそばにいつも置いた見えない `role="status"` の箱です。開くと同時に現れる箱は、読み上げソフトによっては読まれないためです。見える読み込み中の行は、二重に読まないよう role の箱にしません。',
          '',
          'もう一度試すときは、ストーリーを描き直してください。',
        ].join('\n'),
      },
      source: sourceCode(`
        const times: SelectItem[] = [
          { label: '午前中', value: 'time-1' },
          { label: '14〜16時', value: 'time-2' },
          { label: '16〜18時', value: 'time-3' },
          { label: '18〜20時', value: 'time-4' },
          { label: '19〜21時', value: 'time-5' },
        ];

        // はじめて開いたときに選択肢を読み込む
        function DeliveryTimeSelect() {
          const [items, setItems] = useState<SelectItem[]>([]);
          const [loading, setLoading] = useState(false);
          return (
            <Select
              label="お届けの時間帯"
              placeholder="選んでください"
              items={items}
              loading={loading}
              onOpenChange={(open) => {
                if (!open || loading || items.length) return;
                setLoading(true);
                // 読み込みの代わり。1.5 秒で終わる
                setTimeout(() => {
                  setItems(times);
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
        <LoadOnOpenSelect
          {...args}
          presentation="popover"
          container={container}
          collisionAvoidance={{ side: 'none', align: 'none' }}
        />
      )}
    </PopoverFrame>
  ),
  play: async ({ canvas, canvasElement }) => {
    const status = canvasElement.querySelector<HTMLElement>('[data-slot="select-status"]');
    if (!status) throw new Error('status の箱がありません');
    await expect(status).toHaveAttribute('role', 'status');
    await expect(status.textContent).toBe('');
    await userEvent.click(canvas.getByRole('combobox'));
    await waitFor(() => expect(status).toHaveTextContent('読み込んでいます'));
    // 見える読み込み中の行は role の箱にしない。status の箱は、開いているあいだも読み上げから隠されない（modal でも）
    const row = canvasElement.querySelector('[data-slot="select-loading"]');
    await expect(row).not.toBeNull();
    await expect(row).not.toHaveAttribute('role');
    await expect(status.closest('[aria-hidden="true"], [inert]')).toBeNull();
    await waitFor(() => expect(status).toHaveTextContent('5 件の選択肢'), { timeout: 3000 });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(status.textContent).toBe(''));
  },
};

// Show code: 枠（PhoneFrame）の中身は出ないので、Select の使い方を source.code に手で書く
export const Sheet: Story = {
  tags: ['visual'],
  name: 'シート',
  args: { caption: 'お届けは23区内だけです', sheetDetent: 'half' },
  parameters: {
    controls: { include: ['sheetDetent', 'sheetMoreCue', 'caption', 'error', 'warning'] },
    docs: {
      description: {
        story: [
          '`presentation="sheet"` のとき、または `auto` で指で操作していて画面が狭いときは、選択肢を画面の下から出すシートにします。ここでは画面の代わりの枠の中に描いています。',
          '',
          '- 見出しに、ラベル・キャプション・エラー・警告と、閉じるボタン（×）を出します。',
          '- 選択肢が長いときは半分の高さで開き（`sheetDetent="half"`、既定）、つまみを引くと高さが変わります。上へはじくと高さいっぱいに広がり、下へはじくか下まで引くと閉じます。`full` は高さいっぱいで開きます。',
          '- `sheetMoreCue` で、上下に続きがあることの見せ方を選びます。',
        ].join('\n'),
      },
      source: sourceCode(
        wardsSource,
        `
        <Select
          label="住所"
          prefix="東京都"
          caption="お届けは23区内だけです"
          placeholder="選んでください"
          items={wards}
          defaultValue="ward-3"
          // 既定の auto は、指で操作していて画面が狭いときだけシートにする
          presentation="sheet"
          sheetDetent="half"
        />
        `
      ),
    },
  },
  render: (args, { viewMode }) => (
    <PhoneFrame>
      {(frame) => (
        <>
          <TextField label="お名前" defaultValue="山田 花子" />
          <Select
            // 開く高さを変えたときは、測り直すために描き直す
            key={`${args.sheetDetent}-${args.sheetMoreCue}`}
            {...args}
            presentation="sheet"
            defaultValue="ward-3"
            defaultOpen={openOnLoad(viewMode)}
            modal={false}
            container={frame}
          />
        </>
      )}
    </PhoneFrame>
  ),
};

// つまみ（シートの見出し）を、指で縦にはじく・引く。wait を付けると、離す前に止まる（はじかない）
// 部品は、離す直前の短いあいだ（80ms）の動きから速さを出す（src/internal/sheet/use-sheet-drag.ts の releaseVelocity）。
// 速さの元になる event.timeStamp は、イベントを出した時刻ではなく作った時刻。はじくときは押す・動く・離すを先にまとめて作り、
// 出すのは 1 フレームずつ待ちながら行う（実機と同じく、動きごとに描き直される）。混んだ環境で出す間隔が延びても、速さは変わらない
async function dragHandle(handle: Element, dy: number, wait = 0) {
  const { top } = handle.getBoundingClientRect();
  const y = top + 8;
  const create = (type: string, clientY: number, buttons = 1) =>
    new PointerEvent(type, {
      pointerId: 1,
      pointerType: 'touch',
      isPrimary: true,
      buttons,
      clientY,
      bubbles: true,
      cancelable: true,
      composed: true,
    });
  const events = [
    create('pointerdown', y),
    ...[1, 2, 3].map((step) => create('pointermove', y + (dy * step) / 3)),
  ];
  // 止めてから離すときは、離すイベントを待ったあとで作る（動きより wait だけあとの時刻になる）
  if (!wait) events.push(create('pointerup', y + dy, 0));
  for (const event of events) {
    handle.dispatchEvent(event);
    await new Promise(requestAnimationFrame);
  }
  if (wait) {
    await new Promise((resolve) => setTimeout(resolve, wait));
    handle.dispatchEvent(create('pointerup', y + dy, 0));
  }
}

// Show code: 枠（PhoneFrame）の中身は出ないので、Select の使い方を source.code に手で書く
export const SheetFling: Story = {
  name: 'シートをはじく',
  args: { label: '住所', caption: undefined },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'つまみを上へはじくと、半分の高さから高さいっぱいに広がります。下へはじくと、引いた距離が短くても一段下がり、半分の高さからは閉じます。はじかずにゆっくり引いて離したときは、近い方の高さに戻ります。Interactions のパネルで再生できます。',
      },
      source: sourceCode(
        wardsSource,
        `
        <Select
          label="住所"
          prefix="東京都"
          placeholder="選んでください"
          items={wards}
          defaultValue="ward-3"
          presentation="sheet"
        />
        `
      ),
    },
  },
  render: (args, { viewMode }) => (
    <PhoneFrame>
      {(frame) => (
        <Select
          {...args}
          presentation="sheet"
          defaultValue="ward-3"
          defaultOpen={openOnLoad(viewMode)}
          modal={false}
          container={frame}
        />
      )}
    </PhoneFrame>
  ),
  play: async ({ canvas, canvasElement }) => {
    const popup = await waitFor(() => {
      const el = canvasElement.querySelector<HTMLElement>('[data-slot="select-popup"]');
      if (!el) throw new Error('シートが開いていません');
      return el;
    });
    // つまみを含む見出しは、シートの最初の子
    const handle = popup.firstElementChild;
    if (!handle) throw new Error('見出しがありません');
    const combobox = canvas.getByRole('combobox');
    // 開いた直後は、選択肢を測ってから半分の高さに決まる。高さの動きが止まるのを待つ
    const settled = async () => {
      let last = -1;
      await waitFor(
        () => {
          const now = popup.offsetHeight;
          const same = now === last;
          last = now;
          if (!same) throw new Error('動いています');
        },
        { timeout: 3000 }
      );
      return last;
    };
    const half = await settled();
    // はじいたあとは、高さが条件を満たすまで待つ（動きを減らす設定で撮るので、高さはすぐに変わる）
    const heightToBe = (what: string, ok: (height: number) => boolean) =>
      waitFor(
        () => {
          if (!ok(popup.offsetHeight))
            throw new Error(`${what}ではありません: ${popup.offsetHeight}px`);
        },
        { timeout: 3000 }
      );

    // ゆっくり少し下へ引いて止めてから離すと、半分の高さに戻る
    await dragHandle(handle, 40, 150);
    await heightToBe('半分の高さ', (height) => height === half);
    await expect(combobox).toHaveAttribute('aria-expanded', 'true');

    // 上へはじくと、高さいっぱいに広がる
    await dragHandle(handle, -30);
    await heightToBe('半分より高い高さ', (height) => height > half);

    // 高さいっぱいから下へはじくと、半分の高さに戻る
    await dragHandle(handle, 30);
    await heightToBe('半分の高さ', (height) => height === half);

    // 半分の高さから、少しだけ下へはじくと閉じる。離した高さのまま下へ滑る
    // 閉じ終わると高さを消すので（動きを減らす設定では、すぐに閉じ終わる）、離した直後に確かめる
    await dragHandle(handle, 30);
    await expect(popup.offsetHeight).toBeLessThan(half);
    await waitFor(() => expect(combobox).toHaveAttribute('aria-expanded', 'false'), {
      timeout: 3000,
    });
  },
};

export const DensityScope: Story = {
  name: 'ページの一部で密度を変える',
  args: { label: '住所', caption: undefined },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'ページの一部だけ密度や指用の高さを変えるときは、その要素に `data-density` や `coarse-large` のクラスを付けます。浮かぶ選択肢とシートは `body` の直下に描きますが、本体の祖先に付いたものを写すので、`container` を指定しなくても、選択肢の項目は本体と同じ高さになります。ここでは `data-density="coarse"` と `coarse-large` を付けています（本体と項目は 52px）。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <div data-density="coarse" className="coarse-large h-[26rem] max-w-sm">
      <Select
        {...args}
        presentation="popover"
        defaultValue="ward-3"
        defaultOpen={openOnLoad(viewMode)}
        modal={false}
        collisionAvoidance={{ side: 'none', align: 'none' }}
      />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const option = await page.findByRole('option', { name: '港区' });
    // 選択肢は canvas の外（body の直下）に描かれている
    await expect(canvasElement.contains(option)).toBe(false);
    await expect(canvas.getByRole('combobox').offsetHeight).toBe(52);
    await expect(option.offsetHeight).toBe(52);
  },
};
