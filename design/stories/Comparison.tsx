import { type CSSProperties, Fragment, type ReactNode } from 'react';

export interface Candidate {
  /** 現行版、A、B … */
  id: string;
  name: string;
  /** 何をどう変えたか */
  intent: string;
  /** 値の要約。選んだ時点で、何を保存するかが分かるようにする */
  spec: [label: string, value: string][];
  /** design/tokens.css への上書き。候補はトークンの差だけで作る */
  tokens?: CSSProperties & Record<`--${string}`, string>;
  /** この行を指定の密度に固定する。密度の寸法そのものを比べる軸で使う */
  density?: 'coarse' | 'fine';
}

export interface Column {
  label: string;
  note?: string;
  /** 状態を固定して描く列。parameters.pseudo のセレクタから [data-preview="…"] で参照する */
  preview?: string;
}

interface ComparisonProps {
  /** 後半の軸の番号 */
  index: number;
  axis: string;
  /** 採用した案の id（ADR の比較画像用）。URL から渡せるよう、現行版は current でも指定できる */
  pick?: string;
  /** 何を選ぶのか、選ぶときの注意 */
  children: ReactNode;
  candidates: Candidate[];
  columns: Column[];
  renderCell: (column: Column) => ReactNode;
}

/**
 * 後半の比較の枠（design/README.md）。1つの軸について、現行版と候補を行に、状態を列に並べる
 */
export function Comparison({
  index,
  axis,
  pick,
  children,
  candidates,
  columns,
  renderCell,
}: ComparisonProps) {
  const isPicked = (candidate: Candidate, i: number) =>
    !!pick && (pick === candidate.id || (pick === 'current' && i === 0));
  const grid = {
    gridTemplateColumns: `minmax(200px, 240px) repeat(${columns.length}, minmax(260px, 1fr))`,
  };
  return (
    <div className="flex min-h-screen flex-col gap-8 bg-bg px-6 py-8 text-fg">
      <header className="flex max-w-[68ch] flex-col gap-3">
        <p className="text-sm font-bold text-fg-subtle">
          後半の軸 {String(index).padStart(2, '0')}
        </p>
        <h1 className="text-2xl font-heading text-balance">{axis}</h1>
        <div className="flex flex-col gap-2 text-sm leading-6 text-fg-muted">{children}</div>
      </header>
      <div className="overflow-x-auto">
        <div className="grid gap-x-8" style={grid}>
          <div />
          {columns.map((column) => (
            <div key={column.label} className="flex flex-col gap-0.5 pb-4">
              <span className="text-sm font-bold">{column.label}</span>
              {column.note && <span className="text-xs text-fg-subtle">{column.note}</span>}
            </div>
          ))}
          {candidates.map((candidate, i) => (
            <div
              key={candidate.id}
              className="col-span-full grid grid-cols-subgrid border-t border-line py-6"
              style={candidate.tokens}
              data-density={candidate.density}
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-lg font-heading">{candidate.id}</span>
                  <span className="text-sm font-bold">{candidate.name}</span>
                  {isPicked(candidate, i) && (
                    <span className="shrink-0 rounded-pill bg-tag px-2 py-0.5 text-xs font-bold whitespace-nowrap text-on-tag">
                      採用
                    </span>
                  )}
                </div>
                <p className="text-xs leading-5 text-fg-muted">{candidate.intent}</p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
                  {candidate.spec.map(([label, value]) => (
                    <Fragment key={label}>
                      <dt className="text-fg-subtle">{label}</dt>
                      <dd>{value}</dd>
                    </Fragment>
                  ))}
                </dl>
              </div>
              {columns.map((column) => (
                <div key={column.label} data-preview={column.preview}>
                  {renderCell(column)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
