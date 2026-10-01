import { describe, expect, expectTypeOf, test } from 'vitest';

import type * as AutocompleteModule from '../../components/autocomplete/Autocomplete';
import type * as ComboboxModule from '../../components/combobox/Combobox';
import type * as SelectModule from '../../components/select/Select';
import { flattenItems, isGroupedItems, labelMap, normalizeItems } from './listbox-items';
import type { ListboxItem } from './use-listbox-option';

// 選ぶ部品の値の型（文字か数）を確かめる
// 型の確かめは `pnpm typecheck` で走る（expectTypeOf と @ts-expect-error）。部品は描かないので、関数の呼び出しで props の推論だけを見る
// 部品の中身（Base UI）を Node で読まないよう、部品は型だけ読む

declare const Select: typeof SelectModule.Select;
declare const Combobox: typeof ComboboxModule.Combobox;
declare const Autocomplete: typeof AutocompleteModule.Autocomplete;

// 関数の呼び出しは、型を確かめるためだけに書く（実行しない）
function typeOnly(_check: () => void) {}

describe('値の型（型の確かめ）', () => {
  test('文字の items では、値は string（今までの書き方のまま）', () => {
    typeOnly(() => {
      const wards: ListboxItem[] = [{ label: '千代田区', value: 'chiyoda' }];
      Select({
        label: '区',
        items: wards,
        onValueChange: (value) => expectTypeOf(value).toEqualTypeOf<string | null>(),
      });
      // 書いた items がリテラルでも、値は string に広がる（string の変数を value に渡せる）
      const selected: string | null = null;
      Select({
        label: '区',
        items: [{ label: '千代田区', value: 'chiyoda' }],
        value: selected,
        onValueChange: (value) => expectTypeOf(value).toEqualTypeOf<string | null>(),
      });
      Select({
        label: '時間',
        items: ['午前中', '14〜16時'],
        defaultValue: '14〜16時',
        onValueChange: (value) => expectTypeOf(value).toEqualTypeOf<string | null>(),
      });
      Combobox({
        label: '区',
        items: wards,
        multiple: true,
        defaultValue: ['chiyoda'],
        onValueChange: (value) => expectTypeOf(value).toEqualTypeOf<string[]>(),
      });
    });
  });

  test('空の items では、値は文字か数（string | number）', () => {
    typeOnly(() => {
      // あとで選択肢を読み込む使い方。never にならず、文字の変数も value に渡せる
      const selected: string | null = null;
      Select({
        label: '区',
        items: [],
        value: selected,
        onValueChange: (value) => expectTypeOf(value).toEqualTypeOf<string | number | null>(),
      });
      Combobox({
        label: '区',
        items: [],
        multiple: true,
        onValueChange: (value) => expectTypeOf(value).toEqualTypeOf<(string | number)[]>(),
      });
      Autocomplete({
        label: '区',
        items: [],
        onSelect: (item) => expectTypeOf(item.value).toEqualTypeOf<string | number>(),
      });
    });
  });

  test('数の items では、onValueChange に number が届く', () => {
    typeOnly(() => {
      Select({
        label: '人数',
        items: [1, 2, { label: '3 人以上', value: 3 }],
        defaultValue: 2,
        onValueChange: (value) => expectTypeOf(value).toEqualTypeOf<number | null>(),
      });
      Select({
        label: '人数',
        items: [1, 2, 3],
        multiple: true,
        value: [1, 3],
        onValueChange: (value) => expectTypeOf(value).toEqualTypeOf<number[]>(),
      });
      Combobox({
        label: '年',
        items: [2024, 2025, 2026],
        value: 2025,
        onValueChange: (value) => expectTypeOf(value).toEqualTypeOf<number | null>(),
      });
      // @ts-expect-error 数の items に、文字の値は渡せない
      Select({ label: '人数', items: [1, 2], value: '1' });
    });
  });

  test('文字と数、値だけと { label, value } を混ぜられる', () => {
    typeOnly(() => {
      Select({
        label: '混ぜる',
        items: ['a', 1, { label: 'B', value: 'b' }],
        onValueChange: (value) => expectTypeOf(value).toEqualTypeOf<string | number | null>(),
      });
    });
  });

  test('まとまりの中でも同じ', () => {
    typeOnly(() => {
      Select({
        label: '席',
        items: [
          { label: '1 階', items: [101, { label: '102（窓側）', value: 102 }] },
          { label: '2 階', items: [201] },
        ],
        onValueChange: (value) => expectTypeOf(value).toEqualTypeOf<number | null>(),
      });
      Combobox({
        label: '都道府県',
        items: [{ label: '関東', items: ['東京都', { label: '神奈川県', value: 'kanagawa' }] }],
        onValueChange: (value) => expectTypeOf(value).toEqualTypeOf<string | null>(),
      });
    });
  });

  test('multiple に boolean を渡した包みでも、値の型は items から決まる', () => {
    typeOnly(() => {
      const forwarded = {} as Omit<SelectModule.SelectBaseProps<string, boolean>, 'items'>;
      Select({
        ...forwarded,
        label: '区',
        items: [{ label: '千代田区', value: 'chiyoda' }],
        onValueChange: (value) => expectTypeOf(value).toEqualTypeOf<string | string[] | null>(),
      });
    });
  });

  test('型引数で値の型を絞れる', () => {
    typeOnly(() => {
      Select<'small' | 'large'>({
        label: '大きさ',
        items: ['small', 'large'],
        onValueChange: (value) => expectTypeOf(value).toEqualTypeOf<'small' | 'large' | null>(),
      });
      // @ts-expect-error 型引数にない値は渡せない
      Select<'small' | 'large'>({ label: '大きさ', items: ['small', 'medium'] });
    });
  });

  test('文字と数でない値は渡せない', () => {
    typeOnly(() => {
      // @ts-expect-error 真偽値は値にできない
      Select({ label: 'x', items: [true, false] });
      // @ts-expect-error オブジェクトは値にできない
      Combobox({ label: 'x', items: [{ label: 'x', value: { id: 1 } }] });
      // @ts-expect-error 並べる形とまとまりは混ぜられない
      Select({ label: 'x', items: [{ label: 'G', items: ['a'] }, 'b'] });
    });
  });

  test('Autocomplete の onSelect は、値だけの候補も { label, value } で受け取る', () => {
    typeOnly(() => {
      Autocomplete({
        label: '市区町村',
        items: ['札幌市', '仙台市'],
        onSelect: (item) => expectTypeOf(item).toEqualTypeOf<ListboxItem<string>>(),
        onValueChange: (text) => expectTypeOf(text).toEqualTypeOf<string>(),
      });
      Autocomplete({
        label: '郵便番号',
        items: [{ label: '100-0001', value: 1000001 }],
        onSelect: (item) => expectTypeOf(item.value).toEqualTypeOf<number>(),
      });
    });
  });
  expect(true).toBe(true);
});

describe('選択肢を { label, value } にそろえる', () => {
  test('値だけの選択肢は、値の文字をラベルにする。{ label, value } はそのまま', () => {
    const third = { label: '3 人以上', value: 3 };
    const items = normalizeItems<string | number>([1, 'a', third]);
    expect(items).toEqual([{ label: '1', value: 1 }, { label: 'a', value: 'a' }, third]);
    expect(items[2]).toBe(third);
  });

  test('まとまりの形を保ち、中の選択肢もそろえる', () => {
    const items = normalizeItems<number>([
      { label: '1 階', items: [101, { label: '窓側', value: 102 }] },
    ]);
    expect(isGroupedItems(items)).toBe(true);
    expect(flattenItems(items)).toEqual([
      { label: '101', value: 101 },
      { label: '窓側', value: 102 },
    ]);
  });

  test('先頭が値だけの選択肢でも、まとまりと見誤らない', () => {
    expect(isGroupedItems(normalizeItems(['a', 'b']))).toBe(false);
    expect(isGroupedItems(normalizeItems([0]))).toBe(false);
    expect(isGroupedItems(normalizeItems([]))).toBe(false);
  });

  test('値からラベルを引く表は、数の値でも引ける', () => {
    const map = labelMap(flattenItems(normalizeItems<number>([0, { label: '一', value: 1 }])));
    expect(map.get(0)).toBe('0');
    expect(map.get(1)).toBe('一');
  });
});
