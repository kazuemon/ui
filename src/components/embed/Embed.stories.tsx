import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Embed, type EmbedProvider } from './Embed';
import { Blockquote } from '../blockquote/Blockquote';
import { Gallery, Specimen } from '../../stories/story-parts';

// 見本の iframe（外に取りに行かない）。読み込めたことが分かるよう、色付きの面を出すだけの HTML
const demo = (label: string, bg: string) =>
  `data:text/html;charset=utf-8,${encodeURIComponent(
    `<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:${bg};font:20px system-ui;color:#1c3a5e">${label}</body>`
  )}`;

const providers: EmbedProvider[] = ['youtube', 'vimeo', 'x', 'codepen', 'custom'];

const meta = {
  title: 'Components/Embed',
  component: Embed,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '記事に YouTube・X の投稿・CodePen などの外部コンテンツを iframe で埋めます。',
          '',
          '- 既定は最初から iframe を置き、ブラウザの `loading="lazy"`（既定値。上書きできます）で画面に近づいたときに読み込みます。クリックするまで待つときは `clickToLoad` を渡します。',
          '- `children` を渡すと、iframe が読み込めるまでのあいだ、その中身を出します。JS が動かなくても・Server Components でも読める、最初の描画に含まれる中身です。X の投稿の文面などを Blockquote で渡します。',
          '- `src` は各サービスの埋め込みコード・oEmbed から得た iframe の URL をそのまま渡します。id からの組み立ては行いません。',
          '- `provider` は既定の比率・アイコン・allow 属性を決めます（`youtube`・`vimeo` は 16:9、`x` は 4:5、`codepen` は 3:2、`custom` は 16:9）。`ratio` で上書きできます。',
          '- `title` は iframe の読み上げの名前になり、children を渡さないときは面にも文字で出します。',
          '- `caption` を渡すと、Figure と同じように下に中央寄せで出ます。',
        ].join('\n'),
      },
    },
  },
  args: {
    provider: 'youtube',
    src: demo('動画', '#cfeafc'),
    title: '空と山の紹介動画',
  },
  argTypes: {
    provider: { control: 'inline-radio', options: providers },
    src: { control: false },
    ratio: { control: 'inline-radio', options: [undefined, '16 / 9', '1', '4 / 5'] },
    clickToLoad: { control: 'boolean' },
    loadLabel: { control: 'text' },
    loadingText: { control: 'text' },
    caption: { control: 'text' },
  },
} satisfies Meta<typeof Embed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
};

// provider ごとの、クリックする前の面（clickToLoad）と、読み込んだあと
export const States: Story = {
  tags: ['visual'],
  name: 'provider と読み込み後',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="14rem">
      {providers.map((provider) => (
        <Specimen key={provider} label={provider}>
          <Embed
            provider={provider}
            clickToLoad
            src={demo(provider, '#cfeafc')}
            title={`${provider} の見本`}
          />
        </Specimen>
      ))}
      <Specimen label="読み込み後（既定）">
        <Embed
          provider="youtube"
          src={demo('読み込み済み', '#d7ead9')}
          title="読み込み済みの見本"
        />
      </Specimen>
    </Gallery>
  ),
  play: async ({ canvasElement }) => {
    const frames = [...canvasElement.querySelectorAll('[data-slot="embed"]')];
    await waitFor(() =>
      expect(frames.map((frame) => frame.getAttribute('data-status'))).toEqual([
        'idle',
        'idle',
        'idle',
        'idle',
        'idle',
        'loaded',
      ])
    );
  },
};

// X の投稿の文面を children で渡す形。JS が動かなくても・Server Components でも読める（idle・loading のあいだずっと出る）
export const WithChildren: Story = {
  tags: ['visual'],
  name: 'children（X の文面など）',
  parameters: { controls: { disable: true } },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
  render: () => (
    <Embed
      provider="x"
      clickToLoad
      src={demo('投稿', '#ffe1ea')}
      title="デザインの進捗についての投稿"
    >
      <Blockquote source="@kazuemon">
        Embed の軸が決まったので、tokens.css
        を直しています。押すまで読み込まれないと思われがちなので、既定は最初から読み込むようにしました。
      </Blockquote>
    </Embed>
  ),
};

export const WithCaption: Story = {
  tags: ['visual'],
  name: 'キャプション',
  parameters: { controls: { disable: true } },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
  render: () => (
    <Embed
      provider="codepen"
      src={demo('codepen', '#f5e9d0')}
      title="ボタンの見た目のデモ"
      caption="図 1. ボタンのホバーの見た目"
    />
  ),
};

// クリックで読み込む一連の流れ（clickToLoad）。data: URL なので、実際に外部へは通信しない
export const ClickToLoad: Story = {
  name: 'clickToLoad で読み込む',
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
  render: () => (
    <Embed
      provider="youtube"
      clickToLoad
      src={demo('読み込みました', '#d7ead9')}
      title="空と山の紹介動画"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvasElement.querySelector('[data-slot="embed"]')!;
    await expect(frame).toHaveAttribute('data-status', 'idle');
    await expect(canvasElement.querySelector('iframe')).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: /読み込む/ }));
    await waitFor(() => expect(frame).toHaveAttribute('data-status', 'loaded'));
    await expect(canvasElement.querySelector('iframe')).toHaveAttribute(
      'title',
      '空と山の紹介動画'
    );
  },
};

export const Accessibility: Story = {
  name: '読み上げ',
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
  render: () => (
    <Embed
      provider="x"
      clickToLoad
      src={demo('投稿', '#ffe1ea')}
      title="デザインの進捗についての投稿"
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    // クリック前は、面のボタンに文言と title が両方見え、名前として伝わる
    const button = canvas.getByRole('button', { name: /読み込む.*デザインの進捗についての投稿/ });
    await userEvent.click(button);
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-slot="embed"]')).toHaveAttribute(
        'data-status',
        'loaded'
      )
    );
    const iframe = canvas.getByTitle('デザインの進捗についての投稿');
    await expect(iframe.tagName).toBe('IFRAME');
  },
};
