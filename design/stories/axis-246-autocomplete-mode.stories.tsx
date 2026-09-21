import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { userEvent, waitFor } from 'storybook/test';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  Autocomplete,
  type AutocompleteItem,
} from '../../src/components/autocomplete/Autocomplete';

// 後半の軸 246: Autocomplete の絞り込みと入力の補正
//   候補は部品の props（mode）で行ごとに変える。開いた状態を並べて見せるので、開閉は外から固定する
//   「↓ を 2 回押したあと」の列は、play が各欄で ↓ を 2 回押して、印を移した状態にする

const items: AutocompleteItem[] = [
  '札幌市',
  '仙台市',
  '東京都',
  '京都市',
  '名古屋市',
  '大阪市',
  '神戸市',
  '広島市',
  '福岡市',
].map((label, i) => ({ label, value: `city-${i + 1}` }));

interface Behavior {
  filter: boolean;
  completeInput: boolean;
}

const behaviors: Record<string, Behavior> = {
  現行版: { filter: true, completeInput: false },
  A: { filter: true, completeInput: true },
  B: { filter: false, completeInput: true },
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'list（絞り込むだけ）',
    intent:
      '打った文字に当たる候補だけを出す。↓ で印を移しても、欄の文字は打ったまま変わらない。Enter で選んで初めて欄に入る。',
    spec: [
      ['filter', 'true'],
      ['completeInput', 'false'],
    ],
  },
  {
    id: 'A',
    name: 'both（絞り込み＋仮に入れる）',
    intent:
      '絞り込みは list と同じ。↓ で印を移すと、その候補の文字が欄に仮に入る（打った続きを選んで打てる）。Esc で打った文字に戻る。',
    spec: [
      ['filter', 'true'],
      ['completeInput', 'true'],
    ],
  },
  {
    id: 'B',
    name: 'inline（絞り込まず仮に入れる）',
    intent:
      '候補を絞らず、いつも同じ一覧を出す。↓ で印を移すと、その候補の文字が欄に仮に入る。コマンドの一覧のように、候補が固定のときの形。',
    spec: [
      ['filter', 'false'],
      ['completeInput', 'true'],
    ],
  },
];

const columns: Column[] = [
  { label: '「京」を打った直後', note: '候補の絞り込みの違い' },
  { label: '↓ を 2 回押したあと', note: '欄の文字の違い' },
];

// 開いた状態を外から固定する。フォーカスが動いても閉じない
function Cell({ filter, completeInput }: Behavior) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer} className="relative h-72 w-72">
      {container && (
        <Autocomplete
          label="都市"
          items={items}
          filter={filter}
          completeInput={completeInput}
          defaultValue="京"
          open
          container={container}
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
  title: 'Design Review/246 Autocomplete の絞り込みと補正',
  id: 'design-review-246-autocomplete-mode',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<Args>;

export default meta;

export const Candidates: StoryObj<Args> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={246}
      axis="Autocomplete の絞り込みと補正"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(_, candidate) => <Cell {...behaviors[candidate.id]} />}
    >
      <p>
        決定: 現行版を既定にし、A と B も選べる形にする（ADR-XXXX、番号は統合時に入れる）。mode
        をやめ、「絞り込む（filter・既定は絞り込む。関数で条件も渡せる）」と「入力を候補に補正する
        （completeInput・既定はしない）」の 2 つの props に分けた。
      </p>
      <p>右の列は、各欄で ↓ を 2 回押した状態です（欄の文字が変わるかを見てください）。</p>
    </Comparison>
  ),
  // 右の列の各欄で ↓ を 2 回押して、印を移した状態にする
  play: async ({ canvasElement }) => {
    await waitFor(
      () => {
        if (canvasElement.querySelectorAll('input[role="combobox"]').length < 6) {
          throw new Error('not ready');
        }
      },
      { timeout: 3000 }
    );
    const inputs = Array.from(
      canvasElement.querySelectorAll<HTMLInputElement>('input[role="combobox"]')
    );
    // 3 行 × 2 列。右の列だけ
    const right = inputs.filter((_, i) => i % 2 === 1);
    for (const input of right) {
      input.focus();
      await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    }
  },
};
