import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Dropzone } from '../../src/components/dropzone/Dropzone';

// 軸378で filled（面だけ）が既定になったので、箱の中の「ファイルを選択」ボタンが
// グレーの面に埋もれないようにする軸。候補はどれも既存の Button の variant・color の組み合わせ
// （新しいトークンは足していない。Comparison.tsx の「候補は部品の指定（props）で変える」使い方）
const buttonPropsById: Record<string, Pick<ComponentProps<typeof Button>, 'variant' | 'color'>> = {
  current: { variant: 'outline', color: 'neutral' },
  A: { variant: 'filled', color: 'white' },
  B: { variant: 'filled', color: 'primary' },
  C: { variant: 'outline', color: 'primary' },
};

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '枠線・グレー（軸378決定前の形）',
    intent: 'いままでの見た目。塗りのない箱ではよく見えたが、面だけの箱では枠線がほぼ埋もれる',
    spec: [
      ['variant', 'outline'],
      ['color', 'neutral'],
    ],
  },
  {
    id: 'A',
    name: '塗り・白',
    intent:
      '白い面のボタン（影と輪郭で押せることを示す）。原則1の「白いものを白い地に浮かせるときは輪郭を足す」と同じ考えで、グレーの面の上でも輪郭と影で浮く。color props の値によらず同じ見た目になる',
    spec: [
      ['variant', 'filled'],
      ['color', 'white'],
    ],
  },
  {
    id: 'B',
    name: '塗り・primary',
    intent:
      '進めたい操作の強さ（原則7）で目立たせる。ただしボタン自体は飾りで、箱全体が押せる範囲なので、実際より強く見えすぎるおそれがある',
    spec: [
      ['variant', 'filled'],
      ['color', 'primary'],
    ],
  },
  {
    id: 'C',
    name: '実線・primary',
    intent: '塗りより軽い強さ。ドラッグ中の色に primary を選んだときは、線の色が重なって見える',
    spec: [
      ['variant', 'outline'],
      ['color', 'primary'],
    ],
  },
];

const columns: Column[] = [{ label: '面だけ（filled）の上' }];

const meta = {
  title: 'Design Review/382 面の上のボタンの色',
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Compare: Story = {
  render: () => (
    <Comparison
      index={382}
      pick="A,B"
      axis="Dropzone の面（filled）の上に置く、「ファイルを選択」ボタンの色"
      candidates={candidates}
      columns={columns}
      renderCell={(_column, candidate) => (
        <div className="w-64">
          <Dropzone label="画像" caption="JPEG・PNG、1 つ 5MB まで">
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-fg-subtle">（中身の案内は省略）</p>
              <Button type="button" tabIndex={-1} {...buttonPropsById[candidate.id]}>
                ファイルを選択
              </Button>
            </div>
          </Dropzone>
        </div>
      )}
    >
      <p>
        決定: A（塗り・白）を既定にし、B（塗り・primary）も Dropzone の `buttonColor`
        で選べる。線だけのボタンは地の面と色の差がなく、ボタンだと分かりにくいため。
      </p>
      <p>
        軸378で、Dropzone の既定の枠を「面だけ（filled、グレーの塗り）」にしました。中の
        「ファイルを選択」の見た目のボタン（押せるのは箱全体で、このボタン自体は飾りです）が、
        いままでの枠線・グレーのままだと面に埋もれます。ここでは Button
        の組み合わせだけで作れる候補を並べました（新しいトークンは足していません）。
      </p>
      <p>
        推すのは A（塗り・白）です。グレーの面の上でも輪郭と影で浮き、`color`
        props（受け付けるときの色）を primary・secondary に変えても同じ見た目のまま使えます。B・C
        は目立ちますが、ボタン自体は押せないただの飾りなので、
        実際より強い操作に見えるおそれがあり、C は `color="primary"`
        を選んだときに受け付ける色の線と重なって見えます。
      </p>
    </Comparison>
  ),
};
