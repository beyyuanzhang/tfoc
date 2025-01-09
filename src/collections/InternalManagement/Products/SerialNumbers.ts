import type { CollectionConfig } from 'payload'
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
    create: () => false, // 通过 SKU 创建
    delete: () => false, // 禁止删除
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
          zh: value,
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
        // 系统操作检查
        if (req.context?.skipGenerateSerials) return data

        // 验证不可修改字段
        if (operation === 'update') {
          const allowedFields = ['status', 'statusNote', 'statusHistory']
          const systemFields = ['updatedAt', 'createdAt']

          // 只检查非系统字段的变更
          const attemptedChanges = Object.keys(data).filter(
            (field) => !systemFields.includes(field) && data[field] !== originalDoc[field], // 只检查实际变更
          )

          const hasInvalidChanges = attemptedChanges.some((field) => !allowedFields.includes(field))

          if (hasInvalidChanges) {
            console.log('Invalid fields:', attemptedChanges)
            throw new Error('只能修改状态相关字段')
          }

          // 记录状态变更
          if (data.status !== originalDoc.status) {
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
        }

        return data
      },
    ],
  },
}
