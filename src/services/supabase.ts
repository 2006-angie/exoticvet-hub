import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Función para Login Social (Google / Facebook / X)
export const loginWithProvider = async (provider: 'google' | 'facebook' | 'twitter') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: window.location.origin
    }
  })
  if (error) console.error('Error al iniciar sesión:', error.message)
  return { data, error }
}

// Función para Cerrar Sesión
export const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Error al cerrar sesión:', error.message)
}