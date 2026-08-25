import type { ArticuloBlog, ClimaData } from '../types'

// Servicio para consumir el Blog desde JSONPlaceholder
export const getBlogPosts = async (): Promise<ArticuloBlog[]> => {
  const resp = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=9')
  if (!resp.ok) {
    throw new Error('Error al consultar el servicio de publicaciones')
  }
  return await resp.json()
}

// Servicio para consumir el Clima desde Open-Meteo
export const getWeather = async (city: string = 'Puebla'): Promise<ClimaData | null> => {
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=es`
    const geoResp = await fetch(geoUrl)
    const geoDatos = await geoResp.json()

    if (!geoDatos.results || geoDatos.results.length === 0) {
      throw new Error('Ciudad no encontrada')
    }

    const { latitude, longitude } = geoDatos.results[0]

    const climaUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m`
    const climaResp = await fetch(climaUrl)
    const climaDatos = await climaResp.json()

    const temp = Math.round(climaDatos.current_weather.temperature)
    const windSpeed = Math.round(climaDatos.current_weather.windspeed)
    const humidity = climaDatos.hourly?.relativehumidity_2m?.[0] || 50

    let recommendation = 'Condiciones ambientales óptimas para el transporte de mascotas exóticas.'
    if (temp < 15) {
      recommendation = '⚠️ Mantén a tus reptiles y aves bien abrigados durante el trayecto.'
    } else if (temp > 28) {
      recommendation = '⚠️ Asegura hidratación constante y sombra para evitar golpes de calor.'
    }

    return { 
      temp, 
      humidity, 
      wind_speed: windSpeed, 
      description: 'Clima actual obtenido de Open-Meteo',
      recommendation 
    }
  } catch (err) {
    console.error('Error al obtener clima:', err)
    return null
  }
}