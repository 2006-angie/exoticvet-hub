import { createClient } from '@supabase/supabase-js'

// Cadenas limpias con comillas simples estándar:
const supabaseUrl = 'https://ovhltenmlnukzgklkhnc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92aGx0ZW5tbG51a3pna2xraG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MzkxNDQsImV4cCI6MjEwMzIxNTE0NH0.Xg_gMHjTsfbOoeVSnrS_yMF0wuvf_i7PzJRamwmEMok'

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