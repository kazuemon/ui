import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { PageViewsLineChart, type WeeklyViews } from './line-chart/PageViewsLineChart';
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
          '- 線の太さは `var(--border-width-thick)` です。',
          '- `ChartFrame` は、題・説明・凡例と、グラフを描く場所を作ります。描く場所の高さは `height` で変えます。Recharts の `ResponsiveContainer` を描く場所いっぱいに広げます。',
          '- 系列が 2 つ以上なら、凡例（`ChartLegend`）をいつも置きます。4 系列までは、線の右端に名前（`ChartLineLabel`）も書きます。右の余白（`margin.right`）に名前の入る幅を空けます。',
          '- hover のカードは、`Tooltip` の `content` に `ChartTooltip` を返します。印の色は payload の `color` をそのまま渡します。hover した点は、`activeDot` に `ChartDot` を返します。',
          '- 同じ値を表で見る形（`table`）を渡すと、題の行に「グラフ・表」の切り替えが出ます。',
        ].join('\n'),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const PageViews: Story = {
  tags: ['visual'],
  name: '週ごとの閲覧数',
  parameters: {
    docs: { source: sourceCode(asPublished(recipeSource)) },
  },
  render: () => (
    <div className="max-w-2xl">
      <PageViewsLineChart data={views} />
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
