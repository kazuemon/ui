'use client';

import { NumberField as BaseNumberField } from '@base-ui/react/number-field';

import { CaretDownIcon, CaretUpIcon, MinusIcon, PlusIcon } from '../../internal/icons';
import { FieldAddon, FieldAddonButton } from '../field-addon/FieldAddon';
import { tv } from '../../internal/tv';

// 増減ボタン（軸 169）。どちらも欄の値に作用するので、欄の中に置く（ADR-0168）
// 押せるかは Base UI が決める（押せない欄・読み取り専用・min / max に届いた向き）。見た目は disabled 属性で表す

/** 増減ボタンの読み上げの名前 */
export interface StepperLabels {
  increment: string;
  decrement: string;
}

/**
 * split（既定）: 両端に − と ＋。FieldAddonButton そのもの（本体の端に接する塊。addonShape="floating" で内側に浮く）
 */
export function SplitStepButton({
  direction,
  label,
  locked,
}: {
  direction: 'increment' | 'decrement';
  label: string;
  /** 読み取り専用や、待っているあいだ止めるとき。Base UI は押させないが disabled 属性を付けないので、ここで付ける */
  locked: boolean;
}) {
  const Part = direction === 'increment' ? BaseNumberField.Increment : BaseNumberField.Decrement;
  const Icon = direction === 'increment' ? PlusIcon : MinusIcon;
  return (
    <Part
      aria-label={label}
      render={(props, state) => (
        <FieldAddonButton
          {...props}
          data-slot="field-addon-button"
          data-stepper={direction}
          disabled={state.disabled || locked}
        >
          <Icon standalone />
        </FieldAddonButton>
      )}
    />
  );
}

// stacked: 縦積みのボタン。塊（FieldAddon）を本体の右端に接して置き、その中を上下に割る
//   塗り・hover と押下の敷き・押せないときの文字の色は FieldAddonButton と同じ（塊の --addon-fill に重ねる）
const stackedButton = tv({
  base: [
    'group/step flex min-h-0 flex-1 cursor-pointer items-center justify-center text-fg select-none',
    'group-data-invalid/field:text-[color:var(--color-on-field-addon-invalid,var(--color-fg))]',
    'bg-(color:--addon-bg) [--addon-bg:transparent]',
    '[--addon-ink:var(--color-fg)] group-data-invalid/field:[--addon-ink:var(--color-on-field-addon-invalid,var(--color-fg))]',
    '[transition:--addon-bg_var(--duration-press)_var(--ease-press)] motion-reduce:[transition:none]',
    'enabled:hover:[--addon-bg:color-mix(in_oklab,var(--addon-fill),var(--addon-ink)_var(--flat-hover-mix))]',
    'enabled:active:[--addon-bg:color-mix(in_oklab,var(--addon-fill),var(--addon-ink)_var(--flat-press-mix))]',
    'disabled:cursor-not-allowed disabled:text-[color:var(--color-on-field-disabled,var(--color-fg))]',
  ],
});

function StackedStepButton({
  direction,
  label,
  locked,
}: {
  direction: 'increment' | 'decrement';
  label: string;
  locked: boolean;
}) {
  const Part = direction === 'increment' ? BaseNumberField.Increment : BaseNumberField.Decrement;
  const Icon = direction === 'increment' ? CaretUpIcon : CaretDownIcon;
  return (
    <Part
      aria-label={label}
      render={(props, state) => (
        <button
          {...props}
          type="button"
          data-stepper={direction}
          disabled={state.disabled || locked}
          className={stackedButton()}
        >
          <span className="flex transition-[translate] duration-(--duration-press) ease-press group-active/step:translate-y-(--flat-press-depth) group-disabled/step:translate-y-0 motion-reduce:transition-none">
            <Icon standalone className="size-(--number-field-stepper-icon) shrink-0" />
          </span>
        </button>
      )}
    />
  );
}

/**
 * stacked: 本体の右端に、上下に割った ▲ と ▼
 */
export function StackedStepper({ labels, locked }: { labels: StepperLabels; locked: boolean }) {
  return (
    <FieldAddon
      data-stepper="stacked"
      className="w-(--number-field-stepper-width) flex-col items-stretch overflow-hidden px-0"
    >
      <StackedStepButton direction="increment" label={labels.increment} locked={locked} />
      <StackedStepButton direction="decrement" label={labels.decrement} locked={locked} />
    </FieldAddon>
  );
}
