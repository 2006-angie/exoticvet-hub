<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Articulo {
  id: number
  title: string
  body: string
  categoria: string
  autor: string
  tiempoLectura: string
  emoji: string
}

const articulos = ref<Articulo[]>([])
const cargando = ref(true)
const categoriaSeleccionada = ref('Todos')
const errorCarga = ref('')

// Función para obtener los datos desde tu Backend local
const cargarArticulosBackend = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/posts')
    if (!res.ok) throw new Error('No se pudo conectar con el servidor')
    articulos.value = await res.json()
  } catch (error) {
    console.error('Error al cargar publicaciones:', error)
    errorCarga.value = 'No se pudo cargar la información. Revisa que el servidor backend esté corriendo en http://localhost:3000.'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarArticulosBackend()
})

const filtrarArticulos = () => {
  if (categoriaSeleccionada.value === 'Todos') {
    return articulos.value
  }
  return articulos.value.filter((art) => art.categoria === categoriaSeleccionada.value)
}
</script>

<template>
  <div class="blog-view container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <h2 class="fw-bold text-success mb-1">📰 Blog de Medicina Veterinaria Exótica</h2>
        <p class="text-muted mb-0">Artículos informativos consultados dinámicamente desde la API Backend (`/api/posts`).</p>
      </div>

      <!-- Filtros por Categoria -->
      <div class="btn-group" role="group">
        <button
          v-for="cat in ['Todos', 'Reptiles', 'Mamíferos Exóticos', 'Aves', 'Anfibios', 'Peces']"
          :key="cat"
          @click="categoriaSeleccionada = cat"
          :class="['btn btn-sm', categoriaSeleccionada === cat ? 'btn-success' : 'btn-outline-success']"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Indicador de Carga -->
    <div v-if="cargando" class="text-center py-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Cargando publicaciones...</span>
      </div>
      <p class="text-muted mt-2 small">Cargando artículos desde el servidor REST...</p>
    </div>

    <!-- Mensaje si el Backend no responde -->
    <div v-else-if="errorCarga" class="alert alert-danger text-center my-4 shadow-sm" role="alert">
      ⚠️ {{ errorCarga }}
    </div>

    <!-- Lista de Artículos -->
    <div v-else class="row g-4">
      <div v-for="art in filtrarArticulos()" :key="art.id" class="col-md-4">
        <div class="card h-100 border-0 shadow-sm p-3 hover-card">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge bg-success-subtle text-success fw-bold">{{ art.categoria }}</span>
            <span class="text-muted small">⏱️ {{ art.tiempoLectura }}</span>
          </div>

          <div class="fs-1 my-2 text-center">{{ art.emoji }}</div>

          <h5 class="fw-bold text-dark mb-2">{{ art.title }}</h5>
          <p class="text-muted small flex-grow-1">{{ art.body }}</p>

          <div class="border-top pt-2 mt-auto d-flex justify-content-between align-items-center small text-muted">
            <span>✍️ {{ art.autor }}</span>
            <button class="btn btn-link text-success p-0 fw-bold text-decoration-none">Leer más →</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hover-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
}
</style>