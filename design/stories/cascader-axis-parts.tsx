import { type ReactNode, useState } from 'react';

import {
  Cascader,
  type CascaderItem,
  type CascaderProps,
} from '../../src/components/cascader/Cascader';
import { itemsOnPath } from '../../src/components/cascader/cascader-items';
import { CascaderPanel } from '../../src/components/cascader/CascaderPanel';
import { selectedTokens } from '../../src/internal/listbox/listbox-colors';
import { popupSurfaceClass } from '../../src/internal/overlay/popup-styles';
import { sheetTitleClass } from '../../src/internal/sheet/sheet-styles';

// Cascader の比較のストーリー（軸 647〜650）で共有する見本。軸が決まって比較のストーリーを消すときに、一緒に消す

/** 開いたままの面（浮かべる形の中身）。欄を通さずに置き、そのまま触れる。決まった値を下に書く */
export function OpenPanel({
  items,
  defaultValue = [],
  openOnHover = false,
  parentSelect = 'none',
  hideEmptyColumns,
}: {
  items: CascaderItem[];
  defaultValue?: string[];
  openOnHover?: boolean;
  parentSelect?: CascaderProps['parentSelect'];
  hideEmptyColumns?: boolean;
}) {
  const [value, setValue] = useState<string[]>(defaultValue);
  const [activePath, setActivePath] = useState<string[]>(defaultValue);
  const [picked, setPicked] = useState(0);
  return (
    <div className="flex flex-col items-start gap-2">
      <div
        className={`${popupSurfaceClass} inline-flex overflow-clip text-input shadow-overlay [--available-height:20rem] [--spacing-icon:var(--spacing-icon-input)]`}
        style={selectedTokens('neutral')}
      >
        <CascaderPanel<string>
          items={items}
          value={value}
          activePath={activePath}
          onActivePathChange={setActivePath}
          onPick={(path) => {
            setValue(path);
            setPicked((count) => count + 1);
          }}
          sheet={false}
          rootName="見本"
          openOnHover={openOnHover}
          parentSelect={parentSelect}
          parentRowLabel={(item) => `${item.label} のすべて`}
          emptyText="選択肢がありません"
          backName="戻る"
          parentHintText="次の段があります"
          autoFocus={false}
          hideEmptyColumns={hideEmptyColumns}
        />
      </div>
      <p className="text-xs text-fg-subtle">
        決まった値:{' '}
        {value.length
          ? itemsOnPath(items, value)
              .map((item) => item.label)
              .join(' / ')
          : 'なし'}
        {picked > 0 && `（${picked} 回決めた）`}
      </p>
    </div>
  );
}

/**
 * シートの中身だけを、開いたまま置く（Drawer を通さない見本）。見出しと中身のスクロールの枠はシートと同じ寸法
 * 実際のシートは裏を止めるので、いくつも同時には開けない。比べるための形
 */
export function SheetSpecimen({
  items,
  defaultValue = [],
  sheetHeight,
}: {
  items: CascaderItem[];
  defaultValue?: string[];
  sheetHeight?: CascaderProps['sheetHeight'];
}) {
  const [value, setValue] = useState<string[]>(defaultValue);
  const [activePath, setActivePath] = useState<string[]>(defaultValue);
  return (
    // 画面の代わりの枠の下端に置き、高さの変化が上端の動きで見えるようにする
    <div className="flex h-[30rem] w-[22rem] flex-col justify-end">
      <div
        data-density="coarse"
        className="flex max-h-full min-h-0 flex-col overflow-clip rounded-t-card border border-surface-line bg-surface text-input shadow-sheet [--spacing-icon:var(--spacing-icon-input)]"
        style={selectedTokens('neutral')}
      >
        <p className={`${sheetTitleClass} px-(--sheet-padding-x) py-3`}>お届け先</p>
        <div
          data-slot="sheet-content"
          className="min-h-0 flex-1 overflow-y-auto border-t border-surface-line px-(--sheet-padding-x) pt-(--sheet-padding-x) pb-(--sheet-padding-x)"
        >
          <CascaderPanel<string>
            items={items}
            value={value}
            activePath={activePath}
            onActivePathChange={setActivePath}
            onPick={(path) => setValue(path)}
            sheet
            rootName="お届け先"
            openOnHover={false}
            parentSelect="none"
            parentRowLabel={(item) => `${item.label} のすべて`}
            emptyText="選択肢がありません"
            backName="戻る"
            parentHintText="次の段があります"
            autoFocus={false}
            sheetHeight={sheetHeight}
          />
        </div>
      </div>
    </div>
  );
}

/** 欄から開いて試す（実際の部品）。浮かぶ面はいつも浮かべる */
export function FieldTrial(props: Partial<CascaderProps> & { items: CascaderItem[] }) {
  return (
    <div className="w-72">
      <Cascader label="試す" presentation="popover" {...props} />
    </div>
  );
}

/** 比較のページで、開いた面がページのスクロールを止めないようにする */
export function ScrollFree({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{'html, body { overflow: auto !important; }'}</style>
      {children}
    </>
  );
}
