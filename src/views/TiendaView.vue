<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import { loadScript } from '@paypal/paypal-js'

const API_BASE_URL = 'https://exoticvet-hub.onrender.com'

const productos = ref([
  { id: 1, nombre: 'Alimento para Reptiles', precio: 350, categoria: 'Alimentos', emoji: '🦎' },
  { id: 2, nombre: 'Lámpara UVB 10.0', precio: 580, categoria: 'Lámparas', emoji: '💡' },
  { id: 3, nombre: 'Suplemento Calcio + D3', precio: 220, categoria: 'Vitaminas', emoji: '🧪' },
  { id: 4, nombre: 'Terrario de Cristal 45x45', precio: 1850, categoria: 'Terrarios', emoji: '🏠' }
])
const carrito = ref<any[]>([])

const metodoPago = ref<'stripe' | 'paypal'>('stripe')
const mostrarModal = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const stripePromise = loadStripe('pk_test_51TrNWTHZTq1IYy0Eh46hGjxiHBnOpUm7u7No5I5eMYZVPZQOmh2grBdF18ORDE7EPCOWn4IyIxcVFpw7mseQxUNC00j4IRrbMb')
let stripe: any = null
let elements: any = null

const agregarAlCarrito = (p: any) => carrito.value.push(p)
const total = () => carrito.value.reduce((acc, item) => acc + item.precio, 0)

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

const cambiarMetodo = async (nuevoMetodo: 'stripe' | 'paypal') => {
  metodoPago.value = nuevoMetodo
  errorMessage.value = ''
  await nextTick()
  if (nuevoMetodo === 'stripe') {
    await inicializarStripe()
  } else {
    await inicializarPayPal()
  }
}

const inicializarStripe = async () => {
  try {
    stripe = await stripePromise
    const response = await fetch(`${API_BASE_URL}/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total() * 100 })
    })

    if (!response.ok) throw new Error('Servidor no disponible')

    const { clientSecret } = await response.json()
    elements = stripe.elements({ clientSecret })
    
    const container = document.getElementById('payment-element')
    if (container) {
      container.innerHTML = ''
      const paymentElement = elements.create('payment')
      paymentElement.mount('#payment-element')
    }
  } catch (err) {
    errorMessage.value = 'Error al conectar con la pasarela de Stripe en Render.'
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
    errorMessage.value = error.message || 'Error en el pago'
  } else {
    successMessage.value = '¡Pago completado con éxito vía Stripe!'
    carrito.value = []
  }
  loading.value = false
}

const inicializarPayPal = async () => {
  try {
    const container = document.getElementById('paypal-button-container')
    if (container) container.innerHTML = ''

    await loadScript({
      clientId: 'Ac4GatJUdAtxsm5T4o78OX98n6FMEzqem0IQxooGaAisfqCK-wVunrLLNQUjNX2jnUKiFr100wmy0WK1',
      currency: 'USD'
    })

    if ((window as any).paypal) {
      ;(window as any).paypal.Buttons({
        createOrder: async () => {
          const response = await fetch(`${API_BASE_URL}/paypal/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: total() })
          })
          const order = await response.json()
          return order.id
        },
        onApprove: async (data: any) => {
          await fetch(`${API_BASE_URL}/paypal/capture-order/${data.orderID}`, {
            method: 'POST'
          })
          successMessage.value = '¡Pago realizado con éxito vía PayPal!'
          carrito.value = []
        }
      }).render('#paypal-button-container')
    }
  } catch (e) {
    errorMessage.value = 'Error al conectar con PayPal.'
  }
}

const cerrarModal = () => {
  mostrarModal.value = false
}
</script>

<template>
  <div style="padding: 20px;">
    <h2>🛒 Tienda Exótica</h2>
    <p>Artículos en el carrito: {{ carrito.length }} | Total: ${{ total() }} MXN</p>

    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
      <div v-for="prod in productos" :key="prod.id" style="border: 1px solid #ccc; padding: 15px; border-radius: 8px;">
        <h3>{{ prod.emoji }} {{ prod.nombre }}</h3>
        <p>Precio: ${{ prod.precio }}</p>
        <button @click="agregarAlCarrito(prod)">Agregar al Carrito</button>
      </div>
    </div>

    <button @click="abrirCheckout" style="margin-top: 20px; padding: 10px 20px;">Pagar Carrito</button>

    <!-- Modal de Checkout -->
    <div v-if="mostrarModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
      <div style="background: white; padding: 25px; border-radius: 10px; width: 400px; max-width: 90%;">
        <h3>Pasarela de Pago</h3>
        
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
          <button @click="cambiarMetodo('stripe')">Stripe</button>
          <button @click="cambiarMetodo('paypal')">PayPal</button>
        </div>

        <div v-if="errorMessage" style="color: red;">{{ errorMessage }}</div>
        <div v-if="successMessage" style="color: green;">{{ successMessage }}</div>

        <!-- Stripe Element Container -->
        <div v-show="metodoPago === 'stripe'">
          <div id="payment-element"></div>
          <button @click="handleStripeSubmit" :disabled="loading" style="margin-top: 15px;">
            {{ loading ? 'Procesando...' : 'Pagar con Tarjeta' }}
          </button>
        </div>

        <!-- PayPal Element Container -->
        <div v-show="metodoPago === 'paypal'">
          <div id="paypal-button-container"></div>
        </div>

        <button @click="cerrarModal" style="margin-top: 15px;">Cerrar</button>
      </div>
    </div>
  </div>
</template>