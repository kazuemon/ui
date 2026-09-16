// 本体の祖先に付いた密度（data-density）と大きい指用（coarse-large）。浮かぶ部分とシートは body の直下に出て、
// 途中の要素から引き継がないので、浮かぶ部分に写す。html に付いたものは body の直下にも効くので写さない
export interface DensityScope {
  density?: string;
  large: boolean;
}

export function readDensityScope(el: Element | null): DensityScope {
  if (!el) return { large: false };
  const root = el.ownerDocument.documentElement;
  const density = el.closest<HTMLElement>('[data-density]');
  const large = el.closest('.coarse-large');
  return {
    density: density && density !== root ? density.dataset.density : undefined,
    large: !!large && large !== root,
  };
}
