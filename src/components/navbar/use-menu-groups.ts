'use client';

import {
  Children,
  Fragment,
  isValidElement,
  type ReactNode,
  useCallback,
  useState,
  useSyncExternalStore,
} from 'react';

import type { NavbarNarrowPlacement } from './Navbar';

type GroupProps = { narrowPlacement?: NavbarNarrowPlacement; children?: ReactNode };

/**
 * 帯が狭いときにメニューへ畳むまとまり（narrowPlacement が menu の NavbarLinks・NavbarGroup）があるか。
 * ブラウザでは、まとまりが自分で名乗り出た数で決める（包んだ部品の中に置いても、サーバーから渡しても数えられる）。
 * サーバーで描くときと hydration のあいだは、children の props から見積もる
 */
export function useMenuGroups(children: ReactNode) {
  const [count, setCount] = useState(0);
  const hydrated = useSyncExternalStore(subscribeNothing, onClient, onServer);
  const register = useCallback(() => {
    setCount((current) => current + 1);
    return () => setCount((current) => current - 1);
  }, []);
  return { hasMenu: hydrated ? count > 0 : mayHaveMenuGroup(children), register };
}

const subscribeNothing = () => () => {};
const onClient = () => true;
const onServer = () => false;

// 見積もり: 部品（HTML の要素でないもの）のうち、narrowPlacement が menu（省いたときも）のものがあれば、あるとみなす
//   サーバーから渡した要素は型が遅延の包みになり、NavbarLinks かどうかを型で見分けられないので、props だけで見る
function mayHaveMenuGroup(children: ReactNode): boolean {
  let found = false;
  Children.forEach(children, (child) => {
    if (found || !isValidElement<GroupProps>(child)) return;
    if (child.type === Fragment) found = mayHaveMenuGroup(child.props.children);
    else if (typeof child.type !== 'string') {
      found = (child.props.narrowPlacement ?? 'menu') === 'menu';
    }
  });
  return found;
}
