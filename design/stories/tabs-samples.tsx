import { Link } from '../../src/components/link/Link';
import {
  Tab,
  TabList,
  TabPanel,
  Tabs,
  type TabsColor,
  type TabsIndicator,
  type TabsIndicatorMotion,
} from '../../src/components/tabs/Tabs';
import { statePseudo } from '../../src/stories/story-states';

// 軸 118・119・120（Tabs）の比較で共有する見本と、状態の固定
// 印の形と動きは Tabs の indicator・indicatorMotion props に畳んだので、比較は候補ごとに props を変えて描く

const labels = ['概要', '作品', 'ブログ', '登壇'];

const panelSeveralLinesText =
  'ここでは経歴と得意分野を、写真とあわせて数行にわたって説明します。パネルの丈が高くなると、フォーカスの線がどこまでの範囲を囲むかが変わって見えます。';

/** 比較の見本。4 つのタブ。disabled で最後のタブを押せなくする。panel で中身も出す */
export function TabsSample({
  color,
  indicator,
  indicatorMotion,
  defaultValue = '概要',
  disabled = false,
  panel = false,
  panelLines,
  panelFocusable = true,
}: {
  color?: TabsColor;
  indicator?: TabsIndicator;
  indicatorMotion?: TabsIndicatorMotion;
  defaultValue?: string;
  disabled?: boolean;
  panel?: boolean;
  /** panel の中身の行数（軸 120）。one は1行、several は数行 */
  panelLines?: 'one' | 'several';
  /**
   * パネル自体を Tab の止まり先にするか（軸 120）。false のときは選んでいるパネルから tabIndex を外し、
   * 中に置いた「続きを読む」リンクへ止まる（パネルの中に押せるものがあるときの案）
   * @default true
   */
  panelFocusable?: boolean;
}) {
  return (
    <Tabs
      color={color}
      indicator={indicator}
      indicatorMotion={indicatorMotion}
      defaultValue={defaultValue}
    >
      <TabList aria-label="プロフィール">
        {labels.map((label, i) => (
          <Tab key={label} value={label} disabled={disabled && i === labels.length - 1}>
            {label}
          </Tab>
        ))}
      </TabList>
      {panel &&
        labels.map((label) => {
          const active = label === defaultValue;
          return (
            <TabPanel
              key={label}
              value={label}
              tabIndex={active && !panelFocusable ? -1 : undefined}
              className="text-(length:--text-control) leading-(--leading-control) text-fg-muted"
            >
              「{label}」の中身です。{panelLines === 'several' && panelSeveralLinesText}
              {active && !panelFocusable && (
                <>
                  {' '}
                  <Link href="#">続きを読む</Link>
                </>
              )}
            </TabPanel>
          );
        })}
    </Tabs>
  );
}

const focusColumnIndicators: TabsIndicator[] = ['line', 'underline', 'subtle'];

/**
 * 軸 120 の「タブにフォーカス」列。line・underline・subtle の3つの印を縦に並べ、
 * どれも1つ目のタブにフォーカスした形で見る（下線・並びの線・淡い面のどれとぶつかるかを確かめる）
 */
export function TabsFocusTabColumn({ color }: { color?: TabsColor }) {
  return (
    <div className="flex flex-col gap-4">
      {focusColumnIndicators.map((indicator) => (
        <div key={indicator} className="flex flex-col gap-1">
          <span className="text-xs text-fg-subtle">{indicator}</span>
          <TabsSample indicator={indicator} color={color} />
        </div>
      ))}
    </div>
  );
}

/** n 番目（1 から）のタブ */
export const nthTab = (n: number) => `button[data-slot="tab"]:nth-of-type(${n})`;

/** hover 列は 2 つ目のタブ、フォーカス列は 1 つ目（選んでいるタブ）に当てる */
export const tabsPseudo = statePseudo({ hover: nthTab(2), focusVisible: nthTab(1) });

/**
 * 軸 120（Tabs のフォーカスの線）用。タブの列は1つ目のタブ、パネルの列は選んでいるパネルとその中の
 * リンク（パネルが tabIndex を外しているとき、実際に止まる先）にフォーカス中の見た目を当てる
 */
export const tabsFocusPseudo = {
  rootSelector: 'body',
  focusVisible: [
    `[data-preview="tab"] ${nthTab(1)}`,
    '[data-preview="panel-one"] [data-slot="tab-panel"]',
    '[data-preview="panel-one"] [data-slot="tab-panel"] a',
    '[data-preview="panel-several"] [data-slot="tab-panel"]',
    '[data-preview="panel-several"] [data-slot="tab-panel"] a',
  ],
};
