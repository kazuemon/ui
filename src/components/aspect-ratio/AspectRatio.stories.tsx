import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { AspectRatio } from './AspectRatio';
import { Heading } from '../heading/Heading';
import { Tag } from '../tag/Tag';
import { Text } from '../text/Text';
import { landscape, screenshot } from '../../../design/stories/samples/images';
import { labelClass } from '../../stories/story-states';

const meta = {
  title: 'Components/AspectRatio',
  component: AspectRatio,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '幅に合わせて、決まった比の高さを取る枠です。画像・動画・埋め込みの比をそろえます。',
          '',
          "- `ratio`（既定は `16 / 9`）: 幅に対する高さの比です。`4 / 3` のような数か、`'4 / 3'` の文字で書きます。",
          '- 中身は枠いっぱいに広げます。画像と動画は、はみ出た分を切ります。',
          '- 読み込む前から高さが決まるので、読み込んだときに下の内容が跳びません。',
          '- 角や輪郭は付けません。画像の見た目は Image と Figure が持ちます。',
        ].join('\n'),
      },
    },
  },
  args: { ratio: 16 / 9 },
  argTypes: { ratio: { control: 'number' } },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  render: (args) => (
    <AspectRatio {...args} className="max-w-md rounded-card">
      <img src={landscape} alt="空と山の絵" />
    </AspectRatio>
  ),
};

const cards = [
  { ratio: 16 / 9, label: '16 / 9', src: landscape, title: 'デザイン原則を書き直した' },
  { ratio: 4 / 3, label: '4 / 3', src: screenshot, title: '密度を入力方式で切り替える' },
  { ratio: 1, label: '1 / 1', src: landscape, title: '和欧併記の見出し' },
];

export const Ratios: Story = {
  tags: ['visual'],
  name: '比とカード',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid max-w-[48rem] grid-cols-3 items-start gap-6">
      {cards.map((card) => (
        <article key={card.label} className="flex flex-col gap-3">
          <p className={labelClass}>{card.label}</p>
          <AspectRatio ratio={card.ratio} className="rounded-card">
            <img src={card.src} alt="" />
          </AspectRatio>
          <Heading level={3} size={4}>
            {card.title}
          </Heading>
          <Text size="sm" tone="subtle">
            2026年9月18日
          </Text>
          <div className="flex gap-2">
            <Tag>Design</Tag>
          </div>
        </article>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const frames = canvasElement.querySelectorAll<HTMLElement>('[style*="aspect-ratio"]');
    const [wide, , square] = [...frames].map((el) => el.getBoundingClientRect());
    await expect(Math.round((wide.width / wide.height) * 100)).toBe(178);
    await expect(Math.round(square.width)).toBe(Math.round(square.height));
    await expect(within(canvasElement).getAllByRole('heading')).toHaveLength(3);
  },
};
