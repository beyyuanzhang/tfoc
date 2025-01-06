import type { CollectionAfterChangeHook } from 'payload'
import { STATUS } from '../collections/InternalManagement/Products/SerialNumbers'

export const generateSerials: CollectionAfterChangeHook = async ({ doc, req, context }) => {
  if (context?.skipGenerateSerials) return doc

  try {
    console.time('生成序列号总用时')
    const quantity = doc.quantity

    if (quantity <= 0) {
      throw new Error('数量必须大于0')
    }

    // 并行创建序列号
    const createPromises = Array.from({ length: quantity }, (_, i) =>
      req.payload.create({
        collection: 'serial-numbers',
        data: {
          sku: doc.id,
          status: STATUS.CREATED,
          code: `SN-${doc.id}-${i + 1}`,
        },
        overrideAccess: true,
        req,
        context: {
          skipGenerateSerials: true,
        },
      }),
    )

    // 等待所有序列号创建完成
    await Promise.all(createPromises)

    // 更新 SKU 状态
    await req.payload.update({
      collection: 'skus',
      id: doc.id,
      data: {
        quantity: quantity,
      },
      overrideAccess: true,
      req,
      context: {
        skipGenerateSerials: true,
      },
    })

    console.timeEnd('生成序列号总用时')
    return doc
  } catch (error) {
    console.error('Failed to generate serials:', error)
    throw error
  }
}
