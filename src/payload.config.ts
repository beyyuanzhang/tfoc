import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import sharp from 'sharp'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { en } from '@payloadcms/translations/languages/en'
import { zh } from '@payloadcms/translations/languages/zh'
import { stripePlugin } from '@payloadcms/plugin-stripe'

import { Categories } from '@/collections/ContentManagement/Categories'
import { Media, MediaFolders } from '@/collections/ContentManagement/Media'
import { Pages } from '@/collections/ContentManagement/Pages'
import { Users } from '@/collections/Roles/Architects'
import { Prototype } from '@/collections/InternalManagement/Products/Prototype'
import { Tags } from '@/collections/Tags'
import { Release } from '@/collections/InternalManagement/Products/Release'
import { Residents } from '@/collections/Roles/Residents/Residents'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { SKU } from '@/collections/InternalManagement/Products/SKU'
import { Posts } from '@/collections/ContentManagement/Posts'
import { Nav } from './nav/config'
import { SerialNumbers } from '@/collections/InternalManagement/Products/SerialNumbers'
import { Products } from '@/collections/Product/index'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      graphics: {
        Icon: '/components/icons/Shape-Logo.tsx#Logo',
        Logo: '/components/icons/LinearLogo.tsx#Logo',
      },
    },
    meta: {
      description: 'TFOC Management System',
      icons: [
        {
          type: 'image/x-icon',
          rel: 'icon',
          url: '/favicon.ico',
        },
      ],
      openGraph: {
        description: 'TFOC Management System',
        images: [
          {
            height: 1000,
            url: '/favicon.ico',
            width: 1000,
          },
        ],
        title: 'TFOC Admin',
      },
      titleSuffix: '- TFOC',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  collections: [
    Pages,
    Media,
    Categories,
    Users,
    Prototype,
    Tags,
    Release,
    Residents,
    MediaFolders,
    SKU,
    Posts,
    SerialNumbers,
    Products,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Nav],
  plugins: [
    stripePlugin({
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
      stripeWebhooksEndpointSecret: process.env.STRIPE_WEBHOOKS_ENDPOINT_SECRET as string,
      sync: [
        {
          collection: 'products',
          stripeResourceType: 'products',
          stripeResourceTypeSingular: 'product',
          fields: [
            {
              fieldPath: 'title',
              stripeProperty: 'name',
            },
            {
              fieldPath: 'description',
              stripeProperty: 'description',
            },
            {
              fieldPath: 'pricing.finalPrice',
              stripeProperty: 'default_price',
            },
          ],
        },
      ],
    }),
    nestedDocsPlugin({
      collections: ['pages'],
    }),
    formBuilderPlugin({
      fields: {
        text: true,
        textarea: true,
        select: true,
        email: true,
        state: true,
        country: true,
        checkbox: true,
        number: true,
        message: true,
        payment: true,
      },
      formOverrides: {
        slug: 'custom-forms',
      },
      formSubmissionOverrides: {
        slug: 'custom-submissions',
      },
    }),
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.R2_BUCKET_NAME || '',
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        endpoint: process.env.R2_ENDPOINT,
        region: process.env.R2_REGION || 'us-east-1',
        forcePathStyle: true,
      },
    }),
    ...plugins,
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  i18n: {
    supportedLanguages: {
      en,
      zh,
    },
    fallbackLanguage: 'zh',
  },
})
