import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
// 引数の userEvent は、LAN の IP で開いたとき（clipboard のない環境）は空になり、click などが呼べない
import { expect, fn, userEvent } from 'storybook/test';

import { Button, type ButtonProps } from './Button';
import { Card, CardBody } from '../card/Card';
import { CheckIcon, CopyIcon, XIcon } from '../../internal/icons';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../table/Table';
import type { LoadingIndicator } from '../loading/Loading';
import { DensityPair, Matrix } from '../../stories/story-parts';
import { pressColumns, sourceCode, statePseudo } from '../../stories/story-states';

const variants = ['filled', 'outline', 'underline'] as const;
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
          '- 画面の中で最も進めたい操作を `variant="filled"`（塗り）にし、それ以外は `outline`（枠線）にします。いちばん軽く見せたい操作には `underline`（文字に下線だけ）を使います。',
          '- 色は `color` で選びます。`primary` は進めたい操作、`secondary` は用途を限らない色、`danger` は削除などの危険な操作に使います。`white` は白いボタンで、お知らせの操作のように色の付いた面の上にも置けます。指定しないときはグレー（`neutral`）です。',
          '- アイコンだけのボタンは `iconOnly` を付け、`aria-label` で読み上げの名前を必ず付けます。部品の高さの正方形になります。`shape="circle"` で丸にできます。',
          '- 送信中は `loading` を付けます。押せないボタンと同じ見た目になり、押しても `onClick` を呼びません。`disabled` と違い、フォーカスは外れません。',
          '- 別の場所へ移るものは、ボタンではなくリンクで作ります。ボタンと同じ見た目が要るときは `<Link variant="button">`、下線の見た目が要るときは `<Link variant="underline">` を使います（Components/Link）。',
        ].join('\n'),
      },
      // Show code: 引数を使わない render も、Storybook が作るコード（dynamic）を出す。既定では story の定義がそのまま出る
      source: { type: 'dynamic' },
    },
  },
  // Controls で既定の値を選んだ状態から始める（部品の既定と同じ値）
  args: {
    children: '保存する',
    variant: 'filled',
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
    // props がアイコンだけのボタンとの union なので、表の「Default」が読み取られない。ここで補う
    variant: {
      control: 'inline-radio',
      options: variants,
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
  },
} satisfies Meta<ButtonProps>;

export default meta;
// component から引数の型を取ると、アイコンだけのボタンの props との union になる。ストーリーはボタンの props で書く
type Story = StoryObj<Meta<ButtonProps>>;

export const Playground: Story = {
  name: '基本',
};

// Show code: 表（Matrix）の中身は出ないので、代表の使い方を source.code に手で書く
export const Colors: Story = {
  name: '色と見た目',
  tags: ['visual'],
  parameters: {
    controls: { exclude: ['variant', 'color'] },
    docs: {
      description: {
        story:
          '行が見た目（`variant`）、列が色（`color`）です。枠線と下線の `white` は `neutral` と同じ見た目です。下線の文字は枠線とまったく同じで、枠線がない分だけ軽く見えます。右のパネルで `disabled`・`loading` を変えると、すべてに効きます。',
      },
      source: sourceCode(`
        {/* variant: filled（既定）・outline・underline / color: primary・secondary・danger・neutral（既定）・white */}
        <Button color="primary">保存する</Button>
        <Button variant="outline">キャンセル</Button>
        <Button variant="outline" color="danger">削除する</Button>
        <Button variant="underline">編集する</Button>
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={variants}
      rowLabel={(variant) => variant}
      columns={colorColumns}
      renderCell={(variant, { color }) => <Button {...args} variant={variant} color={color} />}
    />
  ),
};

// Show code: 表（Matrix）の中身は出ないので、代表の使い方を source.code に手で書く
export const States: Story = {
  name: '状態',
  tags: ['visual'],
  parameters: {
    pseudo: statePseudo({ hover: 'button', active: 'button', focusVisible: 'button' }),
    controls: { exclude: ['variant', 'color', 'disabled'] },
    docs: {
      description: {
        story:
          '塗りのボタンは hover で影が輪郭だけになり、押すと沈みます。枠線と下線のボタンは hover と押下で文字の色を淡く敷きます。下線のボタンでは、この塗りが押せる広さを見せます（下線は hover で変わりません）。押せないときは下線が外れます。フォーカスの線はキーボードで操作したときだけ出ます。',
      },
      source: sourceCode(`
        {/* hover・押下・フォーカスの見た目は部品が受け持つ */}
        <Button color="primary">保存する</Button>
        <Button variant="outline" color="primary">保存する</Button>
        <Button variant="underline" color="primary">保存する</Button>
        <Button color="primary" disabled>
          保存する
        </Button>
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={variants.flatMap((variant) => colors.map((color) => ({ variant, color })))}
      rowLabel={({ variant, color }) => `${variant} / ${color}`}
      columns={pressColumns}
      renderCell={({ variant, color }, { disabled }) => (
        <Button {...args} variant={variant} color={color} disabled={disabled} />
      )}
    />
  ),
};

// Show code: 表（Matrix）の中身は出ないので、行ごとの使い方を source.code に手で書く
export const Loading: Story = {
  name: '送信中',
  tags: ['visual'],
  args: { children: '送信する', loading: true },
  parameters: {
    controls: { exclude: ['color', 'loadingIndicator', 'inlineSpinner'] },
    docs: {
      description: {
        story:
          '行が送信中の印、列が色です。`loadingIndicator="spinner"`（既定）はラベルを薄くして回る円を重ね、`inlineSpinner` を付けるとラベルの左に回る円を置きます。`bar` は下端に流れる線です（`inlineSpinner` は使いません）。印そのものは薄くしません。',
      },
      source: sourceCode(`
        <Button color="primary" loading>
          送信する
        </Button>
        <Button color="primary" loading inlineSpinner>
          送信する
        </Button>
        <Button color="primary" loading loadingIndicator="bar">
          送信する
        </Button>
      `),
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

export const Caption: Story = {
  name: 'キャプション',
  parameters: {
    controls: { exclude: ['color', 'loading', 'loadingIndicator', 'inlineSpinner'] },
    docs: {
      description: {
        story:
          '`caption` を渡すと、ボタンの下に小さく説明を出します。押せないときも薄くしません。読み上げでは、ボタンの説明になります。`className` はボタンとキャプションを包む要素に付くので、幅いっぱいにするときは `className="w-full"` を渡します。`ref` はボタンに付きます。',
      },
    },
  },
  render: (args) => (
    <div className="flex max-w-xs flex-col items-start gap-6">
      <Button {...args} color="danger" caption="削除すると元に戻せません">
        削除する
      </Button>
      <Button {...args} color="primary" className="w-full" caption="3日以内にお返事します">
        問い合わせる
      </Button>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: '削除する' })).toHaveAccessibleDescription(
      '削除すると元に戻せません'
    );
    // className="w-full" は包みに付き、ボタンは包みの幅いっぱいに伸びる
    const wide = canvas.getByRole('button', { name: '問い合わせる' });
    await expect(wide.parentElement).toHaveClass('w-full');
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
      <Button {...args} variant="outline">
        <CheckIcon />
        完了にする
      </Button>
    </div>
  ),
};

// Show code: render の JSX をそのまま出す（dynamic。meta の source.type）
export const Underline: Story = {
  name: '下線のボタン',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: [
          '`variant="underline"` は、塗りも枠線もなく、文字に淡い下線だけが付くボタンです。押すものの中でいちばん軽く、操作がいくつも並ぶ場所（カードの右上、表の行末）で使います。',
          '',
          '- 文字は枠線のボタンとまったく同じ（色・太さ・大きさ・字間）で、違いは枠線がないことと下線が付くことだけです。寸法・左右の余白・角丸も枠線のボタンと同じです。',
          '- 下線は文字にだけ引きます。アイコンには付かないので、アイコンだけのボタンは下線も枠線もない形になります。',
          '- 押せる範囲は部品の大きさのままです。hover では部品の大きさに淡い塗りが出て、押せる広さが分かります。',
          '- 移動するものは `<Link variant="underline">` を使います（Components/Link の「下線のリンク」）。',
        ].join('\n'),
      },
    },
  },
  render: () => (
    <div className="flex max-w-xl flex-col gap-6">
      {/* カードの右上の操作 */}
      <Card>
        <CardBody>
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-bold text-fg">2026 年の作品</h3>
              <p className="text-sm text-fg-muted">12 件</p>
            </div>
            <div className="-me-(--spacing-control-x) flex shrink-0">
              <Button variant="underline">編集</Button>
              <Button variant="underline" color="danger">
                削除
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
      {/* 表の行末の操作 */}
      <Table caption="公開中のページ">
        <TableHead>
          <TableRow>
            <TableHeader>ページ</TableHeader>
            <TableHeader>公開日</TableHeader>
            <TableHeader align="end">操作</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {[
            { title: 'はじめに', date: '2026-04-01' },
            { title: '使い方', date: '2026-05-12' },
            { title: 'よくある質問', date: '2026-06-30' },
          ].map((page) => (
            <TableRow key={page.title}>
              <TableCell>{page.title}</TableCell>
              <TableCell>{page.date}</TableCell>
              <TableCell align="end">
                <div className="-me-(--spacing-control-x) flex justify-end">
                  <Button variant="underline">編集</Button>
                  <Button variant="underline" color="danger">
                    削除
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
  play: async ({ canvas }) => {
    // 文字には下線が付き、枠線は付かない
    const [edit] = canvas.getAllByRole('button', { name: '編集' });
    const style = getComputedStyle(edit);
    await expect(style.textDecorationLine).toBe('underline');
    await expect(style.borderTopWidth).toBe('0px');
  },
};

// Show code: 表（Matrix）の中身は出ないので、代表の使い方を source.code に手で書く
export const IconOnly: Story = {
  name: 'アイコンだけ',
  tags: ['visual'],
  parameters: {
    pseudo: statePseudo({ hover: 'button', active: 'button', focusVisible: 'button' }),
    controls: { exclude: ['variant', 'color', 'disabled', 'children'] },
    docs: {
      description: {
        story:
          '`iconOnly` を付けると、部品の高さの正方形になります。各セルの左が `shape="square"`（既定。文字のボタンと同じ角）、右が `shape="circle"`（丸）です。文字がないので、`aria-label` で読み上げの名前を必ず付けます（付けないと型で止まります）。アイコンは単体の太い線（`standalone`）で置きます。下線（`underline`）は文字にだけ引くので、アイコンだけのときは下線も枠線もない形になり、hover の塗りで押せる広さが分かります。',
      },
      source: sourceCode(`
        <Button iconOnly variant="outline" aria-label="閉じる">
          <Icon icon={XIcon} standalone />
        </Button>
        <Button iconOnly shape="circle" variant="outline" aria-label="コピー">
          <Icon icon={CopyIcon} standalone />
        </Button>
      `),
    },
  },
  render: (args) => (
    <Matrix
      rows={variants.flatMap((variant) =>
        (['primary', 'neutral'] as const).map((color) => ({ variant, color }))
      )}
      rowLabel={({ variant, color }) => `${variant} / ${color}`}
      columns={pressColumns}
      columnWidth="5rem"
      renderCell={({ variant, color }, { disabled }) => (
        <div className="flex gap-3">
          <Button
            {...args}
            iconOnly
            aria-label="閉じる"
            variant={variant}
            color={color}
            disabled={disabled}
          >
            <XIcon standalone />
          </Button>
          <Button
            {...args}
            iconOnly
            shape="circle"
            aria-label="コピー"
            variant={variant}
            color={color}
            disabled={disabled}
          >
            <CopyIcon standalone />
          </Button>
        </div>
      )}
    />
  ),
  play: async ({ canvas }) => {
    // 名前は aria-label。幅と高さは同じ（正方形）
    const button = canvas.getAllByRole('button', { name: '閉じる' })[0];
    const { width, height } = button.getBoundingClientRect();
    await expect(width).toBe(height);
    // shape="circle" は丸
    const circle = canvas.getAllByRole('button', { name: 'コピー' })[0];
    await expect(circle).toHaveAttribute('data-icon-only', 'circle');
    await expect(getComputedStyle(circle).borderTopLeftRadius).not.toBe(
      getComputedStyle(button).borderTopLeftRadius
    );
  },
};

export const Densities: Story = {
  name: '密度',
  tags: ['visual'],
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
        <Button {...args} variant="outline" />
        <Button {...args} variant="underline" />
        <Button {...args} />
      </div>
    </DensityPair>
  ),
};
