import { system } from './system'

// 预设动画变体
export const variants = {
  // 系统级别的容器动画
  container: {
    initial: {
      scale: system.transform.scale.base,
      transformOrigin: 'center center',
    },
    animate: {
      scale: 1,
      transformOrigin: 'center center',
    },
    exit: {
      scale: system.transform.scale.base,
      transformOrigin: 'center center',
    },
    transition: {
      duration: system.duration.base,
      ease: system.ease.mechanical,
    },
  },

  // 精确的按钮动画
  button: {
    rest: {
      scale: 1,
      transformOrigin: 'center center',
    },
    hover: {
      scale: 1.015,
      transformOrigin: 'center center',
    },
    tap: {
      scale: 0.985,
      transformOrigin: 'center center',
    },
    transition: {
      duration: system.duration.base,
      ease: system.ease.mechanical,
    },
  },

  // 列表项动画
  item: {
    initial: {
      scale: system.transform.scale.base,
      transformOrigin: 'center center',
    },
    animate: {
      scale: 1,
      transformOrigin: 'center center',
    },
    exit: {
      scale: system.transform.scale.base,
      transformOrigin: 'center center',
    },
    transition: {
      duration: system.duration.base,
      ease: system.ease.mechanical,
    },
  },

  // 堆叠卡片动画
  stack: {
    previous: {
      x: `-${system.transform.offset.base}`,
      scale: system.transform.scale.base,
      transformOrigin: 'center center',
      transition: {
        duration: system.duration.base,
        ease: system.ease.mechanical,
      },
    },
    current: {
      x: 0,
      scale: 1,
      transformOrigin: 'center center',
      transition: {
        duration: system.duration.base,
        ease: system.ease.mechanical,
      },
    },
    next: {
      x: system.transform.offset.base,
      scale: system.transform.scale.base,
      transformOrigin: 'center center',
      transition: {
        duration: system.duration.base,
        ease: system.ease.mechanical,
      },
    },
  },

  // 展开/收起动画
  transition: {
    initial: {
      scale: system.transform.scale.base,
      transformOrigin: 'center center',
    },
    animate: {
      scale: 1,
      transformOrigin: 'center center',
      transition: {
        duration: system.duration.base,
        ease: system.ease.mechanical,
      },
    },
    exit: {
      scale: system.transform.scale.base,
      transformOrigin: 'center center',
      transition: {
        duration: system.duration.base,
        ease: system.ease.mechanical,
      },
    },
  },

  // 媒体轮播动画
  carouselVariants: {
    container: {
      initial: {
        scale: system.transform.scale.base,
        transformOrigin: 'center center',
      },
      animate: {
        scale: 1,
        transformOrigin: 'center center',
      },
      exit: {
        scale: system.transform.scale.base,
        transformOrigin: 'center center',
      },
      transition: {
        duration: system.duration.base,
        ease: system.ease.mechanical,
      },
    },
    slide: {
      previous: {
        x: `-${system.transform.offset.base}`,
        scale: system.transform.scale.base,
        transformOrigin: 'center center',
        transition: {
          duration: system.duration.base,
          ease: system.ease.mechanical,
        },
      },
      current: {
        x: 0,
        scale: 1,
        transformOrigin: 'center center',
        transition: {
          duration: system.duration.base,
          ease: system.ease.mechanical,
        },
      },
      next: {
        x: system.transform.offset.base,
        scale: system.transform.scale.base,
        transformOrigin: 'center center',
        transition: {
          duration: system.duration.base,
          ease: system.ease.mechanical,
        },
      },
    },
  },
} as const

// 导航动画 - 直接显示/隐藏
export const navVariants = {
  portal: {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: system.duration.base,
        ease: system.ease.mechanical,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: system.duration.base,
        ease: system.ease.mechanical,
      },
    },
  },

  item: {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: system.duration.base,
        ease: system.ease.mechanical,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: system.duration.base,
        ease: system.ease.mechanical,
      },
    },
  },
} as const
