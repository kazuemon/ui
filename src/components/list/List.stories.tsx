import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { List, ListItem } from './List';
import { Code } from '../code/Code';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';

const meta = {
  title: 'Components/List',
  component: List,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '記事の中の箇条書き・番号付きリスト・チェックリストです。Markdown を変換した HTML と同じ要素（`ul`・`ol`・`li`、チェックリストは `li.task-list-item` の中の押せない `input`）を出します。',
          '',
          '- `as` は `ul`（既定、箇条書き）と `ol`（番号付き）です。`start` で最初の番号を決めます。',
          '- `markerType` は箇条書きの印です。`dash`（既定）は薄いグレーの短い線、`dot` は濃紺の丸です。入れ子のリストは外側の印を引き継ぎます。',
          '- 番号は薄いグレーで右揃えです。10 以上の番号でも「.」の位置がそろいます。',
          '- `task` でチェックリストにし、`ListItem` の `checked` で箱を出します。箱は押せません。まだの項目は輪郭の四角、済んだ項目はチェックの印だけです。',
          '- `checkedVariant` は済んだ項目の文の色です。`subtle`（既定）は薄いグレー、`default` は本文と同じ色です。',
        ].join('\n'),
      },
    },
  },
  args: { as: 'ul', markerType: 'dash' },
  argTypes: {
    as: { control: 'inline-radio', options: ['ul', 'ol'] },
    markerType: { control: 'inline-radio', options: ['dash', 'dot'] },
    checkedVariant: { control: 'inline-radio', options: ['subtle', 'default'] },
  },
  render: (args) => (
    <div data-reading className="max-w-xl">
      <List {...args}>
        <ListItem>部品の高さは、マウスでも指でも 44px です。</ListItem>
        <ListItem>記事の中では、スマホでも本文は 16px のままです。</ListItem>
        <ListItem>
          <Code>data-reading</Code> を付けた要素の中が、読みものです。
        </ListItem>
      </List>
    </div>
  ),
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

const Nested = ({ markerType }: { markerType?: 'dash' | 'dot' }) => (
  <List markerType={markerType}>
    <ListItem>エディタ</ListItem>
    <ListItem>
      下書きを置く場所。Markdown で書いて、あとから探しやすくまとめます。
      <List>
        <ListItem>日本語の見出し</ListItem>
        <ListItem>英語のサブ</ListItem>
      </List>
    </ListItem>
  </List>
);

export const Kinds: Story = {
  tags: ['visual'],
  name: '種類',
  parameters: { controls: { disable: true } },
  render: () => (
    <div data-reading>
      <Gallery columnWidth="18rem">
        <Specimen label="箇条書き（dash・既定）">
          <Nested />
        </Specimen>
        <Specimen label="箇条書き（dot）">
          <Nested markerType="dot" />
        </Specimen>
        <Specimen label="番号付き（start=9）">
          <List as="ol" start={9}>
            <ListItem>画像を書き出す</ListItem>
            <ListItem>リンクを確かめる</ListItem>
            <ListItem>公開する</ListItem>
          </List>
        </Specimen>
        <Specimen label="チェックリスト（checkedVariant）">
          <div className="flex flex-col gap-4">
            <List task>
              <ListItem checked>本文を書く（subtle）</ListItem>
              <ListItem checked={false}>OGP の画像を作る</ListItem>
            </List>
            <List task checkedVariant="default">
              <ListItem checked>本文を書く（default）</ListItem>
              <ListItem checked={false}>OGP の画像を作る</ListItem>
            </List>
          </div>
        </Specimen>
      </Gallery>
    </div>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { controls: { disable: true } },
  render: () => (
    <DensityPair>
      <div className="flex w-[20rem] flex-col gap-4">
        <Nested />
        <List as="ol">
          <ListItem>機能の画面の中</ListItem>
          <ListItem>文字は指で 14px</ListItem>
        </List>
      </div>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  args: { as: 'ol', start: 3 },
  play: async ({ canvas }) => {
    const list = canvas.getByRole('list');
    await expect(list.tagName).toBe('OL');
    await expect(list).toHaveAttribute('start', '3');
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
  },
};
