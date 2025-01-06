import React from 'react'
import { NavClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { NavData } from './types'
import type { Config } from '@/payload-types'

export async function Nav() {
  const navData = await getCachedGlobal('nav' as keyof Config['globals'])()

  if (!navData) {
    return <div role="alert">导航加载失败</div>
  }

  return <NavClient data={navData as NavData} />
} 