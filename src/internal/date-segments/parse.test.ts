import { describe, expect, test } from 'vitest';

import { parseDateText, parseTimeText } from './parse';
import { dateLayout, segmentRange, stepSegment, timeLayout, typeDigit } from './segments';

describe('parseDateText', () => {
  test.each([
    ['2026/09/20', { year: 2026, month: 9, day: 20 }],
    ['2026-9-20', { year: 2026, month: 9, day: 20 }],
    ['20260920', { year: 2026, month: 9, day: 20 }],
    ['２０２６／０９／２０', { year: 2026, month: 9, day: 20 }],
    ['2026年9月20日', { year: 2026, month: 9, day: 20 }],
    ['令和8年9月20日', { year: 2026, month: 9, day: 20 }],
    ['令和元年5月1日', { year: 2019, month: 5, day: 1 }],
    ['R8.9.20', { year: 2026, month: 9, day: 20 }],
    ['平成31年4月30日', { year: 2019, month: 4, day: 30 }],
    [' 2026.09.20 ', { year: 2026, month: 9, day: 20 }],
    ['2026-09-20T10:00:00Z', { year: 2026, month: 9, day: 20 }],
    ['20.09.2026', { year: 2026, month: 9, day: 20 }],
  ])('%s', (text, expected) => {
    expect(parseDateText(text)).toEqual(expected);
  });

  test('年が後ろのときは、ロケールの並びで月と日を決める', () => {
    expect(parseDateText('9/20/2026', true)).toEqual({ year: 2026, month: 9, day: 20 });
  });

  test.each(['2026/02/30', 'きのう', '2026/9', '123'])('読めない: %s', (text) => {
    expect(parseDateText(text)).toBeNull();
  });
});

describe('parseTimeText', () => {
  test.each([
    ['9:05', { hour: 9, minute: 5 }],
    ['09:05:30', { hour: 9, minute: 5, second: 30 }],
    ['0905', { hour: 9, minute: 5 }],
    ['905', { hour: 9, minute: 5 }],
    ['午後3時', { hour: 15, minute: 0 }],
    ['午後3時半', { hour: 15, minute: 30 }],
    ['午前0時', { hour: 0, minute: 0 }],
    ['15時5分', { hour: 15, minute: 5 }],
    ['3:05 PM', { hour: 15, minute: 5 }],
    ['12:00 am', { hour: 0, minute: 0 }],
    ['１５：０５', { hour: 15, minute: 5 }],
    ['2026-09-20T15:05:00Z', { hour: 15, minute: 5, second: 0 }],
  ])('%s', (text, expected) => {
    expect(parseTimeText(text)).toEqual(expected);
  });

  test.each(['25:00', '9:60', 'ひる', '午後13時'])('読めない: %s', (text) => {
    expect(parseTimeText(text)).toBeNull();
  });
});

describe('区切りの計算', () => {
  test('ja の日付は 年 / 月 / 日 の順', () => {
    expect(dateLayout('ja-JP').parts).toEqual([
      { kind: 'segment', type: 'year' },
      { kind: 'literal', text: '/' },
      { kind: 'segment', type: 'month' },
      { kind: 'literal', text: '/' },
      { kind: 'segment', type: 'day' },
    ]);
  });

  test('ja の時刻は 24 時間制、12 時間制では 午前午後 が前', () => {
    expect(timeLayout('ja-JP').hourCycle).toBe('h23');
    const twelve = timeLayout('ja-JP', { hourCycle: 12 });
    expect(twelve.parts[0]).toEqual({ kind: 'segment', type: 'dayPeriod' });
    expect(twelve.dayPeriods).toEqual(['午前', '午後']);
  });

  test('月は「1」では待ち、「2」から先は次へ進む', () => {
    const range = { min: 1, max: 12 };
    expect(typeDigit('month', '', '1', range)).toEqual({ buffer: '1', value: 1, advance: false });
    expect(typeDigit('month', '1', '2', range)).toEqual({ buffer: '', value: 12, advance: true });
    expect(typeDigit('month', '1', '3', range)).toEqual({ buffer: '', value: 3, advance: true });
    expect(typeDigit('month', '', '0', range)).toEqual({
      buffer: '0',
      value: undefined,
      advance: false,
    });
  });

  test('日の範囲はその月の日数', () => {
    expect(segmentRange('day', { year: 2026, month: 2 }, dateLayout('ja-JP')).max).toBe(28);
  });

  test('↑↓ は範囲を回り、分は刻みに寄せる', () => {
    expect(stepSegment(12, 1, { min: 1, max: 12 })).toBe(1);
    expect(stepSegment(0, -1, { min: 0, max: 59 }, 15)).toBe(45);
    expect(stepSegment(7, 1, { min: 0, max: 59 }, 5)).toBe(10);
    expect(stepSegment(55, 1, { min: 0, max: 59 }, 5)).toBe(0);
  });
});
