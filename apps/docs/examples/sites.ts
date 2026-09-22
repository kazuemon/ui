// 見本のページの、架空のサイト。ヘッダーの名前とメニュー、フッターの名前に使う
// 名前は「かずえもん（kazuemon）」をもじる。実在しそうに見えないよう、株式会社などの法律で決まった呼び名は付けない

export interface Site {
  /** ヘッダーの左とフッターに出す名前 */
  name: string;
  /** ヘッダーのメニュー */
  nav: { label: string; href: string }[];
}

/** 個人のブログ（記事・記事一覧） */
export const note: Site = {
  name: 'Kazue Log',
  nav: [
    { label: '記事', href: '#posts' },
    { label: 'タグ', href: '#tags' },
    { label: 'このブログについて', href: '#about' },
  ],
};

/** 小さなコミュニティの SNS（タイムライン・プロフィール・設定・サインイン） */
export const town: Site = {
  name: 'Kazue Hub',
  nav: [
    { label: 'ホーム', href: '#home' },
    { label: 'メンバー', href: '#members' },
    { label: 'イベント', href: '#events' },
    { label: '設定', href: '#settings' },
  ],
};

/** チームで使う作業の場所（メンバーの一覧） */
export const desk: Site = {
  name: 'Kazue Console',
  nav: [
    { label: 'プロジェクト', href: '#projects' },
    { label: 'メンバー', href: '#members' },
    { label: '請求', href: '#billing' },
  ],
};

/** お店の売上を見るサービス（ダッシュボード） */
export const shop: Site = {
  name: 'Kazue Metrics',
  nav: [
    { label: 'ダッシュボード', href: '#dashboard' },
    { label: '注文', href: '#orders' },
    { label: '商品', href: '#products' },
    { label: '設定', href: '#settings' },
  ],
};

/** 勉強会（申込フォーム） */
export const meetup: Site = {
  name: 'Kazue UI Meetup',
  nav: [
    { label: '参加する', href: '#join' },
    { label: 'これまでの回', href: '#archive' },
    { label: '問い合わせ', href: '#contact' },
  ],
};

/** 美容室（予約） */
export const salon: Site = {
  name: 'Salon de Kazu',
  nav: [
    { label: 'メニュー', href: '#menu' },
    { label: '予約', href: '#reserve' },
    { label: 'スタッフ', href: '#staff' },
    { label: 'アクセス', href: '#access' },
  ],
};

/** ブログを作るサービス（料金プラン） */
export const pages: Site = {
  name: 'Kazu Cloud',
  nav: [
    { label: '機能', href: '#features' },
    { label: '料金', href: '#pricing' },
    { label: 'ヘルプ', href: '#help' },
  ],
};
