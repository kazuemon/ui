// 見出し（Heading）の見た目。Heading と Prose の両方がこのクラス列を使う
//
// このフォルダ（src/internal/reading/）の決まり: 読む部品の見た目を 1 か所に置き、部品と Prose が同じクラス列を使う
//   部品の要素そのものに当てるクラスは、[:where(&:not([data-prose]),&_<要素>)]: の形で書く
//     部品の要素に付けると &（その要素）に、Prose の根に付けると、中の <要素> に効く
//     &:not([data-prose]) は、Prose の根（data-prose を付ける）そのものには効かないようにするため
//     :where() で包むので、根の部分の詳細度は 0。部品では、利用者が className で渡したクラスが勝つ
//     Prose では、要素のあいだの余白の規則（詳細度を持つ）が、部品の余白（my-0 など）に勝つ
//   部品の中の子孫に当てるクラス（[&_:is(th,td)]: など）は、部品と Prose の根のどちらに付けても同じ要素に効くので、そのまま使う
//   Tailwind はソースの文字列からクラスを作るので、クラス列はここに文字で書く（組み立てない）

// 段の大きさは、Prose では h1→1、h2→2、h3→3、h4・h5・h6→4
export const headingStyles = {
  base: '[:where(&:not([data-prose]),&_:is(h1,h2,h3,h4,h5,h6))]:font-heading [:where(&:not([data-prose]),&_:is(h1,h2,h3,h4,h5,h6))]:text-fg',
  size: {
    1: '[:where(&:not([data-prose]),&_h1)]:text-heading-1',
    2: '[:where(&:not([data-prose]),&_h2)]:text-heading-2',
    3: '[:where(&:not([data-prose]),&_h3)]:text-heading-3',
    4: '[:where(&:not([data-prose]),&_:is(h4,h5,h6))]:text-heading-4',
  },
} as const;
