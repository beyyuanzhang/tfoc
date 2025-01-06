import type { CollectionConfig } from 'payload'

export const Residents: CollectionConfig = {
  slug: 'residents',
  labels: {
    singular: {
      en: 'Resident',
      zh: '居民',
    },
    plural: {
      en: 'Residents',
      zh: '居民',
    },
  },
  auth: true, // 启用身份验证
  admin: {
    useAsTitle: 'email', // 使用邮箱作为标题
    group: {
      en: 'Role',
      zh: '角色',
    },
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      label: {
        en: 'Email',
        zh: '邮箱',
      },
      admin: {
        description: {
          en: 'Enter your email address',
          zh: '输入您的邮箱地址',
        },
      },
    },
    {
      name: 'name',
      type: 'text',
      label: {
        en: 'Name',
        zh: '姓名',
      },
      required: false,
      validate: (val: string | string[] | null | undefined) => {
        if (val && typeof val !== 'string') return 'Name must be a string'
        return true
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: {
        en: 'Phone',
        zh: '手机号',
      },
      required: false,
      unique: true,
      validate: (val: string | string[] | null | undefined) => {
        if (val && typeof val !== 'string') return 'Phone must be a string'
        return true
      },
    },
    {
      name: 'archived',
      type: 'checkbox',
      label: {
        en: 'Archived',
        zh: '已归档',
      },
      defaultValue: false,
      admin: {
        description: {
          en: 'Mark this user as archived',
          zh: '将此用户标记为已归档',
        },
      },
    },
  ],
  access: {
    read: () => true, // 允许所有人读取
    create: () => true, // 允许所有人创建
    update: ({ req }) => !!req.user, // 仅允许用户更新自己的数据
    delete: ({ req }) => {
      if (req.user?.collection === 'users') {
        const architectUser = req.user as { roles?: string }
        return architectUser.roles === 'head-architects' || architectUser.roles === 'architects'
      }
      return false // 其他集合的用户不允许删除
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // 确保新用户默认字段
        if (operation === 'create') {
          if (!data.name) data.name = 'Anonymous'
        }
        return data
      },
    ],
    afterChange: [
      async ({ operation, doc, req }) => {
        const action = operation === 'create' ? '创建' : operation === 'update' ? '更新' : '归档'
        console.log(`用户 ${req.user?.email} ${action}了账号 ${doc.email}`)
        // 这里可以将记录保存到数据库或日志系统
      },
    ],
    beforeLogin: [
      async ({ user }) => {
        if (user.archived) {
          throw new Error(
            'Account is temporarily suspended. Please contact TFOC support for assistance.',
          )
        }
        return user
      },
    ],
  },
}
