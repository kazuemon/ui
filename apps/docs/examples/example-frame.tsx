'use client';

import { Button, Drawer, Icon, Link, Radio, RadioGroup, Select, Switch, Text } from '@kazuemon/ui';
import { CaretRightIcon, SlidersHorizontalIcon } from '@phosphor-icons/react';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';

import { registry } from './registry';
import type { ControlDef, ControlOption, Density, Environment, ExampleArgs } from './types';

// 見本のページの枠。画面そのものは見本が描き、ここは右下のボタンと、そこから開く切替画面だけを持つ
//   切替は Storybook の Controls にあたるもの。密度（指・マウス）と、見本ごとの props を並べる
//   ページが見本であることは、左下に薄い小さな文字で置く

// 選択肢の名前は、部品に渡す値そのもの。日本語は下の説明に置く
/** 選択肢の下に出す文。日本語の呼び名を先に置き、説明があれば続ける */
function optionCaption(option: ControlOption, environment: Environment) {
  const text = typeof option.caption === 'function' ? option.caption(environment) : option.caption;
  return text ? `${option.label}・${text}` : option.label;
}

function Control({
  control,
  value,
  environment,
  onChange,
}: {
  control: ControlDef;
  value: string | boolean | undefined;
  environment: Environment;
  onChange: (name: string, value: string | boolean) => void;
}) {
  if (control.type === 'switch') {
    return (
      <Switch
        label={control.label}
        caption={control.caption}
        checked={value === true}
        onCheckedChange={(next: boolean) => onChange(control.name, next)}
      />
    );
  }
  if (control.type === 'select') {
    return (
      <Select
        label={control.label}
        // 選択肢の説明は、ラベルの下の 2 行目に出す（開いたときに読める）
        items={control.options.map((option) => ({
          value: option.value,
          label: option.value,
          note: { kind: 'reason', text: optionCaption(option, environment) } as const,
        }))}
        value={typeof value === 'string' ? value : null}
        onValueChange={(next) => next != null && onChange(control.name, next)}
      />
    );
  }
  return (
    <RadioGroup
      label={control.label}
      caption={control.caption}
      value={typeof value === 'string' ? value : ''}
      onValueChange={(next) => onChange(control.name, String(next))}
    >
      {control.options.map((option) => (
        <Radio
          key={option.value}
          value={option.value}
          label={option.value}
          caption={optionCaption(option, environment)}
        />
      ))}
    </RadioGroup>
  );
}

// 重なる面が、いまシートになるか（src/internal/sheet/use-narrow-screen.ts と同じ条件）
// 指で操作していて、縦なら 768px・横なら 1024px より狭いとき
const QUERIES = {
  coarse: '(pointer: coarse)',
  portrait: '(orientation: portrait)',
  narrowPortrait: '(orientation: portrait) and (max-width: 767.98px)',
  narrowLandscape: '(orientation: landscape) and (max-width: 1023.98px)',
} as const;

/** いまの環境。「自動」がどちらに倒れているかを見せる（描くまでは分からないので undefined） */
function useEnvironment(): Environment {
  const [environment, setEnvironment] = useState<Environment>({});
  useEffect(() => {
    const queries = Object.values(QUERIES).map((query) => window.matchMedia(query));
    const [coarse, portrait, narrowPortrait, narrowLandscape] = queries;
    const update = () => {
      const narrow = narrowPortrait.matches || narrowLandscape.matches;
      setEnvironment({
        coarse: coarse.matches,
        narrow,
        sheetWidth: portrait.matches ? 768 : 1024,
        sheet: coarse.matches && narrow,
      });
    };
    update();
    for (const query of queries) query.addEventListener('change', update);
    return () => {
      for (const query of queries) query.removeEventListener('change', update);
    };
  }, []);
  return environment;
}

export function ExampleFrame({ slug }: { slug: string }) {
  const example = registry[slug];
  const [args, setArgs] = useState<ExampleArgs>(example.defaults);
  const [density, setDensity] = useState<Density>('auto');
  // 状態のボタンを押すたびに増やす。これを key にして画面を作り直すので、同じボタンを押しても同じ状態が出る
  const [run, setRun] = useState(0);
  const change = (name: string, value: string | boolean) =>
    setArgs((current) => ({ ...current, [name]: value }));
  const environment = useEnvironment();
  const { coarse } = environment;
  // 開いたときの状態に戻す（密度は切替画面の設定なので動かさない）
  const toInitial = () => {
    setArgs(example.defaults);
    setRun((current) => current + 1);
  };

  return (
    <>
      <example.Screen key={run} args={args} density={density} />

      {/* 右下の断りとボタン。重なる面（z-10）と同じ層に置き、開いているあいだは面が上に来る
      断りは読むものではないので、小さく薄く、ボタンの横に中央をそろえて置く（下に薄い面を敷く） */}
      <div className="fixed right-4 bottom-4 z-10 flex items-center gap-3">
        <div className="pointer-events-none rounded-pill bg-neutral/80 px-3 py-1">
          <Text size="sm" variant="subtle">
            @kazuemon/ui の見本のページです
          </Text>
        </div>
        <Drawer
          title="見本のコントロール"
          side="right"
          // ページを覆わない: 後ろを暗くせず、開いたまま画面を触れる（押した結果がその場で見える）
          // フォーカスが外へ出ても閉じない。閉じるのは × か Esc
          modal={false}
          dismissible={false}
          trigger={
            <Button iconOnly shape="circle" color="primary" aria-label="表示を切り替える">
              <Icon icon={SlidersHorizontalIcon} standalone />
            </Button>
          }
          actions={
            <Link
              variant="outline"
              className="w-full"
              contentAlign="center-end"
              render={<NextLink href="/examples" />}
            >
              見本の一覧に戻る
              <CaretRightIcon />
            </Link>
          }
        >
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              {/* 見出しは、欄（TextField など）のラベルと同じ見た目にそろえる */}
              <span className="text-(length:--text-label) leading-(--leading-label) font-bold text-fg">
                状態を再現する
              </span>
              <div className="flex flex-wrap gap-2">
                {example.presets?.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    onClick={() => {
                      setArgs((current) => ({ ...current, ...preset.args }));
                      setRun((current) => current + 1);
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
                <Button variant="outline" onClick={toInitial}>
                  {example.initialLabel ?? 'はじめの表示'}
                </Button>
              </div>
            </div>
            <RadioGroup
              label="密度"
              value={density}
              onValueChange={(next) => setDensity(next as Density)}
            >
              <Radio
                value="auto"
                label="auto"
                caption={
                  coarse === undefined
                    ? '自動・入力方式に合わせます'
                    : `自動・いまは${coarse ? '指' : 'マウス'}です`
                }
              />
              <Radio value="fine" label="fine" caption="マウス" />
              <Radio value="coarse" label="coarse" caption="指" />
            </RadioGroup>
            {example.controls.map((control) => (
              <Control
                key={control.name}
                control={control}
                value={args[control.name]}
                environment={environment}
                onChange={change}
              />
            ))}
          </div>
        </Drawer>
      </div>
    </>
  );
}
