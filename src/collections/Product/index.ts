import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/anyone'
import { architectAccess, headArchitectAccess } from '@/access/architects'
import { productFields } from './fields'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'pricing.finalPrice', '_status'],
    group: 'Shop',
  },
  access: {
    read: anyone,
    create: ({ req }) => headArchitectAccess({ req }) || architectAccess({ req }),
    update: ({ req }) => headArchitectAccess({ req }) || architectAccess({ req }),
    delete: headArchitectAccess,
  },
  versions: {
    drafts: true,
  },
  fields: productFields,
  hooks: {
    beforeChange: [
      async ({ data }) => {
        if (data.pricing?.finalPrice) {
          data.stripeProductPrice = data.pricing.finalPrice * 100
        }
        return data
      },
    ],
  },
}
