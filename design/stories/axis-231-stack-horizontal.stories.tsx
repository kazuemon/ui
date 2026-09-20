import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../src/components/button/Button';
import { Stack, type StackProps } from '../../src/components/stack/Stack';
import { Text } from '../../src/components/text/Text';
import { type Candidate, Comparison } from './Comparison';

// 軸 231: 横に並べるときの、揃えと折り返しの既定。行ごとに Stack の props を明示して比べる
const meta = {
  title: 'Design Review/231 Stack の横並びの既定',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

const props: Record<string, Partial<StackProps>> = {
  current: { align: 'stretch', wrap: true },
  B: { align: 'center', wrap: false },
  C: { align: 'center', wrap: true },
};

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '縦と同じ（stretch）＋折り返す',
    intent:
      '向きで既定が変わらない。高さの違う子は上下いっぱいに伸びるが、上下中央にしたいときは align="center" で指定する。狭いと次の行へ回る（縦では効かない）',
    spec: [
      ['align', 'stretch（縦横とも）'],
      ['wrap', 'する（既定。縦では無視）'],
    ],
  },
  {
    id: 'B',
    name: '横は上下中央（折り返さない）',
    intent:
      '横に並べるのは、ボタンと文字のように高さの違うものが多い。中央に揃うので、そのまま置ける',
    spec: [
      ['align', '横のとき center'],
      ['wrap', 'しない'],
    ],
  },
  {
    id: 'C',
    name: '横は上下中央で折り返す',
    intent: 'ボタンの行が狭い画面で切れず、次の行へ回る。子が増えると高さが変わる',
    spec: [
      ['align', '横のとき center'],
      ['wrap', 'する'],
    ],
  },
];

export const Horizontal: Story = {
  name: '横並びの既定',
  render: () => (
    <Comparison
      index={231}
      pick="current"
      axis="Stack の横並びの揃えと折り返しの既定"
      candidates={candidates}
      columns={[{ label: '広い（幅 480）' }, { label: '狭い（幅 220）' }]}
      renderCell={(column, candidate) => (
        <div
          className="rounded-control bg-neutral p-2"
          style={{ width: column.label.includes('480') ? 480 : 220 }}
        >
          <Stack direction="horizontal" gap="sm" {...props[candidate.id]}>
            <Text>保存の確認</Text>
            <Button>保存</Button>
            <Button>やめる</Button>
            <Button>あとで</Button>
          </Stack>
        </div>
      )}
    >
      <p>
        決定: current（縦と同じ stretch）＋ wrap ありを既定にする。「align=&quot;center&quot;
        とかで指定できれば問題なさそう」。
      </p>
      <p>横に並べるときの揃えと折り返しの既定を選びます。縦の既定は、どの案でも stretch です。</p>
    </Comparison>
  ),
};
