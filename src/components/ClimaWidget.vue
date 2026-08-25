<script setup lang="ts">
import { ref, onMounted } from 'vue'

const ciudad = ref('Puebla')
const clima = ref<any>(null)
const cargando = ref(false)
const error = ref('')

const obtenerClima = async () => {
  error.value = ''
  cargando.value = true

  if (!ciudad.value.trim()) {
    error.value = 'Por favor, ingresa el nombre de una ciudad.'
    cargando.value = false
    return
  }

  try {
    // 1. Obtener latitud y longitud de la ciudad
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad.value)}&count=1&language=es`
    const geoResp = await fetch(geoUrl)
    const geoDatos = await geoResp.json()

    if (!geoDatos.results || geoDatos.results.length === 0) {
      throw new Error('No se encontró la ciudad especificada.')
    }

    const { latitude, longitude, name, country } = geoDatos.results[0]

    // 2. Consultar el clima actual con coordenadas
    const climaUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    const climaResp = await fetch(climaUrl)
    const climaDatos = await climaResp.json()

    clima.value = {
      nombreCiudad: `${name}, ${country}`,
      temperatura: Math.round(climaDatos.current_weather.temperature),
      viento: climaDatos.current_weather.windspeed
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    cargando.value = false
  }
}

// Cargar el clima de Puebla automáticamente al iniciar
onMounted(() => {
  obtenerClima()
})
</script>

<template>
  <div class="card p-4 shadow-sm border-0 my-3">
    <h5 class="fw-bold text-success mb-3">🌤️ Consulta del Clima</h5>

    <!-- Buscador -->
    <div class="input-group mb-3">
      <input 
        v-model="ciudad" 
        @keyup.enter="obtenerClima"
        type="text" 
        class="form-control" 
        placeholder="Ej. Puebla, CDMX, Monterrey..." 
      />
      <button @click="obtenerClima" class="btn btn-success fw-bold" type="button">
        Buscar
      </button>
    </div>

    <!-- Indicador de Carga -->
    <div v-if="cargando" class="text-center py-2 text-muted small">
      Obteniendo datos meteorológicos...
    </div>

    <!-- Resultado del Clima -->
    <div v-if="clima && !cargando" class="alert alert-success border-0 mb-0 py-3">
      <h6 class="fw-bold text-dark mb-1">📍 {{ clima.nombreCiudad }}</h6>
      <div class="d-flex align-items-center justify-content-between mt-2">
        <span class="fs-4 fw-bold text-success">{{ clima.temperatura }}°C</span>
        <small class="text-muted">💨 Viento: {{ clima.viento }} km/h</small>
      </div>
    </div>

    <!-- Mensaje de Error -->
    <div v-if="error && !cargando" class="alert alert-danger mb-0 py-2 small">
      ⚠️ {{ error }}
    </div>
  </div>
</template>