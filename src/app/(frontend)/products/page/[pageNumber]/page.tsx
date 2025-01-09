import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

type Props = {
  params: Promise<{ pageNumber: string }>
}

export default async function Page({ params }: Props) {
  const { pageNumber } = await params
  const page = parseInt(pageNumber)
  
  if (isNaN(page) || page < 1) {
    notFound()
  }

  const payload = await getPayload({ config: configPromise })

  const products = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 12,
    page: Number(page),
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      pricing: {
        finalPrice: true,
      },
      meta: true,
    },
  })

  if (!products.docs || !products.docs.length) {
    return notFound()
  }

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>商城</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="products"
          currentPage={products.page}
          limit={12}
          totalDocs={products.totalDocs}
        />
      </div>

      <CollectionArchive posts={products.docs} />

      <div className="container">
        {products.totalPages > 1 && products.page && (
          <Pagination page={products.page} totalPages={products.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  const products = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 1,
  })

  if (products.totalPages <= 1) return []

  const pages: { pageNumber: string }[] = []
  for (let i = 2; i <= Math.min(products.totalPages, 10); i++) {
    pages.push({ pageNumber: i.toString() })
  }

  return pages
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pageNumber } = await params
  return {
    title: `商城 - 第 ${pageNumber} 页`,
  }
}
