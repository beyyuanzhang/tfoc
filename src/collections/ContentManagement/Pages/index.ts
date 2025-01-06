import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { headArchitectAccess, architectAccess } from '@/access/architects'
import { Archive } from '@/blocks/ArchiveBlock/config'
import { Content } from '@/blocks/Content/config'
import { FormBlock } from '@/blocks/Form/config'
import { MediaCarouselBlock } from '@/blocks/MediaCarousel/config'
import { slugField } from '@/fields/slug'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'
import { CallToAction } from '@/blocks/CallToAction/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  labels: {
    singular: {
      en: 'Page',
      zh: '页面',
    },
    plural: {
      en: 'Pages',
      zh: '页面',
    },
  },
  access: {
    create: ({ req }) => {
      return headArchitectAccess({ req }) || architectAccess({ req })
    },
    delete: ({ req }) => {
      return headArchitectAccess({ req })
    },
    read: anyone,
    update: ({ req }) => {
      return headArchitectAccess({ req }) || architectAccess({ req })
    },
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: {
      en: 'Content Management',
      zh: '内容管理',
    },
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'pages',
          req,
        })

        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: {
        en: 'Title',
        zh: '标题',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [Content, Archive, FormBlock, MediaCarouselBlock, CallToAction, MediaBlock],
              required: true,
              admin: {
                initCollapsed: true,
              },
              label: {
                en: 'Layout',
                zh: '布局',
              },
            },
          ],
          label: {
            en: 'Content',
            zh: '内容',
          },
        },
        {
          name: 'meta',
          label: {
            en: 'SEO',
            zh: '搜索引擎优化',
          },
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
      label: {
        en: 'Published At',
        zh: '发布时间',
      },
    },
    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    beforeDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
    },
    maxPerDoc: 50,
  },
}
