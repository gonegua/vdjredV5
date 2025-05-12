import { supabase } from '@/lib/supabase'
import JuegoCard from '@/components/JuegoCard'
import Buscador from '@/components/Buscador'
import Link from 'next/link'

const JUEGOS_POR_PAGINA = 12

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { page?: string; q?: string }
}) {
  const page = parseInt(searchParams?.page || '1', 10)
  const query = searchParams?.q || ''
  const desde = (page - 1) * JUEGOS_POR_PAGINA
  const hasta = desde + JUEGOS_POR_PAGINA - 1

  let consulta = supabase
    .from('juegos')
    .select('*', { count: 'exact' })
    .order('fecha_creacion', { ascending: false })

  if (query) {
    consulta = consulta.ilike('titulo', `%${query}%`)
  }

  const { data: juegos, error, count } = await consulta.range(desde, hasta)

  if (error) {
    console.error('Error al cargar juegos:', error.message)
    return <div className="p-4">Error cargando los juegos 😢</div>
  }

  const totalPaginas = Math.ceil((count || 0) / JUEGOS_POR_PAGINA)

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🎮 Juegos recientes</h1>
      <Buscador />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {juegos?.map((juego) => (
          <JuegoCard key={juego.id} juego={juego} />
        ))}
      </div>

      {/* Paginación */}
      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: totalPaginas }, (_, i) => (
          <Link
            key={i}
            href={`/?page=${i + 1}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
            className={`px-3 py-1 rounded border ${
              i + 1 === page ? 'bg-blue-600 text-white' : 'bg-white text-black'
            }`}
          >
            {i + 1}
          </Link>
        ))}
      </div>
    </div>
  )
}
