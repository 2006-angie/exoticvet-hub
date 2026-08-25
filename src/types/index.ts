// Interfaz para la API REST de JSONPlaceholder (Blog)
export interface ArticuloBlog {
  id: number
  title: string
  body: string
  userId: number
}

// Interfaz para la tabla 'citas' en Supabase (CRUD)
export interface Cita {
  id?: string
  nombre_cliente: string
  correo: string
  mascota: string
  especie: string
  fecha: string
  hora: string
  user_id?: string
}

// Interfaz para la tabla 'productos' en Supabase (Tienda)
export interface Producto {
  id: number | string
  nombre: string
  categoria: 'Alimentos' | 'Vitaminas' | 'Terrarios' | 'Lámparas'
  precio: number
  imagen_url: string
}

// Interfaz para el estado del clima (Open-Meteo / OpenWeather)
export interface ClimaData {
  temp: number
  humidity: number
  wind_speed: number
  description?: string
  recommendation?: string
}