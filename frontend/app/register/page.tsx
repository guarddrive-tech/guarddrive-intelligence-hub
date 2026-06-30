'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiFetch } from '../../lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company: '',
    role: 'researcher'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar conta')
      }

      // Auto login after registration
      const loginFormData = new FormData()
      loginFormData.append('username', formData.email)
      loginFormData.append('password', formData.password)

      const loginResponse = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: loginFormData,
      })

      const loginData = await loginResponse.json()
      
      localStorage.setItem('token', loginData.access_token)
      localStorage.setItem('user', JSON.stringify(loginData.user))
      
      router.push('/dashboard')
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] py-12">
      <div className="max-w-md w-full mx-4">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00f0ff] to-[#7b2fff] bg-clip-text text-transparent">
              GuardDrive Intelligence Hub
            </h1>
          </Link>
          <p className="text-[#6e7491] mt-2">Crie sua conta</p>
        </div>

        <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-xl p-6 shadow-[0_0_40px_rgba(0,240,255,0.05)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-[#ededed] mb-2">
                Nome Completo
              </label>
              <input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e3f] rounded-lg text-[#ededed] focus:border-[#00f0ff] focus:outline-none transition-colors placeholder:text-[#3a3a5c]"
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#ededed] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e3f] rounded-lg text-[#ededed] focus:border-[#00f0ff] focus:outline-none transition-colors placeholder:text-[#3a3a5c]"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-[#ededed] mb-2">
                Empresa <span className="text-[#3a3a5c]">(Opcional)</span>
              </label>
              <input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e3f] rounded-lg text-[#ededed] focus:border-[#00f0ff] focus:outline-none transition-colors placeholder:text-[#3a3a5c]"
                placeholder="Nome da sua empresa"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#ededed] mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e3f] rounded-lg text-[#ededed] focus:border-[#00f0ff] focus:outline-none transition-colors placeholder:text-[#3a3a5c]"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-[#ededed] mb-2">
                Função
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e3f] rounded-lg text-[#ededed] focus:border-[#00f0ff] focus:outline-none transition-colors"
              >
                <option value="researcher">Pesquisador</option>
                <option value="analyst">Analista</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#00f0ff] to-[#7b2fff] text-[#0a0a0f] font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-[#6e7491]">Já tem uma conta? </span>
            <Link href="/login" className="text-[#00f0ff] hover:underline">
              Fazer login
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
