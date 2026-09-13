import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
// 引数の userEvent は、LAN の IP で開いたとき（clipboard のない環境）は空になり、click などが呼べない
import { expect, fn, userEvent } from 'storybook/test';

import { Button, type ButtonProps } from '../components/Button';
import { CheckIcon } from '../components/icons';
import type { LoadingIndicator } from '../components/Loading';
import { DensityPair, Matrix } from './story-parts';
import { pressColumns, statePseudo } from './story-states';

const appearances = ['filled', 'outline'] as const;
const colors = ['primary', 'secondary', 'danger', 'neutral', 'white'] as const;
const indicators: LoadingIndicator[] = ['spinner', 'bar'];
// 送信中の形。回る円は、ラベルに重ねる（既定）か、inlineSpinner でラベルの左に置く
const looks = [
  { label: 'spinner', loadingIndicator: 'spinner', inlineSpinner: false },
  { label: 'spinner + inlineSpinner', loadingIndicator: 'spinner', inlineSpinner: true },
  { label: 'bar', loadingIndicator: 'bar', inlineSpinner: false },
] as const;
const colorColumns = colors.map((color) => ({ label: color, color }));

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '押して操作を実行するボタンです。',
          '',
          '- 画面の中で最も進めたい操作を `appearance="filled"`（塗り）にし、それ以外は `outline`（枠線）にします。',
          '- 色は `color` で選びます。`primary` は進めたい操作、`secondary` は用途を限らない色、`danger` は削除などの危険な操作に使います。`white` は白いボタンで、お知らせの操作のように色の付いた面の上にも置けます。指定しないときはグレー（`neutral`）です。',
          '- 送信中は `loading` を付けます。押せないボタンと同じ見た目になり、押しても `onClick` を呼びません。`disabled` と違い、フォーカスは外れません。',
          '- `render` に `<a href>` やルーターのリンクを渡すと、同じ見た目のリンクになります（「リンクとして使う」）。',
        ].join('\n'),
      },
    },
  },
  // Controls で既定の値を選んだ状態から始める（部品の既定と同じ値）
  args: {
    children: '保存する',
    appearance: 'filled',
    color: 'neutral',
    disabled: false,
    loading: false,
    loadingIndicator: 'spinner',
    inlineSpinner: false,
    type: 'button',
    onClick: fn(),
  },
  argTypes: {
    children: { control: 'text' },
    // props がリンクとの union なので、表の「Default」が読み取られない。ここで補う
    appearance: {
      control: 'inline-radio',
      options: appearances,
      table: { defaultValue: { summary: "'filled'" } },
    },
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    loadingIndicator: {
      control: 'inline-radio',
      options: indicators,
      table: { defaultValue: { summary: "'spinner'" } },
    },
    inlineSpinner: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    type: {
      control: 'inline-radio',
      options: ['button', 'submit', 'reset'],
      table: { defaultValue: { summary: "'button'" } },
    },
    render: { control: false },
  },
} satisfies Meta<ButtonProps>;

export default meta;
// component から引数の型を取ると、リンクの props との union になる。ストーリーはボタンの props で書く
type Story = StoryObj<Meta<ButtonProps>>;

export const Playground: Story = {
  name: '基本',
};

export const Colors: Story = {
  name: '色と見た目',
  parameters: {
    controls: { exclude: ['appearance', 'color'] },
    docs: {
      description: {
        story:
          '行が見た目（`appearance`）、列が色（`color`）です。枠線の `white` は `neutral` と同じ見た目です。右のパネルで `disabled`・`loading` を変えると、すべてに効きます。',
      },
    },
  },
  render: (args) => (
    <Matrix
      rows={appearances}
      rowLabel={(appearance) => appearance}
      columns={colorColumns}
      renderCell={(appearance, { color }) => (
        <Button {...args} appearance={appearance} color={color} />
      )}
    />
  ),
};

export const States: Story = {
  name: '状態',
  parameters: {
    pseudo: statePseudo({ hover: 'button', active: 'button', focusVisible: 'button' }),
    controls: { exclude: ['appearance', 'color', 'disabled'] },
    docs: {
      description: {
        story:
          '塗りのボタンは hover で影が輪郭だけになり、押すと沈みます。枠線のボタンは hover と押下で文字の色を淡く敷きます。フォーカスの線はキーボードで操作したときだけ出ます。',
      },
    },
  },
  render: (args) => (
    <Matrix
      rows={appearances.flatMap((appearance) => colors.map((color) => ({ appearance, color })))}
      rowLabel={({ appearance, color }) => `${appearance} / ${color}`}
      columns={pressColumns}
      renderCell={({ appearance, color }, { disabled }) => (
        <Button {...args} appearance={appearance} color={color} disabled={disabled} />
      )}
    />
  ),
};

export const Loading: Story = {
  name: '送信中',
  args: { children: '送信する', loading: true },
  parameters: {
    controls: { exclude: ['color', 'loadingIndicator', 'inlineSpinner'] },
    docs: {
      description: {
        story:
          '行が送信中の印、列が色です。`loadingIndicator="spinner"`（既定）はラベルを薄くして回る円を重ね、`inlineSpinner` を付けるとラベルの左に回る円を置きます。`bar` は下端に流れる線です（`inlineSpinner` は使いません）。印そのものは薄くしません。',
      },
    },
  },
  render: (args) => (
    <Matrix
      rows={looks}
      rowLabel={(look) => look.label}
      columns={colorColumns}
      renderCell={(look, { color }) => (
        <Button
          {...args}
          color={color}
          loadingIndicator={look.loadingIndicator}
          inlineSpinner={look.inlineSpinner}
        />
      )}
    />
  ),
  play: async ({ args, canvas }) => {
    // 送信中のボタンは押しても onClick を呼ばない
    await userEvent.click(canvas.getAllByRole('button')[0]);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const WithIcon: Story = {
  name: 'アイコン付き',
  parameters: {
    docs: {
      description: {
        story:
          'アイコンはラベルの前に置きます。アイコンの大きさとラベルとの間は、部品がそろえます。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      <Button {...args} color="primary">
        <CheckIcon />
        完了にする
      </Button>
      <Button {...args} appearance="outline">
        <CheckIcon />
        完了にする
      </Button>
    </div>
  ),
};

export const AsLink: Story = {
  name: 'リンクとして使う',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: [
          '`render` に `<a href>` やルーターのリンク（Next.js の `Link` など）を渡すと、ボタンの見た目のリンクになります。`href`・`target` は渡す要素に書き、ラベルは `children` に書きます。',
          '',
          '- 最後に右上向きの矢印（↗）が付き、ボタンと見分けられます。自分で `ArrowUpRightIcon` を最後に置いたときは足しません。',
          '- `target="_blank"` のときは、読み上げに「新しいタブで開きます」を足し、`rel="noopener noreferrer"` を付けます。',
          '- `disabled` にすると押せないリンクになります。Tab では止まらず、押しても何もしません。',
          '- リンクは送信中を持たないので、`loading` は渡せません。',
        ].join('\n'),
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button color="primary" render={<a href="#works" />}>
        作品を見る
      </Button>
      <Button appearance="outline" render={<a href="https://example.com" target="_blank" />}>
        外部のサイト
      </Button>
      <Button render={<a href="#works" />} disabled>
        作品を見る
      </Button>
    </div>
  ),
};

export const Densities: Story = {
  name: '密度',
  parameters: {
    docs: {
      description: {
        story:
          '寸法は入力方式で切り替わり、マウスでは小さく、指では大きくなります。`data-density="fine"`・`"coarse"` を付けた要素の中は、その密度に固定されます。ツールバーの「密度」でも切り替えられます。',
      },
    },
  },
  render: (args) => (
    <DensityPair>
      <div className="flex flex-wrap gap-3">
        <Button {...args} color="primary" />
        <Button {...args} appearance="outline" />
        <Button {...args} />
      </div>
    </DensityPair>
  ),
};
