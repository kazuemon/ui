import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { Avatar, type AvatarProps } from './Avatar';
import { AvatarUserIcon } from './avatar-icons';
import { DensityPair, Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode } from '../../stories/story-states';

// 見本の画像（外に取りに行かない）
const svg = (body: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">${body}</svg>`)}`;
// 顔の代わりの絵（濃い色）
const photo = svg(
  '<rect width="160" height="160" fill="#7cc4f8"/><circle cx="80" cy="64" r="30" fill="#fff4cc"/><path d="M16 160c0-35 29-56 64-56s64 21 64 56Z" fill="#2f6b58"/>'
);
// 白っぽい絵（白地に溶ける。輪郭が要る見本）
const palePhoto = svg(
  '<rect width="160" height="160" fill="#fdfdfd"/><circle cx="80" cy="66" r="28" fill="#f4f6f7"/><path d="M20 160c0-33 27-53 60-53s60 20 60 53Z" fill="#f7f9fa"/>'
);
// 読み込めない画像（壊れたデータ）
const broken = 'data:image/png;base64,AAAA';

const sizes = ['sm', 'md', 'lg', 'xl'] as const;
const shapes = ['circle', 'square'] as const;
const colors = ['neutral', 'primary', 'secondary'] as const;
const fallbacks = ['initials', 'icon'] as const;

type SizeColumn = MatrixColumn & {
  shape: (typeof shapes)[number];
  kind: 'image' | 'initials';
};

const sizeColumns: SizeColumn[] = [
  { label: '画像（丸）', shape: 'circle', kind: 'image' },
  { label: '頭文字（丸）', shape: 'circle', kind: 'initials' },
  { label: '画像（四角）', shape: 'square', kind: 'image' },
  { label: '頭文字（四角）', shape: 'square', kind: 'initials' },
];

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '人やものの顔を出します。画像を 1:1 で出し、画像がないときや読み込めなかったときは、名前の頭文字を出します。押せません。',
          '',
          '- `src` と `alt` で画像を渡します。`alt` は読み上げの名前です。名前が周りの文字にも出ているときは、空文字にして二度読ませないようにします。',
          '- 頭文字や人のアイコンに切り替わったときも、読み上げには名前が届きます（頭文字とアイコンは飾りとして読み上げから外し、名前を見えない文字で置きます）。`alt` を書かないときは `name` が読み上げの名前になります。',
          '- `name` を渡すと、画像がないとき・読み込めないときに頭文字を出します。和文は 1 文字、欧文は語頭 2 文字までです（「かずえもん」→「か」、`Kazuya Miyamoto` → `KM`）。',
          '- `fallback` は、画像がないとき・読み込めないときに出すものです。`initials`（既定）は頭文字、`icon` は人のアイコンです。ほかのものを置くときは `children` に渡します。',
          '- `size` は大きさの段です（`sm`・`md`（既定）・`lg`・`xl`）。押すものではないので、入力方式では変わりません。',
          '- `shape` は形です。`circle`（既定）は丸、`square` は四角です。四角の角は大きさの段に従い、`sm`・`md` は部品と同じ角、`lg`・`xl` はカードと同じ角になります。',
          '- `color` は頭文字の色です。`neutral`（既定）はグレー、`primary`・`secondary` は淡い面に濃い文字です。名前から色を自動で決めることはしません。',
          '- 細い輪郭は既定で付きます。白っぽい画像が白地に溶けないようにするためです。`hideOutline` で消せます。',
        ].join('\n'),
      },
      source: { type: 'dynamic' },
    },
  },
  // Controls で既定の値を選んだ状態から始める（部品の既定と同じ値）
  args: {
    src: photo,
    alt: 'かずえもん',
    name: 'かずえもん',
    fallback: 'initials',
    size: 'md',
    shape: 'circle',
    color: 'neutral',
    hideOutline: false,
  },
  argTypes: {
    src: { control: 'text' },
    alt: { control: 'text' },
    name: { control: 'text' },
    children: { control: false },
    fallback: {
      control: 'inline-radio',
      options: fallbacks,
      table: { defaultValue: { summary: "'initials'" } },
    },
    // 表の「Default」は、部品の引数の既定値からしか読まれない。既定値を持たない props はここで補う
    size: {
      control: 'inline-radio',
      options: sizes,
      table: { defaultValue: { summary: "'md'" } },
    },
    shape: {
      control: 'inline-radio',
      options: shapes,
      table: { defaultValue: { summary: "'circle'" } },
    },
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    hideOutline: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

// 大きさ × 形の一覧。tags: ['visual'] を付けたストーリーは、見た目の基準画像とくらべる
export const Sizes: Story = {
  tags: ['visual'],
  name: '大きさと形',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '四角（`shape="square"`）の角は大きさの段に従います。`sm`・`md` は部品と同じ角、`lg`・`xl` はカードと同じ角です。',
      },
      source: sourceCode(`
        <Avatar size="lg" src={photo} alt="かずえもん" />
        <Avatar size="lg" name="かずえもん" />
        <Avatar size="lg" shape="square" src={photo} alt="かずえもん" />
      `),
    },
  },
  render: () => (
    <Matrix
      rows={sizes}
      columns={sizeColumns}
      columnWidth="5rem"
      rowLabel={(size) => size}
      renderCell={(size, column) =>
        column.kind === 'image' ? (
          <Avatar size={size} shape={column.shape} src={photo} alt="かずえもん" />
        ) : (
          <Avatar size={size} shape={column.shape} name="かずえもん" />
        )
      }
    />
  ),
};

export const Colors: Story = {
  tags: ['visual'],
  name: '色と頭文字',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '頭文字は、和文なら 1 文字、欧文なら語頭 2 文字までです。色は指定しないときグレーで、名前からは決まりません。',
      },
      source: sourceCode(`
        <Avatar size="lg" name="かずえもん" />
        <Avatar size="lg" name="Kazuya Miyamoto" color="primary" />
        <Avatar size="lg" color="secondary" fallback="icon" />
      `),
    },
  },
  render: () => (
    <Gallery columnWidth="14rem">
      {colors.map((color) => (
        <Specimen key={color} label={color}>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar size="lg" color={color} name="かずえもん" />
            <Avatar size="lg" color={color} name="宮本一也" />
            <Avatar size="lg" color={color} name="Kazuya Miyamoto" />
            <Avatar size="lg" color={color} fallback="icon" />
          </div>
        </Specimen>
      ))}
    </Gallery>
  ),
};

// 画像がないときに出すもの（fallback）の一覧
export const Fallbacks: Story = {
  tags: ['visual'],
  name: '画像がないとき',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '画像がないときは、`name` の頭文字（既定）か、人のアイコン（`fallback="icon"`）を出します。`name` がないときは、頭文字の代わりに面だけになります。ほかのものを置くときは `children` に渡します。',
      },
      source: sourceCode(`
        <Avatar size="lg" name="かずえもん" />
        <Avatar size="lg" name="かずえもん" fallback="icon" />
        <Avatar size="lg" />
      `),
    },
  },
  render: () => (
    <Gallery columnWidth="14rem">
      <Specimen label="頭文字（既定）">
        <div className="flex items-center gap-4">
          <Avatar size="lg" name="かずえもん" />
          <Avatar size="lg" name="Kazuya Miyamoto" />
        </div>
      </Specimen>
      <Specimen label="人のアイコン">
        <div className="flex items-center gap-4">
          <Avatar size="lg" name="かずえもん" fallback="icon" />
          <Avatar size="lg" name="かずえもん" fallback="icon" color="primary" />
        </div>
      </Specimen>
      <Specimen label="名前がないとき">
        <div className="flex items-center gap-4">
          <Avatar size="lg" />
          <Avatar size="lg" fallback="icon" />
        </div>
      </Specimen>
      <Specimen label="children で置きかえる">
        <Avatar size="lg" name="かずえもん">
          <AvatarUserIcon />
        </Avatar>
      </Specimen>
    </Gallery>
  ),
};

export const Fallback: Story = {
  tags: ['visual'],
  name: '画像の読み込み失敗',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '画像が読み込めなかったときは、画像がないときと同じものに切り替わります（頭文字か、人のアイコン）。名前がなく頭文字も作れないときは、面だけになります。',
      },
      source: sourceCode(`
        <Avatar size="lg" src={brokenUrl} alt="かずえもん" name="かずえもん" />
        <Avatar size="lg" src={brokenUrl} alt="かずえもん" fallback="icon" />
        <Avatar size="lg" src={brokenUrl} alt="かずえもん" />
      `),
    },
  },
  render: () => (
    <Gallery columnWidth="12rem">
      <Specimen label="名前あり（頭文字）">
        <Avatar size="lg" src={broken} alt="かずえもん" name="かずえもん" />
      </Specimen>
      <Specimen label="人のアイコン">
        <Avatar size="lg" src={broken} alt="かずえもん" fallback="icon" />
      </Specimen>
      <Specimen label="名前がないとき">
        <Avatar size="lg" src={broken} alt="かずえもん" />
      </Specimen>
      <Specimen label="白っぽい画像（輪郭あり・なし）">
        <div className="flex items-center gap-4">
          <Avatar size="lg" src={palePhoto} alt="かずえもん" />
          <Avatar size="lg" src={palePhoto} alt="かずえもん" hideOutline />
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Avatar は押すものではないので、大きさは入力方式で変わりません。',
      },
    },
  },
  render: () => (
    <DensityPair>
      <div className="flex items-center gap-4">
        <Avatar size="sm" src={photo} alt="かずえもん" />
        <Avatar size="md" name="かずえもん" />
        <Avatar size="lg" name="Kazuya Miyamoto" color="primary" />
        <Avatar size="xl" shape="square" src={photo} alt="かずえもん" />
      </div>
    </DensityPair>
  ),
};

// play: 読み上げの確かめ。userEvent は play の引数ではなく storybook/test から読む
export const Accessibility: Story = {
  name: '読み上げ',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '画像が読み込めたときは `alt` が名前になります。頭文字や人のアイコンに切り替わったときは、それを飾りとして読み上げから外し、同じ名前を見えない文字で読ませます。`alt=""` のときは何も読みません。',
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar src={photo} alt="かずえもん" name="かずえもん" />
      <Avatar name="Kazuya Miyamoto" />
      <Avatar name="宮本一也" fallback="icon" />
      <Avatar alt="" name="かずえもん" />
    </div>
  ),
  play: async ({ canvas }) => {
    // 画像は alt が名前になる
    await waitFor(async () => {
      await expect(canvas.getByRole('img', { name: 'かずえもん' })).toBeVisible();
    });
    // 頭文字に切り替わっても、名前は読み上げに届く（頭文字そのものは飾り）
    await expect(canvas.getByText('Kazuya Miyamoto')).toBeInTheDocument();
    await expect(canvas.getByText('KM').closest('[aria-hidden="true"]')).toBeInTheDocument();
    // 人のアイコンのときも同じ
    await expect(canvas.getByText('宮本一也')).toBeInTheDocument();
    // alt="" のときは、頭文字も名前も読み上げに出さない
    await expect(canvas.queryByText('かずえもん')).not.toBeInTheDocument();
  },
};

// Props の確かめ（頭文字の作り方）
export const Initials: Story = {
  name: '頭文字',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: '和文は 1 文字、欧文は語頭 2 文字までを出します。',
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {(
        ['かずえもん', '宮本一也', 'Kazuya Miyamoto', 'Kazuya'] satisfies AvatarProps['name'][]
      ).map((name) => (
        <Avatar key={name} size="lg" name={name} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('か')).toBeVisible();
    await expect(canvas.getByText('宮')).toBeVisible();
    await expect(canvas.getByText('KM')).toBeVisible();
    await expect(canvas.getByText('K')).toBeVisible();
  },
};
