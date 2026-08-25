<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '../services/supabase'
import type { Cita } from '../types'

const usuario = ref<any>(null)
const citas = ref<Cita[]>([])
const cargando = ref(false)
let authListener: { unsubscribe: () => void } | null = null

const nuevaCita = ref<Cita>({
  nombre_cliente: '',
  correo: '',
  mascota: '',
  especie: 'Reptil',
  fecha: '',
  hora: ''
})

// Centraliza la asignación del usuario y carga sus datos
const actualizarEstadoUsuario = async (session: any) => {
  usuario.value = session?.user || null
  if (session?.user) {
    nuevaCita.value.correo = session.user.email || ''
    nuevaCita.value.nombre_cliente = 
      session.user.user_metadata?.full_name || 
      session.user.email?.split('@')[0] || ''
    await cargarCitas()
  } else {
    citas.value = []
  }
}

const comprobarUsuario = async () => {
  // 1. Revisa la sesión activa inmediatamente (útil al regresar de OAuth o recargar)
  const { data: { session } } = await supabase.auth.getSession()
  await actualizarEstadoUsuario(session)

  // 2. Escucha cambios futuros de estado (login / logout)
  const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
    await actualizarEstadoUsuario(session)
  })
  
  authListener = listener.subscription
}

// Redirección a la URL actual limpia sin parámetros residuales
const getRedirectUrl = () => {
  return `${window.location.origin}${window.location.pathname}`
}

const loginGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({ 
    provider: 'google', 
    options: { 
      redirectTo: getRedirectUrl(),
      queryParams: { prompt: 'select_account' }
    } 
  })
  if (error) alert('Error al conectar con Google: ' + error.message)
}

const loginGitHub = async () => {
  const { error } = await supabase.auth.signInWithOAuth({ 
    provider: 'github', 
    options: { 
      redirectTo: getRedirectUrl()
    } 
  })
  if (error) alert('Error al conectar con GitHub: ' + error.message)
}

const logout = async () => {
  await supabase.auth.signOut()
  usuario.value = null
  citas.value = []
}

const cargarCitas = async () => {
  cargando.value = true
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) console.error('Error al obtener citas:', error.message)
  else citas.value = data || []
  cargando.value = false
}

const agendarCita = async () => {
  if (!nuevaCita.value.nombre_cliente || !nuevaCita.value.fecha || !nuevaCita.value.hora) {
    alert('Por favor completa todos los campos del formulario.')
    return
  }

  const { error } = await supabase.from('citas').insert([
    {
      ...nuevaCita.value,
      user_id: usuario.value?.id
    }
  ])

  if (error) {
    alert('Error al guardar la cita: ' + error.message)
  } else {
    alert('¡Cita agendada con éxito!')
    nuevaCita.value.mascota = ''
    nuevaCita.value.fecha = ''
    nuevaCita.value.hora = ''
    await cargarCitas()
  }
}

const eliminarCita = async (id: string) => {
  if (!confirm('¿Deseas cancelar esta cita?')) return
  const { error } = await supabase.from('citas').delete().eq('id', id)
  if (error) alert('Error al cancelar: ' + error.message)
  else await cargarCitas()
}

onMounted(() => {
  comprobarUsuario()
})

onUnmounted(() => {
  if (authListener) authListener.unsubscribe()
})
</script>

<template>
  <div class="container py-4">
    <h2 class="fw-bold text-success mb-2">Agendamiento de Citas Médicas</h2>
    <p class="text-muted mb-4">Consulta médica especializada para animales exóticos.</p>

    <!-- PANTALLA 1: Si NO está autenticado -->
    <div v-if="!usuario" class="card border-0 shadow-sm p-5 text-center my-4 bg-white rounded-4">
      <div class="mb-3 fs-1">🔐</div>
      <h4 class="fw-bold text-dark mb-2">Inicia sesión para agendar tu cita</h4>
      <p class="text-muted mb-4 mx-auto" style="max-width: 480px;">
        Para garantizar el seguimiento médico de tu mascota, necesitas acceder con tu cuenta antes de elegir fecha y hora.
      </p>
      
      <div class="d-flex justify-content-center gap-3 flex-wrap">
        <button @click="loginGoogle" class="btn btn-outline-danger d-flex align-items-center gap-2 px-4 py-2 fw-bold rounded-3">
          <span>🌐 Continuar con Google</span>
        </button>
        <button @click="loginGitHub" class="btn btn-dark d-flex align-items-center gap-2 px-4 py-2 fw-bold rounded-3">
          <span>🐱 Continuar con GitHub</span>
        </button>
      </div>
    </div>

    <!-- PANTALLA 2: Si YA está autenticado -->
    <div v-else class="row g-4">
      <div class="col-md-5">
        <div class="card p-4 shadow-sm border-0 rounded-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold text-dark m-0">Nueva Consulta</h5>
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-success-subtle text-success border border-success rounded-pill px-3 py-2">
                👤 {{ usuario.email }}
              </span>
              <button @click="logout" class="btn btn-outline-danger btn-sm rounded-2">Salir</button>
            </div>
          </div>

          <form @submit.prevent="agendarCita">
            <div class="mb-3">
              <label class="form-label small fw-bold">Propietario</label>
              <input v-model="nuevaCita.nombre_cliente" type="text" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold">Correo Electrónico</label>
              <input v-model="nuevaCita.correo" type="email" class="form-control" disabled />
            </div>
            <div class="row g-2 mb-3">
              <div class="col-6">
                <label class="form-label small fw-bold">Mascota</label>
                <input v-model="nuevaCita.mascota" type="text" class="form-control" placeholder="Ej. Bubu" required />
              </div>
              <div class="col-6">
                <label class="form-label small fw-bold">Especie</label>
                <select v-model="nuevaCita.especie" class="form-select">
                  <option value="Reptil">Reptil</option>
                  <option value="Ave">Ave</option>
                  <option value="Anfibio">Anfibio</option>
                  <option value="Mamífero Exótico">Mamífero Exótico</option>
                </select>
              </div>
            </div>
            <div class="row g-2 mb-4">
              <div class="col-6">
                <label class="form-label small fw-bold">Fecha</label>
                <input v-model="nuevaCita.fecha" type="date" class="form-control" required />
              </div>
              <div class="col-6">
                <label class="form-label small fw-bold">Hora</label>
                <input v-model="nuevaCita.hora" type="time" class="form-control" required />
              </div>
            </div>
            <button type="submit" class="btn btn-success w-100 fw-bold py-2 rounded-3">📅 Confirmar y Agendar</button>
          </form>
        </div>
      </div>

      <div class="col-md-7">
        <div class="card p-4 shadow-sm border-0 rounded-4">
          <h5 class="fw-bold text-dark mb-3">Citas Programadas</h5>
          <div v-if="cargando" class="text-center py-4 text-muted">Cargando citas...</div>
          <div v-else-if="citas.length === 0" class="text-center py-4 text-muted">No hay citas registradas en este momento.</div>
          <div v-else class="list-group list-group-flush">
            <div v-for="c in citas" :key="c.id" class="list-group-item d-flex justify-content-between align-items-center py-3 px-0 border-bottom">
              <div>
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span class="badge bg-success-subtle text-success border border-success">{{ c.especie }}</span>
                  <strong class="text-dark">{{ c.mascota }}</strong>
                  <small class="text-muted">({{ c.nombre_cliente }})</small>
                </div>
                <div class="small text-muted">📆 {{ c.fecha }} | ⏰ {{ c.hora }} | ✉️ {{ c.correo }}</div>
              </div>
              <button @click="c.id && eliminarCita(c.id)" class="btn btn-outline-danger btn-sm rounded-2">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>