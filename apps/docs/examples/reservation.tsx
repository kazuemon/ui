'use client';

import {
  Button,
  Calendar,
  type CalendarNavPlacement,
  type CalendarShape,
  Dialog,
  DescriptionItem,
  DescriptionList,
  Heading,
  Link,
  Notice,
  NumberField,
  type PlainDate,
  Temporal,
  Text,
  TextField,
  ToastProvider,
  useToast,
} from '@kazuemon/ui';
import { useState } from 'react';

import { SamplePage } from './sample-page';
import { salon } from './sites';
import type { Example } from './types';

// 予約: 美容室の予約。日を選ぶ → 時刻を選ぶ → 人数と名前 → 確認のダイアログ → 予約できたらトースト
// 定休日（月曜）と満席の日は選べない。時刻の枠は、埋まっているものを押せなくする
// 時刻の枠は、Toggle ができるまではボタンに aria-pressed を付けて作る

type Scenario = 'empty' | 'chosen' | 'done';
type CalendarColor = 'primary' | 'secondary' | 'neutral';

const today = Temporal.PlainDate.from('2026-09-21');
const holidays: Record<string, string> = { '2026-09-22': '国民の休日', '2026-09-23': '秋分の日' };
const fullDays = new Set(['2026-09-26', '2026-10-03']);
const slots = ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
/** 日ごとに、埋まっている時刻（見本なので日付から決める） */
const takenOn = (date: PlainDate) => slots.filter((_, i) => (date.day + i) % 3 === 0);

const formatDate = (date: PlainDate) =>
  date.toLocaleString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });

interface CalendarArgs {
  shape: CalendarShape;
  color: CalendarColor;
  weekendColor: boolean;
  navPlacement: CalendarNavPlacement;
  showOutsideDays: boolean;
}

function ReservationScreen({ scenario, calendar }: { scenario: Scenario; calendar: CalendarArgs }) {
  const chosenDate = today.add({ days: 4 });
  const [date, setDate] = useState<PlainDate | null>(scenario === 'empty' ? null : chosenDate);
  const [time, setTime] = useState<string | null>(scenario === 'empty' ? null : '14:00');
  const [people, setPeople] = useState<number | null>(1);
  const [name, setName] = useState(scenario === 'empty' ? '' : 'かずえもん');
  const [nameError, setNameError] = useState<string>();
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(scenario === 'done');
  const toast = useToast();

  const taken = date ? takenOn(date) : [];
  const ready = date !== null && time !== null;

  const openConfirm = () => {
    if (!name) {
      setNameError('予約する人の名前を入力してください');
      return;
    }
    setNameError(undefined);
    setConfirming(true);
  };

  const reserve = () => {
    setConfirming(false);
    setDone(true);
    toast.show({ status: 'success', title: '予約しました', timeout: 4000 });
  };

  if (done && date && time) {
    return (
      <div className="flex flex-col gap-6">
        <Heading level={1} size={2}>
          予約しました
        </Heading>
        <Notice status="success" title={`${formatDate(date)} ${time} にお待ちしています`}>
          変更や取り消しは、前の日の 18 時までにお願いします。
        </Notice>
        <DescriptionList divider="line">
          <DescriptionItem term="日時">
            {formatDate(date)} {time}
          </DescriptionItem>
          <DescriptionItem term="人数">{people ?? 1} 人</DescriptionItem>
          <DescriptionItem term="名前">{name}</DescriptionItem>
        </DescriptionList>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">予約を変える</Button>
          <Button variant="outline" color="danger">
            予約を取り消す
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Heading level={1} size={2}>
          予約する
        </Heading>
        <Text variant="muted" className="mt-1">
          カット（60 分）。月曜は定休日です。
        </Text>
      </div>

      <section className="flex flex-col gap-3">
        <Heading level={2} size={4}>
          1. 日を選ぶ
        </Heading>
        <Calendar
          value={date}
          onValueChange={(next) => {
            setDate(next);
            setTime(null);
          }}
          min={today}
          max={today.add({ months: 2 })}
          isDateDisabled={(d) => d.dayOfWeek === 1 || fullDays.has(d.toString())}
          getHoliday={(d) => holidays[d.toString()]}
          shape={calendar.shape}
          color={calendar.color}
          weekendColor={calendar.weekendColor}
          navPlacement={calendar.navPlacement}
          hideOutsideDays={!calendar.showOutsideDays}
        />
        <Text size="sm" variant="subtle">
          押せない日は、定休日か満席の日です。
        </Text>
      </section>

      <section className="flex flex-col gap-3">
        <Heading level={2} size={4}>
          2. 時刻を選ぶ
        </Heading>
        {date ? (
          <>
            <Text size="sm" variant="muted">
              {formatDate(date)}の空き
            </Text>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="group" aria-label="時刻">
              {slots.map((slot) => {
                const full = taken.includes(slot);
                const selected = time === slot;
                return (
                  <Button
                    key={slot}
                    variant={selected ? 'filled' : 'outline'}
                    color={selected ? 'primary' : 'neutral'}
                    aria-pressed={selected}
                    disabled={full}
                    onClick={() => setTime(slot)}
                  >
                    {full ? `${slot} 満席` : slot}
                  </Button>
                );
              })}
            </div>
          </>
        ) : (
          <Text variant="muted">先に日を選んでください。</Text>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <Heading level={2} size={4}>
          3. 予約する人
        </Heading>
        <NumberField
          label="人数"
          suffix="人"
          min={1}
          max={3}
          value={people}
          onValueChange={setPeople}
          caption="3 人まで"
        />
        <TextField
          label="名前"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          errorText={nameError}
        />
      </section>

      <div className="flex flex-col gap-2">
        <div>
          <Button color="primary" disabled={!ready} onClick={openConfirm}>
            内容を確かめる
          </Button>
        </div>
        {!ready && (
          <Text size="sm" variant="subtle">
            日と時刻を選ぶと押せます。
          </Text>
        )}
        <Text size="sm">
          <Link href="#policy">取り消しの決まり</Link>
        </Text>
      </div>

      <Dialog
        open={confirming}
        onOpenChange={setConfirming}
        title="この内容で予約しますか？"
        actions={
          <>
            <Button variant="outline" onClick={() => setConfirming(false)}>
              戻る
            </Button>
            <Button color="primary" onClick={reserve}>
              予約する
            </Button>
          </>
        }
      >
        {date && time && (
          <DescriptionList divider="line">
            <DescriptionItem term="日時">
              {formatDate(date)} {time}
            </DescriptionItem>
            <DescriptionItem term="メニュー">カット（60 分）</DescriptionItem>
            <DescriptionItem term="人数">{people ?? 1} 人</DescriptionItem>
            <DescriptionItem term="名前">{name}</DescriptionItem>
          </DescriptionList>
        )}
      </Dialog>
    </div>
  );
}

export const example: Example = {
  slug: 'reservation',
  title: '予約',
  description: '美容室の予約。カレンダーで日を、ボタンで時刻を選び、確認のダイアログを挟みます。',
  initialLabel: '選ぶ前',
  presets: [
    { label: '日時を選んだ', args: { scenario: 'chosen' } },
    { label: '予約した', args: { scenario: 'done' } },
  ],
  controls: [
    {
      name: 'shape',
      label: '日の形',
      type: 'radio',
      options: [
        { value: 'square', label: '角丸', caption: 'ほかの部品と同じ角にします' },
        { value: 'circle', label: '丸' },
      ],
    },
    {
      name: 'color',
      label: '選んだ日の色',
      type: 'radio',
      options: [
        { value: 'primary', label: 'ブルー' },
        { value: 'secondary', label: 'ピンク' },
        { value: 'neutral', label: 'グレー' },
      ],
    },
    { name: 'weekendColor', label: '土日と祝日に色を付ける', type: 'switch' },
    {
      name: 'navPlacement',
      label: '月を替えるボタンの位置',
      type: 'radio',
      options: [
        { value: 'sides', label: '月の両側' },
        { value: 'end', label: '右にまとめる' },
      ],
    },
    { name: 'showOutsideDays', label: '前と次の月の日も出す', type: 'switch' },
  ],
  defaults: {
    scenario: 'empty',
    shape: 'square',
    color: 'primary',
    weekendColor: true,
    navPlacement: 'sides',
    showOutsideDays: false,
  },
  Screen: ({ args, density }) => (
    <SamplePage density={density} site={salon} current="予約" width="sm">
      <ToastProvider>
        <ReservationScreen
          scenario={args.scenario as Scenario}
          calendar={{
            shape: args.shape as CalendarShape,
            color: args.color as CalendarColor,
            weekendColor: args.weekendColor as boolean,
            navPlacement: args.navPlacement as CalendarNavPlacement,
            showOutsideDays: args.showOutsideDays as boolean,
          }}
        />
      </ToastProvider>
    </SamplePage>
  ),
};
