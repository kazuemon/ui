import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { Figure } from '../figure/Figure';
import { manyScreens, screens } from '../carousel/story-images';
import { Thumbnails, type ThumbnailsColor, type ThumbnailsIndicator } from './Thumbnails';
import { DensityPair, Matrix } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

const thumbs = screens.map((screen) => <img key={screen.alt} src={screen.src} alt={screen.alt} />);

const colors: ThumbnailsColor[] = ['neutral', 'primary', 'secondary'];
// 色 3 つと、選んでいる印の underline-dim（色は neutral）
const stateRows: { color: ThumbnailsColor; indicator: ThumbnailsIndicator }[] = [
  ...colors.map((color) => ({ color, indicator: 'underline' as const })),
  { color: 'neutral', indicator: 'underline-dim' },
];
const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: '押下', state: 'active' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
];

const meta = {
  title: 'Components/Thumbnails',
  component: Thumbnails,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '小さな画像を並べ、押して切り替える帯です。大きな 1 枚の下などに置き、いまどの 1 枚かを示します。',
          '',
          '- 並べた子の 1 つずつが、押して選べる 1 つになります。`img`（Next.js の `Image` も）を並べ、`alt` を書きます。`alt` が読み上げでの名前になります。',
          '- `Carousel` の `thumbnails` に渡すと、Carousel のいまの 1 枚とつながります。`value` などを書く必要はありません。',
          '- ほかの部品と組むときは、`value`・`onValueChange` で選んでいる番号（0 から数えます）と切り替えを受け取ります。',
          '- 選んでいる 1 つには、画像の下に棒を引きます。色は `color`（`neutral`・`primary`・`secondary`。既定は `neutral`）です。`indicator="underline-dim"` にすると、棒に加えて選んでいない画像を少し薄くします。',
          '- ←→ で選びながら移り、Home・End で最初と最後へ移ります。Tab で止まるのは選んでいる 1 つだけです。',
          '- 並びが入り切らないときは横にスクロールし、続きがある端に内側の影を落とします。',
        ].join('\n'),
      },
    },
  },
  args: {
    children: thumbs,
    color: 'neutral',
    indicator: 'underline',
    accessibleName: '画像を選ぶ',
  },
  argTypes: {
    children: { control: false },
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    indicator: {
      control: 'inline-radio',
      options: ['underline', 'underline-dim'],
      table: { defaultValue: { summary: "'underline'" } },
    },
  },
} satisfies Meta<typeof Thumbnails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  args: { onValueChange: fn() },
};

// 色 × 状態。hover・押下・フォーカスは 2 つ目（選んでいないもの）と 1 つ目（選んでいるもの）に当てる
export const States: Story = {
  tags: ['visual'],
  name: '色・印と状態',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({
      hover: '[data-slot="thumbnails-item"]:nth-child(-n+2)',
      active: '[data-slot="thumbnails-item"]:nth-child(-n+2)',
      focusVisible: '[data-slot="thumbnails-item"]:first-child',
    }),
  },
  render: () => (
    <Matrix
      rows={stateRows}
      columns={stateColumns}
      columnWidth="13rem"
      rowLabel={(row) => (row.indicator === 'underline' ? row.color : row.indicator)}
      renderCell={(row) => (
        <Thumbnails color={row.color} indicator={row.indicator} className="w-52">
          {thumbs.slice(0, 2)}
        </Thumbnails>
      )}
    />
  ),
};

// 並びが入り切らないとき。続きのある端に影を落とし、選んでいるものが見える位置まで送る
export const Overflow: Story = {
  tags: ['visual'],
  name: 'はみ出すとき',
  parameters: { controls: { disable: true } },
  render: () => (
    // 撮るときのポインタ（左上）が帯に載らないよう、上に余白を取る
    <div className="flex max-w-md flex-col gap-8 pt-8">
      <Thumbnails>
        {manyScreens.map((screen) => (
          <img key={screen.alt} src={screen.src} alt={screen.alt} />
        ))}
      </Thumbnails>
      <Thumbnails defaultValue={11}>
        {manyScreens.map((screen) => (
          <img key={screen.alt} src={screen.src} alt={screen.alt} />
        ))}
      </Thumbnails>
    </div>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { controls: { disable: true } },
  render: () => (
    <DensityPair>
      <Thumbnails defaultValue={1}>{thumbs}</Thumbnails>
    </DensityPair>
  ),
};

// Carousel の外で組む（Gallery など）。選んでいる番号と切り替えを value・onValueChange で受け取る
function WithFigureExample({ children }: { children?: ReactNode }) {
  const [value, setValue] = useState(0);
  return (
    <div className="flex max-w-xl flex-col gap-3">
      <Figure
        ratio={16 / 9}
        src={screens[value].src}
        alt={screens[value].alt}
        caption={screens[value].alt}
      />
      <Thumbnails value={value} onValueChange={setValue} accessibleName="表示する画面">
        {children}
      </Thumbnails>
    </div>
  );
}

export const WithFigure: Story = {
  name: '大きな 1 枚と組む',
  parameters: {
    controls: { disable: true },
    docs: {
      source: sourceCode(`
        const [value, setValue] = useState(0);

        <Figure ratio={16 / 9} src={screens[value].src} alt={screens[value].alt} />
        <Thumbnails value={value} onValueChange={setValue} accessibleName="表示する画面">
          {screens.map((screen) => (
            <img key={screen.src} src={screen.src} alt={screen.alt} />
          ))}
        </Thumbnails>
      `),
    },
  },
  render: () => <WithFigureExample>{thumbs}</WithFigureExample>,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('tab', { name: '作品の詳細' }));
    await waitFor(() =>
      expect(canvas.getByRole('tab', { name: '作品の詳細' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    );
    await waitFor(() =>
      expect(canvas.getByText('作品の詳細', { selector: 'figcaption' })).toBeVisible()
    );
  },
};

export const Keyboard: Story = {
  name: 'キーボード',
  args: { onValueChange: fn() },
  play: async ({ args, canvas }) => {
    const tabs = canvas.getAllByRole('tab');
    // Tab で止まるのは、選んでいる 1 つだけ
    await expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1, -1, -1]);
    tabs[0].focus();
    await waitFor(() => expect(tabs[0]).toHaveFocus());
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(tabs[1]).toHaveFocus());
    await waitFor(() => expect(tabs[1]).toHaveAttribute('aria-selected', 'true'));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(1);
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(tabs[4]).toHaveFocus());
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(tabs[4]).toHaveAttribute('aria-selected', 'true'));
    await userEvent.keyboard('{Home}');
    await waitFor(() => expect(args.onValueChange).toHaveBeenLastCalledWith(0));
  },
};

export const Accessibility: Story = {
  name: '読み上げ',
  play: async ({ canvas }) => {
    const list = canvas.getByRole('tablist', { name: '画像を選ぶ' });
    await expect(list).toBeVisible();
    // タブの名前は、中の画像の alt
    await expect(canvas.getByRole('tab', { name: 'トップページ' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    // Carousel と組まないときは、スライドを指さない
    await expect(canvas.getByRole('tab', { name: '作品の一覧' })).not.toHaveAttribute(
      'aria-controls'
    );
  },
};
