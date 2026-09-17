// @kazuemon/ui の公開の入口。ここに並べたものだけを利用者に渡す
// CSS は別の入口（package.json の exports の ./styles.css → src/styles/index.css）

export { Badge, type BadgeProps } from './components/badge/Badge';
export { Blockquote, type BlockquoteProps } from './components/blockquote/Blockquote';
export { Button, type ButtonLinkProps, type ButtonProps } from './components/button/Button';
export {
  Callout,
  type CalloutAppearance,
  type CalloutColor,
  type CalloutProps,
} from './components/callout/Callout';
export { Checkbox, type CheckboxProps, type ChoiceColor } from './components/checkbox/Checkbox';
export {
  CheckboxGroup,
  type CheckboxGroupProps,
  type ChoiceFrame,
} from './components/checkbox/CheckboxGroup';
export { Code, type CodeProps } from './components/code/Code';
export { CodeBlock, type CodeBlockProps } from './components/code-block/CodeBlock';
export { Divider, type DividerProps } from './components/divider/Divider';
export { Figure, type FigureProps } from './components/figure/Figure';
export {
  FootnoteItem,
  type FootnoteItemProps,
  FootnoteRef,
  type FootnoteRefProps,
  Footnotes,
  type FootnotesProps,
} from './components/footnote/Footnote';
export { FieldAddonButton, type FieldAddonButtonProps } from './components/field-addon/FieldAddon';
export type { AddonShape } from './components/field-addon/field-addon-context';
export { Form, type FormProps } from './components/form/Form';
export {
  Heading,
  type HeadingLevel,
  type HeadingProps,
  type HeadingSize,
} from './components/heading/Heading';
export { Kbd, type KbdProps } from './components/kbd/Kbd';
export { List, ListItem, type ListItemProps, type ListProps } from './components/list/List';
export { Link, type LinkContentAlign, type LinkProps } from './components/link/Link';
export { LoadingBar, type LoadingIndicator, Spinner } from './components/loading/Loading';
export {
  Notice,
  type NoticeAppearance,
  type NoticeColor,
  type NoticeProps,
} from './components/notice/Notice';
export { NoticeRegion, type NoticeRegionProps } from './components/notice/NoticeRegion';
export { Prose, type ProseProps } from './components/prose/Prose';
export { Radio, RadioGroup, type RadioGroupProps, type RadioProps } from './components/radio/Radio';
export {
  Select,
  type SelectColor,
  type SelectItem,
  type SelectItemNote,
  type SelectItemNoteKind,
  type SelectPresentation,
  type SelectProps,
  type SheetDetent,
  type SheetMoreCue,
} from './components/select/Select';
export {
  Switch,
  type SwitchCaptionAppearance,
  type SwitchFrame,
  type SwitchProps,
} from './components/switch/Switch';
export {
  Table,
  TableBody,
  TableCell,
  type TableCellProps,
  TableHead,
  TableHeader,
  type TableHeaderProps,
  type TableProps,
  TableRow,
} from './components/table/Table';
export { Tag, type TagProps } from './components/tag/Tag';
export { Text, type TextProps } from './components/text/Text';
export { TextField, type TextFieldProps } from './components/text-field/TextField';
export type { CaptionPlacement, FieldLoadingBehavior } from './internal/field/Field';
export type { FormSubmittingBehavior } from './internal/form-context';
/** tailwind-merge の設定。利用者の cn() で `extendTailwindMerge(twMergeConfig)` に渡す（design/adr/0077） */
export { twMergeConfig } from './internal/tv';
