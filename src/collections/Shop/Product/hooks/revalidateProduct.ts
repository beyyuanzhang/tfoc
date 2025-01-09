import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import type { Product } from '@/payload-types'
import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateProduct: CollectionAfterChangeHook<Product> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/products/${doc.slug}`
      payload.logger.info(`重新验证产品页面: ${path}`)
      revalidatePath(path)
      revalidateTag('products-sitemap')
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = `/products/${previousDoc.slug}`
      payload.logger.info(`重新验证旧产品页面: ${oldPath}`)
      revalidatePath(oldPath)
      revalidateTag('products-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Product> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = `/products/${doc?.slug}`
    revalidatePath(path)
    revalidateTag('products-sitemap')
  }
  return doc
}
