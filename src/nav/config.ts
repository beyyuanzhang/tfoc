import type { GlobalConfig } from 'payload'
import { revalidateNav } from './hooks/revalidateNav'

export const Nav: GlobalConfig = {
  slug: 'nav',
  label: {
    en: 'Navigation',
    zh: '导航'
  },
  access: {
    read: () => true,
  },
  admin: {
    group: {
      en: 'System',
      zh: '系统'
    },
    description: '全局导航配置',
  },
  fields: [
    {
      name: 'appearance',
      type: 'group',
      fields: [
        {
          name: 'backgroundColor',
          type: 'text',
          defaultValue: '#000000',
          validate: (val: string) => {
            if (!/^#[0-9A-F]{6}$/i.test(val)) {
              return '请输入有效的十六进制颜色代码'
            }
            return true
          },
          admin: {
            description: '导航栏背景颜色（十六进制格式）',
          },
        },
        {
          name: 'textColor',
          type: 'text',
          defaultValue: '#f5f5f5',
          admin: {
            description: '文字颜色（十六进制格式）',
          },
        },
        {
          name: 'hoverLineColor',
          type: 'text',
          defaultValue: '#f5f5f5',
          admin: {
            description: '悬停线条颜色（十六进制格式）',
          },
        },
      ],
    },
    {
      name: 'logo',
      type: 'group',
      fields: [
        {
          name: 'url',
          type: 'text',
          defaultValue: '/',
          admin: {
            description: 'Logo 链接地址',
          },
        },
      ],
    },
    {
      name: 'leftNavItems',
      type: 'array',
      label: '左侧导航项',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
        {
          name: 'className',
          type: 'text',
          admin: {
            description: '可选的自定义 CSS 类名',
          },
        },
      ],
    },
    {
      name: 'portalRows',
      type: 'array',
      label: '门户菜单行',
      fields: [
        {
          name: 'items',
          type: 'array',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'href',
              type: 'text',
              required: true,
            },
            {
              name: 'className',
              type: 'text',
              admin: {
                description: '可选的自定义 CSS 类名',
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateNav],
  },
}