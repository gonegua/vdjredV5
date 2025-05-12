'use client'

import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/contexts/authContext'

export default function UserMenu({ user }: { user: User }) {
  const supabase = createClientComponentClient()
  const { refreshAuth } = useAuth()
  const apodo = user.user_metadata?.apodo || 'Usuario'
  const avatar =
    user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(apodo)

  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      await refreshAuth() // Usar el método del contexto para actualizar el estado
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <div className="relative">
      <img
        src={avatar}
        alt="Avatar"
        onClick={() => setOpen((prev) => !prev)}
        className="w-10 h-10 rounded-full cursor-pointer border-2 border-white"
      />
      {open && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="px-4 py-2 border-b text-gray-700 font-medium">{apodo}</div>
          <Link
            href="/perfil"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Perfil
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}


