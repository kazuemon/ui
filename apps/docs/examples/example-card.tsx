// 見本のページへのカード。題・どういう画面か・そこで見られる代表的な部品（Tag）を並べる。その画面をいちばんよく表す部品（highlights）は先頭に置き、色を付ける
import { Card, CardBody, Heading, type HeadingLevel, Tag, Text } from '@kazuemon/ui';
import NextLink from 'next/link';

import type { ExampleSummary } from './manifest';

export function ExampleCard({
  example: { slug, title, description, highlights, components },
  headingLevel = 2,
}: {
  example: ExampleSummary;
  /** カードの題の見出しの段。置く場所の見出しの 1 つ下にする */
  headingLevel?: HeadingLevel;
}) {
  return (
    <Card render={<NextLink href={`/examples/${slug}`} />}>
      <CardBody className="flex flex-col gap-2">
        <Heading level={headingLevel} size="md">
          {title}
        </Heading>
        <Text size="sm" variant="muted">
          {description}
        </Text>
        <div className="mt-auto flex flex-wrap gap-1 pt-1">
          {highlights.map((name) => (
            <Tag key={name} color="primary">
              {name}
            </Tag>
          ))}
          {components.map((name) => (
            <Tag key={name}>{name}</Tag>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
