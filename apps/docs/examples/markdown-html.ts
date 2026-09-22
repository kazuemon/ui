import { diffHtml, shellHtml } from './code-fixtures';
import { landscape, screenshot } from './images';

// 見本のページの「Markdown（Prose）」と、Prose のストーリーで使う HTML の文字列
// remark-gfm → remark-rehype（allowDangerousHtml）→ rehype-raw → Shiki（@shikijs/rehype と transformers）→ rehype-stringify で
//   変換したときと同じ形を、手で書いた。要素と属性の形は GFM の変換器の出力に合わせる
//   脚注: <sup><a data-footnote-ref> と <section data-footnotes class="footnotes">、戻るリンクの中身は文字の ↩
//   チェックリスト: <ul class="contains-task-list"><li class="task-list-item"><input type="checkbox" disabled>
//   表の列の寄せ: <th align="right">
//   kbd と mark は、Markdown の中に書いた HTML がそのまま残ったもの
export const markdownArticleHtml = `<p>Markdown で書いた記事の見本です。<strong>ひととおり</strong>の要素を並べます。強調は <em>ページから離れているもの</em> のように使い、古い情報は <del>9月12日</del> 9月17日のように打ち消します。<br>
改行のあとの行には、<mark>目立たせたい言葉</mark>と<a href="#docs">文字のリンク</a>を置きました。</p>
<p>2 つ目の段落です。文の中のコードは <code>data-reading</code> のように書き、キーは <kbd>Cmd</kbd> + <kbd>K</kbd> のように書きます。</p>
<h2>リスト</h2>
<ul>
<li>部品の高さは、マウスでも指でも 44px です。</li>
<li>文字は、パソコンでは 16px、スマホの機能の画面では 14px にします。記事の中では、スマホでも 16px のままです。
<ul>
<li>入力欄の文字は、どちらも 16px</li>
<li>ラベルとキャプションは、どちらも同じ</li>
</ul>
</li>
<li><code>data-reading</code> を付けた要素の中が、読みものです。</li>
</ul>
<ol start="9">
<li>Heading と Text を足す</li>
<li>Prose を作る</li>
<li>CodeBlock を作る</li>
</ol>
<ul class="contains-task-list">
<li class="task-list-item"><input type="checkbox" disabled checked> 見出しと本文の大きさ</li>
<li class="task-list-item"><input type="checkbox" disabled> 要素のあいだの余白</li>
</ul>
<h2>コード</h2>
<p>ライブラリは pnpm で入れます。</p>
${shellHtml}
<p>設定ファイルは、次のように変えます。</p>
${diffHtml}
<h2>引用</h2>
<blockquote>
<p>コンポーネントがいっぱいあるけど、マテリアルデザインほどかたい感じじゃないモダンな UI ライブラリがつくりたい。</p>
<p>— @kazuemon/ui の README</p>
</blockquote>
<hr>
<h2>画像と表</h2>
<p><img src="${landscape}" alt="空と山の絵"></p>
<p>白っぽい画像にも、細い輪郭が付きます。</p>
<p><img src="${screenshot}" alt="白っぽい画面の絵"></p>
<table>
<thead>
<tr>
<th>部品</th>
<th>中の名前</th>
<th align="right">高さ</th>
</tr>
</thead>
<tbody>
<tr>
<td>ボタン</td>
<td><code>Button</code></td>
<td align="right">44px</td>
</tr>
<tr>
<td>入力欄</td>
<td><code>TextField</code></td>
<td align="right">44px</td>
</tr>
<tr>
<td>大きい指用</td>
<td><code>coarse-large</code></td>
<td align="right">52px</td>
</tr>
</tbody>
</table>
<h3>脚注</h3>
<p>和文と欧文を混ぜても、文字は行の中央にそろえます<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref aria-describedby="footnote-label">1</a></sup>。行の高さは整数の値にします<sup><a href="#user-content-fn-2" id="user-content-fnref-2" data-footnote-ref aria-describedby="footnote-label">2</a></sup>。</p>
<h4>小さな見出し</h4>
<p>h4 より下の見出しは、どれも同じ大きさです。</p>
<section data-footnotes class="footnotes"><h2 class="sr-only" id="footnote-label">Footnotes</h2>
<ol>
<li id="user-content-fn-1">
<p>和文フォントは、縦の寸法を漢字の枠に合わせて補正しています。 <a href="#user-content-fnref-1" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>
</li>
<li id="user-content-fn-2">
<p>端数があると、置かれた位置によって文字だけがずれます。 <a href="#user-content-fnref-2" data-footnote-backref="" aria-label="Back to reference 2" class="data-footnote-backref">↩</a></p>
</li>
</ol>
</section>`;

// 軸 70（要素のあいだの余白）で比べる、短い記事
export const spacingSampleHtml = `<p>記事の書き出しの段落です。和文と English を混ぜた文が、2 行ほどに折り返す長さにしてあります。</p>
<p>2 つ目の段落です。段落のあいだの余白を見ます。</p>
<h2>見出し 2 の節</h2>
<p>見出しのすぐ後ろの段落です。</p>
<ul>
<li>リストの項目
<ul>
<li>入れ子の項目</li>
</ul>
</li>
<li>2 つ目の項目</li>
</ul>
<p>リストの後ろの段落です。</p>
${shellHtml}
<h3>見出し 3 の節</h3>
<p>表の前の段落です。</p>
<table>
<thead>
<tr><th>部品</th><th align="right">高さ</th></tr>
</thead>
<tbody>
<tr><td>ボタン</td><td align="right">44px</td></tr>
<tr><td>入力欄</td><td align="right">44px</td></tr>
</tbody>
</table>
<blockquote>
<p>引用の段落です。</p>
</blockquote>
<h4>見出し 4</h4>
<p><img src="${landscape}" alt="空と山の絵"></p>
<p>画像の後ろの段落です<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref aria-describedby="footnote-label">1</a></sup>。</p>
<hr>
<p>区切り線の後ろの段落です。</p>
<section data-footnotes class="footnotes"><h2 class="sr-only" id="footnote-label">Footnotes</h2>
<ol>
<li id="user-content-fn-1">
<p>脚注の文です。 <a href="#user-content-fnref-1" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>
</li>
</ol>
</section>`;
