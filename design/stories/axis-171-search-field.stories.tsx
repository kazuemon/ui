import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import type { AddonShape } from '../../src/components/field-addon/field-addon-context';
import { NumberField } from '../../src/components/number-field/NumberField';
import { PasswordField } from '../../src/components/password-field/PasswordField';
import { SearchField } from '../../src/components/search-field/SearchField';

// 後半の軸 171: 欄の中のボタンのグレー地
//   欄の端に付くものは 3 種類で、見た目で役目を分ける
//     文字（「円」「https://」）= 接頭辞・接尾辞。グレーの塊（FieldAddon）
//     グレー地＋アイコン = 押せるボタン（FieldAddonButton）
//     塗りのないアイコン = 意味の説明（押せない）。SearchField の虫眼鏡
//   地の色はトークン（--field-addon-button-*）、形（端に接する・内側に浮かせる）は部品の addonShape で変える

type AddonCandidate = Candidate & { addonShape: AddonShape };

const candidates: AddonCandidate[] = [
  {
    id: '現行版',
    name: '塗りのないボタン',
    intent:
      'ボタンに地を付けず、アイコンだけを置く（hover で淡く敷く）。虫眼鏡（押せない印）と × の見分けが形だけになる。比べる基準として置く。',
    spec: [
      ['ボタンの地', 'なし'],
      ['形', '—'],
    ],
    tokens: { '--field-addon-button-fill-amount': '0%', '--field-addon-button-shade': '0%' },
    addonShape: 'attached',
  },
  {
    id: 'A',
    name: '端に接するグレーの塊',
    intent:
      '文字の塊と同じグレー・同じ形で、本体の端に接する。欄の外形の中で、端の塊が押せる場所だと分かる。文字の塊と並ぶと（[円][▲▼]）1 つの塊につながる。',
    spec: [
      ['ボタンの地', '文字の塊と同じグレー'],
      ['形', '端に接する（addonShape="attached"）'],
    ],
    tokens: { '--field-addon-button-fill-amount': '100%', '--field-addon-button-shade': '0%' },
    addonShape: 'attached',
  },
  {
    id: 'B',
    name: '内側に浮かせたグレーの塊',
    intent:
      'A の塊を本体の内側に少し浮かせ、角を丸める。小さなボタンが欄の中にある形に見え、グレーが A より軽い。文字の塊も同じように浮く。',
    spec: [
      ['ボタンの地', '文字の塊と同じグレー'],
      ['形', '内側に浮かせる（addonShape="floating"）'],
    ],
    tokens: { '--field-addon-button-fill-amount': '100%', '--field-addon-button-shade': '0%' },
    addonShape: 'floating',
  },
  {
    id: 'C',
    name: '端に接する、一段濃いグレー',
    intent:
      'A の地に文字の色を少し混ぜて、文字の塊より一段濃くする。「円」の塊と ▲▼ が並んでも、どこから押せるかが分かれる。欄の中で濃い色が増える。',
    spec: [
      ['ボタンの地', '文字の塊のグレーに文字の色を 6%'],
      ['形', '端に接する（addonShape="attached"）'],
    ],
    tokens: { '--field-addon-button-fill-amount': '100%', '--field-addon-button-shade': '6%' },
    addonShape: 'attached',
  },
];

const columns: Column[] = [
  { label: 'SearchField', note: '塗りのない虫眼鏡と、消去の ×' },
  { label: '× に hover', preview: 'hover' },
  { label: 'PasswordField', note: '表示の切り替え' },
  { label: 'NumberField split', note: '− と ＋。「円」は値の横の文字' },
  { label: 'NumberField stacked', note: '文字の塊「円」と ▲▼ が並ぶ' },
  { label: 'エラー' },
  { label: '押せない' },
];

function renderCell(column: Column, candidate: Candidate) {
  const { addonShape } = candidates.find(({ id }) => id === candidate.id) ?? candidates[0];
  const search = { label: 'サイト内を検索', placeholder: '例: デザイン', addonShape };
  const body: ReactNode = (() => {
    switch (column.label) {
      case 'PasswordField':
        return (
          <PasswordField label="パスワード" defaultValue="kazuemon-2026" addonShape={addonShape} />
        );
      case 'NumberField split':
        return (
          <NumberField
            label="価格"
            locale="ja-JP"
            defaultValue={1200}
            step={100}
            min={0}
            suffix="円"
            stepper="split"
            addonShape={addonShape}
          />
        );
      case 'NumberField stacked':
        return (
          <NumberField
            label="価格"
            locale="ja-JP"
            defaultValue={1200}
            step={100}
            min={0}
            suffix="円"
            stepper="stacked"
            addonShape={addonShape}
          />
        );
      case 'エラー':
        return (
          <div className="flex flex-col gap-4">
            <SearchField {...search} defaultValue="あ" error="2文字以上で検索してください" />
            <NumberField
              label="価格"
              locale="ja-JP"
              defaultValue={0}
              min={0}
              suffix="円"
              stepper="stacked"
              addonShape={addonShape}
              error="1 円以上にしてください"
            />
          </div>
        );
      case '押せない':
        return (
          <div className="flex flex-col gap-4">
            <SearchField {...search} defaultValue="デザイン" disabled />
            <NumberField
              label="価格"
              locale="ja-JP"
              defaultValue={1200}
              suffix="円"
              stepper="split"
              addonShape={addonShape}
              disabled
            />
          </div>
        );
      default:
        return <SearchField {...search} defaultValue="デザイン" />;
    }
  })();
  return <div className="w-[260px]">{body}</div>;
}

const meta = {
  title: 'Design Review/171 欄の中のボタンのグレー地',
  id: 'design-review-171-search-field',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      // × に指を置いたとき。本体にも hover が当たる
      hover: [
        '[data-preview="hover"] [data-slot="control"]',
        '[data-preview="hover"] [data-slot="field-addon-button"]',
      ],
    },
  },
  args: { pick: 'A,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'A,B'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={171}
      axis="欄の中のボタンのグレー地"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p>
        <strong>
          決定: A（端に接するグレーの塊）を既定にし、B（内側に浮かせる）も addonShape
          で選べる。同じ端に文字とボタンが並ぶときは、文字のグレー地を外し、グレー地はボタンだけにする。
        </strong>
      </p>
      <p>
        欄の端に付くものを、見た目で 3
        つに分けます。文字（「円」「https://」）は接頭辞・接尾辞で、グレーの塊。グレー地にアイコンだけを置いたものは押せるボタン（消去の
        ×・パスワードの目・NumberField の
        −／＋・▲▼）。塗りのないアイコンは意味の説明で、押せません（SearchField の虫眼鏡）。
      </p>
      <p>
        比べるのは、押せるボタンのグレー地の付け方です（端に接する・内側に浮かせる・一段濃くする）。各案で、文字の塊・グレー地のボタン・塗りのない虫眼鏡の
        3 つが見分けられるかを見てください。形（端に接する・浮かせる）は部品の addonShape
        で選べるので、どれを既定にするかも教えてください。
      </p>
    </Comparison>
  ),
};
