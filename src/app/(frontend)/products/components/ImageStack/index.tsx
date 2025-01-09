import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import type { Product } from '@/payload-types'
import { Logo } from '@/components/icons/Shape-Logo'
import Image from 'next/image'

type ImageStackProps = {
  colorMedia?: NonNullable<NonNullable<Product['details']>['colorMedia']>
  selectedColor?: string
}

export const ImageStack: React.FC<ImageStackProps> = ({ colorMedia = [], selectedColor }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  // 获取图片数组
  const images = selectedColor
    ? colorMedia
        .find(cm => 
          cm.color && 
          typeof cm.color !== 'number' && 
          'id' in cm.color && 
          cm.color.id.toString() === selectedColor
        )?.media?.map(m => m.file) || []
    : colorMedia
        .flatMap(cm => cm.media?.map(m => m.file) || [])
        .filter((file): file is NonNullable<typeof file> => file !== null)

  const prevIndex = (currentIndex - 1 + images.length) % images.length
  const nextIndex = (currentIndex + 1) % images.length

  // 处理滑动
  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    if (isAnimating) return
    setIsAnimating(true)
    
    const isNext = direction === 'left'
    setCurrentIndex(prev => (prev + (isNext ? 1 : -1) + images.length) % images.length)
    
    setTimeout(() => {
      setIsAnimating(false)
    }, 500)
  }, [isAnimating, images.length])

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleSwipe('right')
      } else if (e.key === 'ArrowRight') {
        handleSwipe('left')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSwipe])

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return

    const currentTouch = e.touches[0].clientX
    const diff = touchStart - currentTouch

    // 检测是否有足够的滑动距离（50px）
    if (Math.abs(diff) > 50) {
      handleSwipe(diff > 0 ? 'left' : 'right')
      setTouchStart(null)
    }
  }

  const handleTouchEnd = () => {
    setTouchStart(null)
  }

  // 如果没有图片，显示 Logo
  if (!images.length) {
    return (
      <div className="w-full max-w-[90vw] md:max-w-2xl mx-auto aspect-[3/4] bg-gray-100">
        <div className="flex items-center justify-center h-full">
          <Logo className="w-[15vw] h-[15vw] md:w-24 md:h-24" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-[90vw] md:max-w-2xl mx-auto">
      <div 
        className="relative aspect-[3/4]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 堆叠容器 */}
        <div className="absolute inset-0">
          {/* 左侧卡片 */}
          <motion.div
            className="absolute inset-0 overflow-hidden outline outline-1 outline-[#7370B2]"
            animate={{
              x: '-10%',
              opacity: 0.7,
              scale: 0.95,
              filter: 'brightness(0.9) blur(1px)',
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px'
            }}
          >
            {images[prevIndex] && typeof images[prevIndex] !== 'number' && images[prevIndex].url && (
              <Image
                src={images[prevIndex].url}
                alt="Previous"
                className="object-cover"
                fill
                sizes="(max-width: 768px) 90vw, 40rem"
              />
            )}
          </motion.div>

          {/* 中间主卡片 */}
          <motion.div
            className="absolute inset-0 overflow-hidden outline outline-1 outline-[#7370B2]"
            style={{ 
              zIndex: 1,
              boxShadow: `
                0 2px 4px -1px rgba(0,0,0,0.06),
                0 4px 6px -1px rgba(0,0,0,0.1),
                0 -2px 4px -1px rgba(255,255,255,0.1),
                0 -4px 6px -1px rgba(255,255,255,0.05)
              `
            }}
          >
            {images[currentIndex] && typeof images[currentIndex] !== 'number' && images[currentIndex].url && (
              <Image
                src={images[currentIndex].url}
                alt={images[currentIndex].alt || '产品图片'}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 90vw, 40rem"
                priority
              />
            )}
          </motion.div>

          {/* 右侧卡片 */}
          <motion.div
            className="absolute inset-0 overflow-hidden outline outline-1 outline-[#7370B2]"
            animate={{
              x: '10%',
              opacity: 0.7,
              scale: 0.95,
              filter: 'brightness(0.9) blur(1px)',
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px'
            }}
          >
            {images[nextIndex] && typeof images[nextIndex] !== 'number' && images[nextIndex].url && (
              <Image
                src={images[nextIndex].url}
                alt="Next"
                className="object-cover"
                fill
                sizes="(max-width: 768px) 90vw, 40rem"
              />
            )}
          </motion.div>
        </div>

        {/* 交互区域 */}
        <div className="absolute inset-0 z-10">
          <div 
            className="absolute left-0 top-0 bottom-0 w-1/2 cursor-w-resize"
            onClick={() => handleSwipe('right')}
          />
          <div 
            className="absolute right-0 top-0 bottom-0 w-1/2 cursor-e-resize"
            onClick={() => handleSwipe('left')}
          />
        </div>
      </div>
    </div>
  )
}
