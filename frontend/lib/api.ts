// Centraliza a URL base da API.
// Em dev local: http://localhost:8001 (via proxy next.config.js ou direto)
// Em produção: NEXT_PUBLIC_API_URL ou string vazia para usar o same origin

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export async function apiFetch(path: string, options?: RequestInit) {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, options)
  return res
}

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}
