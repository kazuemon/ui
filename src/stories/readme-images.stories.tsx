import { ArticleIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Heading } from '../components/heading/Heading';
import { Icon } from '../components/icon/Icon';
import { Text } from '../components/text/Text';

// README に載せる画像（banner.png・text-sample.png）を、実際の部品で描くストーリー。
// 撮り方（Storybook を 1 回ビルドして使い回す）:
//   node design/tools/capture-story.mjs overview-readme--banner --out banner.png --width 1000 --height 400
//   node design/tools/capture-story.mjs overview-readme--text-sample --out text-sample.png --width 1000 --height 310

const meta = {
  title: 'Overview/README',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Banner: Story = {
  render: () => (
    <div className="flex h-[400px] w-[1000px] flex-col items-center justify-center gap-3 bg-surface">
      <Heading level={1} size="5xl" className="text-[88px] leading-tight font-extrabold text-brand">
        @kazuemon/ui
      </Heading>
      <Text size="xl" variant="muted">
        ぼくがかんがえたさいきょうのUIライブラリをつくりたい
      </Text>
    </div>
  ),
};

export const TextSample: Story = {
  render: () => (
    <div className="flex w-[1000px] flex-col gap-3 bg-surface px-12 py-10">
      <Text variant="label" className="flex items-center gap-2 text-fg-muted">
        <Icon icon={ArticleIcon} />
        日本語/英語ミックスサンプル
      </Text>
      <Text size="2xl">
        @kazuemon/uiは、「ぼくがかんがえたさいきょうのUIライブラリ」をConceptに、かずえもんが個人で制作しています。SimpleでModernな見た目かつ、Usabilityも重視したUI
        Libraryを目指しています。Designはほぼ独学で、Design
        Systemなどの勉強も兼ねているので、DesignのRuleにおいては正しくないかもしれません。ご容赦ください。
      </Text>
    </div>
  ),
};
