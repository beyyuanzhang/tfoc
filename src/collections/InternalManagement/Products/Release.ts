import type { CollectionConfig } from 'payload'
import { calculatePricing } from '@/hooks/calculatePricing'
import {
  generateSubtitle,
  validateMaterialPercentages,
  handleFinalRetailPrice,
} from '@/hooks/releaseManagement'
import { generateSkus } from '@/hooks/generateSkus'
import { headArchitectAccess, architectAccess } from '@/access/architects'
import { anyone } from '@/access/anyone'

const TAG_TYPES = {
  COLOR: 'color',
  SIZE: 'size',
  MATERIAL: 'material',
  ORIGIN: 'origin',
  MEASUREMENT: 'measurement',
} as const

export const Release: CollectionConfig = {
  slug: 'release',
  labels: {
    singular: {
      en: 'Release',
      zh: '发布',
    },
    plural: {
      en: 'Releases',
      zh: '产品发布',
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
    defaultColumns: ['prototype', 'release', 'releaseDate', 'volume', 'status'],
    group: {
      en: 'Internal Management - Products',
      zh: '内部管理 - 产品',
    },
  },
  fields: [
    {
      name: 'prototype',
      type: 'relationship',
      relationTo: 'prototype',
      required: true,
      label: {
        en: 'Prototype',
        zh: '原型',
      },
      admin: {
        description: {
          en: 'Select prototype',
          zh: '选择原型',
        },
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [generateSubtitle],
      },
    },
    {
      name: 'releaseNumber',
      type: 'number',
      required: true,
      admin: {
        readOnly: true,
        description: {
          en: 'Auto-generated release number',
          zh: '自动生成的发布序号',
        },
      },
    },
    {
      name: 'releaseDate',
      type: 'date',
      required: true,
      label: {
        en: 'Release Date',
        zh: '发布日期',
      },
      admin: {
        description: {
          en: 'Select release date',
          zh: '选择发布日期',
        },
      },
    },
    {
      name: 'volume',
      type: 'number',
      required: true,
      min: 0,
      label: {
        en: 'Production Volume',
        zh: '生产数量',
      },
      admin: {
        description: {
          en: 'Enter production quantity',
          zh: '输入生产数量',
        },
        step: 1,
      },
      defaultValue: 0,
    },
    {
      name: 'sizes',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      required: true,
      label: {
        en: 'Sizes',
        zh: '尺码',
      },
      filterOptions: {
        type: {
          equals: TAG_TYPES.SIZE,
        },
      },
      defaultValue: [],
    },
    {
      name: 'colors',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      required: true,
      label: {
        en: 'Colors',
        zh: '颜色',
      },
      filterOptions: {
        type: {
          equals: TAG_TYPES.COLOR,
        },
      },
      defaultValue: [],
    },
    {
      name: 'materials',
      type: 'array',
      label: {
        en: 'Materials',
        zh: '材质',
      },
      fields: [
        {
          name: 'material',
          type: 'relationship',
          relationTo: 'tags',
          label: {
            en: 'Material',
            zh: '材质',
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
          required: true,
          min: 0,
          max: 100,
          label: {
            en: 'Percentage',
            zh: '百分比',
          },
          admin: {
            step: 0.1,
          },
        },
      ],
      hooks: {
        beforeValidate: [validateMaterialPercentages],
      },
    },
    {
      name: 'origin',
      type: 'relationship',
      relationTo: 'tags',
      label: {
        en: 'Origin',
        zh: '产地',
      },
      filterOptions: {
        type: {
          equals: TAG_TYPES.ORIGIN,
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
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
    {
      name: 'finalRetailPrice',
      type: 'number',
      label: {
        en: 'Final Retail Price',
        zh: '最终零售价',
      },
      admin: {
        position: 'sidebar',
        description: {
          en: 'Manually set final retail price. Marketing plans and KPI metrics will be calculated based on this price',
          zh: '手动设置最终零售价。营销计划和KPI指标将基于此价格计算',
        },
      },
      hooks: {
        beforeChange: [handleFinalRetailPrice],
      },
    },
    {
      name: 'discountStatus',
      type: 'select',
      options: [
        {
          label: {
            en: 'Normal Price',
            zh: '原价',
          },
          value: 'normal',
        },
        {
          label: {
            en: 'Discounted',
            zh: '折扣价',
          },
          value: 'discounted',
        },
      ],
      defaultValue: 'normal',
      admin: {
        position: 'sidebar',
        description: {
          en: 'Select whether to enable discount price',
          zh: '选择是否启用折扣价',
        },
      },
    },
    {
      name: 'customDiscountRate',
      type: 'number',
      label: {
        en: 'Custom Discount Rate',
        zh: '自定义折扣率',
      },
      min: 0,
      max: 100,
      defaultValue: 100,
      admin: {
        position: 'sidebar',
        description: {
          en: 'Enter discount rate (e.g., 80 means 20% off)',
          zh: '输入折扣率（例：80 表示 8折）',
        },
        condition: (data) => data.discountStatus === 'discounted',
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
          required: true,
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
              required: true,
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
          required: true,
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
    {
      type: 'tabs',
      tabs: [
        {
          label: {
            en: 'Cost Structure',
            zh: '成本结构',
          },
          fields: [
            {
              name: 'costs',
              type: 'group',
              fields: [
                {
                  type: 'collapsible',
                  label: {
                    en: 'Development Costs',
                    zh: '研发成本',
                  },
                  fields: [
                    {
                      name: 'development',
                      type: 'group',
                      fields: [
                        {
                          name: 'pattern',
                          type: 'number',
                          label: {
                            en: 'Pattern Fee',
                            zh: '版型费',
                          },
                          min: 0,
                          defaultValue: 0,
                        },
                        {
                          name: 'sample',
                          type: 'number',
                          label: {
                            en: 'Sample Fee',
                            zh: '样衣费',
                          },
                          min: 0,
                          defaultValue: 0,
                        },
                        {
                          name: 'design',
                          type: 'number',
                          label: {
                            en: 'Design Fee',
                            zh: '设计费',
                          },
                          min: 0,
                          defaultValue: 0,
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: {
                    en: 'Production Costs',
                    zh: '生产成本',
                  },
                  fields: [
                    {
                      name: 'production',
                      type: 'group',
                      fields: [
                        {
                          name: 'material',
                          type: 'number',
                          label: {
                            en: 'Material Cost',
                            zh: '材料费',
                          },
                          min: 0,
                          defaultValue: 0,
                        },
                        {
                          name: 'labor',
                          type: 'number',
                          label: {
                            en: 'Labor Cost',
                            zh: '人工费',
                          },
                          min: 0,
                          defaultValue: 0,
                        },
                        {
                          name: 'packaging',
                          type: 'number',
                          label: {
                            en: 'Packaging Cost',
                            zh: '包装费',
                          },
                          min: 0,
                          defaultValue: 0,
                        },
                        {
                          name: 'unitCOGS',
                          type: 'number',
                          label: {
                            en: 'Unit COGS',
                            zh: '单件COGS',
                          },
                          admin: { readOnly: true },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: {
            en: 'Pricing Strategy',
            zh: '定价策略',
          },
          fields: [
            {
              name: 'strategy',
              type: 'group',
              fields: [
                {
                  name: 'positioning',
                  type: 'select',
                  label: {
                    en: 'Positioning (Multiplier)',
                    zh: '定位（倍率）',
                  },
                  required: true,
                  defaultValue: '4.5',
                  hasMany: false,
                  admin: {
                    description: {
                      en: 'Suggested retail price = Unit cost × Multiplier',
                      zh: '建议零售价 = 单件成本 × 倍率',
                    },
                  },
                  options: [
                    {
                      label: {
                        en: 'Core-Piece (4.5x)',
                        zh: '轮回核心 (4.5x)',
                      },
                      value: '4.5',
                    },
                    {
                      label: {
                        en: 'Trend-Piece (5x)',
                        zh: '轮回趋势 (5x)',
                      },
                      value: '5',
                    },
                    {
                      label: {
                        en: 'Crystal-Piece (8x)',
                        zh: '结晶 (8x)',
                      },
                      value: '8',
                    },
                    {
                      label: {
                        en: 'Limited Crystal-Piece (15x)',
                        zh: '结晶限定 (15x)',
                      },
                      value: '15',
                    },
                  ],
                },
                {
                  name: 'operationalCosts',
                  type: 'group',
                  fields: [
                    {
                      name: 'logistics',
                      type: 'number',
                      label: {
                        en: 'Logistics Cost',
                        zh: '物流成本',
                      },
                      min: 0,
                      defaultValue: 0,
                    },
                    {
                      name: 'afterSale',
                      type: 'number',
                      label: {
                        en: 'After-sale Cost Rate(%)',
                        zh: '售后成本率(%)',
                      },
                      min: 0,
                      max: 100,
                      defaultValue: 3,
                    },
                    {
                      name: 'commission',
                      type: 'number',
                      label: {
                        en: 'Commission Rate(%)',
                        zh: '佣金率(%)',
                      },
                      min: 0,
                      max: 100,
                      defaultValue: 5,
                    },
                    {
                      name: 'channel',
                      type: 'number',
                      label: {
                        en: 'Channel Fee Rate(%)',
                        zh: '渠道费率(%)',
                      },
                      min: 0,
                      max: 100,
                      defaultValue: 8,
                    },
                    {
                      name: 'tax',
                      type: 'number',
                      label: {
                        en: 'Tax Rate(%)',
                        zh: '税费率(%)',
                      },
                      min: 0,
                      max: 100,
                      defaultValue: 5,
                    },
                    {
                      name: 'totalOperationalCost',
                      type: 'number',
                      label: {
                        en: 'Total Operational Cost',
                        zh: '运营成本总额',
                      },
                      admin: { readOnly: true },
                    },
                  ],
                },
                {
                  name: 'finalPricing',
                  type: 'group',
                  fields: [
                    {
                      name: 'suggestedPrice',
                      type: 'number',
                      label: {
                        en: 'Suggested Retail Price',
                        zh: '建议零售价',
                      },
                      admin: { readOnly: true },
                    },
                    {
                      name: 'discountedPrice',
                      type: 'number',
                      label: {
                        en: 'Discounted Price',
                        zh: '折后价',
                      },
                      admin: { readOnly: true },
                    },
                    {
                      name: 'grossMargin',
                      type: 'number',
                      label: {
                        en: 'Gross Margin(%)',
                        zh: '毛利率(%)',
                      },
                      admin: { readOnly: true },
                    },
                    {
                      name: 'grossProfit',
                      type: 'number',
                      label: {
                        en: 'Gross Profit',
                        zh: '毛利额',
                      },
                      admin: { readOnly: true },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: {
            en: 'KPI Analysis',
            zh: 'KPI分析',
          },
          fields: [
            {
              name: 'kpiAnalysis',
              type: 'group',
              fields: [
                {
                  type: 'collapsible',
                  label: {
                    en: 'Release Overview',
                    zh: 'Release一览',
                  },
                  admin: {
                    description: {
                      en: 'Basic operational metrics overview',
                      zh: '基础经营指标概览',
                    },
                  },
                  fields: [
                    {
                      name: 'releaseOverview',
                      type: 'group',
                      fields: [
                        {
                          name: 'totalDevelopmentCost',
                          type: 'number',
                          label: {
                            en: 'Total Development Cost',
                            zh: '总研发成本',
                          },
                          admin: { readOnly: true },
                        },
                        {
                          name: 'totalCOGS',
                          type: 'number',
                          label: {
                            en: 'Total COGS',
                            zh: '总COGS',
                          },
                          admin: { readOnly: true },
                        },
                        {
                          name: 'totalOperationalCosts',
                          type: 'number',
                          label: {
                            en: 'Total Operational Costs',
                            zh: '总运营成本',
                          },
                          admin: { readOnly: true },
                        },
                        {
                          name: 'totalCost',
                          type: 'number',
                          label: {
                            en: 'Total Cost',
                            zh: '总成本',
                          },
                          admin: { readOnly: true },
                        },
                        {
                          name: 'unitCost',
                          type: 'number',
                          label: {
                            en: 'Unit Cost',
                            zh: '单件成本',
                          },
                          admin: { readOnly: true },
                        },
                        {
                          name: 'releaseVolume',
                          type: 'number',
                          label: {
                            en: 'Release Volume',
                            zh: '发布量',
                          },
                          admin: { readOnly: true },
                        },
                        {
                          name: 'finalPrice',
                          type: 'number',
                          label: {
                            en: 'Final Retail Price',
                            zh: '最终零售价',
                          },
                          admin: { readOnly: true },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: {
                    en: 'Break-even Analysis',
                    zh: '回本分析',
                  },
                  admin: {
                    description: {
                      en: 'Break-even point calculation including marketing costs and return rate',
                      zh: '包含营销成本和退货率的回本点计算',
                    },
                  },
                  fields: [
                    {
                      name: 'breakevenAnalysis',
                      type: 'group',
                      fields: [
                        {
                          name: 'marketingPercentage',
                          type: 'number',
                          label: {
                            en: 'Marketing Investment Rate(%)',
                            zh: '营销投入率(%)',
                          },
                          min: 0,
                          max: 100,
                          defaultValue: 20,
                        },
                        {
                          name: 'returnRate',
                          type: 'number',
                          label: {
                            en: 'Expected Return Rate(%)',
                            zh: '预计退货率(%)',
                          },
                          min: 0,
                          max: 100,
                          defaultValue: 5,
                          admin: {
                            description: {
                              en: 'Expected product return rate, affects actual sales volume and break-even calculation',
                              zh: '预计的商品退货率，影响实际销售量和回本计算',
                            },
                          },
                        },
                        {
                          name: 'marketingCost',
                          type: 'number',
                          label: {
                            en: 'Expected Marketing Cost',
                            zh: '预计营销成本',
                          },
                          admin: { readOnly: true },
                        },
                        {
                          name: 'breakevenUnits',
                          type: 'number',
                          label: {
                            en: 'Break-even Orders Required',
                            zh: '回本所需订单',
                          },
                          admin: {
                            readOnly: true,
                            description: {
                              en: 'Total orders needed considering return rate',
                              zh: '考虑退货率后，需要产生的总订单数',
                            },
                          },
                        },
                        {
                          name: 'actualSoldUnits',
                          type: 'number',
                          label: {
                            en: 'Actual Units Sold',
                            zh: '实际售出数量',
                          },
                          admin: {
                            readOnly: true,
                            description: {
                              en: 'Actual sales units after returns = Orders × (1 - Return Rate)',
                              zh: '扣除退货后的实际销售件数 = 订单数 × (1 - 退货率)',
                            },
                          },
                        },
                        {
                          name: 'cpa',
                          type: 'number',
                          label: {
                            en: 'Customer Acquisition Cost (CPA)',
                            zh: '获客成本(CPA)',
                          },
                          admin: {
                            readOnly: true,
                            description: {
                              en: 'Cost per customer acquisition = Marketing Cost / Actual Sales',
                              zh: '每个成交客户的获取成本 = 营销成本/实际成交量',
                            },
                          },
                        },
                        {
                          name: 'cpo',
                          type: 'number',
                          label: {
                            en: 'Cost per Order (CPO)',
                            zh: '订单成本(CPO)',
                          },
                          admin: {
                            readOnly: true,
                            description: {
                              en: 'Cost per order = Marketing Cost / Total Orders',
                              zh: '每个订单的获取成本 = 营销成本/总订单量',
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: {
                    en: 'Overall Profit Forecast',
                    zh: '整体收益预测',
                  },
                  fields: [
                    {
                      name: 'profitForecast',
                      type: 'group',
                      fields: [
                        {
                          name: 'fullPriceRate',
                          type: 'number',
                          label: {
                            en: 'Full Price Sales Ratio(%)',
                            zh: '原价销售比例(%)',
                          },
                          min: 0,
                          max: 100,
                          defaultValue: 70,
                          admin: {
                            description: {
                              en: 'Expected percentage of products sold at full price (remaining at 30% off)',
                              zh: '预计多少比例的商品按原价销售（剩余部分按7折销售）',
                            },
                          },
                        },
                        {
                          name: 'expectedOrders',
                          type: 'number',
                          label: {
                            en: 'Expected Orders',
                            zh: '预期订单量',
                          },
                          admin: { readOnly: true },
                        },
                        {
                          name: 'expectedActualSales',
                          type: 'number',
                          label: {
                            en: 'Expected Actual Sales',
                            zh: '预期实际销量',
                          },
                          admin: { readOnly: true },
                        },
                        {
                          name: 'expectedTotalRevenue',
                          type: 'number',
                          label: {
                            en: 'Expected Total Order Amount',
                            zh: '预期总订单金额',
                          },
                          admin: { readOnly: true },
                        },
                        {
                          name: 'expectedActualRevenue',
                          type: 'number',
                          label: {
                            en: 'Expected Actual Revenue',
                            zh: '预期实际收入',
                          },
                          admin: { readOnly: true },
                        },
                        {
                          name: 'expectedMarketingCost',
                          type: 'number',
                          label: {
                            en: 'Expected Total Marketing Spend',
                            zh: '预期总营销支出',
                          },
                          admin: { readOnly: true },
                        },
                        {
                          name: 'expectedTotalCost',
                          type: 'number',
                          label: {
                            en: 'Expected Total Cost',
                            zh: '预期总成本',
                          },
                          admin: { readOnly: true },
                        },
                        {
                          name: 'expectedNetProfit',
                          type: 'number',
                          label: {
                            en: 'Expected Net Profit',
                            zh: '预期净利润',
                          },
                          admin: { readOnly: true },
                        },
                        {
                          name: 'expectedNetProfitMargin',
                          type: 'number',
                          label: {
                            en: 'Expected Net Profit Margin(%)',
                            zh: '预期净利润率(%)',
                          },
                          admin: {
                            readOnly: true,
                            description: {
                              en: 'Net Profit / Actual Revenue',
                              zh: '净利润/实际收入',
                            },
                          },
                        },
                        {
                          name: 'expectedROI',
                          type: 'number',
                          label: {
                            en: 'Expected ROI',
                            zh: '预期投资回报率',
                          },
                          admin: {
                            readOnly: true,
                            description: {
                              en: 'Net Profit / Total Cost (1.5 means 150% return)',
                              zh: '净利润/总成本（1.5表示150%回报）',
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
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
    {
      name: 'generateSkus',
      type: 'checkbox',
      label: {
        en: 'Generate SKUs',
        zh: '生成 SKUs',
      },
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: {
          en: 'Check and save to generate SKUs for this Release',
          zh: '勾选并保存以生成该 Release 的所有 SKUs',
        },
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data = {}, req }) => {
        if (!data.releaseNumber) {
          const releases = await req.payload.find({
            collection: 'release',
            where: {
              prototype: {
                equals: data.prototype,
              },
            },
            sort: '-releaseNumber',
            limit: 1,
          })

          data.releaseNumber = releases.docs.length > 0 ? releases.docs[0].releaseNumber + 1 : 1
        }
        return data
      },
    ],
    beforeChange: [calculatePricing],
    afterChange: [generateSkus],
    afterRead: [
      async ({ doc, collection, req }) => {
        return calculatePricing({
          data: doc,
          operation: 'update',
          collection,
          req,
          context: req.context,
        })
      },
    ],
  },
}
