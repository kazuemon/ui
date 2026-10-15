import { CaretRightIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Cascader, type CascaderProps } from './Cascader';
import { categories, regions } from './cascader-story-items';
import { Icon } from '../icon/Icon';
import { DensityPair, Matrix, PhoneFrame } from '../../stories/story-parts';
import {
  enabledControl,
  type MatrixColumn,
  sourceCode,
  statePseudo,
} from '../../stories/story-states';

type Sample = { name: string; props: Partial<CascaderProps> };

const shibuya = ['tokyo', 'shibuya'];

const stateRows: Sample[] = [
  { name: '空', props: {} },
  { name: '値あり', props: { defaultValue: shibuya } },
  { name: 'エラー', props: { defaultValue: shibuya, errorText: 'お届けできない地域です' } },
  { name: '押せない', props: { defaultValue: shibuya, disabled: true } },
  { name: '読み取り専用', props: { defaultValue: shibuya, readOnly: true } },
];
const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: 'フォーカス', state: 'focus' },
];

// 開いた面を、ページの body ではなくこの枠の中に描く。ドキュメントのページでも、ストーリーごとに収まる
function PopoverFrame({ children }: { children: (container: HTMLElement) => ReactNode }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer} className="relative h-[30rem] w-[36rem] max-w-full">
      {container && children(container)}
    </div>
  );
}

// 開いた状態のストーリーも、ドキュメントのページでは閉じて描く（開くとページがその位置まで流れるため）
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

const regionsSource = `
const regions: CascaderItem[] = [
  {
    label: '東京都',
    value: 'tokyo',
    children: [
      { label: '千代田区', value: 'chiyoda' },
      { label: '渋谷区', value: 'shibuya' },
      // …
    ],
  },
  // …
];
`;

const meta = {
  title: 'Components/Cascader',
  component: Cascader<string>,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '段をたどって選ぶ欄です。親を選ぶと次の段が開き、最後の段（子のない選択肢）まで行くと値が決まります。都道府県と市区町村、カテゴリの階層のように、選択肢が木になっているときに使います。',
          '',
          '- 選択肢は `items` に木で渡します。`children` を持つ選択肢は次の段を開く親、持たないものは選ぶと決まる葉です。選べない選択肢には `disabled` を付けます。',
          '- 値は 1 段目から順に、段ごとの `value` を並べた配列です（`["tokyo", "shibuya"]`）。`defaultValue` か、`value`・`onValueChange` で持ちます。`name` を渡すと、フォームには段ごとの値を同じ名前で送ります。',
          '- 浮かべる形では段を横に並べます。開いたときから木のいちばん深い段の数だけ列を置き（まだ開いていない段は空の列）、段が増減しても面の幅は変わりません。段の数に合わせて伸び縮みさせるときは `hideEmptyColumns` を付けます。いまたどっている親はグレーの塗り、選んだ値は Select の選んだ項目と同じ印です。',
          '- マウスでは、親に載せて少し待つと次の段が開きます（Menu の入れ子と同じ）。開いた次の段へ斜めに動かすあいだは、途中でかすめた親では開きません。押して開く形にするときは `openOnHover={false}` にします。',
          '- キーボードでは、↑↓ で段の中を移り、→ で次の段へ入り、← で前の段へ戻ります。Enter で決めます。文字を打つと、その文字で始まる選択肢へ移ります。',
          '- 欄に出す文は `valueDisplay` で、道筋をすべて（`path`、既定）か、最後の段だけ（`last`）から選びます。区切りは `separator` で、文字のほかアイコンも渡せます。`null` では区切らずに続けて書きます。',
          '- 途中の段で決められるようにするときは `parentSelect` を使います。',
          '- 指で操作していて画面が狭いときは、画面の下から出すシートにします（`presentation`）。シートでは段を 1 つずつ出し、親を押すと次の段が右から滑り込みます。上の行で前の段へ戻ります。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: 'お届け先',
    items: regions,
    placeholder: '選んでください',
    valueDisplay: 'path',
    parentSelect: 'none',
    openOnHover: true,
    color: 'neutral',
  },
  argTypes: {
    items: { control: false as const },
    valueDisplay: {
      control: 'inline-radio',
      options: ['path', 'last'],
      table: { defaultValue: { summary: "'path'" } },
    },
    parentSelect: {
      control: 'inline-radio',
      options: ['none', 'row'],
      table: { defaultValue: { summary: "'none'" } },
    },
    color: {
      control: 'inline-radio',
      options: ['neutral', 'primary', 'secondary'],
      table: { defaultValue: { summary: "'neutral'" } },
    },
  },
} satisfies Meta<typeof Cascader<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

// 幅を欄の幅に絞る（ページいっぱいに伸ばさない）
const narrow = [
  (Story: () => ReactNode) => (
    <div className="max-w-sm">
      <Story />
    </div>
  ),
];

export const Playground: Story = {
  name: '基本',
  decorators: narrow,
};

export const States: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({ hover: enabledControl, focusWithin: enabledControl }),
  },
  render: (args) => (
    <Matrix
      rows={stateRows}
      columns={stateColumns}
      columnWidth="16rem"
      rowLabel={(row) => row.name}
      renderCell={(row) => <Cascader {...args} {...row.props} />}
    />
  ),
};

export const Open: Story = {
  tags: ['visual'],
  name: '開いた状態',
  args: { defaultValue: shibuya },
  parameters: {
    controls: { include: ['color', 'parentSelect', 'openOnHover'] },
    docs: {
      description: {
        story:
          '欄の下に、段を横に並べて浮かべます。いまたどっている親はグレーの塗り、親の右端には › が付きます。段が長いときは、段ごとにスクロールします。',
      },
      source: sourceCode(
        regionsSource,
        `<Cascader label="お届け先" items={regions} defaultValue={['tokyo', 'shibuya']} />`
      ),
    },
  },
  render: (args, { viewMode }) => (
    <PopoverFrame>
      {(container) => (
        <div className="max-w-sm">
          <Cascader
            {...args}
            presentation="popover"
            defaultOpen={openOnLoad(viewMode)}
            portalContainer={container}
            positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
          />
        </div>
      )}
    </PopoverFrame>
  ),
};

export const Colors: Story = {
  tags: ['visual'],
  name: '選んだ値の色',
  args: { defaultValue: shibuya },
  parameters: { controls: { disable: true } },
  render: (args, { viewMode }) => (
    <div className="flex flex-wrap gap-6">
      {(['neutral', 'primary', 'secondary'] as const).map((color) => (
        <PopoverFrame key={color}>
          {(container) => (
            <div className="max-w-[18rem]">
              <Cascader
                {...args}
                label={color}
                color={color}
                presentation="popover"
                defaultOpen={openOnLoad(viewMode)}
                portalContainer={container}
                positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
              />
            </div>
          )}
        </PopoverFrame>
      ))}
    </div>
  ),
};

export const Sheet: Story = {
  tags: ['visual'],
  name: 'シート',
  args: { defaultValue: shibuya },
  parameters: {
    controls: { include: ['parentSelect'] },
    docs: {
      description: {
        story:
          '`presentation="sheet"` のとき、または `auto` で指で操作していて画面が狭いときは、画面の下から出すシートにします。段は 1 つずつ出し、親を押すと次の段が右から滑り込みます。上の行（‹ と親の名前）で前の段へ戻ります。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <PhoneFrame>
      {(frame) => (
        <Cascader
          {...args}
          presentation="sheet"
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        />
      )}
    </PhoneFrame>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  args: { defaultValue: shibuya },
  parameters: { controls: { disable: true } },
  render: (args) => (
    <DensityPair>
      <div className="w-72">
        <Cascader {...args} />
      </div>
    </DensityPair>
  ),
};

export const ValueDisplay: Story = {
  tags: ['visual'],
  name: '欄に出す文',
  decorators: narrow,
  args: { items: categories, label: 'カテゴリ', defaultValue: ['books', 'novel', 'novel-1'] },
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Cascader {...args} caption="道筋をすべて（path・既定）" />
      <Cascader {...args} valueDisplay="last" caption="最後の段だけ（last）" />
      <Cascader {...args} separator="›" caption="区切りを › にする（separator）" />
      <Cascader
        {...args}
        separator={<Icon icon={CaretRightIcon} />}
        caption="区切りにアイコンを渡す（separator）"
      />
      <Cascader {...args} separator={null} caption="区切らない（separator={null}）" />
      <div className="w-48">
        <Cascader {...args} caption="狭い欄では前の段から縮める" />
      </div>
    </div>
  ),
};

const pickChange = fn();

export const Keyboard: Story = {
  name: 'キーボードと読み上げ',
  args: { name: 'area', onValueChange: pickChange, defaultValue: undefined },
  parameters: {
    docs: {
      description: {
        story:
          '↑↓ で段の中を移ると、次の段がその親の中身に替わります。→ で次の段へ入り、← で戻ります。最後の段で Enter を押すと値が決まり、面が閉じてフォーカスは欄に戻ります。',
      },
    },
  },
  decorators: [
    (Story) => (
      <form className="max-w-sm">
        <Story />
      </form>
    ),
  ],
  play: async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'お届け先 選んでください' });
    await userEvent.click(trigger);
    const dialog = await page.findByRole('dialog', { name: 'お届け先' });
    const root = within(dialog).getByRole('listbox', { name: 'お届け先' });
    // 開くと 1 段目の最初の選択肢にフォーカスがある
    await waitFor(() => expect(within(root).getByRole('option', { name: '北海道' })).toHaveFocus());
    // 親には、次の段があることを補足で伝える
    await expect(within(root).getByRole('option', { name: '北海道' })).toHaveAccessibleDescription(
      '次の段があります'
    );
    // ↓ で移ると、次の段がその親の中身になる
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(within(root).getByRole('option', { name: '東京都' })).toHaveFocus();
    const wards = within(dialog).getByRole('listbox', { name: '東京都' });
    await expect(within(wards).getByRole('option', { name: '千代田区' })).toBeVisible();
    // → で次の段へ入り、← で戻る
    await userEvent.keyboard('{ArrowRight}');
    await expect(within(wards).getByRole('option', { name: '千代田区' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(within(root).getByRole('option', { name: '東京都' })).toHaveFocus();
    // End で段の最後へ。選べない選択肢にも止まる
    await userEvent.keyboard('{ArrowRight}{End}');
    await expect(within(wards).getByRole('option', { name: '八王子市' })).toHaveFocus();
    await expect(within(wards).getByRole('option', { name: '八王子市' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    // 選べない選択肢では Enter を押しても決まらない
    await userEvent.keyboard('{Enter}');
    await expect(pickChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
    await expect(within(wards).getByRole('option', { name: '渋谷区' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(pickChange).toHaveBeenLastCalledWith(['tokyo', 'shibuya']);
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAccessibleName('お届け先 東京都 渋谷区');
    // フォームには段ごとの値を同じ名前で送る
    const form = canvasElement.querySelector('form');
    await expect(new FormData(form ?? undefined).getAll('area')).toEqual(['tokyo', 'shibuya']);

    // 開き直すと、選んだ値の段が開いていて、選んだ値にフォーカスがある
    await userEvent.click(trigger);
    const again = await page.findByRole('dialog', { name: 'お届け先' });
    const selected = within(again).getByRole('option', { name: '渋谷区' });
    await waitFor(() => expect(selected).toHaveFocus());
    await expect(selected).toHaveAttribute('aria-selected', 'true');
    await expect(
      within(within(again).getByRole('listbox', { name: 'お届け先' })).getByRole('option', {
        name: '東京都',
      })
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

const clickChange = fn();

export const Pointer: Story = {
  name: '押して選ぶ',
  decorators: narrow,
  args: { onValueChange: clickChange, items: categories, label: 'カテゴリ' },
  play: async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /カテゴリ/ }));
    const dialog = await page.findByRole('dialog', { name: 'カテゴリ' });
    await userEvent.click(within(dialog).getByRole('option', { name: '文房具' }));
    await userEvent.click(within(dialog).getByRole('option', { name: '筆記具' }));
    // 親を押しても決まらない（parentSelect="none"）
    await expect(clickChange).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole('option', { name: '万年筆' }));
    await expect(clickChange).toHaveBeenLastCalledWith(['stationery', 'pen', 'pen-2']);
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
    await expect(canvas.getByRole('button', { name: /カテゴリ/ })).toHaveAccessibleName(
      'カテゴリ 文房具 筆記具 万年筆'
    );
  },
};

// 画面の下寄りで開いたとき。面の高さは開いたときから木のいちばん長い段に合わせるので、段をたどっても変わらない
//   欄の下には面がまるごとは収まらない高さだけ空けるので、空きの広い上に開き、閉じるまで上のまま
const keepsSidePlay: Story['play'] = async ({ canvas, canvasElement }) => {
  const page = within(canvasElement.ownerDocument.body);
  const trigger = canvas.getByRole('button', { name: /カテゴリ/ });
  await userEvent.click(trigger);
  const dialog = await page.findByRole('dialog', { name: 'カテゴリ' });
  const positioner = dialog.parentElement!;
  const side = () => positioner.getAttribute('data-side');
  const box = () => dialog.getBoundingClientRect();
  await waitFor(() => expect(positioner.style.opacity).not.toBe('0'));
  // 開く動き（滑り）が終わってから測る
  await waitFor(() => expect(dialog).not.toHaveAttribute('data-starting-style'));
  await waitFor(() => expect(dialog.getAnimations()).toHaveLength(0));
  // 下に収まらないので、空きの広い上に開く（面の下端は欄の上）
  await expect(side()).toBe('top');
  await expect(box().bottom).toBeLessThanOrEqual(trigger.getBoundingClientRect().top);
  const before = { top: Math.round(box().top), height: Math.round(box().height) };
  // 雑貨（短い段）から文房具（長い段）へたどっても、面の高さと上端は変わらない
  await userEvent.click(within(dialog).getByRole('option', { name: '文房具' }));
  await within(dialog).findByRole('option', { name: '筆記具' });
  await expect({ top: Math.round(box().top), height: Math.round(box().height) }).toEqual(before);
  await userEvent.click(within(dialog).getByRole('option', { name: '筆記具' }));
  await within(dialog).findByRole('option', { name: '万年筆' });
  await expect({ top: Math.round(box().top), height: Math.round(box().height) }).toEqual(before);
  await expect(side()).toBe('top');
};

export const KeepsSide: Story = {
  name: '段をたどっても面の高さと向きを変えない',
  tags: ['!autodocs'],
  args: {
    items: categories,
    label: 'カテゴリ',
    parentSelect: 'row',
    defaultValue: ['goods', 'mug'],
  },
  decorators: [
    (Story: () => ReactNode) => (
      <div className="fixed inset-x-4 bottom-[176px] max-w-sm">
        <Story />
      </div>
    ),
  ],
  play: keepsSidePlay,
};

// hideEmptyColumns でも、列の数が変わるだけで、高さと向きは変わらない
export const KeepsSideHideEmptyColumns: Story = {
  ...KeepsSide,
  name: '段をたどっても面の高さと向きを変えない（hideEmptyColumns）',
  args: { ...KeepsSide.args, hideEmptyColumns: true },
};

export const LockedStaysClosed: Story = {
  name: '押せない・読み取り専用では開かない',
  decorators: narrow,
  args: { defaultValue: shibuya },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Cascader {...args} label="押せない" disabled />
      <Cascader {...args} label="読み取り専用" readOnly />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('button', { name: /押せない/ })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: /読み取り専用/ }));
    await expect(page.queryByRole('dialog')).toBeNull();
  },
};

const sheetChange = fn();

export const SheetNavigation: Story = {
  name: 'シートで段を進む・戻る',
  args: { onValueChange: sheetChange, items: categories, label: 'カテゴリ' },
  parameters: {
    docs: {
      description: {
        story:
          'シートでは段を 1 つずつ出します。親を押すと次の段が右から滑り込み、上の行（‹ と親の名前）で前の段へ戻ります。シートの高さは、開いたときから木のいちばん長い段に合わせ、段を移っても変えません。Menu の入れ子のシートと同じ形にするときは `levelSheet`（`fixed`・`fit`）を使います。',
      },
    },
  },
  render: (args) => (
    <PhoneFrame>
      {(frame) => <Cascader {...args} presentation="sheet" portalContainer={frame} />}
    </PhoneFrame>
  ),
  play: async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /カテゴリ/ }));
    const dialog = await page.findByRole('dialog', { name: 'カテゴリ' });
    await userEvent.click(within(dialog).getByRole('option', { name: '本' }));
    const current = () =>
      dialog
        .querySelector('[data-position="current"] [role="listbox"]')
        ?.getAttribute('aria-label');
    await waitFor(() => expect(current()).toBe('本'));
    // 戻る行は、親の名前に続けて「戻る」と読む
    await userEvent.click(within(dialog).getByRole('button', { name: /^本\s*（戻る）$/ }));
    await waitFor(() => expect(current()).toBe('カテゴリ'));
    await userEvent.click(within(dialog).getByRole('option', { name: '雑貨' }));
    await waitFor(() => expect(current()).toBe('雑貨'));
    await userEvent.click(within(dialog).getByRole('option', { name: 'マグカップ' }));
    await expect(sheetChange).toHaveBeenLastCalledWith(['goods', 'mug']);
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
  },
};

const rowChange = fn();

export const ParentRow: Story = {
  name: '途中の段で決める',
  args: { onValueChange: rowChange, items: categories, label: 'カテゴリ', parentSelect: 'row' },
  decorators: narrow,
  parameters: {
    docs: {
      description: {
        story:
          '`parentSelect="row"` では、次の段の先頭に親そのものを選ぶ行を置きます。文字は `parentRowLabel` で変えます。',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /カテゴリ/ }));
    const dialog = await page.findByRole('dialog', { name: 'カテゴリ' });
    await userEvent.click(within(dialog).getByRole('option', { name: '文房具' }));
    await userEvent.click(within(dialog).getByRole('option', { name: '文房具 のすべて' }));
    await expect(rowChange).toHaveBeenLastCalledWith(['stationery']);
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
    await expect(canvas.getByRole('button', { name: /カテゴリ/ })).toHaveAccessibleName(
      'カテゴリ 文房具'
    );
  },
};
