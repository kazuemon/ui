import { addons } from 'storybook/preview-api';
import { afterEach, expect } from 'vitest';
import { page } from 'vitest/browser';

// 見た目の回帰（visual regression）— .storybook/visual-testing.md
// tags: ['visual'] の付いたストーリーを、play が終わったあとの姿で撮り、基準の画像とくらべる。
// 基準は <ストーリーのある場所>/__screenshots__/ に置く。作り直しは `pnpm test -u`

// @storybook/addon-vitest は、テストの context に組み立てたストーリーと ID を入れる
// （dist/vitest-plugin/test-utils.js）。型は公開していないので、読むところだけここで足す
declare module 'vitest' {
  interface TestContext {
    story?: { tags: string[] };
  }
  interface TaskMeta {
    storyId?: string;
  }
}

// 動きを止めてから撮る。動きを減らす設定にしても、回る円は3秒で1周し、流れる線は明滅し続ける（design/adr/0042）。
// 動きそのものは回帰テストの対象にせず、動く前の形でくらべる
const freezeMotion = `*, *::before, *::after {
  animation: none !important;
  transition: none !important;
}`;

afterEach(async ({ story, task }) => {
  if (!story?.tags.includes('visual')) return;

  // 状態を固定するアドオン（storybook-addon-pseudo-states）は、Storybook が出す「描き終わった」の
  // 合図でスタイルシートを :hover から .pseudo-hover へ書き換える。Vitest ではその合図が出ないので、
  // ここで出す。合図の名前は storybook/internal/core-events の STORY_RENDERED と同じ文字
  addons.getChannel().emit('storyRendered');
  await new Promise((resolve) => setTimeout(resolve, 0));

  const style = document.createElement('style');
  style.textContent = freezeMotion;
  document.head.append(style);
  try {
    // 和文フォントが届く前に撮ると、文字の幅が変わって差分になる
    await document.fonts.ready;
    // 撮るのは body 全体。Select の選択肢とシートは body の直下に出るので、#storybook-root では写らない
    // 基準画像は <ストーリーのある場所>/__screenshots__/<テストファイル名>/<ストーリーID> に置かれる。
    // この「テストファイル名」のディレクトリは Button.stories.tsx のような名前になるので、
    // Storybook の stories の指定がディレクトリまで拾わないようにしてある（.storybook/main.ts）
    await expect
      .element(page.elementLocator(document.body))
      .toMatchScreenshot(task.meta.storyId ?? task.name);
  } finally {
    style.remove();
  }
});
