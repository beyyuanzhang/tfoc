import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/anyone'
import { architectAccess, headArchitectAccess } from '@/access/architects'
import { productFields } from './fields'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { revalidateDelete, revalidateProduct } from './hooks/revalidateProduct'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { populateProduct } from './hooks/populateProduct'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'pricing.finalPrice', '_status'],
    group: {
      en: 'Shop',
      zh: '商城',
    },
    description: {
      en: 'Manage all products in the shop',
      zh: '管理商城中的所有产品',
    },
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'products',
          req,
        })
        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'products',
        req,
      }),
  },
  labels: {
    singular: {
      en: 'Product',
      zh: '产品',
    },
    plural: {
      en: 'Products',
      zh: '产品列表',
    },
  },
  access: {
    read: anyone,
    create: ({ req }) => headArchitectAccess({ req }) || architectAccess({ req }),
    update: ({ req }) => headArchitectAccess({ req }) || architectAccess({ req }),
    delete: headArchitectAccess,
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
    },
    maxPerDoc: 50,
  },
  fields: [
    ...productFields,
    {
      type: 'tabs',
      tabs: [
        {
          name: 'meta',
          label: 'SEO',
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
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data }) => {
        if (data.pricing?.finalPrice) {
          data.stripeProductPrice = data.pricing.finalPrice * 100
        }
        return data
      },
    ],
    afterRead: [populateProduct],
    afterChange: [revalidateProduct],
    afterDelete: [revalidateDelete],
  },
}
