import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { expect } from 'storybook/test';

import { CaretRightIcon } from '../components/icons';
import { Link } from '../components/Link';
import { Gallery, Matrix, Specimen } from './story-parts';
import { pressColumns, statePseudo } from './story-states';

const appearances = ['text', 'outline'] as const;
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
          '- `appearance="text"`（既定）は、文章の中に置く文字のリンクです。大きさは周りの文字のままです。',
          '- `outline` は枠線の pill です。「More」や SNS のアカウント一覧のように、並べて置くリンクに使います。寸法は枠線のボタンと同じです。',
          '- 色は `color` で選びます。指定しないときはグレー（`neutral`）です。',
          '- `target="_blank"` のときは ↗ を付け、読み上げに「新しいタブで開きます」を足し、`rel="noopener noreferrer"` を付けます。',
          '- 押せる範囲を広くしたいときは、文字のリンクを広げずに、ボタンの見た目のリンク（`Button` の `render`）を使います。',
        ].join('\n'),
      },
    },
  },
  // Controls で既定の値を選んだ状態から始める（部品の既定と同じ値）
  args: {
    children: '使い方のページ',
    href: '#guide',
    appearance: 'text',
    color: 'neutral',
    contentAlign: 'center',
    target: '_self',
    disabled: false,
  },
  argTypes: {
    children: { control: 'text' },
    href: { control: 'text' },
    // 表の「Default」は、部品の引数の既定値からしか読まれない。既定値を持たない props はここで補う
    appearance: {
      control: 'inline-radio',
      options: appearances,
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
    controls: { exclude: ['appearance', 'color', 'contentAlign'] },
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
  name: '枠線のリンク',
  parameters: {
    controls: { exclude: ['appearance', 'color'] },
    docs: {
      description: {
        story: '最後にアイコンを置けます。hover と押下で文字の色を淡く敷き、押すと沈みます。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => (
        <Link key={color} {...args} appearance="outline" color={color}>
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
    controls: { exclude: ['appearance', 'contentAlign'] },
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
            <Link key={name} {...args} appearance="outline" contentAlign={align} className="w-full">
              {name}
              <CaretRightIcon />
            </Link>
          ))}
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const NewTab: Story = {
  name: '新しいタブで開く',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`target="_blank"` のときは ↗ が付きます。文字のリンクでは文字より少し小さく付け、下線を ↗ の右端まで続けます。枠線のリンクでは、最後にアイコンを置いたときはそれを使い、なければ ↗ を付けます。',
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
        <Link appearance="outline" color="primary" href="https://example.com" target="_blank">
          GitHub
        </Link>
        <Link appearance="outline" href="https://example.com" target="_blank">
          Zenn
          <CaretRightIcon />
        </Link>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  name: '押せない',
  parameters: {
    controls: { exclude: ['appearance', 'disabled'] },
    docs: {
      description: {
        story:
          '`disabled` にすると `href` を外し、Tab では止まらず、押しても何もしません。読み上げでは「リンク、利用不可」になります。文字のリンクはただの文字と同じ見た目になり、枠線のリンクは押せない枠線のボタンと同じ見た目になります。',
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
        <Link {...args} appearance="outline" disabled>
          More
          <CaretRightIcon />
        </Link>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    for (const link of canvas.getAllByRole('link')) {
      await expect(link).not.toHaveAttribute('href');
      await expect(link).toHaveAttribute('aria-disabled', 'true');
    }
  },
};

export const States: Story = {
  name: '状態',
  parameters: {
    pseudo: statePseudo({ hover: 'a', active: 'a', focusVisible: 'a' }),
    controls: { exclude: ['appearance', 'color', 'disabled'] },
  },
  render: (args) => (
    <Matrix
      rows={appearances.flatMap((appearance) => colors.map((color) => ({ appearance, color })))}
      rowLabel={({ appearance, color }) => `${appearance} / ${color}`}
      columns={pressColumns}
      renderCell={({ appearance, color }, { disabled }) =>
        appearance === 'outline' ? (
          <Link {...args} appearance="outline" color={color} disabled={disabled}>
            More
            <CaretRightIcon />
          </Link>
        ) : (
          <Link {...args} appearance="text" color={color} disabled={disabled} />
        )
      }
    />
  ),
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
      <Link appearance="outline" render={<RouterLink to="#works" />}>
        More
        <CaretRightIcon />
      </Link>
    </div>
  ),
};
