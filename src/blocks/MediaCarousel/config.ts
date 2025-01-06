import { Block } from 'payload'

export const MediaCarouselBlock: Block = {
  slug: 'mediaCarousel',
  interfaceName: 'MediaCarouselBlock',
  labels: {
    singular: {
      en: 'Media Carousel',
      zh: '媒体轮播',
    },
    plural: {
      en: 'Media Carousels',
      zh: '媒体轮播',
    },
  },
  fields: [
    {
      name: 'mediaFolder',
      type: 'relationship',
      relationTo: 'media-folders',
      required: true,
      hasMany: false,
      admin: {
        position: 'sidebar',
      },
      label: {
        en: 'Media Folder',
        zh: '媒体文件夹',
      },
    },
    {
      name: 'display',
      type: 'group',
      label: {
        en: 'Display Settings',
        zh: '显示设置',
      },
      fields: [
        {
          name: 'size',
          type: 'select',
          defaultValue: 'medium',
          options: [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' },
          ],
          required: true,
          admin: {
            width: '50%',
          },
          label: {
            en: 'Size',
            zh: '尺寸',
          },
        },
        {
          name: 'fullscreen',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            width: '50%',
          },
          label: {
            en: 'Full Screen',
            zh: '全屏模式',
          },
        },
        {
          name: 'autoplayInterval',
          type: 'number',
          defaultValue: 5000,
          min: 1000,
          max: 20000,
          required: true,
          admin: {
            width: '50%',
            step: 500,
          },
          label: {
            en: 'Autoplay Interval (ms)',
            zh: '自动播放间隔（毫秒）',
          },
        },
        {
          name: 'displayOrder',
          type: 'select',
          defaultValue: 'sequential',
          options: [
            {
              label: { en: 'Sequential', zh: '顺序' },
              value: 'sequential',
            },
            {
              label: { en: 'Random', zh: '随机' },
              value: 'random',
            },
          ],
          required: true,
          admin: {
            width: '50%',
          },
          label: {
            en: 'Display Order',
            zh: '显示顺序',
          },
        },
      ],
    },
    {
      name: 'textSlides',
      type: 'array',
      label: {
        en: 'Text Slides',
        zh: '文本幻灯片',
      },
      admin: {
        initCollapsed: false,
        description: {
          en: 'Add text slides to be displayed between media items',
          zh: '添加要在媒体项目之间显示的文本幻灯片',
        },
      },
      fields: [
        {
          name: 'content',
          type: 'textarea',
          required: true,
          admin: {
            rows: 3,
          },
          label: {
            en: 'Content',
            zh: '内容',
          },
        },
      ],
    },
  ],
}
