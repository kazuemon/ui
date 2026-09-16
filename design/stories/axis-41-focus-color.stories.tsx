import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useEffect, useState } from 'react';

import { Button } from '../../src/components/Button';
import { Checkbox } from '../../src/components/Checkbox';
import { FieldAddonButton } from '../../src/components/FieldAddon';
import { XIcon } from '../../src/components/icons';
import { Link } from '../../src/components/Link';
import { Notice } from '../../src/components/Notice';
import { Select, type SelectColor } from '../../src/components/Select';
import { Switch } from '../../src/components/Switch';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';
import { keepSwitchCaptionAsCompared, keepToggleColorAsCompared } from './pins';

// 後半の軸 41: フォーカスの色と部品の色
// 軸 32 で、Select の選んだ項目は「部品の色の淡い面＋チェック＋太字」に決まった。そのときのメモで、フォーカスの青と
// 部品の色の組み合わせを考え直すことになった。入力欄のフォーカスの枠線（原則2）と、キーボード操作時の線（ADR-0031）の色を比べる
// 変えるのは次のトークンだけ
//   --focus-follow-color: 1 で、色を持つ部品は枠線と線を部品の色にする（部品が color ごとに --color-own-focus を置く
//     — src/components/focus-styles.ts・field-styles.ts）。0 は部品の色によらず --color-focus の1色
//   --color-focus: 入力欄の枠線の色。--color-focus-ring と、淡い面のお知らせの線（--color-notice-*-ring）はこれを指す
//     （どちらも :root で解決した値を引き継ぐので、行ごとに指し直す）
// E〜H（ユーザーの「今のボタンのように、二重になる構造はどうでしょうか？」の読み方）で、次のトークンも変える
//   --field-focus-ring: 1 で、入力欄の本体にもボタンと同じ離した線を引く（:focus-within。クリックでも出る）
//   --focus-ring-follow-color: 離した線だけを部品の色に従わせるか。F は枠線だけ部品の色（1）、線は1色（0）
//   --focus-ring-edge-width: 部品の縁の内側に引く、部品の色の線（影）の太さ。F で 2px
//   --focus-ring-inner-width・--color-focus-ring-inner: 部品と離した線のあいだを埋める影。G・H で 2px の白
//   --color-notice-*-filled-ring: 塗りのお知らせの中の線。G・H は例外を外して、ほかと同じ線にする
// I・J（ユーザーの「G の Select だけ、…内側は部品色、外側は白+グレーor青」）は G に次を足す。Select だけ三重にする
//   --focus-follow-color: 1・--focus-ring-follow-color: 0 で、入力欄の枠線だけ部品の色（ボタンなどの線は青のまま）
//   --color-select-neutral-focus: 色なしの Select の部品の色（濃いグレー）。TextField には効かない
//   --color-field-own-focus-ring: 部品の色を持つ Select の離した線の色。I はグレー、J は青
// K（ユーザーの「TextField で…エラーリングがある場合は、J のように赤白青」）は現行版に次を足す。ボタンなどは現行版のまま
//   --field-invalid-focus-ring: 1 で、エラーの欄にフォーカスしたときだけ、赤い枠線の外にボタンと同じ離した青い線を引く
//   --field-invalid-focus-ring-inner-width・--color-focus-ring-inner: そのとき枠線と線のあいだを 2px の白で埋める
//   K には一度、エラーが消える（出る）とき線が枠線まで縮む（広がる）動きを付けたが、ユーザーの「追加してもらったアニメーションは外しで」で部品から外した
// L・M（ユーザーの「エラーが無い時はパーツの色1重、エラーがあるときは赤・白・青（フォーカスリング色）」。D と K を合わせた形）は、D に K のエラーの線を足す
//   L: --focus-ring-follow-color: 0・--color-focus-ring: 青で、離した線（エラーの欄の外側とボタンなど）はどこでも青
//   M: D のまま。離した線も部品の色（色なしは濃紺）
// どの行も、選んだ項目は軸 32 の D（B＋太字）。密度はマウス用に固定する

interface Axis {
  /** 入力欄の枠線の色（--color-focus）。transparent はフォーカスで枠線を変えない（エラーの赤は Field が置くので残る） */
  line: string;
  /** キーボードの線（入力欄に離した線を引くときはそれも）の色（--color-focus-ring）。淡い面のお知らせの線もこれ */
  ring?: string;
  follow?: 0 | 1;
  ringFollow?: 0 | 1;
  fieldRing?: 0 | 1;
  edge?: string;
  inner?: string;
  innerColor?: string;
  /** true: 塗りのお知らせの中も ring の色（例外なし）。false: お知らせの文字の色（いまの例外） */
  noticeFilledRing?: boolean;
  /** 色なしの Select が部品の色に従うときの色（--color-select-neutral-focus）。initial は色を持たない */
  selectNeutral?: string;
  /** 部品の色を持つ Select の離した線の色（--color-field-own-focus-ring）。initial はほかの部品と同じ ring */
  fieldOwnRing?: string;
  /** エラーの欄だけに離した線を引くか（--field-invalid-focus-ring） */
  invalidRing?: 0 | 1;
  /** そのとき赤い枠線と線のあいだを埋める幅（--field-invalid-focus-ring-inner-width）。initial は inner と同じ */
  invalidInner?: string;
}

const axis = ({
  line,
  ring = 'var(--color-focus)',
  follow = 0,
  ringFollow = follow,
  fieldRing = 0,
  edge = '0px',
  inner = '0px',
  innerColor = 'transparent',
  noticeFilledRing = false,
  selectNeutral = 'initial',
  fieldOwnRing = 'initial',
  invalidRing = 0,
  invalidInner = 'initial',
}: Axis) => ({
  '--color-select-neutral-focus': selectNeutral,
  '--color-field-own-focus-ring': fieldOwnRing,
  '--field-invalid-focus-ring': String(invalidRing),
  '--field-invalid-focus-ring-inner-width': invalidInner,
  '--focus-follow-color': String(follow),
  '--focus-ring-follow-color': String(ringFollow),
  '--color-focus': line,
  '--color-focus-ring': ring,
  '--color-notice-info-ring': ring,
  '--color-notice-success-ring': ring,
  '--color-notice-warning-ring': ring,
  '--color-notice-danger-ring': ring,
  '--color-notice-info-filled-ring': noticeFilledRing ? ring : 'var(--color-on-notice-info-filled)',
  '--color-notice-success-filled-ring': noticeFilledRing
    ? ring
    : 'var(--color-on-notice-success-filled)',
  '--color-notice-warning-filled-ring': noticeFilledRing
    ? ring
    : 'var(--color-on-notice-warning-filled)',
  '--color-notice-danger-filled-ring': noticeFilledRing
    ? ring
    : 'var(--color-on-notice-danger-filled)',
  '--field-focus-ring': String(fieldRing),
  '--focus-ring-edge-width': edge,
  '--focus-ring-inner-width': inner,
  '--color-focus-ring-inner': innerColor,
  // 選んだ項目: 軸 32 の D（部品の色の淡い面＋チェック＋太字）
  '--select-item-selected-fill': '1',
  '--select-item-selected-ink': '1',
  '--select-item-selected-weight': '700',
  '--color-select-neutral-selected': 'var(--palette-gray-200)',
});

// 現行版と A〜D: 入力欄の枠線とキーボードの線が同じ色（--color-focus）
const axisValues = (focus: string, follow: 0 | 1) => axis({ line: focus, follow });

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'アプリ全体で青の1色',
    intent:
      'いまの見た目（原則2・ADR-0019・ADR-0031）。部品の色によらず、入力欄の枠線もキーボードの線も青。部品の色に従うのは、選んだ項目などの印だけ。',
    spec: [
      ['線の色', '青 #2474DF（どの部品も）'],
      ['白地との比', '4.53（入力欄の塗りの上 4.10）'],
      ['原則への影響', 'なし'],
    ],
    tokens: axisValues('var(--color-primary)', 0),
    density: 'fine',
  },
  {
    id: 'A',
    name: '部品の色に従う',
    intent:
      '色を持つ部品（Select・ボタン・リンク・トグル・チェックボックス・ラジオ）は、枠線と線を部品の色にする。色を指定しない部品と TextField は青のまま。赤いボタン（danger）は赤い線になる。お知らせの中はいまのまま。',
    spec: [
      [
        '線の色',
        '青の部品 #2474DF・ピンクの部品 #E41966（前景用）・赤いボタン #BA012D・色なしと TextField は青 #2474DF',
      ],
      ['白地との比', '青 4.53・ピンク 4.54・赤 6.71（入力欄の塗りの上は青 4.10・ピンク 4.11）'],
      [
        '原則への影響',
        '原則2「線の色は部品によらず 1 色で、既定は青です」「青い枠線だけが付きます」と、原則6「部品の色によらず青が既定なのは、フォーカスの線だけです」を書き換える。ADR-0031 の「線は青」を改める',
      ],
    ],
    tokens: axisValues('var(--color-primary)', 1),
    density: 'fine',
  },
  {
    id: 'B',
    name: 'アプリ全体で1色（ピンク）',
    intent:
      '1色のまま、色をピンク（secondary の前景用）に替えたアプリ。青・ピンク・グレーの部品と並べて、組み合わせを見る。エラーの赤とは色相が近い（エラーは赤い塗りと文でも知らせる）。',
    spec: [
      ['線の色', 'ピンク #E41966（どの部品も）'],
      [
        '白地との比',
        '4.54（入力欄の塗りの上 4.11）。エラーの赤 #BA012D との比 1.48（青と赤も 1.48）',
      ],
      [
        '原則への影響',
        '原則2の「青い枠線」「既定は青です」を、アプリで選ぶ1色に書き換える（選べるだけにするなら「既定は青で、アプリで1色を選べる」）。1色の決まり（ADR-0031）は変わらない',
      ],
    ],
    tokens: axisValues('var(--color-fg-secondary)', 0),
    density: 'fine',
  },
  {
    id: 'C',
    name: 'アプリ全体で1色（濃紺）',
    intent:
      '1色のまま、線を本文の濃紺にする。青を部品の色だけに空ける。主要なデザインシステムにも、中立色（黒や濃いグレー）のフォーカスの線を使うものがある。',
    spec: [
      ['線の色', '濃紺 #1F2F37（本文の色。どの部品も）'],
      ['白地との比', '13.82（入力欄の塗りの上 12.51）'],
      [
        '原則への影響',
        '原則2の「青い枠線」「既定は青です」を濃紺に書き換え、原則6「部品の色によらず青が既定なのは、フォーカスの線だけです」を消す。ADR-0019・0031 の「青」を改める',
      ],
    ],
    tokens: axisValues('var(--color-fg)', 0),
    density: 'fine',
  },
  {
    id: 'D',
    name: '部品の色に従い、色なしは濃紺',
    intent:
      'A と C を合わせる。色を持つ部品は部品の色、色を指定しない部品と TextField は濃紺。色なしの Select では、枠線が選んだ項目（グレーの面に濃紺の文字）とそろう。',
    spec: [
      [
        '線の色',
        '青の部品 #2474DF・ピンクの部品 #E41966・赤いボタン #BA012D・色なしと TextField は濃紺 #1F2F37',
      ],
      ['白地との比', '青 4.53・ピンク 4.54・赤 6.71・濃紺 13.82'],
      [
        '原則への影響',
        'A と同じ文に加え、原則2の「青い枠線」を「部品の色の枠線（色がなければ濃紺）」に書き換える。ADR-0019・0031 の「青」を改める',
      ],
    ],
    tokens: axisValues('var(--color-fg)', 1),
    density: 'fine',
  },
  {
    id: 'E',
    name: '入力欄も離した線',
    intent:
      '「二重になる構造」の読み方1。入力欄・Select の本体も、欄の枠線を青くせず、ボタンと同じく欄から離した青い線を引く（クリックでも出る）。どの部品も「部品＋隙間＋線」の二重に見える。エラーの赤い枠線は状態なので残り、線はその外に付く。suffix のボタンにフォーカスしているあいだは、欄の線を消してボタンの線だけにする。',
    spec: [
      ['線の色', '青 #2474DF（どの部品も。入力欄も同じ線）'],
      [
        '太さ・離し方',
        '2px を部品の輪郭から 2px 離す（入力欄も同じ）。入力欄の枠線はフォーカスで変えない',
      ],
      [
        '白地との比',
        '4.53（入力欄の線も欄の外なので、欄の塗りではなく地と比べる）。濃紺の面 3.05・青の面 1.00',
      ],
      [
        '原則への影響',
        '原則2「フォーカスすると、塗りはそのままで、青い枠線だけが付きます」を「欄から離した青い線が付きます」に、見出し「状態は枠線で表す」と「枠線はフォーカスのものです」を、エラーの枠線とフォーカスの線に分けて書き直す。「欄の枠線を消してボタンの線だけにします」の「枠線」を「線」に。ADR-0019（枠線）と ADR-0031「入力欄は原則2の枠線のまま」を改める',
      ],
    ],
    tokens: axis({ line: 'transparent', ring: 'var(--color-primary)', fieldRing: 1 }),
    density: 'fine',
  },
  {
    id: 'F',
    name: '二重（内側が部品の色、外側が1色）',
    intent:
      '読み方2。内側に部品の色の線、外側に青い線を引く。入力欄は、欄の枠線を部品の色にし、外側に E と同じ離した青い線を足す。ボタン・リンク・トグル・チェックボックスも同じ考え方で、部品の縁の内側に部品の色の線を引き、外側はいまの青い線。塗りのボタンや ON のトグルは内側が塗りに溶け、いまと同じに見える。色を持たない部品と TextField は内側を置かない（外側の青だけ）。',
    spec: [
      [
        '線の色',
        '内側 部品の色（青 #2474DF・ピンク #E41966・赤いボタン #BA012D。色なしと TextField はなし）／外側 青 #2474DF',
      ],
      [
        '太さ・離し方',
        '内側 2px（入力欄は枠線、ほかは縁の内側に影）／外側 2px を輪郭から 2px 離す',
      ],
      [
        '白地との比',
        '外側 4.53。内側 青 4.53・ピンク 4.54・赤 6.71（入力欄の塗りの上は青 4.10・ピンク 4.11）。濃紺の面の外側 3.05・青の面 1.00',
      ],
      [
        '原則への影響',
        '原則2「青い枠線だけが付きます」を「部品の色の枠線と、離した青い線が付きます」に、「線の色は部品によらず 1 色で、既定は青です」を外側の線の決まりに書き換え、内側の線（部品の色）を足す。原則6「青が既定なのは、フォーカスの線だけです」は外側について残る。ADR-0019・ADR-0031 を改める',
      ],
    ],
    tokens: axis({
      line: 'transparent',
      ring: 'var(--color-primary)',
      follow: 1,
      ringFollow: 0,
      fieldRing: 1,
      edge: '2px',
    }),
    density: 'fine',
  },
  {
    id: 'G',
    name: '二重（内側が白、外側が青）',
    intent:
      '読み方3。WCAG の達成方法 C40 や GOV.UK のような2色の線。E の形（入力欄も離した線）で、部品と線のあいだの隙間を地の色ではなく白で埋める。白い地ではいまと同じに見え、濃い面や色の上では白が縁取りになって線が溶けない。そのため、塗りのお知らせの中の例外（文字の色の線）も外した。',
    spec: [
      ['線の色', '内側 白 #FFFFFF／外側 青 #2474DF（どの部品も。お知らせの中も同じ）'],
      ['太さ・離し方', '内側 2px（輪郭に接し、隙間を埋める）／外側 2px を輪郭から 2px 離す'],
      [
        '白地との比',
        '外側 4.53（白は地と同じ）。濃紺の面 白 13.82・青 3.05。青の面 白 4.53・青 1.00。赤の面 白 6.71・青 1.48',
      ],
      [
        '原則への影響',
        'E の書き換えに加え、原則2「線は部品から少し離して描きます。部品の色ではなく地の色と比べる」を「部品と線のあいだを白で埋める。白と青のどちらかが周りと比を取る」に書き換え、「濃い塗りの上では…線をお知らせの文字の色にします」を消す。ADR-0031 の隙間と、ADR-0043 のお知らせの例外を改める',
      ],
    ],
    tokens: axis({
      line: 'transparent',
      ring: 'var(--color-primary)',
      fieldRing: 1,
      inner: '2px',
      innerColor: 'var(--palette-white)',
      noticeFilledRing: true,
    }),
    density: 'fine',
  },
  {
    id: 'H',
    name: '二重（内側が白、外側が濃紺）',
    intent:
      'G の外側を本文の濃紺にした形。C40 の例によくある、黒と白の2色の線に近い。白い地では濃紺、濃い面では白が見え、青の面の上では両方が見える。青を部品の色だけに空ける（C と同じ）。',
    spec: [
      ['線の色', '内側 白 #FFFFFF／外側 濃紺 #1F2F37（どの部品も。お知らせの中も同じ）'],
      ['太さ・離し方', 'G と同じ（内側 2px が隙間を埋め、外側 2px を輪郭から 2px 離す）'],
      [
        '白地との比',
        '外側 13.82。濃紺の面 白 13.82・濃紺 1.00。青の面 白 4.53・濃紺 3.05。赤の面 白 6.71・濃紺 2.06',
      ],
      [
        '原則への影響',
        'G の書き換えに加え、原則2「既定は青です」を濃紺に書き換え、原則6「部品の色によらず青が既定なのは、フォーカスの線だけです」を消す。ADR-0019・0031 の「青」を改める',
      ],
    ],
    tokens: axis({
      line: 'transparent',
      ring: 'var(--color-fg)',
      fieldRing: 1,
      inner: '2px',
      innerColor: 'var(--palette-white)',
      noticeFilledRing: true,
    }),
    density: 'fine',
  },
  {
    id: 'I',
    name: 'G で Select だけ三重（部品の色・白・グレー）',
    intent:
      'ユーザーの提案「G の Select だけ、他のボタンなどと同じように内側は部品色、外側は白+グレーor青」のグレーの形。塗りのボタンが「部品の色の本体・白・線」の三重に見えるのにそろえ、Select はフォーカスで欄の枠線を部品の色（色なしはトグルの ON と同じ濃いグレー）にし、その外を白で埋め、いちばん外にグレーの線を引く。エラーのときは枠線が赤のまま。ボタン・リンク・トグル・チェックボックスと TextField は G のまま（白と青）。',
    spec: [
      [
        '線の色',
        'Select: 内側 部品の色の枠線（青 #2474DF・ピンク #E41966・色なし 濃いグレー #525C60・エラーは赤 #BA012D のまま）／白 #FFFFFF／外側 グレー #939596。ほかの部品と TextField は G と同じ（白と青 #2474DF）',
      ],
      [
        '太さ・離し方',
        '枠線 2px（欄の内側）／白 2px（枠線に接し、隙間を埋める）／外側 2px を輪郭から 2px 離す（G と同じ）',
      ],
      [
        '白地との比',
        '外側のグレー 3.01（線の基準 3:1 をわずかに上回る。濃いグレー #525C60 の 6.87 より軽く見える方を選んだ。白以外の地では下回る — 入力欄の塗りと同じ色の地で 2.73）。枠線は欄の塗りの上で 青 4.10・ピンク 4.11・濃いグレー 6.22・赤 6.08',
      ],
      [
        '原則への影響',
        'G の書き換えに加え、原則2「フォーカスすると、塗りはそのままで、青い枠線だけが付きます」を、色を持つ入力欄（Select）は「部品の色の枠線（色がなければ濃いグレー）・白・離したグレーの線」、TextField は「離した青い線」に分けて書き換える。「線の色は部品によらず 1 色で、既定は青です」を「ボタンなどの線は青、Select の外側の線はグレー」に、原則6「部品の色によらず青が既定なのは、フォーカスの線だけです」も Select を外して書き直す。ADR-0019（青い枠線）と ADR-0031「線 2px・青」「入力欄は原則2の枠線のまま」を改める',
      ],
    ],
    tokens: axis({
      line: 'transparent',
      ring: 'var(--color-primary)',
      follow: 1,
      ringFollow: 0,
      fieldRing: 1,
      inner: '2px',
      innerColor: 'var(--palette-white)',
      noticeFilledRing: true,
      selectNeutral: 'var(--color-fg-muted)',
      fieldOwnRing: 'var(--color-line-strong)',
    }),
    density: 'fine',
  },
  {
    id: 'J',
    name: 'G で Select だけ三重（部品の色・白・青）',
    intent:
      'ユーザーの提案の青の形。I の外側の線を青にする。Select は部品の色の枠線（色なしは濃いグレー）・白・青い線、ほかの部品と TextField は G のまま（白と青）。外側の線はどの部品も青の1色になる。青の Select は、枠線と外側の線が同じ青で、あいだに白が入る。',
    spec: [
      [
        '線の色',
        'Select: 内側 部品の色の枠線（I と同じ）／白 #FFFFFF／外側 青 #2474DF。ほかの部品と TextField は G と同じ（白と青）',
      ],
      ['太さ・離し方', 'I と同じ（枠線 2px・白 2px・外側 2px を輪郭から 2px 離す）'],
      ['白地との比', '外側 4.53（どの部品も同じ青）。枠線は I と同じ（欄の塗りの上で 4.10〜6.22）'],
      [
        '原則への影響',
        'G の書き換えに加え、原則2「青い枠線だけが付きます」を、Select は「部品の色の枠線（色がなければ濃いグレー）と、白を挟んだ離した青い線」、TextField は「離した青い線」に書き換える。外側の線は部品によらず青の1色なので、「線の色は部品によらず 1 色で、既定は青です」と原則6は残る。ADR-0019（青い枠線）と ADR-0031「入力欄は原則2の枠線のまま」を改める',
      ],
    ],
    tokens: axis({
      line: 'transparent',
      ring: 'var(--color-primary)',
      follow: 1,
      ringFollow: 0,
      fieldRing: 1,
      inner: '2px',
      innerColor: 'var(--palette-white)',
      noticeFilledRing: true,
      selectNeutral: 'var(--color-fg-muted)',
      fieldOwnRing: 'var(--color-primary)',
    }),
    density: 'fine',
  },
  {
    id: 'K',
    name: 'いつも青、エラーの欄だけ赤・白・青',
    intent:
      'ユーザーの提案「TextField で単なるフォーカスリングの位置にエラーリングがある場合は、J のように赤白青」「Select は primary カラーをベースとし、neutral を選んだ場合でもフォーカスリングは常に青、選択肢部分のみに色を適用」。フォーカスの目印はいつも青。ふだんの欄は現行版と同じく枠線が青になる。欄の枠線がエラーの赤でふさがっているときだけ、青はボタンと同じく外側に離して引き、あいだを白で埋める（TextField も Select も同じ）。Select の部品の色は、選択肢の中の選んだ項目だけに効く。ボタン・リンク・トグル・チェックボックスは現行版のまま。',
    spec: [
      [
        '線の色',
        'ふだんの欄 枠線 青 #2474DF（Select の部品の色によらない）／エラーの欄 枠線 赤 #BA012D・白 #FFFFFF・外側 青 #2474DF／ボタンなど 青 #2474DF（現行版のまま）',
      ],
      [
        '太さ・離し方',
        'ふだんの欄 枠線 2px（現行版）／エラーの欄 赤い枠線 2px・白 2px（枠線に接し、隙間を埋める）・青 2px を輪郭から 2px 離す（ボタンの線と同じ）／suffix のボタンにフォーカスしているあいだは、欄の外側の青を消してボタンの線だけ（赤い枠線は残る）',
      ],
      [
        '白地との比',
        '青の線 4.53（ふだんの枠線は欄の塗りの上で 4.10）。エラーの欄 外側の青 4.53・赤い枠線 白との比 6.71・エラーの塗りの上 6.13',
      ],
      [
        '原則への影響',
        '原則2に「エラーの欄にフォーカスしたときは、赤い枠線の外に、ボタンと同じ離した青い線を引きます」を足す。ほかの文（青い枠線・線は 1 色で既定は青）はそのまま。原則6「部品の色によらず青が既定なのは、フォーカスの線だけです」は変わらない。ADR-0031「入力欄は原則2の枠線のまま」にエラーの欄の例外を足す',
      ],
    ],
    tokens: axis({
      line: 'var(--color-primary)',
      ring: 'var(--color-primary)',
      innerColor: 'var(--palette-white)',
      invalidRing: 1,
      invalidInner: '2px',
    }),
    density: 'fine',
  },
  {
    id: 'L',
    name: '欄は部品の色の枠線1本、エラーの欄だけ赤・白・青',
    intent:
      'ユーザーの提案「エラーが無い時はパーツの色1重、エラーがあるときは赤・白・青（フォーカスリング色）」（D と K を合わせた形）。ふだんの欄は D と同じく、枠線1本を部品の色にする（色なしの Select と TextField は濃紺）。エラーの欄は K と同じく、赤い枠線の外を白で埋め、離した青い線を引く。離した線はどこでも青の1色で、ボタン・リンク・トグル・チェックボックスの線も現行版と同じ青。',
    spec: [
      [
        '線の色',
        'ふだんの欄 枠線 部品の色（青 #2474DF・ピンク #E41966・色なしの Select と TextField は濃紺 #1F2F37）／エラーの欄 枠線 赤 #BA012D・白 #FFFFFF・外側 青 #2474DF／ボタンなど 青 #2474DF（現行版のまま）',
      ],
      [
        '太さ・離し方',
        'ふだんの欄 枠線 2px／エラーの欄 K と同じ（赤い枠線 2px・白 2px・青 2px を輪郭から 2px 離す）／suffix のボタンにフォーカスしているあいだは、欄の外側の線を消してボタンの線だけ',
      ],
      [
        '白地との比',
        'ふだんの枠線は欄の塗りの上で 青 4.10・ピンク 4.11・濃紺 12.51。離した青い線 4.53',
      ],
      [
        '原則への影響',
        '原則2「青い枠線だけが付きます」を「部品の色の枠線（色がなければ濃紺）だけが付きます」に書き換え、K と同じくエラーの欄の文を足す。「線の色は部品によらず 1 色で、既定は青です」と原則6は、離した線について残る。ADR-0019（青い枠線）と ADR-0031「入力欄は原則2の枠線のまま」を改める',
      ],
    ],
    tokens: axis({
      line: 'var(--color-fg)',
      ring: 'var(--color-primary)',
      follow: 1,
      ringFollow: 0,
      innerColor: 'var(--palette-white)',
      invalidRing: 1,
      invalidInner: '2px',
    }),
    density: 'fine',
  },
  {
    id: 'M',
    name: 'L で、離した線も部品の色',
    intent:
      '「フォーカスリング色」を D の線の色と読んだ形。D に K のエラーの線を足す。ふだんの欄は L と同じく部品の色の枠線1本。離した線（エラーの欄の外側と、ボタン・リンク・トグル・チェックボックスの線）も部品の色に従い、色なしの部品と TextField は濃紺。赤いボタンは赤い線になる。',
    spec: [
      [
        '線の色',
        'ふだんの欄 枠線 L と同じ／エラーの欄 枠線 赤 #BA012D・白 #FFFFFF・外側 部品の色（青 #2474DF・ピンク #E41966・色なしの Select と TextField は濃紺 #1F2F37）／ボタンなど 部品の色（D と同じ）',
      ],
      ['太さ・離し方', 'L と同じ'],
      ['白地との比', '青 4.53・ピンク 4.54・赤 6.71・濃紺 13.82（D と同じ）'],
      [
        '原則への影響',
        'D の書き換え（原則2・原則6、ADR-0019・0031 の「青」を改める）に加え、K と同じくエラーの欄の文を足す',
      ],
    ],
    tokens: axis({
      line: 'var(--color-fg)',
      follow: 1,
      innerColor: 'var(--palette-white)',
      invalidRing: 1,
      invalidInner: '2px',
    }),
    density: 'fine',
  },
];

const colorOf = (column: Column): SelectColor =>
  column.label.startsWith('青')
    ? 'primary'
    : column.label.startsWith('ピンク')
      ? 'secondary'
      : 'neutral';

const selectNote =
  '開いて、4つ目（江戸川区）に hover。本体の枠線（E〜J は離した線も）がフォーカスの色です。下はエラーの Select にフォーカスしたところ（固定）';

const columns: Column[] = [
  { label: '色なし（neutral）の Select', note: selectNote, preview: 'select' },
  { label: '青（primary）の Select', note: selectNote, preview: 'select' },
  { label: 'ピンク（secondary）の Select', note: selectNote, preview: 'select' },
  {
    label: 'フォームの画面',
    note: '入力欄はフォーカス中（E〜J は離した線、K はエラーの欄だけ離した線）、ほかはキーボードのフォーカスの線。比べるため、すべて同時に固定しています',
    preview: 'form',
  },
  {
    label: 'お知らせの中',
    note: '× と中のリンクにキーボードのフォーカス。塗りのお知らせの中は、G〜J 以外は文字の色の線（いまの例外）',
    preview: 'notice',
  },
  {
    label: '濃い面の上',
    note: '濃紺と青のカードに置いた入力欄・リンク・ボタン。入力欄はフォーカス中、ほかはキーボードのフォーカスを固定',
    preview: 'dark',
  },
  {
    label: '触って確かめる',
    note: '表示名は空だとエラー、配達先は選ぶまでエラー。フォーカスしたまま入力すると、エラーが消えたときの線の変わり方を確かめられます（K・L・M は、外側の線が消えて枠線の色が変わります。動きは付けていません）。× に Tab で進むと、線は × の1本だけになります',
    preview: 'probe',
  },
];

const wards = [
  { label: '足立区', value: 'adachi' },
  { label: '荒川区', value: 'arakawa' },
  { label: '板橋区', value: 'itabashi' },
  { label: '江戸川区', value: 'edogawa' },
  { label: '大田区', value: 'ota' },
];

// hover（data-highlighted）はマウスを載せた項目に付くので、CSS で4つ目に固定する（軸 32 と同じ）
// 選んだ項目の見た目は、部品が一覧に書き戻したトークン（--color-select-item-selected など）を読む
const hoverPreview = [
  '[data-preview="select"] [role="option"][data-highlighted] { background-color: transparent; }',
  '[data-preview="select"] [role="option"][data-selected] { background-color: var(--color-select-item-selected); }',
  '[data-preview="select"] [role="option"]:nth-child(4) { background-color: var(--color-select-item-highlight); }',
  // 画面の外にある行では、本体の下の空き（--available-height）が 0 近くになり、一覧が縮んで描かれる。5件をすべて出す
  '[data-preview] [role="listbox"] { max-height: none; }',
  // 濃い面のカードでは、欄のラベルを白にする（部品のラベルは本文の濃紺）
  '[data-dark-surface] label { color: var(--color-on-primary); }',
  // K・L・M のエラーの Select を開いたとき、外側の線（本体から 4px）が選択肢の上端（本体から 4px）に接していた。
  // M に決めたときに、部品が線の外側から 4px あけるようにした（Select.tsx の popupSideOffset）ので、ここでは広げない
].join('\n');

// 開いたままの選択肢がフォーカスを取り、ページが最後の行・最後の列までスクロールするのを戻す
const ResetFocus = () => {
  useEffect(() => {
    const id = setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      window.scrollTo(0, 0);
      for (const el of document.querySelectorAll('.overflow-x-auto')) el.scrollLeft = 0;
    }, 300);
    return () => clearTimeout(id);
  }, []);
  return null;
};

// 浮かぶ選択肢を開いたまま固定する。浮かぶ部分をこのセルの中に描き、行ごとのトークンが効くようにする（軸 32 と同じ）
const OpenPopover = ({ color }: { color: SelectColor }) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer} className="relative h-[290px]">
      {container && (
        <Select
          label="住所"
          color={color}
          items={wards}
          defaultValue="arakawa"
          presentation="popover"
          open
          modal={false}
          container={container}
          collisionAvoidance={{ side: 'none', align: 'none' }}
          popoverMaxHeight="none"
          popoverMoreCue="none"
        />
      )}
    </div>
  );
};

const Note = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-bold text-fg-subtle">{children}</p>
);

// 小さなフォームの画面。部品の色は混ぜて置く（Select とチェックボックスはピンク、トグルとリンクは青、ボタンは両方）
const FormScreen = () => (
  <div className="flex max-w-[340px] flex-col gap-4 rounded-card border border-line p-5">
    <TextField label="表示名" defaultValue="かずえもん" />
    <TextField
      label="メールアドレス"
      defaultValue="kazuemon@"
      error="メールアドレスの形で入力してください"
    />
    <Select label="住所" color="secondary" items={wards} defaultValue="arakawa" />
    <div className="flex flex-col">
      <Switch label="お知らせを受け取る" color="primary" defaultChecked />
      <Checkbox label="利用規約に同意する" color="secondary" defaultChecked />
    </div>
    <p className="text-sm leading-6">
      くわしくは
      <Link color="primary" href="#terms">
        利用規約
      </Link>
      をご覧ください。
    </p>
    <div className="flex flex-wrap gap-3">
      <Button color="secondary">下書きに保存</Button>
      <Button color="primary">送信する</Button>
    </div>
  </div>
);

const close = () => {};

const NoticeScreen = () => (
  <div className="flex max-w-[340px] flex-col gap-3">
    <Note>淡い面（soft）</Note>
    <Notice
      color="info"
      title="メンテナンスのお知らせ"
      onClose={close}
      actions={<Link href="#detail">くわしく見る</Link>}
    >
      9月20日 2:00〜4:00 は、サービスを使えません。
    </Notice>
    <Notice color="danger" onClose={close}>
      保存できませんでした。
    </Notice>
    <Note>塗り（filled）</Note>
    <Notice
      color="info"
      appearance="filled"
      onClose={close}
      actions={<Link href="#detail">くわしく見る</Link>}
    >
      新しいバージョンがあります。
    </Notice>
  </div>
);

// 濃い面の上。濃紺のカード（本文の色）と青のカード（primary）に、入力欄・リンク・ボタンを置く
// 文字は白、中のリンクは文字の色にする（塗りのお知らせと同じ）。欄のラベルは上の CSS で白にする
const darkSurface =
  'flex flex-col gap-4 rounded-card p-5 text-on-primary [&_a]:[--link-color:currentColor]';

const DarkScreen = () => (
  <div className="flex max-w-[340px] flex-col gap-3">
    <Note>濃紺のカード</Note>
    <div data-dark-surface className={`${darkSurface} bg-fg`}>
      <TextField label="表示名" defaultValue="かずえもん" />
      <p className="text-sm leading-6">
        くわしくは
        <Link href="#terms">利用規約</Link>
        をご覧ください。
      </p>
      <div className="flex flex-wrap gap-3">
        <Button color="white">キャンセル</Button>
        <Button color="primary">送信する</Button>
      </div>
    </div>
    <Note>青のカード</Note>
    <div data-dark-surface className={`${darkSurface} bg-primary`}>
      <p className="text-sm leading-6">
        新しいプランを試せます。
        <Link href="#plan">くわしく見る</Link>
      </p>
      <div className="flex flex-wrap gap-3">
        <Button color="white">試してみる</Button>
      </div>
    </div>
  </div>
);

// Select の列: 開いた選択肢と、その下にエラーの Select（フォーカス中を固定。枠線は赤のまま）
const SelectCell = ({ color }: { color: SelectColor }) => (
  <div className="flex flex-col gap-3">
    <OpenPopover color={color} />
    <div data-error-select className="max-w-[300px]">
      <Select
        label="配達先"
        color={color}
        items={wards}
        defaultValue="arakawa"
        error="この地域には届けられません"
      />
    </div>
  </div>
);

// 触って確かめる列: 空だとエラーになる TextField と、選ぶまでエラーの Select（固定しない）
// 浮かぶ選択肢はこのセルの中に描き、行ごとのトークンが効くようにする。下に選択肢のぶんの空きを取る
const ProbeCell = ({ candidate }: { candidate: string }) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [name, setName] = useState('');
  const [ward, setWard] = useState<string | null>(null);
  return (
    <div
      ref={setContainer}
      data-probe
      data-candidate={candidate}
      className="relative flex max-w-[300px] flex-col gap-4 pb-[260px]"
    >
      <TextField
        label="表示名"
        placeholder="かずえもん"
        value={name}
        onChange={(event) => setName(event.currentTarget.value)}
        error={name === '' ? '表示名を入力してください' : undefined}
        suffix={
          <FieldAddonButton aria-label="消す" onClick={() => setName('')}>
            <XIcon />
          </FieldAddonButton>
        }
      />
      {container && (
        <Select
          label="配達先"
          color="secondary"
          items={wards}
          value={ward}
          onValueChange={setWard}
          placeholder="選んでください"
          error={ward == null ? '配達先を選んでください' : undefined}
          modal={false}
          container={container}
          collisionAvoidance={{ side: 'none', align: 'none' }}
          popoverMaxHeight="none"
          popoverMoreCue="none"
        />
      )}
    </div>
  );
};

const Cell = ({ column, candidate }: { column: Column; candidate: string }) => {
  if (column.preview === 'probe') return <ProbeCell candidate={candidate} />;
  if (column.preview === 'form') return <FormScreen />;
  if (column.preview === 'notice') return <NoticeScreen />;
  if (column.preview === 'dark') return <DarkScreen />;
  return <SelectCell color={colorOf(column)} />;
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/41 フォーカスの色と部品の色',
  id: 'design-review-41-focus-color',
  decorators: [keepSwitchCaptionAsCompared, keepToggleColorAsCompared],
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      focusVisible: [
        '[data-preview="form"] button',
        '[data-preview="form"] a',
        '[data-preview="form"] [role="switch"]',
        '[data-preview="form"] [role="checkbox"]',
        '[data-preview="notice"] button',
        '[data-preview="notice"] a',
        '[data-preview="dark"] button',
        '[data-preview="dark"] a',
      ],
      focusWithin: [
        '[data-preview="form"] [data-slot="control"]',
        '[data-preview="dark"] [data-slot="control"]',
        '[data-preview="select"] [data-error-select] [data-slot="control"]',
      ],
    },
  },
  args: { pick: 'M' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <>
      <style>{hoverPreview}</style>
      <ResetFocus />
      <Comparison
        index={41}
        axis="フォーカスの色と部品の色"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={(column, candidate) => <Cell column={column} candidate={candidate.id} />}
      >
        <p>
          <strong className="text-fg">決まったこと</strong>（ADR-0071）。軸 32 で Select
          の選んだ項目は、部品の色の淡い面にチェックと太字です。どの行も、選んだ項目はこの見た目です。
        </p>
        <p>
          ここで選ぶのはフォーカスの色です。入力欄のフォーカスの枠線（原則2）と、ボタン・リンク・トグル・チェックボックスのキーボード操作時の線（ADR-0031）の両方に効きます。現行版は、部品の色によらず青の1色です。
        </p>
        <p>
          A と D は部品の色に従う形、B と C
          はアプリ全体で1色のまま色を替える形です。1色の形は、アプリごとに色を選べるようにもできます。どの色も、白地との比は線の基準（3:1）を満たします。
        </p>
        <p>
          E・F・G は、「今のボタンのように、二重になる構造はどうでしょうか？」の3つの読み方です。E
          は入力欄もボタンと同じく「部品＋隙間＋線」にする形、F
          は内側を部品の色・外側を青の2本にする形、G は部品と線のあいだを白で埋めた2色の線（WCAG
          の達成方法 C40・GOV.UK のような形）です。H は G の外側を濃紺にしたものです。E〜J
          は、入力欄もクリックでフォーカスの線が出ます。
        </p>
        <p>
          G〜J
          の白は、白い地では見えず、濃い面や色の上で効きます。最後の列（濃い面の上）で比べてください。G〜J
          は、塗りのお知らせの中の例外（文字の色の線）も外しています。
        </p>
        <p>
          I・J は、ユーザーの提案「G の Select
          だけ、他のボタンなどと同じように内側は部品色、外側は白+グレーor青」です。塗りのボタンが「部品の色の本体・白・線」に見えるのにそろえ、Select
          だけ、フォーカスで欄の枠線を部品の色（色なしは濃いグレー）にし、その外を白で埋め、いちばん外に線を引きます。外側の線は
          I がグレー、J が青です。ボタン・リンク・トグル・チェックボックスと TextField は G
          のままです。
        </p>
        <p>
          K は、ユーザーの提案「TextField
          で単なるフォーカスリングの位置にエラーリングがある場合は、J のように赤白青」「Select は
          primary カラーをベースとし、neutral
          を選んだ場合でもフォーカスリングは常に青、選択肢部分のみに色を適用し、エラーリングがある場合は赤白青」です。フォーカスの目印はいつも青で、ふだんの欄は現行版と同じ青い枠線です。欄の枠線がエラーの赤でふさがっているときだけ、青をボタンと同じく外側に離して引き、あいだを白で埋めます。ボタンなどは現行版のままです。
        </p>
        <p>
          L・M
          は、ユーザーの提案「エラーが無い時はパーツの色1重、エラーがあるときは赤・白・青（フォーカスリング色）」です。D
          と K を合わせ、ふだんの欄は枠線1本を部品の色（色なしの Select と TextField
          は濃紺）にし、エラーの欄は赤い枠線の外に白と離した線を引きます。L
          は離した線をどこでも青にします（ボタンなどの線も現行版と同じ青）。M は D
          のとおり、離した線も部品の色（色なしは濃紺）に従わせます。
        </p>
        <p>
          列は、色なし・青・ピンクの Select を開いたところ（本体の枠線がフォーカスの色）とエラーの
          Select（その下。枠線は赤のまま）、部品を並べたフォームの画面、お知らせの中、濃い面の上です。フォームとお知らせは、比べやすいようフォーカスをすべて同時に固定しています（実際には1つずつです）。
        </p>
        <p>
          どれを既定にするか、ほかも選べるようにするかを一言添えてください（「X を既定にして、Y
          も選べる」でも構いません）。
        </p>
      </Comparison>
    </>
  ),
};
