// 見本のページの一覧。サーバーコンポーネント（一覧のページと generateStaticParams）から読むので、
// 画面そのもの（'use client' の registry）とは分けている。題と説明は registry の Example と同じにする

export interface ExampleSummary {
  slug: string;
  title: string;
  /** どういう画面かを 1 文で */
  description: string;
  /** その画面をいちばんよく表す部品。カードでは先頭に並べ、色を付けて目立たせる */
  highlights: string[];
  /** そのほかに、その画面で見られる部品 */
  components: string[];
}

export const examples: ExampleSummary[] = [
  {
    slug: 'article',
    title: '記事',
    description:
      'Markdown を変換した記事に、拡大できる画像・埋め込み・畳んだ補足・関連する記事を添えた 1 本',
    highlights: ['Prose'],
    components: [
      'ImageZoom',
      'Bleed',
      'Embed',
      'Collapsible',
      'HeadingAnchor',
      'Mark',
      'LinkCard',
      'Time',
    ],
  },
  {
    slug: 'docs',
    title: 'ドキュメント',
    description:
      '上の帯と部品のメニュー・左の目次・手順のある本文・ページ内の目次・次に読むページで組んだドキュメントサイト',
    highlights: ['Navbar', 'Tree'],
    components: [
      'NavigationMenu',
      'Affix',
      'SearchField',
      'Steps',
      'FileTree',
      'TableOfContents',
      'LinkCard',
      'Pager',
    ],
  },
  {
    slug: 'sign-up',
    title: '新規登録',
    description: 'アカウント・確認コード・プロフィールの 3 段で、アカウントを作る画面',
    highlights: ['Stepper', 'PinField'],
    components: ['PasswordField', 'Form', 'Checkbox', 'Switch', 'Notice'],
  },
  {
    slug: 'settings',
    title: '設定',
    description:
      'プロフィール・通知・表示・セキュリティを 1 ページに並べ、目次で節へ飛ぶ設定の画面',
    highlights: ['TableOfContents', 'Fieldset'],
    components: [
      'Dropzone',
      'Avatar',
      'MaskField',
      'Combobox',
      'TimePicker',
      'SegmentedControl',
      'Slider',
      'Meter',
      'PasswordField',
      'PinField',
      'AlertDialog',
      'Toast',
    ],
  },
  {
    slug: 'list',
    title: '一覧',
    description: 'メンバーを管理する画面の一覧。行から詳細を開く',
    highlights: ['DataTable', 'Toolbar'],
    components: [
      'SearchField',
      'Chip',
      'Stat',
      'NumberFormat',
      'ContextMenu',
      'StatusPanel',
      'AvatarGroup',
      'Dialog',
      'DescriptionList',
      'Time',
      'RelativeTime',
      'Pagination',
      'Menu',
    ],
  },
  {
    slug: 'sns',
    title: 'SNS',
    description:
      '小さなコミュニティの SNS のタイムライン。画像・リンク・ネタバレの付いた投稿と、いいね',
    highlights: ['PreviewCard', 'Toggle'],
    components: [
      'Tabs',
      'Menu',
      'Dialog',
      'Skeleton',
      'Gallery',
      'ImageZoom',
      'LinkCard',
      'Spoiler',
      'AvatarGroup',
      'RelativeTime',
      'NumberFormat',
      'TagsInput',
      'Textarea',
      'Badge',
    ],
  },
  {
    slug: 'apply',
    title: '申込フォーム',
    description: '勉強会の申し込み。入力・確認・完了の 3 つの画面',
    highlights: ['Form'],
    components: ['Combobox', 'TagsInput', 'NumberField', 'RadioGroup'],
  },
  {
    slug: 'blog-list',
    title: '記事一覧',
    description: 'ブログの記事をカードで並べた一覧',
    highlights: ['Card'],
    components: ['Autocomplete', 'Chip', 'Pagination'],
  },
  {
    slug: 'profile',
    title: 'プロフィール',
    description: 'コミュニティのメンバーのプロフィールのページ',
    highlights: ['Avatar', 'Timeline'],
    components: ['Stat', 'LinkCard'],
  },
  {
    slug: 'dashboard',
    title: 'ダッシュボード',
    description: 'お店の売上や注文をまとめた管理画面',
    highlights: ['Stat'],
    components: ['ButtonGroup', 'Progress', 'Meter', 'SearchField', 'StatusPanel'],
  },
  {
    slug: 'reservation',
    title: '予約',
    description: '日と時刻を選んで予約する画面',
    highlights: ['Calendar'],
    components: ['Dialog', 'NumberField', 'Notice'],
  },
  {
    slug: 'pricing',
    title: '料金プラン',
    description: '料金プランを紹介して、比べてもらうページ',
    highlights: ['Card', 'Table'],
    components: ['Tabs', 'Accordion'],
  },
  {
    slug: 'museum',
    title: '美術館',
    description: '架空の美術館のサイト。展覧会・所蔵品・チケットの購入',
    highlights: ['Gallery', 'Carousel'],
    components: ['Masonry', 'ImageZoom', 'Video', 'Stepper'],
  },
  {
    slug: 'tasks',
    title: 'タスクボード',
    description: 'チームのタスクを、ボードと表で管理する画面',
    highlights: ['Sortable', 'DataTable'],
    components: ['Inspector', 'ToggleGroup', 'DateField'],
  },
  {
    slug: 'tournament',
    title: '大会プラットフォーム',
    description:
      '大会の管理画面。左の列（Sidebar）でステージ＞リーグ＞グループを選び、行を押すと横のパネル（Inspector）で試合の詳細と経過を見ます。シードは引いて並べ替えます。',
    highlights: ['Sidebar', 'Inspector', 'Sortable'],
    components: [
      'DataTable',
      'Breadcrumb',
      'Stepper',
      'Stat',
      'SegmentedControl',
      'Timeline',
      'Dialog',
      'Combobox',
      'DatePicker',
      'TimePicker',
      'NumberField',
      'StatusPanel',
      'DescriptionList',
    ],
  },
  {
    slug: 'works',
    title: '作品集',
    description: '注目の作品・制作の様子・分野で絞り込める作品の一覧を並べた、個人の作品集',
    highlights: ['Carousel', 'Masonry'],
    components: ['Thumbnails', 'Video', 'AspectRatio', 'ToggleGroup', 'Card', 'Grid', 'Time'],
  },
  {
    slug: 'editor',
    title: 'エディタ',
    description: 'ブログの記事を Markdown で書き、プレビューを見ながら公開する画面',
    highlights: ['Menubar', 'Toolbar', 'ContextMenu'],
    components: [
      'ButtonGroup',
      'Toggle',
      'Textarea',
      'Prose',
      'Tabs',
      'TagsInput',
      'DatePicker',
      'Dropzone',
      'Switch',
      'Toast',
    ],
  },
];
