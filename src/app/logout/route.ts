import { createServerClient } from '@/utils/supabase'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = createServerClient(cookies())
  await supabase.auth.signOut()
  return redirect('/login')
}
