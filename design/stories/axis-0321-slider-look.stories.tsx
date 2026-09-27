import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Slider, type SliderProps } from '../../src/components/slider/Slider';
import { statePseudo } from '../../src/stories/story-states';

// 軸 321: Slider を押しているあいだ（つまみかトラックを押してから離すまで）の手応え
//   1 回目はトラックの太さ・つまみの塗りを比べたが、「押している間の実感が薄い」との返事で、押しているあいだの見た目に絞って比べ直す
//   （トラックの太さ・つまみの塗りは backlog に戻した）
//   現行版は押しても何も変えない形（つまみ自体が動くので沈ませない — 原則3）
//   候補は design/tokens.css の --slider-*-press-* の上書きだけで作る。部品は data-dragging（Base UI）と :active で押しているあいだを見る
//   「押している間」の列は、トラックに :active を当てて固定する（pseudo-states）。実際に引いているときも同じ見た目になる
//   色は primary で比べる。値の文字の位置・読み上げ・押せる範囲・キーボード・押せないときの扱いはこの軸に含めない

const noPress = {
  '--slider-thumb-press-scale': '1',
  '--slider-thumb-press-shadow': 'var(--shadow-raised)',
  '--slider-thumb-press-halo': '0px',
  '--slider-thumb-press-halo-mix': '24%',
  '--slider-fill-press-darken': '0%',
};

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '変えない',
    intent:
      '押しても、つまみ・影・塗りを変えない。つまみが指やポインタについて動くこと自体を手応えにする',
    spec: [
      ['つまみの大きさ', 'そのまま'],
      ['つまみの影', 'そのまま（白いボタンと同じ）'],
      ['つまみの外側', 'なし'],
      ['塗り', 'そのまま'],
    ],
    tokens: noPress,
  },
  {
    id: 'A',
    name: 'つまみが膨らむ',
    intent:
      '押しているあいだ、つまみを一回り大きくする。指の下でつかんでいることが、指の外にはみ出す縁で見える',
    spec: [
      ['つまみの大きさ', '1.25 倍（20px → 25px、指 24px → 30px）'],
      ['つまみの影', 'そのまま'],
      ['つまみの外側', 'なし'],
      ['塗り', 'そのまま'],
    ],
    tokens: { ...noPress, '--slider-thumb-press-scale': '1.25' },
  },
  {
    id: 'B',
    name: 'つまみの周りに輪',
    intent:
      '押しているあいだ、つまみの外側に塗りの色を淡くした輪を出す。つまみの大きさは変えず、つかんでいる範囲を色で見せる',
    spec: [
      ['つまみの大きさ', 'そのまま'],
      ['つまみの影', 'そのまま'],
      ['つまみの外側', '塗りの色 24% の輪、幅 6px'],
      ['塗り', 'そのまま'],
    ],
    tokens: {
      ...noPress,
      '--slider-thumb-press-halo': 'calc(var(--spacing) * 1.5)',
    },
  },
  {
    id: 'C',
    name: '持ち上がり、塗りが濃くなる',
    intent:
      '押しているあいだ、つまみの影を濃く広くして持ち上げ、値までの塗りを一段濃くする。押すと沈む原則3とは逆向きなので、つまみを「つかんで持ち上げる」と読めるかを見る',
    spec: [
      ['つまみの大きさ', 'そのまま'],
      ['つまみの影', '濃く広い影（下へ 3px、ぼかし 10px）'],
      ['つまみの外側', 'なし'],
      ['塗り', '本文の色を 15% 混ぜて濃く'],
    ],
    tokens: {
      ...noPress,
      '--slider-thumb-press-shadow':
        '0 3px 10px rgb(from var(--color-shadow) r g b / 0.35), 0 0 0 1px rgb(from var(--color-shadow) r g b / 0.06)',
      '--slider-fill-press-darken': '15%',
    },
  },
];

const columns: Column[] = [
  { label: '通常' },
  { label: 'hover', note: '地が半段濃くなる', preview: 'hover' },
  { label: '押している間', note: 'つまみかトラックを押してから離すまで', preview: 'active' },
  { label: 'フォーカス（キーボード）', note: 'つまみの外側に線', preview: 'focus' },
  { label: 'エラー' },
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
      active: '[data-slot="slider-control"]',
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
      pick="current,A,B,C"
      axis="Slider を押しているあいだの手応え"
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <div className="w-[220px]">
          <Slider label="音量" defaultValue={40} color="primary" {...cellProps[column.label]} />
        </div>
      )}
    >
      <p>
        決定（ADR-0321）:
        A（つまみが膨らむ）を既定にし、current（変えない）・B（輪）・C（持ち上がる）も選べるようにする。
      </p>
      <p>
        つまみやトラックを押してから離すまでのあいだ、押していることをどう見せるかを比べます。「押している間」の列が、その見た目です。各行の見本は実際に押して引いても同じ見た目になるので、指とマウスでも確かめてください。
      </p>
      <p>
        どれを既定にするかと、ほかの形も選べるようにするかを教えてください。組み合わせ（膨らんで輪も出す、など）もできます。
      </p>
    </Comparison>
  ),
};
