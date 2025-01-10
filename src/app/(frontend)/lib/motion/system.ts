// 基础动效系统
export const system = {
  // 时间控制 - 统一的时间刻度
  duration: {
    base: 0.4, // 400ms - 统一的基础时长
    normal: 0.4, // 兼容现有代码
  },

  // 机械感缓动曲线 - 统一的曲线
  ease: {
    mechanical: [0.32, 0, 0, 1], // 统一的机械感曲线
    brake: [0.32, 0, 0, 1], // 兼容现有代码
  },

  // 变换参数 - 统一的数值
  transform: {
    scale: {
      base: 0.92, // 统一的缩放比例
      side: 0.92, // 侧边图片缩放
    },
    offset: {
      base: '8%', // 统一的位移距离
    },
  },

  // 视觉效果参数
  visual: {
    opacity: {
      side: 1, // 侧边图片透明度，保持完全不透明
    },
  },
} as const
