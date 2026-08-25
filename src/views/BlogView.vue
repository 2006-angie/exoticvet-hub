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
    errorCarga.value = 'No se pudo cargar la información desde el servidor.'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarArticulosBackend()
})

const categorias = ['Todos', 'Reptiles', 'Mamíferos Exóticos', 'Aves', 'Anfibios', 'Peces']

const filtrarArticulos = () => {
  if (categoriaSeleccionada.value === 'Todos') return articulos.value
  return articulos.value.filter((art) => art.categoria === categoriaSeleccionada.value)
}
</script>

<template>
  <div class="blog-container">
    <header class="blog-header">
      <h1>📚 Blog de Veterinaria Exótica</h1>
      <p>Artículos, guías de salud y consejos de cuidados de nuestros especialistas</p>
      
      <div class="category-filters">
        <button 
          v-for="cat in categorias" 
          :key="cat"
          :class="{ active: categoriaSeleccionada === cat }"
          @click="categoriaSeleccionada = cat"
        >
          {{ cat }}
        </button>
      </div>
    </header>

    <div v-if="cargando" class="state-box">
      <div class="spinner"></div>
      <p>Cargando publicaciones veterinarias...</p>
    </div>

    <div v-else-if="errorCarga" class="state-box error">
      <p>⚠️ {{ errorCarga }}</p>
    </div>

    <div v-else class="blog-grid">
      <article v-for="art in filtrarArticulos()" :key="art.id" class="blog-card">
        <div class="card-header">
          <span class="emoji-icon">{{ art.emoji }}</span>
          <span class="tag">{{ art.categoria }}</span>
        </div>
        <h2>{{ art.title }}</h2>
        <p class="body-text">{{ art.body }}</p>
        <div class="card-footer">
          <span class="author">👨‍⚕️ {{ art.autor }}</span>
          <span class="time">⏱️ {{ art.tiempoLectura }}</span>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.blog-container { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem; font-family: system-ui, -apple-system, sans-serif; }
.blog-header { text-align: center; margin-bottom: 2.5rem; }
.blog-header h1 { font-size: 2.25rem; color: #111827; margin: 0 0 0.5rem 0; }
.blog-header p { color: #6b7280; font-size: 1.1rem; margin-bottom: 1.5rem; }

.category-filters { display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem; }
.category-filters button { background: #f3f4f6; border: none; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 500; color: #4b5563; cursor: pointer; transition: 0.2s; }
.category-filters button.active, .category-filters button:hover { background: #059669; color: white; }

.state-box { text-align: center; padding: 3rem; color: #6b7280; }
.state-box.error { color: #dc2626; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #059669; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1rem auto; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
.blog-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; transition: box-shadow 0.2s, transform 0.2s; }
.blog-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.08); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.emoji-icon { font-size: 2.5rem; }
.tag { background: #f0fdf4; color: #166534; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 12px; }
.blog-card h2 { font-size: 1.2rem; color: #1f2937; margin: 0 0 0.75rem 0; line-height: 1.4; }
.body-text { color: #4b5563; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem; flex-grow: 1; }
.card-footer { display: flex; justify-content: space-between; font-size: 0.85rem; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 1rem; }
</style>