import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  type LineChartLook,
  PageViewsLineChart,
  type WeeklyViews,
} from './line-chart/PageViewsLineChart';
import recipeSource from './line-chart/PageViewsLineChart.tsx?raw';
import { sourceCode } from '../stories/story-states';

// レシピ: 部品にせず、既存の部品を組み合わせて作るもの。ここに置くのは組み方の見本で、公開の入口（src/index.ts）には足さない
// 見本のコードは ./line-chart/PageViewsLineChart.tsx。Show code には、その中身を部品の import を 1 行にまとめて出す

/** 部品ごとのファイルからの import を、公開の入口からの 1 行にまとめる（写す人が読む形） */
function asPublished(source: string) {
  const names: string[] = [];
  const rest = source.replace(
    /import \{([^}]*)\} from '\.\.\/\.\.\/components\/[^']+';\n/g,
    (_, list: string) => {
      names.push(
        ...list
          .split(',')
          .map((name) => name.trim())
          .filter(Boolean)
      );
      return '';
    }
  );
  const line = `import {\n${names.map((name) => `  ${name},`).join('\n')}\n} from '@kazuemon/ui';\n`;
  return rest.replace(/(\} from 'recharts';\n)/, `$1\n${line}`);
}

// 架空の閲覧数。3 系列が交わるよう、増え方をずらす
const views: WeeklyViews[] = Array.from({ length: 12 }, (_, i) => ({
  week: `${7 + Math.floor((i * 7 + 20) / 30)}/${((i * 7 + 20) % 30) + 1}`,
  blog: Math.round(1200 + i * 90 + Math.sin(i * 0.9) * 260),
  docs: Math.round(800 + i * 140 + Math.cos(i * 0.7) * 180),
  storybook: Math.round(1500 - i * 40 + Math.sin(i * 1.3 + 1) * 220),
}));

const meta = {
  title: 'Recipes/LineChart',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          '線グラフを、Recharts（`recharts` 3.10.1）でつなぐ見本です。線・軸・目盛り・hover の判定は Recharts が描き、枠・凡例・hover のカード・点・線の端の名前は部品が描きます。Show code のコードを、自分のアプリに写して使ってください。',
          '',
          '- `recharts` は、使う側で入れます（このライブラリの依存には入っていません）。版が変わると API が変わることがあるので、写したら型を確かめてください。',
          '- 色は、トークンを CSS 変数のまま Recharts の props に渡します。系列は `var(--color-series-1)` から順に、グリッドは `var(--color-chart-grid)`、軸の線は `var(--color-chart-axis)`、目盛りの文字は `var(--color-chart-tick)`、hover の縦の線は `var(--color-chart-cursor)` です。',
          '- 線は折れ線（`type="linear"`）、太さは `var(--border-width-thick)` が既定です。点の少ないデータでなめらかに見せたいときは `type="monotone"`（値を行き過ぎない曲線）、線が多く重なるときは `var(--border-width-medium)` に細くします。',
          '- グリッドは、横の淡い実線（`CartesianGrid` の `vertical={false}`）が既定です。破線にするときは `strokeDasharray="2 4"`、引かないときは `CartesianGrid` を置きません。',
          '- `ChartFrame` は、題・説明・凡例と、グラフを描く場所を作ります。描く場所の高さは `height` で変えます。Recharts の `ResponsiveContainer` を描く場所いっぱいに広げます。',
          '- 系列が 2 つ以上なら、凡例（`ChartLegend`）をいつも置きます。4 系列までは、線の右端に名前（`ChartLineLabel`）も書きます。右の余白（`margin.right`）に名前の入る幅を空けます。',
          '- hover のカードは、`Tooltip` の `content` に `ChartTooltip` を返します。印の色は payload の `color` をそのまま渡します。hover した点は、`activeDot` に `ChartDot` を返します。',
          '- 同じ値を表で見る形（`table`）を渡すと、題の行の右に「グラフ・表」の切り替えが出ます。表は、グラフのときの凡例とグラフを合わせた高さにそろい、切り替えても枠の高さが変わりません（`tableHeight="chart"`）。そのために `Table` の `maxHeight` に `var(--chart-table-max-height)` を渡します。',
          '- 選べる形（色の印・凡例の場所・切り替え・hover のカード・線の端の名前・線の形・グリッド）は、Controls で切り替えて見られます。見本の `look` は Controls のための口なので、写すときは使う形を直接書いてください。',
        ].join('\n'),
      },
    },
  },
  args: {
    state: 'data',
    titleSize: 'sm',
    loadingIndicator: 'skeleton',
    emptyVariant: 'text',
    axisTitles: 'none',
    yTicks: 'zero',
    dots: 'none',
    referenceLine: 'none',
    referenceLabel: 'plain',
    legendToggle: false,
    legendHiddenVariant: 'ring',
    markerType: 'dot',
    legendPlacement: 'bottom',
    legendAlign: 'center',
    viewToggle: 'segmented',
    viewToggleSize: 'sm',
    tableHeight: 'chart',
    tooltipVariant: 'value',
    tooltipSize: 'sm',
    lineLabelVariant: 'tinted',
    showLineLabels: true,
    curve: 'linear',
    grid: 'solid',
  },
  argTypes: {
    state: {
      name: '状態',
      control: 'inline-radio',
      options: ['data', 'loading', 'empty'],
    },
    titleSize: {
      name: '題の大きさ（titleSize）',
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    loadingIndicator: {
      name: '読み込み中の印（loadingIndicator）',
      control: 'inline-radio',
      options: ['skeleton', 'spinner', 'grid'],
    },
    emptyVariant: {
      name: 'データなしの見せ方（emptyVariant）',
      control: 'inline-radio',
      options: ['text', 'panel', 'grid'],
    },
    axisTitles: {
      name: '軸の名前（ChartAxisLabel）',
      control: 'inline-radio',
      options: ['none', 'top', 'vertical'],
    },
    yTicks: {
      name: '縦の目盛り（YAxis の domain・tickCount）',
      control: 'inline-radio',
      options: ['zero', 'auto', 'few'],
    },
    dots: {
      name: '線の上の点（Line の dot）',
      control: 'inline-radio',
      options: ['none', 'all', 'last'],
    },
    referenceLine: {
      name: '基準の線（ReferenceLine）',
      control: 'inline-radio',
      options: ['none', 'dashed', 'solid'],
    },
    referenceLabel: {
      name: '基準の名前（ChartReferenceLabel の variant）',
      control: 'inline-radio',
      options: ['plain', 'halo'],
    },
    legendToggle: { name: '凡例で系列を出し入れ（onHiddenChange）', control: 'boolean' },
    legendHiddenVariant: {
      name: '消した系列の見せ方（hiddenVariant）',
      control: 'inline-radio',
      options: ['ring', 'faded', 'strike'],
    },
    markerType: {
      name: '色の印（markerType）',
      control: 'inline-radio',
      options: ['dot', 'dash', 'square'],
    },
    legendPlacement: {
      name: '凡例の場所（legendPlacement）',
      control: 'inline-radio',
      options: ['bottom', 'top'],
    },
    legendAlign: {
      name: '凡例の寄せ（legendAlign）',
      control: 'inline-radio',
      options: ['center', 'start'],
    },
    viewToggle: {
      name: '切り替えの形（viewToggle）',
      control: 'inline-radio',
      options: ['segmented', 'button'],
    },
    viewToggleSize: {
      name: '切り替えの大きさ（viewToggleSize）',
      control: 'inline-radio',
      options: ['sm', 'md'],
    },
    tableHeight: {
      name: '表の高さ（tableHeight）',
      control: 'inline-radio',
      options: ['chart', 'auto'],
    },
    tooltipVariant: {
      name: 'カードの濃さ（ChartTooltip の variant）',
      control: 'inline-radio',
      options: ['value', 'balanced', 'divided'],
    },
    tooltipSize: {
      name: 'カードの文字（ChartTooltip の size）',
      control: 'inline-radio',
      options: ['sm', 'md'],
    },
    lineLabelVariant: {
      name: '線の端の名前の色（ChartLineLabel の variant）',
      control: 'inline-radio',
      options: ['tinted', 'series', 'body', 'muted'],
    },
    showLineLabels: { name: '線の端に名前を書く', control: 'boolean' },
    curve: {
      name: '線の形（Line の type）',
      control: 'inline-radio',
      options: ['linear', 'monotone'],
    },
    grid: {
      name: 'グリッド（CartesianGrid）',
      control: 'inline-radio',
      options: ['solid', 'dashed', 'none'],
    },
  },
} satisfies Meta<LineChartLook>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PageViews: Story = {
  tags: ['visual'],
  name: '週ごとの閲覧数',
  parameters: {
    docs: { source: sourceCode(asPublished(recipeSource)) },
  },
  render: (args) => (
    <div className="max-w-2xl">
      <PageViewsLineChart data={views} look={args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('figure', { name: '週ごとの閲覧数' })).toBeVisible();
    // 表に切り替えると、同じ値を表で読める
    await userEvent.click(canvas.getByRole('radio', { name: '表' }));
    await waitFor(() =>
      expect(canvas.getByRole('table', { name: '週ごとの閲覧数' })).toBeVisible()
    );
    await expect(canvas.getAllByRole('row')).toHaveLength(views.length + 1);
    await userEvent.click(canvas.getByRole('radio', { name: 'グラフ' }));
    await waitFor(() => expect(canvas.queryByRole('table')).toBeNull());
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  },
};
