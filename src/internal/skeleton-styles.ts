// 読み込み中の面（軸 89）。Skeleton と、Image の読み込み中の面が同じクラス列を使う
// 値は design/tokens.css の --skeleton-*。ページと同じレイヤーなので影は付けない（原則1）
//   面: --skeleton-fill の塗り
//   動き: 3 つから選ぶ（skeletonMotion）。どれも止まっているときは、光の帯は面の外にあり、面の濃さは変わらない
//     sweep: 面いっぱいの ::after に、縦の光の帯を面の 3 倍の幅の絵として敷き、その位置を左から右へ動かす（--skeleton-sweep）
//       帯は広く柔らかく（絵の幅の 30%。明るさの山がなだらかで、境目が見えない）
//     sweep-viewport: 同じ帯を画面を基準にして敷く（background-attachment: fixed）。並んだ面の帯がつながり、1 本の光が画面を横切る
//       絵の大きさ・帯の幅も画面が基準になるので、帯は画面の幅の 4 割にする（--skeleton-sweep-viewport）
//     pulse: 光の帯は出さず、面そのものの濃さをゆっくり明滅させる（--skeleton-pulse）
//   動きを減らす設定: どれも光は消し、その場の明滅に置き換える（原則3）
export const skeletonSurface =
  'relative overflow-hidden bg-(--skeleton-fill) motion-reduce:animate-pulse motion-reduce:after:hidden';

const sweepBase =
  'after:pointer-events-none after:absolute after:inset-0 after:bg-no-repeat after:[background-position:100%_0]';

export const skeletonMotion = {
  sweep: [
    sweepBase,
    'after:bg-size-[300%_100%] after:animate-(--skeleton-sweep)',
    'after:[background-image:linear-gradient(90deg,transparent_35%,var(--skeleton-highlight)_50%,transparent_65%)]',
  ].join(' '),
  'sweep-viewport': [
    sweepBase,
    'after:bg-fixed after:bg-size-[250%_100%] after:animate-(--skeleton-sweep-viewport)',
    'after:[background-image:linear-gradient(90deg,transparent_42%,var(--skeleton-highlight)_50%,transparent_58%)]',
  ].join(' '),
  pulse: 'animate-(--skeleton-pulse)',
} as const;
