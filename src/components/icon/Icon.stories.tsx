import {
  BellIcon,
  GearSixIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Button } from '../button/Button';
import { Heading } from '../heading/Heading';
import { Text } from '../text/Text';
import { Icon } from './Icon';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';

const sizes = ['text', 'control', 'sm', 'md', 'lg'] as const;

// 線で描く SVG（viewBox 24。Lucide などと同じ描き方）。太さは strokeWidth で渡す
const LucideStyleSearch = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const meta = {
  title: 'Components/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '持ち込んだアイコンを、部品の中の文字とそろえた大きさ・色・線の太さで描きます。',
          '',
          '- `icon` に、`className` を受け取って `<svg>` を描く部品を渡します。[Phosphor Icons](https://phosphoricons.com/)（`@phosphor-icons/react`）を基本にしていますが、Lucide・Heroicons・自前の部品も渡せます。',
          '- 部品ではなく SVG をそのまま使うときは、子に `<svg>` を 1 つ置きます。',
          '- 大きさの既定は `text` で、周りの文字の大きさに比例します（文字の 1.25 倍）。ボタン・リンク・見出し・文のどこに置いても文字に合います。周りの部品と同じ大きさ（入力方式で切り替わる）にそろえたいときは `control`、決まった大きさで置くときは `sm`・`md`・`lg` を使います。',
          '- 文字と並ぶときは細い線、アイコンだけで置くとき（アイコンだけのボタンなど）は `standalone` で太い線にします。Phosphor の形（viewBox が 256）は、Regular の形から Icon が太さをそろえるので、`weight` は渡しません。ほかのライブラリの太さは、そのライブラリの props（`strokeWidth` など）で渡します。',
          '- 色は周りの文字の色に従います。状態の色は `className`（`text-fg-danger` など）で付けます。',
          '- 既定では飾りとして読み上げから外します。アイコンだけで意味を伝えるときは `accessibleName` で名前を付けます。アイコンだけのボタンやリンクでは、`accessibleName` ではなく、ボタンやリンクに `aria-label` を付けます。',
        ].join('\n'),
      },
    },
  },
  args: { icon: MagnifyingGlassIcon, size: 'text', standalone: false },
  argTypes: {
    icon: { control: false },
    size: {
      control: 'inline-radio',
      options: sizes,
      table: { defaultValue: { summary: "'text'" } },
    },
    standalone: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    accessibleName: { control: 'text' },
  },
} satisfies Meta<typeof Icon<typeof MagnifyingGlassIcon>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Sizes: Story = {
  tags: ['visual'],
  name: '大きさ',
  parameters: {
    controls: { exclude: ['size'] },
    docs: {
      description: {
        story:
          '`text`（既定）は周りの文字に比例する大きさ、`control` は部品の中の文字と並ぶ大きさで、入力方式で変わります。`sm`・`md`・`lg` は入力方式で変わりません。',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-6 text-fg">
      <Gallery>
        {sizes.map((size) => (
          <Specimen key={size} label={size}>
            <Icon icon={GearSixIcon} size={size} />
          </Specimen>
        ))}
      </Gallery>
      <Heading level={3} size={2}>
        <Icon icon={BellIcon} /> お知らせの設定
      </Heading>
      <Text>
        右上の <Icon icon={GearSixIcon} /> から、通知の頻度を変えられます。
      </Text>
    </div>
  ),
};

export const InText: Story = {
  tags: ['visual'],
  name: '文の中',
  parameters: {
    controls: { exclude: ['size'] },
    docs: {
      description: {
        story:
          '見出しや段落の中に置くと、文の流れの中で文字の大きさに合います。アイコンの縦の中心が、漢字の枠の中心にそろいます。',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4 text-fg">
      {([1, 2, 3, 4] as const).map((level) => (
        <Heading key={level} level={2} size={level}>
          <Icon icon={BellIcon} /> 見出し {level} の Settings
        </Heading>
      ))}
      <Text>
        右上の <Icon icon={GearSixIcon} /> から、Settings の通知を変えられます。
      </Text>
      <Text size="sm" variant="muted">
        <Icon icon={BellIcon} /> 注記: 通知は 1 日に 1 回 (daily) 届きます。
      </Text>
    </div>
  ),
};

export const Weights: Story = {
  tags: ['visual'],
  name: '線の太さ',
  parameters: {
    docs: {
      description: {
        story:
          '文字と並ぶときは細い線、`standalone` を付けると太い線です。Phosphor の形は、`weight` を渡さなくても Icon が太さをそろえます。`weight` を渡したときは、その太さのまま描きます。',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-6 text-fg">
      <Gallery>
        <Specimen label="文字と並ぶ（既定）">
          <Icon icon={PencilSimpleIcon} size="lg" />
        </Specimen>
        <Specimen label="standalone">
          <Icon icon={PencilSimpleIcon} size="lg" standalone />
        </Specimen>
        <Specimen label='weight="bold"'>
          <Icon icon={PencilSimpleIcon} size="lg" weight="bold" />
        </Specimen>
        <Specimen label='weight="fill"'>
          <Icon icon={PencilSimpleIcon} size="lg" weight="fill" />
        </Specimen>
      </Gallery>
      <div className="flex flex-wrap items-center gap-3">
        <Button color="primary">
          <Icon icon={PencilSimpleIcon} />
          編集する
        </Button>
        <Button variant="outline" aria-label="削除" className="w-(--spacing-control) px-0">
          <Icon icon={TrashIcon} standalone />
        </Button>
      </div>
    </div>
  ),
};

export const Sources: Story = {
  name: 'ライブラリと SVG',
  parameters: {
    docs: {
      description: {
        story:
          '部品を `icon` に渡す形と、`<svg>` を子に置く形があります。どちらも大きさ・色・読み上げは同じです。線で描く SVG（viewBox 24）の太さは、その SVG の `strokeWidth` のままです。',
      },
    },
  },
  render: () => (
    <Gallery>
      <Specimen label="Phosphor">
        <Icon icon={MagnifyingGlassIcon} />
      </Specimen>
      <Specimen label="部品（Lucide など）">
        <Icon icon={LucideStyleSearch} />
      </Specimen>
      <Specimen label="子に置いた SVG">
        <Icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
        </Icon>
      </Specimen>
      <Specimen label="状態の色">
        <Icon icon={TrashIcon} className="text-fg-danger" />
      </Specimen>
    </Gallery>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  render: () => (
    <DensityPair>
      <div className="flex items-center gap-3 text-fg">
        <Icon icon={MagnifyingGlassIcon} size="control" />
        <Button variant="outline">
          <Icon icon={GearSixIcon} />
          設定
        </Button>
      </div>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  render: () => (
    <div className="flex items-center gap-3 text-fg">
      <Icon icon={BellIcon} data-testid="decorative" />
      <Icon icon={BellIcon} accessibleName="通知" />
      <Icon data-testid="raw">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8" />
        </svg>
      </Icon>
    </div>
  ),
  play: async ({ canvas }) => {
    // accessibleName を書かないと飾り（読み上げから外す）
    const decorative = canvas.getByTestId('decorative');
    await expect(decorative.tagName.toLowerCase()).toBe('svg');
    await expect(decorative).toHaveAttribute('aria-hidden', 'true');
    // accessibleName を書くと、画像として名前が付く
    await expect(canvas.getByRole('img', { name: '通知' })).toBeVisible();
    // 子に置いた SVG にも同じ扱い。包む要素は足さない
    const raw = canvas.getByTestId('raw');
    await expect(raw.tagName.toLowerCase()).toBe('svg');
    await expect(raw).toHaveAttribute('aria-hidden', 'true');
    await expect(raw).toHaveAttribute('data-slot', 'icon');
  },
};
