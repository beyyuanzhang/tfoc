import { generateSerials } from '@/hooks/generateSerials'
import { CollectionConfig } from 'payload'
import { headArchitectAccess, architectAccess } from '@/access/architects'
import { anyone } from '@/access/anyone'

export type SKU = {
  id: string
  sku: string
  hasSerials: boolean
  generateSerials: boolean
  quantity: number
  // ... 其他必要字段
}

export const SKU: CollectionConfig = {
  slug: 'skus',
  labels: {
    singular: {
      en: 'SKU',
      zh: 'SKU',
    },
    plural: {
      en: 'SKUs',
      zh: 'SKU列表',
    },
  },
  admin: {
    useAsTitle: 'sku',
    defaultColumns: ['sku', 'release', 'prototype', 'color', 'size', 'quantity'],
    group: {
      en: 'Internal Management - Products',
      zh: '内部管理 - 产品',
    },
  },
  fields: [
    {
      name: 'sku',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
      label: {
        en: 'SKU',
        zh: 'SKU',
      },
    },
    {
      name: 'release',
      type: 'relationship',
      relationTo: 'release',
      required: true,
      admin: {
        readOnly: true,
      },
      label: {
        en: 'Release',
        zh: '发布',
      },
    },
    {
      name: 'color',
      type: 'relationship',
      relationTo: 'tags',
      required: true,
      admin: {
        readOnly: true,
      },
      label: {
        en: 'Color',
        zh: '颜色',
      },
    },
    {
      name: 'size',
      type: 'relationship',
      relationTo: 'tags',
      required: true,
      admin: {
        readOnly: true,
      },
      label: {
        en: 'Size',
        zh: '尺寸',
      },
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
      label: {
        en: 'Quantity',
        zh: '数量',
      },
    },
    {
      name: 'serials',
      type: 'join',
      collection: 'serial-numbers',
      on: 'sku',
      admin: {
        description: {
          en: 'All Serial Numbers for this SKU',
          zh: '该 SKU 所有序列号',
        },
      },
    },
  ],
  hooks: {
    afterChange: [generateSerials],
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
}
