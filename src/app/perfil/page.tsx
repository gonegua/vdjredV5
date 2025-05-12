'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { supabase } from '@/lib/supabase'
import imageCompression from 'browser-image-compression'

export default function PaginaPerfil() {
  const user = useUser()
  const [nickname, setNickname] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [nuevoPassword, setNuevoPassword] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    const obtenerPerfil = async () => {
      if (!user) return
      const { data } = await supabase
        .from('perfiles')
        .select('nickname, avatar_url')
        .eq('id', user.id)
        .single()
      if (data) {
        setNickname(data.nickname || '')
        setAvatarUrl(data.avatar_url || '')
      }
    }
    obtenerPerfil()
  }, [user])

  const actualizarPerfil = async () => {
    if (!user) return
    const { error } = await supabase.from('perfiles').upsert({
      id: user.id,
      nickname,
      avatar_url: avatarUrl,
    })
    setMensaje(error ? 'Error actualizando perfil' : 'Perfil actualizado')
  }

  const cambiarPassword = async () => {
    if (!user || !nuevoPassword) return
    const { error } = await supabase.auth.updateUser({
      password: nuevoPassword,
    })
    setMensaje(error ? 'Error cambiando contraseña' : 'Contraseña actualizada')
    setNuevoPassword('')
  }

  const handleArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMensaje('Solo imágenes válidas')
      return
    }
    if (file.size > 1024 * 1024) {
      setMensaje('Máximo 1MB permitido')
      return
    }
    setArchivo(file)
    setMensaje('')
  }

  const subirImagen = async () => {
    if (!archivo || !user) return
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 500,
        useWebWorker: true,
      }
      const comprimida = await imageCompression(archivo, options)
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`avatar-${user.id}`, comprimida, {
          cacheControl: '3600',
          upsert: true,
        })
      if (error) throw error
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path)
      setAvatarUrl(urlData.publicUrl)
      setMensaje('Avatar actualizado')
    } catch (err) {
      setMensaje('Error al subir imagen')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Perfil de usuario</h1>

      <label className="block mb-1 font-medium">Apodo</label>
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
      />

      <label className="block mb-1 font-medium">Contraseña nueva</label>
      <input
        type="password"
        value={nuevoPassword}
        onChange={(e) => setNuevoPassword(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
      />
      <button
        onClick={cambiarPassword}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        Cambiar contraseña
      </button>

      <label className="block mb-1 font-medium">Avatar</label>
      <input type="file" accept="image/*" onChange={handleArchivo} className="mb-2" />
      <button
        onClick={subirImagen}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
      >
        Subir avatar
      </button>

      {avatarUrl && (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="rounded-full w-24 h-24 object-cover mb-4"
        />
      )}

      <button
        onClick={actualizarPerfil}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        Guardar cambios del perfil
      </button>

      {mensaje && <p className="mt-4 text-center text-sm text-gray-700">{mensaje}</p>}
    </div>
  )
}

