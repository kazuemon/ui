import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
// 引数の userEvent は、LAN の IP で開いたとき（clipboard のない環境）は空になり、click などが呼べない
import { expect, fn, userEvent, within } from 'storybook/test';

import { Select, type SelectItem } from '../components/Select';
import { TextField } from '../components/TextField';
import { Gallery, Matrix, Specimen } from './story-parts';
import { labelClass } from './story-states';

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

// スマートフォンの画面の代わり。シートは画面の下に固定して出るので、枠を位置の基準にする（transform）
function PhoneFrame({ children }: { children: (frame: HTMLElement) => ReactNode }) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setFrame}
      data-density="coarse"
      className="relative h-[640px] w-[375px] max-w-full [transform:translateZ(0)] overflow-clip rounded-[28px] border border-line bg-bg"
    >
      <div className="flex flex-col gap-5 px-5 pt-8">{frame && children(frame)}</div>
    </div>
  );
}

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
          '- 選択肢を読み込んでいるあいだは `loading` を付けます。',
          '- 値は `defaultValue` か、`value`・`onValueChange` で持ちます。',
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
    prefix: { control: 'text' },
    addonShape: { control: 'inline-radio', options: ['attached', 'floating'] },
    disabled: { control: 'boolean' },
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

export const Open: Story = {
  name: '開いた状態',
  parameters: {
    controls: { include: ['popoverMaxHeight', 'popoverMoreCue', 'addonShape'] },
    docs: {
      description: {
        story:
          '本体の下に浮かべた選択肢です。`popoverMaxHeight="screen"`（既定）では画面の高さの半分までに収め、最後の項目を半分だけ見せて、続きがあることを示します。上下に続きがあるときは、内側に影を出します（`popoverMoreCue`）。',
      },
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

export const Disabled: Story = {
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

export const Loading: Story = {
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

export const Sheet: Story = {
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
          '- 選択肢が長いときは半分の高さで開き（`sheetDetent="half"`、既定）、つまみを引くと高さが変わります。下まで引くと閉じます。`full` は高さいっぱいで開きます。',
          '- `sheetMoreCue` で、上下に続きがあることの見せ方を選びます。',
        ].join('\n'),
      },
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
