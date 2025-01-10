'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Product } from '@/payload-types'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { variants } from '@/app/(frontend)/lib/motion/variants'
import { formatPrice } from '@/utilities/formatPrice'
import { cn } from '@/utilities/cn'
import RichText from '@/components/RichText'

// 定义视觉系统常量
const VISUAL_SYSTEM = {
  desktop: {
    rowHeight: '3.5vh',
    maxWidth: '100vw',
    gap: '3.5vh',
    padding: '3.5vh',
  },
  mobile: {
    height: '100vh',
    padding: '3.5vw',
  },
} as const

// 定义通用的标签类型
type TagType = {
  id: string
  title?: string
  value?: string
}

interface ProductMenuProps {
  product: Product
  selectedColor?: string
  onColorChange?: (colorId: string) => void
}

export const ProductMenu: React.FC<ProductMenuProps> = ({
  product,
  selectedColor,
  onColorChange,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>()
  const isDiscounted = product.pricing?.discountStatus === 'discounted'

  // 统一的关系字段处理函数
  const normalizeTag = (tag: any): TagType => {
    if (typeof tag === 'object' && tag !== null) {
      return tag as TagType
    }
    return { id: String(tag), title: String(tag) }
  }

  // 处理所有标签数据
  const sizes = (product.productInfo?.sizes ?? []).map(normalizeTag)
  const colors = (product.productInfo?.colors ?? []).map(normalizeTag)
  const materials = (product.productInfo?.materials ?? []).map((item) => ({
    ...item,
    material: normalizeTag(item.material),
  }))
  const measurements =
    product.details?.measurements?.map((measurement) => ({
      size: normalizeTag(measurement.size),
      values:
        measurement.values?.map((v) => ({
          ...v,
          measurement: normalizeTag(v.measurement),
        })) ?? [],
    })) ?? []

  return (
    <motion.div
      className={cn(
        'w-full mx-auto',
        'transition-all duration-300',
        // 移动端占据整个视图
        'lg:max-w-[500px] lg:mx-0',
        // 桌面端使用固定高度和居中
        'h-screen lg:h-auto',
        'flex flex-col lg:block',
      )}
      style={
        {
          '--row-height': VISUAL_SYSTEM.desktop.rowHeight,
          '--content-gap': VISUAL_SYSTEM.desktop.gap,
          '--content-padding': VISUAL_SYSTEM.desktop.padding,
        } as React.CSSProperties
      }
      {...variants.container}
    >
      {/* 主要信息区 */}
      <div
        className={cn('space-y-[--content-gap]', 'p-[--content-padding]', 'flex-1 lg:flex-none')}
      >
        {/* 标题和描述 - 2行 */}
        <div className="h-[calc(var(--row-height)*2)] flex flex-col justify-between">
          <h1 className="text-[--font-lg] leading-tight tracking-tight">{product.title}</h1>
          <p className="text-[--font-sm] text-[rgb(var(--text-secondary-rgb))]">
            {product.description}
          </p>
        </div>

        {/* 价格区域 - 1行 */}
        <div className="h-[--row-height] flex items-center">
          <div className="flex items-baseline gap-2">
            <span className="text-[--font-xl] font-medium">
              {formatPrice(product.pricing?.finalPrice ?? 0)}
            </span>
            {isDiscounted && (
              <span className="text-[--font-sm] line-through opacity-50">
                {formatPrice(product.pricing?.basePrice ?? 0)}
              </span>
            )}
          </div>
        </div>

        {/* 选项区域 */}
        <div className="space-y-[--content-gap]">
          {/* 尺码选择 - 2行 */}
          <div className="h-[calc(var(--row-height)*2)]">
            <div className="flex justify-between items-center h-[--row-height]">
              <span className="text-[--font-sm] font-medium">尺码</span>
              <Button variant="link" className="text-[--font-xs]">
                尺码指南
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2 h-[--row-height]">
              {sizes.map((size) => (
                <Button
                  key={size.id}
                  variant={selectedSize === size.id ? 'default' : 'outline'}
                  onClick={() => setSelectedSize(size.id)}
                  className="text-[--font-xs]"
                >
                  {size.title}
                </Button>
              ))}
            </div>
          </div>

          {/* 颜色选择 - 2行 */}
          <div className="h-[calc(var(--row-height)*2)]">
            <span className="block h-[--row-height] text-[--font-sm] font-medium">颜色</span>
            <div className="flex gap-2 h-[--row-height] items-center">
              {colors.map((color) => (
                <HoverCard key={color.id}>
                  <HoverCardTrigger>
                    <button
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-all',
                        selectedColor === color.id
                          ? 'border-[rgb(var(--purple-rgb))]'
                          : 'border-transparent',
                      )}
                      style={{ backgroundColor: color.value }}
                      onClick={() => onColorChange?.(color.id)}
                    />
                  </HoverCardTrigger>
                  <HoverCardContent>{color.title}</HoverCardContent>
                </HoverCard>
              ))}
            </div>
          </div>
        </div>

        {/* 添加到购物车按钮 - 1行 */}
        <Button
          className="w-full h-[--row-height] text-[--font-sm]"
          disabled={!selectedSize || !selectedColor}
          onClick={() => {
            console.log('Adding to cart:', {
              productId: product.id,
              size: selectedSize,
              color: selectedColor,
            })
          }}
        >
          加入购物车
        </Button>
      </div>

      {/* 详细信息区 */}
      <Accordion type="single" collapsible className="w-full p-[--content-padding] border-t">
        {/* 产品描述 */}
        <AccordionItem value="description">
          <AccordionTrigger className="text-[--font-sm]">产品描述</AccordionTrigger>
          <AccordionContent className="text-[--font-xs]">{product.description}</AccordionContent>
        </AccordionItem>

        {/* 材质成分 */}
        <AccordionItem value="materials">
          <AccordionTrigger>材质成分</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-1">
              {materials.map((item) => (
                <li key={item.material.id}>
                  {item.material.title}: {item.percentage}%
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* 尺码表 */}
        <AccordionItem value="measurements">
          <AccordionTrigger>尺码表</AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-[300px]">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>尺码</th>
                    {measurements[0]?.values.map(({ measurement }) => (
                      <th key={measurement.id}>{measurement.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {measurements.map(({ size, values }) => (
                    <tr key={size.id}>
                      <td>{size.title}</td>
                      {values.map(({ measurement, value }) => (
                        <td key={measurement.id}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>

        {/* 保养说明 */}
        <AccordionItem value="care">
          <AccordionTrigger>保养说明</AccordionTrigger>
          <AccordionContent>
            <RichText data={product.details?.productCare as any} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  )
}
