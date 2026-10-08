import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';

import { AlertDialog } from '../components/alert-dialog/AlertDialog';
import { Avatar } from '../components/avatar/Avatar';
import { Button } from '../components/button/Button';
import { Checkbox } from '../components/checkbox/Checkbox';
import { CheckboxGroup } from '../components/checkbox/CheckboxGroup';
import { Combobox } from '../components/combobox/Combobox';
import { Dropzone } from '../components/dropzone/Dropzone';
import { Fieldset } from '../components/fieldset/Fieldset';
import { Heading } from '../components/heading/Heading';
import { MaskField } from '../components/mask-field/MaskField';
import { Meter } from '../components/meter/Meter';
import { Notice } from '../components/notice/Notice';
import { PasswordField } from '../components/password-field/PasswordField';
import { PinField } from '../components/pin-field/PinField';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '../components/segmented-control/SegmentedControl';
import { Select } from '../components/select/Select';
import { Slider } from '../components/slider/Slider';
import { Stack } from '../components/stack/Stack';
import { Switch } from '../components/switch/Switch';
import { TableOfContents } from '../components/table-of-contents/TableOfContents';
import { Text } from '../components/text/Text';
import { Textarea } from '../components/textarea/Textarea';
import { TextField } from '../components/text-field/TextField';
import { TimePicker } from '../components/time-picker/TimePicker';
import { ToastProvider, useToast } from '../components/toast/Toast';
import { Temporal } from '../index';
import { SamplePage, densityOf } from './SamplePage';

// 設定の画面: 1 枚の縦に長いページ。節ごとに保存し（Toast で知らせる）、左の目次で節へ飛ぶ
// 取り消せない操作（アカウントの削除）は確認のダイアログを挟む

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

function ProfileSection() {
  return (
    <Section id="profile" title="プロフィール" lead="ほかの人に表示される情報です。">
      <Stack direction="horizontal" gap="md" align="center">
        <Avatar name="かずえもん" size="lg" />
        <div className="min-w-0 flex-1">
          <Dropzone
            label="プロフィール画像"
            caption="JPEG・PNG、5MB まで"
            accept="image/png,image/jpeg"
            maxSize={5 * 1000 * 1000}
          />
        </div>
      </Stack>
      <TextField label="表示名" defaultValue="かずえもん" />
      <TextField
        label="ユーザー名"
        prefix="@"
        defaultValue="kazuemon"
        caption="半角英数字で入力します"
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

function NotificationSection() {
  return (
    <Section id="notification" title="通知">
      <Stack gap="sm">
        <Switch label="メールで受け取る" caption="週に 1 回、まとめて届きます" defaultChecked />
        <Switch label="プッシュ通知" />
      </Stack>
      <CheckboxGroup
        label="受け取る通知"
        caption="1 つ以上選んでください"
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

function DisplaySection() {
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

function SecuritySection() {
  const [twoFactor, setTwoFactor] = useState(false);
  return (
    <Section id="security" title="セキュリティ">
      <TextField
        label="メールアドレス"
        type="email"
        defaultValue="kazuemon@example.com"
        caption="変えると、新しいアドレスに確認のメールが届きます"
      />
      <Fieldset label="パスワードを変える">
        <Stack gap="md">
          <PasswordField label="いまのパスワード" autoComplete="current-password" />
          <PasswordField
            label="新しいパスワード"
            caption="8 文字以上"
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
            />
          )}
        </Stack>
      </Fieldset>
      <SaveBar />
    </Section>
  );
}

function DataSection() {
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
            title="アカウントを削除しますか？"
            description="投稿・フォロー・設定がすべて消えます。この操作は元に戻せません。"
            actionLabel="削除する"
            onAction={() => {
              setDeleted(true);
              toast.show({ status: 'danger', title: 'アカウントを削除しました', timeout: 4000 });
            }}
            trigger={<Button color="danger">アカウントを削除する</Button>}
          />
        </div>
      )}
    </Section>
  );
}

function SettingsScreen() {
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
        <ProfileSection />
        <NotificationSection />
        <DisplaySection />
        <SecuritySection />
        <DataSection />
      </Stack>
    </div>
  );
}

const meta = {
  title: 'Overview/見本',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '設定の画面の見本です。1 枚のページに節を並べ、左の目次で節へ飛びます。節ごとに保存するとトーストで知らせ、アカウントの削除は確認のダイアログを挟みます。',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Settings: Story = {
  name: '設定',
  render: (_args, { globals }) => (
    <SamplePage density={densityOf(globals)} width="lg">
      <ToastProvider>
        <SettingsScreen />
      </ToastProvider>
    </SamplePage>
  ),
};
