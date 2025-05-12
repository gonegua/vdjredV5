// src/app/layout.tsx

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import SupabaseProvider from '@/components/SupabaseProvider'
import { createServerClient } from '@/utils/supabase'
import { cookies } from 'next/headers'
import { AuthProvider } from '@/contexts/authContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AA',
  description: 'Descarga y comparte videojuegos indie y clásicos',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="es">
      <body className={inter.className}>
        <SupabaseProvider initialSession={session}>
        <AuthProvider initialUser={session?.user ?? null}>
            <Navbar />
            <main className="max-w-6xl mx-auto p-4">{children}</main>
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}


