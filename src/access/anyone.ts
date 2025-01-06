import type { Access } from 'payload'
import type { User } from '@/payload-types'

export const anyone: Access = ({ req: { user } }) => {
  const currentUser = user as User

  // architects 可以浏览所有内容
  if (currentUser?.roles?.includes('head-architect') || currentUser?.roles?.includes('architect')) {
    return true
  }

  // resident 和访客只能浏览已发布的内容
  return {
    _status: {
      equals: 'published',
    },
  }
}
