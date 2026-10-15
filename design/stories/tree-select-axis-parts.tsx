import { type ReactNode, useState } from 'react';

import {
  TreeSelect,
  type TreeSelectProps,
  type TreeSelectValue,
} from '../../src/components/tree-select/TreeSelect';
import type { TreeSelectItem } from '../../src/components/tree-select/tree-select-items';
import { docTree } from '../../src/components/tree-select/tree-select-samples';

// TreeSelect の比較（軸 643〜646）で共有する見本
//   OpenFrame: 枠の中に、開いたままの面を置く。行を押して選べ、↑↓・→・← も試せる
//     外を押しても選んでも閉じない（並べて見比べるため）。欄の文は選ぶたびに変わる。下に、外に渡した値を出す
//   FieldOnly: 閉じた欄だけ。押すと開き、ふだんどおり閉じる

/** 開いた面が並んでいても、ページをスクロールできるようにする */
export const scrollableDecorator = (Story: () => ReactNode) => (
  <>
    <style>{'html, body { overflow: auto !important; }'}</style>
    <Story />
  </>
);

type AnyProps = Partial<TreeSelectProps<string, boolean>>;

/** 渡した値を、行の名前でも読めるようにする（「開発・フロントエンド」） */
function labelsOf(
  items: TreeSelectItem[],
  value: TreeSelectValue<string, boolean>,
  scopeNote?: string
) {
  const names = new Map<string, string>();
  const walk = (list: TreeSelectItem[]) => {
    for (const item of list) {
      // 全体（scope）で選んだ親は、配下を含む意味を添える
      names.set(
        item.value,
        scopeNote && item.children ? `${item.label} 全体${scopeNote}` : item.label
      );
      if (item.children) walk(item.children);
    }
  };
  walk(items);
  const values = Array.isArray(value) ? value : value == null ? [] : [value];
  return values.length === 0 ? 'なし' : values.map((v) => names.get(v) ?? v).join('・');
}

export function OpenFrame({
  props,
  height = 'h-[28rem]',
  width = 'w-72',
  density,
  showValue = false,
  items = docTree,
  label = '置き場所',
  scopeNote,
  testId,
}: {
  /** 渡した値の親を「〇〇 全体」と読み、この文を添える（parentSelect="scope"。例:「（今後の課も含む）」） */
  scopeNote?: string;
  /** play で枠を探すための data-testid */
  testId?: string;
  props: AnyProps;
  /** 木。書かないときは docTree */
  items?: TreeSelectItem[];
  /** 欄のラベル */
  label?: string;
  height?: string;
  width?: string;
  density?: 'coarse' | 'fine';
  /** 下に、外に渡した値を出す */
  showValue?: boolean;
}) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  // 外に渡した値。はじめの値は渡す前の形のままなので、行を押すまでは出さない
  const [value, setValue] = useState<TreeSelectValue<string, boolean> | undefined>();
  return (
    <div className="flex flex-col gap-2" data-density={density} data-testid={testId}>
      <div ref={setFrame} className={`relative max-w-full ${width} ${height}`}>
        {frame && (
          <TreeSelect
            {...(props as TreeSelectProps)}
            label={label}
            items={items}
            presentation="popover"
            portalContainer={frame}
            open
            onValueChange={(next) => setValue(next)}
            positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
          />
        )}
      </div>
      {showValue && (
        <p className="text-xs text-fg-muted">
          渡した値:{' '}
          {value === undefined ? (
            '（行を押すと出ます）'
          ) : (
            <>
              <code>{JSON.stringify(value)}</code>（{labelsOf(items, value, scopeNote)}）
            </>
          )}
        </p>
      )}
    </div>
  );
}

export function FieldOnly({ props, width = 'w-72' }: { props: AnyProps; width?: string }) {
  return (
    <div className={`max-w-full ${width}`}>
      <TreeSelect
        {...(props as TreeSelectProps)}
        label="置き場所"
        items={docTree}
        presentation="popover"
      />
    </div>
  );
}
