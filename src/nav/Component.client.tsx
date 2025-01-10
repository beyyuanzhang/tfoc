'use client'

import React, { useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utilities/cn'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LinearLogo } from '@/components/icons/LinearLogo'
import type { NavData } from './types'
import { navVariants } from '@/app/(frontend)/lib/motion/variants'

interface NavClientProps {
  data: NavData
}

export const NavClient: React.FC<NavClientProps> = ({ data }) => {
  return (
    <Suspense>
      <NavContent data={data} />
    </Suspense>
  )
}

export const NavContent: React.FC<NavClientProps> = ({ data }) => {
  const { appearance, leftNavItems, portalRows } = data
  const [isPortalOpen, setIsPortalOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = () => {
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`)
    }
  }

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-[80vw]">
      <div
        className="w-full"
        style={{
          backgroundColor: appearance.backgroundColor,
          color: appearance.textColor,
          height: '3.5vh',
        }}
      >
        <nav
          className="container mx-auto flex items-center justify-between p-[1vh] h-full"
          style={{
            fontSize: 'var(--font-xs)',
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 'bold',
          }}
        >
          <div className="hidden lg:flex items-center justify-between w-full">
            <div className="flex items-center gap-[3vw]">
              {leftNavItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="transition-colors hover:text-[#7370B2]"
                >
                  {item.title}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-[1.8vh] w-[1.8vh] hover:bg-transparent hover:text-[#7370B2]"
                onClick={handleSearch}
              >
                <Search className="h-[1.2vh] w-[1.2vh]" />
              </Button>
              <Input
                type="text"
                aria-label="Search"
                style={{
                  fontSize: 'var(--font-xs)',
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 'bold',
                }}
                className="h-[1.8vh] min-w-[15vw] bg-transparent border-none caret-current focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
              />
            </div>

            <button
              onMouseEnter={() => setIsPortalOpen(true)}
              onClick={() => setIsPortalOpen((prev) => !prev)}
              className={cn(
                'transition-colors',
                isPortalOpen ? 'text-[#7370B2]' : 'hover:text-[#7370B2]',
              )}
            >
              Portal
            </button>
          </div>
          <div className="flex lg:hidden items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-[1.8vh] w-[1.8vh] hover:bg-transparent hover:text-[#7370B2]"
                onClick={handleSearch}
              >
                <Search className="h-[1.2vh] w-[1.2vh]" />
              </Button>
              <Input
                type="text"
                aria-label="Search"
                style={{
                  fontSize: 'var(--font-xs)',
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 'bold',
                }}
                className="h-[1.8vh] min-w-[30vw] bg-transparent border-none caret-current focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
              />
            </div>

            <button
              aria-expanded={isPortalOpen}
              aria-controls="nav-portal"
              onMouseEnter={() => setIsPortalOpen(true)}
              onClick={() => setIsPortalOpen((prev) => !prev)}
              className={cn(
                'transition-colors',
                isPortalOpen ? 'text-[#7370B2]' : 'hover:text-[#7370B2]',
              )}
            >
              Portal
            </button>
          </div>
        </nav>

        <AnimatePresence mode="wait">
          {isPortalOpen && (
            <motion.div
              id="nav-portal"
              role="navigation"
              aria-label="Portal navigation"
              variants={navVariants.portal}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute bottom-full left-0 mb-[0.5vh] w-full"
              style={{
                backgroundColor: appearance.backgroundColor,
                fontSize: 'var(--font-xs)',
              }}
              onMouseEnter={() => setIsPortalOpen(true)}
              onMouseLeave={() => setIsPortalOpen(false)}
            >
              <div className="container mx-auto p-[1vh] flex flex-col items-end gap-[6vh]">
                <motion.div
                  variants={navVariants.item}
                  className="w-[40vw] sm:w-[35vw] md:w-[32vw] lg:w-[28vw] xl:w-[25vw]"
                >
                  <Link href="/" className="block transition-colors hover:text-[#7370B2]">
                    <LinearLogo className="w-full h-auto" style={{ color: appearance.textColor }} />
                  </Link>
                </motion.div>

                {portalRows.map((row, rowIndex) => (
                  <motion.div
                    key={rowIndex}
                    variants={navVariants.item}
                    className="flex flex-col gap-[0.6vh] items-end"
                  >
                    {row.items.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className={cn(
                          'transition-colors text-right hover:text-[#7370B2]',
                          item.className,
                        )}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </motion.div>
                ))}

                <motion.div
                  variants={navVariants.item}
                  className="flex flex-col gap-[0.5vh] lg:hidden"
                >
                  {leftNavItems.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="transition-colors text-right hover:text-[#7370B2]"
                    >
                      {item.title}
                    </Link>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
