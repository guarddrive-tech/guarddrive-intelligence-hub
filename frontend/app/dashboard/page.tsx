'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(userData))
    
    // Fetch dashboard stats
    fetchDashboardStats(token)
  }, [])

  const fetchDashboardStats = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8001/api/dashboard/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-[#6e7491]">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-[#1e1e3f] bg-[#1a1a2e]/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00f0ff] to-[#7b2fff] bg-clip-text text-transparent">
            GuardDrive Intelligence Hub
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-[#6e7491]">{user?.full_name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-[#1e1e3f] text-[#ededed] rounded-lg hover:border-[#00f0ff] transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#ededed] mb-2">
            Bem-vindo, {user?.full_name}
          </h2>
          <p className="text-[#6e7491]">
            Central de Inteligência de Mercado & Data Room Comercial
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-lg p-6">
            <div className="text-[#6e7491] text-sm mb-2">Empresas Cadastradas</div>
            <div className="text-3xl font-bold text-[#00f0ff]">{stats?.total_companies || 0}</div>
          </div>
          <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-lg p-6">
            <div className="text-[#6e7491] text-sm mb-2">Leads Coletados</div>
            <div className="text-3xl font-bold text-[#7b2fff]">{stats?.total_leads || 0}</div>
          </div>
          <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-lg p-6">
            <div className="text-[#6e7491] text-sm mb-2">Dados de Mercado</div>
            <div className="text-3xl font-bold text-[#00ff88]">{stats?.total_market_data || 0}</div>
          </div>
          <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-lg p-6">
            <div className="text-[#6e7491] text-sm mb-2">Atividade Recente</div>
            <div className="text-3xl font-bold text-[#ededed]">{stats?.recent_activity || 0}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-lg p-6 text-left hover:border-[#00f0ff] transition-colors">
            <div className="text-2xl mb-2">🏢</div>
            <div className="text-[#ededed] font-semibold mb-1">Cadastrar Empresa</div>
            <div className="text-[#6e7491] text-sm">Adicionar nova empresa ao sistema</div>
          </button>
          <button className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-lg p-6 text-left hover:border-[#00f0ff] transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-[#ededed] font-semibold mb-1">Coletar Lead</div>
            <div className="text-[#6e7491] text-sm">Registrar novo lead de pesquisa</div>
          </button>
          <button className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-lg p-6 text-left hover:border-[#00f0ff] transition-colors">
            <div className="text-2xl mb-2">📈</div>
            <div className="text-[#ededed] font-semibold mb-1">Adicionar Dado de Mercado</div>
            <div className="text-[#6e7491] text-sm">Inserir nova métrica de mercado</div>
          </button>
        </div>

        {/* Data Room Section */}
        <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-[#ededed] mb-4">Data Room Comercial</h3>
          <p className="text-[#6e7491] mb-4">
            Acesso restrito a informações lapidadas para investidores e editais.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0a0a0f] border border-[#1e1e3f] rounded-lg p-4">
              <div className="text-[#00f0ff] font-semibold mb-2">📋 Visão Executiva</div>
              <div className="text-[#6e7491] text-sm">Resumo estratégico do ecossistema GuardDrive</div>
            </div>
            <div className="bg-[#0a0a0f] border border-[#1e1e3f] rounded-lg p-4">
              <div className="text-[#7b2fff] font-semibold mb-2">🔬 Provas Técnicas</div>
              <div className="text-[#6e7491] text-sm">Demonstração de capacidade técnica para editais</div>
            </div>
            <div className="bg-[#0a0a0f] border border-[#1e1e3f] rounded-lg p-4">
              <div className="text-[#00ff88] font-semibold mb-2">📊 Análise de Mercado</div>
              <div className="text-[#6e7491] text-sm">Dados lapidados de pesquisa de mercado</div>
            </div>
            <div className="bg-[#0a0a0f] border border-[#1e1e3f] rounded-lg p-4">
              <div className="text-[#ededed] font-semibold mb-2">🗺️ Roadmap Baseado em Dados</div>
              <div className="text-[#6e7491] text-sm">Planejamento informado por inteligência de mercado</div>
            </div>
          </div>
        </div>

        {/* Intelligence Section */}
        <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-lg p-6">
          <h3 className="text-xl font-bold text-[#ededed] mb-4">Visualizadores de Inteligência</h3>
          <p className="text-[#6e7491] mb-4">
            Visualização dos dados coletados na pesquisa de mercado.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0a0a0f] border border-[#1e1e3f] rounded-lg p-4">
              <div className="text-[#00f0ff] font-semibold mb-2">🗺️ Mapa de Oportunidades</div>
              <div className="text-[#6e7491] text-sm">Visualização geográfica de leads e empresas</div>
            </div>
            <div className="bg-[#0a0a0f] border border-[#1e1e3f] rounded-lg p-4">
              <div className="text-[#7b2fff] font-semibold mb-2">📈 Análise de Segmentos</div>
              <div className="text-[#6e7491] text-sm">Gráficos de mercado por vertical</div>
            </div>
            <div className="bg-[#0a0a0f] border border-[#1e1e3f] rounded-lg p-4">
              <div className="text-[#00ff88] font-semibold mb-2">⏱️ Timeline de Desenvolvimento</div>
              <div className="text-[#6e7491] text-sm">Roadmap baseado em dados coletados</div>
            </div>
            <div className="bg-[#0a0a0f] border border-[#1e1e3f] rounded-lg p-4">
              <div className="text-[#ededed] font-semibold mb-2">📊 Métricas de Engajamento</div>
              <div className="text-[#6e7491] text-sm">KPIs de coleta e análise de dados</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
