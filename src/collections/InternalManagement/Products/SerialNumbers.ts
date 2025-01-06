import type { CollectionConfig } from 'payload'
import { createHash } from 'crypto'
import { headArchitectAccess, architectAccess } from '@/access/architects'
import { anyone } from '@/access/anyone'

// 状态枚举
export const STATUS = {
  // 库存状态
  CREATED: 'created',
  IN_WAREHOUSE: 'in_warehouse',
  IN_TRANSIT: 'in_transit',
  IN_STORE: 'in_store',

  // 销售状态
  RESERVED: 'reserved',
  SOLD: 'sold',
  ACTIVATED: 'activated',

  // 退换状态
  RETURN_REQUESTED: 'return_requested',
  RETURN_IN_TRANSIT: 'return_in_transit',
  RETURN_RECEIVED: 'return_received',

  // 闭环状态
  REPAIRING: 'repairing',
  REPAIRED: 'repaired',
  RECYCLING: 'recycling',
  SCRAPPED: 'scrapped',
} as const

export const SerialNumbers: CollectionConfig = {
  slug: 'serial-numbers',
  labels: {
    singular: {
      en: 'Serial Number',
      zh: '序列号',
    },
    plural: {
      en: 'Serial Numbers',
      zh: '序列号',
    },
  },
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'status'],
    group: {
      en: 'Internal Management - Products',
      zh: '内部管理 - 产品',
    },
  },
  access: {
    create: () => false,
    delete: () => false,
    read: anyone,
    update: ({ req }) => {
      return headArchitectAccess({ req }) || architectAccess({ req })
    },
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      label: {
        en: 'Serial Number',
        zh: '序列号',
      },
      admin: {
        readOnly: true,
        description: 'Auto-generated serial number',
      },
      access: {
        update: () => false, // 禁止修改
      },
    },
    {
      name: 'sku',
      type: 'relationship',
      required: true,
      relationTo: 'skus',
      admin: {
        readOnly: true,
      },
      access: {
        update: () => false, // 禁止修改
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: STATUS.CREATED,
      options: Object.values(STATUS).map((value) => ({
        label: {
          en: value.replace(/_/g, ' ').toLowerCase(),
          zh: value, // 需要添加中文翻译
        },
        value,
      })),
    },
    {
      name: 'statusHistory',
      type: 'array',
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          options: Object.values(STATUS).map((value) => ({
            label: value,
            value,
          })),
        },
        {
          name: 'timestamp',
          type: 'date',
          required: true,
        },
        {
          name: 'operator',
          type: 'text',
        },
        {
          name: 'note',
          type: 'textarea',
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        // 验证不可修改字段
        if (operation === 'update') {
          const allowedFields = ['status', 'statusNote']
          const attemptedChanges = Object.keys(data)

          const hasInvalidChanges = attemptedChanges.some((field) => !allowedFields.includes(field))

          if (hasInvalidChanges) {
            throw new Error('只能修改状态相关字段')
          }
        }

        // 生成序列号
        if (operation === 'create') {
          const payload = req.payload
          const sku = await payload.findByID({
            collection: 'skus',
            id: data.sku,
          })

          if (!sku) {
            throw new Error('Invalid SKU')
          }

          const existingCount = await payload.find({
            collection: 'serial-numbers',
            where: {
              sku: {
                equals: data.sku,
              },
            },
          })

          const index = existingCount.totalDocs + 1
          const timestamp = Date.now()
          const hashInput = `${sku.sku}-${index}-${timestamp}`
          const hash = createHash('md5').update(hashInput).digest('hex').slice(0, 4)

          data.code = `${sku.sku}-${index.toString().padStart(3, '0')}-${hash}`
          data.status = STATUS.CREATED
        }

        // 记录状态变更
        if (operation === 'update' && data.status !== originalDoc.status) {
          if (!req.user) {
            throw new Error('需要用户信息来更改状态')
          }

          const history = originalDoc.statusHistory || []
          history.push({
            status: data.status,
            timestamp: new Date(),
            operator: req.user.email,
            note: data.statusNote || '状态更新',
          })
          data.statusHistory = history
        }

        return data
      },
    ],
  },
}
