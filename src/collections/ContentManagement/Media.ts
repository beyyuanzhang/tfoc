import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { headArchitectAccess, architectAccess } from '@/access/architects'
import { anyone } from '@/access/anyone'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const MediaFolders: CollectionConfig = {
  slug: 'media-folders' as const,
  labels: {
    singular: {
      en: 'Media Folder',
      zh: '媒体文件夹',
    },
    plural: {
      en: 'Media Folders',
      zh: '媒体文件夹',
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
    group: {
      en: 'Content Management',
      zh: '内容管理',
    },
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: {
        en: 'Folder Name',
        zh: '文件夹名称',
      },
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: {
        en: 'Folder Slug',
        zh: '文件夹标识',
      },
      required: true,
      admin: {
        description: {
          en: 'Unique identifier for system use (e.g. general, carousel)',
          zh: '用于系统识别的唯一标识例如(general, carousel)',
        },
      },
    },
  ],
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: {
      en: 'Media',
      zh: '媒体',
    },
    plural: {
      en: 'Media',
      zh: '媒体',
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
  fields: [
    {
      name: 'folder',
      type: 'relationship',
      relationTo: 'media-folders',
      hasMany: false,
      required: true,
      label: {
        en: 'Folder',
        zh: '所属文件夹',
      },
      admin: {
        position: 'sidebar',
        description: {
          en: 'Select folder for this file',
          zh: '选择文件所属文件夹',
        },
      },
      hooks: {
        beforeChange: [
          ({ value }) => {
            return value
          },
        ],
      },
    },
    {
      name: 'alt',
      type: 'text',
      label: {
        en: 'Alt Text',
        zh: '替代文本',
      },
    },
    {
      name: 'caption',
      type: 'richText',
      label: {
        en: 'Caption',
        zh: '说明文字',
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
  admin: {
    group: {
      en: 'Content Management',
      zh: '内容管理',
    },
    defaultColumns: ['filename', 'folder', 'alt', 'updatedAt'],
    useAsTitle: 'filename',
  },
}
