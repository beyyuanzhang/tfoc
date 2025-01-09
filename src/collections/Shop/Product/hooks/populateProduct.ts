import type { CollectionAfterReadHook } from 'payload'

export const populateProduct: CollectionAfterReadHook = async ({ doc }) => {
  // 基础字段
  if (!doc.title) doc.title = ''
  if (!doc.slug) doc.slug = ''
  if (!doc._status) doc._status = 'draft'

  // pricing 字段
  if (!doc.pricing) {
    doc.pricing = {
      suggestedPrice: 0,
      basePrice: 0,
      discountStatus: 'normal',
      discountRate: 100,
      finalPrice: 0,
      regionalPrices: [],
    }
  }

  // productInfo 字段
  if (!doc.productInfo) {
    doc.productInfo = {
      sizes: [],
      colors: [],
      materials: [],
      origin: null,
    }
  }

  // details 字段
  if (!doc.details) {
    doc.details = {
      productCare: null,
      colorMedia: [],
      measurements: [],
    }
  }

  // skus 字段
  if (!doc.skus) {
    doc.skus = {
      docs: [],
      totalDocs: 0,
      hasNextPage: false,
      hasPrevPage: false,
      nextPage: null,
      prevPage: null,
      pagingCounter: 0,
      totalPages: 0,
      page: 1,
      limit: 10,
    }
  }

  return doc
}
