<script setup lang="ts">
import { ref, onMounted } from 'vue'

const API_BASE_URL = 'https://exoticvet-hub.onrender.com'

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

const cargarArticulosBackend = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/posts`)
    if (!res.ok) throw new Error('No se pudo conectar con el servidor')
    articulos.value = await res.json()
  } catch (error) {
    console.error('Error al cargar publicaciones:', error)
    errorCarga.value = 'No se pudo cargar la información desde el servidor en Render.'
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
  <div style="padding: 20px;">
    <h2>📚 Blog Veterinario Exótico</h2>

    <div v-if="cargando">Cargando publicaciones...</div>
    <div v-else-if="errorCarga" style="color: red;">{{ errorCarga }}</div>
    
    <div v-else>
      <div v-for="art in filtrarArticulos()" :key="art.id" style="border: 1px solid #ddd; margin-bottom: 15px; padding: 15px; border-radius: 8px;">
        <h3>{{ art.emoji }} {{ art.title }}</h3>
        <small>Por: {{ art.autor }} | Categoria: {{ art.categoria }} | {{ art.tiempoLectura }}</small>
        <p>{{ art.body }}</p>
      </div>
    </div>
  </div>
</template>