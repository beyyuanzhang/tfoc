import type { CollectionConfig } from 'payload'
import type { User } from '@/payload-types'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: {
      en: 'Architect',
      zh: '建筑师',
    },
    plural: {
      en: 'Architects',
      zh: '建筑师',
    },
  },
  access: {
    admin: ({ req: { user } }) => {
      const currentUser = user as User
      return !!currentUser
    },
    create: ({ req: { user } }) => {
      const currentUser = user as User
      return currentUser?.roles === 'head-architect'
    },
    delete: ({ req: { user }, id }) => {
      const currentUser = user as User
      return currentUser?.roles === 'head-architect' || currentUser?.id === id
    },
    read: ({ req: { user }, id }) => {
      const currentUser = user as User
      return currentUser?.roles === 'head-architect' || currentUser?.id === id
    },
    update: ({ req: { user }, id }) => {
      const currentUser = user as User
      return currentUser?.roles === 'head-architect' || currentUser?.id === id
    },
  },
  admin: {
    defaultColumns: ['name', 'email', 'roles'],
    useAsTitle: 'name',
    group: {
      en: 'Role',
      zh: '角色',
    },
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: {
        en: 'Name',
        zh: '姓名',
      },
    },
    {
      name: 'roles',
      type: 'select',
      label: {
        en: 'Role',
        zh: '角色',
      },
      admin: {
        condition: (data, { user }) => {
          const currentUser = user as User
          return currentUser?.roles === 'head-architect'
        },
      },
      options: [
        { label: { en: 'Architect', zh: '建筑师' }, value: 'architect' },
        { label: { en: 'Head Architect', zh: '首席建筑师' }, value: 'head-architect' },
      ],
      required: true,
      defaultValue: 'architect',
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && data.roles === 'head-architect') {
          const currentUser = req.user as User
          if (currentUser?.roles !== 'head-architect') {
            throw new Error('只有首席建筑师可以创建首席建筑师')
          }
        }
        return data
      },
    ],
  },
}
