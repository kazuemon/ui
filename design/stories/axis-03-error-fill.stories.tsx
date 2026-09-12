import type { Meta, StoryObj } from '@storybook/react-vite';

import { Select } from '../../src/components/Select';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 03: エラー時の塗り（principles.md 原則2）
// 変えるのはエラー中の入力欄の塗り（--color-field-invalid）だけ。枠線は 2px の赤で、フォーカス中も赤のまま

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '白',
    intent: '原則2の表のまま。エラーになると、グレーの塗りが白に変わり、赤い枠が付く。',
    spec: [
      ['塗り', 'グレー → 白'],
      ['枠線', '2px の赤'],
    ],
    tokens: { '--color-field-invalid': 'var(--color-surface)' },
  },
  {
    id: 'A',
    name: 'グレーのまま',
    intent:
      '塗りは変えず、赤い枠だけを足す。フォーカス（ADR-0019）と同じく、状態を枠線の色だけで表す。参照画像のエラー表現もこちら。',
    spec: [
      ['塗り', 'グレーのまま'],
      ['枠線', '2px の赤'],
    ],
    tokens: { '--color-field-invalid': 'var(--color-field)' },
  },
  {
    id: 'B',
    name: '淡い赤',
    intent:
      '塗りも淡い赤に変え、枠線と塗りの2つで知らせる。フォーカスよりはっきり目立たせる考え方。',
    spec: [
      ['塗り', 'グレー → 淡い赤'],
      ['塗りの色', '#FEF2F1'],
      ['枠線', '2px の赤'],
    ],
    // Danger と同じ色相（20.6°）で明度だけ上げた色。文字 12.6:1、赤い枠線 4.6:1
    tokens: { '--color-field-invalid': '#fef2f1' },
  },
];

const columns: Column[] = [
  { label: 'エラー', note: '入力欄はクリックでき、実際の動きを確かめられます' },
  {
    label: 'エラー中にフォーカス',
    note: 'エラーの欄にフォーカスした見た目を固定して表示しています',
    preview: 'focus',
  },
];

const kinds = [
  { label: 'お仕事のご相談', value: 'work' },
  { label: '取材のお願い', value: 'interview' },
  { label: 'その他', value: 'other' },
];

const Fields = () => (
  <div className="flex flex-col gap-5">
    <TextField label="お名前" defaultValue="山田 花子" />
    <TextField label="電話番号" defaultValue="080-1234-567" error="電話番号の桁数が足りません" />
    <Select
      label="お問い合わせの種類"
      items={kinds}
      placeholder="選んでください"
      error="お問い合わせの種類を選んでください"
    />
  </div>
);

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/03 エラー時の塗り',
  id: 'design-review-03-error-fill',
  parameters: {
    layout: 'fullscreen',
    // フォーカスを固定するのは、エラーの欄だけ
    pseudo: { focusWithin: ['[data-preview="focus"] [data-invalid] [data-slot="control"]'] },
  },
  args: { pick: 'B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={3}
      axis="エラー時の塗り"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={() => <Fields />}
    >
      <p>
        <strong className="text-fg">決定: B 淡い赤</strong>
        （ADR-0021）。「A になじみがありましたが、こう見ると B の方がいいですね」
      </p>
      <p>
        入力欄がエラーになったときの塗りを選びます。原則2の表では「白塗り＋赤の枠線」ですが、参照画像ではグレーの塗りのまま赤い枠になっています。
      </p>
      <p>
        軸 01 で、フォーカスは「塗りを変えず、枠線だけを足す」に決まりました（ADR-0019）。A
        を選ぶと、フォーカスとエラーを枠線の色（青と赤）だけで表す規則に揃います。B
        は塗りでも知らせる案で、変わるものが2つになります。
      </p>
      <p>
        どの案も、エラー中にフォーカスしても枠線は赤のままです。そのため、エラー中の欄はフォーカスしても見た目が変わらず、どの欄にフォーカスしているかはカーソルでしか分かりません（右の列が左の列と同じ見た目なのはこのためです）。気になる場合は一言ください。
      </p>
      <p>
        エラーの文言は、キャプションの位置に赤で出します。赤そのものの濃さ（Danger と Secondary
        の区別）は、別の軸で決めます。
      </p>
      <p>
        判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
      </p>
    </Comparison>
  ),
};
