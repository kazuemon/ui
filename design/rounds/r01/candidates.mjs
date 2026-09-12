// 前半 ラウンド1: 方向を広く散らす（design/README.md「候補の作り方」）。
// 各候補は design/tokens.css（現行版）への上書きとして定義する。
// 変えるのは前半の軸だけ。構造の規則（原則1〜10）はすべての候補で共通。

import { darkenToContrast, oklch } from '../../tools/color.mjs';

const WHITE = '#FFFFFF';

// 中立色を1つの色相で揃えて作る
const neutrals = (hue, chroma, bg = WHITE) => ({
  field: oklch(0.965, chroma, hue),
  fieldAddon: oklch(0.915, chroma * 1.4, hue),
  neutral: oklch(0.955, chroma, hue),
  line: oklch(0.905, chroma * 1.2, hue),
  bg,
});

export default {
  round: 1,
  note: '1ラウンド目は方向を広く散らしています。構造の規則（状態の表し方・影を付ける対象・3層構成）は全案共通で、変えているのは色味・角丸・影・動き・文字・タグ・アイコンの太さです。',
  candidates: [
    {
      id: 'A',
      slug: 'Breeze',
      name: 'そよ風',
      intent:
        '「軽い」に振り切った案。影は輪郭程度、角丸は控えめ、アイコンは細線。色は要所にだけ置く。',
      tokens: {
        color: {
          ...neutrals(220, 0.002),
          tag: '#E3F4FE',
          onTag: darkenToContrast('#007EB3', '#E3F4FE', 4.5),
        },
        radius: { control: 8, card: 12 },
        shadow: {
          raised: '0 1px 2px rgb(31 47 55 / 0.10), 0 0 0 1px rgb(31 47 55 / 0.05)',
          raisedHover: '0 0 0 1px rgb(31 47 55 / 0.06)',
          press: 'none',
          desc: '輪郭程度のごく薄い影',
        },
        motion: {
          duration: 100,
          ease: 'cubic-bezier(0.2, 0, 0, 1)',
          depth: 1,
          hoverDepth: 0,
          scale: 1,
          desc: '素早く 1px 沈む',
        },
        // 太字 18.66px 以上なら大きい文字（3:1）として扱える
        label: {
          transform: 'uppercase',
          style: 'normal',
          weight: 800,
          size: 20,
          tracking: '0.12em',
          color: 'fgBrand',
          sectionColor: 'fgBrand',
        },
        tagDesc: '淡い水色の面＋濃い水色の文字',
        icon: { stroke: 12, desc: 'Light（線幅 12）' },
        neutralDesc: '無彩色',
      },
    },
    {
      id: 'B',
      slug: 'Soda',
      name: 'ソーダ',
      intent:
        '「人懐っこい」を水色で出す案。地をごく薄い水色にして白いカードを浮かせる。影も水色がかり、押すと弾む。',
      tokens: (() => {
        const bg = oklch(0.985, 0.008, 237);
        return {
          color: {
            ...neutrals(237, 0.012, bg),
            surface: WHITE,
            primary: '#007EB3',
            fgSubtle: darkenToContrast('#6E787D', bg, 4.5),
            fgAccent: darkenToContrast('#F53273', bg, 4.5),
            fgBrand: darkenToContrast('#35B9FD', bg, 3),
          },
          radius: { control: 12, card: 20 },
          shadow: {
            raised: '0 2px 6px rgb(0 126 179 / 0.24)',
            raisedHover: '0 1px 3px rgb(0 126 179 / 0.20)',
            press: 'none',
            desc: '水色がかった柔らかい影',
          },
          motion: {
            duration: 220,
            ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            depth: 2,
            hoverDepth: 0,
            scale: 0.97,
            desc: '縮んで弾む（オーバーシュート）',
          },
          label: {
            transform: 'none',
            style: 'normal',
            weight: 800,
            size: 22,
            tracking: '0',
            color: 'fgBrand',
            sectionColor: 'fgAccent',
          },
          tagDesc: '水色の面＋濃い文字',
          icon: { stroke: 16, desc: 'Regular（線幅 16）' },
          neutralDesc: '水色寄り',
        };
      })(),
    },
    {
      id: 'C',
      slug: 'Marshmallow',
      name: 'マシュマロ',
      intent:
        '「やわらかい」を形と動きで出す案。大きめの角丸と、キーキャップのような真下の影。押すと影の分だけ沈む。',
      tokens: {
        color: { ...neutrals(178, 0.014) },
        radius: { control: 14, card: 24 },
        shadow: {
          raised: '0 3px 0 rgb(31 47 55 / 0.20)',
          raisedHover: '0 2px 0 rgb(31 47 55 / 0.20)',
          press: '0 0 0 rgb(31 47 55 / 0.20)',
          desc: '真下にずれた輪郭のはっきりした影',
        },
        motion: {
          duration: 140,
          ease: 'cubic-bezier(0.3, 1.4, 0.6, 1)',
          depth: 3,
          hoverDepth: 1,
          scale: 1,
          desc: '影の厚み（3px）だけ沈む',
        },
        label: {
          transform: 'none',
          style: 'italic',
          weight: 800,
          size: 22,
          tracking: '0',
          color: 'fgAccent',
          sectionColor: 'fgAccent',
        },
        tagDesc: '水色の面＋濃い文字',
        icon: { stroke: 24, desc: 'Bold（線幅 24）' },
        neutralDesc: 'ミント寄り（LightGreen の色相）',
      },
    },
    {
      id: 'D',
      slug: 'Notebook',
      name: 'ノート',
      intent:
        '「整然」を文字組みで出す案。大きな和文と小さく字間を空けた英字の対比。角は締め、影は細く、動きは短い。',
      tokens: {
        color: { ...neutrals(225, 0.006), tag: '#1F2F37', onTag: WHITE },
        radius: { control: 6, card: 12 },
        shadow: {
          raised: '0 1px 0 rgb(31 47 55 / 0.22), 0 1px 3px rgb(31 47 55 / 0.10)',
          raisedHover: '0 1px 0 rgb(31 47 55 / 0.16)',
          press: 'none',
          desc: '下辺に細い線が出る影',
        },
        motion: {
          duration: 90,
          ease: 'cubic-bezier(0.2, 0, 0, 1)',
          depth: 1,
          hoverDepth: 0,
          scale: 1,
          desc: '短く 1px 沈む',
        },
        label: {
          transform: 'uppercase',
          style: 'normal',
          weight: 700,
          size: 12,
          tracking: '0.16em',
          color: 'fgBrandSmall',
          sectionColor: 'fgBrandSmall',
        },
        heading: { size: 30, sectionSize: 26 },
        tagDesc: '濃紺の面＋白文字',
        icon: { stroke: 16, desc: 'Regular（線幅 16）' },
        neutralDesc: '文字色寄り（濃紺グレー）',
      },
    },
  ],
};
