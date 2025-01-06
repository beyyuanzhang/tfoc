import type { CollectionAfterChangeHook } from 'payload'

export const generateSkus: CollectionAfterChangeHook = async ({ doc, req, context }) => {
  if (context?.skipGenerateSkus) return doc

  try {
    const timerLabel = `生成 SKU 总用时-${Date.now()}`
    console.time(timerLabel)

    // 获取数据
    const [prototype, colors, sizes] = await Promise.all([
      req.payload.findByID({
        collection: 'prototype',
        id: doc.prototype,
        overrideAccess: true,
        req, // 关键
      }),
      req.payload.find({
        collection: 'tags',
        where: { id: { in: doc.colors || [] } },
        overrideAccess: true,
        req, // 关键
      }),
      req.payload.find({
        collection: 'tags',
        where: { id: { in: doc.sizes || [] } },
        overrideAccess: true,
        req, // 关键
      }),
    ])

    // 生成 SKU 数据
    const validColors = colors.docs.filter((color) => color.value)
    const skuData = validColors.flatMap((color) =>
      sizes.docs.map((size) => ({
        sku: `TFOC-${prototype.code}-${color.value?.replace('#', '')}-${size.name}-R${doc.releaseNumber}`,
        release: doc.id,
        prototype: doc.prototype,
        releaseNumber: doc.releaseNumber,
        color: color.id,
        size: size.id,
        quantity: 0,
      })),
    )

    // 并行创建 SKU
    const createPromises = skuData.map((sku) =>
      req.payload.create({
        collection: 'skus',
        data: sku,
        overrideAccess: true,
        req, // 关键
        context: {
          skipGenerateSkus: true,
          skipGenerateSerials: true,
        },
      }),
    )

    // 等待所有 SKU 创建完成
    await Promise.all(createPromises)

    console.timeEnd(timerLabel)
    return doc
  } catch (error) {
    console.error('Failed to generate SKUs:', error)
    return doc
  }
}
