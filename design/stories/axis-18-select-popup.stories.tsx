import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';

import { Select } from '../../src/components/Select';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 18: Select の浮かぶ選択肢の見た目（原則11 の「浮かぶ UI」）
// 変えるのは design/tokens.css の --select-popup-*・--color-select-* だけ
// ボトムシートへの切り替え（画面幅で構造を変える — ADR-0004）は、見た目が決まってから比べる
// 1回目: 現行版・A〜D。2回目: A の影と C の選んだ項目の青に、A と B の間の濃さの輪郭を合わせた E1〜E3（C・D の行は外した）
// 決定は E1（ADR-0036）。トークンの既定は E1 なので、現行版・A・B は比べた当時の見た目をトークンで再現する

const popupShadow = '0 8px 24px rgb(31 47 55 / 0.12)';
const noShadow = '0 0 #0000';

// 1回目の選んだ項目（右に青いチェックだけ）
const checkOnly = {
  '--color-select-item-selected': 'transparent',
  '--color-select-item-selected-highlight': 'var(--color-select-item-highlight)',
  '--color-on-select-item-selected': 'var(--color-fg)',
  '--color-select-check': 'var(--color-primary)',
};

// C（選んだ項目を淡い青に）のトークン。E1〜E3 でも使う
const selectedBlue = {
  '--color-select-item-selected': 'var(--color-tag-primary)',
  '--color-select-item-selected-highlight':
    'color-mix(in oklab, var(--color-tag-primary), var(--color-on-tag-primary) 8%)',
  '--color-on-select-item-selected': 'var(--color-on-tag-primary)',
  '--color-select-check': 'var(--color-on-tag-primary)',
};

// E1〜E3: A の影（輪郭の線は影の中ではなく枠線で引く）＋ C の青＋輪郭の濃さ
const combined = (line: string) => ({
  ...selectedBlue,
  '--shadow-select-popup': popupShadow,
  '--color-select-popup-line': line,
});

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '仮の見た目',
    intent:
      'Select を作ったときの仮の形。白い面に細い境界線を引き、影は付けない。hover は入力欄と同じグレー、選んだ項目は右に青いチェック。',
    spec: [
      ['面', '白・1px の線 #DEE0E1'],
      ['影', 'なし'],
      ['選んだ項目', '右に青いチェック'],
    ],
    tokens: { ...checkOnly, '--shadow-select-popup': noShadow },
  },
  {
    id: 'A',
    name: '影で浮かせる',
    intent:
      '線を消し、やわらかい影で浮かせる。影の中に、ごく淡い 1px の輪郭（白地との比 1.11）を含む。',
    spec: [
      ['面', '白・線なし'],
      ['影', '下に 8px ぼかし 24px（12%）＋輪郭 1px（6%）'],
      ['選んだ項目', '右に青いチェック'],
    ],
    tokens: {
      ...checkOnly,
      '--select-popup-line-width': '0px',
      '--shadow-select-popup': `${popupShadow}, 0 0 0 1px rgb(31 47 55 / 0.06)`,
    },
  },
  {
    id: 'B',
    name: '輪郭をはっきり',
    intent: '影は付けず、線を 3:1 の輪郭（白いボタンのはっきりした輪郭と同じ色）にする。',
    spec: [
      ['面', '白・1px の線 #939596（3:1）'],
      ['影', 'なし'],
      ['選んだ項目', '右に青いチェック'],
    ],
    tokens: {
      ...checkOnly,
      '--shadow-select-popup': noShadow,
      '--color-select-popup-line': 'var(--color-line-strong)',
    },
  },
  {
    id: 'E1',
    name: '影＋細い境界線＋青',
    intent:
      'A の影に、細い境界線（白いボタンの輪郭と同じ色）と、C の選んだ項目の青を合わせる。輪郭は A と B の間でいちばん淡い。',
    spec: [
      ['面', '白・1px の線 #DEE0E1（1.32:1）'],
      ['影', '下に 8px ぼかし 24px（12%）'],
      ['選んだ項目', '#E9F2FE に #196BD6 の文字とチェック'],
    ],
    tokens: combined('var(--color-surface-line)'),
  },
  {
    id: 'E2',
    name: '影＋中間の輪郭＋青',
    intent: 'E1 の輪郭を一段濃くする（#DEE0E1 と #939596 の明度の 1/4）。',
    spec: [
      ['面', '白・1px の線 #CBCDCE（1.60:1）'],
      ['影', '下に 8px ぼかし 24px（12%）'],
      ['選んだ項目', '#E9F2FE に #196BD6 の文字とチェック'],
    ],
    tokens: combined('#cbcdce'),
  },
  {
    id: 'E3',
    name: '影＋やや濃い輪郭＋青',
    intent: 'E1 の輪郭を二段濃くする（#DEE0E1 と #939596 の明度の中間）。',
    spec: [
      ['面', '白・1px の線 #B8BABB（1.95:1）'],
      ['影', '下に 8px ぼかし 24px（12%）'],
      ['選んだ項目', '#E9F2FE に #196BD6 の文字とチェック'],
    ],
    tokens: combined('#b8babb'),
  },
];

const columns: Column[] = [
  {
    label: '開いた状態（マウス用）',
    note: '選んだ項目は荒川区。4つ目（江戸川区）は、マウスを載せた見た目を固定しています',
  },
  { label: '開いた状態（指用）', note: '指で操作するときの寸法（高さ 44px）' },
  {
    label: '閉じた状態',
    note: '押すと開きます。開いた直後は、選んだ項目がマウスを載せた見た目になります',
  },
];

const wards = [
  { label: '足立区', value: 'adachi' },
  { label: '荒川区', value: 'arakawa' },
  { label: '板橋区', value: 'itabashi' },
  { label: '江戸川区', value: 'edogawa' },
  { label: '大田区', value: 'ota' },
];

// 選択肢の下に重なる本文。浮かぶ面と下の内容の境目を見るため、選択肢より長くする
const Backdrop = () => (
  <p className="text-sm leading-6 text-fg-muted">
    お届け先の住所を選んでください。選んだ区によって、お届けまでの日数が変わります。離島などの一部の地域には、お届けできないことがあります。
    ご不在のときは、不在票をお入れします。再配達は、不在票に書かれた番号からお申し込みください。お届けの日時は、ご注文のあとでも変えられます。
    変えたいときは、お届けの前日までにご連絡ください。ご注文の内容は、マイページからいつでも確かめられます。お届け先を複数お持ちの場合は、ご注文ごとに選び直せます。お届けできない地域を選んだときは、この欄の下にお知らせを出します。
  </p>
);

// 開いたまま固定する。浮かぶ部分をこのセルの中に描き、行ごとのトークンが効くようにする
// 画面の外にある行でも下に開くよう、反対側に出さない
const OpenSelect = ({ density }: { density: 'fine' | 'coarse' }) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setContainer}
      data-density={density}
      data-highlight-preview
      className="relative flex flex-col gap-3"
    >
      {container && (
        <Select
          label="住所"
          prefix="東京都"
          items={wards}
          defaultValue="arakawa"
          open
          modal={false}
          container={container}
          collisionAvoidance={{ side: 'none', align: 'none' }}
          // 比べたときの見た目（高さの上限と続きの影がない — 後半の軸 19 より前）で固定する
          popoverMaxHeight="none"
          popoverMoreCue="none"
        />
      )}
      <Backdrop />
    </div>
  );
};

const ClosedSelect = () => (
  <div className="flex flex-col gap-3">
    <Select label="住所" prefix="東京都" items={wards} defaultValue="arakawa" />
    <Backdrop />
  </div>
);

// 開いた直後は選んだ項目が hover の状態になるので、それを外し、4つ目にマウスを載せた見た目を固定する
const highlightPreview = [
  '[data-highlight-preview] [role="option"][data-highlighted] { background-color: transparent; }',
  '[data-highlight-preview] [role="option"][data-highlighted][data-selected] { background-color: var(--color-select-item-selected); }',
  '[data-highlight-preview] [role="option"]:nth-child(4) { background-color: var(--color-select-item-highlight); }',
].join('\n');

// 開いたままの選択肢がフォーカスを取り、ページが最後の行までスクロールするのを戻す
const ResetFocus = () => {
  useEffect(() => {
    const id = setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      window.scrollTo(0, 0);
    }, 300);
    return () => clearTimeout(id);
  }, []);
  return null;
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/18 Select の選択肢',
  id: 'design-review-18-select-popup',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'E1' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'E1', 'E2', 'E3'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <>
      <style>{highlightPreview}</style>
      <ResetFocus />
      <Comparison
        index={18}
        axis="Select の選択肢の見た目"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={(column) =>
          column.label === '閉じた状態' ? (
            <ClosedSelect />
          ) : (
            <OpenSelect density={column.label === '開いた状態（指用）' ? 'coarse' : 'fine'} />
          )
        }
      >
        <p>
          <strong className="text-fg">決定: E1 影＋細い境界線＋青</strong>
          （ADR-0036）。「E1 でよさそう。」
        </p>
        <p>
          Select
          を開いたときに浮かぶ選択肢の見た目を選びます。画面の下から出るシート（ボトムシート）に切り替えるかは、見た目が決まってから比べます。
        </p>
        <p>
          2回目: 「原則1もかなり最初の方に決めたので、例外があってもいいなあとは思います。輪郭が A
          と B
          の間、影はいまと同じ、選択したものは青に、の3つを合わせるとどうでしょうか？」を受けて、A
          の影と C の選んだ項目の青に、A と B の間の濃さの輪郭を合わせた E1〜E3
          を足しました。1回目の C（選んだ項目を淡い青に）と
          D（欄と同じグレーの面）の行は外しています。
        </p>
        <p>
          影を付ける案を選ぶと、原則1（影は塗りのあるボタンにのみ付ける）に「浮かぶ UI
          の影は、押せることではなく重なりを表す」という例外を足します。
        </p>
        <p>
          項目の高さは入力欄と同じ（マウス用 40px、指用 44px）、角丸は面の角丸と同心です。hover
          は、キーボードの上下で選んでいるときも同じ見た目になります。
        </p>
      </Comparison>
    </>
  ),
};
