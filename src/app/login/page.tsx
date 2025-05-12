'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from './auth-actions'
import { useAuth } from '@contexts/authContext' // ajusta el path según tu estructura


export default function Login({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const { refreshAuth } = useAuth() // 👈 este hook accede al contexto

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
  
    const formData = new FormData(e.currentTarget)
    const action = isRegistering ? signUp : signIn
    const result = await action(formData)
  
    setLoading(false)
  
    if (result?.error) {
      setError(result.error)
    } else if ('success' in result || 'message' in result) {
      // No llames refreshAuth aquí, la sesión aún no se ha propagado del todo
  
      // 🔁 Redirige y fuerza recarga como si fuera F5
      window.location.href = '/?auth_success=true'
    } else {
      setError("Ocurrió un error inesperado")
    }
  }
  
  

  return (
    <div className="flex w-full flex-1 flex-col justify-center gap-2 px-8 sm:max-w-md">
      <Link
        href="/"
        className="bg-btn-background hover:bg-btn-background-hover group absolute left-8 top-8 flex items-center rounded-md px-4 py-2 text-sm text-foreground no-underline"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </Link>

      <form
        className="flex w-full flex-1 flex-col justify-center gap-2 text-foreground animate-in"
        onSubmit={handleSubmit}
      >
        <label className="text-md" htmlFor="email">Correo</label>
        <input
          className="mb-6 rounded-md border bg-inherit px-4 py-2"
          name="email"
          placeholder="you@example.com"
          required
        />

        <label className="text-md" htmlFor="password">Contraseña</label>
        <input
          className="mb-6 rounded-md border bg-inherit px-4 py-2"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />

        {isRegistering && (
          <>
            <label className="text-md" htmlFor="apodo">Apodo</label>
            <input
              className="mb-6 rounded-md border bg-inherit px-4 py-2"
              name="apodo"
              placeholder="Tu apodo"
              required
            />
          </>
        )}

        <button
          className="mb-2 rounded-md bg-green-700 px-4 py-2 text-foreground"
          disabled={loading}
        >
          {loading
            ? isRegistering
              ? 'Registrando...'
              : 'Ingresando...'
            : isRegistering
              ? 'Confirmar Registro'
              : 'Ingresar'}
        </button>

        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          className="mb-2 rounded-md border border-foreground/20 px-4 py-2 text-foreground"
        >
          {isRegistering ? 'Cancelar registro' : 'Registrarse'}
        </button>

        {(error || searchParams?.message) && (
          <div className="mt-4 bg-foreground/10 p-4 text-center text-foreground space-y-2">
            <p>{error || searchParams.message}</p>
            {['Could not authenticate', 'Invalid login credentials'].some(msg =>
              (error || searchParams.message)?.includes(msg)
            ) && (
              <a href="/forgot-password" className="text-blue-600 font-semibold hover:underline block mt-2">
                ¿Olvidaste la contraseña?
              </a>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
