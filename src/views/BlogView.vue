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

// Función para obtener los datos desde el Backend en Render
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