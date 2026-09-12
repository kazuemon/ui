// 候補の描画に使う共有モジュール。
// トークン表 → 部品テンプレート → HTML。generate-round.mjs と compare.mjs から使う。
//
// すべての候補は同じテンプレートから描くので、構造の規則は候補間で必ず揃う。

import { readFileSync } from 'node:fs';
import { contrast, darkenToContrast, hexToOklch, oklchToHex } from './color.mjs';

// ── tokens.css を読む ─────────────────────────────────────

export function readTokens(file) {
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const vars = {};
  for (const m of css.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) vars[m[1]] = m[2].trim();
  const resolveVar = (v) => v.replace(/var\(--([\w-]+)\)/g, (_, n) => resolveVar(vars[n]));
  const get = (n) => (vars[n] == null ? undefined : resolveVar(vars[n]));
  const camel = (s) => s.replace(/-(\w)/g, (_, c) => c.toUpperCase());

  const color = {};
  for (const n of Object.keys(vars))
    if (n.startsWith('color-')) color[camel(n.slice(6))] = get(n).toUpperCase();
  color.tag ??= color.brand;
  color.onTag ??= color.onBrand;
  // ピンクの役割名はラウンド3までの accent から secondary に変わった（design/adr/0013）。内部では accent のまま扱う
  color.accent ??= color.secondary;
  color.fgAccent ??= color.fgSecondary;
  color.onAccent ??= color.onSecondary;

  const num = (n, fallback) => (get(n) == null ? fallback : parseFloat(get(n)));
  const nestedInset = num('card-nested-inset');
  return {
    color,
    radius: {
      control: num('radius-control'),
      card: num('radius-card'),
      media: 0,
      mediaInset: 0,
      ...(nestedInset == null ? {} : { nested: { inset: nestedInset } }),
    },
    radiusDesc: get('radius-desc')?.replace(/^"|"$/g, '') ?? '用途で3段階（原則5）',
    shadow: {
      raised: get('shadow-raised'),
      raisedHover: get('shadow-raised-hover'),
      press: get('shadow-raised-press') ?? 'none',
      desc: get('shadow-desc')?.replace(/^"|"$/g, '') ?? '柔らかい落ち影',
    },
    motion: {
      duration: num('duration-press'),
      ease: get('ease-press'),
      depth: num('press-depth', 0),
      hoverDepth: 0,
      scale: 1,
      desc: '影の変化のみ（沈み込みなし）',
    },
    label: {
      transform: get('label-transform'),
      style: get('label-style'),
      weight: num('label-weight', 800),
      size: num('label-size', 20),
      tracking: get('label-tracking') ?? '0.04em',
      color: 'fgBrand',
      sectionColor: 'fgBrand',
    },
    heading: { size: 26, sectionSize: 22 },
    tagDesc: get('tag-desc')?.replace(/^"|"$/g, '') ?? '水色の面＋濃い文字',
    icon: {
      stroke: num('icon-stroke'),
      standalone: num('icon-stroke-standalone'),
      desc: `線幅 ${num('icon-stroke')}`,
    },
    card: { mediaAspect: get('card-media-aspect') ?? '2 / 1' },
    neutralDesc: get('neutral-desc')?.replace(/^"|"$/g, '') ?? '無彩色',
  };
}

export const merge = (base, over) => {
  const out = { ...base };
  for (const [k, v] of Object.entries(over ?? {}))
    out[k] = v && typeof v === 'object' && !Array.isArray(v) ? merge(base[k] ?? {}, v) : v;
  return out;
};

// 明度だけずらした色（hover・押下の「一段濃く」に使う）
export const shiftL = (hex, dl) => {
  const o = hexToOklch(hex);
  return oklchToHex({ ...o, l: o.l + dl }) ?? hex;
};

// 候補ごとの派生値
export function derive(t) {
  const c = t.color;
  c.fgBrandSmall = darkenToContrast(c.brand, c.bg, 4.5); // 小さいラベル用
  c.lineStrong = darkenToContrast(c.line, c.bg, 3); // 部品の輪郭（3:1）
  c.fieldHover = shiftL(c.field, -0.022);
  c.fieldPress = shiftL(c.field, -0.045);
  c.segmentOn = c.fgAccent; // 白文字を載せるので前景用
  const r = t.radius;
  r.button ??= r.control;
  r.field ??= r.control;
  // 入れ子の型のカード（画像を内側に角丸で収める）。未指定なら標準のカードから作る
  r.nested = { card: r.card, inset: 6, ...r.nested };
  r.nested.media ??= Math.max(r.nested.card - r.nested.inset, 0);
  // アイコン単体のときの線幅（未指定ならテキストと並ぶときと同じ）
  t.icon.standalone ??= t.icon.stroke;
  t.card = { mediaAspect: '2 / 1', ...t.card };
  return t;
}

// 密度ごとの角丸（radius.coarse / radius.fine で上書きできる）
const R = (t, d, key) => (d && t.radius[d.key]?.[key]) ?? t.radius[key];

// ── コントラスト検査（design/adr/0002） ─────────────────────

export function checks(t) {
  const c = t.color;
  const labelLarge = t.label.size >= 18.66;
  return [
    ['本文 / 地', c.fg, c.bg, 4.5],
    ['本文 / 入力欄', c.fg, c.field, 4.5],
    ['キャプション / 地', c.fgSubtle, c.bg, 4.5],
    ['キャプション / 面', c.fgSubtle, c.surface, 4.5],
    ['ボタン文字 / 青', c.onPrimary, c.primary, 4.5],
    ['グレーボタン文字', c.fg, c.neutral, 4.5],
    ['タグ文字 / タグ', c.onTag, c.tag, 4.5],
    ['More 文字 / 地', c.fgAccent, c.bg, 4.5],
    ['選択中セグメント文字', c.onAccent, c.segmentOn, 4.5],
    ['ラベル / 地', c[t.label.color], c.bg, labelLarge ? 3 : 4.5],
    ['セクションラベル / 地', c[t.label.sectionColor], c.bg, labelLarge ? 3 : 4.5],
    ['大見出し（水色） / 地', c.fgBrand, c.bg, 3],
    ['フォーカス枠 / 地', c.primary, c.bg, 3],
    ['エラー枠 / 面', c.danger, c.surface, 3],
    ['エラー文字 / 地', c.danger, c.bg, 4.5],
    ['アイコン / 入力欄', c.fgMuted, c.field, 3],
    ['トグル ON / 地', c.accent, c.bg, 3],
    // トグル OFF のトラックは輪郭を付けない（design/adr/0011）。Disabled との区別は Disabled 側の見た目で付ける
  ].map(([name, fg, bg, need]) => ({ name, fg, bg, need, ratio: contrast(fg, bg) }));
}

// ── 描画モード ─────────────────────────────────────────────
// canvas: design キャンバス用。スイッチは状態を持つ（DCLogic）
// preview: ローカル確認・比較画像用の素の HTML

let MODE = 'preview';
let switches = [];
export function beginArtboard(mode) {
  MODE = mode;
  switches = [];
}

// スイッチを含む artboard に付けるロジック
export function artboardScript() {
  if (MODE !== 'canvas' || !switches.length) return '';
  const defaults = Object.fromEntries(switches.map((on, i) => [`s${i}`, on]));
  return `<script data-dc-script>
class Component extends DCLogic {
  renderVals() {
    const state = this.state || {};
    const defaults = ${JSON.stringify(defaults)};
    const sw = {};
    for (const key of Object.keys(defaults)) {
      const on = state[key] ?? defaults[key];
      sw[key] = on;
      sw['t' + key.slice(1)] = () => this.setState({ [key]: !on });
    }
    return { sw };
  }
}
</script>`;
}

// ── 部品テンプレート ───────────────────────────────────────

export const DENSITY = {
  coarse: {
    name: '指',
    key: 'coarse',
    h: 44,
    fs: 16,
    labelFs: 14,
    capFs: 12,
    padX: 16,
    gap: 8,
    stack: 28,
    tagFs: 12,
    tagPad: '4px 12px',
    sw: [48, 28, 22],
    icon: 20,
  },
  fine: {
    name: 'マウス',
    key: 'fine',
    h: 36,
    fs: 14,
    labelFs: 13,
    capFs: 11,
    padX: 12,
    gap: 6,
    stack: 22,
    tagFs: 11,
    tagPad: '3px 9px',
    sw: [40, 22, 16],
    icon: 16,
  },
};

const ICONS = {
  caretDown: '<polyline points="208 96 128 176 48 96"></polyline>',
  caretRight: '<polyline points="96 48 176 128 96 208"></polyline>',
  list: '<line x1="40" y1="128" x2="216" y2="128"></line><line x1="40" y1="64" x2="216" y2="64"></line><line x1="40" y1="192" x2="216" y2="192"></line>',
  search:
    '<circle cx="112" cy="112" r="80"></circle><line x1="168.57" y1="168.57" x2="224" y2="224"></line>',
};
export const icon = (name, size, stroke, color) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 256 256" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display: block; flex-shrink: 0">${ICONS[name]}</svg>`;

export const FONT_STACK = `'Mulish', 'Mulish Variable', 'IBM Plex Sans JP', ui-sans-serif, system-ui, sans-serif`;
export const MONO_STACK = `'Geist Mono', 'Geist Mono Variable', ui-monospace, monospace`;

// 状態の変化（hover・押下・フォーカス）だけはクラスで書く。値は root の CSS 変数から取る。
export const SHARED_CSS = `
.kz { font-family: ${FONT_STACK}; color: var(--fg); -webkit-font-smoothing: antialiased; text-autospace: normal; line-height: 1.5; }
.kz *, .kz *::before, .kz *::after { box-sizing: border-box; }
.kz button, .kz input, .kz textarea { font: inherit; margin: 0; }
.kz a { color: var(--primary); } .kz a:hover { color: var(--primary); }
.kz-raised { box-shadow: var(--sh-raised); transition: box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease), background-color var(--dur) var(--ease); cursor: pointer; }
.kz-raised:hover { box-shadow: var(--sh-hover); transform: translateY(var(--hover-depth)); }
.kz-raised:active { box-shadow: var(--sh-press); transform: translateY(var(--depth)) scale(var(--scale)); }
.kz-flat { transition: background-color var(--dur) var(--ease), transform var(--dur) var(--ease); cursor: pointer; }
.kz-flat:hover { background-color: var(--flat-hover) !important; }
.kz-flat:active { background-color: var(--flat-press) !important; transform: scale(var(--scale)); }
.kz-field { transition: background-color var(--dur) var(--ease), border-color var(--dur) var(--ease); outline: none; }
.kz-field:hover { background-color: var(--field-hover) !important; }
.kz-field:focus, .kz-field:focus-within { background-color: var(--surface) !important; border-color: var(--primary) !important; }
.kz-switch { position: relative; display: inline-flex; cursor: pointer; }
.kz-switch input { position: absolute; opacity: 0; width: 1px; height: 1px; pointer-events: none; }
.kz-track { transition: background-color var(--dur) var(--ease); }
.kz-knob { transition: transform var(--dur) var(--ease); }
.kz-switch input:checked + .kz-track { background-color: var(--accent) !important; box-shadow: none !important; }
.kz-switch input:checked + .kz-track .kz-knob { transform: translateX(var(--knob-travel)); }
.kz-switch:active .kz-knob { transform: scale(0.92); }
.kz-switch:active input:checked + .kz-track .kz-knob { transform: translateX(var(--knob-travel)) scale(0.92); }
@media (prefers-reduced-motion: reduce) { .kz *, .kz *::before, .kz *::after { transition: none !important; } }
`;

export function rootVars(t) {
  const c = t.color;
  const m = t.motion;
  return [
    `--fg: ${c.fg}`,
    `--surface: ${c.surface}`,
    `--primary: ${c.primary}`,
    `--accent: ${c.accent}`,
    `--line-strong: ${c.lineStrong}`,
    `--field-hover: ${c.fieldHover}`,
    `--sh-raised: ${t.shadow.raised}`,
    `--sh-hover: ${t.shadow.raisedHover}`,
    `--sh-press: ${t.shadow.press}`,
    `--dur: ${m.duration}ms`,
    `--ease: ${m.ease}`,
    `--depth: ${m.depth}px`,
    `--hover-depth: ${m.hoverDepth}px`,
    `--scale: ${m.scale}`,
  ].join('; ');
}

export function labelStyle(t, size = t.label.size, colorKey = t.label.sectionColor) {
  const l = t.label;
  return `font-size: ${size}px; font-weight: ${l.weight}; letter-spacing: ${l.tracking}; text-transform: ${l.transform}; font-style: ${l.style}; color: ${t.color[colorKey]}; line-height: 1.2`;
}

const fieldBox = (t, d, { focused = false, error = false } = {}) => {
  const c = t.color;
  const border = error ? c.danger : focused ? c.primary : 'transparent';
  const bg = focused || error ? c.surface : c.field;
  return `height: ${d.h}px; border-radius: ${R(t, d, 'field')}px; border: 2px solid ${border}; background-color: ${bg}; color: ${c.fg}; font-size: ${d.fs}px; padding: 0 ${d.padX - 2}px; width: 100%`;
};

export const labelEl = (t, d, text) =>
  `<div style="font-size: ${d.labelFs}px; font-weight: 700; color: ${t.color.fg}">${text}</div>`;
export const captionEl = (t, d, text, color = t.color.fgSubtle, align = 'left') =>
  `<div style="font-size: ${d.capFs}px; color: ${color}; text-align: ${align}">${text}</div>`;

export function textField(t, d, { label, value, caption, focused, error }) {
  const c = t.color;
  return `<div style="display: flex; flex-direction: column; gap: ${d.gap}px">
  ${labelEl(t, d, label)}
  <input class="kz-field" value="${value}" style="${fieldBox(t, d, { focused, error })}" />
  ${captionEl(t, d, caption, error ? c.danger : c.fgSubtle)}
</div>`;
}

export function textArea(t, d, { label, value, caption }) {
  return `<div style="display: flex; flex-direction: column; gap: ${d.gap}px">
  ${labelEl(t, d, label)}
  <textarea class="kz-field" rows="4" style="${fieldBox(t, d)}; height: auto; padding: 10px ${d.padX - 2}px; line-height: 1.6; resize: none">${value}</textarea>
  ${captionEl(t, d, caption)}
</div>`;
}

export function selectField(t, d, { label, value, caption, addon }) {
  const c = t.color;
  const r = R(t, d, 'field');
  const addonEl = addon
    ? `<div style="display: flex; align-items: center; align-self: stretch; padding: 0 ${d.padX}px; margin-left: -${d.padX - 2}px; background-color: ${c.fieldAddon}; border-radius: ${Math.max(r - 2, 0)}px 0 0 ${Math.max(r - 2, 0)}px; color: ${c.fg}">${addon}</div>`
    : '';
  return `<div style="display: flex; flex-direction: column; gap: ${d.gap}px">
  ${labelEl(t, d, label)}
  <div class="kz-field" tabindex="0" style="${fieldBox(t, d)}; display: flex; align-items: center; gap: ${d.padX}px; cursor: pointer">
    ${addonEl}
    <span style="flex: 1">${value}</span>
    ${icon('caretDown', d.icon, t.icon.stroke, c.fgMuted)}
  </div>
  ${captionEl(t, d, caption)}
</div>`;
}

export function button(t, d, { variant, text, full = true, iconName }) {
  const c = t.color;
  const iconOnly = iconName && !text;
  const base = `height: ${d.h}px; border-radius: ${R(t, d, 'button')}px; font-size: ${d.fs}px; font-weight: 700; padding: 0 ${iconOnly ? 0 : d.padX}px; ${full ? 'width: 100%' : ''}; ${iconOnly ? `width: ${d.h}px; flex-shrink: 0;` : ''} display: inline-flex; align-items: center; justify-content: center; gap: 8px`;
  if (variant === 'primary')
    return `<button class="kz-raised" style="${base}; border: 0; background-color: ${c.primary}; color: ${c.onPrimary}">${text}</button>`;
  if (variant === 'gray')
    return `<button class="kz-raised" style="${base}; border: 0; background-color: ${c.neutral}; color: ${c.fg}">${iconName ? icon(iconName, d.icon, iconOnly ? t.icon.standalone : t.icon.stroke, c.fg) : ''}${text ?? ''}</button>`;
  // 枠線のみ: 影なし、hover は背景が一段濃くなる
  return `<button class="kz-flat" style="${base}; border: 1.5px solid ${c.primary}; background-color: transparent; color: ${c.primary}; --flat-hover: ${c.field}; --flat-press: ${c.fieldHover}">${text}</button>`;
}

export function switchRow(t, d, { text, caption, checked }) {
  const c = t.color;
  const [w, h, k] = d.sw;
  const inset = (h - k) / 2;
  const i = switches.push(Boolean(checked)) - 1;
  const input =
    MODE === 'canvas'
      ? `<input type="checkbox" checked="{{ sw.s${i} }}" onChange="{{ sw.t${i} }}" />`
      : `<input type="checkbox"${checked ? ' checked=""' : ''} />`;
  return `<div style="display: flex; align-items: center; gap: 12px; min-height: ${d.h}px">
  <div style="flex: 1; display: flex; flex-direction: column; gap: 2px">
    <div style="font-size: ${d.fs}px">${text}</div>
    ${caption ? captionEl(t, d, caption) : ''}
  </div>
  <label class="kz-switch" style="--knob-travel: ${w - k - inset * 2}px">
    ${input}
    <span class="kz-track" style="display: block; position: relative; width: ${w}px; height: ${h}px; border-radius: 9999px; background-color: ${c.field}${t.switchOffOutline ? `; box-shadow: inset 0 0 0 1.5px ${c.lineStrong}` : ''}">
      <span class="kz-knob" style="display: block; position: absolute; left: ${inset}px; top: ${inset}px; width: ${k}px; height: ${k}px; border-radius: 9999px; background-color: #FFFFFF; box-shadow: 0 1px 2px rgb(31 47 55 / 0.3)"></span>
    </span>
  </label>
</div>`;
}

export const tag = (t, d, text) =>
  `<span style="display: inline-flex; align-items: center; font-size: ${d.tagFs}px; font-weight: 700; padding: ${d.tagPad}; border-radius: 9999px; background-color: ${t.color.tag}; color: ${t.color.onTag}; line-height: 1.4">${text}</span>`;

export function morePill(t, d) {
  const c = t.color;
  return `<a class="kz-flat" style="display: inline-flex; align-items: center; justify-content: space-between; gap: 20px; min-width: ${d.key === 'coarse' ? 120 : 108}px; height: ${d.key === 'coarse' ? 36 : 30}px; padding: 0 12px 0 16px; border-radius: 9999px; border: 1.5px solid ${c.fgAccent}; color: ${c.fgAccent}; font-size: ${d.capFs + 1}px; font-weight: 800; text-decoration: none; --flat-hover: ${shiftL(c.bg, -0.02)}; --flat-press: ${shiftL(c.bg, -0.04)}">More ${icon('caretRight', d.capFs + 2, t.icon.stroke, c.fgAccent)}</a>`;
}

export function card(t, d, { date, title, nested = false }) {
  const c = t.color;
  const n = t.radius.nested;
  // radius.mediaInset はラウンド2の「入れ子で」案（標準のカード自体が入れ子）
  const inset = nested ? n.inset : (R(t, d, 'mediaInset') ?? 0);
  const outer = nested ? n.card : R(t, d, 'card');
  const mediaRadius = nested ? n.media : R(t, d, 'media');
  const media = inset
    ? `<div style="aspect-ratio: ${t.card.mediaAspect}; margin: ${inset}px ${inset}px 0; border-radius: ${mediaRadius}px; background-color: ${c.fieldAddon}"></div>`
    : `<div style="aspect-ratio: ${t.card.mediaAspect}; background-color: ${c.fieldAddon}"></div>`;
  return `<article style="display: flex; flex-direction: column; background-color: ${c.surface}; border: 1px solid ${c.line}; border-radius: ${outer}px; overflow: hidden">
  ${media}
  <div style="display: flex; flex-direction: column; gap: 4px; padding: ${d.padX}px ${d.padX}px ${d.padX + 4}px">
    <div style="font-size: ${d.capFs}px; font-weight: 600; color: ${c.fgSubtle}; font-variant-numeric: tabular-nums">${date}</div>
    <div style="font-size: ${d.fs}px; line-height: 1.6; color: ${c.fg}">${title}</div>
  </div>
</article>`;
}

// ── 部品のまとまり（見本シートと比較画像で共用） ─────────────

export const parts = {
  buttons: (t, d) => `<div style="display: flex; flex-direction: column; gap: ${d.gap}px">
    ${labelEl(t, d, 'お問い合わせ')}
    ${button(t, d, { variant: 'primary', text: '送信する' })}
    ${captionEl(t, d, '2〜3日以内に返信します', t.color.fgSubtle, 'center')}
  </div>
  <div style="display: flex; gap: 12px">
    ${button(t, d, { variant: 'gray', text: '下書きに保存' })}
    ${button(t, d, { variant: 'outline', text: 'プレビュー' })}
    ${button(t, d, { variant: 'gray', iconName: 'search', full: false })}
  </div>`,
  fields: (t, d) => `<div style="display: flex; flex-direction: column; gap: ${d.stack}px">
    ${textField(t, d, { label: 'お名前', value: '山田 花子', caption: '本名でなくてもかまいません' })}
    ${textField(t, d, { label: 'メールアドレス', value: 'hanako@example.com', caption: '返信先になります', focused: true })}
    ${textField(t, d, { label: '電話番号', value: '080-1234-567', caption: '電話番号の桁数が足りません', error: true })}
    ${selectField(t, d, { label: 'お問い合わせの種類', value: 'お仕事のご相談', caption: 'あてはまるものを選んでください' })}
    ${selectField(t, d, { label: '住所', value: '足立区', addon: '東京都', caption: '市区町村まで入力してください' })}
  </div>`,
  switches: (t, d) => `<div style="display: flex; flex-direction: column; gap: 4px">
    ${switchRow(t, d, { text: '返信をメールで受け取る', checked: true })}
    ${switchRow(t, d, { text: 'プロフィールを公開する', caption: 'オフにすると検索に表示されません', checked: false })}
  </div>`,
  tags: (t, d) => `<div style="display: flex; flex-wrap: wrap; gap: 6px">
    ${['TypeScript', 'Figma', '音響', 'ピアノ'].map((x) => tag(t, d, x)).join('')}
  </div>`,
  card: (t, d) => `<div style="display: flex; flex-direction: column; gap: ${d.gap + 6}px">
    <div style="display: flex; align-items: center; justify-content: space-between">
      <div style="${labelStyle(t)}">Works</div>
      ${morePill(t, d)}
    </div>
    ${card(t, d, { date: '2026.08.30', title: 'ライブ配信の音響設計をまとめました' })}
    ${
      t.showNestedCard
        ? `<div style="font-family: ${MONO_STACK}; font-size: 11px; color: #525C60; margin-top: 8px">入れ子の型（選べる）</div>
    ${card(t, d, { date: '2026.07.14', title: 'Vue から React へ移行した記録', nested: true })}`
        : ''
    }
  </div>`,
};

// ── 見本シート ─────────────────────────────────────────────

export const SHEET_W = 920;
export const SHEET_H = 2300;
export const SCREEN_W = 390;
export const SCREEN_H = 2320;

function densityColumn(t, d) {
  return `<div style="display: flex; flex-direction: column; gap: ${d.stack + 8}px; width: 400px">
  <div style="font-family: ${MONO_STACK}; font-size: 12px; color: #525C60; padding-bottom: 8px; border-bottom: 1px solid #E2E2E2">${d.name}（${d.key}）· コントロール ${d.h}px · 文字 ${d.fs}px</div>
  ${parts.buttons(t, d)}
  ${parts.fields(t, d)}
  ${parts.switches(t, d)}
  ${parts.tags(t, d)}
  ${parts.card(t, d)}
</div>`;
}

function radiusText(t) {
  const r = t.radius;
  const pair = (k) => {
    const co = r.coarse?.[k] ?? r[k];
    const fi = r.fine?.[k] ?? r[k];
    return co === fi ? `${co}` : `${co}→${fi}`;
  };
  const media = r.mediaInset ? ` · 画像 ${r.media}（内側 ${r.mediaInset}px）` : '';
  const nested = t.showNestedCard
    ? ` · 入れ子カード ${r.nested.card}（画像 ${r.nested.media}・内側 ${r.nested.inset}px）`
    : '';
  return `ボタン ${pair('button')} · 入力欄 ${pair('field')} · カード ${pair('card')}${media}${nested} · 小物 pill`;
}

function specPanel(v, t, results) {
  const c = t.color;
  const sw = (label, hex) => `<div style="display: flex; align-items: center; gap: 8px">
    <span style="width: 22px; height: 22px; border-radius: 9999px; background-color: ${hex}; box-shadow: inset 0 0 0 1px rgb(31 47 55 / 0.12); flex-shrink: 0"></span>
    <span style="display: flex; flex-direction: column; line-height: 1.25"><span style="font-size: 11px; color: #525C60">${label}</span><span style="font-family: ${MONO_STACK}; font-size: 11px; color: #1F2F37">${hex}</span></span>
  </div>`;
  const rule = (k, val, span = false) =>
    `<div style="display: contents"><dt style="color: #525C60">${k}</dt><dd style="margin: 0; color: #1F2F37${span ? '; grid-column: span 3' : ''}">${val}</dd></div>`;
  const failed = results.filter((r) => r.ratio < r.need);
  const min = results.reduce((a, r) => (r.ratio / r.need < a.ratio / a.need ? r : a));
  return `<header style="display: flex; flex-direction: column; gap: 20px; padding: 28px 32px; background-color: #F7F8F8; border-radius: 12px; font-family: ${FONT_STACK}">
  <div style="display: flex; align-items: baseline; gap: 12px">
    <span style="font-family: ${MONO_STACK}; font-size: 14px; font-weight: 600; color: #525C60">${v.id}</span>
    <span style="font-size: 26px; font-weight: 800; color: #1F2F37">${v.name}</span>
    <span style="font-size: 14px; color: #6E787D">${v.slug}</span>
  </div>
  <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #1F2F37; max-width: 60ch">${v.intent}</p>
  <div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px 16px">
    ${sw('地', c.bg)}${sw('入力欄', c.field)}${sw('線', c.line)}${sw('文字', c.fg)}${sw('キャプション', c.fgSubtle)}
    ${sw('水色・面', c.brand)}${sw('水色・前景', c.fgBrand)}${sw('青', c.primary)}${sw('ピンク・面', c.accent)}${sw('ピンク・前景', c.fgAccent)}
  </div>
  <dl style="display: grid; grid-template-columns: max-content 1fr max-content 1fr; gap: 6px 16px; margin: 0; font-size: 12px">
    ${rule('角丸', `${t.radiusDesc} — ${radiusText(t)}`, true)}
    ${rule('中立色', t.neutralDesc)}${rule('影', t.shadow.desc)}
    ${rule('押下', `${t.motion.desc}・${t.motion.duration}ms`)}${rule('ラベル', `${t.label.transform === 'uppercase' ? '大文字' : '先頭のみ大文字'}${t.label.style === 'italic' ? '・イタリック' : ''}・${t.label.size}px`)}
    ${rule('タグ', t.tagDesc)}${rule('アイコン', t.icon.desc)}
    ${rule('コントラスト', failed.length ? `<span style="color: #D4283F">${failed.length} 項目が基準未満</span>` : `${results.length} 項目すべて基準以上（最小 ${min.name} ${min.ratio.toFixed(2)}）`, true)}
  </dl>
</header>`;
}

export function sheet(v, t, results) {
  return `<div class="kz" style="${rootVars(t)}; width: ${SHEET_W}px; min-height: ${SHEET_H}px; padding: 40px; background-color: ${t.color.bg}; display: flex; flex-direction: column; gap: 36px">
  ${specPanel(v, t, results)}
  <div style="display: flex; gap: 40px; align-items: flex-start">
    ${densityColumn(t, DENSITY.coarse)}
    ${densityColumn(t, DENSITY.fine)}
  </div>
</div>`;
}

// ── モバイル画面（Biography 風。指の密度） ─────────────────

export function screen(v, t) {
  const c = t.color;
  const d = DENSITY.coarse;
  const h = t.heading ?? { size: 26, sectionSize: 22 };
  const sectionHead = (
    en,
    ja,
    extra = ''
  ) => `<div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 12px">
    <div style="display: flex; flex-direction: column; gap: 6px">
      <div style="${labelStyle(t)}">${en}</div>
      <h2 style="margin: 0; font-size: ${h.sectionSize}px; font-weight: 700; line-height: 1.3; color: ${c.fg}; text-wrap: balance">${ja}</h2>
    </div>
    ${extra}
  </div>`;
  const readonly = (
    label,
    value,
    caption
  ) => `<div style="display: flex; flex-direction: column; gap: 2px; min-width: 0">
    <div style="font-size: 12px; font-weight: 700; color: ${c.fg}">${label}</div>
    <div style="font-size: ${d.fs}px; padding-bottom: 4px; border-bottom: 1px solid ${c.line}; color: ${c.fg}">${value}</div>
    ${caption ? captionEl(t, d, caption) : ''}
  </div>`;
  const segment = `<div style="display: flex; align-items: center; gap: 8px">
    <span style="font-size: 12px; font-weight: 800; color: ${c.fgAccent}">Mode</span>
    <span style="display: inline-flex; padding: 3px; gap: 2px; border-radius: 9999px; background-color: ${c.field}">
      <span style="font-size: 12px; font-weight: 700; padding: 5px 14px; border-radius: 9999px; background-color: ${c.segmentOn}; color: ${c.onAccent}">Virtual</span>
      <span class="kz-flat" style="font-size: 12px; font-weight: 700; padding: 5px 14px; border-radius: 9999px; color: ${c.fgMuted}; --flat-hover: ${c.fieldHover}; --flat-press: ${c.fieldPress}">Real</span>
    </span>
  </div>`;

  return `<div class="kz" style="${rootVars(t)}; position: relative; width: ${SCREEN_W}px; min-height: ${SCREEN_H}px; background-color: ${c.bg}; overflow: hidden">
  <div aria-hidden="true" style="position: absolute; right: -14px; top: 330px; writing-mode: vertical-rl; font-size: 92px; font-weight: 800; line-height: 1; letter-spacing: 0.02em; color: ${c.field}; user-select: none; pointer-events: none">BIOGRAPHY</div>

  <nav style="position: relative; display: flex; align-items: center; justify-content: space-between; padding: 12px 12px 12px 20px">
    <span style="font-size: 22px; font-weight: 800; color: ${c.brand}; letter-spacing: -0.01em">k6n.jp</span>
    <button class="kz-flat" aria-label="メニュー" style="width: 44px; height: 44px; border: 0; border-radius: ${R(t, d, 'button')}px; background-color: transparent; display: inline-flex; align-items: center; justify-content: center; --flat-hover: ${c.field}; --flat-press: ${c.fieldHover}">${icon('list', 22, t.icon.standalone, c.fg)}</button>
  </nav>

  <section style="position: relative; display: flex; flex-direction: column; gap: 8px; padding: 28px 20px 8px">
    <div style="${labelStyle(t, t.label.size, t.label.color)}">About</div>
    <h1 style="margin: 0; font-size: ${h.size + 2}px; font-weight: 700; line-height: 1.3; color: ${c.fg}">表舞台も、裏方も。</h1>
    <p style="margin: 0; font-size: 14px; color: ${c.fgMuted}">Behind the scenes, and in the spotlight.</p>
  </section>

  <section style="position: relative; display: flex; flex-direction: column; gap: 24px; padding: 48px 20px 0">
    ${sectionHead('Profile', 'プロフィール', segment)}
    <div style="display: flex; gap: 16px; align-items: flex-start">
      <div style="width: 72px; height: 72px; border-radius: 9999px; background-color: ${c.fieldAddon}; flex-shrink: 0"></div>
      <div style="flex: 1; display: flex; flex-direction: column; gap: 16px; min-width: 0">
        ${readonly('名前', 'Kazuemon / かずえもん')}
        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px">
          ${readonly('住んでいるところ', 'Kanagawa')}
          ${readonly('代名詞', 'As you like', 'なんでもええで')}
        </div>
        ${readonly('性格', 'ESFJ / 領事', '公式の MBTI テストの結果ではありません')}
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <div style="font-size: 12px; font-weight: 700">得意なこと</div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px">${['Programming', 'Design', 'Music', 'Sound Engineering', 'Streaming'].map((x) => tag(t, d, x)).join('')}</div>
    </div>
  </section>

  <section style="position: relative; display: flex; flex-direction: column; gap: 20px; padding: 56px 20px 0">
    ${sectionHead('Works', '制作物', morePill(t, d))}
    ${card(t, d, { date: '2026.08.30', title: 'ライブ配信の音響設計をまとめました' })}
    ${card(t, d, { date: '2026.07.14', title: 'Vue から React へ移行した記録', nested: Boolean(t.showNestedCard) })}
  </section>

  <section style="position: relative; display: flex; flex-direction: column; gap: ${d.stack}px; padding: 56px 20px 48px">
    ${sectionHead('Contact', 'お問い合わせ')}
    ${textField(t, d, { label: 'お名前', value: '山田 花子', caption: '本名でなくてもかまいません' })}
    ${textField(t, d, { label: 'メールアドレス', value: 'hanako@example.com', caption: '返信先になります', focused: true })}
    ${selectField(t, d, { label: 'お問い合わせの種類', value: 'お仕事のご相談', caption: 'あてはまるものを選んでください' })}
    ${textArea(t, d, { label: 'メッセージ', value: '配信イベントの音響をお願いしたいです。10月の週末で調整できますか？', caption: '500文字まで' })}
    ${switchRow(t, d, { text: '返信をメールで受け取る', checked: true })}
    <div style="display: flex; flex-direction: column; gap: ${d.gap}px">
      ${button(t, d, { variant: 'primary', text: '送信する' })}
      ${captionEl(t, d, '2〜3日以内に返信します', c.fgSubtle, 'center')}
    </div>
  </section>
</div>`;
}

// ── ラウンドの読み込み ─────────────────────────────────────

// <round>/base-tokens.css（ラウンド開始時点の現行版）に候補の上書きを重ねる
export async function loadRound(roundDir, spec) {
  // currentDesc: 見本シートに出す現行版の説明文（値は変えない）
  const current = merge(readTokens(`${roundDir}/base-tokens.css`), spec.currentDesc);
  const variants = [
    {
      id: '現行版',
      slug: 'Current',
      name: spec.currentName ?? '現行版',
      intent: spec.currentIntent ?? 'このラウンド開始時点の design/tokens.css。比較の基準線です。',
      tokens: {},
    },
    ...spec.candidates,
  ].map((v) => ({ ...v, t: derive(merge(current, v.tokens)) }));
  for (const v of variants) v.results = checks(v.t);
  return variants;
}

export const localFontLinks = (nodeModules) =>
  [
    '@fontsource-variable/mulish/wght.css',
    '@fontsource-variable/mulish/wght-italic.css',
    '@fontsource/ibm-plex-sans-jp/400.css',
    '@fontsource/ibm-plex-sans-jp/700.css',
    '@fontsource-variable/geist-mono/wght.css',
  ]
    .map((p) => `<link rel="stylesheet" href="file://${nodeModules}/${p}">`)
    .join('\n');

export const CHROME = `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell`;
