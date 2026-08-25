<script setup>
import { ref, nextTick } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import { loadScript } from '@paypal/paypal-js'

// Catálogo y Carrito
const productos = ref([
  { id: 1, nombre: 'Alimento para Reptiles', precio: 350, categoria: 'Alimentos', emoji: '🦎' },
  { id: 2, nombre: 'Lámpara UVB 10.0', precio: 580, categoria: 'Lámparas', emoji: '💡' },
  { id: 3, nombre: 'Suplemento Calcio + D3', precio: 220, categoria: 'Vitaminas', emoji: '🧪' },
  { id: 4, nombre: 'Terrario de Cristal 45x45', precio: 1850, categoria: 'Terrarios', emoji: '🏠' }
])
const carrito = ref([])

// Estados del Modal y Pago
const metodoPago = ref('stripe')
const mostrarModal = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Instancias de Stripe
const stripePromise = loadStripe('pk_test_51TrNWTHZTq1IYy0Eh46hGjxiHBnOpUm7u7No5I5eMYZVPZQOmh2grBdF18ORDE7EPCOWn4IyIxcVFpw7mseQxUNC00j4IRrbMb')
let stripe = null
let elements = null

const agregarAlCarrito = (p) => carrito.value.push(p)
const total = () => carrito.value.reduce((acc, item) => acc + item.precio, 0)

// Abrir checkout y cargar pasarela
const abrirCheckout = async () => {
  if (carrito.value.length === 0) return alert('El carrito está vacío.')
  
  mostrarModal.value = true
  errorMessage.value = ''
  successMessage.value = ''

  await nextTick()
  if (metodoPago.value === 'stripe') {
    await inicializarStripe()
  } else {
    await inicializarPayPal()
  }
}

// Cambiar pestaña de método de pago
const cambiarMetodo = async (nuevoMetodo) => {
  metodoPago.value = nuevoMetodo
  errorMessage.value = ''
  await nextTick()
  if (nuevoMetodo === 'stripe') {
    await inicializarStripe()
  } else {
    await inicializarPayPal()
  }
}

// 1. Stripe Elements
const inicializarStripe = async () => {
  try {
    stripe = await stripePromise
    const response = await fetch('http://localhost:3000/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total() * 100 })
    })

    const { clientSecret } = await response.json()
    elements = stripe.elements({ clientSecret })
    
    document.getElementById('payment-element').innerHTML = ''
    const paymentElement = elements.create('payment')
    paymentElement.mount('#payment-element')
  } catch (err) {
    errorMessage.value = 'Asegúrate de tener corriendo tu backend en el puerto 3000.'
  }
}

const handleStripeSubmit = async () => {
  if (!stripe || !elements) return
  loading.value = true
  errorMessage.value = ''

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: { return_url: window.location.href },
    redirect: 'if_required'
  })

  if (error) {
    errorMessage.value = error.message
  } else {
    successMessage.value = '¡Pago completado con éxito vía Stripe!'
    carrito.value = []
  }
  loading.value = false
}

// 2. PayPal SDK
const inicializarPayPal = async () => {
  try {
    const container = document.getElementById('paypal-button-container')
    container.innerHTML = ''

    await loadScript({
      clientId: 'Ac4GatJUdAtxsm5T4o78OX98n6FMEzqem0IQxooGaAisfqCK-wVunrLLNQUjNX2jnUKiFr100wmy0WK1',
      currency: 'USD'
    })

    window.paypal.Buttons({
      createOrder: async () => {
        const response = await fetch('http://localhost:3000/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total() })
        })
        const order = await response.json()
        return order.id
      },
      onApprove: async (data) => {
        await fetch(`http://localhost:3000/paypal/capture-order/${data.orderID}`, {
          method: 'POST'
        })
        successMessage.value = '¡Pago realizado con éxito vía PayPal!'
        carrito.value = []
      }
    }).render('#paypal-button-container')
  } catch (e) {
    errorMessage.value = 'Error al conectar con PayPal.'
  }
}

const cerrarModal = () => {
  mostrarModal.value = false
}
</script>

<template>
  <div class="tienda-view">
    <h2 class="fw-bold text-success mb-2">Tienda Veterinaria Especializada</h2>
    <p class="text-muted mb-4">Insumos y equipo para el cuidado de especies exóticas.</p>

    <div class="row g-4">
      <!-- Catálogo de Productos -->
      <div class="col-md-8">
        <div class="row g-3">
          <div v-for="prod in productos" :key="prod.id" class="col-md-6">
            <div class="card h-100 border-0 shadow-sm p-3">
              <div class="fs-1 text-center mb-2">{{ prod.emoji }}</div>
              <h5 class="fw-bold mb-1">{{ prod.nombre }}</h5>
              <span class="badge bg-light text-dark align-self-start mb-2">{{ prod.categoria }}</span>
              <div class="d-flex justify-content-between align-items-center mt-auto">
                <span class="fs-5 fw-bold text-success">${{ prod.precio }} MXN</span>
                <button @click="agregarAlCarrito(prod)" class="btn btn-outline-success btn-sm">+ Agregar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen de Compra -->
      <div class="col-md-4">
        <div class="card border-0 shadow-sm p-4">
          <h5 class="fw-bold mb-3">🛒 Resumen de Compra</h5>

          <div v-if="carrito.length === 0" class="text-muted text-center py-4 small">
            Tu carrito está vacío.
          </div>

          <div v-else>
            <ul class="list-group list-group-flush mb-3">
              <li v-for="(item, idx) in carrito" :key="idx" class="list-group-item d-flex justify-content-between px-0 small">
                <span>{{ item.nombre }}</span>
                <strong>${{ item.precio }} MXN</strong>
              </li>
            </ul>

            <div class="d-flex justify-content-between border-top pt-2 mb-4">
              <strong class="fs-5">Total:</strong>
              <strong class="fs-5 text-success">${{ total() }} MXN</strong>
            </div>

            <button @click="abrirCheckout" class="btn btn-success w-100 fw-bold py-2">
              Pagar ${{ total() }} MXN 💳
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL PASARELA DE PAGOS REAL -->
    <div v-if="mostrarModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title fw-bold">Pasarela de Pago Segura</h5>
            <button type="button" class="btn-close btn-close-white" @click="cerrarModal"></button>
          </div>

          <div class="modal-body p-4">
            <div v-if="successMessage" class="alert alert-success text-center fw-bold py-3">
              ✅ {{ successMessage }}
            </div>
            <div v-if="errorMessage" class="alert alert-danger text-center fw-bold py-3">
              ⚠️ {{ errorMessage }}
            </div>

            <div v-if="!successMessage">
              <label class="form-label fw-bold mb-2">Selecciona Método de Pago:</label>
              <div class="d-flex gap-3 mb-4">
                <button 
                  @click="cambiarMetodo('stripe')" 
                  :class="['btn w-50 fw-bold', metodoPago === 'stripe' ? 'btn-success' : 'btn-outline-secondary']">
                  💳 Tarjeta (Stripe)
                </button>
                <button 
                  @click="cambiarMetodo('paypal')" 
                  :class="['btn w-50 fw-bold', metodoPago === 'paypal' ? 'btn-primary' : 'btn-outline-secondary']">
                  🅿️ PayPal Express
                </button>
              </div>

              <!-- Formulario Tarjeta (Stripe) -->
              <div v-show="metodoPago === 'stripe'">
                <div id="payment-element" class="mb-3"></div>
                <button @click="handleStripeSubmit" :disabled="loading" class="btn btn-success w-100 fw-bold py-2">
                  {{ loading ? 'Procesando...' : `Confirmar Pago de $${total()}.00` }}
                </button>
              </div>

              <!-- Botón Dinámico PayPal -->
              <div v-show="metodoPago === 'paypal'">
                <div id="paypal-button-container"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>