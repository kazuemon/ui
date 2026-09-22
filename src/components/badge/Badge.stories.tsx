import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect } from 'storybook/test';

import { Badge, type BadgeProps } from './Badge';
import { Button } from '../button/Button';
import { Tag } from '../tag/Tag';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';

const userColors = ['primary', 'secondary', 'neutral'] as const;
const statusColors = ['info', 'success', 'warning', 'danger'] as const;
const colorGroups: { label: string; colors: readonly NonNullable<BadgeProps['color']>[] }[] = [
  { label: '利用者が選ぶ色', colors: userColors },
  { label: '状態の色', colors: statusColors },
];

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '数と小さな状態の点を出します。押せません。文字のラベル（分類や「公開中」などの状態）には `Tag` を使います。',
          '',
          '- `count` を渡すと数、渡さないと点になります。`max` を超える数は「99+」のように出します。',
          '- 点は色だけで意味を伝えないよう、隣に文字を置くか、`accessibleName` で読み上げの文を付けます。',
          '- `children` で相手を包むと、その右上の角に重ねます。重ねるときは Badge に `aria-hidden` を付け、相手の名前に数を含めます。',
          '- 重ねる相手が Avatar のような丸い形のときは `overlap="circular"` にします。Badge の中心を相手の円周上（右上 45°）に置き、円からはみ出しません。既定（`square`）は四角い相手向けです。',
          '- 文字の横やボタンの中に置くときは、`accessibleName` で数の意味を読み上げます。',
        ].join('\n'),
      },
      // Show code: 引数を使わない render も、Storybook が作るコード（dynamic）を出す。既定では story の定義がそのまま出る
      source: { type: 'dynamic' },
    },
  },
  // Controls で既定の値を選んだ状態から始める（部品の既定と同じ値）
  args: { count: 3, max: 99, color: 'neutral' },
  argTypes: {
    count: { control: 'number' },
    max: { control: 'number' },
    accessibleName: { control: 'text' },
    children: { control: false },
    // 表の「Default」は、部品の引数の既定値からしか読まれない。既定値を持たない props はここで補う
    color: {
      control: 'inline-radio',
      options: [...userColors, ...statusColors],
      table: { defaultValue: { summary: "'neutral'" } },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// 通知のベル（Phosphor の Bell）。アイコン単体なので Bold の線
const BellIcon = () => (
  <svg
    viewBox="0 0 256 256"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="size-(--spacing-icon) shrink-0"
    style={{ strokeWidth: 'var(--icon-stroke-standalone)' }}
  >
    <path d="M96,192a32,32,0,0,0,64,0" />
    <path d="M56,104a72,72,0,0,1,144,0c0,35.82,8.3,64.6,14.9,76A8,8,0,0,1,208,192H48a8,8,0,0,1-6.88-12C47.71,168.6,56,139.81,56,104Z" />
  </svg>
);

const Avatar = () => (
  <span className="grid size-(--spacing-control) place-items-center rounded-pill bg-neutral text-xs font-bold text-fg-muted">
    KZ
  </span>
);

// 点や数を並べる文字。部品にせずクラスで付ける。Show code に span とクラスが出る
const textClass =
  'inline-flex items-center gap-1.5 text-(length:--text-control) leading-(--leading-control) font-bold';

const Row = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-center gap-x-5 gap-y-4">{children}</div>
);

export const Playground: Story = {
  name: '基本',
};

export const Counts: Story = {
  name: '数',
  parameters: { controls: { include: ['color'] } },
  render: ({ color }) => (
    <Gallery>
      <Specimen label="1桁・2桁">
        <Row>
          <Badge count={3} color={color} />
          <Badge count={12} color={color} />
        </Row>
      </Specimen>
      <Specimen label="max を超える数">
        <Row>
          <Badge count={120} color={color} />
          <Badge count={12} max={9} color={color} />
        </Row>
      </Specimen>
    </Gallery>
  ),
};

// Show code: render の JSX をそのまま出す（dynamic。meta の source.type）
export const Dots: Story = {
  tags: ['visual'],
  name: '点',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: '点は隣に文字を置いて、色だけで意味を伝えないようにします。',
      },
    },
  },
  render: () => (
    <Row>
      <span className={textClass}>
        <Badge color="success" />
        稼働中
      </span>
      <span className={textClass}>
        <Badge color="warning" />
        要確認
      </span>
      <span className={textClass}>
        <Badge color="danger" />
        停止中
      </span>
      <span className={textClass}>
        <Badge />
        下書き
      </span>
    </Row>
  ),
};

// Show code: 色の一覧の枠が長く出るので、代表の使い方を source.code に手で書く
export const Colors: Story = {
  tags: ['visual'],
  name: '色',
  parameters: {
    controls: { disable: true },
    docs: {
      source: sourceCode(`
        {/* 利用者が選ぶ色: primary・secondary・neutral（既定） / 状態の色: info・success・warning・danger */}
        <Badge count={3} color="primary" />
        <Badge count={120} color="danger" />
        <Badge color="success" />
      `),
    },
  },
  render: () => (
    <Gallery>
      {colorGroups.map(({ label, colors }) => (
        <Specimen key={label} label={label}>
          <div className="grid grid-cols-[auto_repeat(3,auto)] items-center justify-start gap-x-3 gap-y-2.5">
            {colors.map((color) => (
              <div key={color} className="col-span-full grid grid-cols-subgrid items-center">
                <span className="text-xs text-fg-subtle">{color}</span>
                <Badge count={3} color={color} />
                <Badge count={120} color={color} />
                <Badge color={color} />
              </div>
            ))}
          </div>
        </Specimen>
      ))}
    </Gallery>
  ),
};

// Show code: render の JSX をそのまま出す（dynamic。meta の source.type）
export const Overlay: Story = {
  name: '重ねる',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`children` で相手を包むと、その右上の角に重ねます。Badge には `aria-hidden` を付けて読ませず、相手の名前（`aria-label`）に数を含めます。',
      },
    },
  },
  render: () => (
    <Row>
      <Badge count={3} color="danger" aria-hidden="true">
        <Button
          variant="outline"
          aria-label="通知（未読 3 件）"
          className="w-(--spacing-control) px-0"
        >
          <BellIcon />
        </Button>
      </Badge>
      <Badge count={120} color="danger" aria-hidden="true">
        <Button
          variant="outline"
          aria-label="通知（未読 120 件）"
          className="w-(--spacing-control) px-0"
        >
          <BellIcon />
        </Button>
      </Badge>
      <Badge color="danger" aria-hidden="true">
        <Button
          variant="outline"
          aria-label="通知（未読あり）"
          className="w-(--spacing-control) px-0"
        >
          <BellIcon />
        </Button>
      </Badge>
      <Badge color="success" overlap="circular" aria-hidden="true">
        <Avatar />
      </Badge>
    </Row>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: '通知（未読 3 件）' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: '通知（未読 120 件）' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: '通知（未読あり）' })).toBeVisible();
  },
};

export const OverlapShape: Story = {
  tags: ['visual'],
  name: '重ねる相手の形',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`overlap` は重ねる相手の形です。`square`（既定）は角から内側に置くので、丸い相手（Avatar）では円の外に浮きます。`circular` は中心を円周上（右上 45°）に置きます。',
      },
    },
  },
  render: () => (
    <Row>
      <Specimen label="square（既定）">
        <Badge count={3} color="danger" aria-hidden="true">
          <Avatar />
        </Badge>
      </Specimen>
      <Specimen label="circular">
        <Badge count={3} color="danger" overlap="circular" aria-hidden="true">
          <Avatar />
        </Badge>
      </Specimen>
    </Row>
  ),
};

// Show code: accessibleName の関数が () => {} に省かれるので、写して使えるコードを source.code に手で書く
export const Label: Story = {
  name: '文字の横（accessibleName）',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '文字の横やボタンの中に置くときは、`accessibleName` で読み上げの文を渡します。見えている数字の代わりに、この文を読み上げます。数を受け取って文を返す関数も渡せます。',
      },
      source: sourceCode(`
        {/* ボタンの中 */}
        <Button variant="outline">
          受信箱
          <Badge count={3} color="danger" accessibleName={(count) => \`（未読 \${count} 件）\`} />
        </Button>
        <Button variant="outline">
          アップデート
          <Badge color="primary" accessibleName="（新しい版があります）" />
        </Button>
        {/* 文字の横 */}
        <span className="${textClass}">
          レビュー待ち
          <Badge count={128} color="primary" accessibleName={(count) => \`（\${count} 件）\`} />
        </span>
      `),
    },
  },
  render: () => (
    <Gallery>
      <Specimen label="ボタンの中">
        <Row>
          <Button variant="outline">
            受信箱
            <Badge count={3} color="danger" accessibleName={(count) => `（未読 ${count} 件）`} />
          </Button>
          <Button variant="outline">
            アップデート
            <Badge color="primary" accessibleName="（新しい版があります）" />
          </Button>
        </Row>
      </Specimen>
      <Specimen label="文字の横">
        <Row>
          <span className={textClass}>
            レビュー待ち
            <Badge count={128} color="primary" accessibleName={(count) => `（${count} 件）`} />
          </span>
          <Tag color="success">公開中</Tag>
        </Row>
      </Specimen>
    </Gallery>
  ),
  play: async ({ canvas }) => {
    // 見えている数字（3・99+）は読まず、label の文を読む。関数には max で丸める前の数が渡る
    // Badge は inline-flex なので、名前ではボタンの文字との間に空白が入る
    await expect(canvas.getByRole('button', { name: '受信箱 （未読 3 件）' })).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'アップデート （新しい版があります）' })
    ).toBeVisible();
    await expect(canvas.getByText('99+')).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.getByText('（128 件）')).toHaveClass('sr-only');
  },
};

// Show code: render の JSX をそのまま出す（dynamic。meta の source.type）
export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Badge の大きさは密度で変えません。数の文字だけ、入力方式に合わせて切り替わります。',
      },
    },
  },
  render: () => (
    <DensityPair>
      <Row>
        <Badge count={3} color="danger" aria-hidden="true">
          <Button
            variant="outline"
            aria-label="通知（未読 3 件）"
            className="w-(--spacing-control) px-0"
          >
            <BellIcon />
          </Button>
        </Badge>
        <Badge count={12} color="danger" />
        <span className={textClass}>
          <Badge color="success" />
          稼働中
        </span>
      </Row>
    </DensityPair>
  ),
};
