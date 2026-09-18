# 0113. 土台の部品（ThemeProvider・Portal・VisuallyHidden・AspectRatio）

- ステータス: Accepted
- 日付: 2026-09-18
- ラウンド: 後半（ループ外）

## 背景

後半ラウンドで軸 88〜94（Icon・Skeleton・Image・Collapsible・Transition・ScrollArea・Container）を決める前に、それらが乗る土台の部品を作りました。密度・浮かぶ UI の出し方・描く場所をまとめて渡す入口、自前で重ねるものを描く仕組み、読み上げにだけ届ける文、寸法の決まらない中身の枠が要ります。見た目の比較ではなく、何が要るか・何を持たせるかという設計の判断なので、比較のストーリーは作っていません。

## 候補

比較ではなく、ユーザーの 2 つの問いへの答えと、名前の決め方です。

- **Portal は要るか**: 「Portal (base-ui が使えるものは実装しなくても作れるが、それ以外で必要そう？)」という問いに、要る、と答えました。Base UI の重なる部品（Select・Dialog・Popover・Tooltip・Drawer）は自分の Portal を持つので包む必要がありませんが、自前で重ねるもの（画面の下に貼り付く操作の帯、全画面の画像など）には、書いた場所とは別の場所に描く仕組みが要ります
- **Icon で任意のライブラリを持ち込めるか**: 「Icon (基本は phosphor icons を自由に使えるようにしたいが、任意のライブラリやSVGが持ち込めると良い？)」という問いに、持ち込める形にした、と答えました。詳しくは [ADR-0114](./0114-icon.md) にあります
- **Provider の名前**: 最初「Provider という名前は何に対してのものなのかが読みづらかったです。色なども指定できるのであれば ThemeProvider かなと思いましたが、動きだけであれば BehaviorProvider とかでもいいかなと思いました。」という指摘を受け、UIProvider・ThemeProvider・BehaviorProvider・KazuemonProvider の案から ThemeProvider を選びました。色（ダークモード・色の面）もいずれこの入口から渡す前提です

## 決定

- **ThemeProvider**: 中の部品に `density`（`auto`・`fine`・`coarse`）、`presentation`（Select・Dialog・Popover の出し方の既定）、`portalContainer`（浮かぶ部分と Portal を描く場所の既定）、`transitionPreset`（Transition の既定の出方）をまとめて渡します。部品自身の props はいつも ThemeProvider より勝ち、入れ子にしたときは内側で書いた値だけが外側より勝ちます
- **Portal**: 中身を書いた場所ではなく別の場所（既定は document.body）に描きます。書いた場所の祖先の密度を、描く場所でも引き継ぎます。描く場所は、部品の `container` → ThemeProvider の `portalContainer` → document.body の順で決まります
- **VisuallyHidden**: 画面には出さず読み上げにだけ届けます。`focusable` を立てると、キーボードでフォーカスが来たときだけ見せます（本文へ飛ぶリンクなど）。`render` で描く要素を変えられます
- **AspectRatio**: 幅に対する決まった比の高さを取る枠です（既定 16 / 9）。中身は枠いっぱいに広げ、`img`・`video` は切り取って埋めます。角や輪郭は持ちません（Image・Figure が持ちます）
- **Icon の依存**: `@phosphor-icons/react` を、必須ではなく optional の peer dependency にしました。使わない利用者に依存を強いません

## 理由

- **ThemeProvider**: backlog にあった「出し方や密度をまとめて決める Provider」と「寸法を Provider で固定する仕組みがまだない」の両方が、この 1 つの入口で済みました。部品の props が常に勝つ形にしたのは、個別に指定したときにまとめて渡した既定へ埋もれさせないためです
- **Portal**: Base UI の部品はすでに自分の Portal を持つので、包むと二重になります。自前の重ねるものだけに使う、狭い役目の部品にしました
- **名前**: 色・ダークモードも将来この入口から渡す前提なので、動きだけを指す名前より、テーマ全体を指す ThemeProvider を選びました

## 却下した案と理由

比較ではなく設計の判断なので、却下した案はありません。名前の候補のうち UIProvider・BehaviorProvider・KazuemonProvider は選ばれませんでした（理由は「理由」の節にあります）。

## 影響

- `src/components/theme-provider/ThemeProvider.tsx`・`src/components/portal/Portal.tsx`・`src/components/visually-hidden/VisuallyHidden.tsx`・`src/components/aspect-ratio/AspectRatio.tsx` を足しました
- `src/internal/ui-config.ts` に、ThemeProvider が中の部品へ渡す context（`UIConfigContext`）を置きました
- `package.json`: `@phosphor-icons/react` を optional の peer dependency にしました（devDependency にも残しています）
- backlog の「出し方や密度をまとめて決める Provider」と「寸法を Provider で固定する仕組みがまだありません」を消しました。色の面（Surface）とダークモードを ThemeProvider に入れるかは、backlog に残しています

## 原則への反映

反映なし。原則11 の「どちらの判定も、使う側が固定できるようにします」の範囲内で、その仕組みを作ったものです。

## 比較画像

比較のストーリーを作っていないので、画像はありません。
