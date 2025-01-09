'use client'

import React from 'react'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import type { Product as ProductType } from '@/payload-types'
import { ImageStack } from '../components/ImageStack'

type Props = {
  product: Partial<ProductType>
}

export const Product: React.FC<Props> = ({ product }) => {
  const { setHeaderTheme } = useHeaderTheme()

  React.useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])

  // 直接在组件中打印
  console.log('Product:', {
    details: product.details,
    colorMedia: product.details?.colorMedia,
    firstColorMedia: product.details?.colorMedia?.[0],
  })

  // 打印类型定义
  type ColorMediaType = NonNullable<NonNullable<typeof product.details>['colorMedia']>[number]
  const typeExample: ColorMediaType = {} as ColorMediaType
  console.log('Type Example:', typeExample)

  return (
    <article className="min-h-screen flex flex-col">
      {/* 图片区域居中 */}
      <div className="flex-1 flex items-center justify-center py-16">
        <ImageStack colorMedia={product.details?.colorMedia || []} />
      </div>

      {/* 产品信息放在底部 */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-medium mb-4">{product.title}</h1>
          {/* TODO: 其他产品信息组件 */}
        </div>
      </div>
    </article>
  )
}
