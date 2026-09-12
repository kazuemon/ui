import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../src/components/Button';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 05: Danger と Secondary の区別（principles.md 原則6）
// 変えるのは Danger の色（--color-danger）と、そこから作るエラーの淡い赤（--color-field-invalid）だけ
// 淡い赤は、どの案も Danger と同じ色相で、OKLCH の明度 0.97・彩度 0.015（design/adr/0021）
// 「ピンクとの比」は、白文字を載せるピンク（--color-fg-secondary、#E41966）とのコントラスト比

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '#D4283F',
    intent: '前半で旧 #EE4665 から濃くした値。ピンクとの明度の差はほとんどない。',
    spec: [
      ['Danger', '#D4283F'],
      ['白文字との比', '5.03:1'],
      ['ピンクとの比', '1.11:1'],
    ],
    tokens: { '--color-danger': '#d4283f', '--color-field-invalid': '#fef2f1' },
  },
  {
    id: 'A',
    name: '濃く',
    intent: '色相はそのまま、明度を下げる（OKLCH 0.57 → 0.50）。',
    spec: [
      ['Danger', '#BA012D'],
      ['白文字との比', '6.71:1'],
      ['ピンクとの比', '1.48:1'],
    ],
    tokens: { '--color-danger': '#ba012d', '--color-field-invalid': '#fef2f1' },
  },
  {
    id: 'B',
    name: 'もっと濃く',
    intent: '色相はそのまま、明度をさらに下げる（0.46）。えんじ色に近づく。',
    spec: [
      ['Danger', '#A70027'],
      ['白文字との比', '7.86:1'],
      ['ピンクとの比', '1.73:1'],
    ],
    tokens: { '--color-danger': '#a70027', '--color-field-invalid': '#fef2f1' },
  },
  {
    id: 'C',
    name: '朱色寄り',
    intent: '色相をピンクから遠ざける（20.6° → 32°）。明度は少しだけ下げる（0.52）。',
    spec: [
      ['Danger', '#BE260B'],
      ['白文字との比', '6.05:1'],
      ['ピンクとの比', '1.33:1'],
    ],
    tokens: { '--color-danger': '#be260b', '--color-field-invalid': 'oklch(0.97 0.015 32)' },
  },
  {
    id: 'D',
    name: '朱色寄り・濃く',
    intent: '色相を 35° まで離し、明度も下げる（0.50）。',
    spec: [
      ['Danger', '#B12B00'],
      ['白文字との比', '6.53:1'],
      ['ピンクとの比', '1.44:1'],
    ],
    tokens: { '--color-danger': '#b12b00', '--color-field-invalid': 'oklch(0.97 0.015 35)' },
  },
];

const columns: Column[] = [
  { label: 'ボタンを並べる', note: 'ピンクのボタンと削除のボタンが隣り合う場面' },
  { label: 'エラーの入力欄', note: 'エラーの赤も Danger から作る' },
];

const Buttons = () => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-wrap gap-3">
      <Button color="secondary">複製する</Button>
      <Button color="danger">削除する</Button>
    </div>
    <div className="flex flex-wrap gap-3">
      <Button appearance="outline" color="secondary">
        下書きに戻す
      </Button>
      <Button appearance="outline" color="danger">
        削除する
      </Button>
    </div>
  </div>
);

const ErrorField = () => (
  <TextField label="電話番号" defaultValue="080-1234-567" error="電話番号の桁数が足りません" />
);

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/05 Danger と Secondary の区別',
  id: 'design-review-05-danger',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={5}
      axis="Danger と Secondary の区別"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (column.label === 'ボタンを並べる' ? <Buttons /> : <ErrorField />)}
    >
      <p>
        <strong className="text-fg">決定: A 濃く</strong>
        （ADR-0023）。「選びました！エラーテキストも見やすいかなと思っています。」
      </p>
      <p>
        削除などの危険な操作に使う赤（Danger）と、Secondary
        のピンクを見分けられるようにします。ピンクの用途を限定しなくなったため（ADR-0013）、ピンクのボタンと削除のボタンが隣り合う場面があります。今の
        Danger と、白文字を載せるピンクのコントラスト比は 1.11:1
        で、明るさではほとんど区別できません。
      </p>
      <p>
        前半のメモ「Danger
        はもうちょっと濃くしてもいいかも」を受けて、濃さ（A・B）と色相（C・D）を振りました。エラーの入力欄の赤い枠線と文言も、同じ
        Danger から作るので一緒に変わります。淡い赤の塗り（ADR-0021）は Danger
        と同じ色相で作るので、色相を変える C・D でだけ変わります。
      </p>
      <p>
        ボタンは、この軸のために作った最初の版です。影と押下の動きは、前半の決定（ADR-0006・0009）どおりです。押して確かめられます。
      </p>
      <p>
        判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
      </p>
    </Comparison>
  ),
};
