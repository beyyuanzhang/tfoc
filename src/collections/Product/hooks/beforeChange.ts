import type { CollectionBeforeChangeHook } from 'payload'
import { stripeProxy } from '@payloadcms/plugin-stripe'

export const beforeProductChange: CollectionBeforeChangeHook = async ({ data, operation }) => {
  // 跳过同步标记，防止无限循环
  if (data.skipSync) {
    return data
  }

  try {
    if (operation === 'create' || (operation === 'update' && data.pricing?.price)) {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('Missing STRIPE_SECRET_KEY environment variable')
      }

      // 使用 stripeProxy 而不是直接调用 Stripe API
      const stripeProduct = await stripeProxy({
        stripeSecretKey: process.env.STRIPE_SECRET_KEY,
        stripeMethod: 'products.create',
        stripeArgs: [
          {
            name: data.title,
            default_price_data: {
              currency: 'usd',
              unit_amount: data.pricing.price * 100,
            },
          },
        ],
      })

      if (stripeProduct.status >= 400) {
        throw new Error(stripeProduct.message)
      }

      // 保存 Stripe 产品和价格 ID
      data.pricing.stripeProductID = stripeProduct.data.id
      data.pricing.stripePriceID = stripeProduct.data.default_price
    }

    return data
  } catch (error) {
    throw new Error(`Error syncing with Stripe: ${error.message}`)
  }
}
