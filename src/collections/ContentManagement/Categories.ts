import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { headArchitectAccess, architectAccess } from '@/access/architects'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: {
      en: 'Category',
      zh: '分类',
    },
    plural: {
      en: 'Categories',
      zh: '分类',
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
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title'],
    group: {
      en: 'Content Management',
      zh: '内容管理',
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
  ],
}
