'use client'

import React from 'react'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import type { Product as ProductType } from '@/payload-types'
import { ImageStack } from '../components/ImageStack'
import { ProductMenu } from '../components/product-menu'

type Props = {
  product: Partial<ProductType>
}

export const Product: React.FC<Props> = ({ product }) => {
  const { setHeaderTheme } = useHeaderTheme()
  const [selectedColor, setSelectedColor] = React.useState<string>()

  React.useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])

  return (
    <article className="flex flex-col md:flex-row min-h-screen w-full">
      {/* 左侧图片区域 - 可以自由滚动 */}
      <div className="w-full md:w-1/2">
        <ImageStack colorMedia={product.details?.colorMedia || []} selectedColor={selectedColor} />
      </div>

      {/* 右侧内容区域 - 保持sticky直到左侧滚动完 */}
      <div className="w-full md:w-1/2">
        <div className="sticky top-0 p-4 lg:p-8 max-h-screen overflow-y-auto">
          <ProductMenu
            product={product as ProductType}
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
          />
        </div>
      </div>
    </article>
  )
}
