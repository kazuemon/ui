import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Slider, type SliderProps } from '../../src/components/slider/Slider';
import { statePseudo } from '../../src/stories/story-states';

// 軸 321: Slider の見た目（トラックの太さ・地の色、つまみの大きさ・塗り・影）
//   現行版は、部品を作ったときに原則にない判断として仮に置いた形（backlog の Slider）
//   候補は design/tokens.css の上書きだけで作る。部品のコードは分けない
//   値の文字の位置・読み上げ・押せる範囲・キーボード・押せないときと読み取り専用の扱いは、この軸に含めない（backlog に残す）
//   色は primary で比べる。B のつまみの塗りは、いまの部品では白（--color-surface）なので、行の中だけ部品の色に差し替えて見せる

const candidates: Candidate[] = [
  {
    id: 'current',
    name: 'バーの延長・白いつまみ',
    intent:
      'トラックは Meter の標準と同じ太さのバー。地はトグルの OFF と同じグレー、値までを部品の色で塗る。つまみはトグルのノブと同じ白い丸に、白いボタンと同じ輪郭の線を持つ影',
    spec: [
      ['トラックの太さ', '8px（Meter の md）'],
      ['地の色', 'トグルの OFF と同じグレー'],
      ['つまみ', '白い丸・直径 20px（指 24px）'],
      ['つまみの影', '白いボタンと同じ（輪郭の線あり）'],
    ],
    tokens: {
      '--slider-track-height': 'var(--bar-height-md)',
      '--slider-thumb-size-fine': 'calc(var(--spacing) * 5)',
      '--slider-thumb-size-coarse': 'calc(var(--spacing) * 6)',
      '--slider-thumb-shadow': 'var(--shadow-raised)',
    },
  },
  {
    id: 'A',
    name: '細いトラック・大きいつまみ',
    intent:
      'トラックを Meter の sm まで細くして、線に近い軽い見た目にする（判断の基準の「軽い」）。細くした分、つまみを一段大きくして、押す場所をはっきりさせる',
    spec: [
      ['トラックの太さ', '4px（Meter の sm）'],
      ['地の色', 'トグルの OFF と同じグレー'],
      ['つまみ', '白い丸・直径 24px（指 28px）'],
      ['つまみの影', '白いボタンと同じ（輪郭の線あり）'],
    ],
    tokens: {
      '--slider-track-height': 'var(--bar-height-sm)',
      '--slider-thumb-size-fine': 'calc(var(--spacing) * 6)',
      '--slider-thumb-size-coarse': 'calc(var(--spacing) * 7)',
      '--slider-thumb-shadow': 'var(--shadow-raised)',
    },
  },
  {
    id: 'B',
    name: '部品の色のつまみ',
    intent:
      'つまみを部品の色で塗り、白い縁で塗りと分ける。つまみが値の先端として目に入る。採るときは、つまみの塗りを部品のトークンにする（いまは白の面の色を読んでいる）',
    spec: [
      ['トラックの太さ', '8px（Meter の md）'],
      ['地の色', 'トグルの OFF と同じグレー'],
      ['つまみ', '部品の色の丸・白い縁 3px・直径 20px（指 24px）'],
      ['つまみの影', '白いボタンと同じ（輪郭の線あり）'],
    ],
    tokens: {
      '--slider-track-height': 'var(--bar-height-md)',
      '--slider-thumb-size-fine': 'calc(var(--spacing) * 5)',
      '--slider-thumb-size-coarse': 'calc(var(--spacing) * 6)',
      '--slider-thumb-shadow': 'inset 0 0 0 3px var(--palette-white), var(--shadow-raised)',
      '--color-surface': 'var(--color-primary)',
    },
  },
];

const columns: Column[] = [
  { label: '通常' },
  { label: 'hover', note: '地が半段濃くなる', preview: 'hover' },
  { label: 'フォーカス（キーボード）', note: 'つまみの外側に線', preview: 'focus' },
  { label: 'エラー', note: '地を赤みのグレー、つまみの内側に赤い線' },
  { label: '押せない' },
];

const cellProps: Record<string, Partial<SliderProps>> = {
  エラー: { errorText: '50 以下にしてください' },
  押せない: { disabled: true },
};

const meta = {
  title: 'Design Review/0321 Sliderの見た目',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: '[data-slot="slider-control"]',
      focusVisible: '[data-slot="slider-thumb"] input',
    }),
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Candidates: Story = {
  name: '候補',
  render: () => (
    <Comparison
      index={321}
      pick="current"
      axis="Slider の見た目（トラックの太さ・つまみ）"
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <div className="w-[260px]">
          <Slider label="音量" defaultValue={40} color="primary" {...cellProps[column.label]} />
        </div>
      )}
    >
      <p>
        トラックの太さと、つまみの大きさ・塗りを比べます。値の文字の位置や押せる範囲、押せないときの扱いはこの軸に含めません。
      </p>
      <p>
        どれを既定にするかと、ほかの形も選べるようにするか（たとえば <code>size</code>{' '}
        で太さを選ぶ）を教えてください。つまみの大きさは、指の密度（ツールバーの「密度」）でも確かめてください。
      </p>
    </Comparison>
  ),
};
