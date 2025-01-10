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

  return (
    <article className="min-h-screen">
      <ImageStack colorMedia={product.details?.colorMedia || []} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-medium mb-4">{product.title}</h1>
        </div>
      </div>
    </article>
  )
}
