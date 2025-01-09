import { generateSerials } from '@/hooks/generateSerials'
import { CollectionConfig } from 'payload'
import { headArchitectAccess, architectAccess } from '@/access/architects'
import { anyone } from '@/access/anyone'
import { STATUS } from './SerialNumbers'

const AVAILABLE_STATUSES = [STATUS.CREATED, STATUS.IN_WAREHOUSE, STATUS.IN_STORE] as const

export type SKU = {
  id: string
  sku: string
  quantity: number
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
    defaultColumns: ['sku', 'release', 'color', 'size', 'quantity', 'stockStatus'],
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
    {
      name: 'stockStatus',
      type: 'select',
      options: [
        { label: '有货', value: 'in_stock' },
        { label: '无货', value: 'out_of_stock' },
      ],
      label: {
        en: 'Stock Status',
        zh: '库存状态',
      },
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    afterChange: [generateSerials],
    afterRead: [
      async ({ doc, req, context }) => {
        if (context?.skipStockCheck || !doc?.id) return doc

        try {
          const serials = await req.payload.find({
            collection: 'serial-numbers',
            where: {
              sku: {
                equals: doc.id,
              },
              status: {
                in: AVAILABLE_STATUSES,
              },
            },
            depth: 0,
            context: {
              skipStockCheck: true,
            },
          })

          doc.stockStatus = serials.totalDocs > 0 ? 'in_stock' : 'out_of_stock'
          return doc
        } catch (error) {
          console.error('Failed to check stock status:', error)
          doc.stockStatus = 'out_of_stock'
          return doc
        }
      },
    ],
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
