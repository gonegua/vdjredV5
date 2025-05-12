'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/authContext'
import UserMenu from './UserMenu'

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/categorias', label: 'Categorías' },
  { href: '/favoritos', label: 'Favoritos' },
]

export default function Navbar() {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // 🔒 Mientras loading, no renderizar el navbar (ni siquiera el loader del icono)
  if (loading) return null

  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <Link href="/">AA 🎮</Link>
        </h1>
        <ul className="flex space-x-6">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`hover:underline ${
                  pathname === link.href ? 'font-semibold text-blue-400' : ''
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="min-w-[100px] flex justify-end">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}



