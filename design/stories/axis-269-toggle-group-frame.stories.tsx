import type { Meta, StoryObj } from '@storybook/react-vite';

import { Toggle } from '../../src/components/toggle/Toggle';
import { ToggleGroup, type ToggleGroupFrame } from '../../src/components/toggle/ToggleGroup';
import { ListIcon } from '../../src/internal/icons';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 269: ToggleGroup の詰め方（frame）。値は tokens.css の --toggle-group-*
//   候補は frame の指定を行ごとに変える（Comparison.tsx の「candidate は…部品の指定（props）を行ごとに変える軸で使う」）
//   Segmented Control（README「入力」の未実装）と役割が重ならないよう、track で滑る印は持たせていない
const meta = {
  title: 'Design Review/269 ToggleGroup の詰め方',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

const frameOf: Record<string, ToggleGroupFrame> = {
  current: 'gap',
  A: 'connected',
};

const candidates: Candidate[] = [
  {
    id: 'current',
    name: 'gap（離して並べる）',
    intent: 'それぞれ独立した Toggle として、間を空けて並べる。1つずつの押せる範囲がはっきりする',
    spec: [['詰め方', 'gap']],
  },
  {
    id: 'A',
    name: 'connected（隣り合わせ）',
    intent:
      '隣り合わせて仕切りの細い線で区切り、両端だけ角丸を残す。ツールバーのボタン列によくある形で、「ひとまとまりの操作」に見える',
    spec: [['詰め方', 'connected']],
  },
];

const columns: Column[] = [
  { label: '3つ並べる（文字・複数選べる）' },
  { label: 'アイコンだけ（1つだけ選べる）' },
];

export const GroupFrame: Story = {
  name: '詰め方',
  render: () => (
    <Comparison
      index={269}
      axis="ToggleGroup の詰め方（gap・connected）"
      pick="current,A"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const frame = frameOf[candidate.id];
        if (column.label === 'アイコンだけ（1つだけ選べる）')
          return (
            <ToggleGroup
              aria-label={`${candidate.id} の並べ方`}
              frame={frame}
              color="primary"
              defaultValue={['list']}
            >
              <Toggle value="list" iconOnly aria-label="リスト表示">
                <ListIcon standalone />
              </Toggle>
              <Toggle value="grid" iconOnly aria-label="グリッド表示">
                <ListIcon standalone />
              </Toggle>
            </ToggleGroup>
          );
        return (
          <ToggleGroup
            aria-label={`${candidate.id} の文字の飾り`}
            frame={frame}
            multiple
            color="primary"
            defaultValue={['bold']}
          >
            <Toggle value="bold">太字</Toggle>
            <Toggle value="italic">斜体</Toggle>
            <Toggle value="underline">下線</Toggle>
          </ToggleGroup>
        );
      }}
    >
      <p>
        決定: A（connected）を既定にし、gap（現行版）も frame で選べるようにする。inset
        は候補から外した。
      </p>
      <p>
        ToggleGroup（複数の Toggle をまとめたもの）の詰め方を選びます。gap（現行版）は Button
        をいくつも並べるのと同じ感覚で、それぞれ独立して見えます。connected（A）は隣り合わせて仕切りの線を引き、ツールバーのように「ひとまとまりの操作」に見せます。
      </p>
      <p>
        ToggleGroup
        は「文字の装飾（複数選べる）」「表示の切り替え（1つだけ選べる）」のどちらの使い方でも、隣り合わせたほうが1つの操作として読み取りやすいので
        connected を既定にした。gap は、Toggle
        1つずつの押せる範囲をはっきりさせたいときに選べる。inset は Segmented Control（README
        未実装）の役割と近いので、候補から外した。
      </p>
    </Comparison>
  ),
};
