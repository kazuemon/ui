// 見本のページの一覧。サーバーコンポーネント（一覧のページと generateStaticParams）から読むので、
// 画面そのもの（'use client' の registry）とは分けている。題と説明は registry の Example と同じにする

export interface ExampleSummary {
  slug: string;
  title: string;
  description: string;
}

export const examples: ExampleSummary[] = [
  {
    slug: 'article',
    title: '記事',
    description: 'ブログの記事。囲みや引用の見た目を組み合わせて確かめます',
  },
  {
    slug: 'markdown-prose',
    title: 'Markdown（Prose）',
    description: 'Markdown を変換した HTML を、Prose にそのまま入れた記事',
  },
  {
    slug: 'docs',
    title: 'ドキュメント',
    description: '上の帯・左の目次・本文・前後のページを、部品だけで組んだドキュメント',
  },
  {
    slug: 'sign-in',
    title: 'サインイン',
    description: '検証のエラー、送信中、サーバーの返事までを通しで確かめます',
  },
  {
    slug: 'sign-up',
    title: '新規登録',
    description: '複数の欄の検証と、エラーの一覧（errorSummary）を確かめます',
  },
  {
    slug: 'reset-password',
    title: 'パスワードの再設定',
    description: '1 つの欄だけの画面。送ったあとの案内まで出します',
  },
  {
    slug: 'settings',
    title: '設定',
    description: 'タブで分けた設定。保存はトースト、削除は確認のダイアログを挟みます',
  },
  {
    slug: 'list',
    title: '一覧',
    description: '管理画面ふうの一覧。行から詳細を開き、状態も切り替えられます',
  },
  {
    slug: 'sns',
    title: 'SNS',
    description: 'タイムライン。タブ・投稿のメニュー・プロフィールのプレビューを備えます',
  },
  {
    slug: 'apply',
    title: '申込フォーム',
    description: '勉強会の申し込み。入力・確認・完了の 3 つの画面と、必須と任意の印を確かめます',
  },
  {
    slug: 'blog-list',
    title: '記事一覧',
    description: 'ブログの記事をカードで並べた一覧。言葉で探す・タグで絞る・並べ替える',
  },
  {
    slug: 'profile',
    title: 'プロフィール',
    description: 'コミュニティのメンバーのページ。数字・プロフィールの項目・活動の流れ',
  },
  {
    slug: 'dashboard',
    title: 'ダッシュボード',
    description: 'お店の管理画面。数字のまとめ・目標までの進み・容量・最近の注文',
  },
  {
    slug: 'reservation',
    title: '予約',
    description: 'カレンダーで日を、ボタンで時刻を選び、確認のダイアログを挟む予約',
  },
  {
    slug: 'pricing',
    title: '料金プラン',
    description: 'プランのカード、月払いと年払いの切り替え、機能を比べる表、よくある質問',
  },
];
