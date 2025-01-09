import type { CollectionConfig } from 'payload'
import { headArchitectAccess, architectAccess } from '@/access/architects'
import { anyone } from '@/access/anyone'

export const TAG_TYPES = {
  COLOR: 'color',
  SIZE: 'size',
  MATERIAL: 'material',
  ORIGIN: 'origin',
  MEASUREMENT: 'measurement',
} as const

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: {
    singular: {
      en: 'Tag',
      zh: '标签',
    },
    plural: {
      en: 'Tags',
      zh: '标签',
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
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'value'],
    group: {
      en: 'Global',
      zh: '全局',
    },
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'size',
      options: [
        {
          label: {
            en: 'Size',
            zh: '尺码',
          },
          value: 'size',
        },
        {
          label: {
            en: 'Color',
            zh: '颜色',
          },
          value: 'color',
        },
        {
          label: {
            en: 'Material',
            zh: '材质',
          },
          value: 'material',
        },
        {
          label: {
            en: 'Origin',
            zh: '产地',
          },
          value: 'origin',
        },
        {
          label: {
            en: 'Measurement Detail',
            zh: '测量细节',
          },
          value: 'measurement',
        },
      ],
      label: {
        en: 'Tag Type',
        zh: '标签类型',
      },
      admin: {
        position: 'sidebar',
        description: {
          en: 'Select the type of tag',
          zh: '选择标签类型',
        },
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: {
        en: 'Tag Name',
        zh: '标签名称',
      },
      admin: {
        description: {
          en: 'Enter the tag name based on selected type',
          zh: '根据选择的类型输入标签名称',
        },
      },
    },
    {
      name: 'value',
      type: 'text',
      required: false,
      label: {
        en: 'Color Code',
        zh: '颜色代码',
      },
      admin: {
        description: {
          en: 'Enter hexadecimal color code (e.g., #FF0000)',
          zh: '输入十六进制颜色代码（例如：#FF0000）',
        },
        condition: (data) => data?.type === 'color',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (data?.type === 'color') {
              if (!value) {
                throw new Error('Color code is required for color tags')
              }
              if (!/^#[0-9A-F]{6}$/i.test(value)) {
                throw new Error('Invalid color code format. Use hexadecimal (e.g., #FF0000)')
              }
            }
            return value
          },
        ],
        beforeChange: [
          ({ value, data }) => {
            if (!value) return value
            return data?.type === 'color' ? value.toUpperCase() : value
          },
        ],
      },
    },
  ],
}
