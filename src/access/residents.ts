import type { Access } from 'payload'
import type { User } from '@/payload-types'

export const residents: Access = ({ req: { user } }) => {
  const currentUser = user as User

  // 如果用户是 resident，只能访问自己的内容
  if (currentUser?.roles?.includes('resident')) {
    return {
      user: {
        equals: currentUser.id,
      },
    }
  }

  // 其他用户不适用此规则
  return false
}
