import Link from 'next/link'

type Juego = {
  id: string
  titulo: string
  descripcion: string
  imagen: string
}

export default function JuegoCard({ juego }: { juego: Juego }) {
  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      {/* Enlace que redirige a la página del juego */}
      <Link href={`/juego/${juego.id}`}>
          <img src={juego.imagen} alt={juego.titulo} className="w-full h-48 object-cover" />
          <div className="p-4">
            <h2 className="text-xl font-semibold">{juego.titulo}</h2>
            <p className="text-sm text-gray-600">{juego.descripcion}</p>
          </div>
      </Link>
    </div>
  )
}




