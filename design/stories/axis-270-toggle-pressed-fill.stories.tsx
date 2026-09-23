import type { Meta, StoryObj } from '@storybook/react-vite';

import { Toggle, type ToggleColor, type ToggleVariant } from '../../src/components/toggle/Toggle';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 270: ON（押した）状態の塗りの強さ（variant）。値は tokens.css の --toggle-on-*
//   候補は variant の指定を行ごとに変える（Comparison.tsx の「candidate は…部品の指定（props）を行ごとに変える軸で使う」）
//   OFF はどの案でもグレーで固定（原則6: 選んでいない箱は色を指定していてもグレー）。変わるのは ON の見え方だけ
const meta = {
  title: 'Design Review/270 Toggle の ON の塗り',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

const variantOf: Record<string, ToggleVariant> = {
  current: 'filled',
  A: 'soft',
  B: 'outline',
};

const candidates: Candidate[] = [
  {
    id: 'current',
    name: 'filled（濃い塗り）',
    intent:
      '部品の色の濃い塗りに、白（primary・secondary）か濃紺（neutral）の文字。原則6「選んだものは部品の色の濃い塗り」にそのまま従う',
    spec: [['ON の塗り', 'var(--toggle-accent)（濃い塗り）']],
  },
  {
    id: 'A',
    name: 'soft（淡い面）',
    intent:
      'Chip・Tag と同じ、淡い面に同じ色相の濃い文字。塗りが軽く、アイコンだけのときも重くならない',
    spec: [['ON の塗り', 'var(--toggle-accent-subtle)（淡い面）']],
  },
  {
    id: 'B',
    name: 'outline（淡い面＋枠線）',
    intent: 'soft に、部品の色の枠線を足す。淡い面だけでは白地との差が付きにくい場面の保険',
    spec: [['ON の塗り', 'var(--toggle-accent-subtle) + 枠線']],
  },
];

const columns: Column[] = [
  { label: 'primary・OFF' },
  { label: 'primary・ON' },
  { label: 'secondary・ON' },
  { label: 'neutral・ON' },
];

const colorOf: Record<string, ToggleColor> = {
  'primary・OFF': 'primary',
  'primary・ON': 'primary',
  'secondary・ON': 'secondary',
  'neutral・ON': 'neutral',
};

export const PressedFill: Story = {
  name: 'ON の塗り',
  render: () => (
    <Comparison
      index={270}
      axis="Toggle の ON（押した）状態の塗りの強さ"
      pick="current,A,B"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <Toggle
          color={colorOf[column.label]}
          variant={variantOf[candidate.id]}
          defaultPressed={column.label !== 'primary・OFF'}
        >
          太字
        </Toggle>
      )}
    >
      <p>決定: current（filled）を既定にし、A（soft）・B（outline）も variant で選べる。</p>
      <p>
        Toggle が ON（押した）になったときの塗りの強さを選びます。OFF
        はどの案でもグレーで変わりません（原則6：選んでいない箱は色を指定していてもグレー）。filled（現行版）は原則6の「選んだものは部品の色の濃い塗り」にそのまま従う形です。soft（A）は
        Chip・Tag と同じ淡い面で、ツールバーにいくつも並んでも軽く見えます。outline（B）は soft
        に枠線を足し、白地での見分けやすさを補います。
      </p>
      <p>
        outline は、枠線の太さを OFF のときも透明な線として常に確保するよう部品を直した。ON
        になっても border-width は増えず、色（透明→部品の色）だけが変わるので、OFF・ほかの variant
        と外寸（幅・高さ）が1pxも変わらない。Components/Toggle の「色と塗りの強さ」ストーリーの play
        で、同じラベルのボタンがすべて同じ外寸になることを確かめている。
      </p>
    </Comparison>
  ),
};
