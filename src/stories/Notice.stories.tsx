import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
// 引数の userEvent は、LAN の IP で開いたとき（clipboard のない環境）は空になり、click などが呼べない
import { expect, fn, userEvent } from 'storybook/test';

import { Button } from '../components/Button';
import { Link } from '../components/Link';
import {
  Notice,
  type NoticeAppearance,
  type NoticeColor,
  type NoticeProps,
} from '../components/Notice';
import { Gallery, Matrix, Specimen } from './story-parts';

const colors: NoticeColor[] = ['info', 'success', 'warning', 'danger'];
const appearances: NoticeAppearance[] = ['soft', 'filled', 'outline'];

const samples: Record<NoticeColor, { title: string; body: string }> = {
  info: { title: 'メンテナンスのお知らせ', body: '9月20日 2:00〜4:00 は、サービスを使えません。' },
  success: { title: '保存しました', body: '変更は、すぐにプロフィールに反映されます。' },
  warning: {
    title: '保存していない変更があります',
    body: 'このページを離れると、変更が消えます。',
  },
  danger: {
    title: '保存できませんでした',
    body: '通信が切れた可能性があります。時間をおいて、もう一度お試しください。',
  },
};

const SampleActions = () => (
  <>
    <Button color="white">もう一度試す</Button>
    <Link href="#detail">くわしく見る</Link>
  </>
);

// ストーリーの中だけの引数。actions と onClose を、パネルのスイッチで付け外しする
type NoticeStoryArgs = NoticeProps & { showActions: boolean; closable: boolean };

const meta = {
  title: 'Components/Notice',
  component: Notice,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '情報・成功・警告・危険を知らせる帯です。お知らせそのものは押せず、押せるのは中の操作だけです。',
          '',
          '- `color` は状態の色（`info`・`success`・`warning`・`danger`）から選びます。利用者が選ぶ `primary`・`secondary`・`neutral` は持ちません。',
          '- 題・本文・操作は読み上げの箱に入ります。`info`・`success`・`warning` は `role="status"`（区切りを待って読む）、`danger` は `role="alert"`（割り込んで読む）です。',
          '- `appearance` は見た目です。`soft`（既定）は淡い面、`filled` は濃い塗り、`outline` は白い面に状態の色の枠線です。',
          '- 操作は `actions` に、白いボタン（`<Button color="white">`）か文字のリンク（`<Link>`）を置きます。リンクはお知らせの文字の色の太字になります。',
          '- `onClose` を渡すと、右上に閉じるボタン（×）が出ます。',
        ].join('\n'),
      },
    },
  },
  args: {
    color: 'info',
    appearance: 'soft',
    title: samples.info.title,
    children: samples.info.body,
    live: true,
    showActions: false,
    closable: false,
    onClose: fn(),
  },
  argTypes: {
    color: { control: 'inline-radio', options: colors },
    appearance: { control: 'inline-radio', options: appearances },
    title: { control: 'text' },
    children: { control: 'text' },
    live: { control: 'boolean' },
    showActions: {
      control: 'boolean',
      description: 'ストーリー用: 操作（`actions`）を置く',
      table: { category: 'ストーリー' },
    },
    closable: {
      control: 'boolean',
      description: 'ストーリー用: `onClose` を渡して × を出す',
      table: { category: 'ストーリー' },
    },
    actions: { control: false },
    onClose: { control: false },
  },
  render: ({ showActions, closable, onClose, ...args }) => (
    <Notice
      {...args}
      actions={showActions ? <SampleActions /> : undefined}
      onClose={closable ? onClose : undefined}
    />
  ),
} satisfies Meta<NoticeStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
};

export const ColorsAndAppearances: Story = {
  name: '色と見た目',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '行が色（`color`）、列が見た目（`appearance`）です。`filled` の警告だけは、黄色の塗りに濃い文字です。',
      },
    },
  },
  render: () => (
    <Matrix
      rows={colors}
      rowLabel={(color) => color}
      columns={appearances.map((appearance) => ({ label: appearance, appearance }))}
      columnWidth="20rem"
      renderCell={(color, { appearance }) => (
        <Notice
          color={color}
          appearance={appearance}
          title={samples[color].title}
          actions={<SampleActions />}
        >
          {samples[color].body}
        </Notice>
      )}
    />
  ),
};

export const WithClose: Story = {
  name: '操作と閉じるボタン',
  args: {
    color: 'danger',
    title: samples.danger.title,
    children: samples.danger.body,
    showActions: true,
    closable: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '× は読み上げの箱の外に置き、読み上げでは「閉じる」になります。閉じたあとに消すのは呼び出し側です。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '閉じる' }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const TextOnly: Story = {
  name: '題だけ・本文だけ',
  parameters: { controls: { include: ['appearance'] } },
  render: ({ appearance }) => (
    <Gallery columnWidth="20rem">
      <Specimen label="題だけ">
        <Notice color="success" appearance={appearance} title={samples.success.title} />
      </Specimen>
      <Specimen label="本文だけ">
        <Notice color="info" appearance={appearance}>
          {samples.info.body}
        </Notice>
      </Specimen>
    </Gallery>
  ),
};
