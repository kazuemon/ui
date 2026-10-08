'use client';

import {
  AspectRatio,
  Button,
  Card,
  CardBody,
  CardImage,
  CardTitle,
  Carousel,
  Chip,
  Grid,
  Heading,
  Image,
  Masonry,
  Stack,
  Tag,
  Text,
  Thumbnails,
  Time,
  Toggle,
  ToggleGroup,
  Video,
} from '@kazuemon/ui';
import { useState } from 'react';

import { screenshot } from './images';
import { SamplePage } from './sample-page';
import type { Site } from './sites';
import type { Density, Example } from './types';
import { type WorkCategory, activities, categories, featured, works } from './works-data';
import { processVideo } from './works-video';

// 作品集（ポートフォリオ）: 注目の作品を Carousel で見せ、制作の様子（動画・プロトタイプ）、
// 分野で絞り込める作品の一覧（Masonry のカード）、ほかの活動（Grid のカード）を 1 ページに並べる

/** 個人の作品集 */
const studio: Site = {
  name: 'Kazue Works',
  nav: [
    { label: '作品', href: '#works' },
    { label: 'ブログ', href: '#blog' },
    { label: 'プロフィール', href: '#about' },
  ],
};

const labelOf = (value: WorkCategory) =>
  categories.find((category) => category.value === value)?.label ?? value;

function Featured() {
  return (
    <Carousel
      accessibleName="注目の作品"
      controlsPosition="overlay"
      thumbnails={
        <Thumbnails>
          {featured.map((slide) => (
            <img key={slide.title} src={slide.src} alt={slide.title} />
          ))}
        </Thumbnails>
      }
    >
      {featured.map((slide) => (
        <Image key={slide.title} ratio={16 / 9} src={slide.src} alt={slide.title} />
      ))}
    </Carousel>
  );
}

function Process() {
  return (
    <Grid columns={{ base: 1, md: 2 }} gap="lg">
      <Stack gap="sm">
        <Video src={processVideo} ratio={16 / 9} fit="cover" caption="制作の様子" />
      </Stack>
      <Stack gap="sm">
        {/* プロトタイプの画面は比を決めた枠に収め、中身の縦横比が違っても欠けないように contain で置く */}
        <AspectRatio
          ratio={16 / 9}
          fit="contain"
          className="bg-bg-subtle rounded-card border border-line"
        >
          <img src={screenshot} alt="プロトタイプの画面" />
        </AspectRatio>
        <Text size="sm" variant="subtle">
          プロトタイプの画面
        </Text>
      </Stack>
    </Grid>
  );
}

function WorkList() {
  const [selected, setSelected] = useState<string[]>([]);
  const shown =
    selected.length === 0 ? works : works.filter((work) => selected.includes(work.category));
  return (
    <Stack gap="md">
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup
          aria-label="分野"
          multiple
          value={selected}
          onValueChange={setSelected}
          variant="soft"
          color="primary"
        >
          {categories.map((category) => (
            <Toggle key={category.value} value={category.value}>
              {category.label}
            </Toggle>
          ))}
        </ToggleGroup>
      </div>
      {selected.length > 0 && (
        // 効いている絞り込み。× で 1 つずつ外せる
        <div className="flex flex-wrap items-center gap-2">
          <Text as="span" size="sm" variant="subtle">
            絞り込み:
          </Text>
          {selected.map((value) => (
            <Chip
              key={value}
              removeName={`${labelOf(value as WorkCategory)} の絞り込みを外す`}
              onRemove={() => setSelected((current) => current.filter((item) => item !== value))}
            >
              {labelOf(value as WorkCategory)}
            </Chip>
          ))}
          <Button variant="underline" size="sm" onClick={() => setSelected([])}>
            すべて外す
          </Button>
        </div>
      )}
      <Text size="sm" variant="subtle" aria-live="polite">
        {shown.length} 件の作品
      </Text>
      <Masonry minColumnWidth={220}>
        {shown.map((work) => (
          <Card key={work.slug} href={`#works/${work.slug}`}>
            <CardImage
              src={work.src}
              alt=""
              ratio={work.width / work.height}
              width={work.width}
              height={work.height}
            />
            <CardBody>
              <Text size="sm" variant="subtle">
                <Time dateTime={work.date} /> ・ {labelOf(work.category)}
              </Text>
              <CardTitle>{work.title}</CardTitle>
              <div className="flex flex-wrap gap-1.5">
                {work.tags.map((tag) => (
                  <Tag key={tag} size="sm">
                    {tag}
                  </Tag>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </Masonry>
    </Stack>
  );
}

function Activities() {
  return (
    <Grid minColumnWidth={200}>
      {activities.map((activity) => (
        <Card key={activity.title} href="#activities" size="sm">
          <CardImage src={activity.src} alt="" ratio={4 / 3} width={400} height={300} />
          <CardBody>
            <Text size="sm" variant="subtle">
              {activity.kind} ・ <Time dateTime={activity.date} />
            </Text>
            <CardTitle>{activity.title}</CardTitle>
          </CardBody>
        </Card>
      ))}
    </Grid>
  );
}

function WorksScreen() {
  return (
    <Stack gap="xl">
      <Stack gap="sm">
        <Heading level={1} size="2xl">
          作品
        </Heading>
        <Text variant="muted">
          Web とアプリの制作、写真、イラストをまとめています。気になる作品は押すと詳しく見られます。
        </Text>
      </Stack>
      <section className="flex flex-col gap-4">
        <Heading level={2} size="lg">
          注目の作品
        </Heading>
        <Featured />
      </section>
      <section className="flex flex-col gap-4">
        <Heading level={2} size="lg">
          制作の様子
        </Heading>
        <Process />
      </section>
      <section className="flex flex-col gap-4">
        <Heading level={2} size="lg">
          すべての作品
        </Heading>
        <WorkList />
      </section>
      <section className="flex flex-col gap-4">
        <Heading level={2} size="lg">
          ほかの活動
        </Heading>
        <Activities />
      </section>
    </Stack>
  );
}

export const example: Example = {
  slug: 'works',
  title: '作品集',
  description: '注目の作品・制作の様子・分野で絞り込める作品の一覧を並べた、個人の作品集',
  controls: [],
  defaults: {},
  Screen: ({ density }: { density: Density }) => (
    <SamplePage density={density} site={studio} current="作品" width="lg">
      <WorksScreen />
    </SamplePage>
  ),
};
