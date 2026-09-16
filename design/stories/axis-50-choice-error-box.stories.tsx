import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Checkbox, CheckboxGroup } from '../../src/components/Checkbox';
import { Radio, RadioGroup } from '../../src/components/Radio';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 50: チェックボックスとラジオのエラーの箱
// いまのエラーの箱（#F1E0DE）は、ふだんの箱（#E1E3E4）と明るさの比が 1.01 で、赤みだけで見分ける
// 変えるのは次のトークンだけ（src/components/Checkbox.tsx が読む。Radio も同じ見た目）
//   --color-choice-invalid: エラーの、選んでいない箱の塗り（hover でも変えない。押すと本文の色を 8% 混ぜる）
//   --choice-invalid-line-width・--color-choice-invalid-line: エラーの、選んでいない押せる箱の内側の線（inset の影）
// 選んだ箱は、どの案も部品の色のまま（線も引かない）。押せない箱は、エラーでも押せない箱の色（線なし）
// ふだんの箱・hover の塗りも、どの行も明示する

const ground = {
  '--color-choice': 'var(--color-field-addon)',
  '--color-choice-hover': 'color-mix(in oklab, var(--color-field-addon), var(--color-fg) 3%)',
  '--color-choice-disabled': 'var(--color-field)',
  '--color-choice-invalid-line': 'var(--color-danger)',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '塗りだけ',
    intent:
      '選んでいない箱の塗りを、prefix・suffix のエラーと同じ赤み（#F1E0DE）にする。明るさはふだんの箱とほぼ同じで、色相だけが変わる。',
    spec: [
      ['塗り', '#F1E0DE・ふだんの箱との比 1.01・白地との比 1.28'],
      ['線', 'なし'],
      ['選んだ箱', '部品の色のまま（エラーでも変わらない）'],
      [
        '原則',
        '原則8「エラーでは、箱の塗りを淡い赤にします」と ADR-0047 の決まり8のまま。原則2の「枠線と塗りの 2 つで知らせます」とは違い、塗りの 1 つだけ',
      ],
    ],
    tokens: {
      ...ground,
      '--color-choice-invalid': 'var(--palette-red-100)',
      '--choice-invalid-line-width': '0px',
    },
  },
  {
    id: 'A',
    name: '塗り＋内側の赤い線',
    intent:
      '現行版の塗りに、箱の内側に 1.5px の赤い線を足す（寸法は変えない）。入力欄のエラーと同じく、線と塗りの 2 つで知らせる。線は小さい箱に合わせて入力欄（2px）より細くする。',
    spec: [
      ['塗り', '#F1E0DE・ふだんの箱との比 1.01・白地との比 1.28'],
      ['線', '1.5px #BA012D・塗りとの比 5.26・白地との比 6.71'],
      ['選んだ箱', '部品の色のまま、線なし'],
      [
        '原則',
        '原則2の「エラーは枠線と塗りの 2 つ」にそろう（原則2の書き換えなし）。原則8の文を書き換える: 「エラーでは、入力欄と同じく、箱の内側に赤い線を引き、塗りを淡い赤にします」。ADR-0047 の決まり8（箱の塗りを淡い赤）に線を足す',
      ],
    ],
    tokens: {
      ...ground,
      '--color-choice-invalid': 'var(--palette-red-100)',
      '--choice-invalid-line-width': '1.5px',
    },
  },
  {
    id: 'B',
    name: '線だけ',
    intent:
      '塗りはふだんの箱のまま、内側に 1.5px の赤い線だけを引く。原則2の「状態は枠線で表す」をそのまま箱に写した形。',
    spec: [
      ['塗り', 'ふだんの箱と同じ #E1E3E4（比 1.00）・白地との比 1.29'],
      ['線', '1.5px #BA012D・塗りとの比 5.21・白地との比 6.71'],
      ['選んだ箱', '部品の色のまま、線なし'],
      [
        '原則',
        '原則2の「状態は枠線で表す」にそろうが、「エラーは枠線と塗りの 2 つ」とは違う（線の 1 つだけ）。原則8の文を書き換える: 「エラーでは、箱の内側に赤い線を引きます」。ADR-0047 の決まり8（箱の塗りを淡い赤）を覆す',
      ],
    ],
    tokens: {
      ...ground,
      '--color-choice-invalid': 'var(--color-field-addon)',
      '--choice-invalid-line-width': '1.5px',
    },
  },
  {
    id: 'C',
    name: '濃い赤みの塗り',
    intent:
      '線は足さず、選んでいない箱の塗りを濃い赤み（明度 0.84）にして、ふだんの箱と明るさでも差を付ける。選んだ箱（白い印が載る部品の色）は変えない。',
    spec: [
      ['塗り', '#EABFBA・ふだんの箱との比 1.29・白地との比 1.66・ふだんの hover との比 1.21'],
      ['線', 'なし'],
      ['選んだ箱', '部品の色のまま'],
      [
        '原則',
        '原則2の「状態まで明るさで表すと区別がつきません」（明るさは hover の手応えに使う）とぶつかる。原則2の冒頭の考えと、原則8の文「箱の塗りを淡い赤」を書き換える必要がある',
      ],
    ],
    tokens: {
      ...ground,
      '--color-choice-invalid': '#eabfba',
      '--choice-invalid-line-width': '0px',
    },
  },
  {
    id: 'D',
    name: '入力欄のエラーと同じ組',
    intent:
      '入力欄のエラーと同じ、淡い赤の塗り（#FEF2F1）と 2px の赤い線にする。塗りはふだんの箱より明るくなり、線で知らせる。',
    spec: [
      ['塗り', '#FEF2F1・ふだんの箱との比 1.18（明るい）・白地との比 1.09'],
      ['線', '2px #BA012D・塗りとの比 6.13・白地との比 6.71'],
      ['選んだ箱', '部品の色のまま、線なし'],
      [
        '原則',
        '原則2の入力欄の文がそのまま当てはまる（書き換えなし）。原則8の文を書き換える: 「エラーでは、入力欄のエラーと同じ赤い線と淡い赤の塗りにします」。ADR-0047 の決まり8の塗りを入力欄の塗りに替え、線を足す',
      ],
    ],
    tokens: {
      ...ground,
      '--color-choice-invalid': 'var(--color-field-invalid)',
      '--choice-invalid-line-width': '2px',
    },
  },
];

const columns: Column[] = [
  {
    label: '通常',
    note: '上からチェックボックスのグループ（色なし）、1つだけ置く箱（同意）、ラジオのグループ（primary）。押せない選択肢を含む',
  },
  { label: 'hover', note: '押せる箱に hover した見た目を固定', preview: 'hover' },
  { label: '押したとき', note: '押せる箱を押している見た目を固定', preview: 'press' },
  {
    label: 'フォーカス（キーボード）',
    note: '押せる箱にキーボードのフォーカスを固定',
    preview: 'focus',
  },
];

const Note = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-bold text-fg-subtle">{children}</p>
);

const Items = () => (
  <>
    <CheckboxGroup label="連絡" error="選んでください" defaultValue={['mail']}>
      <Checkbox value="mail" label="メール" />
      <Checkbox value="tel" label="電話" />
      <Checkbox value="post" label="郵送" disabled />
    </CheckboxGroup>
    <Checkbox label="同意する" required error="同意してください" />
    <RadioGroup label="時間" color="primary" error="選び直してください" defaultValue="am">
      <Radio value="am" label="午前" />
      <Radio value="pm" label="午後" />
      <Radio value="night" label="夜" disabled />
    </RadioGroup>
  </>
);

// 各セルの左がマウス用、右が指用。密度はセルの中で固定する
const Cell = () => (
  <div className="grid grid-cols-2 gap-4">
    {(['fine', 'coarse'] as const).map((density) => (
      <div key={density} data-density={density} className="flex min-w-0 flex-col gap-4">
        <Note>{density === 'fine' ? 'マウス用' : '指用'}</Note>
        <Items />
      </div>
    ))}
  </div>
);

interface ComparisonArgs {
  pick: string;
}

const boxes = ['[role="checkbox"]:not([data-disabled])', '[role="radio"]:not([data-disabled])'];
const at = (preview: string) => boxes.map((box) => `[data-preview="${preview}"] ${box}`);

const meta = {
  title: 'Design Review/50 チェックボックスとラジオのエラーの箱',
  id: 'design-review-50-choice-error-box',
  parameters: {
    layout: 'fullscreen',
    // 押しているあいだは hover も当てる（押すときはポインタが上にあるため）
    pseudo: {
      hover: [...at('hover'), ...at('press')],
      active: at('press'),
      focusVisible: at('focus'),
    },
  },
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
      index={50}
      axis="チェックボックスとラジオのエラーの箱"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={() => <Cell />}
    >
      <p>
        <strong className="text-fg">決まったこと</strong>（ADR-0070）。
        <strong className="text-fg">決まったこと</strong>
        。チェックボックスとラジオのエラーは、選んでいない箱で知らせ、文はグループ（1つだけ置く箱は箱の行の下）に入力欄と同じ行で出します（ADR-0047）。選んだ箱は部品の色のままです。押せなくてエラーでもある箱は、押せない箱の色にします。
      </p>
      <p>
        <strong className="text-fg">決まったこと</strong>（ADR-0070）。
        問題。いまのエラーの箱（#F1E0DE）は、ふだんの箱（#E1E3E4）と明るさの比が 1.01
        で、赤みだけで見分けます。入力欄のエラーは「赤い枠線と淡い赤の塗り」の 2
        つで知らせています（原則2）。
      </p>
      <p>
        <strong className="text-fg">決まったこと</strong>（ADR-0070）。
        ここで選ぶのは、選んでいない箱のエラーの見せ方です。線はどの案も箱の内側に描き、寸法は変えません。列は状態で、各セルの左がマウス用、右が指用です。
      </p>
      <p>どれを既定にするかを一言添えてください。</p>
    </Comparison>
  ),
};
