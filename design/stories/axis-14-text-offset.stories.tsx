import type { Meta, StoryObj } from '@storybook/react-vite';
import { useLayoutEffect } from 'react';

import { Button } from '../../src/components/Button';
import { Select } from '../../src/components/Select';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 14: 和文の縦位置の補正（principles.md 実装方針「和文の縦位置」）
// 変えるのは、フォントの縦の寸法（@font-face の ascent-override・descent-override）だけ
// 寸法は @font-face の記述子なので、トークン（CSS 変数）では振れない。案ごとにフォントの定義を別の名前で複製し、
// 行の font-family を差し替える
// 差は「下の余白 − 上の余白」（正 = 上寄り）。文字のインクを画素で測った値を「指用 / マウス用」で並べる
//   指用: 高さ 44px・文字 16px・行 24px、マウス用: 高さ 40px・文字 14px・行 20px

type Metrics = { ascent: number; descent: number };
const SOURCE = { mulish: 'Mulish Variable', plex: 'IBM Plex Sans JP' } as const;

interface Variant {
  /** 英字（Mulish）の縦の寸法。指定しないときは元のまま */
  mulish?: Metrics;
  /** 和文（IBM Plex Sans JP）の縦の寸法 */
  plex?: Metrics;
}

// A〜C の和文: 漢字の枠（上 0.88em・下 0.12em。フォントの typo の寸法）に合わせる
const plexIdeographic = { ascent: 88, descent: 12 };
// 現行版の和文: 補正なし（フォントの hhea の寸法）。いまのフォントの定義には A の補正が入っているので（ADR-0032）、
// 元の値で上書きして再現する
const plexOriginal = { ascent: 106, descent: 44 };

const variants: Record<string, Variant> = {
  現行版: { plex: plexOriginal },
  A: { plex: plexIdeographic },
  B: { plex: plexIdeographic, mulish: { ascent: 98, descent: 27.5 } },
  C: { plex: plexIdeographic, mulish: { ascent: 99.1, descent: 26.4 } },
};

const familyName = (id: string, font: keyof typeof SOURCE) =>
  `axis14-${font}-${Object.keys(variants).indexOf(id)}`;

const fontFamily = (id: string) => {
  const v = variants[id];
  const mulish = v.mulish ? familyName(id, 'mulish') : SOURCE.mulish;
  const plex = v.plex ? familyName(id, 'plex') : SOURCE.plex;
  return `'${mulish}', '${plex}', sans-serif`;
};

// 読み込まれている @font-face のうち、指定したフォントのものを集める
const faceRules = (family: string) => {
  const out: CSSFontFaceRule[] = [];
  const walk = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSFontFaceRule) {
        const name = rule.style.getPropertyValue('font-family').replace(/['"]/g, '').trim();
        if (name === family) out.push(rule);
      } else if (rule instanceof CSSImportRule) {
        if (rule.styleSheet) walk(rule.styleSheet.cssRules);
      } else if (rule instanceof CSSGroupingRule) {
        walk(rule.cssRules);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      walk(sheet.cssRules);
    } catch {
      // 別オリジンのシートは読めない
    }
  }
  return out;
};

const variantCss = () =>
  Object.entries(variants)
    .flatMap(([id, v]) =>
      (['mulish', 'plex'] as const).flatMap((font) => {
        const m = v[font];
        if (!m) return [];
        return faceRules(SOURCE[font]).map((rule) =>
          rule.cssText
            .replace(/font-family:[^;]+;/, `font-family: "${familyName(id, font)}";`)
            .replace(
              /\}\s*$/,
              `ascent-override: ${m.ascent}%; descent-override: ${m.descent}%; line-gap-override: 0%; }`
            )
        );
      })
    )
    .join('\n');

const STYLE_ID = 'axis14-font-variants';

function FontVariants() {
  useLayoutEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = variantCss();
    document.head.append(style);
  }, []);
  return null;
}

const plexSpec = (v: Variant) =>
  v.plex === plexOriginal
    ? '元のまま（上 106%・下 44%）'
    : `上 ${v.plex?.ascent}%・下 ${v.plex?.descent}%`;
const mulishSpec = (v: Variant) =>
  v.mulish ? `上 ${v.mulish.ascent}%・下 ${v.mulish.descent}%` : '元のまま（上 100.5%・下 25%）';

const candidate = (
  id: string,
  name: string,
  intent: string,
  measured: [label: string, value: string][]
): Candidate => ({
  id,
  name,
  intent,
  spec: [
    ['和文の寸法', plexSpec(variants[id])],
    ['英字の寸法', mulishSpec(variants[id])],
    ...measured,
  ],
  tokens: { fontFamily: fontFamily(id) },
});

const candidates: Candidate[] = [
  candidate(
    '現行版',
    '補正なし',
    'フォントの寸法のまま。入力欄（input）の和文だけが上に寄り、同じ文字の Select（div）と縦位置がずれる。',
    [
      ['入力欄の和文', '+2.00 / +2.25px（上寄り）'],
      ['Select の和文', '0.00 / +0.25px'],
      ['英大文字', '−0.50 / −0.50px'],
      ['ボタン「保存する」', '+0.25 / +0.25px'],
      ['ボタン「Save」', '−0.75 / −0.50px'],
    ]
  ),
  candidate(
    'A',
    '和文の寸法を漢字の枠に合わせる',
    '和文フォントの寸法を、漢字の枠（上 0.88em・下 0.12em）に合わせる。和文フォントが行の位置を決める場所（入力欄）だけが変わり、入力欄と Select が揃う。ほかの文字は動かない。',
    [
      ['入力欄の和文', '0.00 / +0.25px'],
      ['Select の和文', '0.00 / +0.25px'],
      ['英大文字', '−0.50 / −0.50px'],
      ['ボタン「保存する」', '+0.25 / +0.25px'],
      ['ボタン「Save」', '−0.75 / −0.50px'],
    ]
  ),
  candidate(
    'B',
    'A＋英字の大文字を中央に',
    'A に加えて、英字フォントの寸法を、大文字が中央に来るようにずらす。英字は少し上がるが、和文が英字の基準線につられて少し上に寄る。ラベルやボタンなど、すべての文字が動く。',
    [
      ['入力欄の和文', '+0.50 / +0.75px'],
      ['Select の和文', '+1.00 / +0.75px'],
      ['英大文字', '0.00〜+0.50 / 0.00px'],
      ['ボタン「保存する」', '+1.25 / +0.75px'],
      ['ボタン「Save」', '+0.25 / 0.00px'],
    ]
  ),
  candidate(
    'C',
    'A＋和文と英字の間を取る',
    'A に加えて、英字フォントの寸法を、和文と英字の大文字の中間に合わせる。和文も大文字も、差が 1px 未満に収まる。すべての文字が動く。マウス用の大きさでは、画素に丸めた結果が B と同じになる。',
    [
      ['入力欄の和文', '+0.50 / +0.75px'],
      ['Select の和文', '+0.50 / +0.75px'],
      ['英大文字', '0.00 / 0.00px'],
      ['ボタン「保存する」', '+0.75 / +0.75px'],
      ['ボタン「Save」', '−0.25 / 0.00px'],
    ]
  ),
];

const columns: Column[] = [
  { label: 'いつもの大きさ', note: '入力欄・Select・ボタンに、和文と英字を入れたもの' },
  {
    label: '2倍＋中心線',
    note: '2倍に拡大し、部品の上下の中心に線を引いています',
    preview: 'guide',
  },
];

const people = [
  { label: '山田 花子', value: 'yamada' },
  { label: '佐藤 一郎', value: 'sato' },
];

const Fields = () => (
  <div className="flex flex-col gap-4">
    <TextField label="お名前" defaultValue="山田 花子" />
    <Select label="担当" items={people} defaultValue="yamada" />
    <TextField label="日付" defaultValue="2026年9月13日" />
    <TextField label="メールアドレス" defaultValue="hanako@example.com" />
    <div className="flex flex-wrap gap-3">
      <Button color="primary">保存する</Button>
      <Button>Save</Button>
    </div>
  </div>
);

const Guide = () => (
  <div className="flex [zoom:2] flex-col gap-3">
    <TextField label="お名前" defaultValue="山田 花子" className="w-40" />
    <Select label="担当" items={people} defaultValue="yamada" className="w-40" />
    <div className="flex flex-wrap gap-2">
      <Button color="primary">保存する</Button>
      <Button>Save</Button>
    </div>
  </div>
);

// 中心線。部品の塗りの上に、上下の中央で 1px（2倍に拡大した後）の線を描く
const guideCss = `
[data-preview='guide'] :is([data-slot='control'], button) {
  background-image: linear-gradient(to bottom, transparent calc(50% - 0.25px), rgb(228 25 102 / 0.7) calc(50% - 0.25px), rgb(228 25 102 / 0.7) calc(50% + 0.25px), transparent calc(50% + 0.25px));
}`;

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/14 和文の縦位置',
  id: 'design-review-14-text-offset',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <>
      <FontVariants />
      <style>{guideCss}</style>
      <Comparison
        index={14}
        axis="和文の縦位置"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={(column) => (column.preview === 'guide' ? <Guide /> : <Fields />)}
      >
        <p>
          <strong className="text-fg">決定: A 和文の寸法を漢字の枠に合わせる</strong>
          （ADR-0032）。「A でいきましょう。」補正を入れたフォントの定義は
          scripts/generate-fonts.mjs が作ります。現行版の行は、元の寸法で上書きして再現しています。
        </p>
        <p>
          入力欄の和文が約 1px
          上に寄って見える件（ラウンド2の質問「お名前の入力欄に入っている文字が上によって見えるのは錯覚やレンダリングの問題ですか？」）を直します。同じ「山田
          花子」でも、入力欄と Select で縦位置がずれています。
        </p>
        <p>
          原因は和文フォント（IBM Plex Sans JP）の寸法です。行の位置を決める寸法（上 1.06em・下
          0.44em）の中心が、漢字の枠（上 0.88em・下 0.12em）の中心より 0.07em
          低いため、和文フォントで行の位置が決まると、漢字が上に寄ります。入力欄では、実際に文字を描くフォントが行の位置を決めるので、和文だけの値が上に寄ります。Select
          やボタンは、先頭の英字フォント（Mulish）が行の位置を決めるので、和文は中央に来ます。
        </p>
        <p>
          A
          は、和文フォントの寸法だけを漢字の枠に合わせます。入力欄の和文だけが動き、ほかは変わりません。B・C
          は、さらに英字フォントの寸法もずらし、英字の大文字を中央に寄せます。英字と和文は同じ基準線に並ぶので、英字を上げると和文も少し上がります。B
          は大文字を中央に、C は和文と大文字の中間に合わせます。B・C
          では、ラベルやボタンを含むすべての文字が動きます。
        </p>
        <p>
          小文字の英字（メールアドレス）は、どの案でも下に寄って見えます（約
          −3px）。小文字は大文字より背が低く、下に伸びる文字（p
          など）もあるためで、英字の組版では普通の見え方です。
        </p>
        <p>
          補正はトークンではなく、フォントの定義（@font-face）に書きます。「2倍＋中心線」の列で、文字が線の上下に均等に載っているかを見られます。ツールバーの「密度」を指にすると、指で操作するときの大きさで見られます。
        </p>
        <p>
          判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
        </p>
      </Comparison>
    </>
  ),
};
