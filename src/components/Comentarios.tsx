'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@contexts/authContext'

export default function Comentarios({ juegoId }: { juegoId: string }) {
  const [comentarios, setComentarios] = useState<any[]>([])
  const [cargandoComentarios, setCargandoComentarios] = useState(true)
  const { user, loading } = useAuth()

  useEffect(() => {
    const cargarComentarios = async () => {
      if (!juegoId) return

      // Realizamos la consulta para traer los comentarios junto con los apodos de los perfiles
      const { data, error } = await supabase
        .from('comentarios')
        .select(`
          id,
          texto,
          fecha,
          usuario_id,
          usuario_email,
          perfiles:apodo
        `)
        .eq('juego_id', juegoId)
        .order('fecha', { ascending: false })

      if (error) {
        console.error('[Comentarios] Error al cargar comentarios:', error)
      } else {
        setComentarios(data || [])
      }

      setCargandoComentarios(false)
    }

    cargarComentarios()
  }, [juegoId])

  const eliminarComentario = async (id: string) => {
    if (!user) return

    const { error } = await supabase
      .from('comentarios')
      .delete()
      .eq('id', id)
      .eq('usuario_id', user.id)

    if (error) {
      console.error('[Comentarios] Error al eliminar comentario:', error)
    } else {
      setComentarios((prev) => prev.filter((comentario) => comentario.id !== id))
    }
  }

  if (loading || user === undefined || cargandoComentarios) {
    return <p>Cargando...</p>
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-2">Comentarios</h2>

      {user ? (
        comentarios.length === 0 ? (
          <p>No hay comentarios aún.</p>
        ) : (
          <ul className="space-y-4">
            {comentarios.map((comentario) => (
              <li key={comentario.id} className="border p-3 rounded relative">
                <p className="text-sm text-gray-700">{comentario.texto}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Por: {comentario.perfiles?.apodo || comentario.usuario_email || 'Usuario desconocido'}
                </p>

                {user.id === comentario.usuario_id && (
                  <button
                    onClick={() => eliminarComentario(comentario.id)}
                    className="absolute top-2 right-2 text-red-500 text-sm hover:underline"
                  >
                    Eliminar
                  </button>
                )}
              </li>
            ))}
          </ul>
        )
      ) : (
        <p className="text-sm text-red-600 font-semibold">Inicia sesión para dejar un comentario.</p>
      )}
    </div>
  )
}
