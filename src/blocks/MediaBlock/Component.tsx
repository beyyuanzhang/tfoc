'use client'

import type { StaticImageData } from 'next/image'

import { cn } from 'src/utilities/cn'
import React, { useState } from 'react'
import RichText from '@/components/RichText'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'
import { Logo } from '@/components/icons/Shape-Logo'

type Props = MediaBlockProps & {
  breakout?: boolean
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
}

const LogoDisplay = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-[0.8rem]">
    <Logo className="w-20 h-20 text-gray-300" />
  </div>
)

export const MediaBlock: React.FC<Props> = (props) => {
  const {
    captionClassName,
    className,
    enableGutter = true,
    imgClassName,
    media,
    staticImage,
    disableInnerContainer,
  } = props

  let caption
  if (media && typeof media === 'object') caption = media.caption

  const [isLoading, setIsLoading] = useState(true)
  const hasMedia = (media && typeof media === 'object' && media.url) || staticImage?.src

  return (
    <div
      className={cn(
        'relative',
        {
          container: enableGutter,
        },
        className,
      )}
    >
      {(!hasMedia || isLoading) && <LogoDisplay />}
      {hasMedia && (
        <Media
          imgClassName={cn('border border-border rounded-[0.8rem]', imgClassName)}
          resource={media}
          src={staticImage?.src ? staticImage : undefined}
          onLoad={() => setIsLoading(false)}
        />
      )}
      {caption && (
        <div
          className={cn(
            'mt-6',
            {
              container: !disableInnerContainer,
            },
            captionClassName,
          )}
        >
          <RichText data={caption} enableGutter={false} />
        </div>
      )}
    </div>
  )
}
