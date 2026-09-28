import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Select } from '../../src/components/select/Select';
import { Text } from '../../src/components/text/Text';
import { TextField } from '../../src/components/text-field/TextField';
import { Textarea } from '../../src/components/textarea/Textarea';
import { type FieldLayout, FieldLayoutContext } from '../../src/internal/field/field-layout';

// 軸 388: ラベルを横に置くときの既定（ラベルの重さ・狭い幅で上に戻すか）と、列をそろえる使い方（subgrid）
//   軸 385 で「既定は上、横（A）も選べる。幅はそろえ打ちにせず subgrid で、ラベルの重さと自動で戻すかは選べる」と決まった
const meta = {
  title: 'Design Review/388 横のラベルの既定',
  id: 'design-review-388-field-start-defaults',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const bold = {
  '--field-start-label-weight': '700',
  '--field-start-label-color': 'var(--color-fg)',
};
const light = {
  '--field-start-label-weight': '400',
  '--field-start-label-color': 'var(--color-fg-muted)',
};

const candidates: Candidate[] = [
  {
    id: 'A',
    name: '太字・戻さない',
    intent: '上に置くラベルと同じ太字。狭くても横のまま。帯でもフォームでも同じ見た目',
    spec: [
      ['ラベル', '太字・本文の色'],
      ['狭い幅', '横のまま'],
    ],
    tokens: bold,
  },
  {
    id: 'B',
    name: '太字・狭いと上に戻す',
    intent: 'A のうえで、欄の幅が 384px より狭いと上に戻す。スマホのフォームで本体が細くならない',
    spec: [
      ['ラベル', '太字・本文の色'],
      ['狭い幅', '上に戻す（384px 未満）'],
    ],
    tokens: bold,
  },
  {
    id: 'C',
    name: '軽い・戻さない',
    intent: '太字にせず一段淡い色。帯の文（「12 件中 1〜5 件」）と同じ重さで、値が目立つ',
    spec: [
      ['ラベル', '標準の太さ・一段淡い色'],
      ['狭い幅', '横のまま'],
    ],
    tokens: light,
  },
  {
    id: 'D',
    name: '軽い・狭いと上に戻す',
    intent: 'C のうえで、狭いと上に戻す。戻ったときも軽いラベルのまま',
    spec: [
      ['ラベル', '標準の太さ・一段淡い色'],
      ['狭い幅', '上に戻す（384px 未満）'],
    ],
    tokens: light,
  },
];

const layoutOf: Record<string, FieldLayout> = {
  A: { labelPlacement: 'start' },
  B: { labelPlacement: 'start', narrowLabelPlacement: 'top' },
  C: { labelPlacement: 'start' },
  D: { labelPlacement: 'start', narrowLabelPlacement: 'top' },
};

const columns: Column[] = [
  { label: '表の下の帯', note: '幅は中身なり' },
  { label: 'フォーム（subgrid）', note: '幅 560px。親の 2 列にそろえる' },
  { label: '狭い幅（subgrid）', note: '幅 320px' },
];

function Frame({ width, children }: { width: number; children: ReactNode }) {
  return (
    <div className="rounded-card border border-line bg-bg p-4" style={{ width }}>
      {children}
    </div>
  );
}

function Form({ width }: { width: number }) {
  return (
    <Frame width={width}>
      {/* 列をそろえる使い方: 親を 2 列の grid・入れ物（@container）にして data-field-grid を付ける。狭い幅で戻すかは、親の幅で測る。ラベルの列は最も長いラベルの幅になる */}
      <div
        data-field-grid
        className="@container grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-6"
      >
        <TextField
          label="表示名"
          caption="ほかの人に見える名前です"
          defaultValue="かずえもん"
          required
        />
        <Select
          label="言語"
          items={[
            { label: '日本語', value: 'ja' },
            { label: 'English', value: 'en' },
          ]}
          defaultValue="ja"
        />
        <Textarea
          label="自己紹介"
          defaultValue="UI を作っています。"
          errorText="URL は入れられません"
        />
      </div>
    </Frame>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={388}
      axis="横のラベルの既定"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <FieldLayoutContext value={layoutOf[candidate.id] ?? {}}>
          {column.label === '表の下の帯' && (
            <Frame width={440}>
              <div className="flex flex-wrap items-end justify-center gap-x-4 gap-y-2">
                <Text
                  as="span"
                  size="sm"
                  variant="muted"
                  className="flex h-(--spacing-control) items-center"
                >
                  12 件中 1〜5 件
                </Text>
                <Select
                  label="1 ページの件数"
                  items={[5, 10, 20].map((size) => ({ label: `${size} 件`, value: String(size) }))}
                  defaultValue="5"
                  className="w-56"
                />
              </div>
            </Frame>
          )}
          {column.label === 'フォーム（subgrid）' && <Form width={560} />}
          {column.label === '狭い幅（subgrid）' && <Form width={320} />}
        </FieldLayoutContext>
      )}
    >
      <p>
        決定（ADR-0367）: 既定は
        A（太字・戻さない）。軽いラベル（C）も選べる。戻すかは選べ、戻す幅は置いた場所の
        24rem（384px）で固定（Pagination の narrowDisplay
        と同じ）。幅を選べるようにするのは、ほかの部品とそろえて backlog で決める。props 名の案は
        narrowLabelPlacement（'start' | 'top'）
      </p>
      <p>
        軸 385
        で、既定はラベルを上に置いたままにし、横に置く形も選べることが決まりました。ラベルの重さと、狭い幅で上に戻すかは、どちらも選べるようにします。ここでは、それぞれの既定を決めます。
      </p>
      <p>
        列をそろえるときは、幅を決め打ちせず subgrid を使います。親を 2 列の grid にして印（試作では
        data-field-grid）を付けると、中の欄がその列に乗り、ラベルの列は最も長いラベルの幅になります。印を付けるのは
        Form の指定か、並べるための小さな部品にする予定です。キャプションとエラーは本体の下です。
      </p>
      <p>
        帯の「1 ページの件数」は幅 224px なので、B・D
        では上に戻ります。帯で使うときは戻さない指定にするか、戻す幅を欄ではなく並びの幅で測るかも、あわせて決めたいところです。
      </p>
    </Comparison>
  ),
};
