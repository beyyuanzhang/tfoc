// 基础动效系统
export const system = {
  // 时间控制 - 更精确的时间刻度
  duration: {
    micro: 0.135, // 135ms - 极短的机械反馈
    snap: 0.185, // 185ms - 精确的快速反馈
    fast: 0.235, // 235ms - 精确的小型过渡
    normal: 0.285, // 285ms - 精确的标准过渡
    slow: 0.335, // 335ms - 精确的强调动作
  },

  // 机械感缓动曲线 - 更呆板的过渡
  ease: {
    mechanical: [0.2, 0, 0, 1], // 更直接的启动
    brake: [0.6, 0.1, 0.2, 1], // 更强的制动感
    snap: [0.4, 0, 0, 1], // 更直接的卡位
    precise: [0.3, 0, 0, 1], // 更精确的过渡
    bounce: [0.25, 0, 0, 1], // 更直接的切换
  },

  // 变换参数 - 更精确的数值
  transform: {
    scale: {
      micro: 0.9925, // 更精确的微缩放
      side: 0.985, // 更精确的侧边缩放
      hover: 1.015, // 更精确的悬浮缩放
      tap: 0.985, // 更精确的点击缩放
    },
    rotate: {
      range: 0.25, // 更小的倾斜范围
      precision: 3, // 更高的倾斜精度
      micro: 0.125, // 更精确的微旋转
    },
    offset: {
      side: '7.2%', // 更精确的侧边偏移
      small: '0.5vh', // 更精确的小偏移
      micro: '0.25vh', // 更精确的微偏移
    },
  },

  // 视觉参数 - 更精确的视觉效果
  visual: {
    opacity: {
      side: 0.85, // 更精确的侧边透明度
      hover: 0.925, // 更精确的悬浮透明度
      disabled: 0.65, // 更精确的禁用透明度
    },
    blur: {
      soft: '1.5px', // 更精确的轻度模糊
      heavy: '3.5px', // 更精确的重度模糊
    },
    border: {
      width: '0.5px',
      color: 'rgba(115, 112, 178, 0.35)',
    },
  },

  // 机械感过渡预设 - 更精确的动画参数
  transition: {
    spring: {
      type: 'spring',
      stiffness: 525, // 更高的刚性
      damping: 45, // 更强的阻尼
      mass: 0.65, // 更精确的质量
    },
    tween: {
      type: 'tween',
      duration: 0.285, // 对应 normal duration
      ease: [0.2, 0, 0, 1], // 对应 mechanical ease
    },
  },
} as const
