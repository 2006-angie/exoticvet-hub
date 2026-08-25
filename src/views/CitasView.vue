<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase, loginWithProvider, logoutUser } from '../services/supabase'
import type { Cita } from '../types'

const usuario = ref<any>(null)
const citas = ref<Cita[]>([])
const cargando = ref(false)
let authSubscription: { unsubscribe: () => void } | null = null

const nuevaCita = ref<Cita>({
  nombre_cliente: '',
  correo: '',
  mascota: '',
  especie: 'Reptil',
  fecha: '',
  hora: ''
})

// Actualizar el estado del usuario cuando cambie la sesión
const sincronizarUsuario = (session: any) => {
  usuario.value = session?.user || null
  if (session?.user) {
    nuevaCita.value.correo = session.user.email || ''
    nuevaCita.value.nombre_cliente = 
      session.user.user_metadata?.full_name || 
      session.user.email?.split('@')[0] || ''
  }
}

const inicializarAuth = async () => {
  // 1. Verificar sesión existente al cargar
  const { data: { session } } = await supabase.auth.getSession()
  sincronizarUsuario(session)

  // 2. Escuchar cambios de estado (login/logout/callback OAuth)
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    sincronizarUsuario(session)
  })
  
  authSubscription = listener.subscription
  await cargarCitas()
}

const handleLoginGoogle = () => loginWithProvider('google')
const handleLoginGitHub = () => loginWithProvider('github')

const handleLogout = async () => {
  await logoutUser()
  usuario.value = null
  nuevaCita.value.nombre_cliente = ''
  nuevaCita.value.correo = ''
  nuevaCita.value.mascota = ''
  nuevaCita.value.fecha = ''
  nuevaCita.value.hora = ''
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
  if (!nuevaCita.value.nombre_cliente || !nuevaCita.value.correo || !nuevaCita.value.fecha || !nuevaCita.value.hora) {
    alert('Por favor completa todos los campos obligatorios.')
    return
  }

  const payload: any = {
    nombre_cliente: nuevaCita.value.nombre_cliente,
    correo: nuevaCita.value.correo,
    mascota: nuevaCita.value.mascota,
    especie: nuevaCita.value.especie,
    fecha: nuevaCita.value.fecha,
    hora: nuevaCita.value.hora
  }

  if (usuario.value?.id) {
    payload.user_id = usuario.value.id
  }

  const { error } = await supabase.from('citas').insert([payload])

  if (error) {
    alert('Error al guardar la cita: ' + error.message)
  } else {
    alert('¡Cita agendada con éxito!')
    nuevaCita.value.mascota = ''
    nuevaCita.value.fecha = ''
    nuevaCita.value.hora = ''
    if (!usuario.value) {
      nuevaCita.value.nombre_cliente = ''
      nuevaCita.value.correo = ''
    }
    await cargarCitas()
  }
}

const eliminarCita = async (id: string) => {
  if (!confirm('¿Deseas cancelar esta cita?')) return
  const { error } = await supabase.from('citas').delete().eq('id', id)
  if (error) alert('Error al cancelar: ' + error.message)
  else await cargarCitas()
}

onMounted(() => { inicializarAuth() })
onUnmounted(() => { if (authSubscription) authSubscription.unsubscribe() })
</script>

<template>
  <div class="container py-4">
    <h2 class="fw-bold text-success mb-2">Agendamiento de Citas Médicas</h2>
    <p class="text-muted mb-4">Consulta médica especializada para animales exóticos.</p>

    <!-- BARRA DE AUTENTICACIÓN -->
    <div class="card border-0 bg-light p-3 rounded-4 mb-4 shadow-sm">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div v-if="!usuario">
          <span class="fw-bold text-dark me-2">💡 Acceso (Opcional):</span>
          <span class="text-muted small">Inicia sesión para autocompletar tus datos</span>
        </div>
        <div v-else class="d-flex align-items-center gap-2">
          <span class="badge bg-success-subtle text-success border border-success rounded-pill px-3 py-2">
            👤 Conectado como: {{ usuario.email }}
          </span>
        </div>

        <div v-if="!usuario" class="d-flex gap-2">
          <button @click="handleLoginGoogle" class="btn btn-sm btn-outline-danger fw-bold rounded-3">🌐 Google</button>
          <button @click="handleLoginGitHub" class="btn btn-sm btn-dark fw-bold rounded-3">🐱 GitHub</button>
        </div>
        <div v-else>
          <button @click="handleLogout" class="btn btn-sm btn-outline-secondary rounded-2">Cerrar Sesión</button>
        </div>
      </div>
    </div>

    <!-- FORMULARIO DE CITAS -->
    <div class="row g-4">
      <div class="col-md-5">
        <div class="card p-4 shadow-sm border-0 rounded-4">
          <h5 class="fw-bold text-dark mb-3">Nueva Consulta</h5>

          <form @submit.prevent="agendarCita">
            <div class="mb-3">
              <label class="form-label small fw-bold">Nombre Completo</label>
              <input 
                v-model="nuevaCita.nombre_cliente" 
                type="text" 
                class="form-control" 
                :readonly="!!usuario" 
                required 
                placeholder="Ej. Juan Pérez" 
              />
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold">Correo Electrónico</label>
              <input 
                v-model="nuevaCita.correo" 
                type="email" 
                class="form-control" 
                :readonly="!!usuario" 
                required 
                placeholder="correo@ejemplo.com" 
              />
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

      <!-- LISTADO DE CITAS -->
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