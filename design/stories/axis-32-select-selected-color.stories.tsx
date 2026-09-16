import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';

import { Select, type SelectColor } from '../../src/components/Select';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 32: Select の選んだ項目の色
// 決まったこと（ADR-0047）: 選んでいることを示す印は部品の色に従い、指定しないときはグレー。部品の色によらず青が既定なのはフォーカスの線だけ
// Select に color（primary・secondary・neutral。既定 neutral）を足した。ここでは、hover・キーボードの選択（グレーの塗り）と
// 選んだ項目をどう見分けるかを比べる
// 変えるのは次のトークンだけ（src/components/Select.tsx の selectedTokens が読む）
//   --select-item-selected-fill: 部品の色の淡い面を敷くか（0 か 1）
//   --select-item-selected-ink: ラベルを部品の色にするか（0 か 1。0 はほかの項目と同じ濃紺）
//   --select-item-selected-weight: ラベルの太さ
//   --color-select-neutral-selected: 色なし（neutral）の淡い面
// 現行版は、いまの見た目（部品の色によらず青）を、4つの色のトークンを直接指定して再現する

const axisValues = (fill: 0 | 1, ink: 0 | 1, weight: 400 | 700) => ({
  '--select-item-selected-fill': String(fill),
  '--select-item-selected-ink': String(ink),
  '--select-item-selected-weight': String(weight),
  '--color-select-neutral-selected': 'var(--palette-gray-200)',
});

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'いつも青の淡い面',
    intent:
      'いまの見た目（ADR-0036）。部品の色によらず、選んだ項目は淡い青の面に青い文字とチェック。hover は面を一段濃くする。',
    spec: [
      ['面', '淡い青 #E9F2FE（色によらない）'],
      ['文字・チェック', '青 #196BD6（色によらない）'],
      ['選んだ項目の hover', '淡い青を一段濃く'],
      ['色なしのとき', '青のまま'],
    ],
    tokens: {
      ...axisValues(1, 1, 400),
      '--color-select-item-selected': 'var(--color-tag-primary)',
      '--color-select-item-selected-highlight':
        'color-mix(in oklab, var(--color-tag-primary), var(--color-on-tag-primary) 8%)',
      '--color-on-select-item-selected': 'var(--color-on-tag-primary)',
      '--color-select-check': 'var(--color-on-tag-primary)',
    },
  },
  {
    id: 'A',
    name: 'チェックと文字の色だけ',
    intent:
      '面は敷かず、ラベルとチェックを部品の色にする。面はいつも hover のグレーだけになり、塗りの意味が1つにそろう。色なしでは、チェックだけで見分ける。',
    spec: [
      ['面', 'なし'],
      ['文字・チェック', '部品の色（青 #196BD6・ピンク #D7005D・色なしは濃紺）'],
      ['選んだ項目の hover', 'ほかの項目と同じグレー'],
      ['色なしのとき', '濃紺のチェックだけ'],
    ],
    tokens: axisValues(0, 1, 400),
  },
  {
    id: 'B',
    name: '部品の色の淡い面＋チェック',
    intent:
      '現行版の形を部品の色に従わせる。面は色のタグと同じ淡い面。色なしの面は、hover のグレー（#F2F4F4）と見分けられるよう、一段濃いグレーにする。いまの部品の既定。',
    spec: [
      ['面', '淡い青 #E9F2FE・淡いピンク #FFEBEE・色なしはグレー #E1E3E4'],
      ['文字・チェック', '部品の色（色なしは濃紺）'],
      ['選んだ項目の hover', '面を一段濃く（文字の色を 8% 混ぜる）'],
      ['色なしのとき', 'グレーの面＋濃紺の文字とチェック'],
    ],
    tokens: axisValues(1, 1, 400),
  },
  {
    id: 'C',
    name: '太字＋チェック',
    intent:
      '面は敷かず、ラベルを太字にする。ラベルの色はほかの項目と同じ濃紺で、部品の色はチェックにだけ出す。色なしでも、太さで見分けられる。',
    spec: [
      ['面', 'なし'],
      ['文字', '太字・濃紺（色によらない）'],
      ['チェック', '部品の色（色なしは濃紺）'],
      ['選んだ項目の hover', 'ほかの項目と同じグレー'],
      ['色なしのとき', '太字＋濃紺のチェック'],
    ],
    tokens: axisValues(0, 0, 700),
  },
  {
    id: 'D',
    name: 'B ＋太字',
    intent:
      'B の淡い面とチェックに、ラベルの太字を足す。面と色は B と同じで、太さでも見分けられる。色なしのグレーの面でも、太さが残る。',
    spec: [
      ['面', '淡い青 #E9F2FE・淡いピンク #FFEBEE・色なしはグレー #E1E3E4'],
      ['文字・チェック', '太字・部品の色（色なしは濃紺）'],
      ['選んだ項目の hover', '面を一段濃く（文字の色を 8% 混ぜる）'],
      ['色なしのとき', 'グレーの面＋濃紺の太字とチェック'],
    ],
    tokens: axisValues(1, 1, 700),
  },
];

const colorOf = (column: Column): SelectColor =>
  column.label.startsWith('青')
    ? 'primary'
    : column.label.startsWith('ピンク')
      ? 'secondary'
      : 'neutral';

const states = [
  {
    preview: 'selected-hover',
    label: '選んだ項目に hover',
    note: '開いた直後もこの状態です',
  },
  { preview: 'other-hover', label: '別の項目に hover', note: '4つ目（江戸川区）に載せています' },
];

const columns: Column[] = ['色なし（neutral）', '青（primary）', 'ピンク（secondary）'].flatMap(
  (color) =>
    states.map((state) => ({
      label: `${color}・${state.label}`,
      note: state.note,
      preview: state.preview,
    }))
);

const wards = [
  { label: '足立区', value: 'adachi' },
  { label: '荒川区', value: 'arakawa' },
  { label: '板橋区', value: 'itabashi' },
  { label: '江戸川区', value: 'edogawa' },
  { label: '大田区', value: 'ota' },
];

// hover（data-highlighted）はマウスを載せた項目に付くので、列ごとに CSS で固定する
// 選んだ項目の見た目は、部品が一覧に書き戻したトークン（--color-select-item-selected など）を読む
const hoverPreview = [
  '[data-preview] [role="option"][data-highlighted] { background-color: transparent; }',
  '[data-preview="selected-hover"] [role="option"][data-selected] { background-color: var(--color-select-item-selected-highlight); }',
  '[data-preview="other-hover"] [role="option"][data-selected] { background-color: var(--color-select-item-selected); }',
  '[data-preview="other-hover"] [role="option"]:nth-child(4) { background-color: var(--color-select-item-highlight); }',
  // 画面の外にある行では、本体の下の空き（--available-height）が 0 近くになり、一覧が縮んで描かれる。5件をすべて出す
  '[data-preview] [role="listbox"] { max-height: none; }',
].join('\n');

// 開いたままの選択肢がフォーカスを取り、ページが最後の行・最後の列までスクロールするのを戻す
const ResetFocus = () => {
  useEffect(() => {
    const id = setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      window.scrollTo(0, 0);
      for (const el of document.querySelectorAll('.overflow-x-auto')) el.scrollLeft = 0;
    }, 300);
    return () => clearTimeout(id);
  }, []);
  return null;
};

// 浮かぶ選択肢を開いたまま固定する。浮かぶ部分をこのセルの中に描き、行ごとのトークンが効くようにする
const OpenPopover = ({ color }: { color: SelectColor }) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer} data-density="fine" className="relative h-[290px]">
      {container && (
        <Select
          label="住所"
          color={color}
          items={wards}
          defaultValue="arakawa"
          presentation="popover"
          open
          modal={false}
          container={container}
          collisionAvoidance={{ side: 'none', align: 'none' }}
          // セルの高さ（290px）を画面の高さとみなして上限をかけないよう、5件をすべて出す
          popoverMaxHeight="none"
          popoverMoreCue="none"
        />
      )}
    </div>
  );
};

// スマートフォンの画面（幅は列に合わせて 320px まで、高さ 440px）。指で操作する密度で、シートを開いたまま固定する
// 幅を固定すると、隣の列に重なってチェックと × が隠れる。高さいっぱいで開き、4つ目（hover を載せる項目）まで出す
const OpenSheet = ({ color }: { color: SelectColor }) => {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setFrame}
      data-density="coarse"
      className="relative h-[440px] w-full max-w-[320px] [transform:translateZ(0)] overflow-clip rounded-[28px] border border-line bg-bg"
    >
      <div className="flex flex-col gap-5 px-5 pt-8">
        {frame && (
          <Select
            label="住所"
            color={color}
            items={wards}
            defaultValue="arakawa"
            presentation="sheet"
            sheetDetent="full"
            open
            modal={false}
            container={frame}
          />
        )}
      </div>
    </div>
  );
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/32 Select の選んだ項目の色',
  id: 'design-review-32-select-selected-color',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'D' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

const Description = ({ sheet }: { sheet: boolean }) => (
  <>
    <p>
      <strong className="text-fg">決まったこと</strong>
      （ADR-0047、ADR-0053）。選んだ項目の印は部品の色に従い、色を指定しないときはグレーにします。部品の色によらず青が既定なのは、フォーカスの線だけです。Select
      に <code>color</code>（<code>primary</code>・<code>secondary</code>・<code>neutral</code>
      。既定は <code>neutral</code>）を足しました。
    </p>
    <p>
      ここで選ぶのは、hover
      やキーボードの選択（どの色でもグレーの塗り）と、選んだ項目の見分け方です。現行版は、いまの見た目（部品の色によらず青）です。B
      は、現行版の形を部品の色に従わせたもので、比べたときの部品の既定です。D は B
      にラベルの太字を足したものです。
    </p>
    <p>
      列は、色なし・青・ピンクのそれぞれで、「選んだ項目に hover
      が重なるとき（開いた直後もこの状態）」と「別の項目に hover しているとき」です。hover
      の塗りは固定しています。
      {sheet
        ? 'ここは画面の下から出るシート（指で操作する寸法）です。浮かぶ選択肢は「候補」のストーリーにあります。'
        : '浮かぶ選択肢（マウスで操作する寸法）です。画面の下から出るシートは「ボトムシート」のストーリーで見られます。'}
    </p>
    <p>どれを既定にするかを一言添えてください（「X を既定にして、Y も選べる」でも構いません）。</p>
  </>
);

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <>
      <style>{hoverPreview}</style>
      <ResetFocus />
      <Comparison
        index={32}
        axis="Select の選んだ項目の色"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={(column) => <OpenPopover color={colorOf(column)} />}
      >
        <Description sheet={false} />
      </Comparison>
    </>
  ),
};

export const Sheet: Story = {
  name: 'ボトムシート',
  render: ({ pick }) => (
    <>
      <style>{hoverPreview}</style>
      <ResetFocus />
      <Comparison
        index={32}
        axis="Select の選んだ項目の色（ボトムシート）"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={(column) => <OpenSheet color={colorOf(column)} />}
      >
        <Description sheet />
      </Comparison>
    </>
  ),
};
