<script setup lang="ts">
import { onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Corrección de los íconos por defecto de Leaflet en Vite/Vue
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

const customIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Lista de sucursales en Puebla
const sucursalesPuebla = [
  {
    nombre: 'Sucursal Principal - Angelópolis',
    coords: [19.0325, -98.2324] as [number, number],
    direccion: 'Vía Atlixcáyotl 1499, Reserva Territorial Atlixcáyotl, Puebla',
    telefono: '+52 (222) 123-4567',
    horario: 'Lunes a Domingo: 24 Horas (Urgencias)'
  },
  {
    nombre: 'Sucursal Zavaleta',
    coords: [19.0621, -98.2452] as [number, number],
    direccion: 'Calzada Zavaleta 1102, Santa Cruz Buenavista, Puebla',
    telefono: '+52 (222) 987-6543',
    horario: 'Lunes a Sábado: 9:00 AM - 8:00 PM'
  },
  {
    nombre: 'Sucursal Centro Histórico',
    coords: [19.0437, -98.1983] as [number, number],
    direccion: 'Av. 5 de Mayo 402, Centro, Puebla, Pue.',
    telefono: '+52 (222) 555-0199',
    horario: 'Lunes a Viernes: 10:00 AM - 7:00 PM'
  }
]

// Lista del equipo médico
const medicos = [
  {
    nombre: 'Dr. Alejandro Silva',
    especialidad: 'Especialista en Herpetología y Reptiles',
    cedula: 'Ced. Prof. 8492019',
    correo: 'a.silva@exoticvethub.com',
    foto: '🦎'
  },
  {
    nombre: 'Dra. María Fernández',
    especialidad: 'Medicina de Pequeños Mamíferos (Hurones, Conejos y Roedores)',
    cedula: 'Ced. Prof. 9301284',
    correo: 'm.fernandez@exoticvethub.com',
    foto: '🐰'
  },
  {
    nombre: 'Dr. Carlos Mendoza',
    especialidad: 'Cirugía Aviar y Diagnóstico de Aves Psitácidas',
    cedula: 'Ced. Prof. 7192048',
    correo: 'c.mendoza@exoticvethub.com',
    foto: '🦜'
  }
]

onMounted(() => {
  // Inicializar mapa centrado en Puebla
  const map = L.map('mapa-puebla').setView([19.0437, -98.2183], 12)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  // Agregar los marcadores de las sucursales al mapa
  sucursalesPuebla.forEach((sucursal) => {
    L.marker(sucursal.coords, { icon: customIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: sans-serif;">
          <h6 style="margin: 0; color: #198754; font-weight: bold;">${sucursal.nombre}</h6>
          <p style="margin: 4px 0; font-size: 12px; color: #555;">📍 ${sucursal.direccion}</p>
          <p style="margin: 2px 0; font-size: 12px;">📞 <b>${sucursal.telefono}</b></p>
          <p style="margin: 2px 0; font-size: 11px; color: #6c757d;">🕒 ${sucursal.horario}</p>
        </div>
      `)
  })
})
</script>

<template>
  <div class="contacto-view container py-4">
    <!-- Encabezado -->
    <div class="mb-4 text-center text-md-start">
      <h2 class="fw-bold text-success mb-1">📍 Sucursales y Equipo Médico en Puebla</h2>
      <p class="text-muted">Encuentra nuestra clínica más cercana y conoce a nuestros veterinarios especialistas.</p>
    </div>

    <!-- Sección del Mapa y Datos Rápidos -->
    <div class="row g-4 mb-5">
      <!-- Mapa con Leaflet -->
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm p-2 h-100">
          <div id="mapa-puebla" style="height: 420px; width: 100%;" class="rounded"></div>
        </div>
      </div>

      <!-- Información de Contacto Directo -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm p-4 h-100 bg-white">
          <h5 class="fw-bold text-success mb-3">📞 Atención al Cliente</h5>
          
          <div class="mb-3">
            <span class="text-muted small d-block">Correo General / Citas:</span>
            <strong class="text-dark">contacto@exoticvethub.com</strong>
          </div>

          <div class="mb-3">
            <span class="text-muted small d-block">Urgencias 24/7 (Puebla):</span>
            <strong class="text-danger fs-5">+52 (222) 911-EXOTIC</strong>
          </div>

          <div class="mb-4">
            <span class="text-muted small d-block">Atención vía WhatsApp:</span>
            <strong class="text-success">+52 (222) 345-6789</strong>
          </div>

          <hr class="text-muted my-3" />

          <h6 class="fw-bold text-dark mb-2">🏢 Sucursales en Puebla:</h6>
          <ul class="list-unstyled small text-muted mb-0">
            <li class="mb-2">📍 <b>Angelópolis:</b> Reserva Territorial Atlixcáyotl</li>
            <li class="mb-2">📍 <b>Zavaleta:</b> Calzada Zavaleta 1102</li>
            <li>📍 <b>Centro:</b> Av. 5 de Mayo 402</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Sección del Personal / Médicos Veterinarios -->
    <div class="mt-4">
      <h3 class="fw-bold text-success mb-3">👨‍⚕️ Médicos Veterinarios Especialistas</h3>
      <p class="text-muted mb-4">Nuestro equipo certificado en medicina y cirugía de especies exóticas.</p>

      <div class="row g-4">
        <div v-for="doc in medicos" :key="doc.nombre" class="col-md-4">
          <div class="card border-0 shadow-sm p-4 text-center h-100 hover-card">
            <div class="display-3 mb-2">{{ doc.foto }}</div>
            <h5 class="fw-bold text-dark mb-1">{{ doc.nombre }}</h5>
            <span class="badge bg-success-subtle text-success mb-2">{{ doc.especialidad }}</span>
            <p class="text-muted small mb-2">{{ doc.cedula }}</p>
            <a :href="`mailto:${doc.correo}`" class="btn btn-outline-success btn-sm mt-auto">
              ✉️ Contactar Dr.
            </a>
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