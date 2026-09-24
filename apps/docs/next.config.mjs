/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静的に書き出す（out/）。Cloudflare Pages の独自ドメイン（ui.k6n.jp）で、常にドメイン直下に出すので basePath は要らない
  output: 'export',
  // workspace の中の @kazuemon/ui は、ビルド前のソース（.ts・.tsx）を読む（package.json の exports）ので、Next に変換させる
  transpilePackages: ['@kazuemon/ui'],
  images: { unoptimized: true },
  // next dev が apps/docs に AGENTS.md・CLAUDE.md を書き出すのを止める（手引きはリポジトリ直下の 1 本にする）
  agentRules: false,
};

export default nextConfig;
