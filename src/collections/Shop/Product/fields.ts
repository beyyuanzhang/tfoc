import { TAG_TYPES } from '@/collections/Tags'
import type { Field } from 'payload'

export const productFields: Field[] = [
  {
    name: 'title',
    type: 'text',
    required: true,
    label: {
      en: 'Product Title',
      zh: '产品名称',
    },
  },
  {
    name: 'release',
    type: 'relationship',
    relationTo: 'release',
    required: true,
    label: {
      en: 'Release',
      zh: '发布批次',
    },
    admin: {
      description: {
        en: 'Select product release batch',
        zh: '选择产品发布批次',
      },
    },
    filterOptions: async ({ req }) => {
      // 1. 获取所有已经被关联的 release IDs
      const existingProducts = await req.payload.find({
        collection: 'products',
        depth: 0,
        limit: 1000,
      })

      const usedReleaseIds = existingProducts.docs.map((product) => product.release).filter(Boolean)

      // 2. 排除这些 release
      return {
        id: {
          not_in: usedReleaseIds,
        },
      }
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
            // 只同步建议售价
            data.pricing = {
              ...data.pricing,
              suggestedPrice: release.finalRetailPrice,
            }

            // 同步产品信息
            data.productInfo = {
              ...data.productInfo,
              sizes: release.sizes,
              colors: release.colors,
              materials: release.materials, // 这样就能正确同步材料及其百分比
              origin: release.origin,
            }
          }

          return value
        },
      ],
    },
  },

  // 产品描述
  {
    name: 'description',
    type: 'text',
    label: {
      zh: '产品描述',
      en: 'Product Description',
    },
    admin: {
      description: {
        zh: '详细的产品描述信息',
        en: 'Detailed product description',
      },
    },
  },

  // 价格管理
  {
    name: 'pricing',
    type: 'group',
    label: {
      en: 'Pricing',
      zh: '价格管理',
    },
    admin: {
      description: {
        en: 'Manage product pricing',
        zh: '管理产品价格信息',
      },
    },
    fields: [
      // 1. 建议售价 (从 release 同步)
      {
        name: 'suggestedPrice',
        type: 'number',
        admin: {
          readOnly: true,
          description: {
            zh: '建议零售价（元）',
            en: 'Suggested Retail Price (CNY)',
          },
        },
      },

      // 2. 基础售价
      {
        name: 'basePrice',
        type: 'number',
        required: true,
        admin: {
          description: {
            zh: '实际基础售价（元）',
            en: 'Actual Base Price (CNY)',
          },
          step: 0.01,
        },
      },

      // 3. 折扣设置
      {
        name: 'discountStatus',
        type: 'select',
        options: [
          { label: '原价', value: 'normal' },
          { label: '折扣价', value: 'discounted' },
        ],
        defaultValue: 'normal',
      },
      {
        name: 'discountRate',
        type: 'number',
        min: 0,
        max: 100,
        defaultValue: 100,
        admin: {
          description: '输入折扣率（例：80 表示 8折）',
          condition: (data) => data?.pricing?.discountStatus === 'discounted',
          step: 1,
        },
      },

      // 4. 最终价格（自动计算）
      {
        name: 'finalPrice',
        type: 'number',
        admin: {
          readOnly: true,
          description: {
            zh: '最终售价（元）',
            en: 'Final Price (CNY)',
          },
        },
        hooks: {
          beforeChange: [
            ({ siblingData }) => {
              const basePrice = siblingData.basePrice || 0
              const isDiscounted = siblingData.discountStatus === 'discounted'
              const discountRate = siblingData.discountRate || 100

              return isDiscounted
                ? Number((basePrice * (discountRate / 100)).toFixed(2))
                : Number(basePrice.toFixed(2))
            },
          ],
        },
      },

      // 5. 多币种价格（自动计算）
      {
        name: 'regionalPrices',
        type: 'array',
        admin: {
          readOnly: true,
          description: {
            zh: '区域价格（自动计算）',
            en: 'Regional Prices (Auto-calculated)',
          },
        },
        fields: [
          {
            name: 'currency',
            type: 'select',
            options: [
              { label: '人民币 (CNY)', value: 'CNY' },
              { label: '欧元 (EUR)', value: 'EUR' },
              { label: '美元 (USD)', value: 'USD' },
            ],
          },
          {
            name: 'amount',
            type: 'number',
            admin: { readOnly: true },
          },
          {
            name: 'formatted',
            type: 'text',
            admin: { readOnly: true },
          },
        ],
        hooks: {
          beforeChange: [
            ({ siblingData }) => {
              const finalPrice = siblingData.finalPrice || 0

              // 汇率和加价配置
              const rates = {
                CNY: { rate: 1, markup: 1, symbol: '¥' },
                EUR: { rate: 1 / 8, markup: 0.8, symbol: '€' },
                USD: { rate: 1 / 7, markup: 0.9, symbol: '$' },
              }

              // 计算各区域价格
              return Object.entries(rates).map(([currency, config]) => {
                const rawAmount = finalPrice * config.rate * config.markup
                const roundedAmount = Number(rawAmount.toFixed(2))

                return {
                  currency,
                  amount: roundedAmount,
                  formatted: `${config.symbol}${roundedAmount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`,
                }
              })
            },
          ],
        },
      },
    ],
  },

  // 产品信息
  {
    name: 'productInfo',
    type: 'group',
    label: {
      en: 'Product Information',
      zh: '产品信息',
    },
    admin: {
      description: {
        en: 'Basic product information',
        zh: '基本产品信息',
      },
    },
    fields: [
      {
        name: 'sizes',
        type: 'relationship',
        relationTo: 'tags',
        hasMany: true,
        admin: { readOnly: true },
        label: {
          en: 'Sizes',
          zh: '尺码',
        },
      },
      {
        name: 'colors',
        type: 'relationship',
        relationTo: 'tags',
        hasMany: true,
        admin: { readOnly: true },
        label: {
          en: 'Colors',
          zh: '颜色',
        },
      },
      {
        name: 'materials',
        type: 'array',
        label: {
          en: 'Materials',
          zh: '材料',
        },
        fields: [
          {
            name: 'material',
            type: 'relationship',
            relationTo: 'tags',
            required: true,
            admin: { readOnly: true },
            label: {
              en: 'Material',
              zh: '材料',
            },
            filterOptions: {
              type: {
                equals: TAG_TYPES.MATERIAL,
              },
            },
          },
          {
            name: 'percentage',
            type: 'number',
            min: 0,
            max: 100,
            required: true,
            admin: { readOnly: true },
            label: {
              en: 'Percentage',
              zh: '百分比',
            },
          },
        ],
      },
      {
        name: 'origin',
        type: 'relationship',
        relationTo: 'tags',
        admin: { readOnly: true },
        label: {
          en: 'Origin',
          zh: '产地',
        },
      },
    ],
  },

  // 详细信息
  {
    name: 'details',
    type: 'group',
    fields: [
      {
        name: 'productCare',
        type: 'richText',
        admin: {
          description: {
            en: 'Product care instructions',
            zh: '产品护理说明',
          },
        },
      },
      {
        name: 'colorMedia',
        type: 'array',
        label: {
          en: 'Media File Per Color',
          zh: '每个颜色对应的媒体文件',
        },
        admin: {
          description: {
            en: 'Upload media for each color',
            zh: '上传每个颜色的媒体文件',
          },
        },
        fields: [
          {
            name: 'color',
            type: 'relationship',
            relationTo: 'tags',
            required: false,
            label: {
              en: 'Color',
              zh: '颜色',
            },
            filterOptions: {
              type: {
                equals: TAG_TYPES.COLOR,
              },
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
                relationTo: 'media',
                required: false,
                label: {
                  en: 'File',
                  zh: '文件',
                },
              },
            ],
          },
        ],
      },
      {
        name: 'measurements',
        type: 'array',
        label: {
          en: 'Size Measurements',
          zh: '尺码测量',
        },
        admin: {
          description: {
            en: 'Add measurements for each size',
            zh: '添加每个尺码的测量数据',
          },
        },
        fields: [
          {
            name: 'size',
            type: 'relationship',
            relationTo: 'tags',
            required: false,
            label: {
              en: 'Size',
              zh: '尺码',
            },
            filterOptions: {
              type: {
                equals: TAG_TYPES.SIZE,
              },
            },
          },
          {
            name: 'values',
            type: 'array',
            label: {
              en: 'Measurement Values',
              zh: '测量值',
            },
            fields: [
              {
                name: 'measurement',
                type: 'relationship',
                relationTo: 'tags',
                required: true,
                label: {
                  en: 'Measurement',
                  zh: '测量项',
                },
                filterOptions: {
                  type: {
                    equals: TAG_TYPES.MEASUREMENT,
                  },
                },
              },
              {
                name: 'value',
                type: 'number',
                required: true,
                min: 0,
                label: {
                  en: 'Value',
                  zh: '数值',
                },
                admin: {
                  step: 0.1,
                },
              },
            ],
          },
        ],
      },
    ],
  },

  // 库存信息
  {
    name: 'skus',
    type: 'join',
    collection: 'skus',
    on: 'release',
    admin: {
      description: {
        en: 'All SKUs for this Release',
        zh: '该 Release 所有 SKUs',
      },
    },
  },

  // 状态管理
  {
    name: 'status',
    type: 'select',
    options: [
      {
        label: { en: 'Draft', zh: '草稿' },
        value: 'draft',
      },
      {
        label: { en: 'Published', zh: '已发布' },
        value: 'published',
      },
      {
        label: { en: 'Archived', zh: '已下架' },
        value: 'archived',
      },
    ],
    defaultValue: 'draft',
    admin: {
      position: 'sidebar',
      description: {
        en: 'Product status',
        zh: '产品状态',
      },
    },
    label: {
      en: 'Status',
      zh: '状态',
    },
  },

  // URL Slug
  {
    name: 'slug',
    type: 'text',
    admin: {
      position: 'sidebar',
      description: {
        en: 'URL friendly version of the product name',
        zh: 'URL 友好的产品名称',
      },
    },
    label: {
      en: 'URL Slug',
      zh: 'URL 别名',
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
