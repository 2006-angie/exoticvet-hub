<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { getWeather } from '../services/api'
import type { ClimaData } from '../types'

const clima = ref<ClimaData | null>(null)

onMounted(async () => {
  clima.value = await getWeather('Puebla')
})
</script>

<template>
  <div class="home-view">
    <!-- Hero Banner -->
    <div class="bg-success text-white p-5 rounded shadow-sm mb-4">
      <h1 class="display-4 fw-bold">ExoticVet Hub</h1>
      <p class="lead">Atención médica especializada para reptiles, aves, anfibios y pequeños mamíferos.</p>
      <RouterLink to="/citas" class="btn btn-light btn-lg text-success fw-bold me-2">Agendar Cita</RouterLink>
      <RouterLink to="/tienda" class="btn btn-outline-light btn-lg">Ver Tienda</RouterLink>
    </div>

    <!-- Widget Informativo de Clima y Salud -->
    <div v-if="clima" class="card border-0 bg-light shadow-sm mb-4 p-3">
      <div class="card-body d-flex align-items-center justify-content-between flex-wrap">
        <div>
          <h5 class="fw-bold mb-1">🌤️ Alerta Ambiental Veterinaria (Puebla)</h5>
          <p class="mb-0 text-muted">{{ clima.recommendation }}</p>
        </div>
        <div class="text-end mt-2 mt-md-0">
          <span class="fs-3 fw-bold text-success">{{ clima.temp }}°C</span>
          <br>
          <small class="text-muted">Humedad: {{ clima.humidity }}% | Viento: {{ clima.wind_speed }} km/h</small>
        </div>
      </div>
    </div>

    <!-- Secciones Rápidas -->
    <div class="row g-4">
      <div class="col-md-4">
        <div class="card h-100 p-4 border-0 shadow-sm text-center">
          <h3>🩺 Citas Médicas</h3>
          <p class="text-muted">Registro en línea con seguimiento personalizado para tus mascotas.</p>
          <RouterLink to="/citas" class="btn btn-outline-success mt-auto">Agendar Consulta</RouterLink>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100 p-4 border-0 shadow-sm text-center">
          <h3>📚 Blog Médico</h3>
          <p class="text-muted">Guías completas de alimentación, hábitat y salud preventiva.</p>
          <RouterLink to="/blog" class="btn btn-outline-success mt-auto">Explorar Artículos</RouterLink>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100 p-4 border-0 shadow-sm text-center">
          <h3>🛒 Insumos y Tienda</h3>
          <p class="text-muted">Alimentos especializados, suplementos y equipo para terrarios.</p>
          <RouterLink to="/tienda" class="btn btn-outline-success mt-auto">Ir a la Tienda</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>