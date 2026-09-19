import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { Progress } from './Progress';
import { ReadingScene } from './reading-scene';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';

const colors = ['primary', 'secondary', 'neutral'] as const;
const sizes = ['xs', 'sm', 'md', 'lg'] as const;
const animations = ['sweep', 'shuttle', 'stripes'] as const;

const meta = {
  title: 'Components/Progress',
  component: Progress,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '処理の進み具合を、バーで示します。アップロードや、手順の進み、記事の読了に使います。押せません。',
          '決まった範囲の中の量（スキルの習熟度、ストレージの使用量）には Meter を使います。',
          '',
          '- `value` を `min`〜`max`（既定は 0〜100）の中で渡します。値の文字はラベルの行の右端に出ます。`showValue={false}` で隠せます。',
          '- どれだけかかるか分からないときは `value={null}` にします。地の上で塗りの色が動き続けます。値の文字は出ません。',
          '- 動き方は `animation` で選びます。ふだんは `sweep`（短い区切りが左から右へ流れる。ボタンの送信中の線と同じ動き）です。長く待つ処理で止まっていないことをはっきり見せたいときは、`stripes`（幅いっぱいの縞が流れる）にします。`shuttle`（区切りが左右の端を往復する）も選べます。どれも、動きを減らす設定では、流さずに幅いっぱいでその場で明滅します。',
          '- 値の文字は、既定では割合（「45%」）です。`format` で数の整え方を、`getValueText` で文字そのもの（「3 / 12 ファイル」）を変えられます。読み上げも同じ文字になります。',
          '- `color` で塗りの色を選びます。指定しないときは濃いグレーです。進み具合に良し悪しはないので、値によって色は変わりません。',
          '- `size` でバーの太さを選びます。`md` が標準で、細い `sm`、太い `lg` と、記事の読了のバーのような線に近い `xs` があります。',
          '- `track={false}` で地（まだ進んでいない分のグレー）を消し、進んだ分だけの線にできます。',
          '- 端はふだん丸い形です。記事の上端に留める読了のバーのように画面の端に接する線では、`shape="square"` で端を丸めない形にします。',
          '- 終わる（`value` が `max`）と `data-complete` が付きます。見た目は変わりません。終わったことは、ラベルやキャプションの文で伝えます。',
          '- `label` を渡さないときは、`aria-label` で名前を付けます。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: '画像をアップロードしています',
    value: 45,
    color: 'neutral',
    size: 'md',
    track: true,
    showValue: true,
    animation: 'sweep',
    shape: 'round',
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    label: { control: 'text' },
    caption: { control: 'text' },
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    size: {
      control: 'inline-radio',
      options: sizes,
      table: { defaultValue: { summary: "'md'" } },
    },
    track: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    animation: {
      control: 'inline-radio',
      options: animations,
      table: { defaultValue: { summary: "'sweep'" } },
    },
    shape: {
      control: 'inline-radio',
      options: ['round', 'square'],
      table: { defaultValue: { summary: "'round'" } },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Indeterminate: Story = {
  name: '終わりが分からないとき',
  args: { value: null, label: '読み込んでいます', caption: 'しばらくお待ちください' },
};

const wide = [
  (Story: () => React.JSX.Element) => (
    <div className="w-[760px] max-w-none">
      <Story />
    </div>
  ),
];

export const Colors: Story = {
  tags: ['visual'],
  name: '色と値',
  decorators: wide,
  render: () => (
    <Gallery columnWidth="14rem">
      {colors.map((color) => (
        <Specimen key={color} label={color}>
          <div className="flex flex-col gap-5">
            {[0, 6, 45, 100].map((value) => (
              <Progress key={value} label="アップロード" value={value} color={color} />
            ))}
            <Progress label="読み込み" value={null} color={color} />
          </div>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Sizes: Story = {
  tags: ['visual'],
  name: '太さ',
  decorators: wide,
  render: () => (
    <Gallery columnWidth="14rem">
      {sizes.map((size) => (
        <Specimen key={size} label={size}>
          <div className="flex flex-col gap-5">
            {[6, 45, 100].map((value) => (
              <Progress
                key={value}
                label="アップロード"
                value={value}
                size={size}
                color="primary"
              />
            ))}
            <Progress label="読み込み" value={null} size={size} color="primary" />
          </div>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Animations: Story = {
  tags: ['visual'],
  name: '終わりが分からないときの動き',
  parameters: {
    docs: {
      description: {
        story:
          'ふだんは `sweep` を使います。止まっていないことをはっきり見せたいときは `stripes` にします。動きを減らす設定では、どれも幅いっぱいでその場で明滅します。',
      },
    },
  },
  decorators: wide,
  render: () => (
    <Gallery columnWidth="14rem">
      {animations.map((animation) => (
        <Specimen key={animation} label={animation}>
          <div className="flex flex-col gap-5">
            <Progress label="読み込み" value={null} animation={animation} />
            <Progress
              label="読み込み"
              value={null}
              animation={animation}
              color="primary"
              size="sm"
            />
            <Progress
              label="読み込み"
              value={null}
              animation={animation}
              color="secondary"
              size="lg"
            />
            <Progress
              aria-label="読み込み"
              value={null}
              animation={animation}
              color="primary"
              size="xs"
            />
          </div>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const WithoutTrack: Story = {
  tags: ['visual'],
  name: '地なし',
  decorators: wide,
  render: () => (
    <Gallery columnWidth="14rem">
      {(['xs', 'sm'] as const).map((size) => (
        <Specimen key={size} label={`${size}・track={false}`}>
          <div className="flex flex-col gap-5">
            {colors.map((color) => (
              <Progress
                key={color}
                aria-label={color}
                value={45}
                size={size}
                color={color}
                track={false}
                showValue={false}
              />
            ))}
          </div>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Parts: Story = {
  tags: ['visual'],
  name: 'ラベル・キャプション・値の文字',
  render: () => (
    <div className="flex flex-col gap-6">
      <Progress
        label="写真を送っています"
        value={3}
        max={12}
        getValueText={(_, value) => `${value} / 12 ファイル`}
        caption="送り終わるまで、この画面を閉じないでください"
      />
      <Progress label="終わりました" value={100} caption="12 ファイルを送りました" />
      <Progress label="値の文字なし" value={60} showValue={false} />
      <Progress aria-label="ラベルなし" value={30} caption="ラベルを出さないときは aria-label" />
    </div>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  decorators: wide,
  render: (args) => (
    <DensityPair>
      <div className="w-[320px]">
        <Progress {...args} caption="残り 2 分ほど" />
      </div>
    </DensityPair>
  ),
};

export const ReadingBar: Story = {
  name: '使い方: 記事の読了',
  parameters: {
    docs: {
      description: {
        story: [
          '記事の上端に、ラベルを持たない細い Progress を `Affix` で留めます。枠をスクロールすると伸びます。',
          '端から離さないよう `--affix-gap` を 0 にし、貼り付けた Navbar があるページでは `belowNavbar` でその下に留めます。',
          '画面の端に接する線なので、`shape="square"` で端を丸めません。太さは `size="sm"`（4px）で地を敷くのが基本です。もっと控えめにしたいときは、`size="xs"`（2px）や `track={false}`（読んだ分だけの線）にします。',
          '読んだ割合はスクロールの位置から分かることなので、読み上げからは外します（`aria-hidden`）。値が変わるたびに音で知らせる読み上げがあるためです。',
        ].join('\n'),
      },
      source: sourceCode(`
        function useReadingProgress() {
          const [frame, setFrame] = useState<HTMLElement | null>(null);
          const [value, setValue] = useState(0);
          useEffect(() => {
            if (!frame) return undefined;
            const update = () => {
              const range = frame.scrollHeight - frame.clientHeight;
              setValue(range > 0 ? (frame.scrollTop / range) * 100 : 100);
            };
            update();
            frame.addEventListener('scroll', update, { passive: true });
            return () => frame.removeEventListener('scroll', update);
          }, [frame]);
          return { setFrame, value };
        }

        const { setFrame, value } = useReadingProgress();

        <div ref={setFrame} className="h-[320px] overflow-y-auto">
          <Navbar sticky brand={brand}>…</Navbar>
          <Affix belowNavbar className="[--affix-gap:0px]">
            <Progress
              value={value}
              size="sm"
              shape="square"
              color="primary"
              showValue={false}
              aria-hidden
            />
          </Affix>
          <article>…</article>
        </div>
      `),
    },
  },
  decorators: wide,
  render: () => (
    <div className="flex flex-wrap gap-8">
      <Specimen label="Navbar なし">
        <ReadingScene width="w-[340px]" />
      </Specimen>
      <Specimen label="貼り付けた Navbar の下">
        <ReadingScene navbar width="w-[340px]" />
      </Specimen>
      <Specimen label='size="xs"・track={false}'>
        <ReadingScene size="xs" track={false} width="w-[340px]" />
      </Specimen>
    </div>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  render: () => (
    <div className="flex flex-col gap-6">
      <Progress label="アップロード" value={45} caption="残り 2 分ほど" />
      <Progress
        label="写真"
        value={3}
        max={12}
        getValueText={(_, value) => `${value} / 12 ファイル`}
      />
      <Progress label="読み込み" value={null} />
      <Progress label="完了" value={100} />
    </div>
  ),
  play: async ({ canvas }) => {
    const [upload, photos, loading, done] = canvas.getAllByRole('progressbar');
    // 名前はラベル、説明はキャプション
    await expect(upload).toHaveAccessibleName('アップロード');
    await expect(upload).toHaveAccessibleDescription('残り 2 分ほど');
    await expect(upload).toHaveAttribute('aria-valuenow', '45');
    await expect(upload).toHaveAttribute('aria-valuetext', '45%');
    // 見えている値の文字と、読み上げの文は同じ
    await expect(photos).toHaveAttribute('aria-valuetext', '3 / 12 ファイル');
    await expect(canvas.getByText('3 / 12 ファイル')).toBeVisible();
    // 終わりが分からないときは、値も値の文も付けない（英語の既定の文を出さない）
    await expect(loading).not.toHaveAttribute('aria-valuenow');
    await expect(loading).not.toHaveAttribute('aria-valuetext');
    await expect(loading).toHaveAttribute('data-indeterminate');
    // 終わったら data-complete
    await expect(done).toHaveAttribute('data-complete');
  },
};

export const ReadingBarScroll: Story = {
  name: '記事の読了（スクロールで伸びる）',
  tags: ['!autodocs'],
  decorators: wide,
  render: () => <ReadingScene width="w-[340px]" />,
  play: async ({ canvasElement }) => {
    const frame = canvasElement.querySelector<HTMLElement>('[data-slot="reading-scene"]')!;
    const bar = canvasElement.querySelector<HTMLElement>('[data-slot="progress"]')!;
    // 読み上げからは外す
    await expect(bar).toHaveAttribute('aria-hidden', 'true');
    await expect(bar).toHaveAttribute('aria-valuenow', '0');
    frame.scrollTop = frame.scrollHeight;
    await waitFor(() => expect(bar).toHaveAttribute('aria-valuenow', '100'));
    // 上端に留まっている
    const top = bar.getBoundingClientRect().top - frame.getBoundingClientRect().top;
    await expect(Math.abs(top)).toBeLessThan(2);
  },
};
