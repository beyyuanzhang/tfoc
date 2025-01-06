import type { Access } from 'payload'
import type { User } from '@/payload-types'

// 检查用户是否是 head-architect
const isHeadArchitect = (user: User): boolean => {
  return user?.roles === 'head-architect'
}

// 检查用户是否是 architect
const isArchitect = (user: User): boolean => {
  return user?.roles === 'architect'
}

// head-architect 拥有所有权限
export const headArchitectAccess: Access = ({ req }) => {
  return isHeadArchitect(req.user as User)
}

// architect 可以执行 CRU 操作，但不能执行 delete 操作
export const architectAccess: Access = ({ req }) => {
  return isArchitect(req.user as User)
}
