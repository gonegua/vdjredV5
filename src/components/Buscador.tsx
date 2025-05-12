'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function Buscador() {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const current = new URLSearchParams(searchParams.toString())
    if (query.trim()) {
      current.set('q', query.trim())
    } else {
      current.delete('q')
    }
    router.push(`/?${current.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="mb-4 flex gap-2">
      <input
        type="text"
        placeholder="Buscar juegos..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 rounded">
        Buscar
      </button>
    </form>
  )
}
