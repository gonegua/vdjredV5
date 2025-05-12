'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/authContext'

export default function CommentSection({ juegoId }: { juegoId: string }) {
  const { user, loading } = useAuth()
  const [comentarios, setComentarios] = useState<any[]>([])
  const [nuevoComentario, setNuevoComentario] = useState('')

  useEffect(() => {
    const fetchComentarios = async () => {
      const { data, error } = await supabase
        .from('comentarios')
        .select(`
          id,
          texto,
          fecha,
          usuario_email,
          usuario_id,
          perfiles (
            apodo
          )
        `)
        .eq('juego_id', juegoId)
        .order('fecha', { ascending: false })

      if (error) {
        console.error('Error al cargar comentarios:', error.message)
      } else {
        setComentarios(data || [])
      }
    }

    fetchComentarios()
  }, [juegoId])

  const enviarComentario = async () => {
    if (!nuevoComentario.trim() || !user) return

    // Obtener el apodo del perfil del usuario
    const { data: perfil, error: errorPerfil } = await supabase
      .from('perfiles')
      .select('apodo')
      .eq('id', user.id) // Asegúrate de que perfiles.id sea igual a auth user.id
      .single()

    if (errorPerfil) {
      console.error('Error al obtener el apodo:', errorPerfil.message)
      return
    }

    // Insertar el comentario en la base de datos
    const { data, error } = await supabase.from('comentarios').insert([
      {
        texto: nuevoComentario,
        juego_id: juegoId,
        usuario_email: user.email,
        usuario_id: user.id,
      },
    ])

    if (!error) {
      setComentarios([
        {
          texto: nuevoComentario,
          usuario_email: user.email,
          usuario_id: user.id,
          perfiles: { apodo: perfil?.apodo },
          fecha: new Date().toISOString(),
        },
        ...comentarios,
      ])
      setNuevoComentario('')
    } else {
      console.error('Error al enviar comentario:', error.message)
    }
  }

  if (loading) {
    return <p className="text-gray-500 mb-4">Cargando sesión...</p>
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Comentarios</h2>

      {user ? (
        <div className="mb-4">
          <textarea
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            placeholder="Escribe tu comentario..."
          />
          <button
            onClick={enviarComentario}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Enviar
          </button>
        </div>
      ) : (
        <p className="text-gray-500 mb-4">Inicia sesión para dejar un comentario.</p>
      )}

      <div className="space-y-4">
        {comentarios.map((comentario) => (
          <div key={comentario.id} className="border-b pb-2">
            <p className="text-sm text-gray-800">{comentario.texto}</p>
            <p className="text-xs text-gray-500">
              Por {comentario.perfiles?.apodo || comentario.usuario_email} -{' '}
              {new Date(comentario.fecha).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
