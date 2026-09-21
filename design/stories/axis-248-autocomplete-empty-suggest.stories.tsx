import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  Autocomplete,
  type AutocompleteGroup,
  type AutocompleteItem,
} from '../../src/components/autocomplete/Autocomplete';

// 後半の軸 248: 空のときに出す候補（最近の検索など）の見せ方と、閉じる契機
//   部品に新しい props は足さず、呼び出し側が items を差し替えて作る（空のときは最近、打つと通常の候補）
//   開く契機（openOn）と、空に戻したときの開閉（open）を、行ごとに変える

const cities: AutocompleteItem[] = [
  '札幌市',
  '仙台市',
  '東京都',
  '京都市',
  '名古屋市',
  '大阪市',
  '神戸市',
  '福岡市',
].map((label, i) => ({ label, value: `city-${i + 1}` }));

const recent = (label: string): AutocompleteItem => cities.find((city) => city.label === label)!;
const recentItems: AutocompleteItem[] = ['京都市', '福岡市', '札幌市'].map(recent);
const recentGroups: AutocompleteGroup[] = [{ label: '最近の検索', items: recentItems }];

type Kind = 'none' | 'group-keep' | 'flat-keep' | 'group-close';

const kinds: Record<string, Kind> = {
  現行版: 'none',
  A: 'group-keep',
  B: 'flat-keep',
  C: 'group-close',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '空では出さない',
    intent: '打つまで開かない。空に戻すと閉じる。最近の検索は出さない。',
    spec: [['openOn', 'input']],
  },
  {
    id: 'A',
    name: '見出し付きの最近の検索',
    intent:
      'フォーカスで「最近の検索」の見出しつきで開く。打つと当たる候補に切り替わり、消して空に戻すと最近の検索に戻る。',
    spec: [
      ['openOn', 'focus'],
      ['空のとき', '見出し付きのまとまり'],
      ['空に戻す', '最近の検索に戻る'],
    ],
  },
  {
    id: 'B',
    name: '見出しなしの最近の検索',
    intent: 'フォーカスで最近の検索を、見出しなしで並べる。打つと当たる候補に切り替わる。',
    spec: [
      ['openOn', 'focus'],
      ['空のとき', '見出しなしの一覧'],
      ['空に戻す', '最近の検索に戻る'],
    ],
  },
  {
    id: 'C',
    name: '見出し付き・空に戻すと閉じる',
    intent:
      'フォーカスで見出し付きの最近の検索を出す。打つと切り替わるが、消して空に戻すと閉じる（もう一度出すのは ↓ かフォーカス）。',
    spec: [
      ['openOn', 'focus'],
      ['空のとき', '見出し付きのまとまり'],
      ['空に戻す', '閉じる'],
    ],
  },
];

const columns: Column[] = [
  { label: 'フォーカス直後（空）' },
  { label: '「京」を打ったあと' },
  { label: '操作して確かめる', note: '欄を押し、打ち、消してみてください' },
];

// 開閉を外から固定した見本。空のときは最近の検索、打つと通常の候補
function Cell({ kind, fixedOpen, text }: { kind: Kind; fixedOpen?: boolean; text?: string }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [value, setValue] = useState(text ?? '');
  const [open, setOpen] = useState(false);
  const manual = kind === 'group-close';
  // A・B は emptyItems で作る。C だけは、空に戻すと閉じる動きを呼び出し側で作る
  const emptyItems =
    kind === 'group-keep' ? recentGroups : kind === 'flat-keep' ? recentItems : undefined;
  const suggestions = manual && !value ? recentGroups : cities;
  return (
    <div ref={setContainer} className="relative h-72 w-72">
      {container && (
        <Autocomplete
          label="都市"
          placeholder="都市名を打って探す"
          items={suggestions}
          emptyItems={emptyItems}
          openOn={manual ? 'focus' : 'input'}
          value={value}
          onValueChange={(next) => {
            setValue(next);
            // 空に戻したとき、最後の案だけ閉じる
            if (next === '' && kind === 'group-close') setOpen(false);
          }}
          open={fixedOpen === undefined ? open : fixedOpen}
          onOpenChange={setOpen}
          container={container}
          popoverMaxHeight="none"
          collisionAvoidance={{ side: 'none', align: 'none' }}
        />
      )}
    </div>
  );
}

interface Args {
  pick: string;
}

const meta = {
  title: 'Design Review/248 Autocomplete の空のときの候補',
  id: 'design-review-248-autocomplete-empty-suggest',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<Args>;

export default meta;

export const Candidates: StoryObj<Args> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={248}
      axis="Autocomplete の空のときに出す候補"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const kind = kinds[candidate.id];
        if (column.label.startsWith('フォーカス直後')) {
          return <Cell kind={kind} fixedOpen={kind !== 'none'} />;
        }
        if (column.label.startsWith('「京」')) {
          return <Cell kind={kind} text="京" fixedOpen />;
        }
        return <Cell kind={kind} />;
      }}
    >
      <p>
        決定: 現行版を既定にし、空のときの見出し付きサジェストは props
        でオンにできる形にする（ADR-XXXX、番号は統合時に入れる）。 オンにする props は
        emptyItems（A・B の行はこれで作っている。C
        だけ、空に戻すと閉じる動きを呼び出し側で作っている）。
      </p>
    </Comparison>
  ),
};
