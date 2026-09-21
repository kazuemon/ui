import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { expect } from 'storybook/test';

import { CaretRightIcon, InfoIcon } from '../../internal/icons';
import { Link } from './Link';
import { Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { pressColumns, sourceCode, statePseudo } from '../../stories/story-states';

const variants = ['text', 'outline', 'button', 'underline'] as const;
const colors = ['primary', 'secondary', 'neutral'] as const;
const aligns = ['center', 'between', 'center-end'] as const;
const accounts = ['GitHub', 'Zenn', 'X（旧 Twitter）'];

// ルーターのリンク（Next.js の Link など）の代わり。href の代わりに to を受け取る
function RouterLink({ to, ...props }: ComponentProps<'a'> & { to: string }) {
  return <a href={to} {...props} />;
}

const meta = {
  title: 'Components/Link',
  component: Link,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '別のページや場所へ移るリンクです。',
          '',
          '- `variant="text"`（既定）は、文章の中に置く文字のリンクです。大きさは周りの文字のままです。',
          '- `outline` は枠線の pill です。「More」や SNS のアカウント一覧のように、並べて置くリンクに使います。寸法は枠線のボタンと同じです。',
          '- 色は `color` で選びます。指定しないときはグレー（`neutral`）です。',
          '- キーボードでは、リンクのまま Enter で移ります。Space では移りません（ボタンの見た目のときも同じです）。',
          '- `target="_blank"` のときは ↗ を付け、読み上げに「新しいタブで開きます」を足し、`rel="noopener noreferrer"` を付けます。',
          '- アイコンだけのリンク（`aria-label` を付け、子がアイコン 1 つだけ）は、部品の高さの正方形になります。形は `shape` で選び、枠線のリンクは丸（`circle`）、ボタンの見た目のリンクは正方形（`square`）が既定です。',
          '- `button` はボタンと同じ見た目（塗り）です。画面内で最も進めたい移動に使います。押せる範囲を広くしたいときも、文字のリンクを広げずにこれを使います。',
          '- `underline` は塗りも枠線もなく、文字に淡い下線だけが付く、いちばん軽い見た目です。操作がいくつも並ぶ場所（カードの右上、表の行末）に使います。',
          '- `button` と `underline` の見た目は Button と同じものを使うので、ボタンと並べてもずれません。ボタンと見分けられるよう、最後に ↗ が付きます。押せないときは、色を指定していても押せないグレーのボタンと同じ見た目です。',
        ].join('\n'),
      },
      // Show code: 引数を使わない render も、Storybook が作るコード（dynamic）を出す。既定では story の定義がそのまま出る
      source: { type: 'dynamic' },
    },
  },
  // Controls で既定の値を選んだ状態から始める（部品の既定と同じ値）
  args: {
    children: '使い方のページ',
    href: '#guide',
    variant: 'text',
    color: 'neutral',
    contentAlign: 'center',
    target: '_self',
    disabled: false,
  },
  argTypes: {
    children: { control: 'text' },
    href: { control: 'text' },
    // 表の「Default」は、部品の引数の既定値からしか読まれない。既定値を持たない props はここで補う
    variant: {
      control: 'inline-radio',
      options: variants,
      table: { defaultValue: { summary: "'text'" } },
    },
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    contentAlign: {
      control: 'inline-radio',
      options: aligns,
      table: { defaultValue: { summary: "'center'" } },
    },
    target: { control: 'inline-radio', options: ['_self', '_blank'] },
    disabled: { control: 'boolean' },
    render: { control: false },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const InText: Story = {
  name: '文章の中',
  parameters: {
    controls: { exclude: ['variant', 'color', 'contentAlign'] },
    docs: {
      description: {
        story:
          'ふだんは淡い下線で、hover で下線と文字が濃くなります。フォーカスの線は、前後の文字に少しかかるように文字の外側に出ます。',
      },
    },
  },
  render: (args) => (
    <div className="flex max-w-prose flex-col gap-3 text-fg">
      {colors.map((color) => (
        <p key={color} className="leading-7">
          くわしくは
          <Link {...args} color={color}>
            使い方のページ（{color}）
          </Link>
          をご覧ください。
        </p>
      ))}
    </div>
  ),
};

export const Outline: Story = {
  tags: ['visual'],
  name: '枠線のリンク',
  parameters: {
    controls: { exclude: ['variant', 'color'] },
    docs: {
      description: {
        story: '最後にアイコンを置けます。hover と押下で文字の色を淡く敷き、押すと沈みます。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => (
        <Link key={color} {...args} variant="outline" color={color}>
          More
          <CaretRightIcon />
        </Link>
      ))}
    </div>
  ),
};

export const ContentAlign: Story = {
  name: '幅いっぱいのときの寄せ方',
  parameters: {
    controls: { exclude: ['variant', 'contentAlign'] },
    docs: {
      description: {
        story: [
          '枠線のリンクを幅いっぱいに広げたとき、文字とアイコンをどう寄せるかを `contentAlign` で選びます。文字のリンクには効きません。',
          '',
          '- `center`（既定）: 文字とアイコンをまとめて中央に寄せます。',
          '- `between`: 文字を左、最後のアイコンを右端に置きます。並べて縦にそろえたいときに使います。',
          '- `center-end`: 文字を箱全体の中央、最後のアイコンを右端に置きます。1本をボタンのように中央に見せたいときに使います。',
          '',
          '`between`・`center-end` では、入りきらない文字を「…」で切ります。',
        ].join('\n'),
      },
    },
  },
  render: (args) => (
    <Gallery columnWidth="14rem">
      {aligns.map((align) => (
        <Specimen key={align} label={align}>
          {accounts.map((name) => (
            <Link key={name} {...args} variant="outline" contentAlign={align} className="w-full">
              {name}
              <CaretRightIcon />
            </Link>
          ))}
        </Specimen>
      ))}
    </Gallery>
  ),
};

// Show code: render の JSX をそのまま出す（dynamic。meta の source.type）
export const NewTab: Story = {
  name: '新しいタブで開く',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: [
          '`target="_blank"` のときは ↗ が付きます。文字のリンクでは文字より少し小さく付け、下線を ↗ の右端まで続けます。枠線のリンクでは、最後にアイコンを置いたときはそれを使い、なければ ↗ を付けます。',
          '',
          '読み上げでは、名前に「（新しいタブで開きます）」が入ります。',
          '',
          '- アイコンだけのリンクは、名前を `aria-label` で付けます（svg の title や見えない文字では付けません）。そのときは ↗ を足さず、名前の後ろに「（新しいタブで開きます）」を足します。',
          '- `aria-labelledby` で名前を付けたときも、並びの後ろに「（新しいタブで開きます）」を足します。',
        ].join('\n'),
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="leading-7 text-fg">
        ソースコードは
        <Link color="primary" href="https://example.com" target="_blank">
          リポジトリ
        </Link>
        にあります。
      </p>
      <div className="flex flex-wrap gap-3">
        <Link variant="outline" color="primary" href="https://example.com" target="_blank">
          GitHub
        </Link>
        <Link variant="outline" href="https://example.com" target="_blank">
          Zenn
          <CaretRightIcon />
        </Link>
        <Link variant="outline" aria-label="使い方" href="https://example.com" target="_blank">
          <InfoIcon />
        </Link>
      </div>
      <div className="flex flex-col items-start gap-2">
        <h3 id="new-tab-works-title" className="text-sm font-bold text-fg">
          作品の一覧
        </h3>
        <Link
          variant="outline"
          aria-labelledby="new-tab-works-title"
          href="https://example.com"
          target="_blank"
        >
          More
          <CaretRightIcon />
        </Link>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    // 名前を付けていないリンクは、中の読み上げだけの文が名前に入る
    // （名前の間の空白は、名前の計算のしかたで入ったり入らなかったりするので、どちらでもよい）
    await expect(
      canvas.getByRole('link', { name: /^リポジトリ\s?（新しいタブで開きます）$/ })
    ).toBeVisible();
    // aria-label は名前の後ろに足す。アイコンだけのリンクには ↗ を足さない
    const iconOnly = canvas.getByRole('link', { name: '使い方（新しいタブで開きます）' });
    await expect(iconOnly.querySelectorAll('svg')).toHaveLength(1);
    // aria-labelledby は並びの後ろに、読み上げだけの文を足す
    await expect(
      canvas.getByRole('link', { name: /^作品の一覧\s?（新しいタブで開きます）$/ })
    ).toBeVisible();
  },
};

// Show code: render の JSX をそのまま出す（dynamic。meta の source.type）
export const IconOnly: Story = {
  tags: ['visual'],
  name: 'アイコンだけのリンク',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: [
          '名前を `aria-label` で付け、子をアイコン 1 つだけにすると、アイコンだけのリンクになります。部品の高さの正方形で、左右の余白はアイコンだけのボタンと同じです。',
          '',
          '- 枠線のリンクの既定は丸（`shape="circle"`）です。リンクであることを形でも見分けられます。`shape="square"` で部品の角の正方形にできます。',
          '- ボタンの見た目のリンクと下線のリンクの既定は正方形（`shape="square"`）で、アイコンだけのボタンと同じです。`shape="circle"` で丸にできます。下線は文字にだけ引くので、下線のリンクをアイコンだけにすると、下線も枠線もない形になります。',
          '- アイコンだけのリンクには ↗ を付けません。`target="_blank"` のときは、名前の後ろに「（新しいタブで開きます）」が入ります。',
          '- アイコンは単体の太い線（`standalone`）で置きます。',
        ].join('\n'),
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Link variant="outline" color="primary" aria-label="使い方" href="#guide">
        <InfoIcon standalone />
      </Link>
      <Link variant="outline" shape="square" color="primary" aria-label="使い方" href="#guide">
        <InfoIcon standalone />
      </Link>
      <Link variant="outline" aria-label="使い方" href="#guide" disabled>
        <InfoIcon standalone />
      </Link>
      <Link variant="button" color="primary" aria-label="使い方" href="#guide">
        <InfoIcon standalone />
      </Link>
      <Link variant="button" shape="circle" color="primary" aria-label="使い方" href="#guide">
        <InfoIcon standalone />
      </Link>
      <Link variant="underline" color="primary" aria-label="使い方" href="#guide">
        <InfoIcon standalone />
      </Link>
    </div>
  ),
  play: async ({ canvas }) => {
    const links = canvas.getAllByRole('link', { name: '使い方' });
    await expect(links).toHaveLength(6);
    for (const link of links) {
      // 部品の高さの正方形（指用でも 54×44px の横長にならない）
      const box = link.getBoundingClientRect();
      await expect(Math.round(box.width)).toBe(Math.round(box.height));
      // アイコンは 1 つだけ（↗ を足さない）
      await expect(link.querySelectorAll('svg')).toHaveLength(1);
    }
  },
};

export const Disabled: Story = {
  name: '押せない',
  parameters: {
    controls: { exclude: ['variant', 'disabled'] },
    docs: {
      description: {
        story:
          '`disabled` にすると `href` を外し、Tab では止まらず、押しても何もしません。文字のリンクは、見た目も読み上げもただの文字になり、リンクとは読まれません。枠線のリンクは押せない枠線のボタンと同じ見た目になり、読み上げでは「リンク、利用不可」になります。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <p className="leading-7 text-fg">
        公開前のため、
        <Link {...args} disabled>
          作品のページ
        </Link>
        はまだ開けません。
      </p>
      <div className="flex flex-wrap gap-3">
        <Link {...args} variant="outline" disabled>
          More
          <CaretRightIcon />
        </Link>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    // 文字のリンクは、読み上げでもただの文字（href・role・aria-disabled なし）
    const text = canvas.getByText('作品のページ');
    await expect(text.tagName).toBe('A');
    for (const name of ['href', 'role', 'aria-disabled', 'tabindex'])
      await expect(text).not.toHaveAttribute(name);
    // 枠線のリンクは「リンク、利用不可」
    const links = canvas.getAllByRole('link');
    await expect(links).toHaveLength(1);
    await expect(links[0]).not.toHaveAttribute('href');
    await expect(links[0]).toHaveAttribute('aria-disabled', 'true');
  },
};

// Show code: 表（Matrix）の中身は出ないので、行ごとの使い方を source.code に手で書く
export const States: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: {
    pseudo: statePseudo({ hover: 'a', active: 'a', focusVisible: 'a' }),
    controls: { exclude: ['variant', 'color', 'disabled'] },
    docs: {
      source: sourceCode(`
        {/* hover・押下・フォーカスの見た目は部品が受け持つ */}
        <Link href="/guide" color="primary">
          使い方のページ
        </Link>
        <Link href="/works" variant="outline" color="primary">
          More
          <CaretRightIcon />
        </Link>
        <Link href="/guide" disabled>
          使い方のページ
        </Link>
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={variants.flatMap((variant) => colors.map((color) => ({ variant, color })))}
      rowLabel={({ variant, color }) => `${variant} / ${color}`}
      columns={pressColumns}
      renderCell={({ variant, color }, { disabled }) => {
        if (variant === 'outline')
          return (
            <Link {...args} variant="outline" color={color} disabled={disabled}>
              More
              <CaretRightIcon />
            </Link>
          );
        if (variant === 'button' || variant === 'underline')
          return (
            <Link {...args} variant={variant} color={color} disabled={disabled}>
              作品を見る
            </Link>
          );
        return <Link {...args} variant="text" color={color} disabled={disabled} />;
      }}
    />
  ),
};

// Show code: render の JSX をそのまま出す（dynamic。meta の source.type）
export const ButtonLook: Story = {
  tags: ['visual'],
  name: 'ボタンの見た目',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: [
          '`variant="button"` は、ボタンと同じ見た目（塗り）のリンクです。画面内で最も進めたい移動に使います。見た目は Button のものをそのまま使うので、ボタンと並べてもずれません。',
          '',
          '- 最後に右上向きの矢印（↗）が付き、ボタンと見分けられます。',
          '- `caption` で、リンクの下に補足を出せます（「外部のサイトに移動します」など）。読み上げではリンクの説明になります。',
          '- `target="_blank"` のときは、読み上げに「新しいタブで開きます」を足し、`rel="noopener noreferrer"` を付けます。',
          '- `disabled` のときは、色を指定していても押せないグレーのボタンと同じ見た目です（原則7）。Tab では止まらず、押しても何もしません。',
          '- リンクは送信中を持たないので、`loading` はありません。',
        ].join('\n'),
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-start gap-3">
      <Link variant="button" color="primary" href="#works">
        作品を見る
      </Link>
      <Link variant="button" color="secondary" href="#works">
        プロフィール
      </Link>
      <Link variant="button" href="#works">
        一覧に戻る
      </Link>
      <Link
        variant="button"
        color="primary"
        href="https://example.com"
        target="_blank"
        caption="外部のサイトに移動します"
      >
        くわしく見る
      </Link>
      <Link variant="button" color="primary" href="#works" disabled>
        作品を見る
      </Link>
    </div>
  ),
};

// Show code: render の JSX をそのまま出す（dynamic。meta の source.type）
export const UnderlineLook: Story = {
  name: '下線のリンク',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: [
          '`variant="underline"` は、塗りも枠線もなく、文字に淡い下線だけが付く、いちばん軽い見た目のリンクです。操作がいくつも並ぶ場所（カードの右上、表の行末）に使います。',
          '',
          '- 寸法・左右の余白・角丸は枠線のボタンと同じで、押せる範囲は部品の大きさのままです。hover では部品の大きさに淡い塗りが出ます。',
          '- 最後に右上向きの矢印（↗）が付き、同じ見た目のボタンと見分けられます。',
          '- 文章の中に置くリンクは、これではなく文字のリンク（`text`）を使います。',
        ].join('\n'),
      },
    },
  },
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-fg">2026 年の作品</h3>
        <div className="-me-(--spacing-control-x) flex shrink-0">
          <Link variant="underline" href="#works">
            一覧
          </Link>
          <Link variant="underline" color="primary" href="#works">
            くわしく
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link variant="underline" color="primary" href="https://example.com" target="_blank">
          外部のサイト
        </Link>
        <Link variant="underline" color="secondary" href="#works">
          プロフィール
        </Link>
        <Link variant="underline" href="#works" disabled>
          公開前
        </Link>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    // 下線のリンクにも ↗ が付き、同じ見た目のボタンと見分けられる
    const link = canvas.getByRole('link', { name: '一覧' });
    await expect(link.querySelectorAll('svg')).toHaveLength(1);
    await expect(getComputedStyle(link).textDecorationLine).toBe('underline');
    // 押せないリンクは、押せないグレーのボタンと同じで下線が外れる
    const off = canvas.getByRole('link', { name: '公開前' });
    await expect(off).toHaveAttribute('aria-disabled', 'true');
    await expect(getComputedStyle(off).textDecorationLine).toBe('none');
  },
};

export const RenderElement: Story = {
  name: 'ルーターのリンクを使う',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`render` に Next.js の `Link` などを渡すと、その要素に Link の見た目を重ねます。`href` などは渡す要素に書き（例: `render={<NextLink href="/works" />}`）、ラベルは `children` に書きます。',
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Link color="primary" render={<RouterLink to="#works" />}>
        作品の一覧
      </Link>
      <Link variant="outline" render={<RouterLink to="#works" />}>
        More
        <CaretRightIcon />
      </Link>
    </div>
  ),
};
