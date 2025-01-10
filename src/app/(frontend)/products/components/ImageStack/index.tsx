import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product } from '@/payload-types'
import { Logo } from '@/components/icons/Shape-Logo'
import Image from 'next/image'
import { system } from '@/app/(frontend)/lib/motion/system'
import { variants } from '@/app/(frontend)/lib/motion/variants'

type ImageStackProps = {
  colorMedia?: NonNullable<NonNullable<Product['details']>['colorMedia']>
  selectedColor?: string
}

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

    // 如果移动距离超过20px且时间小于300ms，标记为滑动状态
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

    // 快速滑动判定：移动距离>50px且时间<300ms
    if (Math.abs(diff) > 50 && timeDiff < 300) {
      handleSwipe(diff > 0 ? 'left' : 'right')
    }

    setTouchStart(null)
    setIsSwiping(false)
  }

  // 为每张图片生成固定的随机倾斜值
  const imageSkews = useMemo(() => {
    return images.map(() => ({
      skew: (Math.random() * 2 - 1) * 0.8,
      rotate: (Math.random() * 2 - 1) * 0.5,
    }))
  }, [images])

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
    <div
      className={isFullscreen ? 'w-full' : 'w-full min-h-[100vh] flex items-center justify-center'}
    >
      <div
        className={
          isFullscreen
            ? 'w-full'
            : 'w-full max-w-[90vw] sm:max-w-[94vw] md:max-w-[96vw] lg:max-w-2xl'
        }
      >
        <AnimatePresence mode="wait">
          {!isFullscreen ? (
            // 堆叠模式
            <motion.div key="stack" {...variants.transition} className="flex flex-col gap-[0.5vh]">
              <motion.div className="h-full bg-[rgb(var(--purple-rgb))]" {...variants.item} />
              <div className="relative aspect-[3/4] w-full">
                <div
                  className="relative aspect-[3/4] w-full px-0 sm:px-3" // 移除移动端的内边距
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="absolute inset-0">
                    <motion.div
                      className="absolute inset-0 overflow-hidden outline outline-1 outline-[#7370B2]"
                      {...variants.transition}
                      animate={{
                        x: '-7.2%',
                        opacity: system.visual.opacity.side,
                        scale: system.transform.scale.side,
                        skew: `${imageSkews[prevIndex].skew}deg`,
                        rotate: `${imageSkews[prevIndex].rotate}deg`,
                      }}
                      transition={{
                        duration: system.duration.normal,
                        ease: system.ease.brake,
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
                        skew: 0,
                        rotate: 0,
                      }}
                      transition={{
                        duration: system.duration.normal,
                        ease: system.ease.mechanical,
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
                        x: '7.2%',
                        opacity: system.visual.opacity.side,
                        scale: system.transform.scale.side,
                        skew: `${imageSkews[nextIndex].skew}deg`,
                        rotate: `${imageSkews[nextIndex].rotate}deg`,
                      }}
                      transition={{
                        duration: system.duration.normal,
                        ease: system.ease.brake,
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
                      className="absolute left-0 top-0 bottom-0 w-[25%] group
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
                      onTouchMove={(e) => e.preventDefault()}
                    />

                    <div
                      className="absolute right-0 top-0 bottom-0 w-[25%] group
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
                      onTouchMove={(e) => e.preventDefault()}
                    />

                    <div
                      className="absolute left-[25%] right-[25%] top-0 bottom-0 z-10 
                                 cursor-zoom-in"
                      onClick={() => setIsFullscreen(true)}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            // 展开模式
            <motion.div
              key="grid"
              {...variants.transition}
              className={`grid gap-0 ${
                images.length <= 3
                  ? 'grid-cols-2 sm:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
              }`}
            >
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  {...variants.item}
                  className="aspect-[3/4] relative cursor-pointer"
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
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      priority={index < 8}
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
