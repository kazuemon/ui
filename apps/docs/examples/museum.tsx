'use client';

import {
  AspectRatio,
  Bleed,
  Button,
  Carousel,
  type CarouselControlsPosition,
  DateField,
  DescriptionItem,
  DescriptionList,
  Embed,
  Gallery,
  Grid,
  Heading,
  ImageZoom,
  type ImageZoomVariant,
  Image,
  Link,
  Masonry,
  Notice,
  NumberField,
  NumberFormat,
  type PlainDate,
  type PlainTime,
  Stepper,
  type StepperColor,
  StepperStep,
  Tag,
  Temporal,
  Text,
  Thumbnails,
  type ThumbnailsIndicator,
  TimeField,
  Video,
} from '@kazuemon/ui';
import { type ReactNode, useEffect, useState } from 'react';

import {
  heroImage,
  highlights,
  mapDocument,
  objects,
  paintings,
  videoPoster,
} from './museum-images';
import { SamplePage } from './sample-page';
import { museum } from './sites';
import type { Density, Example } from './types';

// 美術館: 架空の美術館のサイト。いまの展覧会の見出し → 展示のハイライト → 所蔵品 → 紹介の動画 → チケット → アクセス
// 見出しの画像は本文の幅の外まで広げる（Bleed）。所蔵品は、絵画を Gallery でそろえて並べ、工芸と彫刻を Masonry で比のまま積む
// チケットは Stepper で日時 → 枚数 → 確認の 3 段。月曜は休館日
// 紹介の動画は外に取りに行かないよう、開いたときに canvas で描いた展示室を数秒だけ録って作る（録れるまでは再生前の画像だけ）

type Scenario = 'start' | 'count' | 'confirm' | 'done';

const today = Temporal.PlainDate.from('2026-09-28');
const period = {
  start: Temporal.PlainDate.from('2026-09-12'),
  end: Temporal.PlainDate.from('2026-12-06'),
};
const firstEntry = Temporal.PlainTime.from('10:00');
const lastEntry = Temporal.PlainTime.from('17:30');

const tickets = [
  { key: 'adult', label: '一般', price: 1_800 },
  { key: 'student', label: '大学生', price: 1_200 },
  { key: 'child', label: '高校生以下', price: 0 },
] as const;
type TicketKey = (typeof tickets)[number]['key'];
type Counts = Record<TicketKey, number | null>;

const formatDate = (date: PlainDate) =>
  date.toLocaleString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });
const formatTime = (time: PlainTime) => time.toString({ smallestUnit: 'minute' });

// ── 紹介の動画 ──

/** 展示室を横に見渡す 1 コマ。t は秒 */
function drawHall(ctx: CanvasRenderingContext2D, t: number) {
  const { width: w, height: h } = ctx.canvas;
  ctx.fillStyle = '#ece6dc';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#b9a58c';
  ctx.fillRect(0, h * 0.73, w, h * 0.27);
  const colors = ['#d98c6a', '#6c8fb3', '#e3c26a', '#7fa38c', '#f0c9c0'];
  const offset = t * 70;
  for (let i = 0; i < 8; i++) {
    const x = i * 230 - offset + 40;
    const fh = i % 2 ? 110 : 150;
    const y = h * 0.42 - fh / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(x + 4, y + 5, 120, fh);
    ctx.fillStyle = '#f8f5ef';
    ctx.fillRect(x, y, 120, fh);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(x + 8, y + 8, 104, fh - 16);
  }
}

/** canvas に描いた展示室を録って、動画の URL を返す。録れない環境では undefined のまま */
function useHallVideo(seconds = 5) {
  const [src, setSrc] = useState<string>();
  useEffect(() => {
    if (typeof MediaRecorder === 'undefined') return undefined;
    const type = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'].find((t) =>
      MediaRecorder.isTypeSupported(t)
    );
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!type || !ctx || !canvas.captureStream) return undefined;

    const recorder = new MediaRecorder(canvas.captureStream(30), { mimeType: type });
    const chunks: Blob[] = [];
    let url: string | undefined;
    let cancelled = false;
    let frame = 0;
    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.onstop = () => {
      if (cancelled) return;
      url = URL.createObjectURL(new Blob(chunks, { type }));
      setSrc(url);
    };
    const start = performance.now();
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      drawHall(ctx, t);
      if (t < seconds) frame = requestAnimationFrame(draw);
      else recorder.stop();
    };
    drawHall(ctx, 0);
    recorder.start();
    frame = requestAnimationFrame(draw);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      if (recorder.state !== 'inactive') recorder.stop();
      if (url) URL.revokeObjectURL(url);
    };
  }, [seconds]);
  return src;
}

// ── 部分 ──

function Section({
  id,
  title,
  lead,
  children,
}: {
  id?: string;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="flex scroll-mt-20 flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Heading level={2} size="lg">
          {title}
        </Heading>
        {lead && <Text variant="muted">{lead}</Text>}
      </div>
      {children}
    </section>
  );
}

function Hero() {
  return (
    <div className="flex flex-col gap-6">
      {/* Bleed は Container の余白まで広げる前提で、幅の 1/18（最大 48px）だけ外へ出す。見本のページの本文は
          Container ではなく左右 20px（px-5）の余白なので、そのままだと広い画面で横にはみ出す。余白の幅にそろえる */}
      <Bleed className="-mx-5">
        <AspectRatio ratio="21 / 9">
          <img
            src={heroImage}
            alt="やわらかい黄色と桃色の空に、白い光の弧が描かれた展覧会の見出しの絵"
          />
        </AspectRatio>
      </Bleed>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Tag color="success">開催中</Tag>
          <Text size="sm" variant="muted">
            2026 年 9 月 12 日（土）〜 12 月 6 日（日）・本館 2 階
          </Text>
        </div>
        <Heading level={1} size="2xl">
          光の庭　色と形の百年
        </Heading>
        <Text className="max-w-[40em]">
          朝の光から夜の灯りまで、当館の所蔵品から、光を描いた絵画と工芸およそ 120
          点を、一日の時間の流れに沿って並べます。
        </Text>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link variant="button" color="primary" href="#tickets">
            チケットを買う
          </Link>
          <Link variant="outline" href="#access">
            アクセス
          </Link>
        </div>
      </div>
    </div>
  );
}

function Highlights({
  controlsPosition,
  thumbnailsIndicator,
}: {
  controlsPosition: CarouselControlsPosition;
  thumbnailsIndicator: ThumbnailsIndicator;
}) {
  const [index, setIndex] = useState(0);
  return (
    <Section id="exhibitions" title="展示のハイライト" lead="5 つの部屋を、朝から夜へめぐります。">
      <div className="flex flex-col gap-2">
        <Carousel
          accessibleName="展示室の写真"
          value={index}
          onValueChange={setIndex}
          controlsPosition={controlsPosition}
          prevName="前の部屋"
          nextName="次の部屋"
          thumbnails={
            <Thumbnails accessibleName="部屋を選ぶ" indicator={thumbnailsIndicator}>
              {highlights.map((room) => (
                <img key={room.title} src={room.src} alt={room.title} />
              ))}
            </Thumbnails>
          }
        >
          {highlights.map((room) => (
            <Image key={room.title} ratio={16 / 9} src={room.src} alt={room.alt} />
          ))}
        </Carousel>
        <Text size="sm" variant="muted" aria-live="polite">
          {highlights[index].title}
        </Text>
      </div>
    </Section>
  );
}

function Collection({ zoomVariant }: { zoomVariant: ImageZoomVariant }) {
  const caption = (work: (typeof paintings)[number]) =>
    `${work.title}　${work.artist}、${work.year}`;
  return (
    <Section
      id="collection"
      title="コレクション"
      lead="当館の所蔵品から、いま展示しているものの一部です。押すと大きく見られます。"
    >
      <div className="flex flex-col gap-3">
        <Heading level={3} size="md">
          絵画
        </Heading>
        <Gallery
          items={paintings.map((work) => ({
            src: work.src,
            alt: work.alt,
            width: work.width,
            height: work.height,
            caption: caption(work),
          }))}
          variant={zoomVariant}
        />
      </div>
      <div className="flex flex-col gap-3">
        <Heading level={3} size="md">
          工芸と彫刻
        </Heading>
        <Masonry minColumnWidth={220}>
          {objects.map((work) => (
            <ImageZoom
              key={work.title}
              src={work.src}
              alt={work.alt}
              width={work.width}
              height={work.height}
              caption={caption(work)}
              variant={zoomVariant}
            />
          ))}
        </Masonry>
      </div>
    </Section>
  );
}

function Intro() {
  const src = useHallVideo();
  return (
    <Section title="展覧会の紹介" lead="学芸員が、見どころを映像で案内します。">
      <Video
        src={src}
        poster={videoPoster}
        fit="cover"
        ratio={16 / 9}
        caption="第 1 室「朝の色」の展示風景"
      />
    </Section>
  );
}

// ── チケット ──

function TicketFlow({ scenario, color }: { scenario: Scenario; color: StepperColor }) {
  const chosen = scenario !== 'start';
  const [step, setStep] = useState({ start: 0, count: 1, confirm: 2, done: 2 }[scenario]);
  const [date, setDate] = useState<PlainDate | null>(
    chosen ? Temporal.PlainDate.from('2026-10-03') : null
  );
  const [time, setTime] = useState<PlainTime | null>(
    chosen ? Temporal.PlainTime.from('13:30') : null
  );
  const [counts, setCounts] = useState<Counts>({
    adult: scenario === 'confirm' || scenario === 'done' ? 2 : 1,
    student: 0,
    child: scenario === 'confirm' || scenario === 'done' ? 1 : 0,
  });
  const [showErrors, setShowErrors] = useState(false);
  const [done, setDone] = useState(scenario === 'done');

  const min = Temporal.PlainDate.compare(today, period.start) > 0 ? today : period.start;
  const closed = date?.dayOfWeek === 1;
  const dateError = !date
    ? '来館する日を入力してください'
    : closed
      ? '月曜は休館日です。ほかの日を選んでください'
      : Temporal.PlainDate.compare(date, min) < 0 ||
          Temporal.PlainDate.compare(date, period.end) > 0
        ? `会期（${formatDate(min)}〜${formatDate(period.end)}）の中の日を選んでください`
        : undefined;
  const timeError = !time
    ? '入館する時刻を入力してください'
    : Temporal.PlainTime.compare(time, firstEntry) < 0 ||
        Temporal.PlainTime.compare(time, lastEntry) > 0
      ? '10:00 から 17:30 のあいだで選んでください'
      : undefined;
  const total = tickets.reduce((sum, t) => sum + (counts[t.key] ?? 0), 0);
  const price = tickets.reduce((sum, t) => sum + (counts[t.key] ?? 0) * t.price, 0);
  const countError = total === 0 ? '1 枚以上を選んでください' : undefined;

  const next = () => {
    const invalid = step === 0 ? dateError || timeError : countError;
    if (invalid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep(step + 1);
  };

  if (done && date && time) {
    return (
      <div className="flex flex-col gap-5">
        <Notice status="success" title="チケットを買いました">
          {formatDate(date)} {formatTime(time)}
          に入館できます。入口で、メールで届いたチケットの画面を見せてください。
        </Notice>
        <DescriptionList divider="line">
          <DescriptionItem term="日時">
            {formatDate(date)} {formatTime(time)}
          </DescriptionItem>
          <DescriptionItem term="枚数">{total} 枚</DescriptionItem>
          <DescriptionItem term="お支払い">
            <NumberFormat value={price} currency="JPY" />
          </DescriptionItem>
        </DescriptionList>
        <div>
          <Button
            variant="outline"
            onClick={() => {
              setDone(false);
              setStep(0);
            }}
          >
            ほかの日のチケットも買う
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Stepper value={step} onStepClick={setStep} color={color} accessibleName="チケットを買う手順">
        <StepperStep label="日時" description="来館する日と時刻" />
        <StepperStep label="枚数" description="区分ごとの枚数" />
        <StepperStep label="確認" description="内容とお支払い" />
      </Stepper>

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <DateField
            label="来館する日"
            caption="月曜は休館日です（祝日のときは開館し、次の日が休館）"
            value={date}
            onValueChange={setDate}
            min={min}
            max={period.end}
            errorText={showErrors || closed ? dateError : undefined}
          />
          <TimeField
            label="入館する時刻"
            caption="30 分ごと。最終入館は 17:30 です"
            value={time}
            onValueChange={setTime}
            min={firstEntry}
            max={lastEntry}
            minuteStep={30}
            errorText={showErrors ? timeError : undefined}
          />
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          {tickets.map((ticket) => (
            <NumberField
              key={ticket.key}
              label={ticket.label}
              caption={
                ticket.price === 0 ? (
                  '無料。入口で学生証などを見せてください'
                ) : (
                  <>
                    1 枚 <NumberFormat value={ticket.price} currency="JPY" />
                  </>
                )
              }
              suffix="枚"
              min={0}
              max={10}
              value={counts[ticket.key]}
              onValueChange={(value) => setCounts((c) => ({ ...c, [ticket.key]: value }))}
            />
          ))}
          {showErrors && countError && (
            <Notice status="danger" title={countError}>
              高校生以下だけで来館するときも、1 枚を選んでください。
            </Notice>
          )}
        </div>
      )}

      {step === 2 && date && time && (
        <DescriptionList divider="line">
          <DescriptionItem term="展覧会">光の庭　色と形の百年</DescriptionItem>
          <DescriptionItem term="日時">
            {formatDate(date)} {formatTime(time)}
          </DescriptionItem>
          {tickets
            .filter((t) => (counts[t.key] ?? 0) > 0)
            .map((t) => (
              <DescriptionItem key={t.key} term={t.label}>
                {counts[t.key]} 枚
              </DescriptionItem>
            ))}
          <DescriptionItem term="合計">
            <NumberFormat value={price} currency="JPY" />
          </DescriptionItem>
        </DescriptionList>
      )}

      <div className="flex flex-wrap gap-2">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            戻る
          </Button>
        )}
        {step < 2 ? (
          <Button color="primary" onClick={next}>
            次へ
          </Button>
        ) : (
          <Button color="primary" onClick={() => setDone(true)}>
            購入する
          </Button>
        )}
      </div>
    </div>
  );
}

function Access() {
  return (
    <Section id="access" title="アクセス">
      <Grid columns={{ base: 1, md: 2 }} gap="lg" align="start">
        <Embed
          src={mapDocument}
          title="Kazue Museum のまわりの地図"
          ratio={4 / 3}
          caption="駅の北口から、公園の西の道を歩いて 8 分"
        />
        <DescriptionList layout="stacked" divider="line">
          <DescriptionItem term="住所">架空県かずえ市 光の丘 1-2-3</DescriptionItem>
          <DescriptionItem term="開館時間">10:00〜18:00（入館は 17:30 まで）</DescriptionItem>
          <DescriptionItem term="休館日">
            月曜（祝日のときは開館し、次の日が休館）、年末年始
          </DescriptionItem>
          <DescriptionItem term="電車">かずえ線「光の丘駅」北口から歩いて 8 分</DescriptionItem>
          <DescriptionItem term="車">
            駐車場はありません。近くの駐車場か、電車・バスでお越しください
          </DescriptionItem>
        </DescriptionList>
      </Grid>
    </Section>
  );
}

function MuseumScreen({
  scenario,
  controlsPosition,
  thumbnailsIndicator,
  zoomVariant,
  stepperColor,
}: {
  scenario: Scenario;
  controlsPosition: CarouselControlsPosition;
  thumbnailsIndicator: ThumbnailsIndicator;
  zoomVariant: ImageZoomVariant;
  stepperColor: StepperColor;
}) {
  // 状態のボタンで開いたときは、チケットの段まで送っておく
  useEffect(() => {
    if (scenario !== 'start') document.getElementById('tickets')?.scrollIntoView();
  }, [scenario]);

  return (
    <div className="flex flex-col gap-16">
      <Hero />
      <Highlights controlsPosition={controlsPosition} thumbnailsIndicator={thumbnailsIndicator} />
      <Collection zoomVariant={zoomVariant} />
      <Intro />
      <Section
        id="tickets"
        title="チケット"
        lead="日時を指定して買います。買ったチケットはメールで届きます。"
      >
        <div className="max-w-[480px]">
          <TicketFlow scenario={scenario} color={stepperColor} />
        </div>
      </Section>
      <Access />
    </div>
  );
}

/**
 * いま読んでいる節に合わせて、上の帯の「いまいるところ」を替える。
 * 帯の下（画面の上から 3 割）を越えた節のうち、いちばん下のものを選ぶ。ページの終わりまで来たら、最後の節
 */
function useCurrentSection() {
  const [current, setCurrent] = useState(museum.nav[0].label);
  useEffect(() => {
    const update = () => {
      const line = window.innerHeight * 0.3;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let next = museum.nav[0].label;
      for (const { label, href } of museum.nav) {
        const section = document.getElementById(href.slice(1));
        if (section && (atBottom || section.getBoundingClientRect().top <= line)) next = label;
      }
      setCurrent(next);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return current;
}

function MuseumPage({ density, children }: { density: Density; children: ReactNode }) {
  const current = useCurrentSection();
  return (
    <SamplePage density={density} site={museum} current={current} width="lg">
      {children}
    </SamplePage>
  );
}

export const example: Example = {
  slug: 'museum',
  title: '美術館',
  description: '架空の美術館のサイト。展覧会・所蔵品・チケットの購入',
  initialLabel: 'チケットを選ぶ前',
  presets: [
    { label: '枚数を選ぶ', args: { scenario: 'count' } },
    { label: '内容を確かめる', args: { scenario: 'confirm' } },
    { label: 'チケットを買った', args: { scenario: 'done' } },
  ],
  controls: [
    {
      name: 'controlsPosition',
      label: 'ハイライトの送るボタン',
      type: 'radio',
      options: [
        { value: 'overlay', label: '写真に重ねる' },
        { value: 'bottom-end', label: '写真の下の右にまとめる' },
      ],
    },
    {
      name: 'thumbnailsIndicator',
      label: '選んでいる部屋の印',
      type: 'radio',
      options: [
        { value: 'underline', label: '下の棒だけ' },
        { value: 'underline-dim', label: 'ほかを少し薄くする' },
      ],
    },
    {
      name: 'zoomVariant',
      label: '所蔵品を拡大したときの後ろ',
      type: 'radio',
      options: [
        { value: 'light', label: '明るい', caption: 'ページの地の色で覆ってぼかします' },
        { value: 'dark', label: '暗い' },
      ],
    },
    {
      name: 'stepperColor',
      label: 'チケットの手順の色',
      type: 'radio',
      options: [
        { value: 'neutral', label: 'グレー' },
        { value: 'primary', label: 'ブルー' },
        { value: 'secondary', label: 'ピンク' },
      ],
    },
  ],
  defaults: {
    scenario: 'start',
    controlsPosition: 'overlay',
    thumbnailsIndicator: 'underline',
    zoomVariant: 'light',
    stepperColor: 'neutral',
  },
  Screen: ({ args, density }) => (
    <MuseumPage density={density}>
      <MuseumScreen
        scenario={args.scenario as Scenario}
        controlsPosition={args.controlsPosition as CarouselControlsPosition}
        thumbnailsIndicator={args.thumbnailsIndicator as ThumbnailsIndicator}
        zoomVariant={args.zoomVariant as ImageZoomVariant}
        stepperColor={args.stepperColor as StepperColor}
      />
    </MuseumPage>
  ),
};
