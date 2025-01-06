'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import logo from '@/assets/logo.svg' // 确保路径正确

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [showLogin, setShowLogin] = useState(false) // 新增状态
  const [formErrors, setFormErrors] = useState<{ [key: string]: string | boolean }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormErrors({}) // 清空之前的错误

    try {
      // 表单验证逻辑
      if (!email) setFormErrors((prev) => ({ ...prev, email: true }))
      if (!password) setFormErrors((prev) => ({ ...prev, password: true }))

      if (Object.keys(formErrors).length > 0) {
        toast.error('请填写所有必填项')
        return
      }

      if (isRegister) {
        const response = await fetch('/api/residents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            name: name || 'Anonymous',
            phone,
          }),
        })

        if (response.ok) {
          toast.success('注册成功，请登录')
          setIsRegister(false)
        } else {
          const data = await response.json()
          toast.error(data.message || '注册失败')
        }
      } else {
        const response = await fetch('/api/residents/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()
        if (response.ok) {
          localStorage.setItem('payload-token', data.token)
          router.push('/dashboard')
        } else {
          toast.error(data.message || '登录失败')
        }
      }
    } catch (_error) {
      toast.error(isRegister ? '注册时发生错误' : '登录时发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="min-h-screen relative flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo/Form Container */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!showLogin ? (
            // Logo
            <motion.div
              key="logo"
              className="w-[30vw] min-w-[200px] max-w-[400px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image src={logo} alt="Logo" className="w-full h-auto" priority />
            </motion.div>
          ) : (
            // Login Form
            <motion.form
              id="loginForm"
              key="form"
              className="w-full max-w-[600px] px-[5%] space-y-[2vh]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              onSubmit={handleSubmit}
            >
              {/* Email Input */}
              <div className="relative">
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full h-[min(8vh,60px)] px-[5%] rounded-lg bg-[var(--color-input-light)] text-[var(--color-dark)] placeholder:text-[var(--color-dark)]/60 focus:outline-none text-small-en ${
                    formErrors.email ? 'bg-[#ff000080]' : ''
                  }`}
                  required
                />
                <span className="absolute right-[6%] top-1/2 -translate-y-1/2 text-[#ff0000]">
                  *
                </span>
              </div>

              {/* Optional Fields */}
              {isRegister && (
                <div className="flex w-full gap-[2%]">
                  <Input
                    name="name"
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-[min(8vh,60px)] px-[5%] rounded-lg bg-[var(--color-input-light)] text-[var(--color-dark)] placeholder:text-[var(--color-dark)]/60 focus:outline-none text-small-en"
                  />
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-[min(8vh,60px)] px-[5%] rounded-lg bg-[var(--color-input-light)] text-[var(--color-dark)] placeholder:text-[var(--color-dark)]/60 focus:outline-none text-small-en"
                  />
                </div>
              )}

              {/* Password Input */}
              <div className="relative">
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full h-[min(8vh,60px)] px-[5%] rounded-lg bg-[var(--color-input-light)] text-[var(--color-dark)] placeholder:text-[var(--color-dark)]/60 focus:outline-none text-small-en ${
                    formErrors.password ? 'bg-[#ff000080]' : ''
                  }`}
                  required
                />
                <span className="absolute right-[6%] top-1/2 -translate-y-1/2 text-[#ff0000]">
                  *
                </span>
              </div>

              {/* Toggle Register/Login */}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="w-full text-center text-small-en text-[var(--color-dark)]/60 hover:opacity-80 transition-opacity"
              >
                {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Enter Button */}
      <motion.button
        type={showLogin ? 'submit' : 'button'}
        form={showLogin ? 'loginForm' : undefined}
        onClick={!showLogin ? () => setShowLogin(true) : undefined}
        className="absolute top-[75%] left-1/2 -translate-x-1/2 text-large-en text-[var(--color-dark)] hover:opacity-80 transition-opacity"
        animate={{ opacity: 1 }}
        whileHover={{ opacity: 0.6 }}
        disabled={isLoading}
      >
        {isLoading ? '处理中...' : showLogin ? (isRegister ? '注册' : '登录') : '进入'}
      </motion.button>
    </motion.div>
  )
}
