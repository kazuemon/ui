import type { ReactNode } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  type LineChartLook,
  PageViewsLineChart,
  type WeeklyViews,
} from '../../src/recipes/line-chart/PageViewsLineChart';

// 線グラフの部品の軸（672〜679）の比較で共有する枠。行（案）と列（場面）の look を重ねて、レシピのグラフを描く
// 軸が決まったら、比較のストーリーと一緒に消す

const views: WeeklyViews[] = Array.from({ length: 12 }, (_, i) => ({
  week: `${7 + Math.floor((i * 7 + 20) / 30)}/${((i * 7 + 20) % 30) + 1}`,
  blog: Math.round(1200 + i * 90 + Math.sin(i * 0.9) * 260),
  docs: Math.round(800 + i * 140 + Math.cos(i * 0.7) * 180),
  storybook: Math.round(1500 - i * 40 + Math.sin(i * 1.3 + 1) * 220),
}));

export interface LookCandidate extends Omit<Candidate, 'tokens'> {
  look: LineChartLook;
}
export interface LookColumn extends Column {
  look?: LineChartLook;
  width?: number;
}

export function LookComparison({
  index,
  axis,
  pick,
  candidates,
  columns,
  children,
}: {
  index: number;
  axis: string;
  pick?: string;
  candidates: LookCandidate[];
  columns: LookColumn[];
  children: ReactNode;
}) {
  return (
    <Comparison
      index={index}
      axis={axis}
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const col = column as LookColumn;
        const row = candidates.find((c) => c.id === candidate.id);
        return (
          <div style={{ width: col.width ?? 520 }}>
            <PageViewsLineChart data={views} look={{ ...row?.look, ...col.look }} />
          </div>
        );
      }}
    >
      {children}
    </Comparison>
  );
}

export const pickArg = (options: string[]) => ({
  pick: {
    description: '採用した案（ADR の比較画像用）',
    control: 'inline-radio' as const,
    options: ['', ...options],
  },
});
