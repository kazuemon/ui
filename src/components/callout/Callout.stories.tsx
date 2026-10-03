import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';

import { Callout } from './Callout';
import type { NoticeStatus, NoticeVariant } from '../notice/Notice';
import { Code } from '../code/Code';
import { DensityPair, Matrix } from '../../stories/story-parts';

// 状態を書かないとき（色を持たないグレー）は neutral として並べる
type CalloutSample = NoticeStatus | 'neutral';
const statuses: CalloutSample[] = ['info', 'success', 'warning', 'danger', 'neutral'];
const statusOf = (sample: CalloutSample) => (sample === 'neutral' ? undefined : sample);
const variants: NoticeVariant[] = ['soft', 'muted', 'outline', 'filled'];

const samples: Record<CalloutSample, { title: string; body: string }> = {
  info: { title: '補足', body: 'この部品は Base UI を土台にしています。' },
  success: { title: 'ヒント', body: 'data-density を付けると、密度を固定できます。' },
  warning: { title: '注意', body: 'Next.js 15 より前では、この設定は効きません。' },
  danger: { title: '破壊的な変更', body: 'v2 で size の値が変わりました。' },
  neutral: { title: 'メモ', body: 'タブレットとマウスでは、浮かぶ選択肢のままです。' },
};

const meta = {
  title: 'Components/Callout',
  component: Callout,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '記事の中の補足・注意・メモの囲みです。本文にはじめからある文に使います。',
          '',
          '- 見た目はお知らせ（`Notice`）と同じ決まりです。画面の上であとから出す知らせには `Notice` を使います。',
          '- 読み上げでは補足（`role="note"`）として扱い、題が囲みの名前になります。割り込んで読んだりはしません。閉じるボタンや操作は持ちません。',
          '- `status` は状態の色（`info`・`success`・`warning`・`danger`）です。書かないと、色を持たないグレーになります。',
          '- `variant` は、`soft`（既定、淡い面）・`muted`（グレーの面に小さな題）・`outline`（白い面に状態の色の枠線）・`filled`（濃い塗り）です。',
          '- アイコンは状態ごとに付きます（状態なしと `muted` ではなし）。`icon` にほかのアイコンを渡すと置き換わり、`icon={false}` で消えます。',
          '- 文字は本文と同じ大きさです。',
          '- `headingLevel` で題を見出し（h2〜h6）にできます。記事の目次に題を載せたいときに使います。',
          '- `collapsible` で題の行を押して中身を畳めます。はじめに開くかは `defaultOpen` です。閉じた中身も、ページ内検索で見つかると開きます。',
          '- `showDivider` を足すと、開いているときの題の行の下に細い線が入り、題と中身が分かれます（`collapsible` のときだけ）。',
        ].join('\n'),
      },
    },
  },
  args: {
    status: 'info',
    variant: 'soft',
    title: samples.info.title,
    children: samples.info.body,
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['info', 'success', 'warning', 'danger'] },
    variant: { control: 'inline-radio', options: variants },
    title: { control: 'text' },
    children: { control: 'text' },
    icon: { control: false },
  },
} satisfies Meta<typeof Callout>;

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
  tags: ['visual'],
  name: '色と見た目',
  parameters: { controls: { disable: true } },
  render: () => (
    <Matrix
      rows={statuses}
      rowLabel={(status) => status}
      columns={variants.map((variant) => ({ label: variant, variant }))}
      columnWidth="16rem"
      renderCell={(sample, { variant }) => (
        <Callout status={statusOf(sample)} variant={variant} title={samples[sample].title}>
          {samples[sample].body}
        </Callout>
      )}
    />
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度とアイコン',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '題なし、`icon={false}`、中にコードを置いた形です。記事の中（`data-reading`）では、指でも本文と同じ 16px です。',
      },
    },
  },
  render: () => (
    <DensityPair>
      <div data-reading className="flex w-[22rem] flex-col gap-3">
        <Callout status="warning">
          <Code>coarse-large</Code> は名前が変わるかもしれません。
        </Callout>
        <Callout status="info" icon={false} title="補足">
          アイコンなしで、題だけの形です。
        </Callout>
        <Callout variant="muted" status="warning" title="注意">
          グレーの面に小さな題の形です。
        </Callout>
      </div>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  play: async ({ canvas }) => {
    const note = canvas.getByRole('note', { name: '補足' });
    await expect(note).toHaveTextContent('この部品は Base UI を土台にしています。');
    // 読み上げで知らせる箱（status・alert）は持たない
    await expect(canvas.queryByRole('status')).toBeNull();
  },
};

export const Collapsible: Story = {
  name: '畳める囲みと見出し',
  parameters: { controls: { disable: true } },
  render: () => (
    <div data-reading className="flex max-w-xl flex-col gap-4">
      <Callout status="info" title="インストールの手順" collapsible headingLevel={3}>
        pnpm add @kazuemon/ui のあと、CSS を読み込みます。
      </Callout>
      <Callout status="warning" title="古い版から上げるとき" collapsible defaultOpen>
        v1 の size の値は v2 で変わりました。
      </Callout>
      <Callout title="見出しにした題" headingLevel={4}>
        畳めない囲みの題も、見出しにできます。
      </Callout>
    </div>
  ),
  play: async ({ canvas }) => {
    const first = canvas.getByRole('button', { name: 'インストールの手順' });
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    // 題は見出しの中のボタン
    await expect(
      canvas.getByRole('heading', { level: 3, name: 'インストールの手順' })
    ).toContainElement(first);
    await userEvent.click(first);
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(canvas.getByText(/pnpm add/)).toBeVisible());
    await expect(canvas.getByRole('button', { name: '古い版から上げるとき' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    await expect(canvas.getByRole('heading', { level: 4, name: '見出しにした題' })).toBeVisible();
    // 囲みの名前は題
    await expect(canvas.getAllByRole('note', { name: 'インストールの手順' })).toHaveLength(1);
  },
};

export const CollapsibleDivider: Story = {
  name: '畳める囲みの線',
  tags: ['visual'],
  parameters: { controls: { disable: true } },
  render: () => (
    <div data-reading className="flex max-w-xl flex-col gap-4">
      <Callout status="info" title="インストールの手順" collapsible showDivider defaultOpen>
        pnpm add @kazuemon/ui のあと、CSS を読み込みます。
      </Callout>
      <Callout status="warning" title="古い版から上げるとき" collapsible showDivider>
        v1 の size の値は v2 で変わりました。
      </Callout>
    </div>
  ),
};

export const TitleEdgeCases: Story = {
  name: '題の端の場合',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '題が空の文字のときは、`collapsible` を渡しても畳める形にせず、ふつうの囲みとして描きます。数の 0 は題として出します。',
      },
    },
  },
  render: () => (
    <div className="flex max-w-xl flex-col gap-4">
      <Callout title="" collapsible>
        題のない囲み
      </Callout>
      <Callout title={0} collapsible>
        0 件のとき
      </Callout>
    </div>
  ),
  play: async ({ canvas }) => {
    // 空の題では、名前のない開閉のボタンを作らない
    await expect(canvas.getAllByRole('button')).toHaveLength(1);
    await expect(canvas.getByRole('button', { name: '0' })).toBeInTheDocument();
    await expect(canvas.getByRole('note', { name: '0' })).toBeInTheDocument();
  },
};
