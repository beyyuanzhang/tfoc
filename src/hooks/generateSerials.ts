import type { CollectionAfterChangeHook } from 'payload'
import { STATUS } from '../collections/InternalManagement/Products/SerialNumbers'
import { createHash } from 'crypto'

export const generateSerials: CollectionAfterChangeHook = async ({ doc, req, context }) => {
  if (context?.skipGenerateSerials) return doc

  try {
    console.time('生成序列号总用时')
    const quantity = doc.quantity

    if (quantity <= 0) {
      throw new Error('数量必须大于0')
    }

    // 获取现有序列号数量
    const existingCount = await req.payload.find({
      collection: 'serial-numbers',
      where: {
        sku: {
          equals: doc.id,
        },
      },
    })

    // 并行创建序列号
    const createPromises = Array.from({ length: quantity }, async (_, i) => {
      const index = existingCount.totalDocs + i + 1
      const timestamp = Date.now()
      const hashInput = `${doc.code}-${index}-${timestamp}`
      const hash = createHash('md5').update(hashInput).digest('hex').slice(0, 4)
      const code = `${doc.code}-${index.toString().padStart(3, '0')}-${hash}`

      return req.payload.create({
        collection: 'serial-numbers',
        data: {
          sku: doc.id,
          status: STATUS.CREATED,
          code,
          statusHistory: [
            {
              status: STATUS.CREATED,
              timestamp: new Date().toISOString(),
              operator: req.user?.email || 'system',
              note: '序列号创建',
            },
          ],
        },
        overrideAccess: true,
        req,
        context: {
          skipGenerateSerials: true,
        },
      })
    })

    // 等待所有序列号创建完成
    await Promise.all(createPromises)
    console.timeEnd('生成序列号总用时')
    return doc
  } catch (error) {
    console.error('Failed to generate serials:', error)
    throw error
  }
}
