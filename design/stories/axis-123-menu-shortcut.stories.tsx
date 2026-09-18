import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { MenuSample, ShortcutItems } from './menu-samples';

// 後半の軸 123: Menu のショートカットの文字
// 決定（ADR 未定）: A（キャプションの大きさのグレー）。選べる形は持たない
// 文字は部品の値に畳んだので、採らなかった案（現行版・B）は中の要素へのクラス（LOOKS）で描く

// Tailwind がクラスを拾えるよう、クラスは文字列のまま書く
const LOOKS: Record<string, string | undefined> = {
  現行版: '[&_[data-slot=menu-item-shortcut]]:text-[length:1em] [&_[data-slot=menu-item-shortcut]]:leading-[1.5]',
  A: undefined,
  B: [
    '[&_[data-slot=menu-item-shortcut]]:text-(length:--kbd-size) [&_[data-slot=menu-item-shortcut]]:leading-[1.6] [&_[data-slot=menu-item-shortcut]]:font-semibold',
    '[&_[data-slot=menu-item-shortcut]]:rounded-sm [&_[data-slot=menu-item-shortcut]]:border-(length:--border-width-thin) [&_[data-slot=menu-item-shortcut]]:border-b-(length:--kbd-line-bottom-width) [&_[data-slot=menu-item-shortcut]]:border-surface-line',
    '[&_[data-slot=menu-item-shortcut]]:bg-surface [&_[data-slot=menu-item-shortcut]]:px-(--kbd-pad-x)',
    // 危険・押せない項目は、項目の文字の色のまま
    '[&_[data-slot=menu-item]:not([data-disabled],[data-danger])_[data-slot=menu-item-shortcut]]:text-fg-muted',
  ].join(' '),
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '項目と同じ大きさのグレー',
    intent:
      '項目の文字と同じ大きさで、キャプションと同じグレー。文字だけで、右端にそろえる。項目の文字と同じ行に並び、目で追いやすい。',
    spec: [
      ['大きさ', '項目と同じ'],
      ['色', 'グレー（fg-subtle）'],
      ['形', '文字だけ'],
    ],
  },
  {
    id: 'A',
    name: 'キャプションの大きさのグレー',
    intent: '現行版を小さくし、キャプションと同じ文字にする。項目の文字との差がはっきりする。',
    spec: [
      ['大きさ', 'キャプション（12px）'],
      ['色', 'グレー（fg-subtle）'],
      ['形', '文字だけ'],
    ],
  },
  {
    id: 'B',
    name: 'キーの見た目',
    intent:
      'Kbd（キー）と同じ見た目。白い面に細い輪郭と、下辺だけ太い線。キーを押すことが一目で分かるが、項目ごとに枠が並ぶ。',
    spec: [
      ['大きさ', 'Kbd と同じ（項目の 0.8125 倍）'],
      ['色', '一段淡い濃紺（fg-muted）・やや太い'],
      ['形', '白い面・細い輪郭・下辺だけ太い線'],
    ],
  },
];

const columns: Column[] = [
  { label: 'マウス', note: '編集に hover。印刷は押せない。削除は危険な項目' },
  { label: '指', note: '指の密度で浮かべたとき（シートではショートカットを出さない）' },
];

const meta = {
  title: 'Design Review/123 Menu のショートカットの文字',
  id: 'design-review-123-menu-shortcut',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={123}
      axis="Menu のショートカットの文字"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) =>
        column.label === 'マウス' ? (
          <MenuSample height={330} density="fine" className={LOOKS[candidate.id]}>
            <ShortcutItems hover />
          </MenuSample>
        ) : (
          <MenuSample height={330} density="coarse" className={LOOKS[candidate.id]}>
            <ShortcutItems hover />
          </MenuSample>
        )
      }
    >
      <p>
        <strong>
          決定（ADR 未定）: A（キャプションの大きさのグレー）にします。選べる形は持ちません。
        </strong>
      </p>
      <p>
        項目の右端に出すショートカット（MenuItem の
        shortcut）の見た目を決めます。表示だけで、キーの操作は使う側が付けます。読み上げでは項目の説明になり、指で操作するシートでは出しません。
      </p>
      <p>
        押せない項目では、ショートカットも項目と同じ押せない文字の色になり、危険な項目では赤になります（どの案も同じ）。
      </p>
      <p>どれを既定にするかを選んでください。</p>
    </Comparison>
  ),
};
