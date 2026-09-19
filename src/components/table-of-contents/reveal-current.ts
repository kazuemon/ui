// 目次を ScrollArea に入れたとき、今の見出しの行が枠の外に出ていたら、枠の中だけをスクロールして見せる
//   scrollIntoView はページまで動かしてしまうので使わない。ScrollArea の外（ページや記事の枠）は動かさない

export function revealInScrollArea(item: HTMLElement) {
  const viewport = item.closest<HTMLElement>('[data-slot="scroll-area-viewport"]');
  if (!viewport) return;
  const box = viewport.getBoundingClientRect();
  const rect = item.getBoundingClientRect();
  if (rect.top < box.top) viewport.scrollTop -= box.top - rect.top;
  else if (rect.bottom > box.bottom) viewport.scrollTop += rect.bottom - box.bottom;
}
