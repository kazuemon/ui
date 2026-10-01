import { CheckIcon, RocketLaunchIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { createRef, useState } from 'react';
import { expect, userEvent } from 'storybook/test';

import { List, ListItem } from './List';
import { Code } from '../code/Code';
import { Tag } from '../tag/Tag';
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
          '- `as` は `ul`（既定、箇条書き）と `ol`（番号付き）です。`start` で最初の番号を決め、`reversed` で大きい順に振ります。',
          '- `markerType` は箇条書きの印です。`dash`（既定）は薄いグレーの短い線、`dot` は濃紺の丸です。入れ子のリストは外側の印を引き継ぎます。',
          '- 番号は薄いグレーで右揃えです。10 以上の番号でも「.」の位置がそろいます。',
          '- `task` でチェックリストにし、`ListItem` の `checked` で箱を出します。箱は押せません。まだの項目は輪郭の四角、済んだ項目はチェックの印だけです。',
          '- `checkedVariant` は済んだ項目の文の色です。`subtle`（既定）は薄いグレー、`default` は本文と同じ色です。',
          '- `ListItem` の `status`（`success`・`warning`・`danger`）で、印を状態の色と形のアイコンにします。`icon` で好きなアイコンを印にできます。印は読み上げないので、状態は文でも伝えます。',
          '- 印のアイコンは文字の 1.25 倍の大きさです。`ListItem` の `iconColor` でアイコンの色を、`color` で文の色を、Tag の `color` と同じ色から選びます。書かないときはどちらも文字の色で、`status` のアイコンは状態の色です。',
          '- `ListItem` の `trailing` で、項目の末尾に数・日付・タグ・ボタンなどを置きます。右端に寄せ、1 行目の高さの中で縦の中央にそろえます。文字の大きさや色は、置くものに付けます。',
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

export const StatusAndTrailing: Story = {
  tags: ['visual'],
  name: '状態・アイコン・末尾',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="20rem">
      <Specimen label="status">
        <List>
          <ListItem status="success">型を確かめる: 通った</ListItem>
          <ListItem status="warning">書式: 2 件の警告</ListItem>
          <ListItem status="danger">テスト: 3 件の失敗</ListItem>
          <ListItem>配布物を作る: まだ</ListItem>
        </List>
      </Specimen>
      <Specimen label="icon・iconColor・color">
        <List>
          <ListItem icon={<CheckIcon />} iconColor="success">
            部品をすべて使える
          </ListItem>
          <ListItem icon={<CheckIcon />} iconColor="success">
            ドキュメントの見本
          </ListItem>
          <ListItem icon={<RocketLaunchIcon />}>はじめの設定を手伝う</ListItem>
          <ListItem icon={<RocketLaunchIcon />} color="primary">
            文もアイコンも primary
          </ListItem>
          <ListItem status="danger" iconColor="neutral" color="danger">
            status に iconColor を重ねる
          </ListItem>
        </List>
      </Specimen>
      <Specimen label="trailing（折り返す文・タグ）">
        <List>
          <ListItem trailing={<span className="text-fg-subtle">9/30</span>}>
            カレンダーに日ごとの印を足した
          </ListItem>
          <ListItem trailing={<span className="text-fg-subtle">10/1</span>}>
            フォームのどの欄にも結び付かないエラーを出せるようにした
          </ListItem>
          <ListItem status="success" trailing={<Tag color="success">公開</Tag>}>
            はじめての記事
          </ListItem>
        </List>
      </Specimen>
    </Gallery>
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

function CheckedToggle() {
  const [done, setDone] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setDone(true)}>
        済みにする
      </button>
      <List task>
        <ListItem checked={done}>確かめる</ListItem>
      </List>
    </>
  );
}

export const CheckedFollows: Story = {
  name: 'checked が後から変わる',
  parameters: { controls: { disable: true } },
  render: () => <CheckedToggle />,
  play: async ({ canvas }) => {
    const box = canvas.getByRole('checkbox');
    await expect(box).not.toBeChecked();
    await userEvent.click(canvas.getByRole('button', { name: '済みにする' }));
    await expect(box).toBeChecked();
  },
};

const reversedRef = createRef<HTMLUListElement | HTMLOListElement>();

export const Reversed: Story = {
  tags: ['visual'],
  name: '大きい順の番号と ref',
  render: () => (
    <List as="ol" reversed ref={reversedRef}>
      <ListItem>3 つ目</ListItem>
      <ListItem>2 つ目</ListItem>
      <ListItem>1 つ目</ListItem>
    </List>
  ),
  play: async ({ canvas }) => {
    const list = canvas.getByRole('list');
    await expect(list).toHaveAttribute('reversed');
    await expect(reversedRef.current).toBe(list);
  },
};

export const IconAndTextColor: Story = {
  name: 'アイコンと文の色',
  parameters: { controls: { disable: true } },
  render: () => (
    <List>
      <ListItem status="success">状態の色</ListItem>
      <ListItem status="success" iconColor="danger">
        iconColor が勝つ
      </ListItem>
      <ListItem icon={<CheckIcon />} color="info">
        文の色をアイコンも継ぐ
      </ListItem>
    </List>
  ),
  play: async ({ canvas }) => {
    const items = canvas.getAllByRole('listitem');
    const iconColor = (li: HTMLElement) =>
      getComputedStyle(li.querySelector('[data-slot="list-item-icon"]')!).color;
    const fg = (name: string) => {
      const probe = document.createElement('span');
      probe.style.color = `var(--color-${name})`;
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    };
    await expect(iconColor(items[0])).toBe(fg('fg-success'));
    await expect(iconColor(items[1])).toBe(fg('fg-danger'));
    await expect(getComputedStyle(items[2]).color).toBe(fg('fg-info'));
    await expect(iconColor(items[2])).toBe(fg('fg-info'));
  },
};

export const NestedWithTrailing: Story = {
  name: '末尾のある項目の入れ子',
  parameters: { controls: { disable: true } },
  render: () => (
    <List>
      <ListItem trailing="3 件">
        親の項目
        <List>
          <ListItem>子の項目</ListItem>
        </List>
      </ListItem>
      <ListItem>
        末尾のない親
        <List>
          <ListItem>子の項目</ListItem>
        </List>
      </ListItem>
    </List>
  ),
  play: async ({ canvasElement }) => {
    // 末尾があってもなくても、入れ子のリストと親の項目の文の間は同じ
    const nested = canvasElement.querySelectorAll('li ul');
    await expect(nested).toHaveLength(2);
    await expect(getComputedStyle(nested[0]).marginTop).toBe(getComputedStyle(nested[1]).marginTop);
    await expect(getComputedStyle(nested[0]).marginTop).not.toBe('0px');
  },
};
