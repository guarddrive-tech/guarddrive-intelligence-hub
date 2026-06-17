import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#00f0ff] to-[#7b2fff] bg-clip-text text-transparent">
            GuardDrive Intelligence Hub
          </h1>
          <p className="text-[#6e7491]">
            Central de Inteligência de Mercado & Data Room Comercial
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full py-3 px-4 bg-gradient-to-r from-[#00f0ff] to-[#7b2fff] text-[#0a0a0f] font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="block w-full py-3 px-4 border border-[#1e1e3f] text-[#ededed] rounded-lg hover:border-[#00f0ff] transition-colors"
          >
            Criar Conta
          </Link>
        </div>

        <div className="mt-8 text-center text-sm text-[#6e7491]">
          <p>Acesso restrito ao escritório RS e equipe Adriano</p>
        </div>
      </div>
    </div>
  )
}
