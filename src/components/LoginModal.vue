<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../services/supabase'

const usuario = ref<any>(null)

// Detectar sesión activa al cargar
onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  usuario.value = data.session?.user || null

  // Escuchar cambios de estado en la autenticación (login/logout)
  supabase.auth.onAuthStateChange((_event, session) => {
    usuario.value = session?.user || null
  })
})

// Autenticación con Google
const loginGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  })
  if (error) alert('Error al conectar con Google: ' + error.message)
}

// Autenticación con GitHub
const loginGitHub = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin
    }
  })
  if (error) alert('Error al conectar con GitHub: ' + error.message)
}

// Cerrar sesión
const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (!error) usuario.value = null
}
</script>

<template>
  <div>
    <!-- Botón para abrir el Modal desde el Navbar -->
    <button 
      v-if="!usuario" 
      class="btn btn-outline-success btn-sm fw-bold" 
      data-bs-toggle="modal" 
      data-bs-target="#modalLogin"
    >
      🔑 Iniciar Sesión
    </button>

    <!-- Botón de perfil cuando el usuario ya ingresó -->
    <div v-else class="dropdown">
      <button 
        class="btn btn-success btn-sm dropdown-toggle fw-bold" 
        type="button" 
        data-bs-toggle="dropdown"
      >
        👤 {{ usuario.user_metadata?.full_name || usuario.email }}
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><span class="dropdown-item-text text-muted small">{{ usuario.email }}</span></li>
        <li><hr class="dropdown-divider"></li>
        <li>
          <button @click="logout" class="dropdown-item text-danger">Cerrar Sesión</button>
        </li>
      </ul>
    </div>

    <!-- Modal de Autenticación -->
    <div class="modal fade" id="modalLogin" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-success">Acceso a ExoticVet Hub</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center p-4">
            <p class="text-muted small mb-4">
              Inicia sesión con tu proveedor social para agendar citas médicas y gestionar tus compras de mascota exótica.
            </p>

            <div class="d-grid gap-3">
              <!-- Botón Google -->
              <button 
                @click="loginGoogle" 
                class="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2 py-2"
                data-bs-dismiss="modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0c2.158 0 3.978.708 5.348 1.968l-1.928 1.928C10.518 3.064 9.404 2.6 8 2.6a5.4 5.4 0 1 0 0 10.8c2.95 0 4.885-1.745 5.12-3.842H8v-3h7.545z"/>
                </svg>
                <span>Continuar con Google</span>
              </button>

              <!-- Botón GitHub -->
              <button 
                @click="loginGitHub" 
                class="btn btn-dark d-flex align-items-center justify-content-center gap-2 py-2"
                data-bs-dismiss="modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                <span>Continuar con GitHub</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>