import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product } from '@/payload-types'
import { Logo } from '@/components/icons/Shape-Logo'
import Image from 'next/image'
import { X } from 'lucide-react'

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
  const images = selectedColor
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
        .filter((file): file is NonNullable<typeof file> => file !== null)

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
      }, 500)
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
    // 只在两侧区域触发
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const touchArea = rect.width / 6 // 两侧各1/6区域有效

    if (x < touchArea || x > rect.width - touchArea) {
      setTouchStart({
        x: touch.clientX,
        time: Date.now(),
      })
    }
  }

  // 处理触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return

    const touch = e.touches[0]
    const diff = touchStart.x - touch.clientX
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
    <>
      <div className="relative w-full max-w-[94vw] sm:max-w-[96vw] md:max-w-2xl mx-auto px-2 sm:px-3">
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
                boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
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
                `,
              }}
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
                boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
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

          {/* 交互区域 */}
          <div className="absolute inset-0 z-10">
            {/* 左侧滑动区域 */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[25%] group
                         cursor-w-resize"
              onClick={() => handleSwipe('right')}
            >
              <div
                className="absolute inset-0
                             opacity-0 group-hover:opacity-100
                             transition-opacity duration-300 ease-out"
                style={{
                  boxShadow: `
                       inset 32px 0 24px -24px rgba(0,0,0,0.15),
                       inset 16px 0 16px -16px rgba(0,0,0,0.1),
                       inset 8px 0 8px -8px rgba(0,0,0,0.05)
                     `,
                }}
              />
            </div>

            {/* 右侧滑动区域 */}
            <div
              className="absolute right-0 top-0 bottom-0 w-[25%] group
                         cursor-e-resize"
              onClick={() => handleSwipe('left')}
            >
              <div
                className="absolute inset-0
                             opacity-0 group-hover:opacity-100
                             transition-opacity duration-300 ease-out"
                style={{
                  boxShadow: `
                       inset -32px 0 24px -24px rgba(0,0,0,0.15),
                       inset -16px 0 16px -16px rgba(0,0,0,0.1),
                       inset -8px 0 8px -8px rgba(0,0,0,0.05)
                     `,
                }}
              />
            </div>

            {/* 中间点击区域 - 只保留光标提示 */}
            <div
              className="absolute left-[25%] right-[25%] top-0 bottom-0 z-10 
                         cursor-zoom-in"
              onClick={() => setIsFullscreen(true)}
            />
          </div>
        </div>
      </div>

      {/* 全屏图集模式 */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 bg-black z-50 overflow-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="fixed top-0 left-1/2 -translate-x-1/2 z-50 
                         w-[4vh] h-[4vh] flex items-center justify-center
                         bg-[rgb(var(--gray-900-rgb))] text-[rgb(var(--white-rgb))]
                         hover:text-[#7370B2]
                         transition-colors duration-200"
            >
              <X className="w-[2vh] h-[2vh]" />
            </button>

            {/* 全屏图集容器 */}
            <div className="w-full">
              <div>
                {images.map((image, index) => (
                  <motion.div
                    key={index}
                    className="relative w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {image && typeof image !== 'number' && image.url && (
                      <Image
                        src={image.url}
                        alt={image.alt || `Product image ${index + 1}`}
                        className="w-full h-auto"
                        width={1200}
                        height={1600}
                        priority={index === 0}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
