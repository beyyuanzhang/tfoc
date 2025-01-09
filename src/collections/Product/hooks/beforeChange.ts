import type { CollectionBeforeChangeHook } from 'payload'
import { stripeProxy } from '@payloadcms/plugin-stripe'

export const beforeProductChange: CollectionBeforeChangeHook = async ({ data, operation }) => {
  // 如果不是已发布状态，跳过 Stripe 同步
  if (data?.status !== 'published') return data

  try {
    // 验证必要数据
    if (!data?.title) {
      throw new Error('产品标题是必需的')
    }

    const pricing = data?.pricing || {}
    const finalPrice = pricing?.finalPrice || 0

    if (finalPrice <= 0) {
      throw new Error('产品价格必须大于0')
    }

    // 创建或更新 Stripe 产品
    const stripeData = {
      name: data.title,
      description: data.description || '',
      metadata: {
        productId: data.id,
        environment: process.env.NODE_ENV || 'development',
        version: '1.0',
        lastUpdated: new Date().toISOString(),
      },
      ...((!pricing.stripeProductID || operation === 'create') && {
        default_price_data: {
          currency: pricing.currency || 'CNY',
          unit_amount: finalPrice * 100,
          metadata: {
            productId: data.id,
            environment: process.env.NODE_ENV || 'development',
            version: '1.0',
            type: 'default_price',
          },
        },
      }),
    }

    const { data: stripeProduct } = await stripeProxy({
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
      stripeMethod: pricing.stripeProductID ? 'products.update' : 'products.create',
      stripeArgs: pricing.stripeProductID ? [pricing.stripeProductID, stripeData] : [stripeData],
    })

    // 更新价格（如果需要）
    if (pricing.stripeProductID && finalPrice !== pricing.finalPrice) {
      const { data: stripePrice } = await stripeProxy({
        stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
        stripeMethod: 'prices.create',
        stripeArgs: [
          {
            product: pricing.stripeProductID,
            currency: pricing.currency || 'CNY',
            unit_amount: finalPrice * 100,
            metadata: {
              productId: data.id,
              environment: process.env.NODE_ENV || 'development',
              version: '1.0',
              type: 'price_update',
              lastUpdated: new Date().toISOString(),
            },
          },
        ],
      })

      return {
        ...data,
        pricing: {
          ...pricing,
          stripePriceID: stripePrice.id,
        },
      }
    }

    return {
      ...data,
      pricing: {
        ...pricing,
        stripeProductID: stripeProduct.id,
        stripePriceID: stripeProduct.default_price || pricing.stripePriceID,
      },
    }
  } catch (error) {
    console.error('Stripe 同步失败:', error)
    throw error
  }
}
