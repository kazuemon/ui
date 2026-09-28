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
    description: '見出し・引用・囲み・コード・図を並べた、ブログの記事 1 本',
    highlights: ['Prose'],
    components: ['Callout', 'Blockquote', 'CodeBlock', 'ImageZoom', 'Spoiler'],
  },
  {
    slug: 'markdown-prose',
    title: 'Markdown（Prose）',
    description: 'Markdown から変換した HTML を、そのまま流し込んだ記事',
    highlights: ['Prose'],
    components: ['CodeBlock'],
  },
  {
    slug: 'docs',
    title: 'ドキュメント',
    description: '上の帯・左の目次・本文・ページ内の目次で組んだドキュメントサイト',
    highlights: ['Tree', 'TableOfContents'],
    components: ['Steps', 'CodeGroup', 'FileTree', 'Navbar'],
  },
  {
    slug: 'sign-in',
    title: 'サインイン',
    description: 'メールアドレスとパスワードで入る画面',
    highlights: ['PasswordField'],
    components: ['Form', 'TextField', 'Notice'],
  },
  {
    slug: 'sign-up',
    title: '新規登録',
    description: 'いくつかの欄を入れて、アカウントを作る画面',
    highlights: ['Form'],
    components: ['PasswordField', 'TextField', 'Checkbox'],
  },
  {
    slug: 'reset-password',
    title: 'パスワードの再設定',
    description: 'メールアドレスを入れて、再設定の案内を送る画面',
    highlights: ['Form'],
    components: ['TextField', 'Notice'],
  },
  {
    slug: 'verify-code',
    title: '確認コード',
    description: 'メールで届いた確認コードを入れる画面',
    highlights: ['PinField'],
    components: ['Form', 'Button'],
  },
  {
    slug: 'settings',
    title: '設定',
    description: 'アカウント・通知・表示などを、タブで分けた設定の画面',
    highlights: ['Tabs'],
    components: ['Switch', 'Slider', 'Dropzone', 'PinField', 'AlertDialog'],
  },
  {
    slug: 'list',
    title: '一覧',
    description: 'メンバーを管理する画面の一覧。行から詳細を開く',
    highlights: ['Table'],
    components: ['Menu', 'Dialog', 'Pagination', 'Skeleton'],
  },
  {
    slug: 'sns',
    title: 'SNS',
    description: '小さなコミュニティの SNS のタイムライン',
    highlights: ['Avatar'],
    components: ['Tabs', 'Menu', 'Popover', 'Dialog'],
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
    description: '大会の管理画面。列でグループを選び、行から横のパネルで試合の詳細を見ます',
    highlights: ['Sidebar', 'Inspector'],
    components: ['Table', 'DescriptionList', 'Menu', 'Tag'],
  },
];
