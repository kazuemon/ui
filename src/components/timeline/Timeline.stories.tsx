import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Timeline, TimelineItem } from './Timeline';
import { Heading } from '../heading/Heading';
import { List, ListItem } from '../list/List';
import { Prose } from '../prose/Prose';
import { Tag } from '../tag/Tag';
import { Time } from '../time/Time';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';

const meta = {
  title: 'Components/Timeline',
  component: Timeline,
  subcomponents: { TimelineItem },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '職歴や活動の年表です。日付・題・説明を、古い順か新しい順に並べます。番号で数える手順は Steps、日付で並べる記録は Timeline です。',
          '',
          '- `Timeline` の中に `TimelineItem` を並べます。`date` が日付、`title` が題、children が説明です。並べる順は渡した順そのままなので、古い順にするか新しい順にするかは使う側が決めます。',
          '- `date` には `Time` を渡せます。「2021年4月 – 2023年3月」のような期間の文字列も渡せます。',
          '- `headingLevel` は題を描く見出しの段です。既定は 3（`h3`）で、年表を置く節の見出しより 1 段下にします。',
          '- `datePlacement` は日付の置き場所です。既定は点の右・題の上（`stack`）です。題と同じ行に置く（`inline`）と縦に詰まり、点の左の列にそろえる（`aside`）と日付が読み取りやすくなります。',
          '- `aside` は狭い入れ物では列を置けないので、`collapse` で畳むかを選びます。既定は題の上へ畳む（`stack`）で、列を保つ（`none`）も選べます。',
          '- `markerType` は点の見せ方、`line` は項目をつなぐ縦の線で、どちらも Steps の点と線に合わせた種類と色です。既定はグレーの丸（`neutral`）と細い実線（`solid`）です。輪郭の丸（`outline`）・Primary の青の丸（`primary`）、点線（`dotted`）・線なし（`none`）も選べます。',
          '- 点の種類は項目ごとに変えられます。`TimelineItem` にも `markerType` を渡せて、渡した項目だけ `Timeline` の指定を上書きします。',
          '- `markerSize` は点の大きさです。既定は `md` で、点を骨組みとして見せたいときは `lg`、さらに静かにしたいときは `sm` にします。',
          '- `tail="dotted"` にすると、最後の項目のあとに線が少しだけ点線で伸びて、年表がまだ続くことを見せます。',
          '- 目立たせたい項目には `emphasis` を付けます。点の種類はそのままに、周りに淡い輪が付いて少し大きくなります。青くしたいときは、その項目に `markerType="primary"` を足してください。強調は「いまの項目」に限らないので、読み上げの意味は付けません。いま続いていることを伝えたいときは、日付や説明の文で書いてください。',
          '- `align="alternate"` は点を中央に置き、項目を左右交互に並べます。広い幅で使い、日付は `stack` か `inline` にします。',
          '- Prose の中に置けます。MDX では `<Timeline>` と `<TimelineItem date="…" title="…">` を書き、その中に Markdown で説明を書きます。',
        ].join('\n'),
      },
    },
  },
  args: {
    headingLevel: 3,
    markerSize: 'md',
    markerType: 'neutral',
    line: 'solid',
    tail: 'none',
    datePlacement: 'stack',
    collapse: 'stack',
    align: 'start',
  },
  argTypes: {
    headingLevel: { control: 'inline-radio', options: [2, 3, 4, 5, 6] },
    markerSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    markerType: { control: 'inline-radio', options: ['neutral', 'outline', 'primary'] },
    line: { control: 'inline-radio', options: ['solid', 'dotted', 'none'] },
    tail: { control: 'inline-radio', options: ['none', 'dotted'] },
    datePlacement: { control: 'inline-radio', options: ['stack', 'inline', 'aside'] },
    collapse: { control: 'inline-radio', options: ['stack', 'none'] },
    align: { control: 'inline-radio', options: ['start', 'alternate'] },
  },
  render: (args) => (
    <div data-reading className="max-w-xl">
      <Timeline {...args}>
        <TimelineItem
          date={<Time dateTime="2019-04-01" format={{ year: 'numeric' }} />}
          title="大学に入る"
        >
          情報工学を学びはじめました。
        </TimelineItem>
        <TimelineItem date="2021年4月 – 2023年3月" title="Web の受託開発（アルバイト）">
          小さな会社のサイトを、設計から公開まで担当しました。
        </TimelineItem>
        <TimelineItem date="2023年4月 –" title="株式会社かずえもん フロントエンド" emphasis>
          デザインシステムの部品と、社内のドキュメントサイトを作っています。
        </TimelineItem>
      </Timeline>
    </div>
  ),
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const DatePlacements: Story = {
  tags: ['visual'],
  name: '日付の置き場所',
  parameters: { controls: { disable: true } },
  render: () => (
    <div data-reading>
      <Gallery columnWidth="24rem">
        {(
          [
            ['stack', '点の右・題の上（stack・既定）'],
            ['inline', '題と同じ行（inline）'],
            ['aside', '点の左の列（aside）'],
          ] as const
        ).map(([datePlacement, label]) => (
          <Specimen key={datePlacement} label={label}>
            <Timeline datePlacement={datePlacement}>
              <TimelineItem date="2021年4月" title="入社">
                プロダクトのフロントエンドを担当しました。
              </TimelineItem>
              <TimelineItem date="2023年4月" title="デザインシステムを作りはじめる">
                部品と原則を、社内に配りました。
              </TimelineItem>
              <TimelineItem date="2026年4月" title="いまの仕事" emphasis>
                ドキュメントサイトを作っています。
              </TimelineItem>
            </Timeline>
          </Specimen>
        ))}
      </Gallery>
    </div>
  ),
};

export const Markers: Story = {
  tags: ['visual'],
  name: '点の種類',
  parameters: { controls: { disable: true } },
  render: () => (
    <div data-reading>
      <Gallery columnWidth="20rem">
        {(
          [
            ['neutral', 'グレーの丸（neutral・既定）'],
            ['outline', '輪郭の丸（outline）'],
            ['primary', 'Primary の丸（primary）'],
          ] as const
        ).map(([markerType, label]) => (
          <Specimen key={markerType} label={label}>
            <Timeline markerType={markerType}>
              <TimelineItem date="2021年4月" title="入社">
                フロントエンドを担当しました。
              </TimelineItem>
              <TimelineItem date="2023年4月" title="異動">
                デザインシステムの担当になりました。
              </TimelineItem>
              <TimelineItem date="2026年4月" title="いまの仕事">
                ドキュメントサイトを作っています。
              </TimelineItem>
            </Timeline>
          </Specimen>
        ))}
      </Gallery>
    </div>
  ),
};

export const Sizes: Story = {
  tags: ['visual'],
  name: '点の大きさ',
  parameters: { controls: { disable: true } },
  render: () => (
    <div data-reading>
      <Gallery columnWidth="20rem">
        {(
          [
            ['sm', '小（sm）'],
            ['md', '中（md・既定）'],
            ['lg', '大（lg）'],
          ] as const
        ).map(([markerSize, label]) => (
          <Specimen key={markerSize} label={label}>
            <Timeline markerSize={markerSize}>
              <TimelineItem date="2021年4月" title="入社">
                フロントエンドを担当しました。
              </TimelineItem>
              <TimelineItem date="2026年4月" title="いまの仕事" emphasis>
                ドキュメントサイトを作っています。
              </TimelineItem>
            </Timeline>
          </Specimen>
        ))}
      </Gallery>
    </div>
  ),
};

export const Lines: Story = {
  tags: ['visual'],
  name: '線の種類',
  parameters: { controls: { disable: true } },
  render: () => (
    <div data-reading>
      <Gallery columnWidth="20rem">
        {(
          [
            ['solid', '細い実線（solid・既定）'],
            ['dotted', '点線（dotted）'],
            ['none', '線なし（none）'],
          ] as const
        ).map(([line, label]) => (
          <Specimen key={line} label={label}>
            <Timeline line={line}>
              <TimelineItem date="2021年4月" title="入社">
                フロントエンドを担当しました。
              </TimelineItem>
              <TimelineItem date="2023年4月" title="異動">
                デザインシステムの担当になりました。
              </TimelineItem>
              <TimelineItem date="2026年4月" title="いまの仕事">
                ドキュメントサイトを作っています。
              </TimelineItem>
            </Timeline>
          </Specimen>
        ))}
      </Gallery>
    </div>
  ),
};

export const Tail: Story = {
  tags: ['visual'],
  name: '最後の項目のあと',
  parameters: { controls: { disable: true } },
  render: () => (
    <div data-reading>
      <Gallery columnWidth="20rem">
        {(
          [
            ['none', '伸ばさない（none・既定）'],
            ['dotted', '点線で伸ばす（dotted）'],
          ] as const
        ).map(([tail, label]) => (
          <Specimen key={tail} label={label}>
            <Timeline tail={tail}>
              <TimelineItem date="2021年4月" title="入社">
                フロントエンドを担当しました。
              </TimelineItem>
              <TimelineItem date="2026年4月" title="いまの仕事" emphasis>
                ドキュメントサイトを作っています。
              </TimelineItem>
            </Timeline>
          </Specimen>
        ))}
      </Gallery>
    </div>
  ),
  play: async ({ canvas }) => {
    // 線は飾りなので、伸ばしても読み上げの文には出さない（::after の content は空）
    const lists = canvas.getAllByRole('list');
    const lastOf = (list: HTMLElement) => list.querySelectorAll('[data-slot="timeline-inner"]')[1];
    // tail="none" は最後の項目に線を引かず、tail="dotted" は点線を伸ばす
    await expect(getComputedStyle(lastOf(lists[0]), '::after').content).toBe('none');
    const tail = getComputedStyle(lastOf(lists[1]), '::after');
    await expect(tail.content).toBe('""');
    await expect(tail.borderInlineStartStyle).toBe('dotted');
  },
};

export const Emphases: Story = {
  tags: ['visual'],
  name: '項目の強調',
  parameters: { controls: { disable: true } },
  render: () => (
    <div data-reading>
      <Gallery columnWidth="20rem">
        {(
          [
            ['neutral', 'グレーの丸（neutral・既定）'],
            ['outline', '輪郭の丸（outline）'],
            ['primary', 'Primary の丸（primary）'],
          ] as const
        ).map(([markerType, label]) => (
          <Specimen key={markerType} label={label}>
            <Timeline markerType={markerType}>
              <TimelineItem date="2021年4月" title="入社">
                強調していない項目です。
              </TimelineItem>
              <TimelineItem date="2023年4月" title="担当が変わる" emphasis>
                この項目だけを強調しています。
              </TimelineItem>
              <TimelineItem date="2026年4月" title="いまの仕事">
                強調していない項目です。
              </TimelineItem>
            </Timeline>
          </Specimen>
        ))}
      </Gallery>
    </div>
  ),
};

// 点の種類は項目ごとに上書きできる。強調したい項目を青くしたいときは、markerType="primary" を足す
export const ItemMarkers: Story = {
  tags: ['visual'],
  name: '項目ごとの点の種類',
  parameters: { controls: { disable: true } },
  render: () => (
    <div data-reading>
      <Gallery columnWidth="20rem">
        <Specimen label="1 項目だけ Primary の丸にする">
          <Timeline>
            <TimelineItem date="2021年4月" title="入社">
              Timeline の指定（グレーの丸）に従います。
            </TimelineItem>
            <TimelineItem date="2026年4月" title="いまの仕事" markerType="primary">
              この項目だけ点の種類を変えています。
            </TimelineItem>
          </Timeline>
        </Specimen>
        <Specimen label="上書きした点を強調する">
          <Timeline>
            <TimelineItem date="2021年4月" title="入社">
              Timeline の指定（グレーの丸）に従います。
            </TimelineItem>
            <TimelineItem date="2026年4月" title="いまの仕事" markerType="primary" emphasis>
              点の種類を変えたうえで強調しています。
            </TimelineItem>
          </Timeline>
        </Specimen>
      </Gallery>
    </div>
  ),
  play: async ({ canvas }) => {
    const [plain, emphasized] = canvas.getAllByRole('list');
    const innersOf = (list: HTMLElement) =>
      Array.from(list.querySelectorAll('[data-slot="timeline-inner"]'));
    // 項目の markerType は Timeline の指定を上書きする（点の色が変わる）
    const [first, second] = innersOf(plain);
    const bg = (el: Element) => getComputedStyle(el, '::before').backgroundColor;
    await expect(bg(first)).not.toBe(bg(second));
    // 上書きした点は、強調しても色はそのまま。輪と大きさだけが足される
    const [, overridden] = innersOf(emphasized);
    await expect(bg(overridden)).toBe(bg(second));
    const halo = (el: Element) => getComputedStyle(el).getPropertyValue('--tl-marker-halo').trim();
    await expect(halo(second)).toBe('0px');
    await expect(halo(overridden)).not.toBe('0px');
  },
};

export const Alternate: Story = {
  tags: ['visual'],
  name: '左右交互',
  parameters: { controls: { disable: true } },
  render: () => (
    <div data-reading className="max-w-3xl">
      <Timeline align="alternate" datePlacement="stack">
        <TimelineItem date="2019年4月" title="大学に入る">
          情報工学を学びはじめました。
        </TimelineItem>
        <TimelineItem date="2021年4月" title="はじめての受託開発">
          小さな会社のサイトを、設計から公開まで担当しました。
        </TimelineItem>
        <TimelineItem date="2023年4月" title="入社">
          プロダクトのフロントエンドを担当しました。
        </TimelineItem>
        <TimelineItem date="2026年4月" title="いまの仕事" emphasis>
          デザインシステムの部品を作っています。
        </TimelineItem>
      </Timeline>
    </div>
  ),
};

export const Narrow: Story = {
  tags: ['visual'],
  name: '狭い入れ物',
  parameters: { controls: { disable: true } },
  render: () => (
    <div data-reading>
      <Gallery columnWidth="22rem">
        {(
          [
            ['stack', '題の上へ畳む（stack・既定）'],
            ['none', '畳まない（none）'],
          ] as const
        ).map(([collapse, label]) => (
          <Specimen key={collapse} label={label}>
            <div className="w-[320px]">
              <Timeline datePlacement="aside" collapse={collapse}>
                <TimelineItem date="2021年4月" title="入社">
                  フロントエンドを担当しました。
                </TimelineItem>
                <TimelineItem date="2026年4月" title="いまの仕事" emphasis>
                  ドキュメントサイトを作っています。
                </TimelineItem>
              </Timeline>
            </div>
          </Specimen>
        ))}
      </Gallery>
    </div>
  ),
};

// MDX で書いたときに近い形。Prose の中の素の段落・リストが、項目の説明になる
export const InProse: Story = {
  tags: ['visual'],
  name: 'Prose の中',
  parameters: { controls: { disable: true } },
  render: () => (
    <Prose as="article" className="max-w-xl">
      <h2>これまで</h2>
      <p>作ってきたものを、古い順に並べます。</p>
      <Timeline tail="dotted">
        <TimelineItem date={<Time dateTime="2021-04-01" />} title="ブログを作る">
          <p>静的サイトジェネレーターで、記事を書く場所を作りました。</p>
          <ul>
            <li>Markdown で書く</li>
            <li>記事ごとに目次を出す</li>
          </ul>
        </TimelineItem>
        <TimelineItem date={<Time dateTime="2024-10-01" />} title="部品を切り出す">
          <p>
            ブログで使っていた部品を、<a href="#library">ライブラリ</a>にまとめました。
          </p>
        </TimelineItem>
        <TimelineItem date={<Time dateTime="2026-04-01" />} title="デザインの原則を書く" emphasis>
          <p>決めたことを、原則と記録に残しています。</p>
        </TimelineItem>
      </Timeline>
      <p>これからも続きます。</p>
    </Prose>
  ),
};

export const WithParts: Story = {
  tags: ['visual'],
  name: '説明に部品を置く',
  parameters: { controls: { disable: true } },
  render: () => (
    <div data-reading className="max-w-xl">
      <Timeline datePlacement="aside">
        <TimelineItem date="2023年4月 – 2026年3月" title="株式会社かずえもん">
          <p>デザインシステムの部品を作っていました。</p>
          <div className="flex flex-wrap gap-2">
            <Tag>TypeScript</Tag>
            <Tag>React</Tag>
            <Tag color="primary">デザインシステム</Tag>
          </div>
        </TimelineItem>
        <TimelineItem date="2026年4月 –" title="フリーランス" emphasis>
          <p>手がけていること:</p>
          <List>
            <ListItem>ドキュメントサイトの設計</ListItem>
            <ListItem>部品の見た目のレビュー</ListItem>
          </List>
        </TimelineItem>
      </Timeline>
    </div>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { controls: { disable: true } },
  render: () => (
    <DensityPair>
      <div className="w-80">
        <Timeline>
          <TimelineItem date="2021年4月" title="入社">
            フロントエンドを担当しました。
          </TimelineItem>
          <TimelineItem date="2026年4月" title="いまの仕事" emphasis>
            部品を作っています。
          </TimelineItem>
        </Timeline>
      </div>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  parameters: { controls: { disable: true } },
  render: () => (
    <div data-reading className="max-w-xl">
      <Heading level={2}>これまで</Heading>
      <Timeline>
        <TimelineItem date={<Time dateTime="2021-04-01" />} title="入社">
          フロントエンドを担当しました。
        </TimelineItem>
        <TimelineItem date={<Time dateTime="2026-04-01" />} title="いまの仕事" emphasis>
          部品を作っています。
        </TimelineItem>
      </Timeline>
    </div>
  ),
  play: async ({ canvas }) => {
    // 並びに意味があるので ol。項目は li で、題は見出し（既定は h3）になる
    const list = canvas.getByRole('list');
    await expect(list.tagName).toBe('OL');
    const items = canvas.getAllByRole('listitem');
    await expect(items).toHaveLength(2);
    await expect(canvas.getByRole('heading', { level: 3, name: '入社' })).toBeVisible();
    // 日付は <time datetime>。点と線は飾りなので、読み上げの文には出さない
    await expect(items[0].querySelector('time')).toHaveAttribute('datetime', '2021-04-01');
    const inner = items[0].querySelector('[data-slot="timeline-inner"]')!;
    await expect(getComputedStyle(inner, '::before').content).toBe('""');
    // 強調は見た目だけの印（data-emphasis）。読み上げの意味は付けない
    await expect(items[0]).not.toHaveAttribute('data-emphasis');
    await expect(items[1]).toHaveAttribute('data-emphasis');
    await expect(items[1]).not.toHaveAttribute('aria-current');
  },
};
