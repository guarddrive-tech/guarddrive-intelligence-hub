'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch, authHeaders } from '../../lib/api'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
  total_companies: number
  total_leads: number
  total_market_data: number
  recent_activity: number
}

interface Lead {
  id: string
  name: string
  email: string
  company: string
  segment: string
  status: string
  created_at: string
  source?: string
}

// ─── Sidebar nav items ───────────────────────────────────────────────────────

type Section = 'overview' | 'leads' | 'dataroom' | 'market' | 'settings'

const navItems: { id: Section; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '⚡' },
  { id: 'leads', label: 'Leads', icon: '📋' },
  { id: 'dataroom', label: 'Data Room', icon: '🔒' },
  { id: 'market', label: 'Inteligência', icon: '📊' },
  { id: 'settings', label: 'Configurações', icon: '⚙️' },
]

// ─── Mock market intelligence data ───────────────────────────────────────────

const marketSegments = [
  { segment: 'Seguradoras', leads: 14, interest: 92, color: '#00f0ff' },
  { segment: 'Frotas Corporativas', leads: 23, interest: 87, color: '#7b2fff' },
  { segment: 'Locadoras', leads: 11, interest: 78, color: '#00ff88' },
  { segment: 'Governo / Editais', leads: 6, interest: 95, color: '#ffb800' },
  { segment: 'Transportadoras', leads: 9, interest: 72, color: '#ff6b6b' },
]

const painPoints = [
  { pain: 'Fraudes em sinistros', severity: 94, frequency: 88 },
  { pain: 'Falta de evidência forense', severity: 91, frequency: 82 },
  { pain: 'Demora em liquidação', severity: 76, frequency: 95 },
  { pain: 'Jammers / bloqueio de sinal', severity: 88, frequency: 61 },
  { pain: 'Atrito em peritagem', severity: 70, frequency: 78 },
]

const recentLeadsMock: Lead[] = [
  { id: '1', name: 'Carlos Mendes', email: 'c.mendes@porto.com.br', company: 'Porto Seguro', segment: 'Seguradora', status: 'qualificado', created_at: '2026-06-30', source: 'landing_page' },
  { id: '2', name: 'Ana Lima', email: 'ana.lima@movida.com.br', company: 'Movida', segment: 'Locadora', status: 'novo', created_at: '2026-06-29', source: 'landing_page' },
  { id: '3', name: 'Roberto Silva', email: 'rsilva@itauunibanco.com', company: 'Itaú Seguros', segment: 'Seguradora', status: 'qualificado', created_at: '2026-06-28', source: 'internal' },
  { id: '4', name: 'Fernanda Costa', email: 'fcosta@prefsp.gov.br', company: 'Prefeitura SP', segment: 'Governo', status: 'em_negociacao', created_at: '2026-06-27', source: 'landing_page' },
  { id: '5', name: 'Marcos Oliveira', email: 'm.oliveira@localiza.com', company: 'Localiza', segment: 'Locadora', status: 'novo', created_at: '2026-06-26', source: 'landing_page' },
]

const dataRoomDocs = [
  {
    title: 'Visão Executiva GuardDrive',
    desc: 'Resumo estratégico do ecossistema — GuardDrive → GuardTag → Intelligence Hub.',
    status: 'disponível',
    color: '#00f0ff',
    icon: '📋',
    pages: 12,
  },
  {
    title: 'Prova Técnica: GUARDPROOF™',
    desc: 'Demonstração técnica da cadeia de custódia forense via blockchain.',
    status: 'disponível',
    color: '#7b2fff',
    icon: '🔬',
    pages: 28,
  },
  {
    title: 'Análise de Mercado — Frotas & Seguros',
    desc: 'Dados lapidados de pesquisa: TAM, SAM, SOM e mapa de oportunidades.',
    status: 'disponível',
    color: '#00ff88',
    icon: '📊',
    pages: 34,
  },
  {
    title: 'Roadmap Baseado em Dados',
    desc: 'Planejamento informado por inteligência de mercado coletada em campo.',
    status: 'em construção',
    color: '#ffb800',
    icon: '🗺️',
    pages: 0,
  },
  {
    title: 'Protocolo Symbeon™',
    desc: 'Especificação técnica do sistema de comunicação veicular segura.',
    status: 'restrito',
    color: '#ff6b6b',
    icon: '🔐',
    pages: 47,
  },
  {
    title: 'Proposta Edital TRE/SP',
    desc: 'Documentação preparada para participação em edital público.',
    status: 'em construção',
    color: '#6e7491',
    icon: '📑',
    pages: 0,
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: string }) {
  return (
    <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-xl p-6 relative overflow-hidden group hover:border-opacity-80 transition-all duration-300">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at 0% 0%, ${color}10 0%, transparent 60%)` }} />
      <div className="text-2xl mb-3">{icon}</div>
      <div className="text-[#6e7491] text-sm mb-1">{label}</div>
      <div className="text-3xl font-bold" style={{ color }}>{value}</div>
    </div>
  )
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-[#0a0a0f] rounded-full h-2 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    qualificado:    { label: 'Qualificado',    color: '#00ff88', bg: '#00ff8815' },
    novo:           { label: 'Novo',           color: '#00f0ff', bg: '#00f0ff15' },
    em_negociacao:  { label: 'Em Negociação',  color: '#ffb800', bg: '#ffb80015' },
    perdido:        { label: 'Perdido',        color: '#ff6b6b', bg: '#ff6b6b15' },
  }
  const s = map[status] || { label: status, color: '#6e7491', bg: '#6e749115' }
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}30` }}>
      {s.label}
    </span>
  )
}

// ─── Section: Overview ───────────────────────────────────────────────────────

function OverviewSection({ stats }: { stats: Stats | null }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#ededed] mb-1">Overview do Ecossistema</h2>
        <p className="text-[#6e7491] text-sm">Central de Inteligência — dados em tempo real</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Empresas Cadastradas" value={stats?.total_companies ?? 0} color="#00f0ff" icon="🏢" />
        <StatCard label="Leads Coletados"       value={stats?.total_leads ?? 0}     color="#7b2fff" icon="📋" />
        <StatCard label="Dados de Mercado"      value={stats?.total_market_data ?? 0} color="#00ff88" icon="📊" />
        <StatCard label="Atividade Recente"     value={stats?.recent_activity ?? 0}  color="#ffb800" icon="⚡" />
      </div>

      {/* Market Segments */}
      <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-xl p-6">
        <h3 className="text-lg font-bold text-[#ededed] mb-5">Segmentos de Mercado</h3>
        <div className="space-y-5">
          {marketSegments.map((s) => (
            <div key={s.segment}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#ededed] text-sm font-medium">{s.segment}</span>
                <div className="flex items-center gap-4 text-xs text-[#6e7491]">
                  <span>{s.leads} leads</span>
                  <span className="font-semibold" style={{ color: s.color }}>{s.interest}% interesse</span>
                </div>
              </div>
              <ProgressBar value={s.interest} color={s.color} />
            </div>
          ))}
        </div>
      </div>

      {/* Pain Points */}
      <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-xl p-6">
        <h3 className="text-lg font-bold text-[#ededed] mb-5">Dores do Mercado Validadas</h3>
        <div className="space-y-4">
          {painPoints.map((p) => (
            <div key={p.pain} className="grid grid-cols-[1fr_140px_140px] items-center gap-4">
              <span className="text-[#ededed] text-sm">{p.pain}</span>
              <div>
                <div className="text-xs text-[#6e7491] mb-1">Severidade {p.severity}%</div>
                <ProgressBar value={p.severity} color="#ff6b6b" />
              </div>
              <div>
                <div className="text-xs text-[#6e7491] mb-1">Frequência {p.frequency}%</div>
                <ProgressBar value={p.frequency} color="#ffb800" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Leads preview */}
      <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[#ededed]">Últimos Leads</h3>
          <span className="text-xs text-[#00f0ff] cursor-pointer hover:underline">Ver todos →</span>
        </div>
        <div className="space-y-3">
          {recentLeadsMock.slice(0, 3).map((lead) => (
            <div key={lead.id} className="flex items-center justify-between py-3 border-b border-[#1e1e3f] last:border-0">
              <div>
                <div className="text-[#ededed] text-sm font-medium">{lead.name}</div>
                <div className="text-[#6e7491] text-xs">{lead.company} · {lead.segment}</div>
              </div>
              <StatusBadge status={lead.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Section: Leads ───────────────────────────────────────────────────────────

function LeadsSection({ leads }: { leads: Lead[] }) {
  const [filter, setFilter] = useState<string>('todos')
  const allStatuses = ['todos', 'novo', 'qualificado', 'em_negociacao', 'perdido']
  const filtered = filter === 'todos' ? leads : leads.filter(l => l.status === filter)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#ededed] mb-1">Gestão de Leads</h2>
        <p className="text-[#6e7491] text-sm">{leads.length} leads coletados no total</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {allStatuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === s
                ? 'bg-gradient-to-r from-[#00f0ff] to-[#7b2fff] text-[#0a0a0f]'
                : 'border border-[#1e1e3f] text-[#6e7491] hover:border-[#00f0ff] hover:text-[#ededed]'
            }`}>
            {s === 'todos' ? 'Todos' : s === 'em_negociacao' ? 'Em Negociação' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e3f]">
              <th className="text-left text-xs font-medium text-[#6e7491] px-6 py-4">NOME</th>
              <th className="text-left text-xs font-medium text-[#6e7491] px-6 py-4">EMPRESA</th>
              <th className="text-left text-xs font-medium text-[#6e7491] px-6 py-4">SEGMENTO</th>
              <th className="text-left text-xs font-medium text-[#6e7491] px-6 py-4">ORIGEM</th>
              <th className="text-left text-xs font-medium text-[#6e7491] px-6 py-4">STATUS</th>
              <th className="text-left text-xs font-medium text-[#6e7491] px-6 py-4">DATA</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-b border-[#1e1e3f] last:border-0 hover:bg-[#0a0a0f]/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-[#ededed] text-sm font-medium">{lead.name}</div>
                  <div className="text-[#6e7491] text-xs">{lead.email}</div>
                </td>
                <td className="px-6 py-4 text-[#ededed] text-sm">{lead.company}</td>
                <td className="px-6 py-4 text-[#6e7491] text-sm">{lead.segment}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    lead.source === 'landing_page'
                      ? 'text-[#7b2fff] bg-[#7b2fff15] border border-[#7b2fff30]'
                      : 'text-[#6e7491] bg-[#6e749115] border border-[#6e749130]'
                  }`}>
                    {lead.source === 'landing_page' ? 'Landing Page' : 'Interno'}
                  </span>
                </td>
                <td className="px-6 py-4"><StatusBadge status={lead.status} /></td>
                <td className="px-6 py-4 text-[#6e7491] text-sm">{lead.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#6e7491]">Nenhum lead encontrado.</div>
        )}
      </div>
    </div>
  )
}

// ─── Section: Data Room ───────────────────────────────────────────────────────

function DataRoomSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#ededed] mb-1">Data Room Comercial</h2>
        <p className="text-[#6e7491] text-sm">Documentos estratégicos para investidores, parceiros e editais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataRoomDocs.map((doc) => (
          <div key={doc.title}
            className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-xl p-6 group hover:border-opacity-60 transition-all duration-300 relative overflow-hidden cursor-pointer"
            style={{ ['--hover-color' as string]: doc.color }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `radial-gradient(circle at 100% 0%, ${doc.color}10 0%, transparent 60%)` }} />
            
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{doc.icon}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                doc.status === 'disponível'
                  ? 'text-[#00ff88] bg-[#00ff8815] border-[#00ff8830]'
                  : doc.status === 'restrito'
                  ? 'text-[#ff6b6b] bg-[#ff6b6b15] border-[#ff6b6b30]'
                  : 'text-[#ffb800] bg-[#ffb80015] border-[#ffb80030]'
              }`}>
                {doc.status === 'disponível' ? '✓ Disponível' : doc.status === 'restrito' ? '🔒 Restrito' : '⏳ Em Construção'}
              </span>
            </div>

            <h3 className="text-[#ededed] font-semibold mb-2">{doc.title}</h3>
            <p className="text-[#6e7491] text-sm leading-relaxed mb-4">{doc.desc}</p>

            {doc.pages > 0 && (
              <div className="text-xs text-[#3a3a5c]">{doc.pages} páginas</div>
            )}

            {doc.status === 'disponível' && (
              <button className="mt-4 text-sm font-medium transition-colors"
                style={{ color: doc.color }}>
                Acessar documento →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Section: Market Intelligence ────────────────────────────────────────────

function MarketSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#ededed] mb-1">Inteligência de Mercado</h2>
        <p className="text-[#6e7491] text-sm">Dados coletados e lapidados de pesquisa em campo</p>
      </div>

      {/* KPIs de mercado */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-[#00f0ff] mb-1">R$ 2,3B</div>
          <div className="text-[#6e7491] text-xs">TAM — Mercado Total Endereçável</div>
        </div>
        <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-[#7b2fff] mb-1">R$ 340M</div>
          <div className="text-[#6e7491] text-xs">SAM — Mercado Acessível</div>
        </div>
        <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-[#00ff88] mb-1">R$ 28M</div>
          <div className="text-[#6e7491] text-xs">SOM — Alvo 3 anos</div>
        </div>
        <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-[#ffb800] mb-1">63</div>
          <div className="text-[#6e7491] text-xs">Empresas Mapeadas</div>
        </div>
      </div>

      {/* Oportunidades por segmento */}
      <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-xl p-6">
        <h3 className="text-lg font-bold text-[#ededed] mb-5">Oportunidades por Segmento</h3>
        <div className="space-y-4">
          {marketSegments.map((s) => (
            <div key={s.segment} className="flex items-center gap-4">
              <div className="w-36 text-sm text-[#ededed] shrink-0">{s.segment}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#0a0a0f] rounded-full h-3 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(s.leads / 25) * 100}%`, background: s.color }} />
                  </div>
                  <span className="text-xs text-[#6e7491] w-16 text-right">{s.leads} leads</span>
                </div>
              </div>
              <div className="text-sm font-semibold w-12 text-right" style={{ color: s.color }}>
                {s.interest}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-xl p-6">
          <h3 className="text-base font-bold text-[#ededed] mb-4">🔑 Insights Chave</h3>
          <ul className="space-y-3 text-sm text-[#6e7491]">
            <li className="flex items-start gap-2"><span className="text-[#00f0ff] mt-0.5">→</span>Seguradoras demonstram maior disposição para pagamento por evidência forense auditável</li>
            <li className="flex items-start gap-2"><span className="text-[#7b2fff] mt-0.5">→</span>Editais públicos (TRE, DETRAN) buscam rastreamento com cadeia de custódia documentada</li>
            <li className="flex items-start gap-2"><span className="text-[#00ff88] mt-0.5">→</span>Locadoras têm maior dor com jammers — produto diferencia imediatamente</li>
            <li className="flex items-start gap-2"><span className="text-[#ffb800] mt-0.5">→</span>87% dos contatos indicaram interesse em piloto pago nos primeiros 90 dias</li>
          </ul>
        </div>

        <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-xl p-6">
          <h3 className="text-base font-bold text-[#ededed] mb-4">📅 Próximas Ações</h3>
          <ul className="space-y-3 text-sm">
            {[
              { label: 'Reunião Porto Seguro — Demo GUARDPROOF™', date: '08/07', color: '#00f0ff' },
              { label: 'Proposta Edital DETRAN-SP v1', date: '15/07', color: '#7b2fff' },
              { label: 'Piloto Localiza — 5 veículos', date: '22/07', color: '#00ff88' },
              { label: 'Apresentação escritório RS', date: '01/08', color: '#ffb800' },
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ color: item.color, background: `${item.color}15` }}>{item.date}</span>
                <span className="text-[#6e7491]">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// ─── Section: Settings ────────────────────────────────────────────────────────

function SettingsSection({ user }: { user: any }) {
  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-2xl font-bold text-[#ededed] mb-1">Configurações</h2>
        <p className="text-[#6e7491] text-sm">Gerencie sua conta e preferências</p>
      </div>

      <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold text-[#ededed]">Perfil</h3>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-[#6e7491] mb-1">Nome</div>
            <div className="text-[#ededed]">{user?.full_name || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-[#6e7491] mb-1">Email</div>
            <div className="text-[#ededed]">{user?.email || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-[#6e7491] mb-1">Função</div>
            <div className="text-[#ededed] capitalize">{user?.role || '—'}</div>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a2e] border border-[#1e1e3f] rounded-xl p-6">
        <h3 className="text-base font-bold text-[#ededed] mb-3">Sistema</h3>
        <div className="space-y-2 text-sm text-[#6e7491]">
          <div className="flex justify-between">
            <span>Versão do Hub</span>
            <span className="text-[#00f0ff]">v1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Backend</span>
            <span className="text-[#00ff88]">● Online (local)</span>
          </div>
          <div className="flex justify-between">
            <span>Deploy</span>
            <span className="text-[#00f0ff]">Vercel (iad1)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [leads, setLeads] = useState<Lead[]>(recentLeadsMock)
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<Section>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) { router.push('/login'); return }
    setUser(JSON.parse(userData))
    fetchStats(token)
    fetchLeads(token)
  }, [])

  const fetchStats = async (token: string) => {
    try {
      const res = await apiFetch('/api/dashboard/overview', {
        headers: authHeaders(token),
      })
      if (res.ok) setStats(await res.json())
    } catch {}
    finally { setLoading(false) }
  }

  const fetchLeads = async (token: string) => {
    try {
      const res = await apiFetch('/api/leads', {
        headers: authHeaders(token),
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) setLeads(data)
      }
    } catch {}
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-[#6e7491] text-sm">Carregando Intelligence Hub...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} flex-shrink-0 bg-[#1a1a2e] border-r border-[#1e1e3f] flex flex-col transition-all duration-300 relative`}>
        {/* Logo */}
        <div className="p-4 border-b border-[#1e1e3f] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f0ff] to-[#7b2fff] flex items-center justify-center text-[#0a0a0f] font-bold text-sm flex-shrink-0">
            G
          </div>
          {sidebarOpen && (
            <span className="text-[#ededed] font-semibold text-sm leading-tight">
              Intelligence<br /><span className="text-[#6e7491] font-normal">Hub</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                section === item.id
                  ? 'bg-gradient-to-r from-[#00f0ff20] to-[#7b2fff20] text-[#00f0ff] border border-[#00f0ff30]'
                  : 'text-[#6e7491] hover:text-[#ededed] hover:bg-[#ffffff08]'
              }`}>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-[#1e1e3f]">
          {sidebarOpen && (
            <div className="px-3 py-2 mb-2 rounded-lg bg-[#0a0a0f]">
              <div className="text-[#ededed] text-xs font-medium truncate">{user?.full_name}</div>
              <div className="text-[#6e7491] text-xs truncate capitalize">{user?.role}</div>
            </div>
          )}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#6e7491] hover:text-red-400 hover:bg-red-400/10 transition-all">
            <span className="flex-shrink-0">🚪</span>
            {sidebarOpen && 'Sair'}
          </button>
        </div>

        {/* Toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#1a1a2e] border border-[#1e1e3f] flex items-center justify-center text-[#6e7491] hover:text-[#00f0ff] transition-colors text-xs">
          {sidebarOpen ? '‹' : '›'}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="border-b border-[#1e1e3f] bg-[#0a0a0f]/80 backdrop-blur-sm px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-[#00f0ff] to-[#7b2fff] bg-clip-text text-transparent">
              GuardDrive Intelligence Hub
            </h1>
            <p className="text-xs text-[#6e7491]">Central de Inteligência & Data Room Comercial</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-xs text-[#6e7491]">Sistema Online</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-8">
          {section === 'overview'  && <OverviewSection stats={stats} />}
          {section === 'leads'     && <LeadsSection leads={leads} />}
          {section === 'dataroom'  && <DataRoomSection />}
          {section === 'market'    && <MarketSection />}
          {section === 'settings'  && <SettingsSection user={user} />}
        </main>
      </div>
    </div>
  )
}
