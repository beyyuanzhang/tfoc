import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product } from '@/payload-types'
import { Logo } from '@/components/icons/Shape-Logo'
import Image from 'next/image'
import { system } from '@/app/(frontend)/lib/motion/system'
import { variants } from '@/app/(frontend)/lib/motion/variants'
import { cn } from '@/utilities/cn'

type ImageStackProps = {
  colorMedia?: NonNullable<NonNullable<Product['details']>['colorMedia']>
  selectedColor?: string
}

// 定义布局常量
const STACK_LAYOUT = {
  maxWidth: 800, // 理想展示宽度
  viewHeight: 80, // 视口高度占比
} as const

export const ImageStack: React.FC<ImageStackProps> = ({ colorMedia = [], selectedColor }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [touchStart, setTouchStart] = useState<{ x: number; time: number } | null>(null)
  const [isSwiping, setIsSwiping] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 获取图片数组
  const images = useMemo(
    () =>
      selectedColor
        ? colorMedia
            .find(
              (cm) =>
                cm.color &&
                typeof cm.color !== 'number' &&
                'id' in cm.color &&
                cm.color.id.toString() === selectedColor,
            )
            ?.media?.map((m) => m.file) || []
        : colorMedia
            .flatMap((cm) => cm.media?.map((m) => m.file) || [])
            .filter((file): file is NonNullable<typeof file> => file !== null),
    [colorMedia, selectedColor],
  )

  const prevIndex = (currentIndex - 1 + images.length) % images.length
  const nextIndex = (currentIndex + 1) % images.length

  // 处理滑动
  const handleSwipe = useCallback(
    async (direction: 'left' | 'right') => {
      if (isAnimating) return
      setIsAnimating(true)

      const isNext = direction === 'left'
      setCurrentIndex((prev) => (prev + (isNext ? 1 : -1) + images.length) % images.length)

      setTimeout(() => {
        setIsAnimating(false)
      }, system.duration.normal * 1000)
    },
    [isAnimating, images.length],
  )

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

  // 处理触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      time: Date.now(),
    })
  }

  // 处理触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return

    const diff = touchStart.x - e.touches[0].clientX
    const timeDiff = Date.now() - touchStart.time

    if (Math.abs(diff) > 20 && timeDiff < 300) {
      setIsSwiping(true)
    }
  }

  // 处理触摸结束
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !isSwiping) {
      setTouchStart(null)
      setIsSwiping(false)
      return
    }

    const touch = e.changedTouches[0]
    const diff = touchStart.x - touch.clientX
    const timeDiff = Date.now() - touchStart.time

    if (Math.abs(diff) > 50 && timeDiff < 300) {
      handleSwipe(diff > 0 ? 'left' : 'right')
    }

    setTouchStart(null)
    setIsSwiping(false)
  }

  // 如果没有图片，显示 Logo
  if (!images.length) {
    return (
      <div className="w-full max-w-[90vw] md:max-w-2xl mx-auto aspect-[9/16] bg-gray-100">
        <div className="flex items-center justify-center h-full">
          <Logo className="w-[15vw] h-[15vw] md:w-24 md:h-24" />
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${isFullscreen ? '' : 'h-screen flex items-center justify-center'}`}>
      <div
        className={cn(
          'w-full',
          !isFullscreen && [
            `max-w-[${STACK_LAYOUT.maxWidth}px]`,
            'mx-auto',
            `h-[${STACK_LAYOUT.viewHeight}vh]`,
            'flex items-center',
          ],
        )}
      >
        <AnimatePresence mode="wait">
          {!isFullscreen ? (
            <motion.div key="stack" {...variants.transition} className="w-full">
              <div className="relative w-full px-[15%]">
                <div
                  className="relative aspect-[9/16] w-full"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="absolute inset-0">
                    <motion.div
                      className="absolute inset-0 overflow-hidden outline outline-1 outline-[#7370B2]"
                      {...variants.transition}
                      animate={{
                        x: '-15%',
                        opacity: system.visual.opacity.side,
                        scale: system.transform.scale.side,
                      }}
                    >
                      {images[prevIndex] &&
                        typeof images[prevIndex] !== 'number' &&
                        images[prevIndex].url && (
                          <Image
                            src={images[prevIndex].url}
                            alt="Previous"
                            className="object-cover"
                            fill
                            sizes="(max-width: 768px) 90vw, 40rem"
                          />
                        )}
                    </motion.div>

                    <motion.div
                      className="absolute inset-0 overflow-hidden outline outline-1 outline-[#7370B2]"
                      {...variants.transition}
                      animate={{
                        x: 0,
                        scale: 1,
                        opacity: 1,
                      }}
                      style={{ zIndex: 1 }}
                    >
                      {images[currentIndex] &&
                        typeof images[currentIndex] !== 'number' &&
                        images[currentIndex].url && (
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

                    <motion.div
                      className="absolute inset-0 overflow-hidden outline outline-1 outline-[#7370B2]"
                      {...variants.transition}
                      animate={{
                        x: '15%',
                        opacity: system.visual.opacity.side,
                        scale: system.transform.scale.side,
                      }}
                    >
                      {images[nextIndex] &&
                        typeof images[nextIndex] !== 'number' &&
                        images[nextIndex].url && (
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

                  <div className="absolute inset-0 z-10">
                    <div
                      className="absolute -left-[15%] top-0 bottom-0 w-[15%] group
                               cursor-w-resize overscroll-none"
                      onClick={() => handleSwipe('right')}
                      onWheel={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        if (e.deltaY > 0) {
                          handleSwipe('left')
                        } else if (e.deltaY < 0) {
                          handleSwipe('right')
                        }
                      }}
                    />

                    <div
                      className="absolute left-0 right-0 top-0 bottom-0 z-10 
                               cursor-zoom-in"
                      onClick={() => setIsFullscreen(true)}
                    />

                    <div
                      className="absolute -right-[15%] top-0 bottom-0 w-[15%] group
                               cursor-e-resize overscroll-none"
                      onClick={() => handleSwipe('left')}
                      onWheel={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        if (e.deltaY > 0) {
                          handleSwipe('left')
                        } else if (e.deltaY < 0) {
                          handleSwipe('right')
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="grid" {...variants.transition} className="flex flex-col">
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  {...variants.item}
                  className="w-full aspect-[3/4] relative cursor-pointer"
                  onClick={() => {
                    setCurrentIndex(index)
                    setIsFullscreen(false)
                  }}
                >
                  {image && typeof image !== 'number' && image.url && (
                    <Image
                      src={image.url}
                      alt={image.alt || `Product image ${index + 1}`}
                      className="object-cover"
                      fill
                      sizes="100vw"
                      priority={index < 4}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
