'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)

      const response = await fetch('http://localhost:8001/api/auth/login', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Credenciais inválidas')
      }

      const data = await response.json()
      
      // Store token
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      router.push('/dashboard')
    } catch (err) {
      setError('Email ou senha incorretos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]">
      <div className="max-w-md w-full mx-4">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00f0ff] to-[#7b2fff] bg-clip-text text-transparent">
              GuardDrive Intelligence Hub
            </h1>
          </Link>
          <p className="text-[#6e7491] mt-2">Acesse a Central de Inteligência</p>
        </div>

        <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#ededed] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e3f] rounded-lg text-[#ededed] focus:border-[#00f0ff] focus:outline-none transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#ededed] mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e3f] rounded-lg text-[#ededed] focus:border-[#00f0ff] focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#00f0ff] to-[#7b2fff] text-[#0a0a0f] font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-[#6e7491]">Não tem uma conta? </span>
            <Link href="/register" className="text-[#00f0ff] hover:underline">
              Criar conta
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-[#6e7491]">
          <Link href="/" className="hover:text-[#00f0ff] transition-colors">
            ← Voltar
          </Link>
        </div>
      </div>
    </div>
  )
}
