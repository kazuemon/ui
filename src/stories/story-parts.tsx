import { Fragment, type ReactNode, useState } from 'react';

import { labelClass, type MatrixColumn } from './story-states';

// ストーリーで共有する並べ方。部品そのものではない。値と状態の指定は story-states.ts

interface MatrixProps<R, C extends MatrixColumn> {
  rows: readonly R[];
  columns: readonly C[];
  rowLabel: (row: R) => ReactNode;
  renderCell: (row: R, column: C) => ReactNode;
  /** 列の最小の幅 */
  columnWidth?: string;
}

/** 行と列の組み合わせを表に並べる。列に state があれば、そのセルを data-preview で包む */
export function Matrix<R, C extends MatrixColumn>({
  rows,
  columns,
  rowLabel,
  renderCell,
  columnWidth = '9rem',
}: MatrixProps<R, C>) {
  // 横にはみ出すときはスクロールさせる。フォーカスの線（輪郭の外 4px）が枠で切れないよう、内側に 4px 空ける
  return (
    <div className="overflow-x-auto p-1">
      <div
        className="grid items-center gap-x-6 gap-y-5"
        style={{
          gridTemplateColumns: `max-content repeat(${columns.length}, minmax(${columnWidth}, 1fr))`,
        }}
      >
        <div />
        {columns.map((column, c) => (
          <div key={c} className={labelClass}>
            {column.label}
          </div>
        ))}
        {rows.map((row, r) => (
          <Fragment key={r}>
            <div className={labelClass}>{rowLabel(row)}</div>
            {columns.map((column, c) => (
              <div key={c} data-preview={column.state}>
                {renderCell(row, column)}
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/** 見出し付きの見本を、幅に合わせて折り返して並べる */
export function Gallery({
  children,
  columnWidth = '18rem',
}: {
  children: ReactNode;
  columnWidth?: string;
}) {
  return (
    <div
      className="grid items-start gap-x-8 gap-y-8"
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${columnWidth}), 1fr))` }}
    >
      {children}
    </div>
  );
}

/** 見出し付きの見本 */
export function Specimen({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <p className={labelClass}>{label}</p>
      {children}
    </div>
  );
}

const densities = [
  ['fine', 'マウス（fine）'],
  ['coarse', '指（coarse）'],
] as const;

/** 同じ中身を、マウス用と指用の密度で並べる（data-density で固定する） */
export function DensityPair({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start gap-x-12 gap-y-8">
      {densities.map(([density, label]) => (
        <div key={density} data-density={density} className="flex min-w-0 flex-col gap-3">
          <p className={labelClass}>{label}</p>
          {children}
        </div>
      ))}
    </div>
  );
}

/**
 * スマートフォンの画面の代わり（幅 375px・指用の密度）。シートは画面の下に固定して出るので、枠を位置の基準にする（transform）
 * 中身には、重なる面を描く場所（container）として枠の要素を渡す
 */
export function PhoneFrame({ children }: { children: (frame: HTMLElement) => ReactNode }) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setFrame}
      data-density="coarse"
      className="relative h-[640px] w-[375px] max-w-full [transform:translateZ(0)] overflow-clip rounded-[28px] border border-line bg-bg"
    >
      <div className="flex flex-col gap-5 px-5 pt-8">{frame && children(frame)}</div>
    </div>
  );
}

/**
 * パソコンの画面の代わり（マウス用の密度）。Dialog・Drawer は画面に固定して出るので、枠を位置の基準にする（transform）
 */
export function ScreenFrame({
  children,
  height = 'h-[520px]',
}: {
  children: (frame: HTMLElement) => ReactNode;
  height?: string;
}) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setFrame}
      data-density="fine"
      className={`relative ${height} w-[720px] max-w-full [transform:translateZ(0)] overflow-clip rounded-card border border-line bg-bg`}
    >
      <div className="flex flex-col items-start gap-4 p-6">{frame && children(frame)}</div>
    </div>
  );
}
