import { system } from './system'

// 预设动画变体
export const variants = {
  // 系统级别的容器动画 - 更精确的切换
  container: {
    initial: {
      opacity: 0,
      scale: 0.995, // 更微小的缩放
      y: '0.25vh', // 更精确的位移
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.995,
      y: '-0.25vh',
    },
    transition: {
      duration: 0.235, // 精确的时间
      ease: [0.2, 0, 0, 1], // 机械感启动
    },
  },

  // 精确的按钮动画 - 最小化反馈
  button: {
    rest: { scale: 1 },
    hover: { scale: 1.015 }, // 更微小的缩放
    tap: { scale: 0.985 }, // 更微小的缩放
    transition: {
      duration: 0.165, // 更快的反应
      ease: [0.2, 0, 0, 1], // 机械感启动
    },
  },

  // 带微卡顿的列表项动画
  item: {
    initial: {
      opacity: 0,
      y: '0.5vh', // 更小的位移
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: '-0.5vh',
    },
    transition: {
      duration: 0.185, // 更精确的时间
      ease: [0.4, 0, 0, 1], // 更强的机械感
    },
  },

  // 机械感的卡片堆叠 - 精确的层级
  stack: {
    previous: {
      x: '-7.5%', // 更精确的位移
      scale: 0.92, // 更精确的缩放
      opacity: 0.65, // 更精确的透明度
      transition: {
        duration: 0.265,
        ease: [0.6, 0.1, 0.2, 1], // 制动感
      },
    },
    current: {
      x: 0,
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.265,
        ease: [0.2, 0, 0, 1], // 机械感
      },
    },
    next: {
      x: '7.5%',
      scale: 0.92,
      opacity: 0.65,
      transition: {
        duration: 0.265,
        ease: [0.6, 0.1, 0.2, 1], // 制动感
      },
    },
  },

  // 组件切换动画 - 呆板的过渡
  transition: {
    initial: {
      opacity: 0,
      y: '0.5vh',
      scale: 0.995,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.235,
        ease: [0.2, 0, 0, 1], // 机械感
      },
    },
    exit: {
      opacity: 0,
      y: '-0.5vh',
      scale: 0.995,
      transition: {
        duration: 0.185,
        ease: [0.6, 0.1, 0.2, 1], // 制动感
      },
    },
  },

  // 媒体轮播动画 - 精确的过渡
  carouselVariants: {
    container: {
      initial: {
        opacity: 0,
        scale: 0.995,
      },
      animate: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.235,
          ease: [0.2, 0, 0, 1],
        },
      },
      exit: {
        opacity: 0,
        scale: 0.995,
        transition: {
          duration: 0.185,
          ease: [0.6, 0.1, 0.2, 1],
        },
      },
    },
    slide: {
      previous: {
        x: '-7.5%',
        scale: 0.92,
        opacity: 0.65,
        transition: {
          duration: 0.265,
          ease: [0.6, 0.1, 0.2, 1],
        },
      },
      current: {
        x: 0,
        scale: 1,
        opacity: 1,
        transition: {
          duration: 0.265,
          ease: [0.2, 0, 0, 1],
        },
      },
      next: {
        x: '7.5%',
        scale: 0.92,
        opacity: 0.65,
        transition: {
          duration: 0.265,
          ease: [0.6, 0.1, 0.2, 1],
        },
      },
    },
  },
} as const

// 导航动画
export const navVariants = {
  portal: {
    initial: {
      opacity: 0,
      y: '1vh',
      scale: 0.98,
      filter: 'blur(8px)',
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: system.duration.normal,
        ease: system.ease.mechanical,
      },
    },
    exit: {
      opacity: 0,
      y: '0.5vh',
      scale: 0.99,
      filter: 'blur(4px)',
      transition: {
        duration: system.duration.snap,
        ease: system.ease.brake,
      },
    },
  },

  item: {
    initial: { opacity: 0, x: '-1vh' },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: system.duration.fast,
        ease: system.ease.mechanical,
      },
    },
    exit: {
      opacity: 0,
      x: '-0.5vh',
      transition: {
        duration: system.duration.snap,
        ease: system.ease.brake,
      },
    },
  },
} as const
