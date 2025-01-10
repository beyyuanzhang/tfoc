'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/icons/Shape-Logo'
import { cn } from '@/utilities/cn'
import Image from 'next/image'
import type { RichTextField } from 'payload'

interface MediaDoc {
  url: string
  mimeType?: string
  alt?: string
  caption?: RichTextField
  sizes?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    xlarge?: string
  }
}

interface MediaItem {
  type: 'image' | 'video' | 'text'
  content: string
  mimeType?: string
  alt?: string
  caption?: RichTextField
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
  const { autoplayInterval = 5000, displayOrder = 'sequential' } = display

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
          .filter((item: MediaDoc) => item.url)
          .map((item: MediaDoc) => ({
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
      <div className="w-full min-h-[100vh] flex items-center justify-center">
        <div className="w-full max-w-[90vw] sm:max-w-[94vw] md:max-w-[96vw] lg:max-w-2xl aspect-square bg-gray-100 flex items-center justify-center">
          <div className="animate-pulse w-10 h-10 rounded-full bg-gray-200" />
        </div>
      </div>
    )
  }

  const currentItem = mediaItems[currentIndex]

  return (
    <div className="w-full h-[100vh] flex items-center justify-center m-0 p-0">
      <div
        className={cn(
          'w-full max-w-[90vw] sm:max-w-[94vw] md:max-w-[96vw] lg:max-w-2xl',
          'aspect-square relative cursor-pointer overflow-hidden',
          'bg-[#FCFCFC]',
        )}
        onClick={togglePlayPause}
        style={{
          boxShadow: `
            /* 主要凹陷阴影 - 深度感 */
            inset 0 12px 24px -6px rgba(0,0,0,0.12),
            inset 0 8px 16px -4px rgba(0,0,0,0.08),
            
            /* 精确边缘阴影 - 机械感 */
            inset 0 2px 4px -1px rgba(0,0,0,0.06),
            inset 0 1px 2px -1px rgba(0,0,0,0.04),
            
            /* 顶部压力阴影 - 嵌入感 */
            inset 0 16px 32px -12px rgba(0,0,0,0.14),
            
            /* 底部反光 - 金属感 */
            inset 0 -6px 12px -4px rgba(255,255,255,0.1),
            
            /* 精确边框 - 工业感 */
            0 0 0 1px rgba(0,0,0,0.05),
            
            /* 外部光晕 - 建筑感 */
            0 -1px 3px -1px rgba(255,255,255,0.15),
            0 1px 3px -1px rgba(0,0,0,0.1)
          `,
        }}
      >
        {currentItem?.type === 'image' && (
          <Image
            src={currentItem.content}
            alt={currentItem.alt || ''}
            className="object-cover"
            onLoadingComplete={() => setMediaLoaded(true)}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}

        {currentItem?.type === 'video' && (
          <video
            ref={videoRef}
            src={currentItem.content}
            className="w-full h-full object-cover"
            autoPlay={isPlaying}
            muted={isMuted}
            loop
            playsInline
            onLoadedData={() => setMediaLoaded(true)}
          />
        )}

        {currentItem?.type === 'text' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="max-w-[80%] text-base font-medium text-black text-center leading-relaxed">
              {currentItem.content}
            </p>
          </div>
        )}

        {(!currentItem || !mediaLoaded) && <LogoDisplay />}

        {currentItem?.type === 'video' && mediaLoaded && (
          <div className="absolute bottom-2 right-2 z-10">
            <VolumeControl isMuted={isMuted} onToggle={toggleMute} />
          </div>
        )}
      </div>
    </div>
  )
}
