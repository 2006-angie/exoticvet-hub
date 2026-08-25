<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import LoginModal from './components/LoginModal.vue'
</script>

<template>
  <div class="min-vh-100 d-flex flex-column bg-light">
    <!-- Navbar Principal -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div class="container">
        <RouterLink to="/" class="navbar-brand fw-bold text-success">
          🦎 ExoticVet Hub
        </RouterLink>

        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <RouterLink to="/" class="nav-link">Inicio</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/blog" class="nav-link">Blog</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/citas" class="nav-link">Citas</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/tienda" class="nav-link">Tienda</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/contacto" class="nav-link">Contacto</RouterLink>
            </li>
          </ul>

          <!-- Componente del Botón/Modal de Iniciar Sesión -->
          <LoginModal />
        </div>
      </div>
    </nav>

    <!-- Vista Actual -->
    <main class="container my-4 flex-grow-1">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="bg-dark text-white text-center py-3 mt-auto">
      <small>&copy; 2026 ExoticVet Hub - Proyecto Final Orientado a Servicios</small>
    </footer>
  </div>
</template>