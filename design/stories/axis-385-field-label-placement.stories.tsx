import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { SearchField } from '../../src/components/search-field/SearchField';
import { Select } from '../../src/components/select/Select';
import { Text } from '../../src/components/text/Text';
import { TextField } from '../../src/components/text-field/TextField';
import { Textarea } from '../../src/components/textarea/Textarea';
import { type FieldLayout, FieldLayoutContext } from '../../src/internal/field/field-layout';

// 軸 385: Field のラベルの置き場所
//   いまはラベルがいつも本体の上にある（原則4）。表の上下の帯のように 1 行に詰める場所と、設定画面のように
//   ラベルの列をそろえるフォームで、横に置く形・出さない形を比べる
const meta = {
  title: 'Design Review/385 Field のラベルの置き場所',
  id: 'design-review-385-field-label-placement',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D', 'E'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'いつも上',
    intent:
      'ラベルは本体の上。帯に並べると、ラベルの分だけ欄が下がり、隣の文やボタンと高さがそろわない',
    spec: [
      ['置き場所', '上'],
      ['キャプション', 'ラベルと本体のあいだ'],
    ],
  },
  {
    id: 'A',
    name: '横・幅は中身なり',
    intent:
      '帯向き。ラベルを本体の左に置き、ラベルの幅は文字の長さのまま。ラベルは本体の 1 行目の真ん中にそろう。キャプションとエラーは本体の下',
    spec: [
      ['置き場所', '左'],
      ['ラベルの幅', '中身なり'],
      ['列の間', '12px'],
      ['キャプション', '本体の下'],
      ['ラベルの文字', '太字・本文の色'],
    ],
    tokens: {
      '--field-label-width': 'auto',
      '--field-label-gap': 'calc(var(--spacing) * 3)',
    },
  },
  {
    id: 'B',
    name: '横・幅をそろえる',
    intent:
      'フォーム向き。ラベルの列を 160px にそろえ、欄が縦に並んでも本体の左端がそろう。欄の幅が 384px より狭いと上に戻す',
    spec: [
      ['置き場所', '左（狭いと上）'],
      ['ラベルの幅', '160px'],
      ['列の間', '24px'],
      ['キャプション', '本体の下'],
    ],
    tokens: {
      '--field-label-width': 'calc(var(--spacing) * 40)',
      '--field-label-gap': 'calc(var(--spacing) * 6)',
    },
  },
  {
    id: 'C',
    name: '横・幅をそろえ、説明はラベルの下',
    intent:
      '設定画面の形。B のうえで、キャプションをラベルの列に置く。本体の列には欄とエラーだけが並び、欄どうしの間が詰まる。狭いと上に戻す',
    spec: [
      ['置き場所', '左（狭いと上）'],
      ['ラベルの幅', '160px'],
      ['列の間', '24px'],
      ['キャプション', 'ラベルの下'],
    ],
    tokens: {
      '--field-label-width': 'calc(var(--spacing) * 40)',
      '--field-label-gap': 'calc(var(--spacing) * 6)',
    },
  },
  {
    id: 'D',
    name: '横・軽いラベル',
    intent:
      'A のラベルを太字にせず、一段淡い色にする。帯の中で「12 件中 1〜5 件」のような文と同じ重さになり、欄の値が目立つ',
    spec: [
      ['置き場所', '左'],
      ['ラベルの幅', '中身なり'],
      ['ラベルの文字', '標準の太さ・一段淡い色'],
    ],
    tokens: {
      '--field-label-width': 'auto',
      '--field-label-gap': 'calc(var(--spacing) * 2)',
      '--field-start-label-weight': '400',
      '--field-start-label-color': 'var(--color-fg-muted)',
    },
  },
  {
    id: 'E',
    name: 'ラベルを出さない',
    intent:
      '見えるラベルを置かず、読み上げの名前（accessibleName）だけを持たせる。何の欄かは、見本の文字・値・置き場所で伝える。フォームには向かない（右の 2 列は向かない例として並べている）',
    spec: [
      ['置き場所', 'なし'],
      ['読み上げ', 'accessibleName（必須）'],
    ],
  },
];

const layoutOf: Record<string, FieldLayout> = {
  現行版: { labelPlacement: 'top' },
  A: { labelPlacement: 'start' },
  B: { labelPlacement: 'start', narrowLabelPlacement: 'top' },
  C: { labelPlacement: 'start', captionColumn: 'label', narrowLabelPlacement: 'top' },
  D: { labelPlacement: 'start' },
  E: { labelPlacement: 'hidden' },
};

const columns: Column[] = [
  { label: '表の下の帯', note: '件数の文と、1 ページの件数' },
  { label: '表の上の帯', note: '検索と、一括の操作' },
  { label: '設定のフォーム', note: '幅 560px。キャプション・エラーを含む' },
  { label: '狭い幅', note: '幅 320px（スマホ）' },
];

const pageSizes = [5, 10, 20].map((size) => ({ label: `${size} 件`, value: String(size) }));

function Frame({ width, children }: { width: number; children: ReactNode }) {
  return (
    <div className="rounded-card border border-line bg-bg p-4" style={{ width }}>
      {children}
    </div>
  );
}

function BottomBar({ id }: { id: string }) {
  const start = id !== '現行版' && id !== 'E';
  return (
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
          items={pageSizes}
          defaultValue="5"
          className={start ? 'w-56' : 'w-32'}
        />
      </div>
    </Frame>
  );
}

function TopBar({ id }: { id: string }) {
  const start = id !== '現行版' && id !== 'E';
  return (
    <Frame width={560}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SearchField
          label="注文を検索"
          placeholder="注文番号・お店"
          className={start ? 'w-80 max-w-full' : 'w-64 max-w-full'}
        />
        <div className="flex items-center gap-2">
          <Text as="span" size="sm" variant="muted">
            2 件を選択中
          </Text>
          <Button variant="outline">書き出す</Button>
        </div>
      </div>
    </Frame>
  );
}

function SettingsForm({ width }: { width: number }) {
  return (
    <Frame width={width}>
      <div className="flex flex-col gap-6">
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
          caption="160 文字まで"
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
      index={385}
      axis="Field のラベルの置き場所"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <FieldLayoutContext value={layoutOf[candidate.id] ?? {}}>
          {column.label === '表の下の帯' && <BottomBar id={candidate.id} />}
          {column.label === '表の上の帯' && <TopBar id={candidate.id} />}
          {column.label === '設定のフォーム' && <SettingsForm width={560} />}
          {column.label === '狭い幅' && <SettingsForm width={320} />}
        </FieldLayoutContext>
      )}
    >
      <p>
        決定（ADR-0365）: 既定は現行版（上）、A（横）も選べる。列をそろえるのは幅の決め打ちでなく
        subgrid（軸 388）。キャプションとエラーは本体の下。C のような並べ方は組み立て（軸
        386）で作れるようにする。ラベルの軽さ・狭い幅で上に戻すかは選べる。ラベルなし（accessibleName）も作る。
      </p>
      <p>
        入力欄のラベルは、いまはいつも本体の上です。表の上下の帯のように 1
        行に詰める場所ではラベルが浮き、設定画面のようにラベルの列をそろえたいフォームでは縦に長くなります。横に置く形と、出さない形を比べます。
      </p>
      <p>
        決めたいこと: ① 既定はどれか（上のままにして、横・なしを選べるようにするか） ②
        横に置くときの幅（中身なり / そろえる）とキャプションの場所 ③
        横のラベルの重さ（太字のままか） ④ 狭い幅で上に戻すか。「X を既定にして、Y
        も選べる」形で答えてもらえると助かります。
      </p>
      <p>
        読み上げ: 横に置いても、ラベルは &lt;label&gt; のままで、読む順（ラベル → キャプション →
        本体 → エラー）も変わりません。E は見えるラベルがないので、accessibleName
        を必須にします（label か accessibleName
        のどちらかが要る型）。帯の件数のように見える文があるときは、読み上げの名前をその文と同じ語で始めます（WCAG
        2.5.3）。
      </p>
      <p>
        いまは試作として、どの欄にも効く設定（文脈）で切り替えています。props（labelPlacement）にするか、Form
        で一度に決められるようにするかは、軸 386 の組み立て方と一緒に決めます。
      </p>
    </Comparison>
  ),
};
