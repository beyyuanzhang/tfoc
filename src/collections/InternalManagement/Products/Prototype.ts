import type { CollectionConfig } from 'payload'
import { headArchitectAccess, architectAccess } from '@/access/architects'
import { anyone } from '@/access/anyone'

export const Prototype: CollectionConfig = {
  slug: 'prototype',
  labels: {
    singular: {
      en: 'Prototype',
      zh: '产品原型',
    },
    plural: {
      en: 'Prototypes',
      zh: '产品原型',
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
    useAsTitle: 'subtitle',
    defaultColumns: ['code', 'name', 'status'],
    group: {
      en: 'Internal Management - Products',
      zh: '内部管理 - 产品',
    },
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      label: {
        en: 'Product Code',
        zh: '产品代码',
      },
      admin: {
        description: 'Format: C-X (e.g., C-1, C-123)',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (value && !/^C-\d+$/.test(value)) {
              throw new Error('Product code must be in format C-X (e.g., C-1, C-123)')
            }
            return value
          },
        ],
        beforeChange: [
          async ({ value, req }) => {
            if (value) return value
            const payload = req.payload
            const existingProducts = await payload.find({
              collection: 'prototype' as const,
              sort: '-code',
              limit: 1,
            })
            let nextNumber = 1
            if (existingProducts?.docs?.length > 0) {
              const lastCode = existingProducts.docs[0]?.code
              const lastNumber = parseInt(lastCode?.split('-')[1] || '0')
              nextNumber = lastNumber + 1
            }
            return `C-${nextNumber}`
          },
        ],
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: {
        en: 'Product Name',
        zh: '产品名称',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      label: {
        en: 'Subtitle',
        zh: '副标题',
      },
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [({ data }) => `[${data?.code || ''}] ${data?.name || ''}`],
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: {
        en: 'Slug',
        zh: '别名',
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      hooks: {
        beforeChange: [({ data }) => data?.code?.toLowerCase() || ''],
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: {
        en: 'Description',
        zh: '描述',
      },
    },
    {
      name: 'pattern',
      type: 'upload',
      label: {
        en: 'Pattern File',
        zh: '版型文件',
      },
      relationTo: 'media',
      admin: {
        description: 'Upload pattern file (optional)',
      },
    },
    {
      name: 'media',
      type: 'array',
      label: {
        en: 'Media',
        zh: '媒体',
      },
      fields: [
        {
          name: 'file',
          type: 'upload',
          label: {
            en: 'File',
            zh: '文件',
          },
          relationTo: 'media',
          required: true,
        },
      ],
      admin: {
        description: 'Add prototype images',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: {
        en: 'Status',
        zh: '状态',
      },
      options: [
        {
          label: {
            en: 'Draft',
            zh: '草稿',
          },
          value: 'draft',
        },
        {
          label: {
            en: 'Published',
            zh: '已发布',
          },
          value: 'published',
        },
        {
          label: {
            en: 'Archived',
            zh: '已归档',
          },
          value: 'archived',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
