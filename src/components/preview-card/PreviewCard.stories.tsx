import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { PreviewCard } from './PreviewCard';
import { ArticlePreview, ProfilePreview } from './preview-card-samples';
import { ScreenFrame } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';

// 開いた状態のストーリーも、ドキュメントのページでは閉じて描く（開くとページが流れるため）
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

const meta = {
  title: 'Components/PreviewCard',
  component: PreviewCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'リンクに載せる・フォーカスすると、行き先のプレビュー（画像・題・説明、人のプロフィールなど）が少し遅れて出ます。',
          '',
          '- リンクは `Link` と同じ見た目と props です（`href`・`variant`・`color`・`render` など）。文字は `children` に、プレビューの中身は `content` に渡します。押すと行き先へ移ります。',
          '- 出るまでの待ちは `openDelay`（既定 600 ms）、離れてから閉じるまでは `closeDelay`（既定 300 ms）です。通りがかりのマウスでは出ません。キーボードでフォーカスしたときも、同じだけ待って出ます。',
          '- プレビューは、見える人が行き先を先に確かめるためのものです。読み上げには届かず、指でも出ません。欠かせない情報は、行き先のページに置きます。',
          '- 面の余白を外して画像を端まで広げるときは、`popupClassName="p-0"` を渡します。幅を変えるときは `popupClassName` に `w-*` を渡します。',
          '- 押して開く面（設定など）は Popover、短い文の補足は Tooltip を使います。',
        ].join('\n'),
      },
    },
  },
  args: {
    href: 'https://example.com/articles/design-loop',
    children: '候補を並べて選ぶループ',
    content: <ProfilePreview />,
    side: 'bottom',
    align: 'center',
  },
  argTypes: {
    content: { control: false },
    render: { control: false },
    side: {
      control: 'inline-radio',
      options: ['top', 'bottom', 'left', 'right'],
      table: { defaultValue: { summary: "'bottom'" } },
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      table: { defaultValue: { summary: "'center'" } },
    },
    openDelay: { control: { type: 'number', min: 0, step: 100 } },
    closeDelay: { control: { type: 'number', min: 0, step: 100 } },
  },
} satisfies Meta<typeof PreviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  render: (args) => (
    <p className="max-w-md text-body">
      この記事は、
      <PreviewCard {...args} />
      の続きです。載せて、少し待つと出ます。
    </p>
  ),
  parameters: {
    docs: {
      source: sourceCode(`
        <PreviewCard href="/articles/design-loop" content={<ArticleSummary />}>
          候補を並べて選ぶループ
        </PreviewCard>
      `),
    },
  },
};

export const Article: Story = {
  tags: ['visual'],
  name: '記事のプレビュー',
  parameters: {
    controls: { include: ['side', 'align'] },
    docs: {
      description: {
        story:
          '行き先の記事を、画像・サイト・題・説明で見せます（リンクカードと同じ並び）。画像を端まで広げるので `popupClassName="p-0"` で余白を外しています。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[460px]">
      {(frame) => (
        <div className="flex w-full justify-center pt-4">
          <PreviewCard
            key={`${args.side}-${args.align}`}
            {...args}
            content={<ArticlePreview />}
            popupClassName="p-0"
            defaultOpen={openOnLoad(viewMode)}
            portalContainer={frame}
          >
            {args.children}
          </PreviewCard>
        </div>
      )}
    </ScreenFrame>
  ),
};

export const Profile: Story = {
  tags: ['visual'],
  name: '人のプロフィール',
  parameters: {
    controls: { include: ['side', 'align'] },
    docs: {
      description: {
        story: '名前のリンクに載せると、その人のプロフィールを見せます。余白は面のものを使います。',
      },
    },
  },
  args: { children: '@kazuemon', href: 'https://example.com/kazuemon' },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[320px]">
      {(frame) => (
        <div className="flex w-full justify-center pt-4">
          <PreviewCard
            key={`${args.side}-${args.align}`}
            {...args}
            content={<ProfilePreview />}
            defaultOpen={openOnLoad(viewMode)}
            portalContainer={frame}
          >
            {args.children}
          </PreviewCard>
        </div>
      )}
    </ScreenFrame>
  ),
};

export const Behavior: Story = {
  name: '載せる・フォーカス・離れる',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <p className="text-body">
      <PreviewCard {...args} openDelay={50} closeDelay={50} content={<ProfilePreview />}>
        @kazuemon
      </PreviewCard>
    </p>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const link = canvas.getByRole('link', { name: '@kazuemon' });
    await expect(link).toHaveAttribute('href', 'https://example.com/articles/design-loop');
    // 載せると出る
    await userEvent.hover(link);
    await body.findByText('2,431', {}, { timeout: 2000 });
    // 離れると閉じる
    await userEvent.unhover(link);
    await waitFor(() => expect(body.queryByText('2,431')).not.toBeInTheDocument());
    // キーボードでフォーカスしても出る。Esc で閉じる
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await body.findByText('2,431', {}, { timeout: 2000 });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByText('2,431')).not.toBeInTheDocument());
  },
};
