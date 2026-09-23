import type { Meta, StoryObj } from '@storybook/react-vite';

import { Toggle } from '../../src/components/toggle/Toggle';
import { ToggleGroup } from '../../src/components/toggle/ToggleGroup';
import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 267: Toggle の角丸。値は tokens.css の --toggle-radius
// Button と同じ部品の角（control・12px）にするか、Tag・Chip・Switch と同じ小物の pill にするかが未決
//   principles.md 原則5 は「pill は、小物（タグ、トグル）と…」と書いているが、この「トグル」は Switch（トラックが pill）を指しており、
//   新しい Toggle（押すボタン）がどちらの仲間かはまだ決めていない
const meta = {
  title: 'Design Review/267 Toggle の角丸',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

const candidates: Candidate[] = [
  {
    id: 'current',
    name: 'control（部品の角）',
    intent:
      'Button・入力欄と同じ角（12px）。「操作」の仲間として、押すもの全体（Button・Link）と角がそろう',
    spec: [['角丸', '--radius-control（12px）']],
  },
  {
    id: 'A',
    name: 'pill（小物の角）',
    intent:
      'Tag・Chip・Switch と同じ完全な丸。principles.md 原則5の「小物は pill」に寄せる。選ぶ・押すという働きよりも、小さな部品としての見た目を優先する',
    spec: [['角丸', '--radius-pill']],
    tokens: { '--toggle-radius': 'var(--radius-pill)' },
  },
];

const columns: Column[] = [
  { label: '単独・OFF' },
  { label: '単独・ON' },
  { label: 'グループ（gap）' },
  { label: 'グループ（connected）' },
  { label: 'アイコンだけ' },
];

export const ToggleRadius: Story = {
  name: '角丸',
  render: () => (
    <Comparison
      index={267}
      axis="Toggle の角丸（control か pill か）"
      pick="current"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        switch (column.label) {
          case '単独・OFF':
            return <Toggle color="primary">太字</Toggle>;
          case '単独・ON':
            return (
              <Toggle color="primary" defaultPressed>
                太字
              </Toggle>
            );
          case 'グループ（gap）':
            return (
              <ToggleGroup aria-label={`${candidate.id} の文字の飾り`} defaultValue={['bold']}>
                <Toggle value="bold">太字</Toggle>
                <Toggle value="italic">斜体</Toggle>
                <Toggle value="underline">下線</Toggle>
              </ToggleGroup>
            );
          case 'グループ（connected）':
            return (
              <ToggleGroup
                aria-label={`${candidate.id} の並べ方`}
                frame="connected"
                defaultValue={['bold']}
              >
                <Toggle value="bold">太字</Toggle>
                <Toggle value="italic">斜体</Toggle>
                <Toggle value="underline">下線</Toggle>
              </ToggleGroup>
            );
          default:
            return (
              <Toggle iconOnly aria-label="表示を切り替える" color="primary" defaultPressed>
                <span aria-hidden className="text-base leading-none">
                  ★
                </span>
              </Toggle>
            );
        }
      }}
    >
      <p>決定: current（control）のまま。</p>
      <p>
        Toggle
        の角丸を選びます。control（現行版）は、Button・入力欄と同じ角で、「操作」の仲間の一員に見えます。pill（A）は、Tag・Chip・Switch
        と同じ完全な丸で、小さな選べる部品らしく見えます。グループにしたとき（gap・connected）や、アイコンだけのときの見え方も比べてください。
      </p>
      <p>
        README では Toggle は Button・Link・ButtonGroup と同じ「操作」の仲間に並んでおり、Button
        と同じ角にそろえたほうが、押すもの全体で一貫します。pill
        にすると、押すたびに軽く見える一方、Button
        と並べて使う場面（ツールバーの隣に保存ボタンがあるなど）で角の違いが目立つため、control
        のままにした。
      </p>
    </Comparison>
  ),
};
