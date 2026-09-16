/// <reference types="vite/client" />

// 開発時の警告（link-parts の warnOnce）が読む process.env.NODE_ENV の型
// 部品はブラウザ向けなので node の型（@types/node）は読み込まず、使う分だけ宣言する
// node の型が一緒に読み込まれたときも重なるよう、node と同じ名前（NodeJS.Process・var process）で宣言する
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: string;
  }
  interface Process {
    env: ProcessEnv;
  }
}
declare var process: NodeJS.Process;
