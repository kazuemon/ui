'use client';

import {
  AlertDialog,
  type AlertDialogColor,
  Avatar,
  Button,
  type CaptionPlacement,
  Checkbox,
  CheckboxGroup,
  Combobox,
  Dropzone,
  Fieldset,
  Heading,
  MaskField,
  Meter,
  Notice,
  PasswordField,
  PinField,
  SegmentedControl,
  SegmentedControlItem,
  Select,
  Slider,
  Stack,
  Switch,
  TableOfContents,
  Temporal,
  Text,
  Textarea,
  TextField,
  TimePicker,
  ToastProvider,
  type ToastPosition,
  type ToastVariant,
  useToast,
} from '@kazuemon/ui';
import { type ReactNode, useState } from 'react';

import { SamplePage } from './sample-page';
import { town } from './sites';
import { environmentNote, type Example } from './types';

// 設定の画面: 1 枚の縦に長いページ。節ごとに保存し（Toast で知らせる）、左の目次で節へ飛ぶ
// 取り消せない操作（アカウントの削除）は確認のダイアログ（AlertDialog）を挟む

interface SettingsArgs {
  toastPosition: ToastPosition;
  toastAppearance: ToastVariant;
  captionPlacement: CaptionPlacement;
  dangerTone: AlertDialogColor;
}

const sections = [
  { id: 'profile', text: 'プロフィール', level: 2 },
  { id: 'notification', text: '通知', level: 2 },
  { id: 'display', text: '表示', level: 2 },
  { id: 'security', text: 'セキュリティ', level: 2 },
  { id: 'data', text: 'データとアカウント', level: 2 },
] as const;

const timeZones = [
  { label: '東京（UTC+9）', value: 'Asia/Tokyo' },
  { label: 'ソウル（UTC+9）', value: 'Asia/Seoul' },
  { label: 'シンガポール（UTC+8）', value: 'Asia/Singapore' },
  { label: 'ロンドン（UTC+0）', value: 'Europe/London' },
  { label: 'ニューヨーク（UTC−5）', value: 'America/New_York' },
  { label: 'ロサンゼルス（UTC−8）', value: 'America/Los_Angeles' },
];

function Section({
  id,
  title,
  lead,
  children,
}: {
  id: (typeof sections)[number]['id'];
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <Stack gap="lg" render={<section aria-labelledby={id} />}>
      <Stack gap="xs">
        <Heading level={2} size="lg" id={id} className="scroll-mt-6">
          {title}
        </Heading>
        {lead && <Text variant="muted">{lead}</Text>}
      </Stack>
      {children}
    </Stack>
  );
}

function SaveBar() {
  const toast = useToast();
  return (
    <div>
      <Button
        color="primary"
        onClick={() => toast.show({ status: 'success', title: '保存しました', timeout: 4000 })}
      >
        保存する
      </Button>
    </div>
  );
}

function ProfileSection({ captionPlacement }: { captionPlacement: CaptionPlacement }) {
  return (
    <Section id="profile" title="プロフィール" lead="ほかの人に表示される情報です。">
      {/* 今の画像を箱の中に置き、箱のどこを押しても（落としても）替えられるようにする */}
      <Dropzone
        label="プロフィール画像"
        caption="JPEG・PNG、5MB まで"
        captionPlacement={captionPlacement}
        accept="image/png,image/jpeg"
        maxSize={5 * 1000 * 1000}
        variant="dashed"
        // 中身は 1 行で収まるので、箱の最低の高さ（既定の中身の分）は外す
        className="[--dropzone-min-height:0px]"
      >
        <Stack direction="horizontal" gap="md" align="center" className="w-full">
          <Avatar name="かずえもん" size="xl" />
          <Stack gap="xs" className="min-w-0 text-start">
            <Text weight="bold">画像を替える</Text>
            <Text size="sm" variant="muted">
              ここに画像を落とすか、押して選びます
            </Text>
          </Stack>
        </Stack>
      </Dropzone>
      <TextField label="表示名" defaultValue="かずえもん" />
      <TextField
        label="ユーザー名"
        prefix="@"
        defaultValue="kazuemon"
        caption="半角英数字で入力します"
        captionPlacement={captionPlacement}
      />
      <TextField label="ウェブサイト" prefix="https://" defaultValue="kazuemon.dev" />
      <Textarea
        label="自己紹介"
        defaultValue="UI ライブラリを作っています。"
        maxCount={160}
        showCount
        minRows={3}
      />
      <MaskField
        label="電話番号"
        mask="###-####-####"
        caption="本人の確かめにだけ使い、ほかの人には表示しません"
        captionPlacement={captionPlacement}
      />
      <Select
        label="言語"
        items={[
          { label: '日本語', value: 'ja' },
          { label: 'English', value: 'en' },
        ]}
        defaultValue="ja"
      />
      <Combobox
        label="タイムゾーン"
        items={timeZones}
        defaultValue="Asia/Tokyo"
        placeholder="都市の名前で探す"
        emptyText="当てはまるタイムゾーンがありません"
      />
      <SaveBar />
    </Section>
  );
}

function NotificationSection({ captionPlacement }: { captionPlacement: CaptionPlacement }) {
  return (
    <Section id="notification" title="通知">
      <Stack gap="sm">
        <Switch label="メールで受け取る" caption="週に 1 回、まとめて届きます" defaultChecked />
        <Switch label="プッシュ通知" />
      </Stack>
      <CheckboxGroup
        label="受け取る通知"
        caption="1 つ以上選んでください"
        captionPlacement={captionPlacement}
        defaultValue={['reply', 'follow']}
      >
        <Checkbox value="reply" label="返信" />
        <Checkbox value="follow" label="フォロー" />
        <Checkbox value="news" label="お知らせ" caption="新しい機能や、メンテナンスの予定です" />
      </CheckboxGroup>
      <Fieldset label="通知を止める時間帯" caption="この時間のあいだは、プッシュ通知を鳴らしません">
        <Stack direction="horizontal" gap="md">
          <TimePicker label="開始" defaultValue={Temporal.PlainTime.from('22:00')} />
          <TimePicker label="終了" defaultValue={Temporal.PlainTime.from('07:00')} />
        </Stack>
      </Fieldset>
      <SaveBar />
    </Section>
  );
}

function DisplaySection({ captionPlacement }: { captionPlacement: CaptionPlacement }) {
  return (
    <Section id="display" title="表示">
      <SegmentedControl label="テーマ" defaultValue="system">
        <SegmentedControlItem value="system">端末に合わせる</SegmentedControlItem>
        <SegmentedControlItem value="light">ライト</SegmentedControlItem>
        <SegmentedControlItem value="dark">ダーク</SegmentedControlItem>
      </SegmentedControl>
      <Slider
        label="文字の大きさ"
        caption="標準は 16 です"
        captionPlacement={captionPlacement}
        min={12}
        max={20}
        defaultValue={16}
        largeStep={2}
      />
      <Switch label="動きを減らす" caption="画面の動きを小さくします" />
      <SaveBar />
    </Section>
  );
}

function SecuritySection({ captionPlacement }: { captionPlacement: CaptionPlacement }) {
  const [twoFactor, setTwoFactor] = useState(false);
  return (
    <Section id="security" title="セキュリティ">
      <TextField
        label="メールアドレス"
        type="email"
        defaultValue="kazuemon@example.com"
        caption="変えると、新しいアドレスに確認のメールが届きます"
        captionPlacement={captionPlacement}
      />
      <Fieldset label="パスワードを変える">
        <Stack gap="md">
          <PasswordField label="いまのパスワード" autoComplete="current-password" />
          <PasswordField
            label="新しいパスワード"
            caption="8 文字以上"
            captionPlacement={captionPlacement}
            autoComplete="new-password"
          />
        </Stack>
      </Fieldset>
      <Fieldset label="2 段階認証">
        <Stack gap="md">
          <Switch
            label="2 段階認証を使う"
            caption="サインインのときに、認証アプリのコードも求めます"
            checked={twoFactor}
            onCheckedChange={setTwoFactor}
          />
          {twoFactor && (
            <PinField
              label="認証アプリのコード"
              caption="認証アプリに表示された 6 桁のコードを入れて、設定を終えます"
              captionPlacement={captionPlacement}
            />
          )}
        </Stack>
      </Fieldset>
      <SaveBar />
    </Section>
  );
}

function DataSection({ dangerTone }: { dangerTone: AlertDialogColor }) {
  const [deleted, setDeleted] = useState(false);
  const toast = useToast();
  return (
    <Section id="data" title="データとアカウント">
      <Meter
        label="保存容量"
        value={7.2}
        max={10}
        high={8}
        caption="10 GB のうち 7.2 GB を使っています"
      />
      <Notice status="warning" title="アカウントの削除は元に戻せません">
        アカウントを削除すると、投稿と設定がすべて消えます。
      </Notice>
      {deleted ? (
        <Text variant="muted">アカウントを削除しました。</Text>
      ) : (
        <div>
          <AlertDialog
            color={dangerTone}
            title="アカウントを削除しますか？"
            description="投稿・フォロー・設定がすべて消えます。この操作は元に戻せません。"
            actionLabel="削除する"
            onAction={() => {
              setDeleted(true);
              toast.show({ status: 'danger', title: 'アカウントを削除しました', timeout: 4000 });
            }}
            trigger={<Button color={dangerTone}>アカウントを削除する</Button>}
          />
        </div>
      )}
    </Section>
  );
}

function SettingsScreen({ args }: { args: SettingsArgs }) {
  return (
    <div className="flex gap-12">
      <aside className="sticky top-6 hidden h-fit w-44 shrink-0 md:block">
        <TableOfContents label="設定の項目" items={sections} />
      </aside>
      <Stack gap="xl" className="max-w-[560px] min-w-0 flex-1">
        <Stack gap="xs">
          <Heading level={1} size="xl">
            設定
          </Heading>
          <Text variant="muted">プロフィール、通知、表示、セキュリティの設定です。</Text>
        </Stack>
        <ProfileSection captionPlacement={args.captionPlacement} />
        <NotificationSection captionPlacement={args.captionPlacement} />
        <DisplaySection captionPlacement={args.captionPlacement} />
        <SecuritySection captionPlacement={args.captionPlacement} />
        <DataSection dangerTone={args.dangerTone} />
      </Stack>
    </div>
  );
}

export const example: Example = {
  slug: 'settings',
  title: '設定',
  description: 'プロフィール・通知・表示・セキュリティを 1 ページに並べ、目次で節へ飛ぶ設定の画面',
  controls: [
    {
      name: 'toastPosition',
      label: '保存時のトーストの位置',
      type: 'select',
      options: [
        {
          value: 'auto',
          label: '自動',
          caption: (environment) =>
            environment.sheet === undefined
              ? '指で操作していて、画面が狭いときだけ下中央になります'
              : `いまは${environment.sheet ? '下中央' : '右下'}になります（${environmentNote(environment)}）`,
        },
        { value: 'bottom-end', label: '右下' },
        { value: 'bottom-center', label: '下中央' },
        { value: 'top-end', label: '右上' },
      ],
    },
    {
      name: 'toastAppearance',
      label: '保存時のトーストの見た目',
      type: 'radio',
      options: [
        { value: 'soft', label: '淡い', caption: '状態の色の淡い面に、状態の色の文字を置きます' },
        {
          value: 'filled',
          label: '塗り',
          caption: '状態の色で濃く塗り、白い文字にします（警告だけ黄色の塗りに濃紺の文字）',
        },
      ],
    },
    {
      name: 'captionPlacement',
      label: '入力欄のキャプション位置',
      type: 'radio',
      options: [
        { value: 'top', label: 'ラベルの下' },
        { value: 'bottom', label: '本体の下' },
      ],
    },
    {
      name: 'dangerTone',
      label: '危険な操作の色',
      type: 'radio',
      options: [
        { value: 'danger', label: '赤（危険色）' },
        { value: 'primary', label: 'ブルー' },
      ],
    },
  ],
  defaults: {
    toastPosition: 'auto',
    toastAppearance: 'soft',
    captionPlacement: 'top',
    dangerTone: 'danger',
  },
  Screen: ({ args, density }) => {
    const settingsArgs: SettingsArgs = {
      toastPosition: args.toastPosition as ToastPosition,
      toastAppearance: args.toastAppearance as ToastVariant,
      captionPlacement: args.captionPlacement as CaptionPlacement,
      dangerTone: args.dangerTone as AlertDialogColor,
    };
    return (
      <SamplePage density={density} site={town} current="設定" width="lg">
        <ToastProvider position={settingsArgs.toastPosition} variant={settingsArgs.toastAppearance}>
          <SettingsScreen args={settingsArgs} />
        </ToastProvider>
      </SamplePage>
    );
  },
};
