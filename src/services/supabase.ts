import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ovhltenmlnukzgklkhnc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92aGx0ZW5tbG51a3pna2xraG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MzkxNDQsImV4cCI6MjEwMzIxNTE0NH0.Xg_gMHjTsfbOoeVSnrS_yMF0wuvf_i7PzJRamwmEMok'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Función para Login Social (Google / GitHub / Twitter)
export const loginWithProvider = async (provider: 'google' | 'github' | 'twitter') => {
  const redirectUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5173'
    : 'https://exoticvet-frontend.onrender.com'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: redirectUrl,
      queryParams: provider === 'google' ? {
        access_type: 'offline',
        prompt: 'consent'
      } : undefined
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