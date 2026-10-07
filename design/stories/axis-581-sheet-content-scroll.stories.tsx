import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useEffect, useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Dialog } from '../../src/components/dialog/Dialog';
import { Drawer } from '../../src/components/drawer/Drawer';
import { Menu } from '../../src/components/menu/Menu';
import { MenuItem } from '../../src/components/menu/MenuItem';
import { Select } from '../../src/components/select/Select';
import { statePseudo } from '../../src/stories/story-states';

// 軸 581: シート（Drawer・選択肢やメニューのシート・Inspector）と Dialog の中身のスクロールの見た目
const meta = {
  title: 'Design Review/581 シートと Dialog の中身のスクロール',
  id: 'design-review-581-sheet-content-scroll',
  parameters: {
    layout: 'fullscreen',
    // 「スクロール中」の列は、中身の枠に hover を当てて、ScrollArea のつまみを出した形にする
    pseudo: statePseudo({ hover: '[data-slot="more-cue-scroll"]' }),
  },
  // 開いたまま並べた面が、ページのスクロールを止めないようにする（比べるためだけ）
  decorators: [
    (Story) => (
      <>
        <style>{'html, body { overflow: auto !important; }'}</style>
        <Story />
      </>
    ),
  ],
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'ブラウザのスクロールバー＋区切り線と影',
    intent:
      'スクロールバーはブラウザのもの（Windows ではいつも幅を取り、スマートフォンではスクロール中だけ出る）。見出しの下にいつも区切り線を引き、続きがある端に内側の影を落とす。ここではブラウザの既定に近い灰色で描いている',
    spec: [
      ['スクロールバー', 'ブラウザのもの'],
      ['上の端', '区切り線（いつも）＋内側の影'],
      ['下の端', '内側の影'],
    ],
    tokens: {
      '--sheet-scroll-native': 'auto',
      '--sheet-scroll-thumb': 'hidden',
      '--sheet-scroll-thumb-idle': '0',
      '--sheet-scroll-divider': '1',
    },
  },
  {
    id: 'A',
    name: 'ScrollArea と同じ（影だけ）',
    intent:
      'ScrollArea と同じ見た目にそろえる。ブラウザのスクロールバーを隠し、細いつまみを載せたとき・スクロール中だけ出す。続きは端の内側の影だけで見せ、区切り線は引かない',
    spec: [
      ['スクロールバー', 'ScrollArea のつまみ（載せたとき・スクロール中）'],
      ['上の端', '内側の影'],
      ['下の端', '内側の影'],
    ],
    tokens: {
      '--sheet-scroll-native': 'none',
      '--sheet-scroll-thumb': 'visible',
      '--sheet-scroll-thumb-idle': '0',
      '--sheet-scroll-divider': '0',
    },
  },
  {
    id: 'B',
    name: 'つまみだけ ScrollArea にそろえる',
    intent:
      '続きの印は現行版のまま（区切り線＋影）にして、スクロールバーだけを ScrollArea のつまみに替える。見出しと中身の境目は、いまと同じくいつも線で分かる',
    spec: [
      ['スクロールバー', 'ScrollArea のつまみ（載せたとき・スクロール中）'],
      ['上の端', '区切り線（いつも）＋内側の影'],
      ['下の端', '内側の影'],
    ],
    tokens: {
      '--sheet-scroll-native': 'none',
      '--sheet-scroll-thumb': 'visible',
      '--sheet-scroll-thumb-idle': '0',
      '--sheet-scroll-divider': '1',
    },
  },
];

type Kind = 'drawer' | 'select' | 'menu' | 'dialog';
type Scroll = 'top' | 'middle';

const columns: (Column & { kind: Kind; scroll: Scroll })[] = [
  { label: 'Drawer（開いた直後）', note: '中身の上端', kind: 'drawer', scroll: 'top' },
  {
    label: 'Drawer（スクロール中）',
    note: '途中までスクロールし、つまみが出ている状態',
    preview: 'hover',
    kind: 'drawer',
    scroll: 'middle',
  },
  {
    label: 'Select のシート（スクロール中）',
    note: '選択肢の多い Select',
    preview: 'hover',
    kind: 'select',
    scroll: 'middle',
  },
  {
    label: 'Menu のシート（スクロール中）',
    note: '項目の多いメニュー',
    preview: 'hover',
    kind: 'menu',
    scroll: 'middle',
  },
  {
    label: 'Dialog（中身だけスクロール・載せたとき）',
    note: '中央に浮かべた Dialog',
    preview: 'hover',
    kind: 'dialog',
    scroll: 'middle',
  },
];

const prefectures = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
].map((label, i) => ({ label, value: `pref-${i}` }));

const terms = [
  'このサービスは、登録した人がプロフィールと作品を公開するための場所です。登録した時点で、この規約に同意したものとします。',
  '公開した作品の権利は、作った人にあります。運営は、サービスの紹介のために、作品の題と画像を使うことがあります。',
  'ほかの人の作品を、作った人の許しなく公開しないでください。見つけたときは、予告なく公開を止めることがあります。',
  '登録したメールアドレスには、大切なお知らせだけを送ります。お知らせの受け取りは、設定から止められます。',
  '退会すると、公開していた作品とプロフィールは 30 日後に消えます。30 日のあいだは、もう一度ログインすると元に戻せます。',
  'この規約は、予告して変えることがあります。変えたときは、登録したメールアドレスに知らせます。',
];

const termsBody = (
  <div className="flex flex-col gap-3 text-body">
    {terms.map((text) => (
      <p key={text}>{text}</p>
    ))}
  </div>
);

// 開いたままの面の中身を、列の位置までスクロールする
function useScrolled(frame: HTMLElement | null, scroll: Scroll) {
  useEffect(() => {
    if (!frame) return undefined;
    const id = setTimeout(() => {
      const viewport = frame.querySelector<HTMLElement>(
        '[data-slot="more-cue-scroll"] [data-scroll-viewport]'
      );
      if (viewport)
        viewport.scrollTop =
          scroll === 'top' ? 0 : (viewport.scrollHeight - viewport.clientHeight) / 2;
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      window.scrollTo(0, 0);
    }, 600);
    return () => clearTimeout(id);
  }, [frame, scroll]);
}

// スマートフォンの画面（375 × 640）。指で操作する密度に固定する。枠に transform を付けて、面の fixed を枠の中に閉じ込める
function Phone({ children }: { children: (frame: HTMLElement) => ReactNode }) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setFrame}
      data-density="coarse"
      className="relative h-[640px] w-[375px] [transform:translateZ(0)] overflow-clip rounded-[28px] border border-line bg-bg"
    >
      <div className="flex flex-col gap-4 px-5 pt-8">
        <h2 className="text-xl font-heading">設定</h2>
        {frame && children(frame)}
      </div>
    </div>
  );
}

function Opened({ frame, kind, scroll }: { frame: HTMLElement; kind: Kind; scroll: Scroll }) {
  useScrolled(frame, scroll);
  if (kind === 'drawer')
    return (
      <Drawer
        title="利用規約"
        description="登録の前に読んでください"
        detent="full"
        defaultOpen
        modal="passive"
        portalContainer={frame}
        actions={<Button>同意する</Button>}
      >
        {termsBody}
      </Drawer>
    );
  if (kind === 'select')
    return (
      <Select
        label="都道府県"
        items={prefectures}
        defaultValue="pref-12"
        presentation="sheet"
        open
        modal={false}
        portalContainer={frame}
      />
    );
  if (kind === 'menu')
    return (
      <Menu
        trigger={<Button variant="outline">移動先</Button>}
        title="移動先"
        presentation="sheet"
        open
        modal={false}
        portalContainer={frame}
      >
        {prefectures.map((item) => (
          <MenuItem key={item.value}>{item.label}</MenuItem>
        ))}
      </Menu>
    );
  return (
    <Dialog
      title="利用規約"
      scrollBehavior="content"
      presentation="popover"
      defaultOpen
      modal="passive"
      portalContainer={frame}
      actions={<Button>同意する</Button>}
    >
      {termsBody}
    </Dialog>
  );
}

// 開いた直後は選んだ項目が hover の状態になるので、固定した列ではそれを外す
const highlightPreview = [
  '[role="option"][data-highlighted]:not([data-selected]) { background-color: transparent; }',
  '[role="option"][data-highlighted][data-selected] { background-color: var(--color-select-item-selected); }',
  '[role="menuitem"][data-highlighted] { background-color: transparent; }',
].join('\n');

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <>
      <style>{highlightPreview}</style>
      <Comparison
        index={581}
        axis="シートと Dialog の中身のスクロール"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={(column) => {
          const { kind, scroll } = column as (typeof columns)[number];
          return <Phone>{(frame) => <Opened frame={frame} kind={kind} scroll={scroll} />}</Phone>;
        }}
      >
        <p>
          画面の下から出すシート（Drawer、Select・Combobox・TagsInput・Menu のシート、狭い画面の
          Inspector）と、中身だけをスクロールさせる Dialog
          の、中身が長いときの見た目を選びます。いまはブラウザのスクロールバーで、見出しの下にいつも区切り線を引いています。
        </p>
        <p>
          「スクロール中」の列は、ScrollArea
          のつまみが出た形に固定しています。スマートフォンでは、つまみもブラウザのスクロールバーも、指で動かしているあいだだけ出ます。撮影の環境ではブラウザのスクロールバーが出ないことがあるので、現行版は
          Storybook を開いて見てください。
        </p>
        <p>決まったら、既定にする案と、選べるようにするかを教えてください。</p>
      </Comparison>
    </>
  ),
};
