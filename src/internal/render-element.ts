import { mergeProps } from '@base-ui/react/merge-props';
import {
  Children,
  cloneElement,
  createElement,
  isValidElement,
  type ReactElement,
  type Ref,
  type RefCallback,
} from 'react';

// render を受ける部品を、フックを使わずに描く（Base UI の useRender と同じ重ね方）。
// フックを使わないので、これだけを使う部品はサーバーのまま描ける（Stack・Grid・Container などの骨組み）
//   render がないときは tag の要素を描く
//   render があるときは、部品の props と render の要素の props を mergeProps で重ねる。
//     className はつなぎ、style とイベントのハンドラは合わせ、ほかは render の要素の値が勝つ
//   ref は部品に渡されたものと render の要素のものを両方に届ける

type AnyProps = Record<string, unknown> & { ref?: Ref<unknown> };

function setRef(ref: Ref<unknown>, node: unknown) {
  if (typeof ref === 'function') return ref(node);
  if (ref != null) ref.current = node;
}

/** 2 つの ref を 1 つにする。片方しかないときはそれをそのまま返す（描くたびに付け直さない） */
export function mergeRefs(a: Ref<unknown> | undefined, b: Ref<unknown> | undefined) {
  if (a == null) return b;
  if (b == null) return a;
  const merged: RefCallback<unknown> = (node) => {
    const cleanups = [a, b].map((ref) => {
      const cleanup = setRef(ref, node);
      return typeof cleanup === 'function' ? cleanup : () => setRef(ref, null);
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  };
  return merged;
}

// Server Component で作った render の要素は、Flight が lazy の包みで渡すことがある（.props も .ref もない）
//   Base UI の useRender と同じく、Children.toArray で包みを解いてから読む（https://github.com/react/react/issues/32392）
const REACT_LAZY_TYPE = Symbol.for('react.lazy');

function unwrapLazyRender(render: ReactElement | undefined): ReactElement | undefined {
  // $$typeof は React の内部の印で、公開の型にはない
  if ((render as { $$typeof?: symbol } | undefined)?.$$typeof !== REACT_LAZY_TYPE) return render;
  // 要素に解けたときだけ差し替える（解けないものは、そのまま正しくない render として扱う）
  const unwrapped = Children.toArray(render)[0];
  return isValidElement(unwrapped) ? unwrapped : render;
}

/** render があればその要素に props を重ね、なければ tag の要素を描く */
export function renderElement(tag: string, render: ReactElement | undefined, props: AnyProps) {
  const element = unwrapLazyRender(render);
  if (!isValidElement<AnyProps>(element)) return createElement(tag, props);
  const own = element.props;
  const merged: AnyProps = mergeProps(props, own);
  merged.ref = mergeRefs(props.ref, own.ref);
  return cloneElement(element, merged);
}
