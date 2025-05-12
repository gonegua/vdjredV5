import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import dynamic from 'next/dynamic'

export default async function JuegoDetalle({ params }: { params: { id: string } }) {
  const { data: juego, error } = await supabase
    .from('juegos')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!juego || error) {
    return notFound()
  }
  
  const CommentSection = dynamic(() => import('@/components/CommentSection'), { ssr: false })
  const { data: comentarios } = await supabase
  .from('comentarios')
  .select('contenido, fecha, usuario_id')
  .eq('juego_id', params.id)
  .order('fecha', { ascending: false })

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{juego.titulo}</h1>

      <div className="mb-4">
        <Image
          src={juego.imagen}
          alt={juego.titulo}
          width={800}
          height={400}
          className="rounded-lg"
        />
      </div>

      <p className="text-lg mb-4">{juego.descripcion}</p>
      <p className="text-sm text-gray-500 mb-4">Categoría: {juego.categoria}</p>

      {juego.video && (
        <div className="my-6 aspect-video">
          <iframe
            src={juego.video}
            className="w-full h-full rounded-lg"
            title={`Video de ${juego.titulo}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <a
        href={juego.enlace_descarga}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Descargar juego
      </a>
      <CommentSection juegoId={juego.id} />
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Comentarios</h2>
        {comentarios?.length ? (
          <ul className="space-y-3">
            {comentarios.map((comentario, index) => (
              <li key={index} className="border rounded p-3 bg-gray-50">
                <p className="text-gray-800 text-sm">{comentario.contenido}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {new Date(comentario.fecha).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Aún no hay comentarios para este juego.</p>
        )}
      </div>
    </div>

      

  )
}
