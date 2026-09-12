import { Select as BaseSelect } from '@base-ui/react/select';
import type { ReactNode } from 'react';

import { Field } from './Field';
import { controlBox } from './field-styles';
import { CaretDownIcon, CheckIcon } from './icons';

export interface SelectItem {
  label: string;
  value: string;
}

export interface SelectProps {
  label: ReactNode;
  caption?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  items: SelectItem[];
  placeholder?: string;
  defaultValue?: string;
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  className?: string;
}

/**
 * 選択肢から1つを選ぶ入力欄
 */
export function Select({
  label,
  caption,
  error,
  disabled,
  items,
  placeholder,
  className,
  ...rootProps
}: SelectProps) {
  return (
    <Field
      label={label}
      caption={caption}
      error={error}
      disabled={disabled}
      className={className}
      nativeLabel={false}
    >
      <BaseSelect.Root items={items} disabled={disabled} {...rootProps}>
        {/* 選択肢を開いているあいだも、フォーカス中と同じ見た目にする */}
        <BaseSelect.Trigger
          data-slot="control"
          className={controlBox({
            className:
              'cursor-pointer text-left data-popup-open:border-focus data-popup-open:bg-field-focus',
          })}
        >
          <BaseSelect.Value
            className="min-w-0 flex-1 truncate data-placeholder:text-fg-subtle"
            placeholder={placeholder}
          />
          <BaseSelect.Icon className="flex text-fg-muted">
            <CaretDownIcon />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          {/* 浮かぶ部分の見た目と、ボトムシートへの切り替え（原則11）はまだ決めていない。ここは仮 */}
          <BaseSelect.Positioner
            alignItemWithTrigger={false}
            sideOffset={4}
            className="z-10 outline-none"
          >
            <BaseSelect.Popup className="min-w-(--anchor-width) origin-(--transform-origin) rounded-control border border-line bg-surface p-1 text-(length:--text-control) leading-(--leading-control) text-fg transition-[opacity,scale] duration-(--duration-press) ease-press outline-none data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0">
              <BaseSelect.List className="max-h-(--available-height) overflow-y-auto">
                {items.map((item) => (
                  <BaseSelect.Item
                    key={item.value}
                    value={item.value}
                    className="flex h-(--size-control) cursor-pointer items-center gap-(--space-control-x) rounded-[calc(var(--radius-control)-4px)] px-[calc(var(--space-control-x)-4px)] outline-none select-none data-highlighted:bg-field"
                  >
                    <BaseSelect.ItemText className="flex-1">{item.label}</BaseSelect.ItemText>
                    <BaseSelect.ItemIndicator className="flex text-primary">
                      <CheckIcon />
                    </BaseSelect.ItemIndicator>
                  </BaseSelect.Item>
                ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </Field>
  );
}
