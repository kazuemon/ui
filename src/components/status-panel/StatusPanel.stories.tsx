import {
  ArrowClockwiseIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
  WifiSlashIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { StatusPanel } from './StatusPanel';
import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';
import { Link } from '../link/Link';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';

// 状態を書かないとき（色を持たないグレー）は neutral として並べる
type StatusPanelSample = 'info' | 'success' | 'warning' | 'danger' | 'neutral';
const statuses: StatusPanelSample[] = ['info', 'success', 'warning', 'danger', 'neutral'];
const statusOf = (sample: StatusPanelSample) => (sample === 'neutral' ? undefined : sample);

const samples: Record<StatusPanelSample, { title: string; body: string }> = {
  info: {
    title: 'メンテナンスの予定があります',
    body: '9月20日 2:00〜4:00 は、一部の機能を使えません。',
  },
  success: { title: '申請を受け付けました', body: '審査には、通常 1〜2 営業日かかります。' },
  warning: {
    title: '保存していない変更があります',
    body: 'このページを離れると、変更が消えます。',
  },
  danger: {
    title: '読み込めませんでした',
    body: '通信が切れた可能性があります。時間をおいて、もう一度お試しください。',
  },
  neutral: { title: 'まだ一つも作成されていません', body: '作成すると、ここに一覧が並びます。' },
};

const meta = {
  title: 'Components/StatusPanel',
  component: StatusPanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '空状態・見つからない・失敗を、バッジ付きのアイコン・見出し・本文・操作で伝える面です。一覧の中の空表示から、404 やエラーのページまで使えます。',
          '',
          '- `status` は状態の色（`info`・`success`・`warning`・`danger`）です。書かないと、色を持たないグレー（`neutral`）になります。',
          '- `icon` はバッジの中の大きなアイコンです。`status` を書くと既定のアイコンが付きます（`Notice`・`Callout` と同じ割り当て）。`neutral` には既定がないので、渡してください（見つからないときは虫眼鏡、空のときは箱など）。`Icon`（`@kazuemon/ui`）でそろえます。',
          '- `title` は必須です。「まだ一つも作成されていません」のように、状況を短く伝えます。',
          '- `children` は見出しの下の本文で、次にすることや理由を書きます。省略できます。',
          '- `actions` は本文の下に横並びで置く操作です。「作成する」「もう一度試す」のようなボタンや、「トップへ戻る」のようなリンクを置きます。',
          '- `headingLevel`（既定は 2）で、見出しを描く要素の段を選べます。ページの中の見出しの構造に合わせてください。',
          '- ページと同じレイヤーの面なので、影は付きません。幅を絞りたいときは `Container` などで囲んでください。',
        ].join('\n'),
      },
    },
  },
  args: {
    status: undefined,
    icon: <Icon icon={FolderOpenIcon} size="lg" standalone />,
    title: samples.neutral.title,
    children: samples.neutral.body,
  },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: [undefined, ...statuses.filter((s) => s !== 'neutral')],
    },
    title: { control: 'text' },
    children: { control: 'text' },
  },
} satisfies Meta<typeof StatusPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Statuses: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: { controls: { exclude: ['status', 'icon', 'title', 'children'] } },
  render: () => (
    <Gallery columnWidth="20rem">
      {statuses.map((sample) => (
        <Specimen key={sample} label={sample}>
          <StatusPanel
            status={statusOf(sample)}
            icon={
              sample === 'neutral' ? <Icon icon={FolderOpenIcon} size="lg" standalone /> : undefined
            }
            title={samples[sample].title}
            headingLevel={3}
          >
            {samples[sample].body}
          </StatusPanel>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  render: (args) => (
    <DensityPair>
      <StatusPanel {...args} headingLevel={3} />
    </DensityPair>
  ),
};

// 実際の使用例。空の一覧・検索結果なし・404・通信エラー
export const UseCases: Story = {
  tags: ['visual'],
  name: '使用例',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="22rem">
      <Specimen label="一覧の中の空状態">
        <StatusPanel
          icon={<Icon icon={FolderOpenIcon} size="lg" standalone />}
          title="まだ一つも作成されていません"
          headingLevel={3}
          actions={<Button color="primary">作成する</Button>}
        >
          作成すると、ここに一覧が並びます。
        </StatusPanel>
      </Specimen>
      <Specimen label="検索結果なし">
        <StatusPanel
          icon={<Icon icon={MagnifyingGlassIcon} size="lg" standalone />}
          title="見つかりませんでした"
          headingLevel={3}
        >
          ほかの言葉で、もう一度お試しください。
        </StatusPanel>
      </Specimen>
      <Specimen label="404 ページ">
        <StatusPanel
          status="warning"
          title="ページが見つかりません"
          headingLevel={1}
          actions={
            <Link href="#" variant="button">
              トップへ戻る
            </Link>
          }
        >
          お探しのページは、移動したか削除された可能性があります。
        </StatusPanel>
      </Specimen>
      <Specimen label="通信エラー">
        <StatusPanel
          status="danger"
          icon={<Icon icon={WifiSlashIcon} size="lg" standalone />}
          title="読み込めませんでした"
          headingLevel={3}
          actions={
            <Button color="primary">
              <Icon icon={ArrowClockwiseIcon} />
              もう一度試す
            </Button>
          }
        >
          通信が切れた可能性があります。時間をおいて、もう一度お試しください。
        </StatusPanel>
      </Specimen>
    </Gallery>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  args: {
    status: 'danger',
    icon: undefined,
    title: samples.danger.title,
    children: samples.danger.body,
    headingLevel: 2,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 見出しとして読める（headingLevel の段）
    await expect(
      canvas.getByRole('heading', { level: 2, name: samples.danger.title })
    ).toBeVisible();
    await expect(canvas.getByText(samples.danger.body)).toBeVisible();
    // アイコンは装飾なので、読み上げのツリーには名前を持つ要素として出ない
    await expect(canvas.queryByRole('img')).toBeNull();
  },
};
