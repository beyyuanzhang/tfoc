import type { Field } from 'payload'

export const productFields: Field[] = [
  {
    name: 'title',
    type: 'text',
    required: true,
  },
  {
    name: 'release', // 关联发布批次
    type: 'relationship',
    relationTo: 'release',
    required: true,
    admin: {
      description: '选择产品发布批次',
    },
    hooks: {
      afterRead: [
        async ({ value, data, req }) => {
          if (!value || !data) return value

          const release = await req.payload.findByID({
            collection: 'release',
            id: value,
          })

          if (release) {
            // 同步 release 信息到产品
            data.releaseNumber = release.releaseNumber
            data.color = release.colors?.[0] || ''
            data.size = release.sizes?.[0] || ''
            data.origin = release.origin || ''
            data.pricing = {
              ...data.pricing,
              price: release.finalRetailPrice,
            }
          }

          return value
        },
      ],
    },
  },
  {
    type: 'group',
    name: 'pricing',
    fields: [
      {
        name: 'price',
        type: 'number',
        required: true,
        admin: {
          readOnly: true, // 价格从 release 继承
        },
      },
    ],
  },
  {
    type: 'group',
    name: 'content',
    fields: [
      {
        name: 'description',
        type: 'richText',
      },
      {
        name: 'media',
        type: 'array',
        fields: [
          {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
          },
        ],
      },
    ],
  },
  {
    name: 'categories',
    type: 'relationship',
    relationTo: 'categories',
    hasMany: true,
  },
  // Release 继承字段
  {
    name: 'releaseNumber',
    type: 'text',
    admin: {
      position: 'sidebar',
      readOnly: true,
    },
  },
  {
    name: 'color',
    type: 'text',
    admin: {
      position: 'sidebar',
      readOnly: true,
    },
  },
  {
    name: 'size',
    type: 'text',
    admin: {
      position: 'sidebar',
      readOnly: true,
    },
  },
  {
    name: 'origin',
    type: 'text',
    admin: {
      position: 'sidebar',
      readOnly: true,
    },
  },
  {
    name: 'status',
    type: 'select',
    options: [
      { label: '草稿', value: 'draft' },
      { label: '已发布', value: 'published' },
      { label: '已下架', value: 'archived' },
    ],
    defaultValue: 'draft',
    admin: {
      position: 'sidebar',
    },
  },
  {
    name: 'slug',
    type: 'text',
    admin: {
      position: 'sidebar',
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (!value && data?.title) {
            return data.title.toLowerCase().replace(/\s+/g, '-')
          }
          return value
        },
      ],
    },
  },
]
