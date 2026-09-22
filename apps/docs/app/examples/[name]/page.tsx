// 見本のページ 1 枚。画面は examples/ にあり、切替は右下のボタンから開く
import type { Metadata } from 'next';

import { ExampleFrame } from '../../../examples/example-frame';
import { examples } from '../../../examples/manifest';

export function generateStaticParams() {
  return examples.map(({ slug }) => ({ name: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const example = examples.find((item) => item.slug === name);
  return {
    title: `${example?.title ?? '見本'} | @kazuemon/ui`,
    description: example?.description,
  };
}

export default async function ExamplePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return <ExampleFrame slug={name} />;
}
