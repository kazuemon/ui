import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Select } from '../../src/components/select/Select';
import { TextField } from '../../src/components/text-field/TextField';
import { Textarea } from '../../src/components/textarea/Textarea';

// 後半の軸 153: 入力欄のプレースホルダー（TextField・Textarea の placeholder、Select の未選択の文字）の色
//   いまはキャプションと同じ淡いグレー（--color-fg-subtle）。白地では 4.5:1 あるが、入力欄のグレーの塗りの上では 4.1:1、
//   hover の塗りの上では 3.95:1 に下がり、文字の基準（4.5:1）を満たしていない
//   軸 152 で、読み取り専用の値を一段淡いグレー（--color-fg-muted）にしたので、プレースホルダーが値に見えないかも比べる
//   候補は --field-placeholder の上書きだけで作る
// 決定: A（入力欄の塗りと hover の塗りの上でも 4.5:1 を満たす、いちばん淡いグレー）。書き方の決まり（「例:」を付けるなど）は部品の JSDoc と Docs に書いた。ADR は記録のときに書く

type Tokens = NonNullable<Candidate['tokens']>;

// 軸 152 で決めた読み取り専用の形（C2）。まだ部品に畳んでいないので、この列だけ上書きして見せる
const readonlyC2: Tokens = {
  '--field-readonly-fill': 'transparent',
  '--field-readonly-fill-hover': 'transparent',
  '--field-readonly-addon-fill': 'transparent',
  '--field-readonly-line': 'var(--color-line-strong)',
  '--field-readonly-outline-width': 'var(--border-width-thin)',
  '--field-readonly-outline-style': 'dashed',
  '--field-readonly-text': 'var(--color-fg-muted)',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'キャプションと同じグレー',
    intent:
      'キャプションと同じ淡いグレー。白地では基準を満たすが、入力欄のグレーの塗りの上では 4.1:1、hover では 3.95:1 に下がり、基準（4.5:1）に届かない。',
    spec: [
      ['色', 'キャプションと同じ（fg-subtle）'],
      ['白地', '4.5:1'],
      ['入力欄の塗りの上', '4.1:1（hover 3.95:1）'],
    ],
    tokens: { '--field-placeholder': 'var(--color-fg-subtle)' },
  },
  {
    id: 'A',
    name: '塗りの上で基準を満たすいちばん淡いグレー',
    intent:
      'キャプションのグレーと本文より一段淡いグレーのあいだを混ぜ、入力欄の塗りと hover の塗りの上でも 4.5:1 を満たす、いちばん淡い色にする（新しい値）。いまより少しだけ濃くなる。読み取り専用の値（一段淡いグレー）よりは淡い。',
    spec: [
      ['色', 'fg-subtle と fg-muted を 55:45 で混ぜた色'],
      ['白地', '約 5.3:1'],
      ['入力欄の塗りの上', '約 4.8:1（hover 約 4.6:1）'],
    ],
    tokens: {
      '--field-placeholder':
        'color-mix(in oklab, var(--color-fg-muted) 45%, var(--color-fg-subtle))',
    },
  },
  {
    id: 'B',
    name: '本文より一段淡いグレー',
    intent:
      '読み取り専用の値と同じ、本文より一段淡いグレーにする。どの塗りの上でも基準を大きく超えて読みやすい。代わりに、読み取り専用の値と同じ色になり、値が入っているように見えやすい。',
    spec: [
      ['色', '一段淡いグレー（fg-muted。読み取り専用の値と同じ）'],
      ['白地', '6.9:1'],
      ['入力欄の塗りの上', '6.2:1（hover 6.0:1）'],
    ],
    tokens: { '--field-placeholder': 'var(--color-fg-muted)' },
  },
  {
    id: 'C',
    name: '（参考）3:1 の淡さ',
    intent:
      '輪郭と同じ 3:1 の淡さにする。値とはいちばんはっきり分かれるが、文字の基準（4.5:1）を満たさない。プレースホルダーも文字なので、基準の対象になる。比べるための参考として置く。',
    spec: [
      ['色', '3:1 の輪郭と同じ（line-strong）'],
      ['白地', '3.0:1'],
      ['入力欄の塗りの上', '2.7:1（hover 2.6:1）'],
    ],
    tokens: { '--field-placeholder': 'var(--color-line-strong)' },
  },
];

// 列は TextField の「状態」と同じ並び（空・値あり・エラー・警告・押せない）に、読み取り専用と止めているあいだを足したもの
// プレースホルダーが出る「空」の状態は、hover とフォーカスも並べる
const columns: Column[] = [
  { label: '空' },
  { label: '空・hover', note: '塗りが半段濃くなる', preview: 'hover' },
  { label: '空・フォーカス', preview: 'focus' },
  { label: '値あり', note: '値とプレースホルダーを見比べる' },
  { label: 'エラー（空）', note: '淡い赤の塗り' },
  { label: '警告（値あり）' },
  { label: '押せない（空）' },
  { label: '押せない（値あり）' },
  { label: '読み取り専用（空）', note: '軸 152 の C2 の形で見せる' },
  { label: '読み取り専用（値あり）', note: '軸 152 の C2 の形で見せる' },
  { label: '止めているあいだ（空）', note: '値を確かめているあいだ' },
  { label: 'Select（未選択）' },
  { label: 'Textarea（空）' },
];

const label = '表示名';
const placeholder = '例: かずえもん';
const value = 'かずえもん';

function renderCell(column: Column) {
  const field = (() => {
    switch (column.label) {
      case '値あり':
        return <TextField label={label} placeholder={placeholder} defaultValue={value} />;
      case 'エラー（空）':
        return (
          <TextField label={label} placeholder={placeholder} error="表示名を入力してください" />
        );
      case '警告（値あり）':
        return (
          <TextField
            label={label}
            placeholder={placeholder}
            defaultValue="かずえもん（Kazuya Miyamoto）"
            warning="20文字を超えると、一覧では途中で切れます"
          />
        );
      case '押せない（空）':
        return <TextField label={label} placeholder={placeholder} disabled />;
      case '押せない（値あり）':
        return <TextField label={label} placeholder={placeholder} defaultValue={value} disabled />;
      case '読み取り専用（空）':
        return (
          <div style={readonlyC2}>
            <TextField label={label} placeholder={placeholder} readOnly />
          </div>
        );
      case '読み取り専用（値あり）':
        return (
          <div style={readonlyC2}>
            <TextField label={label} placeholder={placeholder} defaultValue={value} readOnly />
          </div>
        );
      case '止めているあいだ（空）':
        return (
          <TextField label={label} placeholder={placeholder} loading loadingBehavior="blocking" />
        );
      case 'Select（未選択）':
        return (
          <Select
            label="区"
            placeholder="選んでください"
            items={['千代田区', '中央区', '港区'].map((ward, i) => ({
              label: ward,
              value: `ward-${i}`,
            }))}
            presentation="popover"
          />
        );
      case 'Textarea（空）':
        return (
          <Textarea label="自己紹介" placeholder="好きなものや、作っているものを書いてください" />
        );
      default:
        return <TextField label={label} placeholder={placeholder} />;
    }
  })();
  return <div className="w-[240px]">{field}</div>;
}

const meta = {
  title: 'Design Review/153 プレースホルダーの色',
  id: 'design-review-153-field-placeholder',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: ['[data-preview="hover"] [data-slot="control"]'],
      focusWithin: ['[data-preview="focus"] [data-slot="control"]'],
    },
  },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={153}
      axis="入力欄のプレースホルダーの色"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column)}
    >
      <p>
        プレースホルダーは、空の欄に出る見本の文字です。いまはキャプションと同じ淡いグレーで、白地では文字の基準（4.5:1）を満たしますが、入力欄のグレーの塗りの上では
        4.1:1、hover の塗りの上では 3.95:1 に下がり、基準に届いていません。
      </p>
      <p>
        濃くすると読みやすくなる代わりに、値が入っているように見えやすくなります。読み取り専用の値を一段淡いグレーにしたので（軸
        152）、その値とも見分けられるかを見てください。
      </p>
      <p>
        C
        は基準を満たさない参考です。どれを既定にするか、ほかに選べるようにしたい案があれば、それも教えてください。
      </p>
    </Comparison>
  ),
};
