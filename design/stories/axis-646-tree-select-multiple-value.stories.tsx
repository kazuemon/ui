import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type Candidate, Comparison } from './Comparison';
import {
  couponTree,
  labelTree,
  notifyTree,
  orgTree,
} from '../../src/components/tree-select/tree-select-samples';
import { scrollableDecorator } from './tree-select-axis-parts';
import { pointColumns, PointRules, type Scene, sceneCell } from './tree-select-point-scenes';

// 軸 646: TreeSelect（複数選ぶ形）で、親の行をどう扱うか（「親もほかの行と同じ点」のルール）
//   それより前の候補（値の渡し方・親そのものを選ぶ形）は、このストーリーに置き換えた（コミットに残っている）
const meta = {
  title: 'Design Review/646 TreeSelect の複数の値',
  id: 'design-review-646-tree-select-multiple-value',
  parameters: { layout: 'fullscreen' },
  decorators: [scrollableDecorator],
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', '現行版', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const orgScene: Scene = {
  testId: 'scope-org',
  items: orgTree,
  label: 'お知らせの宛先',
  scopeNote: '（今後の課も含む）',
  props: {
    multiple: true,
    parentPoint: 'scope',
    defaultValue: ['sales'],
    defaultExpanded: ['sales', 'sales-east'],
  },
};

const scenes: Record<string, Scene> = {
  // 直前の案（参考）: 親の行は開け閉めだけ。開いた子の先頭の「〇〇 そのもの」の行で親を選ぶ
  現行版: {
    items: labelTree,
    label: '記事のカテゴリ',
    props: {
      multiple: true,
      parentSelect: 'row',
      defaultValue: ['dev', 'frontend'],
      defaultExpanded: ['dev', 'design'],
    },
  },
  A: {
    items: notifyTree,
    label: '受け取る通知',
    props: {
      multiple: true,
      parentPoint: 'none',
      defaultValue: ['release', 'maintenance', 'login'],
      defaultExpanded: ['news', 'account'],
    },
  },
  B: {
    items: labelTree,
    label: '記事のカテゴリ',
    props: {
      multiple: true,
      parentPoint: 'label',
      defaultValue: ['dev', 'frontend'],
      defaultExpanded: ['dev', 'design'],
    },
  },
  C: orgScene,
  D: {
    items: couponTree,
    label: 'クーポンの対象商品',
    scopeNote: '（今後追加される商品も対象）',
    props: {
      multiple: true,
      parentPoint: 'scope',
      defaultValue: ['stationery', 'mug'],
      defaultExpanded: ['stationery'],
    },
  },
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '子の先頭の行で親を選ぶ（直前の案・参考）',
    intent:
      '記事のカテゴリ。親の行は開け閉めだけで、開いた子の先頭の「開発 そのもの」の行で親のカテゴリを付ける。比べるために残した直前の案',
    spec: [
      ['props', 'parentSelect="row"'],
      ['親の値', '子の先頭の特別な行'],
    ],
  },
  {
    id: 'A',
    name: 'none: 親は選べない',
    intent:
      '受け取る通知。箱は個々の通知だけ。「お知らせ」などの親は印も左の余白もなく、どこを押しても開け閉め。親の中で選んでいると、名前の右に点',
    spec: [
      ['props', 'parentPoint="none"'],
      ['値', '通知の並び'],
    ],
  },
  {
    id: 'B',
    name: 'label: 親も独立した項目',
    intent:
      '記事のカテゴリ。「開発」そのものも、中の「フロントエンド」も、別々のカテゴリとして付ける。親を選んでも子は変わらない。親の中で選んでいると、名前の右に点',
    spec: [
      ['props', 'parentPoint="label"'],
      ['値', 'カテゴリの並び'],
    ],
  },
  {
    id: 'C',
    name: 'scope: 親が子を覆う',
    intent:
      'お知らせの宛先（部署の木）。「営業本部」を入れると、今後できる課も含めて本部が宛先になり、配下は「含まれる」見た目（塗らない箱に淡いチェック）。含まれる課を押すと、個別の宛先に切り替わる。親の箱は空になり、名前の右に点',
    spec: [
      ['props', 'parentPoint="scope"'],
      ['値', '選んだ点だけ（親なら親 1 つ）'],
      ['含まれる見た目', '塗らない箱に淡いチェック'],
    ],
  },
  {
    id: 'D',
    name: 'scope: クーポンの対象商品',
    intent:
      '「文具」を入れると、今後追加される文具も対象。雑貨は「マグカップ」だけを個別に選んでいる（雑貨の箱は空で、名前の右に点）。雑貨の残りを全部入れても、雑貨の箱は空のまま',
    spec: [
      ['props', 'parentPoint="scope"'],
      ['値', '["stationery","mug"] から'],
    ],
  },
];

export const Points: Story = {
  name: '候補（親もほかの行と同じ点）',
  render: ({ pick }) => (
    <Comparison
      index={646}
      axis="TreeSelect の親の行（複数選ぶ形）"
      pick={pick}
      candidates={candidates}
      columns={pointColumns}
      renderCell={(column, candidate) => sceneCell(column, scenes[candidate.id], 'h-[32rem]')}
    >
      <PointRules />
      <p>
        scope の行（C）で、「営業本部」を外して入れ直す → 「東日本営業部」の「第一課」を押す →
        値が「第二課・西日本営業部」の個別の並びに変わり、「営業本部」の箱は空になる →
        「第一課」を入れ直しても「東日本営業部」の箱は空のまま → 「東日本営業部」の名前の右に点 →
        空の「営業本部」の箱を押すと本部 1 つに戻る、の順に試せます。現行版（1
        行目）は、直前の案（子の先頭の「〇〇 そのもの」の行）を比べるために残したものです。
      </p>
    </Comparison>
  ),
  // scope の切り替え: 親を入れる → 含まれる子を押す → 値が兄弟の個別の並びになり、親は空で点 → 全部入れても親は空 → 空の親を押すと親 1 つ
  play: async ({ canvasElement }) => {
    const frame = within(canvasElement).getByTestId('scope-org');
    const tree = within(frame);
    const valueOf = () => frame.querySelector('code')?.textContent;
    const row = async (name: string) => (await tree.findAllByRole('treeitem', { name }))[0];
    const dotOf = (element: HTMLElement) =>
      element.querySelector(':scope > [data-slot="tree-select-dot"]');

    const sales = await row('営業本部');
    await expect(sales).toHaveAttribute('aria-checked', 'true');
    // 入っている親を押すと、親も配下も外れる。もう一度押すと親 1 つ
    await userEvent.click(sales);
    await waitFor(() => expect(valueOf()).toBe('[]'));
    await userEvent.click(sales);
    await waitFor(() => expect(valueOf()).toBe('["sales"]'));
    // 含まれる子を押すと、個別の選択に切り替わる（押した子は外れ、道筋の兄弟が入る）。親の箱は空（− にしない）
    await userEvent.click(await row('第一課'));
    await waitFor(() => expect(valueOf()).toBe('["sales-east-2","sales-west"]'));
    await expect(sales).toHaveAttribute('aria-checked', 'false');
    // 子を全部入れても、親にはまとめない。親の箱は空のまま
    await userEvent.click(await row('第一課'));
    await waitFor(() => expect(valueOf()).toBe('["sales-east-1","sales-east-2","sales-west"]'));
    const east = await row('東日本営業部');
    await expect(east).toHaveAttribute('aria-checked', 'false');
    // 配下に選んだ行がある親には、開いていても名前の右に点が出る（読み上げは補足の説明）。閉じても残る
    await waitFor(() => expect(dotOf(east)).not.toBeNull());
    await expect(east).toHaveAttribute('aria-description', '配下に選択あり');
    await userEvent.click(east.querySelector('[data-slot="tree-select-caret"]') as HTMLElement);
    await waitFor(() => expect(dotOf(east)).not.toBeNull());
    // 空の親の箱を押すと、親を選ぶ（個別の子は親にまとまる）
    await userEvent.click(sales);
    await waitFor(() => expect(valueOf()).toBe('["sales"]'));
  },
};
