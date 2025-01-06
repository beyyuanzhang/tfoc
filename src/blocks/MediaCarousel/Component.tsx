'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { animate } from 'motion'
import { Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/icons/Shape-Logo'
import { cn } from '@/utilities/cn'
import Image from 'next/image'

interface MediaItem {
  type: 'image' | 'video' | 'text'
  content: string
  mimeType?: string
  alt?: string
  caption?: any // 使用 Payload 的 RichText 类型
  sizes?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    xlarge?: string
  }
}

interface MediaCarouselProps {
  mediaFolder: {
    id: string
  }
  display?: {
    size?: 'small' | 'medium' | 'large'
    autoplayInterval?: number
    displayOrder?: 'sequential' | 'random'
  }
  textSlides?: { content: string }[]
}

const sizeClasses = {
  small: 'h-[40vh] w-[40vh] max-w-[90vw]',
  medium: 'h-[60vh] w-[60vh] max-w-[90vw]',
  large: 'h-[80vh] w-[80vh] max-w-[90vw]',
} as const

const LogoDisplay = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="cursor-pointer hover:text-[#7370B2] transition-colors duration-200">
      <Logo className="w-[15vw] h-[15vw]" />
    </div>
  </div>
)

const VolumeControl = ({
  isMuted,
  onToggle,
}: {
  isMuted: boolean
  onToggle: (e: React.MouseEvent) => void
}) => (
  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-transparent" onClick={onToggle}>
    {isMuted ? (
      <VolumeX className="h-4 w-4 stroke-[1.5] text-black hover:text-[#7370B2] transition-colors" />
    ) : (
      <Volume2 className="h-4 w-4 stroke-[1.5] text-black hover:text-[#7370B2] transition-colors" />
    )}
  </Button>
)

export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  mediaFolder,
  display = {},
  textSlides = [],
}) => {
  const { size = 'medium', autoplayInterval = 5000, displayOrder = 'sequential' } = display

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mediaLoaded, setMediaLoaded] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)

  // 获取媒体文件
  useEffect(() => {
    const fetchMedia = async () => {
      if (!mediaFolder?.id) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/media?where[folder][equals]=${mediaFolder.id}&depth=1`)
        if (!res.ok) throw new Error('Failed to fetch media')

        const data = await res.json()
        let items = data.docs
          .filter((item: any) => item.url) // 确保有 URL
          .map((item: any) => ({
            type: item.mimeType?.startsWith('video/') ? 'video' : 'image',
            content: item.url,
            mimeType: item.mimeType,
            alt: item.alt,
            caption: item.caption,
            sizes: item.sizes,
          }))

        // 添加文本幻灯片
        if (textSlides?.length) {
          items = [
            ...items,
            ...textSlides.map((slide) => ({
              type: 'text' as const,
              content: slide.content,
            })),
          ]
        }

        // 随机排序
        if (displayOrder === 'random') {
          items.sort(() => Math.random() - 0.5)
        }

        setMediaItems(items)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching media:', error)
        setIsLoading(false)
        setMediaItems([])
      }
    }

    fetchMedia()
  }, [mediaFolder?.id, textSlides, displayOrder])

  // 自动播放控制
  useEffect(() => {
    if (!isPlaying || mediaItems.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaItems.length)
    }, autoplayInterval)

    return () => clearInterval(timer)
  }, [isPlaying, mediaItems.length, autoplayInterval])

  // 切换播放/暂停
  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev)
    if (videoRef.current) {
      videoRef.current[videoRef.current.paused ? 'play' : 'pause']()
    }
  }, [])

  // 切换静音
  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMuted((prev) => !prev)
  }, [])

  if (isLoading) {
    return (
      <div className={cn('relative rounded-lg overflow-hidden bg-gray-100', sizeClasses[size])}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse w-10 h-10 rounded-full bg-gray-200" />
        </div>
      </div>
    )
  }

  const currentItem = mediaItems[currentIndex]

  const animateSlide = (el: HTMLElement) => {
    // 设置初始状态
    el.style.opacity = '1'
    el.style.transform = 'scale(1.01)'

    // 执行动画
    requestAnimationFrame(() => {
      animate(
        [
          { opacity: 1, transform: 'scale(1.01)' },
          { opacity: 1, transform: 'scale(1)' },
        ],
        {
          duration: 0.12,
          easing: [0.4, 0, 0.2, 1],
        },
      )
    })
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div
        className={cn(
          'absolute inset-0 m-auto',
          'relative cursor-pointer overflow-hidden',
          'shadow-[0_2px_4px_rgba(0,0,0,0.04)]',
          sizeClasses[size],
        )}
        onClick={togglePlayPause}
      >
        {currentItem?.type === 'image' && (
          <Image
            src={currentItem.content}
            alt={currentItem.alt || ''}
            className={cn('w-full h-full object-cover', mediaLoaded ? 'opacity-100' : 'opacity-0')}
            onLoadingComplete={() => setMediaLoaded(true)}
            fill
            unoptimized={process.env.NODE_ENV === 'development'}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}

        {currentItem?.type === 'video' && (
          <video
            ref={videoRef}
            src={currentItem.content}
            className={cn('w-full h-full object-cover', mediaLoaded ? 'opacity-100' : 'opacity-0')}
            autoPlay={isPlaying}
            muted={isMuted}
            loop
            playsInline
            onLoadedData={() => setMediaLoaded(true)}
          />
        )}

        {currentItem?.type === 'text' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-[80%]">
              <p className="text-base font-medium text-black text-center leading-relaxed">
                {currentItem.content}
              </p>
            </div>
          </div>
        )}

        {(!currentItem || !mediaLoaded) && <LogoDisplay />}

        <div
          className="absolute inset-0 pointer-events-none rounded-[1px]"
          style={{
            boxShadow: `
              inset 0 2px 4px -1px rgba(0,0,0,0.05),
              inset 0 4px 6px -2px rgba(0,0,0,0.03),
              inset 0 -2px 4px -1px rgba(255,255,255,0.1),
              inset 0 -4px 6px -2px rgba(255,255,255,0.05)
            `,
          }}
        />

        {currentItem?.type === 'video' && mediaLoaded && (
          <div className="absolute bottom-2 right-2 z-10">
            <VolumeControl isMuted={isMuted} onToggle={toggleMute} />
          </div>
        )}
      </div>
    </div>
  )
}
