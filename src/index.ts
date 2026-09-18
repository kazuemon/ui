// @kazuemon/ui の公開の入口。ここに並べたものだけを利用者に渡す
// CSS は別の入口（package.json の exports の ./styles.css → src/styles/index.css）

export { AspectRatio, type AspectRatioProps } from './components/aspect-ratio/AspectRatio';
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
export {
  Collapsible,
  type CollapsibleAppearance,
  type CollapsibleIndicator,
  type CollapsibleProps,
} from './components/collapsible/Collapsible';
export { Code, type CodeProps } from './components/code/Code';
export { CodeBlock, type CodeBlockProps } from './components/code-block/CodeBlock';
export {
  Container,
  type ContainerProps,
  type ContainerSize,
} from './components/container/Container';
export { Dialog, type DialogPresentation, type DialogProps } from './components/dialog/Dialog';
export { Divider, type DividerProps } from './components/divider/Divider';
export {
  Drawer,
  type OverlayActionsLayout,
  type DrawerDetent,
  type DrawerProps,
  type DrawerSide,
} from './components/drawer/Drawer';
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
export { Icon, type IconProps, type IconSize } from './components/icon/Icon';
export { Image, type ImageProps } from './components/image/Image';
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
export { OverlayClose, type OverlayCloseProps } from './internal/overlay/overlay-close';
export {
  Popover,
  type PopoverAlign,
  type PopoverPresentation,
  type PopoverProps,
  type PopoverSide,
} from './components/popover/Popover';
export { Portal, type PortalProps } from './components/portal/Portal';
export { ThemeProvider, type ThemeProviderProps } from './components/theme-provider/ThemeProvider';
export { Prose, type ProseProps } from './components/prose/Prose';
export { Radio, RadioGroup, type RadioGroupProps, type RadioProps } from './components/radio/Radio';
export {
  ScrollArea,
  type ScrollAreaProps,
  type ScrollAreaScrollbar,
} from './components/scroll-area/ScrollArea';
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
export { Skeleton, type SkeletonProps } from './components/skeleton/Skeleton';
export { Tag, type TagProps } from './components/tag/Tag';
export { Text, type TextProps } from './components/text/Text';
export {
  Transition,
  type TransitionPreset,
  type TransitionProps,
} from './components/transition/Transition';
export { Tooltip, type TooltipProps, type TooltipSide } from './components/tooltip/Tooltip';
export { TextField, type TextFieldProps } from './components/text-field/TextField';
export {
  VisuallyHidden,
  type VisuallyHiddenProps,
} from './components/visually-hidden/VisuallyHidden';
export type { CaptionPlacement, FieldLoadingBehavior } from './internal/field/Field';
export type { FormSubmittingBehavior } from './internal/form-context';
export type { OverlayPresentation } from './internal/sheet/use-narrow-screen';
/** tailwind-merge の設定。利用者の cn() で `extendTailwindMerge(twMergeConfig)` に渡す（design/adr/0077） */
export { twMergeConfig } from './internal/tv';
