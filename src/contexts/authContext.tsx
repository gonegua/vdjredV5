'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

type AuthContextType = {
  user: User | null | undefined // undefined = aún cargando, null = no autenticado
  loading: boolean
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  loading: true,
  refreshAuth: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode
  initialUser: User | null
}) {
  const [user, setUser] = useState<User | null | undefined>(initialUser ?? undefined)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const initialized = useRef(false)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = useSupabaseClient()

  const justLoggedIn = searchParams.get('auth_success') === 'true'

  const refreshAuth = async () => {
    setLoading(true)
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error al obtener la sesión:', error)
        setUser(null)
      } else {
        const newUser = session?.user || null
        console.log('[refreshAuth] Usuario:', newUser?.email || 'No autenticado')
        setUser(newUser)
      }
    } catch (e) {
      console.error('Error en refreshAuth:', e)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[Auth] Verificando sesión al volver a la pestaña')
        refreshAuth()
      }
    }

    const initializeAuth = async () => {
      if (initialized.current) return
      initialized.current = true

      await refreshAuth()
      setInitialLoading(false)

      // Si acaba de iniciar sesión, limpia la URL
      if (justLoggedIn) {
        const params = new URLSearchParams()
        searchParams.forEach((value, key) => params.append(key, value))
        params.delete('auth_success')
        const newPath = `${pathname}?${params.toString()}`
        router.replace(newPath, { scroll: false })
      }

      // Listener de cambios de autenticación
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('[Auth] Evento:', event)
          if (event === 'SIGNED_IN') {
            console.log('[Auth] Sesión iniciada:', session?.user?.email)
            setUser(session?.user || null)
          } else if (event === 'SIGNED_OUT') {
            console.log('[Auth] Sesión cerrada')
            setUser(null)
          }
        }
      )

      document.addEventListener('visibilitychange', handleVisibilityChange)

      // Clean up
      return () => {
        authListener?.subscription.unsubscribe()
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }

    initializeAuth()
  }, [justLoggedIn, pathname, router, searchParams, supabase])

  return (
    <AuthContext.Provider value={{ user, loading: initialLoading, refreshAuth }}>
      {!initialLoading && children}
    </AuthContext.Provider>
  )
}
