import type { FieldHook } from 'payload'

// Field Hooks
export const generateSubtitle: FieldHook = async ({ siblingData, req }) => {
  if (!siblingData?.prototype) return ''
  try {
    const prototype = await req.payload.findByID({
      collection: 'prototype',
      id: siblingData.prototype,
    })
    return `[${prototype.code}] ${prototype.name} - ${siblingData?.release || ''}`
  } catch (error) {
    console.error('Generate subtitle error:', error)
    return ''
  }
}

export const validateMaterialPercentages: FieldHook = async ({ value }) => {
  if (!value?.length) return value
  const total = value.reduce((sum, item) => sum + (item.percentage || 0), 0)
  if (Math.abs(total - 100) > 0.01) {
    throw new Error('Material percentages must sum to 100%')
  }
  return value
}

export const handleFinalRetailPrice: FieldHook = ({ value, siblingData }) => {
  if (value !== undefined) return value
  return siblingData?.strategy?.finalPricing?.suggestedPrice || 0
}
